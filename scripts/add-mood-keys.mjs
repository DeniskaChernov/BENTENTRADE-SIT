// Script to add missing mood.* and final.* i18n keys to all 3 languages
// and add the i18n attributes to index.html

import { readFileSync, writeFileSync } from 'fs';

// === 1. Add i18n keys to i18n.js ===
const i18nFile = 'assets/i18n.js';
let i18n = readFileSync(i18nFile, 'utf8');
const i18nLines = i18n.split('\n');

// Find RU final.cta2 line (to insert mood keys after it)
const ruCta2Idx = i18nLines.findIndex((l, i) => i < 100 && l.includes('"final.cta2"'));
if (ruCta2Idx === -1) { console.error('RU final.cta2 not found'); process.exit(1); }

const newRU = [
  '    "mood.quote": "Подбираем модели для частных домов, дач, квартир и кафе. Мебель устойчива к повседневным нагрузкам, легко очищается и долго сохраняет опрятный вид.",',
  '    "mood.tile1.loc": "Терраса",',
  '    "mood.tile1.title": "Обеденные столы",',
  '    "mood.tile2.loc": "Сад",',
  '    "mood.tile2.title": "Плетёные стулья",',
  '    "mood.tile3.loc": "Веранда",',
  '    "mood.tile3.title": "Пластиковые стулья",',
  '    "mood.tile4.loc": "Кафе / HoReCa",',
  '    "mood.tile4.title": "Столы и стулья",',
  '    "mood.tile5.loc": "Гостиная",',
  '    "mood.tile5.title": "Мягкие стулья",',
  '    "final.title.main": "Столы и стулья",',
  '    "final.title.em": "для вашего комфорта",',
  '    "final.desc2": "Готовые мебельные решения для дома, дачи и коммерческих пространств. Поможем с комплектацией и доставим по Ташкенту.",',
  '    "final.perk1": "Прочные материалы",',
  '    "final.perk2": "Честные цены в UZS",',
  '    "final.perk3": "Доставка по Ташкенту",',
  '    "final.tg": "Написать в Telegram",',
];

i18nLines.splice(ruCta2Idx + 1, 0, ...newRU);
console.log(`RU: inserted ${newRU.length} mood/final keys after line ${ruCta2Idx + 1}`);

// Now find UZ final.cta2 (shifted by newRU.length)
const uzCta2Idx = i18nLines.findIndex((l, i) => i > 500 && l.includes('"final.cta2"'));
if (uzCta2Idx === -1) { console.error('UZ final.cta2 not found'); process.exit(1); }

const newUZ = [
  '    "mood.quote": "Shaxsiy uylar, dachalar, kvartiralar va kafe uchun modellarni tanlaymiz. Mebel kundalik yuklarga chidamli, osonlik bilan tozalanadi va uzoq vaqt tartibli ko\u2018rinishni saqlaydi.",',
  '    "mood.tile1.loc": "Ayvon",',
  '    "mood.tile1.title": "Ovqat xonasi stollari",',
  '    "mood.tile2.loc": "Bog\u2018",',
  '    "mood.tile2.title": "To\u2018qilgan stullar",',
  '    "mood.tile3.loc": "Veranda",',
  '    "mood.tile3.title": "Plastik stullar",',
  '    "mood.tile4.loc": "Kafe / HoReCa",',
  '    "mood.tile4.title": "Stollar va stullar",',
  '    "mood.tile5.loc": "Mehmonxona",',
  '    "mood.tile5.title": "Yumshoq stullar",',
  '    "final.title.main": "Stollar va stullar",',
  '    "final.title.em": "sizning qulayligingiz uchun",',
  '    "final.desc2": "Uy, dacha va tijorat maydonlari uchun tayyor mebel yechimlari. Komplektatsiyada yordam beramiz va Toshkent bo\u2018ylab yetkazib beramiz.",',
  '    "final.perk1": "Mustahkam materiallar",',
  '    "final.perk2": "UZS da halol narxlar",',
  '    "final.perk3": "Toshkent bo\u2018ylab yetkazib berish",',
  '    "final.tg": "Telegram orqali yozish",',
];

i18nLines.splice(uzCta2Idx + 1, 0, ...newUZ);
console.log(`UZ: inserted ${newUZ.length} mood/final keys after line ${uzCta2Idx + 1}`);

// Now find EN final.cta2
const enCta2Idx = i18nLines.findIndex((l, i) => i > 1000 && l.includes('"final.cta2"'));
if (enCta2Idx === -1) { console.error('EN final.cta2 not found'); process.exit(1); }

const newEN = [
  '    "mood.quote": "We help you select furniture for private homes, dachas, apartments and cafes. Built to handle everyday use, easy to clean and long-lasting.",',
  '    "mood.tile1.loc": "Terrace",',
  '    "mood.tile1.title": "Dining tables",',
  '    "mood.tile2.loc": "Garden",',
  '    "mood.tile2.title": "Wicker chairs",',
  '    "mood.tile3.loc": "Veranda",',
  '    "mood.tile3.title": "Plastic chairs",',
  '    "mood.tile4.loc": "Cafe / HoReCa",',
  '    "mood.tile4.title": "Tables and chairs",',
  '    "mood.tile5.loc": "Living room",',
  '    "mood.tile5.title": "Upholstered chairs",',
  '    "final.title.main": "Tables and chairs",',
  '    "final.title.em": "for your comfort",',
  '    "final.desc2": "Ready-made furniture solutions for homes, country houses and commercial spaces. We help with selection and deliver across Tashkent.",',
  '    "final.perk1": "Durable materials",',
  '    "final.perk2": "Honest prices in UZS",',
  '    "final.perk3": "Delivery across Tashkent",',
  '    "final.tg": "Message us on Telegram",',
];

i18nLines.splice(enCta2Idx + 1, 0, ...newEN);
console.log(`EN: inserted ${newEN.length} mood/final keys after line ${enCta2Idx + 1}`);

writeFileSync(i18nFile, i18nLines.join('\n'), 'utf8');
console.log('i18n.js updated successfully');
