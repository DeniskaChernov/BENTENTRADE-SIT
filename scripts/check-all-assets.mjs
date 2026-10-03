import fs from 'node:fs';
import path from 'node:path';

const root = 'c:\\BTT-Sit';

// Collect all referenced assets in HTML and CSS and JS
const assetRefRegex = /(?:src|href|url)\s*[:=\(]\s*["']?([^"'()#?]+\.(?:jpg|png|svg|webp|woff|woff2|otf|ttf|css|js))/gi;

const filesToCheck = [];
function walk(dir) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (item === 'node_modules' || item === '.git' || item.startsWith('.tmp')) continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (/\.(html|css|js|ts)$/.test(item)) {
      filesToCheck.push(full);
    }
  }
}
walk(root);

console.log(`Checking ${filesToCheck.length} source files for missing referenced assets...`);

const missingRefs = [];
for (const file of filesToCheck) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = assetRefRegex.exec(content)) !== null) {
    let ref = match[1].trim();
    if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('//') || ref.startsWith('data:')) continue;
    
    // Normalize relative path
    let resolved;
    if (ref.startsWith('/')) {
      resolved = path.join(root, ref);
    } else {
      resolved = path.resolve(path.dirname(file), ref);
    }
    
    if (!fs.existsSync(resolved)) {
      // Check if it's an asset relative to root
      const altResolved = path.join(root, ref);
      if (!fs.existsSync(altResolved)) {
        missingRefs.push({ file: path.relative(root, file), ref, resolved: path.relative(root, resolved) });
      }
    }
  }
}

console.log(`Found ${missingRefs.length} missing asset references:`);
missingRefs.forEach(m => console.log(`  [${m.file}] -> ${m.ref}`));
