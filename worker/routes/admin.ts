import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAdmin } from "../auth";
import { str } from "../util";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Everything under /api/admin requires an admin session.
app.use("*", requireAdmin);

const LANGS = ["ru", "uz", "en"] as const;

/* =============================== products ============================== */

app.get("/products", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT p.id, p.category, p.price_now, p.price_old, p.active, p.sort, i.name
     FROM products p LEFT JOIN product_i18n i ON i.product_id = p.id AND i.lang = 'ru'
     ORDER BY p.sort ASC, p.id ASC`,
  ).all();
  return c.json({ products: results });
});

app.get("/products/:id", async (c) => {
  const id = c.req.param("id");
  const product = await c.env.DB.prepare(`SELECT * FROM products WHERE id = ?`).bind(id).first();
  if (!product) return c.json({ error: "not_found" }, 404);
  const { results } = await c.env.DB.prepare(
    `SELECT lang, name, category_label, description, sizes, specs FROM product_i18n WHERE product_id = ?`,
  )
    .bind(id)
    .all();
  const media = await c.env.DB.prepare(
    `SELECT id, key, alt, sort FROM media WHERE product_id = ? ORDER BY sort`,
  )
    .bind(id)
    .all();
  return c.json({ product, i18n: results, media: media.results });
});

async function upsertProductI18n(c: any, id: string, i18n: any) {
  if (!i18n) return;
  const stmt = c.env.DB.prepare(
    `INSERT INTO product_i18n (product_id, lang, name, category_label, description, sizes, specs)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(product_id, lang) DO UPDATE SET
       name = excluded.name, category_label = excluded.category_label,
       description = excluded.description, sizes = excluded.sizes, specs = excluded.specs`,
  );
  const batch = [];
  for (const lang of LANGS) {
    const t = i18n[lang];
    if (!t) continue;
    const sizes = Array.isArray(t.sizes) ? JSON.stringify(t.sizes) : str(t.sizes, 500) || "[]";
    const specs = typeof t.specs === "object" && t.specs ? JSON.stringify(t.specs) : str(t.specs, 1000) || "{}";
    batch.push(stmt.bind(id, lang, str(t.name, 200), str(t.category_label, 120), str(t.description, 4000), sizes, specs));
  }
  if (batch.length) await c.env.DB.batch(batch);
}

app.post("/products", async (c) => {
  const b = await c.req.json().catch(() => ({}));
  const id = str(b.id, 40);
  if (!id) return c.json({ error: "id_required" }, 422);
  const exists = await c.env.DB.prepare(`SELECT id FROM products WHERE id = ?`).bind(id).first();
  if (exists) return c.json({ error: "id_taken" }, 409);
  await c.env.DB.prepare(
    `INSERT INTO products (id, category, look, price_now, price_old, default_size, active, sort)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      str(b.category, 40) || "furniture",
      str(b.look, 40),
      Math.max(0, Math.floor(Number(b.price_now) || 0)),
      Math.max(0, Math.floor(Number(b.price_old) || 0)),
      Math.max(0, Math.floor(Number(b.default_size) || 0)),
      b.active === 0 ? 0 : 1,
      Math.floor(Number(b.sort) || 0),
    )
    .run();
  await upsertProductI18n(c, id, b.i18n);
  return c.json({ ok: true, id });
});

app.put("/products/:id", async (c) => {
  const id = c.req.param("id");
  const b = await c.req.json().catch(() => ({}));
  const r = await c.env.DB.prepare(
    `UPDATE products SET category = ?, look = ?, price_now = ?, price_old = ?, default_size = ?, active = ?, sort = ? WHERE id = ?`,
  )
    .bind(
      str(b.category, 40) || "furniture",
      str(b.look, 40),
      Math.max(0, Math.floor(Number(b.price_now) || 0)),
      Math.max(0, Math.floor(Number(b.price_old) || 0)),
      Math.max(0, Math.floor(Number(b.default_size) || 0)),
      b.active === 0 ? 0 : 1,
      Math.floor(Number(b.sort) || 0),
      id,
    )
    .run();
  await upsertProductI18n(c, id, b.i18n);
  return c.json({ ok: true, updated: r.meta.changes });
});

app.delete("/products/:id", async (c) => {
  const id = c.req.param("id");
  const r = await c.env.DB.prepare(`DELETE FROM products WHERE id = ?`).bind(id).run();
  return c.json({ ok: true, deleted: r.meta.changes });
});

