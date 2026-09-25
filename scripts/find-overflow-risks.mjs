import fs from 'fs';
import path from 'path';

const cssFiles = fs.readdirSync('assets').filter(f => f.endsWith('.css'));
console.log('Scanning CSS files for overflow risks...');

for (const file of cssFiles) {
  const content = fs.readFileSync(path.join('assets', file), 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // 1. white-space: nowrap
    if (line.includes('white-space:nowrap') || line.includes('white-space: nowrap')) {
      console.log(`[${file}:${idx + 1}] NOWRAP: ${line.trim()}`);
    }
    // 2. text-overflow without overflow hidden or width
    // 3. fixed height on heading or card body
    if (/(?:height|min-height|max-height):\s*\d+px/.test(line) && /(?:title|text|desc|name|h[1-6]|p\b)/.test(line)) {
      console.log(`[${file}:${idx + 1}] FIXED HEIGHT ON TEXT: ${line.trim()}`);
    }
  });
}
