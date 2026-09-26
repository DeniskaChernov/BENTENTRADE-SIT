/* ============================================================
   BENTENTRADE — Spotlight glass search (site-wide)
   Opens on the header search button or Cmd/Ctrl+K.
   ============================================================ */
(function(){
  function lang(){
    const s = localStorage.getItem("btt_lang");
    return ["ru","uz","en"].includes(s) ? s : "ru";
  }
  function t(key){
    const I = window.BTT_I18N || {};
    const d = I[lang()] || {};
    if(d[key] != null) return d[key];
    const ru = I.ru || {};
    return ru[key] != null ? ru[key] : key;
  }

  // category index — slug matches the catalog chips (site.js) and routes to catalog ?cat=
  const CATS = [
    { slug:"wicker-chairs",     k:"cat.wickerChairs",     img:"assets/hero-garden-furniture.png" },
    { slug:"plastic-chairs",    k:"cat.plasticChairs",    img:"assets/stul-roero.png" },
    { slug:"upholstered-chairs",k:"cat.upholsteredChairs",img:"assets/stul-lira.png" },
    { slug:"tables",            k:"cat.tables",           img:"assets/stol-taper-80.png" }
  ];
  const PAGES = [
    { href:"index.html",    k:"nav.home" },
    { href:"catalog.html",  k:"nav.catalog" },
    { href:"blog.html",     k:"nav.blog" },
    { href:"faq.html",      k:"foot.faq" },
    { href:"delivery.html", k:"foot.delivery" },
    { href:"care.html",     k:"foot.care" },
    { href:"returns.html",  k:"foot.returns" },
    { href:"about.html",    k:"nav.about" },
    { href:"contacts.html", k:"nav.contacts" }
  ];

  function productThumb(id){
    const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(id) : null;
    return (imgs && imgs[0]) ? imgs[0].thumb : null;
  }

  function staticProducts(){
    const d = (window.BTT_I18N && window.BTT_I18N[lang()]) || {};
    const M = window.BTT_PRODUCT_MASTER;
    const out = [];
    if(M && Array.isArray(M)){
      M.forEach(item => {
        const id = item.slug;
        const name = d[item.slug + ".name"] || item.name_ru;
        const cat = d[item.slug + ".cat"] || item.category;
        out.push({ id, slug: item.slug, name, cat, img: productThumb(item.slug), q: name });
      });
      return out;
    }
    const P = window.BTT_PRODUCTS;
    if(P){
      Object.keys(P).forEach(id=>{
        const name = d[id+".name"];
        if(name) out.push({ id, slug: id, name, cat:d[id+".cat"]||"", img:productThumb(id), q:name });
      });
      if(out.length) return out;
    }
    return out;
  }

  // Live product index from the CRM (per-language cache) so products added or
  // renamed in the CRM are searchable. Falls back to the static list.
  const apiCache = {};
  function loadApiProducts(){
    if(!window.BTT_API) return;
    if(window.BTT_COOKIES && !window.BTT_COOKIES.hasConsent()) return;
    const l = lang();
    if(apiCache[l]) return;
    window.BTT_API.products("all").then(res=>{
      apiCache[l] = (res.products || []).map(p=>({
        id:p.id, name:p.name || "", cat:p.category_label || "",
        img:p.image ? ("/media/" + p.image) : null, q:p.name || ""
      }));
      if(ov && ov.classList.contains("is-open")) render();
    }).catch(()=>{});
  }
  function products(){
    const l = lang();
    return (apiCache[l] && apiCache[l].length) ? apiCache[l] : staticProducts();
  }

  let ov, input, body, items = [], active = -1;

  function build(){
    ov = document.createElement("div");
    ov.className = "search-ov";
    ov.innerHTML =
      '<div class="search-box" role="dialog" aria-modal="true">'+
        '<div class="search-box__head">'+
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>'+
          '<input class="search-box__input" type="text" autocomplete="off" spellcheck="false" placeholder="'+esc(t("srch.ph"))+'" data-i18n-ph="srch.ph" aria-label="'+esc(t("srch.ph"))+'" data-i18n-aria="srch.ph">'+
          '<span class="search-box__kbd">ESC</span>'+
          '<button type="button" class="search-box__close" aria-label="'+esc(t("bot.aria.close") || "Закрыть")+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>'+
        '</div>'+
        '<div class="search-box__body"></div>'+
      '</div>';
    document.body.appendChild(ov);
    input = ov.querySelector(".search-box__input");
    body = ov.querySelector(".search-box__body");

    const closeBtn = ov.querySelector(".search-box__close");
    if(closeBtn) closeBtn.addEventListener("click", close);

    ov.addEventListener("click", e=>{ if(e.target === ov) close(); });
    input.addEventListener("input", render);
    input.addEventListener("keydown", onKey);
  }

  function esc(s){
    if(window.BTT_UTIL && window.BTT_UTIL.esc) return window.BTT_UTIL.esc(s);
    return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  }
  function norm(s){ return String(s).toLowerCase().replace(/[‘’`]/g, "'").trim(); }

  function render(){
    const q = norm(input.value);
    items = [];
    let html = "";

    const cats = CATS.map(c=>({ ...c, label:t(c.k) })).filter(c=> !q || norm(c.label).includes(q));
    const prods = products().filter(p=> !q || norm(p.name).includes(q) || norm(p.cat).includes(q));
    const pages = PAGES.map(p=>({ ...p, label:t(p.k), sub:p.sub?t(p.sub):p.href })).filter(p=> !q || norm(p.label).includes(q) || norm(p.sub||"").includes(q));

    if(!cats.length && !prods.length && !pages.length){
      body.innerHTML = '<div class="search-empty">'+esc(t("srch.empty"))+'</div>';
      active = -1; return;
    }

    if(cats.length){
      html += '<div class="search-sec">'+esc(t("srch.cats"))+'</div>';
      cats.forEach(c=>{
        items.push({ href:"catalog.html?cat="+c.slug });
        html += row(c.img, c.label, t("srch.cats"), items.length-1);
      });
    }
    if(prods.length){
      html += '<div class="search-sec">'+esc(t("srch.prods"))+'</div>';
      prods.forEach(p=>{
        items.push({ href:"/catalog/"+encodeURIComponent(p.slug || p.id) });
        html += row(p.img || null, p.name, p.cat, items.length-1, p.name.slice(0,1));
      });
    }
    if(pages.length){
      html += '<div class="search-sec">'+esc(t("srch.pages"))+'</div>';
      pages.forEach(p=>{
        items.push({ href:p.href });
        html += row(null, p.label, p.sub || p.href, items.length-1, "→");
      });
    }
    body.innerHTML = html;
    active = 0;
    paint();

    body.querySelectorAll(".search-item").forEach((el,i)=>{
      el.addEventListener("click", ()=> go(i));
      el.addEventListener("mousemove", ()=>{ active=i; paint(); });
    });
  }

  function row(img, title, sub, i, glyph){
    const ic = img
      ? '<span class="search-item__ic"><img src="'+esc(img)+'" alt="'+esc(title||"")+'" loading="lazy" decoding="async" onerror="this.parentNode.textContent=\''+(glyph||"")+'\'"></span>'
      : '<span class="search-item__ic">'+esc(glyph||"")+'</span>';
    return '<button class="search-item" data-i="'+i+'">'+ic+
      '<span class="search-item__tx"><b>'+esc(title)+'</b><span>'+esc(sub)+'</span></span>'+
      '<svg class="search-item__go" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'+
      '</button>';
  }

  function paint(){
    body.querySelectorAll(".search-item").forEach((el,i)=> el.classList.toggle("is-active", i===active));
  }

  function onKey(e){
    if(e.key === "Escape"){ close(); return; }
    if(e.key === "ArrowDown"){ e.preventDefault(); active=Math.min(active+1, items.length-1); paint(); scrollTo(); }
    else if(e.key === "ArrowUp"){ e.preventDefault(); active=Math.max(active-1, 0); paint(); scrollTo(); }
    else if(e.key === "Enter"){ e.preventDefault(); if(active>=0) go(active); }
  }
  function scrollTo(){
    const el = body.querySelectorAll(".search-item")[active];
    if(!el) return;
    const r = el.getBoundingClientRect(), pr = body.getBoundingClientRect();
    if(r.bottom > pr.bottom) body.scrollTop += r.bottom - pr.bottom + 8;
    if(r.top < pr.top) body.scrollTop -= pr.top - r.top + 8;
  }
  function go(i){ const it = items[i]; if(it) window.location.href = it.href; }

  let lastFocus = null;

  function open(){
    if(!ov) build();
    lastFocus = document.activeElement;
    loadApiProducts();
    input.value = "";
    render();
    ov.classList.add("is-open");
    ov.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    setTimeout(()=> input.focus(), 40);
  }
  function close(){
    if(!ov) return;
    ov.classList.remove("is-open");
    ov.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    if(lastFocus && typeof lastFocus.focus === "function"){
      try{ lastFocus.focus(); }catch(_){}
      lastFocus = null;
    }
  }

  document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll("[data-search-open], [data-i18n-aria='tool.search'], [aria-label='Поиск'], [aria-label='Qidiruv'], [aria-label='Search']").forEach(btn=>{
      btn.addEventListener("click", e=>{ e.preventDefault(); open(); });
    });
    document.addEventListener("click", e=>{
      const btn = e.target.closest("[data-search-open]");
      if(btn){ e.preventDefault(); open(); }
    });
    document.addEventListener("keydown", e=>{
      if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){ e.preventDefault(); open(); }
    });
  });

  window.BTT_SEARCH = { open, close };

  document.addEventListener("btt:cookies-accepted", function () {
    Object.keys(apiCache).forEach(function (k) { delete apiCache[k]; });
    loadApiProducts();
  });
})();
