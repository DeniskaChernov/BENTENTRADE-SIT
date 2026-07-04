import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { str, isPhone } from "../util";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

function uid(c: { get: (k: "session") => any }): number | null {
  const s = c.get("session");
  return s ? s.userId : null;
}

/** PUT /api/account/profile */
app.put("/profile", async (c) => {
  const userId = uid(c);
  if (!userId) return c.json({ error: "unauthorized" }, 401);
  const body = await c.req.json().catch(() => ({}));
  const name = str(body.name, 120);
  const phone = str(body.phone, 40);
  const newsletter = body.newsletter ? 1 : 0;
  if (phone && !isPhone(phone)) return c.json({ error: "invalid_phone" }, 422);
  await c.env.DB.prepare(`UPDATE users SET name = ?, phone = ?, newsletter = ? WHERE id = ?`)
    .bind(name, phone, newsletter, userId)
    .run();
  return c.json({ ok: true });
});

/* ------------------------------ addresses ----------------------------- */

app.get("/addresses", async (c) => {
  const userId = uid(c);
  if (!userId) return c.json({ error: "unauthorized" }, 401);
  const { results } = await c.env.DB.prepare(
    `SELECT id, label, recipient, phone, city, line, is_default FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id ASC`,
  )
    .bind(userId)
    .all();
  return c.json({ addresses: results });
});

app.post("/addresses", async (c) => {
  const userId = uid(c);
  if (!userId) return c.json({ error: "unauthorized" }, 401);
  const b = await c.req.json().catch(() => ({}));
  const isDefault = b.is_default ? 1 : 0;
  if (isDefault) {
    await c.env.DB.prepare(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`).bind(userId).run();
  }
  const r = await c.env.DB.prepare(
    `INSERT INTO addresses (user_id, label, recipient, phone, city, line, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(userId, str(b.label, 60), str(b.recipient, 120), str(b.phone, 40), str(b.city, 80), str(b.line, 300), isDefault)
    .run();
  return c.json({ ok: true, id: r.meta.last_row_id });
});

app.put("/addresses/:id", async (c) => {
  const userId = uid(c);
  if (!userId) return c.json({ error: "unauthorized" }, 401);
  const id = Number(c.req.param("id"));
  const b = await c.req.json().catch(() => ({}));
  const isDefault = b.is_default ? 1 : 0;
  if (isDefault) {
    await c.env.DB.prepare(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`).bind(userId).run();
  }
  const r = await c.env.DB.prepare(
    `UPDATE addresses SET label = ?, recipient = ?, phone = ?, city = ?, line = ?, is_default = ? WHERE id = ? AND user_id = ?`,
  )
    .bind(str(b.label, 60), str(b.recipient, 120), str(b.phone, 40), str(b.city, 80), str(b.line, 300), isDefault, id, userId)
    .run();
  return c.json({ ok: true, updated: r.meta.changes });
});

app.delete("/addresses/:id", async (c) => {
  const userId = uid(c);
  if (!userId) return c.json({ error: "unauthorized" }, 401);
  const id = Number(c.req.param("id"));
  const r = await c.env.DB.prepare(`DELETE FROM addresses WHERE id = ? AND user_id = ?`).bind(id, userId).run();
  return c.json({ ok: true, deleted: r.meta.changes });
});

/* ------------------------------ favorites ----------------------------- */

app.get("/favorites", async (c) => {
  const userId = uid(c);
  if (!userId) return c.json({ error: "unauthorized" }, 401);
  const { results } = await c.env.DB.prepare(
    `SELECT product_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC`,
  )
    .bind(userId)
    .all<{ product_id: string }>();
  return c.json({ favorites: results.map((r) => r.product_id) });
});

/** PUT /api/account/favorites — replace the whole set (sync from client). */
app.put("/favorites", async (c) => {
  const userId = uid(c);
  if (!userId) return c.json({ error: "unauthorized" }, 401);
  const b = await c.req.json().catch(() => ({}));
  const ids = Array.isArray(b.favorites)
    ? [...new Set(b.favorites.map((x: unknown) => str(x, 20)).filter(Boolean))].slice(0, 200)
    : [];
  await c.env.DB.prepare(`DELETE FROM favorites WHERE user_id = ?`).bind(userId).run();
  if (ids.length) {
    const stmt = c.env.DB.prepare(`INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)`);
    await c.env.DB.batch(ids.map((pid) => stmt.bind(userId, pid)));
  }
  return c.json({ ok: true, count: ids.length });
});

export default app;
