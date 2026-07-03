/* ============================================================
   BENTENTRADE — category-driven catalog hero
   Swaps hero photo + copy from ?cat= / #hash; filtering is
   owned by site.js (chips + btt:cat-change).
   ============================================================ */
(function(){
  const LANGS = ["ru","uz","en"];

  const CFG = {
    all: {
      img:"https://loremflickr.com/800/800/rattan,furniture/all?lock=11",
      ru:{k:"Каталог",t:"Изделия из искусственного ротанга",s:"Садовая мебель, кашпо и корзины из искусственного ротанга — сделано вручную для дома, дачи и сада."},
      uz:{k:"Katalog",t:"Sun’iy rotang mahsulotlari",s:"Sun’iy rotangdan bog‘ mebeli, gultuvak va savatlar — uy, dala va bog‘ uchun qo‘lda tayyorlangan."},
      en:{k:"Catalog",t:"Synthetic-rattan range",s:"Garden furniture, planters and baskets in synthetic rattan — handmade for home, patio and garden."}
    },
    furniture: {
      img:"https://loremflickr.com/800/800/rattan,sofa/all?lock=11",
      ru:{k:"Садовая мебель",t:"Мебель для сада и террасы",s:"Диваны, кресла и обеденные группы из искусственного ротанга — всесезонные, на лёгком алюминиевом каркасе."},
      uz:{k:"Bog‘ mebeli",t:"Bog‘ va terassa mebeli",s:"Sun’iy rotangdan divan, kreslo va ovqat to‘plamlari — har faslga mos, yengil alyumin karkasda."},
      en:{k:"Garden furniture",t:"Furniture for garden & terrace",s:"Sofas, armchairs and dining sets in synthetic rattan — all-season, on a light aluminium frame."}
    },
    planter: {
      img:"https://loremflickr.com/800/800/wicker,planter/all?lock=4",
      ru:{k:"Кашпо",t:"Кашпо из ротанга",s:"Плетёные кашпо с дренажом и вкладышем — для растений дома, на балконе и в саду."},
      uz:{k:"Gultuvak",t:"Rotang gultuvaklari",s:"Drenaj va vkladishli to‘qilgan gultuvaklar — uy, balkon va bog‘dagi o‘simliklar uchun."},
      en:{k:"Planters",t:"Rattan planters",s:"Woven planters with drainage and a liner — for plants at home, on the balcony and in the garden."}
    },
    basket: {
      img:"https://loremflickr.com/800/800/woven,basket/all?lock=34",
      ru:{k:"Корзины и сундуки",t:"Сундуки и корзины для белья",s:"Плетёные сундуки и корзины с подкладкой и крышкой — для белья, пледов и хранения."},
      uz:{k:"Savat va sandiq",t:"Sandiq va kir savatlari",s:"Astar va qopqoqli to‘qilgan sandiq va savatlar — kir, pled va saqlash uchun."},
      en:{k:"Baskets & chests",t:"Chests & laundry baskets",s:"Woven chests and baskets with a liner and lid — for laundry, throws and storage."}
    },
    indoor: {
      img:"https://loremflickr.com/800/800/rattan,rocking,chair/all?lock=90",
      ru:{k:"Мебель для дома",t:"Мебель для дома из ротанга",s:"Кресла-качалки, столики, комоды и стеллажи из искусственного ротанга — для гостиной, спальни и балкона."},
      uz:{k:"Uy mebeli",t:"Rotangdan uy mebeli",s:"Tebranma kreslo, stol, komod va stellajlar — mehmonxona, yotoqxona va balkon uchun."},
      en:{k:"Home furniture",t:"Rattan home furniture",s:"Rocking chairs, coffee tables, dressers and shelving in synthetic rattan — for the living room, bedroom and balcony."}
    },
    rattan: {
      img:"https://loremflickr.com/800/800/rattan,weave/all?lock=21",
      ru:{k:"Материал",t:"Искусственный ротанг",s:"PE-ротанг выглядит как природное плетение, но не выгорает, не гниёт и служит годами."},
      uz:{k:"Material",t:"Sun’iy rotang",s:"PE-rotang tabiiy to‘quvga o‘xshaydi, lekin rangini yo‘qotmaydi, chirimaydi va yillar xizmat qiladi."},
      en:{k:"Material",t:"Synthetic rattan",s:"PE-rattan looks like natural weave but won't fade, won't rot and lasts for years."}
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
