import { Hono } from "hono";
import type { Env, Variables } from "./types";
import { sessionMiddleware, requireAuth } from "./auth";

import products from "./routes/products";
import articles from "./routes/articles";
import contact from "./routes/contact";
import orders from "./routes/orders";
import authRoutes from "./routes/authRoutes";
import account from "./routes/account";
import admin from "./routes/admin";
import media from "./routes/media";
import reviews from "./routes/reviews";
import { ADMIN_HTML } from "./admin-ui";
import { ADMIN_APP_JS } from "./admin-app";
import { applySecurityHeaders, applyCacheHeaders } from "./security-headers";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use("*", async (c, next) => {
  const path = c.req.path;
  // Block directory traversal or hidden/dot files (.env, .git, etc.)
  if (path.startsWith("/.") || path.includes("/.")) {
    return c.text("Not found", 404);
  }
  // Block sensitive file extension probes
  if (/\.(sql|db|sqlite|env|bak|log|conf|config|pem|key|crt|cert|sh|ps1|ts|yml|yaml|ini|lock|dist)$/i.test(path)) {
    return c.text("Not found", 404);
  }
  // Block common CMS/admin/scanner probes
  if (/(?:wp-admin|wp-login|wp-content|wp-includes|xmlrpc\.php|phpmyadmin|cgi-bin|\.aws|\.svn|actuator|composer\.(?:json|lock)|package-lock\.json|Dockerfile|web\.config|server-status)/i.test(path)) {
    return c.text("Not found", 404);
  }
  await next();
  try {
    applySecurityHeaders(c.res.headers, c.req.path);
    applyCacheHeaders(c.res.headers, c.req.path);
  } catch {
    const newHeaders = new Headers(c.res.headers);
    applySecurityHeaders(newHeaders, c.req.path);
    applyCacheHeaders(newHeaders, c.req.path);
    c.res = new Response(c.res.body, {
      status: c.res.status,
      statusText: c.res.statusText,
      headers: newHeaders,
    });
  }
});

// CSRF & Cross-Origin Mutation Protection & Payload Limiting for API requests
app.use("/api/*", async (c, next) => {
  const method = c.req.method.toUpperCase();
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    // Payload size limiting (defense against memory exhaustion / DOS)
    const contentLength = c.req.header("content-length");
    if (contentLength) {
      const len = parseInt(contentLength, 10);
      if (!isNaN(len)) {
        // Media uploads in admin allow up to 10MB; all other API mutations capped at 512KB
        const maxBytes = c.req.path.startsWith("/api/admin/media") ? 10 * 1024 * 1024 : 512 * 1024;
        if (len > maxBytes) {
          return c.json({ error: "payload_too_large", maxBytes }, 413);
        }
      }
    }

    const origin = c.req.header("origin");
    if (origin) {
      const allowedHosts = new Set([
        "bententrade.uz",
        "www.bententrade.uz",
        "localhost",
        "127.0.0.1",
      ]);
      if (c.env.SITE_ORIGIN) {
        try { allowedHosts.add(new URL(c.env.SITE_ORIGIN).host); } catch {}
      }
      try {
        const originHost = new URL(origin).host;
        const isAllowed =
          allowedHosts.has(originHost) ||
          originHost.endsWith(".workers.dev") ||
          originHost.startsWith("localhost:") ||
          originHost.startsWith("127.0.0.1:");
        if (!isAllowed) {
          return c.json({ error: "forbidden_origin", message: "Cross-site request blocked" }, 403);
        }
      } catch {
        return c.json({ error: "bad_origin" }, 400);
      }
    }
  }
  await next();
});

app.onError((err, c) => {
  console.error("Worker unhandled error:", err);
  return c.json({ error: "server_error", message: err.message }, 500);
});

// Resolve the session for every request (cookie -> KV).
app.use("*", sessionMiddleware);

// Health check.
app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));

// Strict whitelist of public settings keys exposed to the storefront
const PUBLIC_SETTINGS_KEYS = new Set([
  "brand",
  "phone",
  "whatsapp",
  "telegram",
  "email",
  "working_hours",
  "address",
  "delivery_terms",
]);

