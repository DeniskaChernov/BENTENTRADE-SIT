// Patch remaining <p> and <li> items in SEO pages
import { readFileSync, writeFileSync } from 'fs';

const i18nFile = 'assets/i18n.js';
let lines = readFileSync(i18nFile, 'utf8').split('\n');

// Find seo.rotang.cta.tg key to insert after it in each lang
function insertAfter(key, newKeys, minIdx, maxIdx) {
  const idx = lines.findIndex((l, i) => i >= minIdx && i < maxIdx && l.includes(key));
  if (idx === -1) { console.error(`Key "${key}" not found in ${minIdx}-${maxIdx}`); return false; }
  lines.splice(idx + 1, 0, ...newKeys);
  return idx;
}

const newRU2 = [
  '    "seo.rotang.badge": "\u041a\u043e\u043d\u0442\u0440\u043e\u043b\u044c \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u0430 \u043f\u0435\u0440\u0435\u0434 \u043e\u0442\u0433\u0440\u0443\u0437\u043a\u043e\u0439",',
  '    "seo.rotang.c1.d": "\u0421\u0442\u0443\u043b\u044c\u044f Vertex \u0438 Corda \u0441\u043e\u0447\u0435\u0442\u0430\u044e\u0442 \u043f\u0440\u043e\u0447\u043d\u044b\u0439 \u043c\u0435\u0442\u0430\u043b\u043b\u043e\u043a\u0430\u0440\u043a\u0430\u0441 \u0441 \u043f\u043b\u0435\u0442\u0451\u043d\u044b\u043c \u0438\u0441\u043a\u0443\u0441\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u043c \u0440\u043e\u0442\u0430\u043d\u0433\u043e\u043c \u0438 \u043c\u044f\u0433\u043a\u0438\u043c\u0438 \u043f\u043e\u0434\u0443\u0448\u043a\u0430\u043c\u0438.",',
  '    "seo.rotang.c1.l1x": "\u0421\u0442\u0443\u043b Vertex - \u043a\u0440\u0443\u0447\u0451\u043d\u044b\u0439 \u0438\u0441\u043a\u0443\u0441\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439 \u0440\u043e\u0442\u0430\u043d\u0433, \u0431\u0435\u0436\u0435\u0432\u044b\u0439 \u0446\u0432\u0435\u0442.",',
  '    "seo.rotang.c1.l2x": "\u0421\u0442\u0443\u043b Corda - \u044d\u043b\u0435\u0433\u0430\u043d\u0442\u043d\u043e\u0435 \u043f\u043b\u0435\u0442\u0435\u043d\u0438\u0435 \u043d\u0430 \u043c\u0435\u0442\u0430\u043b\u043b\u043e\u043a\u0430\u0440\u043a\u0430\u0441\u0435.",',
  '    "seo.rotang.c1.l3x": "\u041c\u044f\u0433\u043a\u0438\u0435 \u0442\u0435\u043a\u0441\u0442\u0438\u043b\u044c\u043d\u044b\u0435 \u043f\u043e\u0434\u0443\u0448\u043a\u0438 \u0432 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442\u0435 \u0441 \u043a\u0430\u0436\u0434\u044b\u043c \u0441\u0442\u0443\u043b\u043e\u043c.",',
  '    "seo.rotang.c2.d": "\u0418\u0441\u043a\u0443\u0441\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439 \u0440\u043e\u0442\u0430\u043d\u0433 \u043d\u0435 \u0440\u0430\u0441\u0441\u044b\u0445\u0430\u0435\u0442\u0441\u044f, \u0443\u0441\u0442\u043e\u0439\u0447\u0438\u0432 \u043a \u043f\u0435\u0440\u0435\u043f\u0430\u0434\u0430\u043c \u0442\u0435\u043c\u043f\u0435\u0440\u0430\u0442\u0443\u0440, \u0432\u043b\u0430\u0436\u043d\u043e\u0441\u0442\u0438 \u0438 \u043d\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u043f\u043e\u043a\u0440\u0430\u0441\u043a\u0438.",',
  '    "seo.rotang.c3.d": "\u0421\u0442\u043e\u043b\u044b Taper Rotang \u0441\u043e \u0441\u0442\u043e\u043b\u0435\u0448\u043d\u0438\u0446\u0435\u0439 \u0438\u0437 \u041b\u0414\u0421\u041f \u0438 \u0434\u0435\u043a\u043e\u0440\u043e\u043c \u0438\u0437 \u0438\u0441\u043a\u0443\u0441\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0433\u043e \u0440\u043e\u0442\u0430\u043d\u0433\u0430 \u043f\u043e\u0434\u0445\u043e\u0434\u044f\u0442 \u0434\u043b\u044f \u0442\u0435\u0440\u0440\u0430\u0441.",',
  '    "seo.rotang.cta.d": "\u041d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0443 BTT \u0432 Telegram - \u043f\u043e\u043c\u043e\u0436\u0435\u043c \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e, \u043f\u043e\u0434\u0431\u0435\u0440\u0451\u043c \u0446\u0432\u0435\u0442\u0430 \u0438 \u043e\u0442\u0432\u0435\u0442\u0438\u043c \u043d\u0430 \u0432\u043e\u043f\u0440\u043e\u0441\u044b.",',
  '    "seo.sadovaya.c1.d": "\u041f\u043b\u0435\u0442\u0451\u043d\u044b\u0435 \u0441\u0442\u0443\u043b\u044c\u044f Vertex \u0438 Corda \u0441 \u043c\u044f\u0433\u043a\u0438\u043c\u0438 \u043f\u043e\u0434\u0443\u0448\u043a\u0430\u043c\u0438 - \u0434\u043b\u044f \u0434\u043e\u043c\u0430, \u0432\u0435\u0440\u0430\u043d\u0434 \u0438 \u043a\u0440\u044b\u0442\u044b\u0445 \u043f\u043b\u043e\u0449\u0430\u0434\u043e\u043a.",',
  '    "seo.sadovaya.c2.d": "\u041e\u0431\u0435\u0434\u0435\u043d\u043d\u044b\u0435 \u0441\u0442\u043e\u043b\u044b Taper, Vertex \u0438 Corda \u043d\u0430 \u043c\u0435\u0442\u0430\u043b\u043b\u043e\u043a\u0430\u0440\u043a\u0430\u0441\u0435 - \u0434\u043b\u044f \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u0445 \u043f\u043b\u043e\u0449\u0430\u0434\u043e\u043a \u0438 \u0441\u0430\u0434\u043e\u0432.",',
  '    "seo.sadovaya.c3.d": "\u041f\u0440\u0430\u043a\u0442\u0438\u0447\u043d\u043e\u0435 \u0440\u0435\u0448\u0435\u043d\u0438\u0435 \u0434\u043b\u044f \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u0445 \u043f\u043b\u043e\u0449\u0430\u0434\u043e\u043a \u0441\u0430\u0434\u0430 \u0438 \u043b\u0435\u0442\u043d\u0438\u0445 \u0432\u0435\u0440\u0430\u043d\u0434.",',
  '    "seo.sadovaya.cta.d": "\u0421\u043c\u043e\u0442\u0440\u0438\u0442\u0435 \u0430\u043a\u0442\u0443\u0430\u043b\u044c\u043d\u044b\u0435 \u043c\u043e\u0434\u0435\u043b\u0438 \u0432 \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u0435 \u0438\u043b\u0438 \u0441\u0432\u044f\u0436\u0438\u0442\u0435\u0441\u044c \u0441 \u043d\u0430\u043c\u0438 \u0432 Telegram \u0434\u043b\u044f \u043a\u043e\u043d\u0441\u0443\u043b\u044c\u0442\u0430\u0446\u0438\u0438.",',
];

