import fs from "node:fs";

const master = JSON.parse(fs.readFileSync("data/products-master.json", "utf8"));

let sql = `-- Migration 0005: Catalog and CMS Architecture Expansion
-- Dynamic Categories, Product Types, Units, Variants/Colors, Bundles, and Homepage Merchandising

-- 1. Dynamic Categories
CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  parent_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  active      INTEGER NOT NULL DEFAULT 1,
  sort        INTEGER NOT NULL DEFAULT 0,
  image       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

CREATE TABLE IF NOT EXISTS category_i18n (
  category_id     INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  lang            TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  seo_title       TEXT,
  seo_description TEXT,
  PRIMARY KEY (category_id, lang)
);

-- 2. Seed Default Categories
`;

const cats = [
  { id: 1, slug: "wicker-chairs", sort: 10, image: "assets/prod-chair-vertex.jpg",
    ru: { name: "Плетёные стулья", desc: "Стулья из искусственного ротанга на металлокаркасе с подушками.", seo_t: "Купить плетёные стулья в Ташкенте - BTT", seo_d: "Плетёные стулья из искусственного ротанга от BTT. Доставка по Ташкенту и Узбекистану." },
    uz: { name: "To‘qilgan stullar", desc: "Metall karkasli va yostiqchali sun‘iy rotang stullari.", seo_t: "Toshkentda to‘qilgan stullar sotib olish - BTT", seo_d: "BTT dan sun‘iy rotang to‘qilgan stullari. Toshkent va butun O‘zbekiston bo‘ylab yetkazish." },
    en: { name: "Wicker chairs", desc: "Synthetic wicker chairs on metal frames with soft cushions.", seo_t: "Buy Wicker Chairs in Tashkent - BTT", seo_d: "Wicker chairs by BTT. Delivery across Tashkent and Uzbekistan." }
  },
  { id: 2, slug: "plastic-chairs", sort: 20, image: "assets/prod-chair-roero-white.jpg",
    ru: { name: "Пластиковые стулья", desc: "Практичные стулья из первичного ударопрочного полипропилена.", seo_t: "Купить пластиковые стулья в Ташкенте - BTT", seo_d: "Пластиковые стулья Roero, Noero, Todo, Jardin от BTT. Доставка по Ташкенту." },
    uz: { name: "Plastik stullar", desc: "Birlamchi polipropilendan tayyorlangan amaliy stullar.", seo_t: "Toshkentda plastik stullar sotib olish - BTT", seo_d: "BTT dan sifatli plastik stullar. Toshkent bo‘ylab yetkazib berish." },
    en: { name: "Plastic chairs", desc: "Modern chairs crafted from high-grade virgin polypropylene.", seo_t: "Buy Plastic Chairs in Tashkent - BTT", seo_d: "Plastic chairs by BTT. Delivery across Tashkent and Uzbekistan." }
  },
  { id: 4, slug: "tables", sort: 40, image: "assets/prod-table-taper-80-scene.jpg",
    ru: { name: "Обеденные столы", desc: "Столы на металлокаркасе со столешницей из ЛДСП.", seo_t: "Купить обеденные столы в Ташкенте - BTT", seo_d: "Обеденные столы Taper, Vertex, Corda от BTT. Размеры 80x80, 135x80, круглые." },
    uz: { name: "Ovqat stollari", desc: "LDSP ustki qismli va metall karkasli mustahkam stollar.", seo_t: "Toshkentda ovqat stollari sotib olish - BTT", seo_d: "BTT dan to‘rtburchak va dumaloq ovqat stollari." },
    en: { name: "Dining tables", desc: "Dining tables on metal frames with chipboard tops.", seo_t: "Buy Dining Tables in Tashkent - BTT", seo_d: "Dining tables by BTT. Dimensions 80x80, 135x80 and round D90." }
  },
  { id: 5, slug: "sets", sort: 50, image: "assets/hero-garden-furniture.png",
    ru: { name: "Комплекты мебели", desc: "Готовые обеденные группы из столов и стульев для дома и террасы.", seo_t: "Купить комплекты мебели в Ташкенте - BTT", seo_d: "Готовые мебельные комплекты от BTT. Доставка по Ташкенту и Узбекистану." },
    uz: { name: "Mebel to‘plamlari", desc: "Uy va veranda uchun stol va stullardan iborat tayyor to‘plamlar.", seo_t: "Toshkentda mebel to‘plamlari sotib olish - BTT", seo_d: "BTT dan tayyor stol va stul to‘plamlari." },
    en: { name: "Furniture sets", desc: "Ready-to-use dining sets of tables and matching chairs.", seo_t: "Buy Furniture Sets in Tashkent - BTT", seo_d: "Furniture dining sets by BTT." }
  },
  { id: 6, slug: "lamps", sort: 60, image: "",
    ru: { name: "Декоративные лампы", desc: "3D-печатные дизайнерские светильники и настольные лампы.", seo_t: "Купить декоративные лампы в Ташкенте - BTT", seo_d: "Дизайнерские 3D-печатные декоративные лампы от BTT." },
    uz: { name: "Dekorativ lampalar", desc: "3D-bosma dizaynerlik chiroqlari va stol lampalari.", seo_t: "Toshkentda dekorativ lampalar sotib olish - BTT", seo_d: "BTT dan dizaynerlik lampalari." },
    en: { name: "Decorative lamps", desc: "3D-printed designer lamps and ambient light fixtures.", seo_t: "Buy Decorative Lamps in Tashkent - BTT", seo_d: "3D-printed decorative lamps by BTT." }
  },
  { id: 7, slug: "planters", sort: 70, image: "",
    ru: { name: "Кашпо", desc: "Стильные напольные и подвесные кашпо для интерьера и сада.", seo_t: "Купить кашпо в Ташкенте - BTT", seo_d: "Кашпо для растений и цветов от BTT." },
    uz: { name: "Kashpo", desc: "Interyer va bog‘ uchun zamonaviy guldonlar va kashpolar.", seo_t: "Toshkentda kashpo sotib olish - BTT", seo_d: "BTT dan sifatli guldonlar va kashpo." },
    en: { name: "Planters", desc: "Modern planters and flower pots for home and garden.", seo_t: "Buy Planters in Tashkent - BTT", seo_d: "Planters for indoor and outdoor greenery by BTT." }
  },
  { id: 8, slug: "rattan", sort: 80, image: "",
    ru: { name: "Искусственный ротанг", desc: "Высококачественный искусственный полимерный ротанг в бухтах.", seo_t: "Купить искусственный ротанг в Ташкенте - BTT", seo_d: "Искусственный ротанг для плетения мебели от BTT. Продажа в килограммах." },
    uz: { name: "Sun‘iy rotang", desc: "Mebel to‘qish uchun polimer sun‘iy rotang.", seo_t: "Toshkentda sun‘iy rotang sotib olish - BTT", seo_d: "BTT dan sifatli sun‘iy rotang xomashyosi." },
    en: { name: "Artificial rattan", desc: "High-quality synthetic rattan polymer profiles for furniture weaving.", seo_t: "Buy Synthetic Rattan in Tashkent - BTT", seo_d: "Synthetic rattan profiles by BTT. Sold per kg." }
  }
];

