// Script: add delivery and returns i18n keys + wire data-i18n in HTML files
import { readFileSync, writeFileSync } from 'fs';

// === 1. Add keys to i18n.js ===
const i18nFile = 'assets/i18n.js';
let i18nContent = readFileSync(i18nFile, 'utf8');
let lines = i18nContent.split('\n');

// Find where del.k key is in RU (after which we insert new del.*/ret.* keys)
// We'll insert the missing delivery sub-keys after the existing del.b2.l2 key in RU
const ruDelL2Idx = lines.findIndex((l, i) => i < 400 && l.includes('"del.b2.l2"'));
if (ruDelL2Idx === -1) { console.error('RU del.b2.l2 not found'); process.exit(1); }

const newRUDel = [
  '    "del.badge": "Ташкент и регионы Узбекистана",',
  '    "del.cond.eyebrow": "Условия доставки",',
  '    "del.cond.h": "Как осуществляется доставка",',
  '    "del.cond.sub": "Стоимость и сроки зависят от адреса, габаритов и выбранного способа транспортировки.",',
  '    "del.tile1.label": "Службы доставки по Ташкенту",',
  '    "del.tile1.val": "Яндекс Доставка, грузовые такси (Labo, Porter)",',
  '    "del.tile2.label": "Сроки доставки",',
  '    "del.tile2.val": "1-2 рабочих дня при наличии на складе в Ташкенте",',
  '    "del.tile3.label": "Стоимость перевозки",',
  '    "del.tile3.val": "По фактическому тарифу выбранной службы без скрытых комиссий",',
  '    "del.tile4.label": "Отправка по регионам РУз",',
  '    "del.tile4.val": "Через междугородние логистические компании (BTS, EMU и др.) по согласованию",',
  '    "del.pickup.title": "Самовывоз:",',
  '    "del.pickup.desc": "Самовывоз со склада/офиса в Ташкенте возможен по предварительной договорённости с менеджером.",',
  '    "del.footer.note": "Хотите уточнить стоимость доставки под ваш адрес и объём?",',
  '    "del.footer.tg": "Написать в Telegram",',
  '    "del.std.eyebrow": "Надёжность",',
  '    "del.std.h": "Правила транспортировки",',
  '    "del.std.sub": "Обеспечиваем сохранность мебели на всём пути до вашего дома или заведения.",',
  '    "del.std1.h": "Надёжная упаковка",',
  '    "del.std1.d": "Мебель защищается плёнкой и картоном, чтобы исключить царапины и повреждения покрытия при транспортировке.",',
  '    "del.std2.h": "Прямой тариф службы",',
  '    "del.std2.d": "Вы оплачиваете фактическую стоимость доставки по расценкам логистической службы (Яндекс Доставка, Labo или междугородний перевозчик).",',
  '    "del.std3.h": "Осмотр при получении",',
  '    "del.std3.d": "Рекомендуем осмотреть товар при доставке: проверить целостность каркаса, столешницы или плетения и соответствие заказу.",',
  '    "del.steps.eyebrow": "Этапы",',
  '    "del.steps.h": "Как оформить и получить заказ",',
  '    "del.steps.sub": "Простой и прозрачный порядок работы.",',
  '    "del.step1.h": "Заказ и расчёт",',
  '    "del.step1.d": "Вы выбираете модели на сайте или в Telegram, менеджер рассчитывает стоимость с учётом адреса.",',
  '    "del.step2.h": "Комплектация",',
  '    "del.step2.d": "Проверяем товар перед отправкой со склада и аккуратно упаковываем для транспортировки.",',
  '    "del.step3.h": "Доставка",',
  '    "del.step3.d": "Передаём заказ курьерской или грузовой службе и держим связь по времени прибытия.",',
  '    "del.step4.h": "Получение",',
  '    "del.step4.d": "Вы осматриваете мебель, проверяете комплектацию и принимаете заказ.",',
];
lines.splice(ruDelL2Idx + 1, 0, ...newRUDel);
console.log(`RU: inserted ${newRUDel.length} delivery keys after line ${ruDelL2Idx + 1}`);

