import fs from 'node:fs';
import path from 'node:path';

const root = 'c:\\BTT-Sit';
const i18n = JSON.parse(fs.readFileSync(path.join(root, 'data', 'products-master.json'), 'utf8'));
const i18nJs = fs.readFileSync(path.join(root, 'assets', 'i18n.js'), 'utf8');

// Extract all keys from i18n.js
const ruKeys = new Set();
const ruMatch = i18nJs.match(/ru\s*:\s*\{([\s\S]*?)\n\s*\},/);
if (ruMatch) {
  const kMatches = ruMatch[1].matchAll(/"([^"]+)":/g);
  for (const m of kMatches) ruKeys.add(m[1]);
}

const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

console.log('=== CHECKING ALL HTML FILES FOR I18N KEYS & DASHES ===');

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');

  // Check em-dash (- \u2014) and en-dash (- \u2013)
  const dashes = [];
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/[\u2013\u2014]/.test(line)) {
      dashes.push(`Line ${idx + 1}: ${line.trim().slice(0, 60)}`);
    }
  });
  if (dashes.length > 0) {
    console.log(`[DASH WARNING] ${file} has ${dashes.length} em/en-dashes:`);
    dashes.slice(0, 5).forEach(d => console.log('   ', d));
  }

  // Check data-i18n keys
  const i18nAttrMatches = [...content.matchAll(/data-i18n(?:-[a-z]+)?="([^"]+)"/g)].map(m => m[1]);
  const missingKeys = [];
  for (const k of i18nAttrMatches) {
    if (!ruKeys.has(k) && !k.startsWith('p') && !k.startsWith('mto.')) {
      missingKeys.push(k);
    }
  }
  if (missingKeys.length > 0) {
    console.log(`[I18N MISSING] ${file}:`, [...new Set(missingKeys)]);
  }
}
