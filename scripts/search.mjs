import fs from 'node:fs';

const site = fs.readFileSync('assets/site.js', 'utf8');
const lines = site.split('\n');
lines.forEach((l, i) => {
  if (l.includes('addEventListener') && (l.includes('card') || l.includes('product') || l.includes('media') || l.includes('see'))) {
    console.log((i+1) + ': ' + l.slice(0, 100));
  }
});
