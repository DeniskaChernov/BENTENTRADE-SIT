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
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  if (path.startsWith("/api") || path.startsWith("/admin")) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
    return;
  }

  // Public site: CSP allows inline boot script (theme FOUC) and Google Fonts.
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  );
}

export function applyCacheHeaders(headers: Headers, path: string): void {
  if (path.startsWith("/assets/")) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  } else if (path.startsWith("/data/")) {
    headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  } else if (path === "/" || path.endsWith(".html")) {
    headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
  } else if (path === "/robots.txt" || path === "/sitemap.xml") {
    headers.set("Cache-Control", "public, max-age=86400");
  }
}
