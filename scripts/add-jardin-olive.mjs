import fs from 'fs';

const masterPath = 'data/products-master.json';
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

const jardin = master.find(p => p.slug === 'stul-jardin');
if (!jardin) {
  console.error('JARDIN not found in master data');
  process.exit(1);
}

// Check if olive already exists
if (!jardin.confirmedColors.some(c => c.id === 'olive')) {
  jardin.confirmedColors.push({
    id: 'olive',
    name: {
      ru: 'Оливковый',
      uz: 'Zaytun',
      en: 'Olive'
    },
    hex: '#768C65',
    image: 'assets/prod-chair-jardin-olive.jpg',
    images: [
      'assets/prod-chair-jardin-olive.jpg',
      'assets/prod-chair-jardin-olive-back.jpg',
      'assets/prod-chair-jardin-olive-detail-seat.jpg',
      'assets/prod-chair-jardin-olive-detail-back.jpg'
    ]
  });
  console.log('Added olive color to JARDIN confirmedColors');
}

const newImgs = [
  'assets/prod-chair-jardin-olive.jpg',
  'assets/prod-chair-jardin-olive-back.jpg',
  'assets/prod-chair-jardin-olive-detail-seat.jpg',
  'assets/prod-chair-jardin-olive-detail-back.jpg'
];

newImgs.forEach(img => {
  if (!jardin.images.includes(img)) {
    jardin.images.push(img);
  }
});

// Update descriptions to mention cappuccino and olive
jardin.i18n.ru.description = 'Комфортное пластиковое кресло-стул JARDIN с широким сиденьем и подлокотниками в оттенках капучино и оливковый. Практичное решение для отдыха в саду и на веранде.';
jardin.i18n.uz.description = 'Keng o‘rindiq va tirsak suyanchig‘iga ega JARDIN plastik kreslo-stuli kapuchino va zaytun ranglarida. Bog‘ va ayvonda hordiq chiqarish uchun qulay yechim.';
jardin.i18n.en.description = 'Comfortable JARDIN plastic armchair featuring wide seating and integrated armrests in cappuccino and olive finishes. Practical choice for garden relaxation and patio dining.';

fs.writeFileSync(masterPath, JSON.stringify(master, null, 2) + '\n', 'utf8');
console.log('Saved data/products-master.json');

// Patch catalog.html
let catHtml = fs.readFileSync('catalog.html', 'utf8');

// Update data-colors for JARDIN
catHtml = catHtml.replace(
  'data-slug="stul-jardin" data-id="p6" data-cat="plastic-chairs" data-price="324000" data-colors="cappuccino"',
  'data-slug="stul-jardin" data-id="p6" data-cat="plastic-chairs" data-price="324000" data-colors="cappuccino olive"'
);

// Update swatches for JARDIN
const oldSwatches = `<div class="product-swatches" aria-label="Подтверждённые цвета">
            <button type="button" class="product-swatch is-active" style="--swatch-color:#A88D73" data-color="cappuccino" data-img="assets/prod-chair-jardin.jpg" title="Капучино" aria-label="Капучино"></button>
          </div>`;

const newSwatches = `<div class="product-swatches" aria-label="Подтверждённые цвета">
            <button type="button" class="product-swatch is-active" style="--swatch-color:#A88D73" data-color="cappuccino" data-img="assets/prod-chair-jardin.jpg" title="Капучино" aria-label="Капучино"></button>
            <button type="button" class="product-swatch" style="--swatch-color:#768C65" data-color="olive" data-img="assets/prod-chair-jardin-olive.jpg" title="Оливковый" aria-label="Оливковый"></button>
          </div>`;

if (catHtml.includes(oldSwatches)) {
  catHtml = catHtml.replace(oldSwatches, newSwatches);
  console.log('Patched JARDIN swatches in catalog.html');
} else {
  console.warn('Could not find exact old swatches block in catalog.html');
}

fs.writeFileSync('catalog.html', catHtml, 'utf8');

// Update faq.a4 in assets/i18n.js and faq.html
let i18nJs = fs.readFileSync('assets/i18n.js', 'utf8');
i18nJs = i18nJs.replaceAll(
  'NOERO и JARDIN - капучино',
  'NOERO - капучино, синий, оранжевый и оливковый, JARDIN - капучино и оливковый'
);
i18nJs = i18nJs.replaceAll(
  'NOERO va JARDIN - kapuchino',
  'NOERO - kapuchino, ko‘k, to‘q sariq va zaytun, JARDIN - kapuchino va zaytun'
);
i18nJs = i18nJs.replaceAll(
  'NOERO and JARDIN - cappuccino',
  'NOERO - cappuccino, blue, orange and olive, JARDIN - cappuccino and olive'
);
fs.writeFileSync('assets/i18n.js', i18nJs, 'utf8');
console.log('Updated faq.a4 in assets/i18n.js');

let faqHtml = fs.readFileSync('faq.html', 'utf8');
faqHtml = faqHtml.replace(
  'NOERO и JARDIN - капучино',
  'NOERO - капучино, синий, оранжевый и оливковый, JARDIN - капучино и оливковый'
);
fs.writeFileSync('faq.html', faqHtml, 'utf8');
console.log('Updated faq.html');

console.log('Done!');
