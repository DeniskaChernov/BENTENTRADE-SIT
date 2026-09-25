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
  } catch (e) { /* immutable response headers — ignore */ }
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

// CRM UI.
app.get("/admin", (c) => c.html(ADMIN_HTML));
app.get("/admin/", (c) => c.html(ADMIN_HTML));
app.get("/admin/app.js", (c) =>
  new Response(ADMIN_APP_JS, {
    headers: { "content-type": "application/javascript; charset=utf-8", "cache-control": "no-cache" },
  }),
);

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