// Find RU ret.b2.l2 - insert returns extra keys there
const ruRetL2Idx = lines.findIndex((l, i) => i < 600 && l.includes('"ret.b2.l2"'));
if (ruRetL2Idx === -1) { console.error('RU ret.b2.l2 not found'); process.exit(1); }

const newRURet = [
  '    "ret.badge": "Защита прав покупателей",',
  '    "ret.cond.eyebrow": "Условия возврата",',
  '    "ret.cond.h": "Условия возврата и обмена",',
  '    "ret.cond.sub": "Обеспечиваем прозрачные правила возврата в соответствии с законодательством Республики Узбекистан.",',
  '    "ret.footer.note": "Вопросы по возврату или обмену?",',
  '    "ret.footer.tg": "Написать в Telegram",',
];
lines.splice(ruRetL2Idx + 1, 0, ...newRURet);
console.log(`RU: inserted ${newRURet.length} returns keys after line ${ruRetL2Idx + 1}`);

// Now UZ del.b2.l2
const uzDelL2Idx = lines.findIndex((l, i) => i > 600 && l.includes('"del.b2.l2"'));
if (uzDelL2Idx === -1) { console.error('UZ del.b2.l2 not found'); process.exit(1); }

const newUZDel = [
  '    "del.badge": "Toshkent va O\'zbekiston viloyatlari",',
  '    "del.cond.eyebrow": "Yetkazib berish shartlari",',
  '    "del.cond.h": "Yetkazib berish qanday amalga oshiriladi",',
  '    "del.cond.sub": "Narxi va muddati manzil, o\'lcham va tanlangan transport usuliga bog\'liq.",',
  '    "del.tile1.label": "Toshkent bo\'yicha yetkazib berish xizmatlari",',
  '    "del.tile1.val": "Yandex Yetkazib berish, yuk taksilari (Labo, Porter)",',
  '    "del.tile2.label": "Yetkazib berish muddati",',
  '    "del.tile2.val": "Toshkentdagi omborda mavjud bo\'lsa 1-2 ish kuni",',
  '    "del.tile3.label": "Tashish narxi",',
  '    "del.tile3.val": "Tanlangan xizmatning haqiqiy tarifi bo\'yicha yashirin komissiyalarsiz",',
  '    "del.tile4.label": "O\'zbekiston viloyatlariga yuborish",',
  '    "del.tile4.val": "Kelishilgan holda shahrararo logistika kompaniyalari (BTS, EMU va boshqalar) orqali",',
  '    "del.pickup.title": "O\'zingiz olib ketish:",',
  '    "del.pickup.desc": "Toshkentdagi ombordan/ofisdan menejer bilan oldindan kelishilgan holda olib ketish mumkin.",',
  '    "del.footer.note": "Manzilingiz va hajmingiz uchun yetkazib berish narxini aniqlamoqchimisiz?",',
  '    "del.footer.tg": "Telegram orqali yozish",',
  '    "del.std.eyebrow": "Ishonchlilik",',
  '    "del.std.h": "Tashish qoidalari",',
  '    "del.std.sub": "Mebelni uyingiz yoki muassasangizga yetib borgunga qadar xavfsizligini ta\'minlaymiz.",',
  '    "del.std1.h": "Ishonchli qadoqlash",',
  '    "del.std1.d": "Mebel tashish paytida tirnalish va qoplama shikastlanishining oldini olish uchun plyonka va karton bilan himoyalanadi.",',
  '    "del.std2.h": "To\'g\'ridan to\'g\'ri xizmat tarifi",',
  '    "del.std2.d": "Siz logistika xizmati (Yandex Yetkazib berish, Labo yoki shahrararo tashuvchi) narxlari bo\'yicha haqiqiy yetkazib berish xarajatini to\'laysiz.",',
  '    "del.std3.h": "Qabul qilishda ko\'rikdan o\'tkazish",',
  '    "del.std3.d": "Yetkazib berganda tovarni ko\'rikdan o\'tkazishni tavsiya etamiz: ramka, stoleshnitsa yoki to\'qimaning butunligi va buyurtmaga muvofiqligini tekshiring.",',
  '    "del.steps.eyebrow": "Bosqichlar",',
  '    "del.steps.h": "Buyurtmani qanday rasmiylashtirish va olish mumkin",',
  '    "del.steps.sub": "Oddiy va shaffof ish tartibi.",',
  '    "del.step1.h": "Buyurtma va hisob-kitob",',
  '    "del.step1.d": "Siz saytda yoki Telegramda modellarni tanlaysiz, menejer manzilni hisobga olgan holda narxni hisoblaydi.",',
  '    "del.step2.h": "Komplektatsiya",',
  '    "del.step2.d": "Ombordan jo\'natishdan oldin tovarni tekshiramiz va tashish uchun ehtiyotkorlik bilan qadoqlaymiz.",',
  '    "del.step3.h": "Yetkazib berish",',
  '    "del.step3.d": "Buyurtmani kuryer yoki yuk xizmatiga topshiramiz va kelish vaqti bo\'yicha aloqa qilamiz.",',
  '    "del.step4.h": "Qabul qilish",',
  '    "del.step4.d": "Siz mebelni ko\'rikdan o\'tkazasiz, komplektatsiyani tekshirasiz va buyurtmani qabul qilasiz.",',
];
lines.splice(uzDelL2Idx + 1, 0, ...newUZDel);
console.log(`UZ: inserted ${newUZDel.length} delivery keys after line ${uzDelL2Idx + 1}`);

