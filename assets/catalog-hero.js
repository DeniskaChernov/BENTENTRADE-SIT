/* ============================================================
   BENTENTRADE — category-driven catalog hero
   Reads ?cat= (or #hash) and swaps the hero photo + copy,
   pre-filters the grid and highlights the matching chip.
   ============================================================ */
(function(){
  const LANGS = ["ru","uz","en"];

  // cat -> { img, filter(product data-cat or 'all'), ru/uz/en copy }
  const CFG = {
    all: {
      img:"https://loremflickr.com/800/800/rattan,furniture/all?lock=11",
      filter:"all",
      ru:{k:"Каталог",t:"Изделия из искусственного ротанга",s:"Садовая мебель, кашпо и корзины из искусственного ротанга — сделано вручную для дома, дачи и сада."},
      uz:{k:"Katalog",t:"Sun’iy rotang mahsulotlari",s:"Sun’iy rotangdan bog‘ mebeli, gultuvak va savatlar — uy, dala va bog‘ uchun qo‘lda tayyorlangan."},
      en:{k:"Catalog",t:"Synthetic-rattan range",s:"Garden furniture, planters and baskets in synthetic rattan — handmade for home, patio and garden."}
    },
    furniture: {
      img:"https://loremflickr.com/800/800/rattan,sofa/all?lock=11",
      filter:"furniture",
      ru:{k:"Садовая мебель",t:"Мебель для сада и террасы",s:"Диваны, кресла и обеденные группы из искусственного ротанга — всесезонные, на лёгком алюминиевом каркасе."},
      uz:{k:"Bog‘ mebeli",t:"Bog‘ va terassa mebeli",s:"Sun’iy rotangdan divan, kreslo va ovqat to‘plamlari — har faslga mos, yengil alyumin karkasda."},
      en:{k:"Garden furniture",t:"Furniture for garden & terrace",s:"Sofas, armchairs and dining sets in synthetic rattan — all-season, on a light aluminium frame."}
    },
    planter: {
      img:"https://loremflickr.com/800/800/wicker,planter/all?lock=4",
      filter:"planter",
      ru:{k:"Кашпо",t:"Кашпо из ротанга",s:"Плетёные кашпо с дренажом и вкладышем — для растений дома, на балконе и в саду."},
      uz:{k:"Gultuvak",t:"Rotang gultuvaklari",s:"Drenaj va vkladishli to‘qilgan gultuvaklar — uy, balkon va bog‘dagi o‘simliklar uchun."},
      en:{k:"Planters",t:"Rattan planters",s:"Woven planters with drainage and a liner — for plants at home, on the balcony and in the garden."}
    },
    basket: {
      img:"https://loremflickr.com/800/800/woven,basket/all?lock=34",
      filter:"basket",
      ru:{k:"Корзины и сундуки",t:"Сундуки и корзины для белья",s:"Плетёные сундуки и корзины с подкладкой и крышкой — для белья, пледов и хранения."},
      uz:{k:"Savat va sandiq",t:"Sandiq va kir savatlari",s:"Astar va qopqoqli to‘qilgan sandiq va savatlar — kir, pled va saqlash uchun."},
      en:{k:"Baskets & chests",t:"Chests & laundry baskets",s:"Woven chests and baskets with a liner and lid — for laundry, throws and storage."}
    },
    indoor: {
      img:"https://loremflickr.com/800/800/rattan,rocking,chair/all?lock=90",
      filter:"indoor",
      ru:{k:"Мебель для дома",t:"Мебель для дома из ротанга",s:"Кресла-качалки, столики, комоды и стеллажи из искусственного ротанга — для гостиной, спальни и балкона."},
      uz:{k:"Uy mebeli",t:"Rotangdan uy mebeli",s:"Tebranma kreslo, stol, komod va stellajlar — mehmonxona, yotoqxona va balkon uchun."},
      en:{k:"Home furniture",t:"Rattan home furniture",s:"Rocking chairs, coffee tables, dressers and shelving in synthetic rattan — for the living room, bedroom and balcony."}
    },
    rattan: {
      img:"https://loremflickr.com/800/800/rattan,weave/all?lock=21",
      filter:"all",
      ru:{k:"Материал",t:"Искусственный ротанг",s:"PE-ротанг выглядит как природное плетение, но не выгорает, не гниёт и служит годами."},
      uz:{k:"Material",t:"Sun’iy rotang",s:"PE-rotang tabiiy to‘quvga o‘xshaydi, lekin rangini yo‘qotmaydi, chirimaydi va yillar xizmat qiladi."},
      en:{k:"Material",t:"Synthetic rattan",s:"PE-rattan looks like natural weave but won't fade, won't rot and lasts for years."}
    }
  };

  function curLang(){
    const l = localStorage.getItem("btt_lang");
    return LANGS.includes(l) ? l : "ru";
  }
  function readCat(){
    const q = new URLSearchParams(location.search).get("cat");
    const h = (location.hash || "").replace("#","");
    const c = q || h || "all";
    return CFG[c] ? c : "all";
  }

  let current = "all";

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
    // detach from i18n so the language switcher doesn't overwrite our copy
    [k,t,s].forEach(el=> el && el.removeAttribute("data-i18n"));
    if(k) k.textContent = L.k;
    if(t) t.textContent = L.t;
    if(s) s.textContent = L.s;
  }

  function filterGrid(cat){
    const prod = (CFG[cat] && CFG[cat].filter) || "all";
    document.querySelectorAll("#catalog-grid [data-product]").forEach(card=>{
      card.style.display = (prod==="all" || card.dataset.cat===prod) ? "" : "none";
    });
    document.querySelectorAll(".cat-chips .chip").forEach(c=>{
      c.classList.toggle("is-active", c.dataset.cat===prod);
    });
    const cnt = document.querySelector(".cat-count span");
    if(cnt){
      const shown = document.querySelectorAll("#catalog-grid [data-product]").length
        ? Array.from(document.querySelectorAll("#catalog-grid [data-product]")).filter(c=>c.style.display!=="none").length
        : 0;
      cnt.textContent = shown;
    }
  }

  function go(cat, push){
    renderHero(cat);
    filterGrid(cat);
    if(push){
      const url = cat==="all" ? location.pathname : location.pathname + "?cat=" + cat;
      history.replaceState(null, "", url);
    }
  }

  document.addEventListener("DOMContentLoaded", function(){
    if(!document.querySelector(".page-hero--cat")) return;
    go(readCat(), false);

    // chip clicks → swap hero + url (runs after site.js's own filter handler)
    document.querySelectorAll(".cat-chips .chip").forEach(chip=>{
      chip.addEventListener("click", ()=> go(chip.dataset.cat, true));
    });

    // language switch → re-render current category copy
    document.querySelectorAll(".lang button").forEach(b=>{
      b.addEventListener("click", ()=> setTimeout(()=> renderHero(current), 0));
    });
  });
})();
