import fs from 'fs';
import vm from 'vm';

const i18n = fs.readFileSync('assets/i18n.js', 'utf8');
const s = { window: {} };
vm.createContext(s);
vm.runInContext(i18n, s);
const ruKeys = new Set(Object.keys(s.window.BTT_I18N.ru));

const jsFiles = fs.readdirSync('assets').filter(f => f.endsWith('.js') && f !== 'i18n.js');
let totalMissing = 0;

for (const f of jsFiles) {
  const code = fs.readFileSync(`assets/${f}`, 'utf8');
  const matches = [...code.matchAll(/\bt\(\s*["']([^"']+)["']\s*\)/g)].map(m => m[1]);
  const missing = [...new Set(matches)].filter(k => 
    !ruKeys.has(k) && 
    !k.includes('${') && 
    !k.endsWith('.name') && 
    !k.endsWith('.cat') && 
    !k.endsWith('.desc')
  );
  if (missing.length > 0) {
    console.log(`${f} has ${missing.length} missing keys:`);
    console.log(missing);
    totalMissing += missing.length;
  } else {
    console.log(`${f}: clean`);
  }
}

console.log(`\nTotal missing keys across all JS files: ${totalMissing}`);