// Insert after seo.sadovaya.cta.tg in RU (which is at the end of the RU seo block)
const ruSeoTgIdx = lines.findIndex((l, i) => i < 700 && l.includes('"seo.sadovaya.cta.tg"'));
if (ruSeoTgIdx === -1) { console.error('seo.sadovaya.cta.tg RU not found'); process.exit(1); }
lines.splice(ruSeoTgIdx + 1, 0, ...newRU2);
console.log(`RU: inserted ${newRU2.length} more seo desc/list keys`);

// UZ equivalents
const newUZ2 = [
  '    "seo.rotang.badge": "Jo\'natishdan oldin sifat nazorati",',
  '    "seo.rotang.c1.d": "Vertex va Corda stullari to\'qilgan sun\'iy rotan va yumshoq yostiqchalar bilan mustahkam metall ramkani birlashtiradi.",',
  '    "seo.rotang.c1.l1x": "Vertex stuli - o\'rilgan sun\'iy rotan, krem rangi.",',
  '    "seo.rotang.c1.l2x": "Corda stuli - metall ramkada nafis to\'qima.",',
  '    "seo.rotang.c1.l3x": "Har bir stul bilan birga yumshoq to\'qimali yostiqchalar.",',
  '    "seo.rotang.c2.d": "Sun\'iy rotan qurimaydi, harorat, namlik o\'zgarishlariga chidamli va bo\'yash talab etmaydi.",',
  '    "seo.rotang.c3.d": "LDSP stoleshnitsa va sun\'iy rotan bezagi bilan Taper Rotang stollari terrasalar uchun mos.",',
  '    "seo.rotang.cta.d": "BTT menejeriga Telegram orqali yozing - miqdorni hisoblaymiz, ranglarni tanlaymiz va savollarga javob beramiz.",',
  '    "seo.sadovaya.c1.d": "Yumshoq yostiqchali Vertex va Corda to\'qilgan stullar - uy, veranda va yopiq maydonlar uchun.",',
  '    "seo.sadovaya.c2.d": "Taper, Vertex va Corda ovqat xonasi stollari metall ramkada - ochiq maydonlar va bog\' uchun.",',
  '    "seo.sadovaya.c3.d": "Bog\' va yozgi verandalar ochiq maydonlari uchun amaliy yechim.",',
  '    "seo.sadovaya.cta.d": "Katalogda dolzarb modellarni ko\'ring yoki maslahat uchun Telegram orqali biz bilan bog\'laning.",',
];
const uzSeoTgIdx = lines.findIndex((l, i) => i > 1100 && l.includes('"seo.sadovaya.cta.tg"'));
if (uzSeoTgIdx === -1) { console.error('seo.sadovaya.cta.tg UZ not found'); process.exit(1); }
lines.splice(uzSeoTgIdx + 1, 0, ...newUZ2);
console.log(`UZ: inserted ${newUZ2.length} more seo keys`);

