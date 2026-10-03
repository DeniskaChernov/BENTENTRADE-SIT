// Patch rotang-tashkent.html and sadovaya-mebel-rotang.html with i18n keys
import { readFileSync, writeFileSync } from 'fs';

const i18nFile = 'assets/i18n.js';
let lines = readFileSync(i18nFile, 'utf8').split('\n');

// Find last srch.empty key in RU as anchor (general area after hrc)
const ruAnchorIdx = lines.findIndex((l, i) => i < 700 && l.includes('"srch.empty"'));
if (ruAnchorIdx === -1) { console.error('RU srch.empty not found'); process.exit(1); }

const newRU = [
  // rotang-tashkent.html keys
  '    "seo.rotang.crumb": "Искусственный ротанг",',
  '    "seo.rotang.h1": "Мебель из искусственного ротанга в Ташкенте",',
  '    "seo.rotang.sub": "Стильные плетёные стулья и столы с элементами ротанга для дома, террас и заведений в Ташкенте.",',
  '    "seo.rotang.badge": "Контроль качества перед отгрузкой",',
  '    "seo.rotang.c1.h": "Плетёные стулья BTT",',
  '    "seo.rotang.c1.l1": "Стул Vertex - кручёный искусственный ротанг, бежевый цвет.",',
  '    "seo.rotang.c1.l2": "Стул Corda - элегантное плетение на металлокаркасе.",',
  '    "seo.rotang.c1.l3": "Мягкие текстильные подушки в комплекте с каждым стулом.",',
  '    "seo.rotang.c2.h": "Практичность и уход",',
  '    "seo.rotang.c2.l1": "Полимерное волокно высокой плотности.",',
  '    "seo.rotang.c2.l2": "Лёгкий уход с помощью влажной салфетки.",',
  '    "seo.rotang.c2.l3": "Идеально для веранд, крытых террас и кухонных зон.",',
  '    "seo.rotang.c3.h": "Обеденные столы с ротангом",',
  '    "seo.rotang.c3.l1": "Рекомендуется защита ЛДСП от прямого воздействия осадков.",',
  '    "seo.rotang.cta.h": "Хотите подобрать комплект мебели?",',
  '    "seo.rotang.cta.tg": "Написать в Telegram",',
  // sadovaya-mebel-rotang.html keys
  '    "seo.sadovaya.crumb": "Сад и терраса",',
  '    "seo.sadovaya.h1": "Мебель для сада и террасы в Ташкенте",',
  '    "seo.sadovaya.sub": "Практичные столы, плетёные и пластиковые стулья для дома, веранды, сада и открытых площадок в Ташкенте.",',
  '    "seo.sadovaya.badge": "Контроль качества перед отгрузкой",',
  '    "seo.sadovaya.c1.h": "Для веранд и крытых террас",',
  '    "seo.sadovaya.c1.l1": "Металлический каркас с защитным покрытием.",',
  '    "seo.sadovaya.c1.l2": "Искусственный ротанг, устойчивый к внешним условиям.",',
  '    "seo.sadovaya.c1.l3": "Мягкие текстильные подушки в комплекте.",',
  '    "seo.sadovaya.c2.h": "Обеденные столы BTT",',
  '    "seo.sadovaya.c2.l1": "Размеры: 80×80 см, 135×80 см и круглый Ø90 см.",',
  '    "seo.sadovaya.c2.l2": "Устойчивая металлическая опора.",',
  '    "seo.sadovaya.c2.l3": "Рекомендуется защита столешницы из ЛДСП от прямых осадков.",',
  '    "seo.sadovaya.c3.h": "Пластиковые стулья",',
  '    "seo.sadovaya.c3.l1": "Практичная конструкция для ежедневного использования.",',
  '    "seo.sadovaya.c3.l2": "Легко моются и не боятся влаги.",',
  '    "seo.sadovaya.c3.l3": "Подтверждённые цвета моделей уточняйте в каталоге.",',
  '    "seo.sadovaya.cta.h": "Подберите мебель для вашей террасы",',
  '    "seo.sadovaya.cta.btn1": "Перейти в каталог стульев",',
  '    "seo.sadovaya.cta.tg": "Консультация в Telegram",',
];
lines.splice(ruAnchorIdx + 1, 0, ...newRU);
console.log(`RU: inserted ${newRU.length} seo keys`);

