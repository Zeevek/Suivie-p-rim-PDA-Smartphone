/* Service worker — cache hors-ligne
   Compatible GitHub Pages (chemins relatifs à l'emplacement de sw.js).
   Incrémentez CACHE à chaque mise à jour pour forcer le rafraîchissement. */
const CACHE = 'perimes-v3';

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

const OPTIONNELS = ['./data/produits.csv'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(async (c) => {
      await c.addAll(ASSETS);
      // Fichiers optionnels : on ne bloque pas l'installation s'ils sont absents
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
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then((cache) => {
      if (cache) return cache;
      return fetch(req)
        .then((rep) => {
          if (rep && rep.status === 200 && rep.type === 'basic') {
            const copie = rep.clone();
            caches.open(CACHE).then((c) => c.put(req, copie));
          }
          return rep;
        })
        .catch(() => {
          // Hors-ligne : pour une navigation, on renvoie la page d'accueil
          if (req.mode === 'navigate') return caches.match('./index.html');
        });
    })
  );
});
