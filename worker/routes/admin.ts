import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAdmin } from "../auth";
import { str } from "../util";
import { sendSms, notifyOrderSms } from "../sms";
import { testTelegram } from "../telegram";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Everything under /api/admin requires an admin session.
app.use("*", requireAdmin);

const LANGS = ["ru", "uz", "en"] as const;

export const ALLOWED_AVAILABILITIES = new Set([
  "unknown",
  "in_stock",
  "low_stock",
  "out_of_stock",
  "on_request",
]);

export const ALLOWED_PRODUCT_TYPES = new Set([
  "simple",
  "bundle",
  "material",
]);

export const ALLOWED_UNITS = new Set([
  "pcs",
  "set",
  "kg",
]);

function validateProductSlug(slug: string): string | null {
  if (!slug) return "id_required";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "invalid_slug_format";
  }
  if (/^p\d+$/i.test(slug)) {
    return "legacy_id_not_allowed";
  }
  return null;
}

/* =============================== categories ============================= */

async function upsertCategoryI18n(c: any, categoryId: number, i18n: any, fallbackName: string) {
  const stmt = c.env.DB.prepare(
    `INSERT INTO category_i18n (category_id, lang, name, description, seo_title, seo_description)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(category_id, lang) DO UPDATE SET
       name = excluded.name, description = excluded.description,
       seo_title = excluded.seo_title, seo_description = excluded.seo_description`
  );
  const batch = [];
  for (const lang of LANGS) {
    const t = i18n && i18n[lang];
    const name = (t && str(t.name, 120)) || fallbackName;
    const desc = (t && str(t.description, 1000)) || null;
    const seoTitle = (t && str(t.seo_title, 255)) || null;
    const seoDesc = (t && str(t.seo_description, 500)) || null;
    batch.push(stmt.bind(categoryId, lang, name, desc, seoTitle, seoDesc));
  }
  if (batch.length) await c.env.DB.batch(batch);
}

app.get("/categories", async (c) => {
  const sql = `
    SELECT c.id, c.slug, c.parent_id, c.sort, c.active, c.image, c.created_at, c.updated_at,
           (SELECT COUNT(*) FROM products p WHERE p.category = c.slug) AS product_count
    FROM categories c
    ORDER BY c.sort ASC, c.id ASC
  `;
  const { results: cats } = await c.env.DB.prepare(sql).all<Record<string, unknown>>();
  const { results: i18nRows } = await c.env.DB.prepare(
    `SELECT category_id, lang, name, description, seo_title, seo_description FROM category_i18n`
  ).all<{ category_id: number; lang: string; name: string; description: string; seo_title: string; seo_description: string }>();

  const i18nByCat = new Map<number, Record<string, unknown>>();
  for (const r of i18nRows) {
    let map = i18nByCat.get(r.category_id);
    if (!map) {
      map = {};
      i18nByCat.set(r.category_id, map);
    }
    map[r.lang] = r;
  }

  const list = cats.map((cat) => ({
    ...cat,
    i18n: i18nByCat.get(Number(cat.id)) || {},
  }));

  return c.json({ categories: list });
});

app.post("/categories", async (c) => {
  const b = await c.req.json().catch(() => ({}));
  const slug = str(b.slug, 60).toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");
  if (!slug) return c.json({ error: "slug_required" }, 422);

  const exists = await c.env.DB.prepare(`SELECT id FROM categories WHERE slug = ?`).bind(slug).first();
  if (exists) return c.json({ error: "slug_taken" }, 409);

  const parentId = b.parent_id ? Number(b.parent_id) : null;
  const sort = Math.floor(Number(b.sort) || 0);
  const active = b.active === 0 || b.active === false ? 0 : 1;
  const image = str(b.image, 300) || null;

  const ins = await c.env.DB.prepare(
    `INSERT INTO categories (slug, parent_id, active, sort, image) VALUES (?, ?, ?, ?, ?)`
  ).bind(slug, parentId, active, sort, image).run();

  const catId = ins.meta.last_row_id as number;
  await upsertCategoryI18n(c, catId, b.i18n, slug);
  return c.json({ ok: true, id: catId, slug });
});

