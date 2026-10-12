import fs from "node:fs";
import path from "node:path";

const htmlFiles = fs.readdirSync(".").filter((f) => f.endsWith(".html"));

let brokenCount = 0;
for (const file of htmlFiles) {
  const content = fs.readFileSync(file, "utf8");
  const matches = [...content.matchAll(/(?:href|src)=["']([^"'#?]+)["']/g)];
  for (const m of matches) {
    const target = m[1].trim();
    if (
      !target ||
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("//") ||
      target.startsWith("mailto:") ||
      target.startsWith("tel:") ||
      target.startsWith("javascript:") ||
      target.startsWith("data:")
    ) {
      continue;
    }

    const cleanPath = target.startsWith("/") ? target.slice(1) : target;
    if (
      cleanPath &&
      !fs.existsSync(cleanPath) &&
      !cleanPath.startsWith("catalog/") &&
      !cleanPath.startsWith("api/") &&
      !cleanPath.startsWith("media/") &&
      !cleanPath.startsWith("article/") &&
      cleanPath !== ""
    ) {
      console.log(`Broken link in ${file}: ${target}`);
      brokenCount++;
    }
  }
}

console.log(`Total broken internal links found: ${brokenCount}`);
if (brokenCount > 0) {
  process.exit(1);
} else {
  console.log("SUCCESS: All internal HTML links and sources exist!");
}
