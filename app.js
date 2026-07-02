/* ============================================================
   DOMAIN INTELLIGENCE PRO — App Logic
   ============================================================ */

const SECTIONS = [
  {id:'basic',      num:1,  title:'التحليل الأساسي',        icon:'📋', badge:'real',   desc:'التوفر، الامتداد، تواريخ التسجيل — بيانات RDAP حقيقية'},
  {id:'legal',      num:2,  title:'التحليل القانوني',        icon:'⚖️', badge:'ai',     desc:'مخاطر العلامات التجارية وسوابق UDRP — استدلال AI + بحث ويب'},
  {id:'linguistic', num:3,  title:'التحليل اللغوي',          icon:'🗣️', badge:'ai',     desc:'النطق، التذكر، قابلية التحول لعلامة تجارية'},
  {id:'commercial', num:4,  title:'التحليل التجاري',         icon:'💼', badge:'ai',     desc:'حجم السوق، النمو، الاستثمارات في القطاع'},
  {id:'competition',num:5,  title:'تحليل المنافسة',          icon:'🥊', badge:'hybrid', desc:'امتدادات مسجلة (RDAP حقيقي) + سوشيال ميديا وتطبيقات (AI)'},
  {id:'seo',        num:6,  title:'تحليل SEO',               icon:'📈', badge:'ai',     desc:'حجم البحث، CPC، الاتجاه على 5 سنوات'},
  {id:'insight',    num:7,  title:'رؤية الذكاء الاصطناعي',   icon:'🧠', badge:'ai',     desc:'تحليل معمّق بسبب محدد وليس تقييم عام'},
  {id:'forecast',   num:8,  title:'التوقع المستقبلي',        icon:'🔮', badge:'ai',     desc:'احتمالية البيع خلال 1/3/10 سنوات والسعر المتوقع'},
  {id:'final',      num:9,  title:'التقييم النهائي',         icon:'🏁', badge:'hybrid', desc:'تجميع كل الأقسام في قرار واحد: شراء / راقب / لا تشترِ'},
  {id:'discover',   num:10, title:'محرك اكتشاف الفرص',       icon:'🛰️', badge:'ai',     desc:'اقتراح أسماء جديدة قبل الجميع بناءً على اتجاهات ناشئة'},
];

const state = {
  domain: '',
  base: '',
  results: {},   // id -> parsed data object
  loading: {},   // id -> bool
  active: 'basic'
};

/* ---------------- boot ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  renderPanels();
  showPanel('basic');

  document.getElementById('fullScanBtn').addEventListener('click', runFullScan);
  document.getElementById('resetBtn').addEventListener('click', resetAll);
  document.getElementById('domainInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') runFullScan();
  });

  const settingsPanel = document.getElementById('settingsPanel');
  const apiKeyInput = document.getElementById('apiKeyInput');
  document.getElementById('settingsBtn').addEventListener('click', () => {
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('saveKeyBtn').addEventListener('click', () => {
    const val = apiKeyInput.value.replace(/[\r\n\s]+/g, '').trim();
    if (!val) { alert('دخّل مفتاح صحيح أولاً'); return; }
    if (!val.startsWith('sk-ant-')) { alert('هاد المفتاح ما شبهش مفتاح Anthropic (خاصو يبدا بـ sk-ant-). تأكد نسخيتي المفتاح كامل بلا زيادة.'); return; }
    try { localStorage.setItem('dip_api_key', val); } catch (e) {}
    apiKeyInput.value = val;
    alert('تسجل المفتاح ✅ (' + val.length + ' حرف)');
  });
  document.getElementById('clearKeyBtn').addEventListener('click', () => {
    try { localStorage.removeItem('dip_api_key'); } catch (e) {}
    apiKeyInput.value = '';
    alert('تمسح المفتاح');
  });
  try {
    const savedKey = localStorage.getItem('dip_api_key');
    if (savedKey) apiKeyInput.value = savedKey;
  } catch (e) {}

  try {
    const cached = localStorage.getItem('dip_last_domain');
    if (cached) document.getElementById('domainInput').value = cached;
  } catch (e) {}
});

/* ---------------- nav + panel shells ---------------- */
function renderNav() {
  const nav = document.getElementById('caseIndex');
  SECTIONS.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (s.id === state.active ? ' active' : '');
    btn.id = 'tab-' + s.id;
    btn.innerHTML = `<span class="tab-num">${String(s.num).padStart(2,'0')}</span><span>${s.icon} ${s.title}</span><span class="tab-status" id="status-${s.id}"></span>`;
    btn.addEventListener('click', () => showPanel(s.id));
    nav.appendChild(btn);
  });
}

