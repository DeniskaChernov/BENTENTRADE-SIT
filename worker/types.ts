/** Cloudflare bindings + environment for the BTT Worker. */
export interface Env {
  /** Static assets (the existing HTML/CSS/JS site at repo root). */
  ASSETS: Fetcher;
  /** D1 relational database. */
  DB: D1Database;
  /** KV namespace for auth sessions. */
  SESSIONS: KVNamespace;
  /** R2 bucket for media (product photos, article images). */
  MEDIA?: R2Bucket;

  /** Public site origin, e.g. https://btt.uz */
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

/** Extensible product types (simple, bundle, material). */
export type ProductType = "simple" | "bundle" | "material" | string;

/** Extensible product sale units (pcs, set, kg). */
export type ProductUnit = "pcs" | "set" | "kg" | string;

/** Dynamic category definition. */
export type ProductCategory = string;

/** Unified authoritative product DTO / Master record. */
export interface ProductMasterRecord {
  id: string; // canonical slug, e.g. "stul-vertex"
  category: ProductCategory;
  category_label?: string;
  product_type?: ProductType;
  unit?: ProductUnit;
  look?: string | null;
  price_now: number;
  price_old?: number;
  default_size?: number;
  active: number;
  sort: number;
  featured?: number;
  availability: ProductAvailability;
  created_at?: string;
  updated_at?: string;
}

/** Product variant (e.g. real confirmed color with photos). */
export interface ProductVariant {
  id?: number;
  product_id: string;
  variant_code: string;
  name_ru: string;
  name_uz?: string | null;
  name_en?: string | null;
  hex?: string | null;
  price_modifier?: number;
  image?: string | null;
  images?: string[];
  active?: number;
  sort?: number;
}

/** Bundle component relationship. */
export interface BundleItem {
  id?: number;
  bundle_product_id: string;
  component_product_id: string;
  quantity: number;
  sort?: number;
  component_name?: string;
  component_price?: number;
  component_image?: string;
}

/** Dynamic Category with localized fields. */
export interface CategoryRecord {
  id: number;
  slug: string;
  parent_id?: number | null;
  active: number;
  sort: number;
  image?: string | null;
  name?: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  product_count?: number;
}
