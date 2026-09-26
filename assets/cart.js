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
  const CONFIG = { telegram: "bententradeuz", whatsapp: "998771044422", currency: "сум" };
  function syncSettings(){
    try{
      const s = JSON.parse(sessionStorage.getItem("btt_settings")||"{}");
      if(s.telegram) CONFIG.telegram = String(s.telegram).replace(/^@/,"");
      if(s.whatsapp) CONFIG.whatsapp = String(s.whatsapp).replace(/[^\d]/g,"");
    }catch(e){}
  }
  syncSettings();
  document.addEventListener("btt:settings", syncSettings);
  const fmt = (n) => (window.BTT_UTIL && window.BTT_UTIL.formatMoney)
    ? window.BTT_UTIL.formatMoney(n, { raw: true })
    : (String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0") + " сум");

  const tgIco='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 2.9 11.6c-1 .4-1 1.8 0 2.1l4.7 1.5 1.8 5.6c.3.8 1.3 1 1.9.4l2.6-2.5 4.7 3.5c.7.5 1.7.1 1.9-.7L23 5.5c.2-1-.8-1.8-1.7-1.2Z"/></svg>';
  const waIco='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.6 4.7-1.2A10 10 0 1 0 12 2Zm5.3 13.9c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7s-3.9-3.3-4-3.5c-.1-.2-1-1.3-1-2.5s.6-1.8.9-2.1c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.4l.8 2c.1.2.1.3 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2 1.2.9 1.8.9 2.1.8.2-.1.5-.5.7-.8.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.4.3.1.2.1.6 0 1.2Z"/></svg>';
  const PROMOS = { "BENTEN2026": 5, "WELCOME": 10, "ROTANG": 7 };
  const getPromo = () => localStorage.getItem("btt_promo") || "";
  const setPromo = (c) => { if(c) localStorage.setItem("btt_promo", c.toUpperCase().trim()); else localStorage.removeItem("btt_promo"); };

  /* ---------- i18n helper ---------- */
  function lang(){ const s=localStorage.getItem("btt_lang"); return ["ru","uz","en"].includes(s)?s:"ru"; }
  const STR = {
    ru:{cart:"Корзина",empty:"Корзина пуста",emptyHint:"Добавьте мебель из каталога — она появится здесь.",
        toCat:"Перейти в каталог",total:"Итого",checkout:"Оформить заказ",pcs:"шт.",
        done:"Заказ оформлен! Менеджер свяжется с вами.",remove:"Убрать",
        fav:"Избранное",favEmpty:"В избранном пусто",favHint:"Нажмите на сердечко у товара, чтобы сохранить его.",
        favAdded:"Добавлено в избранное",favRemoved:"Удалено из избранного",
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
        coPayment:"Способ оплаты",
        payCashPos:"При получении (наличными или терминалом)",
        payClickPayme:"Click / Payme (онлайн по QR или ссылке)",
        payCardInvoice:"Перевод на карту / Счёт юрлица",
        quickBuy:"Купить в 1 клик",
        quickOrderTitle:"Быстрый заказ в 1 клик",
        quickOrderSub:"Оставьте телефон — менеджер свяжется с вами в течение 10 минут для подтверждения.",
        quickOrderBtn:"Подтвердить быстрый заказ",
        quickOrderDone:"Быстрый заказ принят!",
        managerTrustTitle:"Подтверждение и проверка заказа",
        managerTrustDesc:"Менеджер свяжется для согласования удобного времени доставки и подтвердит комплектацию перед отгрузкой",
        promoTag:"Промокод",promoPh:"Промокод (BENTEN2026)",promoApply:"Применить",promoErr:"Неверный промокод",
        quickOrder:"Или быстрый заказ в 1 клик:",discount:"Скидка"},
    uz:{cart:"Savat",empty:"Savat bo‘sh",emptyHint:"Katalogdan mebel qo‘shing — u shu yerda paydo bo‘ladi.",
        toCat:"Katalogga o‘tish",total:"Jami",checkout:"Buyurtma berish",pcs:"dona",
        done:"Buyurtma qabul qilindi! Menejer bog‘lanadi.",remove:"Olib tashlash",
        fav:"Sevimlilar",favEmpty:"Sevimlilar bo‘sh",favHint:"Saqlash uchun mahsulotdagi yurakchani bosing.",
        favAdded:"Tanlanganlarga qo‘shildi",favRemoved:"Tanlanganlardan o‘chirildi",
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
        close:"Yopish",less:"Kamroq",more:"Ko‘proq",
        coPayment:"To‘lov usuli",
        payCashPos:"Qabul qilishda (naqd yoki Humo/Uzcard terminal)",
        payClickPayme:"Click / Payme (QR yoki havola orqali)",
        payCardInvoice:"Karta o‘tkazmasi / Tashkilot hisob raqami",
        quickBuy:"1-klikda xarid",
        quickOrderTitle:"1-klikda tezkor buyurtma",
        quickOrderSub:"Telefoningizni qoldiring — menejer 10 daqiqa ichida bog‘lanadi.",
        quickOrderBtn:"Tezkor buyurtmani tasdiqlash",
        quickOrderDone:"Tezkor buyurtma qabul qilindi!",
        managerTrustTitle:"Buyurtmani tasdiqlash va tekshirish",
        managerTrustDesc:"Menejer yetkazish vaqtini kelishish uchun bog‘lanadi va jo‘natishdan oldin to‘plamni tekshiradi",
        promoTag:"Promokod",promoPh:"Promokod (BENTEN2026)",promoApply:"Qo‘llash",promoErr:"Noto‘g‘ri promokod",
        quickOrder:"Yoki 1 bosishda tezkor buyurtma:",discount:"Chegirma"},
    en:{cart:"Cart",empty:"Your cart is empty",emptyHint:"Add furniture from the catalog — it will show up here.",
        toCat:"Go to catalog",total:"Total",checkout:"Checkout",pcs:"pcs",
        done:"Order placed! Our manager will be in touch.",remove:"Remove",
        fav:"Wishlist",favEmpty:"No saved items yet",favHint:"Tap the heart on a product to save it.",
        favAdded:"Added to wishlist",favRemoved:"Removed from wishlist",
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
        close:"Close",less:"Less",more:"More",
        coPayment:"Payment method",
        payCashPos:"Upon delivery (cash or card terminal)",
        payClickPayme:"Click / Payme (via QR or link)",
        payCardInvoice:"Card transfer / Company invoice",
        quickBuy:"Buy in 1 click",
        quickOrderTitle:"Quick 1-click order",
        quickOrderSub:"Leave your phone — our manager will call you within 10 minutes.",
        quickOrderBtn:"Confirm quick order",
        quickOrderDone:"Quick order received!",
        managerTrustTitle:"Order confirmation & package check",
        managerTrustDesc:"Our manager coordinates delivery timing and verifies the package before dispatch",
        promoTag:"Promo code",promoPh:"Promo code (BENTEN2026)",promoApply:"Apply",promoErr:"Invalid promo code",
        quickOrder:"Or quick 1-click order:",discount:"Discount"}
  };
  function t(k){
    if(window.BTT_I18N && window.BTT_I18N.t){
      const v=window.BTT_I18N.t(k);
      if(v!==k) return v;
    }
    const s=(STR[lang()]||STR.ru)[k];
    return s!=null?s:k;
  }

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
    if(window.BTT_API && window.BTT_API.putFavorites && (!window.BTT_COOKIES || window.BTT_COOKIES.hasConsent())){
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
    if(see){ const m=(see.getAttribute("href")||"").match(/[?&]id=([^&#]+)/); if(m) id=decodeURIComponent(m[1]); }
    const name = (card.querySelector(".product__name")||{}).textContent || "";
    const priceEl = card.querySelector(".price__now");
    const price = priceEl ? parseInt((priceEl.textContent||"").replace(/[^\d]/g,""),10)||0 : 0;
    const img = (card.querySelector("img")||{}).currentSrc || (card.querySelector("img")||{}).src || "";
    if(!id) id = "x-"+name.slice(0,18).replace(/\s+/g,"-").toLowerCase();
    const activeSwatch = card.querySelector(".product-swatch.is-active");
    const options = {};
    if(activeSwatch && activeSwatch.title) options.finish = activeSwatch.title.trim();
    return { id, name:name.trim(), price, img, options: Object.keys(options).length ? options : undefined };
  }
  function snapFromPDP(){
    const id = (new URLSearchParams(location.search).get("id"))||"p1";
    const name = (document.querySelector(".pdp-info h1")||{}).textContent || "";
    const price = parseInt(((document.querySelector(".pdp-price .now")||{}).textContent||"").replace(/[^\d]/g,""),10)||0;
    const onImg = document.querySelector(".pdp-stage img.is-on") || document.querySelector(".pdp-stage img");
    const img = onImg ? (onImg.currentSrc||onImg.src) : "";
    const finishVal = ((document.querySelector("[data-finish-val]")||{}).textContent||"").trim();
    const sizeVal = ((document.querySelector("[data-size-val]")||{}).textContent||"").trim();
    const options = {};
    if(finishVal) options.finish = finishVal;
    if(sizeVal) options.size = sizeVal;
    return { id, name:name.trim(), price, img, options: Object.keys(options).length ? options : undefined };
  }
  // resolve the snapshot for a clicked [data-add]/[data-fav]
  function resolveSnap(btn){
    const card = btn.closest("[data-product], .product");
    if(card){ const s=snapFromCard(card); if(s&&s.name) return s; }
    if(document.querySelector(".pdp-info")) return snapFromPDP();
    return snapFromCard(card);
  }

  function itemKey(snap){
    if(!snap || !snap.id) return "";
    const opt = snap.options;
    if(!opt) return snap.id;
    const parts = [snap.id];
    if(opt.finish) parts.push("f:" + opt.finish);
    if(opt.size) parts.push("s:" + opt.size);
    return parts.join("__");
  }

  /* ---------- mutations ---------- */
  function addToCart(snap, qty){
    if(!snap||!snap.id) return;
    _lastOrderText="";
    const c=getCart();
    const key=itemKey(snap);
    const ex=c[key];
    c[key]={
      id: snap.id,
      name: snap.name,
      price: snap.price,
      img: snap.img,
      options: snap.options || (ex && ex.options) || undefined,
      qty: (ex ? ex.qty : 0) + (qty || 1)
    };
    write("btt_cart",c); renderBadges(); renderCartBody(); openCart();
  }
  function setQty(key,qty){
    _lastOrderText="";
    const c=getCart(); if(!c[key]) return;
    if(qty<=0) delete c[key]; else c[key].qty=qty;
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
    document.querySelectorAll("[data-cart-count]").forEach(el=>{
      const prev = parseInt(el.textContent, 10) || 0;
      if(window.BTT_MOTION && window.BTT_MOTION.animateNumber && el.style.display !== "none"){
        window.BTT_MOTION.animateNumber(el, prev, cc, 300);
      } else {
        el.textContent=cc;
      }
      el.style.display=cc>0?"grid":"none";
      if(cc > prev) bump(el);
    });
    const fc=favCount();
    document.querySelectorAll("[data-fav-count]").forEach(el=>{
      const prev = parseInt(el.textContent, 10) || 0;
      if(window.BTT_MOTION && window.BTT_MOTION.animateNumber && el.style.display !== "none"){
        window.BTT_MOTION.animateNumber(el, prev, fc, 300);
      } else {
        el.textContent=fc;
      }
      el.style.display=fc>0?"grid":"none";
      if(fc > prev) bump(el);
    });
  }
  function bump(el){
    if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.remove("is-bump");
    void el.offsetWidth;
    el.classList.add("is-bump");
    el.addEventListener("animationend", ()=> el.classList.remove("is-bump"), { once:true });
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
  function enableSwipeToDismiss(el, onDismiss){
    if(!el) return;
    let sx = 0, sy = 0, dx = 0, startTime = 0, isDragging = false, isHoriz = null;
    el.addEventListener("touchstart", e => {
      if(e.touches.length !== 1) return;
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
      dx = 0;
      startTime = performance.now();
      isDragging = false;
      isHoriz = null;
    }, { passive: true });

    el.addEventListener("touchmove", e => {
      if(e.touches.length !== 1) return;
      const t = e.touches[0];
      const diffX = t.clientX - sx;
      const diffY = t.clientY - sy;

      if(isHoriz === null){
        if(Math.abs(diffX) > 8 || Math.abs(diffY) > 8){
          isHoriz = Math.abs(diffX) > Math.abs(diffY);
        }
      }
      if(!isHoriz) return;

      if(diffX > 0){
        dx = diffX;
        el.style.transform = "translateX(" + dx + "px)";
        el.style.transition = "none";
        if(scrim) scrim.style.opacity = String(Math.max(0, 1 - dx / el.offsetWidth));
        isDragging = true;
      } else {
        dx = diffX * 0.2;
        el.style.transform = "translateX(" + dx + "px)";
        el.style.transition = "none";
      }
    }, { passive: true });

    el.addEventListener("touchend", () => {
      if(!isDragging){
        el.style.transform = "";
        el.style.transition = "";
        if(scrim) scrim.style.opacity = "";
        return;
      }
      const dt = Math.max(1, performance.now() - startTime);
      const vx = dx / dt;
      el.style.transition = "transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)";
      if(scrim) scrim.style.transition = "opacity 0.32s ease";

      if(dx > el.offsetWidth * 0.28 || (vx > 0.3 && dx > 35)){
        el.style.transform = "translateX(100%)";
        if(scrim) scrim.style.opacity = "0";
        setTimeout(() => {
          el.style.transform = "";
          el.style.transition = "";
          if(scrim){ scrim.style.opacity = ""; scrim.style.transition = ""; }
          onDismiss();
        }, 320);
      } else {
        el.style.transform = "translateX(0)";
        if(scrim) scrim.style.opacity = "1";
        setTimeout(() => {
          el.style.transform = "";
          el.style.transition = "";
          if(scrim){ scrim.style.opacity = ""; scrim.style.transition = ""; }
        }, 320);
      }
      isDragging = false;
      isHoriz = null;
    }, { passive: true });
  }

  function buildShell(){
    scrim=document.createElement("div"); scrim.className="drawer-scrim"; scrim.addEventListener("click",closeAll);
    cartEl=document.createElement("aside"); cartEl.className="drawer drawer--cart"; cartEl.setAttribute("aria-hidden","true");
    favEl=document.createElement("aside"); favEl.className="drawer drawer--fav"; favEl.setAttribute("aria-hidden","true");
    document.body.appendChild(scrim); document.body.appendChild(cartEl); document.body.appendChild(favEl);
    enableSwipeToDismiss(cartEl, closeAll);
    enableSwipeToDismiss(favEl, closeAll);
  }
  function esc(s){
    if(window.BTT_UTIL && window.BTT_UTIL.esc) return window.BTT_UTIL.esc(s);
    return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  }

  function renderCartBody(){
    if(!cartEl) return;
    const prevTotalEl = cartEl.querySelector(".drawer-total b");
    const prevTotal = prevTotalEl ? (parseInt(prevTotalEl.textContent.replace(/[^\d]/g, ""), 10) || 0) : 0;
    const c=getCart(); const ids=Object.keys(c);
    let body;
    if(!ids.length){
      body='<div class="drawer-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>'+
        '<div class="t">'+esc(t("empty"))+'</div><div class="d">'+esc(t("emptyHint"))+'</div>'+
        '<a class="btn btn--dark" href="catalog.html">'+esc(t("toCat"))+'</a></div>';
    } else {
      let rawTotal=0;
      const rows=ids.map((id,i)=>{
        const it=c[id]; const sum=(it.price||0)*(it.qty||1); rawTotal+=sum;
        const optLine = it.options ? [it.options.finish, it.options.size].filter(Boolean).join(" · ") : "";
        const optHtml = optLine ? '<div class="dl-opt" style="font-size:12px;opacity:0.75;margin:2px 0 4px">'+esc(optLine)+'</div>' : '';
        return '<div class="dl-item" style="--dl-idx:'+i+'">'+
          '<div class="dl-thumb">'+(it.img?'<img src="'+esc(it.img)+'" alt="" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">':'')+'</div>'+
          '<div class="dl-main"><div class="dl-name">'+esc(it.name)+'</div>'+
            optHtml+
            '<div class="dl-price">'+esc(fmt(it.price||0))+'</div>'+
            '<div class="dl-qty" data-dl-qty="'+esc(id)+'">'+
              '<button data-dl-dec aria-label="'+esc(t("less"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg></button>'+
              '<span>'+(it.qty||1)+'</span>'+
              '<button data-dl-inc aria-label="'+esc(t("more"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button>'+
            '</div></div>'+
          '<button class="dl-del" data-dl-del="'+esc(id)+'" aria-label="'+esc(t("remove"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg></button>'+
        '</div>';
      }).join("");

      const promo = getPromo();
      const promoPct = PROMOS[promo] || 0;
      const discount = promoPct ? Math.round(rawTotal * promoPct / 100) : 0;
      const total = rawTotal - discount;

      const managerBannerHtml = '<div class="cart-manager-banner">' +
        '<div class="cart-manager-banner__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/></svg></div>' +
        '<div class="cart-manager-banner__content">' +
          '<div class="cart-manager-banner__title">' + esc(t("managerTrustTitle")) + '</div>' +
          '<div class="cart-manager-banner__desc">' + esc(t("managerTrustDesc")) + '</div>' +
        '</div>' +
      '</div>';

      const promoHtml = '<div class="cart-promo">' +
        (promo
          ? '<div class="cart-promo__tag"><span>' + esc(t("promoTag")) + ': <b>' + esc(promo) + '</b> (-' + promoPct + '%)</span><button type="button" class="cart-promo__remove" data-promo-remove aria-label="' + esc(t("remove")) + '">&times;</button></div>'
          : '<div class="cart-promo__form"><input type="text" placeholder="' + esc(t("promoPh")) + '" data-promo-input><button type="button" class="btn btn--ghost btn--sm" data-promo-apply>' + esc(t("promoApply")) + '</button></div><div class="cart-promo__err" data-promo-err hidden></div>'
        ) +
      '</div>';

      const discountLine = discount > 0
        ? '<div class="drawer-discount"><span>' + esc(t("discount")) + '</span><span class="drawer-discount__val">-' + esc(fmt(discount)) + '</span></div>'
        : '';

      const quickOrderHtml = '<div class="drawer-quick-order">' +
        '<span class="drawer-quick-order__label">' + esc(t("quickOrder")) + '</span>' +
        '<div class="co-msg-row">' +
          '<button type="button" class="btn co-msg co-tg" data-order-tg>' + tgIco + '<span>Telegram</span></button>' +
          '<button type="button" class="btn co-msg co-wa" data-order-wa>' + waIco + '<span>WhatsApp</span></button>' +
        '</div>' +
      '</div>';

      body = managerBannerHtml +
        '<div class="drawer-list">' + rows + '</div>' +
        '<div class="drawer-foot">' +
          promoHtml +
          discountLine +
          '<div class="drawer-total"><span>' + esc(t("total")) + '</span><b>' + esc(fmt(total)) + '</b></div>' +
          '<button class="btn btn--copper" data-cart-checkout>' + esc(t("checkout")) + '</button>' +
          quickOrderHtml +
        '</div>';
    }
    const countBadge = ids.length ? '<span class="drawer-count-badge">' + ids.length + '</span>' : '';
    cartEl.innerHTML=
      '<div class="drawer-head"><h3>'+esc(t("cart"))+countBadge+'</h3>'+
      '<button class="drawer-x" data-drawer-close aria-label="'+esc(t("close"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'+body;
    wireDrawer(cartEl);
    if(window.BTT_MOTION && window.BTT_MOTION.animateNumber && prevTotal > 0 && typeof total === "number" && prevTotal !== total){
      const nextTotalEl = cartEl.querySelector(".drawer-total b");
      if(nextTotalEl){
        window.BTT_MOTION.animateNumber(nextTotalEl, prevTotal, total, 320, fmt);
      }
    }
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
      const rows=ids.map((id,i)=>{
        const it=f[id]; const href=id?("product.html?id="+encodeURIComponent(id)):"catalog.html";
        return '<div class="dl-item" style="--dl-idx:'+i+'">'+
          '<a class="dl-thumb" href="'+href+'">'+(it.img?'<img src="'+esc(it.img)+'" alt="" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">':'')+'</a>'+
          '<div class="dl-main"><a class="dl-name" href="'+href+'">'+esc(it.name)+'</a>'+
            '<div class="dl-price">'+esc(fmt(it.price||0))+'</div>'+
            '<button class="btn btn--ghost btn--sm" data-fav-add="'+esc(id)+'">'+esc(t("addCart"))+'</button>'+
          '</div>'+
          '<button class="dl-del" data-fav-del="'+esc(id)+'" aria-label="'+esc(t("remove"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg></button>'+
        '</div>';
      }).join("");
      body='<div class="drawer-list">'+rows+'</div>';
    }
    const favBadge = ids.length ? '<span class="drawer-count-badge">' + ids.length + '</span>' : '';
    favEl.innerHTML=
      '<div class="drawer-head"><h3>'+esc(t("fav"))+favBadge+'</h3>'+
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
    if(co) co.addEventListener("click", async ()=>{ await prefillCheckoutFromAccount(); renderCheckout(); });
    root.querySelectorAll("[data-cart-back]").forEach(b=>b.addEventListener("click", renderCartBody));
    root.querySelectorAll("[data-order-tg]").forEach(tg=>tg.addEventListener("click", ()=>openMsg("tg")));
    root.querySelectorAll("[data-order-wa]").forEach(wa=>wa.addEventListener("click", ()=>openMsg("wa")));
    const form=root.querySelector("[data-co-form]");
    if(form){
      form.addEventListener("submit",e=>{ e.preventDefault(); submitOrder(root); });
      form.addEventListener("input",()=>{ saveCheckout(readForm(root)); });
      const addr=root.querySelector("[data-co-addr]");
      root.querySelectorAll("[name=method]").forEach(r=>r.addEventListener("change",()=>{
        if(addr) addr.hidden = (root.querySelector("[name=method]:checked")||{}).value==="pickup";
      }));
    }
    const submit=root.querySelector("[data-co-submit]");
    if(submit) submit.addEventListener("click",()=>submitOrder(root));
    root.querySelectorAll("[data-co-city-chip]").forEach(chip=>{
      chip.addEventListener("click", ()=>{
        const input = root.querySelector("[name=address]");
        if(!input) return;
        const cityName = chip.getAttribute("data-co-city-chip");
        const cur = input.value.trim();
        const known = ['Ташкент','Таш. обл.','Самарканд','Бухара','Фергана'];
        const matched = known.find(k => cur.startsWith(k));
        if(matched){
          input.value = cityName + cur.slice(matched.length);
        } else if(!cur){
          input.value = cityName + ", ";
        } else {
          input.value = cityName + ", " + cur;
        }
        input.focus();
        saveCheckout(readForm(root));
        if(window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);
      });
    });
    root.querySelectorAll("[data-fav-del]").forEach(b=>b.addEventListener("click",()=>{
      const f=getFavs(); delete f[b.getAttribute("data-fav-del")]; write("btt_favs",f); renderBadges(); renderFavBody(); syncFavButtons(); onFavsChange();
    }));
    root.querySelectorAll("[data-fav-add]").forEach(b=>b.addEventListener("click",()=>{
      const id=b.getAttribute("data-fav-add"); const it=getFavs()[id];
      if(it) addToCart({id,name:it.name,price:it.price,img:it.img},1);
    }));
    const promoApply = root.querySelector("[data-promo-apply]");
    if(promoApply){
      promoApply.addEventListener("click", ()=>{
        const input = root.querySelector("[data-promo-input]");
        const errEl = root.querySelector("[data-promo-err]");
        const val = input ? input.value.trim().toUpperCase() : "";
        if(PROMOS[val]){
          setPromo(val);
          renderCartBody();
          toast(t("promoTag") + " " + val + " ✓");
        } else {
          if(errEl){ errEl.textContent = t("promoErr"); errEl.hidden = false; }
        }
      });
      const input = root.querySelector("[data-promo-input]");
      if(input){
        input.addEventListener("keydown", (e)=>{
          if(e.key === "Enter"){ e.preventDefault(); promoApply.click(); }
        });
      }
    }
    const promoRemove = root.querySelector("[data-promo-remove]");
    if(promoRemove){
      promoRemove.addEventListener("click", ()=>{
        setPromo("");
        renderCartBody();
      });
    }
  }

  /* ---------- checkout ---------- */
  // Remembered contact details so the form survives re-renders / language switches.
  const getCheckout = ()=>read("btt_checkout");
  function saveCheckout(v){ write("btt_checkout", v); }

  async function prefillCheckoutFromAccount(){
    if(!window.BTT_API || (window.BTT_COOKIES && !window.BTT_COOKIES.hasConsent())) return;
    try{
      const me=await window.BTT_API.me();
      if(!me||!me.user) return;
      const u=me.user;
      const ck=getCheckout();
      let ch=false;
      if(u.name&&!ck.name){ ck.name=u.name; ch=true; }
      if(u.phone&&!ck.phone){ ck.phone=u.phone; ch=true; }
      if(!ck.address){
        try{
          const ar=await window.BTT_API.listAddresses();
          const addrs=ar.addresses||[];
          const def=addrs.find(a=>a.is_default)||addrs[0];
          if(def){
            const line=[def.city,def.line].filter(Boolean).join(", ");
            if(line){ ck.address=line; ch=true; }
          }
        }catch(e){}
      }
      if(ch) saveCheckout(ck);
    }catch(e){}
  }

  // Human-readable order text for the optional messenger hand-off.
  function buildOrderText(contact, orderId){
    const c=getCart(); const ids=Object.keys(c); let rawTotal=0;
    const lines=ids.map((id,i)=>{ const it=c[id]; const sum=(it.price||0)*(it.qty||1); rawTotal+=sum;
      const optStr = it.options ? " (" + [it.options.finish, it.options.size].filter(Boolean).join(", ") + ")" : "";
      return (i+1)+". "+it.name+optStr+" × "+(it.qty||1)+" — "+fmt(sum); });
    const promo = getPromo();
    const promoPct = PROMOS[promo] || 0;
    const discount = promoPct ? Math.round(rawTotal * promoPct / 100) : 0;
    const total = rawTotal - discount;

    let out=t("ordHead")+"\n\n"+lines.join("\n");
    if(discount > 0){
      out+="\n\n"+t("discount")+" ("+promo+"): -"+fmt(discount);
    }
    out+="\n\n"+t("total")+": "+fmt(total);
    if(orderId) out+="\n"+t("ordTitle")+": № "+orderId;
    if(contact){
      out+="\n\n"+t("coName")+": "+(contact.name||"—");
      out+="\n"+t("coPhone")+": "+(contact.phone||"—");
      out+="\n"+t("coMethod")+": "+(contact.method==="pickup"?t("coPickup"):t("coDelivery"));
      const payLabels = {
        cash_or_pos: t("payCashPos"),
        click_payme: t("payClickPayme"),
        card_or_invoice: t("payCardInvoice")
      };
      if(contact.payment && payLabels[contact.payment]){
        out+="\n"+t("coPayment")+": "+payLabels[contact.payment];
      }
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
      const prodId = it.id || ((typeof id === "string" && id.trim()) ? id.split("__")[0].trim() : undefined);
      return {
        id: prodId,
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
        payment: contact && contact.payment,
        address: contact && (contact.method==="pickup" ? "" : contact.address),
        comment: contact && contact.comment,
        promo: getPromo() || undefined,
      });
      return (res && res.orderId) || null;
    }catch(e){
      if(window.BTT_COOKIES && window.BTT_COOKIES.isRequiredError(e)){
        toast(t("cookie.required"));
        window.BTT_COOKIES.showBanner();
      }
      return null;
    }
  }

  // Keep the last placed order around so the confirmation screen's messenger
  // buttons can reuse its text after the cart has been cleared.
  let _lastOrderText="";
  function openMsg(kind){
    const hasItems = cartCount() > 0;
    const txt = hasItems ? buildOrderText(getCheckout(), null) : (_lastOrderText || buildOrderText(null, null) || t("ordHead"));
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
    const payment=(root.querySelector("[name=payment_method]:checked")||{}).value||"cash_or_pos";
    return {
      name:((q("[name=name]")||{}).value||"").trim(),
      phone:((q("[name=phone]")||{}).value||"").trim(),
      method:method,
      payment:payment,
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
    const apiOk = window.BTT_API && (!window.BTT_COOKIES || window.BTT_COOKIES.hasConsent());
    if(apiOk){
      orderId=await persistOrder(f);
      if(!orderId){ showErr(root,t("errOrder")); if(btn){ btn.disabled=false; btn.textContent=t("coSubmit"); } return; }
    }
    if(!apiOk){
      if(window.BTT_COOKIES && !window.BTT_COOKIES.hasConsent()) window.BTT_COOKIES.showBanner();
    }
    _lastOrderText=buildOrderText(f, orderId);
    write("btt_cart",{});
    setPromo("");
    renderBadges();
    renderDone(orderId);
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
    const rows=ids.map(id=>{
      const it=c[id];
      const sum=(it.price||0)*(it.qty||1);
      total+=sum;
      return '<div class="ord-line"><span>'+esc(it.name)+' <i>×'+(it.qty||1)+'</i></span><b>'+esc(fmt(sum))+'</b></div>';
    }).join("");

    const promo = getPromo();
    const promoPct = PROMOS[promo] || 0;
    const discount = promoPct ? Math.round(total * promoPct / 100) : 0;
    const finalTotal = total - discount;
    const discountRow = discount > 0 ? '<div class="ord-line ord-line--discount" style="color:var(--copper);font-weight:700"><span>'+esc(t("discount")||"Скидка")+' ('+esc(promo)+' '+promoPct+'%)</span><b>-'+esc(fmt(discount))+'</b></div>' : '';

    const saved=getCheckout();
    const pickup=saved.method==="pickup";
    const val=(k)=>esc(saved[k]||"");

    const defaultCityKey = localStorage.getItem("btt_city") || "tashkent";
    const cityLabels = { tashkent: "Ташкент", tashkent_reg: "Таш. обл.", samarkand: "Самарканд", bukhara: "Бухара", fergana: "Фергана" };
    const prefillCity = !saved.address && cityLabels[defaultCityKey] ? (cityLabels[defaultCityKey] + ", ") : "";
    const addrVal = val("address") || prefillCity;
    const cityChipsHtml = '<div class="co-city-chips" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">'+
      Object.entries(cityLabels).map(([k, name])=>'<button type="button" class="co-city-chip" data-co-city-chip="'+esc(name)+'" style="font-size:11.5px;padding:3px 10px;border-radius:var(--r-pill);border:1px solid var(--line-2);background:var(--paper);color:var(--text);font-weight:600;cursor:pointer">'+esc(name)+'</button>').join('')+
      '</div>';
    cartEl.innerHTML=
      '<div class="drawer-head"><button class="drawer-back" data-cart-back aria-label="'+esc(t("ordBack"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button><h3>'+esc(t("ordTitle"))+'</h3>'+
      '<button class="drawer-x" data-drawer-close aria-label="'+esc(t("close"))+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'+
      '<div class="drawer-co"><p class="drawer-co__sub">'+esc(t("ordSub"))+'</p>'+
        '<div class="ord-list">'+rows+discountRow+'</div>'+
        '<div class="ord-total"><span>'+esc(t("total"))+'</span><b>'+esc(fmt(finalTotal))+'</b></div>'+
        '<form class="co-form" data-co-form novalidate>'+
          '<div class="co-field"><label>'+esc(t("coName"))+'</label><input name="name" type="text" autocomplete="name" value="'+val("name")+'" placeholder="'+esc(t("coNamePh"))+'"></div>'+
          '<div class="co-field"><label>'+esc(t("coPhone"))+'</label><input name="phone" type="tel" autocomplete="tel" value="'+val("phone")+'" placeholder="'+esc(t("coPhonePh"))+'"></div>'+
          '<div class="co-field"><label>'+esc(t("coMethod"))+'</label>'+
            '<div class="co-method" data-co-method>'+
              '<label class="co-radio"><input type="radio" name="method" value="delivery"'+(pickup?"":" checked")+'><span>'+esc(t("coDelivery"))+'</span></label>'+
              '<label class="co-radio"><input type="radio" name="method" value="pickup"'+(pickup?" checked":"")+'><span>'+esc(t("coPickup"))+'</span></label>'+
            '</div>'+
          '</div>'+
          '<div class="co-field"><label>'+esc(t("coPayment"))+'</label>'+
            '<div class="co-payment-methods" data-co-payment style="display:flex;flex-direction:column;gap:6px">'+
              '<label class="co-radio" style="justify-content:flex-start;text-align:left"><input type="radio" name="payment_method" value="cash_or_pos"'+(saved.payment!=="click_payme"&&saved.payment!=="card_or_invoice"?" checked":"")+'><span>'+esc(t("payCashPos"))+'</span></label>'+
              '<label class="co-radio" style="justify-content:flex-start;text-align:left"><input type="radio" name="payment_method" value="click_payme"'+(saved.payment==="click_payme"?" checked":"")+'><span>'+esc(t("payClickPayme"))+'</span></label>'+
              '<label class="co-radio" style="justify-content:flex-start;text-align:left"><input type="radio" name="payment_method" value="card_or_invoice"'+(saved.payment==="card_or_invoice"?" checked":"")+'><span>'+esc(t("payCardInvoice"))+'</span></label>'+
            '</div>'+
          '</div>'+
          '<div class="co-field" data-co-addr'+(pickup?' hidden':'')+'><label>'+esc(t("coAddress"))+'</label><input name="address" type="text" autocomplete="street-address" value="'+addrVal+'" placeholder="'+esc(t("coAddressPh"))+'">'+cityChipsHtml+'</div>'+
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
  let lastDrawerFocus = null;

  function closeMobileNav(){
    const drawer = document.querySelector(".mobile-drawer");
    const burger = document.querySelector(".burger");
    if(drawer){ drawer.classList.remove("open"); drawer.setAttribute("aria-hidden","true"); }
    if(burger) burger.setAttribute("aria-expanded","false");
  }
  function openCart(){
    if(!cartEl) return;
    lastDrawerFocus = document.activeElement;
    closeMobileNav();
    renderCartBody();
    scrim.classList.add("on");
    cartEl.classList.add("on");
    cartEl.setAttribute("aria-hidden","false");
    document.documentElement.style.overflow="hidden";
    setTimeout(()=>{
      const focusTarget = cartEl.querySelector("[data-cart-checkout], [data-drawer-close], button, a");
      if(focusTarget) focusTarget.focus();
    }, 60);
  }
  function openFav(){
    closeMobileNav();
    if(!favEl) return;
    lastDrawerFocus = document.activeElement;
    renderFavBody();
    scrim.classList.add("on");
    favEl.classList.add("on");
    favEl.setAttribute("aria-hidden","false");
    document.documentElement.style.overflow="hidden";
    setTimeout(()=>{
      const focusTarget = favEl.querySelector("[data-drawer-close], button, a");
      if(focusTarget) focusTarget.focus();
    }, 60);
  }

  /* ---------- quick 1-click order modal ---------- */
  let qkScrim = null, qkModal = null;
  function ensureQuickOrderModal(){
    if(qkModal) return;
    qkScrim = document.createElement("div");
    qkScrim.className = "drawer-scrim qk-scrim";
    qkScrim.addEventListener("click", closeQuickOrder);

    qkModal = document.createElement("div");
    qkModal.className = "qk-modal";
    qkModal.setAttribute("role", "dialog");
    qkModal.setAttribute("aria-modal", "true");
    qkModal.setAttribute("aria-hidden", "true");

    document.body.appendChild(qkScrim);
    document.body.appendChild(qkModal);
  }

  function closeQuickOrder(){
    if(!qkModal) return;
    if(qkScrim) qkScrim.classList.remove("on");
    qkModal.classList.remove("on");
    qkModal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
  }

  function openQuickOrder(snap){
    if(!snap) snap = snapFromPDP();
    if(!snap || !snap.name) return;
    ensureQuickOrderModal();

    const saved = getCheckout();
    const qty = snap.qty || 1;
    const itemTotal = (snap.price || 0) * qty;
    const optLine = snap.options ? [snap.options.finish, snap.options.size].filter(Boolean).join(" · ") : "";

    qkModal.innerHTML =
      '<div class="qk-card">' +
        '<div class="qk-head">' +
          '<h3>' + esc(t("quickOrderTitle")) + '</h3>' +
          '<button type="button" class="drawer-x" data-qk-close aria-label="' + esc(t("close")) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="qk-body">' +
          '<div class="qk-product-row">' +
            (snap.img ? '<img src="' + esc(snap.img) + '" class="qk-thumb" alt="" loading="lazy">' : '') +
            '<div class="qk-product-info">' +
              '<div class="qk-name">' + esc(snap.name) + '</div>' +
              (optLine ? '<div class="qk-opt">' + esc(optLine) + '</div>' : '') +
              '<div class="qk-price">' + (qty > 1 ? qty + ' × ' : '') + esc(fmt(snap.price || 0)) + (qty > 1 ? ' = <b>' + esc(fmt(itemTotal)) + '</b>' : '') + '</div>' +
            '</div>' +
          '</div>' +
          '<form class="qk-form" data-qk-form novalidate>' +
            '<p class="qk-sub">' + esc(t("quickOrderSub")) + '</p>' +
            '<div class="co-field">' +
              '<label>' + esc(t("coPhone")) + ' *</label>' +
              '<input name="phone" type="tel" autocomplete="tel" value="' + esc(saved.phone || "") + '" placeholder="+998 __ ___ __ __" required autofocus>' +
            '</div>' +
            '<div class="co-field">' +
              '<label>' + esc(t("coName")) + '</label>' +
              '<input name="name" type="text" autocomplete="name" value="' + esc(saved.name || "") + '" placeholder="' + esc(t("coNamePh")) + '">' +
            '</div>' +
            '<div class="co-field">' +
              '<label>' + esc(t("coPayment")) + '</label>' +
              '<div class="co-method" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
                '<label class="co-radio" style="font-size:12.5px;padding:8px"><input type="radio" name="payment_method" value="cash_or_pos" checked><span>' + esc(t("coPickup") ? "При получении" : "Cash/terminal") + '</span></label>' +
                '<label class="co-radio" style="font-size:12.5px;padding:8px"><input type="radio" name="payment_method" value="click_payme"><span>Click / Payme</span></label>' +
              '</div>' +
            '</div>' +
            '<p class="co-err" data-qk-err hidden></p>' +
            '<button type="submit" class="btn btn--copper qk-submit" data-qk-submit>' + esc(t("quickOrderBtn")) + '</button>' +
          '</form>' +
        '</div>' +
      '</div>';

    qkModal.querySelector("[data-qk-close]").onclick = closeQuickOrder;
    const form = qkModal.querySelector("[data-qk-form]");
    form.onsubmit = async (e) => {
      e.preventDefault();
      const phoneInput = form.querySelector('[name="phone"]');
      const nameInput = form.querySelector('[name="name"]');
      const payInput = form.querySelector('[name="payment_method"]:checked');
      const errEl = form.querySelector("[data-qk-err]");
      const submitBtn = form.querySelector("[data-qk-submit]");

      const phone = (phoneInput ? phoneInput.value : "").trim();
      const name = (nameInput ? nameInput.value : "").trim();
      const payment = payInput ? payInput.value : "cash_or_pos";

      if(phone.replace(/\D/g, "").length < 7){
        if(errEl){ errEl.textContent = t("errPhone"); errEl.hidden = false; }
        return;
      }
      if(errEl) errEl.hidden = true;
      if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = t("coSending"); }

      saveCheckout({ name: name || saved.name, phone, payment });

      const prodId = snap.id || "p1";
      let orderId = null;
      if(window.BTT_API && window.BTT_API.createOrder){
        try{
          const res = await window.BTT_API.createOrder({
            items: [{
              id: prodId,
              name: snap.name,
              qty: qty,
              price: snap.price || 0,
              options: snap.options || undefined
            }],
            quick_order: true,
            name: name || "Покупатель (быстрый заказ)",
            phone: phone,
            delivery: "quick_order",
            payment: payment,
            lang: document.documentElement.lang || "ru",
            currency: CONFIG.currency
          });
          orderId = (res && res.orderId) || null;
        }catch(err){
          if(errEl){ errEl.textContent = t("errOrder"); errEl.hidden = false; }
          if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = t("quickOrderBtn"); }
          return;
        }
      }

      const numHtml = orderId ? '<div style="font-size:17px;font-weight:800;color:var(--copper);margin:8px 0">№ ' + esc(orderId) + '</div>' : '';
      qkModal.querySelector(".qk-body").innerHTML =
        '<div class="qk-done">' +
          '<div class="qk-done__icon"><svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" style="width:56px;height:56px;display:inline-block"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg></div>' +
          '<h4 style="font-size:18px;margin:8px 0 4px">' + esc(t("quickOrderDone")) + '</h4>' +
          numHtml +
          '<p style="font-size:13.5px;color:var(--muted);margin-bottom:18px">' + esc(t("quickOrderSub")) + '</p>' +
          '<div class="co-msg-row" style="margin-bottom:12px">' +
            '<button type="button" class="btn co-msg co-tg" data-order-tg>' + tgIco + '<span>' + esc(t("ordTg")) + '</span></button>' +
            '<button type="button" class="btn co-msg co-wa" data-order-wa>' + waIco + '<span>' + esc(t("ordWa")) + '</span></button>' +
          '</div>' +
          '<button type="button" class="btn btn--dark" data-qk-close style="width:100%">' + esc(t("close")) + '</button>' +
        '</div>';

      qkModal.querySelectorAll("[data-qk-close]").forEach(b => b.onclick = closeQuickOrder);
      const tgBtn = qkModal.querySelector("[data-order-tg]");
      if(tgBtn){
        tgBtn.onclick = () => {
          const quickText = "Здравствуйте! Я оформил быстрый заказ" + (orderId ? " № " + orderId : "") + ": " + snap.name + " (" + fmt(itemTotal) + "). Телефон: " + phone;
          copyText(quickText);
          window.open("https://t.me/" + CONFIG.telegram, "_blank", "noopener");
          toast(t("ordCopied"));
        };
      }
      const waBtn = qkModal.querySelector("[data-order-wa]");
      if(waBtn){
        waBtn.onclick = () => {
          const quickText = "Здравствуйте! Я оформил быстрый заказ" + (orderId ? " № " + orderId : "") + ": " + snap.name + " (" + fmt(itemTotal) + "). Телефон: " + phone;
          window.open("https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(quickText), "_blank", "noopener");
        };
      }
    };

    qkScrim.classList.add("on");
    qkModal.classList.add("on");
    qkModal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => {
      const ph = qkModal.querySelector('[name="phone"]');
      if(ph) ph.focus();
    }, 60);
  }

  function closeAll(){
    if(!scrim) return;
    scrim.classList.remove("on");
    if(cartEl){ cartEl.classList.remove("on"); cartEl.setAttribute("aria-hidden","true"); }
    if(favEl){ favEl.classList.remove("on"); favEl.setAttribute("aria-hidden","true"); }
    closeQuickOrder();
    document.documentElement.style.overflow="";
    if(lastDrawerFocus && typeof lastDrawerFocus.focus === "function"){
      try{ lastDrawerFocus.focus(); }catch(_){}
      lastDrawerFocus = null;
    }
  }

  function wireProductButtons(root){
    const scope = root || document;
    scope.querySelectorAll("[data-add]").forEach(btn=>{
      if(btn.dataset.cartWired) return;
      btn.dataset.cartWired = "1";
      btn.addEventListener("click",e=>{
        e.preventDefault();
        e.stopPropagation();
        let qty=1;
        const qtyInput=document.querySelector("[data-qty] input");
        if(document.querySelector(".pdp-info") && qtyInput) qty=Math.max(1,parseInt(qtyInput.value,10)||1);
        addToCart(resolveSnap(btn),qty);
        if(navigator.vibrate) try{ navigator.vibrate(20); }catch(_){}
        btn.classList.add("added");
        const isIconOnly = btn.classList.contains("add") && !btn.classList.contains("btn");
        const origContent = btn.innerHTML;
        if(isIconOnly){
          btn.innerHTML = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.2" class="ico-check" style="width:19px;height:19px"><path d="M20 6 9 17l-5-5"/></svg>';
        } else {
          const checkIco = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" class="ico-check" style="width:18px;height:18px;display:inline-block;vertical-align:middle;margin-right:8px;flex-shrink:0"><path d="M20 6 9 17l-5-5"/></svg>';
          const addedTxt = (window.BTT_I18N && window.BTT_I18N.t ? window.BTT_I18N.t("pdp.added") : "") || "Добавлено ✓";
          btn.innerHTML = checkIco + '<span>' + esc(addedTxt) + '</span>';
        }
        setTimeout(()=>{
          btn.classList.remove("added");
          btn.innerHTML = origContent;
        }, 1100);
        if(window.BTT_FX && window.BTT_FX.burstParticles && e.clientX && e.clientY){
          window.BTT_FX.burstParticles(e.clientX, e.clientY, 8);
        }
      });
    });
    scope.querySelectorAll("[data-fav]").forEach(btn=>{
      if(btn.hasAttribute("data-fav-open") || btn.dataset.cartWired) return;
      btn.dataset.cartWired = "1";
      btn.addEventListener("click",e=>{
        e.preventDefault();
        e.stopPropagation();
        const snap = resolveSnap(btn);
        const on = toggleFav(snap, btn);
        btn.classList.toggle("is-on", on);
        if(navigator.vibrate) try{ navigator.vibrate(15); }catch(_){}
        const prodName = snap && snap.name ? ": " + snap.name : "";
        if(on){
          btn.classList.remove("is-popping");
          void btn.offsetWidth;
          btn.classList.add("is-popping");
          setTimeout(()=>btn.classList.remove("is-popping"), 500);
          if(window.BTT_FX && window.BTT_FX.burstParticles && e.clientX && e.clientY){
            window.BTT_FX.burstParticles(e.clientX, e.clientY, 8);
          }
          toast("❤️ " + (t("fav.added") || t("favAdded")) + prodName);
        } else {
          toast((t("fav.removed") || t("favRemoved")) + prodName);
        }
      });
    });
    scope.querySelectorAll("[data-pdp-quick-buy], [data-quick-buy]").forEach(btn=>{
      if(btn.dataset.quickBuyWired) return;
      btn.dataset.quickBuyWired = "1";
      btn.addEventListener("click", e=>{
        e.preventDefault();
        e.stopPropagation();
        const snap = resolveSnap(btn);
        const qtyInput = document.querySelector(".pdp-buy [data-qty] input");
        if(qtyInput && snap){
          snap.qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
        }
        openQuickOrder(snap);
      });
    });
    scope.querySelectorAll(".product[data-product]").forEach(card=>{
      if(card.dataset.cardNavWired) return;
      card.dataset.cardNavWired = "1";
      card.addEventListener("click",e=>{
        if(e.target.closest("button, a, input, textarea, label, [data-fav], [data-add], [data-pdp-quick-buy], [data-quick-buy]")) return;
        const see = card.querySelector("a.see, a[href*='product.html?id=']");
        const href = see ? see.getAttribute("href") : null;
        if(href){
          e.preventDefault();
          window.location.href = href;
        }
      });
    });
    if(window.BTT_MOTION && window.BTT_MOTION.initMagnetic) window.BTT_MOTION.initMagnetic(scope);
  }

  /* ---------- wire up ---------- */
  document.addEventListener("DOMContentLoaded",function(){
    buildShell();
    renderCartBody(); renderFavBody(); renderBadges(); syncFavButtons();
    prefillCheckoutFromAccount();

    wireProductButtons();
    window.BTT_syncFavs = syncFavButtons;
    document.addEventListener("btt:related-rendered", e=>{
      const grid = e.detail && e.detail.grid;
      if(grid) wireProductButtons(grid);
      syncFavButtons();
    });

    // header cart icon → open cart drawer
    document.querySelectorAll("[data-cart-open], a[data-i18n-aria='tool.cart'], a[aria-label='cart'], a[aria-label='Корзина']").forEach(el=>{
      el.addEventListener("click",e=>{ e.preventDefault(); openCart(); });
    });
    document.querySelectorAll("[data-fav-open], [data-i18n-aria='tool.fav'], button[aria-label='fav'], button[aria-label='Избранное']").forEach(b=>{
      if(b.dataset.favWired) return;
      b.dataset.favWired = "1";
      b.addEventListener("click",e=>{ e.preventDefault(); openFav(); });
    });

    document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeAll(); });
    document.addEventListener("btt:cookies-accepted", ()=>{ prefillCheckoutFromAccount(); });
    // re-localize drawers + re-sync hearts on language change
    new MutationObserver(()=>{ renderCartBody(); renderFavBody(); }).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  });

  window.BTT_CART={ openCart, openFav, openQuickOrder, closeQuickOrder, addToCart, wireProductButtons, getFavs, setFavs, favCount };
})();