function renderPanels() {
  const wrap = document.getElementById('panels');
  SECTIONS.forEach(s => {
    const panel = document.createElement('section');
    panel.className = 'panel';
    panel.id = 'panel-' + s.id;
    panel.innerHTML = `
      <div class="panel-card">
        <div class="panel-head">
          <div class="panel-title-wrap">
            <div class="panel-num">${s.num}</div>
            <div>
              <div class="panel-title">${s.icon} ${s.title}</div>
              <div class="panel-desc">${s.desc}</div>
            </div>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <span class="badge badge-${s.badge}">${s.badge === 'real' ? 'REAL' : s.badge === 'ai' ? 'AI ESTIMATE' : 'HYBRID'}</span>
            <button class="btn btn-primary btn-sm" id="run-${s.id}">تحليل هذا القسم</button>
          </div>
        </div>
        <div class="panel-body" id="body-${s.id}">
          <div class="empty-state">أدخل اسم الدومين واضغط "تحليل هذا القسم" أو "تحليل شامل"</div>
        </div>
      </div>`;
    wrap.appendChild(panel);
    document.getElementById('run-' + s.id).addEventListener('click', () => runSection(s.id));
  });
}

function showPanel(id) {
  state.active = id;
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  document.getElementById('tab-' + id).classList.add('active');
}

function resetAll() {
  state.results = {};
  state.loading = {};
  SECTIONS.forEach(s => {
    document.getElementById('body-' + s.id).innerHTML = '<div class="empty-state">أدخل اسم الدومين واضغط "تحليل هذا القسم" أو "تحليل شامل"</div>';
    const dot = document.getElementById('status-' + s.id);
    if (dot) dot.classList.remove('done');
  });
}

/* ---------------- domain parsing ---------------- */
function getDomainInput() {
  let raw = document.getElementById('domainInput').value.trim().toLowerCase();
  raw = raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  return raw;
}
function parseDomain() {
  const raw = getDomainInput();
  if (!raw) return null;
  const hasDot = raw.includes('.');
  const full = hasDot ? raw : raw + '.com';
  const base = hasDot ? raw.split('.')[0] : raw;
  state.domain = full;
  state.base = base;
  try { localStorage.setItem('dip_last_domain', raw); } catch (e) {}
  return { full, base };
}

/* ---------------- RDAP (real data) ---------------- */
async function fetchRDAP(domain) {
  const res = await fetch('https://rdap.org/domain/' + encodeURIComponent(domain));
  if (res.status === 404) return { registered: false };
  if (!res.ok) throw new Error('RDAP HTTP ' + res.status);
  const data = await res.json();
  const events = data.events || [];
  const created = events.find(e => e.eventAction === 'registration')?.eventDate;
  const expires = events.find(e => e.eventAction === 'expiration')?.eventDate;
  const changed = events.find(e => e.eventAction === 'last changed')?.eventDate;
  let registrar = null;
  try {
    const regEntity = (data.entities || []).find(e => (e.roles || []).includes('registrar'));
    const fnField = regEntity?.vcardArray?.[1]?.find(f => f[0] === 'fn');
    registrar = fnField ? fnField[3] : (regEntity?.publicIds?.[0]?.identifier || null);
  } catch (e) {}
  let ageYears = null;
  if (created) {
    ageYears = ((Date.now() - new Date(created).getTime()) / (365.25 * 24 * 3600 * 1000)).toFixed(1);
  }
  return {
    registered: true,
    created, expires, changed, registrar,
    ageYears,
    status: data.status || []
  };
}

/* ---------------- Claude API (AI estimate) ---------------- */
function getApiKey() {
  try { return localStorage.getItem('dip_api_key') || ''; } catch (e) { return ''; }
}
async function callClaude(prompt, { webSearch = false } = {}) {
  const key = getApiKey();
  if (!key) {
    throw new Error('ما كايناش مفتاح API. اضغط "⚙️ مفتاح API" فالأعلى ودخّل مفتاح Anthropic ديالك.');
  }
  const body = {
    model: 'claude-sonnet-5',
    max_tokens: 3000,
    thinking: { type: 'disabled' },
    messages: [{ role: 'user', content: prompt }]
  };
  if (webSearch) body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json())?.error?.message || ''; } catch (e) {}
    if (res.status === 401) throw new Error('مفتاح API خاطئ أو منتهي' + (detail ? ' — ' + detail : '') + ' — تحقق منه فـ "⚙️ مفتاح API"');
    if (res.status === 402) throw new Error('المشكل فالفوترة' + (detail ? ' — ' + detail : '') + ' — زيد رصيد فـ console.anthropic.com');
    throw new Error('Claude API HTTP ' + res.status + (detail ? ' — ' + detail : ''));
  }
  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
  return text;
}
function parseJSONLoose(text) {
  let clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const s = clean.indexOf('{'), e = clean.lastIndexOf('}');
  if (s >= 0 && e > s) clean = clean.slice(s, e + 1);
  try {
    return JSON.parse(clean);
  } catch (err) {
    // Truncated mid-string safety net: close an unterminated quote, then
    // pad any unclosed braces/brackets before giving up.
    let repaired = clean;
    const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length;
    if (quoteCount % 2 !== 0) repaired += '"';
    const open = (repaired.match(/{/g) || []).length;
    const close = (repaired.match(/}/g) || []).length;
    repaired += '}'.repeat(Math.max(0, open - close));
    return JSON.parse(repaired);
  }
}

