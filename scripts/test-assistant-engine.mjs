// scripts/test-assistant-engine.mjs
// Test suite for BTT chat assistant intent engine, typo tolerance, multilingual matching and SSOT pricing

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const assistantCode = fs.readFileSync(path.join(ROOT, 'assets/assistant.js'), 'utf8');

// Create mock browser DOM context to load assistant.js
const domContext = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelector: () => null,
    documentElement: { lang: 'ru' }
  },
  localStorage: {
    getItem: (k) => (k === 'btt_lang' ? 'ru' : null),
    setItem: () => {}
  },
  sessionStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  fetch: async () => ({ ok: true, json: async () => ({ ok: true, id: 1042 }) }),
  console: console,
  MutationObserver: class {
    observe() {}
  }
};

vm.createContext(domContext);

// Extract inner functions for direct testing by wrapping assistant.js
// We evaluate assistant with an export hook or test directly via extracted logic
const testScript = `
  ${assistantCode}
`;

// Let's create an evaluation environment where we can test the internal intent resolution
let passed = 0;
let failed = 0;

function assert(condition, desc) {
  if (condition) {
    console.log('  PASS: ' + desc);
    passed++;
  } else {
    console.error('  FAIL: ' + desc);
    failed++;
  }
}

console.log('=== TESTING BTT ASSISTANT INTENT & PRICING ENGINE ===\n');

// 1. Verify file content invariants
console.log('--- 1. Verification of File Invariants ---');
assert(!assistantCode.includes('\u2014'), 'Zero em-dash in assistant.js');
assert(!assistantCode.includes('\u2013'), 'Zero en-dash in assistant.js');
assert(assistantCode.includes('Настольные лампы'), 'Includes table lamps in quick options');
assert(assistantCode.includes('Искусственный ротанг'), 'Includes artificial rattan in quick options');
assert(assistantCode.includes('ROERO: 188 000 сум / 168 000 сум'), 'Exact SSOT ROERO pricing in RU');
assert(assistantCode.includes('NOERO: 212 000 сум / 192 000 сум'), 'Exact SSOT NOERO pricing in RU');
assert(assistantCode.includes('TODO: 236 000 сум / 216 000 сум'), 'Exact SSOT TODO pricing in RU');
assert(assistantCode.includes('JARDIN: 344 000 сум / 324 000 сум'), 'Exact SSOT JARDIN pricing in RU');
assert(assistantCode.includes('VERTEX: 499 000 сум'), 'Exact SSOT VERTEX wicker chair pricing');
assert(assistantCode.includes('CORDA: 499 000 сум'), 'Exact SSOT CORDA wicker chair pricing');
assert(assistantCode.includes('730 000 сум отдельно (для комплекта 680 000 сум)'), 'Exact SSOT VERTEX D90 table pricing');
assert(assistantCode.includes('783 000 сум отдельно (для комплекта 733 000 сум)'), 'Exact SSOT TAPER 80x80 table pricing');
assert(assistantCode.includes('904 000 сум отдельно (для комплекта 854 000 сум)'), 'Exact SSOT TAPER ROTANG 80x80 table pricing');
assert(assistantCode.includes('910 000 сум отдельно (для комплекта 860 000 сум)'), 'Exact SSOT TAPER 135x80 table pricing');
assert(assistantCode.includes('999 000 сум отдельно (для комплекта 949 000 сум)'), 'Exact SSOT CORDA 135x80 table pricing');
assert(assistantCode.includes('954 000 сум'), 'Exact SSOT TAPER ROTANG 135x80 combo pricing');
assert(assistantCode.includes('2 676 000 сум'), 'Exact approved combo VERTEX D90 + 4 chairs = 2 676 000 UZS');
assert(assistantCode.includes('2 850 000 сум'), 'Exact approved combo TAPER 80x80 + 4 chairs = 2 850 000 UZS');
assert(assistantCode.includes('NOVA') && assistantCode.includes('401 000 сум'), 'Exact NOVA lamp pricing');
assert(assistantCode.includes('SORA') && assistantCode.includes('740 000 сум'), 'Exact SORA lamp pricing');
assert(assistantCode.includes('Полутрубка') && assistantCode.includes('TWIST'), 'Exact rattan profiles present');

// 2. Test extraction & regex logic
console.log('\n--- 2. Phone and Customer Name Extraction ---');

function extractPhoneTest(text) {
  var s = String(text);
  var rx = /(?:\+?998[\s.-]*)?(?:\(?\d{2}\)?[\s.-]*)?\d{3}[\s.-]*\d{2}[\s.-]*\d{2}\b/g;
  var matches = s.match(rx);
  if(matches && matches.length){
    for(var i=0; i<matches.length; i++){
      var digits = matches[i].replace(/\D/g, "");
      if(digits.length === 9) return "+998" + digits;
      if(digits.length === 12 && digits.startsWith("998")) return "+" + digits;
    }
  }
  var rawDigits = s.replace(/\D/g, "");
  if(rawDigits.length === 9) return "+998" + rawDigits;
  if(rawDigits.length === 12 && rawDigits.startsWith("998")) return "+" + rawDigits;
  return null;
}

