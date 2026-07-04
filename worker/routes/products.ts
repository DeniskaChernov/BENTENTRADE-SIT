import { Hono } from "hono";
import type { Env, Variables } from "../types";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

function pickLang(v: string | undefined): string {
  return v === "uz" || v === "en" ? v : "ru";
}

/** GET /api/products?lang=ru&category=furniture */
app.get("/", async (c) => {
  const lang = pickLang(c.req.query("lang"));
  const category = c.req.query("category");
  const where = ["p.active = 1"];
  const binds: unknown[] = [lang];
  if (category && category !== "all") {
    where.push("p.category = ?");
    binds.push(category);
  }
  const sql =
    `SELECT p.id, p.category, p.look, p.price_now, p.price_old, p.default_size,
            i.name, i.category_label
     FROM products p
     LEFT JOIN product_i18n i ON i.product_id = p.id AND i.lang = ?
     WHERE ${where.join(" AND ")}
     ORDER BY p.sort ASC, p.id ASC`;
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all();
  return c.json({ lang, products: results });
});

/** GET /api/products/:id?lang=ru */
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const lang = pickLang(c.req.query("lang"));
  const product = await c.env.DB.prepare(
    `SELECT id, category, look, price_now, price_old, default_size FROM products WHERE id = ? AND active = 1`,
  )
    .bind(id)
    .first();
  if (!product) return c.json({ error: "not_found" }, 404);

  const i18n = await c.env.DB.prepare(
    `SELECT name, category_label, description, sizes, specs FROM product_i18n WHERE product_id = ? AND lang = ?`,
  )
    .bind(id, lang)
    .first<{ name: string; category_label: string; description: string; sizes: string; specs: string }>();

  const media = await c.env.DB.prepare(
    `SELECT key, alt, sort FROM media WHERE product_id = ? ORDER BY sort ASC`,
  )
    .bind(id)
    .all();

  return c.json({
    lang,
    product: {
      ...product,
      name: i18n?.name ?? "",
      category_label: i18n?.category_label ?? "",
      description: i18n?.description ?? "",
      sizes: i18n?.sizes ? JSON.parse(i18n.sizes) : [],
      specs: i18n?.specs ? JSON.parse(i18n.specs) : {},
      media: media.results,
    },
  });
});

export default app;