app.put("/categories/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const b = await c.req.json().catch(() => ({}));
  const slug = str(b.slug, 60).toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");
  if (!slug) return c.json({ error: "slug_required" }, 422);

  const parentId = b.parent_id ? Number(b.parent_id) : null;
  const sort = Math.floor(Number(b.sort) || 0);
  const active = b.active === 0 || b.active === false ? 0 : 1;
  const image = str(b.image, 300) || null;

  await c.env.DB.prepare(
    `UPDATE categories SET slug = ?, parent_id = ?, active = ?, sort = ?, image = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(slug, parentId, active, sort, image, id).run();

  await upsertCategoryI18n(c, id, b.i18n, slug);
  return c.json({ ok: true, id, slug });
});

app.put("/categories/:id/active", async (c) => {
  const id = Number(c.req.param("id"));
  const b = await c.req.json().catch(() => ({}));
  const active = b.active === 0 || b.active === false ? 0 : 1;
  await c.env.DB.prepare(`UPDATE categories SET active = ?, updated_at = datetime('now') WHERE id = ?`).bind(active, id).run();
  return c.json({ ok: true, id, active });
});

app.delete("/categories/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const cat = await c.env.DB.prepare(`SELECT slug FROM categories WHERE id = ?`).bind(id).first<{ slug: string }>();
  if (cat) {
    const count = await c.env.DB.prepare(`SELECT COUNT(*) as n FROM products WHERE category = ?`).bind(cat.slug).first<{ n: number }>();
    if (count && count.n > 0) {
      return c.json({ error: "category_not_empty", message: "Cannot delete category containing products" }, 409);
    }
  }
  const r = await c.env.DB.prepare(`DELETE FROM categories WHERE id = ?`).bind(id).run();
  return c.json({ ok: true, id, deleted: r.meta.changes });
});

/* =============================== products ============================== */

app.get("/products", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT p.id, p.category, p.look, p.price_now, p.price_old, p.active, p.sort,
            COALESCE(p.availability, 'unknown') AS availability,
            COALESCE(p.product_type, 'simple') AS product_type,
            COALESCE(p.unit, 'pcs') AS unit,
            p.featured,
            i.name,
            (SELECT m.key FROM media m WHERE m.product_id = p.id ORDER BY m.sort ASC, m.id ASC LIMIT 1) AS image
     FROM products p LEFT JOIN product_i18n i ON i.product_id = p.id AND i.lang = 'ru'
     ORDER BY p.sort ASC, p.id ASC`,
  ).all();
  return c.json({ products: results });
});

app.put("/products/:id/active", async (c) => {
  const id = c.req.param("id");
  const b = await c.req.json().catch(() => ({}));
  const active = b.active === 0 || b.active === false ? 0 : 1;
  const r = await c.env.DB.prepare(`UPDATE products SET active = ?, updated_at = datetime('now') WHERE id = ?`).bind(active, id).run();
  return c.json({ ok: true, active, updated: r.meta.changes });
});

