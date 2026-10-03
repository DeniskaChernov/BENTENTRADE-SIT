/* ============================================================
   BENTENTRADE - Service Worker (PWA Offline Cache)
   Version: 20260928-v1
   ============================================================ */
const CACHE_NAME = "btt-shell-20261002-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/catalog.html",
  "/horeca.html",
  "/contacts.html",
  "/404.html",
  "/manifest.json",
  "/assets/styles.css",
  "/assets/pages.css",
  "/assets/horeca.css",
  "/assets/help.css",
  "/assets/site.js",
  "/assets/cart.js",
  "/assets/i18n.js",
  "/assets/placeholder.svg",
  "/assets/fonts/soyuz-grotesk-bold.woff",
  "/assets/btt-logo.png",
  "/assets/favicon.png"
];

// Install: pre-cache critical shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        /* fail-safe if offline or single asset fails */
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up older cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k.startsWith("btt-"))
          .map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for documents and scripts/styles, cache-first for immutable media/fonts
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET and all API/admin endpoints
  if (req.method !== "GET" || url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) {
    return;
  }

  // Navigation (HTML pages): Network-first with cache fallback
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            return cached || caches.match("/index.html");
          });
        })
    );
    return;
  }

  const isScriptOrStyle =
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".json");

  // Scripts, styles and data: Network-first so prices and updates are never stale
  if (isScriptOrStyle && url.pathname.startsWith("/assets/")) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Media, images, fonts: Cache-first with network fallback
  if (
    url.pathname.startsWith("/assets/") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        return (
          cached ||
          fetch(req).then((networkRes) => {
            if (networkRes.status === 200) {
              const clone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return networkRes;
          })
        );
      })
    );
  }
});
