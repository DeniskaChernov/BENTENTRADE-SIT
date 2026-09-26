-- Migration 0003: Product aliases for backward compatibility and deduplication of products table.

CREATE TABLE IF NOT EXISTS product_aliases (
  alias      TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_product_aliases_product ON product_aliases(product_id);

-- Populate 15 canonical alias mappings
INSERT OR REPLACE INTO product_aliases (alias, product_id) VALUES
  ('p1', 'stul-vertex'),
  ('p2', 'stul-corda'),
  ('p3', 'stul-roero'),
  ('p4', 'stul-noero'),
  ('p5', 'stul-todo'),
  ('p6', 'stul-jardin'),
  ('p7', 'stul-lira'),
  ('p8', 'kreslo-como'),
  ('p9', 'stol-taper-rotang-80'),
  ('p10', 'stol-vertex-d90'),
  ('p11', 'stol-taper-rotang-135'),
  ('p12', 'stol-taper-80'),
  ('p13', 'stol-vertex-80'),
  ('p14', 'stol-taper-135'),
  ('p15', 'stol-corda-135');

-- Migrate any existing order items from legacy alias to canonical slug
UPDATE order_items
SET product_id = (
  SELECT product_id FROM product_aliases WHERE product_aliases.alias = order_items.product_id
)
WHERE product_id IN (SELECT alias FROM product_aliases);

-- Remove legacy alias duplicates from products, product_i18n, and media
DELETE FROM media WHERE product_id IN (SELECT alias FROM product_aliases);
DELETE FROM product_i18n WHERE product_id IN (SELECT alias FROM product_aliases);
DELETE FROM products WHERE id IN (SELECT alias FROM product_aliases);