app.get("/products/:id", async (c) => {
  const id = c.req.param("id");
  const product = await c.env.DB.prepare(
    `SELECT *, COALESCE(availability, 'unknown') AS availability,
              COALESCE(product_type, 'simple') AS product_type,
              COALESCE(unit, 'pcs') AS unit
     FROM products WHERE id = ?`,
  ).bind(id).first();
  if (!product) return c.json({ error: "not_found" }, 404);

  const { results: i18n } = await c.env.DB.prepare(
    `SELECT lang, name, category_label, description, sizes, specs, seo_title, seo_description FROM product_i18n WHERE product_id = ?`,
  )
    .bind(id)
    .all();

  const media = await c.env.DB.prepare(
    `SELECT id, key, alt, sort FROM media WHERE product_id = ? ORDER BY sort ASC, id ASC`,
  )
    .bind(id)
    .all();

  const variants = await c.env.DB.prepare(
    `SELECT id, variant_code, name_ru, name_uz, name_en, hex, image, images, price_modifier, active, sort
     FROM product_variants WHERE product_id = ? ORDER BY sort ASC, id ASC`
  ).bind(id).all();

  const bundleItems = await c.env.DB.prepare(
    `SELECT bi.id, bi.component_product_id, bi.quantity, bi.sort,
            COALESCE(i.name, bi.component_product_id) AS component_name
     FROM bundle_items bi
     LEFT JOIN product_i18n i ON i.product_id = bi.component_product_id AND i.lang = 'ru'
     WHERE bi.bundle_product_id = ?
     ORDER BY bi.sort ASC, bi.id ASC`
  ).bind(id).all();

  return c.json({
    product,
    i18n,
    media: media.results,
    variants: variants.results,
    bundle_items: bundleItems.results,
  });
});

async function upsertProductI18n(c: any, id: string, i18n: any) {
  if (!i18n) return;
  const stmt = c.env.DB.prepare(
    `INSERT INTO product_i18n (product_id, lang, name, category_label, description, sizes, specs, seo_title, seo_description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(product_id, lang) DO UPDATE SET
       name = excluded.name, category_label = excluded.category_label,
       description = excluded.description, sizes = excluded.sizes, specs = excluded.specs,
       seo_title = excluded.seo_title, seo_description = excluded.seo_description`,
  );
  const batch = [];
  for (const lang of LANGS) {
    const t = i18n[lang];
    if (!t) continue;
    const sizes = Array.isArray(t.sizes) ? JSON.stringify(t.sizes) : (t.sizes ? String(t.sizes) : "[]");
    const specs = typeof t.specs === "object" && t.specs ? JSON.stringify(t.specs) : (t.specs ? String(t.specs) : "{}");
    batch.push(stmt.bind(
      id,
      lang,
      str(t.name, 200),
      str(t.category_label, 120),
      str(t.description, 4000),
      sizes,
      specs,
      str(t.seo_title, 255) || null,
      str(t.seo_description, 500) || null,
    ));
  }
  if (batch.length) await c.env.DB.batch(batch);
}