// UZ ret.b2.l2
const uzRetL2Idx = lines.findIndex((l, i) => i > 900 && l.includes('"ret.b2.l2"'));
if (uzRetL2Idx === -1) { console.error('UZ ret.b2.l2 not found'); process.exit(1); }

const newUZRet = [
  '    "ret.badge": "Xaridor huquqlarini himoya qilish",',
  '    "ret.cond.eyebrow": "Qaytarish shartlari",',
  '    "ret.cond.h": "Qaytarish va almashtirish shartlari",',
  '    "ret.cond.sub": "O\'zbekiston Respublikasi qonunchiligiga muvofiq shaffof qaytarish qoidalarini ta\'minlaymiz.",',
  '    "ret.footer.note": "Qaytarish yoki almashtirish bo\'yicha savollar bormi?",',
  '    "ret.footer.tg": "Telegram orqali yozish",',
];
lines.splice(uzRetL2Idx + 1, 0, ...newUZRet);
console.log(`UZ: inserted ${newUZRet.length} returns keys after line ${uzRetL2Idx + 1}`);

// EN del.b2.l2
const enDelL2Idx = lines.findIndex((l, i) => i > 1200 && l.includes('"del.b2.l2"'));
if (enDelL2Idx === -1) { console.error('EN del.b2.l2 not found'); process.exit(1); }

const newENDel = [
  '    "del.badge": "Tashkent and Uzbekistan regions",',
  '    "del.cond.eyebrow": "Delivery conditions",',
  '    "del.cond.h": "How delivery works",',
  '    "del.cond.sub": "Price and timeline depend on address, dimensions and chosen shipping method.",',
  '    "del.tile1.label": "Tashkent delivery services",',
  '    "del.tile1.val": "Yandex Delivery, freight taxis (Labo, Porter)",',
  '    "del.tile2.label": "Delivery time",',
  '    "del.tile2.val": "1-2 business days when in stock in Tashkent",',
  '    "del.tile3.label": "Shipping cost",',
  '    "del.tile3.val": "Actual carrier rate with no hidden fees",',
  '    "del.tile4.label": "Shipping to Uzbekistan regions",',
  '    "del.tile4.val": "Via intercity logistics companies (BTS, EMU etc.) by arrangement",',
  '    "del.pickup.title": "Self-pickup:",',
  '    "del.pickup.desc": "Self-pickup from our warehouse/office in Tashkent by prior arrangement with the manager.",',
  '    "del.footer.note": "Want to get a delivery estimate for your address and volume?",',
  '    "del.footer.tg": "Message us on Telegram",',
  '    "del.std.eyebrow": "Reliability",',
  '    "del.std.h": "Transportation standards",',
  '    "del.std.sub": "We ensure your furniture arrives safely at your home or venue.",',
  '    "del.std1.h": "Secure packaging",',
  '    "del.std1.d": "Furniture is wrapped in film and cardboard to prevent scratches and coating damage during transport.",',
  '    "del.std2.h": "Direct carrier rate",',
  '    "del.std2.d": "You pay the actual delivery cost at logistics service rates (Yandex Delivery, Labo or intercity carrier).",',
  '    "del.std3.h": "Inspection on receipt",',
  '    "del.std3.d": "We recommend inspecting the item upon delivery: check the frame, tabletop or weave integrity and confirm it matches your order.",',
  '    "del.steps.eyebrow": "Steps",',
  '    "del.steps.h": "How to place and receive your order",',
  '    "del.steps.sub": "A simple and transparent process.",',
  '    "del.step1.h": "Order and quote",',
  '    "del.step1.d": "You browse models on the website or in Telegram; our manager calculates cost including your address.",',
  '    "del.step2.h": "Preparation",',
  '    "del.step2.d": "We inspect the item before dispatch and carefully package it for transport.",',
  '    "del.step3.h": "Delivery",',
  '    "del.step3.d": "We hand the order to a courier or freight service and keep you updated on arrival time.",',
  '    "del.step4.h": "Receipt",',
  '    "del.step4.d": "You inspect the furniture, verify completeness and accept the order.",',
];
lines.splice(enDelL2Idx + 1, 0, ...newENDel);
console.log(`EN: inserted ${newENDel.length} delivery keys after line ${enDelL2Idx + 1}`);