// UZ
const uzAnchorIdx = lines.findIndex((l, i) => i > 900 && l.includes('"srch.empty"'));
if (uzAnchorIdx === -1) { console.error('UZ srch.empty not found'); process.exit(1); }

const newUZ = [
  '    "seo.rotang.crumb": "Sun\'iy rotan",',
  '    "seo.rotang.h1": "Toshkentda sun\'iy rotandan tayyorlangan mebel",',
  '    "seo.rotang.sub": "Toshkentda uy, terrasalar va muassasalar uchun zamonaviy to\'qilgan stullar va rotanli stollar.",',
  '    "seo.rotang.badge": "Jo\'natishdan oldin sifat nazorati",',
  '    "seo.rotang.c1.h": "BTT to\'qilgan stullar",',
  '    "seo.rotang.c1.l1": "Vertex stuli - o\'rilgan sun\'iy rotan, krем rangi.",',
  '    "seo.rotang.c1.l2": "Corda stuli - metall ramkada nafis to\'qima.",',
  '    "seo.rotang.c1.l3": "Har bir stul bilan birga yumshoq to\'qimali yostiqchalar.",',
  '    "seo.rotang.c2.h": "Amaliylik va uzoq muddatlilik",',
  '    "seo.rotang.c2.l1": "Yuqori zichlikdagi mustahkam polimer.",',
  '    "seo.rotang.c2.l2": "Nam latta bilan osongina tozalanadi.",',
  '    "seo.rotang.c2.l3": "Verandalar, yopiq terrasalar va oshxona zonalari uchun ideal.",',
  '    "seo.rotang.c3.h": "Rotanli ovqat xonasi stollari",',
  '    "seo.rotang.c3.l1": "LDSP stoleshnitсasini to\'g\'ridan-to\'g\'ri yog\'ingarchiliкdan himoya qilish tavsiya etiladi.",',
  '    "seo.rotang.cta.h": "Mebel to\'plamini tanlashni xohlaysizmi?",',
  '    "seo.rotang.cta.tg": "Telegram orqali yozish",',
  '    "seo.sadovaya.crumb": "Bog\' va terrasa",',
  '    "seo.sadovaya.h1": "Toshkentda bog\' va terrasa mebellar",',
  '    "seo.sadovaya.sub": "Toshkentda uy, veranda, bog\' va ochiq maydonlar uchun amaliy stollar, to\'qilgan va plastik stullar.",',
  '    "seo.sadovaya.badge": "Jo\'natishdan oldin sifat nazorati",',
  '    "seo.sadovaya.c1.h": "Verandalar va yopiq terrasalar uchun",',
  '    "seo.sadovaya.c1.l1": "Himoya qoplamali metall ramka.",',
  '    "seo.sadovaya.c1.l2": "Tashqi sharoitga chidamli sun\'iy rotan.",',
  '    "seo.sadovaya.c1.l3": "Yumshoq to\'qimali yostiqchalar to\'plamda.",',
  '    "seo.sadovaya.c2.h": "BTT ovqat xonasi stollari",',
  '    "seo.sadovaya.c2.l1": "O\'lchamlari: 80×80 sm, 135×80 sm va dumaloq Ø90 sm.",',
  '    "seo.sadovaya.c2.l2": "Barqaror metall tayanch.",',
  '    "seo.sadovaya.c2.l3": "LDSP stoleshnitсasini to\'g\'ridan-to\'g\'ri yog\'ingarchiliкdan himoya qilish tavsiya etiladi.",',
  '    "seo.sadovaya.c3.h": "Plastik stullar",',
  '    "seo.sadovaya.c3.l1": "Kundalik foydalanish uchun amaliy konstruktsiya.",',
  '    "seo.sadovaya.c3.l2": "Osonlik bilan yuviladi va namlikdan qo\'rqmaydi.",',
  '    "seo.sadovaya.c3.l3": "Tasdiqlangan model ranglarini katalogda aniqlang.",',
  '    "seo.sadovaya.cta.h": "Terrassangiz uchun mebel tanlang",',
  '    "seo.sadovaya.cta.btn1": "Stullar katalogiga o\'tish",',
  '    "seo.sadovaya.cta.tg": "Telegram orqali maslahat",',
];
lines.splice(uzAnchorIdx + 1, 0, ...newUZ);
console.log(`UZ: inserted ${newUZ.length} seo keys`);

