import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { str, rateLimit, clientIp, escapeHtml } from "../util";
import { notifyTelegram } from "../telegram";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

type InItem = { id?: string; name?: string; qty?: number; price?: number; options?: unknown };

/** POST /api/orders — persist an order and its items, return a real order id. */
app.post("/", async (c) => {
  if (!(await rateLimit(c.env, `order:${clientIp(c)}`, 10, 3600))) {
    return c.json({ error: "rate_limited" }, 429);
  }
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "bad_json" }, 400);
  }

  const rawItems = Array.isArray(body.items) ? (body.items as InItem[]) : [];
  if (!rawItems.length) return c.json({ error: "empty_cart" }, 422);

  const lang = str(body.lang, 4) || "ru";
  const currency = str(body.currency, 4) || "$";
  const customerName = str(body.name, 120);
  const customerPhone = str(body.phone, 40);
  const customerEmail = str(body.email, 160);
  const address = str(body.address, 400);
  const comment = str(body.comment, 2000);
  const deliveryMethod = str(body.delivery, 20) === "pickup" ? "pickup" : "delivery";

  // Server-side validation: name + phone are always required; a delivery order
  // additionally needs an address (pickup does not).
  if (!customerName) return c.json({ error: "name_required" }, 422);
  if (!customerPhone || customerPhone.replace(/\D/g, "").length < 7) {
    return c.json({ error: "phone_required" }, 422);
  }
  if (deliveryMethod === "delivery" && !address) {
    return c.json({ error: "address_required" }, 422);
  }

  // Resolve authoritative prices from DB where product id is known.
  const ids = rawItems.map((i) => str(i.id, 20)).filter(Boolean);
  const priceMap = new Map<string, number>();
  if (ids.length) {
    const placeholders = ids.map(() => "?").join(",");
    const { results } = await c.env.DB.prepare(
      `SELECT id, price_now FROM products WHERE id IN (${placeholders})`,
    )
      .bind(...ids)
      .all<{ id: string; price_now: number }>();
    for (const r of results) priceMap.set(r.id, r.price_now);
  }

  const items = rawItems.map((i) => {
    const id = str(i.id, 20) || null;
    const qty = Math.max(1, Math.min(99, Math.floor(Number(i.qty) || 1)));
    const dbPrice = id && priceMap.has(id) ? priceMap.get(id)! : null;
    const price = dbPrice ?? Math.max(0, Math.floor(Number(i.price) || 0));
    return {
      id,
      name: str(i.name, 200) || id || "—",
      qty,
      unit_price: price,
      options: i.options ? JSON.stringify(i.options).slice(0, 500) : null,
    };
  });
  const total = items.reduce((s, it) => s + it.unit_price * it.qty, 0);

  const session = c.get("session");
  const userId = session?.userId ?? null;
  const token = crypto.randomUUID();

  const ins = await c.env.DB.prepare(
    `INSERT INTO orders (public_id, user_id, customer_name, customer_phone, customer_email, address, comment, delivery_method, lang, currency, total, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
  )
    .bind(token, userId, customerName, customerPhone, customerEmail, address, comment, deliveryMethod, lang, currency, total)
    .run();

  const orderId = ins.meta.last_row_id as number;
  const publicId = "BT-" + (2048 + orderId);
  await c.env.DB.prepare(`UPDATE orders SET public_id = ? WHERE id = ?`).bind(publicId, orderId).run();

  const stmt = c.env.DB.prepare(
    `INSERT INTO order_items (order_id, product_id, name, unit_price, qty, options) VALUES (?, ?, ?, ?, ?, ?)`,
  );
  await c.env.DB.batch(
    items.map((it) => stmt.bind(orderId, it.id, it.name, it.unit_price, it.qty, it.options)),
  );

  await notifyTelegram(
    c.env,
    `<b>Новый заказ ${publicId}</b> — ${currency}${total}\n` +
      (customerName ? `Клиент: ${escapeHtml(customerName)}\n` : "") +
      (customerPhone ? `Телефон: ${escapeHtml(customerPhone)}\n` : "") +
      `Способ: ${deliveryMethod === "pickup" ? "Самовывоз" : "Доставка"}\n` +
      (address ? `Адрес: ${escapeHtml(address)}\n` : "") +
      (comment ? `Комментарий: ${escapeHtml(comment)}\n` : "") +
      items.map((it) => `• ${escapeHtml(it.name)} ×${it.qty} — ${currency}${it.unit_price * it.qty}`).join("\n"),
  );

  return c.json({ ok: true, orderId: publicId, total, currency });
});

/** GET /api/orders — current user's orders (auth required via mount). */
app.get("/", async (c) => {
  const session = c.get("session");
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const { results } = await c.env.DB.prepare(
    `SELECT id, public_id, total, currency, status, delivery_method, address, created_at FROM orders WHERE user_id = ? ORDER BY id DESC`,
  )
    .bind(session.userId)
    .all<{ id: number }>();
  const orders = [];
  for (const o of results as Array<Record<string, unknown>>) {
    const items = await c.env.DB.prepare(
      `SELECT product_id, name, unit_price, qty, options FROM order_items WHERE order_id = ?`,
    )
      .bind(o.id)
      .all();
    orders.push({ ...o, items: items.results });
  }
  return c.json({ orders });
});

export default app;
