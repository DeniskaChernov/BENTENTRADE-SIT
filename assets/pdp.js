/* ============================================================
   BTT - Product Detail Page (PDP) Interactions & Data Hydration
   Accurate 15-SKU Single Source of Truth
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
    }

    const params = new URLSearchParams(location.search);
    const id = params.get("id") || params.get("slug");
    if(id){
      const raw = id.trim().toLowerCase();
      if(PRODUCTS[raw]) return PRODUCTS[raw].slug || raw;
    }

    // Default to first product ONLY if on /product without query params
    if(catMatch || id) return null;
    return "stul-vertex";
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

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
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
    if (prod.status === "in_stock" || prod.stock === 1) {
      offerObj.availability = "https://schema.org/InStock";
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

  function setImages(){
    const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(prod.slug) : null;
    if(!imgs || !imgs.length) return;
    const thumbs = $$("[data-thumb]");
    const stage  = $$("[data-stage] img");

    thumbs.forEach((thumbBtn, i)=>{
      if(imgs[i]){
        thumbBtn.style.display = "";
        const thumbImg = thumbBtn.querySelector("img");
        if(thumbImg) thumbImg.src = imgs[i].thumb;
        thumbBtn.setAttribute("aria-label", (t("pdp.thumb") || "Фото {n}").replace("{n}", String(i + 1)));
      } else {
        thumbBtn.style.display = "none";
      }
      thumbBtn.classList.toggle("is-active", i === 0);
    });

    stage.forEach((stImg, i)=>{
      if(imgs[i]){
        stImg.style.display = "";
        stImg.src = imgs[i].full;
        stImg.classList.toggle("is-on", i === 0);
      } else {
        stImg.style.display = "none";
        stImg.classList.remove("is-on");
      }
    });
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

    if(confirmed.length > 0){
      confirmed.forEach((c, idx)=>{
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "swatch" + (idx === 0 ? " is-active" : "");
        btn.style.background = c.hex;
        const cName = (c.name && (c.name[curLang] || c.name.ru)) || c.id;
        btn.setAttribute("aria-label", cName);
        btn.title = cName;
        btn.dataset.colorName = cName;
        btn.addEventListener("click", ()=>{
          $$(".swatch", wrap).forEach(b=>b.classList.remove("is-active"));
          btn.classList.add("is-active");
          if(valEl) valEl.textContent = cName;
        });
        wrap.appendChild(btn);
      });
      const firstColor = (confirmed[0].name && (confirmed[0].name[curLang] || confirmed[0].name.ru)) || confirmed[0].id;
      if(valEl) valEl.textContent = firstColor;
      if(note) note.style.display = "none";
    } else {
      const unspecifiedTxt = t("color.unspecified") || "Доступные цвета уточняйте у менеджера";
      if(valEl) valEl.textContent = curLang === "uz" ? "Menejerdan aniqlang" : (curLang === "en" ? "Inquire" : "Уточняйте");
      if(note){
        note.textContent = unspecifiedTxt;
        note.style.display = "";
      }
    }
  }

  function renderRelated(){
    const grid = $("[data-related-grid]");
    if(!grid) return;
    const sameCat = MASTER.filter(m => m.slug !== prod.slug && m.category === prod.category);
    const otherCat = MASTER.filter(m => m.slug !== prod.slug && m.category !== prod.category);
    const related = sameCat.concat(otherCat).slice(0, 3);
    const seeTxt = t("see") || "Подробнее";

    grid.innerHTML = related.map(item => {
      const nm = t(item.slug + ".name") || item.model;
      const cat = t(item.slug + ".cat") || t("cat." + item.category);
      const img = item.images && item.images[0] ? item.images[0] : "assets/prod-chair-corda.jpg";
      const cleanUrl = "catalog/" + esc(item.slug);

      return '<article class="product reveal" data-product data-cat="' + esc(item.category) + '">' +
        '<div class="product__media media">' +
        '<button class="fav" data-fav data-prod-id="' + esc(item.slug) + '" aria-label="' + esc(t("a11y.fav")||"В избранное") + '">' + FAV_SVG + '</button>' +
        '<img src="' + esc(img) + '" alt="' + esc(nm) + '" loading="lazy" decoding="async">' +
        '<a class="see" href="' + esc(cleanUrl) + '">' + esc(seeTxt) + '</a>' +
        '<button class="add" data-add data-prod-id="' + esc(item.slug) + '" aria-label="' + esc(t("a11y.add")||"В корзину") + '">' + ADD_SVG + '</button>' +
        '</div>' +
        '<div>' +
        '<div class="product__cat">' + esc(cat) + '</div>' +
        '<div class="product__name" style="margin-top:4px">' + esc(nm) + '</div>' +
        '<div class="price" style="margin-top:8px"><span class="price__now">' + money(item.price) + '</span></div>' +
        '</div>' +
        '</article>';
    }).join("");
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

    renderSwatches();
    updateCTAs(nm);

    // Page meta
    const pageUrl = "https://bententrade.uz/catalog/" + encodeURIComponent(prod.slug);
    document.title = "BTT - " + nm;
    setMetaPair("description", nm + " - " + cat + ". BTT - мебель для дома и сада.");
    setMetaPair("og:title", "BTT - " + nm);
    setMetaPair("og:url", pageUrl);
    setCanonical(pageUrl);
    updateSchema(nm, pageUrl);
  }

  // Gallery interaction
  const stage = $$("[data-stage] img");
  const thumbs = $$("[data-thumb]");
  let activeIdx = 0;

  function showImg(i){
    if(!stage.length) return;
    activeIdx = (i + stage.length) % stage.length;
    stage.forEach((im, k)=> im.classList.toggle("is-on", k === activeIdx));
    thumbs.forEach((th, k)=> th.classList.toggle("is-active", k === activeIdx));
  }

  thumbs.forEach((th, i)=>{
    th.addEventListener("click", ()=> showImg(i));
    th.addEventListener("mouseenter", ()=> showImg(i));
  });

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

    function openLightbox(i){
      const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(prod.slug) : [];
      if(!imgs.length) return;
      activeIdx = (i + imgs.length) % imgs.length;
      if(lbImg) lbImg.src = imgs[activeIdx].full;
      if(lbThumbs){
        lbThumbs.innerHTML = imgs.map((im, k)=>
          '<button type="button" class="pdp-lightbox__thumb' + (k === activeIdx ? ' is-active' : '') + '" data-lb-idx="' + k + '">' +
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
    }

    function closeLightbox(){
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";
    }

    lightbox.querySelectorAll("[data-lightbox-close]").forEach(el => el.addEventListener("click", closeLightbox));
    if(lbPrev) lbPrev.addEventListener("click", ()=> openLightbox(activeIdx - 1));
    if(lbNext) lbNext.addEventListener("click", ()=> openLightbox(activeIdx + 1));

    document.addEventListener("keydown", e=>{
      if(!lightbox.classList.contains("is-open")) return;
      if(e.key === "Escape") closeLightbox();
      else if(e.key === "ArrowLeft") openLightbox(activeIdx - 1);
      else if(e.key === "ArrowRight") openLightbox(activeIdx + 1);
    });

    const zoomTrigger = $("[data-pdp-zoom-trigger]");
    if(zoomTrigger) zoomTrigger.addEventListener("click", ()=> openLightbox(activeIdx));
    const stageBox = $("[data-stage]");
    if(stageBox) stageBox.addEventListener("click", (e)=>{
      if(e.target.closest("[data-pdp-zoom-trigger]")) return;
      openLightbox(activeIdx);
    });
  }

  // Initial load
  setImages();
  render();
  renderRelated();

  document.addEventListener("btt:lang", ()=>{
    render();
    renderRelated();
  });
})();
