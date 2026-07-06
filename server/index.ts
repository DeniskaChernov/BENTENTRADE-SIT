/* ============================================================
   BENTENTRADE — Node server entry (Railway).
   Same Hono routes as the Cloudflare Worker, but running on Node
   with PostgreSQL + filesystem media, and serving the static site.
   ============================================================ */
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

import type { Context, Next } from "hono";
import { sessionMiddleware, requireAuth } from "../worker/auth";

import products from "../worker/routes/products";
import articles from "../worker/routes/articles";
import contact from "../worker/routes/contact";
import orders from "../worker/routes/orders";
import authRoutes from "../worker/routes/authRoutes";
import account from "../worker/routes/account";
import admin from "../worker/routes/admin";
import media from "../worker/routes/media";
import { ADMIN_HTML } from "../worker/admin-ui";
import { ADMIN_APP_JS } from "../worker/admin-app";

import { buildEnv, migrate, seedIfEmpty } from "./runtime";

const app = new Hono();

// Baseline security headers on every response.
app.use("*", async (c: Context, next: Next) => {
  await next();
  try {
    const h = c.res.headers;
    h.set("X-Content-Type-Options", "nosniff");
    h.set("X-Frame-Options", "SAMEORIGIN");
    h.set("Referrer-Policy", "strict-origin-when-cross-origin");
    h.set("X-Permitted-Cross-Domain-Policies", "none");
    const p = c.req.path;
    if (p.startsWith("/api") || p.startsWith("/admin")) h.set("X-Robots-Tag", "noindex, nofollow");
  } catch (e) { /* immutable headers — ignore */ }
});

// Flipped to true once the DB has migrated. Until then API calls (except the
// health check) return a clean 503 instead of throwing on every query.
let dbReady = false;
app.use("/api/*", async (c: Context, next: Next) => {
  if (c.req.path === "/api/health") return next();
  if (!dbReady) return c.json({ error: "db_unavailable" }, 503);
  return next();
});

// Sessions only where they matter (API), so static assets stay cheap.
app.use("/api/*", sessionMiddleware);

// Health check (always available so the platform can probe the process).
app.get("/api/health", (c) => c.json({ ok: dbReady, ts: Date.now() }));

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

// Media (filesystem-backed R2).
app.route("/media", media);

// CRM UI.
app.get("/admin", (c) => c.html(ADMIN_HTML));
app.get("/admin/", (c) => c.html(ADMIN_HTML));
app.get("/admin/app.js", (c) =>
  new Response(ADMIN_APP_JS, {
    headers: { "content-type": "application/javascript; charset=utf-8", "cache-control": "no-cache" },
  }),
);

// ---- static site (only expose front-end files, never server code) ----
const STATIC_ALLOW = /^\/(assets\/.+|[a-z0-9_.-]+\.html|favicon\.(?:ico|svg)|robots\.txt|sitemap\.xml|manifest\.webmanifest)$/i;
app.use("*", async (c: Context, next: Next) => {
  const p = c.req.path;
  if (p === "/" || STATIC_ALLOW.test(p)) return next();
  return c.notFound();
});
app.get("/", serveStatic({ path: "./index.html" }));
app.use("*", serveStatic({ root: "./" }));

// ------------------------------- boot -------------------------------
const ENV = buildEnv();
const port = Number(process.env.PORT || 8080);

async function boot() {
  try {
    await migrate();
    const seeded = await seedIfEmpty();
    dbReady = true;
    console.log(seeded ? "[db] migrated + seeded" : "[db] migrated");
  } catch (e) {
    dbReady = false;
    console.error("[db] init failed (API returns 503, static site still served):", (e as Error).message);
  }
  serve({ fetch: (req: Request) => app.fetch(req, ENV), port }, (info) => {
    console.log(`Bententrade server on http://localhost:${info.port}`);
  });
}

boot();