// EN equivalents
const newEN2 = [
  '    "seo.rotang.badge": "Quality check before dispatch",',
  '    "seo.rotang.c1.d": "Vertex and Corda chairs combine a sturdy metal frame with woven artificial rattan and soft cushions.",',
  '    "seo.rotang.c1.l1x": "Vertex chair - twisted artificial rattan, beige colour.",',
  '    "seo.rotang.c1.l2x": "Corda chair - elegant weave on a metal frame.",',
  '    "seo.rotang.c1.l3x": "Soft textile cushions included with every chair.",',
  '    "seo.rotang.c2.d": "Artificial rattan does not crack, resists temperature swings, moisture and requires no painting.",',
  '    "seo.rotang.c3.d": "Taper Rotang tables with MDF top and artificial rattan trim are perfect for terraces.",',
  '    "seo.rotang.cta.d": "Message BTT manager on Telegram - we will calculate quantities, choose colours and answer all your questions.",',
  '    "seo.sadovaya.c1.d": "Vertex and Corda wicker chairs with soft cushions - for homes, verandas and covered spaces.",',
  '    "seo.sadovaya.c2.d": "Taper, Vertex and Corda dining tables on metal frames - for open spaces and gardens.",',
  '    "seo.sadovaya.c3.d": "A practical choice for garden open spaces and summer verandas.",',
  '    "seo.sadovaya.cta.d": "Browse current models in the catalogue or contact us on Telegram for consultation.",',
];
const enSeoTgIdx = lines.findIndex((l, i) => i > 1900 && l.includes('"seo.sadovaya.cta.tg"'));
if (enSeoTgIdx === -1) { console.error('seo.sadovaya.cta.tg EN not found'); process.exit(1); }
lines.splice(enSeoTgIdx + 1, 0, ...newEN2);
console.log(`EN: inserted ${newEN2.length} more seo keys`);

writeFileSync(i18nFile, lines.join('\n'), 'utf8');
console.log('i18n.js saved');

// === Now patch <p> desc and <li> items in the HTML files ===
function patchHtml2(file, replacements) {
  let html = readFileSync(file, 'utf8');
  let count = 0;
  for (const [from, to] of replacements) {
    if (html.includes(from)) { html = html.replace(from, to); count++; }
    else console.warn(`  MISS in ${file}: ...${from.slice(0, 50)}...`);
  }
  writeFileSync(file, html, 'utf8');
  console.log(`${file}: ${count}/${replacements.length} applied`);
}

