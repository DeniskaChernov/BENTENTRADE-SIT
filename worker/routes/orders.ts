import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { str, isEmail, rateLimit, clientIp, escapeHtml } from "../util";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  setSessionCookie,
} from "../auth";
import { notifyTelegram } from "../telegram";
import { notifyOrderSms } from "../sms";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

type InItem = { id?: string; name?: string; qty?: number; price?: number; unit?: string; options?: unknown };

/** POST /api/orders - persist an order and its items, return a real order id. */
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

  // Silent honeypot check: trap automated spam bots without exposing detection
  if (body.website || body._hp || body.company_name_confirm) {
    return c.json({ ok: true, orderId: "BT-9999" });
  }

  const rawItems = Array.isArray(body.items) ? (body.items as InItem[]) : [];
  if (!rawItems.length) return c.json({ error: "empty_cart" }, 422);

  const lang = str(body.lang, 4) || "ru";
  const currency = str(body.currency, 10) || "сум";
  const isQuick = Boolean(body.quick_order);
  const customerName = str(body.name, 120) || (isQuick ? "Покупатель (быстрый заказ)" : "");
  const customerPhone = str(body.phone, 40);
  const customerEmail = str(body.email, 160);
  const address = str(body.address, 400);
  const comment = str(body.comment, 2000);
  const rawDelivery = str(body.delivery, 20);
  const deliveryMethod = rawDelivery === "pickup" ? "pickup" : (isQuick && !rawDelivery ? "quick_order" : "delivery");
  const rawPayment = str(body.payment || body.payment_method, 40) || "cash_or_pos";
  const paymentMethod = ["cash_or_pos", "click_payme", "card_or_invoice"].includes(rawPayment) ? rawPayment : "cash_or_pos";
  const promo = (str(body.promo, 30) || "").trim().toUpperCase();

  // Server-side validation: name + phone are always required; a standard delivery order
  // additionally needs an address (pickup or quick order does not).
  if (!customerName) return c.json({ error: "name_required" }, 422);
  if (!customerPhone || customerPhone.replace(/\D/g, "").length < 7) {
    return c.json({ error: "phone_required" }, 422);
  }
  if (!isQuick && deliveryMethod === "delivery" && !address) {
    return c.json({ error: "address_required" }, 422);
  }

  // Rate-limit by phone number to prevent SMS bombing / order flooding
  const cleanPhone = customerPhone.replace(/\D/g, "");
  if (cleanPhone && !(await rateLimit(c.env, `order:phone:${cleanPhone}`, 5, 3600))) {
    return c.json({ error: "rate_limited" }, 429);
  }

  const ALIAS_MAP: Record<string, string> = {
    p1: "stul-vertex", p2: "stul-corda", p3: "stul-roero", p4: "stul-noero",
    p5: "stul-todo", p6: "stul-jardin", p7: "stul-lira", p8: "kreslo-como",
    p9: "stol-taper-rotang-80", p10: "stol-vertex-d90", p11: "stol-taper-rotang-135",
    p12: "stol-taper-80", p13: "stol-vertex-80", p14: "stol-taper-135", p15: "stol-corda-135",
    p16: "stul-todo-soft",
    l1: "lampa-nova", l2: "lampa-sora", l3: "lampa-vela",
    l4: "lampa-runa", l5: "lampa-liva", l6: "lampa-aria",
    r1: "rotang-polutrubka", r2: "rotang-polumesyats", r3: "rotang-ploskaya-lenta",
    r4: "rotang-trubka", r5: "rotang-polusfera", r6: "rotang-twist"
  };

  // Resolve authoritative prices from DB where product id is known.
  const resolvedIds = rawItems.map((i) => {
    const rawId = str(i.id, 40);
    return ALIAS_MAP[rawId] || rawId;
  }).filter(Boolean);

  const priceMap = new Map<string, number>();
  const unitMap = new Map<string, string>();
  if (resolvedIds.length) {
    const placeholders = resolvedIds.map(() => "?").join(",");
    const { results } = await c.env.DB.prepare(
      `SELECT id, price_now, COALESCE(unit, 'pcs') AS unit FROM products WHERE id IN (${placeholders})`,
    )
      .bind(...resolvedIds)
      .all<{ id: string; price_now: number; unit: string }>();
    for (const r of results) {
      priceMap.set(r.id, r.price_now);
      if (r.unit) unitMap.set(r.id, r.unit);
    }
  }

  const UZS_RATE = 12500;
  const items = rawItems.map((i) => {
    const rawId = str(i.id, 40) || null;
    const resolvedId = rawId ? (ALIAS_MAP[rawId] || rawId) : null;
    const qty = Math.max(1, Math.min(99, Math.floor(Number(i.qty) || 1)));
    const clientPrice = Math.max(0, Math.floor(Number(i.price) || 0));
    const dbPrice = resolvedId && priceMap.has(resolvedId) ? priceMap.get(resolvedId)! : null;
    let unitPrice = clientPrice;
    if (dbPrice != null) {
      if (currency === "сум" || currency === "UZS") {
        unitPrice = dbPrice < 10000 ? dbPrice * UZS_RATE : dbPrice;
      } else if (currency === "$") {
        unitPrice = dbPrice >= 10000 ? Math.round(dbPrice / UZS_RATE) : dbPrice;
      } else {
        unitPrice = dbPrice;
      }
    }
    const itemUnit = str(i.unit, 20) || (resolvedId && unitMap.get(resolvedId)) || "pcs";
    let optionsObj: Record<string, unknown> | null = null;
    if (i.options && typeof i.options === "object") {
      optionsObj = { ...(i.options as Record<string, unknown>) };
    }
    if (itemUnit && itemUnit !== "pcs") {
      if (!optionsObj) optionsObj = {};
      optionsObj.unit = itemUnit;
    }
    return {
      id: resolvedId || rawId,
      name: str(i.name, 200) || resolvedId || "-",
      qty,
      unit: itemUnit,
      unit_price: unitPrice,
      options: optionsObj ? JSON.stringify(optionsObj).slice(0, 500) : (i.options ? JSON.stringify(i.options).slice(0, 500) : null),
    };
  });

  const PROMOS: Record<string, number> = { BENTEN2026: 5, WELCOME: 10, ROTANG: 7 };
  const subtotal = items.reduce((s, it) => s + it.unit_price * it.qty, 0);
  const promoPct = PROMOS[promo] || 0;
  const discount = promoPct > 0 ? Math.round((subtotal * promoPct) / 100) : 0;
  const total = Math.max(0, subtotal - discount);

  let finalComment = comment;
  if (isQuick) {
    const quickNote = "[⚡ Быстрый заказ в 1 клик]";
    finalComment = finalComment ? `${quickNote}\n${finalComment}` : quickNote;
  }
  if (promoPct > 0) {
    const promoNote = `[Промокод: ${promo} (-${promoPct}%)]`;
    finalComment = finalComment ? `${finalComment}\n${promoNote}` : promoNote;
  }

  const session = c.get("session");
  let userId = session?.userId ?? null;
  let createdUser: { id: number; email: string; name: string; role: string } | null = null;

  const createAccount = Boolean(body.create_account || body.register);
  const rawPassword = str(body.password, 200);

  // If user requested account registration during checkout and is not already logged in:
  if (!userId && (createAccount || rawPassword.length >= 8) && customerEmail && isEmail(customerEmail)) {
    const existing = await c.env.DB.prepare(
      `SELECT id, password_hash, role, name FROM users WHERE email = ?`,
    )
      .bind(customerEmail.toLowerCase())
      .first<{ id: number; password_hash: string; role: "customer" | "admin"; name: string }>();

    if (existing) {
      if (rawPassword && (await verifyPassword(rawPassword, existing.password_hash))) {
        userId = existing.id;
        const oldSid = c.get("sessionId");
        if (oldSid) await destroySession(c.env, oldSid);
        const sid = await createSession(c.env, { userId, role: existing.role, createdAt: Date.now() });
        setSessionCookie(c, sid);
        createdUser = { id: userId, email: customerEmail.toLowerCase(), name: existing.name, role: existing.role };
      }
    } else if (rawPassword.length >= 8) {
      const hash = await hashPassword(rawPassword);
      const insUser = await c.env.DB.prepare(
        `INSERT INTO users (email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, 'customer')`,
      )
        .bind(customerEmail.toLowerCase(), hash, customerName, customerPhone)
        .run();
      userId = insUser.meta.last_row_id as number;
      const oldSid = c.get("sessionId");
      if (oldSid) await destroySession(c.env, oldSid);
      const sid = await createSession(c.env, { userId, role: "customer", createdAt: Date.now() });
      setSessionCookie(c, sid);
      createdUser = { id: userId, email: customerEmail.toLowerCase(), name: customerName, role: "customer" };
    }
  }

  // Claim/link any past guest orders matching this user's email or phone
  if (userId && (customerEmail || cleanPhone)) {
    try {
      await c.env.DB.prepare(
        `UPDATE orders 
         SET user_id = ? 
         WHERE user_id IS NULL 
           AND (
             (customer_email IS NOT NULL AND lower(customer_email) = ?)
             OR (? != '' AND customer_phone IS NOT NULL AND replace(replace(replace(replace(customer_phone, ' ', ''), '-', ''), '(', ''), ')', '') LIKE ?)
           )`,
      )
        .bind(userId, customerEmail ? customerEmail.toLowerCase() : "", cleanPhone, `%${cleanPhone.slice(-9)}%`)
        .run();
    } catch (_) {}
  }

  const token = crypto.randomUUID();

  const ins = await c.env.DB.prepare(
    `INSERT INTO orders (public_id, user_id, customer_name, customer_phone, customer_email, address, comment, delivery_method, payment_method, lang, currency, total, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
  )
    .bind(token, userId, customerName, customerPhone, customerEmail, address, finalComment, deliveryMethod, paymentMethod, lang, currency, total)
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

  const fmtMoney = (val: number) => {
    const formatted = Math.round(val).toLocaleString("ru-RU").replace(/\s/g, " ");
    return currency === "$" ? `$${formatted}` : `${formatted} ${currency}`;
  };

  const discountMsg = promoPct > 0 ? `Промокод: ${promo} (-${promoPct}%: -${fmtMoney(discount)})\nИтого со скидкой: <b>${fmtMoney(total)}</b>\n` : "";

  const paymentLabels: Record<string, string> = {
    cash_or_pos: "При получении (наличными или терминалом)",
    click_payme: "Click / Payme (онлайн)",
    card_or_invoice: "Перевод на карту / Счёт юрлица",
  };
  const deliveryLabels: Record<string, string> = {
    delivery: "Доставка курьером",
    pickup: "Самовывоз из шоурума",
    quick_order: "Быстрый заказ (согласовать доставку)",
  };

  const header = isQuick
    ? `⚡ <b>БЫСТРЫЙ ЗАКАЗ В 1 КЛИК ${publicId}</b> - ${fmtMoney(total)}`
    : `<b>Новый заказ ${publicId}</b> - ${fmtMoney(total)}`;

  await notifyTelegram(
    c.env,
    `${header}\n` +
      (customerName ? `Клиент: ${escapeHtml(customerName)}\n` : "") +
      (customerPhone ? `Телефон: ${escapeHtml(customerPhone)}\n` : "") +
      `Способ: ${deliveryLabels[deliveryMethod] || deliveryMethod}\n` +
      `Оплата: ${paymentLabels[paymentMethod] || paymentMethod}\n` +
      (address ? `Адрес: ${escapeHtml(address)}\n` : "") +
      discountMsg +
      (comment ? `Комментарий: ${escapeHtml(comment)}\n` : "") +
      items.map((it) => {
        let optStr = "";
        let itUnit = it.unit || "pcs";
        if (it.options) {
          try {
            const parsed = JSON.parse(it.options);
            if (parsed.unit) { itUnit = String(parsed.unit); delete parsed.unit; }
            const vals = Object.values(parsed).filter(Boolean);
            if (vals.length) optStr = ` (${vals.join(", ")})`;
          } catch {}
        }
        const unitLabels: Record<string, string> = { pcs: "шт.", set: "компл.", kg: "кг", m: "м" };
        const uStr = unitLabels[itUnit] || itUnit || "шт.";
        return `• ${escapeHtml(it.name)}${escapeHtml(optStr)} ×${it.qty} ${uStr} - ${fmtMoney(it.unit_price * it.qty)}`;
      }).join("\n"),
  );

  await notifyOrderSms(
    c.env,
    {
      id: orderId,
      public_id: publicId,
      customer_name: customerName,
      customer_phone: customerPhone,
      total,
      currency,
      status: "created",
    },
    "created",
  ).catch((e) => console.warn("[sms:order] Failed:", (e as Error).message));

  return c.json({
    ok: true,
    orderId: publicId,
    total,
    subtotal,
    discount,
    promo: promoPct > 0 ? promo : undefined,
    currency,
    user: createdUser,
  });
});

/** GET /api/orders - current user's orders (auth required via mount). */
app.get("/", async (c) => {
  const session = c.get("session");
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const { results } = await c.env.DB.prepare(
    `SELECT id, public_id, total, currency, status, delivery_method, payment_method, address, created_at FROM orders WHERE user_id = ? ORDER BY id DESC`,
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
