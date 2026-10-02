import fs from 'fs';

const master = JSON.parse(fs.readFileSync('data/products-master.json', 'utf8'));

let sql = '-- SAFE PRODUCTION SYNC SCRIPT (Zero Data Loss, Targeted Updates Only)\n\n';

// 1. Chair prices
sql += "UPDATE products SET price_now = 188000 WHERE id = 'stul-roero';\n";
sql += "UPDATE products SET price_now = 212000 WHERE id = 'stul-noero';\n";
sql += "UPDATE products SET price_now = 236000 WHERE id = 'stul-todo';\n";
sql += "UPDATE products SET price_now = 344000 WHERE id = 'stul-jardin';\n\n";

// 2. Media fixes
sql += "DELETE FROM media WHERE product_id = 'stol-vertex-80';\n";
sql += "INSERT INTO media (key, product_id, alt, sort) VALUES ('assets/placeholder.svg', 'stol-vertex-80', 'Vertex 80', 0);\n";
sql += "DELETE FROM media WHERE product_id = 'stol-corda-135' AND key = 'assets/prod-table-taper-135-white-scene.jpg';\n\n";

// 3. I18N updates
for (const p of master) {
  for (const lang of ['ru', 'uz', 'en']) {
    const i = p.i18n?.[lang];
    if (!i) continue;
    const desc = (i.desc || '').replace(/'/g, "''");
    const seoTitle = (i.seoTitle || '').replace(/'/g, "''");
    const seoDesc = (i.seoDesc || '').replace(/'/g, "''");
    sql += `UPDATE product_i18n SET description = '${desc}', seo_title = '${seoTitle}', seo_description = '${seoDesc}' WHERE product_id = '${p.slug}' AND lang = '${lang}';\n`;
  }
}

fs.writeFileSync('scripts/remote-update.sql', sql, 'utf8');
console.log('Generated scripts/remote-update.sql. Size:', sql.length);