// EN
const enAnchorIdx = lines.findIndex((l, i) => i > 1700 && l.includes('"srch.empty"'));
if (enAnchorIdx === -1) { console.error('EN srch.empty not found'); process.exit(1); }

const newEN = [
  '    "seo.rotang.crumb": "Artificial rattan",',
  '    "seo.rotang.h1": "Artificial rattan furniture in Tashkent",',
  '    "seo.rotang.sub": "Stylish wicker chairs and rattan tables for homes, terraces and venues in Tashkent.",',
  '    "seo.rotang.badge": "Quality check before dispatch",',
  '    "seo.rotang.c1.h": "BTT wicker chairs",',
  '    "seo.rotang.c1.l1": "Vertex chair - twisted artificial rattan, beige colour.",',
  '    "seo.rotang.c1.l2": "Corda chair - elegant weave on a metal frame.",',
  '    "seo.rotang.c1.l3": "Soft textile cushions included with every chair.",',
  '    "seo.rotang.c2.h": "Practicality and durability",',
  '    "seo.rotang.c2.l1": "High-density durable polymer.",',
  '    "seo.rotang.c2.l2": "Easy to clean with a damp cloth.",',
  '    "seo.rotang.c2.l3": "Perfect for verandas, covered terraces and kitchen zones.",',
  '    "seo.rotang.c3.h": "Dining tables with rattan",',
  '    "seo.rotang.c3.l1": "Protect the MDF tabletop from direct rain exposure.",',
  '    "seo.rotang.cta.h": "Want to choose a furniture set?",',
  '    "seo.rotang.cta.tg": "Message us on Telegram",',
  '    "seo.sadovaya.crumb": "Garden and terrace",',
  '    "seo.sadovaya.h1": "Garden and terrace furniture in Tashkent",',
  '    "seo.sadovaya.sub": "Practical tables, wicker and plastic chairs for homes, verandas, gardens and open spaces in Tashkent.",',
  '    "seo.sadovaya.badge": "Quality check before dispatch",',
  '    "seo.sadovaya.c1.h": "For verandas and covered terraces",',
  '    "seo.sadovaya.c1.l1": "Metal frame with protective coating.",',
  '    "seo.sadovaya.c1.l2": "Artificial rattan resistant to outdoor conditions.",',
  '    "seo.sadovaya.c1.l3": "Soft textile cushions included.",',
  '    "seo.sadovaya.c2.h": "BTT dining tables",',
  '    "seo.sadovaya.c2.l1": "Sizes: 80×80 cm, 135×80 cm and round Ø90 cm.",',
  '    "seo.sadovaya.c2.l2": "Stable metal base.",',
  '    "seo.sadovaya.c2.l3": "Protect MDF tabletop from direct rain exposure.",',
  '    "seo.sadovaya.c3.h": "Plastic chairs",',
  '    "seo.sadovaya.c3.l1": "Practical design for everyday use.",',
  '    "seo.sadovaya.c3.l2": "Easy to clean, moisture-resistant.",',
  '    "seo.sadovaya.c3.l3": "Check confirmed colour options in the catalogue.",',
  '    "seo.sadovaya.cta.h": "Find furniture for your terrace",',
  '    "seo.sadovaya.cta.btn1": "Browse chair catalogue",',
  '    "seo.sadovaya.cta.tg": "Consult us on Telegram",',
];
lines.splice(enAnchorIdx + 1, 0, ...newEN);
console.log(`EN: inserted ${newEN.length} seo keys`);

writeFileSync(i18nFile, lines.join('\n'), 'utf8');
console.log('i18n.js saved');

// === Patch rotang-tashkent.html ===
function patchHtml(file, replacements) {
  let html = readFileSync(file, 'utf8');
  let count = 0;
  for (const [from, to] of replacements) {
    if (html.includes(from)) { html = html.replace(from, to); count++; }
    else console.warn(`  MISS in ${file}: ${from.slice(0,60)}`);
  }
  writeFileSync(file, html, 'utf8');
  console.log(`${file}: ${count}/${replacements.length} replacements applied`);
}

