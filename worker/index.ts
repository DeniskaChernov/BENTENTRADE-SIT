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
  await next();
  try {
    applySecurityHeaders(c.res.headers, c.req.path);
    applyCacheHeaders(c.res.headers, c.req.path);
  } catch (e) { /* immutable response headers - ignore */ }
});

app.onError((err, c) => {
  console.error("Worker unhandled error:", err);
  return c.json({ error: "server_error", message: err.message }, 500);
});

// Resolve the session for every request (cookie -> KV).
app.use("*", sessionMiddleware);

// Health check.
app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));

// Public settings (contact info, manager telegram, whatsapp, phone).
app.get("/api/settings", async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT key, value FROM settings`).all<{ key: string; value: string }>();
  const map: Record<string, string> = {
    phone: "+998 77 104 44 22",
    whatsapp: "998771044422",
    telegram: "bententradeuz",
    email: "hello@bententrade.uz",
  };
  for (const r of results) {
    if (r.key && r.value) map[r.key] = r.value;
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

