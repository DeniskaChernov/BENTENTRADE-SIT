/* ============================================================
   BENTENTRADE — account page (tabs, wishlist sync, mobile drawer)
   ============================================================ */
(function(){
  "use strict";

  const FAV_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20Z"/></svg>';
  const ADD_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>';

  function lang(){ const s=localStorage.getItem("btt_lang"); return ["ru","uz","en"].includes(s)?s:"ru"; }
  function t(k){ const d=(window.BTT_I18N&&window.BTT_I18N[lang()])||{}; return d[k]!=null?d[k]:k; }
  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"); }

  function getFavs(){
    if(window.BTT_CART&&window.BTT_CART.getFavs) return window.BTT_CART.getFavs();
    try{ const v=JSON.parse(localStorage.getItem("btt_favs")); return (v&&typeof v==="object")?v:{}; }catch(e){ return {}; }
  }
  function favCount(){ return Object.keys(getFavs()).length; }

  let toastWrap;
  function toast(msg){
    if(!toastWrap){ toastWrap=document.createElement("div"); toastWrap.className="toast-wrap"; document.body.appendChild(toastWrap); }
    const el=document.createElement("div"); el.className="toast"; el.textContent=msg; toastWrap.appendChild(el);
    requestAnimationFrame(()=>el.classList.add("on"));
    setTimeout(()=>{ el.classList.remove("on"); setTimeout(()=>el.remove(),320); }, 2600);
  }

  function productCard(id){
    const P=window.BTT_PRODUCTS||{}, p=P[id]; if(!p) return "";
    const imgs=window.BTT_PRODUCT_IMG?window.BTT_PRODUCT_IMG(id):null;
    const thumb=(imgs&&imgs[0])?imgs[0].thumb:"";
    const favs=getFavs();
    const on=!!favs[id];
    return '<article class="product" data-product data-cat="'+esc(p.cat)+'">'+
      '<div class="product__media media">'+
        '<button class="fav'+(on?" is-on":"")+'" data-fav aria-label="fav">'+FAV_SVG+'</button>'+
        '<img src="'+esc(thumb)+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">'+
        '<a class="see" href="product.html?id='+esc(id)+'" data-i18n="see">'+esc(t("see"))+'</a>'+
        '<button class="add" data-add aria-label="add">'+ADD_SVG+'</button>'+
      '</div>'+
      '<div>'+
        '<div class="product__cat">'+esc(t(id+".cat"))+'</div>'+
        '<div class="product__name acc-prod-name">'+esc(t(id+".name"))+'</div>'+
        '<div class="price acc-prod-price"><span class="price__now">$'+p.now+'</span>'+
        (p.old?'<span class="price__old">$'+p.old+'</span>':"")+'</div>'+
      '</div>'+
    '</article>';
  }

  function renderWishlist(){
    const grid=document.querySelector("[data-acc-wishlist]");
    const empty=document.querySelector("[data-acc-wish-empty]");
    if(!grid) return;
    const ids=Object.keys(getFavs());
    if(!ids.length){
      grid.innerHTML="";
      if(empty) empty.hidden=false;
      return;
    }
    if(empty) empty.hidden=true;
    grid.innerHTML=ids.map(productCard).join("");
    if(window.BTT_CART&&window.BTT_CART.wireProductButtons) window.BTT_CART.wireProductButtons(grid);
    if(window.BTT_syncFavs) window.BTT_syncFavs();
  }

  function syncStats(){
    const el=document.querySelector("[data-acc-stat-fav]");
    if(el) el.textContent=favCount();
  }

  function hydrateOrderThumbs(){
    document.querySelectorAll("[data-order-thumbs]").forEach(wrap=>{
      const ids=(wrap.getAttribute("data-order-thumbs")||"").split(",").map(s=>s.trim()).filter(Boolean);
      wrap.innerHTML=ids.map(id=>{
        const imgs=window.BTT_PRODUCT_IMG?window.BTT_PRODUCT_IMG(id):null;
        const src=(imgs&&imgs[0])?imgs[0].thumb:"";
        return '<img src="'+esc(src)+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
      }).join("");
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    const nav = document.querySelector("[data-acc-nav]");
    if(!nav) return;
    const side = document.querySelector(".acc-side");
    const scrim = document.querySelector("[data-acc-scrim]");
    const mobToggle = document.querySelector("[data-acc-mob-toggle]");
    const mobLabel = document.querySelector("[data-acc-mob-label]");
    const tabs = nav.querySelectorAll("[data-acc-tab]");
    const panels = document.querySelectorAll("[data-acc-panel]");

    function tabLabel(name){
      const btn=nav.querySelector('[data-acc-tab="'+name+'"] span[data-i18n]');
      return btn ? btn.textContent : name;
    }

    function closeDrawer(){
      if(side) side.classList.remove("is-open");
      if(scrim) scrim.classList.remove("on");
      document.documentElement.style.overflow="";
      if(mobToggle) mobToggle.setAttribute("aria-expanded", "false");
    }
    function openDrawer(){
      if(side) side.classList.add("is-open");
      if(scrim) scrim.classList.add("on");
      document.documentElement.style.overflow="hidden";
      if(mobToggle) mobToggle.setAttribute("aria-expanded", "true");
    }

    function show(name){
      tabs.forEach(t=> t.classList.toggle("is-active", t.dataset.accTab === name));
      panels.forEach(p=> p.classList.toggle("is-active", p.dataset.accPanel === name));
      if(mobLabel) mobLabel.textContent=tabLabel(name);
      closeDrawer();
      try{ history.replaceState(null, "", "#" + name); }catch(e){}
      const top=document.querySelector(".account-flow")||document.querySelector("main");
      if(top) top.scrollIntoView({behavior:"smooth", block:"start"});
    }

    tabs.forEach(t=> t.addEventListener("click", ()=> show(t.dataset.accTab)));

    document.querySelectorAll("[data-acc-goto]").forEach(b=>{
      b.addEventListener("click", ()=> show(b.dataset.accGoto));
    });

    if(mobToggle) mobToggle.addEventListener("click", ()=>{
      const willOpen = !(side && side.classList.contains("is-open"));
      if(willOpen) openDrawer(); else closeDrawer();
    });
    if(scrim) scrim.addEventListener("click", closeDrawer);

    const logout = document.querySelector("[data-acc-logout]");
    if(logout) logout.addEventListener("click", ()=>{ window.location.href = "index.html"; });

    const form = document.querySelector("[data-acc-form]");
    if(form){
      form.addEventListener("submit",(e)=>{
        e.preventDefault();
        const ok = form.querySelector("[data-form-ok]");
        if(ok){ ok.classList.add("show"); setTimeout(()=>ok.classList.remove("show"), 2600); }
      });
    }

    const hash = (location.hash||"").replace("#","");
    if(hash && Array.from(tabs).some(t=>t.dataset.accTab===hash)) show(hash);
    else if(mobLabel) mobLabel.textContent=tabLabel("overview");

    /* ---- repeat order → cart ---- */
    function snapshot(id){
      const P=window.BTT_PRODUCTS||{}, p=P[id]; if(!p) return null;
      const d=(window.BTT_I18N&&window.BTT_I18N[lang()])||(window.BTT_I18N&&window.BTT_I18N.ru)||{};
      const imgs=window.BTT_PRODUCT_IMG?window.BTT_PRODUCT_IMG(id):null;
      return { id, name:d[id+".name"]||id, price:p.now, img:(imgs&&imgs[0])?imgs[0].thumb:"" };
    }
    document.querySelectorAll("[data-order-repeat]").forEach(b=>{
      b.addEventListener("click",()=>{
        const ids=(b.getAttribute("data-order-repeat")||"").split(",").map(s=>s.trim()).filter(Boolean);
        let added=0;
        ids.forEach(id=>{ const s=snapshot(id); if(s&&window.BTT_CART){ window.BTT_CART.addToCart(s,1); added++; } });
        if(added) toast(t("toast.repeat"));
      });
    });

    document.querySelectorAll("[data-order-track]").forEach(b=>{
      b.addEventListener("click",()=> toast(t("toast.track").replace("{id}", b.getAttribute("data-order-track"))));
    });
    document.querySelectorAll("[data-order-review]").forEach(b=>{
      b.addEventListener("click",()=> toast(t("toast.review")));
    });
    document.querySelectorAll("[data-addr-edit]").forEach(b=>{
      b.addEventListener("click",e=>{ e.preventDefault(); toast(t("toast.addr")); });
    });
    document.querySelectorAll("[data-addr-add]").forEach(b=>{
      b.addEventListener("click",()=> toast(t("toast.addrAdd")));
    });

    const news=document.querySelector("[data-news-toggle]");
    const newsLabel=document.querySelector("[data-news-label]");
    function applyNews(on){
      if(news) news.setAttribute("aria-checked", on?"true":"false");
      if(newsLabel){ newsLabel.setAttribute("data-i18n", on?"acc.set.newson":"acc.set.newsoff"); newsLabel.textContent=t(on?"acc.set.newson":"acc.set.newsoff"); }
    }
    if(news){
      const stored=localStorage.getItem("btt_news");
      applyNews(stored===null?true:stored==="1");
      news.addEventListener("click",()=>{
        const on=news.getAttribute("aria-checked")!=="true";
        localStorage.setItem("btt_news", on?"1":"0");
        applyNews(on);
        toast(t(on?"toast.newson":"toast.newsoff"));
      });
    }

    hydrateOrderThumbs();
    renderWishlist();
    syncStats();

    document.addEventListener("btt:favs-change", ()=>{ renderWishlist(); syncStats(); });
    document.addEventListener("storage", e=>{
      if(e.key==="btt_favs"){ renderWishlist(); syncStats(); }
    });

    new MutationObserver(()=>{
      renderWishlist();
      if(mobLabel){
        const active=nav.querySelector("[data-acc-tab].is-active");
        if(active) mobLabel.textContent=tabLabel(active.dataset.accTab);
      }
    }).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});

    document.addEventListener("keydown", e=>{
      if(e.key==="Escape"&&side&&side.classList.contains("is-open")) closeDrawer();
    });
  });
})();
