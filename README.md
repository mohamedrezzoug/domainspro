# Domain Intelligence Pro

## ⚠️ خاصك مفتاح Anthropic API الخاص بيك
الأقسام المبنية على AI (2, 3, 4, 6, 7, 8, 10) كتحتاج مفتاح API حقيقي ديالك. اللي كان مدمج قبل بلا مفتاح كان كيخدم غير جوا محادثة Claude.ai (Artifacts) — بمجرد ما حملتي الملفات وحليتيهم locally أو نشرتيهم، هاد الخدعة ما كتخدمش، لهذا الأقسام كانت كتفشل.

**كيفاش تحصل على مفتاح:**
1. سير لـ console.anthropic.com (ولا platform.claude.com — كيوصلوك لنفس المكان)
2. سجل، زيد وسيلة دفع (الـ API مدفوع بالتوكن، ماكاينش free tier دائم)
3. API Keys → Create Key → نسخ المفتاح (كيبان مرة وحدة غير)
4. فالتطبيق: اضغط "⚙️ مفتاح API" فالأعلى، لصق المفتاح، اضغط "حفظ"

المفتاح كيتخزن غير فـ localStorage ديال المتصفح — ما كيتبعتش لحتى سيرفر آخر غير api.anthropic.com مباشرة.

## النشر على GitHub Pages
1. أنشئ repo جديد فـ mohamedrezzoug.github.io باسم مثلاً `domain-intel-pro`
2. ارفع الملفات: index.html, style.css, app.js, manifest.json, service-worker.js
3. Settings → Pages → Branch: main → Save
4. الرابط: mohamedrezzoug.github.io/domain-intel-pro/
5. من الأندرويد: افتح الرابط فـ Chrome → قائمة الثلاث نقط → "إضافة إلى الشاشة الرئيسية"

⚠️ إلا الريبو عمومي، أي حد يفتح "⚙️ مفتاح API" فتطبيقك ما غاديش يشوف المفتاح ديالك (كيبقى فالمتصفح ديالو هو، localStorage ماشي مشترك). لكن خاصك دايماً تدخل المفتاح بنفسك فكل جهاز كتستعمل فيه التطبيق — ماشي مكتوب فالكود.

## بنية الأقسام (10)
| # | القسم | نوع البيانات |
|---|---|---|
| 1 | أساسي | REAL — RDAP (بلا مفتاح) |
| 2 | قانوني | AI + web_search (يحتاج مفتاحك) |
| 3 | لغوي | AI (يحتاج مفتاحك) |
| 4 | تجاري | AI + web_search (يحتاج مفتاحك) |
| 5 | منافسة | HYBRID — RDAP + iTunes Search (REAL، بلا مفتاح) + AI للسوشيال ميديا (يحتاج مفتاحك) |
| 6 | SEO | AI + web_search (يحتاج مفتاحك) |
| 7 | رؤية AI | AI + web_search (يحتاج مفتاحك) |
| 8 | توقع مستقبلي | AI + web_search (يحتاج مفتاحك) |
| 9 | تقييم نهائي | حساب تلقائي من نتائج الأقسام 2/3/4/5/8 (بلا مفتاح) |
| 10 | اكتشاف الفرص | AI + web_search + RDAP (يحتاج مفتاحك) |

## نقطة مؤجلة (Phase 2) — TODO فـ app.js
- **USPTO**: النظام الجديد (Open Data Portal) كيطلب حساب USPTO.gov حقيقي، ماشي API key ثابت
- **NewsAPI.org**: الخطة المجانية محدودة بـ localhost فقط عبر CORS — البديل: Currents API
- **GoDaddy GoValue**: التقييم المجاني تحيّد، خاصو باقة مدفوعة + proxy لمشكل CORS
