import fs from 'node:fs';
import path from 'node:path';

const root = 'c:\\Bententrade-Sit';
const cssDir = path.join(root, 'assets');
const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

for (const file of cssFiles) {
  const fullPath = path.join(cssDir, file);
  const content = fs.readFileSync(fullPath, 'utf8');

  // Check brace balance
  let depth = 0;
  let line = 1;
  let error = null;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '\n') line++;
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth < 0) {
        error = `Unmatched closing brace at line ${line}`;
        break;
      }
    }
  }
  if (!error && depth !== 0) {
    error = `Unclosed brace at end of file (depth=${depth})`;
  }

  if (error) {
    console.log(`[SYNTAX ERROR] ${file}: ${error}`);
  } else {
    console.log(`[OK] ${file}: braces balanced (${content.split('\n').length} lines)`);
  }
}