async function upsertProductVariants(c: any, productId: string, variants: any[]) {
  if (!Array.isArray(variants)) return;
  // If full variants array is provided, replace or sync
  await c.env.DB.prepare(`DELETE FROM product_variants WHERE product_id = ?`).bind(productId).run();
  if (!variants.length) return;

  const stmt = c.env.DB.prepare(`
    INSERT INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, price_modifier, active, sort)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const batch = [];
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const code = str(v.variant_code || v.id, 50).toLowerCase().trim() || `v${i + 1}`;
    const ru = str(v.name_ru || (v.name && v.name.ru) || code, 100);
    const uz = str(v.name_uz || (v.name && v.name.uz) || ru, 100);
    const en = str(v.name_en || (v.name && v.name.en) || ru, 100);
    const hex = str(v.hex, 30) || null;
    const img = str(v.image, 300) || null;
    const imgsJson = JSON.stringify(Array.isArray(v.images) ? v.images : (img ? [img] : []));
    const priceMod = Math.floor(Number(v.price_modifier) || 0);
    const active = v.active === 0 || v.active === false ? 0 : 1;
    const sort = Math.floor(Number(v.sort) || (i + 1) * 10);
    batch.push(stmt.bind(productId, code, ru, uz, en, hex, img, imgsJson, priceMod, active, sort));
  }
  if (batch.length) await c.env.DB.batch(batch);
}

async function upsertBundleItems(c: any, bundleProductId: string, items: any[]) {
  if (!Array.isArray(items)) return;
  await c.env.DB.prepare(`DELETE FROM bundle_items WHERE bundle_product_id = ?`).bind(bundleProductId).run();
  if (!items.length) return;

  const stmt = c.env.DB.prepare(`
    INSERT INTO bundle_items (bundle_product_id, component_product_id, quantity, sort)
    VALUES (?, ?, ?, ?)
  `);
  const batch = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const compId = str(it.component_product_id || it.id, 60);
    if (!compId) continue;
    const qty = Math.max(1, Math.floor(Number(it.quantity) || 1));
    const sort = Math.floor(Number(it.sort) || (i + 1) * 10);
    batch.push(stmt.bind(bundleProductId, compId, qty, sort));
  }
  if (batch.length) await c.env.DB.batch(batch);
}

app.post("/products", async (c) => {
  const b = await c.req.json().catch(() => ({}));
  const rawId = str(b.id || b.slug, 60).toLowerCase().trim();
  const slugErr = validateProductSlug(rawId);
  if (slugErr) return c.json({ error: slugErr }, 422);

  const category = str(b.category, 60).toLowerCase().trim();
  if (!category) return c.json({ error: "category_required" }, 422);

  // Dynamic category check: if category not registered yet, auto-register in categories table
  const catExists = await c.env.DB.prepare(`SELECT id FROM categories WHERE slug = ?`).bind(category).first();
  if (!catExists) {
    const insCat = await c.env.DB.prepare(`INSERT INTO categories (slug, active, sort) VALUES (?, 1, 100)`).bind(category).run();
    const newCatId = insCat.meta.last_row_id as number;
    await upsertCategoryI18n(c, newCatId, null, category);
  }

  const availability = str(b.availability, 20) || "unknown";
  if (!ALLOWED_AVAILABILITIES.has(availability)) {
    return c.json({ error: "invalid_availability", allowed: Array.from(ALLOWED_AVAILABILITIES) }, 422);
  }

  const productType = str(b.product_type, 30) || "simple";
  const unit = str(b.unit, 20) || "pcs";
  const featured = b.featured ? 1 : 0;

  const exists = await c.env.DB.prepare(`SELECT id FROM products WHERE id = ?`).bind(rawId).first();
  if (exists) return c.json({ error: "id_taken" }, 409);

  const aliasExists = await c.env.DB.prepare(`SELECT alias FROM product_aliases WHERE alias = ?`).bind(rawId).first();
  if (aliasExists) return c.json({ error: "alias_collision" }, 409);

  await c.env.DB.prepare(
    `INSERT INTO products (id, category, look, price_now, price_old, default_size, active, sort, availability, product_type, unit, featured, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
  )
    .bind(
      rawId,
      category,
      str(b.look, 40),
      Math.max(0, Math.floor(Number(b.price_now) || 0)),
      Math.max(0, Math.floor(Number(b.price_old) || 0)),
      Math.max(0, Math.floor(Number(b.default_size) || 0)),
      b.active === 0 || b.active === false ? 0 : 1,
      Math.floor(Number(b.sort) || 0),
      availability,
      productType,
      unit,
      featured,
    )
    .run();

  await upsertProductI18n(c, rawId, b.i18n);

  if (Array.isArray(b.variants)) {
    await upsertProductVariants(c, rawId, b.variants);
  }
  if (Array.isArray(b.bundle_items)) {
    await upsertBundleItems(c, rawId, b.bundle_items);
  }

  return c.json({ ok: true, id: rawId });
});

