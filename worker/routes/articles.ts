import { Hono } from "hono";
import type { Env, Variables } from "../types";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

function pickLang(v: string | undefined): string {
  return v === "uz" || v === "en" ? v : "ru";
}

/** GET /api/articles?lang=ru — published articles. */
app.get("/", async (c) => {
  const lang = pickLang(c.req.query("lang"));
  const { results } = await c.env.DB.prepare(
    `SELECT a.id, a.slug, a.cover_media, a.published_at,
            i.title, i.excerpt
     FROM articles a
     LEFT JOIN article_i18n i ON i.article_id = a.id AND i.lang = ?
     WHERE a.status = 'published'
     ORDER BY a.published_at DESC, a.id DESC`,
  )
    .bind(lang)
    .all();
  return c.json({ lang, articles: results });
});

/** GET /api/articles/:slug?lang=ru */
app.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const lang = pickLang(c.req.query("lang"));
  const article = await c.env.DB.prepare(
    `SELECT id, slug, cover_media, published_at FROM articles WHERE slug = ? AND status = 'published'`,
  )
    .bind(slug)
    .first<{ id: number }>();
  if (!article) return c.json({ error: "not_found" }, 404);
  const i18n = await c.env.DB.prepare(
    `SELECT title, excerpt, body FROM article_i18n WHERE article_id = ? AND lang = ?`,
  )
    .bind(article.id, lang)
    .first();
  return c.json({ lang, article: { ...article, ...(i18n || {}) } });
});

export default app;
