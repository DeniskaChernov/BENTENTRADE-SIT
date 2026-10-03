import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const oldFontRegex = /https:\/\/fonts\.googleapis\.com\/css2\?family=Hanken\+Grotesque:[^"'\s&]+(?:&amp;|&)family=Cormorant\+Garamond:[^"'\s]+/g;
const newFontUrl = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Unbounded:wght@400;500;600;700;800;900&display=swap';

let updatedHtml = 0;
for (const file of readdirSync(root)) {
  if (!file.endsWith('.html')) continue;
  const p = join(root, file);
  let html = readFileSync(p, 'utf8');
  if (oldFontRegex.test(html)) {
    html = html.replace(oldFontRegex, newFontUrl);
    writeFileSync(p, html, 'utf8');
    updatedHtml++;
  }
}
console.log(`Updated Google Fonts in ${updatedHtml} HTML files.`);

// Update CSS files fallback strings
const cssDir = join(root, 'assets');
const oldSerifRegex = /'Cormorant Garamond',\s*(?:Georgia,\s*)?serif/g;
const newSerifFallback = "'Soyuz Grotesk', 'Unbounded', sans-serif";

let updatedCss = 0;
for (const file of readdirSync(cssDir)) {
  if (!file.endsWith('.css')) continue;
  const p = join(cssDir, file);
  let css = readFileSync(p, 'utf8');
  if (oldSerifRegex.test(css)) {
    css = css.replace(oldSerifRegex, newSerifFallback);
    writeFileSync(p, css, 'utf8');
    updatedCss++;
  }
}
console.log(`Updated font fallbacks in ${updatedCss} CSS files.`);