// Public settings (contact info, manager telegram, whatsapp, phone).
app.get("/api/settings", async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT key, value FROM settings`).all<{ key: string; value: string }>();
  const map: Record<string, string> = {
    brand: "BTT - мебель для дома и сада",
    phone: "+998 77 104 44 22",
    whatsapp: "998771044422",
    telegram: "bententradeuz",
    email: "hello@bententrade.uz",
  };
  for (const r of results) {
    if (r.key && r.value && PUBLIC_SETTINGS_KEYS.has(r.key)) {
      map[r.key] = r.value;
    }
  }
  return c.json({ ok: true, settings: map });
});

// Public API.
app.route("/api/products", products);
app.route("/api/articles", articles);
app.route("/api/contact", contact);
app.route("/api/orders", orders); // POST public; GET checks session internally
app.route("/api/auth", authRoutes);
app.route("/api/reviews", reviews);


// Authenticated customer API.
app.use("/api/account/*", requireAuth);
app.route("/api/account", account);

// Admin CRM API (guarded inside the router).
app.route("/api/admin", admin);

// R2 media.
app.route("/media", media);

// CRM UI (strictly guarded for authenticated administrators only).
app.get("/admin", (c) => {
  const s = c.get("session");
  if (!s || s.role !== "admin") {
    return c.redirect("/login.html?redirect=/admin", 302);
  }
  return c.html(ADMIN_HTML, 200, {
    "x-robots-tag": "noindex, nofollow",
  });
});
app.get("/admin/", (c) => {
  const s = c.get("session");
  if (!s || s.role !== "admin") {
    return c.redirect("/login.html?redirect=/admin", 302);
  }
  return c.html(ADMIN_HTML, 200, {
    "x-robots-tag": "noindex, nofollow",
  });
});
app.get("/admin/app.js", (c) => {
  const s = c.get("session");
  if (!s || s.role !== "admin") {
    return c.text("Unauthorized", 401, {
      "x-robots-tag": "noindex, nofollow",
    });
  }
  return new Response(ADMIN_APP_JS, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-cache",
      "x-robots-tag": "noindex, nofollow",
    },
  });
});

const VALID_PRODUCT_SLUGS = new Set([
  "stul-vertex", "stul-corda", "stul-roero", "stul-noero", "stul-todo", "stul-jardin",
  "stul-lira", "kreslo-como", "stol-taper-rotang-80", "stol-vertex-d90",
  "stol-taper-rotang-135", "stol-taper-80", "stol-vertex-80", "stol-taper-135", "stol-corda-135"
]);

const PRODUCT_ALIASES: Record<string, string> = {
  p1: "stul-vertex",
  p2: "stul-corda",
  p3: "stul-roero",
  p4: "stul-noero",
  p5: "stul-todo",
  p6: "stul-jardin",
  p7: "stul-lira",
  p8: "kreslo-como",
  p9: "stol-taper-rotang-80",
  p10: "stol-vertex-d90",
  p11: "stol-taper-rotang-135",
  p12: "stol-taper-80",
  p13: "stol-vertex-80",
  p14: "stol-taper-135",
  p15: "stol-corda-135",
};

// Clean PDP URLs: /catalog/:slug -> serves product.html with status 200
app.get("/catalog/:slug", async (c) => {
  const slug = c.req.param("slug");

  // If a legacy alias was requested, 301 redirect to canonical slug
  if (PRODUCT_ALIASES[slug]) {
    return c.redirect(`/catalog/${PRODUCT_ALIASES[slug]}`, 301);
  }

  if (VALID_PRODUCT_SLUGS.has(slug)) {
    const url = new URL("/product", c.req.url);
    url.searchParams.set("id", slug);
    const res = await c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("Location") || "/product";
      const followUrl = new URL(loc, c.req.url);
      const followedRes = await c.env.ASSETS.fetch(new Request(followUrl.toString(), c.req.raw));
      return new Response(followedRes.body, {
        status: 200,
        headers: {
          ...Object.fromEntries(followedRes.headers.entries()),
          "content-type": "text/html; charset=utf-8",
        },
      });
    }
    return new Response(res.body, {
      status: 200,
      headers: {
        ...Object.fromEntries(res.headers.entries()),
        "content-type": "text/html; charset=utf-8",
      },
    });
  }
  const notFoundUrl = new URL("/404.html", c.req.url);
  const notFoundRes = await c.env.ASSETS.fetch(new Request(notFoundUrl.toString(), c.req.raw));
  return new Response(notFoundRes.body, {
    status: 404,
    headers: {
      ...Object.fromEntries(notFoundRes.headers.entries()),
      "content-type": "text/html; charset=utf-8",
    },
  });
});

// Legacy redirect: /product?id=:slug -> /catalog/:slug
app.get("/product", (c) => {
  const id = c.req.query("id");
  if (id) {
    if (PRODUCT_ALIASES[id]) {
      return c.redirect(`/catalog/${PRODUCT_ALIASES[id]}`, 301);
    }
    if (VALID_PRODUCT_SLUGS.has(id)) {
      return c.redirect(`/catalog/${id}`, 301);
    }
  }
  return c.redirect("/catalog.html", 301);
});

// Legacy article redirects
const ARTICLE_REDIRECTS: Record<string, string> = {
  "/kashpo-iz-iskusstvennogo-rotanga": "/article.html?slug=kashpo-iz-iskusstvennogo-rotanga",
  "/korziny-sunduki-rotang": "/article.html?slug=korziny-sunduki-rotang",
  "/palitra-tsvetov-rotanga-bententrade": "/article.html?slug=palitra-tsvetov-rotanga-bententrade",
};

for (const [fromPath, toPath] of Object.entries(ARTICLE_REDIRECTS)) {
  app.get(fromPath, (c) => c.redirect(toPath, 301));
}

// HoReCa landing page
app.get("/horeca", async (c) => {
  const url = new URL("/horeca.html", c.req.url);
  const res = await c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
  return new Response(res.body, {
    status: 200,
    headers: {
      ...Object.fromEntries(res.headers.entries()),
      "content-type": "text/html; charset=utf-8",
    },
  });
});

// Anything else that reached the Worker is delegated to the static assets binding.
// On 404 for non-API routes, serve the branded 404.html.
app.all("*", async (c) => {
  const res = await c.env.ASSETS.fetch(c.req.raw);
  if (res.status === 404 && !c.req.path.startsWith("/api/")) {
    const notFoundUrl = new URL("/404.html", c.req.url);
    const notFoundRes = await c.env.ASSETS.fetch(new Request(notFoundUrl.toString(), c.req.raw));
    if (notFoundRes.ok) {
      return new Response(notFoundRes.body, {
        status: 404,
        headers: notFoundRes.headers,
      });
    }
  }
  return res;
});

export default app;

