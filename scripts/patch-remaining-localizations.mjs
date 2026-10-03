import fs from 'fs';

const i18nFile = 'assets/i18n.js';
let i18nContent = fs.readFileSync(i18nFile, 'utf8');

// Define new keys for RU, UZ, EN
const keysRU = {
  // horeca
  'hrc.prod.link': 'В каталог →',
  // catalog
  'cat.spec.ldsp_metal': 'ЛДСП + металл',
  // about
  'ab.badge': 'Ташкент, Узбекистан',
  'ab.floatingBadge': 'BTT • Мебель для дома и сада',
  'ab.stat1': 'выверенных моделей в каталоге',
  'ab.stat2': 'направления: плетёные, пластиковые, мягкие стулья и столы',
  'ab.stat3': 'прозрачные цены без скрытых доплат',
  'ab.v.sub': 'Четыре ключевых правила работы BTT для клиентов в Ташкенте и по всему Узбекистану.',
  'ab.cta.sub': 'Свяжитесь с нами - поможем подобрать столы и стулья для дома, веранды или кафе, рассчитаем стоимость и согласуем доставку.',
  'ab.cta.catalog': 'Смотреть каталог',
  'ab.cta.tg': 'Написать в Telegram',
  // faq
  'faq.badge': 'Служба заботы BTT · Консультации в Telegram',
  'faq.filter.all': 'Все (8)',
  'faq.filter.assortment': 'Ассортимент и характеристики (4)',
  'faq.filter.delivery': 'Заказ и доставка (3)',
  'faq.filter.care': 'Уход и эксплуатация (1)',
  'faq.cta.h': 'Не нашли ответ на свой вопрос?',
  'faq.cta.p': 'Свяжитесь с нами в Telegram или по телефону - подробно проконсультируем по характеристикам, наличию и срокам доставки.',
  'faq.cta.tg': 'Написать в Telegram',
  // care
  'care.badge': 'Практичный уход · Простые рекомендации',
  'care.b1.note': 'Для освежения мебели достаточно протереть её мягкой влажной салфеткой.',
  'care.b2.note': 'Столешницы из ЛДСП рекомендуется использовать в помещениях или под крытым навесом.',
  'care.b3.l1': 'Металлический каркас с защитным полимерным покрытием.',
  'care.b3.l2': 'Полимерное волокно устойчиво к климатическим перепадам.',
  'care.cushion.t': 'Уход за подушками',
  'care.cushion.d': 'Текстильные подушки рекомендуется защищать от затяжных дождей. Чехлы можно бережно стирать при температуре 30°C без отжима.',
  'care.cta.h': 'Остались вопросы по уходу за мебелью?',
  'care.cta.p': 'Свяжитесь со службой заботы BTT в Telegram или по телефону - подскажем рекомендации по эксплуатации для вашей модели.',
  'care.cta.tg': 'Написать в Telegram',
  // login/auth
  'auth.sub': 'Отслеживайте статусы заказов, управляйте адресами доставки и сохраняйте понравившуюся мебель в избранное.',
  'auth.badge': 'Безопасная авторизация',
  // cookies & privacy
  'cookie.badge': 'Конфиденциальность · Редакция 2026',
  'priv.badge': 'Защита данных · Редакция 2026',
  // rotang
  'seo.rotang.stockBadge': 'В наличии на складе в Ташкенте',
  'seo.rotang.c3.l2': 'Taper Rotang 80×80 см (615 000 сум).',
  'seo.rotang.c3.l3': 'Taper Rotang 135×80 см (715 000 сум).',
  // returns
  'ret.step1.d': 'Напишите в Telegram <a href="https://t.me/btt_uz" target="_blank" rel="noopener noreferrer" style="color:var(--copper)">@btt_uz</a> или позвоните по телефону <a href="tel:+998771044422" style="color:var(--copper)">+998 77 104 44 22</a>.'
};

