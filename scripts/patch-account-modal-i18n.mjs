import fs from 'fs';

const i18nFile = 'assets/i18n.js';
let i18nContent = fs.readFileSync(i18nFile, 'utf8');

const newKeysRU = {
  // Account Address Modal & Actions
  'acc.addr.label': 'Название адреса',
  'acc.addr.city': 'Город',
  'acc.addr.line': 'Улица, дом, квартира',
  'acc.addr.default': 'Сделать адресом по умолчанию',
  'acc.addr.cancel': 'Отмена',
  'acc.addr.del': 'Удалить адрес',
  'acc.addr.office': 'Адрес',
  'acc.addr.edit': 'Изменить',
  'acc.ord.repeat': 'Повторить заказ',
  'acc.ord.expand': 'Подробнее о заказе',
  'toast.repeat': 'Товары добавлены в корзину',
  'toast.addr': 'Включите cookie для управления адресами',
  'toast.addrDeleted': 'Адрес удалён',
  'toast.addrSaved': 'Адрес сохранён',
  'toast.saved': 'Изменения сохранены',
  'auth.err.generic': 'Произошла ошибка. Попробуйте позже.',
  'coMethod': 'Способ получения',
  'coPickup': 'Самовывоз',
  'coDelivery': 'Доставка',
  'coPayment': 'Способ оплаты',
  'coAddress': 'Адрес доставки',
  // Quickview
  'quickview.btn': 'Быстрый просмотр',
  'quickview.close': 'Закрыть',
  'quickview.full': 'Перейти к товару',
  'pdp.sticky.order': 'Сделать на заказ',
  // Cookie Prefs
  'ck.prefs.status.accepted': 'Согласие принято. Данные могут отправляться на сервер.',
  'ck.prefs.status.pending': 'Согласие не принято. Запросы к серверу заблокированы.',
  // Blog & SEO
  'blog.readTime': '{min} мин чтения',
  'blog.error': 'Не удалось загрузить статьи.',
  'blog.retry': 'Повторить попытку',
  'blog.empty': 'В блоге пока нет опубликованных статей.',
  'blog.featured': 'Рекомендуем к прочтению',
  'blog.read': 'Читать статью',
  'blog.cta.title': 'Остались вопросы по выбору мебели?',
  'blog.cta.sub': 'Наши специалисты помогут подобрать модели под ваши задачи и интерьер.',
  'blog.cta.btn': 'Задать вопрос в Telegram',
  'blog.noResults': 'По вашему запросу статей не найдено.',
  'blog.notFound': 'Статья не найдена',
  'meta.article.keywords': 'мебель ташкент, статьи о мебели, блог btt, интерьер, терраса',
  'nav.catalog2': 'Каталог',
  'blog.back': '← Ко всем статьям',
  'bot.aria.close': 'Закрыть поиск',
  'pal.spec': 'Характеристики',
  'pal.title': 'BTT - мебель для дома и сада',
  'pal.hero.alt': 'Мебель BTT для дома и сада',
  'pal.art': 'Статья',
  'meta.lp.rotang.title': 'BTT - Мебель из искусственного ротанга в Ташкенте',
  'lp.rotang.title': 'Мебель из искусственного ротанга в Ташкенте',
  'meta.lp.garden.title': 'BTT - Мебель для сада и террасы в Ташкенте',
  'lp.garden.title': 'Мебель для сада и террасы в Ташкенте'
};

