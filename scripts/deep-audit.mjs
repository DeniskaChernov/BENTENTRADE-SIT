import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();

console.log('=== STARTING DEEP SYSTEM & BUG AUDIT ===\n');

let issues = [];

// 1. Check all HTML files for broken local image references
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

console.log('--- 1. AUDITING HTML FILES & ASSET INTEGRITY ---');
for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8');

  // Check <img> src
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const src = match[1];
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      continue;
    }
    // Remove query params or hash
    const cleanSrc = src.split('?')[0].split('#')[0];
    const absPath = path.join(ROOT, cleanSrc.replace(/^\//, ''));
    if (!fs.existsSync(absPath)) {
      issues.push({
        type: 'BROKEN_IMAGE',
        file,
        detail: `Image src="${src}" not found on disk (${absPath})`
      });
    }
  }

  // Check <a> href
  const hrefRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  while ((match = hrefRegex.exec(content)) !== null) {
    const href = match[1];
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript:') || href.startsWith('#')) {
      continue;
    }
    const cleanHref = href.split('?')[0].split('#')[0];
    if (cleanHref.startsWith('/catalog/')) {
      // Catalog slug
      continue;
    }
    if (cleanHref.startsWith('/article/')) {
      continue;
    }
    const absPath = path.join(ROOT, cleanHref.replace(/^\//, ''));
    if (!fs.existsSync(absPath)) {
      issues.push({
        type: 'BROKEN_LINK',
        file,
        detail: `Link href="${href}" not found on disk (${absPath})`
      });
    }
  }

  // Check cart buttons: "В корзину" (Strict Rule #8: no cart)
  if (content.includes('В корзину') || content.includes('в корзину')) {
    issues.push({
      type: 'RULE_VIOLATION_CART',
      file,
      detail: `Contains forbidden cart text "В корзину"`
    });
  }

  // Check em-dash or en-dash in HTML files
  if (content.includes('\u2014') || content.includes('\u2013')) {
    issues.push({
      type: 'RULE_VIOLATION_DASH',
      file,
      detail: 'Contains em-dash (\\u2014) or en-dash (\\u2013)'
    });
  }
}

// 2. Audit all data-i18n keys across all HTML files against assets/i18n.js
console.log('--- 2. AUDITING I18N DATA KEYS IN HTML ---');
const i18nCode = fs.readFileSync(path.join(ROOT, 'assets', 'i18n.js'), 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(i18nCode, sandbox);
const dictRU = sandbox.window.BTT_I18N?.ru || {};
const dictUZ = sandbox.window.BTT_I18N?.uz || {};
const dictEN = sandbox.window.BTT_I18N?.en || {};

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const i18nRegex = /data-i18n=["']([^"']+)["']/gi;
  let match;
  while ((match = i18nRegex.exec(content)) !== null) {
    const key = match[1];
    if (!dictRU[key]) {
      issues.push({
        type: 'MISSING_I18N_KEY',
        file,
        detail: `data-i18n="${key}" is missing in RU dictionary`
      });
    }
  }
  const ariaI18nRegex = /data-i18n-aria=["']([^"']+)["']/gi;
  while ((match = ariaI18nRegex.exec(content)) !== null) {
    const key = match[1];
    if (!dictRU[key]) {
      issues.push({
        type: 'MISSING_I18N_ARIA_KEY',
        file,
        detail: `data-i18n-aria="${key}" is missing in RU dictionary`
      });
    }
  }
  const placeholderI18nRegex = /data-i18n-placeholder=["']([^"']+)["']/gi;
  while ((match = placeholderI18nRegex.exec(content)) !== null) {
    const key = match[1];
    if (!dictRU[key]) {
      issues.push({
        type: 'MISSING_I18N_PLACEHOLDER_KEY',
        file,
        detail: `data-i18n-placeholder="${key}" is missing in RU dictionary`
      });
    }
  }
}

// 3. Audit CSS files for broken variable references (var(--undefined))
console.log('--- 3. AUDITING CSS VARIABLE INTEGRITY ---');
const cssFiles = fs.readdirSync(path.join(ROOT, 'assets')).filter(f => f.endsWith('.css'));
// Collect all CSS variables declared
const declaredVars = new Set();
const varDeclRegex = /(--[a-zA-Z0-9-_]+)\s*:/g;
for (const file of cssFiles) {
  const content = fs.readFileSync(path.join(ROOT, 'assets', file), 'utf8');
  let match;
  while ((match = varDeclRegex.exec(content)) !== null) {
    declaredVars.add(match[1]);
  }
}

// Now check usages: var(--foo)
const varUsageRegex = /var\(\s*(--[a-zA-Z0-9-_]+)\s*(?:,[^)]+)?\)/g;
for (const file of cssFiles) {
  const content = fs.readFileSync(path.join(ROOT, 'assets', file), 'utf8');
  let match;
  while ((match = varUsageRegex.exec(content)) !== null) {
    const varName = match[1];
    if (!declaredVars.has(varName)) {
      issues.push({
        type: 'UNDEFINED_CSS_VARIABLE',
        file: `assets/${file}`,
        detail: `Usage of undefined CSS variable: ${varName}`
      });
    }
  }
}

// 5. Audit CSS url() references
console.log('--- 5. AUDITING CSS URL REFERENCES ---');
for (const file of cssFiles) {
  const content = fs.readFileSync(path.join(ROOT, 'assets', file), 'utf8');
  const urlRegex = /url\(['"]?([^'")]+)['"]?\)/g;
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const u = match[1];
    if (u.startsWith('data:') || u.startsWith('http://') || u.startsWith('https://')) continue;
    const cleanU = u.split('?')[0].split('#')[0];
    const absPath = path.resolve(ROOT, 'assets', cleanU);
    if (!fs.existsSync(absPath)) {
      issues.push({
        type: 'BROKEN_CSS_URL',
        file: `assets/${file}`,
        detail: `url("${u}") not found on disk (${absPath})`
      });
    }
  }
}

console.log('\n=== AUDIT RESULTS ===');
console.log(`Total issues identified: ${issues.length}`);
if (issues.length > 0) {
  for (const iss of issues) {
    console.log(`[${iss.type}] ${iss.file}: ${iss.detail}`);
  }
} else {
  console.log('All static checks passed with 0 issues!');
}
