/* ============================================================
   BTT - Product Detail Page (PDP) Interactions & Data Hydration
   Accurate 16-SKU Single Source of Truth
   Clean URLs: /catalog/:slug or ?id=:slug
   No fake reviews, no fake ratings, factual specs & LDSP warning.
   ============================================================ */
(function(){
  "use strict";

  const MASTER   = window.BTT_PRODUCT_MASTER || [];
  const PRODUCTS = window.BTT_PRODUCTS || {};
  const CATTEXT  = window.BTT_PRODUCT_CAT || {};
  const DICT     = window.BTT_I18N || {};

  function resolveProductIdentifier(){
    const path = location.pathname;
    const catMatch = path.match(/\/catalog\/([a-z0-9-]+)/i);
    if(catMatch){
      const raw = catMatch[1].toLowerCase();
      if(PRODUCTS[raw]) return PRODUCTS[raw].slug || raw;
      if(window.BTT_RESOLVE_PRODUCT){
        const r = window.BTT_RESOLVE_PRODUCT(raw);
        if(r) return typeof r === "string" ? r : (r.slug || raw);
      }
    }

    const params = new URLSearchParams(location.search);
    const id = params.get("id") || params.get("slug");
    if(id){
      const raw = id.trim().toLowerCase();
      if(PRODUCTS[raw]) return PRODUCTS[raw].slug || raw;
      if(window.BTT_RESOLVE_PRODUCT){
        const r = window.BTT_RESOLVE_PRODUCT(raw);
        if(r) return typeof r === "string" ? r : (r.slug || raw);
      }
    }

    return null;
  }

  let currentSlug = resolveProductIdentifier();
  let prod = currentSlug ? PRODUCTS[currentSlug] : null;
  window.BTT_PDP_PRODUCT = prod;

  function show404(){
    document.title = "BTT - 404";
    const main = document.querySelector("main") || document.body;
    if(main){
      main.innerHTML = '<div class="wrap" style="text-align:center;padding:120px 20px;">' +
        '<h1 style="font-family:var(--font-head);font-size:3rem;margin-bottom:16px;">404</h1>' +
        '<p style="font-size:1.1rem;color:var(--muted);margin-bottom:30px;">Товар не найден / Mahsulot topilmadi / Product not found</p>' +
        '<a href="catalog.html" class="btn btn--copper" style="display:inline-flex;align-items:center;gap:8px;">' +
        '<span>Каталог товаров</span></a></div>';
    }
  }

  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));

  const lang = () => {
    const l = document.documentElement.lang;
    return DICT[l] ? l : (localStorage.getItem("btt_lang") || "ru");
  };

  const t = (key) => {
    const d = DICT[lang()] || DICT.ru || {};
    return d[key] != null ? d[key] : (DICT.ru && DICT.ru[key] != null ? DICT.ru[key] : key);
  };

  const esc = (s) => (window.BTT_UTIL && window.BTT_UTIL.esc) ? window.BTT_UTIL.esc(s) : String(s == null ? "" : s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const U = window.BTT_UTIL || {};
  const money = (n) => U.formatMoney ? U.formatMoney(n) : (String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0") + "\u00a0сум");

  const FAV_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20Z"/></svg>';
  const ADD_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>';

  function setMetaPair(name, content){
    if(!content) return;
    document.querySelectorAll('meta[name="'+name+'"], meta[property="'+name+'"]').forEach(el=>{
      el.setAttribute("content", content);
    });
  }

  function setCanonical(href){
    if(!href) return;
    let link = document.querySelector('link[rel="canonical"]');
    if(!link){ link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = href;
  }

  function absUrl(path){
    if(!path) return "https://bententrade.uz/assets/btt-logo.png";
    if(path.indexOf("http") === 0) return path;
    return "https://bententrade.uz/" + path.replace(/^\//, "");
  }

  function injectJsonLd(elId, data){
    let el = document.getElementById(elId);
    if(!el){
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = elId;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  function updateSchema(nm, pageUrl){
    const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(prod.slug) : null;
    const image = imgs && imgs[0] ? absUrl(imgs[0].full) : absUrl("assets/btt-logo.png");
    const catLabel = t(prod.slug + ".cat") || t("cat." + prod.category);
    const offerObj = {
      "@type": "Offer",
      "url": pageUrl,
      "priceCurrency": "UZS",
      "price": prod.now,
      "itemCondition": "https://schema.org/NewCondition",
      "seller": { "@type": "Organization", "name": "BTT - мебель для дома и сада" }
    };
    const avail = prod.availability || "unknown";
    if (avail === "in_stock") {
      offerObj.availability = "https://schema.org/InStock";
    } else if (avail === "low_stock") {
      offerObj.availability = "https://schema.org/LimitedAvailability";
    } else if (avail === "out_of_stock") {
      offerObj.availability = "https://schema.org/OutOfStock";
    } else if (avail === "on_request") {
      offerObj.availability = "https://schema.org/PreOrder";
    }

    injectJsonLd("pdp-schema-product", {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": nm,
      "image": image,
      "description": nm + " - " + catLabel + ". BTT - мебель для дома и сада.",
      "sku": prod.slug.toUpperCase(),
      "brand": { "@type": "Brand", "name": "BTT" },
      "offers": offerObj
    });

    injectJsonLd("pdp-schema-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": t("nav.home") || "Главная", "item": "https://bententrade.uz/" },
        { "@type": "ListItem", "position": 2, "name": t("nav.catalog") || "Каталог", "item": "https://bententrade.uz/catalog.html" },
        { "@type": "ListItem", "position": 3, "name": nm, "item": pageUrl }
      ]
    });
  }

  let openLightbox = function(i){};
  let currentGallery = [];
  let currentActiveIdx = 0;

  function setGallery(images, initialIdx){
    if(!images || !images.length){
      const fallback = (prod && prod.images && prod.images.length) ? prod.images : ["assets/placeholder.svg"];
      images = fallback;
    }
    currentGallery = images.map(it => {
      if(typeof it === "string") return { thumb: it, full: it };
      return { thumb: it.thumb || it.full, full: it.full || it.thumb };
    });

    currentActiveIdx = Math.max(0, Math.min(initialIdx || 0, currentGallery.length - 1));

    // Render thumbs
    const thumbsWrap = $(".pdp-gal__thumbs");
    if(thumbsWrap){
      thumbsWrap.innerHTML = currentGallery.map((im, i) =>
        '<button type="button" class="pdp-thumb' + (i === currentActiveIdx ? ' is-active' : '') + '" data-thumb aria-label="' + esc((t("pdp.thumb") || "Фото {n}").replace("{n}", String(i + 1))) + '">' +
          '<img src="' + esc(im.thumb) + '" alt="" loading="lazy" decoding="async">' +
        '</button>'
      ).join("");

      const thumbBtns = $$(".pdp-thumb", thumbsWrap);
      thumbBtns.forEach((th, i)=>{
        th.addEventListener("click", () => showImg(i));
        th.addEventListener("mouseenter", () => showImg(i));
      });
    }

    // Render stage
    const stageWrap = $("[data-stage]");
    if(stageWrap){
      const zoomHtml =
        '<button class="pdp-stage__zoom" data-pdp-zoom-trigger data-i18n-aria="pdp.zoom.tip" aria-label="' + esc(t("pdp.zoom.tip") || "Нажмите для увеличения") + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>' +
        '</button>';

      const imgsHtml = currentGallery.map((im, i) =>
        '<img class="' + (i === currentActiveIdx ? 'is-on' : '') + '" src="' + esc(im.full) + '" alt="" loading="' + (i === 0 ? 'eager' : 'lazy') + '" ' + (i === 0 ? 'fetchpriority="high"' : '') + ' decoding="async">'
      ).join("");

      stageWrap.innerHTML = zoomHtml + imgsHtml;

      const newZoom = stageWrap.querySelector("[data-pdp-zoom-trigger]");
      if(newZoom){
        newZoom.addEventListener("click", (e) => {
          e.stopPropagation();
          openLightbox(currentActiveIdx);
        });
      }
    }

    const stickyImg = $("[data-sticky-img]");
    if(stickyImg && currentGallery[0]){
      stickyImg.src = currentGallery[0].thumb;
    }
  }

  window.setGallery = setGallery;
  window.BTT_SET_GALLERY = setGallery;

  function showImg(i){
    if(!currentGallery.length) return;
    currentActiveIdx = (i + currentGallery.length) % currentGallery.length;
    const stageImgs = $$("[data-stage] img");
    const thumbBtns = $$(".pdp-gal__thumbs [data-thumb]");
    stageImgs.forEach((im, k) => im.classList.toggle("is-on", k === currentActiveIdx));
    thumbBtns.forEach((th, k) => th.classList.toggle("is-active", k === currentActiveIdx));
  }

  function setImages(){
    if(!currentGallery.length){
      setGallery(prod.images, 0);
    }
  }

  function updateCTAs(nm){
    const tgMsg = encodeURIComponent("Здравствуйте! Интересует: " + (nm || prod.model) + " (" + money(prod.now) + "). Уточните, пожалуйста, наличие и доставку.");
    const tgUrl = "https://t.me/bententradeuz?text=" + tgMsg;

    $$("[data-pdp-tg], [data-pdp-tg-btn], [data-pdp-tg-order]").forEach(el=>{
      el.href = tgUrl;
    });
  }

  function renderSwatches(){
    const wrap = $("[data-pdp-swatches]");
    const note = $("[data-pdp-color-note]");
    const valEl = $("[data-finish-val]");
    if(!wrap) return;

    wrap.innerHTML = "";
    const confirmed = prod.confirmedColors || [];
    const curLang = lang();

    // Check URL for ?color=... parameter
    const params = new URLSearchParams(window.location.search);
    const requestedColor = (params.get("color") || "").toLowerCase().trim();
    let selectedIdx = 0;
    if(requestedColor && confirmed.length > 0){
      const foundIdx = confirmed.findIndex(c => {
        const cid = (c.id || "").toLowerCase();
        if(cid === requestedColor) return true;
        if(c.hex && c.hex.toLowerCase() === requestedColor) return true;
        if((cid === "olive" || cid === "green") && (requestedColor === "olive" || requestedColor === "green")) return true;
        return false;
      });
      if(foundIdx >= 0) selectedIdx = foundIdx;
    }

    if(confirmed.length > 0){
      confirmed.forEach((c, idx)=>{
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "swatch" + (idx === selectedIdx ? " is-active" : "");
        btn.style.background = c.hex;
        const cName = (c.name && (c.name[curLang] || c.name.ru)) || c[curLang] || c.ru || c.id;
        btn.setAttribute("aria-label", cName);
        btn.title = cName;
        btn.dataset.colorName = cName;
        btn.dataset.colorId = c.id;

        btn.addEventListener("click", ()=>{
          $$(".swatch", wrap).forEach(b=>b.classList.remove("is-active"));
          btn.classList.add("is-active");
          if(valEl) valEl.textContent = cName;

          const colorImages = (c.images && c.images.length)
            ? c.images
            : (c.image ? [c.image] : prod.images);
          setGallery(colorImages, 0);
          renderLifestylePairing(c.id);

          try {
            const u = new URL(window.location.href);
            u.searchParams.set("color", c.id);
            window.history.replaceState({}, "", u.toString());
          } catch(e){}
        });

        wrap.appendChild(btn);
      });

      const initialColor = confirmed[selectedIdx];
      const initialColorName = (initialColor.name && (initialColor.name[curLang] || initialColor.name.ru)) || initialColor[curLang] || initialColor.ru || initialColor.id;
      if(valEl) valEl.textContent = initialColorName;
      if(note) note.style.display = "none";

      const initialImgs = (initialColor.images && initialColor.images.length)
        ? initialColor.images
        : (initialColor.image ? [initialColor.image] : prod.images);
      setGallery(initialImgs, 0);
      renderLifestylePairing(initialColor ? initialColor.id : null);
    } else {
      const unspecifiedTxt = t("color.unspecified") || "Доступные цвета уточняйте у менеджера";
      if(valEl) valEl.textContent = curLang === "uz" ? "Menejerdan aniqlang" : (curLang === "en" ? "Inquire" : "Уточняйте");
      if(note){
        note.textContent = unspecifiedTxt;
        note.style.display = "";
      }
      setGallery(prod.images, 0);
      renderLifestylePairing(null);
    }
  }

  function renderRelated(){
    const grid = $("[data-related-grid]");
    if(!grid) return;
    const sameCat = MASTER.filter(m => m.slug !== prod.slug && m.category === prod.category);
    const otherCat = MASTER.filter(m => m.slug !== prod.slug && m.category !== prod.category);
    const related = sameCat.concat(otherCat).slice(0, 4);
    const seeTxt = t("see") || "Подробнее";
    const l = lang();

    grid.innerHTML = related.map(item => {
      const nm = t(item.slug + ".name") || item.model;
      const cat = t(item.slug + ".cat") || t("cat." + item.category);
      const img = item.images && item.images[0] ? item.images[0] : "assets/placeholder.svg";
      const cleanUrl = "/catalog/" + esc(item.slug);

      const disc = item.price_old && item.price_old > item.price
        ? Math.round((1 - item.price / item.price_old) * 100) : 0;
      const sale = disc ? '<span class="badge-sale">-' + disc + "%</span>" : "";
      const avail = item.availability || "unknown";
      let availBadge = "";
      if (avail === "on_request") {
        availBadge = '<span class="badge-mto" data-i18n="availability.on_request">' + esc(t("availability.on_request") || "Под заказ") + "</span>";
      } else if (avail === "out_of_stock") {
        availBadge = '<span class="badge-mto badge-oos" data-i18n="availability.out_of_stock">' + esc(t("availability.out_of_stock") || "Нет в наличии") + "</span>";
      } else if (avail === "low_stock") {
        availBadge = '<span class="badge-sale badge-low" data-i18n="availability.low_stock">' + esc(t("availability.low_stock") || "Осталось мало") + "</span>";
      } else if (avail === "unknown") {
        availBadge = '<span class="badge-avail badge-avail--unknown" data-i18n="availability.unknown">' + esc(t("availability.unknown") || "Уточняйте наличие") + "</span>";
      }
      const old = item.price_old ? '<span class="price__old">' + money(item.price_old) + "</span>" : "";

      const confirmed = item.confirmedColors || [];
      let swatchesHtml = "";
      if (confirmed.length > 0) {
        swatchesHtml =
          '<div class="product-swatches" aria-label="' + esc(t("colors.label") || "Цвета") + '">' +
          confirmed.map(function(c, idx) {
            const cName = (c.name && (c.name[l] || c.name.ru)) || c[l] || c.ru || c.id;
            const rawImg = c.image || (idx === 0 ? img : "");
            const cImg = rawImg ? ((rawImg.startsWith("/") || rawImg.startsWith("http")) ? rawImg : ("/" + rawImg)) : "";
            return '<button type="button" class="product-swatch' + (idx === 0 ? ' is-active' : '') +
              '" style="--swatch-color:' + esc(c.hex) +
              '" data-color="' + esc(c.id) +
              '" data-img="' + esc(cImg) +
              '" title="' + esc(cName) +
              '" aria-label="' + esc(cName) + '"></button>';
          }).join('') +
          '</div>';
      }

      return '<article class="product reveal is-in" data-product ' +
        'data-slug="' + esc(item.slug) + '" ' +
        'data-id="' + esc(item.legacyId || item.slug) + '" ' +
        'data-cat="' + esc(item.category) + '" ' +
        'data-price="' + item.price + '">' +
        '<div class="product__media media">' + sale + availBadge +
        '<button class="fav" data-fav data-prod-id="' + esc(item.slug) + '" data-i18n-aria="a11y.fav" aria-label="' + esc(t("a11y.fav")||"В избранное") + '">' + FAV_SVG + '</button>' +
        '<img src="' + esc(img) + '" alt="' + esc(nm) + '" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">' +
        '<a class="see" href="' + esc(cleanUrl) + '" data-i18n="see">' + esc(seeTxt) + '</a>' +
        '<button class="add" data-add data-prod-id="' + esc(item.slug) + '" data-i18n-aria="a11y.add" aria-label="' + esc(t("a11y.add")||"В корзину") + '">' + ADD_SVG + '</button>' +
        '</div>' +
        '<div>' +
        '<div class="product__cat">' + esc(cat) + '</div>' +
        '<div class="product__name">' + esc(nm) + '</div>' +
        swatchesHtml +
        '<div class="price"><span class="price__now">' + money(item.price) + '</span>' + old + '</div>' +
        '</div>' +
        '</article>';
    }).join("");

    const parentSection = grid.closest("section");
    if(parentSection) $$(".reveal", parentSection).forEach(el => el.classList.add("is-in"));

    document.dispatchEvent(new CustomEvent("btt:related-rendered", { detail: { grid } }));
  }

  const PAIRING_MAP = {
    // Chairs -> Recommended Table
    "stul-jardin": "stol-taper-80",
    "stul-vertex": "stol-vertex-d90",
    "stul-corda": "stol-corda-135",
    "stul-roero": "stol-taper-80",
    "stul-noero": "stol-taper-80",
    "stul-todo": "stol-taper-135",
    "stul-todo-soft": "stol-taper-135",
    "stul-lira": "stol-taper-135",
    "kreslo-como": "stol-taper-135",

    // Tables -> Recommended Chair
    "stol-taper-rotang-80": "stul-vertex",
    "stol-vertex-d90": "stul-vertex",
    "stol-taper-rotang-135": "stul-corda",
    "stol-taper-80": "stul-jardin",
    "stol-vertex-80": "stul-vertex",
    "stol-taper-135": "stul-todo-soft",
    "stol-corda-135": "stul-corda"
  };

  const COLOR_SCENES = {
    "cappuccino": "assets/scene-dining-warm.png",
    "beige": "assets/scene-dining-warm.png",
    "coffee": "assets/scene-dining-beige.png",
    "olive": "assets/hero-garden-furniture.png",
    "blue": "assets/scene-dining-azure.png",
    "orange": "assets/scene-dining-warm.png",
    "grey": "assets/scene-dining-grey.png",
    "gray": "assets/scene-dining-grey.png",
    "black": "assets/scene-dining-contrast.png",
    "white": "assets/scene-dining-light.png",
    "yellow": "assets/scene-dining-warm.png",
    "red": "assets/scene-dining-warm.png",
    "white-marble": "assets/scene-dining-marble.png",
    "black-marble": "assets/scene-dining-contrast.png"
  };

  const PRODUCT_DEFAULT_SCENES = {
    "stul-lira": "assets/scene-dining-cream.png",
    "kreslo-como": "assets/scene-dining-marble.png",
    "stul-vertex": "assets/scene-dining-warm.png",
    "stul-corda": "assets/scene-dining-warm.png"
  };

  let activeColorId = null;

  function getLifestyleScene(colorId){
    if(colorId && COLOR_SCENES[colorId]){
      return COLOR_SCENES[colorId];
    }
    if(PRODUCT_DEFAULT_SCENES[prod.slug]){
      return PRODUCT_DEFAULT_SCENES[prod.slug];
    }
    if(prod.isTable && prod.slug.includes("135")){
      return (colorId === "white-marble") ? "assets/prod-table-taper-135-white-scene.jpg" : "assets/prod-table-taper-135-scene.jpg";
    }
    return "assets/scene-dining-warm.png";
  }

  function renderLifestylePairing(colorId){
    if(colorId) activeColorId = colorId;
    const container = $("[data-pdp-lifestyle-container]");
    if(!container) return;

    const pairedSlug = PAIRING_MAP[prod.slug];
    const pairedProd = pairedSlug ? PRODUCTS[pairedSlug] : null;
    if(!pairedProd){
      container.innerHTML = "";
      return;
    }

    const curLang = lang();
    const isTable = !!prod.isTable;
    const chairProd = isTable ? pairedProd : prod;
    const tableProd = isTable ? prod : pairedProd;
    const chairCount = (tableProd.slug && tableProd.slug.includes("135")) ? 6 : 4;

    const chairModel = chairProd.model || chairProd.slug;
    const tableModel = tableProd.model || tableProd.slug;
    const pairedName = t(pairedProd.slug + ".name") || pairedProd.model;
    const pairedCat = t(pairedProd.slug + ".cat") || t("cat." + pairedProd.category);
    const pairedImg = (pairedProd.images && pairedProd.images[0]) ? pairedProd.images[0] : "assets/placeholder.svg";
    const pairedUrl = "/catalog/" + encodeURIComponent(pairedProd.slug);

    const sceneImg = getLifestyleScene(activeColorId);

    const comboTotal = (tableProd.now || 0) + ((chairProd.now || 0) * chairCount);

    const infoTitle = isTable ? (t("pdp.life.pair.table") || "Рекомендуемые стулья к столу") : (t("pdp.life.pair.chair") || "Рекомендуемый обеденный стол");

    let infoDesc = "";
    if(curLang === "uz"){
      infoDesc = isTable
        ? ("«" + tableModel + "» stoli «" + chairModel + "» stullari bilan mukammal mos keladi. Oshxona, mehmonxona, yopiq veranda yoki qahvaxona uchun tayyor yechim.")
        : ("«" + chairModel + "» stuli «" + tableModel + "» stoli bilan ajoyib uyg'unlashadi. Balandlik va kenglik bo'yicha qulay joylashuv, yagona uslub va ergonomik qulaylik yaratadi.");
    } else if(curLang === "en"){
      infoDesc = isTable
        ? ("The " + tableModel + " table pairs seamlessly with " + chairModel + " chairs. A complete, harmonious dining solution for living rooms, covered verandas, or dining spaces.")
        : ("The " + chairModel + " chair is designed to pair perfectly with the " + tableModel + " table. Ideal seating height, cohesive aesthetic, and elevated comfort for everyday dining.");
    } else {
      infoDesc = isTable
        ? ("Стол «" + tableModel + "» безупречно сочетается со стульями «" + chairModel + "». Готовая обеденная группа для кухни, просторной гостиной, веранды или кафе.")
        : ("Стул «" + chairModel + "» идеально подходит к столу «" + tableModel + "». Оптимальная высота посадки, единый стиль и максимальный комфорт для семейных обедов.");
    }

    let chairWord = "стульев";
    if(chairCount === 1) chairWord = "стул";
    else if(chairCount >= 2 && chairCount <= 4) chairWord = "стула";

    let comboLabel = "";
    if(curLang === "uz"){
      comboLabel = "To'liq to'plam: 1 ta stol + " + chairCount + " ta stul";
    } else if(curLang === "en"){
      comboLabel = "Complete set: 1 table + " + chairCount + " chairs";
    } else {
      comboLabel = "Комплект: 1 стол + " + chairCount + " " + chairWord;
    }

    const tgOrderText = encodeURIComponent(
      "Здравствуйте! Хочу заказать готовый комплект: стол " + tableModel +
      " + " + chairCount + " " + (curLang === "uz" ? "ta stul" : (curLang === "en" ? "chairs" : chairWord)) + " " + chairModel +
      " (Итого: " + money(comboTotal) + "). Уточните, пожалуйста, наличие и условия доставки."
    );
    const tgUrl = "https://t.me/bententradeuz?text=" + tgOrderText;

    const atmosphereBadge = t("pdp.life.badge.atmosphere") || "Интерьерное решение";
    const orderBtnText = t("pdp.life.combo.order") || "Заказать комплект в Telegram";

    container.innerHTML =
      '<div class="pdp-lifestyle-visual">' +
        '<img src="' + esc(sceneImg) + '" alt="' + esc(tableModel + ' & ' + chairModel) + '" loading="lazy" decoding="async">' +
        '<div class="pdp-lifestyle-visual__badge">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></svg>' +
          '<span>' + esc(atmosphereBadge) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="pdp-lifestyle-info">' +
        '<div>' +
          '<h3 class="pdp-lifestyle-info__title">' + esc(infoTitle) + '</h3>' +
          '<p class="pdp-lifestyle-info__desc">' + esc(infoDesc) + '</p>' +
          '<a class="pdp-lifestyle-card" href="' + esc(pairedUrl) + '">' +
            '<div class="pdp-lifestyle-card__media">' +
              '<img src="' + esc(pairedImg) + '" alt="' + esc(pairedName) + '" loading="lazy" decoding="async">' +
            '</div>' +
            '<div class="pdp-lifestyle-card__meta">' +
              '<div class="pdp-lifestyle-card__cat">' + esc(pairedCat) + '</div>' +
              '<div class="pdp-lifestyle-card__name">' + esc(pairedName) + '</div>' +
              '<div class="pdp-lifestyle-card__price">' + money(pairedProd.now) + '</div>' +
            '</div>' +
          '</a>' +
        '</div>' +
        '<div class="pdp-lifestyle-combo">' +
          '<div class="pdp-lifestyle-combo__row">' +
            '<span class="pdp-lifestyle-combo__label">' + esc(comboLabel) + '</span>' +
            '<span class="pdp-lifestyle-combo__total">' + money(comboTotal) + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            '<button type="button" class="btn btn--copper" data-combo-quick-buy style="display:inline-flex;align-items:center;gap:6px">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>' +
              '<span>' + esc(t("pdp.life.combo.one_click") || "Купить комплект в 1 клик") + '</span>' +
            '</button>' +
            '<a class="btn btn--ghost sm" href="' + tgUrl + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px">' +
              '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>' +
              '<span>Telegram</span>' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    const comboBtn = container.querySelector("[data-combo-quick-buy]");
    if(comboBtn){
      comboBtn.onclick = function(e){
        e.preventDefault();
        if(window.BTT_CART && window.BTT_CART.openQuickOrder){
          window.BTT_CART.openQuickOrder({
            id: prod.slug + "__combo__" + pairedProd.slug,
            name: comboLabel + " (" + tableModel + " + " + chairModel + ")",
            price: comboTotal,
            img: sceneImg,
            qty: 1
          });
        }
      };
    }

    const parentSection = container.closest(".pdp-lifestyle");
    if(parentSection) $$(".reveal", parentSection).forEach(el => el.classList.add("is-in"));
  }

  function render(){
    const l = lang();
    const localizedObj = prod.i18n && (prod.i18n[l] || prod.i18n.ru);
    const masterEntry = MASTER.find(m => m.slug === prod.slug);
    const i18nEntry = localizedObj || (masterEntry && masterEntry.i18n && (masterEntry.i18n[l] || masterEntry.i18n.ru));

    const nm = (localizedObj && localizedObj.name) || t(prod.slug + ".name") || prod.name || prod.model;
    const cat = prod.category_label || (localizedObj && localizedObj.category_label) || t(prod.slug + ".cat") || t("cat." + prod.category);

    // Breadcrumb and Titles
    $$("[data-pdp-name]").forEach(el => el.textContent = nm);
    $$("[data-pdp-cat]").forEach(el => el.textContent = cat);
    $$("[data-crumb-cat]").forEach(a => a.href = "catalog.html?cat=" + prod.category);

    // Price and unit
    const priceEl = $("[data-pdp-price]");
    const unitText = (prod.unit_label || (prod.unit && prod.unit !== "pcs" ? (" / " + t("unit." + prod.unit)) : ""));
    if(priceEl) priceEl.textContent = money(prod.now) + (unitText ? (" " + unitText) : "");

    // Dimensions
    const dims = prod.dimensions || (prod.specs && prod.specs.dim) || "-";
    $$("[data-pdp-dim-val], [data-pdp-spec-dim]").forEach(el => el.textContent = dims);

    // Table caution warning
    const warnBoxes = $$("[data-pdp-table-warning], [data-pdp-table-warning-detail]");
    warnBoxes.forEach(box => {
      box.style.display = prod.isTable ? "" : "none";
    });

    // Description
    const descText = (i18nEntry && i18nEntry.description) || prod.description || ((CATTEXT[prod.category] && (CATTEXT[prod.category][l] || CATTEXT[prod.category].ru)) || {}).desc || "";
    $$("[data-pdp-desc], [data-pdp-full-desc]").forEach(el => el.textContent = descText);

    // Bundle composition if product_type === 'bundle'
    let bundleBox = document.getElementById("pdp-bundle-composition");
    if(prod.product_type === "bundle" && prod.bundle_items && prod.bundle_items.length){
      if(!bundleBox){
        bundleBox = document.createElement("div");
        bundleBox.id = "pdp-bundle-composition";
        bundleBox.className = "pdp-bundle-box";
        bundleBox.style.cssText = "margin:16px 0;padding:14px 16px;border:1px solid var(--border);border-radius:10px;background:var(--bg-soft, rgba(0,0,0,0.02));";
        const buySection = document.querySelector(".pdp-buy");
        if(buySection && buySection.parentNode){
          buySection.parentNode.insertBefore(bundleBox, buySection);
        }
      }
      const bTitle = t("bundle.composition") || "Состав комплекта:";
      const itemsHtml = prod.bundle_items.map(function(bi){
        const compHref = "/catalog/" + encodeURIComponent(bi.product_id);
        const compName = bi.name || bi.component_name || bi.product_id;
        const compQty = bi.quantity || 1;
        return '<li style="margin-bottom:6px;"><a href="' + esc(compHref) + '" style="color:var(--primary);text-decoration:underline;font-weight:600;">' + esc(compName) + '</a> - ' + compQty + ' ' + (t("pcs") || "шт.") + '</li>';
      }).join("");
      bundleBox.innerHTML = '<div style="font-weight:700;font-size:14px;margin-bottom:8px;">' + esc(bTitle) + '</div><ul style="margin:0;padding-left:20px;font-size:13.5px;">' + itemsHtml + '</ul>';
      bundleBox.style.display = "";
    } else if(bundleBox){
      bundleBox.style.display = "none";
    }

    // Specs
    const matEl = $("[data-pdp-spec-mat]");
    if(matEl){
      const matStr = Array.isArray(prod.materials) ? prod.materials.join(", ") : ((prod.specs && prod.specs.mat) || "-");
      matEl.textContent = matStr;
    }
    const loadRow = $("[data-pdp-spec-load-row]");
    const loadEl = $("[data-pdp-spec-load]");
    if(loadRow && loadEl){
      const loadVal = prod.maxLoad || (prod.specs && prod.specs.max_load);
      if(loadVal){
        loadRow.style.display = "";
        loadEl.textContent = loadVal;
      } else {
        loadRow.style.display = "none";
      }
    }
    const usageEl = $("[data-pdp-spec-usage]");
    if(usageEl && i18nEntry && i18nEntry.usage){
      usageEl.textContent = i18nEntry.usage;
    }

    // Availability badge
    const availEl = $("[data-pdp-avail]");
    const avail = prod.availability || "unknown";
    if(availEl){
      availEl.style.display = "";
      availEl.className = "badge-avail badge-avail--" + avail;
      availEl.textContent = t("availability." + avail) || "Уточняйте наличие";
    }

    renderSwatches();
    updateCTAs(nm);

    // Page meta
    const pageUrl = "https://bententrade.uz/catalog/" + encodeURIComponent(prod.slug);
    const seoTitle = (i18nEntry && i18nEntry.seo_title) || ("BTT - " + nm);
    const seoDesc = (i18nEntry && i18nEntry.seo_description) || (nm + " - " + cat + ". BTT - мебель для дома и сада.");
    document.title = seoTitle;
    setMetaPair("description", seoDesc);
    setMetaPair("og:title", seoTitle);
    setMetaPair("og:url", pageUrl);
    setCanonical(pageUrl);
    updateSchema(nm, pageUrl);
  }


  // Quantity controls
  $$("[data-qty]").forEach(q=>{
    const input = q.querySelector("input");
    const clamp = v => Math.max(1, Math.min(99, v || 1));
    const minus = q.querySelector("[data-qd]");
    const plus = q.querySelector("[data-qu]");
    if(minus) minus.addEventListener("click", ()=>{ input.value = clamp(parseInt(input.value, 10) - 1); });
    if(plus) plus.addEventListener("click", ()=>{ input.value = clamp(parseInt(input.value, 10) + 1); });
    input.addEventListener("input", ()=>{ input.value = input.value.replace(/\D/g, ""); });
    input.addEventListener("blur", ()=>{ input.value = clamp(parseInt(input.value, 10)); });
  });

  // Cart add button on PDP is handled authoritatively by cart.js (with qty, haptics, and checkmark icon)

  // Lightbox
  const lightbox = $("[data-pdp-lightbox]");
  if(lightbox){
    const lbImg = lightbox.querySelector("[data-lightbox-img]");
    const lbThumbs = lightbox.querySelector("[data-lightbox-thumbs]");
    const lbPrev = lightbox.querySelector("[data-lightbox-prev]");
    const lbNext = lightbox.querySelector("[data-lightbox-next]");

    openLightbox = function(i){
      const imgs = (currentGallery && currentGallery.length)
        ? currentGallery
        : ((window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(prod.slug) : []) || []);
      if(!imgs.length) return;
      currentActiveIdx = (i + imgs.length) % imgs.length;
      if(lbImg) lbImg.src = imgs[currentActiveIdx].full;
      if(lbThumbs){
        lbThumbs.innerHTML = imgs.map((im, k)=>
          '<button type="button" class="pdp-lightbox__thumb' + (k === currentActiveIdx ? ' is-active' : '') + '" data-lb-idx="' + k + '" aria-label="' + esc((t("pdp.thumb") || "Фото {n}").replace("{n}", String(k + 1))) + '">' +
          '<img src="' + esc(im.thumb) + '" alt="">' +
          '</button>'
        ).join("");
        lbThumbs.querySelectorAll("[data-lb-idx]").forEach(btn=>{
          btn.addEventListener("click", ()=> openLightbox(parseInt(btn.dataset.lbIdx, 10)));
        });
      }
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
    };

    function closeLightbox(){
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";
    }

    lightbox.querySelectorAll("[data-lightbox-close]").forEach(el => el.addEventListener("click", closeLightbox));
    if(lbPrev) lbPrev.addEventListener("click", ()=> openLightbox(currentActiveIdx - 1));
    if(lbNext) lbNext.addEventListener("click", ()=> openLightbox(currentActiveIdx + 1));

    document.addEventListener("keydown", e=>{
      if(!lightbox.classList.contains("is-open")) return;
      if(e.key === "Escape") closeLightbox();
      else if(e.key === "ArrowLeft") openLightbox(currentActiveIdx - 1);
      else if(e.key === "ArrowRight") openLightbox(currentActiveIdx + 1);
    });

    const zoomTrigger = $("[data-pdp-zoom-trigger]");
    if(zoomTrigger) zoomTrigger.addEventListener("click", ()=> openLightbox(currentActiveIdx));
    const stageBox = $("[data-stage]");
    if(stageBox){
      stageBox.addEventListener("click", (e)=>{
        if(e.target.closest("[data-pdp-zoom-trigger]")) return;
        openLightbox(currentActiveIdx);
      });

      let touchStartX = 0;
      let touchStartY = 0;
      stageBox.addEventListener("touchstart", (e)=>{
        if(!e.touches || !e.touches[0]) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      stageBox.addEventListener("touchend", (e)=>{
        if(!e.changedTouches || !e.changedTouches[0]) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5){
          if(dx < 0) showImg(currentActiveIdx + 1);
          else showImg(currentActiveIdx - 1);
        }
      }, { passive: true });
    }
  }

  // Initial load & runtime product hydration
  function initPDP(){
    setImages();
    render();
    renderRelated();
    renderLifestylePairing(activeColorId);
  }

  async function bootstrapPDP(){
    // 1. Check for server-injected runtime product script
    const runtimeScript = document.getElementById("btt-runtime-product");
    if(runtimeScript && runtimeScript.textContent){
      try {
        const parsed = JSON.parse(runtimeScript.textContent);
        if(parsed && (parsed.id || parsed.slug)){
          prod = parsed;
          currentSlug = parsed.slug || parsed.id;
        }
      } catch(e){}
    }

    if(!prod){
      currentSlug = resolveProductIdentifier();
      if(currentSlug && PRODUCTS[currentSlug]){
        prod = PRODUCTS[currentSlug];
      }
    }

    // 2. Fallback to API if not in static array
    if(!prod && currentSlug && window.BTT_API && window.BTT_API.product){
      try {
        const res = await window.BTT_API.product(currentSlug);
        if(res && res.product){
          prod = res.product;
        }
      } catch(e){}
    }

    if(prod){
      if(!window.BTT_PRODUCTS) window.BTT_PRODUCTS = {};
      window.BTT_PRODUCTS[prod.id] = prod;
      if(prod.slug) window.BTT_PRODUCTS[prod.slug] = prod;
      window.BTT_PDP_PRODUCT = prod;
      initPDP();
    } else {
      show404();
    }
  }

  if(document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrapPDP);
  } else {
    bootstrapPDP();
  }

  document.addEventListener("btt:lang", ()=>{
    if(prod){
      render();
      renderRelated();
      renderLifestylePairing(activeColorId);
    }
  });
})();
