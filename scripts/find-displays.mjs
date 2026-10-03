import fs from 'fs';

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const f of htmlFiles) {
  const c = fs.readFileSync(f, 'utf8');
  const matches = [...c.matchAll(/<([a-z0-9]+)[^>]*class=["']([^"']*display-[123][^"']*)["'][^>]*>([\s\S]*?)<\/\1>/gi)];
  for (const m of matches) {
    const text = m[3].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`[${f}] <${m[1]} class="${m[2]}">: "${text.slice(0, 80)}"`);
  }
}
