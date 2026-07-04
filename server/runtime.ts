/* ============================================================
   BENTENTRADE — Node/Railway runtime.
   Provides drop-in replacements for the Cloudflare bindings the
   Hono routes expect (c.env.DB / c.env.SESSIONS / c.env.MEDIA),
   backed by PostgreSQL and the local filesystem, so the existing
   worker/routes/*.ts run unchanged.
   ============================================================ */
import "dotenv/config";
import pg from "pg";
import { readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join, dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/* --- keep TIMESTAMPTZ/ TIMESTAMP as "YYYY-MM-DD HH:MM:SS" strings (SQLite-like) --- */
pg.types.setTypeParser(1114, (v) => (v == null ? v : String(v).slice(0, 19)));
pg.types.setTypeParser(1184, (v) => (v == null ? v : String(v).slice(0, 19)));

const connectionString = process.env.DATABASE_URL;
const ssl =
  process.env.DATABASE_SSL === "true" || /[?&]sslmode=require/.test(connectionString || "")
    ? { rejectUnauthorized: false }
    : undefined;

export const pool = new pg.Pool({ connectionString, ssl, max: 8 });
pool.on("connect", (client) => {
  client.query("SET TIME ZONE 'UTC'").catch(() => {});
});

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
  // D1 semantics: bind() returns a NEW immutable statement (routes rely on this
  // when reusing one prepared statement across a batch).
  bind(...args: unknown[]) {
    return new Stmt(this.sql, args);
  }
  async all<T = any>() {
    const { text } = buildQuery(this.sql, this.params);
    const r = await pool.query(text, this.params as any[]);
    return { results: r.rows as T[] };
  }
  async first<T = any>() {
    const { text } = buildQuery(this.sql, this.params);
    const r = await pool.query(text, this.params as any[]);
    return (r.rows[0] as T) ?? null;
  }
  async run() {
    return execRun(this.sql, this.params);
  }
}

const DB = {
  prepare(sql: string) {
    return new Stmt(sql);
  },
  async batch(stmts: Stmt[]) {
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
    const r = await pool.query(
      "SELECT v FROM kv_store WHERE k = $1 AND (expires_at IS NULL OR expires_at > now())",
      [k],
    );
    return r.rows[0] ? (r.rows[0].v as string) : null;
  },
  async put(k: string, v: string, opts?: { expirationTtl?: number }) {
    const ttl = opts && opts.expirationTtl ? Math.floor(Number(opts.expirationTtl)) : 0;
    const exp = ttl > 0 ? `now() + interval '${ttl} seconds'` : "NULL";
    await pool.query(
      `INSERT INTO kv_store (k, v, expires_at) VALUES ($1, $2, ${exp})
       ON CONFLICT (k) DO UPDATE SET v = excluded.v, expires_at = excluded.expires_at`,
      [k, v],
    );
  },
  async delete(k: string) {
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
      ru: { title: "Что такое искусственный ротанг", excerpt: "Разбираемся, из чего сделано плетение и почему оно служит годами.", body: "Искусственный ротанг — это прочное волокно, окрашенное в массе. Оно не выгорает на солнце, не боится влаги и мороза и не требует особого ухода." },
      uz: { title: "Sun'iy rotang nima", excerpt: "To'quv nimadan tayyorlangani va nega yillar xizmat qilishini ko'ramiz.", body: "Sun'iy rotang — massasiga bo'yalgan mustahkam tola. Quyoshda rangi o'chmaydi, namlik va sovuqdan qo'rqmaydi va alohida parvarish talab qilmaydi." },
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
      ["phone", "+998 71 200 18 46"],
      ["whatsapp", "998712001846"],
      ["telegram", "bententrade"],
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