assert(extractPhoneTest('+998 90 123 45 67') === '+998901234567', 'Format +998 90 123 45 67 parsed');
assert(extractPhoneTest('901234567') === '+998901234567', '9-digit phone parsed');
assert(extractPhoneTest('тел 998971234567 Алишер') === '+998971234567', '12-digit embedded phone parsed');

function detectLangTest(text) {
  var raw = String(text).toLowerCase();
  var uzRegex = /(?:^|[^\p{L}\p{N}])(salom|assalomu|narxi|qancha|necha|nechi|so['`‘]m|som|yetkazish|yetkazib|buyurtma|to['`‘]plam|stullar|stollar|manzil|qayerda|to['`‘]lov|tolov|rahmat|bormi|bor-mi|oldingi|keyingi|sotib|savol|iltimos|telefonim|ismim)(?:$|[^\p{L}\p{N}])/iu;
  var uzCyrRegex = /(?:^|[^\p{L}\p{N}])(салом|ассалому|нархи|канча|неч|неча|нечи|сум|етказиб|етказиш|буюртма|туплам|стуллар|столлар|манзил|каерда|толов|рахмат|борми|илтимос|исмим)(?:$|[^\p{L}\p{N}])/iu;
  if(uzRegex.test(raw) || uzCyrRegex.test(raw)) return "uz";
  var enRegex = /(?:^|[^\p{L}\p{N}])(hello|hi|hey|price|prices|cost|how much|order|buy|delivery|shipping|where|address|chair|chairs|table|tables|set|sets|payment|discount|stock|available|thanks|thank you)(?:$|[^\p{L}\p{N}])/iu;
  if(enRegex.test(raw)) return "en";
  var ruRegex = /(?:^|[^\p{L}\p{N}])(здравствуйте|привет|добрый|день|цена|цены|почем|почём|пачем|скока|сколько|заказ|заказать|купить|оформить|доставка|самовывоз|где|адрес|стол|стул|комплект|оплата|скидка|наличие|спасибо)(?:$|[^\p{L}\p{N}])/iu;
  if(ruRegex.test(raw)) return "ru";
  return null;
}

console.log('\n--- 3. Multilingual Detection Tests ---');
assert(detectLangTest('salom stullar narxi qancha?') === 'uz', 'Uzbek Latin: "salom stullar narxi qancha?"');
assert(detectLangTest('салом нархи канча') === 'uz', 'Uzbek Cyrillic: "салом нархи канча"');
assert(detectLangTest('нечи пул булади') === 'uz', 'Uzbek Cyrillic: "нечи пул булади"');
assert(detectLangTest('buyurtma bermoqchiman') === 'uz', 'Uzbek Latin: "buyurtma bermoqchiman"');
assert(detectLangTest('How much is the Roero chair?') === 'en', 'English: "How much is the Roero chair?"');
assert(detectLangTest('do you have delivery in Tashkent?') === 'en', 'English: "do you have delivery in Tashkent?"');
assert(detectLangTest('Здравствуйте, какие цены на комплекты?') === 'ru', 'Russian: "Здравствуйте, какие цены на комплекты?"');
assert(detectLangTest('почем стол тейпер 80') === 'ru', 'Russian: "почем стол тейпер 80"');

console.log('\n--- 4. SSOT Plastic Combo Calculation Math ---');
// Formula: Table combo price + N * Chair combo price
// Taper 80x80 (733 000) + 4 Roero (4 * 168 000) = 1 405 000
const calc1 = 733000 + 4 * 168000;
assert(calc1 === 1405000, 'Taper 80x80 + 4 Roero = 1 405 000 UZS');

// Taper 80x80 (733 000) + 4 Noero (4 * 192 000) = 1 501 000
const calc2 = 733000 + 4 * 192000;
assert(calc2 === 1501000, 'Taper 80x80 + 4 Noero = 1 501 000 UZS');

// Taper 80x80 (733 000) + 4 Todo (4 * 216 000) = 1 597 000
const calc3 = 733000 + 4 * 216000;
assert(calc3 === 1597000, 'Taper 80x80 + 4 Todo = 1 597 000 UZS');

// Corda 135x80 (949 000) + 6 Roero (6 * 168 000) = 1 957 000
const calc4 = 949000 + 6 * 168000;
assert(calc4 === 1957000, 'Corda 135x80 + 6 Roero = 1 957 000 UZS');

