/** Cloudflare bindings + environment for the Bententrade Worker. */
export interface Env {
  /** Static assets (the existing HTML/CSS/JS site at repo root). */
  ASSETS: Fetcher;
  /** D1 relational database. */
  DB: D1Database;
  /** KV namespace for auth sessions. */
  SESSIONS: KVNamespace;
  /** R2 bucket for media (product photos, article images). */
  MEDIA: R2Bucket;

  /** Public site origin, e.g. https://bententrade.uz */
  SITE_ORIGIN: string;

  /** Secrets (set via `wrangler secret put ...`). All optional at runtime. */
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  /** One-time token that allows promoting the first admin via /api/auth/bootstrap-admin. */
  ADMIN_BOOTSTRAP_TOKEN?: string;
}

export type SessionData = {
  userId: number;
  role: "customer" | "admin";
  createdAt: number;
};

/** Hono context variables. */
export type Variables = {
  session: SessionData | null;
  sessionId: string | null;
};
