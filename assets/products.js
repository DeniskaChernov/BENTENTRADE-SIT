/* BTT — мебель для дома и сада
   Product master data (exact 15 SKUs, Single Source of Truth).
   All prices are in UZS. */
(function(){
  "use strict";

  // Easily adjustable price for Corda 135x80 table:
  var BTT_PRICE_STOL_CORDA_135 = 949000;

  var MASTER = [
    {
      slug: "stul-vertex",
      legacyId: "p1",
      model: "Vertex",
      category: "wicker-chairs",
      price: 499000,
      dimensions: "57 × 63 × 75 см",
      materials: ["металл", "кручёный искусственный ротанг", "текстиль"],
      maxLoad: null,
      confirmedColors: [
        { id: "beige", name: { ru: "Бежевый", uz: "Bej", en: "Beige" }, hex: "#C2B280" }
      ],
      isTable: false,
      stock: 1,
      images: [
        "assets/prod-chair-corda.jpg",
        "assets/scene-dining-warm.png",
        "assets/hero-garden-furniture.png"
      ]
    },
    {
      slug: "stul-corda",
      legacyId: "p2",
      model: "Corda",
      category: "wicker-chairs",
      price: 499000,
      dimensions: "57 × 63 × 77 см",
      materials: ["металл", "искусственный ротанг", "текстиль"],
      maxLoad: null,
      confirmedColors: [],
      isTable: false,
      stock: 1,
      images: [
        "assets/prod-chair-corda.jpg",
        "assets/scene-dining-warm.png",
        "assets/hero-garden-furniture.png"
      ]
    },
    {
      slug: "stul-roero",
      legacyId: "p3",
      model: "ROERO",
      category: "plastic-chairs",
      price: 168000,
      dimensions: "74 × 46 × 48 см",
      materials: ["пластик"],
      maxLoad: "120 кг",
      confirmedColors: [
        { id: "grey", name: { ru: "Серый", uz: "Kulrang", en: "Grey" }, hex: "#808080" }
      ],
      isTable: false,
      stock: 1,
      images: [
        "assets/hero-garden-furniture.png",
        "assets/scene-dining-grey.png"
      ]
    },
    {
      slug: "stul-noero",
      legacyId: "p4",
      model: "NOERO",
      category: "plastic-chairs",
      price: 192000,
      dimensions: "82 × 48 × 49 см",
      materials: ["пластик"],
      maxLoad: "120 кг",
      confirmedColors: [
        { id: "cappuccino", name: { ru: "Капучино", uz: "Kapuchino", en: "Cappuccino" }, hex: "#A88D73" }
      ],
      isTable: false,
      stock: 1,
      images: [
        "assets/hero-garden-furniture.png",
        "assets/scene-dining-warm.png"
      ]
    },
    {
      slug: "stul-todo",
      legacyId: "p5",
      model: "TODO",
      category: "plastic-chairs",
      price: 216000,
      dimensions: "80 × 51 × 51 см",
      materials: ["пластик"],
      maxLoad: "180 кг",
      confirmedColors: [
        { id: "black", name: { ru: "Чёрный", uz: "Qora", en: "Black" }, hex: "#222222" }
      ],
      isTable: false,
      stock: 1,
      images: [
        "assets/hero-garden-furniture.png",
        "assets/prod-table-vertex-black.jpg"
      ]
    },
    {
      slug: "stul-jardin",
      legacyId: "p6",
      model: "JARDIN",
      category: "plastic-chairs",
      price: 324000,
      dimensions: "73.5 × 53.5 × 55.5 см",
      materials: ["пластик"],
      maxLoad: "150 кг",
      confirmedColors: [
        { id: "cappuccino", name: { ru: "Капучино", uz: "Kapuchino", en: "Cappuccino" }, hex: "#A88D73" }
      ],
      isTable: false,
      stock: 1,
      images: [
        "assets/hero-garden-furniture.png",
        "assets/scene-dining-warm.png"
      ]
    },
    {
      slug: "stul-lira",
      legacyId: "p7",
      model: "LIRA",
      category: "upholstered-chairs",
      price: 354000,
      dimensions: "95 × 55 × 48 см",
      materials: ["металл", "текстиль"],
      maxLoad: null,
      confirmedColors: [],
      isTable: false,
      stock: 1,
      images: [
        "assets/hero-home-furniture.png",
        "assets/scene-dining-azure.png"
      ]
    },
    {
      slug: "kreslo-como",
      legacyId: "p8",
      model: "COMO",
      category: "upholstered-chairs",
      price: 486000,
      dimensions: "82 × 63 × 60 см",
      materials: ["металл", "текстиль"],
      maxLoad: null,
      confirmedColors: [],
      isTable: false,
      stock: 1,
      images: [
        "assets/hero-home-furniture.png",
        "assets/scene-dining-warm.png"
      ]
    },
    {
      slug: "stol-taper-rotang-80",
      legacyId: "p9",
      model: "Taper Rotang 80x80",
      category: "tables",
      price: 615000,
      dimensions: "80 × 80 × 75 см",
      materials: ["ЛДСП", "металл", "искусственный ротанг"],
      maxLoad: null,
      confirmedColors: [],
      isTable: true,
      stock: 1,
      images: [
        "assets/prod-table-dining-room.jpg",
        "assets/prod-table-marble-detail.jpg"
      ]
    },
    {
      slug: "stol-vertex-d90",
      legacyId: "p10",
      model: "Vertex D90",
      category: "tables",
      price: 680000,
      dimensions: "Ø90 × 75 см",
      materials: ["ЛДСП", "металл"],
      maxLoad: null,
      confirmedColors: [
        { id: "white-marble", name: { ru: "Белый мрамор", uz: "Oq marmar", en: "White Marble" }, hex: "#E8E6E1" }
      ],
      isTable: true,
      stock: 1,
      images: [
        "assets/prod-table-vertex-white.jpg",
        "assets/prod-table-marble-detail.jpg"
      ]
    },
    {
      slug: "stol-taper-rotang-135",
      legacyId: "p11",
      model: "Taper Rotang 135x80",
      category: "tables",
      price: 715000,
      dimensions: "135 × 80 × 75 см",
      materials: ["ЛДСП", "металл", "искусственный ротанг"],
      maxLoad: null,
      confirmedColors: [],
      isTable: true,
      stock: 1,
      images: [
        "assets/prod-table-dining-room.jpg",
        "assets/prod-table-marble-detail.jpg"
      ]
    },
    {
      slug: "stol-taper-80",
      legacyId: "p12",
      model: "Taper 80x80",
      category: "tables",
      price: 734000,
      dimensions: "80 × 80 × 75 см",
      materials: ["ЛДСП", "металл"],
      maxLoad: null,
      confirmedColors: [],
      isTable: true,
      stock: 1,
      images: [
        "assets/prod-table-dining-room.jpg",
        "assets/prod-table-marble-detail.jpg"
      ]
    },
    {
      slug: "stol-vertex-80",
      legacyId: "p13",
      model: "Vertex 80x80",
      category: "tables",
      price: 738000,
      dimensions: "80 × 80 × 75 см",
      materials: ["ЛДСП", "металл"],
      maxLoad: null,
      confirmedColors: [],
      isTable: true,
      stock: 1,
      images: [
        "assets/prod-table-vertex-black.jpg",
        "assets/prod-table-marble-detail.jpg"
      ]
    },
    {
      slug: "stol-taper-135",
      legacyId: "p14",
      model: "Taper 135x80",
      category: "tables",
      price: 885000,
      dimensions: "135 × 80 × 75 см",
      materials: ["ЛДСП", "металл"],
      maxLoad: null,
      confirmedColors: [],
      isTable: true,
      stock: 1,
      images: [
        "assets/prod-table-dining-room.jpg",
        "assets/prod-table-marble-detail.jpg"
      ]
    },
    {
      slug: "stol-corda-135",
      legacyId: "p15",
      model: "Corda 135x80",
      category: "tables",
      price: BTT_PRICE_STOL_CORDA_135,
      dimensions: "135 × 80 × 75 см",
      materials: ["ЛДСП", "металл"],
      maxLoad: null,
      confirmedColors: [],
      isTable: true,
      stock: 1,
      images: [
        "assets/prod-table-dining-room.jpg",
        "assets/prod-table-marble-detail.jpg"
      ]
    }
  ];

  window.BTT_PRODUCT_MASTER = MASTER;

  // Build dictionary for fast lookup by slug and legacyId (p1..p15)
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
      old: 0, // No fake old prices
      stock: item.stock,
      dimensions: item.dimensions,
      materials: item.materials,
      maxLoad: item.maxLoad,
      confirmedColors: item.confirmedColors,
      isTable: item.isTable,
      images: item.images
    };
    PRODUCTS[item.slug] = obj;
    if(item.legacyId) PRODUCTS[item.legacyId] = obj;
  });

  window.BTT_PRODUCTS = PRODUCTS;

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
        desc: "Практичные, лёгкие и долговечные пластиковые стулья с допустимой нагрузкой от 120 до 180 кг.",
        dim: "Для дома, террасы, фудкортов и кафе",
        mat: "Прочный износостойкий пластик"
      },
      uz: {
        name: "Plastik stullar",
        desc: "120 dan 180 kg gacha yuk ko‘taradigan qulay, yengil va mustahkam plastik stullar.",
        dim: "Uy, terrasa, fudkort va kafelar uchun",
        mat: "Pishiq, sifatli plastik"
      },
      en: {
        name: "Plastic chairs",
        desc: "Practical, lightweight and durable plastic chairs with load capacities from 120 kg to 180 kg.",
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
      var slugMatch = href.match(/\/catalog\/([a-z0-9-]+)/i) || href.match(/id=([a-z0-9-]+)/i);
      if(!slugMatch) return;
      var prod = P[slugMatch[1]];
      if(!prod) return;
      var now = card.querySelector(".price__now");
      var old = card.querySelector(".price__old");
      if(now) now.textContent = fmt(prod.now);
      if(old) old.style.display = "none"; // No fake old prices
    });
  }

  if(typeof document !== "undefined"){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", formatStaticPrices);
    else formatStaticPrices();
  }
})();
