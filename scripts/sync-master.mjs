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
   Product master data (Single Source of Truth fallback).
   DO NOT EDIT MANUALLY - Generated from data/products-master.json via scripts/sync-master.mjs.
   All prices are in UZS. */
(function(){
  "use strict";

  var MASTER = ${masterCode};

  window.BTT_PRODUCT_MASTER = MASTER;

  // Build dictionary for fast lookup by canonical slug and legacyId
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
      old: item.price_old || 0,
      price_old: item.price_old || 0,
      status: item.availability || item.status || "unknown",
      availability: item.availability || item.status || "unknown",
      stock: item.availability === "in_stock" ? 1 : (item.availability === "out_of_stock" ? 0 : null),
      dimensions: item.dimensions,
      materials: item.materials,
      maxLoad: item.maxLoad || null,
      confirmedColors: item.confirmedColors || [],
      isTable: !!item.isTable,
      product_type: item.product_type || "simple",
      unit: item.unit || "pcs",
      bundle_items: item.bundle_items || [],
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
    all:                 "assets/scene-dining-warm.png",
    "wicker-chairs":     "assets/prod-chair-corda.jpg",
    "plastic-chairs":    "assets/prod-chair-roero-black.jpg",
    tables:              "assets/prod-table-corda-135-black.jpg",
    lighting:            "assets/prod-lamp-nova.svg",
    "rattan-raw":        "assets/prod-rattan-polutrubka.svg",
    // legacy category aliases
    furniture:           "assets/prod-chair-corda.jpg",
    indoor:              "assets/scene-dining-marble.png",
    planter:             "assets/prod-chair-corda.jpg",
    basket:              "assets/prod-chair-corda.jpg"
  };

  window.BTT_IS_MTO = function(id) {
    var p = window.BTT_PRODUCTS[id];
    return !!(p && p.availability === "on_request");
  };

  window.BTT_PRODUCT_IMG = function(id) {
    var p = window.BTT_PRODUCTS[id];
    if(!p) return null;
    var imgs = p.images && p.images.length ? p.images : ["assets/placeholder.svg"];
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
        desc: "Практичные и лёгкие пластиковые стулья для дома, веранды и кафе.",
        dim: "Для дома, террасы, фудкортов и кафе",
        mat: "Пластик"
      },
      uz: {
        name: "Plastik stullar",
        desc: "Uy, ayvon va kafelar uchun qulay va yengil plastik stullar.",
        dim: "Uy, terrasa, fudkort va kafelar uchun",
        mat: "Plastik"
      },
      en: {
        name: "Plastic chairs",
        desc: "Practical and lightweight plastic chairs for home, patios and cafes.",
        dim: "For home, terrace, food courts and cafes",
        mat: "Plastic"
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
    },
    lighting: {
      ru: {
        name: "Настольные лампы",
        desc: "Дизайнерские настольные лампы с мягким тёплым светом для дома и спальни.",
        dim: "Для спальни, гостиной и кабинета",
        mat: "Металл, акрил, LED"
      },
      uz: {
        name: "Stol lampalari",
        desc: "Uy va yotoqxona uchun yumshoq iliq nurli dizaynerlik stol chiroqlari.",
        dim: "Yotoqxona, mehmonxona va kabinet uchun",
        mat: "Metall, akril, LED"
      },
      en: {
        name: "Table lamps",
        desc: "Designer table lamps with soft warm lighting for cozy bedrooms and living rooms.",
        dim: "For bedroom, living room and study",
        mat: "Metal, acrylic, LED"
      }
    },
    "rattan-raw": {
      ru: {
        name: "Искусственный ротанг",
        desc: "Первичный искусственный ротанг BTT различных профилей для производства плетёной мебели и декора.",
        dim: "Бухты и бобины под заказ",
        mat: "Полимерный ротанг"
      },
      uz: {
        name: "Sun'iy rotang",
        desc: "Mebel ishlab chiqarish uchun turli profildagi sifatli BTT sun'iy rotang xomashyosi.",
        dim: "Buyurtma asosida bobina va buxtalarda",
        mat: "Polimer rotang"
      },
      en: {
        name: "Synthetic rattan",
        desc: "Synthetic rattan raw material in diverse profiles for furniture manufacturing and craft.",
        dim: "Coils and spools on request",
        mat: "Polymer rattan"
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
