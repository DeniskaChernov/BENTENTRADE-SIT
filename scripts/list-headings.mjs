import fs from 'fs';

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const f of htmlFiles) {
  const c = fs.readFileSync(f, 'utf8');
  const headings = [...c.matchAll(/<(h[1-3])([^>]*)>([\s\S]*?)<\/\1>/gi)];
  console.log(`\n=== ${f} (${headings.length} headings) ===`);
  for (const h of headings) {
    const rawClass = (h[2].match(/class=["']([^"']+)["']/) || [])[1] || 'no-class';
    const text = h[3].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`  <${h[1]} class="${rawClass}">: "${text}"`);
  }
}
