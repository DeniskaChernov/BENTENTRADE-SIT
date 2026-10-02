/* ============================================================
   BENTENTRADE - site assistant "Бен"
   Self-injecting glass chat widget. Scripted, multilingual,
   intelligent intent engine + catalog product resolution +
   Telegram lead capture + interactive cart & product cards.
   Zero external dependencies.
   ============================================================ */
(function(){
  "use strict";

  const T = {
    ru:{
      name:"Бен", role:"Онлайн-помощник BTT", badge:"1",
      ph:"Напишите вопрос (например: цены, доставка, стул Roero)…",
      hi:"Здравствуйте! Я помощник BTT 🌿 Помогу подобрать обеденные столы, плетёные, пластиковые и мягкие стулья, расскажу о ценах и доставке. С чего начнём?",
      quick:["Цены на стулья","Пластиковые стулья","Плетёные стулья","Обеденные столы","Доставка и самовывоз","Связаться с менеджером"],
      ans:{
        "Цены на стулья":"Актуальные цены на популярные пластиковые стулья: ROERO - 188 000 сум, NOERO - 212 000 сум, TODO и TODO SOFT - 236 000 сум, JARDIN - 344 000 сум. Цены на плетёные, мягкие стулья и столы смотрите в <a href='catalog.html'>полном каталоге BTT</a>.",
        "Плетёные стулья":"Плетёные стулья Vertex и Corda на прочном металлокаркасе со съёмными текстильными подушками в комплекте. Идеальны для веранд, террас и обеденных зон. Смотрите модели в <a href='catalog.html?cat=wicker-chairs'>каталоге плетёных стульев</a>.",
        "Пластиковые стулья":"Практичные пластиковые стулья: ROERO (188 000 сум), NOERO (212 000 сум), TODO (236 000 сум), мягкий TODO SOFT с подушкой из экокожи (236 000 сум) и кресло JARDIN (344 000 сум). Все модели в <a href='catalog.html?cat=plastic-chairs'>каталоге</a>.",
        "Мягкие стулья":"Элегантные стулья LIRA и комфортные кресла COMO на металлокаркасе с мягкой обивкой - идеальны для дома, кухни и HoReCa. Смотрите в <a href='catalog.html?cat=upholstered-chairs'>каталоге мягких стульев</a>.",
        "Обеденные столы":"Столы на металлокаркасе со столешницей из ЛДСП (Taper, Vertex, Corda) размерами 80×80 см, 135×80 см и круглый Ø90 см. Рекомендуются для помещений и крытых пространств. Смотрите в <a href='catalog.html?cat=tables'>каталоге столов</a>.",
        "Доставка и самовывоз":"Доставка по Ташкенту осуществляется за 1-2 рабочих дня по прямому тарифу сервиса (Яндекс / Labo / Porter). Возможен самовывоз со склада в Ташкенте по предварительной договорённости. В регионы Узбекистана отправляем через транспортные службы.",
        "Связаться с менеджером":"Мы на связи в Telegram <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> и по телефону <a href='tel:+998771044422'>+998 77 104 44 22</a>. Ответим на любые вопросы и поможем с выбором!"
      },
      fallback:"Я могу подсказать по каталогу мебели, актуальным ценам, условиям доставки по Ташкенту, оплате (Click, Payme, наличные) или соединить с менеджером. Выберите тему ниже или задайте вопрос 👇",
      leadTitle:"Оставьте номер телефона, и наш менеджер свяжется с вами в течение 10-15 минут:",
      leadSend:"Отправить в Telegram",
      leadSending:"Отправка…",
      leadOk:"Заявка передана менеджеру в Telegram!",
      leadOkSub:"Мы свяжемся с вами в течение 10-15 минут.",
      cartEmpty:"Ваша корзина пока пуста 🛒<br>Хотите посмотреть популярные модели стульев?",
      cartTotal:"Итого в корзине",
      cartCheckout:"Оформить заказ",
      cartMore:"Подробнее",
      cartBuy:"В корзину",
      cartAdded:"Добавлено!",
      phoneInvalid:"Пожалуйста, укажите корректный номер телефона (например: +998 90 123 45 67)"
    },
    uz:{
      name:"Ben", role:"BTT onlayn yordamchisi", badge:"1",
      ph:"Savolingizni yozing (masalan: narxlar, yetkazish, Roero stuli)…",
      hi:"Salom! Men BTT yordamchisiman 🌿 Ovqat stollari, to‘qilgan, plastik va yumshoq stullarni tanlashda yordam beraman, narxlar va yetkazib berish haqida aytib beraman. Nimadan boshlaymiz?",
      quick:["Stullar narxlari","Plastik stullar","To‘qilgan stullar","Ovqat stollari","Yetkazish va olib ketish","Menejer bilan bog‘lanish"],
      ans:{
        "Stullar narxlari":"Ommabop plastik stullar narxlari: ROERO - 188 000 so‘m, NOERO - 212 000 so‘m, TODO va TODO SOFT - 236 000 so‘m, JARDIN - 344 000 so‘m. Barcha narxlar <a href='catalog.html'>BTT to‘liq katalogida</a>.",
        "To‘qilgan stullar":"Metall karkasli va yumshoq yostiqchali Vertex va Corda to‘qilgan stullari. Ayvonlar, terasalar va oshxona zonalari uchun qulay. <a href='catalog.html?cat=wicker-chairs'>Katalog</a>da ko‘ring.",
        "Plastik stullar":"Amaliy plastik stullar: ROERO (188 000 so‘m), NOERO (212 000 so‘m), TODO (236 000 so‘m), yumshoq o‘rindiqli TODO SOFT (236 000 so‘m) va JARDIN kreslosi (344 000 so‘m). <a href='catalog.html?cat=plastic-chairs'>Katalog</a>da tanlang.",
        "Yumshoq stullar":"Uylar va kafelar uchun qulay metall karkasli LIRA stullari va COMO kreslolari. <a href='catalog.html?cat=upholstered-chairs'>Katalog</a>da ko‘ring.",
        "Ovqat stollari":"LDSP ustki qismli va metall karkasli Taper, Vertex, Corda stollari (80×80 sm, 135×80 sm va dumaloq Ø90 sm). <a href='catalog.html?cat=tables'>Katalog</a>da ko‘ring.",
        "Yetkazish va olib ketish":"Toshkent bo‘ylab yetkazish 1-2 ish kunida to‘g‘ridan-to‘g‘ri kuryer tarifi bo‘yicha amalga oshiriladi (Yandex / Labo / Porter). Ombordan olib ketish ham kelishuv asosida mavjud. Viloyatlarga yetkazib berish xizmatlari orqali yuboramiz.",
        "Menejer bilan bog‘lanish":"Telegramda <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> va telefon <a href='tel:+998771044422'>+998 77 104 44 22</a> orqali bog‘laning."
      },
      fallback:"Mebel katalogi, amaldagi narxlar, yetkazib berish shartlari, to‘lov (Click, Payme, naqd) haqida yordam bera olaman. Mavzuni tanlang yoki savol bering 👇",
      leadTitle:"Telefon raqamingizni qoldiring, menejerimiz 10-15 daqiqa ichida bog‘lanadi:",
      leadSend:"Telegramga yuborish",
      leadSending:"Yuborilmoqda…",
      leadOk:"Arizangiz Telegram orqali menejerga yuborildi!",
      leadOkSub:"Menejerimiz 10-15 daqiqa ichida siz bilan bog‘lanadi.",
      cartEmpty:"Savat hozircha bo‘sh 🛒<br>Ommabop stullarni ko‘rishni xohlaysizmi?",
      cartTotal:"Savatdagi jami summa",
      cartCheckout:"Buyurtma berish",
      cartMore:"Batafsil",
      cartBuy:"Savatga",
      cartAdded:"Qo‘shildi!",
      phoneInvalid:"Iltimos, to‘g‘ri telefon raqamini kiriting (masalan: +998 90 123 45 67)"
    },
    en:{
      name:"Ben", role:"BTT Assistant", badge:"1",
      ph:"Type a question (e.g.: prices, delivery, Roero chair)…",
      hi:"Hello! I'm your BTT assistant 🌿 I can help you choose dining tables, wicker, plastic, and upholstered chairs, explain prices and delivery. Where shall we start?",
      quick:["Chair prices","Plastic chairs","Wicker chairs","Dining tables","Delivery and pickup","Talk to a manager"],
      ans:{
        "Chair prices":"Current prices for popular plastic chairs: ROERO - 188,000 UZS, NOERO - 212,000 UZS, TODO & TODO SOFT - 236,000 UZS, JARDIN - 344,000 UZS. View all models in the <a href='catalog.html'>full catalog</a>.",
        "Wicker chairs":"Vertex and Corda wicker chairs on sturdy metal frames with soft cushions included. Perfect for verandas, patios, and dining rooms. View them in the <a href='catalog.html?cat=wicker-chairs'>wicker chairs catalog</a>.",
        "Plastic chairs":"Practical plastic chairs: ROERO (188,000 UZS), NOERO (212,000 UZS), TODO (236,000 UZS), padded TODO SOFT (236,000 UZS), and JARDIN armchair (344,000 UZS). View in the <a href='catalog.html?cat=plastic-chairs'>catalog</a>.",
        "Upholstered chairs":"Elegant LIRA chairs and comfortable COMO armchairs on sturdy metal frames - perfect for homes, living rooms, and HoReCa. See the <a href='catalog.html?cat=upholstered-chairs'>catalog</a>.",
        "Dining tables":"Chipboard dining tables on metal frames (Taper, Vertex, Corda) in 80×80 cm, 135×80 cm, and Ø90 cm round. Best for indoor and covered spaces. View in the <a href='catalog.html?cat=tables'>catalog</a>.",
        "Delivery and pickup":"Delivery across Tashkent takes 1-2 business days at direct courier rates (Yandex / Labo / Porter). Warehouse pickup in Tashkent is available by appointment.",
        "Talk to a manager":"Reach us on Telegram <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> or call <a href='tel:+998771044422'>+998 77 104 44 22</a>."
      },
      fallback:"I can help with our furniture catalog, current prices, delivery in Tashkent, payment methods (Click, Payme, cash), or connect you with a manager. Choose a topic below or type your question 👇",
      leadTitle:"Leave your phone number and our manager will contact you within 10-15 minutes:",
      leadSend:"Send to Telegram",
      leadSending:"Sending…",
      leadOk:"Request sent to manager via Telegram!",
      leadOkSub:"Our manager will contact you within 10-15 minutes.",
      cartEmpty:"Your cart is currently empty 🛒<br>Would you like to browse our popular chairs?",
      cartTotal:"Cart total",
      cartCheckout:"Proceed to checkout",
      cartMore:"Details",
      cartBuy:"Add to cart",
      cartAdded:"Added!",
      phoneInvalid:"Please enter a valid phone number (e.g.: +998 90 123 45 67)"
    }
  };

  function lang(){
    var s = localStorage.getItem("btt_lang");
    return T[s] ? s : "ru";
  }

  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
    });
  }

  var chatHistory = [];
  var lastLeadPhone = null;

  async function sendBotLead(phone, messageText){
    if(!phone) return false;
    lastLeadPhone = phone;
    var curLang = lang();
    var defaultName = curLang === "uz" ? "Mijoz (onlayn-chat)" : curLang === "en" ? "Customer (online chat)" : "Посетитель сайта (онлайн-чат)";
    var payload = {
      source: "bot",
      name: defaultName,
      phone: phone,
      message: messageText || (curLang === "uz" ? "Chat-bot orqali aloqa so'rovi" : curLang === "en" ? "Callback request from chat bot" : "Запрос на консультацию из чат-бота"),
      page: window.location.pathname + window.location.search,
      lang: curLang,
      history: chatHistory.slice(-8)
    };
    try {
      var res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) {
      console.error("Failed to send bot lead to Telegram:", err);
      return false;
    }
  }

  function extractPhone(text){
    if(!text) return null;
    var s = String(text);
    var rx = /(?:\+?998[\s.-]*)?(?:\(?\d{2}\)?[\s.-]*)?\d{3}[\s.-]*\d{2}[\s.-]*\d{2}\b/g;
    var matches = s.match(rx);
    if(matches && matches.length){
      for(var i=0; i<matches.length; i++){
        var digits = matches[i].replace(/\D/g, "");
        if(digits.length === 9) return "+998" + digits;
        if(digits.length === 12 && digits.startsWith("998")) return "+" + digits;
      }
    }
    var rawDigits = s.replace(/\D/g, "");
    if(rawDigits.length === 9) return "+998" + rawDigits;
    if(rawDigits.length === 12 && rawDigits.startsWith("998")) return "+" + rawDigits;
    return null;
  }

  function renderProductCard(slug, curLang){
    var P = window.BTT_PRODUCTS || {};
    var prod = P[slug];
    if(!prod) return "";
    var I = window.BTT_I18N || {};
    var dict = I[curLang] || I.ru || {};
    var title = dict[slug + ".name"] || prod.name || slug;
    var priceStr = prod.now ? (prod.now.toLocaleString("ru-RU") + " сум") : "";
    var img = (prod.images && prod.images[0]) || (prod.colors && prod.colors[0] && prod.colors[0].image) || "";
    var tCfg = T[curLang] || T.ru;

    return '<div class="bot-prod-card" data-slug="' + esc(slug) + '">' +
      (img ? '<img src="' + esc(img) + '" alt="' + esc(title) + '" class="bot-prod-card__img" loading="lazy" onerror="this.style.display=\'none\'">' : '') +
      '<div class="bot-prod-card__info">' +
        '<div class="bot-prod-card__title">' + esc(title) + '</div>' +
        '<div class="bot-prod-card__price">' + esc(priceStr) + '</div>' +
        '<div class="bot-prod-card__actions">' +
          '<a href="/catalog/' + esc(slug) + '" class="bot-prod-card__link">' + esc(tCfg.cartMore) + ' →</a>' +
          '<button type="button" class="bot-prod-card__buy" data-bot-add="' + esc(slug) + '">🛒 ' + esc(tCfg.cartBuy) + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderLeadForm(curLang){
    var tCfg = T[curLang] || T.ru;
    return '<div class="bot-lead-box" data-lead-form>' +
      '<div class="bot-lead-box__title">' + esc(tCfg.leadTitle) + '</div>' +
      '<div class="bot-lead-box__row">' +
        '<input type="tel" class="bot-lead-input" placeholder="+998 __ ___ __ __" maxlength="20" autocomplete="tel">' +
        '<button type="button" class="bot-lead-btn" data-lead-submit>' +
          '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/></svg> ' +
          esc(tCfg.leadSend) +
        '</button>' +
      '</div>' +
    '</div>';
  }

  function renderLeadSuccess(phone, curLang){
    var tCfg = T[curLang] || T.ru;
    var cleanPhone = esc(phone || "");
    return '<div class="bot-lead-ok">' +
      '✅ <b>' + esc(tCfg.leadOk) + '</b><br>' +
      (cleanPhone ? '📞 <b>' + cleanPhone + '</b><br>' : '') +
      esc(tCfg.leadOkSub) +
    '</div>';
  }

  function renderCartState(curLang){
    var tCfg = T[curLang] || T.ru;
    var cartApi = window.BTT_CART;
    var cart = (cartApi && cartApi.getCart) ? cartApi.getCart() : {};
    var keys = Object.keys(cart);
    if(!keys.length){
      return tCfg.cartEmpty;
    }
    var total = 0;
    var listHtml = '<ul class="bot-cart-card__list">';
    keys.forEach(function(k){
      var it = cart[k];
      if(!it) return;
      var price = it.price || 0;
      var qty = it.qty || 1;
      total += price * qty;
      listHtml += '<li><b>' + esc(it.name || k) + '</b>: ' + qty + ' × ' + price.toLocaleString("ru-RU") + ' сум</li>';
    });
    listHtml += '</ul>';

    return '<div class="bot-cart-card">' +
      listHtml +
      '<div class="bot-cart-card__total">' + esc(tCfg.cartTotal) + ': <b>' + total.toLocaleString("ru-RU") + ' сум</b></div>' +
      '<button type="button" class="bot-cart-card__btn" data-bot-cart-open>🛍 ' + esc(tCfg.cartCheckout) + '</button>' +
    '</div>';
  }

  /* ---------------- Intelligent Intent Engine ---------------- */
  function normalizeText(str){
    return String(str || "").toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  }

  function matchProduct(norm){
    var P = window.BTT_PRODUCTS || {};
    var slugs = window.BTT_CANONICAL_SLUGS || Object.keys(P);

    var aliasPatterns = [
      { key: "roero", slug: "stul-roero", rx: /\b(roero|роэро|роэра)\b/ },
      { key: "noero", slug: "stul-noero", rx: /\b(noero|ноэро|ноэра)\b/ },
      { key: "todo-soft", slug: "stul-todo-soft", rx: /\b(todo\s*soft|тодо\s*софт)\b/ },
      { key: "todo", slug: "stul-todo", rx: /\b(todo|тодо)\b/ },
      { key: "jardin", slug: "stul-jardin", rx: /\b(jardin|жардин|жарден)\b/ },
      { key: "vertex-d90", slug: "stol-vertex-d90", rx: /\b(d90|д90|круглый|dumaloq|round)\b/ },
      { key: "vertex-chair", slug: "stul-vertex", rx: /\b(vertex|вертекс).*?(стул|stul|chair)|(стул|stul|chair).*?(vertex|вертекс)\b/ },
      { key: "vertex-table", slug: "stol-vertex-80", rx: /\b(vertex|вертекс).*?(стол|stol|table)|(стол|stol|table).*?(vertex|вертекс)\b/ },
      { key: "corda-chair", slug: "stul-corda", rx: /\b(corda|корда).*?(стул|stul|chair)|(стул|stul|chair).*?(corda|корда)\b/ },
      { key: "corda-table", slug: "stol-corda-135", rx: /\b(corda|корда).*?(стол|stol|table)|(стол|stol|table).*?(corda|корда)\b/ },
      { key: "lira", slug: "stul-lira", rx: /\b(lira|лира)\b/ },
      { key: "como", slug: "kreslo-como", rx: /\b(como|комо)\b/ },
      { key: "taper-80", slug: "stol-taper-80", rx: /\b(taper|тейпер|тапер).*?80|80.*?(taper|тейпер|тапер)\b/ },
      { key: "taper-135", slug: "stol-taper-135", rx: /\b(taper|тейпер|тапер).*?135|135.*?(taper|тейпер|тапер)\b/ },
      { key: "taper", slug: "stol-taper-80", rx: /\b(taper|тейпер|тапер)\b/ },
      { key: "vertex", slug: "stul-vertex", rx: /\b(vertex|вертекс)\b/ },
      { key: "corda", slug: "stul-corda", rx: /\b(corda|корда)\b/ }
    ];

    for(var i = 0; i < aliasPatterns.length; i++){
      if(aliasPatterns[i].rx.test(norm)){
        var targetSlug = aliasPatterns[i].slug;
        var p = P[targetSlug];
        if(p) return { slug: targetSlug, product: p };
      }
    }

    var words = norm.split(" ").filter(function(w){ return w.length >= 4; });
    for(var j = 0; j < slugs.length; j++){
      var s = slugs[j];
      var pr = P[s];
      if(!pr) continue;
      var cleanSlug = s.replace(/-/g, " ");
      for(var k = 0; k < words.length; k++){
        if(cleanSlug.indexOf(words[k]) !== -1){
          return { slug: s, product: pr };
        }
      }
    }
    return null;
  }

  function resolveBotResponse(rawText){
    var norm = normalizeText(rawText);
    var curLang = lang();
    var d = T[curLang] || T.ru;

    // 1. Phone number detected in user message -> auto lead submission to Telegram
    var phoneFound = extractPhone(rawText);
    if(phoneFound){
      sendBotLead(phoneFound, rawText);
      var successMsg = renderLeadSuccess(phoneFound, curLang);
      var followUp = curLang === "uz" ? "Yana biror savolingiz bormi?" : curLang === "en" ? "Do you have any other questions?" : "Чем ещё я могу вам помочь?";
      return successMsg + "<br>" + followUp;
    }

    // 2. Direct match in canned quick answers
    if(d.ans[rawText]){
      var baseAns = d.ans[rawText];
      if(rawText.indexOf("Пластиковые") !== -1 || rawText.indexOf("Plastik") !== -1 || rawText.indexOf("Plastic") !== -1){
        return baseAns + renderProductCard("stul-roero", curLang) + renderProductCard("stul-todo-soft", curLang);
      }
      if(rawText.indexOf("Плетёные") !== -1 || rawText.indexOf("To‘qilgan") !== -1 || rawText.indexOf("Wicker") !== -1){
        return baseAns + renderProductCard("stul-vertex", curLang) + renderProductCard("stul-corda", curLang);
      }
      if(rawText.indexOf("Мягкие") !== -1 || rawText.indexOf("Yumshoq") !== -1 || rawText.indexOf("Upholstered") !== -1){
        return baseAns + renderProductCard("stul-lira", curLang) + renderProductCard("kreslo-como", curLang);
      }
      if(rawText.indexOf("столы") !== -1 || rawText.indexOf("stollari") !== -1 || rawText.indexOf("tables") !== -1){
        return baseAns + renderProductCard("stol-taper-80", curLang) + renderProductCard("stol-taper-135", curLang);
      }
      if(rawText.indexOf("менеджер") !== -1 || rawText.indexOf("Menejer") !== -1 || rawText.indexOf("manager") !== -1){
        return baseAns + renderLeadForm(curLang);
      }
      return baseAns;
    }

    // 3. Cart inspection query
    if(/\b(корзин|в корзине|заказ в корзине|что я выбрал|savat|savatda|cart|my cart|in my cart|basket)\b/.test(norm)){
      return renderCartState(curLang);
    }

    // 4. Specific product search
    var matchedProd = matchProduct(norm);
    if(matchedProd){
      var prod = matchedProd.product;
      var slug = matchedProd.slug;
      var I = window.BTT_I18N || {};
      var dict = I[curLang] || I.ru || {};
      var title = dict[slug + ".name"] || prod.name || slug;
      var priceStr = prod.now ? (prod.now.toLocaleString("ru-RU") + " сум") : "";

      var desc = "";
      if(curLang === "uz"){
        desc = "<b>" + esc(title) + "</b>" + (priceStr ? " - narxi: <b>" + esc(priceStr) + "</b>" : "") +
          ". Toshkent omborida mavjud, tezkor yetkazib berish xizmati bilan.";
      } else if(curLang === "en"){
        desc = "<b>" + esc(title) + "</b>" + (priceStr ? " - price: <b>" + esc(priceStr) + "</b>" : "") +
          ". In stock at our Tashkent warehouse, fast dispatch available.";
      } else {
        desc = "<b>" + esc(title) + "</b>" + (priceStr ? " - цена: <b>" + esc(priceStr) + "</b>" : "") +
          ". В наличии на складе в Ташкенте, быстрая доставка по городу.";
      }
      return desc + renderProductCard(slug, curLang);
    }

    // 5. Stock & availability
    if(/\b(в наличии|наличии|склад|есть ли|bor mi|mavjud|in stock|stock|available)\b/.test(norm)){
      if(curLang === "uz"){
        return "Barcha modellar (Roero, Noero, Todo, Todo Soft, Jardin, Vertex, Corda, Como, Lira, Taper) Toshkentdagi omborda mavjud. Buyurtma berilgan kuni jo‘natishimiz mumkin!";
      } else if(curLang === "en"){
        return "All models in our catalog (Roero, Noero, Todo, Todo Soft, Jardin, Vertex, Corda, Como, Lira, Taper) are in stock at our Tashkent warehouse in factory packaging. Same-day dispatch available!";
      } else {
        return "Все модели из каталога (Roero, Noero, Todo, Todo Soft, Jardin, Vertex, Corda, Como, Lira, Taper) есть в наличии на складе в Ташкенте в фабричной упаковке. Возможна отгрузка в день заказа!";
      }
    }

    // 6. Weight capacity & strength (NO fake numbers)
    if(/\b(нагрузк|максимальный вес|сколько выдерживает|прочность|веса|og irlik|vazn|yuklama|weight capacity|max load|load)\b/.test(norm)){
      if(curLang === "uz"){
        return "Barcha BTT mebellari uy va jamoat joylarida (kafe, restoranlar) uzoq muddat xizmat qilish uchun mo‘ljallangan. Birlamchi mustahkam polipropilen va kukunli bo‘yoq bilan qoplangan po‘lat karkasdan ishlab chiqariladi va standart kattalar yuklamasini ishonchli ko‘taradi.";
      } else if(curLang === "en"){
        return "All BTT furniture is engineered for heavy daily residential and commercial (HoReCa) use. Constructed from high-grade virgin polypropylene and powder-coated steel frames, designed to reliably handle standard adult loads.";
      } else {
        return "Вся мебель BTT рассчитана на интенсивную повседневную эксплуатацию в домах, кафе и ресторанах (HoReCa). Стулья изготовлены из первичного ударопрочного полипропилена или стального каркаса с порошковой покраской и надёжно выдерживают стандартные эксплуатационные нагрузки взрослого человека.";
      }
    }

    // 7. Discounts & promotions
    if(/\b(скидк|акци|промокод|дешевле|chegirma|aktsiya|aksiya|promokod|discount|promo|sale)\b/.test(norm)){
      if(curLang === "uz"){
        return "Saytimizda onlayn buyurtma berishda <b>BENTEN2026</b> promokodidan foydalanib 5% chegirmaga ega bo‘ling! Shuningdek, 10 tadan ortiq stul xaridi uchun maxsus ulgurji narxlar amal qiladi.";
      } else if(curLang === "en"){
        return "Use promo code <b>BENTEN2026</b> at checkout for a 5% discount! We also offer volume discounts for orders of 10+ chairs or commercial projects.";
      } else {
        return "При заказе через корзину на сайте действует промокод <b>BENTEN2026</b> на скидку 5%! Также для заказов от 10 стульев или оптовых партий действуют специальные оптовые цены.";
      }
    }

    // 8. Live manager / contact / callback
    if(/\b(менеджер|оператор|человек|связаться|перезвон|позвонить|телефон|номер|контакт|телеграм|menejer|operator|bog lanish|telefon|contact|manager|call|callback|phone|talk)\b/.test(norm)){
      return (d.ans["Связаться с менеджером"] || d.ans["Menejer bilan bog‘lanish"] || d.ans["Talk to a manager"]) + renderLeadForm(curLang);
    }

    // 9. Greetings & small talk
    if(/\b(привет|здравствуй|добрый|салом|salom|assalomu|hello|hi|hey)\b/.test(norm)){
      return d.hi;
    }

    // 10. Prices & cost
    if(/\b(цена|цены|почем|сколько|прайс|стоимость|дешево|дорого|narx|narxi|qancha|summa|price|prices|cost|how much)\b/.test(norm)){
      return (d.ans["Цены на стулья"] || d.ans["Stullar narxlari"] || d.ans["Chair prices"]) + renderProductCard("stul-roero", curLang);
    }

    // 11. Delivery & pickup terms
    if(/\b(доставк|доставка|привез|курьер|сроки|самовывоз|забрать|склад|откуда|город|yetkazib|yetkazish|kuryer|olib ketish|ombor|delivery|shipping|pickup)\b/.test(norm)){
      return d.ans["Доставка и самовывоз"] || d.ans["Yetkazish va olib ketish"] || d.ans["Delivery and pickup"];
    }

    // 12. Showroom, location, address
    if(/\b(где вы|где находитесь|адрес|шоурум|локация|геолокация|куда подъехать|manzil|qayerda|lokatsiya|showroom|address|location|where)\b/.test(norm)){
      if(curLang === "uz"){
        return "Biz Toshkent shahrida joylashganmiz (ombor va ofis oldindan kelishuv bo‘yicha). Ish vaqti: Du-Sha, 10:00 - 20:00. Tashrif buyurishdan oldin Telegram <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> yoki <a href='tel:+998771044422'>+998 77 104 44 22</a> raqamiga yozing!";
      } else if(curLang === "en"){
        return "We are based in Tashkent, Uzbekistan (central warehouse and showroom by appointment). Working hours: Mon-Sat 10:00 - 20:00. Please contact us on Telegram <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> or call <a href='tel:+998771044422'>+998 77 104 44 22</a> before visiting.";
      } else {
        return "Мы находимся в Ташкенте (склад готовой продукции и офис по предварительной договорённости). Режим работы: Пн-Сб, 10:00 - 20:00. Перед визитом напишите в Telegram <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> или позвоните <a href='tel:+998771044422'>+998 77 104 44 22</a>.";
      }
    }

    // 13. Payment methods
    if(/\b(оплата|как оплатить|click|payme|терминал|наличные|перевод|счет|счёт|картой|карта|to lov|tolov|payment|pay)\b/.test(norm)){
      if(curLang === "uz"){
        return "To‘lov usullari: qabul qilishda naqd yoki terminal (Humo/Uzcard), Click va Payme orqali onlayn (QR yoki havola orqali), hamda yuridik shaxslar uchun bank hisob raqamiga o‘tkazma.";
      } else if(curLang === "en"){
        return "Payment methods: Cash or POS terminal (Humo/Uzcard) upon delivery, Click and Payme online (QR code or link), and official bank invoice / card transfer for legal entities.";
      } else {
        return "Способы оплаты: при получении наличными или терминалом (Humo/Uzcard), онлайн через Click / Payme (по QR или ссылке), а также безналичный расчёт для юридических лиц.";
      }
    }

    // 14. How to order
    if(/\b(как заказать|заказ|купить|оформить|1 клик|в один клик|buyurtma|xarid|order|buy|how to order)\b/.test(norm)){
      if(curLang === "uz"){
        return "Buyurtma berish juda oson: 1) Saytda savatga qo‘shing yoki «1-klikda xarid» tugmasini bosing; 2) Telefon raqamingizni qoldiring; 3) Menejer 10 daqiqa ichida bog‘lanib yetkazishni tasdiqlaydi. Yoki to‘g‘ridan-to‘g‘ri <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>Telegramda</a> buyurtma berishingiz mumkin.";
      } else if(curLang === "en"){
        return "Ordering is simple: 1) Add items to your cart or click «Buy in 1 click»; 2) Leave your contact details; 3) Our manager calls you within 10 minutes to verify items and delivery. Or order directly via <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>Telegram</a>.";
      } else {
        return "Оформить заказ очень просто: 1) Добавьте товары в корзину или нажмите «Купить в 1 клик»; 2) Укажите телефон и адрес; 3) Менеджер свяжется с вами в течение 10 минут для согласования доставки. Либо оформите заказ напрямую в <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>Telegram</a>.";
      }
    }

    // 15. Order tracking & account
    if(/\b(где мой заказ|статус|отследить|личный кабинет|аккаунт|профиль|мои заказы|войти|buyurtma holati|profil|kabinet|order status|track|account)\b/.test(norm)){
      if(curLang === "uz"){
        return "Barcha buyurtmalaringiz va ularning holati <a href='account.html'>Shaxsiy kabinet</a>da ko‘rinadi. Shuningdek, buyurtma raqamini (masalan, BT-2049) Telegramda <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>menejerga</a> yuborib tezkor ma‘lumot olishingiz mumkin.";
      } else if(curLang === "en"){
        return "You can track your orders and statuses in your <a href='account.html'>Personal Account</a>. Alternatively, send your order number (e.g., BT-2049) to our manager on <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>Telegram</a>.";
      } else {
        return "Статус заказа можно отслеживать в вашем <a href='account.html'>Личном кабинете</a>. Также вы можете отправить номер заказа (например: BT-2049) менеджеру в <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>Telegram</a> для мгновенного ответа.";
      }
    }

    // 16. HoReCa / Wholesale / B2B
    if(/\b(хорека|horeca|кафе|ресторан|опт|оптом|партия|для бизнеса|юридическ|веранда|терраса|летник|ulgurji|kafe|wholesale|b2b)\b/.test(norm)){
      if(curLang === "uz"){
        return "Kafelar, restoranlar, mehmonxonalar va loyihalar uchun ulgurji narxlar va shartnoma asosida yetkazish mavjud. Batafsil: <a href='horeca.html'>HoReCa sahifasida</a> yoki menejer bilan bog‘laning: <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a>." + renderLeadForm(curLang);
      } else if(curLang === "en"){
        return "We offer wholesale pricing, custom batch supply, and commercial invoices for cafes, restaurants, hotels, and interior projects. Learn more on our <a href='horeca.html'>HoReCa page</a> or reach out on <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>Telegram</a>." + renderLeadForm(curLang);
      } else {
        return "Для кафе, ресторанов, отелей и веранд мы предлагаем оптовые цены, поставку партиями и работу по договору. Подробнее на нашей <a href='horeca.html'>странице HoReCa</a> или свяжитесь с B2B-менеджером в <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>Telegram</a>." + renderLeadForm(curLang);
      }
    }

    // 17. Materials & care
    if(/\b(материал|ротанг|пластик|лдсп|уход|подушки|на улице|дождь|солнце|погода|выгорает|мыть|чистить|material|rotang|parvarish|care|weather)\b/.test(norm)){
      if(curLang === "uz"){
        return "BTT mebellari sifatli polipropilen, ultrabinafsha nurlarga chidamli sun‘iy rotang va kukunli bo‘yoq bilan qoplangan metall karkasdan ishlab chiqariladi. Ularni tozalash juda oson. Batafsil: <a href='care.html'>Parvarishlash bo‘yicha qo‘llanma</a>.";
      } else if(curLang === "en"){
        return "BTT furniture is made from food-grade polypropylene, UV-stabilized synthetic wicker, and powder-coated steel frames. Cleaning requires only water and mild soap. Read our full guide at <a href='care.html'>Furniture Care</a>.";
      } else {
        return "Мебель BTT изготавливается из первичного полипропилена, стойкого к солнцу искусственного ротанга и металлокаркаса с порошковой покраской. Мебель не боится влаги и легко моется. Читайте руководство по <a href='care.html'>уходу за мебелью</a>.";
      }
    }

    // 18. Returns & warranty
    if(/\b(возврат|гарантия|брак|обмен|вернуть|сломался|qaytarish|kafolat|almashtirish|return|warranty|exchange|refund)\b/.test(norm)){
      if(curLang === "uz"){
        return "Foydalanilmagan tovarlarni qonunda belgilangan muddatda qaytarish yoki almashtirish mumkin. Yuborishdan oldin har bir to‘plam tekshiriladi. Shartlar: <a href='returns.html'>Qaytarish siyosati</a>.";
      } else if(curLang === "en"){
        return "You can return or exchange unused items in original packaging according to legal standards. All orders are inspected before dispatch. Full details: <a href='returns.html'>Return Policy</a>.";
      } else {
        return "Вы можете вернуть или обменять товар надлежащего качества в установленный законом срок при сохранении фабричной упаковки и товарного вида. Подробнее на странице <a href='returns.html'>Возврат товара</a>.";
      }
    }

    // 19. Broad categories
    if(/\b(плетен|плетён|to qilgan|wicker)\b/.test(norm)){
      return (d.ans["Плетёные стулья"] || d.ans["To‘qilgan stullar"] || d.ans["Wicker chairs"]) + renderProductCard("stul-vertex", curLang) + renderProductCard("stul-corda", curLang);
    }
    if(/\b(пластик|полипропилен|plastik|plastic)\b/.test(norm)){
      return (d.ans["Пластиковые стулья"] || d.ans["Plastik stullar"] || d.ans["Plastic chairs"]) + renderProductCard("stul-roero", curLang) + renderProductCard("stul-todo-soft", curLang);
    }
    if(/\b(мягк|экокож|велюр|ткань|кресло|yumshoq|upholstered)\b/.test(norm)){
      return (d.ans["Мягкие стулья"] || d.ans["Yumshoq stullar"] || d.ans["Upholstered chairs"]) + renderProductCard("stul-lira", curLang) + renderProductCard("kreslo-como", curLang);
    }
    if(/\b(стол|столы|столешниц|обеденн|stollar|stol|table|tables)\b/.test(norm)){
      return (d.ans["Обеденные столы"] || d.ans["Ovqat stollari"] || d.ans["Dining tables"]) + renderProductCard("stol-taper-80", curLang) + renderProductCard("stol-taper-135", curLang);
    }

    // 20. Intelligent Fallback
    return d.fallback + renderLeadForm(curLang);
  }

  /* ---------------- UI & DOM Wiring ---------------- */
  document.addEventListener("DOMContentLoaded", function(){
    if(document.querySelector(".bot-fab")) return;

    const fab=document.createElement("button");
    fab.className="bot-fab"; fab.setAttribute("aria-label","Чат-помощник");
    fab.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.8-.9L3 21l1.4-5.2A8.4 8.4 0 0 1 3.5 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg><span class="bot-fab__badge">1</span>';

    const panel=document.createElement("div");
    panel.className="bot-panel liquid spatial"; panel.setAttribute("role","dialog"); panel.setAttribute("aria-label","Bententrade assistant");
    panel.innerHTML=
      '<div class="bot-head"><div class="bot-head__ava">Б</div>'+
      '<div><div class="bot-head__t" data-bot-name>Бен</div><div class="bot-head__s" data-bot-role>Онлайн-помощник</div></div>'+
      '<button class="bot-head__x" data-bot-close aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'+
      '<div class="bot-msgs" data-bot-msgs></div>'+
      '<div class="bot-quick" data-bot-quick></div>'+
      '<form class="bot-input" data-bot-form><input type="text" data-bot-input autocomplete="off"><button class="bot-send" type="submit" aria-label="Отправить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/></svg></button></form>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    const msgs=panel.querySelector("[data-bot-msgs]");
    const quick=panel.querySelector("[data-bot-quick]");
    const input=panel.querySelector("[data-bot-input]");
    let started=false;

    function add(text, who){
      chatHistory.push({ who: who, text: text });
      if(chatHistory.length > 20) chatHistory.shift();

      const m=document.createElement("div");
      m.className="bot-msg bot-msg--"+who;
      if(who === "user") m.textContent = text;
      else m.innerHTML = text;
      msgs.appendChild(m); msgs.scrollTop=msgs.scrollHeight;
      return m;
    }

    function typing(){
      const t=document.createElement("div");
      t.className="bot-typing"; t.innerHTML="<span></span><span></span><span></span>";
      msgs.appendChild(t); msgs.scrollTop=msgs.scrollHeight; return t;
    }

    function botSay(text, delay){
      const t=typing();
      setTimeout(()=>{ t.remove(); add(text,"bot"); }, delay||600);
    }

    function renderQuick(){
      const d=T[lang()] || T.ru; quick.innerHTML="";
      d.quick.forEach(label=>{
        const c=document.createElement("button");
        c.className="bot-chip"; c.type="button"; c.textContent=label;
        c.addEventListener("click",()=> handle(label));
        quick.appendChild(c);
      });
    }

    function applyLang(){
      const d=T[lang()] || T.ru;
      const I = window.BTT_I18N || {};
      const tr = (k, fb) => (I.t ? I.t(k) : (I[lang()] && I[lang()][k]) || fb);
      panel.querySelector("[data-bot-name]").textContent=d.name;
      panel.querySelector("[data-bot-role]").textContent=d.role;
      input.placeholder=d.ph;
      fab.setAttribute("aria-label", tr("bot.aria.fab", "Чат-помощник"));
      panel.querySelector("[data-bot-close]")?.setAttribute("aria-label", tr("bot.aria.close", "Закрыть"));
      panel.querySelector(".bot-send")?.setAttribute("aria-label", tr("bot.aria.send", "Отправить"));
      renderQuick();
    }

    function handle(text){
      add(text,"user");
      const resp = resolveBotResponse(text);
      botSay(resp, 500);
    }

    function open(){
      panel.classList.add("open"); fab.classList.add("hidden");
      if(!started){ started=true; setTimeout(()=> botSay(T[lang()].hi, 400), 200); }
      setTimeout(()=> input.focus(), 320);
    }

    function close(){ panel.classList.remove("open"); fab.classList.remove("hidden"); }

    fab.addEventListener("click", open);
    panel.querySelector("[data-bot-close]").addEventListener("click", close);
    panel.querySelector("[data-bot-form]").addEventListener("submit",(e)=>{
      e.preventDefault();
      const v=input.value.trim(); if(!v) return;
      input.value="";
      handle(v);
    });

    // Delegated actions for interactive bot messages
    msgs.addEventListener("click", function(e){
      // 1. Add to cart button inside bot product card
      const addBtn = e.target.closest("[data-bot-add]");
      if(addBtn){
        const slug = addBtn.getAttribute("data-bot-add");
        const P = window.BTT_PRODUCTS || {};
        const p = P[slug];
        const curLang = lang();
        const I = window.BTT_I18N || {};
        const dict = I[curLang] || I.ru || {};
        const title = dict[slug + ".name"] || (p && p.name) || slug;
        const img = (p && p.images && p.images[0]) || (p && p.colors && p.colors[0] && p.colors[0].image) || "";
        const snap = { id: slug, name: title, price: (p && p.now) || 0, img: img };

        if(window.BTT_CART && window.BTT_CART.addToCart){
          window.BTT_CART.addToCart(snap, 1);
        }
        const tCfg = T[curLang] || T.ru;
        const prevText = addBtn.textContent;
        addBtn.textContent = "✓ " + tCfg.cartAdded;
        addBtn.classList.add("is-added");
        setTimeout(()=>{
          addBtn.textContent = prevText;
          addBtn.classList.remove("is-added");
        }, 2200);
        return;
      }

      // 2. Open cart button inside bot cart status card
      const cartBtn = e.target.closest("[data-bot-cart-open]");
      if(cartBtn){
        if(window.BTT_CART && window.BTT_CART.openCart){
          window.BTT_CART.openCart();
        }
        return;
      }

      // 3. Submit phone lead from inline form
      const leadSubmit = e.target.closest("[data-lead-submit]");
      if(leadSubmit){
        const formBox = leadSubmit.closest("[data-lead-form]");
        if(!formBox) return;
        const inp = formBox.querySelector(".bot-lead-input");
        const curLang = lang();
        const tCfg = T[curLang] || T.ru;
        const ph = extractPhone(inp ? inp.value : "");
        if(!ph){
          if(inp){
            inp.style.borderColor = "#e74c3c";
            inp.focus();
            setTimeout(()=>{ inp.style.borderColor = ""; }, 2000);
          }
          return;
        }

        leadSubmit.disabled = true;
        leadSubmit.textContent = tCfg.leadSending;
        sendBotLead(ph, "Заявка из формы обратной связи в чате").then(function(ok){
          formBox.outerHTML = renderLeadSuccess(ph, curLang);
        });
        return;
      }
    });

    // Handle enter key in lead input
    msgs.addEventListener("keydown", function(e){
      if(e.key === "Enter" && e.target.classList.contains("bot-lead-input")){
        e.preventDefault();
        const formBox = e.target.closest("[data-lead-form]");
        const btn = formBox ? formBox.querySelector("[data-lead-submit]") : null;
        if(btn) btn.click();
      }
    });

    function syncDynamicSettings(s) {
      if (!s) return;
      const phone = s.phone || "+998 77 104 44 22";
      const tg = (s.telegram || "bententradeuz").replace(/^@/, "");
      T.ru.ans["Связаться с менеджером"] = "Конечно! На связи в Telegram <a href='https://t.me/" + tg + "' target='_blank' rel='noopener'>@" + tg + "</a> и по телефону <a href='tel:" + phone.replace(/[^\d+]/g, "") + "'>" + phone + "</a>. Ответим на любые вопросы!";
      T.uz.ans["Menejer bilan bog‘lanish"] = "Albatta! Telegramda <a href='https://t.me/" + tg + "' target='_blank' rel='noopener'>@" + tg + "</a> va telefon <a href='tel:" + phone.replace(/[^\d+]/g, "") + "'>" + phone + "</a> orqali bog‘laning.";
      T.en.ans["Talk to a manager"] = "Of course! We are on Telegram <a href='https://t.me/" + tg + "' target='_blank' rel='noopener'>@" + tg + "</a> and phone <a href='tel:" + phone.replace(/[^\d+]/g, "") + "'>" + phone + "</a>. Feel free to ask!";
    }
    document.addEventListener("btt:settings", (e) => syncDynamicSettings(e.detail));
    try {
      const cached = sessionStorage.getItem("btt_settings");
      if (cached) syncDynamicSettings(JSON.parse(cached));
    } catch (_) {}

    document.addEventListener("btt:lang", applyLang);
    new MutationObserver(()=> applyLang()).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    applyLang();
  });
})();
