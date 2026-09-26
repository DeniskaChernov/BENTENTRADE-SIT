// Syncs data/products-master.json to assets/products.js and runs gen-seed.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function syncProductsJs() {
  const master = JSON.parse(readFileSync(join(root, "data/products-master.json"), "utf8"));

  const masterCode = JSON.stringify(master, null, 2);

  const jsContent = `/* BTT - мебель для дома и сада
   Product master data (exact 15 SKUs, Single Source of Truth).
   All prices are in UZS. Generated from data/products-master.json. */
(function(){
  "use strict";

  var MASTER = ${masterCode};

  window.BTT_PRODUCT_MASTER = MASTER;

  // Build dictionary for fast lookup by canonical slug and legacyId (p1..p15)
  var PRODUCTS = {};
  MASTER.forEach(function(item){
    var obj = {
      id: item.slug,
      slug: item.slug,
      legacyId: item.legacyId,
      model: item.model,
      cat: item.category,
      category: item.category,
      now: item.price,
      price: item.price,
      old: 0,
      status: item.status || "unknown",
      stock: item.status === "in_stock" ? 1 : (item.status === "out_of_stock" ? 0 : null),
      dimensions: item.dimensions,
      materials: item.materials,
      maxLoad: item.maxLoad || null,
      confirmedColors: item.confirmedColors || [],
      isTable: !!item.isTable,
      images: item.images || []
    };
    PRODUCTS[item.slug] = obj;
    if(item.legacyId) PRODUCTS[item.legacyId] = obj;
  });

  window.BTT_PRODUCTS = PRODUCTS;
  window.BTT_CANONICAL_SLUGS = MASTER.map(function(m){ return m.slug; });

  // Canonical product identifier resolver
  window.BTT_RESOLVE_PRODUCT = function(idOrSlug){
    if(!idOrSlug) return null;
    var s = String(idOrSlug).trim().toLowerCase();
    var p = PRODUCTS[s];
    if(p) return p.slug;
    return null;
  };

  window.BTT_CAT_IMG = {
    all:                 "assets/hero-garden-furniture.png",
    "wicker-chairs":     "assets/prod-chair-corda.jpg",
    "plastic-chairs":    "assets/hero-garden-furniture.png",
    "upholstered-chairs":"assets/hero-home-furniture.png",
    tables:              "assets/prod-table-dining-room.jpg",
    // legacy category aliases
    furniture:           "assets/prod-chair-corda.jpg",
    indoor:              "assets/hero-home-furniture.png",
    planter:             "assets/hero-garden-furniture.png",
    basket:              "assets/hero-home-furniture.png"
  };

  window.BTT_IS_MTO = function(id) {
    var p = window.BTT_PRODUCTS[id];
    return !!(p && p.stock === 0);
  };

  window.BTT_PRODUCT_IMG = function(id) {
    var p = window.BTT_PRODUCTS[id];
    if(!p) return null;
    var imgs = p.images && p.images.length ? p.images : ["assets/prod-chair-corda.jpg"];
    return imgs.map(function(s){ return { thumb: s, full: s }; });
  };

  window.BTT_PRODUCT_CAT = {
    "wicker-chairs": {
      ru: {
        name: "Плетёные стулья",
        desc: "Стулья на металлическом каркасе с плетением из искусственного ротанга и мягкими подушками.",
        dim: "Для дома, террас и кафе",
        mat: "Металл, искусственный ротанг, текстиль"
      },
      uz: {
        name: "To‘qilgan stullar",
        desc: "Metall karkasli, sun’iy rotang to‘quvli va yumshoq yostiqli qulay stullar.",
        dim: "Uy, terrasa va kafelar uchun",
        mat: "Metall, sun’iy rotang, to‘qimachilik"
      },
      en: {
        name: "Wicker chairs",
        desc: "Comfortable chairs on a metal frame with synthetic rattan weave and soft cushions.",
        dim: "For homes, terraces and cafes",
        mat: "Metal, synthetic rattan, textile"
      }
    },
    "plastic-chairs": {
      ru: {
        name: "Пластиковые стулья",
        desc: "Практичные, лёгкие и долговечные пластиковые стулья для дома, веранды и кафе.",
        dim: "Для дома, террасы, фудкортов и кафе",
        mat: "Прочный износостойкий пластик"
      },
      uz: {
        name: "Plastik stullar",
        desc: "Uy, ayvon va kafelar uchun qulay, yengil va mustahkam plastik stullar.",
        dim: "Uy, terrasa, fudkort va kafelar uchun",
        mat: "Pishiq, sifatli plastik"
      },
      en: {
        name: "Plastic chairs",
        desc: "Practical, lightweight and durable plastic chairs for home, patios and cafes.",
        dim: "For home, terrace, food courts and cafes",
        mat: "Durable high-grade plastic"
      }
    },
    "upholstered-chairs": {
      ru: {
        name: "Мягкие стулья",
        desc: "Стулья и кресла на металлическом каркасе с текстильной обивкой для комфортной обеденной зоны.",
        dim: "Для гостиной, кухни и банкетных залов",
        mat: "Металл, мягкий текстиль"
      },
      uz: {
        name: "Yumshoq stullar",
        desc: "Qulay ovqatlanish hududi uchun metall karkasdagi yumshoq matoli stul va kreslolar.",
        dim: "Mehmonxona, oshxona va banket zallari uchun",
        mat: "Metall, yumshoq to‘qimachilik"
      },
      en: {
        name: "Upholstered chairs",
        desc: "Chairs and armchairs on a sturdy metal frame with soft textile upholstery for dining comfort.",
        dim: "For living rooms, kitchens and banquet venues",
        mat: "Metal, soft textile"
      }
    },
    tables: {
      ru: {
        name: "Столы",
        desc: "Обеденные столы на прочном металлическом каркасе со столешницей из ЛДСП. Для помещений и крытых пространств. Столешницу из ЛДСП рекомендуется защищать от прямых осадков.",
        dim: "Для кухни, столовой, закрытых веранд и HoReCa",
        mat: "ЛДСП, металл"
      },
      uz: {
        name: "Stollar",
        desc: "Mustahkam metall karkas va LDSP ustki qismga ega ovqat stollari. Xonalar va yopiq maydonlar uchun. LDSP ustki qismini to‘g‘ridan-to‘g‘ri yog‘ingarchilikdan himoya qilish tavsiya etiladi.",
        dim: "Oshxona, yopiq ayvonlar va HoReCa uchun",
        mat: "LDSP, metall"
      },
      en: {
        name: "Tables",
        desc: "Dining tables on a solid metal frame with chipboard tabletop. For indoor and covered spaces. It is recommended to protect the chipboard tabletop from direct precipitation.",
        dim: "For kitchens, dining areas, covered terraces and HoReCa",
        mat: "Chipboard, metal"
      }
    }
  };

  // Helper to format prices on static elements
  function formatStaticPrices(){
    var fmt = window.BTT_UTIL && window.BTT_UTIL.formatMoney;
    var P = window.BTT_PRODUCTS;
    if(!fmt || !P) return;

    document.querySelectorAll("[data-product]").forEach(function(card){
      var see = card.querySelector("a[href*='catalog/'], a[href*='product.html?id=']");
      if(!see) return;
      var href = see.getAttribute("href") || "";
      var slugMatch = href.match(/\\/catalog\\/([a-z0-9-]+)/i) || href.match(/id=([a-z0-9-]+)/i);
      if(!slugMatch) return;
      var prod = P[slugMatch[1]];
      if(!prod) return;
      var now = card.querySelector(".price__now");
      var old = card.querySelector(".price__old");
      if(now) now.textContent = fmt(prod.now);
      if(old) old.style.display = "none";
    });
  }

  if(typeof document !== "undefined"){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", formatStaticPrices);
    else formatStaticPrices();
  }
})();
`;

  writeFileSync(join(root, "assets/products.js"), jsContent, "utf8");
  console.log("Updated assets/products.js from master data.");
}

function main() {
  syncProductsJs();
  execSync("node scripts/gen-seed.mjs", { stdio: "inherit", cwd: root });
  execSync("node scripts/gen-sitemap.mjs", { stdio: "inherit", cwd: root });
}

main();
