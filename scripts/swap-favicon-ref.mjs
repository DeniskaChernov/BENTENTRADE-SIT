// Point all HTML at the new PNG favicon (our BTT logo mark).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let n = 0;
for (const f of readdirSync(root)) {
  if (!f.endsWith(".html")) continue;
  const p = join(root, f);
  const before = readFileSync(p, "utf8");
  const after = before
    .replaceAll('type="image/svg+xml" href="assets/favicon.svg"', 'type="image/png" href="assets/favicon.png"')
    .replaceAll('rel="apple-touch-icon" href="assets/favicon.svg"', 'rel="apple-touch-icon" href="assets/favicon.png"');
  if (after !== before) { writeFileSync(p, after, "utf8"); n++; }
}
console.log(`updated ${n} html files`);
