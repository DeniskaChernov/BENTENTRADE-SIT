/* ============================================================
   BENTENTRADE - Node/Railway runtime.
   Provides drop-in replacements for the Cloudflare bindings the
   Hono routes expect (c.env.DB / c.env.SESSIONS / c.env.MEDIA),
   backed by PostgreSQL and the local filesystem, so the existing
   worker/routes/*.ts run unchanged.
   ============================================================ */
import "dotenv/config";
import pg from "pg";
import { readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import vm from "node:vm";

const req = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const connectionString = process.env.DATABASE_URL;
export const isSqlite = !connectionString;

let sqliteDb: any = null;
if (isSqlite) {
  const { DatabaseSync } = req("node:sqlite");
  const dataDir = join(ROOT, "data");
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  sqliteDb = new DatabaseSync(join(dataDir, "bententrade.db"));
  sqliteDb.exec("PRAGMA foreign_keys = ON;");
}

/* --- keep TIMESTAMPTZ/ TIMESTAMP as "YYYY-MM-DD HH:MM:SS" strings (SQLite-like) --- */
if (!isSqlite) {
  pg.types.setTypeParser(1114, (v) => (v == null ? v : String(v).slice(0, 19)));
  pg.types.setTypeParser(1184, (v) => (v == null ? v : String(v).slice(0, 19)));
}

const ssl =
  process.env.DATABASE_SSL === "true" || /[?&]sslmode=require/.test(connectionString || "")
    ? { rejectUnauthorized: false }
    : undefined;

// Isolate all app tables in a dedicated schema so we never collide with other
// apps sharing the same PostgreSQL database (Railway plugin DBs are often shared).
// search_path is set at connection startup (no race with the first query).
export const PG_SCHEMA = (process.env.PG_SCHEMA || "bententrade").replace(/[^a-z0-9_]/gi, "");

export const pool = !isSqlite
  ? new pg.Pool({
      connectionString,
      ssl,
      max: 8,
      connectionTimeoutMillis: 10_000,
      options: `-c search_path=${PG_SCHEMA} -c timezone=UTC`,
    })
  : (null as any);


/* ----------------------- SQL compatibility ----------------------- */
// Tables whose INSERT should return a generated id (used as D1 last_row_id).
const ID_TABLES = new Set([
  "users", "addresses", "orders", "order_items", "media", "contact_requests", "articles",
]);

function buildQuery(sqlIn: string, params: unknown[], opts: { returningId?: boolean } = {}) {
  let sql = String(sqlIn);
  // SQLite datetime('now') -> Postgres now()
  sql = sql.replace(/datetime\('now'\)/gi, "now()");

  // INSERT OR IGNORE INTO ... -> INSERT INTO ... ON CONFLICT DO NOTHING
  let conflictNothing = false;
  sql = sql.replace(/insert\s+or\s+ignore\s+into/gi, () => {
    conflictNothing = true;
    return "INSERT INTO";
  });
  // INSERT OR REPLACE is not used by the routes; leave a clear error if it appears.

  // ? -> $1, $2, ...
  let i = 0;
  let text = sql.replace(/\?/g, () => "$" + ++i);

  if (conflictNothing && !/on\s+conflict/i.test(text)) text += " ON CONFLICT DO NOTHING";

  if (opts.returningId && !/returning/i.test(text)) {
    const m = /^\s*insert\s+into\s+([a-z_]+)/i.exec(text);
    if (m && ID_TABLES.has(m[1].toLowerCase())) text += " RETURNING id";
  }
  return { text, params };
}

async function execRun(sql: string, params: unknown[]) {
  const { text } = buildQuery(sql, params, { returningId: true });
  const r = await pool.query(text, params as any[]);
  return { meta: { changes: r.rowCount ?? 0, last_row_id: r.rows[0]?.id } };
}

class Stmt {
  sql: string;
  params: unknown[];
  constructor(sql: string, params: unknown[] = []) {
    this.sql = sql;
    this.params = params;
  }
  bind(...args: unknown[]) {
    return new Stmt(this.sql, args);
  }
  async all<T = any>() {
    if (isSqlite) {
      const rows = sqliteDb.prepare(this.sql).all(...this.params);
      return { results: rows as T[] };
    }
    const { text } = buildQuery(this.sql, this.params);
    const r = await pool.query(text, this.params as any[]);
    return { results: r.rows as T[] };
  }
  async first<T = any>() {
    if (isSqlite) {
      const row = sqliteDb.prepare(this.sql).get(...this.params);
      return (row as T) ?? null;
    }
    const { text } = buildQuery(this.sql, this.params);
    const r = await pool.query(text, this.params as any[]);
    return (r.rows[0] as T) ?? null;
  }
  async run() {
    if (isSqlite) {
      const res = sqliteDb.prepare(this.sql).run(...this.params);
      return {
        meta: {
          changes: Number(res.changes) || 0,
          last_row_id: res.lastInsertRowid != null ? Number(res.lastInsertRowid) : undefined,
        },
      };
    }
    return execRun(this.sql, this.params);
  }
}

const DB = {
  prepare(sql: string) {
    return new Stmt(sql);
  },
  async batch(stmts: Stmt[]) {
    if (isSqlite) {
      sqliteDb.exec("BEGIN");
      try {
        const out = [];
        for (const s of stmts) {
          const res = sqliteDb.prepare(s.sql).run(...s.params);
          out.push({
            meta: {
              changes: Number(res.changes) || 0,
              last_row_id: res.lastInsertRowid != null ? Number(res.lastInsertRowid) : undefined,
            },
          });
        }
        sqliteDb.exec("COMMIT");
        return out;
      } catch (e) {
        sqliteDb.exec("ROLLBACK");
        throw e;
      }
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const out: any[] = [];
      for (const s of stmts) {
        const { text } = buildQuery(s.sql, s.params, { returningId: true });
        const r = await client.query(text, s.params as any[]);
        out.push({ meta: { changes: r.rowCount ?? 0, last_row_id: r.rows[0]?.id } });
      }
      await client.query("COMMIT");
      return out;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },
};

/* --------------------------- KV (sessions / rate-limit) --------------------------- */
const SESSIONS = {
  async get(k: string) {
    if (isSqlite) {
      const now = Math.floor(Date.now() / 1000);
      const row = sqliteDb
        .prepare("SELECT v FROM kv_store WHERE k = ? AND (expires_at IS NULL OR expires_at > ?)")
        .get(k, now) as { v: string } | undefined;
      return row ? row.v : null;
    }
    const r = await pool.query(
      "SELECT v FROM kv_store WHERE k = $1 AND (expires_at IS NULL OR expires_at > now())",
      [k],
    );
    return r.rows[0] ? (r.rows[0].v as string) : null;
  },
  async put(k: string, v: string, opts?: { expirationTtl?: number }) {
    if (isSqlite) {
      const ttl = opts && opts.expirationTtl ? Math.floor(Number(opts.expirationTtl)) : 0;
      const exp = ttl > 0 ? Math.floor(Date.now() / 1000) + ttl : null;
      sqliteDb
        .prepare(
          `INSERT INTO kv_store (k, v, expires_at) VALUES (?, ?, ?)
           ON CONFLICT (k) DO UPDATE SET v = excluded.v, expires_at = excluded.expires_at`,
        )
        .run(k, v, exp);
      return;
    }
    const ttl = opts && opts.expirationTtl ? Math.floor(Number(opts.expirationTtl)) : 0;
    const exp = ttl > 0 ? `now() + interval '${ttl} seconds'` : "NULL";
    await pool.query(
      `INSERT INTO kv_store (k, v, expires_at) VALUES ($1, $2, ${exp})
       ON CONFLICT (k) DO UPDATE SET v = excluded.v, expires_at = excluded.expires_at`,
      [k, v],
    );
  },
  async delete(k: string) {
    if (isSqlite) {
      sqliteDb.prepare("DELETE FROM kv_store WHERE k = ?").run(k);
      return;
    }
    await pool.query("DELETE FROM kv_store WHERE k = $1", [k]);
  },
};

/* --------------------------- R2 (media) over the filesystem --------------------------- */
const MEDIA_DIR = resolve(process.env.MEDIA_DIR || join(ROOT, "uploads"));

function mediaPath(key: string): string {
  const p = resolve(MEDIA_DIR, key);
  if (p !== MEDIA_DIR && !p.startsWith(MEDIA_DIR + sep)) {
    throw new Error("invalid_media_key");
  }
  return p;
}

const MEDIA = {
  async put(key: string, body: ReadableStream | Buffer | Uint8Array, opts?: { httpMetadata?: { contentType?: string } }) {
    const p = mediaPath(key);
    await mkdir(dirname(p), { recursive: true });
    const buf =
      body instanceof Buffer || body instanceof Uint8Array
        ? Buffer.from(body as Uint8Array)
        : Buffer.from(await new Response(body as ReadableStream).arrayBuffer());
    await writeFile(p, buf);
    const ct = (opts && opts.httpMetadata && opts.httpMetadata.contentType) || "application/octet-stream";
    await writeFile(p + ".type", ct, "utf8");
  },
  async get(key: string) {
    let p: string;
    try {
      p = mediaPath(key);
    } catch {
      return null;
    }
    let buf: Buffer;
    try {
      buf = await readFile(p);
    } catch {
      return null;
    }
    let ct = "application/octet-stream";
    try {
      ct = (await readFile(p + ".type", "utf8")).trim() || ct;
    } catch {
      /* no sidecar */
    }
    const etag = '"' + createHash("sha1").update(buf).digest("hex") + '"';
    return {
      body: buf,
      httpEtag: etag,
      writeHttpMetadata(h: Headers) {
        h.set("content-type", ct);
      },
    };
  },
  async delete(key: string) {
    let p: string;
    try {
      p = mediaPath(key);
    } catch {
      return;
    }
    await unlink(p).catch(() => {});
    await unlink(p + ".type").catch(() => {});
  },
};

/* ------------------------------ env for routes ------------------------------ */
export function buildEnv() {
  return {
    DB,
    SESSIONS,
    MEDIA,
    SITE_ORIGIN: process.env.SITE_ORIGIN || "",
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    ADMIN_BOOTSTRAP_TOKEN: process.env.ADMIN_BOOTSTRAP_TOKEN,
  } as any;
}

/* ------------------------------ migrate + seed ------------------------------ */
export async function migrate() {
  if (isSqlite) {
    const schema = readFileSync(join(ROOT, "migrations", "0001_init.sql"), "utf8");
    sqliteDb.exec(schema);
    try { sqliteDb.exec("ALTER TABLE orders ADD COLUMN delivery_method TEXT DEFAULT 'delivery';"); } catch (e) { /* already exists */ }
    try { sqliteDb.exec("ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'cash_or_pos';"); } catch (e) { /* already exists */ }
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS kv_store (
        k          TEXT PRIMARY KEY,
        v          TEXT NOT NULL,
        expires_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_kv_expires ON kv_store(expires_at);

      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        user_id INTEGER,
        author_name TEXT NOT NULL,
        city TEXT,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        text TEXT NOT NULL,
        is_verified INTEGER DEFAULT 0,
        status TEXT DEFAULT 'approved',
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, status);

      INSERT OR IGNORE INTO reviews (id, product_id, author_name, city, rating, text, is_verified, status, created_at) VALUES
        (1, 'p1', 'Тимур Ш.', 'Ташкент', 5, 'Заказывали угловой комплект «Лагуна» для террасы. Доставили точно в срок, распаковали, помогли установить. Плетение безупречное, швы ровные, каркас монолитный.', 1, 'approved', 1751712000000),
        (2, 'p1', 'Наргиза М.', 'Ташкент', 5, 'Потрясающий диван! Цвет «Вуди» идеально подошёл к нашей плитке. На солнце не нагревается, сидеть очень комфортно. Спасибо мастерской Bententrade!', 1, 'approved', 1751020800000),
        (3, 'p2', 'Сардор А.', 'Ташкент', 5, 'Покупали для летней террасы ресторана. Алюминиевый каркас невероятно удобен при ежедневной уборке - лёгкий, но монолитно устойчивый. Гости часто спрашивают, где брали.', 1, 'approved', 1750416000000),
        (4, 'p3', 'Елена В.', 'Бухара', 5, 'Превосходная работа! Плетение монолитное, ни одного торчащего хвостика. Доставили в Бухару без единой царапины. Всем рекомендую Bententrade как надёжного производителя в Узбекистане.', 1, 'approved', 1749811200000);

      INSERT OR IGNORE INTO settings (key, value) VALUES
        ('sms_provider', 'disabled'),
        ('sms_from', '4546'),
        ('sms_notify_created', '1'),
        ('sms_notify_status', '1'),
        ('sms_tpl_created', 'Bententrade: Ваш заказ #{order_id} на сумму {total} принят! Скоро свяжемся.'),
        ('sms_tpl_shipped', 'Bententrade: Заказ #{order_id} передан в доставку курьеру. Ожидайте звонка.'),
        ('sms_tpl_delivered', 'Bententrade: Заказ #{order_id} доставлен. Спасибо за выбор Bententrade!'),
        ('sms_tpl_cancelled', 'Bententrade: Заказ #{order_id} отменен. Свяжитесь с нами: +998 77 104 44 22');

    `);
    return;
  }
  // Ensure the dedicated schema exists before creating tables in it.
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${PG_SCHEMA}`);
  const schema = readFileSync(join(ROOT, "db", "schema.pg.sql"), "utf8");
  await pool.query(schema);
}

function loadFrontendData() {
  const sandbox: any = { window: {}, localStorage: { getItem: () => null, setItem: () => {} } };
  vm.createContext(sandbox);
  for (const f of ["assets/i18n.js", "assets/products.js"]) {
    const code = readFileSync(join(ROOT, f), "utf8");
    vm.runInContext(code, sandbox, { filename: f });
  }
  return {
    I18N: sandbox.window.BTT_I18N,
    PRODUCTS: sandbox.window.BTT_PRODUCTS,
    CAT: sandbox.window.BTT_PRODUCT_CAT,
  };
}

/** Seed products/articles/settings from the front-end data if the DB is empty. */
export async function seedIfEmpty() {
  if (isSqlite) {
    const row = sqliteDb.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number };
    if ((row?.n ?? 0) > 0) return false;
    const seedSql = readFileSync(join(ROOT, "migrations", "seed.sql"), "utf8");
    sqliteDb.exec(seedSql);
    return true;
  }
  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM products");
  if ((rows[0]?.n ?? 0) > 0) return false;

  const { I18N, PRODUCTS, CAT } = loadFrontendData();
  if (!PRODUCTS) return false;
  const LANGS = ["ru", "uz", "en"] as const;
  const ids = Object.keys(PRODUCTS).sort((a, b) => +a.slice(1) - +b.slice(1));

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const p = PRODUCTS[id];
      const cat = CAT[p.cat] || {};
      await client.query(
        `INSERT INTO products (id, category, look, price_now, price_old, default_size, active, sort)
         VALUES ($1,$2,$3,$4,$5,$6,1,$7)
         ON CONFLICT (id) DO UPDATE SET category=excluded.category, look=excluded.look,
           price_now=excluded.price_now, price_old=excluded.price_old,
           default_size=excluded.default_size, sort=excluded.sort`,
        [id, p.cat, p.look ?? null, +p.now || 0, +p.old || 0, +(cat.defSize || 0), i],
      );
      for (const lang of LANGS) {
        const dict = I18N[lang] || {};
        const name = dict[`${id}.name`] || "";
        const catLabel = dict[`${id}.cat`] || "";
        const t = cat[lang] || cat.ru || {};
        const desc = t.desc || "";
        const sizesObj = cat.sizes;
        const sizes = Array.isArray(sizesObj) ? sizesObj : (sizesObj && (sizesObj[lang] || sizesObj.ru)) || [];
        const specs = { mat: t.mat, dim: t.dim, fin: t.fin, wt: t.wt, seat: t.seat, made: t.made };
        await client.query(
          `INSERT INTO product_i18n (product_id, lang, name, category_label, description, sizes, specs)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (product_id, lang) DO UPDATE SET name=excluded.name,
             category_label=excluded.category_label, description=excluded.description,
             sizes=excluded.sizes, specs=excluded.specs`,
          [id, lang, name, catLabel, desc, JSON.stringify(sizes), JSON.stringify(specs)],
        );
      }
    }

    // Sample article for the blog + CRM.
    await client.query(
      `INSERT INTO articles (slug, status, published_at) VALUES ('iskusstvennyy-rotang','published', now())
       ON CONFLICT (slug) DO NOTHING`,
    );
    const art = await client.query("SELECT id FROM articles WHERE slug = 'iskusstvennyy-rotang'");
    const aid = art.rows[0]?.id;
    const art1: Record<string, { title: string; excerpt: string; body: string }> = {
      ru: { title: "Что такое искусственный ротанг", excerpt: "Разбираемся, из чего сделано плетение и почему оно служит годами.", body: "Искусственный ротанг - это прочное волокно, окрашенное в массе. Оно не выгорает на солнце, не боится влаги и мороза и не требует особого ухода." },
      uz: { title: "Sun'iy rotang nima", excerpt: "To'quv nimadan tayyorlangani va nega yillar xizmat qilishini ko'ramiz.", body: "Sun'iy rotang - massasiga bo'yalgan mustahkam tola. Quyoshda rangi o'chmaydi, namlik va sovuqdan qo'rqmaydi va alohida parvarish talab qilmaydi." },
      en: { title: "What is synthetic rattan", excerpt: "A look at what the weave is made of and why it lasts for years.", body: "Synthetic rattan is a durable fibre dyed all the way through. It won't fade in the sun, isn't afraid of moisture or frost and needs no special care." },
    };
    if (aid) {
      for (const lang of LANGS) {
        const a = art1[lang];
        await client.query(
          `INSERT INTO article_i18n (article_id, lang, title, excerpt, body) VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (article_id, lang) DO NOTHING`,
          [aid, lang, a.title, a.excerpt, a.body],
        );
      }
    }

    for (const [k, v] of [
      ["phone", "+998 77 104 44 22"],
      ["whatsapp", "998771044422"],
      ["telegram", "bententradeuz"],
      ["email", "hello@bententrade.uz"],
    ]) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING`,
        [k, v],
      );
    }
    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