/* ---------------- UI helpers ---------------- */
function setLoading(id, msg) {
  document.getElementById('body-' + id).innerHTML = `<div class="loading-state">⏳ ${msg}</div>`;
}
function setError(id, msg) {
  document.getElementById('body-' + id).innerHTML = `<div class="error-state">⚠️ ${msg}</div>`;
}
function markDone(id) {
  const dot = document.getElementById('status-' + id);
  if (dot) dot.classList.add('done');
}
function scoreBar(label, value, max = 100) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = pct >= 66 ? 'var(--verdict-green)' : pct >= 35 ? 'var(--verdict-amber)' : 'var(--verdict-red)';
  return `<div class="score-bar-wrap">
    <div class="score-bar-label"><span>${label}</span><span class="num">${value}/100</span></div>
    <div class="score-bar-track"><div class="score-bar-fill" style="width:${pct}%; background:${color}"></div></div>
  </div>`;
}

/* ---------------- Section runners ---------------- */
async function runSection(id) {
  const parsed = parseDomain();
  if (!parsed) { alert('دخل اسم الدومين أولاً'); return; }
  if (state.loading[id]) return;
  state.loading[id] = true;
  try {
    switch (id) {
      case 'basic': await runBasic(); break;
      case 'legal': await runLegal(); break;
      case 'linguistic': await runLinguistic(); break;
      case 'commercial': await runCommercial(); break;
      case 'competition': await runCompetition(); break;
      case 'seo': await runSeo(); break;
      case 'insight': await runInsight(); break;
      case 'forecast': await runForecast(); break;
      case 'final': runFinal(); break;
      case 'discover': await runDiscover(); break;
    }
    markDone(id);
  } catch (err) {
    setError(id, 'تعذر إتمام التحليل: ' + err.message);
  } finally {
    state.loading[id] = false;
  }
}

async function runFullScan() {
  const parsed = parseDomain();
  if (!parsed) { alert('دخل اسم الدومين أولاً'); return; }
  const order = ['basic', 'legal', 'linguistic', 'commercial', 'competition', 'seo', 'insight', 'forecast', 'final'];
  for (const id of order) {
    showPanel(id);
    await runSection(id);
    await new Promise(r => setTimeout(r, 250));
  }
}

/* ---- 1. Basic ---- */
async function runBasic() {
  setLoading('basic', `جاري التحقق من ${state.domain} عبر RDAP...`);
  let rdap;
  try {
    rdap = await fetchRDAP(state.domain);
  } catch (err) {
    setError('basic', `تعذر الوصول لـ RDAP لهذا الامتداد (قد لا يدعمه rdap.org). تحقق يدويًا عبر <a href="https://who.is/whois/${state.domain}" target="_blank" style="color:var(--teal)">who.is/whois/${state.domain}</a>`);
    state.results.basic = { registered: null };
    return;
  }
  state.results.basic = rdap;
  const tld = '.' + state.domain.split('.').slice(1).join('.');

  if (!rdap.registered) {
    document.getElementById('body-basic').innerHTML = `
      <div class="data-grid">
        <div class="data-cell"><div class="label">الحالة</div><div class="value" style="color:var(--verdict-green)">متاح للتسجيل ✅</div></div>
        <div class="data-cell"><div class="label">الامتداد</div><div class="value ltr">${tld}</div></div>
      </div>
      <div class="summary-box">لا توجد بيانات RDAP مسجلة لهذا الاسم — يبدو متاحًا. تحقق من نفس النتيجة عبر بوابة التسجيل المفضلة عندك (Porkbun مثلاً) قبل اتخاذ قرار الشراء.</div>`;
    return;
  }

  document.getElementById('body-basic').innerHTML = `
    <div class="data-grid">
      <div class="data-cell"><div class="label">الحالة</div><div class="value" style="color:var(--verdict-red)">مسجّل بالفعل</div></div>
      <div class="data-cell"><div class="label">الامتداد</div><div class="value ltr">${tld}</div></div>
      <div class="data-cell"><div class="label">تاريخ أول تسجيل</div><div class="value ltr">${rdap.created ? rdap.created.slice(0,10) : 'غير متوفر'}</div></div>
      <div class="data-cell"><div class="label">تاريخ الانتهاء</div><div class="value ltr">${rdap.expires ? rdap.expires.slice(0,10) : 'غير متوفر'}</div></div>
      <div class="data-cell"><div class="label">عمر الدومين</div><div class="value ltr">${rdap.ageYears ? rdap.ageYears + ' سنة' : 'غير متوفر'}</div></div>
      <div class="data-cell"><div class="label">المسجِّل (Registrar)</div><div class="value ltr" style="font-size:12.5px">${rdap.registrar || 'غير متوفر'}</div></div>
    </div>
    <div class="summary-box">
      <strong>عدد مرات انتقال الملكية والدول المستخدمة:</strong> غير متوفرة عبر RDAP العام — هذه البيانات تتطلب أرشيف WHOIS تاريخي (خدمة مدفوعة مثل WhoisXML History API). يمكن إضافتها لاحقًا إذا توفر اشتراك.
    </div>`;
}

