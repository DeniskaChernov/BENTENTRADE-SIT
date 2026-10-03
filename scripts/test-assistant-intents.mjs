import fs from "node:fs";

console.log("=== TESTING ASSISTANT & SEARCH INTEGRATION ===");

// 1. Dash checks
const files = [
  "assets/assistant.js",
  "assets/search.js",
  "assets/api.js",
  "worker/routes/contact.ts",
  "worker/telegram.ts"
];

let dashFails = 0;
for (const f of files) {
  const code = fs.readFileSync(f, "utf8");
  const em = code.match(/\u2014/g);
  const en = code.match(/\u2013/g);
  if (em || en) {
    console.error(`FAIL: ${f} has dashes! em=${em ? em.length : 0}, en=${en ? en.length : 0}`);
    dashFails++;
  } else {
    console.log(`PASS: [No em-dash or en-dash in ${f}]`);
  }
}
if (dashFails > 0) process.exit(1);

// 2. Syntax & content inspection
const assistantCode = fs.readFileSync("assets/assistant.js", "utf8");

function assertIncludes(code, substr, label) {
  if (code.includes(substr)) {
    console.log(`PASS: [${label}]`);
  } else {
    console.error(`FAIL: [${label}] Missing substring: ${substr}`);
    process.exit(1);
  }
}

assertIncludes(assistantCode, "dynamicProductsMap", "assistant.js has dynamicProductsMap cache");
assertIncludes(assistantCode, "fetchLiveCatalog", "assistant.js has fetchLiveCatalog");
assertIncludes(assistantCode, "getEffectiveProduct", "assistant.js has getEffectiveProduct resolver");
assertIncludes(assistantCode, "Мебельные комплекты", "assistant.js has sets quick chip");
assertIncludes(assistantCode, "Декоративные лампы", "assistant.js has lamps quick chip");
assertIncludes(assistantCode, "Кашпо из ротанга", "assistant.js has planters quick chip");
assertIncludes(assistantCode, "Искусственный ротанг", "assistant.js has rattan quick chip");
assertIncludes(assistantCode, "Цвета и отделка", "assistant.js has colors quick chip");
assertIncludes(assistantCode, "/api/contact", "assistant.js posts leads to /api/contact");

const searchCode = fs.readFileSync("assets/search.js", "utf8");
assertIncludes(searchCode, "loadApiCategories", "search.js has loadApiCategories");
assertIncludes(searchCode, "catCache", "search.js has catCache");
assertIncludes(searchCode, "categories().filter", "search.js uses dynamic categories()");

const apiCode = fs.readFileSync("assets/api.js", "utf8");
assertIncludes(apiCode, "categories: () => request", "api.js has categories helper");

console.log("\nALL ASSISTANT & SEARCH INTEGRATION CHECKS PASSED!");
