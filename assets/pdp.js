/* Bententrade — product detail page interactions + data hydration
   Reads ?id=p1 from the URL and fills the page from BTT_PRODUCTS / BTT_PRODUCT_CAT.
   Name & category come from the shared i18n dictionary; category copy/specs from
   products.js. Re-renders on language change. cart/fav binding is global (cart.js). */
(function(){
  "use strict";

  const PRODUCTS = window.BTT_PRODUCTS || {};
  const CATTEXT  = window.BTT_PRODUCT_CAT || {};
  const DICT     = window.BTT_I18N || {};

  const params = new URLSearchParams(location.search);
  let id = params.get("id") || "p1";
  const prod = PRODUCTS[id] || { cat: "furniture", look: "sofa", now: 0, old: 0, stock: 1 };
  const num  = id.replace(/[^0-9]/g, "") || "1";

  const $  = s => document.querySelector(s);
  const lang = () => { const l = document.documentElement.lang; return DICT[l] ? l : "ru"; };
  const t = key => (DICT[lang()]||DICT.ru||{})[key];
  const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  const U = window.BTT_UTIL || {};
  const money = (n) => (U.formatMoney ? U.formatMoney(n) : (String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0") + "\u00a0сум"));
  const FAV_SVG = U.FAV_SVG || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20Z"/></svg>';
  const ADD_SVG = U.ADD_SVG || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>';
  const MSG = { telegram: "bententradeuz", whatsapp: "998771044422" };
  function syncSettings(){
    try{
      const s = JSON.parse(sessionStorage.getItem("btt_settings")||"{}");
      if(s.telegram) MSG.telegram = String(s.telegram).replace(/^@/,"");
      if(s.whatsapp) MSG.whatsapp = String(s.whatsapp).replace(/[^\d]/g,"");
    }catch(e){}
  }
  syncSettings();
  document.addEventListener("btt:settings", syncSettings);

  function productMsg(nm){
    const finishVal = ((document.querySelector("[data-finish-val]")||{}).textContent||"").trim();
    const sizeVal = ((document.querySelector("[data-size-val]")||{}).textContent||"").trim();
    const optParts = [finishVal, sizeVal].filter(Boolean);
    const optStr = optParts.length ? " (" + optParts.join(", ") + ")" : "";
    const tpl = t("pdp.custom.msg") || "Здравствуйте! Интересует: {name}.";
    return tpl.replace("{name}", (nm || "") + optStr);
  }

  function setMetaPair(name, content){
    if(!content) return;
    document.querySelectorAll('meta[name="'+name+'"], meta[property="'+name+'"]').forEach(el=>{
      el.setAttribute("content", content);
    });
  }

  function updateMessenger(nm){
    const msg = encodeURIComponent(productMsg(nm));
    const tg = document.querySelector("[data-pdp-tg]");
    const wa = document.querySelector("[data-pdp-wa]");
    const rTg = document.querySelector("[data-pdp-reviews-tg]");
    if(tg) tg.href = "https://t.me/" + MSG.telegram + "?text=" + msg;
    if(wa) wa.href = "https://wa.me/" + MSG.whatsapp + "?text=" + msg;
    const revMsg = nm ? ("Здравствуйте! Хочу оставить отзыв о товаре " + nm + ".") : "Здравствуйте! Хочу оставить отзыв о покупке.";
    if(rTg) rTg.href = "https://t.me/" + MSG.telegram + "?text=" + encodeURIComponent(revMsg);
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

  function updateProductSchema(nm){
    const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(id) : null;
    const image = imgs && imgs[0] ? absUrl(imgs[0].full) : absUrl("assets/btt-logo.png");
    const uzs = U.toUzs ? U.toUzs(prod.now) : Math.round(prod.now * 12500);
    const pageUrl = "https://bententrade.uz/product.html?id=" + encodeURIComponent(id);
    const inStock = !(window.BTT_IS_MTO && window.BTT_IS_MTO(id)) && prod.stock !== 0;
    injectJsonLd("pdp-schema-product", {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": nm,
      "image": image,
      "description": (t("meta.product.desc") || "{name}").replace("{name}", nm || ""),
      "sku": id.toUpperCase(),
      "brand": { "@type": "Brand", "name": "Bententrade" },
      "offers": {
        "@type": "Offer",
        "url": pageUrl,
        "priceCurrency": "UZS",
        "price": uzs,
        "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
        "seller": { "@type": "Organization", "name": "Bententrade" }
      }
    });
    injectJsonLd("pdp-schema-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": t("pdp.crumb.home") || "Главная", "item": "https://bententrade.uz/" },
        { "@type": "ListItem", "position": 2, "name": t("meta.catalog.title") || "Каталог", "item": "https://bententrade.uz/catalog.html" },
        { "@type": "ListItem", "position": 3, "name": nm, "item": pageUrl }
      ]
    });
  }

  function updatePageMeta(nm){
    const title = (t("meta.product.title") || "Bententrade — {name}").replace("{name}", nm || "");
    const desc = (t("meta.product.desc") || "{name}").replace("{name}", nm || "");
    const pageUrl = "https://bententrade.uz/product.html?id=" + encodeURIComponent(id);
    const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(id) : null;
    const image = imgs && imgs[0] ? absUrl(imgs[0].full) : absUrl("assets/btt-logo.png");
    document.title = title;
    setMetaPair("description", desc);
    setMetaPair("og:title", title);
    setMetaPair("og:description", desc);
    setMetaPair("og:url", pageUrl);
    setMetaPair("og:image", image);
    setMetaPair("twitter:title", title);
    setMetaPair("twitter:description", desc);
    setMetaPair("twitter:image", image);
    const catLabel = t(id + ".cat") || (prod && (prod.category_label || prod.cat)) || (DICT.ru && DICT.ru[id + ".cat"]) || t("p"+num+".cat") || "";
    const kw = (t("meta.product.keywords") || "{name}, rotang tashkent")
      .replace(/\{name\}/g, nm || "")
      .replace(/\{cat\}/g, catLabel);
    setMetaPair("keywords", kw);
    setCanonical(pageUrl);
    updateProductSchema(nm);
  }

  function setImages(){
    const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(id) : null;
    if(!imgs) return;
    const thumbs = document.querySelectorAll("[data-thumb]");
    const stage  = document.querySelectorAll("[data-stage] img");
    imgs.forEach((im,i)=>{
      const thumbBtn = thumbs[i];
      const thumbImg = thumbBtn && thumbBtn.querySelector("img");
      if(thumbImg) thumbImg.src = im.thumb;
      if(stage[i]) stage[i].src = im.full;
      if(thumbBtn){
        const label = (t("pdp.thumb") || "Фото {n}").replace("{n}", String(i + 1));
        thumbBtn.setAttribute("aria-label", label);
      }
    });
    thumbs.forEach((btn,i)=>{
      const on = !!imgs[i];
      btn.style.display = on ? "" : "none";
      if(!on) btn.classList.remove("is-active");
    });
    stage.forEach((im,i)=>{
      if(!imgs[i]){ im.style.display = "none"; im.classList.remove("is-on"); }
      else im.style.display = "";
    });
    const first = stage[0];
    if(first && !document.querySelector("[data-stage] img.is-on")){
      first.classList.add("is-on");
      if(thumbs[0]) thumbs[0].classList.add("is-active");
    }
  }

  function detach(sel){ const el=$(sel); if(el) el.removeAttribute("data-i18n"); return el; }

  const node = {
    crumb: detach(".crumb .cur"),
    cat:   detach(".pdp-info .product__cat"),
    name:  detach(".pdp-info h1"),
    desc:  detach(".pdp-desc"),
  };
  detach(".pdp-price .save");
  const specVals = document.querySelectorAll(".pdp-detail .spec-row .v");
  specVals.forEach(v=>v.removeAttribute("data-i18n"));
  const sizeRow = $(".size-row");

  function relatedIds(){
    const same = Object.keys(PRODUCTS).filter(pid => pid !== id && PRODUCTS[pid].cat === prod.cat);
    const rest = Object.keys(PRODUCTS).filter(pid => pid !== id && !same.includes(pid));
    return same.concat(rest).slice(0, 3);
  }

  function renderRelated(){
    const grid = document.querySelector("[data-related-grid]");
    if(!grid) return;
    const see = t("see") || "Подробнее";
    grid.innerHTML = relatedIds().map(pid=>{
      const p = PRODUCTS[pid];
      const pn = t(pid + ".name");
      const pc = t(pid + ".cat");
      const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(pid) : null;
      const img = imgs && imgs[0] ? imgs[0].thumb : "";
      const sale = p.old ? '<span class="badge-sale">-' + Math.round((1 - p.now / p.old) * 100) + '%</span>' : "";
      const old = p.old ? '<span class="price__old">' + money(p.old) + '</span>' : "";
      return '<article class="product reveal" data-product data-cat="' + esc(p.cat) + '">' +
        '<div class="product__media media">' + sale +
        '<button class="fav" data-fav data-i18n-aria="a11y.fav" aria-label="' + esc(t("a11y.fav")||"") + '">' + FAV_SVG + '</button>' +
        '<img src="' + esc(img) + '" alt="' + esc(pn||"") + '" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">' +
        '<a class="see" href="product.html?id=' + esc(pid) + '">' + esc(see) + '</a>' +
        '<button class="add" data-add data-i18n-aria="a11y.add" aria-label="' + esc(t("a11y.add")||"") + '">' + ADD_SVG + '</button>' +
        '</div><div><div class="product__cat">' + esc(pc) + '</div>' +
        '<div class="product__name" style="margin-top:4px">' + esc(pn) + '</div>' +
        '<div class="product-swatches" aria-label="Цвета плетения">' +
        '<span class="product-swatch is-active" style="--swatch-color:#5C4033" title="Шоколад"></span>' +
        '<span class="product-swatch" style="--swatch-color:#C2B280" title="Песочный"></span>' +
        '<span class="product-swatch" style="--swatch-color:#2F353B" title="Графит"></span>' +
        '</div>' +
        '<div class="price" style="margin-top:8px"><span class="price__now">' + money(p.now) + '</span>' + old + '</div></div></article>';
    }).join("");
    document.dispatchEvent(new CustomEvent("btt:related-rendered", { detail:{ grid } }));
  }

  function render(){
    const c = (CATTEXT[prod.cat]||CATTEXT.furniture);
    const ct = c[lang()] || c.ru;
    const nm = t(id + ".name") || (prod && (prod.name || prod.title)) || (DICT.ru && DICT.ru[id + ".name"]) || t("p"+num+".name");
    const cat = t(id + ".cat") || (prod && (prod.category_label || prod.cat)) || (DICT.ru && DICT.ru[id + ".cat"]) || t("p"+num+".cat");

    if(node.name) node.name.textContent = nm || node.name.textContent;
    if(node.crumb) node.crumb.textContent = nm || node.crumb.textContent;
    if(node.cat) node.cat.textContent = cat || "";
    if(node.desc) node.desc.textContent = ct.desc;
    updatePageMeta(nm || "");
    updateMessenger(nm || "");

    document.querySelectorAll("[data-crumb-cat]").forEach(a=>{
      a.href = "catalog.html?cat=" + prod.cat;
    });

    const now = $(".pdp-price .now"), old = $(".pdp-price .old"), save = $(".pdp-price .save");
    const fmt = window.BTT_UTIL && window.BTT_UTIL.formatMoney;
    const fmtN = (n) => fmt ? fmt(n) : String(n);
    if(now) now.textContent = fmtN(prod.now);
    if(old) old.style.display = prod.old ? "" : "none";
    if(old && prod.old) old.textContent = fmtN(prod.old);
    if(save){
      if(prod.old){
        save.style.display = "";
        const word = t("pdp.save");
        save.textContent = word + "\u00a0" + fmtN(prod.old - prod.now);
      } else save.style.display = "none";
    }
    const badge = $(".pdp-stage .badge-sale");
    if(badge){
      if(prod.old){ badge.style.display=""; badge.textContent = "-"+Math.round((1-prod.now/prod.old)*100)+"%"; }
      else badge.style.display = "none";
    }

    const isMto = window.BTT_IS_MTO ? window.BTT_IS_MTO("p"+num) : prod.stock === 0;
    const addBtn = document.querySelector(".pdp-actions [data-add], .pdp-buy [data-add]");
    const qkBtn = document.querySelector("[data-pdp-quick-buy]");
    const mtoBtn = document.querySelector("[data-pdp-mto]");
    if(isMto){
      if(addBtn) addBtn.style.display = "none";
      if(qkBtn) qkBtn.style.display = "none";
      if(mtoBtn) mtoBtn.hidden = false;
      let mtoBadge = $(".pdp-stage .badge-mto");
      if(!mtoBadge){
        mtoBadge = document.createElement("span");
        mtoBadge.className = "badge-mto";
        const stage = $(".pdp-stage");
        if(stage) stage.appendChild(mtoBadge);
      }
      if(mtoBadge){
        mtoBadge.style.display = "";
        mtoBadge.setAttribute("data-i18n", "mto.badge");
        mtoBadge.textContent = t("mto.badge");
      }
    } else {
      if(addBtn) addBtn.style.display = "";
      if(qkBtn) qkBtn.style.display = "";
      if(mtoBtn) mtoBtn.hidden = true;
      const mtoBadge = $(".pdp-stage .badge-mto");
      if(mtoBadge) mtoBadge.style.display = "none";
    }

    const sp = (prod && prod.specs && typeof prod.specs === "object") ? prod.specs : {};
    const vals = [
      sp.mat || ct.mat,
      sp.dim || ct.dim,
      sp.fin || ct.fin,
      sp.wt || ct.wt,
      sp.seat || ct.seat,
      sp.made || ct.made
    ];
    specVals.forEach((el,i)=>{ if(vals[i]!=null) el.textContent = vals[i]; });

    if(sizeRow){
      const sz = c.sizes || [];
      const sizes = Array.isArray(sz) ? sz : (sz[lang()] || sz.ru || []);
      const btns = sizeRow.querySelectorAll("button");
      btns.forEach((b,i)=>{
        if(sizes[i]!=null){ b.textContent = sizes[i]; b.style.display=""; }
        else b.style.display = "none";
        b.classList.toggle("is-active", i === (c.defSize||0));
      });
    }

    /* sync sticky purchase bar */
    const stickyImg = document.querySelector("[data-sticky-img]");
    const stickyTitle = document.querySelector("[data-sticky-title]");
    const stickyPrice = document.querySelector("[data-sticky-price]");
    const stickyOld = document.querySelector("[data-sticky-old]");
    const stickyAdd = document.querySelector("[data-sticky-add]");
    const stickyMto = document.querySelector("[data-sticky-mto]");

    const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(id) : null;
    if(stickyImg && imgs && imgs[0]) stickyImg.src = imgs[0].thumb;
    if(stickyTitle) stickyTitle.textContent = nm || "";
    if(stickyPrice) stickyPrice.textContent = fmtN(prod.now);
    if(stickyOld){
      if(prod.old){ stickyOld.style.display = ""; stickyOld.textContent = fmtN(prod.old); }
      else stickyOld.style.display = "none";
    }
    if(isMto){
      if(stickyAdd) stickyAdd.style.display = "none";
      if(stickyMto) stickyMto.hidden = false;
    } else {
      if(stickyAdd) stickyAdd.style.display = "";
      if(stickyMto) stickyMto.hidden = true;
    }
    updateActiveOptions();
  }

  function updateActiveOptions(){
    const finishBtn = document.querySelector('[data-select="finish"] button.is-active') || document.querySelector(".pdp-swatches button.is-active");
    const sizeBtn = document.querySelector('[data-select="size"] button.is-active') || document.querySelector(".size-row button.is-active");
    let finishName = "";
    if(finishBtn){
      const key = finishBtn.dataset.finishKey;
      finishName = (key && t(key)) || finishBtn.dataset.colorFallback || finishBtn.getAttribute("aria-label") || "";
      const labVal = document.querySelector("[data-finish-val]");
      if(labVal) labVal.textContent = finishName;
    }
    let sizeName = "";
    if(sizeBtn){
      sizeName = sizeBtn.textContent.trim();
      const labVal = document.querySelector("[data-size-val]");
      if(labVal) labVal.textContent = sizeName;
    }
    const optEl = document.querySelector("[data-sticky-opt]");
    if(optEl){
      const parts = [finishName, sizeName].filter(Boolean);
      optEl.textContent = parts.join(" · ");
      optEl.style.display = parts.length ? "" : "none";
    }
    const curName = (node.name ? node.name.textContent : "") || "";
    updateMessenger(curName);
  }

  setImages();
  render();
  renderRelated();

  const mtoLink = document.querySelector("[data-pdp-mto]");
  if(mtoLink && !mtoLink.dataset.mtoWired){
    mtoLink.dataset.mtoWired = "1";
    mtoLink.addEventListener("click", e=>{
      e.preventDefault();
      const nm = (document.querySelector(".pdp-info h1")||{}).textContent || "";
      const finishVal = ((document.querySelector("[data-finish-val]")||{}).textContent||"").trim();
      const sizeVal = ((document.querySelector("[data-size-val]")||{}).textContent||"").trim();
      const optParts = [finishVal, sizeVal].filter(Boolean);
      const optStr = optParts.length ? " (" + optParts.join(", ") + ")" : "";
      const tpl = t("mto.msg") || "Здравствуйте! Хочу заказать: {name}";
      const msg = tpl.replace("{name}", nm.trim() + optStr);
      const mgr = window.BTT_UTIL && window.BTT_UTIL.managerUrl;
      const url = mgr ? mgr(msg).telegram : "https://t.me/bententradeuz";
      window.open(url, "_blank", "noopener");
    });
  }

  new MutationObserver(()=>{
    render();
    renderRelated();
  }).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});

  /* ---- gallery ---- */
  const stage = Array.from(document.querySelectorAll("[data-stage] img"));
  const thumbs = Array.from(document.querySelectorAll("[data-thumb]"));
  let activeIdx = Math.max(0, stage.findIndex(im=>im.classList.contains("is-on")));

  function showImg(i){
    if(!stage.length) return;
    const targetIdx = (i + stage.length) % stage.length;
    if(stage[targetIdx].style.display === "none" || targetIdx === activeIdx) return;
    activeIdx = targetIdx;
    const update = () => {
      stage.forEach((im,k)=>im.classList.toggle("is-on", k===activeIdx));
      thumbs.forEach((t,k)=>t.classList.toggle("is-active", k===activeIdx));
      if(thumbs[activeIdx] && thumbs[activeIdx].scrollIntoView){
        try{ thumbs[activeIdx].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); }catch(_){}
      }
    };
    if(document.startViewTransition && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)){
      document.startViewTransition(update);
    } else {
      update();
    }
  }
  thumbs.forEach((t,i)=>{
    t.addEventListener("mouseenter",()=>showImg(i));
    t.addEventListener("click",()=>showImg(i));
  });

  const stageEl = $("[data-stage]");
  let didDrag = false;
  if(stageEl){
    let sx = null;
    stageEl.addEventListener("touchstart", e=>{ sx = e.touches[0].clientX; didDrag = false; }, { passive:true });
    stageEl.addEventListener("touchmove", ()=>{ didDrag = true; }, { passive:true });
    stageEl.addEventListener("touchend", e=>{
      if(sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if(Math.abs(dx) > 42){
        const visible = stage.map((im,i)=> im.style.display !== "none" ? i : -1).filter(i=>i>=0);
        const pos = visible.indexOf(activeIdx);
        if(pos >= 0){
          const next = dx < 0 ? visible[(pos + 1) % visible.length] : visible[(pos - 1 + visible.length) % visible.length];
          showImg(next);
        }
      }
      sx = null;
    }, { passive:true });
  }

  /* ---- option selectors (finish & size) ---- */
  document.querySelectorAll("[data-select]").forEach(group=>{
    group.querySelectorAll("button").forEach(btn=>{
      btn.addEventListener("click",()=>{
        group.querySelectorAll("button").forEach(b=>b.classList.remove("is-active"));
        btn.classList.add("is-active");
        if(navigator.vibrate) try{ navigator.vibrate(12); }catch(_){}
        updateActiveOptions();
      });
    });
  });

  /* ---- quantity controls ---- */
  document.querySelectorAll("[data-qty]").forEach(q=>{
    const input = q.querySelector("input");
    const clamp = v => Math.max(1, Math.min(99, v||1));
    q.querySelector("[data-qd]").addEventListener("click",()=>{ input.value = clamp(parseInt(input.value,10)-1); });
    q.querySelector("[data-qu]").addEventListener("click",()=>{ input.value = clamp(parseInt(input.value,10)+1); });
    input.addEventListener("input",()=>{ input.value = input.value.replace(/\D/g, ""); });
    input.addEventListener("blur",()=>{ input.value = clamp(parseInt(input.value,10)); });
    input.addEventListener("change",()=>{ input.value = clamp(parseInt(input.value,10)); });
  });

  /* ---- mobile sticky purchase bar observer ---- */
  const buyBox = document.querySelector(".pdp-buy");
  const stickyBar = document.querySelector("[data-pdp-sticky]");
  if(buyBox && stickyBar && "IntersectionObserver" in window){
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        const shouldShow = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        stickyBar.classList.toggle("is-visible", shouldShow);
        stickyBar.setAttribute("aria-hidden", String(!shouldShow));
      });
    }, { threshold: 0.1 });
    obs.observe(buyBox);
  }

  const stickyAdd = document.querySelector("[data-sticky-add]");
  if(stickyAdd){
    stickyAdd.addEventListener("click", e=>{
      e.preventDefault();
      const mainAdd = document.querySelector(".pdp-buy [data-add]");
      if(mainAdd) mainAdd.click();
    });
  }

  const stickyMto = document.querySelector("[data-sticky-mto]");
  if(stickyMto){
    stickyMto.addEventListener("click", e=>{
      e.preventDefault();
      const mainMto = document.querySelector("[data-pdp-mto]");
      if(mainMto) mainMto.click();
    });
  }

  /* ---- fullscreen photo lightbox ---- */
  const lightbox = document.querySelector("[data-pdp-lightbox]");
  if(lightbox){
    const lbImg = lightbox.querySelector("[data-lightbox-img]");
    const lbThumbs = lightbox.querySelector("[data-lightbox-thumbs]");
    const lbPrev = lightbox.querySelector("[data-lightbox-prev]");
    const lbNext = lightbox.querySelector("[data-lightbox-next]");

    function renderLightboxThumbs(){
      const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(id) : null;
      if(!imgs || !lbThumbs) return;
      lbThumbs.innerHTML = imgs.map((im, i)=>
        '<button type="button" class="pdp-lightbox__thumb' + (i === activeIdx ? ' is-active' : '') + '" data-lb-idx="' + i + '" aria-label="Фото ' + (i + 1) + '">' +
        '<img src="' + esc(im.thumb) + '" alt="">' +
        '</button>'
      ).join("");
      lbThumbs.querySelectorAll("[data-lb-idx]").forEach(btn=>{
        btn.addEventListener("click", ()=>{
          const idx = parseInt(btn.dataset.lbIdx, 10);
          setLightboxImg(idx);
        });
      });
    }

    function setLightboxImg(idx){
      const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(id) : null;
      if(!imgs || !imgs.length) return;
      activeIdx = (idx + imgs.length) % imgs.length;
      showImg(activeIdx);
      if(lbImg) lbImg.src = imgs[activeIdx].full;
      if(lbThumbs){
        lbThumbs.querySelectorAll(".pdp-lightbox__thumb").forEach((b, k)=>{
          b.classList.toggle("is-active", k === activeIdx);
        });
      }
    }

    function openLightbox(idx){
      setLightboxImg(idx != null ? idx : activeIdx);
      renderLightboxThumbs();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
    }

    function closeLightbox(){
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";
    }

    lightbox.querySelectorAll("[data-lightbox-close]").forEach(el=>{
      el.addEventListener("click", closeLightbox);
    });
    if(lbPrev) lbPrev.addEventListener("click", ()=> setLightboxImg(activeIdx - 1));
    if(lbNext) lbNext.addEventListener("click", ()=> setLightboxImg(activeIdx + 1));

    document.addEventListener("keydown", e=>{
      if(!lightbox.classList.contains("is-open")) return;
      if(e.key === "Escape") closeLightbox();
      else if(e.key === "ArrowLeft") setLightboxImg(activeIdx - 1);
      else if(e.key === "ArrowRight") setLightboxImg(activeIdx + 1);
    });

    const zoomBtn = document.querySelector("[data-pdp-zoom-trigger]");
    if(zoomBtn){
      zoomBtn.addEventListener("click", e=>{
        e.stopPropagation();
        openLightbox(activeIdx);
      });
    }
    if(stageEl){
      stageEl.addEventListener("click", e=>{
        if(didDrag) return;
        if(e.target.closest("[data-pdp-zoom-trigger], .badge-sale, .badge-mto")) return;
        openLightbox(activeIdx);
      });
    }
  }

  /* ---- PDP dynamic delivery estimate & city selector ---- */
  const delBadge = document.querySelector("[data-pdp-delivery-badge]");
  if(delBadge){
    const cityPickerBtn = delBadge.querySelector("[data-pdp-city-picker]");
    const cityPopover = delBadge.querySelector("[data-pdp-city-popover]");
    const cityLabel = delBadge.querySelector("[data-pdp-city-label]");
    const estTime = delBadge.querySelector("[data-pdp-est-time]");
    const estSub = delBadge.querySelector("[data-pdp-est-sub]");

    function updatePdpDelivery(cityKey){
      const cities = window.BTT_DELIVERY_CITIES;
      if(!cities) return;
      const data = cities[cityKey] || cities.tashkent;
      if(!data) return;
      const l = lang();
      const d = DICT[l] || DICT.ru || {};

      if(cityLabel) cityLabel.textContent = d[data.key] || cityKey;
      if(estTime) estTime.textContent = (data.shortTime && data.shortTime[l]) || (data.time && data.time[l]) || "3–5 дней";
      if(estSub){
        estSub.textContent = l === "uz"
          ? "Xizmat tarifi bo‘yicha · Menejer hamrohligida"
          : (l === "en" ? "Carrier rate · Personal manager escort" : "По тарифу сервиса · Менеджер приедет с товаром");
      }
      if(cityPopover){
        cityPopover.querySelectorAll("[data-city]").forEach(btn=>{
          btn.classList.toggle("is-active", btn.dataset.city === cityKey);
        });
      }
    }

    let activeCity = localStorage.getItem("btt_city") || "tashkent";
    updatePdpDelivery(activeCity);

    if(cityPickerBtn && cityPopover){
      cityPickerBtn.addEventListener("click", e=>{
        e.stopPropagation();
        const isOpen = cityPopover.classList.toggle("is-open");
        cityPickerBtn.classList.toggle("is-open", isOpen);
        cityPickerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });

      cityPopover.querySelectorAll("[data-city]").forEach(btn=>{
        btn.addEventListener("click", e=>{
          e.stopPropagation();
          const c = btn.dataset.city;
          activeCity = c;
          try{ localStorage.setItem("btt_city", c); }catch(ex){}
          if(window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);
          updatePdpDelivery(c);
          cityPopover.classList.remove("is-open");
          cityPickerBtn.classList.remove("is-open");
          cityPickerBtn.setAttribute("aria-expanded", "false");
          document.dispatchEvent(new CustomEvent("btt:city-change", { detail: { city: c } }));
        });
      });

      document.addEventListener("click", e=>{
        if(!delBadge.contains(e.target)){
          cityPopover.classList.remove("is-open");
          cityPickerBtn.classList.remove("is-open");
          cityPickerBtn.setAttribute("aria-expanded", "false");
        }
      });
    }

    document.addEventListener("btt:lang", ()=> updatePdpDelivery(activeCity));
    document.addEventListener("btt:city-change", e=>{
      if(e.detail && e.detail.city){
        activeCity = e.detail.city;
        updatePdpDelivery(activeCity);
      }
    });
  }

  /* ---- PDP verified reviews drawer ---- */
  const reviewsDrawer = document.querySelector("[data-reviews-drawer]");
  const reviewsScrim = document.querySelector("[data-reviews-scrim]");
  const reviewsOpenBtn = document.querySelector("[data-pdp-reviews-open]");

  if(reviewsDrawer && reviewsScrim){
    let lastReviewsFocus = null;

    function openReviews(){
      lastReviewsFocus = document.activeElement;
      reviewsDrawer.classList.add("is-open");
      reviewsDrawer.setAttribute("aria-hidden", "false");
      reviewsScrim.classList.add("is-open");
      document.documentElement.style.overflow = "hidden";
      if(window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);
      setTimeout(()=>{
        const closeBtn = reviewsDrawer.querySelector("[data-reviews-close]");
        if(closeBtn) closeBtn.focus();
      }, 50);
    }

    function closeReviews(){
      reviewsDrawer.classList.remove("is-open");
      reviewsDrawer.setAttribute("aria-hidden", "true");
      reviewsScrim.classList.remove("is-open");
      document.documentElement.style.overflow = "";
      if(lastReviewsFocus && typeof lastReviewsFocus.focus === "function"){
        try{ lastReviewsFocus.focus(); }catch(_){}
        lastReviewsFocus = null;
      }
    }

    if(reviewsOpenBtn){
      reviewsOpenBtn.addEventListener("click", openReviews);
      reviewsOpenBtn.addEventListener("keydown", e=>{
        if(e.key === "Enter" || e.key === " ") { e.preventDefault(); openReviews(); }
      });
    }

    document.querySelectorAll("[data-reviews-close]").forEach(el=>{
      el.addEventListener("click", closeReviews);
    });

    document.addEventListener("keydown", e=>{
      if(!reviewsDrawer.classList.contains("is-open")) return;
      if(e.key === "Escape") closeReviews();
    });

    // Review filters
    const filterBtns = reviewsDrawer.querySelectorAll("[data-review-filter]");
    const reviewItems = reviewsDrawer.querySelectorAll(".review-item");

    filterBtns.forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const filter = btn.dataset.reviewFilter;
        filterBtns.forEach(b=> b.classList.toggle("is-active", b === btn));

        reviewItems.forEach(item=>{
          let show = true;
          if(filter === "photo") show = item.dataset.hasPhoto === "true";
          else if(filter === "five") show = item.dataset.stars === "5";
          else if(filter === "assembly") show = item.dataset.tag === "assembly";

          item.style.display = show ? "" : "none";
          if(show){
            item.style.animation = "fadeSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
          }
        });

        if(window.navigator && window.navigator.vibrate) window.navigator.vibrate(8);
      });
    });

    // Review photo lightbox click
    reviewsDrawer.querySelectorAll("[data-review-photo]").forEach(thumb=>{
      thumb.addEventListener("click", ()=>{
        const photoSrc = thumb.dataset.reviewPhoto;
        const lightbox = document.querySelector("[data-pdp-lightbox]");
        if(photoSrc && lightbox){
          const lbImg = lightbox.querySelector("[data-lightbox-img]");
          if(lbImg) lbImg.src = photoSrc;
          lightbox.classList.add("is-open");
          lightbox.setAttribute("aria-hidden", "false");
        }
      });
    });

    // Dynamic reviews integration
    const reviewFormPane = reviewsDrawer.querySelector("[data-review-form-pane]");
    const reviewToggleBtn = reviewsDrawer.querySelector("[data-pdp-review-toggle]");
    const reviewCancelBtn = reviewsDrawer.querySelector("[data-review-cancel]");
    const reviewForm = reviewsDrawer.querySelector("[data-review-submit-form]");
    const starPicker = reviewsDrawer.querySelector("[data-star-picker]");
    const starInput = reviewsDrawer.querySelector("[data-star-input]");
    const reviewsList = reviewsDrawer.querySelector(".reviews-list");
    const countBadge = reviewsDrawer.querySelector(".reviews-count-badge");

    if (reviewToggleBtn && reviewFormPane) {
      reviewToggleBtn.addEventListener("click", () => {
        const isOpen = reviewFormPane.classList.toggle("is-open");
        reviewToggleBtn.textContent = isOpen ? "Скрыть форму" : "Написать отзыв";
        if (isOpen) {
          const authorInput = reviewFormPane.querySelector('input[name="author_name"]');
          if (authorInput) authorInput.focus();
        }
      });
    }

    if (reviewCancelBtn && reviewFormPane) {
      reviewCancelBtn.addEventListener("click", () => {
        reviewFormPane.classList.remove("is-open");
        if (reviewToggleBtn) reviewToggleBtn.textContent = "Написать отзыв";
      });
    }

    function setRating(val) {
      if (!starInput || !starPicker) return;
      starInput.value = String(val);
      const starBtns = starPicker.querySelectorAll(".star-picker-btn");
      starBtns.forEach(b => {
        const v = Number(b.dataset.starVal);
        b.classList.toggle("is-active", v <= val);
      });
    }

    // Star picker
    if (starPicker && starInput) {
      const starBtns = starPicker.querySelectorAll(".star-picker-btn");
      starBtns.forEach(b => {
        b.addEventListener("click", () => setRating(Number(b.dataset.starVal)));
        b.addEventListener("mouseenter", () => {
          const v = Number(b.dataset.starVal);
          starBtns.forEach(sb => sb.classList.toggle("is-hover", Number(sb.dataset.starVal) <= v));
        });
      });
      starPicker.addEventListener("mouseleave", () => {
        starBtns.forEach(sb => sb.classList.remove("is-hover"));
      });
    }

    // Prefill name if logged in
    if (window.BTT_API && window.BTT_API.me) {
      window.BTT_API.me().then(res => {
        if (res && res.user && reviewForm) {
          const nameInp = reviewForm.querySelector('input[name="author_name"]');
          if (nameInp && !nameInp.value && res.user.name) nameInp.value = res.user.name;
        }
      }).catch(() => {});
    }

    function renderReviewItem(r) {
      const starIcons = Array.from({ length: r.rating || 5 })
        .map(() => '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.3 6.9.9-5 4.8 1.2 6.8L12 17.8 5.9 20.8 7.1 14l-5-4.8 6.9-.9Z"/></svg>')
        .join("");
      const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "Сегодня";
      const verified = r.is_verified
        ? '<span class="review-item__verified" title="Проверенная покупка"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg><span>Проверенная покупка</span></span>'
        : '';

      return '<article class="review-item" data-has-photo="false" data-stars="' + (r.rating || 5) + '">' +
        '<div class="review-item__head">' +
          '<div>' +
            '<div class="review-item__author"><span>' + esc(r.author_name || "Покупатель") + '</span>' + verified + '</div>' +
            '<div class="review-item__date">' + esc((r.city ? r.city + " · " : "") + dateStr) + '</div>' +
          '</div>' +
          '<div class="review-item__stars" aria-label="' + (r.rating || 5) + ' звёзд">' + starIcons + '</div>' +
        '</div>' +
        '<p class="review-item__text">' + esc(r.text || "") + '</p>' +
      '</article>';
    }

    // Load reviews from API
    let loadedApiReviews = false;
    async function loadReviews() {
      if (loadedApiReviews || !window.BTT_API || !window.BTT_API.reviews) return;
      try {
        const res = await window.BTT_API.reviews(id);
        if (res && res.reviews && res.reviews.length > 0 && reviewsList) {
          reviewsList.innerHTML = res.reviews.map(renderReviewItem).join("");
          if (countBadge) countBadge.textContent = String(res.reviews.length);
          loadedApiReviews = true;
        }
      } catch (_) {}
    }

    const prevOpen = openReviews;
    openReviews = function() {
      prevOpen();
      loadReviews();
    };
    if (reviewsOpenBtn) {
      reviewsOpenBtn.onclick = openReviews;
    }

    // Review submit
    if (reviewForm) {
      reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = reviewForm.querySelector("[data-review-submit]");
        const author = (reviewForm.querySelector('input[name="author_name"]')?.value || "").trim();
        const city = (reviewForm.querySelector('input[name="city"]')?.value || "").trim();
        const text = (reviewForm.querySelector('textarea[name="text"]')?.value || "").trim();
        const rating = Number(starInput ? starInput.value : 5) || 5;

        if (!author || !text || text.length < 5) {
          alert("Пожалуйста, укажите имя и напишите отзыв (не менее 5 символов).");
          return;
        }

        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Отправка…"; }
        try {
          if (window.BTT_API && window.BTT_API.createReview) {
            const res = await window.BTT_API.createReview({
              product_id: id,
              author_name: author,
              city,
              rating,
              text,
            });
            if (res && res.ok && res.review) {
              if (reviewsList) {
                reviewsList.insertAdjacentHTML("afterbegin", renderReviewItem(res.review));
              }
              const curN = Number(countBadge?.textContent || 4);
              if (countBadge) countBadge.textContent = String(curN + 1);
            }
          }
          reviewForm.reset();
          setRating(5);
          if (reviewFormPane) reviewFormPane.classList.remove("is-open");
          if (reviewToggleBtn) reviewToggleBtn.textContent = "Написать отзыв";
          if (window.BTT_CART && window.BTT_CART.toast) {
            window.BTT_CART.toast("Спасибо! Ваш отзыв опубликован ✓");
          } else {
            alert("Спасибо! Ваш отзыв опубликован ✓");
          }
        } catch (err) {
          alert("Не удалось отправить отзыв. Пожалуйста, попробуйте позже.");
        } finally {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Опубликовать"; }
        }
      });
    }
  }
})();