/* ---- 2. Legal ---- */
// TODO (phase 2): integrate USPTO Open Data Portal trademark search once a
// USPTO.gov account + auth flow is set up (legacy Developer Hub API retired
// June 2026). For now this section runs on Claude + web_search only.
async function runLegal() {
  setLoading('legal', 'جاري البحث القانوني عبر الويب...');
  const prompt = `حلل المخاطر القانونية لاسم النطاق "${state.base}" من ناحية العلامات التجارية. استخدم البحث على الويب للتحقق من: وجود علامة تجارية مطابقة، وجود علامات مشابهة قد تسبب نزاع، سوابق UDRP معروفة لأسماء مشابهة، وشركات مشهورة تستخدم هذا الاسم فعليًا.
أجب حصريًا بصيغة JSON بدون أي نص إضافي وبدون Markdown، بهذا الشكل بالضبط:
{"exact_trademark_match":"...","similar_trademark_risk":"منخفض|متوسط|مرتفع","udrp_precedent":"...","famous_company_usage":"...","descriptive_or_distinctive":"وصفي|مميز|بيني","legal_risk_score":0,"summary":"ملخص من جملتين بالعربية"}
legal_risk_score رقم من 0 إلى 100 حيث 0 = خطر منعدم و100 = خطر قانوني شديد.`;
  const text = await callClaude(prompt, { webSearch: true });
  const j = parseJSONLoose(text);
  state.results.legal = j;
  document.getElementById('body-legal').innerHTML = `
    <div class="kv-list">
      <div class="kv-row"><span class="k">علامة مطابقة تمامًا</span><span class="v">${j.exact_trademark_match}</span></div>
      <div class="kv-row"><span class="k">خطر علامات مشابهة</span><span class="v">${j.similar_trademark_risk}</span></div>
      <div class="kv-row"><span class="k">سوابق UDRP</span><span class="v">${j.udrp_precedent}</span></div>
      <div class="kv-row"><span class="k">استخدام من شركات مشهورة</span><span class="v">${j.famous_company_usage}</span></div>
      <div class="kv-row"><span class="k">وصفي أم مميز</span><span class="v">${j.descriptive_or_distinctive}</span></div>
    </div>
    ${scoreBar('درجة الخطر القانوني', j.legal_risk_score)}
    <div class="summary-box">${j.summary}</div>
    <div class="disclaimer">هذا تحليل استرشادي بالذكاء الاصطناعي وبحث ويب عام، وليس بحث علامات تجارية رسمي. للقرارات المهمة راجع USPTO TESS أو WIPO Global Brand Database أو محامي ملكية فكرية.</div>`;
}

