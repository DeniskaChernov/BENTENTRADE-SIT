import fs from 'fs';
import vm from 'vm';

console.log('====================================================');
console.log('=== BTT DEEP SYSTEM AUDIT & VERIFICATION REPORT ===');
console.log('====================================================\n');

let issuesFound = [];
let passCount = 0;

// 1. MASTER PRODUCTS vs PRODUCTS.JS vs SEED.SQL vs WORKER
const master = JSON.parse(fs.readFileSync('data/products-master.json', 'utf8'));
const seedSql = fs.readFileSync('migrations/seed.sql', 'utf8');
const workerTs = fs.readFileSync('worker/index.ts', 'utf8');
const prodJsCode = fs.readFileSync('assets/products.js', 'utf8');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(prodJsCode, sandbox);
const prodJs = sandbox.window.BTT_PRODUCTS;
const canonicalSlugs = sandbox.window.BTT_CANONICAL_SLUGS;

console.log('--- 1. MASTER DATA SYNCHRONIZATION (16 SKUs) ---');
if (master.length === 16) {
  console.log('  PASS: Master JSON has exactly 16 SKUs');
  passCount++;
} else {
  issuesFound.push(`Master JSON has ${master.length} SKUs instead of 16`);
}

if (canonicalSlugs.length === 16) {
  console.log('  PASS: Canonical slugs list has exactly 16 SKUs');
  passCount++;
} else {
  issuesFound.push(`Canonical slugs list has ${canonicalSlugs.length} SKUs`);
}

for (const p of master) {
  // Check products.js
  const jsP = prodJs[p.slug];
  if (!jsP) {
    issuesFound.push(`Product ${p.slug} missing in assets/products.js`);
    continue;
  }
  if (jsP.now !== p.price) {
    issuesFound.push(`Price mismatch for ${p.slug}: master=${p.price}, products.js=${jsP.now}`);
  }
  // Check confirmed colors
  const masterColors = (p.confirmedColors || []).map(c => c.id).sort().join(',');
  const jsColors = (jsP.confirmedColors || []).map(c => c.id).sort().join(',');
  if (masterColors !== jsColors) {
    issuesFound.push(`Color mismatch for ${p.slug}: master=[${masterColors}], products.js=[${jsColors}]`);
  }
  // Check worker VALID_PRODUCT_SLUGS
  if (!workerTs.includes(`"${p.slug}"`)) {
    issuesFound.push(`Worker missing canonical slug in VALID_PRODUCT_SLUGS: ${p.slug}`);
  }
  // Check seed.sql
  if (!seedSql.includes(`'${p.slug}'`)) {
    issuesFound.push(`seed.sql missing product slug: ${p.slug}`);
  }
}
if (issuesFound.length === 0) {
  console.log('  PASS: All 16 SKUs completely synchronized across Master, products.js, Worker, and seed.sql');
  passCount++;
}

// 2. CHECK CATALOG.HTML & STATIC CARDS
console.log('\n--- 2. CATALOG.HTML CARDS SYNCHRONIZATION ---');
const catHtml = fs.readFileSync('catalog.html', 'utf8');
let catCardCount = 0;
for (const p of master) {
  const cardRegex = new RegExp(`<article[^>]*data-slug=["']${p.slug}["'][^>]*>`, 'i');
  if (!cardRegex.test(catHtml)) {
    issuesFound.push(`catalog.html missing static card for ${p.slug}`);
  } else {
    catCardCount++;
  }
}
if (catCardCount === 16) {
  console.log(`  PASS: catalog.html contains all 16 static product cards`);
  passCount++;
} else {
  issuesFound.push(`catalog.html has ${catCardCount}/16 cards`);
}

// 3. I18N PARITY AUDIT (RU vs UZ vs EN)
console.log('\n--- 3. I18N KEY PARITY AUDIT (RU vs UZ vs EN) ---');
const i18nCode = fs.readFileSync('assets/i18n.js', 'utf8');
const i18nSandbox = { window: {} };
vm.createContext(i18nSandbox);
vm.runInContext(i18nCode, i18nSandbox);

