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
  let address = str(body.address, 400);
  if (!address && body.delivery && typeof body.delivery === "string" && body.delivery.startsWith("Адрес: ")) {
    address = body.delivery.replace(/^Адрес:\s*/, "").slice(0, 400);
  }
  const comment = str(body.comment, 2000);
  const rawDelivery = str(body.delivery, 20);
  const deliveryMethod = rawDelivery === "pickup" ? "pickup" : (isQuick && (!rawDelivery || rawDelivery.startsWith("Адрес: ")) ? "quick_order" : "delivery");
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
    p5: "stul-todo", p6: "stul-jardin", p9: "stol-taper-rotang-80", p10: "stol-vertex-d90", p11: "stol-taper-rotang-135",
    p12: "stol-taper-80", p13: "stol-vertex-80", p14: "stol-taper-135", p15: "stol-corda-135",
    p16: "stul-todo-soft",
    l1: "lampa-nova", l2: "lampa-sora", l3: "lampa-vela",
    l4: "lampa-runa", l5: "lampa-liva", l6: "lampa-aria",
    r1: "rotang-polutrubka", r2: "rotang-polumesyats", r3: "rotang-ploskaya-lenta",
    r4: "rotang-trubka", r5: "rotang-polusfera", r6: "rotang-twist",
    b1: "komplekt-vertex-d90-vertex",
    b2: "komplekt-vertex-d90-corda",
    b3: "komplekt-taper-80-roero",
    b4: "komplekt-taper-80-todo",
    b5: "komplekt-taper-80-noero",
    b6: "komplekt-vertex-d90-roero",
    b7: "komplekt-vertex-d90-noero",
    b8: "komplekt-vertex-d90-todo",
    b9: "komplekt-vertex-d90-jardin",
    b10: "komplekt-taper-80-corda",
    b11: "komplekt-taper-80-vertex",
    b12: "komplekt-taper-135-roero",
    b13: "komplekt-taper-135-noero",
    b14: "komplekt-taper-135-jardin",
    b15: "komplekt-taper-135-todo",
  };

  // Authoritative bundle calculation rules (per BTT pricing policy)
  const APPROVED_SPECIAL_PRICES_4: Record<string, number> = {
    "stol-vertex-d90_stul-vertex": 2676000,
    "stol-vertex-d90_stul-corda": 2676000,
    "stol-taper-80_stul-vertex": 2850000,
    "stol-taper-80_stul-corda": 2850000,
    "stol-taper-rotang-80_stul-vertex": 2850000,
    "stol-taper-rotang-80_stul-corda": 2850000,
  };

  const TABLE_BUNDLE_PRICES: Record<string, number> = {
    "stol-vertex-d90": 680000,
    "stol-taper-80": 733000,
    "stol-taper-rotang-80": 854000,
    "stol-taper-135": 860000,
    "stol-corda-135": 949000,
    "stol-taper-rotang-135": 954000,
    "stol-vertex-80": 680000,
  };

  const CHAIR_BUNDLE_PRICES: Record<string, { price: number; type: "plastic" | "wicker" }> = {
    "stul-roero": { price: 168000, type: "plastic" },
    "stul-noero": { price: 192000, type: "plastic" },
    "stul-todo": { price: 216000, type: "plastic" },
    "stul-todo-soft": { price: 216000, type: "plastic" },
    "stul-jardin": { price: 324000, type: "plastic" },
    "stul-vertex": { price: 499000, type: "wicker" },
    "stul-corda": { price: 499000, type: "wicker" },
  };

  function resolveAuthoritativeBundlePrice(id: string): number | null {
    if (id.includes("__combo__")) {
      const parts = id.split("__combo__");
      if (parts.length === 2) {
        const [p1, p2] = parts;
        const tableId = p1.startsWith("stol-") ? p1 : (p2.startsWith("stol-") ? p2 : null);
        const chairId = p1.startsWith("stul-") ? p1 : (p2.startsWith("stul-") ? p2 : null);
        if (tableId && chairId) {
          return resolveAuthoritativeBundlePrice(`bundle-${tableId}-${chairId}-4`);
        }
      }
    }
    const m = id.match(/^(?:bundle|komplekt)-(stol-[a-z0-9-]+)-(stul-[a-z0-9-]+)-(\d+)$/);
    if (!m) return null;
    const [, tableId, chairId, qtyStr] = m;
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty <= 0 || qty > 24) return null;

    if (qty === 4) {
      const specialKey = tableId + "_" + chairId;
      if (APPROVED_SPECIAL_PRICES_4[specialKey]) {
        return APPROVED_SPECIAL_PRICES_4[specialKey];
      }
    }

    const tablePrice = TABLE_BUNDLE_PRICES[tableId];
    const chairInfo = CHAIR_BUNDLE_PRICES[chairId];
    if (tablePrice == null || chairInfo == null) return null;

    if (chairInfo.type === "plastic") {
      return tablePrice + chairInfo.price * qty;
    }
    return tablePrice + 499000 * qty;
  }

  // Resolve authoritative prices from DB and bundle calculator
  const rawIds = rawItems.map((i) => {
    const s = str(i.id, 60);
    if (!s) return "";
    if (s.includes("__combo__")) return s.trim();
    return s.split("__")[0].trim();
  }).filter(Boolean);
  const resolvedIds = rawIds.map((rawId) => ALIAS_MAP[rawId] || rawId);

  const priceMap = new Map<string, number>();
  const unitMap = new Map<string, string>();

  // Pre-seed dynamic builder bundle prices
  for (const id of resolvedIds) {
    const bundlePrice = resolveAuthoritativeBundlePrice(id);
    if (bundlePrice != null) {
      priceMap.set(id, bundlePrice);
      unitMap.set(id, "set");
    }
  }

  if (resolvedIds.length) {
    const placeholders = resolvedIds.map(() => "?").join(",");
    const { results } = await c.env.DB.prepare(
      `SELECT p.id, p.price_now, COALESCE(p.unit, 'pcs') AS unit, pa.alias
       FROM products p
       LEFT JOIN product_aliases pa ON pa.product_id = p.id
       WHERE p.id IN (${placeholders}) OR pa.alias IN (${placeholders})`,
    )
      .bind(...resolvedIds, ...resolvedIds)
      .all<{ id: string; price_now: number; unit: string; alias: string | null }>();

    for (const r of results) {
      priceMap.set(r.id, r.price_now);
      if (r.alias) priceMap.set(r.alias, r.price_now);
      if (r.unit) {
        unitMap.set(r.id, r.unit);
        if (r.alias) unitMap.set(r.alias, r.unit);
      }
    }
  }

  const UZS_RATE = 12500;
  const parsedItems = [];
  for (const i of rawItems) {
    const rawId = str(i.id, 60) || null;
    const isCombo = Boolean(rawId && rawId.includes("__combo__"));
    const baseId = rawId ? (isCombo ? rawId.trim() : rawId.split("__")[0].trim()) : null;
    const resolvedId = baseId ? (ALIAS_MAP[baseId] || baseId) : null;
    const qty = Math.max(1, Math.min(99, Math.floor(Number(i.qty) || 1)));
    const clientPrice = Math.max(0, Math.floor(Number(i.price) || 0));

    // Authoritative price check
    let unitPrice = clientPrice;
    const isKnown = Boolean(
      (resolvedId && priceMap.has(resolvedId)) ||
      (baseId && priceMap.has(baseId)) ||
      (rawId && priceMap.has(rawId))
    );
    const isOnRequest = Boolean(resolvedId && resolvedId.startsWith("rotang-"));

    if (isKnown) {
      const dbPrice = (resolvedId ? priceMap.get(resolvedId) : null) ?? (baseId ? priceMap.get(baseId) : null) ?? (rawId ? priceMap.get(rawId) : null) ?? 0;
      if (currency === "сум" || currency === "UZS") {
        unitPrice = dbPrice < 10000 ? dbPrice * UZS_RATE : dbPrice;
      } else if (currency === "$") {
        unitPrice = dbPrice >= 10000 ? Math.round(dbPrice / UZS_RATE) : dbPrice;
      } else {
        unitPrice = dbPrice;
      }
    } else if (isOnRequest) {
      unitPrice = 0;
    } else {
      return c.json({ error: "product_not_found", id: rawId }, 422);
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
    parsedItems.push({
      id: resolvedId || baseId || rawId,
      name: str(i.name, 200) || resolvedId || "-",
      qty,
      unit: itemUnit,
      unit_price: unitPrice,
      options: optionsObj ? JSON.stringify(optionsObj).slice(0, 500) : (i.options ? JSON.stringify(i.options).slice(0, 500) : null),
    });
  }

  const items = parsedItems;

  const PROMOS: Record<string, number> = { BENTEN2026: 5, WELCOME: 10, ROTANG: 7 };
  const subtotal = items.reduce((s, it) => s + it.unit_price * it.qty, 0);
  const promoPct = PROMOS[promo] || 0;
  const discount = promoPct > 0 ? Math.round((subtotal * promoPct) / 100) : 0;
  const total = Math.max(0, subtotal - discount);

  let finalComment = comment;
  if (isQuick) {
    const quickNote = "[⚡ Быстрый заказ]";
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
  const matchPhone = cleanPhone && cleanPhone.length >= 9 ? cleanPhone.slice(-9) : "";
  if (userId && (customerEmail || matchPhone)) {
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
        .bind(userId, customerEmail ? customerEmail.toLowerCase() : "", matchPhone, `%${matchPhone}%`)
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
    ? `⚡ <b>БЫСТРЫЙ ЗАКАЗ ${publicId}</b> - ${fmtMoney(total)}`
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
  const { results: orders } = await c.env.DB.prepare(
    `SELECT id, public_id, total, currency, status, delivery_method, payment_method, address, created_at FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 50`,
  )
    .bind(session.userId)
    .all<{ id: number }>();

  if (!orders || !orders.length) return c.json({ orders: [] });

  const orderIds = orders.map((o) => o.id);
  const placeholders = orderIds.map(() => "?").join(",");
  const { results: allItems } = await c.env.DB.prepare(
    `SELECT order_id, product_id, name, unit_price, qty, options FROM order_items WHERE order_id IN (${placeholders})`,
  )
    .bind(...orderIds)
    .all<{ order_id: number; product_id: string; name: string; unit_price: number; qty: number; options: string | null }>();

  const itemsByOrder = new Map<number, Array<{ product_id: string; name: string; unit_price: number; qty: number; options: string | null }>>();
  for (const it of (allItems || [])) {
    let arr = itemsByOrder.get(it.order_id);
    if (!arr) {
      arr = [];
      itemsByOrder.set(it.order_id, arr);
    }
    arr.push({
      product_id: it.product_id,
      name: it.name,
      unit_price: it.unit_price,
      qty: it.qty,
      options: it.options,
    });
  }

  const result = orders.map((o) => ({
    ...o,
    items: itemsByOrder.get(o.id) || [],
  }));

  return c.json({ orders: result });
});

export default app;