/* ---- 3. Linguistic ---- */
async function runLinguistic() {
  setLoading('linguistic', 'جاري التحليل اللغوي...');
  const prompt = `حلل الجوانب اللغوية لاسم النطاق "${state.base}" من ناحية سهولة النطق والتذكر والكتابة، احتمال الخطأ الإملائي، قابليته ليصبح علامة تجارية، ومدى سلاسة نطقه بالعربية والإنجليزية والفرنسية.
أجب حصريًا بصيغة JSON بدون أي نص إضافي:
{"pronounceability":0,"memorability":0,"spelling_ease":0,"typo_risk":"منخفض|متوسط|مرتفع","brandability":0,"arabic_flag":"جيد|مقبول|صعب","english_flag":"جيد|مقبول|صعب","french_flag":"جيد|مقبول|صعب","linguistic_score":0,"summary":"ملخص من جملتين"}
كل الدرجات الرقمية من 0 إلى 100.`;
  const text = await callClaude(prompt);
  const j = parseJSONLoose(text);
  state.results.linguistic = j;
  document.getElementById('body-linguistic').innerHTML = `
    <div class="data-grid">
      <div class="data-cell"><div class="label">النطق بالعربية</div><div class="value">${j.arabic_flag}</div></div>
      <div class="data-cell"><div class="label">النطق بالإنجليزية</div><div class="value">${j.english_flag}</div></div>
      <div class="data-cell"><div class="label">النطق بالفرنسية</div><div class="value">${j.french_flag}</div></div>
      <div class="data-cell"><div class="label">احتمال الخطأ الإملائي</div><div class="value">${j.typo_risk}</div></div>
    </div>
    ${scoreBar('سهولة النطق', j.pronounceability)}
    ${scoreBar('سهولة التذكر', j.memorability)}
    ${scoreBar('سهولة الكتابة', j.spelling_ease)}
    ${scoreBar('قابلية العلامة التجارية', j.brandability)}
    <div class="summary-box">${j.summary}</div>`;
}

/* ---- 4. Commercial ---- */
async function runCommercial() {
  setLoading('commercial', 'جاري بحث الفرصة التجارية...');
  const prompt = `باستخدام البحث على الويب، قيّم الفرصة التجارية لاسم النطاق "${state.base}" كأصل رقمي في قطاعه المحتمل. قدّر: حجم السوق المستهدف، معدل نمو القطاع، عدد الشركات الناشئة النشطة في هذا المجال، وحجم الاستثمارات التقريبي في هذا القطاع خلال آخر سنتين.
أجب حصريًا بصيغة JSON:
{"target_market_size":"...","sector_growth_rate":"...","active_startups_estimate":"...","investment_volume_estimate":"...","commercial_score":0,"summary":"ملخص من جملتين"}
commercial_score من 0 إلى 100.`;
  const text = await callClaude(prompt, { webSearch: true });
  const j = parseJSONLoose(text);
  state.results.commercial = j;
  document.getElementById('body-commercial').innerHTML = `
    <div class="kv-list">
      <div class="kv-row"><span class="k">حجم السوق المستهدف</span><span class="v">${j.target_market_size}</span></div>
      <div class="kv-row"><span class="k">معدل نمو القطاع</span><span class="v">${j.sector_growth_rate}</span></div>
      <div class="kv-row"><span class="k">الشركات الناشئة النشطة</span><span class="v">${j.active_startups_estimate}</span></div>
      <div class="kv-row"><span class="k">حجم الاستثمارات</span><span class="v">${j.investment_volume_estimate}</span></div>
    </div>
    ${scoreBar('الدرجة التجارية', j.commercial_score)}
    <div class="summary-box">${j.summary}</div>`;
}

/* ---- iTunes Search (real, free, no key, CORS-open) ---- */
async function checkAppStore(name) {
  const res = await fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(name) + '&entity=software&limit=5');
  if (!res.ok) throw new Error('iTunes HTTP ' + res.status);
  const data = await res.json();
  return data.results || [];
}

