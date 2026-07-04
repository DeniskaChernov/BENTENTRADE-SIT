-- Bententrade — initial schema (D1 / SQLite)

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'customer',
  newsletter    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS addresses (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      TEXT,
  recipient  TEXT,
  phone      TEXT,
  city       TEXT,
  line       TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

CREATE TABLE IF NOT EXISTS products (
  id           TEXT PRIMARY KEY,
  category     TEXT NOT NULL,
  look         TEXT,
  price_now    INTEGER NOT NULL DEFAULT 0,
  price_old    INTEGER NOT NULL DEFAULT 0,
  default_size INTEGER NOT NULL DEFAULT 0,
  active       INTEGER NOT NULL DEFAULT 1,
  sort         INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category);

CREATE TABLE IF NOT EXISTS product_i18n (
  product_id     TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lang           TEXT NOT NULL,
  name           TEXT,
  category_label TEXT,
  description    TEXT,
  sizes          TEXT,  -- JSON array
  specs          TEXT,  -- JSON object {mat,dim,fin,wt,seat,made}
  PRIMARY KEY (product_id, lang)
);

CREATE TABLE IF NOT EXISTS media (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  key        TEXT NOT NULL,       -- R2 object key
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  article_id INTEGER,
  alt        TEXT,
  sort       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_media_product ON media(product_id);

CREATE TABLE IF NOT EXISTS orders (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id      TEXT NOT NULL UNIQUE,
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name  TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  address        TEXT,
  comment        TEXT,
  lang           TEXT,
  currency       TEXT NOT NULL DEFAULT '$',
  total          INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'new',
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT,
  name       TEXT,
  unit_price INTEGER NOT NULL DEFAULT 0,
  qty        INTEGER NOT NULL DEFAULT 1,
  options    TEXT   -- JSON {size, finish}
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS contact_requests (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT,
  phone      TEXT,
  email      TEXT,
  message    TEXT,
  lang       TEXT,
  status     TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_requests(status);

CREATE TABLE IF NOT EXISTS articles (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  cover_media  TEXT,
  status       TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);

CREATE TABLE IF NOT EXISTS article_i18n (
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  lang       TEXT NOT NULL,
  title      TEXT,
  excerpt    TEXT,
  body       TEXT,
  PRIMARY KEY (article_id, lang)
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);
