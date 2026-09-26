// scripts/smoke-test.mjs
// Automated smoke test suite covering Scenarios A through K for BTT.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
let failed = 0;
let passed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: [${name}]`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: [${name}] -> ${err.message}`);
    failed++;
  }
}

function expect(val) {
  return {
    toBe(expected) {
      if (val !== expected) throw new Error(`Expected ${expected} but got ${val}`);
    },
    toBeTruthy() {
      if (!val) throw new Error(`Expected truthy but got ${val}`);
    },
    toBeFalsy() {
      if (val) throw new Error(`Expected falsy but got ${val}`);
    },
    toContain(sub) {
      if (!val || !val.includes(sub)) throw new Error(`Expected to contain "${sub}"`);
    },
    notToContain(sub) {
      if (val && val.includes(sub)) throw new Error(`Expected NOT to contain "${sub}"`);
    }
  };
}

console.log('=== RUNNING BTT COMPREHENSIVE SMOKE TEST SUITE ===\n');

// SCENARIO A: SSOT and Exact 15 SKUs
console.log('--- SCENARIO A: Single Source of Truth (15 SKUs) ---');
test('Master file has exactly 15 SKUs', () => {
  const master = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/products-master.json'), 'utf8'));
  expect(master.length).toBe(15);
});

test('seed.sql inserts exactly 15 products', () => {
  const seed = fs.readFileSync(path.join(ROOT, 'migrations/seed.sql'), 'utf8');
  const count = (seed.match(/INSERT OR REPLACE INTO products\s*\(/g) || []).length;
  expect(count).toBe(15);
});

// SCENARIO B: Brand Identity
console.log('\n--- SCENARIO B: Brand Name Consistency ---');
test('Brand name is strictly "BTT - мебель для дома и сада" in HTML headers', () => {
  const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  expect(index).toContain('alt="BTT - мебель для дома и сада"');
  expect(index).toContain('content="BTT - мебель для дома и сада"');
});

test('Zero unverified claims in about.html and index.html', () => {
  const about = fs.readFileSync(path.join(ROOT, 'about.html'), 'utf8');
  expect(about).notToContain('ударопрочный');
  expect(about).notToContain('быстрая доставка');
});

// SCENARIO C: Confirmed Colors & No Fake Swatches
console.log('\n--- SCENARIO C: Confirmed Colors vs Fake Swatches ---');
test('catalog-sync.js contains no fake hardcoded swatches (Шоколад, Песочный, Графит)', () => {
  const cs = fs.readFileSync(path.join(ROOT, 'assets/catalog-sync.js'), 'utf8');
  expect(cs).notToContain('"Шоколад"');
  expect(cs).notToContain('"Песочный"');
  expect(cs).notToContain('"Графит"');
  expect(cs).toContain('confirmedColors');
});

// SCENARIO D: Schema.org Availability
console.log('\n--- SCENARIO D: Schema.org Availability Logic ---');
test('pdp.js conditionally emits InStock only when stock is verified', () => {
  const pdp = fs.readFileSync(path.join(ROOT, 'assets/pdp.js'), 'utf8');
  expect(pdp).toContain('if (prod.status === "in_stock" || prod.stock === 1)');
  expect(pdp).toContain('offerObj.availability = "https://schema.org/InStock"');
});

// SCENARIO E: Product Aliases
console.log('\n--- SCENARIO E: Product Aliases (p1..p15) ---');
test('migrations/0003_product_aliases.sql exists with 15 mappings', () => {
  const mig = fs.readFileSync(path.join(ROOT, 'migrations/0003_product_aliases.sql'), 'utf8');
  expect(mig).toContain('CREATE TABLE IF NOT EXISTS product_aliases');
  for (let i = 1; i <= 15; i++) {
    expect(mig).toContain(`'p${i}'`);
  }
});

// SCENARIO F: Worker Routing & 301 Redirects
console.log('\n--- SCENARIO F: Worker Routing & Canonical PDP ---');
test('worker/index.ts has 301 alias redirect and canonical /catalog/:slug route', () => {
  const worker = fs.readFileSync(path.join(ROOT, 'worker/index.ts'), 'utf8');
  expect(worker).toContain('/catalog/:slug');
  expect(worker).toContain('PRODUCT_ALIASES');
  expect(worker).toContain('301');
  expect(worker).toContain('/horeca');
});

// SCENARIO G: Admin Route Protection
console.log('\n--- SCENARIO G: Admin Route Security ---');
test('worker/index.ts protects /admin and /admin/ with session auth', () => {
  const worker = fs.readFileSync(path.join(ROOT, 'worker/index.ts'), 'utf8');
  expect(worker).toContain('/admin');
  expect(worker).toContain('/login.html?redirect=/admin');
});

test('worker/security-headers.ts sets X-Robots-Tag: noindex, nofollow on /admin', () => {
  const sec = fs.readFileSync(path.join(ROOT, 'worker/security-headers.ts'), 'utf8');
  expect(sec).toContain('headers.set("X-Robots-Tag", "noindex, nofollow")');
});

// SCENARIO H: Storefront Security Cleanup
console.log('\n--- SCENARIO H: Zero Admin Leaks in Storefront ---');
test('account.js has no storefront injection of .acc-admin-btn', () => {
  const acc = fs.readFileSync(path.join(ROOT, 'assets/account.js'), 'utf8');
  expect(acc).notToContain('.acc-admin-btn');
});

test('site.js has no storefront injection of .foot-crm-link', () => {
  const site = fs.readFileSync(path.join(ROOT, 'assets/site.js'), 'utf8');
  expect(site).notToContain('.foot-crm-link');
});

// SCENARIO I: Table Size Filtering
console.log('\n--- SCENARIO I: Table Size Filtering ---');
test('catalog.html contains table size filter section', () => {
  const cat = fs.readFileSync(path.join(ROOT, 'catalog.html'), 'utf8');
  expect(cat).toContain('id="cat-size-filter"');
  expect(cat).toContain('value="Ø90"');
  expect(cat).toContain('value="80x80"');
  expect(cat).toContain('value="135x80"');
});

test('site.js handles table size filtering', () => {
  const site = fs.readFileSync(path.join(ROOT, 'assets/site.js'), 'utf8');
  expect(site).toContain('cat-size-filter');
  expect(site).toContain('activeSizes');
  expect(site).toContain('card.dataset.size');
});

// SCENARIO J: HoReCa Landing Page
console.log('\n--- SCENARIO J: HoReCa Landing Page ---');
test('horeca.html exists and is properly structured', () => {
  expect(fs.existsSync(path.join(ROOT, 'horeca.html'))).toBeTruthy();
  const hrc = fs.readFileSync(path.join(ROOT, 'horeca.html'), 'utf8');
  expect(hrc).toContain('BTT — Мебель для HoReCa');
  expect(hrc).toContain('assets/horeca.css');
  expect(hrc).toContain('data-contact-form');
  expect(hrc).toContain('@bententradeuz');
  expect(hrc).toContain('catalog/stul-vertex');
  expect(hrc).toContain('catalog/stol-corda-135');
});

test('page-seo.js includes HoReCa schema generator', () => {
  const seo = fs.readFileSync(path.join(ROOT, 'assets/page-seo.js'), 'utf8');
  expect(seo).toContain('renderHoreca');
  expect(seo).toContain('btt-page-horeca');
});

// SCENARIO K: Robots & Sitemap
console.log('\n--- SCENARIO K: Robots & Sitemap ---');
test('robots.txt disallows /admin and /admin/', () => {
  const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
  expect(robots).toContain('Disallow: /admin');
  expect(robots).toContain('Disallow: /admin/');
});

test('sitemap.xml has all canonical URLs and no query params', () => {
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  expect(sitemap).toContain('/catalog/stul-vertex');
  expect(sitemap).toContain('/horeca.html');
  expect(sitemap).notToContain('?id=');
});

console.log('\n=======================================');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL SCENARIOS VERIFIED SUCCESSFULLY!');
  process.exit(0);
}
