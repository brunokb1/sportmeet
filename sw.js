/* ============================================================
   SportMeet — Service Worker (PWA offline cache)
   ============================================================ */
const CACHE = 'sportmeet-v7';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/store.js',
  './js/app.js',
  './favicon.svg',
  './manifest.webmanifest',
  './pages/agenda.html',
  './pages/buscar.html',
  './pages/resultados.html',
  './pages/detalhes.html',
  './pages/criar-evento.html',
  './pages/convidar-amigos.html',
  './pages/evento-criado.html',
  './pages/adicionado-agenda.html',
  './pages/perfil.html',
  './pages/notificacoes.html',
  './pages/amigo.html',
  './pages/lista.html',
  './pages/confirmar-cancelamento.html',
  './pages/evento-cancelado.html',
  './pages/privacidade.html',
  './pages/ajuda.html',
  './pages/sobre.html',
  './pages/onboarding.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only cache same-origin GET requests
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Cache HTML, CSS, JS responses
        if (res.ok && (e.request.url.endsWith('.html') || e.request.url.endsWith('.css') || e.request.url.endsWith('.js') || e.request.url.endsWith('.svg'))) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html')); // fallback for navigation
    })
  );
});
