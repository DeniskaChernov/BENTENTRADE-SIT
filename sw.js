/* ============================================================
   BENTENTRADE — Service Worker (PWA Offline Cache)
   Version: 20260922-fonts
   ============================================================ */
const CACHE_NAME = "btt-shell-20260926-v2";
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

// Fetch: network-first for documents, stale-while-revalidate for static assets
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

  // Static assets (CSS, JS, images, fonts): Cache-first with background revalidation
  if (
    url.pathname.startsWith("/assets/") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes.status === 200) {
              const clone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return networkRes;
          })
          .catch(() => null);

        return cached || fetchPromise;
      })
    );
  }
});