cats.forEach(c => {
  sql += `INSERT OR IGNORE INTO categories (id, slug, active, sort, image) VALUES (${c.id}, '${c.slug}', 1, ${c.sort}, '${c.image}');\n`;
  ["ru", "uz", "en"].forEach(l => {
    const d = c[l];
    sql += `INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (${c.id}, '${l}', '${d.name.replace(/'/g, "''")}', '${d.desc.replace(/'/g, "''")}', '${d.seo_t.replace(/'/g, "''")}', '${d.seo_d.replace(/'/g, "''")}');\n`;
  });
});

sql += `
-- 3. Extend Products Table with Product Types, Units, and Merchandising Columns
ALTER TABLE products ADD COLUMN product_type TEXT NOT NULL DEFAULT 'simple';
ALTER TABLE products ADD COLUMN unit TEXT NOT NULL DEFAULT 'pcs';
ALTER TABLE products ADD COLUMN featured INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN updated_at TEXT DEFAULT NULL;
UPDATE products SET updated_at = datetime('now') WHERE updated_at IS NULL;

-- 4. Product Variants (Real Confirmed Colors / Options)
CREATE TABLE IF NOT EXISTS product_variants (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id      TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_code    TEXT NOT NULL,
  name_ru         TEXT NOT NULL,
  name_uz         TEXT,
  name_en         TEXT,
  hex             TEXT,
  price_modifier  INTEGER NOT NULL DEFAULT 0,
  image           TEXT,
  images          TEXT,
  active          INTEGER NOT NULL DEFAULT 1,
  sort            INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(product_id, variant_code)
);
CREATE INDEX IF NOT EXISTS idx_product_variants_prod ON product_variants(product_id);

-- Populate Confirmed Colors for Existing 16 Canonical Products
`;