// rotang-tashkent.html remaining
patchHtml2('rotang-tashkent.html', [
  // card 1 desc - use partial match since text was truncated in audit
  [' style="line-height:1.65">\u0421\u0442\u0443\u043b\u044c\u044f Vertex',
   ' style="line-height:1.65" data-i18n="seo.rotang.c1.d">\u0421\u0442\u0443\u043b\u044c\u044f Vertex'],
  ['<li>\u0421\u0442\u0443\u043b Vertex (499\u00a0000 \u0441\u0443\u043c)',
   '<li data-i18n="seo.rotang.c1.l1x">\u0421\u0442\u0443\u043b Vertex (499\u00a0000 \u0441\u0443\u043c)'],
  ['<li>\u0421\u0442\u0443\u043b Corda (499\u00a0000 \u0441\u0443\u043c)',
   '<li data-i18n="seo.rotang.c1.l2x">\u0421\u0442\u0443\u043b Corda (499\u00a0000 \u0441\u0443\u043c)'],
  ['<li>\u041c\u044f\u0433\u043a\u0438\u0435 \u0442\u0435\u043a\u0441\u0442\u0438\u043b\u044c\u043d\u044b\u0435 \u043f\u043e\u0434\u0443\u0448\u043a\u0438 \u0432 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442\u0435 \u0441 \u043a\u0430\u0436\u0434\u044b\u043c \u0441\u0442\u0443\u043b\u043e\u043c',
   '<li data-i18n="seo.rotang.c1.l3x">\u041c\u044f\u0433\u043a\u0438\u0435 \u0442\u0435\u043a\u0441\u0442\u0438\u043b\u044c\u043d\u044b\u0435 \u043f\u043e\u0434\u0443\u0448\u043a\u0438 \u0432 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442\u0435 \u0441 \u043a\u0430\u0436\u0434\u044b\u043c \u0441\u0442\u0443\u043b\u043e\u043c'],
  // card 2 desc
  [' style="line-height:1.65">\u0418\u0441\u043a\u0443\u0441\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439 \u0440\u043e\u0442\u0430\u043d\u0433',
   ' style="line-height:1.65" data-i18n="seo.rotang.c2.d">\u0418\u0441\u043a\u0443\u0441\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439 \u0440\u043e\u0442\u0430\u043d\u0433'],
  ['<li>\u041f\u0440\u043e\u0447\u043d\u044b\u0439 \u043f\u043e\u043b\u0438\u043c\u0435\u0440 \u0432\u044b\u0441\u043e\u043a\u043e\u0439 \u043f\u043b\u043e\u0442\u043d\u043e\u0441\u0442\u0438',
   '<li data-i18n="seo.rotang.c2.l1">\u041f\u0440\u043e\u0447\u043d\u044b\u0439 \u043f\u043e\u043b\u0438\u043c\u0435\u0440 \u0432\u044b\u0441\u043e\u043a\u043e\u0439 \u043f\u043b\u043e\u0442\u043d\u043e\u0441\u0442\u0438'],
  ['<li>\u041b\u0451\u0433\u043a\u0438\u0439 \u0443\u0445\u043e\u0434 \u0441 \u043f\u043e\u043c\u043e\u0449\u044c\u044e \u0432\u043b\u0430\u0436\u043d\u043e\u0439 \u0441\u0430\u043b\u0444\u0435\u0442\u043a\u0438',
   '<li data-i18n="seo.rotang.c2.l2">\u041b\u0451\u0433\u043a\u0438\u0439 \u0443\u0445\u043e\u0434 \u0441 \u043f\u043e\u043c\u043e\u0449\u044c\u044e \u0432\u043b\u0430\u0436\u043d\u043e\u0439 \u0441\u0430\u043b\u0444\u0435\u0442\u043a\u0438'],
  ['<li>\u0418\u0434\u0435\u0430\u043b\u044c\u043d\u043e \u0434\u043b\u044f \u0432\u0435\u0440\u0430\u043d\u0434',
   '<li data-i18n="seo.rotang.c2.l3">\u0418\u0434\u0435\u0430\u043b\u044c\u043d\u043e \u0434\u043b\u044f \u0432\u0435\u0440\u0430\u043d\u0434'],
  // card 3 desc
  [' style="line-height:1.65">\u0421\u0442\u043e\u043b\u044b Taper Rotang',
   ' style="line-height:1.65" data-i18n="seo.rotang.c3.d">\u0421\u0442\u043e\u043b\u044b Taper Rotang'],
  ['<li>\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u0442\u0441\u044f \u0437\u0430\u0449\u0438\u0442\u0430 \u041b\u0414\u0421\u041f \u043e\u0442 \u043f\u0440\u044f\u043c\u043e\u0433\u043e',
   '<li data-i18n="seo.rotang.c3.l1">\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u0442\u0441\u044f \u0437\u0430\u0449\u0438\u0442\u0430 \u041b\u0414\u0421\u041f \u043e\u0442 \u043f\u0440\u044f\u043c\u043e\u0433\u043e'],
  // CTA text
  ['<p class="help-cta-text">\u041d\u0430\u043f\u0438\u0448\u0438\u0442\u0435',
   '<p class="help-cta-text" data-i18n="seo.rotang.cta.d">\u041d\u0430\u043f\u0438\u0448\u0438\u0442\u0435'],
]);

