import fs from 'node:fs';

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

console.log('PAGE'.padEnd(28), 'OG:TITLE', 'OG:IMG', 'TWITTER', 'CANONICAL', 'SCHEMA_SOURCE');
console.log('='.repeat(85));

files.forEach(f => {
  const t = fs.readFileSync(f, 'utf8');
  const ogTitle = t.includes('property="og:title"');
  const ogImg = t.includes('property="og:image"');
  const tw = t.includes('name="twitter:card"');
  const can = t.includes('rel="canonical"');
  
  const schemaScripts = [];
  if (t.includes('application/ld+json')) schemaScripts.push('inline');
  if (t.includes('home-seo.js')) schemaScripts.push('home-seo');
  if (t.includes('catalog-seo.js')) schemaScripts.push('catalog-seo');
  if (t.includes('page-seo.js')) schemaScripts.push('page-seo');
  if (t.includes('faq-seo.js')) schemaScripts.push('faq-seo');
  if (t.includes('care-seo.js')) schemaScripts.push('care-seo');
  if (t.includes('pdp.js')) schemaScripts.push('pdp-seo');
  
  console.log(
    f.padEnd(28),
    String(ogTitle).padEnd(8),
    String(ogImg).padEnd(6),
    String(tw).padEnd(7),
    String(can).padEnd(9),
    schemaScripts.join(', ') || 'NONE'
  );
});
