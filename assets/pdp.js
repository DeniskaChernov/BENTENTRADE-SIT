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
  let id = params.get("id");
  if(!PRODUCTS[id]) id = "p1";
  const prod = PRODUCTS[id];
  const num  = id.replace("p","");

  const $  = s => document.querySelector(s);
  const lang = () => { const l = document.documentElement.lang; return DICT[l] ? l : "ru"; };
  const t = key => (DICT[lang()]||DICT.ru||{})[key];
  const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  const U = window.BTT_UTIL || {};
  const FAV_SVG = U.FAV_SVG || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20Z"/></svg>';
  const ADD_SVG = U.ADD_SVG || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>';
  const MSG = { telegram: "bententradeuz", whatsapp: "998771044422" };

  function productMsg(nm){
    const tpl = t("pdp.custom.msg") || "Здравствуйте! Интересует: {name}.";
    return tpl.replace("{name}", nm || "");
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
    if(tg) tg.href = "https://t.me/" + MSG.telegram + "?text=" + msg;
    if(wa) wa.href = "https://wa.me/" + MSG.whatsapp + "?text=" + msg;
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
    const catLabel = t(id + ".cat") || "";
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
    return same.concat(rest).slice(0, 4);
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
        '<div class="price" style="margin-top:8px"><span class="price__now">' + money(p.now) + '</span>' + old + '</div></div></article>';
    }).join("");
    document.dispatchEvent(new CustomEvent("btt:related-rendered", { detail:{ grid } }));
  }

  function render(){
    const c = (CATTEXT[prod.cat]||CATTEXT.furniture);
    const ct = c[lang()] || c.ru;
    const nm = t("p"+num+".name");
    const cat = t("p"+num+".cat");

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
        const word = {ru:"Экономия",uz:"Tejash",en:"Save"}[lang()] || "Экономия";
        save.textContent = word + " " + fmtN(prod.old - prod.now);
      } else save.style.display = "none";
    }
    const badge = $(".pdp-stage .badge-sale");
    if(badge){
      if(prod.old){ badge.style.display=""; badge.textContent = "-"+Math.round((1-prod.now/prod.old)*100)+"%"; }
      else badge.style.display = "none";
    }

    const isMto = window.BTT_IS_MTO ? window.BTT_IS_MTO("p"+num) : prod.stock === 0;
    const addBtn = document.querySelector(".pdp-actions [data-add], .pdp-buy [data-add]");
    const mtoBtn = document.querySelector("[data-pdp-mto]");
    if(isMto){
      if(addBtn) addBtn.style.display = "none";
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
      if(mtoBtn) mtoBtn.hidden = true;
      const mtoBadge = $(".pdp-stage .badge-mto");
      if(mtoBadge) mtoBadge.style.display = "none";
    }

    const vals = [ct.mat, ct.dim, ct.fin, ct.wt, ct.seat, ct.made];
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
      const tpl = t("mto.msg");
      const msg = tpl.replace("{name}", nm.trim());
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
    activeIdx = (i + stage.length) % stage.length;
    if(stage[activeIdx].style.display === "none") return;
    stage.forEach((im,k)=>im.classList.toggle("is-on", k===activeIdx));
    thumbs.forEach((t,k)=>t.classList.toggle("is-active", k===activeIdx));
  }
  thumbs.forEach((t,i)=>{
    t.addEventListener("mouseenter",()=>showImg(i));
    t.addEventListener("click",()=>showImg(i));
  });

  const stageEl = $("[data-stage]");
  if(stageEl){
    let sx = null;
    stageEl.addEventListener("touchstart", e=>{ sx = e.touches[0].clientX; }, { passive:true });
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

  document.querySelectorAll("[data-select]").forEach(group=>{
    group.querySelectorAll("button").forEach(btn=>{
      btn.addEventListener("click",()=>{
        group.querySelectorAll("button").forEach(b=>b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
    });
  });

  document.querySelectorAll("[data-qty]").forEach(q=>{
    const input = q.querySelector("input");
    const clamp = v => Math.max(1, Math.min(99, v||1));
    q.querySelector("[data-qd]").addEventListener("click",()=>{ input.value = clamp(parseInt(input.value,10)-1); });
    q.querySelector("[data-qu]").addEventListener("click",()=>{ input.value = clamp(parseInt(input.value,10)+1); });
    input.addEventListener("change",()=>{ input.value = clamp(parseInt(input.value,10)); });
  });
})();