app.put("/products/:id", async (c) => {
  const id = c.req.param("id");
  const b = await c.req.json().catch(() => ({}));

  const category = str(b.category, 60).toLowerCase().trim();
  if (!category) return c.json({ error: "category_required" }, 422);

  const catExists = await c.env.DB.prepare(`SELECT id FROM categories WHERE slug = ?`).bind(category).first();
  if (!catExists) {
    const insCat = await c.env.DB.prepare(`INSERT INTO categories (slug, active, sort) VALUES (?, 1, 100)`).bind(category).run();
    const newCatId = insCat.meta.last_row_id as number;
    await upsertCategoryI18n(c, newCatId, null, category);
  }

  const availability = str(b.availability, 20) || "unknown";
  if (!ALLOWED_AVAILABILITIES.has(availability)) {
    return c.json({ error: "invalid_availability", allowed: Array.from(ALLOWED_AVAILABILITIES) }, 422);
  }

  const productType = str(b.product_type, 30) || "simple";
  const unit = str(b.unit, 20) || "pcs";
  const featured = b.featured ? 1 : 0;

  const r = await c.env.DB.prepare(
    `UPDATE products SET category = ?, look = ?, price_now = ?, price_old = ?, default_size = ?,
           active = ?, sort = ?, availability = ?, product_type = ?, unit = ?, featured = ?,
           updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(
      category,
      str(b.look, 40),
      Math.max(0, Math.floor(Number(b.price_now) || 0)),
      Math.max(0, Math.floor(Number(b.price_old) || 0)),
      Math.max(0, Math.floor(Number(b.default_size) || 0)),
      b.active === 0 || b.active === false ? 0 : 1,
      Math.floor(Number(b.sort) || 0),
      availability,
      productType,
      unit,
      featured,
      id,
    )
    .run();

  await upsertProductI18n(c, id, b.i18n);

  if (Array.isArray(b.variants)) {
    await upsertProductVariants(c, id, b.variants);
  }
  if (Array.isArray(b.bundle_items)) {
    await upsertBundleItems(c, id, b.bundle_items);
  }

  return c.json({ ok: true, updated: r.meta.changes });
});

app.delete("/products/:id", async (c) => {
  const id = c.req.param("id");
  const r = await c.env.DB.prepare(`DELETE FROM products WHERE id = ?`).bind(id).run();
  return c.json({ ok: true, deleted: r.meta.changes });
});

/* =========================== product variants =========================== */

app.get("/products/:id/variants", async (c) => {
  const id = c.req.param("id");
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort ASC, id ASC`
  ).bind(id).all();
  return c.json({ variants: results });
});

