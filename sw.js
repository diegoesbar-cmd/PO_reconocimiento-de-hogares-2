/* Service worker: precache de toda la app y respuesta desde caché.
 *
 * - Si cambias SOLO un cuestionario (cuestionario.js o clinica.js): no hay que tocar nada aquí. El navegador
 *   detecta que cuestionario.js cambió (se importa abajo) y actualiza la app solo.
 * - Si cambias el código de la app (app.js, styles.css, index.html): sube VERSION aquí
 *   y APP_VERSION en app.js. */
self.window = self;
importScripts('cuestionario.js', 'clinica.js');
const VERSION = '2.1.0';
const FORMS = self.CUESTIONARIOS || {};
const FORM = Object.keys(FORMS).sort().map((k) => k + FORMS[k].meta.version).join('_') || '0';
const CACHE = `hogares-${VERSION}-${FORM}`;

const PRECACHE = [
  './',
  'index.html',
  'styles.css',
  'cuestionario.js',
  'clinica.js',
  'app.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // cache: 'reload' evita que el caché HTTP de GitHub Pages (≈10 min) entregue archivos viejos
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('hogares-') && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                       // los POST a Apps Script no se tocan
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // solo recursos propios

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      if (req.mode === 'navigate') {
        const shell = await cache.match('index.html');
        if (shell) return shell;
      }
      return Response.error();
    }
  })());
});
