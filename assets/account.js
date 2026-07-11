/* ============================================================
   BENTENTRADE — account page (tabs, wishlist sync, mobile drawer)
   ============================================================ */
(function(){
  "use strict";

  const U = window.BTT_UTIL || {};
  const FAV_SVG = U.FAV_SVG || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20Z"/></svg>';
  const ADD_SVG = U.ADD_SVG || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>';

  const lang = U.lang || function(){ const s=localStorage.getItem("btt_lang"); return ["ru","uz","en"].includes(s)?s:"ru"; };
  const t = U.t || function(k){ const I=window.BTT_I18N||{}; const d=I[lang()]||{}; if(d[k]!=null) return d[k]; const ru=I.ru||{}; return ru[k]!=null?ru[k]:k; };
  const esc = U.esc || function(s){ return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); };

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
        '<button class="fav'+(on?" is-on":"")+'" data-fav data-i18n-aria="a11y.fav" aria-label="'+esc(t("a11y.fav"))+'">'+FAV_SVG+'</button>'+
        '<img src="'+esc(thumb)+'" alt="'+esc(t(id+".name"))+'" loading="lazy" onerror="this.style.display=\'none\'">'+
        '<a class="see" href="product.html?id='+esc(id)+'" data-i18n="see">'+esc(t("see"))+'</a>'+
        '<button class="add" data-add data-i18n-aria="a11y.add" aria-label="'+esc(t("a11y.add"))+'">'+ADD_SVG+'</button>'+
      '</div>'+
      '<div>'+
        '<div class="product__cat">'+esc(t(id+".cat"))+'</div>'+
        '<div class="product__name acc-prod-name">'+esc(t(id+".name"))+'</div>'+
        '<div class="price acc-prod-price"><span class="price__now">'+((window.BTT_UTIL&&window.BTT_UTIL.formatMoney)?window.BTT_UTIL.formatMoney(p.now):p.now)+'</span>'+
        (p.old?'<span class="price__old">'+((window.BTT_UTIL&&window.BTT_UTIL.formatMoney)?window.BTT_UTIL.formatMoney(p.old):p.old)+'</span>':"")+'</div>'+
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

  /* ---------------- API-backed hydration ---------------- */
  const ST = {
    new:        { ru:"Новый",      uz:"Yangi",         en:"New",        cls:"status--new" },
    processing: { ru:"В обработке", uz:"Ishlanmoqda",   en:"Processing", cls:"status--ship" },
    shipped:    { ru:"В пути",     uz:"Yo‘lda",         en:"Shipped",    cls:"status--ship" },
    delivered:  { ru:"Доставлен",  uz:"Yetkazildi",    en:"Delivered",  cls:"status--done" },
    cancelled:  { ru:"Отменён",    uz:"Bekor qilingan", en:"Cancelled",  cls:"status--cancel" },
  };
  function fmtDate(s){
    try{
      const d=new Date(String(s||"").replace(" ","T")+"Z");
      if(isNaN(d)) return String(s||"");
      const loc = lang()==="en" ? "en-GB" : (lang()==="uz" ? "uz-UZ" : "ru-RU");
      return d.toLocaleDateString(loc,{day:"numeric",month:"long",year:"numeric"});
    }catch(e){ return String(s||""); }
  }
  function itemsLabel(n){ const L={ru:"тов.",uz:"dona",en:"items"}; return n+" "+(L[lang()]||L.en); }

  function orderThumb(id){
    const imgs=window.BTT_PRODUCT_IMG?window.BTT_PRODUCT_IMG(id):null;
    const src=(imgs&&imgs[0])?imgs[0].thumb:"";
    return '<img src="'+esc(src)+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
  }
  function orderTimeline(status){
    const s = status || "new";
    if(s === "cancelled"){
      const c = ST.cancelled;
      return '<ol class="order-steps"><li class="order-step is-cancel is-current">'+esc(c[lang()]||c.en)+'</li></ol>';
    }
    const flow = ["new","processing","shipped","delivered"];
    const cur = Math.max(0, flow.indexOf(s));
    const steps = flow.map(function(key, i){
      const st = ST[key] || ST.new;
      let cls = "order-step";
      if(i < cur) cls += " is-done";
      else if(i === cur) cls += " is-current";
      return '<li class="'+cls+'">'+esc(st[lang()]||st.en)+'</li>';
    }).join("");
    return '<ol class="order-steps">'+steps+'</ol>';
  }
  function orderCard(o, withActions){
    const st=ST[o.status]||ST.new; const lbl=st[lang()]||st.en;
    const items=o.items||[];
    const ids=items.map(i=>i.product_id).filter(Boolean);
    const count=items.reduce((n,i)=>n+(i.qty||1),0);
    const actions = withActions
      ? '<div class="order__actions"><button class="btn btn--dark btn--sm" data-order-repeat="'+esc(ids.join(","))+'">'+esc(t("acc.ord.repeat"))+'</button></div>'
      : "";
    return '<article class="order">'+
      '<div class="order__hit" role="button" tabindex="0" aria-expanded="false" aria-label="'+esc(t("acc.ord.expand"))+'">'+
      '<header class="order__head">'+
        '<div class="order__info">'+
          '<span class="order__id">#'+esc(o.public_id||("BT-"+o.id))+'</span>'+
          '<span class="order__date">'+esc(fmtDate(o.created_at))+'</span>'+
        '</div>'+
        '<span class="status '+st.cls+'">'+esc(lbl)+'</span>'+
        '<span class="order__total">'+esc((window.BTT_UTIL&&window.BTT_UTIL.formatMoney)?window.BTT_UTIL.formatMoney(o.total,{raw:true}):(o.total+" сум"))+'</span>'+
      '</header>'+
      '<div class="order__foot">'+
        '<div class="order__items">'+
          '<div class="order__thumbs">'+ids.map(orderThumb).join("")+'</div>'+
          '<span class="order__meta">'+esc(itemsLabel(count))+'</span>'+
        '</div>'+
        '<span class="order__chev" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></span>'+
      '</div>'+
      '</div>'+
      '<div class="order__timeline" hidden>'+orderTimeline(o.status)+'</div>'+actions+'</article>';
  }

  function repeatSnapshot(id){
    const P=window.BTT_PRODUCTS||{}, p=P[id]; if(!p) return null;
    const d=(window.BTT_I18N&&window.BTT_I18N[lang()])||(window.BTT_I18N&&window.BTT_I18N.ru)||{};
    const imgs=window.BTT_PRODUCT_IMG?window.BTT_PRODUCT_IMG(id):null;
    return { id, name:d[id+".name"]||id, price:p.now, img:(imgs&&imgs[0])?imgs[0].thumb:"" };
  }
  function wireRepeat(){
    document.querySelectorAll("[data-order-repeat]").forEach(b=>{
      if(b.dataset.repeatWired) return; b.dataset.repeatWired="1";
      b.addEventListener("click",(e)=>{
        e.stopPropagation();
        const ids=(b.getAttribute("data-order-repeat")||"").split(",").map(s=>s.trim()).filter(Boolean);
        let added=0;
        ids.forEach(id=>{ const s=repeatSnapshot(id); if(s&&window.BTT_CART){ window.BTT_CART.addToCart(s,1); added++; } });
        if(added) toast(t("toast.repeat"));
      });
    });
  }
  function wireOrderExpand(root){
    (root||document).querySelectorAll(".order__hit").forEach(btn=>{
      if(btn.dataset.expandWired) return;
      btn.dataset.expandWired="1";
      btn.addEventListener("click",()=>{
        const order = btn.closest(".order");
        if(!order) return;
        const tl = order.querySelector(".order__timeline");
        const open = !order.classList.contains("is-open");
        document.querySelectorAll(".order.is-open").forEach(o=>{
          if(o === order) return;
          o.classList.remove("is-open");
          const hit = o.querySelector(".order__hit");
          const other = o.querySelector(".order__timeline");
          if(hit) hit.setAttribute("aria-expanded","false");
          if(other) other.hidden = true;
        });
        order.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        if(tl) tl.hidden = !open;
      });
      btn.addEventListener("keydown",(e)=>{
        if(e.key==="Enter" || e.key===" "){ e.preventDefault(); btn.click(); }
      });
    });
  }

  function renderOrders(orders){
    const panel=document.querySelector('[data-acc-panel="orders"]');
    if(panel){
      panel.querySelectorAll(".order").forEach(n=>n.remove());
      const empty=panel.querySelector("[data-acc-ord-empty]");
      if(!orders.length){
        if(empty) empty.hidden=false;
      }else{
        if(empty) empty.hidden=true;
        panel.insertAdjacentHTML("beforeend", orders.map(o=>orderCard(o,true)).join(""));
      }
    }
    const ovWrap=document.querySelector("[data-acc-recent-wrap]");
    const recentEmpty=document.querySelector("[data-acc-recent-empty]");
    if(ovWrap){
      ovWrap.querySelectorAll(".order").forEach(n=>n.remove());
      const recent=orders.slice(0,2);
      if(!recent.length){
        if(recentEmpty) recentEmpty.hidden=false;
      }else{
        if(recentEmpty) recentEmpty.hidden=true;
        ovWrap.insertAdjacentHTML("beforeend", recent.map(o=>orderCard(o,false)).join(""));
      }
    }
    const statOrders=document.querySelector("[data-acc-stat-orders]");
    if(statOrders) statOrders.textContent=String(orders.length);
    wireRepeat();
    wireOrderExpand();
  }

  const CHECK_SVG='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>';
  const HOME_SVG='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9 12 2l9 7v11a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></svg>';
  function addrCard(a){
    const tag = a.is_default
      ? '<div class="addr__tag">'+CHECK_SVG+'<span>'+esc(t("acc.addr.default"))+'</span></div>'
      : '<div class="addr__tag">'+HOME_SVG+'<span>'+esc(a.label||t("acc.addr.office"))+'</span></div>';
    const line2=[a.city,a.line].filter(Boolean).map(esc).join(", ");
    return '<div class="addr'+(a.is_default?" is-default":"")+'" data-addr-id="'+a.id+'">'+
      '<a class="addr__edit" href="#" data-addr-edit>'+esc(t("acc.addr.edit"))+'</a>'+tag+
      '<h4>'+esc(a.recipient||"")+'</h4>'+
      '<p>'+line2+(a.phone?'<br>'+esc(a.phone):"")+'</p></div>';
  }
  function renderAddresses(addresses){
    const grid=document.querySelector(".addr-grid");
    if(!grid) return;
    const addBtn=grid.querySelector("[data-addr-add]");
    const emptyEl=grid.querySelector("[data-acc-addr-empty]");
    grid.querySelectorAll(".addr:not(.addr--add)").forEach(n=>n.remove());
    if(!addresses.length){
      if(emptyEl) emptyEl.hidden=false;
    }else{
      if(emptyEl) emptyEl.hidden=true;
      const html=addresses.map(addrCard).join("");
      if(addBtn) addBtn.insertAdjacentHTML("beforebegin", html);
      else grid.insertAdjacentHTML("afterbegin", html);
    }
    grid.__addresses=addresses;
    wireAddresses();
  }

  /* --- address modal --- */
  let addrModal;
  function ensureAddrModal(){
    if(addrModal) return addrModal;
    addrModal=document.createElement("div");
    addrModal.className="addr-modal";
    addrModal.innerHTML=
      '<div class="addr-modal__box"><form class="form" data-addr-form>'+
      '<div class="field"><label>'+esc(t("acc.addr.label"))+'</label><input name="label"></div>'+
      '<div class="field"><label>'+esc(t("acc.set.name"))+'</label><input name="recipient" required></div>'+
      '<div class="field"><label>'+esc(t("acc.set.phone"))+'</label><input name="phone" type="tel"></div>'+
      '<div class="field"><label>'+esc(t("acc.addr.city"))+'</label><input name="city"></div>'+
      '<div class="field"><label>'+esc(t("acc.addr.line"))+'</label><input name="line"></div>'+
      '<label class="addr-modal__def"><input type="checkbox" name="is_default"> <span>'+esc(t("acc.addr.default"))+'</span></label>'+
      '<div class="addr-modal__row"><button type="button" class="btn btn--ghost btn--sm" data-addr-cancel>'+esc(t("acc.addr.cancel"))+'</button>'+
      '<button type="button" class="btn btn--ghost btn--sm addr-modal__del" data-addr-del hidden>'+esc(t("acc.addr.del"))+'</button>'+
      '<button type="submit" class="btn btn--copper btn--sm">'+esc(t("acc.set.save"))+'</button></div>'+
      '</form></div>';
    document.body.appendChild(addrModal);
    addrModal.addEventListener("click",e=>{ if(e.target===addrModal) closeAddrModal(); });
    addrModal.querySelector("[data-addr-cancel]").addEventListener("click", closeAddrModal);
    return addrModal;
  }
  function closeAddrModal(){ if(addrModal) addrModal.classList.remove("on"); document.documentElement.style.overflow=""; }
  function openAddrModal(existing){
    if(!window.BTT_API) { toast(t("toast.addr")); return; }
    const m=ensureAddrModal();
    const f=m.querySelector("[data-addr-form]");
    f.reset();
    f.label.value=(existing&&existing.label)||"";
    f.recipient.value=(existing&&existing.recipient)||"";
    f.phone.value=(existing&&existing.phone)||"";
    f.city.value=(existing&&existing.city)||"";
    f.line.value=(existing&&existing.line)||"";
    f.is_default.checked=!!(existing&&existing.is_default);
    const delBtn=m.querySelector("[data-addr-del]");
    if(delBtn) delBtn.hidden = !(existing && existing.id);
    async function refresh(){
      closeAddrModal();
      const res=await window.BTT_API.listAddresses();
      renderAddresses(res.addresses||[]);
    }
    if(delBtn) delBtn.onclick=async function(){
      if(!(existing&&existing.id)) return;
      try{ await window.BTT_API.deleteAddress(existing.id); await refresh(); toast(t("toast.addrDeleted")); }
      catch(err){ toast(t("auth.err.generic")); }
    };
    f.onsubmit=async function(e){
      e.preventDefault();
      const payload={ label:f.label.value.trim(), recipient:f.recipient.value.trim(), phone:f.phone.value.trim(), city:f.city.value.trim(), line:f.line.value.trim(), is_default:f.is_default.checked };
      try{
        if(existing&&existing.id) await window.BTT_API.updateAddress(existing.id,payload);
        else await window.BTT_API.createAddress(payload);
        await refresh();
        toast(t("toast.addrSaved"));
      }catch(err){ toast(t("auth.err.generic")); }
    };
    m.classList.add("on"); document.documentElement.style.overflow="hidden";
  }
  function wireAddresses(){
    document.querySelectorAll("[data-addr-add]").forEach(b=>{
      if(b.dataset.wired) return; b.dataset.wired="1";
      b.addEventListener("click",()=>openAddrModal(null));
    });
    document.querySelectorAll(".addr[data-addr-id] [data-addr-edit]").forEach(a=>{
      if(a.dataset.wired) return; a.dataset.wired="1";
      a.addEventListener("click",e=>{
        e.preventDefault();
        const card=a.closest("[data-addr-id]");
        const id=Number(card.getAttribute("data-addr-id"));
        const grid=document.querySelector(".addr-grid");
        const found=(grid&&grid.__addresses||[]).find(x=>x.id===id);
        openAddrModal(found||{id});
      });
    });
  }

  let favSyncTimer;
  function pushFavs(){
    if(!window.BTT_API || (window.BTT_COOKIES && !window.BTT_COOKIES.hasConsent())) return;
    clearTimeout(favSyncTimer);
    favSyncTimer=setTimeout(()=>{
      try{ window.BTT_API.putFavorites(Object.keys(getFavs())); }catch(e){}
    }, 400);
  }

  function showAccCookieGate(){
    document.documentElement.classList.add("acc-cookie-wait");
    const acc = document.querySelector(".acc");
    if(acc) acc.style.display = "none";
    let gate = document.querySelector("[data-acc-cookie-gate]");
    if(!gate){
      gate = document.createElement("section");
      gate.className = "acc-cookie-gate";
      gate.setAttribute("data-acc-cookie-gate", "");
      gate.innerHTML =
        '<div class="info-block">' +
        '<h2>' + esc(t("acc.cookie.title")) + "</h2>" +
        '<p>' + esc(t("acc.cookie.sub")) + "</p>" +
        '<button type="button" class="btn btn--copper" data-acc-cookie-accept>' + esc(t("cookie.banner.accept")) + "</button>" +
        "</div>";
      const main = document.querySelector("main");
      if(main) main.appendChild(gate);
      gate.querySelector("[data-acc-cookie-accept]")?.addEventListener("click", ()=>{
        if(window.BTT_COOKIES && window.BTT_COOKIES.accept) window.BTT_COOKIES.accept();
      });
    }
    gate.hidden = false;
  }

  function hideAccCookieGate(){
    document.documentElement.classList.remove("acc-cookie-wait");
    const gate = document.querySelector("[data-acc-cookie-gate]");
    if(gate) gate.hidden = true;
    const acc = document.querySelector(".acc");
    if(acc) acc.style.display = "";
  }

  async function hydrateAccount(){
    if(!window.BTT_API){ document.documentElement.classList.remove("acc-loading"); window.location.replace("login.html"); return; }
    let me;
    try{ me=await window.BTT_API.me(); }
    catch(e){
      document.documentElement.classList.remove("acc-loading");
      if(window.BTT_COOKIES && window.BTT_COOKIES.isRequiredError(e)){
        showAccCookieGate();
        window.BTT_COOKIES.showBanner();
        return;
      }
      window.location.replace("login.html");
      return;
    }
    if(!me || !me.user){ document.documentElement.classList.remove("acc-loading"); window.location.replace("login.html"); return; }
    const u=me.user;

    // Header / sidebar identity
    const nmeEl=document.querySelector("[data-acc-user-name]") || document.querySelector(".acc-user .nm");
    if(nmeEl) nmeEl.textContent=u.name || u.email || "—";
    const ava=document.querySelector(".acc-ava");
    if(ava){ const initials=(u.name||u.email||"?").trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase(); ava.textContent=initials||"?"; }
    const subEl=document.querySelector("[data-acc-user-sub]");
    if(subEl){
      const sub=u.phone||u.email||"";
      if(sub){ subEl.textContent=sub; subEl.hidden=false; }
      else subEl.hidden=true;
    }
    const hiName=document.querySelector('[data-acc-panel="overview"] .acc-h h1');
    if(hiName && u.name){ hiName.innerHTML='<span data-i18n="acc.ov.hi">'+esc(t("acc.ov.hi"))+'</span>, '+esc(u.name.split(/\s+/)[0])+' 👋'; }

    // Settings form
    const form=document.querySelector("[data-acc-form]");
    if(form){
      const inp=form.querySelectorAll("input");
      if(inp[0]) inp[0].value=u.name||"";
      if(inp[1]){ inp[1].value=u.email||""; inp[1].readOnly=true; }
      if(inp[2]) inp[2].value=u.phone||"";
    }
    const news=document.querySelector("[data-news-toggle]");
    const newsLabel=document.querySelector("[data-news-label]");
    if(news){
      const on=u.newsletter?true:false;
      news.setAttribute("aria-checked", on?"true":"false");
      if(newsLabel){ newsLabel.setAttribute("data-i18n", on?"acc.set.newson":"acc.set.newsoff"); newsLabel.textContent=t(on?"acc.set.newson":"acc.set.newsoff"); }
      localStorage.setItem("btt_news", on?"1":"0");
    }

    try{
      const ck=JSON.parse(localStorage.getItem("btt_checkout")||"{}")||{};
      let ch=false;
      if(u.name && !ck.name){ ck.name=u.name; ch=true; }
      if(u.phone && !ck.phone){ ck.phone=u.phone; ch=true; }
      if(ch) localStorage.setItem("btt_checkout", JSON.stringify(ck));
    }catch(e){}

    // Merge favourites (server ∪ local), then reflect both ways.
    try{
      const favRes=await window.BTT_API.getFavorites();
      const serverIds=favRes.favorites||[];
      if(serverIds.length){
        const local=getFavs(); let changed=false;
        serverIds.forEach(id=>{ if(!local[id]){ const p=(window.BTT_PRODUCTS||{})[id]; const d=(window.BTT_I18N&&window.BTT_I18N[lang()])||{}; const imgs=window.BTT_PRODUCT_IMG?window.BTT_PRODUCT_IMG(id):null; local[id]={name:(d[id+".name"]||id),price:p?p.now:0,img:(imgs&&imgs[0])?imgs[0].thumb:""}; changed=true; } });
        if(changed){ if(window.BTT_CART&&window.BTT_CART.setFavs) window.BTT_CART.setFavs(local); else localStorage.setItem("btt_favs",JSON.stringify(local)); renderWishlist(); syncStats(); }
      }
      pushFavs();
    }catch(e){}

    // Orders + addresses
    try{ const or=await window.BTT_API.myOrders(); renderOrders(or.orders||[]); }catch(e){ renderOrders([]); }
    try{ const ar=await window.BTT_API.listAddresses(); renderAddresses(ar.addresses||[]); }catch(e){ renderAddresses([]); }
    document.documentElement.classList.remove("acc-loading");
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
      panels.forEach(p=>{
        const on = p.dataset.accPanel === name;
        p.classList.toggle("is-active", on);
        if(on && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)){
          p.classList.remove("acc-panel--in");
          void p.offsetWidth;
          p.classList.add("acc-panel--in");
        }
      });
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
    if(logout) logout.addEventListener("click", async ()=>{
      try{ if(window.BTT_API) await window.BTT_API.logout(); }catch(e){}
      window.location.href = "index.html";
    });

    const form = document.querySelector("[data-acc-form]");
    if(form){
      form.addEventListener("submit", async (e)=>{
        e.preventDefault();
        const ok = form.querySelector("[data-form-ok]");
        const inputs = form.querySelectorAll("input");
        const news = document.querySelector("[data-news-toggle]");
        const payload = {
          name: (inputs[0] && inputs[0].value.trim()) || "",
          phone: (inputs[2] && inputs[2].value.trim()) || "",
          newsletter: news ? (news.getAttribute("aria-checked")==="true") : true,
        };
        if(window.BTT_API){
          try{
            await window.BTT_API.updateProfile(payload);
            const nmeEl=document.querySelector("[data-acc-user-name]") || document.querySelector(".acc-user .nm");
            if(nmeEl && payload.name) nmeEl.textContent=payload.name;
            const subEl=document.querySelector("[data-acc-user-sub]");
            if(subEl && payload.phone){ subEl.textContent=payload.phone; subEl.hidden=false; }
            toast(t("toast.saved"));
          }catch(err){
            if(window.BTT_COOKIES && window.BTT_COOKIES.isRequiredError(err)){
              window.BTT_COOKIES.showBanner();
              toast(t("cookie.required"));
              return;
            }
            toast(t("auth.err.generic"));
            return;
          }
        }
        if(ok){ ok.classList.add("show"); setTimeout(()=>ok.classList.remove("show"), 2600); }
      });
    }

    const hash = (location.hash||"").replace("#","");
    if(hash && Array.from(tabs).some(t=>t.dataset.accTab===hash)) show(hash);
    else if(mobLabel) mobLabel.textContent=tabLabel("overview");

    // Repeat-order / expand / addresses wired in renderOrders() and wireAddresses().

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

    renderWishlist();
    syncStats();
    wireAddresses();
    hydrateAccount();

    document.addEventListener("btt:cookies-accepted", ()=>{
      hideAccCookieGate();
      document.documentElement.classList.add("acc-loading");
      hydrateAccount();
    });

    document.addEventListener("btt:favs-change", ()=>{ renderWishlist(); syncStats(); pushFavs(); });
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
