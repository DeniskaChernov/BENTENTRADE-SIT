import { readFileSync, writeFileSync } from 'fs';

const file = new URL('../assets/i18n.js', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const content = readFileSync(file, 'utf8');
const lines = content.split('\n');

// ------------- UZ section -------------
const uzHoursVIdx = lines.findIndex((l, i) => i > 800 && l.includes('"co.i.hours.v"') && l.includes('Har kuni'));
if (uzHoursVIdx === -1) { console.error('UZ hours.v not found'); process.exit(1); }

// Fix the hours value
lines[uzHoursVIdx] = '    "co.i.hours.v": "Du-Sha, 10:00 - 20:00",';

const newKeysUZ = [
  '    "co.form.title": "Maslahat uchun ariza qoldirish",',
  '    "co.form.sub": "Qiziqtirgan toifani belgilang yoki savol qoldiring - menejer siz bilan boglanib batafsil maslahat beradi.",',
  '    "co.topics.label": "Qiziqtirgan toifa:",',
  '    "co.chip.wicker": "Toqilgan stullar",',
  '    "co.chip.plastic": "Plastik stullar",',
  '    "co.chip.soft": "Yumshoq stullar",',
  '    "co.chip.tables": "Ovqat xonasi stollari",',
  '    "co.chip.horeca": "Ulgurji buyurtma (HoReCa)",',
  '    "co.badge": "Du-Sha 10:00-20:00 - Toshkent",',
  '    "co.privacy": "Kontaktlaringiz maxfiy va faqat buyurtma boyicha muloqot uchun ishlatiladi.",',
  '    "co.i.addr.sub": "Ombor va ofis (oldindan kelishgan holda)",',
  '    "co.i.phone.note": "Du-Sha, 10:00 - 20:00",',
  '    "co.i.phone.action": "Qongiroq qilish",',
  '    "co.i.telegram.note": "Maslahat va tezkor buyurtma",',
  '    "co.i.telegram.action": "Dialog ochish",',
  '    "co.i.hours.sub": "Yakshanba - onlayn arizalarni qabul qilish",',
  '    "co.i.email.sub": "Tijorat takliflari va HoReCa uchun",',
  '    "co.delivery.label": "Yetkazib berish va ozingiz olib ketish",',
  '    "co.delivery.geo": "Toshkent va Ozbekiston viloyatlari",',
  '    "co.delivery.desc": "Toshkent boyicha Yandex / Labo / Porter xizmatlarida tashuvchi tarifi boyicha yetkazib beramiz.",',
  '    "co.i.addr.action": "Tafsilotlarni aniqlash",',
  '    "pdp.inquiry.h": "Model yoki buyurtma boyicha savollar?",',
  '    "pdp.inquiry.p": "Biz bilan boglaning - mavjudligini, mavjud ranglarni aniqlaymiz va tez yetkazib berishni rasmiylashtiring.",',
];

lines.splice(uzHoursVIdx + 1, 0, ...newKeysUZ);
console.log(`UZ: inserted ${newKeysUZ.length} keys after line ${uzHoursVIdx + 1}`);

// Reload fresh after UZ insert to find EN section
const content2 = lines.join('\n');
const lines2 = content2.split('\n');

// ------------- EN section -------------
const enHoursVIdx = lines2.findIndex((l, i) => i > 1350 && l.includes('"co.i.hours.v"') && l.includes('Daily'));
if (enHoursVIdx === -1) { console.error('EN hours.v not found'); process.exit(1); }

// Fix hours value for EN too
lines2[enHoursVIdx] = '    "co.i.hours.v": "Mon-Sat, 10:00 - 20:00",';

const newKeysEN = [
  '    "co.form.title": "Leave a consultation request",',
  '    "co.form.sub": "Select the category you are interested in or leave a question - our manager will contact you with full details.",',
  '    "co.topics.label": "Category of interest:",',
  '    "co.chip.wicker": "Wicker chairs",',
  '    "co.chip.plastic": "Plastic chairs",',
  '    "co.chip.soft": "Upholstered chairs",',
  '    "co.chip.tables": "Dining tables",',
  '    "co.chip.horeca": "Wholesale order (HoReCa)",',
  '    "co.badge": "Mon-Sat 10:00-20:00 - Tashkent",',
  '    "co.privacy": "Your contact details are confidential and used only to respond to your order.",',
  '    "co.i.addr.sub": "Warehouse and office (by appointment)",',
  '    "co.i.phone.note": "Mon-Sat, 10:00 - 20:00",',
  '    "co.i.phone.action": "Call now",',
  '    "co.i.telegram.note": "Consultation and quick orders",',
  '    "co.i.telegram.action": "Open chat",',
  '    "co.i.hours.sub": "Sunday - online request intake only",',
  '    "co.i.email.sub": "For commercial offers and HoReCa",',
  '    "co.delivery.label": "Delivery and pickup",',
  '    "co.delivery.geo": "Tashkent and Uzbekistan regions",',
  '    "co.delivery.desc": "In Tashkent we deliver via Yandex / Labo / Porter at direct carrier rates. Self-pickup from warehouse by appointment.",',
  '    "co.i.addr.action": "Clarify details",',
  '    "pdp.inquiry.h": "Questions about the model or order?",',
  '    "pdp.inquiry.p": "Contact us - we will confirm availability, colors and arrange fast delivery.",',
];

lines2.splice(enHoursVIdx + 1, 0, ...newKeysEN);
console.log(`EN: inserted ${newKeysEN.length} keys after line ${enHoursVIdx + 1}`);

writeFileSync(file, lines2.join('\n'), 'utf8');
console.log('Done. File saved.');
