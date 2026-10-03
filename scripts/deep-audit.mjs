import fs from 'node:fs';
import path from 'node:path';

const root = 'c:\\Bententrade-Sit';

console.log('=== 1. CHECKING PRODUCTS MASTER VS PRODUCTS.JS VS SEED.SQL VS WORKER ===');
const masterPath = path.join(root, 'data', 'products-master.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
console.log(`Master products count: ${master.length}`);

const masterSlugs = master.map(p => p.slug);
const masterIds = master.map(p => p.legacyId);

// Check assets/products.js
const productsJs = fs.readFileSync(path.join(root, 'assets', 'products.js'), 'utf8');
const missingInProductsJs = masterSlugs.filter(s => !productsJs.includes(`"slug": "${s}"`));
console.log('Missing in products.js:', missingInProductsJs);

// Check worker/routes/orders.ts
const ordersTs = fs.readFileSync(path.join(root, 'worker', 'routes', 'orders.ts'), 'utf8');
const missingInWorkerSlugs = masterSlugs.filter(s => !ordersTs.includes(`"${s}"`));
console.log('Missing in worker ALIAS_MAP slugs:', missingInWorkerSlugs);

// Check worker aliases
const missingInWorkerAliases = masterIds.filter(id => !ordersTs.includes(`${id}:`));
console.log('Missing in worker ALIAS_MAP aliases:', missingInWorkerAliases);

// Check seed.sql
const seedSql = fs.readFileSync(path.join(root, 'migrations', 'seed.sql'), 'utf8');
const missingInSeed = masterSlugs.filter(s => !seedSql.includes(`'${s}'`));
console.log('Missing in seed.sql:', missingInSeed);

console.log('\n=== 2. CHECKING CATALOG.HTML CARDS ===');
const catalogHtml = fs.readFileSync(path.join(root, 'catalog.html'), 'utf8');
const catalogCards = [...catalogHtml.matchAll(/data-slug="([^"]+)"/g)].map(m => m[1]);
console.log(`Cards in catalog.html (${catalogCards.length}):`, catalogCards);
const missingInCatalog = masterSlugs.filter(s => !catalogCards.includes(s));
console.log('Missing in catalog.html:', missingInCatalog);

// Check prices in catalog.html vs master
master.forEach(p => {
  const cardRegex = new RegExp(`data-slug="${p.slug}"[^>]*data-price="([^"]+)"`);
  const m = catalogHtml.match(cardRegex);
  if (m) {
    const cardPrice = parseInt(m[1], 10);
    if (cardPrice !== p.price) {
      console.log(`PRICE MISMATCH for ${p.slug}: master=${p.price}, catalog=${cardPrice}`);
    }
  } else {
    console.log(`Could not find data-price for ${p.slug} in catalog.html`);
  }
});

console.log('\n=== 3. CHECKING ALL IMAGES IN MASTER & CATALOG ===');
const checkImage = (img) => {
  if (!img) return;
  const p = path.join(root, img.replace(/^\//, ''));
  if (!fs.existsSync(p)) {
    console.log(`MISSING IMAGE ON DISK: ${img}`);
  }
};

master.forEach(p => {
  (p.images || []).forEach(checkImage);
  (p.confirmedColors || []).forEach(c => {
    checkImage(c.image);
    (c.images || []).forEach(checkImage);
  });
});

const catalogImgs = [...catalogHtml.matchAll(/src="([^"]+\.(?:jpg|png|svg|webp))"/g)].map(m => m[1]);
catalogImgs.forEach(checkImage);

console.log('\n=== 4. CHECKING I18N KEYS IN ASSETS/I18N.JS ===');
const i18nJs = fs.readFileSync(path.join(root, 'assets', 'i18n.js'), 'utf8');
master.forEach(p => {
  const legacyKey = `${p.legacyId}.name`;
  const slugKey = `${p.slug}.name`;
  if (!i18nJs.includes(`"${legacyKey}"`) && !i18nJs.includes(`'${legacyKey}'`)) {
    console.log(`MISSING i18n key: ${legacyKey}`);
  }
});

console.log('\n=== 5. CHECKING LINKS IN ALL HTML FILES ===');
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  // Check for broken product.html?id= links
  const oldLinks = [...content.matchAll(/href="([^"]*product\.html\?id=[^"]+)"/g)].map(m => m[1]);
  if (oldLinks.length > 0) {
    console.log(`${file} has old product.html?id= links:`, oldLinks);
  }
  // Check for /catalog/ links to ensure slug is valid
  const catLinks = [...content.matchAll(/href="\/catalog\/([^"#?]+)"/g)].map(m => m[1]);
  for (const slug of catLinks) {
    if (!masterSlugs.includes(slug)) {
      console.log(`${file} has INVALID /catalog/ link: ${slug}`);
    }
  }
}
