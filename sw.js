// Seda offline cache. The page is network-first (updates show on the next open with signal); icons and Google Fonts are cache-first.
// The weather API passes through (the page keeps its own last copy).
const CACHE = 'seda-v8';
const CORE = ['./', 'manifest.webmanifest', 'icon-192.png', 'apple-touch-icon.png', 'favicon-32.png', 'art-muralha.webp?v=3', 'art-pequim.webp?v=3', 'art-xian.webp?v=3', 'art-xangai.webp?v=3', 'art-shenzhen.webp?v=3', 'art-hongkong.webp?v=3', 'art-comer.webp?v=3', 'art-trem.webp?v=3', 'art-cha.webp?v=3', 'art-panda.webp?v=3', 'tab-sun.webp?v=3', 'tab-cal.webp?v=3', 'tab-train.webp?v=3', 'tab-bed.webp?v=3', 'tab-bowl.webp?v=3', 'tab-bag.webp?v=3'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
async function put(req, res) { if (res && (res.ok || res.type === 'opaque')) (await caches.open(CACHE)).put(req, res); }
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (u.origin !== self.location.origin && !fonts) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req.url, {cache: 'no-cache', credentials: 'same-origin'}).then(r => { put('./', r.clone()); return r; })
      .catch(() => caches.match('./', {ignoreSearch: true}).then(r => r || caches.match(req))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { put(req, r.clone()); return r; })));
});