patchHtml('rotang-tashkent.html', [
  ['<span class="help-breadcrumbs__current">\u0418\u0441\u043a\u0443\u0441\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439 \u0440\u043e\u0442\u0430\u043d\u0433</span>',
   '<span class="help-breadcrumbs__current" data-i18n="seo.rotang.crumb">\u0418\u0441\u043a\u0443\u0441\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439 \u0440\u043e\u0442\u0430\u043d\u0433</span>'],
  ['<h1 class="help-top-title">\u041c\u0435\u0431\u0435\u043b\u044c \u0438\u0437 \u0438\u0441\u043a\u0443\u0441\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0433\u043e \u0440\u043e\u0442\u0430\u043d\u0433\u0430 \u0432 \u0422\u0430\u0448\u043a\u0435\u043d\u0442\u0435</h1>',
   '<h1 class="help-top-title" data-i18n="seo.rotang.h1">\u041c\u0435\u0431\u0435\u043b\u044c \u0438\u0437 \u0438\u0441\u043a\u0443\u0441\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0433\u043e \u0440\u043e\u0442\u0430\u043d\u0433\u0430 \u0432 \u0422\u0430\u0448\u043a\u0435\u043d\u0442\u0435</h1>'],
  ['<h2 class="help-card-title">\u041f\u043b\u0435\u0442\u0451\u043d\u044b\u0435 \u0441\u0442\u0443\u043b\u044c\u044f BTT</h2>',
   '<h2 class="help-card-title" data-i18n="seo.rotang.c1.h">\u041f\u043b\u0435\u0442\u0451\u043d\u044b\u0435 \u0441\u0442\u0443\u043b\u044c\u044f BTT</h2>'],
  ['<h2 class="help-card-title">\u041f\u0440\u0430\u043a\u0442\u0438\u0447\u043d\u043e\u0441\u0442\u044c \u0438 \u0434\u043e\u043b\u0433\u043e\u0432\u0435\u0447\u043d\u043e\u0441\u0442\u044c</h2>',
   '<h2 class="help-card-title" data-i18n="seo.rotang.c2.h">\u041f\u0440\u0430\u043a\u0442\u0438\u0447\u043d\u043e\u0441\u0442\u044c \u0438 \u0434\u043e\u043b\u0433\u043e\u0432\u0435\u0447\u043d\u043e\u0441\u0442\u044c</h2>'],
  ['<h2 class="help-card-title">\u041e\u0431\u0435\u0434\u0435\u043d\u043d\u044b\u0435 \u0441\u0442\u043e\u043b\u044b \u0441 \u0440\u043e\u0442\u0430\u043d\u0433\u043e\u043c</h2>',
   '<h2 class="help-card-title" data-i18n="seo.rotang.c3.h">\u041e\u0431\u0435\u0434\u0435\u043d\u043d\u044b\u0435 \u0441\u0442\u043e\u043b\u044b \u0441 \u0440\u043e\u0442\u0430\u043d\u0433\u043e\u043c</h2>'],
  ['<h3 class="help-cta-title">\u0425\u043e\u0442\u0438\u0442\u0435 \u043f\u043e\u0434\u043e\u0431\u0440\u0430\u0442\u044c \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u043c\u0435\u0431\u0435\u043b\u0438?</h3>',
   '<h3 class="help-cta-title" data-i18n="seo.rotang.cta.h">\u0425\u043e\u0442\u0438\u0442\u0435 \u043f\u043e\u0434\u043e\u0431\u0440\u0430\u0442\u044c \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u043c\u0435\u0431\u0435\u043b\u0438?</h3>'],
]);

