import fs from "node:fs";
import path from "node:path";

const exts = [".html", ".js", ".mjs", ".ts", ".json"];
const ignoreDirs = ["node_modules", ".git", ".wrangler", ".gemini", "dist", "build"];

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.includes(f.name) || f.name.startsWith(".tmp")) continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out);
    else if (exts.includes(path.extname(f.name))) out.push(p);
  }
  return out;
}

const files = walk(".");
let violations = 0;
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    if (/[—–]/.test(line)) {
      if (file.includes("check-dashes") || file.includes("audit-full-system") || file.includes("patch-")) return;
      console.log(`${file}:${idx + 1}: ${line.trim().slice(0, 80)}`);
      violations++;
    }
  });
}

console.log(`Total dash violations found: ${violations}`);
if (violations > 0) {
  process.exit(1);
} else {
  console.log("SUCCESS: Zero em-dash and en-dash violations!");
}
