import fs from 'fs';
import path from 'path';

console.log('=== 1. Checking HTML Broken Asset/Link References ===');
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const brokenRefs = [];

for (const f of htmlFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const regex = /(?:src|href)=["']([^"'#?]+(?:\?[^"'#]*)?)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    let raw = match[1];
    let ref = raw.split('?')[0];
    if (
      ref.startsWith('http://') ||
      ref.startsWith('https://') ||
      ref.startsWith('data:') ||
      ref.startsWith('mailto:') ||
      ref.startsWith('tel:') ||
      ref.startsWith('//') ||
      ref.startsWith('javascript:')
    ) {
      continue;
    }
    let localPath = ref;
    if (localPath.startsWith('/')) localPath = '.' + localPath;
    if (!fs.existsSync(localPath)) {
      brokenRefs.push({ file: f, ref: raw, resolved: localPath });
    }
  }
}
console.log('Broken asset/file references:', brokenRefs.length);
brokenRefs.forEach(b => console.log(`  [${b.file}] -> ${b.ref} (not found at ${b.resolved})`));

console.log('\n=== 2. Checking JS Syntax on All Scripts in assets/ ===');
const jsFiles = fs.readdirSync('assets').filter(f => f.endsWith('.js'));
for (const js of jsFiles) {
  try {
    const code = fs.readFileSync(path.join('assets', js), 'utf8');
    new Function(code);
  } catch (err) {
    console.error(`  Syntax error in assets/${js}:`, err.message);
  }
}
console.log('Finished JS syntax check for', jsFiles.length, 'files.');

console.log('\n=== 3. Checking for "бесплатная доставка" mentions ===');
const forbiddenPhrase = /бесплатн\w*\s+доставк\w*/i;
for (const f of htmlFiles) {
  const content = fs.readFileSync(f, 'utf8');
  if (forbiddenPhrase.test(content)) {
    // Check if it's not "бесплатный самовывоз"
    const lines = content.split('\n');
    lines.forEach((l, idx) => {
      if (forbiddenPhrase.test(l) && !l.includes('самовывоз')) {
        console.log(`  [${f}:${idx + 1}] Forbidden free carrier delivery mention: ${l.trim()}`);
      }
    });
  }
}