const keysUZ = {
  'hrc.prod.link': 'Katalogga →',
  'cat.spec.ldsp_metal': 'LDSP + metall',
  'ab.badge': 'Toshkent, O\'zbekiston',
  'ab.floatingBadge': 'BTT • Uy va bog\' mebellari',
  'ab.stat1': 'katalogdagi saralangan modellar',
  'ab.stat2': 'yo\'nalish: to\'qilgan, plastik, yumshoq stullar va stollar',
  'ab.stat3': 'yashirin to\'lovlarsiz shaffof narxlar',
  'ab.v.sub': 'Toshkent va butun O\'zbekistondagi mijozlar uchun BTT ishining to\'rtta asosiy qoidasi.',
  'ab.cta.sub': 'Biz bilan bog\'laning - uy, veranda yoki kafe uchun stollar va stullarni tanlashda yordam beramiz, narxni hisoblaymiz va yetkazib berishni kelishamiz.',
  'ab.cta.catalog': 'Katalogni ko\'rish',
  'ab.cta.tg': 'Telegram orqali yozish',
  'faq.badge': 'BTT g\'amxo\'rlik xizmati · Telegram orqali maslahat',
  'faq.filter.all': 'Barchasi (8)',
  'faq.filter.assortment': 'Assortiment va xususiyatlar (4)',
  'faq.filter.delivery': 'Buyurtma va yetkazib berish (3)',
  'faq.filter.care': 'Parvarish va foydalanish (1)',
  'faq.cta.h': 'Savolingizga javob topmadingizmi?',
  'faq.cta.p': 'Telegram yoki telefon orqali biz bilan bog\'laning - xususiyatlar, mavjudlik va yetkazib berish muddatlari bo\'yicha batafsil maslahat beramiz.',
  'faq.cta.tg': 'Telegram orqali yozish',
  'care.badge': 'Amaliy parvarish · Oddiy tavsiyalar',
  'care.b1.note': 'Mebelni yangilash uchun uni nam yumshoq mato bilan artish kifoya.',
  'care.b2.note': 'LDSP stoleshnitsalarini bino ichida yoki soyabon ostida ishlatish tavsiya etiladi.',
  'care.b3.l1': 'Himoya polimer qoplamali metall ramka.',
  'care.b3.l2': 'Polimer tola iqlim o\'zgarishlariga chidamli.',
  'care.cushion.t': 'Yostiqchalarni parvarishlash',
  'care.cushion.d': 'To\'qimachilik yostiqchalarini uzoq yog\'ingarchilikdan himoya qilish tavsiya etiladi. G\'iloflarni siqmasdan 30°C da ehtiyotkorlik bilan yuvish mumkin.',
  'care.cta.h': 'Mebel parvarishi bo\'yicha savollar qoldimi?',
  'care.cta.p': 'BTT g\'amxo\'rlik xizmatiga Telegram yoki telefon orqali murojaat qiling - modelingiz uchun foydalanish tavsiyalarini beramiz.',
  'care.cta.tg': 'Telegram orqali yozish',
  'auth.sub': 'Buyurtma holatlarini kuzating, yetkazib berish manzillarini boshqaring va yoqqan mebellarni saralanganlarga saqlang.',
  'auth.badge': 'Xavfsiz avtorizatsiya',
  'cookie.badge': 'Maxfiylik · 2026 tahriri',
  'priv.badge': 'Ma\'lumotlarni himoya qilish · 2026 tahriri',
  'seo.rotang.stockBadge': 'Toshkentdagi omborda mavjud',
  'seo.rotang.c3.l2': 'Taper Rotang 80×80 sm (615 000 so\'m).',
  'seo.rotang.c3.l3': 'Taper Rotang 135×80 sm (715 000 so\'m).',
  'ret.step1.d': 'Telegram orqali <a href="https://t.me/btt_uz" target="_blank" rel="noopener noreferrer" style="color:var(--copper)">@btt_uz</a> yozing yoki <a href="tel:+998771044422" style="color:var(--copper)">+998 77 104 44 22</a> telefon raqamiga qo\'ng\'iroq qiling.'
};

