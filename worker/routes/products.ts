import { Hono } from "hono";
import type { Env, Variables } from "../types";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

function pickLang(v: string | undefined): string {
  return v === "uz" || v === "en" ? v : "ru";
}

/** GET /api/products?lang=ru&category=all&type=all */
app.get("/", async (c) => {
  const lang = pickLang(c.req.query("lang"));
  const category = c.req.query("category");
  const type = c.req.query("type");
  const featured = c.req.query("featured");

  const where = ["p.active = 1"];
  const binds: unknown[] = [lang, lang];

  if (category && category !== "all") {
    where.push("p.category = ?");
    binds.push(category);
  }
  if (type && type !== "all") {
    where.push("p.product_type = ?");
    binds.push(type);
  }
  if (featured === "1" || featured === "true") {
    where.push("p.featured = 1");
  }

  const sql = `
    SELECT p.id, p.id AS slug, p.category, p.look, p.price_now, p.price_old, p.default_size,
           COALESCE(p.availability, 'unknown') AS availability,
           COALESCE(p.product_type, 'simple') AS product_type,
           COALESCE(p.unit, 'pcs') AS unit,
           p.featured, p.sort,
           i.name,
           COALESCE(ci.name, i.category_label, p.category) AS category_label,
           (SELECT m.key FROM media m WHERE m.product_id = p.id ORDER BY m.sort ASC, m.id ASC LIMIT 1) AS image
    FROM products p
    LEFT JOIN product_i18n i ON i.product_id = p.id AND i.lang = ?
    LEFT JOIN categories cat ON cat.slug = p.category
    LEFT JOIN category_i18n ci ON ci.category_id = cat.id AND ci.lang = ?
    WHERE ${where.join(" AND ")}
    ORDER BY p.sort ASC, p.id ASC
  `;

  const { results } = await c.env.DB.prepare(sql).bind(...binds).all<Record<string, unknown>>();

  // Fetch all active variants in one query to attach to catalog cards
  const { results: allVariants } = await c.env.DB.prepare(`
    SELECT product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, price_modifier, sort
    FROM product_variants
    WHERE active = 1
    ORDER BY sort ASC, id ASC
  `).all<{
    product_id: string;
    variant_code: string;
    name_ru: string;
    name_uz: string | null;
    name_en: string | null;
    hex: string | null;
    image: string | null;
    images: string | null;
    price_modifier: number;
    sort: number;
  }>();

  const variantsByProd = new Map<string, Array<{
    id: string;
    name: Record<string, string>;
    hex: string;
    image: string;
    images: string[];
  }>>();

  for (const v of allVariants) {
    let list = variantsByProd.get(v.product_id);
    if (!list) {
      list = [];
      variantsByProd.set(v.product_id, list);
    }
    let parsedImages: string[] = [];
    try {
      parsedImages = v.images ? JSON.parse(v.images) : [];
    } catch {
      parsedImages = v.image ? [v.image] : [];
    }
    list.push({
      id: v.variant_code,
      name: {
        ru: v.name_ru,
        uz: v.name_uz || v.name_ru,
        en: v.name_en || v.name_ru,
      },
      hex: v.hex || "",
      image: v.image || "",
      images: parsedImages,
    });
  }

  const products = results.map((p) => {
    const pId = String(p.id);
    const confirmedColors = variantsByProd.get(pId) || [];
    return {
      ...p,
      confirmedColors,
      variants: confirmedColors,
    };
  });

  return c.json({ lang, products });
});

