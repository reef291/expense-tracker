const CACHE_NAME = "expense-tracker-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/main.js",
  "./js/categories.js",
  "./js/config.js",
  "./js/countries.js",
  "./js/currency.js",
  "./js/expenses.js",
  "./js/export.js",
  "./js/geo.js",
  "./js/photo.js",
  "./js/remote.js",
  "./js/split.js",
  "./js/storage.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// stale-while-revalidate for the app's own files: instant load (works offline),
// while quietly refreshing the cache in the background so edits still show up
// next launch — no manual cache-version bump needed for normal content changes.
// cross-origin requests (geo/currency APIs, the ExcelJS CDN script) pass straight
// through untouched; they already fail gracefully offline on their own.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