const keysEN = {
  'hrc.prod.link': 'To catalogue →',
  'cat.spec.ldsp_metal': 'MDF + metal',
  'ab.badge': 'Tashkent, Uzbekistan',
  'ab.floatingBadge': 'BTT • Home and garden furniture',
  'ab.stat1': 'curated models in the catalogue',
  'ab.stat2': 'categories: wicker, plastic, soft chairs and tables',
  'ab.stat3': 'transparent prices with no hidden charges',
  'ab.v.sub': 'Four key principles of BTT for clients across Tashkent and Uzbekistan.',
  'ab.cta.sub': 'Contact us - we will help select tables and chairs for your home, veranda or cafe, calculate costs and arrange delivery.',
  'ab.cta.catalog': 'Browse catalogue',
  'ab.cta.tg': 'Message on Telegram',
  'faq.badge': 'BTT Care Service · Telegram Support',
  'faq.filter.all': 'All (8)',
  'faq.filter.assortment': 'Range and specs (4)',
  'faq.filter.delivery': 'Orders and delivery (3)',
  'faq.filter.care': 'Care and maintenance (1)',
  'faq.cta.h': 'Didn\'t find an answer to your question?',
  'faq.cta.p': 'Contact us via Telegram or phone - we will provide detailed advice on specifications, stock availability and delivery times.',
  'faq.cta.tg': 'Message on Telegram',
  'care.badge': 'Practical care · Simple tips',
  'care.b1.note': 'To refresh the furniture, simply wipe it with a soft damp cloth.',
  'care.b2.note': 'MDF tabletops are recommended for indoor use or under a covered canopy.',
  'care.b3.l1': 'Metal frame with protective polymer finish.',
  'care.b3.l2': 'Synthetic fibre resists weather fluctuations.',
  'care.cushion.t': 'Cushion care',
  'care.cushion.d': 'We recommend protecting textile cushions from prolonged rainfall. Covers can be gently washed at 30°C without spin cycle.',
  'care.cta.h': 'Have questions about furniture care?',
  'care.cta.p': 'Contact BTT customer care on Telegram or by phone - we will advise on care guidelines for your model.',
  'care.cta.tg': 'Message on Telegram',
  'auth.sub': 'Track order statuses, manage delivery addresses, and save favourite furniture to your wishlist.',
  'auth.badge': 'Secure authentication',
  'cookie.badge': 'Privacy · 2026 Edition',
  'priv.badge': 'Data Protection · 2026 Edition',
  'seo.rotang.stockBadge': 'In stock in Tashkent warehouse',
  'seo.rotang.c3.l2': 'Taper Rotang 80×80 cm (615 000 UZS).',
  'seo.rotang.c3.l3': 'Taper Rotang 135×80 cm (715 000 UZS).',
  'ret.step1.d': 'Message us on Telegram <a href="https://t.me/btt_uz" target="_blank" rel="noopener noreferrer" style="color:var(--copper)">@btt_uz</a> or call <a href="tel:+998771044422" style="color:var(--copper)">+998 77 104 44 22</a>.'
};

// Check em-dash or en-dash in any of the keys or values
for (const [k, v] of Object.entries({...keysRU, ...keysUZ, ...keysEN})) {
  if (k.includes('-') || k.includes('-') || v.includes('-') || v.includes('-')) {
    console.error(`ERROR: Dash found in ${k}: ${v}`);
    process.exit(1);
  }
}

// Function to add keys to a section
function addKeysToLang(lines, anchorKey, newObj, minLine, maxLine) {
  const anchorIdx = lines.findIndex((l, i) => i >= minLine && i <= maxLine && l.includes(`"${anchorKey}":`));
  if (anchorIdx === -1) {
    throw new Error(`Anchor key "${anchorKey}" not found in lines ${minLine}-${maxLine}`);
  }
  const formatted = Object.entries(newObj).map(([k, v]) => {
    return `    "${k}": ${JSON.stringify(v)},`;
  });
  lines.splice(anchorIdx + 1, 0, ...formatted);
  console.log(`Inserted ${formatted.length} keys after line ${anchorIdx + 1} (${anchorKey})`);
}

let lines = i18nContent.split('\n');

// RU section: anchor after ret.cta.tg (line ~400)
addKeysToLang(lines, 'ret.cta.tg', keysRU, 300, 500);

// UZ section: anchor after ret.cta.tg (line ~1050)
addKeysToLang(lines, 'ret.cta.tg', keysUZ, 950, 1300);

// EN section: anchor after ret.cta.tg (line ~1700)
addKeysToLang(lines, 'ret.cta.tg', keysEN, 1600, 2100);

fs.writeFileSync(i18nFile, lines.join('\n'), 'utf8');
console.log('assets/i18n.js updated successfully!');

// === Now patch HTML files ===