/* ---- 5. Competition (hybrid: RDAP + iTunes real, AI for social media only) ---- */
async function runCompetition() {
  setLoading('competition', 'جاري فحص الامتدادات المشابهة...');
  const tlds = ['.com', '.net', '.org', '.io', '.ai', '.co', '.app', '.xyz'];
  const rows = [];
  for (const tld of tlds) {
    const d = state.base + tld;
    try {
      const r = await fetchRDAP(d);
      rows.push({ tld, taken: r.registered });
    } catch (e) {
      rows.push({ tld, taken: null });
    }
    await new Promise(r => setTimeout(r, 200));
  }
  const takenCount = rows.filter(r => r.taken === true).length;

  let apps = [];
  let appsError = false;
  try {
    apps = await checkAppStore(state.base);
  } catch (e) { appsError = true; }

  let aiPart = { social_media_usage: '—', active_competing_sites: '—', competition_score: 50, summary: '' };
  try {
    const prompt = `باستخدام البحث على الويب، تحقق هل اسم "${state.base}" محجوز أو مستخدم فعليًا في منصات التواصل الاجتماعي الرئيسية (X, Instagram, TikTok)، ومواقع فعلية تعمل بامتدادات أخرى.
أجب حصريًا بصيغة JSON:
{"social_media_usage":"...","active_competing_sites":"...","competition_score":0,"summary":"ملخص جملتين"}
competition_score من 0 إلى 100 حيث 100 = لا توجد منافسة (فرصة نادرة) و0 = مستخدم بكثافة. خذ بعين الاعتبار فقط السوشيال ميديا والمواقع المنافسة (نتائج App Store الحقيقية معروضة بشكل منفصل).`;
    const text = await callClaude(prompt, { webSearch: true });
    aiPart = parseJSONLoose(text);
  } catch (e) { /* keep defaults, non-fatal */ }

  state.results.competition = { rows, takenCount, apps, ...aiPart };

  document.getElementById('body-competition').innerHTML = `
    <table class="tld-table">
      <thead><tr><th>الامتداد</th><th>الحالة</th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr><td class="ltr" style="direction:ltr">${state.base}${r.tld}</td><td><span class="tld-status">
          <span class="dot ${r.taken === true ? 'taken' : r.taken === false ? 'free' : 'unknown'}"></span>
          ${r.taken === true ? 'مسجّل' : r.taken === false ? 'متاح' : 'غير مؤكد'}
        </span></td></tr>`).join('')}
      </tbody>
    </table>

    <div class="panel-desc" style="margin:16px 0 4px"><span class="badge badge-real" style="padding:2px 8px;">REAL — iTunes Search API</span></div>
    ${appsError
      ? `<div class="error-state">تعذر الوصول لـ iTunes Search API</div>`
      : apps.length === 0
        ? `<div class="summary-box">لا توجد تطبيقات بهذا الاسم في App Store حاليًا — إشارة جيدة لندرة الاسم.</div>`
        : `<div class="kv-list">${apps.slice(0,5).map(a => `<div class="kv-row"><span class="k">${a.trackName}</span><span class="v">${a.artistName}</span></div>`).join('')}</div>`}

    <div class="panel-desc" style="margin:16px 0 4px"><span class="badge badge-ai" style="padding:2px 8px;">AI ESTIMATE</span></div>
    <div class="kv-list">
      <div class="kv-row"><span class="k">استخدام في السوشيال ميديا</span><span class="v">${aiPart.social_media_usage}</span></div>
      <div class="kv-row"><span class="k">مواقع منافسة نشطة</span><span class="v">${aiPart.active_competing_sites}</span></div>
    </div>
    ${scoreBar('درجة الندرة/قلة المنافسة', aiPart.competition_score)}
    <div class="summary-box">${aiPart.summary || ''}</div>`;
}

/* ---- 6. SEO ---- */
async function runSeo() {
  setLoading('seo', 'جاري تقدير مؤشرات SEO...');
  const prompt = `باستخدام البحث على الويب (اتجاهات البحث العامة)، قدّر تقريبيًا مؤشرات SEO لكلمة "${state.base}": حجم البحث الشهري التقريبي، تكلفة النقرة CPC التقريبية، قوة الكلمة المفتاحية، اتجاه البحث خلال 5 سنوات، والموسمية إن وجدت. وضّح أنها تقديرات تقريبية وليست بيانات Ahrefs/SEMrush دقيقة.
أجب حصريًا بصيغة JSON:
{"monthly_search_volume":"...","cpc_estimate":"...","keyword_strength":"...","five_year_trend":"صاعد|مستقر|هابط","seasonality":"...","seo_score":0,"summary":"ملخص جملتين"}
seo_score من 0 إلى 100.`;
  const text = await callClaude(prompt, { webSearch: true });
  const j = parseJSONLoose(text);
  state.results.seo = j;
  document.getElementById('body-seo').innerHTML = `
    <div class="data-grid">
      <div class="data-cell"><div class="label">حجم البحث الشهري (تقديري)</div><div class="value">${j.monthly_search_volume}</div></div>
      <div class="data-cell"><div class="label">CPC تقديري</div><div class="value">${j.cpc_estimate}</div></div>
      <div class="data-cell"><div class="label">قوة الكلمة المفتاحية</div><div class="value">${j.keyword_strength}</div></div>
      <div class="data-cell"><div class="label">اتجاه 5 سنوات</div><div class="value">${j.five_year_trend}</div></div>
      <div class="data-cell"><div class="label">الموسمية</div><div class="value" style="font-size:12.5px">${j.seasonality}</div></div>
    </div>
    ${scoreBar('درجة SEO', j.seo_score)}
    <div class="summary-box">${j.summary}</div>
    <div class="disclaimer">تقديرات تقريبية مبنية على استدلال AI وبحث ويب عام — للدقة الكاملة استخدم Ahrefs أو SEMrush أو Google Keyword Planner.</div>`;
}

/* ---- 7. AI insight ---- */
// TODO (phase 2): swap in Currents API (or a NewsAPI.org proxy) for real
// headline grounding instead of relying only on Claude's web_search tool.
async function runInsight() {
  setLoading('insight', 'جاري البحث عن اتجاهات حديثة...');
  const prompt = `باستخدام البحث على الويب عن آخر الأخبار والاتجاهات، اكتب رؤية تحليلية محددة (وليست تقييمًا عامًا) حول احتمال ازدياد الطلب على اسم النطاق "${state.base}" خلال السنوات القادمة، مع ذكر السبب المحدد (تقنية ناشئة، قطاع ينمو، حدث سوقي فعلي...).
