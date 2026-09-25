-- Reviews migration for Bententrade
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  user_id INTEGER,
  author_name TEXT NOT NULL,
  city TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  is_verified INTEGER DEFAULT 0,
  status TEXT DEFAULT 'approved', -- 'approved' | 'pending' | 'rejected'
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, status);
