const CACHE = 'meteo-v1';
const STATIC = ['/meteo/', '/meteo/index.html', '/meteo/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Réseau d'abord pour les appels API météo
  if (url.hostname.includes('open-meteo.com') || url.hostname.includes('nominatim')) {
    e.respondWith(
      fetch(e.request).catch(() => new Response('{"error":"offline"}', {
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }

  // Cache d'abord pour les assets statiques
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
