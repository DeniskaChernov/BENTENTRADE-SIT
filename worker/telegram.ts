import type { Env } from "./types";

/** Best-effort Telegram notification. Never throws - notifications are
 *  a side-channel and must not break the primary request. */
export async function notifyTelegram(env: Env, text: string): Promise<void> {
  let token = env.TELEGRAM_BOT_TOKEN;
  let chat = env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    try {
      if (env.DB) {
        const { results } = await env.DB.prepare(
          "SELECT key, value FROM settings WHERE key IN ('telegram_bot_token', 'telegram_chat_id')",
        ).all<{ key: string; value: string }>();
        for (const r of (results || [])) {
          if (r.key === "telegram_bot_token" && r.value) token = r.value;
          if (r.key === "telegram_chat_id" && r.value) chat = r.value;
        }
      }
    } catch {
      // fallback silently
    }
  }

  if (!token || !chat) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch {
    // swallow - logged by observability at the fetch layer if enabled
  }
}

export async function testTelegram(
  env: Env,
  opts?: { token?: string; chat?: string; message?: string },
): Promise<{ ok: boolean; error?: string }> {
  let token = opts?.token || env.TELEGRAM_BOT_TOKEN;
  let chat = opts?.chat || env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    if (env.DB) {
      const { results } = await env.DB.prepare(
        "SELECT key, value FROM settings WHERE key IN ('telegram_bot_token', 'telegram_chat_id')",
      ).all<{ key: string; value: string }>();
      for (const r of (results || [])) {
        if (r.key === "telegram_bot_token" && r.value) token = token || r.value;
        if (r.key === "telegram_chat_id" && r.value) chat = chat || r.value;
      }
    }
  }

  if (!token) return { ok: false, error: "token_missing" };
  if (!chat) return { ok: false, error: "chat_id_missing" };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text: opts?.message || "Bententrade: Тестовое уведомление из панели управления CMS успешно доставлено!",
        parse_mode: "HTML",
      }),
    });
    const data = await res.json<any>().catch(() => ({}));
    if (res.ok && data.ok) {
      return { ok: true };
    }
    return { ok: false, error: data.description || "telegram_api_error" };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
