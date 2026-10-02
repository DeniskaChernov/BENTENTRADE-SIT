/* ============================================================
   BENTENTRADE - site assistant "Бен"
   Self-injecting glass chat widget. Scripted, multilingual,
   intelligent intent engine + catalog product resolution.
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
        "Пластиковые стулья":"Практичные пластиковые стулья: ROERO (188 000 сум), NOERO (212 000 сум), TODO (236 000 сум), мягкий TODO SOFT с подушкой из экокожи (236 000 сум) и кресло JARDIN (344 000 сум). Все модели в <a href='catalog.html?cat=plastic-chairs'>каталоге</a>. Подсказать по цветам?",
        "Мягкие стулья":"Элегантные стулья LIRA и комфортные кресла COMO на металлокаркасе с мягкой обивкой - идеальны для дома, кухни и HoReCa. Смотрите в <a href='catalog.html?cat=upholstered-chairs'>каталоге мягких стульев</a>.",
        "Обеденные столы":"Столы на металлокаркасе со столешницей из ЛДСП (Taper, Vertex, Corda) размерами 80×80 см, 135×80 см и круглый Ø90 см. Рекомендуются для помещений и крытых пространств. Смотрите в <a href='catalog.html?cat=tables'>каталоге столов</a>.",
        "Доставка и самовывоз":"Доставка по Ташкенту осуществляется за 1-2 рабочих дня по прямому тарифу сервиса (Яндекс / Labo / Porter). Возможен самовывоз со склада в Ташкенте по предварительной договорённости. В регионы Узбекистана отправляем через транспортные службы.",
        "Связаться с менеджером":"Мы на связи в Telegram <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> и по телефону <a href='tel:+998771044422'>+998 77 104 44 22</a>. Ответим на любые вопросы и поможем с выбором!"
      },
      fallback:"Я могу подсказать по каталогу мебели, актуальным ценам, условиям доставки по Ташкенту, оплате (Click, Payme, наличные) или соединить с менеджером. Выберите тему ниже или задайте вопрос 👇",
      reply:"Понял! Менеджер свяжется с вами при необходимости. Чем ещё могу помочь?"
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
      reply:"Tushunarli! Menejerimiz tez orada bog‘lanadi. Yana biror narsa kerakmi?"
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
      reply:"Understood! Our manager will be happy to assist you further. Anything else I can help with?"
    }
  };

  function lang(){
    var s = localStorage.getItem("btt_lang");
    return T[s] ? s : "ru";
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

    // Direct token search in catalog
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

    // 1. Direct match in canned quick answers
    var d = T[curLang];
    if(d.ans[rawText]) return d.ans[rawText];

    // 2. Specific product search
    var matchedProd = matchProduct(norm);
    if(matchedProd){
      var prod = matchedProd.product;
      var slug = matchedProd.slug;
      var I = window.BTT_I18N || {};
      var dict = I[curLang] || I.ru || {};
      var title = dict[slug + ".name"] || prod.name || slug;
      var priceStr = prod.now ? (prod.now.toLocaleString("ru-RU") + " сум") : "";

      if(curLang === "uz"){
        return "<b>" + title + "</b>" + (priceStr ? " - narxi: <b>" + priceStr + "</b>" : "") +
          ". Model haqida batafsil ma‘lumot, o‘lchamlar va mavjud ranglarni ko‘rish uchun: <a href='/catalog/" + slug + "'>Mahsulot sahifasiga o‘tish →</a>";
      } else if(curLang === "en"){
        return "<b>" + title + "</b>" + (priceStr ? " - price: <b>" + priceStr + "</b>" : "") +
          ". View full specifications, dimensions, and available colors here: <a href='/catalog/" + slug + "'>Open product card →</a>";
      } else {
        return "<b>" + title + "</b>" + (priceStr ? " - цена: <b>" + priceStr + "</b>" : "") +
          ". Посмотреть характеристики, размеры и доступные цвета: <a href='/catalog/" + slug + "'>Перейти к товару " + title + " →</a>";
      }
    }

    // 3. Greetings & small talk
    if(/\b(привет|здравствуй|добрый|салом|salom|assalomu|hello|hi|hey)\b/.test(norm)){
      return d.hi;
    }

    // 4. Prices & cost
    if(/\b(цена|цены|почем|сколько|прайс|стоимость|дешево|дорого|narx|narxi|qancha|summa|price|prices|cost|how much)\b/.test(norm)){
      return d.ans["Цены на стулья"] || d.ans["Stullar narxlari"] || d.ans["Chair prices"];
    }

    // 5. Delivery & pickup terms
    if(/\b(доставк|доставка|привез|курьер|сроки|самовывоз|забрать|склад|откуда|город|yetkazib|yetkazish|kuryer|olib ketish|ombor|delivery|shipping|pickup)\b/.test(norm)){
      return d.ans["Доставка и самовывоз"] || d.ans["Yetkazish va olib ketish"] || d.ans["Delivery and pickup"];
    }

    // 6. Showroom, location, address
    if(/\b(где вы|где находитесь|адрес|шоурум|локация|геолокация|куда подъехать|manzil|qayerda|lokatsiya|showroom|address|location|where)\b/.test(norm)){
      if(curLang === "uz"){
        return "Biz Toshkent shahrida joylashganmiz (ombor va ofis oldindan kelishuv bo‘yicha). Ish vaqti: Du-Sha, 10:00 - 20:00. Tashrif buyurishdan oldin Telegram <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> yoki <a href='tel:+998771044422'>+998 77 104 44 22</a> raqamiga yozing!";
      } else if(curLang === "en"){
        return "We are based in Tashkent, Uzbekistan (central warehouse and showroom by appointment). Working hours: Mon-Sat 10:00 - 20:00. Please contact us on Telegram <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> or call <a href='tel:+998771044422'>+998 77 104 44 22</a> before visiting.";
      } else {
        return "Мы находимся в Ташкенте (склад готовой продукции и офис по предварительной договорённости). Режим работы: Пн-Сб, 10:00 - 20:00. Перед визитом напишите в Telegram <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a> или позвоните <a href='tel:+998771044422'>+998 77 104 44 22</a>.";
      }
    }

    // 7. Payment methods
    if(/\b(оплата|как оплатить|click|payme|терминал|наличные|перевод|счет|счёт|картой|карта|to lov|tolov|payment|pay)\b/.test(norm)){
      if(curLang === "uz"){
        return "To‘lov usullari: qabul qilishda naqd yoki terminal (Humo/Uzcard), Click va Payme orqali onlayn (QR yoki havola orqali), hamda yuridik shaxslar uchun bank hisob raqamiga o‘tkazma.";
      } else if(curLang === "en"){
        return "Payment methods: Cash or POS terminal (Humo/Uzcard) upon delivery, Click and Payme online (QR code or link), and official bank invoice / card transfer for legal entities.";
      } else {
        return "Способы оплаты: при получении наличными или терминалом (Humo/Uzcard), онлайн через Click / Payme (по QR или ссылке), а также безналичный расчёт для юридических лиц.";
      }
    }

    // 8. How to order
    if(/\b(как заказать|заказ|купить|оформить|1 клик|в один клик|корзина|buyurtma|xarid|order|buy|how to order)\b/.test(norm)){
      if(curLang === "uz"){
        return "Buyurtma berish juda oson: 1) Saytda savatga qo‘shing yoki «1-klikda xarid» tugmasini bosing; 2) Telefon raqamingizni qoldiring; 3) Menejer 10 daqiqa ichida bog‘lanib yetkazishni tasdiqlaydi. Yoki to‘g‘ridan-to‘g‘ri <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>Telegramda</a> buyurtma berishingiz mumkin.";
      } else if(curLang === "en"){
        return "Ordering is simple: 1) Add items to your cart or click «Buy in 1 click»; 2) Leave your contact details; 3) Our manager calls you within 10 minutes to verify items and delivery. Or order directly via <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>Telegram</a>.";
      } else {
        return "Оформить заказ очень просто: 1) Добавьте товары в корзину или нажмите «Купить в 1 клик»; 2) Укажите телефон и адрес; 3) Менеджер свяжется с вами в течение 10 минут для согласования доставки. Либо оформите заказ напрямую в <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>Telegram</a>.";
      }
    }

    // 9. Order tracking & account
    if(/\b(где мой заказ|статус|отследить|личный кабинет|аккаунт|профиль|мои заказы|войти|buyurtma holati|profil|kabinet|order status|track|account)\b/.test(norm)){
      if(curLang === "uz"){
        return "Barcha buyurtmalaringiz va ularning holati <a href='account.html'>Shaxsiy kabinet</a>da ko‘rinadi. Shuningdek, buyurtma raqamini (masalan, BT-2049) Telegramda <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>menejerga</a> yuborib tezkor ma‘lumot olishingiz mumkin.";
      } else if(curLang === "en"){
        return "You can track your orders and statuses in your <a href='account.html'>Personal Account</a>. Alternatively, send your order number (e.g., BT-2049) to our manager on <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>Telegram</a>.";
      } else {
        return "Статус заказа можно отслеживать в вашем <a href='account.html'>Личном кабинете</a>. Также вы можете отправить номер заказа (например: BT-2049) менеджеру в <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>Telegram</a> для мгновенного ответа.";
      }
    }

    // 10. HoReCa / Wholesale / B2B
    if(/\b(хорека|horeca|кафе|ресторан|опт|оптом|партия|для бизнеса|юридическ|веранда|терраса|летник|ulgurji|kafe|wholesale|b2b)\b/.test(norm)){
      if(curLang === "uz"){
        return "Kafelar, restoranlar, mehmonxonalar va loyihalar uchun ulgurji narxlar va shartnoma asosida yetkazish mavjud. Batafsil: <a href='horeca.html'>HoReCa sahifasida</a> yoki menejer bilan bog‘laning: <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>@bententradeuz</a>.";
      } else if(curLang === "en"){
        return "We offer wholesale pricing, custom batch supply, and commercial invoices for cafes, restaurants, hotels, and interior projects. Learn more on our <a href='horeca.html'>HoReCa page</a> or reach out on <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>Telegram</a>.";
      } else {
        return "Для кафе, ресторанов, отелей и веранд мы предлагаем оптовые цены, поставку партиями и работу по договору. Подробнее на нашей <a href='horeca.html'>странице HoReCa</a> или свяжитесь с B2B-менеджером в <a href='https://t.me/bententradeuz' target='_blank' rel='noopener'>Telegram</a>.";
      }
    }

    // 11. Materials & care
    if(/\b(материал|ротанг|пластик|лдсп|уход|подушки|на улице|дождь|солнце|погода|выгорает|мыть|чистить|material|rotang|parvarish|care|weather)\b/.test(norm)){
      if(curLang === "uz"){
        return "BTT mebellari sifatli polipropilen, ultrabinafsha nurlarga chidamli sun‘iy rotang va kukunli bo‘yoq bilan qoplangan metall karkasdan ishlab chiqariladi. Ularni tozalash juda oson. Batafsil: <a href='care.html'>Parvarishlash bo‘yicha qo‘llanma</a>.";
      } else if(curLang === "en"){
        return "BTT furniture is made from food-grade polypropylene, UV-stabilized synthetic wicker, and powder-coated steel frames. Cleaning requires only water and mild soap. Read our full guide at <a href='care.html'>Furniture Care</a>.";
      } else {
        return "Мебель BTT изготавливается из первичного полипропилена, стойкого к солнцу искусственного ротанга и металлокаркаса с порошковой покраской. Мебель не боится влаги и легко моется. Читайте руководство по <a href='care.html'>уходу за мебелью</a>.";
      }
    }

    // 12. Returns & warranty
    if(/\b(возврат|гарантия|брак|обмен|вернуть|сломался|qaytarish|kafolat|almashtirish|return|warranty|exchange|refund)\b/.test(norm)){
      if(curLang === "uz"){
        return "Foydalanilmagan tovarlarni qonunda belgilangan muddatda qaytarish yoki almashtirish mumkin. Yuborishdan oldin har bir to‘plam tekshiriladi. Shartlar: <a href='returns.html'>Qaytarish siyosati</a>.";
      } else if(curLang === "en"){
        return "You can return or exchange unused items in original packaging according to legal standards. All orders are inspected before dispatch. Full details: <a href='returns.html'>Return Policy</a>.";
      } else {
        return "Вы можете вернуть или обменять товар надлежащего качества в установленный законом срок при сохранении фабричной упаковки и товарного вида. Подробнее на странице <a href='returns.html'>Возврат товара</a>.";
      }
    }

    // 13. Contacts & live manager
    if(/\b(контакт|телефон|номер|менеджер|человек|оператор|связаться|телеграм|ватсап|позвонить|kontakt|telefon|menejer|contact|manager|phone|telegram|whatsapp)\b/.test(norm)){
      return d.ans["Связаться с менеджером"] || d.ans["Menejer bilan bog‘lanish"] || d.ans["Talk to a manager"];
    }

    // 14. Broad Categories
    if(/\b(плетен|плетён|to qilgan|wicker)\b/.test(norm)){
      return d.ans["Плетёные стулья"] || d.ans["To‘qilgan stullar"] || d.ans["Wicker chairs"];
    }
    if(/\b(пластик|полипропилен|plastik|plastic)\b/.test(norm)){
      return d.ans["Пластиковые стулья"] || d.ans["Plastik stullar"] || d.ans["Plastic chairs"];
    }
    if(/\b(мягк|экокож|велюр|ткань|кресло|yumshoq|upholstered)\b/.test(norm)){
      return d.ans["Мягкие стулья"] || d.ans["Yumshoq stullar"] || d.ans["Upholstered chairs"];
    }
    if(/\b(стол|столы|столешниц|обеденн|stollar|stol|table|tables)\b/.test(norm)){
      return d.ans["Обеденные столы"] || d.ans["Ovqat stollari"] || d.ans["Dining tables"];
    }

    // 15. Intelligent Fallback
    return d.fallback;
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
      const d=T[lang()]; quick.innerHTML="";
      d.quick.forEach(label=>{
        const c=document.createElement("button");
        c.className="bot-chip"; c.type="button"; c.textContent=label;
        c.addEventListener("click",()=> handle(label));
        quick.appendChild(c);
      });
    }
    function applyLang(){
      const d=T[lang()];
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