أجب حصريًا بصيغة JSON:
{"insight":"فقرة من 3-4 جمل تشرح السبب المحدد","growth_drivers":["سبب 1","سبب 2","سبب 3"],"confidence":"منخفضة|متوسطة|مرتفعة"}`;
  const text = await callClaude(prompt, { webSearch: true });
  const j = parseJSONLoose(text);
  state.results.insight = j;
  document.getElementById('body-insight').innerHTML = `
    <div class="summary-box" style="border-right-color:var(--teal)">${j.insight}</div>
    <div class="kv-list" style="margin-top:12px">
      ${(j.growth_drivers || []).map((d, i) => `<div class="kv-row"><span class="k">محرك النمو ${i + 1}</span><span class="v">${d}</span></div>`).join('')}
      <div class="kv-row"><span class="k">درجة الثقة</span><span class="v">${j.confidence}</span></div>
    </div>`;
}

/* ---- 8. Forecast ---- */
// TODO (phase 2): supplement with GoDaddy GoValue API for a real appraisal
// number once a paid GoDaddy Appraisal plan + CORS proxy is set up.
async function runForecast() {
  setLoading('forecast', 'جاري بناء التوقع المستقبلي...');
  const prompt = `بناءً على طبيعة اسم النطاق "${state.base}" ونشاط سوق بيع النطاقات المشابهة، قدّر احتمالية بيعه خلال سنة واحدة وثلاث سنوات وعشر سنوات، ونطاق السعر المتوقع بالدولار، وأفضل توقيت تقريبي للبيع.
