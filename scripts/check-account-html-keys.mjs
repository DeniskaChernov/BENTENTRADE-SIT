import fs from 'fs';
import vm from 'vm';

const i18n = fs.readFileSync('assets/i18n.js', 'utf8');
const s = { window: {} };
vm.createContext(s);
vm.runInContext(i18n, s);
const ruKeys = new Set(Object.keys(s.window.BTT_I18N.ru));

const accHtml = fs.readFileSync('account.html', 'utf8');
const matches = [...accHtml.matchAll(/data-i18n=["']([^"']+)["']/g)].map(m => m[1]);
const missing = [...new Set(matches)].filter(k => !ruKeys.has(k));
console.log(`Missing data-i18n keys in account.html (${missing.length}):`, missing);