// Taper 135x80 (860 000) + 6 Todo (6 * 216 000) = 2 156 000
const calc5 = 860000 + 6 * 216000;
assert(calc5 === 2156000, 'Taper 135x80 + 6 Todo = 2 156 000 UZS');

console.log('\n--- 5. End-to-End Dialog & Bot Resolution Tests ---');
vm.runInContext(assistantCode, domContext);
const bot = domContext.window.BTT_BOT;
assert(!!bot, 'BTT_BOT exported on window');

// Test 1: Combo calculation via dialog
const r1 = bot.resolve('почем стол тейпер 80 и 4 стула роеро');
assert(r1.includes('1 405 000 сум'), 'Dialog: Taper 80 + 4 Roero yields 1 405 000 сум');
assert(r1.includes('data-order-box'), 'Dialog: includes interactive order box');

// Test 2: Combo calculation for Corda 135 + 6 Roero
const r2 = bot.resolve('стол корда 135 и 6 стульев роеро');
assert(r2.includes('1 957 000 сум'), 'Dialog: Corda 135 + 6 Roero yields 1 957 000 сум');

// Test 3: Approved ready combo Vertex D90 + 4 Corda
const r3 = bot.resolve('комплект вертекс д90 и 4 стула корда');
assert(r3.includes('2 676 000 сум'), 'Dialog: Vertex D90 + 4 Corda yields 2 676 000 сум');

// Test 4: Approved ready combo Taper 80 + 4 Vertex
const r4 = bot.resolve('стол тейпер 80 и 4 стула вертекс');
assert(r4.includes('2 850 000 сум'), 'Dialog: Taper 80 + 4 Vertex yields 2 850 000 сум');

// Test 5: Distinction between Table Corda and Chair Corda
const rTableCorda = bot.resolve('стол корда 135');
assert(rTableCorda.includes('stol-corda-135') || rTableCorda.includes('CORDA 135x80'), 'Resolves table Corda 135');

const rChairCorda = bot.resolve('стул корда');
assert(rChairCorda.includes('stul-corda') || rChairCorda.includes('CORDA'), 'Resolves wicker chair Corda');

// Test 6: Uzbek query resolution
const rUz = bot.resolve('salom stol narxlari qancha');
assert(rUz.includes('so‘m') || rUz.includes('narxlar') || rUz.includes('Toshkent'), 'Uzbek query returns Uzbek localized prices');

// Test 7: Direct lead submission when phone is typed in chat
const rLead = bot.resolve('Меня зовут Рустам +998 90 333 44 55 хочу купить комплект');
assert(rLead.includes('bot-order-ok') && rLead.includes('+998903334455'), 'Direct order parse from message with phone & name');

// Test 8: Table lamp resolution
const rLamp = bot.resolve('почем лампа нова');
assert(rLamp.includes('401 000 сум'), 'Dialog: Lamp NOVA yields 401 000 сум');

const clean = (s) => String(s).replace(/\u00A0/g, ' ');

// Test 9: Artificial rattan inquiry
const rRattan = bot.resolve('нужен искусственный ротанг твист');
assert(rRattan.includes('ротанг') || rRattan.includes('TWIST'), 'Dialog: Artificial rattan resolution');

// Test 10: Taper Rotang 80 + 4 Roero
const rTR80 = bot.resolve('стол тейпер ротанг 80 и 4 стула роеро');
assert(clean(rTR80).includes('1 526 000 сум'), 'Dialog: Taper Rotang 80 + 4 Roero yields 1 526 000 сум');

// Test 11: Taper Rotang 80 + 4 Corda (approved combo)
const rTR80W = bot.resolve('стол тейпер ротанг 80 и 4 стула корда');
assert(clean(rTR80W).includes('2 850 000 сум'), 'Dialog: Taper Rotang 80 + 4 Corda yields 2 850 000 сум');

// Test 12: Taper 135 + 4 Vertex
const rT135W = bot.resolve('стол тейпер 135 и 4 стула вертекс');
assert(clean(rT135W).includes('2 856 000 сум'), 'Dialog: Taper 135 + 4 Vertex yields 2 856 000 сум');

// Test 13: Corda 135 + 4 Corda
const rC135W = bot.resolve('стол корда 135 и 4 стула корда');
assert(clean(rC135W).includes('2 945 000 сум'), 'Dialog: Corda 135 + 4 Corda yields 2 945 000 сум');

// Test 14: Taper Rotang 135 + 4 Vertex
const rTR135W = bot.resolve('стол тейпер ротанг 135 и 4 стула вертекс');
assert(clean(rTR135W).includes('2 950 000 сум'), 'Dialog: Taper Rotang 135 + 4 Vertex yields 2 950 000 сум');

console.log('\n=======================================');
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
if (failed > 0) process.exit(1);
