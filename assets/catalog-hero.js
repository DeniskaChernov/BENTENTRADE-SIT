/* ============================================================
   BENTENTRADE - category-driven catalog hero
   Swaps hero photo + copy from ?cat= / #hash; filtering is
   owned by site.js (chips + btt:cat-change).
   ============================================================ */
(function(){
  const LANGS = ["ru","uz","en"];
  const CAT = (window.BTT_CAT_IMG) || {
    all:                "assets/hero-garden-furniture.png",
    "wicker-chairs":    "assets/prod-chair-corda.jpg",
    "plastic-chairs":   "assets/hero-garden-furniture.png",
    "upholstered-chairs":"assets/hero-home-furniture.png",
    tables:             "assets/prod-table-corda-135-black.jpg",
    furniture:          "assets/hero-garden-furniture.png",
    planterMix:         "assets/bento-planter.png",
    planter:            "assets/hero-planter.png",
    basket:             "assets/bento-planter.png",
    indoor:             "assets/hero-home-furniture.png",
    rattan:             "assets/bento-rattan.png",
    twisted:            "assets/hero-twisted-rattan.png"
  };

  const CFG = {
    all: {
      img: CAT.all,
      ru:{k:"Каталог",t:"Мебель для дома и сада",s:"Плетёные, пластиковые и мягкие стулья, а также обеденные столы - вся коллекция BTT."},
      uz:{k:"Katalog",t:"Uy va bog‘ uchun mebel",s:"To‘qilgan, plastik va yumshoq stullar, shuningdek ovqatlanish stollari - butun BTT to‘plami."},
      en:{k:"Catalog",t:"Home & garden furniture",s:"Wicker, plastic and upholstered chairs, plus dining tables - the complete BTT collection."}
    },
    "wicker-chairs": {
      img: CAT["wicker-chairs"],
      ru:{k:"Плетёные стулья",t:"Плетёные стулья для сада и дома",s:"Стулья из кручёного и искусственного ротанга на металлическом каркасе с подушкой."},
      uz:{k:"To‘qilgan stullar",t:"Bog‘ va uy uchun to‘qilgan stullar",s:"Metall karkas va yostiqli, to‘qilgan va sun’iy rotangli stullar."},
      en:{k:"Wicker chairs",t:"Wicker chairs for patio & home",s:"Woven synthetic rattan chairs on metal frames with soft cushions."}
    },
    "plastic-chairs": {
      img: CAT["plastic-chairs"],
      ru:{k:"Пластиковые стулья",t:"Практичные стулья из пластика",s:"Лёгкие и практичные стулья - подходят для дома, сада, летних террас и заведений."},
      uz:{k:"Plastik stullar",t:"Qulay va chidamli plastik stullar",s:"Yengil va amaliy plastik stullar - uy va kafe uchun."},
      en:{k:"Plastic chairs",t:"Practical plastic chairs",s:"Lightweight, stackable chairs designed for home, garden and commercial terraces."}
    },
    "upholstered-chairs": {
      img: CAT["upholstered-chairs"],
      ru:{k:"Мягкие стулья",t:"Мягкие стулья и полукресла",s:"Стулья с комфортной текстильной обивкой и эргономичной спинкой для столовой и гостиной."},
      uz:{k:"Yumshoq stullar",t:"Yumshoq stul va yarim kreslolar",s:"Ovqatlanish va mehmonxona xonalari uchun yumshoq matoli va qulay stullar."},
      en:{k:"Upholstered chairs",t:"Upholstered dining & accent chairs",s:"Soft upholstery and ergonomic contours for modern dining and living spaces."}
    },
    tables: {
      img: CAT.tables,
      ru:{k:"Столы",t:"Обеденные и садовые столы",s:"Столешницы из ЛДСП под мрамор и натуральные текстуры на металлическом основании."},
      uz:{k:"Stollar",t:"Ovqatlanish va bog‘ stollari",s:"Marmar va yog‘och fakturali LDSP stol usti mustahkam metall oyoqlarda."},
      en:{k:"Tables",t:"Dining & outdoor tables",s:"Dining tables with marble-effect tops and powder-coated steel bases."}
    },
    furniture: {
      img: CAT.furniture,
      ru:{k:"Садовая мебель",t:"Мебель для сада и террасы",s:"Диваны, кресла и обеденные группы на лёгком алюминиевом каркасе."},
      uz:{k:"Bog‘ mebeli",t:"Bog‘ va terassa mebeli",s:"Divan, kreslo va ovqat to‘plamlari yengil alyumin karkasda."},
      en:{k:"Garden furniture",t:"Furniture for garden & terrace",s:"Sofas, armchairs and dining sets on a light aluminium frame."}
    },
    planterMix: {
      img: CAT.planterMix,
      ru:{k:"Кашпо, сундуки и корзины",t:"Кашпо, сундуки и корзины",s:"Плетёные кашпо, сундуки и корзины для белья - с вкладышем, дренажом и крышкой для дома, балкона и сада."},
      uz:{k:"Gultuvak, sandiq va savatlar",t:"Gultuvak, sandiq va savatlar",s:"To‘qilgan gultuvak, sandiq va kir savatlari - vkladish, drenaj va qopqoq bilan uy, balkon va bog‘ uchun."},
      en:{k:"Planters, chests & baskets",t:"Planters, chests & baskets",s:"Woven planters, chests and laundry baskets - with a liner, drainage and lid for home, balcony and garden."}
    },
    indoor: {
      img: CAT.indoor,
      ru:{k:"Мебель для дома",t:"Мебель для дома",s:"Кресла-качалки, столики, комоды и стеллажи - для гостиной, спальни и балкона."},
      uz:{k:"Uy mebeli",t:"Uy mebeli",s:"Tebranma kreslo, stol, komod va stellajlar - mehmonxona, yotoqxona va balkon uchun."},
      en:{k:"Home furniture",t:"Home furniture",s:"Rocking chairs, coffee tables, dressers and shelving - for the living room, bedroom and balcony."}
    },
    rattan: {
      img: CAT.rattan,
      ru:{k:"Искусственный ротанг",t:"Изделия из искусственного ротанга",s:"Мебель, кашпо и корзины из полимерного волокна для сада и интерьера."},
      uz:{k:"Sun’iy rotang",t:"Sun’iy rotangdan buyumlar",s:"Bog' va interyer uchun polimer tolali mebel, gultuvak va savatlar."},
      en:{k:"Synthetic rattan",t:"Pieces in synthetic rattan",s:"Furniture, planters and baskets made of polymer fiber for garden and home."}
    },
    twisted: {
      img: CAT.twisted,
      ru:{k:"Крученый ротанг",t:"Крученый ротанг",s:"Плетём катушки из полиэтиленового волокна - от тонкого декора до толстого каркаса. Разные диаметры и цвета."},
      uz:{k:"Burma rotang",t:"Burma rotang",s:"Polietilen tolidan g‘iloflar to‘qiyamiz - nozik dekor yoki qalin karkas uchun. Turli diametr va ranglar."},
      en:{k:"Twisted rattan",t:"Twisted rattan",s:"We weave coils from polyethylene fibre - from fine decor to heavy frame gauges. Multiple diameters and colours."}
    },
    lamps: {
      img: "assets/bento-planter.png",
      ru:{k:"3D-светильники",t:"Интерьерные 3D-светильники и ночники",s:"Стильные акцентные светильники для дома, спальни и подарков."},
      uz:{k:"3D chiroqlar",t:"Interyer uchun 3D chiroqlar va tungi chiroqlar",s:"Uy, yotoqxona va sovg‘alar uchun zamonaviy yorug‘lik."},
      en:{k:"3D Lamps",t:"Ambient 3D lamps & nightlights",s:"Modern accent lights and nightlamps for interior spaces and gifts."}
    },
    planters: {
      img: CAT.planterMix || "assets/bento-planter.png",
      ru:{k:"Кашпо и корзины",t:"Плетёные кашпо и корзины",s:"Кашпо и корзины из полиротанга для цветов, растений, дома и сада."},
      uz:{k:"Gultuvaklar",t:"To‘qilgan gultuvak va savatlar",s:"Gullar, o‘simliklar, uy va bog‘ uchun polirotangdan to‘qilgan gultuvaklar."},
      en:{k:"Planters",t:"Wicker planters & baskets",s:"Woven synthetic rattan planters and baskets for plants, home and garden."}
    },
    sets: {
      img: CAT.furniture || "assets/hero-garden-furniture.png",
      ru:{k:"Комплекты мебели",t:"Готовые мебельные комплекты",s:"Обеденные и лаунж-наборы столов и стульев для дома, сада, веранды и HoReCa."},
      uz:{k:"Mebel to‘plamlari",t:"Tayyor mebel to‘plamlari",s:"Uy, bog‘, ayvon va HoReCa uchun stol va stullardan iborat qulay to‘plamlar."},
      en:{k:"Furniture Sets",t:"Coordinated furniture sets",s:"Dining and lounge table and chair sets for home, patio, garden and HoReCa."}
    }
  };

  let current = "all";

  function curLang(){
    const l = localStorage.getItem("btt_lang");
    return LANGS.includes(l) ? l : "ru";
  }

  function readHeroCat(){
    const q = new URLSearchParams(location.search).get("cat");
    const h = (location.hash || "").replace("#","");
    const raw = q || h || "all";
    const alias = {
      planter: "planters",
      planters: "planters",
      basket: "planters",
      rattan: "rattan",
      wicker: "wicker-chairs",
      furniture: "furniture",
      indoor: "indoor",
      upholstered: "upholstered-chairs",
      plastic: "plastic-chairs",
      table: "tables",
      lamp: "lamps",
      lamps: "lamps",
      set: "sets",
      sets: "sets"
    };
    const c = alias[raw] || raw;
    return CFG[c] ? c : (c || "all");
  }

  function renderHero(cat){
    current = CFG[cat] ? cat : "all";
    const cfg = CFG[current];
    let L = cfg[curLang()] || cfg.ru;
    if(!CFG[cat] && cat && cat !== "all"){
      const l = curLang();
      const chip = document.querySelector('.chip[data-cat="' + cat + '"]');
      const chipText = chip ? (chip.querySelector(".chip-label") || chip).textContent.trim() : cat;
      L = {
        k: chipText,
        t: chipText,
        s: l === "uz" ? "BTT sifatli mahsulotlari to'plami." : (l === "en" ? "Collection from BTT home & garden furniture." : "Коллекция мебели и товаров для дома и сада BTT.")
      };
    }
    const hero = document.querySelector(".page-hero--cat");
    if(hero){
      const img = hero.querySelector(".page-hero__collage img");
      const k = hero.querySelector(".eyebrow");
      const t = hero.querySelector("h1");
      const s = hero.querySelector(".lead");
      if(img && cfg.img){
        img.removeAttribute("onerror");
        img.src = cfg.img;
      }
      [k,t,s].forEach(el=> el && el.removeAttribute("data-i18n"));
      if(k) k.textContent = L.k;
      if(t) t.textContent = L.t;
      if(s) s.textContent = L.s;
    }
    const topTitle = document.querySelector(".cat-top-title");
    const topSub = document.querySelector(".cat-top-sub");
    const topCrumb = document.querySelector(".cat-breadcrumbs__current");
    if(topTitle){
      topTitle.removeAttribute("data-i18n");
      topTitle.textContent = L.t;
    }
    if(topSub){
      topSub.removeAttribute("data-i18n");
      topSub.textContent = L.s;
    }
    if(topCrumb){
      topCrumb.removeAttribute("data-i18n");
      topCrumb.textContent = L.k;
    }
  }

  function syncUrl(chipCat){
    const next = chipCat === "all" ? location.pathname : location.pathname + "?cat=" + chipCat;
    history.replaceState(null, "", next);
  }

  function isCatalogPage(){
    return /(?:catalog\.html|catalog)$/i.test(location.pathname) || !!document.querySelector(".cat-top-bar, .catalog-grid");
  }

  document.addEventListener("DOMContentLoaded", function(){
    if(!isCatalogPage()) return;
    renderHero(readHeroCat());

    document.addEventListener("btt:cat-change", function(e){
      const chipCat = e.detail && e.detail.cat;
      if(!chipCat) return;
      renderHero(chipCat);
      syncUrl(chipCat);
    });

    document.querySelectorAll(".lang button").forEach(b=>{
      b.addEventListener("click", ()=> setTimeout(()=> renderHero(current), 0));
    });
    document.addEventListener("btt:lang", ()=> setTimeout(()=> renderHero(current), 0));
  });
})();
