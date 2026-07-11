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

// Resolve the session for every request (cookie -> KV).
app.use("*", sessionMiddleware);

// Health check.
app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));

// Public API.
app.route("/api/products", products);
app.route("/api/articles", articles);
app.route("/api/contact", contact);
app.route("/api/orders", orders); // POST public; GET checks session internally
app.route("/api/auth", authRoutes);

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

// Anything else that reached the Worker (i.e. not a static asset and not an
// API/admin route) is delegated to the static assets binding for a clean 404.
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