patchHtml('sadovaya-mebel-rotang.html', [
  ['<span class="help-breadcrumbs__current">\u0421\u0430\u0434 \u0438 \u0442\u0435\u0440\u0440\u0430\u0441\u0430</span>',
   '<span class="help-breadcrumbs__current" data-i18n="seo.sadovaya.crumb">\u0421\u0430\u0434 \u0438 \u0442\u0435\u0440\u0440\u0430\u0441\u0430</span>'],
  ['<h1 class="help-top-title">\u041c\u0435\u0431\u0435\u043b\u044c \u0434\u043b\u044f \u0441\u0430\u0434\u0430 \u0438 \u0442\u0435\u0440\u0440\u0430\u0441\u044b \u0432 \u0422\u0430\u0448\u043a\u0435\u043d\u0442\u0435</h1>',
   '<h1 class="help-top-title" data-i18n="seo.sadovaya.h1">\u041c\u0435\u0431\u0435\u043b\u044c \u0434\u043b\u044f \u0441\u0430\u0434\u0430 \u0438 \u0442\u0435\u0440\u0440\u0430\u0441\u044b \u0432 \u0422\u0430\u0448\u043a\u0435\u043d\u0442\u0435</h1>'],
  ['<h2 class="help-card-title">\u0414\u043b\u044f \u0432\u0435\u0440\u0430\u043d\u0434 \u0438 \u043a\u0440\u044b\u0442\u044b\u0445 \u0442\u0435\u0440\u0440\u0430\u0441</h2>',
   '<h2 class="help-card-title" data-i18n="seo.sadovaya.c1.h">\u0414\u043b\u044f \u0432\u0435\u0440\u0430\u043d\u0434 \u0438 \u043a\u0440\u044b\u0442\u044b\u0445 \u0442\u0435\u0440\u0440\u0430\u0441</h2>'],
  ['<h2 class="help-card-title">\u041e\u0431\u0435\u0434\u0435\u043d\u043d\u044b\u0435 \u0441\u0442\u043e\u043b\u044b BTT</h2>',
   '<h2 class="help-card-title" data-i18n="seo.sadovaya.c2.h">\u041e\u0431\u0435\u0434\u0435\u043d\u043d\u044b\u0435 \u0441\u0442\u043e\u043b\u044b BTT</h2>'],
  ['<h2 class="help-card-title">\u041f\u043b\u0430\u0441\u0442\u0438\u043a\u043e\u0432\u044b\u0435 \u0441\u0442\u0443\u043b\u044c\u044f</h2>',
   '<h2 class="help-card-title" data-i18n="seo.sadovaya.c3.h">\u041f\u043b\u0430\u0441\u0442\u0438\u043a\u043e\u0432\u044b\u0435 \u0441\u0442\u0443\u043b\u044c\u044f</h2>'],
  ['<h3 class="help-cta-title">\u041f\u043e\u0434\u0431\u0435\u0440\u0438\u0442\u0435 \u043c\u0435\u0431\u0435\u043b\u044c \u0434\u043b\u044f \u0432\u0430\u0448\u0435\u0439 \u0442\u0435\u0440\u0440\u0430\u0441\u044b</h3>',
   '<h3 class="help-cta-title" data-i18n="seo.sadovaya.cta.h">\u041f\u043e\u0434\u0431\u0435\u0440\u0438\u0442\u0435 \u043c\u0435\u0431\u0435\u043b\u044c \u0434\u043b\u044f \u0432\u0430\u0448\u0435\u0439 \u0442\u0435\u0440\u0440\u0430\u0441\u044b</h3>'],
  ['<span>\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043a\u0430\u0442\u0430\u043b\u043e\u0433 \u0441\u0442\u0443\u043b\u044c\u0435\u0432</span>',
   '<span data-i18n="seo.sadovaya.cta.btn1">\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043a\u0430\u0442\u0430\u043b\u043e\u0433 \u0441\u0442\u0443\u043b\u044c\u0435\u0432</span>'],
  ['<span>\u041a\u043e\u043d\u0441\u0443\u043b\u044c\u0442\u0430\u0446\u0438\u044f \u0432 Telegram</span>',
   '<span data-i18n="seo.sadovaya.cta.tg">\u041a\u043e\u043d\u0441\u0443\u043b\u044c\u0442\u0430\u0446\u0438\u044f \u0432 Telegram</span>'],
]);

// Also patch the Telegram button in rotang
let rotHtml = readFileSync('rotang-tashkent.html', 'utf8');
rotHtml = rotHtml.replace(
  '<span>\u041d\u0430\u043f\u0438\u0441\u0430\u0442\u044c \u0432 Telegram</span>',
  '<span data-i18n="seo.rotang.cta.tg">\u041d\u0430\u043f\u0438\u0441\u0430\u0442\u044c \u0432 Telegram</span>'
);
writeFileSync('rotang-tashkent.html', rotHtml, 'utf8');
console.log('Telegram span in rotang-tashkent.html patched');