// 1. horeca.html
let horeca = fs.readFileSync('horeca.html', 'utf8');
horeca = horeca.replaceAll(
  '<span class="horeca-prod-link">В каталог →</span>',
  '<span class="horeca-prod-link" data-i18n="hrc.prod.link">В каталог →</span>'
);
fs.writeFileSync('horeca.html', horeca, 'utf8');
console.log('horeca.html patched');

// 2. catalog.html
let cat = fs.readFileSync('catalog.html', 'utf8');
cat = cat.replaceAll(
  '<div class="product__spec-tag">ЛДСП + металл</div>',
  '<div class="product__spec-tag" data-i18n="cat.spec.ldsp_metal">ЛДСП + металл</div>'
);
fs.writeFileSync('catalog.html', cat, 'utf8');
console.log('catalog.html patched');

// 3. about.html
let ab = fs.readFileSync('about.html', 'utf8');
ab = ab.replace(
  '<span>Ташкент, Узбекистан</span>',
  '<span data-i18n="ab.badge">Ташкент, Узбекистан</span>'
);
ab = ab.replace(
  '<span>BTT • Мебель для дома и сада</span>',
  '<span data-i18n="ab.floatingBadge">BTT • Мебель для дома и сада</span>'
);
// Fix 15 to 16 models in catalog stat
ab = ab.replace(
  '<span class="about-stat-num">15</span>',
  '<span class="about-stat-num">16</span>'
);
ab = ab.replace(
  '<span class="about-stat-label">выверенных моделей в каталоге</span>',
  '<span class="about-stat-label" data-i18n="ab.stat1">выверенных моделей в каталоге</span>'
);
ab = ab.replace(
  '<span class="about-stat-label">направления: плетёные, пластиковые, мягкие стулья и столы</span>',
  '<span class="about-stat-label" data-i18n="ab.stat2">направления: плетёные, пластиковые, мягкие стулья и столы</span>'
);
ab = ab.replace(
  '<span class="about-stat-label">прозрачные цены без скрытых доплат</span>',
  '<span class="about-stat-label" data-i18n="ab.stat3">прозрачные цены без скрытых доплат</span>'
);
ab = ab.replace(
  '<p class="about-section-sub">Четыре ключевых правила работы BTT для клиентов в Ташкенте и по всему Узбекистану.</p>',
  '<p class="about-section-sub" data-i18n="ab.v.sub">Четыре ключевых правила работы BTT для клиентов в Ташкенте и по всему Узбекистану.</p>'
);
ab = ab.replace(
  '<p class="about-cta-sub">Свяжитесь с нами - поможем подобрать столы и стулья для дома, веранды или кафе, рассчитаем стоимость и согласуем доставку.</p>',
  '<p class="about-cta-sub" data-i18n="ab.cta.sub">Свяжитесь с нами - поможем подобрать столы и стулья для дома, веранды или кафе, рассчитаем стоимость и согласуем доставку.</p>'
);
ab = ab.replace(
  '        <span>Смотреть каталог</span>\n        <svg viewBox="0 0 24 24"',
  '        <span data-i18n="ab.cta.catalog">Смотреть каталог</span>\n        <svg viewBox="0 0 24 24"'
);
ab = ab.replace(
  '        <span>Написать в Telegram</span>\n      </a>\n    </div>\n  </aside>',
  '        <span data-i18n="ab.cta.tg">Написать в Telegram</span>\n      </a>\n    </div>\n  </aside>'
);
fs.writeFileSync('about.html', ab, 'utf8');
console.log('about.html patched');

