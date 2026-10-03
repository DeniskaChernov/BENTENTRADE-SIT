import fs from 'fs';

const c = fs.readFileSync('assets/account.js', 'utf8');
const i18n = fs.readFileSync('assets/i18n.js', 'utf8');

const matches = [...c.matchAll(/t\("([^"]+)"\)/g)].map(m => m[1]);
const unique = [...new Set(matches)];

console.log('Total t() keys in account.js:', unique.length);
const missing = unique.filter(k => !i18n.includes(`"${k}":`));
console.log(`Missing keys in i18n.js (${missing.length}):`, missing);
