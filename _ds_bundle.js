/* @ds-bundle: {"format":3,"namespace":"Bententrade_7920a1","components":[],"sourceHashes":{"assets/account.js":"d053c03ea9cb","assets/assistant.js":"a8377e2ab3c1","assets/cart.js":"cae3ee493130","assets/catalog-hero.js":"700aa3cfe5eb","assets/fx.js":"0af89edf6839","assets/hero.js":"1b34d0330ea5","assets/i18n.js":"f377684e5ccc","assets/pdp.js":"df2f65c11f2a","assets/products.js":"71df62d5566f","assets/search.js":"b4a421aaa4ec","assets/site.js":"74ec0aa791b1"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.Bententrade_7920a1 = window.Bententrade_7920a1 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/account.js
try { (() => {
/* ============================================================
   BENTENTRADE — account page (tab switching)
   ============================================================ */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const nav = document.querySelector("[data-acc-nav]");
    if (!nav) return;
    const tabs = nav.querySelectorAll("[data-acc-tab]");
    const panels = document.querySelectorAll("[data-acc-panel]");
    function show(name) {
      tabs.forEach(t => t.classList.toggle("is-active", t.dataset.accTab === name));
      panels.forEach(p => p.classList.toggle("is-active", p.dataset.accPanel === name));
      try {
        history.replaceState(null, "", "#" + name);
      } catch (e) {}
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
    tabs.forEach(t => t.addEventListener("click", () => show(t.dataset.accTab)));

    // "Все заказы" / cross-links
    document.querySelectorAll("[data-acc-goto]").forEach(b => {
      b.addEventListener("click", () => show(b.dataset.accGoto));
    });

    // logout (demo)
    const logout = document.querySelector("[data-acc-logout]");
    if (logout) logout.addEventListener("click", () => {
      window.location.href = "index.html";
    });

    // settings form
    const form = document.querySelector("[data-acc-form]");
    if (form) {
      form.addEventListener("submit", e => {
        e.preventDefault();
        const ok = form.querySelector("[data-form-ok]");
        if (ok) {
          ok.classList.add("show");
          setTimeout(() => ok.classList.remove("show"), 2600);
        }
      });
    }

    // open tab from hash
    const hash = (location.hash || "").replace("#", "");
    if (hash && Array.from(tabs).some(t => t.dataset.accTab === hash)) show(hash);

    /* ---- shared helpers ---- */
    function lang() {
      const s = localStorage.getItem("btt_lang");
      return ["ru", "uz", "en"].includes(s) ? s : "ru";
    }
    function t(k) {
      const d = window.BTT_I18N && window.BTT_I18N[lang()] || {};
      return d[k] != null ? d[k] : k;
    }
    let toastWrap;
    function toast(msg) {
      if (!toastWrap) {
        toastWrap = document.createElement("div");
        toastWrap.className = "toast-wrap";
        document.body.appendChild(toastWrap);
      }
      const el = document.createElement("div");
      el.className = "toast";
      el.textContent = msg;
      toastWrap.appendChild(el);
      requestAnimationFrame(() => el.classList.add("on"));
      setTimeout(() => {
        el.classList.remove("on");
        setTimeout(() => el.remove(), 320);
      }, 2600);
    }

    /* ---- repeat order → add its items to the cart ---- */
    function snapshot(id) {
      const P = window.BTT_PRODUCTS || {},
        p = P[id];
      if (!p) return null;
      const d = window.BTT_I18N && window.BTT_I18N[lang()] || window.BTT_I18N && window.BTT_I18N.ru || {};
      const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(id) : null;
      return {
        id,
        name: d[id + ".name"] || id,
        price: p.now,
        img: imgs && imgs[0] ? imgs[0].thumb : ""
      };
    }
    document.querySelectorAll("[data-order-repeat]").forEach(b => {
      b.addEventListener("click", () => {
        const ids = (b.getAttribute("data-order-repeat") || "").split(",").map(s => s.trim()).filter(Boolean);
        let added = 0;
        ids.forEach(id => {
          const s = snapshot(id);
          if (s && window.BTT_CART) {
            window.BTT_CART.addToCart(s, 1);
            added++;
          }
        });
        if (added) toast(t("toast.repeat"));
      });
    });

    /* ---- track / review / addresses → feedback toast ---- */
    document.querySelectorAll("[data-order-track]").forEach(b => {
      b.addEventListener("click", () => toast(t("toast.track").replace("{id}", b.getAttribute("data-order-track"))));
    });
    document.querySelectorAll("[data-order-review]").forEach(b => {
      b.addEventListener("click", () => toast(t("toast.review")));
    });
    document.querySelectorAll("[data-addr-edit]").forEach(b => {
      b.addEventListener("click", e => {
        e.preventDefault();
        toast(t("toast.addr"));
      });
    });
    document.querySelectorAll("[data-addr-add]").forEach(b => {
      b.addEventListener("click", () => toast(t("toast.addrAdd")));
    });

    /* ---- newsletter toggle (persisted) ---- */
    const news = document.querySelector("[data-news-toggle]");
    const newsLabel = document.querySelector("[data-news-label]");
    function applyNews(on) {
      if (news) news.setAttribute("aria-checked", on ? "true" : "false");
      if (newsLabel) {
        newsLabel.setAttribute("data-i18n", on ? "acc.set.newson" : "acc.set.newsoff");
        newsLabel.textContent = t(on ? "acc.set.newson" : "acc.set.newsoff");
      }
    }
    if (news) {
      const stored = localStorage.getItem("btt_news");
      applyNews(stored === null ? true : stored === "1");
      news.addEventListener("click", () => {
        const on = news.getAttribute("aria-checked") !== "true";
        localStorage.setItem("btt_news", on ? "1" : "0");
        applyNews(on);
        toast(t(on ? "toast.newson" : "toast.newsoff"));
      });
    }
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/account.js", error: String((e && e.message) || e) }); }

// assets/assistant.js
try { (() => {
/* ============================================================
   BENTENTRADE — site assistant "Бен"
   Self-injecting glass chat widget. Scripted, multilingual,
   segments the visitor and routes to catalog / manager.
   No backend — deterministic intent tree.
   ============================================================ */
(function () {
  const T = {
    ru: {
      name: "Бен",
      role: "Онлайн-помощник",
      badge: "1",
      ph: "Напишите сообщение…",
      hi: "Здравствуйте! Я Бен, помощник Bententrade 🌿 Помогу подобрать изделия из искусственного ротанга. С чего начнём?",
      quick: ["Садовая мебель", "Кашпо", "Корзины и сундуки", "Доставка", "Связаться с менеджером"],
      ans: {
        "Садовая мебель": "Диваны, кресла и обеденные группы из искусственного ротанга — всесезонные, на алюминиевом каркасе. Смотрите в <a href='catalog.html?cat=furniture'>каталоге</a>. Подобрать под размер террасы?",
        "Кашпо": "Плетёные кашпо с дренажом и вкладышем — для дома, балкона и сада. Вся подборка в <a href='catalog.html?cat=planter'>каталоге</a>. Подсказать по размеру?",
        "Корзины и сундуки": "Сундуки и корзины для белья из искусственного ротанга — с подкладкой и крышкой. Смотрите в <a href='catalog.html?cat=basket'>каталоге</a>. Нужен размер S/M/L?",
        "Доставка": "Доставляем по всему Узбекистану за 7–10 дней, по Ташкенту — быстрее. Изделия привозим в собранном виде. Назовёте город — подскажу сроки.",
        "Связаться с менеджером": "Конечно! Менеджер на связи в Telegram <a href='https://t.me/bententrade' target='_blank'>@bententrade</a> и по телефону <a href='tel:+998712001846'>+998 71 200 18 46</a>. Оформить заказ через корзину?"
      },
      fallback: "Спасибо за вопрос! Я передам его менеджеру — он ответит детально. Пока можете посмотреть <a href='catalog.html'>каталог</a> или выбрать тему ниже 👇",
      reply: "Понял! Менеджер свяжется с вами в ближайшее время. Что-нибудь ещё?"
    },
    uz: {
      name: "Ben",
      role: "Onlayn yordamchi",
      badge: "1",
      ph: "Xabar yozing…",
      hi: "Salom! Men Ben, Bententrade yordamchisi 🌿 Sun’iy rotangdan yasalgan buyumlarni tanlashda yordam beraman. Nimadan boshlaymiz?",
      quick: ["Bog‘ mebeli", "Gultuvak", "Savat va sandiq", "Yetkazib berish", "Menejer bilan bog‘lanish"],
      ans: {
        "Bog‘ mebeli": "Sun’iy rotangdan divan, kreslo va ovqat to‘plamlari — har faslga mos, alyumin karkasda. <a href='catalog.html?cat=furniture'>Katalog</a>ni ko‘ring. Terassa o‘lchamiga moslab beraymi?",
        "Gultuvak": "Drenaj va vkladishli to‘qilgan gultuvaklar — uy, balkon va bog‘ uchun. Hammasi <a href='catalog.html?cat=planter'>katalogda</a>. O‘lcham bo‘yicha aytaymi?",
        "Savat va sandiq": "Sun’iy rotangdan kir savati va sandiqlar — astar va qopqoq bilan. <a href='catalog.html?cat=basket'>Katalog</a>ni ko‘ring. S/M/L o‘lcham kerakmi?",
        "Yetkazib berish": "O‘zbekiston bo‘ylab 7–10 kun, Toshkent bo‘ylab tezroq. Buyumlarni yig‘ilgan holda yetkazamiz. Shaharni ayting — muddatni aytaman.",
        "Menejer bilan bog‘lanish": "Albatta! Menejer Telegramda <a href='https://t.me/bententrade' target='_blank'>@bententrade</a> va telefon <a href='tel:+998712001846'>+998 71 200 18 46</a>. Buyurtmani savat orqali rasmiylashtiraymi?"
      },
      fallback: "Savolingiz uchun rahmat! Menejerga yetkazaman. Hozircha <a href='catalog.html'>katalog</a>ni ko‘ring yoki quyidan mavzu tanlang 👇",
      reply: "Tushunarli! Menejer tez orada bog‘lanadi. Yana biror narsa kerakmi?"
    },
    en: {
      name: "Ben",
      role: "Online assistant",
      badge: "1",
      ph: "Type a message…",
      hi: "Hi! I'm Ben, the Bententrade assistant 🌿 I can help you pick synthetic-rattan pieces. Where shall we start?",
      quick: ["Garden furniture", "Planters", "Baskets & chests", "Delivery", "Talk to a manager"],
      ans: {
        "Garden furniture": "Sofas, armchairs and dining sets in synthetic rattan — all-season, on an aluminium frame. Browse the <a href='catalog.html?cat=furniture'>catalog</a>. Want me to match it to your terrace?",
        "Planters": "Woven planters with drainage and a liner — for home, balcony and garden. See them all in the <a href='catalog.html?cat=planter'>catalog</a>. Want sizing help?",
        "Baskets & chests": "Synthetic-rattan laundry baskets and chests — with a liner and lid. See the <a href='catalog.html?cat=basket'>catalog</a>. Need an S/M/L size?",
        "Delivery": "We ship across Uzbekistan in 7–10 days, faster within Tashkent. Pieces arrive fully assembled. Tell me your city for exact timing.",
        "Talk to a manager": "Of course! Our manager is on Telegram <a href='https://t.me/bententrade' target='_blank'>@bententrade</a> and phone <a href='tel:+998712001846'>+998 71 200 18 46</a>. Want to place the order via the cart?"
      },
      fallback: "Thanks for your question! I'll pass it to our manager for a detailed reply. Meanwhile, check the <a href='catalog.html'>catalog</a> or pick a topic below 👇",
      reply: "Got it! Our manager will reach out shortly. Anything else?"
    }
  };
  function lang() {
    var s = localStorage.getItem("btt_lang");
    return T[s] ? s : "ru";
  }
  document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector(".bot-fab")) return;
    const fab = document.createElement("button");
    fab.className = "bot-fab";
    fab.setAttribute("aria-label", "Чат-помощник");
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.8-.9L3 21l1.4-5.2A8.4 8.4 0 0 1 3.5 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg><span class="bot-fab__badge">1</span>';
    const panel = document.createElement("div");
    panel.className = "bot-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Bententrade assistant");
    panel.innerHTML = '<div class="bot-head"><div class="bot-head__ava">Б</div>' + '<div><div class="bot-head__t" data-bot-name>Бен</div><div class="bot-head__s" data-bot-role>Онлайн-помощник</div></div>' + '<button class="bot-head__x" data-bot-close aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' + '<div class="bot-msgs" data-bot-msgs></div>' + '<div class="bot-quick" data-bot-quick></div>' + '<form class="bot-input" data-bot-form><input type="text" data-bot-input autocomplete="off"><button class="bot-send" type="submit" aria-label="Отправить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/></svg></button></form>';
    document.body.appendChild(fab);
    document.body.appendChild(panel);
    const msgs = panel.querySelector("[data-bot-msgs]");
    const quick = panel.querySelector("[data-bot-quick]");
    const input = panel.querySelector("[data-bot-input]");
    let started = false;
    function add(text, who) {
      const m = document.createElement("div");
      m.className = "bot-msg bot-msg--" + who;
      m.innerHTML = text;
      msgs.appendChild(m);
      msgs.scrollTop = msgs.scrollHeight;
      return m;
    }
    function typing() {
      const t = document.createElement("div");
      t.className = "bot-typing";
      t.innerHTML = "<span></span><span></span><span></span>";
      msgs.appendChild(t);
      msgs.scrollTop = msgs.scrollHeight;
      return t;
    }
    function botSay(text, delay) {
      const t = typing();
      setTimeout(() => {
        t.remove();
        add(text, "bot");
      }, delay || 650);
    }
    function renderQuick() {
      const d = T[lang()];
      quick.innerHTML = "";
      d.quick.forEach(label => {
        const c = document.createElement("button");
        c.className = "bot-chip";
        c.type = "button";
        c.textContent = label;
        c.addEventListener("click", () => handle(label));
        quick.appendChild(c);
      });
    }
    function applyLang() {
      const d = T[lang()];
      panel.querySelector("[data-bot-name]").textContent = d.name;
      panel.querySelector("[data-bot-role]").textContent = d.role;
      input.placeholder = d.ph;
      renderQuick();
    }
    function handle(text) {
      add(text, "user");
      const d = T[lang()];
      const ans = d.ans[text];
      botSay(ans || d.fallback, ans ? 700 : 600);
    }
    function open() {
      panel.classList.add("open");
      fab.classList.add("hidden");
      if (!started) {
        started = true;
        setTimeout(() => botSay(T[lang()].hi, 500), 250);
      }
      setTimeout(() => input.focus(), 320);
    }
    function close() {
      panel.classList.remove("open");
      fab.classList.remove("hidden");
    }
    fab.addEventListener("click", open);
    panel.querySelector("[data-bot-close]").addEventListener("click", close);
    panel.querySelector("[data-bot-form]").addEventListener("submit", e => {
      e.preventDefault();
      const v = input.value.trim();
      if (!v) return;
      input.value = "";
      add(v, "user");
      const d = T[lang()];
      botSay(d.fallback, 700);
      setTimeout(() => botSay(d.reply, 1500), 900);
    });

    // re-localize on language change
    new MutationObserver(() => applyLang()).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });
    applyLang();
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/assistant.js", error: String((e && e.message) || e) }); }

// assets/cart.js
try { (() => {
/* ============================================================
   BENTENTRADE — cart + favorites (site-wide, persistent)
   Self-injecting slide-in drawers. State lives in localStorage:
     btt_cart  → { id: {name, price, img, qty} }
     btt_favs  → { id: {name, price, img} }
   Owns every [data-add] / [data-fav] and the header cart/heart icons.
   (site.js no longer binds those.)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- manager contact (edit these) ----------
     telegram : username after t.me/  (no @)
     whatsapp : full number, digits only (country code first)        */
  const CONFIG = {
    telegram: "bententrade",
    whatsapp: "998901234567",
    currency: "$"
  };

  /* ---------- i18n helper ---------- */
  function lang() {
    const s = localStorage.getItem("btt_lang");
    return ["ru", "uz", "en"].includes(s) ? s : "ru";
  }
  const STR = {
    ru: {
      cart: "Корзина",
      empty: "Корзина пуста",
      emptyHint: "Добавьте мебель из каталога — она появится здесь.",
      toCat: "Перейти в каталог",
      total: "Итого",
      checkout: "Оформить заказ",
      pcs: "шт.",
      done: "Заказ оформлен! Менеджер свяжется с вами.",
      remove: "Убрать",
      fav: "Избранное",
      favEmpty: "В избранном пусто",
      favHint: "Нажмите на сердечко у товара, чтобы сохранить его.",
      addCart: "В корзину",
      ordTitle: "Подтверждение заказа",
      ordSub: "Отправьте заказ менеджеру — он подтвердит наличие, доставку и оплату.",
      ordTg: "Оформить в Telegram",
      ordWa: "Оформить в WhatsApp",
      ordBack: "Вернуться в корзину",
      ordCopied: "Заказ скопирован — вставьте его в чат с менеджером.",
      ordHead: "Заказ с сайта Bententrade",
      ordNote: "Заполню контакты и адрес в чате."
    },
    uz: {
      cart: "Savat",
      empty: "Savat bo‘sh",
      emptyHint: "Katalogdan mebel qo‘shing — u shu yerda paydo bo‘ladi.",
      toCat: "Katalogga o‘tish",
      total: "Jami",
      checkout: "Buyurtma berish",
      pcs: "dona",
      done: "Buyurtma qabul qilindi! Menejer bog‘lanadi.",
      remove: "Olib tashlash",
      fav: "Sevimlilar",
      favEmpty: "Sevimlilar bo‘sh",
      favHint: "Saqlash uchun mahsulotdagi yurakchani bosing.",
      addCart: "Savatga",
      ordTitle: "Buyurtma tasdiqlash",
      ordSub: "Buyurtmani menejerga yuboring — mavjudligi, yetkazish va to‘lovni tasdiqlaydi.",
      ordTg: "Telegramda rasmiylashtirish",
      ordWa: "WhatsAppda rasmiylashtirish",
      ordBack: "Savatga qaytish",
      ordCopied: "Buyurtma nusxalandi — menejer chatiga joylang.",
      ordHead: "Bententrade saytidan buyurtma",
      ordNote: "Kontakt va manzilni chatda to‘ldiraman."
    },
    en: {
      cart: "Cart",
      empty: "Your cart is empty",
      emptyHint: "Add furniture from the catalog — it will show up here.",
      toCat: "Go to catalog",
      total: "Total",
      checkout: "Checkout",
      pcs: "pcs",
      done: "Order placed! Our manager will be in touch.",
      remove: "Remove",
      fav: "Wishlist",
      favEmpty: "No saved items yet",
      favHint: "Tap the heart on a product to save it.",
      addCart: "Add to cart",
      ordTitle: "Confirm your order",
      ordSub: "Send the order to our manager — they'll confirm stock, delivery and payment.",
      ordTg: "Order via Telegram",
      ordWa: "Order via WhatsApp",
      ordBack: "Back to cart",
      ordCopied: "Order copied — paste it into the chat with our manager.",
      ordHead: "Order from the Bententrade website",
      ordNote: "I'll add my contacts and address in the chat."
    }
  };
  function t(k) {
    return (STR[lang()] || STR.ru)[k];
  }

  /* ---------- storage ---------- */
  function read(key) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v && typeof v === "object" && !Array.isArray(v) ? v : {};
    } catch (e) {
      return {};
    }
  }
  function write(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
  }
  const getCart = () => read("btt_cart");
  const getFavs = () => read("btt_favs");
  const cartCount = () => {
    const c = getCart();
    return Object.values(c).reduce((n, it) => n + (it.qty || 1), 0);
  };
  const favCount = () => Object.keys(getFavs()).length;

  /* ---------- derive a product snapshot from DOM / PDP ---------- */
  function snapFromCard(card) {
    if (!card) return null;
    const see = card.querySelector(".see, a[href*='product.html']");
    let id = null;
    if (see) {
      const m = (see.getAttribute("href") || "").match(/id=(p\d+)/);
      if (m) id = m[1];
    }
    const name = (card.querySelector(".product__name") || {}).textContent || "";
    const priceEl = card.querySelector(".price__now");
    const price = priceEl ? parseInt((priceEl.textContent || "").replace(/[^\d]/g, ""), 10) || 0 : 0;
    const img = (card.querySelector("img") || {}).currentSrc || (card.querySelector("img") || {}).src || "";
    if (!id) id = "x-" + name.slice(0, 18).replace(/\s+/g, "-").toLowerCase();
    return {
      id,
      name: name.trim(),
      price,
      img
    };
  }
  function snapFromPDP() {
    const id = new URLSearchParams(location.search).get("id") || "p1";
    const name = (document.querySelector(".pdp-info h1") || {}).textContent || "";
    const price = parseInt(((document.querySelector(".pdp-price .now") || {}).textContent || "").replace(/[^\d]/g, ""), 10) || 0;
    const onImg = document.querySelector(".pdp-stage img.is-on") || document.querySelector(".pdp-stage img");
    const img = onImg ? onImg.currentSrc || onImg.src : "";
    return {
      id,
      name: name.trim(),
      price,
      img
    };
  }
  // resolve the snapshot for a clicked [data-add]/[data-fav]
  function resolveSnap(btn) {
    const card = btn.closest("[data-product], .product");
    if (card) {
      const s = snapFromCard(card);
      if (s && s.name) return s;
    }
    if (document.querySelector(".pdp-info")) return snapFromPDP();
    return snapFromCard(card);
  }

  /* ---------- mutations ---------- */
  function addToCart(snap, qty) {
    if (!snap || !snap.id) return;
    const c = getCart();
    const ex = c[snap.id];
    c[snap.id] = {
      name: snap.name,
      price: snap.price,
      img: snap.img,
      qty: (ex ? ex.qty : 0) + (qty || 1)
    };
    write("btt_cart", c);
    renderBadges();
    renderCartBody();
    openCart();
  }
  function setQty(id, qty) {
    const c = getCart();
    if (!c[id]) return;
    if (qty <= 0) delete c[id];else c[id].qty = qty;
    write("btt_cart", c);
    renderBadges();
    renderCartBody();
  }
  function toggleFav(snap, btn) {
    if (!snap || !snap.id) return false;
    const f = getFavs();
    let on;
    if (f[snap.id]) {
      delete f[snap.id];
      on = false;
    } else {
      f[snap.id] = {
        name: snap.name,
        price: snap.price,
        img: snap.img
      };
      on = true;
    }
    write("btt_favs", f);
    renderBadges();
    renderFavBody();
    syncFavButtons();
    return on;
  }

  /* ---------- badges + button state ---------- */
  function renderBadges() {
    const cc = cartCount();
    document.querySelectorAll("[data-cart-count]").forEach(el => {
      el.textContent = cc;
      el.style.display = cc > 0 ? "grid" : "none";
    });
    const fc = favCount();
    document.querySelectorAll("[data-fav-count]").forEach(el => {
      el.textContent = fc;
      el.style.display = fc > 0 ? "grid" : "none";
    });
  }
  // reflect saved favorites onto product/PDP heart buttons
  function syncFavButtons() {
    const f = getFavs();
    document.querySelectorAll("[data-fav]").forEach(btn => {
      if (btn.closest(".acc-side") || btn.hasAttribute("data-fav-open")) return; // header opener handled separately
      const snap = resolveSnap(btn);
      if (snap && snap.id) btn.classList.toggle("is-on", !!f[snap.id]);
    });
  }

  /* ---------- drawer shell ---------- */
  let scrim, cartEl, favEl;
  function buildShell() {
    scrim = document.createElement("div");
    scrim.className = "drawer-scrim";
    scrim.addEventListener("click", closeAll);
    cartEl = document.createElement("aside");
    cartEl.className = "drawer drawer--cart";
    cartEl.setAttribute("aria-hidden", "true");
    favEl = document.createElement("aside");
    favEl.className = "drawer drawer--fav";
    favEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(scrim);
    document.body.appendChild(cartEl);
    document.body.appendChild(favEl);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    })[c]);
  }
  function renderCartBody() {
    if (!cartEl) return;
    const c = getCart();
    const ids = Object.keys(c);
    let body;
    if (!ids.length) {
      body = '<div class="drawer-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>' + '<div class="t">' + esc(t("empty")) + '</div><div class="d">' + esc(t("emptyHint")) + '</div>' + '<a class="btn btn--dark" href="catalog.html">' + esc(t("toCat")) + '</a></div>';
    } else {
      let total = 0;
      const rows = ids.map(id => {
        const it = c[id];
        const sum = (it.price || 0) * (it.qty || 1);
        total += sum;
        return '<div class="dl-item">' + '<div class="dl-thumb">' + (it.img ? '<img src="' + esc(it.img) + '" alt="" onerror="this.style.display=\'none\'">' : '') + '</div>' + '<div class="dl-main"><div class="dl-name">' + esc(it.name) + '</div>' + '<div class="dl-price">$' + (it.price || 0) + '</div>' + '<div class="dl-qty" data-dl-qty="' + esc(id) + '">' + '<button data-dl-dec aria-label="−"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg></button>' + '<span>' + (it.qty || 1) + '</span>' + '<button data-dl-inc aria-label="+"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button>' + '</div></div>' + '<button class="dl-del" data-dl-del="' + esc(id) + '" aria-label="' + esc(t("remove")) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' + '</div>';
      }).join("");
      body = '<div class="drawer-list">' + rows + '</div>' + '<div class="drawer-foot"><div class="drawer-total"><span>' + esc(t("total")) + '</span><b>$' + total + '</b></div>' + '<button class="btn btn--dark" data-cart-checkout>' + esc(t("checkout")) + '</button></div>';
    }
    cartEl.innerHTML = '<div class="drawer-head"><h3>' + esc(t("cart")) + '</h3>' + '<button class="drawer-x" data-drawer-close aria-label="×"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' + body;
    wireDrawer(cartEl);
  }
  function renderFavBody() {
    if (!favEl) return;
    const f = getFavs();
    const ids = Object.keys(f);
    let body;
    if (!ids.length) {
      body = '<div class="drawer-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20s-7-4.6-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.4 12 20 12 20Z"/></svg>' + '<div class="t">' + esc(t("favEmpty")) + '</div><div class="d">' + esc(t("favHint")) + '</div>' + '<a class="btn btn--dark" href="catalog.html">' + esc(t("toCat")) + '</a></div>';
    } else {
      const rows = ids.map(id => {
        const it = f[id];
        const href = /^p\d+$/.test(id) ? "product.html?id=" + id : "catalog.html";
        return '<div class="dl-item">' + '<a class="dl-thumb" href="' + href + '">' + (it.img ? '<img src="' + esc(it.img) + '" alt="" onerror="this.style.display=\'none\'">' : '') + '</a>' + '<div class="dl-main"><a class="dl-name" href="' + href + '">' + esc(it.name) + '</a>' + '<div class="dl-price">$' + (it.price || 0) + '</div>' + '<button class="btn btn--ghost btn--sm" data-fav-add="' + esc(id) + '">' + esc(t("addCart")) + '</button>' + '</div>' + '<button class="dl-del" data-fav-del="' + esc(id) + '" aria-label="' + esc(t("remove")) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' + '</div>';
      }).join("");
      body = '<div class="drawer-list">' + rows + '</div>';
    }
    favEl.innerHTML = '<div class="drawer-head"><h3>' + esc(t("fav")) + '</h3>' + '<button class="drawer-x" data-drawer-close aria-label="×"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' + body;
    wireDrawer(favEl);
  }
  function wireDrawer(root) {
    root.querySelectorAll("[data-drawer-close]").forEach(b => b.addEventListener("click", closeAll));
    root.querySelectorAll("[data-dl-qty]").forEach(q => {
      const id = q.getAttribute("data-dl-qty");
      const cur = () => (getCart()[id] || {}).qty || 0;
      q.querySelector("[data-dl-dec]").addEventListener("click", () => setQty(id, cur() - 1));
      q.querySelector("[data-dl-inc]").addEventListener("click", () => setQty(id, cur() + 1));
    });
    root.querySelectorAll("[data-dl-del]").forEach(b => b.addEventListener("click", () => setQty(b.getAttribute("data-dl-del"), 0)));
    const co = root.querySelector("[data-cart-checkout]");
    if (co) co.addEventListener("click", renderCheckout);
    root.querySelectorAll("[data-cart-back]").forEach(b => b.addEventListener("click", renderCartBody));
    const tg = root.querySelector("[data-order-tg]");
    if (tg) tg.addEventListener("click", () => dispatch("tg"));
    const wa = root.querySelector("[data-order-wa]");
    if (wa) wa.addEventListener("click", () => dispatch("wa"));
    root.querySelectorAll("[data-fav-del]").forEach(b => b.addEventListener("click", () => {
      const f = getFavs();
      delete f[b.getAttribute("data-fav-del")];
      write("btt_favs", f);
      renderBadges();
      renderFavBody();
      syncFavButtons();
    }));
    root.querySelectorAll("[data-fav-add]").forEach(b => b.addEventListener("click", () => {
      const id = b.getAttribute("data-fav-add");
      const it = getFavs()[id];
      if (it) addToCart({
        id,
        name: it.name,
        price: it.price,
        img: it.img
      }, 1);
    }));
  }

  /* ---------- checkout → manager messenger ---------- */
  function orderText() {
    const c = getCart();
    const ids = Object.keys(c);
    let total = 0;
    const lines = ids.map((id, i) => {
      const it = c[id];
      const sum = (it.price || 0) * (it.qty || 1);
      total += sum;
      return i + 1 + ". " + it.name + " × " + (it.qty || 1) + " — " + CONFIG.currency + sum;
    });
    return t("ordHead") + "\n\n" + lines.join("\n") + "\n\n" + t("total") + ": " + CONFIG.currency + total + "\n" + t("ordNote");
  }
  function copyText(txt) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt);
        return;
      }
    } catch (e) {}
    try {
      const ta = document.createElement("textarea");
      ta.value = txt;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    } catch (e) {}
  }
  let toastEl = null,
    toastT = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "btt-toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("on"), 3800);
  }
  function dispatch(kind) {
    const txt = orderText();
    if (kind === "tg") {
      copyText(txt);
      window.open("https://t.me/" + CONFIG.telegram, "_blank", "noopener");
      toast(t("ordCopied"));
    } else {
      window.open("https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(txt), "_blank", "noopener");
    }
    write("btt_cart", {});
    renderBadges();
    renderDone();
  }
  function renderDone() {
    if (!cartEl) return;
    cartEl.innerHTML = '<div class="drawer-head"><h3>' + esc(t("cart")) + '</h3><button class="drawer-x" data-drawer-close aria-label="×"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' + '<div class="drawer-empty"><svg viewBox="0 0 24 24" fill="none" stroke="#3c8a4e" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg><div class="t">' + esc(t("done")) + '</div><a class="btn btn--dark" href="catalog.html">' + esc(t("toCat")) + '</a></div>';
    wireDrawer(cartEl);
  }
  function renderCheckout() {
    if (!cartEl) return;
    const c = getCart();
    const ids = Object.keys(c);
    if (!ids.length) {
      renderCartBody();
      return;
    }
    let total = 0;
    const rows = ids.map(id => {
      const it = c[id];
      const sum = (it.price || 0) * (it.qty || 1);
      total += sum;
      return '<div class="ord-line"><span>' + esc(it.name) + ' <i>×' + (it.qty || 1) + '</i></span><b>' + CONFIG.currency + sum + '</b></div>';
    }).join("");
    const tgIco = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 2.9 11.6c-1 .4-1 1.8 0 2.1l4.7 1.5 1.8 5.6c.3.8 1.3 1 1.9.4l2.6-2.5 4.7 3.5c.7.5 1.7.1 1.9-.7L23 5.5c.2-1-.8-1.8-1.7-1.2Z"/></svg>';
    const waIco = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.6 4.7-1.2A10 10 0 1 0 12 2Zm5.3 13.9c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7s-3.9-3.3-4-3.5c-.1-.2-1-1.3-1-2.5s.6-1.8.9-2.1c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.4l.8 2c.1.2.1.3 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2 1.2.9 1.8.9 2.1.8.2-.1.5-.5.7-.8.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.4.3.1.2.1.6 0 1.2Z"/></svg>';
    cartEl.innerHTML = '<div class="drawer-head"><button class="drawer-back" data-cart-back aria-label="←"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button><h3>' + esc(t("ordTitle")) + '</h3>' + '<button class="drawer-x" data-drawer-close aria-label="×"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' + '<div class="drawer-co"><p class="drawer-co__sub">' + esc(t("ordSub")) + '</p>' + '<div class="ord-list">' + rows + '</div>' + '<div class="ord-total"><span>' + esc(t("total")) + '</span><b>' + CONFIG.currency + total + '</b></div></div>' + '<div class="drawer-foot drawer-co__foot">' + '<button class="btn co-msg co-tg" data-order-tg>' + tgIco + '<span>' + esc(t("ordTg")) + '</span></button>' + '<button class="btn co-msg co-wa" data-order-wa>' + waIco + '<span>' + esc(t("ordWa")) + '</span></button>' + '<button class="co-back" data-cart-back>' + esc(t("ordBack")) + '</button></div>';
    wireDrawer(cartEl);
  }

  /* ---------- open / close ---------- */
  function openCart() {
    if (!cartEl) return;
    renderCartBody();
    scrim.classList.add("on");
    cartEl.classList.add("on");
    cartEl.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
  }
  function openFav() {
    if (!favEl) return;
    renderFavBody();
    scrim.classList.add("on");
    favEl.classList.add("on");
    favEl.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
  }
  function closeAll() {
    if (!scrim) return;
    scrim.classList.remove("on");
    cartEl.classList.remove("on");
    favEl.classList.remove("on");
    cartEl.setAttribute("aria-hidden", "true");
    favEl.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
  }

  /* ---------- wire up ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildShell();
    renderCartBody();
    renderFavBody();
    renderBadges();
    syncFavButtons();

    // add-to-cart (catalog cards, PDP, account repeat-order)
    document.querySelectorAll("[data-add]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        let qty = 1;
        const qtyInput = document.querySelector("[data-qty] input");
        if (document.querySelector(".pdp-info") && qtyInput) qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
        addToCart(resolveSnap(btn), qty);
        btn.classList.add("added");
        setTimeout(() => btn.classList.remove("added"), 500);
      });
    });

    // favorite toggles on products / PDP
    document.querySelectorAll("[data-fav]").forEach(btn => {
      if (btn.hasAttribute("data-fav-open")) return;
      btn.addEventListener("click", e => {
        e.preventDefault();
        const on = toggleFav(resolveSnap(btn), btn);
        btn.classList.toggle("is-on", on);
      });
    });

    // header cart icon → open cart drawer
    document.querySelectorAll("a[data-i18n-aria='tool.cart'], a[aria-label='cart'], a[aria-label='Корзина']").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        openCart();
      });
    });
    // header heart (the .opt fav button) → open favorites drawer
    document.querySelectorAll("[data-i18n-aria='tool.fav'], button[aria-label='fav'], button[aria-label='Избранное']").forEach(b => {
      b.setAttribute("data-fav-open", "1");
      b.addEventListener("click", e => {
        e.preventDefault();
        openFav();
      });
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeAll();
    });
    // re-localize drawers + re-sync hearts on language change
    new MutationObserver(() => {
      renderCartBody();
      renderFavBody();
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });
  });
  window.BTT_CART = {
    openCart,
    openFav,
    addToCart
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/cart.js", error: String((e && e.message) || e) }); }

// assets/catalog-hero.js
try { (() => {
/* ============================================================
   BENTENTRADE — category-driven catalog hero
   Reads ?cat= (or #hash) and swaps the hero photo + copy,
   pre-filters the grid and highlights the matching chip.
   ============================================================ */
(function () {
  const LANGS = ["ru", "uz", "en"];

  // cat -> { img, filter(product data-cat or 'all'), ru/uz/en copy }
  const CFG = {
    all: {
      img: "https://loremflickr.com/800/800/rattan,furniture/all?lock=11",
      filter: "all",
      ru: {
        k: "Каталог",
        t: "Изделия из искусственного ротанга",
        s: "Садовая мебель, кашпо и корзины из искусственного ротанга — сделано вручную для дома, дачи и сада."
      },
      uz: {
        k: "Katalog",
        t: "Sun’iy rotang mahsulotlari",
        s: "Sun’iy rotangdan bog‘ mebeli, gultuvak va savatlar — uy, dala va bog‘ uchun qo‘lda tayyorlangan."
      },
      en: {
        k: "Catalog",
        t: "Synthetic-rattan range",
        s: "Garden furniture, planters and baskets in synthetic rattan — handmade for home, patio and garden."
      }
    },
    furniture: {
      img: "https://loremflickr.com/800/800/rattan,sofa/all?lock=11",
      filter: "furniture",
      ru: {
        k: "Садовая мебель",
        t: "Мебель для сада и террасы",
        s: "Диваны, кресла и обеденные группы из искусственного ротанга — всесезонные, на лёгком алюминиевом каркасе."
      },
      uz: {
        k: "Bog‘ mebeli",
        t: "Bog‘ va terassa mebeli",
        s: "Sun’iy rotangdan divan, kreslo va ovqat to‘plamlari — har faslga mos, yengil alyumin karkasda."
      },
      en: {
        k: "Garden furniture",
        t: "Furniture for garden & terrace",
        s: "Sofas, armchairs and dining sets in synthetic rattan — all-season, on a light aluminium frame."
      }
    },
    planter: {
      img: "https://loremflickr.com/800/800/wicker,planter/all?lock=4",
      filter: "planter",
      ru: {
        k: "Кашпо",
        t: "Кашпо из ротанга",
        s: "Плетёные кашпо с дренажом и вкладышем — для растений дома, на балконе и в саду."
      },
      uz: {
        k: "Gultuvak",
        t: "Rotang gultuvaklari",
        s: "Drenaj va vkladishli to‘qilgan gultuvaklar — uy, balkon va bog‘dagi o‘simliklar uchun."
      },
      en: {
        k: "Planters",
        t: "Rattan planters",
        s: "Woven planters with drainage and a liner — for plants at home, on the balcony and in the garden."
      }
    },
    basket: {
      img: "https://loremflickr.com/800/800/woven,basket/all?lock=34",
      filter: "basket",
      ru: {
        k: "Корзины и сундуки",
        t: "Сундуки и корзины для белья",
        s: "Плетёные сундуки и корзины с подкладкой и крышкой — для белья, пледов и хранения."
      },
      uz: {
        k: "Savat va sandiq",
        t: "Sandiq va kir savatlari",
        s: "Astar va qopqoqli to‘qilgan sandiq va savatlar — kir, pled va saqlash uchun."
      },
      en: {
        k: "Baskets & chests",
        t: "Chests & laundry baskets",
        s: "Woven chests and baskets with a liner and lid — for laundry, throws and storage."
      }
    },
    indoor: {
      img: "https://loremflickr.com/800/800/rattan,rocking,chair/all?lock=90",
      filter: "indoor",
      ru: {
        k: "Мебель для дома",
        t: "Мебель для дома из ротанга",
        s: "Кресла-качалки, столики, комоды и стеллажи из искусственного ротанга — для гостиной, спальни и балкона."
      },
      uz: {
        k: "Uy mebeli",
        t: "Rotangdan uy mebeli",
        s: "Tebranma kreslo, stol, komod va stellajlar — mehmonxona, yotoqxona va balkon uchun."
      },
      en: {
        k: "Home furniture",
        t: "Rattan home furniture",
        s: "Rocking chairs, coffee tables, dressers and shelving in synthetic rattan — for the living room, bedroom and balcony."
      }
    },
    rattan: {
      img: "https://loremflickr.com/800/800/rattan,weave/all?lock=21",
      filter: "all",
      ru: {
        k: "Материал",
        t: "Искусственный ротанг",
        s: "PE-ротанг выглядит как природное плетение, но не выгорает, не гниёт и служит годами."
      },
      uz: {
        k: "Material",
        t: "Sun’iy rotang",
        s: "PE-rotang tabiiy to‘quvga o‘xshaydi, lekin rangini yo‘qotmaydi, chirimaydi va yillar xizmat qiladi."
      },
      en: {
        k: "Material",
        t: "Synthetic rattan",
        s: "PE-rattan looks like natural weave but won't fade, won't rot and lasts for years."
      }
    }
  };
  function curLang() {
    const l = localStorage.getItem("btt_lang");
    return LANGS.includes(l) ? l : "ru";
  }
  function readCat() {
    const q = new URLSearchParams(location.search).get("cat");
    const h = (location.hash || "").replace("#", "");
    const c = q || h || "all";
    return CFG[c] ? c : "all";
  }
  let current = "all";
  function renderHero(cat) {
    current = CFG[cat] ? cat : "all";
    const cfg = CFG[current];
    const L = cfg[curLang()] || cfg.ru;
    const hero = document.querySelector(".page-hero--cat");
    if (!hero) return;
    const img = hero.querySelector(".page-hero__collage img");
    const k = hero.querySelector(".eyebrow");
    const t = hero.querySelector("h1");
    const s = hero.querySelector(".lead");
    if (img && cfg.img) {
      img.removeAttribute("onerror");
      img.src = cfg.img;
    }
    // detach from i18n so the language switcher doesn't overwrite our copy
    [k, t, s].forEach(el => el && el.removeAttribute("data-i18n"));
    if (k) k.textContent = L.k;
    if (t) t.textContent = L.t;
    if (s) s.textContent = L.s;
  }
  function filterGrid(cat) {
    const prod = CFG[cat] && CFG[cat].filter || "all";
    document.querySelectorAll("#catalog-grid [data-product]").forEach(card => {
      card.style.display = prod === "all" || card.dataset.cat === prod ? "" : "none";
    });
    document.querySelectorAll(".cat-chips .chip").forEach(c => {
      c.classList.toggle("is-active", c.dataset.cat === prod);
    });
    const cnt = document.querySelector(".cat-count span");
    if (cnt) {
      const shown = document.querySelectorAll("#catalog-grid [data-product]").length ? Array.from(document.querySelectorAll("#catalog-grid [data-product]")).filter(c => c.style.display !== "none").length : 0;
      cnt.textContent = shown;
    }
  }
  function go(cat, push) {
    renderHero(cat);
    filterGrid(cat);
    if (push) {
      const url = cat === "all" ? location.pathname : location.pathname + "?cat=" + cat;
      history.replaceState(null, "", url);
    }
  }
  document.addEventListener("DOMContentLoaded", function () {
    if (!document.querySelector(".page-hero--cat")) return;
    go(readCat(), false);

    // chip clicks → swap hero + url (runs after site.js's own filter handler)
    document.querySelectorAll(".cat-chips .chip").forEach(chip => {
      chip.addEventListener("click", () => go(chip.dataset.cat, true));
    });

    // language switch → re-render current category copy
    document.querySelectorAll(".lang button").forEach(b => {
      b.addEventListener("click", () => setTimeout(() => renderHero(current), 0));
    });
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/catalog-hero.js", error: String((e && e.message) || e) }); }

// assets/fx.js
try { (() => {
/* Bententrade — 3D interaction layer
   Pointer-tracked perspective tilt + specular glare on media cards.
   Disabled for touch devices and prefers-reduced-motion. */
(function () {
  "use strict";

  const mq = s => window.matchMedia && window.matchMedia(s).matches;
  if (mq("(prefers-reduced-motion: reduce)") || mq("(hover: none)")) return;
  function bind(el, max) {
    el.classList.add("tilt");
    // clip corners with clip-path (survives 3D transforms; overflow:hidden + border-radius does not)
    const r = getComputedStyle(el).borderRadius;
    if (r && r !== "0px") el.style.clipPath = "inset(0 round " + r + ")";
    const glare = document.createElement("span");
    glare.className = "tilt__glare";
    el.appendChild(glare);
    let raf = null,
      px = .5,
      py = .5;
    function frame() {
      const rx = (py - .5) * -2 * max;
      const ry = (px - .5) * 2 * max;
      el.style.transform = "perspective(1000px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) scale(1.012)";
      glare.style.background = "radial-gradient(circle at " + (px * 100).toFixed(1) + "% " + (py * 100).toFixed(1) + "%, rgba(255,255,255,.55), rgba(255,255,255,0) 55%)";
      raf = null;
    }
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width;
      py = (e.clientY - r.top) / r.height;
      el.classList.add("tilt--active");
      glare.style.opacity = .6;
      if (!raf) raf = requestAnimationFrame(frame);
    });
    el.addEventListener("mouseleave", () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
      el.classList.remove("tilt--active");
      el.style.transform = "";
      glare.style.opacity = 0;
    });
  }
  function run() {
    document.querySelectorAll(".product__media").forEach(el => bind(el, 6));
    document.querySelectorAll(".line-card__media").forEach(el => bind(el, 8));
    document.querySelectorAll(".pdp-stage").forEach(el => bind(el, 5));
    document.querySelectorAll(".material__img").forEach(el => bind(el, 4));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);else run();
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/fx.js", error: String((e && e.message) || e) }); }

// assets/hero.js
try { (() => {
/* ============================================================
   BENTENTRADE — hero (switchable worlds, reference layout)
   Worlds: garden furniture · home furniture · artificial rattan · planters & baskets
   Keeps the CAIRIS reference layout intact; only the content swaps.
   Multilingual (RU/UZ/EN); reacts to the global language switch.
   ============================================================ */
(function () {
  const SLIDES = [{
    cat: "furniture",
    mainImg: "https://loremflickr.com/800/800/rattan,sofa/all?lock=11",
    sideImg: "https://loremflickr.com/800/800/patio,furniture/all?lock=31",
    badge: {
      ru: "Живи на воздухе",
      uz: "Ochiq havoda yasha",
      en: "Live outdoors"
    },
    t1: {
      ru: "Мебель",
      uz: "Mebel",
      en: "Furniture"
    },
    t2: {
      ru: "для дачи и сада",
      uz: "dala va bog‘ uchun",
      en: "for patio & garden"
    },
    interior: {
      ru: "Садовая коллекция",
      uz: "Bog‘ to‘plami",
      en: "Garden collection"
    },
    bestS: {
      ru: "Лучшая мебель",
      uz: "Eng yaxshi mebel",
      en: "Best furniture"
    },
    bestB: {
      ru: "ДЛЯ ОТДЫХА НА ВОЗДУХЕ",
      uz: "OCHIQ HAVODA DAM OLISH",
      en: "FOR OUTDOOR LIVING"
    },
    store: {
      ru: "Смотреть садовую мебель",
      uz: "Bog‘ mebelini ko‘rish",
      en: "Shop garden furniture"
    },
    href: "catalog.html",
    stats: [{
      num: "10k",
      suf: "+",
      label: {
        ru: "Довольных клиентов",
        uz: "Mamnun mijozlar",
        en: "Happy clients"
      }
    }, {
      num: "12",
      suf: "+",
      label: {
        ru: "Лет на рынке",
        uz: "Yillik tajriba",
        en: "Years on market"
      }
    }, {
      num: "35",
      suf: "+",
      label: {
        ru: "Премиум-изделий",
        uz: "Premium mahsulot",
        en: "Premium pieces"
      }
    }]
  }, {
    cat: "indoor",
    mainImg: "https://loremflickr.com/800/800/rattan,cabinet/all?lock=95",
    sideImg: "https://loremflickr.com/800/800/rattan,rocking,chair/all?lock=90",
    badge: {
      ru: "Уют дома",
      uz: "Uy qulayligi",
      en: "Home comfort"
    },
    t1: {
      ru: "Мебель",
      uz: "Mebel",
      en: "Furniture"
    },
    t2: {
      ru: "для дома",
      uz: "uy uchun",
      en: "for the home"
    },
    interior: {
      ru: "Домашняя коллекция",
      uz: "Uy to‘plami",
      en: "Home collection"
    },
    bestS: {
      ru: "Ротанг в интерьере",
      uz: "Interyerda rotang",
      en: "Rattan indoors"
    },
    bestB: {
      ru: "ДЛЯ ГОСТИНОЙ И СПАЛЬНИ",
      uz: "MEHMONXONA VA YOTOQ UCHUN",
      en: "FOR LIVING & BEDROOM"
    },
    store: {
      ru: "Смотреть мебель для дома",
      uz: "Uy mebelini ko‘rish",
      en: "Shop home furniture"
    },
    href: "catalog.html",
    stats: [{
      num: "4",
      suf: "",
      label: {
        ru: "Вида изделий",
        uz: "Mahsulot turi",
        en: "Item types"
      }
    }, {
      num: "3",
      suf: "",
      label: {
        ru: "Размера",
        uz: "O‘lcham",
        en: "Sizes"
      }
    }, {
      num: "100",
      suf: "%",
      label: {
        ru: "Ручная работа",
        uz: "Qo‘l mehnati",
        en: "Handmade"
      }
    }]
  }, {
    cat: "rattan",
    mainImg: "https://loremflickr.com/800/800/rattan,weave/all?lock=21",
    sideImg: "https://loremflickr.com/800/800/wicker,chair/all?lock=2",
    badge: {
      ru: "Своё производство",
      uz: "O‘z ishlab chiqarish",
      en: "Own production"
    },
    t1: {
      ru: "Искусственный",
      uz: "Sun’iy",
      en: "Synthetic"
    },
    t2: {
      ru: "ротанг",
      uz: "rotang",
      en: "rattan"
    },
    interior: {
      ru: "Плетёная мебель",
      uz: "To‘qilgan mebel",
      en: "Woven furniture"
    },
    bestS: {
      ru: "Стойкий к погоде",
      uz: "Ob-havoga chidamli",
      en: "Weather-proof"
    },
    bestB: {
      ru: "СЛУЖИТ ГОДАМИ",
      uz: "YILLAB XIZMAT QILADI",
      en: "LASTS FOR YEARS"
    },
    store: {
      ru: "Смотреть ротанг",
      uz: "Rotangni ko‘rish",
      en: "Shop the rattan"
    },
    href: "catalog.html",
    stats: [{
      num: "50",
      suf: "+",
      label: {
        ru: "Моделей плетения",
        uz: "To‘quv modellari",
        en: "Weave models"
      }
    }, {
      num: "8",
      suf: "",
      label: {
        ru: "Лет на улице",
        uz: "Yil ko‘chada",
        en: "Years outdoors"
      }
    }, {
      num: "100",
      suf: "%",
      label: {
        ru: "Влагостойкость",
        uz: "Namlikka chidamli",
        en: "Water resistant"
      }
    }]
  }, {
    cat: "planter",
    mainImg: "https://loremflickr.com/800/800/woven,basket/all?lock=34",
    sideImg: "https://loremflickr.com/800/800/wicker,planter/all?lock=4",
    badge: {
      ru: "Уют в деталях",
      uz: "Tafsilotlardagi qulaylik",
      en: "Comfort in details"
    },
    t1: {
      ru: "Кашпо, сундуки",
      uz: "Gultuvak, sandiq",
      en: "Planters, chests"
    },
    t2: {
      ru: "и корзины для белья",
      uz: "va kir savatlari",
      en: "& laundry baskets"
    },
    interior: {
      ru: "Декор и хранение",
      uz: "Dekor va saqlash",
      en: "Decor & storage"
    },
    bestS: {
      ru: "Ручное плетение",
      uz: "Qo‘l to‘quvi",
      en: "Hand-woven"
    },
    bestB: {
      ru: "ДЛЯ ДОМА И ДАЧИ",
      uz: "UY VA DALA UCHUN",
      en: "FOR HOME & DACHA"
    },
    store: {
      ru: "Смотреть кашпо и корзины",
      uz: "Gultuvak va savatlar",
      en: "Shop planters & baskets"
    },
    href: "catalog.html",
    stats: [{
      num: "120",
      suf: "+",
      label: {
        ru: "Изделий в наличии",
        uz: "Mavjud mahsulot",
        en: "Items in stock"
      }
    }, {
      num: "6",
      suf: "",
      label: {
        ru: "Форм и размеров",
        uz: "Shakl va o‘lcham",
        en: "Shapes & sizes"
      }
    }, {
      num: "24",
      suf: "ч",
      label: {
        ru: "Отгрузка заказа",
        uz: "Buyurtma jo‘natish",
        en: "Order dispatch"
      }
    }]
  }];
  const root = document.querySelector("[data-hero]");
  if (!root || SLIDES.length < 2) return;
  const $ = s => root.querySelector(s);
  const els = {
    mainImgs: [$('[data-h="mainImg"]'), $('[data-h="mainImgB"]')],
    sideImgs: [$('[data-h="sideImg"]'), $('[data-h="sideImgB"]')],
    badge: $('[data-h="badge"]'),
    t1: $('[data-h="t1"]'),
    t2: $('[data-h="t2"]'),
    interior: $('[data-h="interior"]'),
    bestS: $('[data-h="bestS"]'),
    bestB: $('[data-h="bestB"]'),
    store: $('[data-h="store"]'),
    storeLink: $('[data-h="storeLink"]'),
    blob: $('.hero__blob'),
    blobInner: $('[data-h-inner]'),
    main: $('.hero__main'),
    photo: $('.hero__photo'),
    stats: $('[data-hero-stats]'),
    dots: $('[data-hero-dots]')
  };
  const statNum = [$('[data-h="s0n"]'), $('[data-h="s1n"]'), $('[data-h="s2n"]')];
  const statLbl = [$('[data-h="s0l"]'), $('[data-h="s1l"]'), $('[data-h="s2l"]')];
  let idx = 0,
    timer = null;
  const DUR = 7000;
  let lang = function () {
    var s = localStorage.getItem("btt_lang");
    return ["ru", "uz", "en"].includes(s) ? s : "ru";
  }();
  const L = o => o && (o[lang] || o.ru) || "";
  SLIDES.forEach((s, i) => {
    const b = document.createElement("button");
    b.className = "hero__sw-dot";
    b.setAttribute("aria-label", "Слайд " + (i + 1));
    b.addEventListener("click", () => go(i, true));
    els.dots.appendChild(b);
  });
  const dotEls = Array.from(els.dots.children);
  function anim() {
    [els.stats].forEach(el => {
      if (!el) return;
      el.classList.remove("is-swap");
      void el.offsetWidth;
      el.classList.add("is-swap");
    });
  }
  // crossfade two stacked <img> layers — old stays painted until new loads
  function crossfade(layers, src) {
    const on = layers.find(i => i.classList.contains("is-on")) || layers[0];
    const off = layers.find(i => i !== on);
    if (on.getAttribute("src") === src) {
      return;
    }
    const show = () => {
      off.classList.add("is-on");
      on.classList.remove("is-on");
      off.onload = null;
      off.onerror = null;
    };
    off.onload = show;
    off.onerror = show;
    off.src = src;
    if (off.complete && off.naturalWidth) show();
  }
  function render(animate) {
    const s = SLIDES[idx];
    crossfade(els.mainImgs, s.mainImg);
    crossfade(els.sideImgs, s.sideImg);
    els.badge.textContent = L(s.badge);
    els.t1.textContent = L(s.t1);
    els.t2.textContent = L(s.t2);
    els.interior.textContent = L(s.interior);
    els.bestS.textContent = L(s.bestS);
    els.bestB.textContent = L(s.bestB);
    els.store.textContent = L(s.store);
    els.storeLink.href = s.href + (s.cat ? "#" + s.cat : "");
    s.stats.forEach((st, i) => {
      if (!statNum[i]) return;
      statNum[i].innerHTML = st.num + "<span>" + (st.suf || "") + "</span>";
      statLbl[i].textContent = L(st.label);
    });
    dotEls.forEach((d, i) => d.classList.toggle("is-active", i === idx));
    if (animate) anim();
  }
  function go(n, user) {
    idx = (n + SLIDES.length) % SLIDES.length;
    render(true);
    if (user) start();
  }
  function next(user) {
    go(idx + 1, user);
  }
  function prev(user) {
    go(idx - 1, user);
  }
  function start() {
    stop();
    timer = setInterval(() => next(false), DUR);
  }
  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  root.querySelector("[data-hero-next]").addEventListener("click", () => next(true));
  root.querySelector("[data-hero-prev]").addEventListener("click", () => prev(true));
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  let sx = null;
  root.addEventListener("touchstart", e => {
    sx = e.touches[0].clientX;
  }, {
    passive: true
  });
  root.addEventListener("touchend", e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 45) {
      dx < 0 ? next(true) : prev(true);
    }
    sx = null;
  }, {
    passive: true
  });
  new MutationObserver(() => {
    const nl = document.documentElement.lang;
    if (nl && nl !== lang && ["ru", "uz", "en"].includes(nl)) {
      lang = nl;
      render(false);
    }
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });
  render(false);
  if (!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) start();
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/hero.js", error: String((e && e.message) || e) }); }

// assets/i18n.js
try { (() => {
/* ============================================================
   BENTENTRADE — i18n dictionary (RU / UZ / EN)
   Brand: artificial-rattan range — garden furniture, planters (kashpo),
   chests & laundry baskets. Tashkent, Uzbekistan + export.
   ============================================================ */
window.BTT_I18N = {
  ru: {
    "topbar.ship": "Бесплатная доставка по Узбекистану при заказе от $100",
    "nav.home": "Главная",
    "nav.catalog": "Каталог",
    "nav.about": "О нас",
    "nav.contacts": "Контакты",
    "tool.search": "Поиск",
    "tool.fav": "Избранное",
    "tool.cart": "Корзина",
    "tool.acc": "Аккаунт",
    "hero.badge": "Своё производство",
    "hero.title.1": "Искусственный",
    "hero.title.2": "ротанг",
    "hero.sub": "Садовая мебель, кашпо и корзины из искусственного ротанга — плетём вручную, служит годами.",
    "hero.store": "Перейти в онлайн-магазин",
    "hero.interior": "Плетёная мебель",
    "hero.best.s": "Стойко к погоде",
    "hero.best.b": "СЛУЖИТ ГОДАМИ",
    "stat.clients": "Довольных клиентов",
    "stat.projects": "Изделий в каталоге",
    "stat.premium": "Моделей плетения",
    "promo.consult": "100% бесплатная\nконсультация по подбору",
    "promo.price": "Гарантия лучшей цены",
    "cat.eyebrow": "Коллекция",
    "cat.title.1": "Сделано из",
    "cat.title.2": "искусственного ротанга",
    "lines.eyebrow": "Направления",
    "lines.title": "Что мы производим",
    "line.rattan": "Искусственный ротанг",
    "line.planter": "Кашпо",
    "line.twist": "Сундуки и корзины",
    "line.furniture": "Садовая мебель",
    "line.onreq": "Хит",
    "line.indoor": "Мебель для дома",
    "line.new": "Новое",
    "chip.all": "Всё",
    "chip.furniture": "Садовая мебель",
    "chip.planter": "Кашпо",
    "chip.basket": "Корзины и сундуки",
    "chip.indoor": "Мебель для дома",
    "see": "Подробнее",
    "cat.furniture": "Садовая мебель",
    "cat.planter": "Кашпо",
    "cat.basket": "Корзины и сундуки",
    "cat.indoor": "Мебель для дома",
    "p1.name": "Садовый диван «Лагуна»",
    "p1.cat": "Садовая мебель",
    "p2.name": "Кресло «Бали»",
    "p2.cat": "Садовая мебель",
    "p3.name": "Кашпо «Колонна»",
    "p3.cat": "Кашпо",
    "split.title": "Обустройте сад и террасу мебелью, которой не страшна погода",
    "split.body": "Искусственный ротанг сочетает вид настоящего плетения с прочностью полимера: он не выгорает на солнце, не трескается на морозе и не требует особого ухода — достаточно протереть влажной тканью.",
    "mat.title.1": "Искусственный ротанг —",
    "mat.title.2": "материал, который служит",
    "mat.body": "Полиэтиленовое волокно (PE-ротанг) выглядит как природное плетение, но не гниёт, выдерживает солнце и мороз и полностью безопасно. Выбирайте цвет плетения и форму — под террасу, балкон или интерьер.",
    "mat.cta": "О материале",
    "final.badge": "Плетение, которое живёт годами",
    "final.title.1": "Сделано из",
    "final.title.2": "искусственного",
    "final.title.3": "ротанга",
    "foot.tag": "Мебель, кашпо и корзины из искусственного ротанга — для сада, террасы и дома. С 2024 года.",
    "foot.menu": "Меню",
    "foot.help": "Помощь",
    "foot.contacts": "Контакты",
    "foot.faq": "Вопросы и ответы",
    "foot.delivery": "Доставка",
    "foot.returns": "Возврат",
    "foot.care": "Уход за плетением",
    "foot.since": "С 2024 ГОДА",
    "foot.copy": "© 2026 BENTENTRADE. ВСЕ ПРАВА ЗАЩИЩЕНЫ.",
    "foot.privacy": "ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ",
    /* catalog */
    "cat.hero.k": "Каталог",
    "cat.hero.title": "Изделия из искусственного ротанга",
    "cat.hero.sub": "Садовая мебель, кашпо и корзины из искусственного ротанга — сделано вручную для дома, дачи и сада.",
    "cat.filter": "Фильтр",
    "cat.sort": "Сортировка",
    "cat.results": "товаров",
    "cat.hero.cta": "К товарам",
    "cat.hero.t1": "изделий в наличии",
    "cat.hero.t2": "направления",
    "cat.hero.t3": "отгрузка",
    "p4.name": "Обеденная группа «Терраса»",
    "p4.cat": "Садовая мебель",
    "p5.name": "Кресло «Ривьера»",
    "p5.cat": "Садовая мебель",
    "p6.name": "Сундук «Сафари»",
    "p6.cat": "Корзины и сундуки",
    "p7.name": "Кашпо «Орбита»",
    "p7.cat": "Кашпо",
    "p8.name": "Стул «Сад»",
    "p8.cat": "Садовая мебель",
    "p9.name": "Кашпо «Дюна», комплект",
    "p9.cat": "Кашпо",
    "p10.name": "Угловой диван «Оазис»",
    "p10.cat": "Садовая мебель",
    "p11.name": "Корзина для белья «Лён»",
    "p11.cat": "Корзины и сундуки",
    "p12.name": "Кресло-качалка «Уют»",
    "p12.cat": "Мебель для дома",
    "p13.name": "Журнальный столик «Ротанг»",
    "p13.cat": "Мебель для дома",
    "p14.name": "Комод «Плетёнка»",
    "p14.cat": "Мебель для дома",
    "p15.name": "Стеллаж «Ажур»",
    "p15.cat": "Мебель для дома",
    "cat.load": "Показать ещё",
    /* about */
    "ab.hero.k": "О компании",
    "ab.hero.title": "Искусственный ротанг, сплетённый вручную",
    "ab.hero.sub": "Bententrade — мастерская плетения из искусственного ротанга: садовая мебель, кашпо, сундуки и корзины, собранные руками в Ташкенте.",
    "ab.story.k": "Наша история",
    "ab.story.title": "От нити ротанга до мебели, которой не страшны годы и погода",
    "ab.story.body1": "Мы начали в 2024 году с простой идеи: плетёная мебель должна служить десятилетиями и не бояться улицы. Поэтому мы плетём не из натурального, а из искусственного ротанга — полиэтиленового волокна, которое выглядит как настоящее, но не выгорает и не трескается.",
    "ab.story.body2": "Сегодня Bententrade — это команда мастеров плетения и дизайнеров. Садовая мебель, кашпо и корзины — от первого эскиза до доставки к вам домой.",
    "ab.v.k": "Принципы",
    "ab.v.title": "Во что мы верим",
    "ab.v1.t": "Честный материал",
    "ab.v1.b": "Только качественный PE-ротанг и алюминий. Никакой хрупкой пластмассы под видом плетения.",
    "ab.v2.t": "Ручное плетение",
    "ab.v2.b": "Каждое изделие плетётся вручную по нити — ровный рисунок и плотная посадка.",
    "ab.v3.t": "Всесезонность",
    "ab.v3.b": "Не боится солнца, дождя и мороза — мебель остаётся на улице круглый год.",
    "ab.v4.t": "Уход за минуту",
    "ab.v4.b": "Достаточно протереть влажной тканью — ни лака, ни пропиток.",
    "ab.cta": "Связаться с нами",
    /* contacts */
    "co.hero.k": "Контакты",
    "co.hero.title": "Давайте обсудим ваш заказ",
    "co.hero.sub": "Оставьте заявку — и наш менеджер подберёт изделие, рассчитает доставку и оформит заказ в мессенджере.",
    "co.f.name": "Имя",
    "co.f.name.ph": "Как к вам обращаться",
    "co.f.email": "Email",
    "co.f.email.ph": "you@email.com",
    "co.f.phone": "Телефон",
    "co.f.phone.ph": "+998 ...",
    "co.f.msg": "Сообщение",
    "co.f.msg.ph": "Что вы ищете — мебель, кашпо или корзину?",
    "co.f.send": "Отправить заявку",
    "co.f.sent": "Спасибо! Мы свяжемся с вами.",
    "co.i.addr.t": "Шоурум",
    "co.i.addr.v": "Ташкент, ул. Амира Темура, 15",
    "co.i.phone.t": "Телефон",
    "co.i.phone.v": "+998 71 200 18 46",
    "co.i.email.t": "Почта",
    "co.i.email.v": "hello@bententrade.uz",
    "co.i.hours.t": "Часы работы",
    "co.i.hours.v": "Пн–Сб, 10:00 – 20:00"
  },
  uz: {
    "topbar.ship": "$100 dan ortiq buyurtmalarga O‘zbekiston bo‘ylab bepul yetkazib berish",
    "nav.home": "Bosh sahifa",
    "nav.catalog": "Katalog",
    "nav.about": "Biz haqimizda",
    "nav.contacts": "Kontaktlar",
    "tool.search": "Qidiruv",
    "tool.fav": "Sevimlilar",
    "tool.cart": "Savatcha",
    "tool.acc": "Profil",
    "hero.badge": "O‘z ishlab chiqarish",
    "hero.title.1": "Sun’iy",
    "hero.title.2": "rotang",
    "hero.sub": "Sun’iy rotangdan bog‘ mebeli, gultuvak va savatlar — qo‘lda to‘qiymiz, yillar xizmat qiladi.",
    "hero.store": "Onlayn do‘konga o‘tish",
    "hero.interior": "To‘qilgan mebel",
    "hero.best.s": "Ob-havoga chidamli",
    "hero.best.b": "YILLAB XIZMAT QILADI",
    "stat.clients": "Mamnun mijozlar",
    "stat.projects": "Katalogdagi mahsulot",
    "stat.premium": "To‘quv modellari",
    "promo.consult": "100% bepul\ntanlov bo‘yicha maslahat",
    "promo.price": "Eng yaxshi narx kafolati",
    "cat.eyebrow": "Kolleksiya",
    "cat.title.1": "Sun’iy rotangdan",
    "cat.title.2": "yasalgan",
    "lines.eyebrow": "Yo‘nalishlar",
    "lines.title": "Biz nima ishlab chiqaramiz",
    "line.rattan": "Sun’iy rotang",
    "line.planter": "Gultuvak",
    "line.twist": "Sandiq va savatlar",
    "line.furniture": "Bog‘ mebeli",
    "line.onreq": "Xit",
    "line.indoor": "Uy mebeli",
    "line.new": "Yangi",
    "chip.all": "Hammasi",
    "chip.furniture": "Bog‘ mebeli",
    "chip.planter": "Gultuvak",
    "chip.basket": "Savat va sandiq",
    "chip.indoor": "Uy mebeli",
    "see": "Batafsil",
    "cat.furniture": "Bog‘ mebeli",
    "cat.planter": "Gultuvak",
    "cat.basket": "Savat va sandiq",
    "cat.indoor": "Uy mebeli",
    "p1.name": "«Laguna» bog‘ divani",
    "p1.cat": "Bog‘ mebeli",
    "p2.name": "«Bali» kreslo",
    "p2.cat": "Bog‘ mebeli",
    "p3.name": "«Kolonna» gultuvak",
    "p3.cat": "Gultuvak",
    "split.title": "Bog‘ va terassangizni ob-havodan qo‘rqmaydigan mebel bilan jihozlang",
    "split.body": "Sun’iy rotang haqiqiy to‘quv ko‘rinishini polimer mustahkamligi bilan birlashtiradi: quyoshda rangi o‘chmaydi, sovuqda yorilmaydi va alohida parvarish talab qilmaydi — nam mato bilan artish kifoya.",
    "mat.title.1": "Sun’iy rotang —",
    "mat.title.2": "uzoq xizmat qiladigan material",
    "mat.body": "Polietilen tola (PE-rotang) tabiiy to‘quvga o‘xshaydi, lekin chirimaydi, quyosh va sovuqqa chidaydi va to‘liq xavfsiz. To‘quv rangi va shaklini tanlang — terassa, balkon yoki interyer uchun.",
    "mat.cta": "Material haqida",
    "final.badge": "Yillar yashaydigan to‘quv",
    "final.title.1": "Sun’iy",
    "final.title.2": "rotangdan",
    "final.title.3": "yasalgan",
    "foot.tag": "Sun’iy rotangdan mebel, gultuvak va savatlar — bog‘, terassa va uy uchun. 2024 yildan.",
    "foot.menu": "Menyu",
    "foot.help": "Yordam",
    "foot.contacts": "Kontaktlar",
    "foot.faq": "Savol-javob",
    "foot.delivery": "Yetkazib berish",
    "foot.returns": "Qaytarish",
    "foot.care": "To‘quv parvarishi",
    "foot.since": "2024 YILDAN",
    "foot.copy": "© 2026 BENTENTRADE. BARCHA HUQUQLAR HIMOYALANGAN.",
    "foot.privacy": "MAXFIYLIK SIYOSATI",
    "cat.hero.k": "Katalog",
    "cat.hero.title": "Sun’iy rotang mahsulotlari",
    "cat.hero.sub": "Sun’iy rotangdan bog‘ mebeli, gultuvak va savatlar — uy, dala va bog‘ uchun qo‘lda tayyorlangan.",
    "cat.filter": "Filtr",
    "cat.sort": "Saralash",
    "cat.results": "mahsulot",
    "cat.hero.cta": "Mahsulotlarga",
    "cat.hero.t1": "mavjud mahsulot",
    "cat.hero.t2": "yo‘nalish",
    "cat.hero.t3": "jo‘natish",
    "p4.name": "«Terrasa» ovqat to‘plami",
    "p4.cat": "Bog‘ mebeli",
    "p5.name": "«Rivyera» kreslo",
    "p5.cat": "Bog‘ mebeli",
    "p6.name": "«Safari» sandiq",
    "p6.cat": "Savat va sandiq",
    "p7.name": "«Orbita» gultuvak",
    "p7.cat": "Gultuvak",
    "p8.name": "«Sad» stul",
    "p8.cat": "Bog‘ mebeli",
    "p9.name": "«Dyuna» gultuvak, to‘plam",
    "p9.cat": "Gultuvak",
    "p10.name": "«Oazis» burchak divani",
    "p10.cat": "Bog‘ mebeli",
    "p11.name": "«Len» kir savati",
    "p11.cat": "Savat va sandiq",
    "p12.name": "«Uyut» tebranma kreslo",
    "p12.cat": "Uy mebeli",
    "p13.name": "«Rotang» jurnal stoli",
    "p13.cat": "Uy mebeli",
    "p14.name": "«Pletenka» komod",
    "p14.cat": "Uy mebeli",
    "p15.name": "«Ajur» stellaj",
    "p15.cat": "Uy mebeli",
    "cat.load": "Yana ko‘rsatish",
    "ab.hero.k": "Kompaniya haqida",
    "ab.hero.title": "Qo‘lda to‘qilgan sun’iy rotang",
    "ab.hero.sub": "Bententrade — sun’iy rotangdan to‘quv ustaxonasi: bog‘ mebeli, gultuvak, sandiq va savatlar Toshkentda qo‘lda yig‘iladi.",
    "ab.story.k": "Bizning tariximiz",
    "ab.story.title": "Rotang tolasidan yillar va ob-havodan qo‘rqmaydigan mebelgacha",
    "ab.story.body1": "Biz 2024 yilda oddiy g‘oya bilan boshladik: to‘qilgan mebel o‘nlab yillar xizmat qilishi va ko‘chadan qo‘rqmasligi kerak. Shuning uchun biz tabiiy emas, sun’iy rotangdan — haqiqiyga o‘xshaydigan, lekin rangini yo‘qotmaydigan va yorilmaydigan polietilen toladan to‘qiymiz.",
    "ab.story.body2": "Bugun Bententrade — to‘quv ustalari va dizaynerlar jamoasi. Bog‘ mebeli, gultuvak va savatlar — birinchi eskizdan uyingizga yetkazishgacha.",
    "ab.v.k": "Tamoyillar",
    "ab.v.title": "Biz nimaga ishonamiz",
    "ab.v1.t": "Halol material",
    "ab.v1.b": "Faqat sifatli PE-rotang va alyumin. To‘quv niqobidagi mo‘rt plastmassa yo‘q.",
    "ab.v2.t": "Qo‘l to‘quvi",
    "ab.v2.b": "Har bir buyum tola bo‘ylab qo‘lda to‘qiladi — tekis naqsh va zich o‘rnashish.",
    "ab.v3.t": "Har faslga mos",
    "ab.v3.b": "Quyosh, yomg‘ir va sovuqdan qo‘rqmaydi — mebel yil bo‘yi ko‘chada turadi.",
    "ab.v4.t": "Bir daqiqalik parvarish",
    "ab.v4.b": "Nam mato bilan artish kifoya — lak ham, qoplama ham kerak emas.",
    "ab.cta": "Biz bilan bog‘lanish",
    "co.hero.k": "Kontaktlar",
    "co.hero.title": "Buyurtmangizni muhokama qilaylik",
    "co.hero.sub": "Ariza qoldiring — menejerimiz mahsulot tanlaydi, yetkazishni hisoblaydi va buyurtmani messenjerda rasmiylashtiradi.",
    "co.f.name": "Ism",
    "co.f.name.ph": "Sizga qanday murojaat qilaylik",
    "co.f.email": "Email",
    "co.f.email.ph": "you@email.com",
    "co.f.phone": "Telefon",
    "co.f.phone.ph": "+998 ...",
    "co.f.msg": "Xabar",
    "co.f.msg.ph": "Nima izlayapsiz — mebel, gultuvak yoki savat?",
    "co.f.send": "Ariza yuborish",
    "co.f.sent": "Rahmat! Tez orada bog‘lanamiz.",
    "co.i.addr.t": "Shourum",
    "co.i.addr.v": "Toshkent, Amir Temur ko‘chasi, 15",
    "co.i.phone.t": "Telefon",
    "co.i.phone.v": "+998 71 200 18 46",
    "co.i.email.t": "Pochta",
    "co.i.email.v": "hello@bententrade.uz",
    "co.i.hours.t": "Ish vaqti",
    "co.i.hours.v": "Du–Sh, 10:00 – 20:00"
  },
  en: {
    "topbar.ship": "Free shipping across Uzbekistan on orders over $100",
    "nav.home": "Home",
    "nav.catalog": "Catalog",
    "nav.about": "About",
    "nav.contacts": "Contacts",
    "tool.search": "Search",
    "tool.fav": "Wishlist",
    "tool.cart": "Cart",
    "tool.acc": "Account",
    "hero.badge": "Own production",
    "hero.title.1": "Synthetic",
    "hero.title.2": "rattan",
    "hero.sub": "Garden furniture, planters and baskets in synthetic rattan — hand-woven to last for years.",
    "hero.store": "Go to the online store",
    "hero.interior": "Woven furniture",
    "hero.best.s": "Weather-proof",
    "hero.best.b": "LASTS FOR YEARS",
    "stat.clients": "Happy clients",
    "stat.projects": "Items in catalog",
    "stat.premium": "Weave models",
    "promo.consult": "100% free\nproduct-match consultation",
    "promo.price": "Price match guarantee",
    "cat.eyebrow": "Collection",
    "cat.title.1": "Made from",
    "cat.title.2": "synthetic rattan",
    "lines.eyebrow": "Categories",
    "lines.title": "What we produce",
    "line.rattan": "Synthetic rattan",
    "line.planter": "Planters",
    "line.twist": "Chests & baskets",
    "line.furniture": "Garden furniture",
    "line.onreq": "Top pick",
    "line.indoor": "Home furniture",
    "line.new": "New",
    "chip.all": "All",
    "chip.furniture": "Garden furniture",
    "chip.planter": "Planters",
    "chip.basket": "Baskets & chests",
    "chip.indoor": "Home furniture",
    "see": "See details",
    "cat.furniture": "Garden furniture",
    "cat.planter": "Planter",
    "cat.basket": "Baskets & chests",
    "cat.indoor": "Home furniture",
    "p1.name": "Laguna Garden Sofa",
    "p1.cat": "Garden furniture",
    "p2.name": "Bali Lounge Chair",
    "p2.cat": "Garden furniture",
    "p3.name": "Colonna Planter",
    "p3.cat": "Planter",
    "split.title": "Furnish your garden and terrace with furniture that laughs at the weather",
    "split.body": "Synthetic rattan combines the look of real weave with the strength of polymer: it won't fade in the sun, crack in frost or demand special care — a wipe with a damp cloth is enough.",
    "mat.title.1": "Synthetic rattan —",
    "mat.title.2": "a material that lasts",
    "mat.body": "Polyethylene fibre (PE-rattan) looks like natural weave but never rots, withstands sun and frost and is completely safe. Choose the weave colour and shape — for the terrace, balcony or interior.",
    "mat.cta": "About the material",
    "final.badge": "A weave that lasts for years",
    "final.title.1": "Made from",
    "final.title.2": "synthetic",
    "final.title.3": "rattan",
    "foot.tag": "Furniture, planters and baskets in synthetic rattan — for garden, terrace and home. Since 2024.",
    "foot.menu": "Menu",
    "foot.help": "Help",
    "foot.contacts": "Contacts",
    "foot.faq": "FAQ",
    "foot.delivery": "Delivery",
    "foot.returns": "Returns",
    "foot.care": "Weave care",
    "foot.since": "SINCE 2024",
    "foot.copy": "© 2026 BENTENTRADE. ALL RIGHTS RESERVED.",
    "foot.privacy": "PRIVACY POLICY",
    "cat.hero.k": "Catalog",
    "cat.hero.title": "Synthetic-rattan range",
    "cat.hero.sub": "Garden furniture, planters and baskets in synthetic rattan — handmade for home, patio and garden.",
    "cat.filter": "Filter",
    "cat.sort": "Sort",
    "cat.results": "products",
    "cat.hero.cta": "Browse products",
    "cat.hero.t1": "items in stock",
    "cat.hero.t2": "categories",
    "cat.hero.t3": "dispatch",
    "p4.name": "Terrace Dining Set",
    "p4.cat": "Garden furniture",
    "p5.name": "Riviera Armchair",
    "p5.cat": "Garden furniture",
    "p6.name": "Safari Chest",
    "p6.cat": "Baskets & chests",
    "p7.name": "Orbita Planter",
    "p7.cat": "Planter",
    "p8.name": "Sad Garden Chair",
    "p8.cat": "Garden furniture",
    "p9.name": "Dune Planter Set",
    "p9.cat": "Planter",
    "p10.name": "Oasis Corner Sofa",
    "p10.cat": "Garden furniture",
    "p11.name": "Len Laundry Basket",
    "p11.cat": "Baskets & chests",
    "p12.name": "Uyut Rocking Chair",
    "p12.cat": "Home furniture",
    "p13.name": "Rattan Coffee Table",
    "p13.cat": "Home furniture",
    "p14.name": "Pletenka Dresser",
    "p14.cat": "Home furniture",
    "p15.name": "Azhur Shelving Unit",
    "p15.cat": "Home furniture",
    "cat.load": "Load more",
    "ab.hero.k": "About us",
    "ab.hero.title": "Synthetic rattan, woven by hand",
    "ab.hero.sub": "Bententrade is a synthetic-rattan weaving workshop: garden furniture, planters, chests and baskets, assembled by hand in Tashkent.",
    "ab.story.k": "Our story",
    "ab.story.title": "From a rattan strand to furniture that shrugs off years and weather",
    "ab.story.body1": "We started in 2024 with a simple idea: woven furniture should last for decades and not fear the outdoors. So we weave not with natural but with synthetic rattan — a polyethylene fibre that looks like the real thing but won't fade or crack.",
    "ab.story.body2": "Today Bententrade is a team of weavers and designers. Garden furniture, planters and baskets — from the first sketch to delivery at your door.",
    "ab.v.k": "Principles",
    "ab.v.title": "What we believe in",
    "ab.v1.t": "Honest material",
    "ab.v1.b": "Only quality PE-rattan and aluminium. No brittle plastic pretending to be weave.",
    "ab.v2.t": "Hand-woven",
    "ab.v2.b": "Every piece is woven by hand, strand by strand — an even pattern and a tight fit.",
    "ab.v3.t": "All-season",
    "ab.v3.b": "Unfazed by sun, rain and frost — the furniture stays outdoors all year round.",
    "ab.v4.t": "One-minute care",
    "ab.v4.b": "A wipe with a damp cloth is all it takes — no varnish, no treatments.",
    "ab.cta": "Get in touch",
    "co.hero.k": "Contacts",
    "co.hero.title": "Let’s talk about your order",
    "co.hero.sub": "Leave a request and our manager will pick the right piece, work out delivery and place the order in your messenger.",
    "co.f.name": "Name",
    "co.f.name.ph": "How should we call you",
    "co.f.email": "Email",
    "co.f.email.ph": "you@email.com",
    "co.f.phone": "Phone",
    "co.f.phone.ph": "+998 ...",
    "co.f.msg": "Message",
    "co.f.msg.ph": "What are you after — furniture, a planter or a basket?",
    "co.f.send": "Send request",
    "co.f.sent": "Thank you! We’ll be in touch.",
    "co.i.addr.t": "Showroom",
    "co.i.addr.v": "Tashkent, Amir Temur St. 15",
    "co.i.phone.t": "Phone",
    "co.i.phone.v": "+998 71 200 18 46",
    "co.i.email.t": "Email",
    "co.i.email.v": "hello@bententrade.uz",
    "co.i.hours.t": "Opening hours",
    "co.i.hours.v": "Mon–Sat, 10:00 – 20:00"
  }
};

/* ---- search overlay ---- */
Object.assign(window.BTT_I18N.ru, {
  "srch.ph": "Поиск мебели, кашпо, корзин…",
  "srch.cats": "Категории",
  "srch.prods": "Товары",
  "srch.pages": "Страницы",
  "srch.empty": "Ничего не найдено",
  "nav.catalog2": "Каталог",
  "nav.account2": "Личный кабинет"
});
Object.assign(window.BTT_I18N.uz, {
  "srch.ph": "Mebel, gultuvak, savat izlash…",
  "srch.cats": "Kategoriyalar",
  "srch.prods": "Mahsulotlar",
  "srch.pages": "Sahifalar",
  "srch.empty": "Hech narsa topilmadi",
  "nav.catalog2": "Katalog",
  "nav.account2": "Shaxsiy kabinet"
});
Object.assign(window.BTT_I18N.en, {
  "srch.ph": "Search furniture, planters, baskets…",
  "srch.cats": "Categories",
  "srch.prods": "Products",
  "srch.pages": "Pages",
  "srch.empty": "Nothing found",
  "nav.catalog2": "Catalog",
  "nav.account2": "Account"
});
Object.assign(window.BTT_I18N.ru, {
  "tool.theme": "Тема",
  "tool.account": "Аккаунт"
});
Object.assign(window.BTT_I18N.uz, {
  "tool.theme": "Mavzu",
  "tool.account": "Akkaunt"
});
Object.assign(window.BTT_I18N.en, {
  "tool.theme": "Theme",
  "tool.account": "Account"
});

/* ---- account page ---- */
Object.assign(window.BTT_I18N.ru, {
  "acc.tier": "Постоянный клиент",
  "acc.nav.overview": "Обзор",
  "acc.nav.orders": "Заказы",
  "acc.nav.wishlist": "Избранное",
  "acc.nav.addresses": "Адреса",
  "acc.nav.settings": "Настройки",
  "acc.nav.logout": "Выйти",
  "acc.ov.hi": "Здравствуйте,",
  "acc.ov.sub": "Рады видеть вас снова. Вот сводка по вашему аккаунту.",
  "acc.ov.s1": "Всего заказов",
  "acc.ov.s2": "В избранном",
  "acc.ov.s3": "Бонусных баллов",
  "acc.ov.recent": "Последние заказы",
  "acc.ov.all": "Все заказы",
  "acc.st.ship": "В пути",
  "acc.st.done": "Доставлен",
  "acc.st.proc": "В обработке",
  "acc.items1": "1 товар",
  "acc.items2": "2 товара",
  "acc.items3": "3 товара",
  "acc.ord.sub": "История ваших покупок и их статусы.",
  "acc.ord.deliver": "доставка 18–20 июня",
  "acc.ord.delivered": "доставлен 6 июня",
  "acc.ord.track": "Отследить",
  "acc.ord.repeat": "Повторить заказ",
  "acc.ord.review": "Оставить отзыв",
  "acc.wish.sub": "Товары, которые вы сохранили на потом.",
  "acc.addr.sub": "Адреса доставки для быстрого оформления.",
  "acc.addr.edit": "Изменить",
  "acc.addr.default": "Адрес по умолчанию",
  "acc.addr.office": "Офис",
  "acc.addr.add": "Добавить адрес",
  "acc.set.sub": "Личные данные и предпочтения.",
  "acc.set.personal": "Личные данные",
  "acc.set.name": "Имя",
  "acc.set.email": "Email",
  "acc.set.phone": "Телефон",
  "acc.set.save": "Сохранить изменения",
  "acc.set.saved": "Изменения сохранены ✓",
  "acc.set.prefs": "Предпочтения",
  "acc.set.theme": "Тема оформления",
  "acc.set.themehint": "Светлая / Тёмная",
  "acc.set.switch": "Переключить",
  "acc.set.lang": "Язык",
  "acc.set.news": "Рассылка",
  "acc.set.newson": "Новинки и акции — включено"
});
Object.assign(window.BTT_I18N.uz, {
  "acc.tier": "Doimiy mijoz",
  "acc.nav.overview": "Umumiy",
  "acc.nav.orders": "Buyurtmalar",
  "acc.nav.wishlist": "Sevimlilar",
  "acc.nav.addresses": "Manzillar",
  "acc.nav.settings": "Sozlamalar",
  "acc.nav.logout": "Chiqish",
  "acc.ov.hi": "Salom,",
  "acc.ov.sub": "Sizni yana ko‘rganimizdan xursandmiz. Akkaunt holati:",
  "acc.ov.s1": "Jami buyurtmalar",
  "acc.ov.s2": "Sevimlilarda",
  "acc.ov.s3": "Bonus ballari",
  "acc.ov.recent": "So‘nggi buyurtmalar",
  "acc.ov.all": "Barchasi",
  "acc.st.ship": "Yo‘lda",
  "acc.st.done": "Yetkazilgan",
  "acc.st.proc": "Tayyorlanmoqda",
  "acc.items1": "1 mahsulot",
  "acc.items2": "2 mahsulot",
  "acc.items3": "3 mahsulot",
  "acc.ord.sub": "Xaridlaringiz tarixi va holati.",
  "acc.ord.deliver": "yetkazish 18–20 iyun",
  "acc.ord.delivered": "6 iyunda yetkazildi",
  "acc.ord.track": "Kuzatish",
  "acc.ord.repeat": "Takrorlash",
  "acc.ord.review": "Sharh qoldirish",
  "acc.wish.sub": "Keyinroq uchun saqlangan mahsulotlar.",
  "acc.addr.sub": "Tez rasmiylashtirish uchun manzillar.",
  "acc.addr.edit": "Tahrirlash",
  "acc.addr.default": "Asosiy manzil",
  "acc.addr.office": "Ofis",
  "acc.addr.add": "Manzil qo‘shish",
  "acc.set.sub": "Shaxsiy ma’lumotlar va sozlamalar.",
  "acc.set.personal": "Shaxsiy ma’lumotlar",
  "acc.set.name": "Ism",
  "acc.set.email": "Email",
  "acc.set.phone": "Telefon",
  "acc.set.save": "Saqlash",
  "acc.set.saved": "O‘zgarishlar saqlandi ✓",
  "acc.set.prefs": "Sozlamalar",
  "acc.set.theme": "Mavzu",
  "acc.set.themehint": "Yorug‘ / Qorong‘i",
  "acc.set.switch": "Almashtirish",
  "acc.set.lang": "Til",
  "acc.set.news": "Xabarnoma",
  "acc.set.newson": "Yangiliklar va aksiyalar — yoqilgan"
});
Object.assign(window.BTT_I18N.en, {
  "acc.tier": "Loyal customer",
  "acc.nav.overview": "Overview",
  "acc.nav.orders": "Orders",
  "acc.nav.wishlist": "Wishlist",
  "acc.nav.addresses": "Addresses",
  "acc.nav.settings": "Settings",
  "acc.nav.logout": "Sign out",
  "acc.ov.hi": "Hello,",
  "acc.ov.sub": "Good to see you again. Here is your account summary.",
  "acc.ov.s1": "Total orders",
  "acc.ov.s2": "In wishlist",
  "acc.ov.s3": "Bonus points",
  "acc.ov.recent": "Recent orders",
  "acc.ov.all": "All orders",
  "acc.st.ship": "In transit",
  "acc.st.done": "Delivered",
  "acc.st.proc": "Processing",
  "acc.items1": "1 item",
  "acc.items2": "2 items",
  "acc.items3": "3 items",
  "acc.ord.sub": "Your purchase history and statuses.",
  "acc.ord.deliver": "delivery Jun 18–20",
  "acc.ord.delivered": "delivered Jun 6",
  "acc.ord.track": "Track",
  "acc.ord.repeat": "Reorder",
  "acc.ord.review": "Leave a review",
  "acc.wish.sub": "Items you saved for later.",
  "acc.addr.sub": "Delivery addresses for faster checkout.",
  "acc.addr.edit": "Edit",
  "acc.addr.default": "Default address",
  "acc.addr.office": "Office",
  "acc.addr.add": "Add address",
  "acc.set.sub": "Personal details and preferences.",
  "acc.set.personal": "Personal details",
  "acc.set.name": "Name",
  "acc.set.email": "Email",
  "acc.set.phone": "Phone",
  "acc.set.save": "Save changes",
  "acc.set.saved": "Changes saved ✓",
  "acc.set.prefs": "Preferences",
  "acc.set.theme": "Theme",
  "acc.set.themehint": "Light / Dark",
  "acc.set.switch": "Switch",
  "acc.set.lang": "Language",
  "acc.set.news": "Newsletter",
  "acc.set.newson": "News & deals — enabled"
});

/* ---- product detail (PDP) — desc & spec values are filled from products.js per category ---- */
Object.assign(window.BTT_I18N.ru, {
  "pdp.crumb.home": "Главная",
  "pdp.rate": "4.9 · 128 отзывов",
  "pdp.save": "Экономия $125",
  "pdp.desc": "Изделие из искусственного ротанга ручного плетения — не выгорает, не боится влаги и служит годами.",
  "pdp.opt.finish": "Цвет плетения",
  "pdp.opt.size": "Размер",
  "pdp.fin.natural": "Графит",
  "pdp.fin.walnut": "Бежевый",
  "pdp.fin.smoke": "Мокко",
  "pdp.add": "Добавить в корзину",
  "pdp.added": "Добавлено ✓",
  "pdp.t1.t": "Доставка 7–10 дней",
  "pdp.t1.d": "Бесплатно по Узбекистану",
  "pdp.t2.t": "Гарантия 3 года",
  "pdp.t2.d": "На плетение и каркас",
  "pdp.t3.t": "Готово к использованию",
  "pdp.t3.d": "Привозим в собранном виде",
  "pdp.t4.t": "Возврат 14 дней",
  "pdp.t4.d": "Если не подошёл размер",
  "pdp.about.h": "О товаре",
  "pdp.about.p1": "Каждое изделие плетётся вручную из искусственного ротанга — полиэтиленового волокна, окрашенного в массе. Оно не выгорает на солнце, не впитывает влагу и не трескается на морозе, поэтому подходит и для улицы, и для дома.",
  "pdp.about.p2": "Под плетением — лёгкий, но прочный каркас (алюминий для мебели, внутренний вкладыш для кашпо и корзин). Конструкция держит форму годами и легко моется обычной водой.",
  "pdp.spec.h": "Характеристики",
  "pdp.s.mat": "Материал",
  "pdp.s.mat.v": "Искусственный ротанг",
  "pdp.s.dim": "Комплектация",
  "pdp.s.dim.v": "С подушками",
  "pdp.s.fin": "Плетение",
  "pdp.s.fin.v": "UV-стойкое",
  "pdp.s.wt": "Каркас",
  "pdp.s.wt.v": "Алюминий",
  "pdp.s.seat": "Применение",
  "pdp.s.seat.v": "Терраса, сад",
  "pdp.s.made": "Производство",
  "pdp.s.made.v": "Ташкент, ручная работа",
  "pdp.rel.k": "Вам также понравится",
  "pdp.rel.h": "Из той же коллекции"
});
Object.assign(window.BTT_I18N.uz, {
  "pdp.crumb.home": "Bosh sahifa",
  "pdp.rate": "4.9 · 128 sharh",
  "pdp.save": "$125 tejash",
  "pdp.desc": "Qo‘lda to‘qilgan sun’iy rotang buyumi — rangini yo‘qotmaydi, namlikdan qo‘rqmaydi va yillar xizmat qiladi.",
  "pdp.opt.finish": "To‘quv rangi",
  "pdp.opt.size": "O‘lcham",
  "pdp.fin.natural": "Grafit",
  "pdp.fin.walnut": "Bej",
  "pdp.fin.smoke": "Mokko",
  "pdp.add": "Savatga qo‘shish",
  "pdp.added": "Qo‘shildi ✓",
  "pdp.t1.t": "Yetkazish 7–10 kun",
  "pdp.t1.d": "O‘zbekiston bo‘ylab bepul",
  "pdp.t2.t": "3 yil kafolat",
  "pdp.t2.d": "To‘quv va karkasga",
  "pdp.t3.t": "Foydalanishga tayyor",
  "pdp.t3.d": "Yig‘ilgan holda yetkazamiz",
  "pdp.t4.t": "14 kun qaytarish",
  "pdp.t4.d": "O‘lcham mos kelmasa",
  "pdp.about.h": "Mahsulot haqida",
  "pdp.about.p1": "Har bir buyum sun’iy rotangdan — massasiga bo‘yalgan polietilen toladan qo‘lda to‘qiladi. Quyoshda rangi o‘chmaydi, namlikni shimmaydi va sovuqda yorilmaydi, shuning uchun ham ko‘cha, ham uy uchun mos.",
  "pdp.about.p2": "To‘quv ostida yengil, ammo mustahkam karkas (mebel uchun alyumin, gultuvak va savatlar uchun ichki vkladish). Konstruksiya yillar davomida shaklini saqlaydi va oddiy suv bilan oson yuviladi.",
  "pdp.spec.h": "Xususiyatlari",
  "pdp.s.mat": "Material",
  "pdp.s.mat.v": "Sun’iy rotang",
  "pdp.s.dim": "Jihozlanishi",
  "pdp.s.dim.v": "Yostiqlar bilan",
  "pdp.s.fin": "To‘quv",
  "pdp.s.fin.v": "UV-chidamli",
  "pdp.s.wt": "Karkas",
  "pdp.s.wt.v": "Alyumin",
  "pdp.s.seat": "Qo‘llanish",
  "pdp.s.seat.v": "Terassa, bog‘",
  "pdp.s.made": "Ishlab chiqarish",
  "pdp.s.made.v": "Toshkent, qo‘l mehnati",
  "pdp.rel.k": "Sizga ham yoqadi",
  "pdp.rel.h": "Shu to‘plamdan"
});
Object.assign(window.BTT_I18N.en, {
  "pdp.crumb.home": "Home",
  "pdp.rate": "4.9 · 128 reviews",
  "pdp.save": "Save $125",
  "pdp.desc": "A hand-woven synthetic-rattan piece — won't fade, shrugs off moisture and lasts for years.",
  "pdp.opt.finish": "Weave colour",
  "pdp.opt.size": "Size",
  "pdp.fin.natural": "Graphite",
  "pdp.fin.walnut": "Beige",
  "pdp.fin.smoke": "Mocha",
  "pdp.add": "Add to cart",
  "pdp.added": "Added ✓",
  "pdp.t1.t": "Delivery 7–10 days",
  "pdp.t1.d": "Free across Uzbekistan",
  "pdp.t2.t": "3-year warranty",
  "pdp.t2.d": "On weave and frame",
  "pdp.t3.t": "Ready to use",
  "pdp.t3.d": "Delivered fully assembled",
  "pdp.t4.t": "14-day returns",
  "pdp.t4.d": "If the size doesn’t fit",
  "pdp.about.h": "About this piece",
  "pdp.about.p1": "Every piece is hand-woven from synthetic rattan — a polyethylene fibre dyed all the way through. It won't fade in the sun, absorb moisture or crack in frost, so it suits both outdoors and indoors.",
  "pdp.about.p2": "Under the weave is a light but strong frame (aluminium for furniture, an inner liner for planters and baskets). The structure keeps its shape for years and washes clean with plain water.",
  "pdp.spec.h": "Specifications",
  "pdp.s.mat": "Material",
  "pdp.s.mat.v": "Synthetic rattan",
  "pdp.s.dim": "Includes",
  "pdp.s.dim.v": "With cushions",
  "pdp.s.fin": "Weave",
  "pdp.s.fin.v": "UV-stable",
  "pdp.s.wt": "Frame",
  "pdp.s.wt.v": "Aluminium",
  "pdp.s.seat": "Use",
  "pdp.s.seat.v": "Terrace, garden",
  "pdp.s.made": "Made in",
  "pdp.s.made.v": "Tashkent, by hand",
  "pdp.rel.k": "You may also like",
  "pdp.rel.h": "From the same collection"
});

/* ---- account actions (toasts, newsletter) ---- */
Object.assign(window.BTT_I18N.ru, {
  "acc.set.newsoff": "Новинки и акции — выключено",
  "toast.repeat": "Товары добавлены в корзину",
  "toast.track": "Заказ {id} в пути — мы уведомим об изменениях статуса.",
  "toast.review": "Спасибо! Форма отзыва скоро откроется.",
  "toast.addr": "Редактирование адреса скоро будет доступно.",
  "toast.addrAdd": "Добавление адреса скоро будет доступно.",
  "toast.newson": "Рассылка включена",
  "toast.newsoff": "Рассылка отключена"
});
Object.assign(window.BTT_I18N.uz, {
  "acc.set.newsoff": "Yangiliklar va aksiyalar — o‘chirilgan",
  "toast.repeat": "Mahsulotlar savatga qo‘shildi",
  "toast.track": "{id} buyurtma yo‘lda — holat o‘zgarsa xabar beramiz.",
  "toast.review": "Rahmat! Sharh shakli tez orada ochiladi.",
  "toast.addr": "Manzilni tahrirlash tez orada mavjud bo‘ladi.",
  "toast.addrAdd": "Manzil qo‘shish tez orada mavjud bo‘ladi.",
  "toast.newson": "Xabarnoma yoqildi",
  "toast.newsoff": "Xabarnoma o‘chirildi"
});
Object.assign(window.BTT_I18N.en, {
  "acc.set.newsoff": "News & deals — disabled",
  "toast.repeat": "Items added to your cart",
  "toast.track": "Order {id} is on its way — we'll notify you of status changes.",
  "toast.review": "Thanks! The review form will open soon.",
  "toast.addr": "Address editing will be available soon.",
  "toast.addrAdd": "Adding an address will be available soon.",
  "toast.newson": "Newsletter enabled",
  "toast.newsoff": "Newsletter disabled"
});

/* ---- checkout → manager messenger ---- */
Object.assign(window.BTT_I18N.ru, {
  "co.order.title": "Подтверждение заказа",
  "co.order.sub": "Отправьте заказ менеджеру — он подтвердит наличие, доставку и оплату.",
  "co.order.tg": "Оформить в Telegram",
  "co.order.wa": "Оформить в WhatsApp",
  "co.order.back": "Вернуться в корзину",
  "co.order.copied": "Заказ скопирован — вставьте его в чат с менеджером.",
  "co.order.head": "Заказ с сайта Bententrade",
  "co.order.total": "Итого",
  "co.order.note": "Заполню контакты и адрес в чате."
});
Object.assign(window.BTT_I18N.uz, {
  "co.order.title": "Buyurtma tasdiqlash",
  "co.order.sub": "Buyurtmani menejerga yuboring — mavjudligi, yetkazish va to‘lovni tasdiqlaydi.",
  "co.order.tg": "Telegramda rasmiylashtirish",
  "co.order.wa": "WhatsAppda rasmiylashtirish",
  "co.order.back": "Savatga qaytish",
  "co.order.copied": "Buyurtma nusxalandi — menejer chatiga joylang.",
  "co.order.head": "Bententrade saytidan buyurtma",
  "co.order.total": "Jami",
  "co.order.note": "Kontakt va manzilni chatda to‘ldiraman."
});
Object.assign(window.BTT_I18N.en, {
  "co.order.title": "Confirm your order",
  "co.order.sub": "Send the order to our manager — they'll confirm stock, delivery and payment.",
  "co.order.tg": "Order via Telegram",
  "co.order.wa": "Order via WhatsApp",
  "co.order.back": "Back to cart",
  "co.order.copied": "Order copied — paste it into the chat with our manager.",
  "co.order.head": "Order from the Bententrade website",
  "co.order.total": "Total",
  "co.order.note": "I'll add my contacts and address in the chat."
});

/* ---- about CTA band ---- */
Object.assign(window.BTT_I18N.ru, {
  "ab.band": "Искусственный ротанг — выбор, который служит годами"
});
Object.assign(window.BTT_I18N.uz, {
  "ab.band": "Sun’iy rotang — yillar xizmat qiladigan tanlov"
});
Object.assign(window.BTT_I18N.en, {
  "ab.band": "Synthetic rattan — a choice that lasts for years"
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/i18n.js", error: String((e && e.message) || e) }); }

// assets/pdp.js
try { (() => {
/* Bententrade — product detail page interactions + data hydration
   Reads ?id=p1 from the URL and fills the page from BTT_PRODUCTS / BTT_PRODUCT_CAT.
   Name & category come from the shared i18n dictionary; category copy/specs from
   products.js. Re-renders on language change. cart/fav binding is global (site.js). */
(function () {
  "use strict";

  const PRODUCTS = window.BTT_PRODUCTS || {};
  const CATTEXT = window.BTT_PRODUCT_CAT || {};
  const DICT = window.BTT_I18N || {};
  const params = new URLSearchParams(location.search);
  let id = params.get("id");
  if (!PRODUCTS[id]) id = "p1";
  const prod = PRODUCTS[id];
  const num = id.replace("p", "");
  const $ = s => document.querySelector(s);
  const lang = () => {
    const l = document.documentElement.lang;
    return DICT[l] ? l : "ru";
  };
  const t = key => (DICT[lang()] || DICT.ru || {})[key];

  /* ---- one-time: images, then strip data-i18n from managed nodes ---- */
  function setImages() {
    const imgs = window.BTT_PRODUCT_IMG ? window.BTT_PRODUCT_IMG(id) : null;
    if (!imgs) return;
    const thumbs = document.querySelectorAll("[data-thumb] img");
    const stage = document.querySelectorAll("[data-stage] img");
    imgs.forEach((im, i) => {
      if (thumbs[i]) thumbs[i].src = im.thumb;
      if (stage[i]) stage[i].src = im.full;
    });
  }
  function detach(sel) {
    const el = $(sel);
    if (el) el.removeAttribute("data-i18n");
    return el;
  }

  // managed nodes (we own their text so language switches re-render via render())
  const node = {
    crumb: detach(".crumb .cur"),
    cat: detach(".pdp-info .product__cat"),
    name: detach(".pdp-info h1"),
    desc: detach(".pdp-desc")
  };
  detach(".pdp-price .save");
  const specVals = document.querySelectorAll(".pdp-detail .spec-row .v");
  specVals.forEach(v => v.removeAttribute("data-i18n"));
  const sizeRow = $(".size-row");
  function render() {
    const c = CATTEXT[prod.cat] || CATTEXT.desk;
    const ct = c[lang()] || c.ru;
    const nm = t("p" + num + ".name");
    const cat = t("p" + num + ".cat");
    if (node.name) node.name.textContent = nm || node.name.textContent;
    if (node.crumb) node.crumb.textContent = nm || node.crumb.textContent;
    if (node.cat) node.cat.textContent = cat || "";
    if (node.desc) node.desc.textContent = ct.desc;
    document.title = "Bententrade — " + (nm || "");

    // price
    const now = $(".pdp-price .now"),
      old = $(".pdp-price .old"),
      save = $(".pdp-price .save");
    if (now) now.textContent = "$" + prod.now;
    if (old) old.style.display = prod.old ? "" : "none";
    if (old && prod.old) old.textContent = "$" + prod.old;
    if (save) {
      if (prod.old) {
        save.style.display = "";
        const word = {
          ru: "Экономия",
          uz: "Tejash",
          en: "Save"
        }[lang()] || "Экономия";
        save.textContent = word + " $" + (prod.old - prod.now);
      } else save.style.display = "none";
    }
    // sale badge on stage
    const badge = $(".pdp-stage .badge-sale");
    if (badge) {
      if (prod.old) {
        badge.style.display = "";
        badge.textContent = "-" + Math.round((1 - prod.now / prod.old) * 100) + "%";
      } else badge.style.display = "none";
    }

    // specs (order: material, dimensions, finish, weight, seats, made)
    const vals = [ct.mat, ct.dim, ct.fin, ct.wt, ct.seat, ct.made];
    specVals.forEach((el, i) => {
      if (vals[i] != null) el.textContent = vals[i];
    });

    // size options
    if (sizeRow) {
      const sizes = c.sizes || [];
      const btns = sizeRow.querySelectorAll("button");
      btns.forEach((b, i) => {
        if (sizes[i] != null) {
          b.textContent = sizes[i];
          b.style.display = "";
        } else b.style.display = "none";
        b.classList.toggle("is-active", i === (c.defSize || 0));
      });
    }
  }
  setImages();
  render();

  // re-render when site.js changes <html lang="…">
  new MutationObserver(() => render()).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });

  /* ---- gallery ---- */
  const stage = document.querySelectorAll("[data-stage] img");
  const thumbs = document.querySelectorAll("[data-thumb]");
  function showImg(i) {
    stage.forEach((im, k) => im.classList.toggle("is-on", k === i));
    thumbs.forEach((t, k) => t.classList.toggle("is-active", k === i));
  }
  thumbs.forEach((t, i) => {
    t.addEventListener("mouseenter", () => showImg(i));
    t.addEventListener("click", () => showImg(i));
  });

  /* ---- single-select groups (swatches, sizes) ---- */
  document.querySelectorAll("[data-select]").forEach(group => {
    group.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        group.querySelectorAll("button").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
    });
  });

  /* ---- quantity stepper ---- */
  document.querySelectorAll("[data-qty]").forEach(q => {
    const input = q.querySelector("input");
    const clamp = v => Math.max(1, Math.min(99, v || 1));
    q.querySelector("[data-qd]").addEventListener("click", () => {
      input.value = clamp(parseInt(input.value, 10) - 1);
    });
    q.querySelector("[data-qu]").addEventListener("click", () => {
      input.value = clamp(parseInt(input.value, 10) + 1);
    });
    input.addEventListener("change", () => {
      input.value = clamp(parseInt(input.value, 10));
    });
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/pdp.js", error: String((e && e.message) || e) }); }

// assets/products.js
try { (() => {
/* Bententrade — product catalogue data (artificial-rattan range)
   Three lines: garden furniture (furniture) · planters / kashpo (planter)
   · chests & laundry baskets (basket). Names & on-card category come from the
   i18n dictionary (p{n}.name / p{n}.cat); PDP copy + specs are category-based
   and translated in CAT below. Imagery is deterministic loremflickr (topical). */
(function () {
  "use strict";

  // deterministic topical photo (square) — kw="rattan,sofa", lock=11
  const F = (kw, lock, w) => "https://loremflickr.com/" + w + "/" + w + "/" + kw + "/all?lock=" + lock;

  // a "look" = 4 [keyword, lock] pairs (main + 3 alternates)
  const LOOK = {
    sofa: [["rattan,sofa", 11], ["patio,furniture", 31], ["outdoor,sofa", 41], ["wicker,chair", 2]],
    dining: [["rattan,dining", 14], ["patio,table", 32], ["garden,table", 42], ["outdoor,furniture", 52]],
    lounge: [["wicker,chair", 2], ["rattan,chair", 17], ["lounge,chair", 37], ["egg,chair", 47]],
    chair: [["rattan,chair", 17], ["wicker,chair", 27], ["garden,chair", 38], ["patio,chair", 48]],
    corner: [["rattan,sofa", 19], ["outdoor,sofa", 29], ["patio,furniture", 39], ["garden,sofa", 49]],
    planterT: [["wicker,planter", 4], ["rattan,plant", 24], ["woven,basket", 34], ["plant,pot", 44]],
    planterS: [["rattan,plant", 24], ["wicker,planter", 15], ["plant,pot", 45], ["woven,basket", 4]],
    planterSet: [["plant,pot", 44], ["wicker,planter", 4], ["rattan,plant", 24], ["woven,basket", 34]],
    chest: [["woven,basket", 34], ["wicker,basket", 54], ["rattan,storage", 64], ["wicker,trunk", 74]],
    laundry: [["wicker,basket", 54], ["laundry,basket", 84], ["woven,basket", 34], ["rattan,storage", 64]],
    rocker: [["rattan,rocking,chair", 90], ["wicker,rocking,chair", 91], ["rattan,chair", 17], ["lounge,chair", 37]],
    coffee: [["rattan,coffee,table", 92], ["wicker,table", 93], ["rattan,table", 14], ["living,room,table", 94]],
    cabinet: [["rattan,cabinet", 95], ["wicker,dresser", 96], ["rattan,sideboard", 97], ["woven,cabinet", 98]],
    shelf: [["rattan,shelf", 99], ["wicker,shelf", 100], ["rattan,bookcase", 101], ["woven,shelf", 102]]
  };
  window.BTT_PRODUCTS = {
    p1: {
      cat: "furniture",
      look: "sofa",
      now: 780,
      old: 980
    },
    p2: {
      cat: "furniture",
      look: "lounge",
      now: 340,
      old: 420
    },
    p3: {
      cat: "planter",
      look: "planterT",
      now: 95,
      old: 130
    },
    p4: {
      cat: "furniture",
      look: "dining",
      now: 1180,
      old: 0
    },
    p5: {
      cat: "furniture",
      look: "chair",
      now: 260,
      old: 340
    },
    p6: {
      cat: "basket",
      look: "chest",
      now: 180,
      old: 0
    },
    p7: {
      cat: "planter",
      look: "planterS",
      now: 48,
      old: 64
    },
    p8: {
      cat: "furniture",
      look: "chair",
      now: 155,
      old: 0
    },
    p9: {
      cat: "planter",
      look: "planterSet",
      now: 210,
      old: 280
    },
    p10: {
      cat: "furniture",
      look: "corner",
      now: 1640,
      old: 1990
    },
    p11: {
      cat: "basket",
      look: "laundry",
      now: 72,
      old: 0
    },
    p12: {
      cat: "indoor",
      look: "rocker",
      now: 290,
      old: 360
    },
    p13: {
      cat: "indoor",
      look: "coffee",
      now: 210,
      old: 0
    },
    p14: {
      cat: "indoor",
      look: "cabinet",
      now: 540,
      old: 680
    },
    p15: {
      cat: "indoor",
      look: "shelf",
      now: 320,
      old: 390
    }
  };
  window.BTT_PRODUCT_IMG = id => {
    const p = window.BTT_PRODUCTS[id];
    if (!p) return null;
    return LOOK[p.look].map(([kw, lock]) => ({
      thumb: F(kw, lock, 300),
      full: F(kw, lock, 1100)
    }));
  };

  // category-based PDP copy & specs. 5th spec ("seat") is repurposed as "Use".
  window.BTT_PRODUCT_CAT = {
    furniture: {
      sizes: ["2-местный", "3-местный", "Угловой"],
      defSize: 1,
      ru: {
        desc: "Садовая мебель из искусственного ротанга на лёгком алюминиевом каркасе. Плотное ручное плетение не выгорает на солнце, не боится дождя и перепадов температур — комплект круглый год может стоять на террасе, во дворе или в саду.",
        mat: "Искусственный ротанг + алюминий",
        dim: "С подушками, всесезонный",
        fin: "UV-стойкое плетение",
        wt: "Каркас алюминий",
        seat: "Терраса, двор, сад",
        made: "Ташкент, ручная работа"
      },
      uz: {
        desc: "Yengil alyumin karkasdagi sun’iy rotangdan bog‘ mebeli. Zich qo‘l to‘quvi quyoshda rangini yo‘qotmaydi, yomg‘ir va harorat o‘zgarishidan qo‘rqmaydi — to‘plam yil bo‘yi terassa, hovli yoki bog‘da turishi mumkin.",
        mat: "Sun’iy rotang + alyumin",
        dim: "Yostiqlar bilan, har faslga",
        fin: "UV-chidamli to‘quv",
        wt: "Alyumin karkas",
        seat: "Terassa, hovli, bog‘",
        made: "Toshkent, qo‘l mehnati"
      },
      en: {
        desc: "Garden furniture in synthetic rattan over a light aluminium frame. The dense hand-weave won't fade in the sun and shrugs off rain and temperature swings — the set can stay on the terrace, in the yard or garden all year round.",
        mat: "Synthetic rattan + aluminium",
        dim: "With cushions, all-season",
        fin: "UV-stable weave",
        wt: "Aluminium frame",
        seat: "Terrace, yard, garden",
        made: "Tashkent, by hand"
      }
    },
    planter: {
      sizes: ["Ø30 см", "Ø40 см", "Ø55 см"],
      defSize: 1,
      ru: {
        desc: "Кашпо, плетённое вручную из искусственного ротанга, со скрытым внутренним вкладышем и дренажом. Лёгкое, не гниёт и не трескается — одинаково хорошо смотрится с живыми растениями дома, на балконе и в саду.",
        mat: "Искусственный ротанг",
        dim: "Со вкладышем и дренажом",
        fin: "Влагостойкое плетение",
        wt: "Лёгкое",
        seat: "Дом, балкон, сад",
        made: "Ташкент, ручная работа"
      },
      uz: {
        desc: "Sun’iy rotangdan qo‘lda to‘qilgan gultuvak, yashirin ichki vkladish va drenaj bilan. Yengil, chirimaydi va yorilmaydi — uy, balkon va bog‘da jonli o‘simliklar bilan birdek chiroyli ko‘rinadi.",
        mat: "Sun’iy rotang",
        dim: "Vkladish va drenaj bilan",
        fin: "Namlikka chidamli to‘quv",
        wt: "Yengil",
        seat: "Uy, balkon, bog‘",
        made: "Toshkent, qo‘l mehnati"
      },
      en: {
        desc: "A planter hand-woven from synthetic rattan, with a hidden inner liner and drainage. Light, rot- and crack-proof — it looks equally good with live plants indoors, on the balcony and in the garden.",
        mat: "Synthetic rattan",
        dim: "With liner & drainage",
        fin: "Moisture-resistant weave",
        wt: "Lightweight",
        seat: "Home, balcony, garden",
        made: "Tashkent, by hand"
      }
    },
    basket: {
      sizes: ["S", "M", "L"],
      defSize: 1,
      ru: {
        desc: "Сундук и корзина для белья из искусственного ротанга с мягкой тканевой подкладкой и крышкой. Держит форму, не цепляет ткань и проветривается — для хранения белья, пледов, игрушек и мелочей в спальне или ванной.",
        mat: "Искусственный ротанг + подкладка",
        dim: "С крышкой и подкладкой",
        fin: "Гладкое плетение",
        wt: "Складная подкладка",
        seat: "Бельё, пледы, хранение",
        made: "Ташкент, ручная работа"
      },
      uz: {
        desc: "Sun’iy rotangdan yumshoq mato astarli va qopqoqli sandiq hamda kir savati. Shaklini saqlaydi, matoga ilashmaydi va shamollatiladi — yotoqxona yoki hammomda kir, pled, o‘yinchoq va mayda buyumlar uchun.",
        mat: "Sun’iy rotang + astar",
        dim: "Qopqoq va astar bilan",
        fin: "Silliq to‘quv",
        wt: "Yig‘iladigan astar",
        seat: "Kir, pled, saqlash",
        made: "Toshkent, qo‘l mehnati"
      },
      en: {
        desc: "A chest and laundry basket in synthetic rattan with a soft fabric liner and lid. Holds its shape, won't snag fabric and stays ventilated — for laundry, throws, toys and bits in the bedroom or bathroom.",
        mat: "Synthetic rattan + liner",
        dim: "With lid & liner",
        fin: "Smooth weave",
        wt: "Foldable liner",
        seat: "Laundry, throws, storage",
        made: "Tashkent, by hand"
      }
    },
    indoor: {
      sizes: ["Компакт", "Стандарт", "Большой"],
      defSize: 1,
      ru: {
        desc: "Мебель для дома из искусственного ротанга: лёгкая, тёплая на вид и практичная. Плетение не боится влаги и перепадов, легко протирается влажной тканью — под гостиную, спальню, прихожую или балкон.",
        mat: "Искусственный ротанг + каркас",
        dim: "Для интерьера, всесезонно",
        fin: "Гладкое плетение",
        wt: "Лёгкий каркас",
        seat: "Гостиная, спальня, балкон",
        made: "Ташкент, ручная работа"
      },
      uz: {
        desc: "Sun’iy rotangdan uy mebeli: yengil, ko‘rinishi issiq va amaliy. To‘quv namlik va o‘zgarishlardan qo‘rqmaydi, nam mato bilan oson artiladi — mehmonxona, yotoqxona, dahliz yoki balkon uchun.",
        mat: "Sun’iy rotang + karkas",
        dim: "Interyer uchun, har faslga",
        fin: "Silliq to‘quv",
        wt: "Yengil karkas",
        seat: "Mehmonxona, yotoqxona, balkon",
        made: "Toshkent, qo‘l mehnati"
      },
      en: {
        desc: "Home furniture in synthetic rattan: light, warm-looking and practical. The weave shrugs off humidity and temperature swings and wipes clean with a damp cloth — right for the living room, bedroom, hallway or balcony.",
        mat: "Synthetic rattan + frame",
        dim: "For interiors, all-season",
        fin: "Smooth weave",
        wt: "Light frame",
        seat: "Living room, bedroom, balcony",
        made: "Tashkent, by hand"
      }
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/products.js", error: String((e && e.message) || e) }); }

// assets/search.js
try { (() => {
/* ============================================================
   BENTENTRADE — Spotlight glass search (site-wide)
   Opens on the header search button or Cmd/Ctrl+K.
   ============================================================ */
(function () {
  function lang() {
    const s = localStorage.getItem("btt_lang");
    return ["ru", "uz", "en"].includes(s) ? s : "ru";
  }
  function t(key) {
    const d = window.BTT_I18N && window.BTT_I18N[lang()] || {};
    return d[key] != null ? d[key] : key;
  }

  // category index — slug routes to catalog ?cat=
  const CATS = [{
    slug: "rattan",
    k: "line.rattan",
    img: "https://loremflickr.com/120/120/rattan,wicker/all?lock=11"
  }, {
    slug: "planter",
    k: "line.planter",
    img: "https://loremflickr.com/120/120/wicker,basket/all?lock=21"
  }, {
    slug: "twist",
    k: "line.twist",
    img: "https://loremflickr.com/120/120/rope,coil/all?lock=31"
  }, {
    slug: "furniture",
    k: "line.furniture",
    img: "https://loremflickr.com/120/120/rattan,furniture/all?lock=41"
  }];
  // page index
  const PAGES = [{
    href: "catalog.html",
    k: "nav.catalog2"
  }, {
    href: "about.html",
    k: "nav.about"
  }, {
    href: "contacts.html",
    k: "nav.contacts"
  }, {
    href: "account.html",
    k: "nav.account2"
  }];
  function products() {
    const d = window.BTT_I18N && window.BTT_I18N[lang()] || {};
    const out = [];
    for (let i = 1; i <= 11; i++) {
      const name = d["p" + i + ".name"],
        cat = d["p" + i + ".cat"];
      if (name) out.push({
        name,
        cat: cat || "",
        q: name
      });
    }
    return out;
  }
  let ov,
    input,
    body,
    items = [],
    active = -1;
  function build() {
    ov = document.createElement("div");
    ov.className = "search-ov";
    ov.innerHTML = '<div class="search-box" role="dialog" aria-modal="true">' + '<div class="search-box__head">' + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>' + '<input class="search-box__input" type="text" autocomplete="off" spellcheck="false">' + '<span class="search-box__kbd">ESC</span>' + '</div>' + '<div class="search-box__body"></div>' + '</div>';
    document.body.appendChild(ov);
    input = ov.querySelector(".search-box__input");
    body = ov.querySelector(".search-box__body");
    ov.addEventListener("click", e => {
      if (e.target === ov) close();
    });
    input.addEventListener("input", render);
    input.addEventListener("keydown", onKey);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    })[c]);
  }
  function norm(s) {
    return String(s).toLowerCase().trim();
  }
  function render() {
    const q = norm(input.value);
    items = [];
    let html = "";
    const cats = CATS.map(c => ({
      ...c,
      label: t(c.k)
    })).filter(c => !q || norm(c.label).includes(q));
    const prods = products().filter(p => !q || norm(p.name).includes(q) || norm(p.cat).includes(q));
    const pages = PAGES.map(p => ({
      ...p,
      label: t(p.k)
    })).filter(p => !q || norm(p.label).includes(q));
    if (!cats.length && !prods.length && !pages.length) {
      body.innerHTML = '<div class="search-empty">' + esc(t("srch.empty")) + '</div>';
      active = -1;
      return;
    }
    if (cats.length) {
      html += '<div class="search-sec">' + esc(t("srch.cats")) + '</div>';
      cats.forEach(c => {
        items.push({
          href: "catalog.html?cat=" + c.slug
        });
        html += row(c.img, c.label, t("srch.cats"), items.length - 1);
      });
    }
    if (prods.length) {
      html += '<div class="search-sec">' + esc(t("srch.prods")) + '</div>';
      prods.forEach(p => {
        items.push({
          href: "catalog.html?q=" + encodeURIComponent(p.q)
        });
        html += row(null, p.name, p.cat, items.length - 1, p.name.slice(0, 1));
      });
    }
    if (pages.length) {
      html += '<div class="search-sec">' + esc(t("srch.pages")) + '</div>';
      pages.forEach(p => {
        items.push({
          href: p.href
        });
        html += row(null, p.label, p.href, items.length - 1, "→");
      });
    }
    body.innerHTML = html;
    active = 0;
    paint();
    body.querySelectorAll(".search-item").forEach((el, i) => {
      el.addEventListener("click", () => go(i));
      el.addEventListener("mousemove", () => {
        active = i;
        paint();
      });
    });
  }
  function row(img, title, sub, i, glyph) {
    const ic = img ? '<span class="search-item__ic"><img src="' + img + '" alt="" onerror="this.parentNode.textContent=\'' + (glyph || "") + '\'"></span>' : '<span class="search-item__ic">' + esc(glyph || "") + '</span>';
    return '<button class="search-item" data-i="' + i + '">' + ic + '<span class="search-item__tx"><b>' + esc(title) + '</b><span>' + esc(sub) + '</span></span>' + '<svg class="search-item__go" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' + '</button>';
  }
  function paint() {
    body.querySelectorAll(".search-item").forEach((el, i) => el.classList.toggle("is-active", i === active));
  }
  function onKey(e) {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      active = Math.min(active + 1, items.length - 1);
      paint();
      scrollTo();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      active = Math.max(active - 1, 0);
      paint();
      scrollTo();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0) go(active);
    }
  }
  function scrollTo() {
    const el = body.querySelectorAll(".search-item")[active];
    if (!el) return;
    const r = el.getBoundingClientRect(),
      pr = body.getBoundingClientRect();
    if (r.bottom > pr.bottom) body.scrollTop += r.bottom - pr.bottom + 8;
    if (r.top < pr.top) body.scrollTop -= pr.top - r.top + 8;
  }
  function go(i) {
    const it = items[i];
    if (it) window.location.href = it.href;
  }
  function open() {
    if (!ov) build();
    input.value = "";
    render();
    ov.classList.add("is-open");
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => input.focus(), 40);
  }
  function close() {
    if (!ov) return;
    ov.classList.remove("is-open");
    document.documentElement.style.overflow = "";
  }
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-i18n-aria='tool.search'], [aria-label='Поиск'], [aria-label='Qidiruv'], [aria-label='Search']").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        open();
      });
    });
    document.addEventListener("keydown", e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open();
      }
    });
  });
  window.BTT_SEARCH = {
    open,
    close
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/search.js", error: String((e && e.message) || e) }); }

// assets/site.js
try { (() => {
/* ============================================================
   BENTENTRADE — site interactions
   ============================================================ */
(function () {
  const LANGS = ["ru", "uz", "en"];
  const dict = window.BTT_I18N || {};
  function getLang() {
    const saved = localStorage.getItem("btt_lang");
    return LANGS.includes(saved) ? saved : "ru";
  }
  function applyLang(lang) {
    const d = dict[lang] || dict.ru;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (d[key] == null) return;
      // support \n -> <br> for multiline labels
      if (d[key].includes("\n")) {
        el.innerHTML = d[key].split("\n").map(s => s.replace(/[&<>]/g, c => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;'
        })[c])).join("<br>");
      } else {
        el.textContent = d[key];
      }
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
      const key = el.getAttribute("data-i18n-ph");
      if (d[key] != null) el.setAttribute("placeholder", d[key]);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(el => {
      const key = el.getAttribute("data-i18n-aria");
      if (d[key] != null) el.setAttribute("aria-label", d[key]);
    });
    document.querySelectorAll(".lang button").forEach(b => {
      b.classList.toggle("is-active", b.dataset.lang === lang);
    });
  }
  function setLang(lang) {
    localStorage.setItem("btt_lang", lang);
    applyLang(lang);
  }

  /* ---- cart + favorites are owned by cart.js (persistent drawers) ---- */

  /* ---- theme ---- */
  function getTheme() {
    return localStorage.getItem("btt_theme") === "dark" ? "dark" : "light";
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t === "dark" ? "dark" : "light");
  }
  function toggleTheme() {
    const next = getTheme() === "dark" ? "light" : "dark";
    localStorage.setItem("btt_theme", next);
    applyTheme(next);
  }

  /* ---- scroll reveal (IntersectionObserver) + sibling stagger ---- */
  function initReveal() {
    const reveals = Array.from(document.querySelectorAll(".reveal"));

    // stagger: elements that share a parent fade in one after another
    const byParent = new Map();
    reveals.forEach(el => {
      const p = el.parentElement;
      if (!p) return;
      if (!byParent.has(p)) byParent.set(p, []);
      byParent.get(p).push(el);
    });
    byParent.forEach(list => {
      if (list.length > 1) list.forEach((el, i) => {
        el.style.transitionDelay = Math.min(i * 70, 420) + "ms";
      });
    });

    // explicit [data-stagger] containers (children animate in sequence)
    const staggers = Array.from(document.querySelectorAll("[data-stagger]"));
    staggers.forEach(c => {
      const step = parseFloat(c.dataset.stagger) || 80;
      Array.from(c.children).forEach((ch, i) => {
        ch.style.transitionDelay = i * step + "ms";
      });
    });
    const targets = reveals.concat(staggers);
    if (!("IntersectionObserver" in window)) {
      targets.forEach(el => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.1
    });
    targets.forEach(el => io.observe(el));
  }

  /* ---- header condenses + frosts once you scroll past the top ---- */
  function initHeaderScroll() {
    const head = document.querySelector(".site-head");
    if (!head) return;
    let ticking = false;
    function apply() {
      head.classList.toggle("is-scrolled", window.scrollY > 24);
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    }, {
      passive: true
    });
    apply();
  }

  /* ---- parallax: large banner images drift against the scroll ---- */
  function initParallax() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sel = ".promo img, .final img, .material__img img, .ab-story__img img, .page-hero__collage img";
    const items = Array.from(document.querySelectorAll(sel)).map(el => ({
      el,
      speed: parseFloat(el.dataset.parallax) || 0.14,
      scale: 1.16
    }));
    if (!items.length) return;
    items.forEach(it => {
      it.el.style.willChange = "transform";
    });
    let ticking = false;
    function update() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      items.forEach(it => {
        const r = it.el.getBoundingClientRect();
        if (r.bottom < -240 || r.top > vh + 240) return;
        const center = r.top + r.height / 2;
        const off = (center - vh / 2) / vh; // ~ -0.5 .. 0.5
        let y = -off * it.speed * vh; // move opposite to scroll
        y = Math.max(-30, Math.min(30, y));
        it.el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0) scale(" + it.scale + ")";
      });
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("resize", onScroll, {
      passive: true
    });
    update();
  }

  /* ---- count-up stat numbers (about page) ---- */
  function animateNum(el) {
    const tn = Array.from(el.childNodes).find(n => n.nodeType === 3 && /\d/.test(n.textContent));
    if (!tn) return;
    const m = (tn.textContent || "").trim().match(/^(\d+)(\D*)$/);
    if (!m) return;
    const target = parseInt(m[1], 10),
      unit = m[2] || "";
    const dur = 1100,
      t0 = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      tn.textContent = Math.round(target * eased) + unit;
      if (p < 1) requestAnimationFrame(tick);else tn.textContent = target + unit;
    })(t0);
  }
  function initCounters() {
    const nums = document.querySelectorAll(".ab-stat .n");
    if (!nums.length || !("IntersectionObserver" in window)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          io.unobserve(e.target);
          animateNum(e.target);
        }
      });
    }, {
      threshold: 0.4
    });
    nums.forEach(n => io.observe(n));
  }

  /* ---- wire up on load ---- */
  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(getTheme());
    applyLang(getLang());
    initReveal();
    initParallax();
    initHeaderScroll();
    initCounters();

    // theme toggle
    document.querySelectorAll("[data-theme-toggle]").forEach(b => {
      b.addEventListener("click", toggleTheme);
    });

    // language buttons
    document.querySelectorAll(".lang button").forEach(b => {
      b.addEventListener("click", () => setLang(b.dataset.lang));
    });

    // add-to-cart & favorites are handled by cart.js

    // category chips (catalog + home)
    document.querySelectorAll("[data-chips]").forEach(group => {
      const chips = group.querySelectorAll(".chip");
      function activate(chip) {
        chips.forEach(c => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        const cat = chip.dataset.cat;
        const grid = document.querySelector(group.dataset.target);
        if (!grid) return;
        grid.querySelectorAll("[data-product]").forEach(card => {
          const show = cat === "all" || card.dataset.cat === cat;
          card.style.display = show ? "" : "none";
        });
      }
      chips.forEach(chip => chip.addEventListener("click", () => activate(chip)));
      // honor #category hash coming from another page (e.g. hero CTA)
      const hash = (location.hash || "").replace("#", "");
      if (hash) {
        const match = Array.from(chips).find(c => c.dataset.cat === hash);
        if (match) activate(match);
      }
    });

    // honor ?q= free-text search coming from the Spotlight overlay
    (function () {
      const params = new URLSearchParams(location.search);
      const q = (params.get("q") || "").toLowerCase().trim();
      if (!q) return;
      const grid = document.querySelector("#catalog-grid");
      if (!grid) return;
      let shown = 0;
      grid.querySelectorAll("[data-product]").forEach(card => {
        const txt = (card.textContent || "").toLowerCase();
        const show = txt.includes(q);
        card.style.display = show ? "" : "none";
        if (show) shown++;
      });
      // reflect the query in the results count + a small banner
      const note = document.querySelector("[data-search-note]");
      if (note) {
        note.textContent = "«" + params.get("q") + "» — " + shown;
        note.style.display = "";
      }
    })();

    // mobile nav
    const burger = document.querySelector(".burger");
    const drawer = document.querySelector(".mobile-drawer");
    if (burger && drawer) {
      burger.addEventListener("click", () => drawer.classList.toggle("open"));
      drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", () => drawer.classList.remove("open")));
    }

    // contact form
    const form = document.querySelector("[data-contact-form]");
    if (form) {
      form.addEventListener("submit", e => {
        e.preventDefault();
        const ok = form.querySelector("[data-form-ok]");
        if (ok) ok.classList.add("show");
        form.reset();
      });
    }
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/site.js", error: String((e && e.message) || e) }); }

})();