/* ================================ orders =============================== */

app.get("/orders", async (c) => {
  const status = c.req.query("status");
  const sql = status
    ? `SELECT * FROM orders WHERE status = ? ORDER BY id DESC`
    : `SELECT * FROM orders ORDER BY id DESC`;
  const q = status ? c.env.DB.prepare(sql).bind(status) : c.env.DB.prepare(sql);
  const { results } = await q.all();
  return c.json({ orders: results });
});

app.get("/orders/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const order = await c.env.DB.prepare(`SELECT * FROM orders WHERE id = ?`).bind(id).first();
  if (!order) return c.json({ error: "not_found" }, 404);
  const items = await c.env.DB.prepare(`SELECT * FROM order_items WHERE order_id = ?`).bind(id).all();
  return c.json({ order, items: items.results });
});

const ORDER_STATUSES = ["new", "processing", "shipped", "delivered", "cancelled"];
app.put("/orders/:id/status", async (c) => {
  const id = Number(c.req.param("id"));
  const b = await c.req.json().catch(() => ({}));
  const status = str(b.status, 20);
  if (!ORDER_STATUSES.includes(status)) return c.json({ error: "bad_status" }, 422);
  const r = await c.env.DB.prepare(`UPDATE orders SET status = ? WHERE id = ?`).bind(status, id).run();
  return c.json({ ok: true, updated: r.meta.changes });
});

/* =========================== contact requests ========================== */

app.get("/requests", async (c) => {
  const status = c.req.query("status");
  const sql = status
    ? `SELECT * FROM contact_requests WHERE status = ? ORDER BY id DESC`
    : `SELECT * FROM contact_requests ORDER BY id DESC`;
  const q = status ? c.env.DB.prepare(sql).bind(status) : c.env.DB.prepare(sql);
  const { results } = await q.all();
  return c.json({ requests: results });
});

app.put("/requests/:id/status", async (c) => {
  const id = Number(c.req.param("id"));
  const b = await c.req.json().catch(() => ({}));
  const status = str(b.status, 20) || "new";
  const r = await c.env.DB.prepare(`UPDATE contact_requests SET status = ? WHERE id = ?`).bind(status, id).run();
  return c.json({ ok: true, updated: r.meta.changes });
});

/* =============================== articles ============================== */

