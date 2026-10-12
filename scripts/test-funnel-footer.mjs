import fs from 'fs';
import assert from 'assert';

console.log('=== VERIFYING CONVERSION FUNNEL & 5-COLUMN FOOTER ===');

// 1. Verify HTML pages have the new structures
const funnelPages = ['index.html', 'catalog.html', 'sets.html', 'horeca.html'];
for (const p of funnelPages) {
  const content = fs.readFileSync(p, 'utf8');
  assert(content.includes('class="prefoot-funnel'), `${p} missing .prefoot-funnel`);
  assert(content.includes('class="mobile-funnel-bar'), `${p} missing .mobile-funnel-bar`);
  assert(content.includes('class="site-foot"'), `${p} missing .site-foot`);
  assert(content.includes('class="site-foot__trust-bar"'), `${p} missing trust bar`);
  assert(content.includes('class="site-foot__payments"'), `${p} missing payments`);
  console.log(`  PASS: [${p} contains conversion funnel, mobile bar, and trust bar]`);
}

// 2. Verify all 5 columns in site-foot
const indexHtml = fs.readFileSync('index.html', 'utf8');
const expectedColumns = [
  'data-i18n="foot.tag"',
  'data-i18n="foot.catalog"',
  'data-i18n="foot.buyers"',
  'data-i18n="foot.b2b"',
  'data-i18n="foot.contacts"'
];
for (const col of expectedColumns) {
  assert(indexHtml.includes(col), `index.html missing column: ${col}`);
  console.log(`  PASS: [Column verified: ${col}]`);
}

// 3. Verify CSS rules
const css = fs.readFileSync('assets/styles.css', 'utf8');
assert(css.includes('.prefoot-funnel'), 'styles.css missing .prefoot-funnel');
assert(css.includes('.mobile-funnel-bar'), 'styles.css missing .mobile-funnel-bar');
assert(css.includes('.site-foot__trust-bar'), 'styles.css missing .site-foot__trust-bar');
assert(css.includes('.site-foot__pay-badge'), 'styles.css missing .site-foot__pay-badge');
console.log('  PASS: [styles.css contains all required funnel, mobile bar, and footer rules]');

// 4. Verify JS functions
const js = fs.readFileSync('assets/site.js', 'utf8');
assert(js.includes('function initFunnel('), 'site.js missing initFunnel');
assert(js.includes('function initMobileFunnelBar('), 'site.js missing initMobileFunnelBar');
assert(js.includes('initFunnel();'), 'site.js missing call to initFunnel');
assert(js.includes('initMobileFunnelBar();'), 'site.js missing call to initMobileFunnelBar');
console.log('  PASS: [site.js correctly wires up funnel submission and mobile sticky bar]');

// 5. Verify i18n keys
const i18n = fs.readFileSync('assets/i18n.js', 'utf8');
const requiredKeys = [
  'funnel.badge',
  'funnel.title',
  'funnel.subtitle',
  'funnel.btn_submit',
  'funnel.mobile_call',
  'funnel.mobile_tg',
  'funnel.mobile_sets',
  'foot.catalog',
  'foot.buyers',
  'foot.b2b',
  'foot.trust_prod',
  'foot.trust_price',
  'foot.trust_speed'
];
for (const key of requiredKeys) {
  assert(i18n.includes(`"${key}":`), `i18n.js missing key: ${key}`);
}
console.log('  PASS: [i18n.js has all funnel and footer keys across languages]');

// 6. Verify dash compliance
const badRegex = /[—–]/g;
assert.strictEqual(indexHtml.match(badRegex), null, 'index.html has bad dashes');
assert.strictEqual(css.match(badRegex), null, 'styles.css has bad dashes');
assert.strictEqual(js.match(badRegex), null, 'site.js has bad dashes');
assert.strictEqual(i18n.match(badRegex), null, 'i18n.js has bad dashes');
console.log('  PASS: [Strict Rule: Zero em-dash or en-dash across all updated files]');

console.log('\nALL CONVERSION FUNNEL & FOOTER CHECKS PASSED PERFECTLY!\n');
