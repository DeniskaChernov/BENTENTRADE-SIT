import fs from "node:fs";
import assert from "node:assert";

console.log("Checking admin CRM units and catalog-sync unit display...");

// 1. Check worker/routes/admin.ts
const adminRoutes = fs.readFileSync("worker/routes/admin.ts", "utf-8");
assert(
  adminRoutes.includes("COALESCE(p.unit, 'pcs') AS product_unit"),
  "admin.ts GET /orders/:id must LEFT JOIN products to retrieve product_unit"
);
console.log("PASS: admin.ts includes product_unit in GET /orders/:id");

// 2. Check worker/admin-app.ts
const adminApp = fs.readFileSync("worker/admin-app.ts", "utf-8");
assert(adminApp.includes("var prodType = \"all\";"), "admin-app.ts must declare prodType");
assert(adminApp.includes("data-ptype"), "admin-app.ts must have data-ptype filter chips");
assert(adminApp.includes("function getItemUnit(it)"), "admin-app.ts must define getItemUnit(it)");
assert(adminApp.includes("pair[0] !== \"unit\""), "admin-app.ts formatOpts must filter out unit option");
assert(adminApp.includes("getItemUnit(it)"), "admin-app.ts viewOrder must display getItemUnit(it)");
console.log("PASS: admin-app.ts contains product_type filtering and dynamic unit order items");

// 3. Check assets/catalog-sync.js
const catalogSync = fs.readFileSync("assets/catalog-sync.js", "utf-8");
assert(catalogSync.includes("function unitLabel(unit)"), "catalog-sync.js must define unitLabel");
assert(catalogSync.includes("art.setAttribute(\"data-unit\", p.unit)"), "catalog-sync.js buildCard must set data-unit");
assert(catalogSync.includes("card.setAttribute(\"data-unit\", p.unit)"), "catalog-sync.js patchCard must set data-unit");
assert(catalogSync.includes("price__unit"), "catalog-sync.js must render price__unit");
console.log("PASS: catalog-sync.js contains dynamic unit formatting for cards and PDP");

// 4. Verify no em-dash or en-dash in modified files
for (const file of ["worker/routes/admin.ts", "worker/admin-app.ts", "assets/catalog-sync.js"]) {
  const content = fs.readFileSync(file, "utf-8");
  assert(!/\u2014/.test(content), `${file} must not contain em-dash`);
  assert(!/\u2013/.test(content), `${file} must not contain en-dash`);
}
console.log("PASS: Zero em-dash or en-dash verified across all modified files");

console.log("All unit and CRM sync tests passed successfully!");
