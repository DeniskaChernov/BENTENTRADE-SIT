/** Cloudflare bindings + environment for the Bententrade Worker. */
export interface Env {
  /** Static assets (the existing HTML/CSS/JS site at repo root). */
  ASSETS: Fetcher;
  /** D1 relational database. */
  DB: D1Database;
  /** KV namespace for auth sessions. */
  SESSIONS: KVNamespace;
  /** R2 bucket for media (product photos, article images). */
  MEDIA?: R2Bucket;

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

/** Product availability status unified model. */
export type ProductAvailability = "unknown" | "in_stock" | "low_stock" | "out_of_stock" | "on_request";

/** 4 canonical categories for storefront and CMS. */
export type ProductCategory = "wicker-chairs" | "plastic-chairs" | "upholstered-chairs" | "tables";

/** Single Source of Truth canonical product record. */
export interface ProductMasterRecord {
  id: string; // canonical slug, e.g. "stul-vertex"
  category: ProductCategory;
  look?: string | null;
  price_now: number;
  price_old?: number;
  default_size?: number;
  active: number;
  sort: number;
  availability: ProductAvailability;
  created_at?: string;
}

/** Architecture definition for Sets (4 chairs + 1 table), referencing canonical product IDs without data duplication. */
export interface ProductSet {
  id: string; // e.g. "set-taper-corda-4"
  slug: string;
  chairProductId: string; // canonical slug of chair SKU
  chairQuantity: number;  // e.g. 4
  tableProductId: string; // canonical slug of table SKU
  tableQuantity: number;  // e.g. 1
  price: number;
  active: number;
  sort: number;
  created_at?: string;
}
