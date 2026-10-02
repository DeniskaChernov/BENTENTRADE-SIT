import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { str, isEmail, rateLimit, clientIp, timingSafeEqual } from "../util";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  setSessionCookie,
  clearSessionCookie,
} from "../auth";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

/** POST /api/auth/register */
app.post("/register", async (c) => {
  if (!(await rateLimit(c.env, `reg:${clientIp(c)}`, 10, 3600))) {
    return c.json({ error: "rate_limited" }, 429);
  }
  const body = await c.req.json().catch(() => ({}));
  const email = str(body.email, 160).toLowerCase();
  const password = str(body.password, 200);
  const name = str(body.name, 120);
  const phone = str(body.phone, 40);

  if (!isEmail(email)) return c.json({ error: "invalid_email" }, 422);
  if (password.length < 8) return c.json({ error: "weak_password" }, 422);

  const exists = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first();
  if (exists) return c.json({ error: "email_taken" }, 409);

  // Registration always assigns 'customer' role. Admin escalation is strictly through ADMIN_BOOTSTRAP_TOKEN.
  const role = "customer";

  const hash = await hashPassword(password);
  const ins = await c.env.DB.prepare(
    `INSERT INTO users (email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(email, hash, name, phone, role)
    .run();

  const userId = ins.meta.last_row_id as number;

  // Destroy old session if any (session fixation defense)
  const oldSid = c.get("sessionId");
  if (oldSid) await destroySession(c.env, oldSid);

  const sid = await createSession(c.env, { userId, role, createdAt: Date.now() });
  setSessionCookie(c, sid);
  return c.json({ ok: true, user: { id: userId, email, name, role } });
});

/** POST /api/auth/login */
app.post("/login", async (c) => {
  const ip = clientIp(c);
  // IP-level throttle against brute force
  if (!(await rateLimit(c.env, `login:ip:${ip}`, 15, 900))) {
    return c.json({ error: "rate_limited" }, 429);
  }
  const body = await c.req.json().catch(() => ({}));
  const email = str(body.email, 160).toLowerCase();
  const password = str(body.password, 200);

  // Account-level throttle against distributed credential stuffing
  if (email && !(await rateLimit(c.env, `login:acc:${email}`, 8, 900))) {
    return c.json({ error: "rate_limited" }, 429);
  }

  const user = await c.env.DB.prepare(
    `SELECT id, email, name, role, password_hash FROM users WHERE email = ?`,
  )
    .bind(email)
    .first<{ id: number; email: string; name: string; role: "customer" | "admin"; password_hash: string }>();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return c.json({ error: "invalid_credentials" }, 401);
  }

  // Destroy old session if any (session fixation defense)
  const oldSid = c.get("sessionId");
  if (oldSid) await destroySession(c.env, oldSid);

  const sid = await createSession(c.env, { userId: user.id, role: user.role, createdAt: Date.now() });
  setSessionCookie(c, sid);
  return c.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

/** POST /api/auth/logout */
app.post("/logout", async (c) => {
  await destroySession(c.env, c.get("sessionId"));
  clearSessionCookie(c);
  return c.json({ ok: true });
});

/** GET /api/auth/me */
app.get("/me", async (c) => {
  const session = c.get("session");
  if (!session) return c.json({ user: null });
  const user = await c.env.DB.prepare(
    `SELECT id, email, name, phone, role, newsletter FROM users WHERE id = ?`,
  )
    .bind(session.userId)
    .first();
  return c.json({ user });
});

/** POST /api/auth/change-password */
app.post("/change-password", async (c) => {
  const session = c.get("session");
  if (!session || !session.userId) {
    return c.json({ error: "unauthorized" }, 401);
  }
  const ip = clientIp(c);
  // Rate-limit password changes (max 5 attempts per hour per account and per IP)
  if (
    !(await rateLimit(c.env, `pwchg:acc:${session.userId}`, 5, 3600)) ||
    !(await rateLimit(c.env, `pwchg:ip:${ip}`, 10, 3600))
  ) {
    return c.json({ error: "rate_limited" }, 429);
  }

  const body = await c.req.json().catch(() => ({}));
  const currentPassword = str(body.currentPassword || body.current_password, 200);
  const newPassword = str(body.newPassword || body.new_password, 200);

  if (!currentPassword) {
    return c.json({ error: "current_password_required" }, 422);
  }
  if (newPassword.length < 8) {
    return c.json({ error: "weak_password" }, 422);
  }

  const user = await c.env.DB.prepare(
    `SELECT id, password_hash, role FROM users WHERE id = ?`,
  )
    .bind(session.userId)
    .first<{ id: number; password_hash: string; role: "customer" | "admin" }>();

  if (!user || !(await verifyPassword(currentPassword, user.password_hash))) {
    return c.json({ error: "invalid_current_password" }, 400);
  }

  const newHash = await hashPassword(newPassword);
  await c.env.DB.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`)
    .bind(newHash, user.id)
    .run();

  // Session rotation: destroy previous session to prevent fixation and generate fresh session ID
  const oldSid = c.get("sessionId");
  if (oldSid) await destroySession(c.env, oldSid);

  const newSid = await createSession(c.env, {
    userId: user.id,
    role: user.role,
    createdAt: Date.now(),
  });
  setSessionCookie(c, newSid);

  return c.json({ ok: true, message: "Password updated successfully" });
});

/** POST /api/auth/bootstrap-admin - promote a user to admin using a one-time token.
 *  Body: { email, token }. Token is compared to the ADMIN_BOOTSTRAP_TOKEN secret. */
app.post("/bootstrap-admin", async (c) => {
  // Tight rate-limit: this endpoint checks a secret token, so throttle brute force.
  if (!(await rateLimit(c.env, `bootstrap:${clientIp(c)}`, 5, 3600))) {
    return c.json({ error: "rate_limited" }, 429);
  }
  const body = await c.req.json().catch(() => ({}));
  const token = str(body.token, 200);
  const email = str(body.email, 160).toLowerCase();
  if (!c.env.ADMIN_BOOTSTRAP_TOKEN || !timingSafeEqual(token, c.env.ADMIN_BOOTSTRAP_TOKEN)) {
    return c.json({ error: "forbidden" }, 403);
  }
  const r = await c.env.DB.prepare(`UPDATE users SET role = 'admin' WHERE email = ?`).bind(email).run();
  return c.json({ ok: true, updated: r.meta.changes });
});

export default app;
