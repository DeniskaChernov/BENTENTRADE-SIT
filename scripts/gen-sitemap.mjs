// Generates sitemap.xml from products.js + data/articles.json
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const SITE = "https://bententrade.uz";

function loadProducts() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  try {
    vm.runInContext(readFileSync(join(root, "assets/products.js"), "utf8"), sandbox, { filename: "products.js" });
  } catch {}
  const res = sandbox.window.BTT_PRODUCTS || {};
  try {
    const { DatabaseSync } = require("node:sqlite");
    const db = new DatabaseSync(join(root, "data/bententrade.db"));
    const rows = db.prepare("SELECT id FROM products WHERE active = 1").all();
    rows.forEach((r) => { if (r.id) res[r.id] = res[r.id] || {}; });
  } catch {}
  return res;
}

function loadArticles() {
  const slugs = new Set();
  for (const file of ["data/articles.json", "data/articles-seo.json"]) {
    try {
      const data = JSON.parse(readFileSync(join(root, file), "utf8"));
      (data.articles || []).forEach((a) => { if (a.slug) slugs.add(a.slug); });
    } catch { /* skip */ }
  }
  return [...slugs];
}

function url(loc, priority, changefreq) {
  return `  <url><loc>${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

function main() {
  const products = loadProducts();
  const articles = loadArticles();
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    url(SITE + "/", "1.0", "weekly"),
    url(SITE + "/catalog.html", "0.95", "weekly"),
    url(SITE + "/catalog.html?cat=furniture", "0.85", "weekly"),
    url(SITE + "/catalog.html?cat=planterMix", "0.85", "weekly"),
    url(SITE + "/catalog.html?cat=indoor", "0.85", "weekly"),
    url(SITE + "/catalog.html?cat=rattan", "0.85", "weekly"),
    url(SITE + "/rotang-tashkent.html", "0.88", "monthly"),
    url(SITE + "/sadovaya-mebel-rotang.html", "0.88", "monthly"),
    url(SITE + "/about.html", "0.7", "monthly"),
    url(SITE + "/contacts.html", "0.75", "monthly"),
    url(SITE + "/blog.html", "0.8", "weekly"),
  ];

  articles.forEach((slug) => {
    lines.push(url(SITE + "/article.html?slug=" + encodeURIComponent(slug), "0.65", "monthly"));
  });

  ["faq.html", "delivery.html", "returns.html", "care.html", "privacy.html", "cookies.html"].forEach((p) => {
    const pr = p === "privacy.html" || p === "cookies.html" ? "0.3" : p === "faq.html" || p === "care.html" ? "0.55" : "0.5";
    lines.push(url(SITE + "/" + p, pr, "monthly"));
  });

  Object.keys(products)
    .filter((k) => typeof k === "string" && k.trim().length > 0)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .forEach((id) => {
      lines.push(url(SITE + "/product.html?id=" + encodeURIComponent(id), "0.8", "weekly"));
    });

  lines.push("</urlset>", "");
  writeFileSync(join(root, "sitemap.xml"), lines.join("\n"), "utf8");
  console.log("Wrote sitemap.xml —", Object.keys(products).length, "products,", articles.length, "articles");
}

main();
