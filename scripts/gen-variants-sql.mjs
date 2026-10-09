import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const q = (v) => (v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

const master = JSON.parse(readFileSync(join(root, "data/products-master.json"), "utf8"));

const statements = [];
statements.push("-- Seed all product variants from data/products-master.json");

for (const p of master) {
  if (!p.confirmedColors || !p.confirmedColors.length) continue;
  p.confirmedColors.forEach((c, idx) => {
    const code = c.id;
    const nameRu = (c.name && c.name.ru) || c.ru || c.id;
    const nameUz = (c.name && c.name.uz) || c.uz || nameRu;
    const nameEn = (c.name && c.name.en) || c.en || nameRu;
    const hex = c.hex || "#768C65";
    const mainImg = c.image || (c.images && c.images[0]) || "";
    const imgsJson = JSON.stringify(c.images && c.images.length ? c.images : (mainImg ? [mainImg] : []));
    const sort = (idx + 1) * 10;

    statements.push(
      `INSERT OR REPLACE INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, image, images, price_modifier, active, sort) VALUES (${q(p.slug)}, ${q(code)}, ${q(nameRu)}, ${q(nameUz)}, ${q(nameEn)}, ${q(hex)}, ${q(mainImg)}, ${q(imgsJson)}, 0, 1, ${sort});`
    );
  });
}

writeFileSync(join(root, "scripts/seed-variants.sql"), statements.join("\n") + "\n", "utf8");
console.log("Generated scripts/seed-variants.sql with", statements.length - 1, "statements");
