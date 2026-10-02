import { Hono } from "hono";
import type { Env, Variables } from "../types";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

function pickLang(v: string | undefined): string {
  return v === "uz" || v === "en" ? v : "ru";
}

/** GET /api/categories?lang=ru - returns active categories with localized names and product counts */
app.get("/", async (c) => {
  const lang = pickLang(c.req.query("lang"));
  const sql = `
    SELECT c.id, c.slug, c.parent_id, c.sort, c.image,
           COALESCE(ci.name, c.slug) AS name,
           ci.description, ci.seo_title, ci.seo_description,
           (SELECT COUNT(*) FROM products p WHERE p.category = c.slug AND p.active = 1) AS product_count
    FROM categories c
    LEFT JOIN category_i18n ci ON ci.category_id = c.id AND ci.lang = ?
    WHERE c.active = 1
    ORDER BY c.sort ASC, c.id ASC
  `;
  const { results } = await c.env.DB.prepare(sql).bind(lang).all();
  return c.json({ ok: true, lang, categories: results });
});

/** GET /api/categories/:slug?lang=ru - returns single category details */
app.get("/:slug", async (c) => {
  const slug = (c.req.param("slug") || "").toLowerCase().trim();
  const lang = pickLang(c.req.query("lang"));
  const sql = `
    SELECT c.id, c.slug, c.parent_id, c.sort, c.image,
           COALESCE(ci.name, c.slug) AS name,
           ci.description, ci.seo_title, ci.seo_description,
           (SELECT COUNT(*) FROM products p WHERE p.category = c.slug AND p.active = 1) AS product_count
    FROM categories c
    LEFT JOIN category_i18n ci ON ci.category_id = c.id AND ci.lang = ?
    WHERE c.slug = ? AND c.active = 1
  `;
  const category = await c.env.DB.prepare(sql).bind(lang, slug).first();
  if (!category) return c.json({ error: "not_found" }, 404);
  return c.json({ ok: true, lang, category });
});

export default app;
