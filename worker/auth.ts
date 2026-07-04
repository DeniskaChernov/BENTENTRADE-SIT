import type { Context, Next } from "hono";
import type { Env, SessionData, Variables } from "./types";

const SESSION_COOKIE = "btt_session";
const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30 days
const PBKDF2_ITERATIONS = 210_000;

type Ctx = Context<{ Bindings: Env; Variables: Variables }>;

/* ----------------------------- passwords ----------------------------- */

function b64(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s);
}
function unb64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${b64(salt)}$${b64(bits)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, iterStr, saltB64, hashB64] = stored.split("$");
    if (scheme !== "pbkdf2") return false;
    const iterations = parseInt(iterStr, 10);
    const salt = unb64(saltB64);
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      key,
      256,
    );
    const a = b64(bits);
    // constant-time-ish compare
    if (a.length !== hashB64.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ hashB64.charCodeAt(i);
    return diff === 0;
  } catch {
    return false;
  }
}

/* ----------------------------- sessions ------------------------------ */

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

export async function createSession(env: Env, data: SessionData): Promise<string> {
  const id = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
  await env.SESSIONS.put(`sess:${id}`, JSON.stringify(data), {
    expirationTtl: SESSION_TTL_SEC,
  });
  return id;
}

export async function readSession(env: Env, id: string | null): Promise<SessionData | null> {
  if (!id) return null;
  const raw = await env.SESSIONS.get(`sess:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export async function destroySession(env: Env, id: string | null): Promise<void> {
  if (!id) return;
  await env.SESSIONS.delete(`sess:${id}`);
}

export function setSessionCookie(c: Ctx, id: string): void {
  const secure = new URL(c.req.url).protocol === "https:";
  c.header(
    "Set-Cookie",
    `${SESSION_COOKIE}=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SEC}` +
      (secure ? "; Secure" : ""),
    { append: true },
  );
}

export function clearSessionCookie(c: Ctx): void {
  c.header(
    "Set-Cookie",
    `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
    { append: true },
  );
}

/** Populate c.var.session / c.var.sessionId from the request cookie. */
export async function sessionMiddleware(c: Ctx, next: Next): Promise<void | Response> {
  const cookies = parseCookies(c.req.header("cookie"));
  const id = cookies[SESSION_COOKIE] || null;
  c.set("sessionId", id);
  c.set("session", await readSession(c.env, id));
  await next();
}

/** Require any authenticated user. */
export async function requireAuth(c: Ctx, next: Next): Promise<Response | void> {
  if (!c.get("session")) return c.json({ error: "unauthorized" }, 401);
  await next();
}

/** Require an admin session. */
export async function requireAdmin(c: Ctx, next: Next): Promise<Response | void> {
  const s = c.get("session");
  if (!s || s.role !== "admin") return c.json({ error: "forbidden" }, 403);
  await next();
}
