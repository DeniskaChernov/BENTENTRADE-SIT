import fs from 'fs';

const c = fs.readFileSync('assets/i18n.js', 'utf8');

const prefixes = ['faq.', 'care.', 'abt.', 'about.', 'cookie', 'priv', 'auth.', 'login.', 'hrc.', 'cat.'];

for (const prefix of prefixes) {
  const matches = [...c.matchAll(new RegExp(`"(${prefix}[^"]+)":`, 'g'))].map(m => m[1]);
  const unique = [...new Set(matches)];
  console.log(`${prefix} -> ${unique.length} keys:`);
  console.log(unique.slice(0, 10).join(', ') + (unique.length > 10 ? '...' : ''));
}
