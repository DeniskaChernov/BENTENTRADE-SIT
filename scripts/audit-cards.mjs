import fs from 'fs';

const master = JSON.parse(fs.readFileSync('data/products-master.json', 'utf8'));
const catalogHtml = fs.readFileSync('catalog.html', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

console.log('=== AUDITING CATALOG.HTML CARDS ===');

const cardRegex = /<article[^>]*class="[^"]*product[^"]*"[^>]*data-slug="([^"]+)"([\s\S]*?)<\/article>/g;
let m;
const catalogCards = {};

while ((m = cardRegex.exec(catalogHtml)) !== null) {
  const slug = m[1];
  const fullTag = m[0].split('>')[0];
  const cardBody = m[2];
  
  const dataId = (fullTag.match(/data-id="([^"]+)"/) || [])[1];
  const dataPrice = (fullTag.match(/data-price="([^"]+)"/) || [])[1];
  const dataColors = (fullTag.match(/data-colors="([^"]+)"/) || [])[1];
  const dataCat = (fullTag.match(/data-cat="([^"]+)"/) || [])[1];
  const dataSize = (fullTag.match(/data-size="([^"]+)"/) || [])[1];
  
  const priceNow = (cardBody.match(/<span class="price__now">([^<]+)<\/span>/) || [])[1];
  const priceOld = (cardBody.match(/<span class="price__old">([^<]+)<\/span>/) || [])[1];
  const name = (cardBody.match(/<div class="product__name"[^>]*>([^<]+)<\/div>/) || [])[1];
  const swatches = [...cardBody.matchAll(/class="product-swatch[^"]*"[^>]*data-color="([^"]+)"/g)].map(x => x[1]);
  const img = (cardBody.match(/<img[^>]*src="([^"]+)"/) || [])[1];
  
  catalogCards[slug] = {
    slug, dataId, dataPrice, dataColors, dataCat, dataSize, priceNow, priceOld, name, swatches, img
  };
}

console.log(`Found ${Object.keys(catalogCards).length} cards in catalog.html\n`);

master.forEach((p, idx) => {
  const card = catalogCards[p.slug];
  if (!card) {
    console.log(`[MISSING CARD] SKU ${p.slug} not found in catalog.html!`);
    return;
  }
  
  const issues = [];
  
  // 1. Price comparison
  if (String(p.price) !== String(card.dataPrice)) {
    issues.push(`data-price mismatch: master=${p.price}, card=${card.dataPrice}`);
  }
  
  // 2. Price now text check
  const numPriceNow = parseInt((card.priceNow || '').replace(/[^\d]/g, ''), 10);
  if (p.price && numPriceNow && p.price !== numPriceNow) {
    issues.push(`priceNow text mismatch: master=${p.price}, displayed=${card.priceNow}`);
  }
  
  // 3. Swatches vs confirmedColors
  const masterColorIds = (p.confirmedColors || []).map(c => c.id);
  if (masterColorIds.length > 0) {
    if (card.swatches.length === 0) {
      issues.push(`Swatches missing in card! Master has: [${masterColorIds.join(', ')}]`);
    } else {
      const missingInCard = masterColorIds.filter(c => !card.swatches.includes(c));
      const extraInCard = card.swatches.filter(c => !masterColorIds.includes(c));
      if (missingInCard.length > 0) issues.push(`Card missing swatches: [${missingInCard.join(', ')}]`);
      if (extraInCard.length > 0) issues.push(`Card has unconfirmed swatches: [${extraInCard.join(', ')}]`);
    }
  }
  
  // 4. Data-colors attribute
  const cardDataColorsList = (card.dataColors || '').split(/\s+/).filter(Boolean);
  const unconfirmedDataColors = cardDataColorsList.filter(c => !masterColorIds.includes(c));
  if (unconfirmedDataColors.length > 0 && masterColorIds.length > 0) {
    issues.push(`data-colors has unconfirmed colors: [${unconfirmedDataColors.join(', ')}] (confirmed: [${masterColorIds.join(', ')}])`);
  }
  
  if (issues.length > 0) {
    console.log(`[DISCREPANCY] ${idx + 1}. ${p.slug} (${card.name || p.model}):`);
    issues.forEach(iss => console.log(`   - ${iss}`));
  } else {
    console.log(`[OK] ${idx + 1}. ${p.slug} (${card.name || p.model})`);
  }
});

console.log('\n=== AUDITING INDEX.HTML CARDS ===');

const indexCards = {};
while ((m = cardRegex.exec(indexHtml)) !== null) {
  const slug = m[1];
  const fullTag = m[0].split('>')[0];
  const cardBody = m[2];
  
  const dataId = (fullTag.match(/data-id="([^"]+)"/) || [])[1];
  const dataPrice = (fullTag.match(/data-price="([^"]+)"/) || [])[1];
  const dataColors = (fullTag.match(/data-colors="([^"]+)"/) || [])[1];
  const dataCat = (fullTag.match(/data-cat="([^"]+)"/) || [])[1];
  const dataSize = (fullTag.match(/data-size="([^"]+)"/) || [])[1];
  
  const priceNow = (cardBody.match(/<span class="price__now">([^<]+)<\/span>/) || [])[1];
  const priceOld = (cardBody.match(/<span class="price__old">([^<]+)<\/span>/) || [])[1];
  const name = (cardBody.match(/<div class="product__name"[^>]*>([^<]+)<\/div>/) || [])[1];
  const swatches = [...cardBody.matchAll(/class="product-swatch[^"]*"[^>]*data-color="([^"]+)"/g)].map(x => x[1]);
  const img = (cardBody.match(/<img[^>]*src="([^"]+)"/) || [])[1];
  
  indexCards[slug] = {
    slug, dataId, dataPrice, dataColors, dataCat, dataSize, priceNow, priceOld, name, swatches, img
  };
}

console.log(`Found ${Object.keys(indexCards).length} cards in index.html\n`);

Object.keys(indexCards).forEach((slug, idx) => {
  const card = indexCards[slug];
  const p = master.find(x => x.slug === slug);
  if (!p) {
    console.log(`[UNKNOWN SKU] ${slug} in index.html!`);
    return;
  }
  
  const issues = [];
  if (String(p.price) !== String(card.dataPrice)) {
    issues.push(`data-price mismatch: master=${p.price}, card=${card.dataPrice}`);
  }
  const numPriceNow = parseInt((card.priceNow || '').replace(/[^\d]/g, ''), 10);
  if (p.price && numPriceNow && p.price !== numPriceNow) {
    issues.push(`priceNow text mismatch: master=${p.price}, displayed=${card.priceNow}`);
  }
  const masterColorIds = (p.confirmedColors || []).map(c => c.id);
  if (masterColorIds.length > 0) {
    const missingInCard = masterColorIds.filter(c => !card.swatches.includes(c));
    const extraInCard = card.swatches.filter(c => !masterColorIds.includes(c));
    if (missingInCard.length > 0) issues.push(`Card missing swatches: [${missingInCard.join(', ')}]`);
    if (extraInCard.length > 0) issues.push(`Card has unconfirmed swatches: [${extraInCard.join(', ')}]`);
  }
  if (issues.length > 0) {
    console.log(`[DISCREPANCY] ${idx + 1}. ${slug} (${card.name || p.model}):`);
    issues.forEach(iss => console.log(`   - ${iss}`));
  } else {
    console.log(`[OK] ${idx + 1}. ${slug} (${card.name || p.model})`);
  }
});

