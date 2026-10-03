// scripts/validate-products.mjs
// Automated verification of SSOT data integrity, files on disk, and DB seed consistency.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MASTER_PATH = path.join(ROOT, 'data', 'products-master.json');
const SEED_SQL_PATH = path.join(ROOT, 'migrations', 'seed.sql');
const PRODUCTS_JS_PATH = path.join(ROOT, 'assets', 'products.js');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');

let errors = [];

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
    console.error(`  FAIL: ${message}`);
  } else {
    console.log(`  PASS: ${message}`);
  }
}

console.log('--- 1. Validating data/products-master.json ---');
if (!fs.existsSync(MASTER_PATH)) {
  console.error('CRITICAL: data/products-master.json not found!');
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));
assert(Array.isArray(products), 'products-master.json is a valid JSON array');
assert(products.length > 0, `Products list is populated (found ${products.length} products)`);

const ALLOWED_CATEGORIES = new Set([
  'wicker-chairs',
  'plastic-chairs',
  'upholstered-chairs',
  'tables'
]);

const ALLOWED_AVAILABILITIES = new Set([
  'unknown',
  'in_stock',
  'low_stock',
  'out_of_stock',
  'on_request'
]);

const slugs = new Set();
const legacyIds = new Set();
const activeSlugs = new Set();

const forbiddenBuzzwords = [
  /выдерживает\s+\d+/i,
  /120\s*кг/i,
  /150\s*кг/i,
  /180\s*кг/i,
  /нагрузка\s+до/i,
  /максимальная\s+нагрузка/i,
  /прочн/i,
  /над[её]жн/i,
  /долговечн/i,
  /износостойк/i,
  /водоотталкива/i,
  /не\s+выцветает/i,
  /высокопрочн/i,
  /премиальн/i,
  /durable/i,
  /reinforced/i,
  /all-weather/i,
  /weather-resistant/i,
  /uv-resistant/i,
  /high-strength/i,
  /premium/i,
  /быстрая\s+доставка/i,
  /fast\s+(?:local\s+)?delivery/i
];

for (const p of products) {
  // Check slug format and uniqueness
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug), `${p.slug}: valid lowercase slug format`);
  assert(!slugs.has(p.slug), `Unique slug: ${p.slug}`);
  slugs.add(p.slug);

  if (p.active !== 0 && p.active !== false) {
    activeSlugs.add(p.slug);
  }

  // Check legacyId uniqueness if present
  if (p.legacyId) {
    assert(!legacyIds.has(p.legacyId), `Unique legacyId: ${p.legacyId} (${p.slug})`);
    legacyIds.add(p.legacyId);
    assert(!slugs.has(p.legacyId), `Legacy alias ${p.legacyId} does not collide with canonical slug`);
  }

  // Check required fields
  assert(ALLOWED_CATEGORIES.has(p.category), `${p.slug}: valid category (${p.category})`);
  assert(typeof p.price === 'number' && p.price > 0, `${p.slug}: valid price (${p.price})`);
  const avail = p.availability || 'unknown';
  assert(ALLOWED_AVAILABILITIES.has(avail), `${p.slug}: valid availability (${avail})`);
  assert(p.dimensions && typeof p.dimensions === 'string', `${p.slug}: dimensions defined`);
  assert(p.maxLoad === null, `${p.slug}: maxLoad is null (unverified weight claims stripped)`);

  // Check images
  assert(Array.isArray(p.images) && p.images.length > 0, `${p.slug}: has images array`);
  for (const img of p.images) {
    if (!img.startsWith('http://') && !img.startsWith('https://')) {
      const imgPath = path.join(ROOT, img);
      assert(fs.existsSync(imgPath), `${p.slug}: image exists on disk (${img})`);
    }
  }

  // Check descriptions and names for forbidden buzzwords
  for (const lang of ['ru', 'uz', 'en']) {
    const desc = p.i18n?.[lang]?.description || '';
    const name = p.i18n?.[lang]?.name || '';
    for (const pat of forbiddenBuzzwords) {
      assert(!pat.test(desc), `${p.slug} [${lang}] desc: no unverified claim matching ${pat}`);
      assert(!pat.test(name), `${p.slug} [${lang}] name: no unverified claim matching ${pat}`);
    }
  }
}

console.log('\n--- 2. Validating migrations/seed.sql ---');
if (fs.existsSync(SEED_SQL_PATH)) {
  const seedSql = fs.readFileSync(SEED_SQL_PATH, 'utf8');
  const productInserts = (seedSql.match(/INSERT OR REPLACE INTO products/g) || []).length;
  assert(productInserts > 0, `seed.sql has product records (found ${productInserts})`);
  assert(productInserts === products.length, `seed.sql matches master product count (${productInserts}/${products.length})`);

  const aliasInserts = (seedSql.match(/INSERT OR REPLACE INTO product_aliases/g) || []).length;
  assert(aliasInserts > 0, `seed.sql has alias records (found ${aliasInserts})`);
  assert(aliasInserts <= productInserts, `seed.sql alias records count does not exceed products (${aliasInserts}/${productInserts})`);
} else {
  errors.push('migrations/seed.sql not found');
}

console.log('\n--- 3. Validating assets/products.js ---');
if (fs.existsSync(PRODUCTS_JS_PATH)) {
  const jsContent = fs.readFileSync(PRODUCTS_JS_PATH, 'utf8');
  assert(jsContent.includes('window.BTT_PRODUCTS'), 'assets/products.js exports window.BTT_PRODUCTS');
  assert(jsContent.includes('window.BTT_CANONICAL_SLUGS'), 'assets/products.js exports window.BTT_CANONICAL_SLUGS');
} else {
  errors.push('assets/products.js not found');
}

console.log('\n--- 4. Validating sitemap.xml ---');
if (fs.existsSync(SITEMAP_PATH)) {
  const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
  assert(!sitemap.includes('?id='), 'sitemap.xml has 0 legacy query string URLs');
  assert(sitemap.includes('/horeca.html'), 'sitemap.xml includes /horeca.html');
  for (const s of activeSlugs) {
    assert(sitemap.includes(`/catalog/${s}`), `sitemap.xml includes active /catalog/${s}`);
  }
} else {
  errors.push('sitemap.xml not found');
}

console.log('\n=======================================');
if (errors.length === 0) {
  console.log('ALL PRODUCT VALIDATIONS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error(`VALIDATION FAILED WITH ${errors.length} ERROR(S):`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}