// sadovaya-mebel-rotang.html remaining
patchHtml2('sadovaya-mebel-rotang.html', [
  // badge
  ['<span>\u041a\u043e\u043d\u0442\u0440\u043e\u043b\u044c \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u0430 \u043f\u0435\u0440\u0435\u0434 \u043e\u0442\u0433\u0440\u0443\u0437\u043a\u043e\u0439</span>',
   '<span data-i18n="seo.sadovaya.badge">\u041a\u043e\u043d\u0442\u0440\u043e\u043b\u044c \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u0430 \u043f\u0435\u0440\u0435\u0434 \u043e\u0442\u0433\u0440\u0443\u0437\u043a\u043e\u0439</span>'],
  // card 1 desc
  [' style="line-height:1.65">\u041f\u043b\u0435\u0442\u0451\u043d\u044b\u0435 \u0441\u0442\u0443\u043b\u044c\u044f Vertex',
   ' style="line-height:1.65" data-i18n="seo.sadovaya.c1.d">\u041f\u043b\u0435\u0442\u0451\u043d\u044b\u0435 \u0441\u0442\u0443\u043b\u044c\u044f Vertex'],
  ['<li>\u041c\u0435\u0442\u0430\u043b\u043b\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u043a\u0430\u0440\u043a\u0430\u0441 \u0441 \u0437\u0430\u0449\u0438\u0442\u043d\u044b\u043c \u043f\u043e\u043a\u0440\u044b\u0442\u0438\u0435\u043c',
   '<li data-i18n="seo.sadovaya.c1.l1">\u041c\u0435\u0442\u0430\u043b\u043b\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u043a\u0430\u0440\u043a\u0430\u0441 \u0441 \u0437\u0430\u0449\u0438\u0442\u043d\u044b\u043c \u043f\u043e\u043a\u0440\u044b\u0442\u0438\u0435\u043c'],
  ['<li>\u0418\u0441\u043a\u0443\u0441\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439 \u0440\u043e\u0442\u0430\u043d\u0433, \u0443\u0441\u0442\u043e\u0439\u0447\u0438\u0432\u044b\u0439 \u043a \u0432\u043d\u0435\u0448\u043d\u0438\u043c',
   '<li data-i18n="seo.sadovaya.c1.l2">\u0418\u0441\u043a\u0443\u0441\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439 \u0440\u043e\u0442\u0430\u043d\u0433, \u0443\u0441\u0442\u043e\u0439\u0447\u0438\u0432\u044b\u0439 \u043a \u0432\u043d\u0435\u0448\u043d\u0438\u043c'],
  ['<li>\u041c\u044f\u0433\u043a\u0438\u0435 \u0442\u0435\u043a\u0441\u0442\u0438\u043b\u044c\u043d\u044b\u0435 \u043f\u043e\u0434\u0443\u0448\u043a\u0438 \u0432 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442\u0435.<',
   '<li data-i18n="seo.sadovaya.c1.l3">\u041c\u044f\u0433\u043a\u0438\u0435 \u0442\u0435\u043a\u0441\u0442\u0438\u043b\u044c\u043d\u044b\u0435 \u043f\u043e\u0434\u0443\u0448\u043a\u0438 \u0432 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442\u0435.<'],
  // card 2 desc
  [' style="line-height:1.65">\u041e\u0431\u0435\u0434\u0435\u043d\u043d\u044b\u0435 \u0441\u0442\u043e\u043b\u044b Taper',
   ' style="line-height:1.65" data-i18n="seo.sadovaya.c2.d">\u041e\u0431\u0435\u0434\u0435\u043d\u043d\u044b\u0435 \u0441\u0442\u043e\u043b\u044b Taper'],
  ['<li>\u0420\u0430\u0437\u043c\u0435\u0440\u044b: 80\u00d780 \u0441\u043c',
   '<li data-i18n="seo.sadovaya.c2.l1">\u0420\u0430\u0437\u043c\u0435\u0440\u044b: 80\u00d780 \u0441\u043c'],
  ['<li>\u0423\u0441\u0442\u043e\u0439\u0447\u0438\u0432\u0430\u044f \u043c\u0435\u0442\u0430\u043b\u043b\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u043e\u043f\u043e\u0440\u0430',
   '<li data-i18n="seo.sadovaya.c2.l2">\u0423\u0441\u0442\u043e\u0439\u0447\u0438\u0432\u0430\u044f \u043c\u0435\u0442\u0430\u043b\u043b\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u043e\u043f\u043e\u0440\u0430'],
  ['<li>\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u0442\u0441\u044f \u0437\u0430\u0449\u0438\u0442\u0430 \u0441\u0442\u043e\u043b\u0435\u0448\u043d\u0438\u0446\u044b',
   '<li data-i18n="seo.sadovaya.c2.l3">\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u0442\u0441\u044f \u0437\u0430\u0449\u0438\u0442\u0430 \u0441\u0442\u043e\u043b\u0435\u0448\u043d\u0438\u0446\u044b'],
  // card 3 desc
  [' style="line-height:1.65">\u041f\u0440\u0430\u043a\u0442\u0438\u0447\u043d\u043e\u0435 \u0440\u0435\u0448\u0435\u043d\u0438\u0435',
   ' style="line-height:1.65" data-i18n="seo.sadovaya.c3.d">\u041f\u0440\u0430\u043a\u0442\u0438\u0447\u043d\u043e\u0435 \u0440\u0435\u0448\u0435\u043d\u0438\u0435'],
  ['<li>\u041f\u0440\u0430\u043a\u0442\u0438\u0447\u043d\u0430\u044f \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f',
   '<li data-i18n="seo.sadovaya.c3.l1">\u041f\u0440\u0430\u043a\u0442\u0438\u0447\u043d\u0430\u044f \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f'],
  ['<li>\u041b\u0435\u0433\u043a\u043e \u043c\u043e\u044e\u0442\u0441\u044f',
   '<li data-i18n="seo.sadovaya.c3.l2">\u041b\u0435\u0433\u043a\u043e \u043c\u043e\u044e\u0442\u0441\u044f'],
  ['<li>\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d\u043d\u044b\u0435 \u0446\u0432\u0435\u0442\u0430',
   '<li data-i18n="seo.sadovaya.c3.l3">\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d\u043d\u044b\u0435 \u0446\u0432\u0435\u0442\u0430'],
  // CTA text
  ['<p class="help-cta-text">\u0421\u043c\u043e\u0442\u0440\u0438\u0442\u0435',
   '<p class="help-cta-text" data-i18n="seo.sadovaya.cta.d">\u0421\u043c\u043e\u0442\u0440\u0438\u0442\u0435'],
  // Also patch sub titles
  ['<p class="help-top-sub">\u041f\u0440\u0430\u043a\u0442\u0438\u0447\u043d\u044b\u0435',
   '<p class="help-top-sub" data-i18n="seo.sadovaya.sub">\u041f\u0440\u0430\u043a\u0442\u0438\u0447\u043d\u044b\u0435'],
]);

// rotang sub also
let rotHtml = readFileSync('rotang-tashkent.html', 'utf8');
rotHtml = rotHtml.replace(
  '<p class="help-top-sub">\u0421\u0442\u0438\u043b\u044c\u043d\u044b\u0435',
  '<p class="help-top-sub" data-i18n="seo.rotang.sub">\u0421\u0442\u0438\u043b\u044c\u043d\u044b\u0435'
);
writeFileSync('rotang-tashkent.html', rotHtml, 'utf8');
console.log('rotang sub patched');
