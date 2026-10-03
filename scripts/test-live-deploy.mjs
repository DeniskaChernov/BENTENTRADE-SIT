async function runLiveVerification() {
  const baseUrl = "https://bententrade.denisblackman2.workers.dev";
  console.log("=== BTT LIVE PRODUCTION VERIFICATION SUITE ===");
  console.log("Target:", baseUrl);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  PASS: [${message}]`);
      passed++;
    } else {
      console.error(`  FAIL: [${message}]`);
      failed++;
    }
  }

  // 1. Verify PDP /catalog/stul-roero
  const pdpRes = await fetch(`${baseUrl}/catalog/stul-roero`);
  assert(pdpRes.status === 200, "PDP /catalog/stul-roero returns HTTP 200");
  const pdpHtml = await pdpRes.text();
  assert(
    pdpHtml.includes('<link rel="canonical" href="https://btt.uz/catalog/stul-roero">'),
    "PDP contains authoritative canonical URL"
  );
  assert(
    pdpHtml.includes('"price": 188000') || pdpHtml.includes('"price":188000'),
    "PDP Schema.org Offer has updated price 188000 UZS"
  );
  assert(
    pdpHtml.includes('id="pdp-schema-breadcrumb"'),
    "PDP contains BreadcrumbList Schema.org markup"
  );

  // 2. Verify legacy alias 301 redirect
  const aliasRes = await fetch(`${baseUrl}/catalog/p3`, { redirect: "manual" });
  assert(aliasRes.status === 301, "Legacy alias /catalog/p3 returns HTTP 301");
  assert(
    aliasRes.headers.get("location") === "/catalog/stul-roero",
    "Legacy alias redirects to canonical /catalog/stul-roero"
  );

  // 3. Verify dynamic sitemap.xml
  const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
  assert(sitemapRes.status === 200, "Sitemap /sitemap.xml returns HTTP 200");
  const sitemapXml = await sitemapRes.text();
  assert(
    sitemapXml.includes("https://btt.uz/catalog/stul-todo-soft"),
    "Sitemap contains dynamically added stul-todo-soft"
  );
  assert(
    sitemapXml.includes("https://btt.uz/catalog/stul-roero"),
    "Sitemap contains stul-roero"
  );

  // 4. Verify Cache-Control headers
  const swRes = await fetch(`${baseUrl}/sw.js`);
  assert(
    swRes.headers.get("cache-control")?.includes("no-cache"),
    "/sw.js has no-cache Cache-Control header"
  );
  const prodJsRes = await fetch(`${baseUrl}/assets/products.js`);
  assert(
    prodJsRes.headers.get("cache-control")?.includes("max-age=0"),
    "/assets/products.js has max-age=0 revalidating Cache-Control header"
  );
  const cssRes = await fetch(`${baseUrl}/assets/styles.css`);
  assert(
    cssRes.headers.get("cache-control")?.includes("max-age=0"),
    "/assets/styles.css has max-age=0 revalidating Cache-Control header"
  );
  const imgRes = await fetch(`${baseUrl}/assets/prod-chair-roero.jpg`);
  assert(
    imgRes.headers.get("cache-control")?.includes("immutable"),
    "Static images retain immutable Cache-Control header"
  );

  // 5. Verify /api/products updated prices from D1
  const apiRes = await fetch(`${baseUrl}/api/products`);
  assert(apiRes.status === 200, "/api/products returns HTTP 200");
  const apiData = await apiRes.json();
  const products = apiData.products || [];
  const roero = products.find((p) => p.id === "stul-roero");
  const noero = products.find((p) => p.id === "stul-noero");
  const todo = products.find((p) => p.id === "stul-todo");
  const jardin = products.find((p) => p.id === "stul-jardin");

  assert(roero && roero.price_now === 188000, "Roero chair has price_now 188000 UZS in D1 API");
  assert(noero && noero.price_now === 212000, "Noero chair has price_now 212000 UZS in D1 API");
  assert(todo && todo.price_now === 236000, "Todo chair has price_now 236000 UZS in D1 API");
  assert(jardin && jardin.price_now === 344000, "Jardin chair has price_now 344000 UZS in D1 API");

  console.log("=======================================");
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("ALL LIVE VERIFICATION CHECKS PASSED!");
  }
}

runLiveVerification().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
