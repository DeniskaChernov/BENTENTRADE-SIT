/* ============================================================
   BENTENTRADE — category-driven catalog hero
   Swaps hero photo + copy from ?cat= / #hash; filtering is
   owned by site.js (chips + btt:cat-change).
   ============================================================ */
(function(){
  const LANGS = ["ru","uz","en"];
  const CAT = (window.BTT_CAT_IMG) || {
    all:       "assets/hero-garden-furniture.png",
    furniture: "assets/hero-garden-furniture.png",
    planterMix:"assets/bento-planter.png",
    planter:   "assets/hero-planter.png",
    basket:    "assets/bento-planter.png",
    indoor:    "assets/hero-home-furniture.png",
    rattan:    "assets/bento-rattan.png",
    twisted:   "assets/hero-twisted-rattan.png"
  };

  const CFG = {
    all: {
      img: CAT.all,
      ru:{k:"Каталог",t:"Мебель, кашпо и корзины",s:"Плетёные изделия ручной работы для дома, дачи и сада — вся коллекция в одном месте."},
      uz:{k:"Katalog",t:"Mebel, gultuvak va savatlar",s:"Uy, dala va bog‘ uchun qo‘lda to‘qilgan buyumlar — butun to‘plam bir joyda."},
      en:{k:"Catalog",t:"Furniture, planters & baskets",s:"Hand-woven pieces for home, patio and garden — the whole collection in one place."}
    },
    furniture: {
      img: CAT.furniture,
      ru:{k:"Садовая мебель",t:"Мебель для сада и террасы",s:"Диваны, кресла и обеденные группы — всесезонные, на лёгком алюминиевом каркасе."},
      uz:{k:"Bog‘ mebeli",t:"Bog‘ va terassa mebeli",s:"Divan, kreslo va ovqat to‘plamlari — har faslga mos, yengil alyumin karkasda."},
      en:{k:"Garden furniture",t:"Furniture for garden & terrace",s:"Sofas, armchairs and dining sets — all-season, on a light aluminium frame."}
    },
    planterMix: {
      img: CAT.planterMix,
      ru:{k:"Кашпо, сундуки и корзины",t:"Кашпо, сундуки и корзины",s:"Плетёные кашпо, сундуки и корзины для белья — с вкладышем, дренажом и крышкой для дома, балкона и сада."},
      uz:{k:"Gultuvak, sandiq va savatlar",t:"Gultuvak, sandiq va savatlar",s:"To‘qilgan gultuvak, sandiq va kir savatlari — vkladish, drenaj va qopqoq bilan uy, balkon va bog‘ uchun."},
      en:{k:"Planters, chests & baskets",t:"Planters, chests & baskets",s:"Woven planters, chests and laundry baskets — with a liner, drainage and lid for home, balcony and garden."}
    },
    planter: {
      img: CAT.planterMix,
      ru:{k:"Кашпо, сундуки и корзины",t:"Кашпо, сундуки и корзины",s:"Плетёные кашпо, сундуки и корзины для белья — с вкладышем, дренажом и крышкой для дома, балкона и сада."},
      uz:{k:"Gultuvak, sandiq va savatlar",t:"Gultuvak, sandiq va savatlar",s:"To‘qilgan gultuvak, sandiq va kir savatlari — vkladish, drenaj va qopqoq bilan uy, balkon va bog‘ uchun."},
      en:{k:"Planters, chests & baskets",t:"Planters, chests & baskets",s:"Woven planters, chests and laundry baskets — with a liner, drainage and lid for home, balcony and garden."}
    },
    basket: {
      img: CAT.planterMix,
      ru:{k:"Кашпо, сундуки и корзины",t:"Кашпо, сундуки и корзины",s:"Плетёные кашпо, сундуки и корзины для белья — с вкладышем, дренажом и крышкой для дома, балкона и сада."},
      uz:{k:"Gultuvak, sandiq va savatlar",t:"Gultuvak, sandiq va savatlar",s:"To‘qilgan gultuvak, sandiq va kir savatlari — vkladish, drenaj va qopqoq bilan uy, balkon va bog‘ uchun."},
      en:{k:"Planters, chests & baskets",t:"Planters, chests & baskets",s:"Woven planters, chests and laundry baskets — with a liner, drainage and lid for home, balcony and garden."}
    },
    indoor: {
      img: CAT.indoor,
      ru:{k:"Мебель для дома",t:"Мебель для дома",s:"Кресла-качалки, столики, комоды и стеллажи — для гостиной, спальни и балкона."},
      uz:{k:"Uy mebeli",t:"Uy mebeli",s:"Tebranma kreslo, stol, komod va stellajlar — mehmonxona, yotoqxona va balkon uchun."},
      en:{k:"Home furniture",t:"Home furniture",s:"Rocking chairs, coffee tables, dressers and shelving — for the living room, bedroom and balcony."}
    },
    rattan: {
      img: CAT.rattan,
      ru:{k:"Искусственный ротанг",t:"Изделия из искусственного ротанга",s:"Мебель, кашпо и корзины из полиэтиленового волокна — не выгорает, не гниёт и служит годами."},
      uz:{k:"Sun’iy rotang",t:"Sun’iy rotangdan buyumlar",s:"Polietilen tolidan mebel, gultuvak va savatlar — rangini yo‘qotmaydi, chirimaydi va yillar xizmat qiladi."},
      en:{k:"Synthetic rattan",t:"Pieces in synthetic rattan",s:"Furniture, planters and baskets in polyethylene fibre — won’t fade, won’t rot and lasts for years."}
    },
    twisted: {
      img: CAT.twisted,
      ru:{k:"Крученый ротанг",t:"Крученый ротанг",s:"Плетём катушки из полиэтиленового волокна — от тонкого декора до толстого каркаса. Разные диаметры и цвета."},
      uz:{k:"Burma rotang",t:"Burma rotang",s:"Polietilen tolidan g‘iloflar to‘qiyamiz — nozik dekor yoki qalin karkas uchun. Turli diametr va ranglar."},
      en:{k:"Twisted rattan",t:"Twisted rattan",s:"We weave coils from polyethylene fibre — from fine decor to heavy frame gauges. Multiple diameters and colours."}
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
    const alias = { planter: "planterMix", basket: "planterMix" };
    const c = alias[raw] || raw;
    return CFG[c] ? c : "all";
  }

  function renderHero(cat){
    current = CFG[cat] ? cat : "all";
    const cfg = CFG[current];
    const L = cfg[curLang()] || cfg.ru;
    const hero = document.querySelector(".page-hero--cat");
    if(!hero) return;
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

  function syncUrl(chipCat){
    const next = chipCat === "all" ? location.pathname : location.pathname + "?cat=" + chipCat;
    history.replaceState(null, "", next);
  }

  document.addEventListener("DOMContentLoaded", function(){
    if(!document.querySelector(".page-hero--cat")) return;
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
  });
})();