master.forEach((p) => {
  const colors = p.confirmedColors || [];
  colors.forEach((c, cIdx) => {
    const code = c.id;
    const ru = (c.name && c.name.ru) || code;
    const uz = (c.name && c.name.uz) || ru;
    const en = (c.name && c.name.en) || ru;
    const hex = c.hex || "";
    const img = c.image || "";
    const imgsJson = JSON.stringify(c.images || (c.image ? [c.image] : [])).replace(/'/g, "''");
    sql += `INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('${p.slug}', '${code}', '${ru.replace(/'/g, "''")}', '${uz.replace(/'/g, "''")}', '${en.replace(/'/g, "''")}', '${hex}', '${img}', '${imgsJson}', 1, ${(cIdx + 1) * 10});\n`;
  });
});

sql += `
-- 5. Bundle Items (Relationships for Bundle Products)
CREATE TABLE IF NOT EXISTS bundle_items (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  bundle_product_id     TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  component_product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity              INTEGER NOT NULL DEFAULT 1,
  sort                  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_items(bundle_product_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_component ON bundle_items(component_product_id);

-- 6. Homepage Merchandising Sections
CREATE TABLE IF NOT EXISTS homepage_sections (
  id           TEXT PRIMARY KEY,
  type         TEXT NOT NULL,
  title_ru     TEXT,
  title_uz     TEXT,
  title_en     TEXT,
  subtitle_ru  TEXT,
  subtitle_uz  TEXT,
  subtitle_en  TEXT,
  active       INTEGER NOT NULL DEFAULT 1,
  sort         INTEGER NOT NULL DEFAULT 0,
  config       TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS homepage_section_items (
  section_id   TEXT NOT NULL REFERENCES homepage_sections(id) ON DELETE CASCADE,
  item_type    TEXT NOT NULL,
  item_id      TEXT NOT NULL,
  sort         INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (section_id, item_type, item_id)
);

INSERT OR IGNORE INTO homepage_sections (id, type, title_ru, title_uz, title_en, active, sort) VALUES
  ('categories', 'categories', 'Категории мебели', 'Mebel toifalari', 'Furniture Categories', 1, 10),
  ('featured', 'featured', 'Популярные модели', 'Ommabop modellar', 'Popular Models', 1, 20),
  ('sets', 'bundles', 'Готовые комплекты', 'Tayyor to‘plamlar', 'Furniture Sets', 1, 30);
`;

fs.writeFileSync("migrations/0005_catalog_cms_expansion.sql", sql, "utf8");
console.log("Wrote migrations/0005_catalog_cms_expansion.sql, length:", sql.length);
