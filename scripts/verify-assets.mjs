import fs from 'node:fs';
import path from 'node:path';

const root = 'c:\\BTT-Sit';
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

console.log('=== CHECKING ALL HTML FILES FOR 404 ASSETS, BROKEN LINKS, AND SCRIPT TAGS ===');

let brokenCount = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  
  // 1. Check img src
  const imgMatches = [...content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
  for (const src of imgMatches) {
    if (src.startsWith('http') || src.startsWith('data:')) continue;
    const cleanSrc = src.split('?')[0].replace(/^\//, '');
    if (!fs.existsSync(path.join(root, cleanSrc))) {
      console.log(`[BROKEN IMG] in ${file}: ${src} (resolved: ${cleanSrc})`);
      brokenCount++;
    }
  }

  // 2. Check script src
  const scriptMatches = [...content.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
  for (const src of scriptMatches) {
    if (src.startsWith('http')) continue;
    const cleanSrc = src.split('?')[0].replace(/^\//, '');
    if (!fs.existsSync(path.join(root, cleanSrc))) {
      console.log(`[BROKEN SCRIPT] in ${file}: ${src} (resolved: ${cleanSrc})`);
      brokenCount++;
    }
  }

  // 3. Check link href for css
  const cssMatches = [...content.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map(m => m[1]);
  for (const href of cssMatches) {
    if (href.startsWith('http') || href.startsWith('data:') || href.includes('fonts.googleapis') || href.includes('manifest') || href.includes('canonical')) continue;
    const cleanHref = href.split('?')[0].replace(/^\//, '');
    if (!fs.existsSync(path.join(root, cleanHref))) {
      console.log(`[BROKEN LINK/CSS] in ${file}: ${href} (resolved: ${cleanHref})`);
      brokenCount++;
    }
  }

  // 4. Check internal href links (a href=...)
  const aMatches = [...content.matchAll(/<a[^>]+href=["']([^"'#]+)["']/gi)].map(m => m[1]);
  for (const href of aMatches) {
    if (href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript:')) continue;
    if (href.startsWith('/catalog/') || href.startsWith('catalog/') || href.startsWith('/article/') || href.startsWith('article/') || href.startsWith('/catalog')) continue;
    if (href === '/' || href === '') continue;
    const cleanHref = href.split('?')[0].replace(/^\//, '');
    if (!fs.existsSync(path.join(root, cleanHref))) {
      console.log(`[POSSIBLE DEAD LINK] in ${file}: ${href} (resolved: ${cleanHref})`);
      brokenCount++;
    }
  }
}

console.log(`Asset scan finished. Total broken assets/links: ${brokenCount}`);
