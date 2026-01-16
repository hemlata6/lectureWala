// Service Worker with proper cache management for development
const CACHE_NAME = `classio-quiz-v${Date.now()}`; // Dynamic cache name to prevent old cache issues
const urlsToCache = [
  '/',
  '/manifest.json'
  // Removed static assets to prevent caching during development
];

self.addEventListener('install', (event) => {
  // Skip waiting to activate new service worker immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // For development: Always fetch from network for JS/CSS files
  if (event.request.url.includes('/static/') || 
      event.request.url.includes('.js') || 
      event.request.url.includes('.css') ||
      event.request.url.includes('hot-update')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  // Take control of all clients immediately
  event.waitUntil(
    Promise.all([
      // Clear all old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control immediately
      self.clients.claim()
    ])
  );
});