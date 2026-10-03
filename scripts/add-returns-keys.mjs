// Patch returns.html with data-i18n attributes, and add missing ret.* i18n keys
import { readFileSync, writeFileSync } from 'fs';

// === 1. Add extra ret.* keys to i18n.js ===
const i18nFile = 'assets/i18n.js';
let lines = readFileSync(i18nFile, 'utf8').split('\n');

// Find RU ret.footer.tg (just inserted) to add more detail keys after it
const ruRetTgIdx = lines.findIndex((l, i) => i < 500 && l.includes('"ret.footer.tg"') && !l.includes('//'));
if (ruRetTgIdx === -1) { console.error('RU ret.footer.tg not found'); process.exit(1); }

const newRURet2 = [
  '    "ret.law.badge": "Закон РУз «О защите прав потребителей»",',
  '    "ret.cond2.h": "Требования к состоянию",',
  '    "ret.cond2.l1": "Изделие без следов эксплуатации, сборки и механических повреждений (царапин, сколов).",',
  '    "ret.cond2.l2": "Сохранена полная комплектация (текстильные подушки, крепления, защитные накладки).",',
  '    "ret.cond2.l3": "Товары со следами нарушения правил эксплуатации возврату не подлежат.",',
  '    "ret.cond2.note": "При приёмке заказа рекомендуем осматривать целостность товара в присутствии курьера.",',
  '    "ret.qc.h": "Контроль качества",',
  '    "ret.qc.d": "Все изделия BTT проходят предпродажный контроль комплектности и целостности перед отгрузкой клиенту.",',
  '    "ret.qc.l1": "При обнаружении производственного дефекта свяжитесь с нами для оперативного рассмотрения.",',
  '    "ret.qc.l2": "Производим замену дефектной детали либо изделия в предусмотренном законом порядке.",',
  '    "ret.b1.l1": "Сохранение фабричного товарного вида и ярлыков.",',
  '    "ret.b1.l2": "Наличие документа, подтверждающего факт покупки.",',
  '    "ret.proc.h": "Порядок обращения",',
  '    "ret.step1.num": "ШАГ 01",',
  '    "ret.step1.h": "Свяжитесь с нами",',
  '    "ret.step2.num": "ШАГ 02",',
  '    "ret.step2.h": "Фото и данные",',
  '    "ret.step2.d": "Укажите номер заказа или телефон оформления и пришлите фотографии товара и упаковки.",',
  '    "ret.step3.num": "ШАГ 03",',
  '    "ret.step3.h": "Передача товара",',
  '    "ret.step3.d": "Согласуем передачу товара на склад в Ташкенте самостоятельно или через курьерскую службу.",',
  '    "ret.step4.num": "ШАГ 04",',
  '    "ret.step4.h": "Осмотр и расчёт",',
  '    "ret.step4.d": "После осмотра изделия производим замену либо возврат денежных средств согласно законодательству РУз.",',
  '    "ret.cta.h": "Остались вопросы по возврату или обмену?",',
  '    "ret.cta.d": "Свяжитесь с отделом заботы о клиентах BTT - проконсультируем по всем процедурам и поможем найти удобное решение.",',
  '    "ret.cta.tg": "Написать в Telegram",',
];
lines.splice(ruRetTgIdx + 1, 0, ...newRURet2);
console.log(`RU: inserted ${newRURet2.length} ret detail keys`);

// UZ
const uzRetTgIdx = lines.findIndex((l, i) => i > 900 && l.includes('"ret.footer.tg"') && !l.includes('//'));
if (uzRetTgIdx === -1) { console.error('UZ ret.footer.tg not found'); process.exit(1); }

