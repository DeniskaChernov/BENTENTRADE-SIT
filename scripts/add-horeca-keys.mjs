// Patch horeca.html product cards and contact section i18n
import { readFileSync, writeFileSync } from 'fs';

const i18nFile = 'assets/i18n.js';
let lines = readFileSync(i18nFile, 'utf8').split('\n');

// Find RU hrc.contact.card.sub (last hrc key in RU section)
const ruHrcIdx = lines.findIndex((l, i) => i < 700 && l.includes('"hrc.contact.card.sub"'));
if (ruHrcIdx === -1) { console.error('RU hrc.contact.card.sub not found'); process.exit(1); }

const newRUHrc = [
  '    "hrc.prod.badge1": "\u041f\u043b\u0435\u0442\u0451\u043d\u044b\u0439 \u0440\u043e\u0442\u0430\u043d\u0433",',
  '    "hrc.prod.badge2": "\u041f\u043b\u0435\u0442\u0435\u043d\u0438\u0435 Corda",',
  '    "hrc.prod.badge3": "\u0414\u043b\u044f \u0442\u0435\u0440\u0440\u0430\u0441",',
  '    "hrc.prod.badge4": "\u0428\u0442\u0430\u0431\u0435\u043b\u0438\u0440\u0443\u0435\u043c\u044b\u0439",',
  '    "hrc.prod.badge5": "\u041a\u043e\u043c\u043f\u0430\u043a\u0442\u043d\u044b\u0439",',
  '    "hrc.prod.badge6": "\u041a\u0440\u0443\u0433\u043b\u044b\u0439 \u00d890",',
  '    "hrc.prod.badge7": "\u041a\u0432\u0430\u0434\u0440\u0430\u0442\u043d\u044b\u0439 80\u00d780",',
  '    "hrc.prod.badge8": "\u041f\u0440\u044f\u043c\u043e\u0443\u0433\u043e\u043b\u044c\u043d\u044b\u0439 135\u00d780",',
  '    "hrc.contact.note": "\u0412\u0438\u0437\u0438\u0442\u044b \u043f\u043e \u043f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0439 \u0434\u043e\u0433\u043e\u0432\u043e\u0440\u0451\u043d\u043d\u043e\u0441\u0442\u0438",',
  '    "hrc.contact.tg": "\u041d\u0430\u043f\u0438\u0441\u0430\u0442\u044c \u0432 Telegram @btt_uz",',
];
lines.splice(ruHrcIdx + 1, 0, ...newRUHrc);
console.log(`RU: inserted ${newRUHrc.length} hrc keys after line ${ruHrcIdx + 1}`);

// UZ
const uzHrcIdx = lines.findIndex((l, i) => i > 700 && l.includes('"hrc.contact.card.sub"'));
if (uzHrcIdx === -1) { console.error('UZ hrc.contact.card.sub not found'); process.exit(1); }

const newUZHrc = [
  '    "hrc.prod.badge1": "To\'qilgan rotan",',
  '    "hrc.prod.badge2": "Corda to\'qimasi",',
  '    "hrc.prod.badge3": "Terrasalar uchun",',
  '    "hrc.prod.badge4": "Uyumli",',
  '    "hrc.prod.badge5": "Kompakt",',
  '    "hrc.prod.badge6": "Dumaloq \u00d890",',
  '    "hrc.prod.badge7": "Kvadrat 80\u00d780",',
  '    "hrc.prod.badge8": "To\'g\'riburchak 135\u00d780",',
  '    "hrc.contact.note": "Tashriflar oldindan kelishilgan holda",',
  '    "hrc.contact.tg": "Telegram orqali yozish @btt_uz",',
];
lines.splice(uzHrcIdx + 1, 0, ...newUZHrc);
console.log(`UZ: inserted ${newUZHrc.length} hrc keys`);

// EN
const enHrcIdx = lines.findIndex((l, i) => i > 1500 && l.includes('"hrc.contact.card.sub"'));
if (enHrcIdx === -1) { console.error('EN hrc.contact.card.sub not found'); process.exit(1); }

const newENHrc = [
  '    "hrc.prod.badge1": "Wicker rattan",',
  '    "hrc.prod.badge2": "Corda weave",',
  '    "hrc.prod.badge3": "For terraces",',
  '    "hrc.prod.badge4": "Stackable",',
  '    "hrc.prod.badge5": "Compact",',
  '    "hrc.prod.badge6": "Round \u00d890",',
  '    "hrc.prod.badge7": "Square 80\u00d780",',
  '    "hrc.prod.badge8": "Rectangular 135\u00d780",',
  '    "hrc.contact.note": "Visits by prior arrangement",',
  '    "hrc.contact.tg": "Message on Telegram @btt_uz",',
];
lines.splice(enHrcIdx + 1, 0, ...newENHrc);
console.log(`EN: inserted ${newENHrc.length} hrc keys`);

writeFileSync(i18nFile, lines.join('\n'), 'utf8');
console.log('i18n.js saved');

// === Patch horeca.html ===
let html = readFileSync('horeca.html', 'utf8');

html = html.replace('<span class="horeca-prod-badge">П\u043bет\u0451ный ротанг</span>', '<span class="horeca-prod-badge" data-i18n="hrc.prod.badge1">П\u043bет\u0451ный ротанг</span>');
html = html.replace('<span class="horeca-prod-badge">Плетение Corda</span>', '<span class="horeca-prod-badge" data-i18n="hrc.prod.badge2">Плетение Corda</span>');
html = html.replace('<span class="horeca-prod-badge">Для террас</span>', '<span class="horeca-prod-badge" data-i18n="hrc.prod.badge3">Для террас</span>');
html = html.replace('<span class="horeca-prod-badge">Штабелируемый</span>', '<span class="horeca-prod-badge" data-i18n="hrc.prod.badge4">Штабелируемый</span>');
html = html.replace('<span class="horeca-prod-badge">Компактный</span>', '<span class="horeca-prod-badge" data-i18n="hrc.prod.badge5">Компактный</span>');
html = html.replace('<span class="horeca-prod-badge">Круглый Ø90</span>', '<span class="horeca-prod-badge" data-i18n="hrc.prod.badge6">Круглый Ø90</span>');
html = html.replace('<span class="horeca-prod-badge">Квадратный 80×80</span>', '<span class="horeca-prod-badge" data-i18n="hrc.prod.badge7">Квадратный 80×80</span>');
html = html.replace('<span class="horeca-prod-badge">Прямоугольный 135×80</span>', '<span class="horeca-prod-badge" data-i18n="hrc.prod.badge8">Прямоугольный 135×80</span>');
html = html.replace('<span class="horeca-contact-note">Визиты по предварительной договорённости</span>', '<span class="horeca-contact-note" data-i18n="hrc.contact.note">Визиты по предварительной договорённости</span>');
html = html.replace('<span>Написать в Telegram @btt_uz</span>', '<span data-i18n="hrc.contact.tg">Написать в Telegram @btt_uz</span>');

writeFileSync('horeca.html', html, 'utf8');
console.log('horeca.html patched');
