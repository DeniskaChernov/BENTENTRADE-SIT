/** Shared security headers for Worker and Node server. */
export function applySecurityHeaders(headers: Headers, path: string): void {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Permitted-Cross-Domain-Policies", "none");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  );
  headers.set("X-DNS-Prefetch-Control", "off");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  if (path.startsWith("/api")) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    headers.set("Pragma", "no-cache");
    return;
  }

  const isSensitivePage =
    path.startsWith("/admin") ||
    path === "/login.html" ||
    path === "/account.html" ||
    path === "/account" ||
    path === "/login";
  if (isSensitivePage) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
    headers.set("X-Frame-Options", "DENY");
  }

  // Content-Security-Policy (with frame-ancestors 'none' for admin and auth pages)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "connect-src 'self'",
    isSensitivePage ? "frame-ancestors 'none'" : "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];

  headers.set("Content-Security-Policy", cspDirectives.join("; "));
}

export function applyCacheHeaders(headers: Headers, path: string): void {
  const isSensitivePage =
    path.startsWith("/admin") ||
    path === "/login.html" ||
    path === "/account.html" ||
    path === "/account" ||
    path === "/login";
  if (isSensitivePage || path.startsWith("/api")) {
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    headers.set("Pragma", "no-cache");
    return;
  }
  if (path === "/sw.js") {
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    headers.set("Pragma", "no-cache");
    return;
  }
  if (path.startsWith("/assets/")) {
    if (path.endsWith(".js") || path.endsWith(".css")) {
      headers.set("Cache-Control", "public, max-age=0, must-revalidate");
    } else {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    }
  } else if (path.startsWith("/data/")) {
    headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  } else if (path === "/" || path.endsWith(".html") || path.startsWith("/catalog/")) {
    headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
  } else if (path === "/robots.txt" || path === "/sitemap.xml") {
    headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  }
}