app.get("/articles", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT a.id, a.slug, a.status, a.published_at, i.title
     FROM articles a LEFT JOIN article_i18n i ON i.article_id = a.id AND i.lang = 'ru'
     ORDER BY a.id DESC`,
  ).all();
  return c.json({ articles: results });
});

app.get("/articles/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const article = await c.env.DB.prepare(`SELECT * FROM articles WHERE id = ?`).bind(id).first();
  if (!article) return c.json({ error: "not_found" }, 404);
  const { results } = await c.env.DB.prepare(
    `SELECT lang, title, excerpt, body FROM article_i18n WHERE article_id = ?`,
  )
    .bind(id)
    .all();
  return c.json({ article, i18n: results });
});

async function upsertArticleI18n(c: any, id: number, i18n: any) {
  if (!i18n) return;
  const stmt = c.env.DB.prepare(
    `INSERT INTO article_i18n (article_id, lang, title, excerpt, body) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(article_id, lang) DO UPDATE SET
       title = excluded.title, excerpt = excluded.excerpt, body = excluded.body`,
  );
  const batch = [];
  for (const lang of LANGS) {
    const t = i18n[lang];
    if (!t) continue;
    batch.push(stmt.bind(id, lang, str(t.title, 300), str(t.excerpt, 600), str(t.body, 40000)));
  }
  if (batch.length) await c.env.DB.batch(batch);
}

app.post("/articles", async (c) => {
  const b = await c.req.json().catch(() => ({}));
  const slug = str(b.slug, 120).replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  if (!slug) return c.json({ error: "slug_required" }, 422);
  const status = b.status === "published" ? "published" : "draft";
  const publishedAt = status === "published" ? "datetime('now')" : "NULL";
  const ins = await c.env.DB.prepare(
    `INSERT INTO articles (slug, cover_media, status, published_at) VALUES (?, ?, ?, ${publishedAt})`,
  )
    .bind(slug, str(b.cover_media, 300) || null, status)
    .run();
  const id = ins.meta.last_row_id as number;
  await upsertArticleI18n(c, id, b.i18n);
  return c.json({ ok: true, id });
});

app.put("/articles/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const b = await c.req.json().catch(() => ({}));
  const status = b.status === "published" ? "published" : "draft";
  const slug = str(b.slug, 120).replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  // set published_at when moving to published for the first time
  await c.env.DB.prepare(
    `UPDATE articles SET slug = ?, cover_media = ?, status = ?, updated_at = datetime('now'),
       published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN datetime('now') ELSE published_at END
     WHERE id = ?`,
  )
    .bind(slug, str(b.cover_media, 300) || null, status, status, id)
    .run();
  await upsertArticleI18n(c, id, b.i18n);
  return c.json({ ok: true });
});

app.delete("/articles/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const r = await c.env.DB.prepare(`DELETE FROM articles WHERE id = ?`).bind(id).run();
  return c.json({ ok: true, deleted: r.meta.changes });
});

/* ================================ media ================================ */

app.get("/media", async (c) => {
  const productId = c.req.query("product_id");
  const { results } = productId
    ? await c.env.DB.prepare(
        `SELECT id, key, product_id, article_id, alt, created_at FROM media WHERE product_id = ? ORDER BY id DESC`,
      )
        .bind(productId)
        .all()
    : await c.env.DB.prepare(
        `SELECT id, key, product_id, article_id, alt, created_at FROM media ORDER BY id DESC LIMIT 200`,
      ).all();
  return c.json({ media: results });
});

app.post("/media", async (c) => {
  const form = await c.req.formData();
  const raw = form.get("file") as unknown as File | string | null;
  if (!raw || typeof raw === "string") return c.json({ error: "file_required" }, 422);
  const file: File = raw;
  const productId = str(form.get("product_id"), 40) || null;
  const articleId = form.get("article_id") ? Number(form.get("article_id")) : null;
  const alt = str(form.get("alt"), 200);
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const scope = productId ? `products/${productId}` : articleId ? `articles/${articleId}` : "misc";
  const key = `${scope}/${crypto.randomUUID()}.${ext}`;
  await c.env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });
  const r = await c.env.DB.prepare(
    `INSERT INTO media (key, product_id, article_id, alt, sort) VALUES (?, ?, ?, ?, 0)`,
  )
    .bind(key, productId, articleId, alt)
    .run();
  return c.json({ ok: true, id: r.meta.last_row_id, key, url: `/media/${key}` });
});

app.delete("/media/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const row = await c.env.DB.prepare(`SELECT key FROM media WHERE id = ?`).bind(id).first<{ key: string }>();
  if (row) await c.env.MEDIA.delete(row.key).catch(() => {});
  const r = await c.env.DB.prepare(`DELETE FROM media WHERE id = ?`).bind(id).run();
  return c.json({ ok: true, deleted: r.meta.changes });
});

/* =============================== settings ============================== */

app.get("/settings", async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT key, value FROM settings`).all<{ key: string; value: string }>();
  const map: Record<string, string> = {};
  for (const r of results) map[r.key] = r.value;
  return c.json({ settings: map });
});

app.put("/settings", async (c) => {
  const b = await c.req.json().catch(() => ({}));
  const entries = Object.entries(b || {}).slice(0, 50);
  const stmt = c.env.DB.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  );
  if (entries.length) {
    await c.env.DB.batch(entries.map(([k, v]) => stmt.bind(str(k, 60), str(v, 2000))));
  }
  return c.json({ ok: true, saved: entries.length });
});

/* ============================== dashboard ============================== */

app.get("/stats", async (c) => {
  const q = async (sql: string) => (await c.env.DB.prepare(sql).first<{ n: number }>())?.n ?? 0;
  return c.json({
    orders: await q(`SELECT COUNT(*) n FROM orders`),
    ordersNew: await q(`SELECT COUNT(*) n FROM orders WHERE status = 'new'`),
    requests: await q(`SELECT COUNT(*) n FROM contact_requests`),
    requestsNew: await q(`SELECT COUNT(*) n FROM contact_requests WHERE status = 'new'`),
    products: await q(`SELECT COUNT(*) n FROM products`),
    articles: await q(`SELECT COUNT(*) n FROM articles`),
    users: await q(`SELECT COUNT(*) n FROM users`),
  });
});

export default app;