// 4. faq.html
let faq = fs.readFileSync('faq.html', 'utf8');
faq = faq.replace(
  '<span>Служба заботы BTT · Консультации в Telegram</span>',
  '<span data-i18n="faq.badge">Служба заботы BTT · Консультации в Telegram</span>'
);
faq = faq.replace(
  '<button type="button" class="faq-filter-chip is-active" data-faq-filter="all">Все (8)</button>',
  '<button type="button" class="faq-filter-chip is-active" data-faq-filter="all" data-i18n="faq.filter.all">Все (8)</button>'
);
faq = faq.replace(
  '<button type="button" class="faq-filter-chip" data-faq-filter="assortment">Ассортимент и характеристики (4)</button>',
  '<button type="button" class="faq-filter-chip" data-faq-filter="assortment" data-i18n="faq.filter.assortment">Ассортимент и характеристики (4)</button>'
);
faq = faq.replace(
  '<button type="button" class="faq-filter-chip" data-faq-filter="delivery">Заказ и доставка (3)</button>',
  '<button type="button" class="faq-filter-chip" data-faq-filter="delivery" data-i18n="faq.filter.delivery">Заказ и доставка (3)</button>'
);
faq = faq.replace(
  '<button type="button" class="faq-filter-chip" data-faq-filter="care">Уход и эксплуатация (1)</button>',
  '<button type="button" class="faq-filter-chip" data-faq-filter="care" data-i18n="faq.filter.care">Уход и эксплуатация (1)</button>'
);
faq = faq.replace(
  '<h3 class="help-cta-title">Не нашли ответ на свой вопрос?</h3>',
  '<h3 class="help-cta-title" data-i18n="faq.cta.h">Не нашли ответ на свой вопрос?</h3>'
);
faq = faq.replace(
  '<p class="help-cta-text">Свяжитесь с нами в Telegram или по телефону - подробно проконсультируем по характеристикам, наличию и срокам доставки.</p>',
  '<p class="help-cta-text" data-i18n="faq.cta.p">Свяжитесь с нами в Telegram или по телефону - подробно проконсультируем по характеристикам, наличию и срокам доставки.</p>'
);
faq = faq.replace(
  '          <span>Написать в Telegram</span>\n        </a>\n        <a class="help-cta-btn-call"',
  '          <span data-i18n="faq.cta.tg">Написать в Telegram</span>\n        </a>\n        <a class="help-cta-btn-call"'
);
fs.writeFileSync('faq.html', faq, 'utf8');
console.log('faq.html patched');

// 5. care.html
let care = fs.readFileSync('care.html', 'utf8');
care = care.replace(
  '<span>Практичный уход · Простые рекомендации</span>',
  '<span data-i18n="care.badge">Практичный уход · Простые рекомендации</span>'
);
care = care.replace(
  '<p class="help-card-desc" style="margin-top:auto;font-size:13px;opacity:0.85">Для освежения мебели достаточно протереть её мягкой влажной салфеткой.</p>',
  '<p class="help-card-desc" style="margin-top:auto;font-size:13px;opacity:0.85" data-i18n="care.b1.note">Для освежения мебели достаточно протереть её мягкой влажной салфеткой.</p>'
);
care = care.replace(
  '<p class="help-card-desc" style="margin-top:auto;font-size:13px;opacity:0.85">Столешницы из ЛДСП рекомендуется использовать в помещениях или под крытым навесом.</p>',
  '<p class="help-card-desc" style="margin-top:auto;font-size:13px;opacity:0.85" data-i18n="care.b2.note">Столешницы из ЛДСП рекомендуется использовать в помещениях или под крытым навесом.</p>'
);
care = care.replace(
  '        <li>Металлический каркас с защитным полимерным покрытием.</li>',
  '        <li data-i18n="care.b3.l1">Металлический каркас с защитным полимерным покрытием.</li>'
);
care = care.replace(
  '        <li>Полимерное волокно устойчиво к климатическим перепадам.</li>',
  '        <li data-i18n="care.b3.l2">Полимерное волокно устойчиво к климатическим перепадам.</li>'
);
care = care.replace(
  '<h3 style="font-family:var(--f-serif,\'Soyuz Grotesk\',\'Unbounded\',sans-serif);font-size:20px;font-weight:700;margin:0 0 6px;color:var(--text)">Уход за подушками</h3>',
  '<h3 style="font-family:var(--f-serif,\'Soyuz Grotesk\',\'Unbounded\',sans-serif);font-size:20px;font-weight:700;margin:0 0 6px;color:var(--text)" data-i18n="care.cushion.t">Уход за подушками</h3>'
);
care = care.replace(
  '<p style="font-size:14.5px;color:var(--muted);line-height:1.6;margin:0">Текстильные подушки рекомендуется защищать от затяжных дождей. Чехлы можно бережно стирать при температуре 30°C без отжима.</p>',
  '<p style="font-size:14.5px;color:var(--muted);line-height:1.6;margin:0" data-i18n="care.cushion.d">Текстильные подушки рекомендуется защищать от затяжных дождей. Чехлы можно бережно стирать при температуре 30°C без отжима.</p>'
);
care = care.replace(
  '<h3 class="help-cta-title">Остались вопросы по уходу за мебелью?</h3>',
  '<h3 class="help-cta-title" data-i18n="care.cta.h">Остались вопросы по уходу за мебелью?</h3>'
);
care = care.replace(
  '<p class="help-cta-text">Свяжитесь со службой заботы BTT в Telegram или по телефону - подскажем рекомендации по эксплуатации для вашей модели.</p>',
  '<p class="help-cta-text" data-i18n="care.cta.p">Свяжитесь со службой заботы BTT в Telegram или по телефону - подскажем рекомендации по эксплуатации для вашей модели.</p>'
);
care = care.replace(
  '        <span>Написать в Telegram</span>\n      </a>\n      <a class="help-cta-btn-call"',
  '        <span data-i18n="care.cta.tg">Написать в Telegram</span>\n      </a>\n      <a class="help-cta-btn-call"'
);
fs.writeFileSync('care.html', care, 'utf8');
console.log('care.html patched');

