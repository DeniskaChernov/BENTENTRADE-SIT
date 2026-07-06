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
    planter:   "assets/hero-planter.png",
    basket:    "assets/bento-planter.png",
    indoor:    "assets/hero-home-furniture.png",
    rattan:    "assets/bento-rattan.png"
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
    planter: {
      img: CAT.planter,
      ru:{k:"Кашпо",t:"Плетёные кашпо",s:"Кашпо с дренажом и вкладышем — для растений дома, на балконе и в саду."},
      uz:{k:"Gultuvak",t:"To‘qilgan gultuvaklar",s:"Drenaj va vkladishli gultuvaklar — uy, balkon va bog‘dagi o‘simliklar uchun."},
      en:{k:"Planters",t:"Woven planters",s:"Planters with drainage and a liner — for plants at home, on the balcony and in the garden."}
    },
    basket: {
      img: CAT.basket,
      ru:{k:"Корзины и сундуки",t:"Сундуки и корзины для белья",s:"Плетёные сундуки и корзины с подкладкой и крышкой — для белья, пледов и хранения."},
      uz:{k:"Savat va sandiq",t:"Sandiq va kir savatlari",s:"Astar va qopqoqli to‘qilgan sandiq va savatlar — kir, pled va saqlash uchun."},
      en:{k:"Baskets & chests",t:"Chests & laundry baskets",s:"Woven chests and baskets with a liner and lid — for laundry, throws and storage."}
    },
    indoor: {
      img: CAT.indoor,
      ru:{k:"Мебель для дома",t:"Мебель для дома",s:"Кресла-качалки, столики, комоды и стеллажи — для гостиной, спальни и балкона."},
      uz:{k:"Uy mebeli",t:"Uy mebeli",s:"Tebranma kreslo, stol, komod va stellajlar — mehmonxona, yotoqxona va balkon uchun."},
      en:{k:"Home furniture",t:"Home furniture",s:"Rocking chairs, coffee tables, dressers and shelving — for the living room, bedroom and balcony."}
    },
    rattan: {
      img: CAT.rattan,
      ru:{k:"Материал",t:"Плетение, которое служит годами",s:"Наше плетение выглядит как натуральное, но не выгорает, не гниёт и не боится улицы."},
      uz:{k:"Material",t:"Yillar xizmat qiladigan to‘quv",s:"To‘quvimiz tabiiyga o‘xshaydi, lekin rangini yo‘qotmaydi, chirimaydi va ko‘chadan qo‘rqmaydi."},
      en:{k:"Material",t:"A weave that lasts for years",s:"Our weave looks natural but won’t fade, won’t rot and isn’t afraid of the outdoors."}
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
    const c = q || h || "all";
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