أجب حصريًا بصيغة JSON:
{"prob_1y":0,"prob_3y":0,"prob_10y":0,"expected_price_range":"...","best_time_to_sell":"...","forecast_score":0,"summary":"ملخص جملتين"}
الاحتمالات نسب مئوية من 0 إلى 100. forecast_score من 0 إلى 100.`;
  const text = await callClaude(prompt, { webSearch: true });
  const j = parseJSONLoose(text);
  state.results.forecast = j;
  document.getElementById('body-forecast').innerHTML = `
    ${scoreBar('احتمال البيع خلال سنة', j.prob_1y)}
    ${scoreBar('احتمال البيع خلال 3 سنوات', j.prob_3y)}
    ${scoreBar('احتمال البيع خلال 10 سنوات', j.prob_10y)}
    <div class="kv-list" style="margin-top:12px">
      <div class="kv-row"><span class="k">نطاق السعر المتوقع</span><span class="v">${j.expected_price_range}</span></div>
      <div class="kv-row"><span class="k">أفضل توقيت للبيع</span><span class="v">${j.best_time_to_sell}</span></div>
    </div>
    <div class="summary-box">${j.summary}</div>`;
}

/* ---- 9. Final aggregate (client-side, no API call) ---- */
function getScore(section, field, fallback) {
  const r = state.results[section];
  if (!r || r[field] === undefined || r[field] === null) return fallback;
  return Number(r[field]) || fallback;
}
function runFinal() {
  const legalRisk = getScore('legal', 'legal_risk_score', 50);
  const commercial = getScore('commercial', 'commercial_score', 50);
  const forecastScore = getScore('forecast', 'forecast_score', 50);
  const prob3y = getScore('forecast', 'prob_3y', 40);
  const brandability = getScore('linguistic', 'brandability', 50);
  const competitionScore = getScore('competition', 'competition_score', 50);
  const distinctMap = { 'مميز': 90, 'بيني': 60, 'وصفي': 30 };
  const distinctBonus = distinctMap[state.results.legal?.descriptive_or_distinctive] ?? 55;

  const investment = Math.round((commercial + forecastScore) / 2);
  const liquidity = Math.round(((100 - legalRisk) + competitionScore + prob3y) / 3);
  const rarity = Math.round((competitionScore + distinctBonus) / 2);
  const overall = Math.round((investment + liquidity + brandability + rarity + (100 - legalRisk)) / 5);

  let verdict = 'watch', icon = '🟡', label = 'راقب';
  if (legalRisk >= 65) { verdict = 'avoid'; icon = '🔴'; label = 'لا تشترِ'; }
  else if (overall >= 70) { verdict = 'buy'; icon = '🟢'; label = 'شراء'; }
  else if (overall < 40) { verdict = 'avoid'; icon = '🔴'; label = 'لا تشترِ'; }

  state.results.final = { investment, legalRisk, liquidity, brandability, rarity, overall, verdict };

  document.getElementById('body-final').innerHTML = `
    <div class="verdict-wrap">
      <div class="stamp ${verdict}">
        <div class="stamp-icon">${icon}</div>
        <div class="stamp-text">${label}</div>
      </div>
      <div class="metrics-grid">
        <div class="metric-row"><span class="m-label">الاستثمار</span><div class="score-bar-track"><div class="score-bar-fill" style="width:${investment}%; background:var(--gold)"></div></div><span class="m-val">${investment}</span></div>
        <div class="metric-row"><span class="m-label">الخطر القانوني</span><div class="score-bar-track"><div class="score-bar-fill" style="width:${legalRisk}%; background:var(--verdict-red)"></div></div><span class="m-val">${legalRisk}</span></div>
        <div class="metric-row"><span class="m-label">السيولة</span><div class="score-bar-track"><div class="score-bar-fill" style="width:${liquidity}%; background:var(--teal)"></div></div><span class="m-val">${liquidity}</span></div>
        <div class="metric-row"><span class="m-label">قابلية العلامة</span><div class="score-bar-track"><div class="score-bar-fill" style="width:${brandability}%; background:#B7A6E8"></div></div><span class="m-val">${brandability}</span></div>
        <div class="metric-row"><span class="m-label">الندرة</span><div class="score-bar-track"><div class="score-bar-fill" style="width:${rarity}%; background:var(--verdict-green)"></div></div><span class="m-val">${rarity}</span></div>
      </div>
    </div>
    <div class="summary-box" style="text-align:center; margin-top:18px;">الدرجة الإجمالية: <strong style="color:var(--paper)">${overall}/100</strong> — هذا القرار مبني على تجميع كل الأقسام المُحلَّلة أعلاه. الأقسام غير المُحلَّلة تُستبدل بقيمة افتراضية متوسطة (50) — حلل كل الأقسام أولاً للحصول على قرار دقيق.</div>`;
}

/* ---- 10. Discovery engine ---- */
// TODO (phase 2): same Currents API / NewsAPI note as section 7 — real
// trending headlines would sharpen the "trend" the model picks.
async function runDiscover() {
  setLoading('discover', 'جاري البحث عن اتجاهات ناشئة وتوليد أسماء...');
  const prompt = `ابحث عن تقنية أو اتجاه ناشئ بارز خلال الأسابيع الأخيرة في مجال محدد (ذكاء اصطناعي، روبوتات، طاقة، صحة، أو فضاء). بعدها اقترح 10 أسماء دومين محتملة الاستثمار مرتبطة بهذا الاتجاه (بالإنجليزية، مناسبة لامتداد .com، بدون مسافات)، لكل اسم سبب مختصر، مع استبعاد أي اسم قد يتعارض مع علامة تجارية معروفة مثل Tesla أو Google أو Apple.
أجب حصريًا بصيغة JSON:
{"trend":"اسم الاتجاه بجملة واحدة بالعربية","names":[{"name":"example.com","reason":"سبب مختصر بالعربية"}]}
أعطِ 10 عناصر بالضبط في names.`;
  const text = await callClaude(prompt, { webSearch: true });
  const j = parseJSONLoose(text);
  state.results.discover = j;

  document.getElementById('body-discover').innerHTML = `
    <div class="summary-box"><strong>الاتجاه المكتشف:</strong> ${j.trend}</div>
    <div style="margin-top:14px" id="discoverList">
      ${(j.names || []).map((n, i) => `
        <div class="discover-item" id="disc-${i}">
          <div><div class="name">${n.name}</div><div class="why">${n.reason}</div></div>
          <span class="status-pill checking" id="disc-status-${i}">جاري التحقق...</span>
        </div>`).join('')}
    </div>
    <div class="disclaimer">الاستبعاد القانوني هنا استرشادي فقط بناءً على معرفة AI العامة — تحقق دائمًا من التوفر الفعلي وقاعدة العلامات التجارية قبل الشراء.</div>`;

  const names = j.names || [];
  for (let i = 0; i < names.length; i++) {
    try {
      const r = await fetchRDAP(names[i].name);
      const el = document.getElementById('disc-status-' + i);
      if (el) {
        el.textContent = r.registered ? 'مسجّل' : 'متاح ✅';
        el.className = 'status-pill ' + (r.registered ? 'taken' : 'free');
      }
    } catch (e) {
      const el = document.getElementById('disc-status-' + i);
      if (el) { el.textContent = 'غير مؤكد'; }
    }
    await new Promise(r => setTimeout(r, 200));
  }
}