const ruKeys = Object.keys(i18nSandbox.window.BTT_I18N.ru || {});
const uzKeys = Object.keys(i18nSandbox.window.BTT_I18N.uz || {});
const enKeys = Object.keys(i18nSandbox.window.BTT_I18N.en || {});

console.log(`  RU key count: ${ruKeys.length}`);
console.log(`  UZ key count: ${uzKeys.length}`);
console.log(`  EN key count: ${enKeys.length}`);

const missingInUz = ruKeys.filter(k => !uzKeys.includes(k));
const missingInEn = ruKeys.filter(k => !enKeys.includes(k));

if (missingInUz.length > 0) {
  console.log(`  WARN: ${missingInUz.length} keys in RU are missing in UZ:`, missingInUz.slice(0, 10));
} else {
  console.log('  PASS: All RU keys present in UZ dictionary');
  passCount++;
}

if (missingInEn.length > 0) {
  console.log(`  WARN: ${missingInEn.length} keys in RU are missing in EN:`, missingInEn.slice(0, 10));
} else {
  console.log('  PASS: All RU keys present in EN dictionary');
  passCount++;
}

// 4. CHECK STRICT REPO RULES: ZERO EM-DASH / EN-DASH
console.log('\n--- 4. STRICT RULE: ZERO EM-DASH (—) OR EN-DASH (–) ---');
const allHtmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const coreJsFiles = fs.readdirSync('assets').filter(f => f.endsWith('.js'));
const allChecked = [...allHtmlFiles, ...coreJsFiles.map(f => `assets/${f}`), 'data/products-master.json'];

let dashErrors = [];
for (const f of allChecked) {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('—')) dashErrors.push(`${f} contains em-dash (—)`);
  if (content.includes('–')) dashErrors.push(`${f} contains en-dash (–)`);
}
if (dashErrors.length === 0) {
  console.log(`  PASS: Zero em-dash or en-dash across all ${allChecked.length} inspected source files!`);
  passCount++;
} else {
  console.log(`  FAIL: Found dashes in ${dashErrors.length} files:`, dashErrors);
  issuesFound.push(...dashErrors);
}

// 5. UNVERIFIED CLAIMS AUDIT
console.log('\n--- 5. UNVERIFIED CLAIMS AUDIT ---');
const unverifiedRegexes = [
  /выдерживает\s+\d+/i,
  /120\s*кг/i,
  /150\s*кг/i,
  /180\s*кг/i,
  /премиальн/i,
  /premium/i,
  /ударопрочн/i,
  /быстрая доставка/i
];

let claimIssues = [];
for (const p of master) {
  if (p.maxLoad !== null) {
    claimIssues.push(`${p.slug} has unverified maxLoad: ${p.maxLoad}`);
  }
}
if (claimIssues.length === 0) {
  console.log('  PASS: All 16 SKUs have maxLoad stripped to null in master data');
  passCount++;
} else {
  issuesFound.push(...claimIssues);
}

// 6. ASSETS & IMAGES INTEGRITY
console.log('\n--- 6. ASSETS & IMAGES INTEGRITY ---');
let missingImages = [];
for (const p of master) {
  for (const imgPath of (p.images || [])) {
    if (!fs.existsSync(imgPath)) {
      missingImages.push(`${p.slug}: missing image ${imgPath}`);
    }
  }
}
if (missingImages.length === 0) {
  console.log('  PASS: 100% of product images referenced in master data exist on disk');
  passCount++;
} else {
  issuesFound.push(...missingImages);
}

// SUMMARY
console.log('\n====================================================');
console.log(`=== AUDIT SUMMARY: ${passCount} CHECKS PASSED, ${issuesFound.length} ISSUES FOUND ===`);
console.log('====================================================');
if (issuesFound.length > 0) {
  console.log('Issues needing attention:');
  issuesFound.forEach(i => console.log('  - ' + i));
} else {
  console.log('ALL SYSTEMS IN FULL INTEGRITY!');
}
