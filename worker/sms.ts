import type { Env } from "./types";

let cachedToken: { token: string; expiresAt: number } | null = null;

export interface SmsSettings {
  sms_provider?: string; // 'disabled' | 'mock' | 'eskiz'
  sms_email?: string;
  sms_password?: string;
  sms_from?: string;
  sms_notify_created?: string; // '1' | '0'
  sms_notify_status?: string; // '1' | '0'
  sms_tpl_created?: string;
  sms_tpl_processing?: string;
  sms_tpl_shipped?: string;
  sms_tpl_delivered?: string;
  sms_tpl_cancelled?: string;
}

/** Clean and normalize Uzbek phone number to 998XXXXXXXXX */
export function normalizePhone(rawPhone: string | null | undefined): string | null {
  if (!rawPhone) return null;
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 9) return "998" + digits;
  if (digits.length === 12 && digits.startsWith("998")) return digits;
  if (digits.length > 9 && digits.endsWith(digits.slice(-9))) {
    return "998" + digits.slice(-9);
  }
  return digits.length >= 9 ? digits : null;
}

/** Load SMS configuration from the settings table */
export async function loadSmsSettings(env: Env): Promise<SmsSettings> {
  try {
    const { results } = await env.DB.prepare(
      `SELECT key, value FROM settings WHERE key LIKE 'sms_%'`,
    ).all<{ key: string; value: string }>();
    const map: Record<string, string> = {};
    for (const r of results || []) {
      if (r.key && r.value) map[r.key] = r.value;
    }
    return map as SmsSettings;
  } catch {
    return {};
  }
}

/** Obtain or refresh auth token from Eskiz.uz API */
async function getEskizToken(email: string, pass: string): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.token;
  }

  try {
    const fd = new FormData();
    fd.append("email", email);
    fd.append("password", pass);

    const res = await fetch("https://notify.eskiz.uz/api/auth/login", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn("[sms:eskiz] Auth failed:", res.status, errText);
      return null;
    }
    const data = (await res.json()) as any;
    const token = data?.data?.token;
    if (token) {
      // Tokens are typically valid for 30 days; cache for 25 days
      cachedToken = { token, expiresAt: now + 25 * 24 * 3600 * 1000 };
      return token;
    }
  } catch (err) {
    console.warn("[sms:eskiz] Auth error:", (err as Error).message);
  }
  return null;
}

/** Send SMS through Eskiz.uz API */
async function sendEskizSms(
  token: string,
  from: string,
  phone: string,
  message: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const fd = new FormData();
    fd.append("mobile_phone", phone);
    fd.append("message", message);
    fd.append("from", from || "4546");

    const res = await fetch("https://notify.eskiz.uz/api/message/sms/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: fd,
    });
    const data = (await res.json().catch(() => ({}))) as any;
    if (res.ok && data?.status === "waiting") {
      return { ok: true, id: String(data?.id || "") };
    }
    return { ok: false, error: data?.message || `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** General SMS send function based on configured provider */
export async function sendSms(
  env: Env,
  opts: { phone: string; message: string; settings?: SmsSettings },
): Promise<{ ok: boolean; provider: string; details?: any; error?: string }> {
  const settings = opts.settings || (await loadSmsSettings(env));
  const provider = (settings.sms_provider || "disabled").toLowerCase();
  const phone = normalizePhone(opts.phone);

  if (!phone) {
    return { ok: false, provider, error: "invalid_phone_number" };
  }

  if (provider === "disabled") {
    return { ok: false, provider: "disabled", error: "sms_provider_disabled" };
  }

  if (provider === "mock" || provider === "test") {
    console.log(`[sms:mock] TO: +${phone} | MESSAGE: "${opts.message}"`);
    return { ok: true, provider: "mock", details: { to: phone, text: opts.message } };
  }

  if (provider === "eskiz") {
    const procEnv = (globalThis as any).process?.env || {};
    const email = settings.sms_email || (procEnv.ESKIZ_EMAIL as string);
    const pass = settings.sms_password || (procEnv.ESKIZ_PASSWORD as string);
    const from = settings.sms_from || "4546";

    if (!email || !pass) {
      console.warn("[sms:eskiz] Missing email or password in settings");
      return { ok: false, provider: "eskiz", error: "missing_credentials" };
    }

    const token = await getEskizToken(email, pass);
    if (!token) {
      return { ok: false, provider: "eskiz", error: "auth_failed" };
    }

    const result = await sendEskizSms(token, from, phone, opts.message);
    if (result.ok) {
      return { ok: true, provider: "eskiz", details: { messageId: result.id, to: phone } };
    }
    return { ok: false, provider: "eskiz", error: result.error };
  }

  return { ok: false, provider, error: "unknown_provider" };
}

export interface OrderSmsPayload {
  id?: number;
  public_id: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  total: number;
  currency?: string | null;
  status?: string | null;
}

const DEFAULT_TEMPLATES: Record<string, string> = {
  created: "BTT: Ваш заказ #{order_id} на сумму {total} принят! Скоро свяжемся с вами.",
  processing: "BTT: Заказ #{order_id} передан на комплектацию. Срок уточнит менеджер.",
  shipped: "BTT: Заказ #{order_id} передан курьеру/в службу доставки. Ожидайте прибытия.",
  delivered: "BTT: Заказ #{order_id} успешно доставлен! Спасибо за выбор BTT.",
  cancelled: "BTT: Заказ #{order_id} отменен. Свяжитесь с нами при любых вопросах: +998 77 104 44 22",
};

/** Render template placeholders */
function renderTemplate(tpl: string, vars: Record<string, string>): string {
  let out = tpl;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(v);
  }
  return out;
}

/** Automatically trigger order SMS notification according to settings */
export async function notifyOrderSms(
  env: Env,
  order: OrderSmsPayload,
  event: "created" | "status_change",
  newStatus?: string,
): Promise<{ sent: boolean; reason?: string }> {
  if (!order.customer_phone) return { sent: false, reason: "no_phone" };

  const settings = await loadSmsSettings(env);
  const provider = (settings.sms_provider || "disabled").toLowerCase();
  if (provider === "disabled") return { sent: false, reason: "disabled" };

  if (event === "created") {
    if (settings.sms_notify_created === "0") return { sent: false, reason: "created_notify_disabled" };
  } else if (event === "status_change") {
    if (settings.sms_notify_status === "0") return { sent: false, reason: "status_notify_disabled" };
  }

  const statusKey = newStatus || order.status || "created";
  const customKey = `sms_tpl_${statusKey}` as keyof SmsSettings;
  const tpl = (settings[customKey] as string) || DEFAULT_TEMPLATES[statusKey] || DEFAULT_TEMPLATES.created;

  const fmtTotal = () => {
    const formatted = Math.round(order.total).toLocaleString("ru-RU").replace(/\s/g, " ");
    const cur = order.currency || "сум";
    return `${formatted} ${cur}`;
  };

  const statusLabels: Record<string, string> = {
    new: "Новый",
    processing: "В обработке",
    shipped: "Передан в доставку",
    delivered: "Доставлен",
    cancelled: "Отменён",
  };

  const message = renderTemplate(tpl, {
    order_id: order.public_id || String(order.id || ""),
    name: (order.customer_name || "").trim() || "Покупатель",
    total: fmtTotal(),
    status: statusLabels[statusKey] || statusKey,
  });

  const res = await sendSms(env, {
    phone: order.customer_phone,
    message,
    settings,
  });

  return { sent: res.ok, reason: res.error || (res.ok ? "ok" : "failed") };
}
