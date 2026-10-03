// Comprehensive verification of Unit Support & Category Routing
import fs from "node:fs";

console.log("=== TESTING UNIT SUPPORT & CATEGORY ROUTING ===");

let passed = 0;
let failed = 0;

function check(cond, msg) {
  if (cond) {
    console.log("  PASS: [" + msg + "]");
    passed++;
  } else {
    console.error("  FAIL: [" + msg + "]");
    failed++;
  }
}

// 1. Dash constraint
const filesToCheck = [
  "assets/cart.js",
  "assets/account.js",
  "assets/catalog-hero.js",
  "assets/catalog-seo.js",
  "assets/catalog-sync.js",
  "assets/i18n.js",
  "assets/site.js",
  "worker/routes/orders.ts"
];

for (const f of filesToCheck) {
  const content = fs.readFileSync(f, "utf8");
  check(!content.includes("\u2014") && !content.includes("\u2013"), "No em-dash or en-dash in " + f);
}

// 2. Unit translations in i18n.js
const i18nContent = fs.readFileSync("assets/i18n.js", "utf8");
check(i18nContent.includes('"unit.pcs": "шт."'), "i18n has ru unit.pcs");
check(i18nContent.includes('"unit.set": "комплект"'), "i18n has ru unit.set");
check(i18nContent.includes('"unit.kg": "кг"'), "i18n has ru unit.kg");
check(i18nContent.includes('"unit.pcs": "dona"'), "i18n has uz unit.pcs");
check(i18nContent.includes('"unit.set": "to‘plam"'), "i18n has uz unit.set");
check(i18nContent.includes('"unit.pcs": "pcs"'), "i18n has en unit.pcs");
check(i18nContent.includes('"unit.set": "set"'), "i18n has en unit.set");

// 3. Cart.js unit support
const cartContent = fs.readFileSync("assets/cart.js", "utf8");
check(cartContent.includes("function unitLabel(unit)"), "cart.js defines unitLabel helper");
check(cartContent.includes("unit = card.dataset.unit || (prodMaster && prodMaster.unit)"), "snapFromCard captures unit");
check(cartContent.includes("unit = (window.BTT_PDP_PRODUCT && window.BTT_PDP_PRODUCT.unit)"), "snapFromPDP captures unit");
check(cartContent.includes("unit: snap.unit || (ex && ex.unit)"), "addToCart stores unit in cart item");
check(cartContent.includes("priceUnit"), "renderCartBody displays price unit");
check(cartContent.includes("qtyUnit"), "renderCartBody displays qty unit");
check(cartContent.includes("unit: it.unit || \"pcs\""), "cartItemsPayload sends unit");
check(cartContent.includes("uStr"), "renderCheckout and buildOrderText format unit");

// 4. Worker orders.ts unit support
const ordersContent = fs.readFileSync("worker/routes/orders.ts", "utf8");
check(ordersContent.includes("unit?: string;"), "InItem interface supports unit");
check(ordersContent.includes("COALESCE(unit, 'pcs') AS unit"), "orders.ts queries product unit from DB");
check(ordersContent.includes("optionsObj.unit = itemUnit"), "orders.ts packs non-pcs unit into options JSON");
check(ordersContent.includes("unitLabels: Record<string, string> = { pcs: \"шт.\", set: \"компл.\", kg: \"кг\", m: \"м\" }"), "orders.ts maps unit in Telegram notify");

// 5. Account.js unit support
const accountContent = fs.readFileSync("assets/account.js", "utf8");
check(accountContent.includes("optUnit = optObj.unit"), "account.js extracts unit from options JSON");
check(accountContent.includes("it.qty || 1) + esc(uStr)"), "account.js renders unit in order item row");

// 6. Category routing in site.js
const siteContent = fs.readFileSync("assets/site.js", "utf8");
check(siteContent.includes("window.BTT_UTIL.applyCatalogState = applyCatalogState"), "site.js exports applyCatalogState");
check(siteContent.includes("group.querySelectorAll(\".chip\").forEach(c=>c.classList.remove(\"is-active\"))"), "site.js activate clears is-active across all chips in group");
check(siteContent.includes("activeCat = resolved;"), "site.js sets activeCat immediately on qcat match");
check(siteContent.includes("if(grid) applyCatalogState(grid);"), "site.js re-runs applyCatalogState on btt:cat-change");

// 7. Category sync in catalog-sync.js
const syncContent = fs.readFileSync("assets/catalog-sync.js", "utf8");
check(syncContent.includes("const qCat = new URLSearchParams(location.search).get(\"cat\")"), "hydrateCatalogGrid preserves URL category filter");
check(syncContent.includes("const reqCat = new URLSearchParams(location.search).get(\"cat\")"), "hydrateCategories activates URL category chip");

// 8. Catalog hero & SEO new categories
const heroContent = fs.readFileSync("assets/catalog-hero.js", "utf8");
check(heroContent.includes("lamps: {"), "catalog-hero.js has lamps config");
check(heroContent.includes("planters: {"), "catalog-hero.js has planters config");
check(heroContent.includes("sets: {"), "catalog-hero.js has sets config");
check(heroContent.includes("planter: \"planters\""), "catalog-hero.js aliases planter to planters (not wicker-chairs)");
check(heroContent.includes("rattan: \"rattan\""), "catalog-hero.js aliases rattan to rattan (not wicker-chairs)");

const seoContent = fs.readFileSync("assets/catalog-seo.js", "utf8");
check(seoContent.includes("lamps: \"meta.cat.lamps\""), "catalog-seo.js has lamps meta");
check(seoContent.includes("sets: \"meta.cat.furniture\""), "catalog-seo.js has sets meta");
check(seoContent.includes("catName + \" в Ташкенте\""), "catalog-seo.js falls back to dynamic category name");

console.log("\n=======================================");
console.log("TOTAL TESTS: " + (passed + failed) + " | PASSED: " + passed + " | FAILED: " + failed);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL UNIT SUPPORT & CATEGORY ROUTING CHECKS PASSED!");
}