app.post("/products/:id/variants", async (c) => {
  const id = c.req.param("id");
  const b = await c.req.json().catch(() => ({}));
  const code = str(b.variant_code || b.id, 50).toLowerCase().trim();
  if (!code) return c.json({ error: "code_required" }, 422);

  const ru = str(b.name_ru || (b.name && b.name.ru) || code, 100);
  const uz = str(b.name_uz || (b.name && b.name.uz) || ru, 100);
  const en = str(b.name_en || (b.name && b.name.en) || ru, 100);
  const hex = str(b.hex, 30) || null;
  const img = str(b.image, 300) || null;
  const imgsJson = JSON.stringify(Array.isArray(b.images) ? b.images : (img ? [img] : []));
  const priceMod = Math.floor(Number(b.price_modifier) || 0);
  const active = b.active === 0 || b.active === false ? 0 : 1;
  const sort = Math.floor(Number(b.sort) || 10);

  const ins = await c.env.DB.prepare(`
    INSERT INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, price_modifier, active, sort)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, code, ru, uz, en, hex, img, imgsJson, priceMod, active, sort).run();

  return c.json({ ok: true, id: ins.meta.last_row_id });
});

app.put("/products/:id/variants/:variantId", async (c) => {
  const variantId = Number(c.req.param("variantId"));
  const b = await c.req.json().catch(() => ({}));
  const code = str(b.variant_code || b.id, 50).toLowerCase().trim();
  const ru = str(b.name_ru, 100);
  const uz = str(b.name_uz, 100);
  const en = str(b.name_en, 100);
  const hex = str(b.hex, 30) || null;
  const img = str(b.image, 300) || null;
  const imgsJson = JSON.stringify(Array.isArray(b.images) ? b.images : (img ? [img] : []));
  const priceMod = Math.floor(Number(b.price_modifier) || 0);
  const active = b.active === 0 || b.active === false ? 0 : 1;
  const sort = Math.floor(Number(b.sort) || 0);

  await c.env.DB.prepare(`
    UPDATE product_variants SET variant_code = COALESCE(?, variant_code),
           name_ru = COALESCE(?, name_ru), name_uz = COALESCE(?, name_uz), name_en = COALESCE(?, name_en),
           hex = ?, image = ?, images = ?, price_modifier = ?, active = ?, sort = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(code || null, ru || null, uz || null, en || null, hex, img, imgsJson, priceMod, active, sort, variantId).run();

  return c.json({ ok: true, id: variantId });
});

app.delete("/products/:id/variants/:variantId", async (c) => {
  const variantId = Number(c.req.param("variantId"));
  await c.env.DB.prepare(`DELETE FROM product_variants WHERE id = ?`).bind(variantId).run();
  return c.json({ ok: true });
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
  const items = await c.env.DB.prepare(
    `SELECT oi.*, COALESCE(p.unit, 'pcs') AS product_unit
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?`,
  ).bind(id).all();
  return c.json({ order, items: items.results });
});

const ORDER_STATUSES = ["new", "processing", "shipped", "delivered", "cancelled"];
app.put("/orders/:id/status", async (c) => {
  const id = Number(c.req.param("id"));
  const b = await c.req.json().catch(() => ({}));
  const status = str(b.status, 20);
  if (!ORDER_STATUSES.includes(status)) return c.json({ error: "bad_status" }, 422);
  const order = await c.env.DB.prepare(`SELECT * FROM orders WHERE id = ?`).bind(id).first<any>();
  const r = await c.env.DB.prepare(`UPDATE orders SET status = ? WHERE id = ?`).bind(status, id).run();
  if (order && order.customer_phone) {
    await notifyOrderSms(c.env, { ...order, status }, "status_change", status).catch((e) =>
      console.warn("[sms:status] Failed:", (e as Error).message),
    );
  }
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
    `SELECT a.id, a.slug, a.cover_media, a.status, a.published_at, i.title, i.excerpt
     FROM articles a LEFT JOIN article_i18n i ON i.article_id = a.id AND i.lang = 'ru'
     ORDER BY a.id DESC`,
  ).all();
  return c.json({ articles: results });
});