const newUZRet2 = [
  '    "ret.law.badge": "O\'z.R. qonuni «Iste\'molchilar huquqlarini himoya qilish to\'g\'risida»",',
  '    "ret.cond2.h": "Holat talablari",',
  '    "ret.cond2.l1": "Ishlatilmagan, yig\'ilmagan va mexanik shikastlanishlarsiz (tirnalish, yoriqlar) mahsulot.",',
  '    "ret.cond2.l2": "To\'liq komplektatsiya saqlangan (matoli yostiqchalar, mahkamlash vositalari, himoya qopqoqlari).",',
  '    "ret.cond2.l3": "Foydalanish qoidalari buzilgan mahsulotlar qaytarilmaydi.",',
  '    "ret.cond2.note": "Buyurtmani qabul qilishda kuryer ishtirokida tovarning butunligini tekshirishni tavsiya etamiz.",',
  '    "ret.qc.h": "Sifat nazorati",',
  '    "ret.qc.d": "Barcha BTT mahsulotlari mijozga jo\'natishdan oldin komplektlik va butunlik bo\'yicha savdogacha nazoratdan o\'tadi.",',
  '    "ret.qc.l1": "Ishlab chiqarish nuqsonini aniqlaganingizda operativ ko\'rib chiqish uchun biz bilan bog\'laning.",',
  '    "ret.qc.l2": "Qonunda belgilangan tartibda nuqsonli detal yoki mahsulotni almashtiramiz.",',
  '    "ret.b1.l1": "Zavod tovar ko\'rinishi va yorliqlari saqlangan.",',
  '    "ret.b1.l2": "Xarid faktini tasdiqlovchi hujjat mavjud.",',
  '    "ret.proc.h": "Murojaat tartibi",',
  '    "ret.step1.num": "QADAM 01",',
  '    "ret.step1.h": "Biz bilan bog\'laning",',
  '    "ret.step2.num": "QADAM 02",',
  '    "ret.step2.h": "Foto va ma\'lumotlar",',
  '    "ret.step2.d": "Buyurtma raqamini yoki rasmiylashtirilgan telefon raqamini keltiring va tovar va qadoqlash fotosuratlarini yuboring.",',
  '    "ret.step3.num": "QADAM 03",',
  '    "ret.step3.h": "Tovarni topshirish",',
  '    "ret.step3.d": "Mustaqil ravishda yoki kuryer xizmati orqali Toshkentdagi omborga tovarni topshirishni kelishib olamiz.",',
  '    "ret.step4.num": "QADAM 04",',
  '    "ret.step4.h": "Ko\'rik va hisob-kitob",',
  '    "ret.step4.d": "Mahsulotni ko\'rikdan o\'tkazgandan so\'ng O\'zbekiston qonunchiligiga muvofiq almashtirish yoki pul qaytaramiz.",',
  '    "ret.cta.h": "Qaytarish yoki almashtirish bo\'yicha savollar qoldimi?",',
  '    "ret.cta.d": "BTT mijozlarga g\'amxo\'rlik bo\'limi bilan bog\'laning - barcha tartiblar bo\'yicha maslahat beramiz va qulay yechim topishga yordam beramiz.",',
  '    "ret.cta.tg": "Telegram orqali yozish",',
];
lines.splice(uzRetTgIdx + 1, 0, ...newUZRet2);
console.log(`UZ: inserted ${newUZRet2.length} ret detail keys`);

// EN
const enRetTgIdx = lines.findIndex((l, i) => i > 1600 && l.includes('"ret.footer.tg"') && !l.includes('//'));
if (enRetTgIdx === -1) { console.error('EN ret.footer.tg not found'); process.exit(1); }

const newENRet2 = [
  '    "ret.law.badge": "Law of Uzbekistan \'On Consumer Rights Protection\'",',
  '    "ret.cond2.h": "Condition requirements",',
  '    "ret.cond2.l1": "Item must be unused, unassembled and free of mechanical damage (scratches, chips).",',
  '    "ret.cond2.l2": "Complete set preserved (textile cushions, fasteners, protective pads).",',
  '    "ret.cond2.l3": "Items showing signs of misuse cannot be returned.",',
  '    "ret.cond2.note": "We recommend inspecting the item with the courier present upon delivery acceptance.",',
  '    "ret.qc.h": "Quality control",',
  '    "ret.qc.d": "All BTT products undergo pre-sale completeness and integrity inspection before dispatch.",',
  '    "ret.qc.l1": "If a manufacturing defect is found, contact us for prompt review.",',
  '    "ret.qc.l2": "We replace defective parts or items as provided by law.",',
  '    "ret.b1.l1": "Original factory appearance and labels preserved.",',
  '    "ret.b1.l2": "Purchase confirmation document available.",',
  '    "ret.proc.h": "How to submit a request",',
  '    "ret.step1.num": "STEP 01",',
  '    "ret.step1.h": "Contact us",',
  '    "ret.step2.num": "STEP 02",',
  '    "ret.step2.h": "Photos and details",',
  '    "ret.step2.d": "Provide your order number or registration phone and send photos of the item and packaging.",',
  '    "ret.step3.num": "STEP 03",',
  '    "ret.step3.h": "Item handover",',
  '    "ret.step3.d": "We coordinate delivery of the item to our Tashkent warehouse, either directly or via courier service.",',
  '    "ret.step4.num": "STEP 04",',
  '    "ret.step4.h": "Inspection and settlement",',
  '    "ret.step4.d": "After inspection we arrange replacement or refund in accordance with Uzbekistan legislation.",',
  '    "ret.cta.h": "Questions about returns or exchanges?",',
  '    "ret.cta.d": "Contact BTT customer care - we will advise on all procedures and help find a convenient solution.",',
  '    "ret.cta.tg": "Message us on Telegram",',
];
lines.splice(enRetTgIdx + 1, 0, ...newENRet2);
console.log(`EN: inserted ${newENRet2.length} ret detail keys`);