// 6. login.html
let login = fs.readFileSync('login.html', 'utf8');
login = login.replace(
  '<p class="help-top-sub">Отслеживайте статусы заказов, управляйте адресами доставки и сохраняйте понравившуюся мебель в избранное.</p>',
  '<p class="help-top-sub" data-i18n="auth.sub">Отслеживайте статусы заказов, управляйте адресами доставки и сохраняйте понравившуюся мебель в избранное.</p>'
);
login = login.replace(
  '<span>Безопасная авторизация</span>',
  '<span data-i18n="auth.badge">Безопасная авторизация</span>'
);
fs.writeFileSync('login.html', login, 'utf8');
console.log('login.html patched');

// 7. cookies.html
let cookies = fs.readFileSync('cookies.html', 'utf8');
cookies = cookies.replace(
  '<span>Конфиденциальность · Редакция 2026</span>',
  '<span data-i18n="cookie.badge">Конфиденциальность · Редакция 2026</span>'
);
fs.writeFileSync('cookies.html', cookies, 'utf8');
console.log('cookies.html patched');

// 8. privacy.html
let privacy = fs.readFileSync('privacy.html', 'utf8');
privacy = privacy.replace(
  '<span>Защита данных · Редакция 2026</span>',
  '<span data-i18n="priv.badge">Защита данных · Редакция 2026</span>'
);
fs.writeFileSync('privacy.html', privacy, 'utf8');
console.log('privacy.html patched');

// 9. rotang-tashkent.html
let rot = fs.readFileSync('rotang-tashkent.html', 'utf8');
rot = rot.replace(
  '<span>В наличии на складе в Ташкенте</span>',
  '<span data-i18n="seo.rotang.stockBadge">В наличии на складе в Ташкенте</span>'
);
rot = rot.replace(
  '<li>Taper Rotang 80×80 см (615 000 сум).</li>',
  '<li data-i18n="seo.rotang.c3.l2">Taper Rotang 80×80 см (615 000 сум).</li>'
);
rot = rot.replace(
  '<li>Taper Rotang 135×80 см (715 000 сум).</li>',
  '<li data-i18n="seo.rotang.c3.l3">Taper Rotang 135×80 см (715 000 сум).</li>'
);
fs.writeFileSync('rotang-tashkent.html', rot, 'utf8');
console.log('rotang-tashkent.html patched');

// 10. returns.html
let ret = fs.readFileSync('returns.html', 'utf8');
ret = ret.replace(
  '<p class="help-step-text">Напишите в Telegram <a href="https://t.me/btt_uz" target="_blank" rel="noopener noreferrer" style="color:var(--copper)">@btt_uz</a> или позвоните по телефону <a href="tel:+998771044422" style="color:var(--copper)">+998 77 104 44 22</a>.</p>',
  '<p class="help-step-text" data-i18n-html="ret.step1.d">Напишите в Telegram <a href="https://t.me/btt_uz" target="_blank" rel="noopener noreferrer" style="color:var(--copper)">@btt_uz</a> или позвоните по телефону <a href="tel:+998771044422" style="color:var(--copper)">+998 77 104 44 22</a>.</p>'
);
fs.writeFileSync('returns.html', ret, 'utf8');
console.log('returns.html patched');

console.log('ALL FILES PATCHED SUCCESSFULLY!');
