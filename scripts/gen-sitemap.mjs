// Generates sitemap.xml from data/products-master.json + data/articles.json
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const SITE = "https://bententrade.uz";

function loadProducts() {
  try {
    return JSON.parse(readFileSync(join(root, "data/products-master.json"), "utf8"));
  } catch {
    return [];
  }
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
    url(SITE + "/horeca.html", "0.88", "weekly"),
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

  // 15 canonical product URLs
  products.forEach((p) => {
    lines.push(url(SITE + "/catalog/" + encodeURIComponent(p.slug), "0.85", "weekly"));
  });

  lines.push("</urlset>", "");
  writeFileSync(join(root, "sitemap.xml"), lines.join("\n"), "utf8");
  console.log("Wrote sitemap.xml -", products.length, "canonical products,", articles.length, "articles.");
}

main();