writeFileSync(i18nFile, lines.join('\n'), 'utf8');
console.log('i18n.js saved');

// === 2. Patch returns.html ===
let html = readFileSync('returns.html', 'utf8');

// Badge
html = html.replace(
  '<span>Закон РУз «О защите прав потребителей»</span>',
  '<span data-i18n="ret.law.badge">Закон РУз «О защите прав потребителей»</span>'
);
// Condition requirements card
html = html.replace(
  '<h2 class="help-card-title">Требования к состоянию</h2>',
  '<h2 class="help-card-title" data-i18n="ret.cond2.h">Требования к состоянию</h2>'
);
html = html.replace(
  '<li>Изделие без следов эксплуатации, сборки и механических повреждений (царапин, сколов).</li>',
  '<li data-i18n="ret.cond2.l1">Изделие без следов эксплуатации, сборки и механических повреждений (царапин, сколов).</li>'
);
html = html.replace(
  '<li>Сохранена полная комплектация (текстильные подушки, крепления, защитные накладки).</li>',
  '<li data-i18n="ret.cond2.l2">Сохранена полная комплектация (текстильные подушки, крепления, защитные накладки).</li>'
);
html = html.replace(
  '<li>Товары со следами нарушения правил эксплуатации возврату не подлежат.</li>',
  '<li data-i18n="ret.cond2.l3">Товары со следами нарушения правил эксплуатации возврату не подлежат.</li>'
);
html = html.replace(
  '<p class="help-card-desc" style="margin-top:auto;font-size:13px;opacity:0.85">При приёмке заказа рекомендуем осматривать целостность товара в присутствии курьера.</p>',
  '<p class="help-card-desc" style="margin-top:auto;font-size:13px;opacity:0.85" data-i18n="ret.cond2.note">При приёмке заказа рекомендуем осматривать целостность товара в присутствии курьера.</p>'
);
// Quality control card
html = html.replace(
  '<h2 class="help-card-title">Контроль качества</h2>',
  '<h2 class="help-card-title" data-i18n="ret.qc.h">Контроль качества</h2>'
);
html = html.replace(
  '<p class="help-card-desc" style="line-height:1.65">Все изделия BTT проходят предпродажный контроль комплектности и целостности перед отгрузкой клиенту.</p>',
  '<p class="help-card-desc" style="line-height:1.65" data-i18n="ret.qc.d">Все изделия BTT проходят предпродажный контроль комплектности и целостности перед отгрузкой клиенту.</p>'
);
html = html.replace(
  '<li>При обнаружении производственного дефекта свяжитесь с нами для оперативного рассмотрения.</li>',
  '<li data-i18n="ret.qc.l1">При обнаружении производственного дефекта свяжитесь с нами для оперативного рассмотрения.</li>'
);
html = html.replace(
  '<li>Производим замену дефектной детали либо изделия в предусмотренном законом порядке.</li>',
  '<li data-i18n="ret.qc.l2">Производим замену дефектной детали либо изделия в предусмотренном законом порядке.</li>'
);
// b1 list items
html = html.replace(
  '<li>Сохранение фабричного товарного вида и ярлыков.</li>',
  '<li data-i18n="ret.b1.l1">Сохранение фабричного товарного вида и ярлыков.</li>'
);
html = html.replace(
  '<li>Наличие документа, подтверждающего факт покупки.</li>',
  '<li data-i18n="ret.b1.l2">Наличие документа, подтверждающего факт покупки.</li>'
);
// Process section
html = html.replace(
  '<h2 class="help-card-title" style="font-size:26px;margin-bottom:18px">Порядок обращения</h2>',
  '<h2 class="help-card-title" style="font-size:26px;margin-bottom:18px" data-i18n="ret.proc.h">Порядок обращения</h2>'
);
html = html.replace(
  '<span class="help-step-num">ШАГ 01</span>',
  '<span class="help-step-num" data-i18n="ret.step1.num">ШАГ 01</span>'
);
html = html.replace(
  '<h3 class="help-step-title">Свяжитесь с нами</h3>',
  '<h3 class="help-step-title" data-i18n="ret.step1.h">Свяжитесь с нами</h3>'
);
html = html.replace(
  '<span class="help-step-num">ШАГ 02</span>',
  '<span class="help-step-num" data-i18n="ret.step2.num">ШАГ 02</span>'
);
html = html.replace(
  '<h3 class="help-step-title">Фото и данные</h3>',
  '<h3 class="help-step-title" data-i18n="ret.step2.h">Фото и данные</h3>'
);
html = html.replace(
  '<p class="help-step-text">Укажите номер заказа или телефон оформления и пришлите фотографии товара и упаковки.</p>',
  '<p class="help-step-text" data-i18n="ret.step2.d">Укажите номер заказа или телефон оформления и пришлите фотографии товара и упаковки.</p>'
);
html = html.replace(
  '<span class="help-step-num">ШАГ 03</span>',
  '<span class="help-step-num" data-i18n="ret.step3.num">ШАГ 03</span>'
);
html = html.replace(
  '<h3 class="help-step-title">Передача товара</h3>',
  '<h3 class="help-step-title" data-i18n="ret.step3.h">Передача товара</h3>'
);
html = html.replace(
  '<p class="help-step-text">Согласуем передачу товара на склад в Ташкенте самостоятельно или через курьерскую службу.</p>',
  '<p class="help-step-text" data-i18n="ret.step3.d">Согласуем передачу товара на склад в Ташкенте самостоятельно или через курьерскую службу.</p>'
);
html = html.replace(
  '<span class="help-step-num">ШАГ 04</span>',
  '<span class="help-step-num" data-i18n="ret.step4.num">ШАГ 04</span>'
);
html = html.replace(
  '<h3 class="help-step-title">Осмотр и расчёт</h3>',
  '<h3 class="help-step-title" data-i18n="ret.step4.h">Осмотр и расчёт</h3>'
);
html = html.replace(
  '<p class="help-step-text">После осмотра изделия производим замену либо возврат денежных средств согласно законодательству РУз.</p>',
  '<p class="help-step-text" data-i18n="ret.step4.d">После осмотра изделия производим замену либо возврат денежных средств согласно законодательству РУз.</p>'
);
// CTA banner
html = html.replace(
  '<h3 class="help-cta-title">Остались вопросы по возврату или обмену?</h3>',
  '<h3 class="help-cta-title" data-i18n="ret.cta.h">Остались вопросы по возврату или обмену?</h3>'
);
html = html.replace(
  '<p class="help-cta-text">Свяжитесь с отделом заботы о клиентах BTT - проконсультируем по всем процедурам и поможем найти удобное решение.</p>',
  '<p class="help-cta-text" data-i18n="ret.cta.d">Свяжитесь с отделом заботы о клиентах BTT - проконсультируем по всем процедурам и поможем найти удобное решение.</p>'
);
html = html.replace(
  '        <span>Написать в Telegram</span>\n      </a>\n      <a class="help-cta-btn-call"',
  '        <span data-i18n="ret.cta.tg">Написать в Telegram</span>\n      </a>\n      <a class="help-cta-btn-call"'
);
// Also fix the footer unlocalised span
html = html.replace(
  '<span>BTT - мебель для дома и сада</span><span data-i18n="foot.copy">',
  '<span data-i18n="foot.tag">BTT - мебель для дома и сада</span><span data-i18n="foot.copy">'
);

writeFileSync('returns.html', html, 'utf8');
console.log('returns.html patched');
