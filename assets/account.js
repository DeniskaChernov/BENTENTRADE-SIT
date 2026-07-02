/* ============================================================
   BENTENTRADE — account page (tab switching)
   ============================================================ */
(function(){
  document.addEventListener("DOMContentLoaded", function(){
    const nav = document.querySelector("[data-acc-nav]");
    if(!nav) return;
    const tabs = nav.querySelectorAll("[data-acc-tab]");
    const panels = document.querySelectorAll("[data-acc-panel]");

    function show(name){
      tabs.forEach(t=> t.classList.toggle("is-active", t.dataset.accTab === name));
      panels.forEach(p=> p.classList.toggle("is-active", p.dataset.accPanel === name));
      try{ history.replaceState(null, "", "#" + name); }catch(e){}
      window.scrollTo({top:0, behavior:"smooth"});
    }

    tabs.forEach(t=> t.addEventListener("click", ()=> show(t.dataset.accTab)));

    // "Все заказы" / cross-links
    document.querySelectorAll("[data-acc-goto]").forEach(b=>{
      b.addEventListener("click", ()=> show(b.dataset.accGoto));
    });

    // logout (demo)
    const logout = document.querySelector("[data-acc-logout]");
    if(logout) logout.addEventListener("click", ()=>{ window.location.href = "index.html"; });

    // settings form
    const form = document.querySelector("[data-acc-form]");
    if(form){
      form.addEventListener("submit",(e)=>{
        e.preventDefault();
        const ok = form.querySelector("[data-form-ok]");
        if(ok){ ok.classList.add("show"); setTimeout(()=>ok.classList.remove("show"), 2600); }
      });
    }

    // open tab from hash
    const hash = (location.hash||"").replace("#","");
    if(hash && Array.from(tabs).some(t=>t.dataset.accTab===hash)) show(hash);

    /* ---- shared helpers ---- */
    function lang(){ const s=localStorage.getItem("btt_lang"); return ["ru","uz","en"].includes(s)?s:"ru"; }
    function t(k){ const d=(window.BTT_I18N&&window.BTT_I18N[lang()])||{}; return d[k]!=null?d[k]:k; }

    let toastWrap;
    function toast(msg){
      if(!toastWrap){ toastWrap=document.createElement("div"); toastWrap.className="toast-wrap"; document.body.appendChild(toastWrap); }
      const el=document.createElement("div"); el.className="toast"; el.textContent=msg; toastWrap.appendChild(el);
      requestAnimationFrame(()=>el.classList.add("on"));
      setTimeout(()=>{ el.classList.remove("on"); setTimeout(()=>el.remove(),320); }, 2600);
    }

    /* ---- repeat order → add its items to the cart ---- */
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

    /* ---- track / review / addresses → feedback toast ---- */
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

    /* ---- newsletter toggle (persisted) ---- */
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
  });
})();