app.put("/articles/:id/status", async (c) => {
  const id = Number(c.req.param("id"));
  const b = await c.req.json().catch(() => ({}));
  const status = b.status === "published" ? "published" : "draft";
  const r = await c.env.DB.prepare(
    `UPDATE articles SET status = ?, updated_at = datetime('now'),
       published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN datetime('now') ELSE published_at END
     WHERE id = ?`,
  )
    .bind(status, status, id)
    .run();
  return c.json({ ok: true, status, updated: r.meta.changes });
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

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

app.post("/media", async (c) => {
  const form = await c.req.formData();
  const raw = form.get("file") as unknown as File | string | null;
  if (!raw || typeof raw === "string") return c.json({ error: "file_required" }, 422);
  const file: File = raw;
  const mime = (file.type || "").toLowerCase();
  const ext = ALLOWED_MIME[mime];
  if (!ext) return c.json({ error: "unsupported_type" }, 415);
  if (typeof file.size === "number" && (file.size <= 0 || file.size > MAX_UPLOAD_BYTES)) {
    return c.json({ error: "file_too_large", maxBytes: MAX_UPLOAD_BYTES }, 413);
  }
  const productId = str(form.get("product_id"), 60) || null;
  const articleId = form.get("article_id") ? Number(form.get("article_id")) : null;
  const alt = str(form.get("alt"), 200);
  const scope = productId ? `products/${productId}` : articleId ? `articles/${articleId}` : "misc";
  const key = `${scope}/${crypto.randomUUID()}.${ext}`;

  if (!c.env.MEDIA) {
    return c.json({
      error: "r2_disabled",
      message: "R2 storage is not enabled on Cloudflare dashboard for this account yet. Please enable R2 in Cloudflare.",
    }, 503);
  }

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

app.put("/media/:id/primary", async (c) => {
  const id = Number(c.req.param("id"));
  const row = await c.env.DB.prepare(`SELECT product_id, article_id FROM media WHERE id = ?`).bind(id).first<{ product_id: string | null; article_id: number | null }>();
  if (!row) return c.json({ error: "not_found" }, 404);
  if (row.product_id) {
    await c.env.DB.prepare(`UPDATE media SET sort = sort + 10 WHERE product_id = ?`).bind(row.product_id).run();
    await c.env.DB.prepare(`UPDATE media SET sort = 0 WHERE id = ?`).bind(id).run();
  } else if (row.article_id) {
    await c.env.DB.prepare(`UPDATE media SET sort = sort + 10 WHERE article_id = ?`).bind(row.article_id).run();
    await c.env.DB.prepare(`UPDATE media SET sort = 0 WHERE id = ?`).bind(id).run();
  }
  return c.json({ ok: true });
});

app.put("/media/:id/link", async (c) => {
  const id = Number(c.req.param("id"));
  const b = await c.req.json().catch(() => ({}));
  const productId = str(b.product_id, 60) || null;
  const articleId = b.article_id ? Number(b.article_id) : null;
  await c.env.DB.prepare(`UPDATE media SET product_id = ?, article_id = ? WHERE id = ?`).bind(productId, articleId, id).run();
  return c.json({ ok: true });
});

app.delete("/media/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const row = await c.env.DB.prepare(`SELECT key FROM media WHERE id = ?`).bind(id).first<{ key: string }>();
  if (row && c.env.MEDIA) await c.env.MEDIA.delete(row.key).catch(() => {});
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
    categories: await q(`SELECT COUNT(*) n FROM categories`),
    articles: await q(`SELECT COUNT(*) n FROM articles`),
    users: await q(`SELECT COUNT(*) n FROM users`),
  });
});

/* ================================== sms ================================= */

app.post("/sms/test", async (c) => {
  const b = await c.req.json().catch(() => ({}));
  const phone = str(b.phone, 30);
  const message = str(b.message, 500) || "Bententrade: Тестовое SMS-сообщение успешно доставлено!";
  if (!phone) return c.json({ error: "phone_required" }, 422);

  const res = await sendSms(c.env, { phone, message, skipRateLimit: true });
  return c.json(res);
});

/* =============================== telegram =============================== */

app.post("/telegram/test", async (c) => {
  const b = await c.req.json().catch(() => ({}));
  const token = str(b.token, 100) || undefined;
  const chat = str(b.chat, 60) || undefined;
  const message = str(b.message, 500) || undefined;
  const res = await testTelegram(c.env, { token, chat, message });
  return c.json(res);
});

/* ================================= reviews =============================== */

app.get("/reviews", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT r.id, r.product_id, r.author_name, r.city, r.rating, r.text, r.is_verified, r.status, r.created_at,
              COALESCE(i.name, r.product_id) AS product_name
       FROM reviews r
       LEFT JOIN product_i18n i ON i.product_id = r.product_id AND i.lang = 'ru'
       ORDER BY r.created_at DESC LIMIT 100`,
    ).all();
    return c.json({ reviews: results || [] });
  } catch (err) {
    return c.json({ reviews: [] });
  }
});

app.put("/reviews/:id/status", async (c) => {
  const id = Number(c.req.param("id"));
  const b = await c.req.json().catch(() => ({}));
  const status = str(b.status, 20) || "approved";
  if (!["approved", "pending", "rejected"].includes(status)) {
    return c.json({ error: "invalid_status" }, 422);
  }
  const r = await c.env.DB.prepare(`UPDATE reviews SET status = ? WHERE id = ?`).bind(status, id).run();
  return c.json({ ok: true, id, status, updated: r.meta.changes });
});

app.delete("/reviews/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const r = await c.env.DB.prepare(`DELETE FROM reviews WHERE id = ?`).bind(id).run();
  return c.json({ ok: true, id, deleted: r.meta.changes });
});

export default app;
