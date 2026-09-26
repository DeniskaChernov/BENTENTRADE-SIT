import fs from 'fs';
import path from 'path';

// Read i18n
const i18nContent = fs.readFileSync('assets/i18n.js', 'utf8');
const fakeWindow = {};
try {
  const runner = new Function('window', i18nContent + '; return window.BTT_I18N;');
  fakeWindow.BTT_I18N = runner(fakeWindow);
} catch (e) {
  console.error('Failed to run i18n.js:', e);
}

const I18N = fakeWindow.BTT_I18N || {};

console.log('=== Checking i18n Keys & Abrupt Text Endings ===');
for (const [lang, dict] of Object.entries(I18N)) {
  console.log(`Language [${lang}]: ${Object.keys(dict).length} keys`);
  for (const [k, v] of Object.entries(dict)) {
    if (typeof v === 'string') {
      const trimmed = v.trim();
      // Check for dangling endings: e.g. ending in preposition, dash without following text, or ellipsis
      if (
        trimmed.endsWith('-') ||
        /\b(из|в|на|с|по|под|для|что|как|который|которая|которое|которую|о|об|от|до|при|со)\s*$/i.test(trimmed)
      ) {
        console.log(`  [Suspicious ending in ${lang}] ${k}: "${trimmed}"`);
      }
    }
  }
}

console.log('\n=== Checking HTML Files for Missing i18n Keys ===');
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const allHtmlKeys = new Set();
const htmlKeysByFile = {};

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = [...content.matchAll(/data-i18n=["']([^"']+)["']/g)];
  htmlKeysByFile[file] = matches.map(m => m[1]);
  for (const k of htmlKeysByFile[file]) {
    allHtmlKeys.add(k);
    for (const lang of ['ru', 'uz', 'en']) {
      if (I18N[lang] && I18N[lang][k] === undefined) {
        console.log(`  [Missing translation] ${file} has data-i18n="${k}" missing in ${lang}`);
      }
    }
  }

  // Also check if any heading in HTML has suspicious endings in fallback text
  const headingMatches = [...content.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi)];
  for (const hm of headingMatches) {
    const rawText = hm[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (
      rawText.endsWith('-') ||
      /\b(из|в|на|с|по|под|для|что|как|который|которая|которое|которую|о|об|от|до|при|со)\s*$/i.test(rawText)
    ) {
      console.log(`  [Suspicious heading in ${file} <${hm[1]}>]: "${rawText}"`);
    }
  }
}

console.log('\n=== Checking for Series Keys (e.g. key.1, key.2) where i18n has more parts than HTML ===');
for (const [lang, dict] of Object.entries(I18N)) {
  const series = {};
  for (const k of Object.keys(dict)) {
    const sm = k.match(/^(.*)\.(\d+)$/);
    if (sm) {
      const base = sm[1];
      const num = parseInt(sm[2], 10);
      if (!series[base]) series[base] = [];
      series[base].push(num);
    }
  }
  for (const [base, nums] of Object.entries(series)) {
    nums.sort((a, b) => a - b);
    for (const n of nums) {
      const fullKey = `${base}.${n}`;
      if (!allHtmlKeys.has(fullKey)) {
        // Report if base.1 or base.2 is used in HTML but this one is not!
        const anySiblingUsed = nums.some(siblingNum => allHtmlKeys.has(`${base}.${siblingNum}`));
        if (anySiblingUsed) {
          console.log(`  [Sibling unused in HTML! Base: ${base}] ${fullKey}: "${dict[fullKey]}" (while other parts of ${base} ARE in HTML)`);
        }
      }
    }
  }
}

console.log('\nAudit complete.');