const newKeysUZ = {
  // Account Address Modal & Actions
  'acc.addr.label': 'Manzil nomi',
  'acc.addr.city': 'Shahar',
  'acc.addr.line': 'Ko‘cha, uy, xonadon',
  'acc.addr.default': 'Asosiy manzil sifatida belgilash',
  'acc.addr.cancel': 'Bekor qilish',
  'acc.addr.del': 'Manzilni o‘chirish',
  'acc.addr.office': 'Manzil',
  'acc.addr.edit': 'O‘zgartirish',
  'acc.ord.repeat': 'Buyurtmani takrorlash',
  'acc.ord.expand': 'Buyurtma tafsilotlari',
  'toast.repeat': 'Mahsulotlar savatga qo‘shildi',
  'toast.addr': 'Manzillarni boshqarish uchun cookie-ni yoqing',
  'toast.addrDeleted': 'Manzil o‘chirildi',
  'toast.addrSaved': 'Manzil saqlandi',
  'toast.saved': 'O‘zgarishlar saqlandi',
  'auth.err.generic': 'Xatolik yuz berdi. Keyinroq urinib ko‘ring.',
  'coMethod': 'Qabul qilish usuli',
  'coPickup': 'Olib ketish',
  'coDelivery': 'Yetkazib berish',
  'coPayment': 'To‘lov usuli',
  'coAddress': 'Yetkazish manzili',
  // Quickview
  'quickview.btn': 'Tezkor ko‘rish',
  'quickview.close': 'Yopish',
  'quickview.full': 'Mahsulotga o‘tish',
  'pdp.sticky.order': 'Buyurtma berish',
  // Cookie Prefs
  'ck.prefs.status.accepted': 'Rozilik qabul qilindi. Ma’lumotlar serverga yuborilishi mumkin.',
  'ck.prefs.status.pending': 'Rozilik berilmagan. Server so‘rovlari bloklangan.',
  // Blog & SEO
  'blog.readTime': '{min} daqiqa mutolaa',
  'blog.error': 'Maqolalarni yuklab bo‘lmadi.',
  'blog.retry': 'Qayta urinish',
  'blog.empty': 'Blogda hozircha chop etilgan maqolalar yo‘q.',
  'blog.featured': 'O‘qishga tavsiya etamiz',
  'blog.read': 'Maqolani o‘qish',
  'blog.cta.title': 'Mebel tanlash bo‘yicha savollaringiz bormi?',
  'blog.cta.sub': 'Mutaxassislarimiz vazifalaringiz va interyeringizga mos modellarni tanlashda yordam berishadi.',
  'blog.cta.btn': 'Telegramda savol berish',
  'blog.noResults': 'So‘rovingiz bo‘yicha maqolalar topilmadi.',
  'blog.notFound': 'Maqola topilmadi',
  'meta.article.keywords': 'toshkent mebellari, mebel haqida maqolalar, btt blogi, interyer, terrasa',
  'nav.catalog2': 'Katalog',
  'blog.back': '← Barcha maqolalarga',
  'bot.aria.close': 'Qidiruvni yopish',
  'pal.spec': 'Xususiyatlar',
  'pal.title': 'BTT - uy va bog‘ mebellari',
  'pal.hero.alt': 'Uy va bog‘ uchun BTT mebellari',
  'pal.art': 'Maqola',
  'meta.lp.rotang.title': 'BTT - Toshkentda sun’iy rotan mebellari',
  'lp.rotang.title': 'Toshkentda sun’iy rotan mebellari',
  'meta.lp.garden.title': 'BTT - Toshkentda bog‘ va terrasa mebellari',
  'lp.garden.title': 'Toshkentda bog‘ va terrasa mebellari'
};

const newKeysEN = {
  // Account Address Modal & Actions
  'acc.addr.label': 'Address label',
  'acc.addr.city': 'City',
  'acc.addr.line': 'Street, building, apt',
  'acc.addr.default': 'Set as default address',
  'acc.addr.cancel': 'Cancel',
  'acc.addr.del': 'Delete address',
  'acc.addr.office': 'Address',
  'acc.addr.edit': 'Edit',
  'acc.ord.repeat': 'Repeat order',
  'acc.ord.expand': 'Order details',
  'toast.repeat': 'Items added to cart',
  'toast.addr': 'Enable cookies to manage addresses',
  'toast.addrDeleted': 'Address deleted',
  'toast.addrSaved': 'Address saved',
  'toast.saved': 'Changes saved',
  'auth.err.generic': 'An error occurred. Please try again later.',
  'coMethod': 'Fulfillment method',
  'coPickup': 'Self-pickup',
  'coDelivery': 'Delivery',
  'coPayment': 'Payment method',
  'coAddress': 'Delivery address',
  // Quickview
  'quickview.btn': 'Quick view',
  'quickview.close': 'Close',
  'quickview.full': 'View product',
  'pdp.sticky.order': 'Order custom',
  // Cookie Prefs
  'ck.prefs.status.accepted': 'Consent accepted. Data may be sent to the server.',
  'ck.prefs.status.pending': 'Consent not given. Server requests are blocked.',
  // Blog & SEO
  'blog.readTime': '{min} min read',
  'blog.error': 'Failed to load articles.',
  'blog.retry': 'Try again',
  'blog.empty': 'No published articles in the blog yet.',
  'blog.featured': 'Featured article',
  'blog.read': 'Read article',
  'blog.cta.title': 'Have questions about choosing furniture?',
  'blog.cta.sub': 'Our specialists will help you choose models for your interior and needs.',
  'blog.cta.btn': 'Ask a question on Telegram',
  'blog.noResults': 'No articles found for your query.',
  'blog.notFound': 'Article not found',
  'meta.article.keywords': 'tashkent furniture, furniture articles, btt blog, interior, terrace',
  'nav.catalog2': 'Catalog',
  'blog.back': '← Back to all articles',
  'bot.aria.close': 'Close search',
  'pal.spec': 'Specifications',
  'pal.title': 'BTT - Home and Garden Furniture',
  'pal.hero.alt': 'BTT furniture for home and garden',
  'pal.art': 'Article',
  'meta.lp.rotang.title': 'BTT - Artificial Rattan Furniture in Tashkent',
  'lp.rotang.title': 'Artificial Rattan Furniture in Tashkent',
  'meta.lp.garden.title': 'BTT - Garden and Terrace Furniture in Tashkent',
  'lp.garden.title': 'Garden and Terrace Furniture in Tashkent'
};