/** GET /api/products/:id?lang=ru - returns single unified product DTO */
app.get("/:id", async (c) => {
  const rawId = (c.req.param("id") || "").toLowerCase().trim();
  const lang = pickLang(c.req.query("lang"));

  let product = await c.env.DB.prepare(`
    SELECT id, id AS slug, category, look, price_now, price_old, default_size,
           COALESCE(availability, 'unknown') AS availability,
           COALESCE(product_type, 'simple') AS product_type,
           COALESCE(unit, 'pcs') AS unit,
           featured, sort, active, created_at, updated_at
    FROM products
    WHERE id = ? AND active = 1
  `)
    .bind(rawId)
    .first<Record<string, unknown>>();

  let canonicalId = rawId;
  if (!product) {
    const aliasRow = await c.env.DB.prepare(
      `SELECT product_id FROM product_aliases WHERE alias = ?`,
    )
      .bind(rawId)
      .first<{ product_id: string }>();

    if (aliasRow?.product_id) {
      canonicalId = aliasRow.product_id;
      product = await c.env.DB.prepare(`
        SELECT id, id AS slug, category, look, price_now, price_old, default_size,
               COALESCE(availability, 'unknown') AS availability,
               COALESCE(product_type, 'simple') AS product_type,
               COALESCE(unit, 'pcs') AS unit,
               featured, sort, active, created_at, updated_at
        FROM products
        WHERE id = ? AND active = 1
      `)
        .bind(canonicalId)
        .first<Record<string, unknown>>();
    }
  }

  if (!product) return c.json({ error: "not_found" }, 404);

  // Localized product details & Category label
  const i18n = await c.env.DB.prepare(`
    SELECT i.name, i.category_label, i.description, i.sizes, i.specs, i.seo_title, i.seo_description,
           COALESCE(ci.name, i.category_label) AS localized_category_name
    FROM product_i18n i
    LEFT JOIN products p ON p.id = i.product_id
    LEFT JOIN categories cat ON cat.slug = p.category
    LEFT JOIN category_i18n ci ON ci.category_id = cat.id AND ci.lang = ?
    WHERE i.product_id = ? AND i.lang = ?
  `)
    .bind(lang, canonicalId, lang)
    .first<{
      name: string;
      category_label: string;
      description: string;
      sizes: string;
      specs: string;
      seo_title: string;
      seo_description: string;
      localized_category_name: string;
    }>();

  // Media gallery
  const media = await c.env.DB.prepare(
    `SELECT key, alt, sort FROM media WHERE product_id = ? ORDER BY sort ASC, id ASC`,
  )
    .bind(canonicalId)
    .all<{ key: string; alt: string; sort: number }>();

  // Variants (Colors)
  const variantsRows = await c.env.DB.prepare(`
    SELECT id, variant_code, name_ru, name_uz, name_en, hex, image, images, price_modifier, sort
    FROM product_variants
    WHERE product_id = ? AND active = 1
    ORDER BY sort ASC, id ASC
  `)
    .bind(canonicalId)
    .all<{
      id: number;
      variant_code: string;
      name_ru: string;
      name_uz: string | null;
      name_en: string | null;
      hex: string | null;
      image: string | null;
      images: string | null;
      price_modifier: number;
      sort: number;
    }>();

  const variants = variantsRows.results.map((v) => {
    let parsedImages: string[] = [];
    try {
      parsedImages = v.images ? JSON.parse(v.images) : [];
    } catch {
      parsedImages = v.image ? [v.image] : [];
    }
    return {
      id: v.variant_code,
      name: {
        ru: v.name_ru,
        uz: v.name_uz || v.name_ru,
        en: v.name_en || v.name_ru,
      },
      hex: v.hex || "",
      image: v.image || "",
      images: parsedImages,
      price_modifier: v.price_modifier || 0,
    };
  });

  // Bundle components (if product is a bundle)
  let bundleItems: unknown[] = [];
  if (product.product_type === "bundle") {
    const bundleRows = await c.env.DB.prepare(`
      SELECT bi.component_product_id, bi.quantity, bi.sort,
             COALESCE(i.name, bi.component_product_id) AS component_name,
             p.price_now AS component_price,
             (SELECT m.key FROM media m WHERE m.product_id = bi.component_product_id ORDER BY m.sort ASC, m.id ASC LIMIT 1) AS component_image
      FROM bundle_items bi
      JOIN products p ON p.id = bi.component_product_id
      LEFT JOIN product_i18n i ON i.product_id = p.id AND i.lang = ?
      WHERE bi.bundle_product_id = ?
      ORDER BY bi.sort ASC
    `)
      .bind(lang, canonicalId)
      .all();
    bundleItems = bundleRows.results;
  }

  let parsedSizes: unknown[] = [];
  try {
    parsedSizes = i18n?.sizes ? JSON.parse(i18n.sizes) : [];
  } catch {
    parsedSizes = i18n?.sizes ? [i18n.sizes] : [];
  }

  let parsedSpecs: Record<string, string> = {};
  try {
    parsedSpecs = i18n?.specs ? JSON.parse(i18n.specs) : {};
  } catch {
    parsedSpecs = {};
  }

  const images = media.results.map((m) => m.key);
  const primaryImage = images[0] || (variants[0] && variants[0].image) || "";

  return c.json({
    lang,
    product: {
      ...product,
      name: i18n?.name ?? canonicalId,
      category_label: i18n?.localized_category_name || i18n?.category_label || String(product.category),
      description: i18n?.description ?? "",
      dimensions: parsedSpecs.dim || parsedSpecs.dimensions || "",
      materials: parsedSpecs.mat || parsedSpecs.materials || "",
      sizes: parsedSizes,
      specs: parsedSpecs,
      seo_title: i18n?.seo_title ?? "",
      seo_description: i18n?.seo_description ?? "",
      image: primaryImage,
      images,
      media: media.results,
      variants,
      confirmedColors: variants,
      bundle_items: bundleItems,
    },
  });
});

export default app;
