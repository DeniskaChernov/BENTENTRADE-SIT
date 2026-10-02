import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { str, isPhone, isEmail, rateLimit, clientIp, escapeHtml } from "../util";
import { notifyTelegram } from "../telegram";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

/** POST /api/contact - store a contact request + notify Telegram. */
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

  // Silent honeypot check: trap automated spam bots without exposing detection
  if (body.website || body._hp || body.company_name_confirm) {
    return c.json({ ok: true, id: 0 });
  }

  const source = str(body.source, 40) || (body.is_bot ? "bot" : "web");
  const lang = str(body.lang, 4) || "ru";
  const defaultBotName = lang === "uz" ? "Mijoz (onlayn-chat)" : lang === "en" ? "Customer (online chat)" : "Посетитель сайта (онлайн-чат)";
  const rawName = str(body.name, 120);
  const name = rawName || (source === "bot" ? defaultBotName : "");
  const phone = str(body.phone, 40);
  const email = str(body.email, 160);
  const page = str(body.page, 200);
  const message = str(body.message, 4000) || (lang === "uz" ? "Maslahat uchun so'rov" : lang === "en" ? "Consultation request" : "Заявка на консультацию");
  const hasPhone = phone && phone.replace(/\D/g, "").length >= 7;
  const hasEmail = isEmail(email);

  if (!name || (!hasPhone && !hasEmail)) {
    return c.json({ error: "validation", fields: ["name", "phone_or_email"] }, 422);
  }

  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone && !(await rateLimit(c.env, `contact:phone:${cleanPhone}`, 5, 3600))) {
    return c.json({ error: "rate_limited" }, 429);
  }

  const res = await c.env.DB.prepare(
    `INSERT INTO contact_requests (name, phone, email, message, lang) VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(name, phone, email, message, lang)
    .run();

  const chatHistory = Array.isArray(body.history) ? (body.history as Array<{ who?: string; text?: string }>) : [];
  let tgMsg = "";
  if (source === "bot") {
    tgMsg = `💬 <b>НОВАЯ ЗАЯВКА ИЗ ЧАТ-БОТА BTT</b>\n` +
      `👤 Клиент: <b>${escapeHtml(name)}</b>\n` +
      (phone ? `📞 Телефон: <b>${escapeHtml(phone)}</b>\n` : "") +
      (email ? `✉️ Email: <b>${escapeHtml(email)}</b>\n` : "") +
      (page ? `📄 Страница: ${escapeHtml(page)}\n` : "") +
      `❓ Запрос: ${escapeHtml(message)}`;
    if (chatHistory.length) {
      const recent = chatHistory.slice(-5).map((h) => {
        const whoLabel = h.who === "user" ? "Клиент" : "Бот";
        return `• <i>${whoLabel}:</i> ${escapeHtml(str(h.text, 200))}`;
      }).join("\n");
      tgMsg += `\n\n<b>Контекст диалога:</b>\n${recent}`;
    }
  } else {
    tgMsg = `<b>Новая заявка #${res.meta.last_row_id}</b>\n` +
      `Имя: ${escapeHtml(name)}\n` +
      (phone ? `Телефон: ${escapeHtml(phone)}\n` : "") +
      (email ? `Email: ${escapeHtml(email)}\n` : "") +
      `Сообщение: ${escapeHtml(message)}`;
  }

  await notifyTelegram(c.env, tgMsg);

  return c.json({ ok: true, id: res.meta.last_row_id });
});

export default app;
