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

  const currentSlug = resolveProductIdentifier();
  const prod = currentSlug ? PRODUCTS[currentSlug] : null;
  window.BTT_PDP_PRODUCT = prod;

  if(!prod){
    document.title = "BTT - 404";
    const show404 = function(){
      const main = document.querySelector("main") || document.body;
      if(main){
        main.innerHTML = '<div class="wrap" style="text-align:center;padding:120px 20px;">' +
          '<h1 style="font-family:var(--font-head);font-size:3rem;margin-bottom:16px;">404</h1>' +
          '<p style="font-size:1.1rem;color:var(--muted);margin-bottom:30px;">Товар не найден / Mahsulot topilmadi / Product not found</p>' +
          '<a href="catalog.html" class="btn btn--copper" style="display:inline-flex;align-items:center;gap:8px;">' +
          '<span>Каталог товаров</span></a></div>';
      }
    };
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", show404);
    else show404();
    return;
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
    if (avail === "in_stock" || (prod.status === "in_stock" || prod.stock === 1)) {
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
      const foundIdx = confirmed.findIndex(c =>
        (c.id && c.id.toLowerCase() === requestedColor) ||
        (c.hex && c.hex.toLowerCase() === requestedColor)
      );
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
    } else {
      const unspecifiedTxt = t("color.unspecified") || "Доступные цвета уточняйте у менеджера";
      if(valEl) valEl.textContent = curLang === "uz" ? "Menejerdan aniqlang" : (curLang === "en" ? "Inquire" : "Уточняйте");
      if(note){
        note.textContent = unspecifiedTxt;
        note.style.display = "";
      }
      setGallery(prod.images, 0);
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
      if (avail === "on_request" || (avail === "unknown" && item.stock === 0)) {
        availBadge = '<span class="badge-mto" data-i18n="mto.badge">' + esc(t("mto.badge") || "Под заказ") + "</span>";
      } else if (avail === "out_of_stock") {
        availBadge = '<span class="badge-mto badge-oos">' + esc(t("availability.out_of_stock") || "Нет в наличии") + "</span>";
      } else if (avail === "low_stock") {
        availBadge = '<span class="badge-sale badge-low">' + esc(t("availability.low_stock") || "Осталось мало") + "</span>";
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

      return '<article class="product reveal" data-product ' +
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

    document.dispatchEvent(new CustomEvent("btt:related-rendered", { detail: { grid } }));
  }

  function render(){
    const l = lang();
    const nm = t(prod.slug + ".name") || prod.model;
    const cat = t(prod.slug + ".cat") || t("cat." + prod.category);

    // Breadcrumb and Titles
    $$("[data-pdp-name]").forEach(el => el.textContent = nm);
    $$("[data-pdp-cat]").forEach(el => el.textContent = cat);
    $$("[data-crumb-cat]").forEach(a => a.href = "catalog.html?cat=" + prod.category);

    // Price
    const priceEl = $("[data-pdp-price]");
    if(priceEl) priceEl.textContent = money(prod.now);

    // Dimensions
    $$("[data-pdp-dim-val], [data-pdp-spec-dim]").forEach(el => el.textContent = prod.dimensions || "-");

    // Table caution warning
    const warnBoxes = $$("[data-pdp-table-warning], [data-pdp-table-warning-detail]");
    warnBoxes.forEach(box => {
      box.style.display = prod.isTable ? "" : "none";
    });

    // Description
    const masterEntry = MASTER.find(m => m.slug === prod.slug);
    const i18nEntry = masterEntry && masterEntry.i18n && (masterEntry.i18n[l] || masterEntry.i18n.ru);
    const descText = i18nEntry ? i18nEntry.description : ((CATTEXT[prod.category] && (CATTEXT[prod.category][l] || CATTEXT[prod.category].ru)) || {}).desc || "";
    $$("[data-pdp-desc], [data-pdp-full-desc]").forEach(el => el.textContent = descText);

    // Specs
    const matEl = $("[data-pdp-spec-mat]");
    if(matEl){
      matEl.textContent = (prod.materials || []).join(", ");
    }
    const loadRow = $("[data-pdp-spec-load-row]");
    const loadEl = $("[data-pdp-spec-load]");
    if(loadRow && loadEl){
      if(prod.maxLoad){
        loadRow.style.display = "";
        loadEl.textContent = prod.maxLoad;
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
      if(avail === "unknown"){
        availEl.style.display = "none";
      } else {
        availEl.style.display = "";
        availEl.className = "badge-avail badge-avail--" + avail;
        availEl.textContent = t("availability." + avail) || avail;
      }
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

  // Initial load
  function initPDP(){
    setImages();
    render();
    renderRelated();
  }

  if(document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPDP);
  } else {
    initPDP();
  }

  document.addEventListener("btt:lang", ()=>{
    render();
    renderRelated();
  });
})();
