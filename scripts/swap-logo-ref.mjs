// One-off: point all HTML at the new PNG logo instead of the SVG wordmark.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let n = 0;
for (const f of readdirSync(root)) {
  if (!f.endsWith(".html")) continue;
  const p = join(root, f);
  const before = readFileSync(p, "utf8");
  const after = before.replaceAll("btt-logo.svg", "btt-logo.png");
  if (after !== before) {
    writeFileSync(p, after, "utf8");
    n++;
  }
}
console.log(`updated ${n} html files`);
