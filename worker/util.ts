import type { Context } from "hono";
import type { Env } from "./types";

/** Trim + cap a string, returning "" for non-strings. */
export function str(v: unknown, max = 2000): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

/** Loose phone check: at least 7 digits. */
export function isPhone(v: string): boolean {
  return (v.match(/\d/g) || []).length >= 7;
}

/** Simple per-key fixed-window rate limiter backed by KV.
 *  Returns true when the request is allowed. */
export async function rateLimit(
  env: Env,
  key: string,
  limit: number,
  windowSec: number,
): Promise<boolean> {
  const k = `rl:${key}`;
  const cur = await env.SESSIONS.get(k);
  const n = cur ? parseInt(cur, 10) || 0 : 0;
  if (n >= limit) return false;
  await env.SESSIONS.put(k, String(n + 1), { expirationTtl: windowSec });
  return true;
}

/** Best-effort client IP for rate-limit keys. */
export function clientIp(c: Context): string {
  return (
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for") ||
    "0.0.0.0"
  );
}

/** Escape text for safe HTML interpolation (admin templates). */
export function escapeHtml(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default: return "&#39;";
    }
  });
}
