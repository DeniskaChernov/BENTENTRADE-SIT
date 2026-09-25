/* ============================================================
   BENTENTRADE — Node server entry (Railway).
   Same Hono routes as the Cloudflare Worker, but running on Node
   with PostgreSQL + filesystem media, and serving the static site.
   ============================================================ */
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

if (typeof (process as any).loadEnvFile === "function") {
  try { (process as any).loadEnvFile(); } catch (_) {}
}


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
import reviews from "../worker/routes/reviews";
import { ADMIN_HTML } from "../worker/admin-ui";
import { ADMIN_APP_JS } from "../worker/admin-app";
import { applySecurityHeaders, applyCacheHeaders } from "../worker/security-headers";

import { buildEnv, migrate, seedIfEmpty } from "./runtime";

const app = new Hono();

app.use("*", async (c: Context, next: Next) => {
  await next();
  try {
    applySecurityHeaders(c.res.headers, c.req.path);
    applyCacheHeaders(c.res.headers, c.req.path);
  } catch (e) { /* immutable headers — ignore */ }
});

// Health check (always 200 — process is up; used by Railway before traffic switch).
app.get("/health", (c) => c.json({ ok: true, ts: Date.now() }));

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

// API health (includes DB readiness for monitoring).
app.get("/api/health", (c) => c.json({ ok: dbReady, ts: Date.now() }));

// Public settings (contact info, manager telegram, whatsapp, phone).
app.get("/api/settings", async (c: Context) => {
  const env: any = (c as any).env;
  const { results } = await env.DB.prepare(`SELECT key, value FROM settings`).all<{ key: string; value: string }>();
  const map: Record<string, string> = {
    phone: "+998 77 104 44 22",
    whatsapp: "998771044422",
    telegram: "bententradeuz",
    email: "hello@bententrade.uz",
  };
  for (const r of results || []) {
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
import { readFileSync, existsSync } from "node:fs";
let notFoundHtml = "";
try {
  if (existsSync("./404.html")) notFoundHtml = readFileSync("./404.html", "utf-8");
} catch (_) {}

const STATIC_ALLOW = /^\/(assets\/.+|data\/.+|[a-z0-9_.-]+\.html|favicon\.(?:ico|svg|png)|robots\.txt|sitemap\.xml|manifest\.json|manifest\.webmanifest|sw\.js)$/i;
app.use("*", async (c: Context, next: Next) => {
  const p = c.req.path;
  if (p === "/" || p === "/health" || STATIC_ALLOW.test(p)) return next();
  return c.notFound();
});
app.get("/", serveStatic({ path: "./index.html" }));
app.use("*", serveStatic({ root: "./" }));

app.notFound((c) => {
  if (notFoundHtml) return c.html(notFoundHtml, 404);
  return c.text("404 Not Found", 404);
});

// ------------------------------- boot -------------------------------
const ENV = buildEnv();
const port = Number(process.env.PORT || 8080);

async function boot() {
  // Listen first — Railway probes PORT during deploy; DB init must not block HTTP.
  serve({
    fetch: (req: Request) => app.fetch(req, ENV),
    port,
    // Bind all interfaces. Do NOT use process.env.HOSTNAME — Railway sets it to the container id.
    hostname: "0.0.0.0",
  }, (info) => {
    console.log(`Bententrade server on http://${info.address}:${info.port}`);
  });

  try {
    await migrate();
    const seeded = await seedIfEmpty();
    dbReady = true;
    console.log(seeded ? "[db] migrated + seeded" : "[db] migrated");
  } catch (e) {
    dbReady = false;
    console.error("[db] init failed (API returns 503, static site still served):", (e as Error).message);
  }
}

// Railway stops the previous container with SIGTERM on every redeploy (0s drain by default).
// Exit 0 so the old deploy is "Completed", not "Crashed" — avoids false crash emails.
function onShutdown(signal: string) {
  console.log(`[server] ${signal} received, exiting`);
  process.exit(0);
}
process.on("SIGTERM", () => onShutdown("SIGTERM"));
process.on("SIGINT", () => onShutdown("SIGINT"));

boot();
