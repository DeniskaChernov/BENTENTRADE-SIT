/* Bententrade — product catalogue data (artificial-rattan range)
   Category hero / card imagery: local assets (replace per SKU when CRM photos exist). */
(function(){
  "use strict";

  window.BTT_CAT_IMG = {
    all:       "assets/hero-garden-furniture.png",
    furniture: "assets/hero-garden-furniture.png",
    planter:   "assets/hero-planter.png",
    basket:    "assets/bento-planter.png",
    indoor:    "assets/hero-home-furniture.png",
    rattan:    "assets/bento-rattan.png",
    twisted:   "assets/hero-twisted-rattan.png"
  };

  const CAT = window.BTT_CAT_IMG;

  const LOOK = {
    sofa:       CAT.furniture,
    dining:     CAT.furniture,
    lounge:     CAT.furniture,
    chair:      CAT.furniture,
    corner:     CAT.furniture,
    planterT:   CAT.planter,
    planterS:   CAT.planter,
    planterSet: CAT.planter,
    chest:      CAT.basket,
    laundry:    CAT.basket,
    rocker:     CAT.indoor,
    coffee:     CAT.indoor,
    cabinet:    CAT.indoor,
    shelf:      CAT.indoor
  };

  /* Prices in USD units; BTT_UTIL.formatMoney converts to UZS for display. */
  window.BTT_PRODUCTS = {
    p1: {cat:"furniture", look:"sofa",      now:780, old:980, stock:1},
    p2: {cat:"furniture", look:"lounge",    now:340, old:420, stock:1},
    p3: {cat:"planter",   look:"planterT",  now:95,  old:130, stock:1},
    p4: {cat:"furniture", look:"dining",    now:1180,old:0,   stock:1},
    p5: {cat:"furniture", look:"chair",     now:260, old:340, stock:1},
    p6: {cat:"basket",    look:"chest",     now:180, old:0,   stock:1},
    p7: {cat:"planter",   look:"planterS",  now:48,  old:64,  stock:1},
    p8: {cat:"furniture", look:"chair",     now:155, old:0,   stock:1},
    p9: {cat:"planter",   look:"planterSet",now:210, old:280, stock:1},
    p10:{cat:"furniture", look:"corner",    now:1640,old:1990,stock:0},
    p11:{cat:"basket",    look:"laundry",   now:72,  old:0,   stock:1},
    p12:{cat:"indoor",    look:"rocker",    now:290, old:360, stock:1},
    p13:{cat:"indoor",    look:"coffee",    now:210, old:0,   stock:1},
    p14:{cat:"indoor",    look:"cabinet",   now:540, old:680, stock:0},
    p15:{cat:"indoor",    look:"shelf",     now:320, old:390, stock:1},
    p16:{cat:"furniture", look:"lounge",    now:420, old:520, stock:1},
    p17:{cat:"furniture", look:"chair",     now:185, old:0,   stock:1},
    p18:{cat:"planter",   look:"planterT",  now:125, old:160, stock:1},
    p19:{cat:"planter",   look:"planterS",  now:68,  old:0,   stock:1},
    p20:{cat:"basket",    look:"chest",     now:95,  old:120, stock:1},
    p21:{cat:"basket",    look:"laundry",   now:58,  old:0,   stock:1},
    p22:{cat:"indoor",    look:"coffee",    now:175, old:220, stock:1},
    p23:{cat:"indoor",    look:"rocker",    now:380, old:0,   stock:1},
    p24:{cat:"furniture", look:"sofa",      now:890, old:1100,stock:1},
    p25:{cat:"furniture", look:"dining",    now:520, old:0,   stock:1},
    p26:{cat:"furniture", look:"lounge",    now:395, old:480, stock:1},
    p27:{cat:"furniture", look:"dining",    now:980, old:0,   stock:1},
    p28:{cat:"furniture", look:"chair",     now:220, old:280, stock:1},
    p29:{cat:"furniture", look:"sofa",      now:720, old:890, stock:1},
    p30:{cat:"planter",   look:"planterT",  now:110, old:0,   stock:1},
    p31:{cat:"planter",   look:"planterS",  now:42,  old:55,  stock:1},
    p32:{cat:"planter",   look:"planterSet",now:245, old:310, stock:1},
    p33:{cat:"basket",    look:"chest",     now:165, old:0,   stock:1},
    p34:{cat:"basket",    look:"laundry",   now:64,  old:82,  stock:1},
    p35:{cat:"basket",    look:"chest",     now:88,  old:0,   stock:1},
    p36:{cat:"indoor",    look:"rocker",    now:310, old:390, stock:1},
    p37:{cat:"indoor",    look:"coffee",    now:195, old:0,   stock:1},
    p38:{cat:"indoor",    look:"cabinet",   now:490, old:620, stock:0},
    p39:{cat:"indoor",    look:"shelf",     now:275, old:340, stock:1},
    p40:{cat:"furniture", look:"corner",    now:1720,old:0,   stock:0},
    p41:{cat:"furniture", look:"lounge",    now:450, old:0,   stock:1},
    p42:{cat:"furniture", look:"chair",     now:198, old:250, stock:1},
    p43:{cat:"planter",   look:"planterT",  now:138, old:175, stock:1},
    p44:{cat:"planter",   look:"planterS",  now:55,  old:0,   stock:1},
    p45:{cat:"basket",    look:"laundry",   now:52,  old:0,   stock:1},
    p46:{cat:"basket",    look:"chest",     now:142, old:180, stock:1},
    p47:{cat:"indoor",    look:"rocker",    now:265, old:0,   stock:1},
    p48:{cat:"indoor",    look:"coffee",    now:168, old:210, stock:1},
    p49:{cat:"furniture", look:"sofa",      now:650, old:800, stock:1},
    p50:{cat:"furniture", look:"dining",    now:1050,old:1280,stock:1}
  };

  window.BTT_IS_MTO = id => {
    const p = window.BTT_PRODUCTS[id];
    return !!(p && p.stock === 0);
  };

  const SCENE = [
    "assets/scene-dining-warm.png",
    "assets/scene-dining-teal.png",
    "assets/scene-dining-cream.png",
    "assets/scene-dining-grey.png",
    "assets/scene-dining-light.png",
    "assets/scene-dining-beige.png",
    "assets/scene-dining-azure.png",
    "assets/scene-dining-marble.png",
    "assets/scene-dining-contrast.png",
  ];

  function imgsFor(src, id){
    const n = parseInt(String(id || "p0").slice(1), 10) || 0;
    const picks = [src];
    for (let i = 0; i < 3 && picks.length < 4; i++) {
      const s = SCENE[(n + i * 3) % SCENE.length];
      if (s !== src && !picks.includes(s)) picks.push(s);
    }
    while (picks.length < 4) {
      const s = SCENE[picks.length % SCENE.length];
      if (!picks.includes(s)) picks.push(s);
      else break;
    }
    return picks.slice(0, 4).map(s => ({ thumb: s, full: s }));
  }

  window.BTT_PRODUCT_IMG = id => {
    const p = window.BTT_PRODUCTS[id];
    if(!p) return null;
    const src = LOOK[p.look] || CAT[p.cat] || CAT.furniture;
    return imgsFor(src, id);
  };

  window.BTT_PRODUCT_CAT = {
    furniture:{
      sizes:{ru:["2-местный","3-местный","Угловой"],uz:["2 o‘rinli","3 o‘rinli","Burchak"],en:["2-seater","3-seater","Corner"]}, defSize:1,
      ru:{desc:"Садовая мебель из искусственного ротанга на лёгком алюминиевом каркасе. Плотное ручное плетение не выгорает на солнце, не боится дождя и перепадов температур — комплект круглый год может стоять на террасе, во дворе или в саду.",
          mat:"Искусственный ротанг + алюминий",dim:"С подушками, всесезонный",fin:"UV-стойкое плетение",wt:"Каркас алюминий",seat:"Терраса, двор, сад",made:"Ташкент, ручная работа"},
      uz:{desc:"Yengil alyumin karkasdagi sun’iy rotangdan bog‘ mebeli. Zich qo‘l to‘quvi quyoshda rangini yo‘qotmaydi, yomg‘ir va harorat o‘zgarishidan qo‘rqmaydi — to‘plam yil bo‘yi terassa, hovli yoki bog‘da turishi mumkin.",
          mat:"Sun’iy rotang + alyumin",dim:"Yostiqlar bilan, har faslga",fin:"UV-chidamli to‘quv",wt:"Alyumin karkas",seat:"Terassa, hovli, bog‘",made:"Toshkent, qo‘l mehnati"},
      en:{desc:"Garden furniture in synthetic rattan over a light aluminium frame. The dense hand-weave won't fade in the sun and shrugs off rain and temperature swings — the set can stay on the terrace, in the yard or garden all year round.",
          mat:"Synthetic rattan + aluminium",dim:"With cushions, all-season",fin:"UV-stable weave",wt:"Aluminium frame",seat:"Terrace, yard, garden",made:"Tashkent, by hand"}
    },
    planter:{
      sizes:{ru:["Ø30 см","Ø40 см","Ø55 см"],uz:["Ø30 sm","Ø40 sm","Ø55 sm"],en:["Ø30 cm","Ø40 cm","Ø55 cm"]}, defSize:1,
      ru:{desc:"Кашпо, плетённое вручную из искусственного ротанга, со скрытым внутренним вкладышем и дренажом. Лёгкое, не гниёт и не трескается — одинаково хорошо смотрится с живыми растениями дома, на балконе и в саду.",
          mat:"Искусственный ротанг",dim:"Со вкладышем и дренажом",fin:"Влагостойкое плетение",wt:"Лёгкое",seat:"Дом, балкон, сад",made:"Ташкент, ручная работа"},
      uz:{desc:"Sun’iy rotangdan qo‘lda to‘qilgan gultuvak, yashirin ichki vkladish va drenaj bilan. Yengil, chirimaydi va yorilmaydi — uy, balkon va bog‘da jonli o‘simliklar bilan birdek chiroyli ko‘rinadi.",
          mat:"Sun’iy rotang",dim:"Vkladish va drenaj bilan",fin:"Namlikka chidamli to‘quv",wt:"Yengil",seat:"Uy, balkon, bog‘",made:"Toshkent, qo‘l mehnati"},
      en:{desc:"A planter hand-woven from synthetic rattan, with a hidden inner liner and drainage. Light, rot- and crack-proof — it looks equally good with live plants indoors, on the balcony and in the garden.",
          mat:"Synthetic rattan",dim:"With liner & drainage",fin:"Moisture-resistant weave",wt:"Lightweight",seat:"Home, balcony, garden",made:"Tashkent, by hand"}
    },
    basket:{
      sizes:{ru:["S","M","L"],uz:["S","M","L"],en:["S","M","L"]}, defSize:1,
      ru:{desc:"Сундук и корзина для белья из искусственного ротанга с мягкой тканевой подкладкой и крышкой. Держит форму, не цепляет ткань и проветривается — для хранения белья, пледов, игрушек и мелочей в спальне или ванной.",
          mat:"Искусственный ротанг + подкладка",dim:"С крышкой и подкладкой",fin:"Гладкое плетение",wt:"Складная подкладка",seat:"Бельё, пледы, хранение",made:"Ташкент, ручная работа"},
      uz:{desc:"Sun’iy rotangdan yumshoq mato astarli va qopqoqli sandiq hamda kir savati. Shaklini saqlaydi, matoga ilashmaydi va shamollatiladi — yotoqxona yoki hammomda kir, pled, o‘yinchoq va mayda buyumlar uchun.",
          mat:"Sun’iy rotang + astar",dim:"Qopqoq va astar bilan",fin:"Silliq to‘quv",wt:"Yig‘iladigan astar",seat:"Kir, pled, saqlash",made:"Toshkent, qo‘l mehnati"},
      en:{desc:"A chest and laundry basket in synthetic rattan with a soft fabric liner and lid. Holds its shape, won't snag fabric and stays ventilated — for laundry, throws, toys and bits in the bedroom or bathroom.",
          mat:"Synthetic rattan + liner",dim:"With lid & liner",fin:"Smooth weave",wt:"Foldable liner",seat:"Laundry, throws, storage",made:"Tashkent, by hand"}
    },
    indoor:{
      sizes:{ru:["Компакт","Стандарт","Большой"],uz:["Ixcham","Standart","Katta"],en:["Compact","Standard","Large"]}, defSize:1,
      ru:{desc:"Мебель для дома из искусственного ротанга: лёгкая, тёплая на вид и практичная. Плетение не боится влаги и перепадов, легко протирается влажной тканью — под гостиную, спальню, прихожую или балкон.",
          mat:"Искусственный ротанг + каркас",dim:"Для интерьера, всесезонно",fin:"Гладкое плетение",wt:"Лёгкий каркас",seat:"Гостиная, спальня, балкон",made:"Ташкент, ручная работа"},
      uz:{desc:"Sun’iy rotangdan uy mebeli: yengil, ko‘rinishi issiq va amaliy. To‘quv namlik va o‘zgarishlardan qo‘rqmaydi, nam mato bilan oson artiladi — mehmonxona, yotoqxona, dahliz yoki balkon uchun.",
          mat:"Sun’iy rotang + karkas",dim:"Interyer uchun, har faslga",fin:"Silliq to‘quv",wt:"Yengil karkas",seat:"Mehmonxona, yotoqxona, balkon",made:"Toshkent, qo‘l mehnati"},
      en:{desc:"Home furniture in synthetic rattan: light, warm-looking and practical. The weave shrugs off humidity and temperature swings and wipes clean with a damp cloth — right for the living room, bedroom, hallway or balcony.",
          mat:"Synthetic rattan + frame",dim:"For interiors, all-season",fin:"Smooth weave",wt:"Light frame",seat:"Living room, bedroom, balcony",made:"Tashkent, by hand"}
    }
  };

  function formatStaticPrices(){
    var fmt = window.BTT_UTIL && window.BTT_UTIL.formatMoney;
    var P = window.BTT_PRODUCTS;
    if(!fmt || !P) return;
    document.querySelectorAll("[data-product]").forEach(function(card){
      var see = card.querySelector("a[href*='product.html?id=']");
      if(!see) return;
      var m = (see.getAttribute("href") || "").match(/id=(p\d+)/);
      if(!m) return;
      var p = P[m[1]];
      if(!p) return;
      var now = card.querySelector(".price__now");
      var old = card.querySelector(".price__old");
      if(now) now.textContent = fmt(p.now);
      if(old){
        if(p.old){ old.textContent = fmt(p.old); old.style.display = ""; }
        else old.style.display = "none";
      }
    });
    if(/product\.html$/i.test(location.pathname.split("/").pop() || "")){
      var params = new URLSearchParams(location.search);
      var pid = params.get("id") || "p1";
      var prod = P[pid];
      if(prod){
        var pdpNow = document.querySelector(".pdp-price .now");
        var pdpOld = document.querySelector(".pdp-price .old");
        if(pdpNow) pdpNow.textContent = fmt(prod.now);
        if(pdpOld){
          if(prod.old){ pdpOld.textContent = fmt(prod.old); pdpOld.style.display = ""; }
          else pdpOld.style.display = "none";
        }
      }
    }
  }
  if(typeof document !== "undefined"){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", formatStaticPrices);
    else formatStaticPrices();
  }
})();
