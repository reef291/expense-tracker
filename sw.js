const CACHE_NAME = "expense-tracker-v3";
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

// network-first for the app's own files: always serve the freshest HTML/JS/CSS
// when there's a connection (a stale HTML+JS combo is worse than no cache at all
// — mismatched element IDs between an old page and new script throw and can
// silently break half the app), and only fall back to the cache when actually
// offline. "no-store" is required here, not optional: a plain fetch() still
// lets the browser's own HTTP cache silently answer from a stale disk copy of
// main.js/index.html without a network round-trip at all, which defeats the
// whole point of "network-first" right after a deploy. Cross-origin requests
// (geo/currency APIs, the ExcelJS CDN script) pass straight through untouched;
// they already fail gracefully offline on their own.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then((response) => {
        if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
