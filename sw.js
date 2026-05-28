/**
 * Migration Pulse Hub — Service Worker
 * Strategy:
 *   • Pre-cache critical shell assets on install
 *   • Cache-first for /assets/ (CSS, JS, images, fonts)
 *   • Network-first for HTML pages (always serve fresh content)
 *   • Stale-while-revalidate for external fonts
 */

const CACHE = 'mph-v4';
const OFFLINE_PAGE = '/404.html';

/* Assets to pre-cache on install */
const PRECACHE = [
  '/',
  '/index.html',
  '/404.html',
  '/assets/css/style.css',
  '/assets/css/zuri-chat.css',
  '/assets/js/main.js',
  '/assets/js/svg-loader.js',
  '/assets/js/zuri-chat.js',
  '/assets/js/form-handler.js',
  '/assets/js/news-feed.js',
  '/assets/images/logo.png',
  '/assets/images/hero-bg.webp',
  '/assets/images/women-walking-resilience.jpg',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/site.webmanifest',
];

/* ── Install: pre-cache shell ───────────────────────────────────── */
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
});

/* ── Activate: prune old caches ─────────────────────────────────── */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch ───────────────────────────────────────────────────────── */
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  /* Skip non-GET and cross-origin (GA4, Web3Forms, EmailJS, etc.) */
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  /* Static assets → cache-first */
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(cacheFirst(request));
    return;
  }

  /* HTML pages → network-first (serve latest, fall back to cache/offline) */
  if (request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(networkFirst(request));
    return;
  }

  /* Everything else → stale-while-revalidate */
  e.respondWith(staleWhileRevalidate(request));
});

/* ── Strategies ─────────────────────────────────────────────────── */

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match(OFFLINE_PAGE);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  return cached || fetchPromise;
}
