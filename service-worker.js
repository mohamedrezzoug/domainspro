const CACHE = 'domain-intel-pro-v1';
const SHELL = ['./', './index.html', './style.css', './app.js', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first for API calls (RDAP / Claude / iTunes) so data stays live,
// cache-first for the static app shell so it opens instantly offline.
self.addEventListener('fetch', e => {
  const url = e.request.url;
  const isApi = url.includes('rdap.org') || url.includes('api.anthropic.com') || url.includes('itunes.apple.com');
  if (isApi) return; // let these hit the network normally, no caching of live data

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
