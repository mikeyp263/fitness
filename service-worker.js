const CACHE = 'r14-lifting-20260923-v6';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const INDEX = new URL('./index.html', self.location.href).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS.map(url => new Request(url, {cache: 'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('apex-') || key.startsWith('r14-')).filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request, {cache: 'no-store'});
      if (response.ok) {
        const key = request.mode === 'navigate' ? INDEX : request;
        try { await cache.put(key, response.clone()); } catch (_) {}
      }
      return response;
    } catch (_) {
      const cached = await cache.match(request.mode === 'navigate' ? INDEX : request);
      return cached || Response.error();
    }
  })());
});


