/* ============================================================
   BENTENTRADE — cart + favorites (site-wide, persistent)
   Self-injecting slide-in drawers. State lives in localStorage:
     btt_cart  → { id: {name, price, img, qty} }
     btt_favs  → { id: {name, price, img} }
   Owns every [data-add] / [data-fav] and the header cart/heart icons.
   (site.js no longer binds those.)
   ============================================================ */
(function(){
  "use strict";

  /* ---------- manager contact (edit these) ----------
     telegram : username after t.me/  (no @)
     whatsapp : full number, digits only (country code first)        */
  const CONFIG = { telegram: "bententrade", whatsapp: "998712001846", currency: "$" };

  /* ---------- i18n helper ---------- */
  function lang(){ const s=localStorage.getItem("btt_lang"); return ["ru","uz","en"].includes(s)?s:"ru"; }
  const STR = {
    ru:{cart:"Корзина",empty:"Корзина пуста",emptyHint:"Добавьте мебель из каталога — она появится здесь.",
        toCat:"Перейти в каталог",total:"Итого",checkout:"Оформить заказ",pcs:"шт.",
        done:"Заказ оформлен! Менеджер свяжется с вами.",remove:"Убрать",
        fav:"Избранное",favEmpty:"В избранном пусто",favHint:"Нажмите на сердечко у товара, чтобы сохранить его.",
        addCart:"В корзину",
        ordTitle:"Подтверждение заказа",ordSub:"Отправьте заказ менеджеру — он подтвердит наличие, доставку и оплату.",
        ordTg:"Оформить в Telegram",ordWa:"Оформить в WhatsApp",ordBack:"Вернуться в корзину",
        ordCopied:"Заказ скопирован — вставьте его в чат с менеджером.",
        ordHead:"Заказ с сайта Bententrade",ordNote:"Заполню контакты и адрес в чате.",
        coName:"Имя",coNamePh:"Ваше имя",coPhone:"Телефон",coPhonePh:"+998 __ ___ __ __",
        coMethod:"Способ получения",coDelivery:"Доставка",coPickup:"Самовывоз",
        coAddress:"Адрес доставки",coAddressPh:"Город, улица, дом, квартира",
        coComment:"Комментарий",coCommentPh:"Пожелания к заказу (необязательно)",
        coSubmit:"Оформить заказ",coSending:"Оформляем…",coMsgOpt:"Или отправьте заказ менеджеру:",
        errName:"Укажите имя",errPhone:"Укажите корректный телефон",errAddress:"Укажите адрес доставки",
        errOrder:"Не удалось оформить заказ. Попробуйте ещё раз или напишите нам.",
        close:"Закрыть",less:"Меньше",more:"Больше"},
    uz:{cart:"Savat",empty:"Savat bo‘sh",emptyHint:"Katalogdan mebel qo‘shing — u shu yerda paydo bo‘ladi.",
        toCat:"Katalogga o‘tish",total:"Jami",checkout:"Buyurtma berish",pcs:"dona",
        done:"Buyurtma qabul qilindi! Menejer bog‘lanadi.",remove:"Olib tashlash",
        fav:"Sevimlilar",favEmpty:"Sevimlilar bo‘sh",favHint:"Saqlash uchun mahsulotdagi yurakchani bosing.",
        addCart:"Savatga",
        ordTitle:"Buyurtma tasdiqlash",ordSub:"Buyurtmani menejerga yuboring — mavjudligi, yetkazish va to‘lovni tasdiqlaydi.",
        ordTg:"Telegramda rasmiylashtirish",ordWa:"WhatsAppda rasmiylashtirish",ordBack:"Savatga qaytish",
        ordCopied:"Buyurtma nusxalandi — menejer chatiga joylang.",
        ordHead:"Bententrade saytidan buyurtma",ordNote:"Kontakt va manzilni chatda to‘ldiraman.",
        coName:"Ism",coNamePh:"Ismingiz",coPhone:"Telefon",coPhonePh:"+998 __ ___ __ __",
        coMethod:"Olish usuli",coDelivery:"Yetkazib berish",coPickup:"Olib ketish",
        coAddress:"Yetkazish manzili",coAddressPh:"Shahar, ko‘cha, uy, xonadon",
        coComment:"Izoh",coCommentPh:"Buyurtmaga istaklar (ixtiyoriy)",
        coSubmit:"Buyurtma berish",coSending:"Rasmiylashtirilmoqda…",coMsgOpt:"Yoki buyurtmani menejerga yuboring:",
        errName:"Ismni kiriting",errPhone:"To‘g‘ri telefon kiriting",errAddress:"Yetkazish manzilini kiriting",
        errOrder:"Buyurtma berilmadi. Qayta urinib ko‘ring yoki bizga yozing.",
        close:"Yopish",less:"Kamroq",more:"Ko‘proq"},
    en:{cart:"Cart",empty:"Your cart is empty",emptyHint:"Add furniture from the catalog — it will show up here.",
        toCat:"Go to catalog",total:"Total",checkout:"Checkout",pcs:"pcs",
        done:"Order placed! Our manager will be in touch.",remove:"Remove",
        fav:"Wishlist",favEmpty:"No saved items yet",favHint:"Tap the heart on a product to save it.",
        addCart:"Add to cart",
        ordTitle:"Confirm your order",ordSub:"Send the order to our manager — they'll confirm stock, delivery and payment.",
        ordTg:"Order via Telegram",ordWa:"Order via WhatsApp",ordBack:"Back to cart",
        ordCopied:"Order copied — paste it into the chat with our manager.",
        ordHead:"Order from the Bententrade website",ordNote:"I'll add my contacts and address in the chat.",
        coName:"Name",coNamePh:"Your name",coPhone:"Phone",coPhonePh:"+998 __ ___ __ __",
        coMethod:"Fulfilment",coDelivery:"Delivery",coPickup:"Pickup",
        coAddress:"Delivery address",coAddressPh:"City, street, house, apartment",
        coComment:"Comment",coCommentPh:"Notes for your order (optional)",
        coSubmit:"Place order",coSending:"Placing…",coMsgOpt:"Or send the order to our manager:",
        errName:"Enter your name",errPhone:"Enter a valid phone",errAddress:"Enter a delivery address",
        errOrder:"Couldn't place the order. Try again or message us.",
        close:"Close",less:"Less",more:"More"}
  };
  function t(k){ return (STR[lang()]||STR.ru)[k]; }

  /* ---------- storage ---------- */
  function read(key){ try{ const v=JSON.parse(localStorage.getItem(key)); return (v&&typeof v==="object"&&!Array.isArray(v))?v:{}; }catch(e){ return {}; } }
  function write(key,obj){ localStorage.setItem(key, JSON.stringify(obj)); }
  const getCart = ()=>read("btt_cart");
  const getFavs = ()=>read("btt_favs");
  const cartCount = ()=>{ const c=getCart(); return Object.values(c).reduce((n,it)=>n+(it.qty||1),0); };
  const favCount  = ()=>Object.keys(getFavs()).length;
  let _favSyncT=null;
  function onFavsChange(){
    document.dispatchEvent(new CustomEvent("btt:favs-change"));
    // Best-effort server sync on every toggle (site-wide, not just the account
    // page). Anonymous users get a 401 which we simply ignore.
    if(window.BTT_API && window.BTT_API.putFavorites){
      clearTimeout(_favSyncT);
      _favSyncT=setTimeout(()=>{
        try{ Promise.resolve(window.BTT_API.putFavorites(Object.keys(getFavs()))).catch(()=>{}); }catch(e){}
      }, 500);
    }
  }

  /* ---------- derive a product snapshot from DOM / PDP ---------- */
  function snapFromCard(card){
    if(!card) return null;
    const see = card.querySelector(".see, a[href*='product.html']");
    let id = null;
    if(see){ const m=(see.getAttribute("href")||"").match(/id=(p\d+)/); if(m) id=m[1]; }
    const name = (card.querySelector(".product__name")||{}).textContent || "";
    const priceEl = card.querySelector(".price__now");
    const price = priceEl ? parseInt((priceEl.textContent||"").replace(/[^\d]/g,""),10)||0 : 0;
    const img = (card.querySelector("img")||{}).currentSrc || (card.querySelector("img")||{}).src || "";
    if(!id) id = "x-"+name.slice(0,18).replace(/\s+/g,"-").toLowerCase();
    return { id, name:name.trim(), price, img };
  }
  function snapFromPDP(){
    const id = (new URLSearchParams(location.search).get("id"))||"p1";
    const name = (document.querySelector(".pdp-info h1")||{}).textContent || "";
    const price = parseInt(((document.querySelector(".pdp-price .now")||{}).textContent||"").replace(/[^\d]/g,""),10)||0;
    const onImg = document.querySelector(".pdp-stage img.is-on") || document.querySelector(".pdp-stage img");
    const img = onImg ? (onImg.currentSrc||onImg.src) : "";
    return { id, name:name.trim(), price, img };
  }
  // resolve the snapshot for a clicked [data-add]/[data-fav]
  function resolveSnap(btn){
    const card = btn.closest("[data-product], .product");
    if(card){ const s=snapFromCard(card); if(s&&s.name) return s; }
    if(document.querySelector(".pdp-info")) return snapFromPDP();
    return snapFromCard(card);
  }

  /* ---------- mutations ---------- */
  function addToCart(snap, qty){
    if(!snap||!snap.id) return;
    const c=getCart();
    const ex=c[snap.id];
    c[snap.id]={ name:snap.name, price:snap.price, img:snap.img, qty:(ex?ex.qty:0)+(qty||1) };
    write("btt_cart",c); renderBadges(); renderCartBody(); openCart();
  }
  function setQty(id,qty){
    const c=getCart(); if(!c[id]) return;
    if(qty<=0) delete c[id]; else c[id].qty=qty;
    write("btt_cart",c); renderBadges(); renderCartBody();
  }
  function toggleFav(snap,btn){
    if(!snap||!snap.id) return false;
    const f=getFavs(); let on;
    if(f[snap.id]){ delete f[snap.id]; on=false; }
    else { f[snap.id]={ name:snap.name, price:snap.price, img:snap.img }; on=true; }
    write("btt_favs",f); renderBadges(); renderFavBody(); syncFavButtons(); onFavsChange();
    return on;
  }
  // Replace the whole favourites map (used by the account page after a server merge).
  function setFavs(map){
    write("btt_favs", (map&&typeof map==="object"&&!Array.isArray(map))?map:{});
    renderBadges(); renderFavBody(); syncFavButtons(); onFavsChange();
  }

  /* ---------- badges + button state ---------- */
  function renderBadges(){
    const cc=cartCount();
    document.querySelectorAll("[data-cart-count]").forEach(el=>{ el.textContent=cc; el.style.display=cc>0?"grid":"none"; });
    const fc=favCount();
    document.querySelectorAll("[data-fav-count]").forEach(el=>{ el.textContent=fc; el.style.display=fc>0?"grid":"none"; });
  }
  // reflect saved favorites onto product/PDP heart buttons
  function syncFavButtons(){
    const f=getFavs();
    document.querySelectorAll("[data-fav]").forEach(btn=>{
      if(btn.closest(".acc-side")||btn.hasAttribute("data-fav-open")) return; // header opener handled separately
      const snap=resolveSnap(btn);
      if(snap&&snap.id) btn.classList.toggle("is-on", !!f[snap.id]);
    });
  }

  /* ---------- drawer shell ---------- */
  let scrim, cartEl, favEl;
  function buildShell(){
    scrim=document.createElement("div"); scrim.className="drawer-scrim"; scrim.addEventListener("click",closeAll);
    cartEl=document.createElement("aside"); cartEl.className="drawer drawer--cart"; cartEl.setAttribute("aria-hidden","true");
    favEl=document.createElement("aside"); favEl.className="drawer drawer--fav"; favEl.setAttribute("aria-hidden","true");
    document.body.appendChild(scrim); document.body.appendChild(cartEl); document.body.appendChild(favEl);
  }
  function esc(s){ return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

  function renderCartBody(){
    if(!cartEl) return;
    const c=getCart(); const ids=Object.keys(c);
    let body;
    if(!ids.length){
      body='<div class="drawer-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>'+
        '<div class="t">'+esc(t("empty"))+'</div><div class="d">'+esc(t("emptyHint"))+'</div>'+
        '<a class="btn btn--dark" href="catalog.html">'+esc(t("toCat"))+'</a></div>';
    } else {
      let total=0;
      const rows=ids.map(id=>{
        const it=c[id]; const sum=(it.price||0)*(it.qty||1); total+=sum;
        return '<div class="dl-item">'+
          '<div class="dl-thumb">'+(it.img?'<img src="'+esc(it.img)+'" alt="" onerror="this.style.display=\'none\'">':'')+'</div>'+
          '<div class="dl-main"><div class="dl-name">'+esc(it.name)+'</div>'+
            '<div class="dl-price">$'+(it.price||0)+'</div>'+
            '<div class="dl-qty" data-dl-qty="'+esc(id)+'">'+
              '<button data-dl-dec aria-label="'+esc(t("less"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg></button>'+
              '<span>'+(it.qty||1)+'</span>'+
              '<button data-dl-inc aria-label="'+esc(t("more"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button>'+
            '</div></div>'+
          '<button class="dl-del" data-dl-del="'+esc(id)+'" aria-label="'+esc(t("remove"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg></button>'+
        '</div>';
      }).join("");
      body='<div class="drawer-list">'+rows+'</div>'+
        '<div class="drawer-foot"><div class="drawer-total"><span>'+esc(t("total"))+'</span><b>$'+total+'</b></div>'+
        '<button class="btn btn--dark" data-cart-checkout>'+esc(t("checkout"))+'</button></div>';
    }
    cartEl.innerHTML=
      '<div class="drawer-head"><h3>'+esc(t("cart"))+'</h3>'+
      '<button class="drawer-x" data-drawer-close aria-label="'+esc(t("close"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'+body;
    wireDrawer(cartEl);
  }

  function renderFavBody(){
    if(!favEl) return;
    const f=getFavs(); const ids=Object.keys(f);
    let body;
    if(!ids.length){
      body='<div class="drawer-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20Z"/></svg>'+
        '<div class="t">'+esc(t("favEmpty"))+'</div><div class="d">'+esc(t("favHint"))+'</div>'+
        '<a class="btn btn--dark" href="catalog.html">'+esc(t("toCat"))+'</a></div>';
    } else {
      const rows=ids.map(id=>{
        const it=f[id]; const href=/^p\d+$/.test(id)?("product.html?id="+id):"catalog.html";
        return '<div class="dl-item">'+
          '<a class="dl-thumb" href="'+href+'">'+(it.img?'<img src="'+esc(it.img)+'" alt="" onerror="this.style.display=\'none\'">':'')+'</a>'+
          '<div class="dl-main"><a class="dl-name" href="'+href+'">'+esc(it.name)+'</a>'+
            '<div class="dl-price">$'+(it.price||0)+'</div>'+
            '<button class="btn btn--ghost btn--sm" data-fav-add="'+esc(id)+'">'+esc(t("addCart"))+'</button>'+
          '</div>'+
          '<button class="dl-del" data-fav-del="'+esc(id)+'" aria-label="'+esc(t("remove"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg></button>'+
        '</div>';
      }).join("");
      body='<div class="drawer-list">'+rows+'</div>';
    }
    favEl.innerHTML=
      '<div class="drawer-head"><h3>'+esc(t("fav"))+'</h3>'+
      '<button class="drawer-x" data-drawer-close aria-label="'+esc(t("close"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'+body;
    wireDrawer(favEl);
  }

  function wireDrawer(root){
    root.querySelectorAll("[data-drawer-close]").forEach(b=>b.addEventListener("click",closeAll));
    root.querySelectorAll("[data-dl-qty]").forEach(q=>{
      const id=q.getAttribute("data-dl-qty"); const cur=()=>(getCart()[id]||{}).qty||0;
      q.querySelector("[data-dl-dec]").addEventListener("click",()=>setQty(id,cur()-1));
      q.querySelector("[data-dl-inc]").addEventListener("click",()=>setQty(id,cur()+1));
    });
    root.querySelectorAll("[data-dl-del]").forEach(b=>b.addEventListener("click",()=>setQty(b.getAttribute("data-dl-del"),0)));
    const co=root.querySelector("[data-cart-checkout]");
    if(co) co.addEventListener("click", renderCheckout);
    root.querySelectorAll("[data-cart-back]").forEach(b=>b.addEventListener("click", renderCartBody));
    const tg=root.querySelector("[data-order-tg]");
    if(tg) tg.addEventListener("click", ()=>openMsg("tg"));
    const wa=root.querySelector("[data-order-wa]");
    if(wa) wa.addEventListener("click", ()=>openMsg("wa"));
    const form=root.querySelector("[data-co-form]");
    if(form){
      form.addEventListener("submit",e=>{ e.preventDefault(); submitOrder(root); });
      const addr=root.querySelector("[data-co-addr]");
      root.querySelectorAll("[name=method]").forEach(r=>r.addEventListener("change",()=>{
        if(addr) addr.hidden = (root.querySelector("[name=method]:checked")||{}).value==="pickup";
      }));
    }
    const submit=root.querySelector("[data-co-submit]");
    if(submit) submit.addEventListener("click",()=>submitOrder(root));
    root.querySelectorAll("[data-fav-del]").forEach(b=>b.addEventListener("click",()=>{
      const f=getFavs(); delete f[b.getAttribute("data-fav-del")]; write("btt_favs",f); renderBadges(); renderFavBody(); syncFavButtons(); onFavsChange();
    }));
    root.querySelectorAll("[data-fav-add]").forEach(b=>b.addEventListener("click",()=>{
      const id=b.getAttribute("data-fav-add"); const it=getFavs()[id];
      if(it) addToCart({id,name:it.name,price:it.price,img:it.img},1);
    }));
  }

  /* ---------- checkout ---------- */
  // Remembered contact details so the form survives re-renders / language switches.
  const getCheckout = ()=>read("btt_checkout");
  function saveCheckout(v){ write("btt_checkout", v); }

  // Human-readable order text for the optional messenger hand-off.
  function buildOrderText(contact, orderId){
    const c=getCart(); const ids=Object.keys(c); let total=0;
    const lines=ids.map((id,i)=>{ const it=c[id]; const sum=(it.price||0)*(it.qty||1); total+=sum;
      return (i+1)+". "+it.name+" × "+(it.qty||1)+" — "+CONFIG.currency+sum; });
    let out=t("ordHead")+"\n\n"+lines.join("\n")+"\n\n"+t("total")+": "+CONFIG.currency+total;
    if(orderId) out+="\n"+t("ordTitle")+": № "+orderId;
    if(contact){
      out+="\n\n"+t("coName")+": "+(contact.name||"—");
      out+="\n"+t("coPhone")+": "+(contact.phone||"—");
      out+="\n"+t("coMethod")+": "+(contact.method==="pickup"?t("coPickup"):t("coDelivery"));
      if(contact.method!=="pickup"&&contact.address) out+="\n"+t("coAddress")+": "+contact.address;
      if(contact.comment) out+="\n"+t("coComment")+": "+contact.comment;
    }
    return out;
  }
  function copyText(txt){
    try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt); return; } }catch(e){}
    try{ const ta=document.createElement("textarea"); ta.value=txt; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }catch(e){}
  }
  let toastEl=null, toastT=null;
  function toast(msg){
    if(!toastEl){ toastEl=document.createElement("div"); toastEl.className="btt-toast"; document.body.appendChild(toastEl); }
    toastEl.textContent=msg; toastEl.classList.add("on");
    clearTimeout(toastT); toastT=setTimeout(()=>toastEl.classList.remove("on"), 3800);
  }
  function cartItemsPayload(){
    const c=getCart();
    return Object.keys(c).map(id=>{
      const it=c[id];
      return {
        id: /^p\d+$/.test(id) ? id : undefined,
        name: it.name,
        qty: it.qty||1,
        price: it.price||0,
        options: it.options || undefined,
      };
    });
  }
  async function persistOrder(contact){
    if(!window.BTT_API) return null;
    try{
      const res = await window.BTT_API.createOrder({
        items: cartItemsPayload(),
        lang: (document.documentElement.lang||"ru"),
        currency: CONFIG.currency,
        name: contact && contact.name,
        phone: contact && contact.phone,
        delivery: contact && contact.method,
        address: contact && (contact.method==="pickup" ? "" : contact.address),
        comment: contact && contact.comment,
      });
      return (res && res.orderId) || null;
    }catch(e){ return null; }
  }

  // Keep the last placed order around so the confirmation screen's messenger
  // buttons can reuse its text after the cart has been cleared.
  let _lastOrderText="";
  function openMsg(kind){
    const txt=_lastOrderText || t("ordHead");
    if(kind==="tg"){
      copyText(txt);
      window.open("https://t.me/"+CONFIG.telegram, "_blank", "noopener");
      toast(t("ordCopied"));
    } else {
      window.open("https://wa.me/"+CONFIG.whatsapp+"?text="+encodeURIComponent(txt), "_blank", "noopener");
    }
  }

  function readForm(root){
    const q=(s)=>root.querySelector(s);
    const method=(root.querySelector("[name=method]:checked")||{}).value||"delivery";
    return {
      name:((q("[name=name]")||{}).value||"").trim(),
      phone:((q("[name=phone]")||{}).value||"").trim(),
      method:method,
      address:((q("[name=address]")||{}).value||"").trim(),
      comment:((q("[name=comment]")||{}).value||"").trim(),
    };
  }
  function showErr(root,msg){
    const el=root.querySelector("[data-co-err]");
    if(el){ el.textContent=msg; el.hidden=!msg; }
  }
  async function submitOrder(root){
    const f=readForm(root);
    if(!f.name){ showErr(root,t("errName")); return; }
    if(f.phone.replace(/\D/g,"").length<7){ showErr(root,t("errPhone")); return; }
    if(f.method!=="pickup" && !f.address){ showErr(root,t("errAddress")); return; }
    showErr(root,"");
    saveCheckout(f);
    const btn=root.querySelector("[data-co-submit]");
    if(btn){ btn.disabled=true; btn.textContent=t("coSending"); }
    let orderId=null;
    if(window.BTT_API){
      orderId=await persistOrder(f);
      if(!orderId){ showErr(root,t("errOrder")); if(btn){ btn.disabled=false; btn.textContent=t("coSubmit"); } return; }
    }
    _lastOrderText=buildOrderText(f, orderId);
    write("btt_cart",{}); renderBadges(); renderDone(orderId);
  }

  function renderDone(orderId){
    if(!cartEl) return;
    const num = orderId ? '<div class="t" style="opacity:.7;font-size:14px;margin-top:-6px">№ '+esc(orderId)+'</div>' : '';
    const tgIco='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 2.9 11.6c-1 .4-1 1.8 0 2.1l4.7 1.5 1.8 5.6c.3.8 1.3 1 1.9.4l2.6-2.5 4.7 3.5c.7.5 1.7.1 1.9-.7L23 5.5c.2-1-.8-1.8-1.7-1.2Z"/></svg>';
    const waIco='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.6 4.7-1.2A10 10 0 1 0 12 2Zm5.3 13.9c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7s-3.9-3.3-4-3.5c-.1-.2-1-1.3-1-2.5s.6-1.8.9-2.1c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.4l.8 2c.1.2.1.3 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2 1.2.9 1.8.9 2.1.8.2-.1.5-.5.7-.8.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.4.3.1.2.1.6 0 1.2Z"/></svg>';
    cartEl.innerHTML='<div class="drawer-head"><h3>'+esc(t("cart"))+'</h3><button class="drawer-x" data-drawer-close aria-label="'+esc(t("close"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'+
      '<div class="drawer-empty"><svg viewBox="0 0 24 24" fill="none" stroke="#3c8a4e" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg><div class="t">'+esc(t("done"))+'</div>'+num+
      '<p class="drawer-co__sub" style="margin:14px 0 10px">'+esc(t("coMsgOpt"))+'</p>'+
      '<div class="co-msg-row">'+
        '<button class="btn co-msg co-tg" data-order-tg>'+tgIco+'<span>'+esc(t("ordTg"))+'</span></button>'+
        '<button class="btn co-msg co-wa" data-order-wa>'+waIco+'<span>'+esc(t("ordWa"))+'</span></button>'+
      '</div>'+
      '<a class="btn btn--dark" href="catalog.html" style="margin-top:12px">'+esc(t("toCat"))+'</a></div>';
    wireDrawer(cartEl);
  }

  function renderCheckout(){
    if(!cartEl) return;
    const c=getCart(); const ids=Object.keys(c);
    if(!ids.length){ renderCartBody(); return; }
    let total=0;
    const rows=ids.map(id=>{ const it=c[id]; const sum=(it.price||0)*(it.qty||1); total+=sum;
      return '<div class="ord-line"><span>'+esc(it.name)+' <i>×'+(it.qty||1)+'</i></span><b>'+CONFIG.currency+sum+'</b></div>'; }).join("");
    const saved=getCheckout();
    const pickup=saved.method==="pickup";
    const val=(k)=>esc(saved[k]||"");
    cartEl.innerHTML=
      '<div class="drawer-head"><button class="drawer-back" data-cart-back aria-label="'+esc(t("ordBack"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button><h3>'+esc(t("ordTitle"))+'</h3>'+
      '<button class="drawer-x" data-drawer-close aria-label="'+esc(t("close"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'+
      '<div class="drawer-co"><p class="drawer-co__sub">'+esc(t("ordSub"))+'</p>'+
        '<div class="ord-list">'+rows+'</div>'+
        '<div class="ord-total"><span>'+esc(t("total"))+'</span><b>'+CONFIG.currency+total+'</b></div>'+
        '<form class="co-form" data-co-form novalidate>'+
          '<div class="co-field"><label>'+esc(t("coName"))+'</label><input name="name" type="text" autocomplete="name" value="'+val("name")+'" placeholder="'+esc(t("coNamePh"))+'"></div>'+
          '<div class="co-field"><label>'+esc(t("coPhone"))+'</label><input name="phone" type="tel" autocomplete="tel" value="'+val("phone")+'" placeholder="'+esc(t("coPhonePh"))+'"></div>'+
          '<div class="co-field"><label>'+esc(t("coMethod"))+'</label>'+
            '<div class="co-method" data-co-method>'+
              '<label class="co-radio"><input type="radio" name="method" value="delivery"'+(pickup?"":" checked")+'><span>'+esc(t("coDelivery"))+'</span></label>'+
              '<label class="co-radio"><input type="radio" name="method" value="pickup"'+(pickup?" checked":"")+'><span>'+esc(t("coPickup"))+'</span></label>'+
            '</div>'+
          '</div>'+
          '<div class="co-field" data-co-addr'+(pickup?' hidden':'')+'><label>'+esc(t("coAddress"))+'</label><input name="address" type="text" autocomplete="street-address" value="'+val("address")+'" placeholder="'+esc(t("coAddressPh"))+'"></div>'+
          '<div class="co-field"><label>'+esc(t("coComment"))+'</label><textarea name="comment" rows="2" placeholder="'+esc(t("coCommentPh"))+'">'+val("comment")+'</textarea></div>'+
          '<p class="co-err" data-co-err hidden></p>'+
        '</form>'+
      '</div>'+
      '<div class="drawer-foot drawer-co__foot">'+
        '<button class="btn btn--dark co-submit" data-co-submit>'+esc(t("coSubmit"))+'</button>'+
        '<button class="co-back" data-cart-back>'+esc(t("ordBack"))+'</button></div>';
    wireDrawer(cartEl);
  }

  /* ---------- open / close ---------- */
  function openCart(){ if(!cartEl) return; renderCartBody(); scrim.classList.add("on"); cartEl.classList.add("on"); cartEl.setAttribute("aria-hidden","false"); document.documentElement.style.overflow="hidden"; }
  function openFav(){ if(!favEl) return; renderFavBody(); scrim.classList.add("on"); favEl.classList.add("on"); favEl.setAttribute("aria-hidden","false"); document.documentElement.style.overflow="hidden"; }
  function closeAll(){ if(!scrim) return; scrim.classList.remove("on"); cartEl.classList.remove("on"); favEl.classList.remove("on"); cartEl.setAttribute("aria-hidden","true"); favEl.setAttribute("aria-hidden","true"); document.documentElement.style.overflow=""; }

  function wireProductButtons(root){
    const scope = root || document;
    scope.querySelectorAll("[data-add]").forEach(btn=>{
      if(btn.dataset.cartWired) return;
      btn.dataset.cartWired = "1";
      btn.addEventListener("click",e=>{
        e.preventDefault();
        let qty=1;
        const qtyInput=document.querySelector("[data-qty] input");
        if(document.querySelector(".pdp-info") && qtyInput) qty=Math.max(1,parseInt(qtyInput.value,10)||1);
        addToCart(resolveSnap(btn),qty);
        btn.classList.add("added"); setTimeout(()=>btn.classList.remove("added"),500);
      });
    });
    scope.querySelectorAll("[data-fav]").forEach(btn=>{
      if(btn.hasAttribute("data-fav-open") || btn.dataset.cartWired) return;
      btn.dataset.cartWired = "1";
      btn.addEventListener("click",e=>{
        e.preventDefault();
        const on=toggleFav(resolveSnap(btn),btn);
        btn.classList.toggle("is-on",on);
      });
    });
  }

  /* ---------- wire up ---------- */
  document.addEventListener("DOMContentLoaded",function(){
    buildShell();
    renderCartBody(); renderFavBody(); renderBadges(); syncFavButtons();

    wireProductButtons();
    window.BTT_syncFavs = syncFavButtons;
    document.addEventListener("btt:related-rendered", e=>{
      const grid = e.detail && e.detail.grid;
      if(grid) wireProductButtons(grid);
      syncFavButtons();
    });

    // header cart icon → open cart drawer
    document.querySelectorAll("a[data-i18n-aria='tool.cart'], a[aria-label='cart'], a[aria-label='Корзина']").forEach(a=>{
      a.addEventListener("click",e=>{ e.preventDefault(); openCart(); });
    });
    // header heart (the .opt fav button) → open favorites drawer
    document.querySelectorAll("[data-i18n-aria='tool.fav'], button[aria-label='fav'], button[aria-label='Избранное']").forEach(b=>{
      b.setAttribute("data-fav-open","1");
      b.addEventListener("click",e=>{ e.preventDefault(); openFav(); });
    });

    document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeAll(); });
    // re-localize drawers + re-sync hearts on language change
    new MutationObserver(()=>{ renderCartBody(); renderFavBody(); }).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  });

  window.BTT_CART={ openCart, openFav, addToCart, wireProductButtons, getFavs, setFavs, favCount };
})();
