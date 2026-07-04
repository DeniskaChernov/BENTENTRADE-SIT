import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { str, isPhone, rateLimit, clientIp, escapeHtml } from "../util";
import { notifyTelegram } from "../telegram";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

/** POST /api/contact — store a contact request + notify Telegram. */
app.post("/", async (c) => {
  if (!(await rateLimit(c.env, `contact:${clientIp(c)}`, 5, 3600))) {
    return c.json({ error: "rate_limited" }, 429);
  }
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "bad_json" }, 400);
  }

  const name = str(body.name, 120);
  const phone = str(body.phone, 40);
  const email = str(body.email, 160);
  const message = str(body.message, 4000);
  const lang = str(body.lang, 4) || "ru";

  if (!name || !message || (!isPhone(phone) && !email)) {
    return c.json({ error: "validation", fields: ["name", "phone_or_email", "message"] }, 422);
  }

  const res = await c.env.DB.prepare(
    `INSERT INTO contact_requests (name, phone, email, message, lang) VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(name, phone, email, message, lang)
    .run();

  await notifyTelegram(
    c.env,
    `<b>Новая заявка #${res.meta.last_row_id}</b>\n` +
      `Имя: ${escapeHtml(name)}\n` +
      (phone ? `Телефон: ${escapeHtml(phone)}\n` : "") +
      (email ? `Email: ${escapeHtml(email)}\n` : "") +
      `Сообщение: ${escapeHtml(message)}`,
  );

  return c.json({ ok: true, id: res.meta.last_row_id });
});

export default app;
