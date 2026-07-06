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
    { slug:"furniture", k:"chip.furniture", img:"https://loremflickr.com/120/120/rattan,sofa/all?lock=11" },
    { slug:"planter",   k:"chip.planter",   img:"https://loremflickr.com/120/120/wicker,planter/all?lock=4" },
    { slug:"basket",    k:"chip.basket",    img:"https://loremflickr.com/120/120/woven,basket/all?lock=34" },
    { slug:"indoor",    k:"chip.indoor",    img:"https://loremflickr.com/120/120/rattan,rocking,chair/all?lock=90" }
  ];
  // page index (personal account is hidden until auth is live)
  const PAGES = [
    { href:"catalog.html",  k:"nav.catalog" },
    { href:"about.html",    k:"nav.about" },
    { href:"contacts.html", k:"nav.contacts" }
  ];

  function staticProducts(){
    const d = (window.BTT_I18N && window.BTT_I18N[lang()]) || {};
    const out = [];
    for(let i=1;i<=15;i++){
      const name = d["p"+i+".name"], cat = d["p"+i+".cat"];
      if(name) out.push({ id:"p"+i, name, cat:cat||"", img:null, q:name });
    }
    return out;
  }

  // Live product index from the CRM (per-language cache) so products added or
  // renamed in the CRM are searchable. Falls back to the static list.
  const apiCache = {};
  function loadApiProducts(){
    if(!window.BTT_API) return;
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
        '</div>'+
        '<div class="search-box__body"></div>'+
      '</div>';
    document.body.appendChild(ov);
    input = ov.querySelector(".search-box__input");
    body = ov.querySelector(".search-box__body");

    ov.addEventListener("click", e=>{ if(e.target === ov) close(); });
    input.addEventListener("input", render);
    input.addEventListener("keydown", onKey);
  }

  function esc(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function norm(s){ return String(s).toLowerCase().trim(); }

  function render(){
    const q = norm(input.value);
    items = [];
    let html = "";

    const cats = CATS.map(c=>({ ...c, label:t(c.k) })).filter(c=> !q || norm(c.label).includes(q));
    const prods = products().filter(p=> !q || norm(p.name).includes(q) || norm(p.cat).includes(q));
    const pages = PAGES.map(p=>({ ...p, label:t(p.k) })).filter(p=> !q || norm(p.label).includes(q));

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
        items.push({ href:"product.html?id="+encodeURIComponent(p.id) });
        html += row(p.img || null, p.name, p.cat, items.length-1, p.name.slice(0,1));
      });
    }
    if(pages.length){
      html += '<div class="search-sec">'+esc(t("srch.pages"))+'</div>';
      pages.forEach(p=>{
        items.push({ href:p.href });
        html += row(null, p.label, p.href, items.length-1, "→");
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
      ? '<span class="search-item__ic"><img src="'+img+'" alt="'+esc(title||"")+'" loading="lazy" decoding="async" onerror="this.parentNode.textContent=\''+(glyph||"")+'\'"></span>'
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

  function open(){
    if(!ov) build();
    loadApiProducts();
    input.value = "";
    render();
    ov.classList.add("is-open");
    document.documentElement.style.overflow = "hidden";
    setTimeout(()=> input.focus(), 40);
  }
  function close(){
    if(!ov) return;
    ov.classList.remove("is-open");
    document.documentElement.style.overflow = "";
  }

  document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll("[data-i18n-aria='tool.search'], [aria-label='Поиск'], [aria-label='Qidiruv'], [aria-label='Search']").forEach(btn=>{
      btn.addEventListener("click", e=>{ e.preventDefault(); open(); });
    });
    document.addEventListener("keydown", e=>{
      if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){ e.preventDefault(); open(); }
    });
  });

  window.BTT_SEARCH = { open, close };
})();
