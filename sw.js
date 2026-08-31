/** Migration Pulse Hub — resilient offline and fast-return cache */
const CACHE = 'mph-v27';
const OFFLINE_PAGE = '/404.html';
const PRECACHE = [
  '/', '/index.html', OFFLINE_PAGE,
  '/assets/css/style.css', '/assets/css/zuri-chat.css',
  '/assets/js/main.js', '/assets/js/svg-loader.js', '/assets/js/zuri-chat.js',
  '/assets/js/form-handler.js', '/assets/js/news-feed.js',
  '/assets/images/logo.png', '/assets/images/home-hero/01-coffee-ceremony.jpg',
  '/favicon.ico', '/favicon-32x32.png', '/apple-touch-icon.png', '/site.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) =>
    Promise.allSettled(PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' }))))
  ));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await Promise.all((await caches.keys()).filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    if ('navigationPreload' in self.registration) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('range')) return;
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(event));
  } else {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});

async function networkFirst(event) {
  const { request } = event;
  try {
    const response = (await event.preloadResponse) || await fetch(request);
    if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
    return response;
  } catch (_) {
    return (await caches.match(request)) || (await caches.match(OFFLINE_PAGE)) ||
      new Response('This page is unavailable offline.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const update = fetch(request).then((response) => {
    if (response.ok && (response.type === 'basic' || response.type === 'cors')) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  if (cached) {
    event.waitUntil(update);
    return cached;
  }
  return (await update) || new Response('Resource unavailable offline.', { status: 503 });
}
