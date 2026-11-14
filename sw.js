// Seda offline cache. The page is network-first (updates show on the next open with signal); icons are cache-first.
// The weather API passes through (the page keeps its own last copy).
const CACHE = 'seda-v1';
const CORE = ['./', 'manifest.webmanifest', 'icon-192.png', 'apple-touch-icon.png', 'favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
async function put(req, res) { if (res && res.ok) (await caches.open(CACHE)).put(req, res); }
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req.url, {cache: 'no-cache', credentials: 'same-origin'}).then(r => { put('./', r.clone()); return r; })
      .catch(() => caches.match('./', {ignoreSearch: true}).then(r => r || caches.match(req))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { put(req, r.clone()); return r; })));
});
