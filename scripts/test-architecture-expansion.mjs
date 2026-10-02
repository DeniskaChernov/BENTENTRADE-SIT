import assert from "node:assert";
import { execSync } from "node:child_process";

const BASE_URL = process.env.TEST_URL || "https://bententrade.denisblackman2.workers.dev";
console.log("=== BTT ARCHITECTURE EXPANSION VERIFICATION SUITE ===");
console.log("Target:", BASE_URL);

let passed = 0;
let failed = 0;

function check(cond, msg) {
  if (cond) {
    console.log(`  PASS: [${msg}]`);
    passed++;
  } else {
    console.error(`  FAIL: [${msg}]`);
    failed++;
  }
}

async function runTests() {
  // 1. Authoritative D1 prices verification
  console.log("\n--- 1. Authoritative D1 Prices & API Contract ---");
  const prodsRes = await fetch(`${BASE_URL}/api/products?lang=ru`);
  check(prodsRes.status === 200, "GET /api/products returns HTTP 200");
  const prodsData = await prodsRes.json();
  const products = prodsData.products || [];
  check(products.length >= 16, `Products returned: ${products.length} (>= 16)`);

  const roero = products.find(p => p.id === "stul-roero");
  check(roero && roero.price_now === 188000, "Roero price is authoritatively 188000 UZS");

  const noero = products.find(p => p.id === "stul-noero");
  check(noero && noero.price_now === 212000, "Noero price is authoritatively 212000 UZS");

  const todo = products.find(p => p.id === "stul-todo");
  check(todo && todo.price_now === 236000, "Todo price is authoritatively 236000 UZS");

  const jardin = products.find(p => p.id === "stul-jardin");
  check(jardin && jardin.price_now === 344000, "Jardin price is authoritatively 344000 UZS");

  // Check variants / colors contract
  check(roero && Array.isArray(roero.variants) && roero.variants.length > 0, "Roero has variants array in API DTO");
  check(roero && roero.unit === "pcs", "Roero unit is pcs");
  check(roero && roero.product_type === "simple", "Roero product_type is simple");

  // 2. Categories API
  console.log("\n--- 2. Dynamic Categories API ---");
  const catsRes = await fetch(`${BASE_URL}/api/categories?lang=ru`);
  check(catsRes.status === 200, "GET /api/categories returns HTTP 200");
  const catsData = await catsRes.json();
  const categories = catsData.categories || [];
  check(categories.length >= 4, `Categories count: ${categories.length} (>= 4)`);
  check(categories.some(c => c.slug === "wicker-chairs"), "Categories contain wicker-chairs");
  check(categories.some(c => c.slug === "tables"), "Categories contain tables");

  // 3. PDP SSR Shell & Client Hydration for existing canonical SKU
  console.log("\n--- 3. PDP SSR & Client Contract (Existing SKU) ---");
  const pdpRes = await fetch(`${BASE_URL}/catalog/stul-roero`);
  check(pdpRes.status === 200, "PDP /catalog/stul-roero returns HTTP 200");
  const pdpHtml = await pdpRes.text();
  check(
    pdpHtml.includes('<link rel="canonical" href="https://bententrade.uz/catalog/stul-roero">'),
    "PDP contains canonical URL link"
  );
  check(
    pdpHtml.includes('id="btt-runtime-product"'),
    "PDP SSR injects #btt-runtime-product JSON script tag"
  );
  check(
    pdpHtml.includes('"price": 188000') || pdpHtml.includes('"price":188000'),
    "PDP SSR contains Offer Schema.org with authoritative price 188000"
  );
  check(
    pdpHtml.includes('id="pdp-schema-breadcrumb"'),
    "PDP SSR contains BreadcrumbList Schema.org markup"
  );

  // 4. Legacy alias redirect
  console.log("\n--- 4. Legacy Alias 301 Redirect ---");
  const aliasRes = await fetch(`${BASE_URL}/catalog/p3`, { redirect: "manual" });
  check(aliasRes.status === 301, "Legacy alias /catalog/p3 returns HTTP 301");
  check(
    aliasRes.headers.get("location") === "/catalog/stul-roero",
    "Legacy alias redirects to /catalog/stul-roero"
  );

  // 5. Unknown product returns 404
  console.log("\n--- 5. Unknown Product 404 Handling ---");
  const notFoundRes = await fetch(`${BASE_URL}/catalog/non-existent-sku-xyz-999`);
  check(notFoundRes.status === 404, "Unknown product returns HTTP 404");

  // 6. Dynamic sitemap
  console.log("\n--- 6. Dynamic Sitemap Generation ---");
  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  check(sitemapRes.status === 200, "GET /sitemap.xml returns HTTP 200");
  const sitemapXml = await sitemapRes.text();
  check(sitemapXml.includes("/catalog/stul-roero"), "Sitemap includes /catalog/stul-roero");
  check(sitemapXml.includes("/catalog.html?cat=wicker-chairs") || sitemapXml.includes("/catalog?cat=wicker-chairs"), "Sitemap includes category URL for wicker-chairs");

  // 7. Testing New SKU that NEVER existed in products.js or products-master.json
  console.log("\n--- 7. End-to-End Test: New SKU in D1 (Never in products.js) ---");
  const testSku = "stul-aurora-test";
  try {
    console.log("  Seeding test SKU into remote D1...");
    const seedSql = `
      INSERT INTO products (id, category, look, price_now, price_old, active, sort, availability, product_type, unit, featured)
      VALUES ('${testSku}', 'wicker-chairs', 'modern', 275000, 310000, 1, 999, 'in_stock', 'simple', 'pcs', 1)
      ON CONFLICT(id) DO UPDATE SET active = 1, price_now = 275000;

      INSERT INTO product_i18n (product_id, lang, name, category_label, description, seo_title, seo_description)
      VALUES
        ('${testSku}', 'ru', 'Стул Aurora Test', 'Плетёные стулья', 'Тестовое описание стула Aurora.', 'Купить стул Aurora Test в Ташкенте - BTT', 'Качественный стул Aurora Test от BTT.'),
        ('${testSku}', 'uz', 'Aurora Test stuli', 'Toqilgan stullar', 'Aurora Test stuli tavsifi.', 'Aurora Test stuli xarid qilish - BTT', 'BTT dan Aurora Test stuli.'),
        ('${testSku}', 'en', 'Aurora Test Chair', 'Wicker Chairs', 'Test description for Aurora chair.', 'Buy Aurora Test Chair in Tashkent - BTT', 'Aurora Test Chair by BTT.')
      ON CONFLICT(product_id, lang) DO UPDATE SET name = excluded.name;

      INSERT INTO product_variants (product_id, variant_code, name_ru, name_uz, name_en, hex, sort)
      VALUES
        ('${testSku}', 'white', 'Белый', 'Oq', 'White', '#FFFFFF', 0),
        ('${testSku}', 'black', 'Чёрный', 'Qora', 'Black', '#222222', 1)
      ON CONFLICT(product_id, variant_code) DO NOTHING;
    `;

    execSync(`npx wrangler d1 execute bententrade_db --remote --command="${seedSql.replace(/\r?\n/g, " ")}"`, {
      stdio: "pipe"
    });

    console.log("  Verifying new SKU via API...");
    const newSkuApiRes = await fetch(`${BASE_URL}/api/products/${testSku}`);
    check(newSkuApiRes.status === 200, "New SKU returns HTTP 200 from API");
    const newSkuData = await newSkuApiRes.json();
    check(newSkuData.product && newSkuData.product.id === testSku, "New SKU DTO has matching id");
    check(newSkuData.product && newSkuData.product.price_now === 275000, "New SKU price is 275000 UZS");
    check(newSkuData.product && Array.isArray(newSkuData.product.variants) && newSkuData.product.variants.length === 2, "New SKU has 2 variants");

    console.log("  Verifying new SKU via SSR PDP shell...");
    const newSkuPdpRes = await fetch(`${BASE_URL}/catalog/${testSku}`);
    check(newSkuPdpRes.status === 200, "New SKU PDP returns HTTP 200 (No 404 flash!)");
    const newSkuPdpHtml = await newSkuPdpRes.text();
    check(
      newSkuPdpHtml.includes('<link rel="canonical" href="https://bententrade.uz/catalog/stul-aurora-test">'),
      "New SKU PDP has authoritative canonical link"
    );
    check(
      newSkuPdpHtml.includes('id="btt-runtime-product"'),
      "New SKU PDP injects runtime product data script"
    );
    check(
      newSkuPdpHtml.includes('"price": 275000') || newSkuPdpHtml.includes('"price":275000'),
      "New SKU PDP Schema.org Offer has price 275000"
    );

    console.log("  Verifying new SKU in dynamic sitemap.xml...");
    const sitemapWithNew = await (await fetch(`${BASE_URL}/sitemap.xml?_cb=${Date.now()}`)).text();
    check(
      sitemapWithNew.includes(`/catalog/${testSku}`),
      "New active SKU appears automatically in sitemap.xml without code changes"
    );

    console.log("  Verifying deactivation (active = 0)...");
    const deactSql = `UPDATE products SET active = 0 WHERE id = '${testSku}';`;
    execSync(`npx wrangler d1 execute bententrade_db --remote --command="${deactSql}"`, { stdio: "pipe" });

    const deactPdpRes = await fetch(`${BASE_URL}/catalog/${testSku}`);
    check(deactPdpRes.status === 404, "Deactivated SKU returns HTTP 404 on PDP");

    const sitemapDeact = await (await fetch(`${BASE_URL}/sitemap.xml?_cb=${Date.now()}`)).text();
    check(!sitemapDeact.includes(`/catalog/${testSku}`), "Deactivated SKU removed from sitemap.xml");

  } finally {
    console.log("  Cleaning up test SKU from remote D1...");
    const cleanupSql = `
      DELETE FROM product_variants WHERE product_id = '${testSku}';
      DELETE FROM product_i18n WHERE product_id = '${testSku}';
      DELETE FROM products WHERE id = '${testSku}';
    `;
    try {
      execSync(`npx wrangler d1 execute bententrade_db --remote --command="${cleanupSql.replace(/\r?\n/g, " ")}"`, {
        stdio: "pipe"
      });
      console.log("  Test SKU cleaned up successfully.");
    } catch (e) {
      console.warn("  Cleanup warning:", e.message);
    }
  }

  // 8. Testing New Dynamic Category in D1
  console.log("\n--- 8. End-to-End Test: New Category in D1 ---");
  const testCatSlug = "test-designer-lamps";
  try {
    console.log("  Seeding test category into remote D1...");
    const seedCatSql = `
      INSERT INTO categories (slug, sort, active)
      VALUES ('${testCatSlug}', 99, 1)
      ON CONFLICT(slug) DO UPDATE SET active = 1;

      INSERT INTO category_i18n (category_id, lang, name, description, seo_title, seo_description)
      SELECT id, 'ru', 'Дизайнерские лампы', '3D-печатные декоративные лампы', 'Лампы - BTT', 'Купить лампы BTT'
      FROM categories WHERE slug = '${testCatSlug}'
      ON CONFLICT(category_id, lang) DO UPDATE SET name = excluded.name;
    `;
    execSync(`npx wrangler d1 execute bententrade_db --remote --command="${seedCatSql.replace(/\r?\n/g, " ")}"`, {
      stdio: "pipe"
    });

    console.log("  Verifying new category via API...");
    const catCheckRes = await fetch(`${BASE_URL}/api/categories?lang=ru`);
    const catCheckData = await catCheckRes.json();
    const foundCat = (catCheckData.categories || []).find(c => c.slug === testCatSlug);
    check(foundCat && foundCat.name === "Дизайнерские лампы", "New category returned dynamically in API");

    console.log("  Verifying new category in sitemap.xml...");
    const sitemapWithCat = await (await fetch(`${BASE_URL}/sitemap.xml?_cb=${Date.now()}`)).text();
    check(
      sitemapWithCat.includes(`cat=${testCatSlug}`),
      "New category appears automatically in sitemap.xml"
    );

  } finally {
    console.log("  Cleaning up test category from remote D1...");
    const cleanupCatSql = `
      DELETE FROM category_i18n WHERE category_id IN (SELECT id FROM categories WHERE slug = '${testCatSlug}');
      DELETE FROM categories WHERE slug = '${testCatSlug}';
    `;
    try {
      execSync(`npx wrangler d1 execute bententrade_db --remote --command="${cleanupCatSql.replace(/\r?\n/g, " ")}"`, {
        stdio: "pipe"
      });
      console.log("  Test category cleaned up successfully.");
    } catch (e) {
      console.warn("  Category cleanup warning:", e.message);
    }
  }

  console.log("\n=======================================");
  console.log(`TOTAL PASS: ${passed}`);
  console.log(`TOTAL FAIL: ${failed}`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("ALL ARCHITECTURAL TESTS PASSED PERFECTLY!");
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