// Check for forbidden em-dash / en-dash
for (const [k, v] of Object.entries({...newKeysRU, ...newKeysUZ, ...newKeysEN})) {
  if (k.includes('-') || k.includes('-') || v.includes('-') || v.includes('-')) {
    console.error(`ERROR: Dash found in ${k}: ${v}`);
    process.exit(1);
  }
}

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

// RU anchor: after seo.sadovaya.cta.d
addKeysToLang(lines, 'seo.sadovaya.cta.d', newKeysRU, 300, 600);

// UZ anchor: after seo.sadovaya.cta.d
addKeysToLang(lines, 'seo.sadovaya.cta.d', newKeysUZ, 1000, 1500);

// EN anchor: after seo.sadovaya.cta.d
addKeysToLang(lines, 'seo.sadovaya.cta.d', newKeysEN, 1800, 2400);

fs.writeFileSync(i18nFile, lines.join('\n'), 'utf8');
console.log('assets/i18n.js updated successfully!');

// === Now patch assets/account.js with resilient fallback text ===
let accJs = fs.readFileSync('assets/account.js', 'utf8');

accJs = accJs.replace(
  '<div class="field"><label>\'+esc(t("acc.addr.label"))+\'</label><input name="label"></div>',
  '<div class="field"><label>\'+esc(t("acc.addr.label") || "Название адреса")+\'</label><input name="label" placeholder="Например: Дом или Офис"></div>'
);
accJs = accJs.replace(
  '<div class="field"><label>\'+esc(t("acc.addr.city"))+\'</label><input name="city"></div>',
  '<div class="field"><label>\'+esc(t("acc.addr.city") || "Город")+\'</label><input name="city" placeholder="Ташкент"></div>'
);
accJs = accJs.replace(
  '<div class="field"><label>\'+esc(t("acc.addr.line"))+\'</label><input name="line"></div>',
  '<div class="field"><label>\'+esc(t("acc.addr.line") || "Улица, дом, квартира")+\'</label><input name="line" placeholder="Улица, дом, квартира / офис"></div>'
);
accJs = accJs.replace(
  '<span>\'+esc(t("acc.addr.default"))+\'</span>',
  '<span>\'+esc(t("acc.addr.default") || "Сделать адресом по умолчанию")+\'</span>'
);
accJs = accJs.replace(
  'data-addr-cancel>\'+esc(t("acc.addr.cancel"))+\'</button>',
  'data-addr-cancel>\'+esc(t("acc.addr.cancel") || "Отмена")+\'</button>'
);
accJs = accJs.replace(
  'data-addr-del hidden>\'+esc(t("acc.addr.del"))+\'</button>',
  'data-addr-del hidden>\'+esc(t("acc.addr.del") || "Удалить адрес")+\'</button>'
);

fs.writeFileSync('assets/account.js', accJs, 'utf8');
console.log('assets/account.js patched with resilient fallbacks!');
