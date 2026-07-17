/* Service worker — cache hors-ligne
   Compatible GitHub Pages (chemins relatifs à l'emplacement de sw.js).
   Incrémentez CACHE à chaque mise à jour pour forcer le rafraîchissement. */
const CACHE = 'perimes-v8';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-64.png'
];

/* Fichiers non bloquants : base produits + lecteur caméra ZXing.
   ZXing est mis en cache dès l'installation pour que la caméra iOS
   fonctionne aussi hors-ligne. */
const OPTIONNELS = [
  './data/produits.json',
  './vendor/zxing.min.js',
  'https://cdn.jsdelivr.net/npm/@zxing/library@0.19.1/umd/index.min.js',
  'https://unpkg.com/@zxing/library@0.19.1/umd/index.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(async (c) => {
      await c.addAll(ASSETS);
      await Promise.all(OPTIONNELS.map((u) => c.add(u).catch(() => {})));
      await self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const memeOrigine = new URL(req.url).origin === self.location.origin;

  e.respondWith(
    caches.match(req).then((cache) => {
      if (cache) return cache;
      return fetch(req)
        .then((rep) => {
          // On met en cache : même origine, ou scripts externes chargés avec succès (ZXing)
          const cacheable = rep && (rep.status === 200) &&
            (rep.type === 'basic' || rep.type === 'cors');
          if (cacheable) {
            const copie = rep.clone();
            caches.open(CACHE).then((c) => c.put(req, copie));
          }
          return rep;
        })
        .catch(() => {
          if (req.mode === 'navigate') return caches.match('./index.html');
          if (memeOrigine) return caches.match('./index.html');
        });
    })
  );
});
