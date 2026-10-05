-- Migration 0005: Catalog and CMS Architecture Expansion
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
INSERT OR IGNORE INTO categories (id, slug, active, sort, image) VALUES (1, 'wicker-chairs', 1, 10, 'assets/prod-chair-vertex.jpg');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (1, 'ru', 'Плетёные стулья', 'Стулья из искусственного ротанга на металлокаркасе с подушками.', 'Купить плетёные стулья в Ташкенте - BTT', 'Плетёные стулья из искусственного ротанга от BTT. Доставка по Ташкенту и Узбекистану.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (1, 'uz', 'To‘qilgan stullar', 'Metall karkasli va yostiqchali sun‘iy rotang stullari.', 'Toshkentda to‘qilgan stullar sotib olish - BTT', 'BTT dan sun‘iy rotang to‘qilgan stullari. Toshkent va butun O‘zbekiston bo‘ylab yetkazish.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (1, 'en', 'Wicker chairs', 'Synthetic wicker chairs on metal frames with soft cushions.', 'Buy Wicker Chairs in Tashkent - BTT', 'Wicker chairs by BTT. Delivery across Tashkent and Uzbekistan.');
INSERT OR IGNORE INTO categories (id, slug, active, sort, image) VALUES (2, 'plastic-chairs', 1, 20, 'assets/prod-chair-roero-white.jpg');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (2, 'ru', 'Пластиковые стулья', 'Практичные стулья из первичного ударопрочного полипропилена.', 'Купить пластиковые стулья в Ташкенте - BTT', 'Пластиковые стулья Roero, Noero, Todo, Jardin от BTT. Доставка по Ташкенту.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (2, 'uz', 'Plastik stullar', 'Birlamchi polipropilendan tayyorlangan amaliy stullar.', 'Toshkentda plastik stullar sotib olish - BTT', 'BTT dan sifatli plastik stullar. Toshkent bo‘ylab yetkazib berish.');
INSERT OR IGNORE INTO categories (id, slug, active, sort, image) VALUES (3, 'lighting', 1, 30, 'assets/prod-lamp-nova.svg');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (3, 'ru', 'Настольные лампы', 'Дизайнерские настольные лампы с мягким тёплым светом.', 'Купить настольные лампы в Ташкенте - BTT', 'Настольные лампы Nova, Sora, Vela, Runa, Liva, Aria от BTT.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (3, 'uz', 'Stol lampalari', 'Yumshoq iliq nurli zamonaviy stol lampalari.', 'Toshkentda stol lampalari sotib olish - BTT', 'BTT dan sifatli dizaynerlik stol lampalari.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (3, 'en', 'Table lamps', 'Designer table lamps with ambient warm illumination.', 'Buy Table Lamps in Tashkent - BTT', 'Table lamps Nova, Sora, Vela, Runa, Liva, Aria by BTT.');
INSERT OR IGNORE INTO categories (id, slug, active, sort, image) VALUES (4, 'tables', 1, 40, 'assets/prod-table-taper-80-scene.jpg');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (4, 'ru', 'Обеденные столы', 'Столы на металлокаркасе со столешницей из ЛДСП.', 'Купить обеденные столы в Ташкенте - BTT', 'Обеденные столы Taper, Vertex, Corda от BTT. Размеры 80x80, 135x80, круглые.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (4, 'uz', 'Ovqat stollari', 'LDSP ustki qismli va metall karkasli mustahkam stollar.', 'Toshkentda ovqat stollari sotib olish - BTT', 'BTT dan to‘rtburchak va dumaloq ovqat stollari.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (4, 'en', 'Dining tables', 'Dining tables on metal frames with chipboard tops.', 'Buy Dining Tables in Tashkent - BTT', 'Dining tables by BTT. Dimensions 80x80, 135x80 and round D90.');
INSERT OR IGNORE INTO categories (id, slug, active, sort, image) VALUES (5, 'sets', 1, 50, 'assets/hero-garden-furniture.png');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (5, 'ru', 'Комплекты мебели', 'Готовые обеденные группы из столов и стульев для дома и террасы.', 'Купить комплекты мебели в Ташкенте - BTT', 'Готовые мебельные комплекты от BTT. Доставка по Ташкенту и Узбекистану.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (5, 'uz', 'Mebel to‘plamlari', 'Uy va veranda uchun stol va stullardan iborat tayyor to‘plamlar.', 'Toshkentda mebel to‘plamlari sotib olish - BTT', 'BTT dan tayyor stol va stul to‘plamlari.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (5, 'en', 'Furniture sets', 'Ready-to-use dining sets of tables and matching chairs.', 'Buy Furniture Sets in Tashkent - BTT', 'Furniture dining sets by BTT.');
INSERT OR IGNORE INTO categories (id, slug, active, sort, image) VALUES (6, 'lamps', 1, 60, '');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (6, 'ru', 'Декоративные лампы', '3D-печатные дизайнерские светильники и настольные лампы.', 'Купить декоративные лампы в Ташкенте - BTT', 'Дизайнерские 3D-печатные декоративные лампы от BTT.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (6, 'uz', 'Dekorativ lampalar', '3D-bosma dizaynerlik chiroqlari va stol lampalari.', 'Toshkentda dekorativ lampalar sotib olish - BTT', 'BTT dan dizaynerlik lampalari.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (6, 'en', 'Decorative lamps', '3D-printed designer lamps and ambient light fixtures.', 'Buy Decorative Lamps in Tashkent - BTT', '3D-printed decorative lamps by BTT.');
INSERT OR IGNORE INTO categories (id, slug, active, sort, image) VALUES (7, 'planters', 1, 70, '');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (7, 'ru', 'Кашпо', 'Стильные напольные и подвесные кашпо для интерьера и сада.', 'Купить кашпо в Ташкенте - BTT', 'Кашпо для растений и цветов от BTT.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (7, 'uz', 'Kashpo', 'Interyer va bog‘ uchun zamonaviy guldonlar va kashpolar.', 'Toshkentda kashpo sotib olish - BTT', 'BTT dan sifatli guldonlar va kashpo.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (7, 'en', 'Planters', 'Modern planters and flower pots for home and garden.', 'Buy Planters in Tashkent - BTT', 'Planters for indoor and outdoor greenery by BTT.');
INSERT OR IGNORE INTO categories (id, slug, active, sort, image) VALUES (8, 'rattan', 1, 80, '');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (8, 'ru', 'Искусственный ротанг', 'Высококачественный искусственный полимерный ротанг в бухтах.', 'Купить искусственный ротанг в Ташкенте - BTT', 'Искусственный ротанг для плетения мебели от BTT. Продажа в килограммах.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (8, 'uz', 'Sun‘iy rotang', 'Mebel to‘qish uchun polimer sun‘iy rotang.', 'Toshkentda sun‘iy rotang sotib olish - BTT', 'BTT dan sifatli sun‘iy rotang xomashyosi.');
INSERT OR REPLACE INTO category_i18n (category_id, lang, name, description, seo_title, seo_description) VALUES (8, 'en', 'Artificial rattan', 'High-quality synthetic rattan polymer profiles for furniture weaving.', 'Buy Synthetic Rattan in Tashkent - BTT', 'Synthetic rattan profiles by BTT. Sold per kg.');

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
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-vertex', 'beige', 'Бежевый', 'Bej', 'Beige', '#C2B280', 'assets/prod-chair-vertex.jpg', '["assets/prod-chair-vertex.jpg","assets/prod-chair-vertex-side.jpg","assets/prod-chair-vertex-detail-back.jpg","assets/prod-chair-vertex-detail-seat.jpg","assets/scene-dining-warm.png"]', 1, 10);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-corda', 'beige', 'Бежевый', 'Bej', 'Beige', '#C4A482', 'assets/prod-chair-corda.jpg', '["assets/prod-chair-corda.jpg","assets/prod-chair-corda-side.jpg","assets/prod-chair-corda-detail-back.jpg","assets/prod-chair-corda-detail-seat.jpg","assets/scene-dining-warm.png"]', 1, 10);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-roero', 'grey', 'Серый', 'Kulrang', 'Grey', '#808080', 'assets/prod-chair-roero.jpg', '["assets/prod-chair-roero.jpg","assets/prod-chair-roero-front.jpg","assets/prod-chair-roero-detail-back.jpg","assets/prod-chair-roero-detail-seat.jpg","assets/scene-dining-grey.png"]', 1, 10);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-roero', 'black', 'Чёрный', 'Qora', 'Black', '#222222', 'assets/prod-chair-roero-black.jpg', '["assets/prod-chair-roero-black.jpg","assets/prod-chair-roero-black-front.jpg","assets/prod-chair-roero-black-detail-back.jpg","assets/prod-chair-roero-black-detail-seat.jpg","assets/scene-dining-contrast.png"]', 1, 20);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-roero', 'white', 'Белый', 'Oq', 'White', '#FFFFFF', 'assets/prod-chair-roero-white.jpg', '["assets/prod-chair-roero-white.jpg","assets/prod-chair-roero-white-front.jpg","assets/prod-chair-roero-white-detail-back.jpg","assets/prod-chair-roero-white-detail-seat.jpg","assets/scene-dining-light.png"]', 1, 30);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-roero', 'orange', 'Оранжевый', 'To‘q sariq', 'Orange', '#D9633B', 'assets/prod-chair-roero-orange.jpg', '["assets/prod-chair-roero-orange.jpg","assets/prod-chair-roero-orange-front.jpg","assets/prod-chair-roero-orange-detail-back.jpg","assets/prod-chair-roero-orange-detail-seat.jpg","assets/scene-dining-warm.png"]', 1, 40);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-noero', 'cappuccino', 'Капучино', 'Kapuchino', 'Cappuccino', '#A88D73', 'assets/prod-chair-noero.jpg', '["assets/prod-chair-noero.jpg","assets/prod-chair-noero-detail-back.jpg","assets/prod-chair-noero-detail-seat.jpg","assets/prod-chair-noero-detail-leg.jpg","assets/scene-dining-beige.png"]', 1, 10);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-noero', 'blue', 'Синий', 'Ko‘k', 'Blue', '#4E7D9A', 'assets/prod-chair-noero-blue.jpg', '["assets/prod-chair-noero-blue.jpg","assets/prod-chair-noero-blue-back.jpg","assets/prod-chair-noero-blue-detail-back.jpg","assets/prod-chair-noero-blue-detail-seat.jpg","assets/scene-dining-azure.png"]', 1, 20);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-noero', 'orange', 'Оранжевый', 'To‘q sariq', 'Orange', '#D9633B', 'assets/prod-chair-noero-orange.jpg', '["assets/prod-chair-noero-orange.jpg","assets/prod-chair-noero-orange-back.jpg","assets/prod-chair-noero-orange-detail-back.jpg","assets/prod-chair-noero-orange-detail-seat.jpg","assets/scene-dining-warm.png"]', 1, 30);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-noero', 'olive', 'Оливковый', 'Zaytun', 'Olive', '#8A9364', 'assets/prod-chair-noero-olive.jpg', '["assets/prod-chair-noero-olive.jpg","assets/prod-chair-noero-olive-detail-back.jpg","assets/prod-chair-noero-olive-detail-seat.jpg","assets/scene-dining-teal.png"]', 1, 40);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-todo', 'black', 'Чёрный', 'Qora', 'Black', '#222222', 'assets/prod-chair-todo.jpg', '["assets/prod-chair-todo.jpg","assets/prod-chair-todo-side.jpg","assets/prod-chair-todo-detail-back.jpg","assets/prod-chair-todo-detail-seat.jpg","assets/scene-dining-contrast.png"]', 1, 10);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-todo', 'yellow', 'Жёлтый', 'Sariq', 'Yellow', '#EAA824', 'assets/prod-chair-todo-yellow.jpg', '["assets/prod-chair-todo-yellow.jpg","assets/prod-chair-todo-yellow-side.jpg","assets/prod-chair-todo-yellow-detail-back.jpg","assets/prod-chair-todo-yellow-detail-seat.jpg","assets/scene-dining-warm.png"]', 1, 20);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-todo', 'grey', 'Серый', 'Kulrang', 'Grey', '#808080', 'assets/prod-chair-todo-gray.jpg', '["assets/prod-chair-todo-gray.jpg","assets/prod-chair-todo-gray-side.jpg","assets/prod-chair-todo-gray-detail-back.jpg","assets/prod-chair-todo-gray-detail-seat.jpg","assets/scene-dining-grey.png"]', 1, 30);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-todo', 'red', 'Красный', 'Qizil', 'Red', '#E32626', 'assets/prod-chair-todo-red.jpg', '["assets/prod-chair-todo-red.jpg","assets/prod-chair-todo-red-side.jpg","assets/prod-chair-todo-red-detail-back.jpg","assets/prod-chair-todo-red-detail-seat.jpg","assets/scene-dining-warm.png"]', 1, 40);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-todo', 'coffee', 'Кофейный', 'Kofe', 'Coffee', '#9E7E6B', 'assets/prod-chair-todo-coffee.jpg', '["assets/prod-chair-todo-coffee.jpg","assets/prod-chair-todo-coffee-side.jpg","assets/prod-chair-todo-coffee-detail-back.jpg","assets/prod-chair-todo-coffee-detail-seat.jpg","assets/scene-dining-beige.png"]', 1, 50);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-todo', 'white', 'Белый', 'Oq', 'White', '#FFFFFF', 'assets/prod-chair-todo-white.jpg', '["assets/prod-chair-todo-white.jpg","assets/prod-chair-todo-white-side.jpg","assets/prod-chair-todo-white-detail-back.jpg","assets/prod-chair-todo-white-detail-seat.jpg","assets/scene-dining-light.png"]', 1, 60);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-todo-soft', 'black', 'Чёрный', 'Qora', 'Black', '#222222', 'assets/prod-chair-todo-soft.jpg', '["assets/prod-chair-todo-soft.jpg","assets/prod-chair-todo-soft-side.jpg","assets/prod-chair-todo-soft-detail-seat.jpg","assets/prod-chair-todo-soft-detail-back.jpg","assets/scene-dining-contrast.png"]', 1, 10);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-todo-soft', 'yellow', 'Жёлтый', 'Sariq', 'Yellow', '#EAA824', 'assets/prod-chair-todo-soft-yellow.jpg', '["assets/prod-chair-todo-soft-yellow.jpg","assets/prod-chair-todo-soft-yellow-side.jpg","assets/prod-chair-todo-soft-yellow-detail-seat.jpg","assets/prod-chair-todo-soft-yellow-detail-back.jpg","assets/scene-dining-warm.png"]', 1, 20);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-todo-soft', 'grey', 'Серый', 'Kulrang', 'Grey', '#808080', 'assets/prod-chair-todo-soft-gray.jpg', '["assets/prod-chair-todo-soft-gray.jpg","assets/prod-chair-todo-soft-gray-side.jpg","assets/prod-chair-todo-soft-gray-detail-seat.jpg","assets/prod-chair-todo-soft-gray-detail-back.jpg","assets/scene-dining-grey.png"]', 1, 30);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-todo-soft', 'red', 'Красный', 'Qizil', 'Red', '#E32626', 'assets/prod-chair-todo-soft-red.jpg', '["assets/prod-chair-todo-soft-red.jpg","assets/prod-chair-todo-soft-red-side.jpg","assets/prod-chair-todo-soft-red-detail-seat.jpg","assets/prod-chair-todo-soft-red-detail-back.jpg","assets/scene-dining-warm.png"]', 1, 40);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-todo-soft', 'coffee', 'Кофейный', 'Kofe', 'Coffee', '#9E7E6B', 'assets/prod-chair-todo-soft-coffee.jpg', '["assets/prod-chair-todo-soft-coffee.jpg","assets/prod-chair-todo-soft-coffee-side.jpg","assets/prod-chair-todo-soft-coffee-detail-seat.jpg","assets/prod-chair-todo-soft-coffee-detail-back.jpg","assets/scene-dining-beige.png"]', 1, 50);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-todo-soft', 'white', 'Белый', 'Oq', 'White', '#FFFFFF', 'assets/prod-chair-todo-soft-white.jpg', '["assets/prod-chair-todo-soft-white.jpg","assets/prod-chair-todo-soft-white-side.jpg","assets/prod-chair-todo-soft-white-detail-seat.jpg","assets/prod-chair-todo-soft-white-detail-back.jpg","assets/scene-dining-light.png"]', 1, 60);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-jardin', 'cappuccino', 'Капучино', 'Kapuchino', 'Cappuccino', '#A88D73', 'assets/prod-chair-jardin.jpg', '["assets/prod-chair-jardin.jpg","assets/prod-chair-jardin-back.jpg","assets/prod-chair-jardin-detail-seat.jpg","assets/scene-dining-warm.png"]', 1, 10);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-jardin', 'olive', 'Оливковый', 'Zaytun', 'Olive', '#768C65', 'assets/prod-chair-jardin-olive.jpg', '["assets/prod-chair-jardin-olive.jpg","assets/prod-chair-jardin-olive-back.jpg","assets/prod-chair-jardin-olive-detail-seat.jpg","assets/prod-chair-jardin-olive-detail-back.jpg","assets/hero-garden-furniture.png"]', 1, 20);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stul-jardin', 'grey', 'Серый', 'Kulrang', 'Grey', '#808080', 'assets/prod-chair-jardin-grey.jpg', '["assets/prod-chair-jardin-grey.jpg","assets/prod-chair-jardin-grey-back.jpg","assets/prod-chair-jardin-grey-detail-seat.jpg","assets/prod-chair-jardin-grey-detail-back.jpg","assets/scene-dining-grey.png"]', 1, 30);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stol-taper-rotang-80', 'white-marble', 'Белый мрамор', 'Oq marmar', 'White Marble', '#E8E6E1', 'assets/prod-table-taper-rotang-80-white.jpg', '["assets/prod-table-taper-rotang-80-white.jpg","assets/prod-table-taper-rotang-80-white-front.jpg","assets/prod-table-taper-rotang-80-detail-white.jpg","assets/prod-table-taper-rotang-80-detail-leg.jpg","assets/scene-dining-marble.png"]', 1, 10);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stol-taper-rotang-80', 'black-marble', 'Чёрный мрамор', 'Qora marmar', 'Black Marble', '#2B2A29', 'assets/prod-table-taper-rotang-80-black.jpg', '["assets/prod-table-taper-rotang-80-black.jpg","assets/prod-table-taper-rotang-80-black-front.jpg","assets/prod-table-taper-rotang-80-detail-black.jpg","assets/prod-table-taper-rotang-80-detail-leg.jpg","assets/scene-dining-contrast.png"]', 1, 20);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stol-vertex-d90', 'white-marble', 'Белый мрамор', 'Oq marmar', 'White Marble', '#E8E6E1', 'assets/prod-table-vertex-d90.jpg', '["assets/prod-table-vertex-d90.jpg","assets/prod-table-vertex-d90-detail-top.jpg","assets/prod-table-vertex-d90-detail-leg.jpg","assets/scene-dining-marble.png"]', 1, 10);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stol-vertex-d90', 'black-marble', 'Чёрный мрамор', 'Qora marmar', 'Black Marble', '#2B2A29', 'assets/prod-table-vertex-black.jpg', '["assets/prod-table-vertex-black.jpg","assets/prod-table-vertex-d90-detail-top.jpg","assets/prod-table-vertex-d90-detail-leg.jpg","assets/scene-dining-contrast.png"]', 1, 20);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stol-taper-rotang-135', 'white-marble', 'Белый мрамор', 'Oq marmar', 'White Marble', '#E8E6E1', 'assets/prod-table-taper-rotang-135-white.jpg', '["assets/prod-table-taper-rotang-135-white.jpg","assets/prod-table-taper-rotang-135-detail-side.jpg","assets/prod-table-taper-rotang-135-detail-top.jpg","assets/prod-table-taper-135-white-scene.jpg"]', 1, 10);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stol-taper-rotang-135', 'black-marble', 'Чёрный мрамор', 'Qora marmar', 'Black Marble', '#2B2A29', 'assets/prod-table-taper-rotang-135-black.jpg', '["assets/prod-table-taper-rotang-135-black.jpg","assets/prod-table-taper-rotang-135-detail-black.jpg","assets/prod-table-taper-rotang-135-detail-black-edge.jpg","assets/prod-table-taper-135-scene.jpg"]', 1, 20);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stol-taper-80', 'white-marble', 'Белый мрамор', 'Oq marmar', 'White Marble', '#E8E6E1', 'assets/prod-table-taper-80-white.jpg', '["assets/prod-table-taper-80-white.jpg","assets/prod-table-taper-80-detail-white-side.jpg","assets/prod-table-taper-80-detail-white-leg.jpg","assets/prod-table-taper-80-detail-top.jpg","assets/scene-dining-light.png"]', 1, 10);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stol-taper-80', 'black-marble', 'Чёрный мрамор', 'Qora marmar', 'Black Marble', '#2B2A29', 'assets/prod-table-taper-80-black.jpg', '["assets/prod-table-taper-80-black.jpg","assets/prod-table-taper-80-detail-top.jpg","assets/prod-table-taper-80-detail-leg.jpg","assets/scene-dining-grey.png"]', 1, 20);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stol-vertex-80', 'white-marble', 'Белый мрамор', 'Oq marmar', 'White Marble', '#E8E6E1', 'assets/placeholder.svg', '["assets/placeholder.svg"]', 1, 10);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stol-vertex-80', 'black-marble', 'Чёрный мрамор', 'Qora marmar', 'Black Marble', '#2B2A29', 'assets/placeholder.svg', '["assets/placeholder.svg"]', 1, 20);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stol-taper-135', 'white-marble', 'Белый мрамор', 'Oq marmar', 'White Marble', '#E8E6E1', 'assets/prod-table-taper-135-white.jpg', '["assets/prod-table-taper-135-white.jpg","assets/prod-table-taper-135-detail-white-texture.jpg","assets/prod-table-taper-135-detail-white-edge.jpg","assets/prod-table-taper-135-white-scene.jpg"]', 1, 10);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stol-taper-135', 'black-marble', 'Чёрный мрамор', 'Qora marmar', 'Black Marble', '#2B2A29', 'assets/prod-table-taper-135-black.jpg', '["assets/prod-table-taper-135-black.jpg","assets/prod-table-taper-135-detail-black.jpg","assets/prod-table-taper-135-detail-texture.png","assets/prod-table-taper-135-scene.jpg"]', 1, 20);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stol-corda-135', 'white-marble', 'Белый мрамор', 'Oq marmar', 'White Marble', '#E8E6E1', 'assets/prod-table-corda-135-white.jpg', '["assets/prod-table-corda-135-white.jpg","assets/prod-table-corda-135-top-white.jpg","assets/prod-table-corda-135-detail-black.jpg"]', 1, 10);
INSERT OR IGNORE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, active, sort) VALUES ('stol-corda-135', 'black-marble', 'Чёрный мрамор', 'Qora marmar', 'Black Marble', '#2B2A29', 'assets/prod-table-corda-135-black.jpg', '["assets/prod-table-corda-135-black.jpg","assets/prod-table-corda-135-top-black.jpg","assets/prod-table-corda-135-detail-black.jpg"]', 1, 20);

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
