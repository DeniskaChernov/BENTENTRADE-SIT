import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { str, rateLimit, clientIp, escapeHtml } from "../util";
import { notifyTelegram } from "../telegram";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

/** GET /api/reviews?product_id=:id */
app.get("/", async (c) => {
  const productId = str(c.req.query("product_id"), 80);
  try {
    let query: string;
    let params: unknown[];
    if (productId) {
      query = `SELECT id, product_id, author_name, city, rating, text, is_verified, created_at
               FROM reviews
               WHERE product_id = ? AND status = 'approved'
               ORDER BY created_at DESC LIMIT 50`;
      params = [productId];
    } else {
      query = `SELECT id, product_id, author_name, city, rating, text, is_verified, created_at
               FROM reviews
               WHERE status = 'approved'
               ORDER BY created_at DESC LIMIT 50`;
      params = [];
    }
    const stmt = c.env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    return c.json({ ok: true, reviews: results || [] });
  } catch (err) {
    return c.json({ ok: true, reviews: [] });
  }
});

/** POST /api/reviews - submit a new review */
app.post("/", async (c) => {
  if (!(await rateLimit(c.env, `review:${clientIp(c)}`, 5, 3600))) {
    return c.json({ error: "rate_limited" }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "bad_json" }, 400);
  }

  const productId = str(body.product_id, 80);
  const authorName = str(body.author_name, 100);
  const city = str(body.city, 80) || "Ташкент";
  const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
  const text = str(body.text, 2500);

  if (!productId || !authorName || !text || text.length < 5) {
    return c.json({ error: "validation", fields: ["product_id", "author_name", "text"] }, 422);
  }

  const session = c.get("session");
  const userId = session ? session.userId : null;

  // Check if verified purchase (user has ordered this product)
  let isVerified = 0;
  if (userId) {
    try {
      const ord = await c.env.DB.prepare(
        `SELECT oi.id FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         WHERE o.user_id = ? AND oi.product_id = ? AND o.status != 'cancelled' LIMIT 1`,
      )
        .bind(userId, productId)
        .first();
      if (ord) isVerified = 1;
    } catch (_) {}
  }

  const createdAt = Date.now();
  const status = "approved"; // auto-approve with admin moderation

  const res = await c.env.DB.prepare(
    `INSERT INTO reviews (product_id, user_id, author_name, city, rating, text, is_verified, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(productId, userId, authorName, city, rating, text, isVerified, status, createdAt)
    .run();

  const newId = res.meta.last_row_id;
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  // Notify manager via Telegram
  await notifyTelegram(
    c.env,
    `⭐ <b>Новый отзыв о товаре #${escapeHtml(productId)}</b>\n` +
      `Оценка: ${stars} (${rating}/5)\n` +
      `Автор: ${escapeHtml(authorName)} (${escapeHtml(city)})\n` +
      (isVerified ? `Статус: <i>Проверенная покупка ✓</i>\n` : "") +
      `Текст: ${escapeHtml(text)}`,
  );

  return c.json({
    ok: true,
    review: {
      id: newId,
      product_id: productId,
      author_name: authorName,
      city,
      rating,
      text,
      is_verified: isVerified,
      created_at: createdAt,
    },
  });
});

export default app;
