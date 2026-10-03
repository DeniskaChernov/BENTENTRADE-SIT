/* ============================================================
   BTT - site assistant "Бен"
   Glass chat widget: multilingual (RU / UZ / EN), typo-tolerant,
   conversational lead & order capture, dynamic pricing calculator,
   catalog product resolution & Telegram notification.
   Strict adherence to BTT furniture pricing policy (SSOT).
   Zero external dependencies.
   ============================================================ */
(function(){
  "use strict";

  /* ---------------- SSOT PRICING POLICY ---------------- */
  const PRICING = {
    chairs: {
      plastic: [
        { id: "roero", name: "ROERO", retail: 188000, combo: 168000, slug: "stul-roero" },
        { id: "noero", name: "NOERO", retail: 212000, combo: 192000, slug: "stul-noero" },
        { id: "todo", name: "TODO", retail: 236000, combo: 216000, slug: "stul-todo" },
        { id: "todo-soft", name: "TODO SOFT", retail: 236000, combo: 216000, slug: "stul-todo-soft" },
        { id: "jardin", name: "JARDIN", retail: 344000, combo: 324000, slug: "stul-jardin" }
      ],
      wicker: [
        { id: "vertex", name: "VERTEX", retail: 499000, slug: "stul-vertex" },
        { id: "corda", name: "CORDA", retail: 499000, slug: "stul-corda" }
      ],
      upholstered: [
        { id: "lira", name: "LIRA", retail: 354000, slug: "stul-lira" },
        { id: "como", name: "COMO", retail: 486000, slug: "kreslo-como" }
      ]
    },
    tables: [
      { id: "vertex-d90", name: "VERTEX D90", retail: 680000, combo: 680000, slug: "stol-vertex-d90", size: "Ø90 см" },
      { id: "taper-80", name: "TAPER 80x80", retail: 783000, combo: 733000, slug: "stol-taper-80", size: "80×80 см" },
      { id: "taper-135", name: "TAPER 135x80", retail: null, combo: 860000, slug: "stol-taper-135", size: "135×80 см" },
      { id: "corda-135", name: "CORDA 135x80", retail: 999000, combo: 949000, slug: "stol-corda-135", size: "135×80 см" }
    ],
    approvedCombos: [
      {
        id: "vertex-d90-vertex",
        nameRu: "1 стол VERTEX D90 + 4 плетёных стула VERTEX",
        nameUz: "1 ta VERTEX D90 stoli + 4 ta to‘qilgan VERTEX stuli",
        nameEn: "1 VERTEX D90 table + 4 VERTEX wicker chairs",
        price: 2676000,
        tableSlug: "stol-vertex-d90",
        chairSlug: "stul-vertex"
      },
      {
        id: "vertex-d90-corda",
        nameRu: "1 стол VERTEX D90 + 4 плетёных стула CORDA",
        nameUz: "1 ta VERTEX D90 stoli + 4 ta to‘qilgan CORDA stuli",
        nameEn: "1 VERTEX D90 table + 4 CORDA wicker chairs",
        price: 2676000,
        tableSlug: "stol-vertex-d90",
        chairSlug: "stul-corda"
      },
      {
        id: "taper-80-vertex",
        nameRu: "1 стол TAPER 80x80 + 4 плетёных стула VERTEX",
        nameUz: "1 ta TAPER 80x80 stoli + 4 ta to‘qilgan VERTEX stuli",
        nameEn: "1 TAPER 80x80 table + 4 VERTEX wicker chairs",
        price: 2850000,
        tableSlug: "stol-taper-80",
        chairSlug: "stul-vertex"
      },
      {
        id: "taper-80-corda",
        nameRu: "1 стол TAPER 80x80 + 4 плетёных стула CORDA",
        nameUz: "1 ta TAPER 80x80 stoli + 4 ta to‘qilgan CORDA stuli",
        nameEn: "1 TAPER 80x80 table + 4 CORDA wicker chairs",
        price: 2850000,
        tableSlug: "stol-taper-80",
        chairSlug: "stul-corda"
      }
    ]
  };

  /* ---------------- LOCALIZATION STRINGS ---------------- */
  const T = {
    ru: {
      name: "Бен",
      role: "Онлайн-помощник BTT",
      badge: "1",
      ph: "Напишите вопрос (например: цены на стулья, комплект, заказ)…",
      hi: "Здравствуйте! Я помощник BTT 🌿 Помогу подобрать обеденные столы, стулья и готовые комплекты, рассчитаю точную стоимость и помогу оформить заявку. С чего начнём?",
      quick: [
        "Цены на стулья",
        "Цены на столы",
        "Готовые комплекты",
        "Пластиковые стулья",
        "Плетёные стулья",
        "Мягкие стулья",
        "Оформить заказ",
        "Доставка и самовывоз",
        "Способы оплаты",
        "Где мы находимся",
        "Связаться с менеджером"
      ],
      ans: {
        "Цены на стулья": "<b>Актуальные цены на стулья BTT:</b><br>" +
          "<b>Пластиковые (отдельно / в комплекте со столом):</b><br>" +
          "• ROERO: 188 000 сум / 168 000 сум<br>" +
          "• NOERO: 212 000 сум / 192 000 сум<br>" +
          "• TODO: 236 000 сум / 216 000 сум<br>" +
          "• JARDIN: 344 000 сум / 324 000 сум<br>" +
          "<i>Комплектная цена действует только при покупке со столом.</i><br><br>" +
          "<b>Плетёные стулья (с мягкой подушкой):</b><br>" +
          "• VERTEX: 499 000 сум<br>" +
          "• CORDA: 499 000 сум<br><br>" +
          "<b>Мягкие стулья:</b><br>" +
          "• LIRA: 354 000 сум<br>" +
          "• COMO: 486 000 сум",
        "Цены на столы": "<b>Актуальные цены на обеденные столы BTT:</b><br>" +
          "• <b>VERTEX D90</b> (круглый Ø90 см): 680 000 сум<br>" +
          "• <b>TAPER 80x80</b> (квадратный): 783 000 сум отдельно (для комплекта 733 000 сум)<br>" +
          "• <b>CORDA 135x80</b> (прямоугольный): 999 000 сум отдельно (для комплекта 949 000 сум)<br>" +
          "• <b>TAPER 135x80</b>: для расчёта комплектов 860 000 сум (отдельная розничная цена уточняется у менеджера).<br>" +
          "<i>Обратите внимание: стол CORDA 135x80 - это обеденный стол, не путайте его со стульями CORDA.</i>",
        "Готовые комплекты": "<b>Утверждённые готовые комплекты BTT:</b><br>" +
          "1. Стол VERTEX D90 + 4 плетёных стула VERTEX: <b>2 676 000 сум</b><br>" +
          "2. Стол VERTEX D90 + 4 плетёных стула CORDA: <b>2 676 000 сум</b><br>" +
          "3. Стол TAPER 80x80 + 4 плетёных стула VERTEX: <b>2 850 000 сум</b><br>" +
          "4. Стол TAPER 80x80 + 4 плетёных стула CORDA: <b>2 850 000 сум</b><br><br>" +
          "<b>Комплекты с пластиковыми стульями</b> рассчитываются по формуле: [цена стола для комплекта] + [кол-во стульев] × [комплектная цена стула].<br>" +
          "Например: Стол Taper 80x80 (733 000) + 4 стула Roero (4 * 168 000 = 672 000) = <b>1 405 000 сум</b>.",
        "Пластиковые стулья": "Практичные стулья из ударопрочного полипропилена: ROERO (188 000 сум / 168 000 в комплекте), NOERO (212 000 сум / 192 000 в комплекте), TODO (236 000 сум / 216 000 в комплекте), TODO SOFT (236 000 сум) и кресло JARDIN (344 000 сум / 324 000 в комплекте). Легко моются, не выгорают на солнце.",
        "Плетёные стулья": "Плетёные стулья VERTEX и CORDA (499 000 сум за шт.) на прочном металлокаркасе со съёмными текстильными подушками в комплекте. Идеальны для веранд, террас, столовых зон и кафе.",
        "Мягкие стулья": "Комфортные стулья с мягкой обивкой на надёжном металлокаркасе: LIRA (354 000 сум) и кресла COMO (486 000 сум). Отлично подходят для дома, гостиной, кухни и ресторанов.",
        "Доставка и самовывоз": "<b>Условия доставки BTT:</b><br>" +
          "• <b>По Ташкенту:</b> доставка за 1-2 рабочих дня по прямому тарифу сервиса (Яндекс Доставка / Labo / Porter). При крупных заказах поможем организовать аккуратную погрузку.<br>" +
          "• <b>Самовывоз:</b> со склада в Ташкенте по предварительной договорённости (Пн-Сб, 10:00 - 20:00).<br>" +
          "• <b>По Узбекистану:</b> отправка в Самарканд, Бухару, Фергану, Андижан, Наманган и другие города через транспортные компании (BTS) по тарифам перевозчика.",
        "Способы оплаты": "<b>Доступные способы оплаты:</b><br>" +
          "• <b>При получении:</b> наличными или через терминал (Uzcard, Humo).<br>" +
          "• <b>Онлайн:</b> Click или Payme (по QR-коду или ссылке на оплату).<br>" +
          "• <b>Для организаций (B2B):</b> безналичный расчёт по договору и выставленному счёту с НДС.",
        "Где мы находимся": "<b>Склад и офис BTT:</b><br>" +
          "Мы находимся в Ташкенте. Посещение склада и шоурума возможно по предварительной договорённости, чтобы нужные модели были подготовлены к показу.<br>" +
          "График работы: Пн-Сб с 10:00 до 20:00.<br>" +
          "Телефон: <a href='tel:+998771044422'>+998 77 104 44 22</a><br>" +
          "Telegram: <a href='https://t.me/btt_uz' target='_blank' rel='noopener'>@btt_uz</a>",
        "Связаться с менеджером": "Наши менеджеры всегда готовы ответить на вопросы, рассчитать комплектацию и выслать живые фото мебели в Telegram: <a href='https://t.me/btt_uz' target='_blank' rel='noopener'>@btt_uz</a> или по телефону <a href='tel:+998771044422'>+998 77 104 44 22</a>."
      },
      fallback: "Я могу подсказать по ценам на столы и стулья, рассчитать готовый комплект, рассказать о доставке по Ташкенту и Узбекистану, способах оплаты (Click, Payme, наличные) или сразу оформить заявку. Выберите тему ниже или задайте вопрос 👇",
      orderTitle: "Оформление заказа в чате BTT",
      orderSubtitle: "Заполните форму, и менеджер свяжется с вами в течение 10-15 минут:",
      orderItemLabel: "Товар или комплект",
      orderQtyLabel: "Количество",
      orderNameLabel: "Ваше имя",
      orderPhoneLabel: "Номер телефона",
      orderAddressLabel: "Адрес доставки / город",
      orderSubmit: "Отправить заявку менеджеру",
      orderSending: "Отправка заявки…",
      orderOkBadge: "Заказ принят",
      orderOkTitle: "Ваша заявка успешно передана менеджеру BTT!",
      orderOkRef: "Номер заявки",
      orderOkWait: "Мы свяжемся с вами по указанному телефону в течение 10-15 минут для подтверждения и согласования доставки.",
      orderOpenTg: "Написать в Telegram",
      orderCall: "Позвонить",
      leadTitle: "Оставьте номер телефона для связи с менеджером:",
      leadSend: "Отправить в Telegram",
      leadSending: "Отправка…",
      leadOk: "Заявка передана менеджеру!",
      leadOkSub: "Менеджер свяжется с вами в течение 10-15 минут.",
      cartEmpty: "Ваша корзина пока пуста 🛒<br>Хотите посмотреть популярные модели стульев?",
      cartTotal: "Итого в корзине",
      cartCheckout: "Оформить заказ",
      cartMore: "Подробнее",
      cartBuy: "В корзину",
      cartAdded: "Добавлено!",
      phoneInvalid: "Укажите номер телефона (например: +998 90 123 45 67)",
      nameInvalid: "Пожалуйста, укажите ваше имя"
    },
    uz: {
      name: "Ben",
      role: "BTT onlayn yordamchisi",
      badge: "1",
      ph: "Savolingizni yozing (masalan: stullar narxi, to‘plam, buyurtma)…",
      hi: "Salom! Men BTT yordamchisiman 🌿 Ovqat stollari, stullar va tayyor to‘plamlarni tanlashda yordam beraman, narxlarni aniq hisoblab beraman va buyurtma rasmiylashtiraman. Nimadan boshlaymiz?",
      quick: [
        "Stullar narxlari",
        "Stollar narxlari",
        "Tayyor to‘plamlar",
        "Plastik stullar",
        "To‘qilgan stullar",
        "Yumshoq stullar",
        "Buyurtma berish",
        "Yetkazish va olib ketish",
        "To‘lov usullari",
        "Bizning manzil",
        "Menejer bilan bog‘lanish"
      ],
      ans: {
        "Stullar narxlari": "<b>BTT stullarining amaldagi narxlari:</b><br>" +
          "<b>Plastik stullar (alohida / stol bilan to‘plamda):</b><br>" +
          "• ROERO: 188 000 so‘m / 168 000 so‘m<br>" +
          "• NOERO: 212 000 so‘m / 192 000 so‘m<br>" +
          "• TODO: 236 000 so‘m / 216 000 so‘m<br>" +
          "• JARDIN: 344 000 so‘m / 324 000 so‘m<br>" +
          "<i>To‘plamdagi arzon narx faqat stol bilan birga xarid qilinganda amal qiladi.</i><br><br>" +
          "<b>To‘qilgan stullar (yumshoq yostiqchasi bilan):</b><br>" +
          "• VERTEX: 499 000 so‘m<br>" +
          "• CORDA: 499 000 so‘m<br><br>" +
          "<b>Yumshoq stullar:</b><br>" +
          "• LIRA: 354 000 so‘m<br>" +
          "• COMO: 486 000 so‘m",
        "Stollar narxlari": "<b>BTT stollarining amaldagi narxlari:</b><br>" +
          "• <b>VERTEX D90</b> (dumaloq Ø90 sm): 680 000 so‘m<br>" +
          "• <b>TAPER 80x80</b> (to‘rtburchak): alohida 783 000 so‘m (to‘plam uchun 733 000 so‘m)<br>" +
          "• <b>CORDA 135x80</b> (to‘rtburchak): alohida 999 000 so‘m (to‘plam uchun 949 000 so‘m)<br>" +
          "• <b>TAPER 135x80</b>: to‘plam hisobi uchun 860 000 so‘m (alohida chakana narxi menejer bilan aniqlanadi).<br>" +
          "<i>Muhim eslatma: CORDA 135x80 - bu stol, uni to‘qilgan CORDA stullari bilan adashtirmang.</i>",
        "Tayyor to‘plamlar": "<b>BTT tasdiqlangan tayyor to‘plamlari:</b><br>" +
          "1. 1 ta VERTEX D90 stoli + 4 ta to‘qilgan VERTEX stuli: <b>2 676 000 so‘m</b><br>" +
          "2. 1 ta VERTEX D90 stoli + 4 ta to‘qilgan CORDA stuli: <b>2 676 000 so‘m</b><br>" +
          "3. 1 ta TAPER 80x80 stoli + 4 ta to‘qilgan VERTEX stuli: <b>2 850 000 so‘m</b><br>" +
          "4. 1 ta TAPER 80x80 stoli + 4 ta to‘qilgan CORDA stuli: <b>2 850 000 so‘m</b><br><br>" +
          "<b>Plastik stulli to‘plamlar</b> quyidagi formula bo‘yicha hisoblanadi: [stolning to‘plamdagi narxi] + [stullar soni] × [stulning to‘plamdagi narxi].<br>" +
          "Masalan: Taper 80x80 stoli (733 000) + 4 ta Roero stuli (4 * 168 000 = 672 000) = <b>1 405 000 so‘m</b>.",
        "Plastik stullar": "Yuqori sifatli birlamchi polipropilendan tayyorlangan amaliy stullar: ROERO (188 000 / 168 000 so‘m), NOERO (212 000 / 192 000 so‘m), TODO (236 000 / 216 000 so‘m), TODO SOFT (236 000 so‘m) va JARDIN kreslosi (344 000 / 324 000 so‘m). Quyoshda so‘nmaydi, yuvish oson.",
        "To‘qilgan stullar": "Mustahkam po‘lat metall karkasli va yumshoq matoli yostiqchali VERTEX va CORDA to‘qilgan stullari (har biri 499 000 so‘m). Terasalar, ayvonlar, kafelar va oshxonalar uchun juda qulay.",
        "Yumshoq stullar": "Yumshoq qoplamali va chidamli metall karkasli zamonaviy stullar: LIRA (354 000 so‘m) va qulay COMO kreslosi (486 000 so‘m). Uy, oshxona va kafelar uchun ideal.",
        "Yetkazish va olib ketish": "<b>Yetkazib berish shartlari:</b><br>" +
          "• <b>Toshkent bo‘ylab:</b> 1-2 ish kunida kuryerlik xizmati to‘g‘ridan-to‘g‘ri tarifi bo‘yicha (Yandex / Labo / Porter).<br>" +
          "• <b>Olib ketish (samovivoz):</b> Toshkentdagi ombordan oldindan kelishilgan holda (Du-Sha, 10:00 - 20:00).<br>" +
          "• <b>O‘zbekiston viloyatlariga:</b> Samarqand, Buxoro, Farg‘ona, Andijon, Namangan va boshqa shaharlarga transport kompaniyalari (BTS) orqali yetkazamiz.",
        "To‘lov usullari": "<b>To‘lov turlari:</b><br>" +
          "• <b>Mahsulotni olganda:</b> naqd pul yoki terminal (Uzcard, Humo).<br>" +
          "• <b>Onlayn:</b> Click yoki Payme ilovalari orqali (QR-kod yoki havola).<br>" +
          "• <b>Yuridik shaxslar uchun:</b> shartnoma va hisob-faktura orqali pul o‘tkazish (perechisleniye).",
        "Bizning manzil": "<b>BTT ombori va idorasi:</b><br>" +
          "Biz Toshkent shahrida joylashganmiz. Mahsulotlarni ko‘rish va olib ketish uchun oldindan kelishuv tavsiya etiladi.<br>" +
          "Ish vaqti: Dushanba - Shanba, 10:00 - 20:00.<br>" +
          "Telefon: <a href='tel:+998771044422'>+998 77 104 44 22</a><br>" +
          "Telegram: <a href='https://t.me/btt_uz' target='_blank' rel='noopener'>@btt_uz</a>",
        "Menejer bilan bog‘lanish": "Menejerlarimiz barcha savollaringizga Telegram orqali <a href='https://t.me/btt_uz' target='_blank' rel='noopener'>@btt_uz</a> yoki telefon orqali <a href='tel:+998771044422'>+998 77 104 44 22</a> tezda javob berishadi."
      },
      fallback: "Mebel katalogi, aniq narxlar, yetkazib berish va to‘lov turlari bo‘yicha yordam bera olaman yoki to‘g‘ridan-to‘g‘ri buyurtma qabul qilaman. Quyidagi mavzulardan birini tanlang yoki savolingizni yozing 👇",
      orderTitle: "Chat orqali buyurtma berish",
      orderSubtitle: "Qisqa ma‘lumotlarni kiriting, menejer 10-15 daqiqa ichida siz bilan bog‘lanadi:",
      orderItemLabel: "Mahsulot yoki to‘plam",
      orderQtyLabel: "Soni",
      orderNameLabel: "Ismingiz",
      orderPhoneLabel: "Telefon raqamingiz",
      orderAddressLabel: "Yetkazib berish manzili / shahar",
      orderSubmit: "Menejerga buyurtma yuborish",
      orderSending: "Yuborilmoqda…",
      orderOkBadge: "Buyurtma qabul qilindi",
      orderOkTitle: "Arizangiz muvaffaqiyatli qabul qilindi!",
      orderOkRef: "Ariza raqami",
      orderOkWait: "Menejerimiz 10-15 daqiqa ichida ko‘rsatilgan telefon raqami orqali yetkazishni tasdiqlash uchun bog‘lanadi.",
      orderOpenTg: "Telegramda yozish",
      orderCall: "Qo‘ng‘iroq qilish",
      leadTitle: "Menejer bog‘lanishi uchun telefon raqamingizni qoldiring:",
      leadSend: "Telegramga yuborish",
      leadSending: "Yuborilmoqda…",
      leadOk: "Arizangiz qabul qilindi!",
      leadOkSub: "Menejerimiz 10-15 daqiqa ichida bog‘lanadi.",
      cartEmpty: "Savat hozircha bo‘sh 🛒<br>Ommabop stullarni ko‘rishni xohlaysizmi?",
      cartTotal: "Savatdagi jami summa",
      cartCheckout: "Buyurtma berish",
      cartMore: "Batafsil",
      cartBuy: "Savatga",
      cartAdded: "Qo‘shildi!",
      phoneInvalid: "Telefon raqamingizni kiriting (masalan: +998 90 123 45 67)",
      nameInvalid: "Iltimos, ismingizni kiriting"
    },
    en: {
      name: "Ben",
      role: "BTT Online Assistant",
      badge: "1",
      ph: "Type your question (e.g.: chair prices, set, delivery)…",
      hi: "Hello! I am your BTT assistant 🌿 I can help you select dining tables, chairs, and matching sets, compute exact bundle prices, and process your order. Where shall we start?",
      quick: [
        "Chair prices",
        "Table prices",
        "Furniture sets",
        "Plastic chairs",
        "Wicker chairs",
        "Upholstered chairs",
        "Place an order",
        "Delivery and pickup",
        "Payment methods",
        "Our location",
        "Talk to a manager"
      ],
      ans: {
        "Chair prices": "<b>Current BTT chair prices:</b><br>" +
          "<b>Plastic chairs (individual / in set with table):</b><br>" +
          "• ROERO: 188,000 UZS / 168,000 UZS<br>" +
          "• NOERO: 212,000 UZS / 192,000 UZS<br>" +
          "• TODO: 236,000 UZS / 216,000 UZS<br>" +
          "• JARDIN: 344,000 UZS / 324,000 UZS<br>" +
          "<i>Bundle prices apply strictly when purchased together with a table.</i><br><br>" +
          "<b>Wicker chairs (with soft cushion):</b><br>" +
          "• VERTEX: 499,000 UZS<br>" +
          "• CORDA: 499,000 UZS<br><br>" +
          "<b>Upholstered chairs:</b><br>" +
          "• LIRA: 354,000 UZS<br>" +
          "• COMO: 486,000 UZS",
        "Table prices": "<b>Current BTT dining table prices:</b><br>" +
          "• <b>VERTEX D90</b> (round Ø90 cm): 680,000 UZS<br>" +
          "• <b>TAPER 80x80</b> (square): 783,000 UZS individually (733,000 UZS in sets)<br>" +
          "• <b>CORDA 135x80</b> (rectangular): 999,000 UZS individually (949,000 UZS in sets)<br>" +
          "• <b>TAPER 135x80</b>: 860,000 UZS for set calculations (standalone retail price unconfirmed).<br>" +
          "<i>Please note: CORDA 135x80 is a dining table; do not confuse it with CORDA chairs.</i>",
        "Furniture sets": "<b>Approved ready-made furniture sets:</b><br>" +
          "1. 1 VERTEX D90 table + 4 VERTEX wicker chairs: <b>2,676,000 UZS</b><br>" +
          "2. 1 VERTEX D90 table + 4 CORDA wicker chairs: <b>2,676,000 UZS</b><br>" +
          "3. 1 TAPER 80x80 table + 4 VERTEX wicker chairs: <b>2,850,000 UZS</b><br>" +
          "4. 1 TAPER 80x80 table + 4 CORDA wicker chairs: <b>2,850,000 UZS</b><br><br>" +
          "<b>Plastic chair sets</b> are calculated by formula: [table combo price] + [number of chairs] × [chair combo price].<br>" +
          "Example: Taper 80x80 (733,000) + 4 Roero chairs (4 * 168,000 = 672,000) = <b>1,405,000 UZS</b>.",
        "Plastic chairs": "Durable chairs crafted from impact-resistant polypropylene: ROERO (188,000 / 168,000 UZS), NOERO (212,000 / 192,000 UZS), TODO (236,000 / 216,000 UZS), TODO SOFT (236,000 UZS), and JARDIN armchair (344,000 / 324,000 UZS). Weather-resistant and easy to clean.",
        "Wicker chairs": "VERTEX and CORDA wicker chairs (499,000 UZS each) on reinforced steel frames with soft removable cushions included. Ideal for patios, verandas, dining spaces, and cafes.",
        "Upholstered chairs": "Elegant soft-cushioned chairs on sturdy steel frames: LIRA (354,000 UZS) and comfortable COMO armchair (486,000 UZS). Perfect for living rooms, kitchens, and HoReCa.",
        "Delivery and pickup": "<b>Delivery options:</b><br>" +
          "• <b>Across Tashkent:</b> 1-2 business days via on-demand courier services (Yandex / Labo / Porter) at direct carrier rates.<br>" +
          "• <b>Warehouse pickup:</b> from our Tashkent warehouse by prior appointment (Mon-Sat, 10:00 - 20:00).<br>" +
          "• <b>Across Uzbekistan:</b> dispatch to Samarkand, Bukhara, Fergana, Andijan, Namangan, etc., via regional carriers (BTS).",
        "Payment methods": "<b>Accepted payment methods:</b><br>" +
          "• <b>Upon delivery:</b> Cash or local POS terminal (Uzcard, Humo).<br>" +
          "• <b>Online:</b> Click or Payme (via QR code or payment link).<br>" +
          "• <b>Commercial / B2B:</b> Official bank invoice with standard contracts.",
        "Our location": "<b>BTT Warehouse & Office:</b><br>" +
          "Located in Tashkent, Uzbekistan. Warehouse visits and previews are available by prior appointment.<br>" +
          "Hours: Mon-Sat 10:00 - 20:00.<br>" +
          "Phone: <a href='tel:+998771044422'>+998 77 104 44 22</a><br>" +
          "Telegram: <a href='https://t.me/btt_uz' target='_blank' rel='noopener'>@btt_uz</a>",
        "Talk to a manager": "Reach our sales team directly on Telegram <a href='https://t.me/btt_uz' target='_blank' rel='noopener'>@btt_uz</a> or call <a href='tel:+998771044422'>+998 77 104 44 22</a>."
      },
      fallback: "I can help you with dining table and chair prices, calculate ready-made sets, explain delivery across Tashkent/Uzbekistan, payment options (Click, Payme, cash), or take your order directly. Select a topic below or type your question 👇",
      orderTitle: "Place an order in chat",
      orderSubtitle: "Fill in the details and our manager will contact you within 10-15 minutes:",
      orderItemLabel: "Product or set",
      orderQtyLabel: "Quantity",
      orderNameLabel: "Your name",
      orderPhoneLabel: "Phone number",
      orderAddressLabel: "Delivery address / city",
      orderSubmit: "Submit order to manager",
      orderSending: "Submitting…",
      orderOkBadge: "Order received",
      orderOkTitle: "Your request has been received by BTT!",
      orderOkRef: "Request number",
      orderOkWait: "Our sales specialist will call you at the provided number within 10-15 minutes to confirm details and dispatch.",
      orderOpenTg: "Chat on Telegram",
      orderCall: "Call now",
      leadTitle: "Leave your phone number and our manager will contact you:",
      leadSend: "Send to Telegram",
      leadSending: "Sending…",
      leadOk: "Request received!",
      leadOkSub: "Our manager will contact you within 10-15 minutes.",
      cartEmpty: "Your cart is currently empty 🛒<br>Would you like to browse our popular chairs?",
      cartTotal: "Cart total",
      cartCheckout: "Checkout",
      cartMore: "Details",
      cartBuy: "Add to cart",
      cartAdded: "Added!",
      phoneInvalid: "Please enter a valid phone number (e.g.: +998 90 123 45 67)",
      nameInvalid: "Please enter your name"
    }
  };

  /* ---------------- HELPERS ---------------- */
  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
    });
  }

  function fmt(n){
    if(typeof n !== "number" || isNaN(n)) return "";
    return n.toLocaleString("ru-RU") + " сум";
  }

  /* Language detection and state */
  var sessionLang = null;

  function detectLanguage(text){
    if(!text) return null;
    var raw = String(text).toLowerCase();

    // Uzbek tokens (Latin or Cyrillic)
    var uzRegex = /(?:^|[^\p{L}\p{N}])(salom|assalomu|narxi|qancha|necha|nechi|so['`‘]m|som|yetkazish|yetkazib|buyurtma|to['`‘]plam|stullar|stollar|manzil|qayerda|to['`‘]lov|tolov|rahmat|bormi|bor-mi|oldingi|keyingi|sotib|savol|iltimos|telefonim|ismim)(?:$|[^\p{L}\p{N}])/iu;
    var uzCyrRegex = /(?:^|[^\p{L}\p{N}])(салом|ассалому|нархи|канча|неч|неча|нечи|сум|етказиб|етказиш|буюртма|туплам|стуллар|столлар|манзил|каерда|толов|рахмат|борми|илтимос|исмим)(?:$|[^\p{L}\p{N}])/iu;
    if(uzRegex.test(raw) || uzCyrRegex.test(raw)) return "uz";

    // English tokens
    var enRegex = /(?:^|[^\p{L}\p{N}])(hello|hi|hey|price|prices|cost|how much|order|buy|delivery|shipping|where|address|chair|chairs|table|tables|set|sets|payment|discount|stock|available|thanks|thank you)(?:$|[^\p{L}\p{N}])/iu;
    if(enRegex.test(raw)) return "en";

    // Russian tokens
    var ruRegex = /(?:^|[^\p{L}\p{N}])(здравствуйте|привет|добрый|день|цена|цены|почем|почём|пачем|скока|сколько|заказ|заказать|купить|оформить|доставка|самовывоз|где|адрес|стол|стул|комплект|оплата|скидка|наличие|спасибо)(?:$|[^\p{L}\p{N}])/iu;
    if(ruRegex.test(raw)) return "ru";

    return null;
  }

  function getActiveLang(userText){
    var detected = detectLanguage(userText);
    if(detected){
      sessionLang = detected;
      return detected;
    }
    if(sessionLang) return sessionLang;
    var s = localStorage.getItem("btt_lang");
    return (s && T[s]) ? s : "ru";
  }

  function normalizeText(str){
    var s = String(str || "").toLowerCase();
    s = s.replace(/ё/g, "е");
    s = s.replace(/[oʻoʼo'o`]/g, "o").replace(/[gʻgʼg'g`]/g, "g");
    return s.replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
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

  function extractName(text){
    if(!text) return "";
    var s = String(text);
    var patterns = [
      /(?:меня зовут|я|мое имя|менин исмим|ismim|mening ismim|my name is)\s+([a-zA-Zа-яА-ЯёЁo'g'ʻʼ]+)/i,
      /(?:клиент|заказчик|xaridor):\s*([a-zA-Zа-яА-ЯёЁo'g'ʻʼ]+)/i
    ];
    for(var i = 0; i < patterns.length; i++){
      var m = s.match(patterns[i]);
      if(m && m[1] && m[1].length > 1){
        var word = m[1].trim();
        var stopWords = ["хочу", "хотел", "заказ", "купить", "беру", "звоните", "напишите", "stol", "stul"];
        if(stopWords.indexOf(word.toLowerCase()) === -1){
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
      }
    }
    return "";
  }

  function extractAddress(text){
    if(!text) return "";
    var s = String(text);
    var patterns = [
      /(?:адрес|доставка на|доставка в|город|manzil|yetkazish manzili|address):\s*([^\n,.]+)/i,
      /(?:в|на|г\.|город|шахар)\s+(ташкент|самарканд|бухара|андижан|наманган|фергана|чиланзар|юнусабад|миргали|яшнабад|сергели|учтепа|яккасарай|toshkent|samarqand|buxoro|farg['o]na|andijon|namangan)[^\n,]*/i
    ];
    for(var i = 0; i < patterns.length; i++){
      var m = s.match(patterns[i]);
      if(m && m[0]){
        return m[0].trim();
      }
    }
    return "";
  }

  /* ---------------- CHAT HISTORY & LIVE CATALOG ---------------- */
  var chatHistory = [];
  var dynamicProductsMap = {};

  async function sendBotLead(phone, messageText, customerName, address){
    if(!phone) return { ok: false };
    var curLang = getActiveLang(messageText);
    var defaultName = curLang === "uz" ? "Mijoz (onlayn-chat)" : curLang === "en" ? "Customer (online chat)" : "Посетитель сайта (онлайн-чат)";
    var nameToUse = (customerName && customerName.trim()) || defaultName;

    var fullMsg = messageText || (curLang === "uz" ? "Chat-bot orqali buyurtma / murojaat" : curLang === "en" ? "Order inquiry from chat bot" : "Заявка / заказ из онлайн-чата");
    if(address && address.trim()){
      fullMsg += "\nАдрес доставки: " + address.trim();
    }

    var payload = {
      source: "bot",
      name: nameToUse,
      phone: phone,
      message: fullMsg,
      page: (typeof window !== "undefined" && window.location) ? ((window.location.pathname || "") + (window.location.search || "")) : "/",
      lang: curLang,
      history: chatHistory.slice(-8)
    };

    try {
      var res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if(res.ok){
        var data = await res.json().catch(function(){ return {}; });
        return { ok: true, id: data.id || Math.floor(1000 + Math.random() * 9000) };
      }
      return { ok: false };
    } catch (err) {
      console.error("Failed to send bot lead to Telegram:", err);
      return { ok: false };
    }
  }

  function fetchLiveCatalog(){
    var curLang = getActiveLang("");
    fetch("/api/products?lang=" + encodeURIComponent(curLang))
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(data && Array.isArray(data.products)){
          data.products.forEach(function(p){
            if(p && (p.slug || p.id)){
              var s = p.slug || p.id;
              dynamicProductsMap[s] = p;
            }
          });
        }
      })
      .catch(function(){});
  }
  fetchLiveCatalog();

  function getEffectiveProduct(slug){
    if(dynamicProductsMap[slug]){
      var dp = dynamicProductsMap[slug];
      var img = dp.image ? (dp.image.startsWith("/") || dp.image.startsWith("http") || dp.image.startsWith("assets/") ? dp.image : "/media/" + dp.image) : "";
      return {
        slug: dp.slug || dp.id,
        name: dp.name,
        now: dp.price_now,
        category: dp.category,
        category_label: dp.category_label,
        images: img ? [img] : [],
        colors: dp.variants || dp.confirmedColors || []
      };
    }
    var P = window.BTT_PRODUCTS || {};
    if(P[slug]) return P[slug];

    // Fallback to internal SSOT PRICING catalogue
    var allP = [];
    var chairTypes = ["plastic", "wicker", "upholstered"];
    chairTypes.forEach(function(t){
      if(PRICING.chairs[t]) allP = allP.concat(PRICING.chairs[t]);
    });
    if(PRICING.tables) allP = allP.concat(PRICING.tables);
    for(var i = 0; i < allP.length; i++){
      if(allP[i].slug === slug){
        return {
          slug: allP[i].slug,
          name: allP[i].name,
          now: allP[i].retail,
          images: ["/media/" + allP[i].slug + "-main.jpg"],
          colors: []
        };
      }
    }
    return null;
  }

  /* ---------------- UI CARD RENDERERS ---------------- */
  function renderProductCard(slug, curLang){
    var prod = getEffectiveProduct(slug);
    if(!prod) return "";
    var I = window.BTT_I18N || {};
    var dict = I[curLang] || I.ru || {};
    var title = prod.name || dict[slug + ".name"] || slug;
    var priceStr = prod.now ? fmt(prod.now) : "";
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

  function renderOrderForm(curLang, preselectedItem){
    var tCfg = T[curLang] || T.ru;

    var options = [
      { val: "Стол Taper 80x80 + 4 стула Roero (1 405 000 сум)", label: curLang === "uz" ? "To‘plam: Taper 80x80 stoli + 4 ta Roero stuli (1 405 000 so‘m)" : curLang === "en" ? "Set: Taper 80x80 table + 4 Roero chairs (1,405,000 UZS)" : "Комплект: Стол Taper 80x80 + 4 стула Roero (1 405 000 сум)" },
      { val: "Стол Taper 80x80 + 4 стула Noero (1 501 000 сум)", label: curLang === "uz" ? "To‘plam: Taper 80x80 stoli + 4 ta Noero stuli (1 501 000 so‘m)" : curLang === "en" ? "Set: Taper 80x80 table + 4 Noero chairs (1,501,000 UZS)" : "Комплект: Стол Taper 80x80 + 4 стула Noero (1 501 000 сум)" },
      { val: "Стол Taper 80x80 + 4 стула Todo (1 597 000 сум)", label: curLang === "uz" ? "To‘plam: Taper 80x80 stoli + 4 ta Todo stuli (1 597 000 so‘m)" : curLang === "en" ? "Set: Taper 80x80 table + 4 Todo chairs (1,597,000 UZS)" : "Комплект: Стол Taper 80x80 + 4 стула Todo (1 597 000 сум)" },
      { val: "Стол Vertex D90 + 4 плетёных стула Vertex (2 676 000 сум)", label: curLang === "uz" ? "To‘plam: Vertex D90 stoli + 4 ta to‘qilgan Vertex stuli (2 676 000 so‘m)" : curLang === "en" ? "Set: Vertex D90 table + 4 Vertex wicker chairs (2,676,000 UZS)" : "Комплект: Стол Vertex D90 + 4 плетёных стула Vertex (2 676 000 сум)" },
      { val: "Стол Vertex D90 + 4 плетёных стула Corda (2 676 000 сум)", label: curLang === "uz" ? "To‘plam: Vertex D90 stoli + 4 ta to‘qilgan Corda stuli (2 676 000 so‘m)" : curLang === "en" ? "Set: Vertex D90 table + 4 Corda wicker chairs (2,676,000 UZS)" : "Комплект: Стол Vertex D90 + 4 плетёных стула Corda (2 676 000 сум)" },
      { val: "Стол Taper 80x80 + 4 плетёных стула Vertex (2 850 000 сум)", label: curLang === "uz" ? "To‘plam: Taper 80x80 stoli + 4 ta to‘qilgan Vertex stuli (2 850 000 so‘m)" : curLang === "en" ? "Set: Taper 80x80 table + 4 Vertex wicker chairs (2,850,000 UZS)" : "Комплект: Стол Taper 80x80 + 4 плетёных стула Vertex (2 850 000 сум)" },
      { val: "Стол Taper 80x80 + 4 плетёных стула Corda (2 850 000 сум)", label: curLang === "uz" ? "To‘plam: Taper 80x80 stoli + 4 ta to‘qilgan Corda stuli (2 850 000 so‘m)" : curLang === "en" ? "Set: Taper 80x80 table + 4 Corda wicker chairs (2,850,000 UZS)" : "Комплект: Стол Taper 80x80 + 4 плетёных стула Corda (2 850 000 сум)" },
      { val: "Стол Corda 135x80 + 6 стульев Roero (1 957 000 сум)", label: curLang === "uz" ? "To‘plam: Corda 135x80 stoli + 6 ta Roero stuli (1 957 000 so‘m)" : curLang === "en" ? "Set: Corda 135x80 table + 6 Roero chairs (1,957,000 UZS)" : "Комплект: Стол Corda 135x80 + 6 стульев Roero (1 957 000 сум)" },
      { val: "Стулья Roero (от 188 000 сум)", label: curLang === "uz" ? "Roero stullari (188 000 so‘mdan)" : curLang === "en" ? "Roero chairs (from 188,000 UZS)" : "Стулья Roero (от 188 000 сум)" },
      { val: "Стулья Noero (от 212 000 сум)", label: curLang === "uz" ? "Noero stullari (212 000 so‘mdan)" : curLang === "en" ? "Noero chairs (from 212,000 UZS)" : "Стулья Noero (от 212 000 сум)" },
      { val: "Стулья Todo (от 236 000 сум)", label: curLang === "uz" ? "Todo stullari (236 000 so‘mdan)" : curLang === "en" ? "Todo chairs (from 236,000 UZS)" : "Стулья Todo (от 236 000 сум)" },
      { val: "Плетёные стулья Vertex / Corda (499 000 сум)", label: curLang === "uz" ? "To‘qilgan Vertex / Corda stullari (499 000 so‘m)" : curLang === "en" ? "Vertex / Corda wicker chairs (499,000 UZS)" : "Плетёные стулья Vertex / Corda (499 000 сум)" },
      { val: "Другой товар / Индивидуальный расчёт", label: curLang === "uz" ? "Boshqa mahsulot / Alohida hisob" : curLang === "en" ? "Other product / Custom quote" : "Другой товар / Индивидуальный расчёт" }
    ];

    var optHtml = "";
    options.forEach(function(o){
      var isSel = (preselectedItem && (o.val.indexOf(preselectedItem) !== -1 || preselectedItem.indexOf(o.val) !== -1));
      optHtml += '<option value="' + esc(o.val) + '"' + (isSel ? ' selected' : '') + '>' + esc(o.label) + '</option>';
    });

    return '<div class="bot-order-box" data-order-box>' +
      '<div class="bot-order-box__head">' +
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
        '<span>' + esc(tCfg.orderTitle) + '</span>' +
      '</div>' +
      '<div class="bot-lead-box__title">' + esc(tCfg.orderSubtitle) + '</div>' +
      '<div class="bot-order-field">' +
        '<label>' + esc(tCfg.orderItemLabel) + '</label>' +
        '<select class="bot-order-select" data-order-item>' + optHtml + '</select>' +
      '</div>' +
      '<div class="bot-order-field">' +
        '<label>' + esc(tCfg.orderQtyLabel) + '</label>' +
        '<input type="text" class="bot-order-input" data-order-qty value="1" placeholder="1">' +
      '</div>' +
      '<div class="bot-order-field">' +
        '<label>' + esc(tCfg.orderNameLabel) + ' *</label>' +
        '<input type="text" class="bot-order-input" data-order-name placeholder="' + (curLang === "uz" ? "Masalan: Alisher" : curLang === "en" ? "e.g. John" : "Например: Алишер") + '" required>' +
      '</div>' +
      '<div class="bot-order-field">' +
        '<label>' + esc(tCfg.orderPhoneLabel) + ' *</label>' +
        '<input type="tel" class="bot-order-input" data-order-phone placeholder="+998 __ ___ __ __" maxlength="20" required>' +
      '</div>' +
      '<div class="bot-order-field">' +
        '<label>' + esc(tCfg.orderAddressLabel) + '</label>' +
        '<input type="text" class="bot-order-input" data-order-address placeholder="' + (curLang === "uz" ? "Toshkent, Chilonzor (yoki samovivoz)" : curLang === "en" ? "Tashkent (or pickup)" : "Ташкент, Чиланзар (или самовывоз)") + '">' +
      '</div>' +
      '<button type="button" class="bot-order-submit" data-order-submit>' +
        '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/></svg>' +
        esc(tCfg.orderSubmit) +
      '</button>' +
    '</div>';
  }

  function renderOrderSuccess(details, curLang){
    var tCfg = T[curLang] || T.ru;
    var refNum = details.ref || ("BTT-" + Math.floor(1000 + Math.random() * 9000));
    var cleanPhone = esc(details.phone || "");
    var cleanName = esc(details.name || "");
    var cleanItem = esc(details.item || "");

    return '<div class="bot-order-ok">' +
      '<div class="bot-order-ok__ref">#' + esc(refNum) + '</div>' +
      '<div style="font-weight:700;font-size:14px;color:var(--text);margin-bottom:4px;">✅ ' + esc(tCfg.orderOkTitle) + '</div>' +
      (cleanName ? '<div>👤 ' + (curLang === "uz" ? "Mijoz" : curLang === "en" ? "Client" : "Клиент") + ': <b>' + cleanName + '</b></div>' : '') +
      (cleanPhone ? '<div>📞 ' + (curLang === "uz" ? "Telefon" : curLang === "en" ? "Phone" : "Телефон") + ': <b>' + cleanPhone + '</b></div>' : '') +
      (cleanItem ? '<div>📦 ' + (curLang === "uz" ? "Buyurtma" : curLang === "en" ? "Item" : "Позиция") + ': <b>' + cleanItem + '</b></div>' : '') +
      '<div style="margin-top:6px;font-size:12px;color:var(--muted-2);line-height:1.4;">' + esc(tCfg.orderOkWait) + '</div>' +
      '<div class="bot-order-ok__actions">' +
        '<a href="https://t.me/btt_uz" target="_blank" rel="noopener" class="bot-order-ok__btn bot-order-ok__btn--tg">' +
          '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.693c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg> ' +
          esc(tCfg.orderOpenTg) +
        '</a>' +
        '<a href="tel:+998771044422" class="bot-order-ok__btn bot-order-ok__btn--call">' +
          '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ' +
          esc(tCfg.orderCall) +
        '</a>' +
      '</div>' +
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
      listHtml += '<li><b>' + esc(it.name || k) + '</b>: ' + qty + ' × ' + fmt(price) + '</li>';
    });
    listHtml += '</ul>';

    return '<div class="bot-cart-card">' +
      listHtml +
      '<div class="bot-cart-card__total">' + esc(tCfg.cartTotal) + ': <b>' + fmt(total) + '</b></div>' +
      '<button type="button" class="bot-cart-card__btn" data-bot-cart-open>🛍 ' + esc(tCfg.cartCheckout) + '</button>' +
    '</div>';
  }

  /* ---------------- DYNAMIC COMBO CALCULATOR ---------------- */
  function matchComboCalculation(norm){
    var padded = " " + norm + " ";
    var tableMatch = null;
    if(/(?:^|[^\p{L}\p{N}])(taper|тейпер|тапер|тепер).*?80|80.*?(taper|тейпер|тапер|тепер)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      tableMatch = { name: "TAPER 80x80", comboPrice: 733000, slug: "stol-taper-80" };
    } else if(/(?:^|[^\p{L}\p{N}])(corda|корда).*?(стол|stol|table|135)|(стол|stol|table).*?(corda|корда)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      tableMatch = { name: "CORDA 135x80", comboPrice: 949000, slug: "stol-corda-135" };
    } else if(/(?:^|[^\p{L}\p{N}])(taper|тейпер|тапер|тепер).*?135|135.*?(taper|тейпер|тапер|тепер)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      tableMatch = { name: "TAPER 135x80", comboPrice: 860000, slug: "stol-taper-135" };
    } else if(/(?:^|[^\p{L}\p{N}])(vertex|вертекс).*?(стол|stol|table|d90|д90|круглый|dumaloq)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      tableMatch = { name: "VERTEX D90", comboPrice: 680000, slug: "stol-vertex-d90" };
    }

    var chairMatch = null;
    if(/(?:^|[^\p{L}\p{N}])(roero|роеро|роэро|роэра|раеро)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      chairMatch = { name: "ROERO", comboPrice: 168000, retailPrice: 188000, slug: "stul-roero" };
    } else if(/(?:^|[^\p{L}\p{N}])(noero|ноэро|ноеро|ноэра)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      chairMatch = { name: "NOERO", comboPrice: 192000, retailPrice: 212000, slug: "stul-noero" };
    } else if(/(?:^|[^\p{L}\p{N}])(todo\s*soft|тодо\s*софт|тодософт)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      chairMatch = { name: "TODO SOFT", comboPrice: 216000, retailPrice: 236000, slug: "stul-todo-soft" };
    } else if(/(?:^|[^\p{L}\p{N}])(todo|тодо|туду)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      chairMatch = { name: "TODO", comboPrice: 216000, retailPrice: 236000, slug: "stul-todo" };
    } else if(/(?:^|[^\p{L}\p{N}])(jardin|жардин|жарден|джардин)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      chairMatch = { name: "JARDIN", comboPrice: 324000, retailPrice: 344000, slug: "stul-jardin" };
    }

    if(tableMatch && chairMatch){
      var qtyMatch = norm.match(/\b([1-9]|1[0-2])\s*(шт|stul|стул|ta|pcs)?\b/);
      var qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 4;
      if(qty < 1) qty = 4;

      var chairsTotal = qty * chairMatch.comboPrice;
      var total = tableMatch.comboPrice + chairsTotal;

      return {
        table: tableMatch,
        chair: chairMatch,
        qty: qty,
        total: total,
        chairsTotal: chairsTotal
      };
    }
    return null;
  }

  function renderComboCalculation(calc, curLang){
    var title = curLang === "uz" ? "To‘plam narxi hisobi (maxsus narxlar)" :
      curLang === "en" ? "Set Price Breakdown (Bundle Savings)" :
      "Расчёт стоимости комплекта (по комплектным ценам)";

    var tableLabel = curLang === "uz" ? "Stol (to‘plam uchun):" : curLang === "en" ? "Table (in bundle):" : "Стол (для комплекта):";
    var chairsLabel = curLang === "uz" ? ("Stullar: " + calc.qty + " ta × " + fmt(calc.chair.comboPrice)) :
      curLang === "en" ? ("Chairs: " + calc.qty + " × " + fmt(calc.chair.comboPrice)) :
      ("Стулья: " + calc.qty + " шт × " + fmt(calc.chair.comboPrice));
    var totalLabel = curLang === "uz" ? "To‘plamning jami narxi:" : curLang === "en" ? "Total bundle price:" : "Итого за весь комплект:";
    var orderBtnLabel = curLang === "uz" ? "Ushbu to‘plamga buyurtma berish" : curLang === "en" ? "Order this set" : "Оформить этот комплект";

    var comboName = "Стол " + calc.table.name + " + " + calc.qty + " стульев " + calc.chair.name + " (" + fmt(calc.total) + ")";

    return '<div class="bot-calc-box">' +
      '<div class="bot-calc-box__title">🪑 <b>' + esc(title) + '</b></div>' +
      '<div class="bot-calc-box__formula">' +
        esc(calc.table.name) + ' (' + fmt(calc.table.comboPrice) + ') + ' + calc.qty + ' × ' + esc(calc.chair.name) + ' (' + fmt(calc.chair.comboPrice) + ')' +
      '</div>' +
      '<div class="bot-calc-box__item"><span>' + esc(tableLabel) + '</span> <b>' + fmt(calc.table.comboPrice) + '</b></div>' +
      '<div class="bot-calc-box__item"><span>' + esc(chairsLabel) + '</span> <b>' + fmt(calc.chairsTotal) + '</b></div>' +
      '<div class="bot-calc-box__total"><span>' + esc(totalLabel) + '</span> <span>' + fmt(calc.total) + '</span></div>' +
    '</div>' +
    renderOrderForm(curLang, comboName);
  }

  /* ---------------- PRODUCT RESOLVER ---------------- */
  function matchProduct(norm){
    var padded = " " + norm + " ";
    var aliasPatterns = [
      { key: "roero", slug: "stul-roero", rx: /(?:^|[^\p{L}\p{N}])(roero|роеро|роэро|роэра|раеро)(?:$|[^\p{L}\p{N}])/iu },
      { key: "noero", slug: "stul-noero", rx: /(?:^|[^\p{L}\p{N}])(noero|ноэро|ноеро|ноэра)(?:$|[^\p{L}\p{N}])/iu },
      { key: "todo-soft", slug: "stul-todo-soft", rx: /(?:^|[^\p{L}\p{N}])(todo\s*soft|тодо\s*софт|тодософт)(?:$|[^\p{L}\p{N}])/iu },
      { key: "todo", slug: "stul-todo", rx: /(?:^|[^\p{L}\p{N}])(todo|тодо|туду)(?:$|[^\p{L}\p{N}])/iu },
      { key: "jardin", slug: "stul-jardin", rx: /(?:^|[^\p{L}\p{N}])(jardin|жардин|жарден|джардин)(?:$|[^\p{L}\p{N}])/iu },
      { key: "lira", slug: "stul-lira", rx: /(?:^|[^\p{L}\p{N}])(lira|лира)(?:$|[^\p{L}\p{N}])/iu },
      { key: "como", slug: "kreslo-como", rx: /(?:^|[^\p{L}\p{N}])(como|комо|камо)(?:$|[^\p{L}\p{N}])/iu },

      // Distinguish table Corda vs chair Corda
      { key: "corda-table", slug: "stol-corda-135", rx: /(?:^|[^\p{L}\p{N}])((?:corda|корда).*?(?:стол|stol|table|135)|(?:стол|stol|table).*?(?:corda|корда))(?:$|[^\p{L}\p{N}])/iu },
      { key: "corda-chair", slug: "stul-corda", rx: /(?:^|[^\p{L}\p{N}])((?:corda|корда).*?(?:стул|stul|chair|плетен|to['`]?qilgan)|(?:стул|stul|chair).*?(?:corda|корда))(?:$|[^\p{L}\p{N}])/iu },

      // Distinguish table Vertex vs chair Vertex
      { key: "vertex-d90", slug: "stol-vertex-d90", rx: /(?:^|[^\p{L}\p{N}])(d90|д90|круглый|dumaloq|round)(?:$|[^\p{L}\p{N}])/iu },
      { key: "vertex-table", slug: "stol-vertex-80", rx: /(?:^|[^\p{L}\p{N}])((?:vertex|вертекс).*?(?:стол|stol|table)|(?:стол|stol|table).*?(?:vertex|вертекс))(?:$|[^\p{L}\p{N}])/iu },
      { key: "vertex-chair", slug: "stul-vertex", rx: /(?:^|[^\p{L}\p{N}])((?:vertex|вертекс).*?(?:стул|stul|chair|плетен|to['`]?qilgan)|(?:стул|stul|chair).*?(?:vertex|вертекс))(?:$|[^\p{L}\p{N}])/iu },

      // Tables
      { key: "taper-80", slug: "stol-taper-80", rx: /(?:^|[^\p{L}\p{N}])(taper|тейпер|тапер|тепер).*?80|80.*?(taper|тейпер|тапер|тепер)(?:$|[^\p{L}\p{N}])/iu },
      { key: "taper-135", slug: "stol-taper-135", rx: /(?:^|[^\p{L}\p{N}])(taper|тейпер|тапер|тепер).*?135|135.*?(taper|тейпер|тапер|тепер)(?:$|[^\p{L}\p{N}])/iu },
      { key: "taper", slug: "stol-taper-80", rx: /(?:^|[^\p{L}\p{N}])(taper|тейпер|тапер|тепер)(?:$|[^\p{L}\p{N}])/iu },

      // Default fallbacks for bare names
      { key: "vertex", slug: "stul-vertex", rx: /(?:^|[^\p{L}\p{N}])(vertex|вертекс)(?:$|[^\p{L}\p{N}])/iu },
      { key: "corda", slug: "stul-corda", rx: /(?:^|[^\p{L}\p{N}])(corda|корда)(?:$|[^\p{L}\p{N}])/iu }
    ];

    for(var i = 0; i < aliasPatterns.length; i++){
      if(aliasPatterns[i].rx.test(padded)){
        var targetSlug = aliasPatterns[i].slug;
        var p = getEffectiveProduct(targetSlug);
        if(p) return { slug: targetSlug, product: p };
      }
    }

    var dynKeys = Object.keys(dynamicProductsMap);
    for(var d = 0; d < dynKeys.length; d++){
      var ds = dynKeys[d];
      var dp = dynamicProductsMap[ds];
      if(!dp) continue;
      var dName = normalizeText(dp.name || "");
      if(dName && (norm.indexOf(dName) !== -1 || dName.indexOf(norm) !== -1)){
        return { slug: ds, product: getEffectiveProduct(ds) };
      }
      var dsClean = ds.replace(/-/g, " ");
      if(norm.indexOf(dsClean) !== -1){
        return { slug: ds, product: getEffectiveProduct(ds) };
      }
    }

    return null;
  }

  /* ---------------- BOT RESPONSE ENGINE ---------------- */
  function resolveBotResponse(rawText){
    var norm = normalizeText(rawText);
    var curLang = getActiveLang(rawText);
    var d = T[curLang] || T.ru;

    // 1. Phone number detected in raw message -> Auto lead / order capture
    var phoneFound = extractPhone(rawText);
    if(phoneFound){
      var custName = extractName(rawText);
      var custAddr = extractAddress(rawText);
      sendBotLead(phoneFound, rawText, custName, custAddr);
      var successHtml = renderOrderSuccess({
        phone: phoneFound,
        name: custName,
        item: rawText.length < 90 ? rawText : (curLang === "uz" ? "Chat orqali so‘rov" : curLang === "en" ? "Chat inquiry" : "Заявка из чата")
      }, curLang);
      var followUp = curLang === "uz" ? "Yana qanday savollaringiz bor? Yordam berishdan xursandman!" :
        curLang === "en" ? "Do you have any other questions? I'm here to help!" :
        "Чем ещё я могу вам помочь? Буду рад подсказать!";
      return successHtml + "<br>" + followUp;
    }

    // 2. Direct canned match from quick chips
    if(d.ans[rawText]){
      var baseAns = d.ans[rawText];
      if(rawText.indexOf("Пластиковые") !== -1 || rawText.indexOf("Plastik") !== -1 || rawText.indexOf("Plastic") !== -1){
        return baseAns + renderProductCard("stul-roero", curLang) + renderProductCard("stul-todo", curLang);
      }
      if(rawText.indexOf("Плетёные") !== -1 || rawText.indexOf("To‘qilgan") !== -1 || rawText.indexOf("Wicker") !== -1){
        return baseAns + renderProductCard("stul-vertex", curLang) + renderProductCard("stul-corda", curLang);
      }
      if(rawText.indexOf("Мягкие") !== -1 || rawText.indexOf("Yumshoq") !== -1 || rawText.indexOf("Upholstered") !== -1){
        return baseAns + renderProductCard("stul-lira", curLang) + renderProductCard("kreslo-como", curLang);
      }
      if(rawText.indexOf("столы") !== -1 || rawText.indexOf("stollari") !== -1 || rawText.indexOf("Table") !== -1){
        return baseAns + renderProductCard("stol-taper-80", curLang) + renderProductCard("stol-vertex-d90", curLang);
      }
      if(rawText.indexOf("комплект") !== -1 || rawText.indexOf("to‘plam") !== -1 || rawText.indexOf("sets") !== -1){
        return baseAns + renderProductCard("stol-taper-80", curLang) + renderProductCard("stul-vertex", curLang);
      }
      if(rawText.indexOf("менеджер") !== -1 || rawText.indexOf("Menejer") !== -1 || rawText.indexOf("manager") !== -1){
        return baseAns + renderLeadForm(curLang);
      }
      return baseAns;
    }

    var padded = " " + norm + " ";

    // 3. Cart inspection query
    if(/(?:^|[^\p{L}\p{N}])(корзин|в корзине|заказ в корзине|что я выбрал|savat|savatda|cart|my cart|in my cart|basket)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      return renderCartState(curLang);
    }

    // 4. Order intent -> Open interactive order form
    if(/(?:^|[^\p{L}\p{N}])(заказ|заказать|купить|оформить|оформление|хочу купить|как заказать|беру|buyurtma|xarid|sotib olish|order|buy|place order)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      var orderIntro = curLang === "uz" ? "Buyurtma berish juda oson! Quyidagi qisqa formani to‘ldiring, menejerimiz 10 daqiqa ichida yetkazib berishni tasdiqlash uchun bog‘lanadi:" :
        curLang === "en" ? "Ordering is simple! Fill out the brief form below and our sales specialist will call you within 10 minutes to verify items and dispatch:" :
        "Оформить заказ очень просто! Заполните короткую форму ниже, и наш менеджер свяжется с вами в течение 10 минут для согласования доставки:";
      return orderIntro + renderOrderForm(curLang, "");
    }

    // 5. Dynamic plastic combo calculator
    var comboCalc = matchComboCalculation(norm);
    if(comboCalc){
      return renderComboCalculation(comboCalc, curLang);
    }

    // 6. Approved ready combo matching
    if(/(vertex|вертекс).*?(d90|д90).*?(stul|стул|комплект|to['`]?plam)|(taper|тейпер|тапер).*?80.*?(vertex|вертекс|corda|корда)/iu.test(padded)){
      var comboDesc = curLang === "uz" ? "<b>Tasdiqlangan tayyor to‘plamlar BTT:</b><br>" +
        "• 1 стол VERTEX D90 + 4 to‘qilgan VERTEX stuli: <b>2 676 000 so‘m</b><br>" +
        "• 1 стол VERTEX D90 + 4 to‘qilgan CORDA stuli: <b>2 676 000 so‘m</b><br>" +
        "• 1 стол TAPER 80x80 + 4 to‘qilgan VERTEX stuli: <b>2 850 000 so‘m</b><br>" +
        "• 1 стол TAPER 80x80 + 4 to‘qilgan CORDA stuli: <b>2 850 000 so‘m</b>" :
        curLang === "en" ? "<b>Official approved ready sets:</b><br>" +
        "• 1 VERTEX D90 table + 4 VERTEX wicker chairs: <b>2,676,000 UZS</b><br>" +
        "• 1 VERTEX D90 table + 4 CORDA wicker chairs: <b>2,676,000 UZS</b><br>" +
        "• 1 TAPER 80x80 table + 4 VERTEX wicker chairs: <b>2,850,000 UZS</b><br>" +
        "• 1 TAPER 80x80 table + 4 CORDA wicker chairs: <b>2,850,000 UZS</b>" :
        "<b>Утверждённые специальные цены готовых комплектов BTT:</b><br>" +
        "• 1 стол VERTEX D90 + 4 плетёных стула VERTEX: <b>2 676 000 сум</b><br>" +
        "• 1 стол VERTEX D90 + 4 плетёных стула CORDA: <b>2 676 000 сум</b><br>" +
        "• 1 стол TAPER 80x80 + 4 плетёных стула VERTEX: <b>2 850 000 сум</b><br>" +
        "• 1 стол TAPER 80x80 + 4 плетёных стула CORDA: <b>2 850 000 сум</b>";

      return comboDesc + renderOrderForm(curLang, "Комплект: Стол Taper 80x80 + 4 плетёных стула Vertex");
    }

    // 7. Specific product search / inquiry
    var matchedProd = matchProduct(norm);
    if(matchedProd){
      var prod = matchedProd.product;
      var slug = matchedProd.slug;
      var I = window.BTT_I18N || {};
      var dict = I[curLang] || I.ru || {};
      var title = dict[slug + ".name"] || prod.name || slug;
      var priceStr = prod.now ? fmt(prod.now) : "";

      var desc = "";
      if(curLang === "uz"){
        desc = "<b>" + esc(title) + "</b>" + (priceStr ? " - narxi: <b>" + esc(priceStr) + "</b>" : "") +
          ". Toshkentdagi omborda mavjud, tezkor yetkazib berish xizmati bilan.";
      } else if(curLang === "en"){
        desc = "<b>" + esc(title) + "</b>" + (priceStr ? " - price: <b>" + esc(priceStr) + "</b>" : "") +
          ". In stock at our Tashkent warehouse with fast dispatch.";
      } else {
        desc = "<b>" + esc(title) + "</b>" + (priceStr ? " - цена: <b>" + esc(priceStr) + "</b>" : "") +
          ". В наличии на складе в Ташкенте, быстрая доставка по городу.";
      }
      return desc + renderProductCard(slug, curLang);
    }

    // 8. Stock & availability
    if(/(?:^|[^\p{L}\p{N}])(в наличии|наличии|склад|есть ли|bor mi|bormi|mavjud|in stock|stock|available)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      if(curLang === "uz"){
        return "Barcha asosiy mebel modellari (Roero, Noero, Todo, Todo Soft, Jardin, Vertex, Corda, Como, Lira, Taper) Toshkentdagi omborda mavjud. Buyurtma berilgan kuni yoki ertasi kuni jo‘natishimiz mumkin!";
      } else if(curLang === "en"){
        return "All core furniture models (Roero, Noero, Todo, Todo Soft, Jardin, Vertex, Corda, Como, Lira, Taper) are in stock at our Tashkent warehouse. Same-day or next-day dispatch available!";
      } else {
        return "Все основные модели мебели BTT (Roero, Noero, Todo, Todo Soft, Jardin, Vertex, Corda, Como, Lira, Taper) есть в наличии на складе в Ташкенте. Возможна отгрузка в день заказа!";
      }
    }

    // 9. Weight capacity & strength
    if(/(?:^|[^\p{L}\p{N}])(нагрузк|максимальный вес|сколько выдерживает|прочность|веса|og irlik|vazn|yuklama|weight capacity|max load|load)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      if(curLang === "uz"){
        return "Barcha BTT mebellari uy, hovli va jamoat joylarida (kafe, restoranlar) uzoq muddat xizmat qilish uchun ishlab chiqarilgan. Birlamchi mustahkam polipropilen va kukunli bo‘yoq bilan qoplangan po‘lat karkasdan tayyorlangan bo‘lib, kattalar uchun standart yuklamani bemalol ko‘taradi.";
      } else if(curLang === "en"){
        return "All BTT furniture is engineered for heavy daily residential and commercial (HoReCa) use. Constructed from primary virgin polypropylene and powder-coated steel frames, designed to reliably handle standard adult weight loads.";
      } else {
        return "Вся мебель BTT рассчитана на интенсивную повседневную эксплуатацию в домах, кафе и ресторанах (HoReCa). Стулья изготовлены из первичного ударопрочного полипропилена или стального каркаса с порошковой покраской и надёжно выдерживают стандартные эксплуатационные нагрузки взрослого человека.";
      }
    }

    // 10. Discounts & promo
    if(/(?:^|[^\p{L}\p{N}])(скидк|скидочк|акци|промокод|дешевле|chegirma|aktsiya|aksiya|promokod|discount|promo|sale)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      if(curLang === "uz"){
        return "Onlayn buyurtma berishda <b>BENTEN2026</b> promokodidan foydalanib 5% chegirmaga ega bo‘ling! Shuningdek, stullarni stol bilan birga to‘plamda xarid qilganda stul narxi avtomatik arzonlashadi (masalan, Roero 188 000 o‘rniga 168 000 so‘m).";
      } else if(curLang === "en"){
        return "Use promo code <b>BENTEN2026</b> at checkout for a 5% discount! In addition, buying chairs as part of a set with a table unlocks our bundled chair discount (e.g. Roero at 168,000 UZS instead of 188,000 UZS).";
      } else {
        return "При заказе через корзину на сайте действует промокод <b>BENTEN2026</b> на скидку 5%! Кроме того, при покупке комплекта со столом на пластиковые стулья действует комплектная цена (например, Roero 168 000 сум вместо 188 000 сум).";
      }
    }

    // 11. Live manager & contacts
    if(/(?:^|[^\p{L}\p{N}])(менеджер|оператор|человек|связаться|перезвон|позвонить|телефон|номер|контакт|телеграм|menejer|operator|bog lanish|telefon|contact|manager|call|callback|phone|talk)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      return (d.ans["Связаться с менеджером"] || d.ans["Menejer bilan bog‘lanish"] || d.ans["Talk to a manager"]) + renderLeadForm(curLang);
    }

    // 12. Greetings & small talk
    if(/(?:^|[^\p{L}\p{N}])(привет|здравствуй|добрый|салом|salom|assalomu|hello|hi|hey)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      return d.hi;
    }

    // 13. Prices query general
    if(/(?:^|[^\p{L}\p{N}])(цена|цены|почем|почём|пачем|скока|сколько|прайс|стоимость|дешево|дорого|narx|narxi|qancha|summa|nechi pul|necha pul|price|prices|cost|how much)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      return (d.ans["Цены на стулья"] || d.ans["Stullar narxlari"] || d.ans["Chair prices"]) + renderProductCard("stul-roero", curLang);
    }

    // 14. Delivery & pickup terms
    if(/(?:^|[^\p{L}\p{N}])(доставк|доставка|даставка|привез|курьер|сроки|самовывоз|забрать|склад|откуда|город|yetkazib|yetkazish|kuryer|olib ketish|ombor|delivery|shipping|pickup)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      return d.ans["Доставка и самовывоз"] || d.ans["Yetkazish va olib ketish"] || d.ans["Delivery and pickup"];
    }

    // 15. Showroom & address
    if(/(?:^|[^\p{L}\p{N}])(где вы|где находитесь|адрес|шоурум|локация|геолокация|куда подъехать|manzil|qayerda|lokatsiya|showroom|address|location|where)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      return d.ans["Где мы находимся"] || d.ans["Bizning manzil"] || d.ans["Our location"];
    }

    // 16. Payment methods
    if(/(?:^|[^\p{L}\p{N}])(оплата|как оплатить|click|payme|терминал|наличные|перевод|счет|счёт|картой|карта|to lov|tolov|payment|pay)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      return d.ans["Способы оплаты"] || d.ans["To‘lov usullari"] || d.ans["Payment methods"];
    }

    // 17. Materials & care
    if(/(?:^|[^\p{L}\p{N}])(материал|полипропилен|пластик|лдсп|уход|подушки|на улице|дождь|солнце|погода|выгорает|мыть|чистить|material|parvarish|care|weather)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      if(curLang === "uz"){
        return "BTT mebellari birlamchi polipropilen, quyoshga chidamli to‘qima va kukunli bo‘yoq bilan qoplangan metall karkasdan ishlab chiqariladi. Ularni tozalash oson, suv va quyoshdan qo‘rqmaydi.";
      } else if(curLang === "en"){
        return "BTT furniture is made from premium polypropylene, UV-resistant weave, and powder-coated steel frames. Weatherproof and easy to maintain with water and mild soap.";
      } else {
        return "Мебель BTT изготавливается из первичного полипропилена, стойкого к ультрафиолету плетения и металлокаркаса с порошковой покраской (чёрный муар). Не боится влаги и легко моется.";
      }
    }

    // 18. Warranty & returns
    if(/(?:^|[^\p{L}\p{N}])(возврат|гарантия|брак|обмен|вернуть|сломался|qaytarish|kafolat|almashtirish|return|warranty|exchange|refund)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      if(curLang === "uz"){
        return "Tovarlarni qonunda belgilangan muddatda fabrikaviy qadoqda qaytarish yoki almashtirish mumkin. Yuborishdan oldin har bir buyum sifat tekshiruvidan o‘tadi.";
      } else if(curLang === "en"){
        return "Items in original packaging can be returned or exchanged within the statutory timeframe. Each item undergoes strict pre-dispatch quality inspection.";
      } else {
        return "Вы можете вернуть или обменять товар надлежащего качества в установленный законом срок при сохранении фабричной упаковки и товарного вида. Перед отправкой каждый заказ проверяется.";
      }
    }

    // 19. HoReCa / Wholesale
    if(/(?:^|[^\p{L}\p{N}])(хорека|horeca|кафе|ресторан|опт|оптом|партия|для бизнеса|юридическ|веранда|терраса|летник|ulgurji|kafe|wholesale|b2b)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      if(curLang === "uz"){
        return "Kafelar, restoranlar va korporativ mijozlar uchun 10 tadan ortiq stul xaridida maxsus ulgurji narxlar va hisob-faktura asosida ishlash mavjud. Menejerimiz bilan bog‘laning: <a href='https://t.me/btt_uz' target='_blank' rel='noopener'>@btt_uz</a>." + renderOrderForm(curLang, "Другой товар / Индивидуальный расчёт");
      } else if(curLang === "en"){
        return "We provide commercial wholesale pricing, batch supply, and contracts for cafes, restaurants, and hotels. Contact our B2B team on <a href='https://t.me/btt_uz' target='_blank' rel='noopener'>@btt_uz</a>." + renderOrderForm(curLang, "Other product / Custom quote");
      } else {
        return "Для кафе, ресторанов, веранд и оптовых покупателей мы предлагаем специальные цены от 10 стульев и работу по договору. Свяжитесь с B2B-менеджером в <a href='https://t.me/btt_uz' target='_blank' rel='noopener'>@btt_uz</a>." + renderOrderForm(curLang, "Другой товар / Индивидуальный расчёт");
      }
    }

    // 20. Broad category matchers
    if(/(?:^|[^\p{L}\p{N}])(комплект|гарнитур|набор|наборы|стол и стулья|столы и стулья|to plam|to plamlari|garnitur|sets|bundle|bundles)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      return (d.ans["Готовые комплекты"] || d.ans["Tayyor to‘plamlar"] || d.ans["Furniture sets"]);
    }
    if(/(?:^|[^\p{L}\p{N}])(плетен|плетён|to qilgan|wicker)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      return (d.ans["Плетёные стулья"] || d.ans["To‘qilgan stullar"] || d.ans["Wicker chairs"]) + renderProductCard("stul-vertex", curLang) + renderProductCard("stul-corda", curLang);
    }
    if(/(?:^|[^\p{L}\p{N}])(пластик|полипропилен|plastik|plastic)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      return (d.ans["Пластиковые стулья"] || d.ans["Plastik stullar"] || d.ans["Plastic chairs"]) + renderProductCard("stul-roero", curLang) + renderProductCard("stul-todo", curLang);
    }
    if(/(?:^|[^\p{L}\p{N}])(мягк|экокож|велюр|ткань|кресло|yumshoq|upholstered)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      return (d.ans["Мягкие стулья"] || d.ans["Yumshoq stullar"] || d.ans["Upholstered chairs"]) + renderProductCard("stul-lira", curLang) + renderProductCard("kreslo-como", curLang);
    }
    if(/(?:^|[^\p{L}\p{N}])(стол|столы|столешниц|обеденн|stollar|stol|table|tables)(?:$|[^\p{L}\p{N}])/iu.test(padded)){
      return (d.ans["Цены на столы"] || d.ans["Stollar narxlari"] || d.ans["Table prices"]) + renderProductCard("stol-taper-80", curLang) + renderProductCard("stol-vertex-d90", curLang);
    }

    // 21. Intelligent fallback with order builder
    return d.fallback + renderOrderForm(curLang, "");
  }

  /* ---------------- DOM & UI WIRING ---------------- */
  document.addEventListener("DOMContentLoaded", function(){
    if(document.querySelector(".bot-fab")) return;

    var fab = document.createElement("button");
    fab.className = "bot-fab";
    fab.setAttribute("aria-label", "Чат-помощник BTT");
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.8-.9L3 21l1.4-5.2A8.4 8.4 0 0 1 3.5 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg><span class="bot-fab__badge">1</span>';

    var panel = document.createElement("div");
    panel.className = "bot-panel liquid spatial";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "BTT assistant");
    panel.innerHTML =
      '<div class="bot-head"><div class="bot-head__ava">Б</div>' +
      '<div><div class="bot-head__t" data-bot-name>Бен</div><div class="bot-head__s" data-bot-role>Онлайн-помощник BTT</div></div>' +
      '<button class="bot-head__x" data-bot-close aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
      '<div class="bot-msgs" data-bot-msgs></div>' +
      '<div class="bot-quick" data-bot-quick></div>' +
      '<form class="bot-input" data-bot-form><input type="text" data-bot-input autocomplete="off"><button class="bot-send" type="submit" aria-label="Отправить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z"/></svg></button></form>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    var msgs = panel.querySelector("[data-bot-msgs]");
    var quick = panel.querySelector("[data-bot-quick]");
    var input = panel.querySelector("[data-bot-input]");
    var started = false;

    function add(text, who){
      chatHistory.push({ who: who, text: text });
      if(chatHistory.length > 20) chatHistory.shift();

      var m = document.createElement("div");
      m.className = "bot-msg bot-msg--" + who;
      if(who === "user") m.textContent = text;
      else m.innerHTML = text;
      msgs.appendChild(m);
      msgs.scrollTop = msgs.scrollHeight;
      return m;
    }

    function typing(){
      var t = document.createElement("div");
      t.className = "bot-typing";
      t.innerHTML = "<span></span><span></span><span></span>";
      msgs.appendChild(t);
      msgs.scrollTop = msgs.scrollHeight;
      return t;
    }

    function botSay(text, delay){
      var t = typing();
      setTimeout(function(){
        t.remove();
        add(text, "bot");
      }, delay || 500);
    }

    function renderQuick(){
      var curLang = getActiveLang("");
      var d = T[curLang] || T.ru;
      quick.innerHTML = "";
      d.quick.forEach(function(label){
        var c = document.createElement("button");
        c.className = "bot-chip";
        c.type = "button";
        c.textContent = label;
        c.addEventListener("click", function(){ handle(label); });
        quick.appendChild(c);
      });
    }

    function applyLang(){
      var curLang = getActiveLang("");
      var d = T[curLang] || T.ru;
      var I = window.BTT_I18N || {};
      var tr = function(k, fb){ return (I.t ? I.t(k) : (I[curLang] && I[curLang][k]) || fb); };

      var nameEl = panel.querySelector("[data-bot-name]");
      if(nameEl) nameEl.textContent = d.name;
      var roleEl = panel.querySelector("[data-bot-role]");
      if(roleEl) roleEl.textContent = d.role;
      if(input) input.placeholder = d.ph;
      fab.setAttribute("aria-label", tr("bot.aria.fab", "Чат-помощник BTT"));
      var closeBtn = panel.querySelector("[data-bot-close]");
      if(closeBtn) closeBtn.setAttribute("aria-label", tr("bot.aria.close", "Закрыть"));
      var sendBtn = panel.querySelector(".bot-send");
      if(sendBtn) sendBtn.setAttribute("aria-label", tr("bot.aria.send", "Отправить"));

      renderQuick();
      fetchLiveCatalog();
    }

    function handle(text){
      add(text, "user");
      var resp = resolveBotResponse(text);
      botSay(resp, 450);
    }

    function open(){
      panel.classList.add("open");
      fab.classList.add("hidden");
      if(!started){
        started = true;
        var curLang = getActiveLang("");
        setTimeout(function(){ botSay(T[curLang].hi, 300); }, 150);
      }
      setTimeout(function(){ if(input) input.focus(); }, 320);
    }

    function close(){
      panel.classList.remove("open");
      fab.classList.remove("hidden");
    }

    fab.addEventListener("click", open);
    var closeBtn = panel.querySelector("[data-bot-close]");
    if(closeBtn) closeBtn.addEventListener("click", close);

    var formEl = panel.querySelector("[data-bot-form]");
    if(formEl){
      formEl.addEventListener("submit", function(e){
        e.preventDefault();
        var v = input.value.trim();
        if(!v) return;
        input.value = "";
        handle(v);
      });
    }

    /* Delegated actions for interactive cards inside chat */
    msgs.addEventListener("click", function(e){
      // 1. Add to cart from product card
      var addBtn = e.target.closest("[data-bot-add]");
      if(addBtn){
        var slug = addBtn.getAttribute("data-bot-add");
        var p = getEffectiveProduct(slug);
        var curLang = getActiveLang("");
        var I = window.BTT_I18N || {};
        var dict = I[curLang] || I.ru || {};
        var title = (p && p.name) || dict[slug + ".name"] || slug;
        var img = (p && p.images && p.images[0]) || (p && p.colors && p.colors[0] && p.colors[0].image) || "";
        var snap = { id: slug, name: title, price: (p && p.now) || 0, img: img };

        if(window.BTT_CART && window.BTT_CART.addToCart){
          window.BTT_CART.addToCart(snap, 1);
        }
        var tCfg = T[curLang] || T.ru;
        var prevText = addBtn.textContent;
        addBtn.textContent = "✓ " + tCfg.cartAdded;
        addBtn.classList.add("is-added");
        setTimeout(function(){
          addBtn.textContent = prevText;
          addBtn.classList.remove("is-added");
        }, 2200);
        return;
      }

      // 2. Open cart button
      var cartBtn = e.target.closest("[data-bot-cart-open]");
      if(cartBtn){
        if(window.BTT_CART && window.BTT_CART.openCart){
          window.BTT_CART.openCart();
        }
        return;
      }

      // 3. Lead form submission
      var leadSubmit = e.target.closest("[data-lead-submit]");
      if(leadSubmit){
        var formBox = leadSubmit.closest("[data-lead-form]");
        if(!formBox) return;
        var inp = formBox.querySelector(".bot-lead-input");
        var curLang = getActiveLang("");
        var tCfg = T[curLang] || T.ru;
        var ph = extractPhone(inp ? inp.value : "");
        if(!ph){
          if(inp){
            inp.style.borderColor = "#e74c3c";
            inp.focus();
            setTimeout(function(){ inp.style.borderColor = ""; }, 2000);
          }
          return;
        }

        leadSubmit.disabled = true;
        leadSubmit.textContent = tCfg.leadSending;
        sendBotLead(ph, "Запрос на обратный звонок из чата", "", "").then(function(res){
          formBox.outerHTML = renderOrderSuccess({ phone: ph, ref: "BTT-" + (res.id || Math.floor(1000 + Math.random() * 9000)) }, curLang);
        });
        return;
      }

      // 4. Interactive order form submission
      var orderSubmit = e.target.closest("[data-order-submit]");
      if(orderSubmit){
        var orderBox = orderSubmit.closest("[data-order-box]");
        if(!orderBox) return;
        var itemEl = orderBox.querySelector("[data-order-item]");
        var qtyEl = orderBox.querySelector("[data-order-qty]");
        var nameEl = orderBox.querySelector("[data-order-name]");
        var phoneEl = orderBox.querySelector("[data-order-phone]");
        var addrEl = orderBox.querySelector("[data-order-address]");

        var curLang = getActiveLang("");
        var tCfg = T[curLang] || T.ru;

        var phoneVal = extractPhone(phoneEl ? phoneEl.value : "");
        var nameVal = (nameEl ? nameEl.value.trim() : "");
        var itemVal = (itemEl ? itemEl.value : "");
        var qtyVal = (qtyEl ? qtyEl.value.trim() : "1") || "1";
        var addrVal = (addrEl ? addrEl.value.trim() : "");

        if(!nameVal){
          if(nameEl){
            nameEl.style.borderColor = "#e74c3c";
            nameEl.focus();
            setTimeout(function(){ nameEl.style.borderColor = ""; }, 2000);
          }
          return;
        }

        if(!phoneVal){
          if(phoneEl){
            phoneEl.style.borderColor = "#e74c3c";
            phoneEl.focus();
            setTimeout(function(){ phoneEl.style.borderColor = ""; }, 2000);
          }
          return;
        }

        orderSubmit.disabled = true;
        orderSubmit.textContent = tCfg.orderSending;

        var orderText = "Заказ из чат-помощника BTT:\n" +
          "Товар: " + itemVal + "\n" +
          "Количество: " + qtyVal + "\n" +
          "Имя: " + nameVal + "\n" +
          "Телефон: " + phoneVal + "\n" +
          "Адрес: " + (addrVal || "Не указан (согласовать)");

        sendBotLead(phoneVal, orderText, nameVal, addrVal).then(function(res){
          var refId = "BTT-" + (res.id || Math.floor(1000 + Math.random() * 9000));
          orderBox.outerHTML = renderOrderSuccess({
            ref: refId,
            name: nameVal,
            phone: phoneVal,
            item: itemVal + " (" + qtyVal + " шт/компл)"
          }, curLang);
        });
        return;
      }
    });

    // Enter key handling in inputs
    msgs.addEventListener("keydown", function(e){
      if(e.key === "Enter"){
        if(e.target.classList.contains("bot-lead-input")){
          e.preventDefault();
          var formBox = e.target.closest("[data-lead-form]");
          var btn = formBox ? formBox.querySelector("[data-lead-submit]") : null;
          if(btn) btn.click();
        } else if(e.target.classList.contains("bot-order-input")){
          e.preventDefault();
          var orderBox = e.target.closest("[data-order-box]");
          var submitBtn = orderBox ? orderBox.querySelector("[data-order-submit]") : null;
          if(submitBtn) submitBtn.click();
        }
      }
    });

    function syncDynamicSettings(s){
      if(!s) return;
      var phone = s.phone || "+998 77 104 44 22";
      var tg = (s.telegram || "btt_uz").replace(/^@/, "");
      T.ru.ans["Связаться с менеджером"] = "Наши менеджеры всегда готовы ответить на вопросы, рассчитать комплектацию и выслать живые фото мебели в Telegram: <a href='https://t.me/" + tg + "' target='_blank' rel='noopener'>@" + tg + "</a> или по телефону <a href='tel:" + phone.replace(/[^\d+]/g, "") + "'>" + phone + "</a>.";
      T.uz.ans["Menejer bilan bog‘lanish"] = "Menejerlarimiz barcha savollaringizga Telegram orqali <a href='https://t.me/" + tg + "' target='_blank' rel='noopener'>@" + tg + "</a> yoki telefon orqali <a href='tel:" + phone.replace(/[^\d+]/g, "") + "'>" + phone + "</a> tezda javob berishadi.";
      T.en.ans["Talk to a manager"] = "Reach our sales team directly on Telegram <a href='https://t.me/" + tg + "' target='_blank' rel='noopener'>@" + tg + "</a> or call <a href='tel:" + phone.replace(/[^\d+]/g, "") + "'>" + phone + "</a>.";
    }

    document.addEventListener("btt:settings", function(e){ syncDynamicSettings(e.detail); });
    try {
      var cached = sessionStorage.getItem("btt_settings");
      if(cached) syncDynamicSettings(JSON.parse(cached));
    } catch (_) {}

    document.addEventListener("btt:lang", applyLang);
    new MutationObserver(function(){ applyLang(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    applyLang();
  });

  window.BTT_BOT = {
    resolve: resolveBotResponse,
    detectLanguage: detectLanguage,
    PRICING: PRICING
  };
})();
