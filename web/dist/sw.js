const CACHE = 'pise-cache-v1';
const ASSETS = [
  '/',
  '/vite.svg',
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (/^https?:\/\/[^\/]*tile\.openstreetmap\.org\//.test(event.request.url)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }
  if (url.origin === self.location.origin && event.request.method === 'GET') {
    event.respondWith(networkFirst(event.request));
  }
});
async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  cache.put(request, res.clone());
  return res;
}
async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    cache.put(request, res.clone());
    return res;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw e;
  }
}