// EN ret.b2.l2
const enRetL2Idx = lines.findIndex((l, i) => i > 1500 && l.includes('"ret.b2.l2"'));
if (enRetL2Idx === -1) { console.error('EN ret.b2.l2 not found'); process.exit(1); }

const newENRet = [
  '    "ret.badge": "Consumer rights protection",',
  '    "ret.cond.eyebrow": "Return conditions",',
  '    "ret.cond.h": "Return and exchange terms",',
  '    "ret.cond.sub": "We follow transparent return rules in accordance with the legislation of the Republic of Uzbekistan.",',
  '    "ret.footer.note": "Questions about returns or exchanges?",',
  '    "ret.footer.tg": "Message us on Telegram",',
];
lines.splice(enRetL2Idx + 1, 0, ...newENRet);
console.log(`EN: inserted ${newENRet.length} returns keys after line ${enRetL2Idx + 1}`);

writeFileSync(i18nFile, lines.join('\n'), 'utf8');
console.log('i18n.js saved');

// === 2. Patch delivery.html ===
let delHtml = readFileSync('delivery.html', 'utf8');

// Badge
delHtml = delHtml.replace(
  '<span>Ташкент и регионы Узбекистана</span>',
  '<span data-i18n="del.badge">Ташкент и регионы Узбекистана</span>'
);
// Conditions section
delHtml = delHtml.replace(
  '<span>Условия доставки</span>',
  '<span data-i18n="del.cond.eyebrow">Условия доставки</span>'
);
delHtml = delHtml.replace(
  '<h2 class="del-calc__title">Как осуществляется доставка</h2>',
  '<h2 class="del-calc__title" data-i18n="del.cond.h">Как осуществляется доставка</h2>'
);
delHtml = delHtml.replace(
  '<p class="del-calc__sub">Стоимость и сроки зависят от адреса, габаритов и выбранного способа транспортировки.</p>',
  '<p class="del-calc__sub" data-i18n="del.cond.sub">Стоимость и сроки зависят от адреса, габаритов и выбранного способа транспортировки.</p>'
);
// 4 tiles
delHtml = delHtml.replace(
  '<span class="del-calc__tile-label">Службы доставки по Ташкенту</span>',
  '<span class="del-calc__tile-label" data-i18n="del.tile1.label">Службы доставки по Ташкенту</span>'
);
delHtml = delHtml.replace(
  '<div class="del-calc__tile-val">Яндекс Доставка, грузовые такси (Labo, Porter)</div>',
  '<div class="del-calc__tile-val" data-i18n="del.tile1.val">Яндекс Доставка, грузовые такси (Labo, Porter)</div>'
);
delHtml = delHtml.replace(
  '<span class="del-calc__tile-label">Сроки доставки</span>',
  '<span class="del-calc__tile-label" data-i18n="del.tile2.label">Сроки доставки</span>'
);
delHtml = delHtml.replace(
  '<div class="del-calc__tile-val">1-2 рабочих дня при наличии на складе в Ташкенте</div>',
  '<div class="del-calc__tile-val" data-i18n="del.tile2.val">1-2 рабочих дня при наличии на складе в Ташкенте</div>'
);
delHtml = delHtml.replace(
  '<span class="del-calc__tile-label">Стоимость перевозки</span>',
  '<span class="del-calc__tile-label" data-i18n="del.tile3.label">Стоимость перевозки</span>'
);
delHtml = delHtml.replace(
  '<div class="del-calc__tile-val">По фактическому тарифу выбранной службы без скрытых комиссий</div>',
  '<div class="del-calc__tile-val" data-i18n="del.tile3.val">По фактическому тарифу выбранной службы без скрытых комиссий</div>'
);
delHtml = delHtml.replace(
  '<span class="del-calc__tile-label">Отправка по регионам РУз</span>',
  '<span class="del-calc__tile-label" data-i18n="del.tile4.label">Отправка по регионам РУз</span>'
);
delHtml = delHtml.replace(
  '<div class="del-calc__tile-val">Через междугородние логистические компании (BTS, EMU и др.) по согласованию</div>',
  '<div class="del-calc__tile-val" data-i18n="del.tile4.val">Через междугородние логистические компании (BTS, EMU и др.) по согласованию</div>'
);
// Pickup bar
delHtml = delHtml.replace(
  '<strong>Самовывоз:</strong>',
  '<strong data-i18n="del.pickup.title">Самовывоз:</strong>'
);
delHtml = delHtml.replace(
  '<span>Самовывоз со склада/офиса в Ташкенте возможен по предварительной договорённости с менеджером.</span>',
  '<span data-i18n="del.pickup.desc">Самовывоз со склада/офиса в Ташкенте возможен по предварительной договорённости с менеджером.</span>'
);
// Footer note and TG
delHtml = delHtml.replace(
  '<span class="del-calc__footer-note">Хотите уточнить стоимость доставки под ваш адрес и объём?</span>',
  '<span class="del-calc__footer-note" data-i18n="del.footer.note">Хотите уточнить стоимость доставки под ваш адрес и объём?</span>'
);
// Telegram button in footer actions
delHtml = delHtml.replace(
  '            <span>Написать в Telegram</span>\n          </a>\n          <a class="btn btn--ghost btn--sm" href="tel:+998771044422">',
  '            <span data-i18n="del.footer.tg">Написать в Telegram</span>\n          </a>\n          <a class="btn btn--ghost btn--sm" href="tel:+998771044422">'
);
// Standards section
delHtml = delHtml.replace(
  '<span>Надёжность</span>',
  '<span data-i18n="del.std.eyebrow">Надёжность</span>'
);
delHtml = delHtml.replace(
  '<h2 class="delivery-section-title">Правила транспортировки</h2>',
  '<h2 class="delivery-section-title" data-i18n="del.std.h">Правила транспортировки</h2>'
);
delHtml = delHtml.replace(
  '<p class="delivery-section-sub">Обеспечиваем сохранность мебели на всём пути до вашего дома или заведения.</p>',
  '<p class="delivery-section-sub" data-i18n="del.std.sub">Обеспечиваем сохранность мебели на всём пути до вашего дома или заведения.</p>'
);
delHtml = delHtml.replace(
  '<h3 class="delivery-standard-title">Надёжная упаковка</h3>',
  '<h3 class="delivery-standard-title" data-i18n="del.std1.h">Надёжная упаковка</h3>'
);
delHtml = delHtml.replace(
  '<p class="delivery-standard-desc">Мебель защищается плёнкой и картоном, чтобы исключить царапины и повреждения покрытия при транспортировке.</p>',
  '<p class="delivery-standard-desc" data-i18n="del.std1.d">Мебель защищается плёнкой и картоном, чтобы исключить царапины и повреждения покрытия при транспортировке.</p>'
);
delHtml = delHtml.replace(
  '<h3 class="delivery-standard-title">Прямой тариф службы</h3>',
  '<h3 class="delivery-standard-title" data-i18n="del.std2.h">Прямой тариф службы</h3>'
);
delHtml = delHtml.replace(
  '<p class="delivery-standard-desc">Вы оплачиваете фактическую стоимость доставки по расценкам логистической службы (Яндекс Доставка, Labo или междугородний перевозчик).</p>',
  '<p class="delivery-standard-desc" data-i18n="del.std2.d">Вы оплачиваете фактическую стоимость доставки по расценкам логистической службы (Яндекс Доставка, Labo или междугородний перевозчик).</p>'
);
delHtml = delHtml.replace(
  '<h3 class="delivery-standard-title">Осмотр при получении</h3>',
  '<h3 class="delivery-standard-title" data-i18n="del.std3.h">Осмотр при получении</h3>'
);
delHtml = delHtml.replace(
  '<p class="delivery-standard-desc">Рекомендуем осмотреть товар при доставке: проверить целостность каркаса, столешницы или плетения и соответствие заказу.</p>',
  '<p class="delivery-standard-desc" data-i18n="del.std3.d">Рекомендуем осмотреть товар при доставке: проверить целостность каркаса, столешницы или плетения и соответствие заказу.</p>'
);
// Steps section
delHtml = delHtml.replace(
  '<span>Этапы</span>',
  '<span data-i18n="del.steps.eyebrow">Этапы</span>'
);
delHtml = delHtml.replace(
  '<h2 class="delivery-section-title">Как оформить и получить заказ</h2>',
  '<h2 class="delivery-section-title" data-i18n="del.steps.h">Как оформить и получить заказ</h2>'
);
delHtml = delHtml.replace(
  '<p class="delivery-section-sub">Простой и прозрачный порядок работы.</p>',
  '<p class="delivery-section-sub" data-i18n="del.steps.sub">Простой и прозрачный порядок работы.</p>'
);
delHtml = delHtml.replace(
  '<h3 class="delivery-step-title">Заказ и расчёт</h3>',
  '<h3 class="delivery-step-title" data-i18n="del.step1.h">Заказ и расчёт</h3>'
);
delHtml = delHtml.replace(
  '<p class="delivery-step-desc">Вы выбираете модели на сайте или в Telegram, менеджер рассчитывает стоимость с учётом адреса.</p>',
  '<p class="delivery-step-desc" data-i18n="del.step1.d">Вы выбираете модели на сайте или в Telegram, менеджер рассчитывает стоимость с учётом адреса.</p>'
);
delHtml = delHtml.replace(
  '<h3 class="delivery-step-title">Комплектация</h3>',
  '<h3 class="delivery-step-title" data-i18n="del.step2.h">Комплектация</h3>'
);
delHtml = delHtml.replace(
  '<p class="delivery-step-desc">Проверяем товар перед отправкой со склада и аккуратно упаковываем для транспортировки.</p>',
  '<p class="delivery-step-desc" data-i18n="del.step2.d">Проверяем товар перед отправкой со склада и аккуратно упаковываем для транспортировки.</p>'
);
delHtml = delHtml.replace(
  '<h3 class="delivery-step-title">Доставка</h3>',
  '<h3 class="delivery-step-title" data-i18n="del.step3.h">Доставка</h3>'
);
delHtml = delHtml.replace(
  '<p class="delivery-step-desc">Передаём заказ курьерской или грузовой службе и держим связь по времени прибытия.</p>',
  '<p class="delivery-step-desc" data-i18n="del.step3.d">Передаём заказ курьерской или грузовой службе и держим связь по времени прибытия.</p>'
);
delHtml = delHtml.replace(
  '<h3 class="delivery-step-title">Получение</h3>',
  '<h3 class="delivery-step-title" data-i18n="del.step4.h">Получение</h3>'
);
delHtml = delHtml.replace(
  '<p class="delivery-step-desc">Вы осматриваете мебель, проверяете комплектацию и принимаете заказ.</p>',
  '<p class="delivery-step-desc" data-i18n="del.step4.d">Вы осматриваете мебель, проверяете комплектацию и принимаете заказ.</p>'
);

writeFileSync('delivery.html', delHtml, 'utf8');
console.log('delivery.html patched');
