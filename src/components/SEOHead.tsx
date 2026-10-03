import { memo, useEffect } from 'react';
import { useLanguage } from '../utils/language-context';
import { getPageKeywords } from '../utils/seo-keywords';

interface SEOHeadProps {
  page: 'home' | 'catalog' | 'product' | 'profile' | 'legal' | 'blog' | 'wholesale' | 'export';
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  canonicalUrl?: string;
  // ❌ УДАЛЕНО: noindex больше не используется - ВСЕГДА index!
}

export const SEOHead = memo(function SEOHead({ 
  page, 
  title: customTitle, 
  description: customDescription,
  keywords: customKeywords,
  image: customImage,
  canonicalUrl: customCanonicalUrl,
  // ❌ УДАЛЕНО: noindex = false
}: SEOHeadProps) {
  const { language } = useLanguage();

  // SEO данные для разных страниц на русском
  const seoDataRu = {
    home: {
      title: 'Купить ротанговую нить в Ташкенте от 36000 сум | Плетеные кашпо 18 цветов - Bententrade',
      description: '⭐ Ротанговая нить от производителя - 36000 сум/кг, 5 типов, 18 цветов ⭐ Плетеные кашпо ручной работы от 120000 сум ⭐ Доставка по Узбекистану ☎️ +998 77 104 44 22',
      keywords: 'ротанговая нить ташкент, купить ротанг ташкент, кашпо купить ташкент, плетеные кашпо, искусственый ротанг узбекистан, ротанг оптом, кашпо ротанг, синтетический ротанг, мебельная нить, ротанг цена за кг, кашпо ручной работы, плетение ротанг, купить ротанг для плетения, ротанг 18 цветов, кашпо 10 литров'
    },
    catalog: {
      title: 'Каталог: Ротанговая нить 36000 сум/кг и Плетеные кашпо от 120000 сум | Bententrade Ташкент',
      description: '✅ Полный каталог ротанговой нити (5 типов) и плетёных кашпо от производителя ✅ 18 цветов в наличии ✅ Цены: ротанг 36000 сум/кг, кашпо от 120000 сум ✅ Оптом и в розницу',
      keywords: 'каталог ротанга, купить ротанг ташкент цена, кашпо каталог цены, ротанг оптом цена, плетеные изделия каталог, кашпо настенные, подвесные кашпо, напольные кашпо, ротанг полусфера, ротанг сфера, ротанг плоский'
    },
    product: {
      title: 'Товар | Bententrade',
      description: 'Карточка товара: ротанговая нить или кашпо — цена, варианты, быстрый заказ.',
      keywords: 'ротанг купить, кашпо bententrade, карточка товара',
    },
    profile: {
      title: 'Профиль | Bententrade',
      description: 'Сохраните имя, телефон и способ оплаты для быстрого оформления заказа.',
      keywords: 'профиль bententrade, быстрый заказ, гостевой профиль',
    },
    legal: {
      title: 'Юридическая информация | Bententrade',
      description: 'Политика конфиденциальности, условия использования и политика возврата - Bententrade',
      keywords: 'политика конфиденциальности, условия использования, возврат товара'
    },
    blog: {
      title: 'Блог и новости Bententrade',
      description: 'Новости компании, обновления коллекций и полезные материалы по уходу за изделиями из ротанга.',
      keywords: 'блог bententrade, новости ротанг, статьи о кашпо, уход за ротангом'
    },
    wholesale: {
      title: 'Опт ротанга и кашпо от производителя | Bententrade Ташкент',
      description: 'Оптовые партии искусственного ротанга и плетёных кашпо: стабильные цвета, счёт, доставка по Узбекистану. Запросите КП.',
      keywords: 'ротанг оптом ташкент, кашпо опт, bententrade опт, hoReCa ротанг, опт ротанговая нить',
    },
    export: {
      title: 'Экспорт ротанга и кашпо | Bententrade — расчёт доставки и КП',
      description: 'Поставки искусственного ротанга и кашпо на экспорт: USD, документы, логистика. Коммерческое предложение по запросу.',
      keywords: 'экспорт ротанг, artificial rattan export uzbekistan, bententrade export, wholesale planters CIS',
    },
  };

  // SEO данные для разных страниц на узбекском
  const seoDataUz = {
    home: {
      title: 'Bententrade - Toshkentda rattan ip va to\'qilgan guldonlar | Sun\'iy rattan sotib olish',
      description: 'Toshkentda sifatli sun\'iy rattan ip va to\'qilgan guldonlarni ishlab chiqarish va sotish. Keng rang va o\'lchamlar tanlovi. O\'zbekiston bo\'ylab yetkazib berish. ☎️ +998 77 104 44 22',
      keywords: 'rattan ip, rattan sotib olish, to\'qilgan guldonlar, sun\'iy rattan, Toshkent, O\'zbekiston, rattan narxi, guldon sotib olish, bententrade'
    },
    catalog: {
      title: 'Mahsulotlar katalogi - Rattan ip va guldonlar | Bententrade Toshkent',
      description: 'Ishlab chiqaruvchidan rattan ip va to\'qilgan guldonlarning to\'liq katalogi. Turli o\'lchamlar, ranglar va uslublar. Toshkentda sifatli mahsulotlar. Narxlar 35 000 so\'mdan.',
      keywords: 'rattan katalogi, rattan sotib olish toshkent, guldon katalogi, rattan narxlari, to\'qilgan mahsulotlar'
    },
    product: {
      title: 'Mahsulot | Bententrade',
      description: 'Mahsulot kartochkasi: rattan ip yoki guldon — narx, variantlar, tez buyurtma.',
      keywords: 'rattan sotib olish, kashpo bententrade, mahsulot',
    },
    profile: {
      title: 'Profil | Bententrade',
      description: 'Ism, telefon va to‘lov — keyingi buyurtmalar uchun tezroq.',
      keywords: 'profil bententrade, tez buyurtma',
    },
    legal: {
      title: 'Yuridik ma\'lumot | Bententrade',
      description: 'Maxfiylik siyosati, foydalanish shartlari va qaytarish siyosati - Bententrade',
      keywords: 'maxfiylik siyosati, foydalanish shartlari, mahsulot qaytarish'
    },
    blog: {
      title: 'Bententrade blog va yangiliklar',
      description: 'Kompaniya yangiliklari, yangi kolleksiyalar va rattan mahsulotlari parvarishi bo`yicha foydali maqolalar.',
      keywords: 'bententrade blog, rattan yangiliklar, guldon maqolalari, rattan parvarishi'
    },
    wholesale: {
      title: 'Rattan va kashpo opt | Bententrade Toshkent',
      description: 'Ishlab chiqaruvchidan opt partiyalar: barqaror ranglar, hisob-faktura, O‘zbekiston bo‘ylab yetkazib berish.',
      keywords: 'rattan opt, kashpo opt, bententrade ulgurji, hoReCa rattan',
    },
    export: {
      title: 'Rattan va kashpo eksporti | Bententrade',
      description: 'Eksport: USD, hujjatlar, logistika. TK bo‘yicha hisob-kitob va TK.',
      keywords: 'rattan eksport, bententrade export, suniy rattan export',
    },
  };

  const seoDataEn = {
    home: {
      title: 'Artificial rattan & planters in Tashkent | Bententrade — pick & buy fast',
      description:
        'Manufacturer in Tashkent: artificial rattan thread and hand-woven planters. Guest checkout, Uzcard/Humo/Payme/Click. Delivery in Uzbekistan.',
      keywords:
        'artificial rattan tashkent, synthetic rattan thread, woven planters uzbekistan, bententrade, buy rattan uzbekistan, planters manufacturer',
    },
    catalog: {
      title: 'Catalog: rattan thread & planters | Bententrade',
      description: 'Full catalog from the manufacturer: profiles, colors, planters. Prices in UZS, wholesale and retail.',
      keywords: 'rattan catalog, planters price tashkent, artificial rattan profiles, bententrade catalog',
    },
    product: {
      title: 'Product | Bententrade',
      description: 'Product page: artificial rattan or planters — pricing, options, quick checkout.',
      keywords: 'bententrade product, buy rattan uzbekistan, planters',
    },
    profile: {
      title: 'Profile | Bententrade',
      description: 'Save your name, phone and payment for faster checkout.',
      keywords: 'bententrade profile, guest checkout',
    },
    legal: {
      title: 'Legal information | Bententrade',
      description: 'Privacy policy, terms of use, and returns — Bententrade.',
      keywords: 'bententrade privacy, terms of use, returns policy',
    },
    blog: {
      title: 'Bententrade blog & news',
      description: 'Company updates, new collections, and care tips for rattan products.',
      keywords: 'bententrade blog, rattan news, planter care',
    },
    wholesale: {
      title: 'Wholesale rattan & planters | Bententrade Tashkent',
      description: 'B2B batches from the manufacturer: stable colours, invoicing, delivery across Uzbekistan.',
      keywords: 'rattan wholesale uzbekistan, bententrade wholesale, planters b2b',
    },
    export: {
      title: 'Export rattan & planters | Bententrade',
      description: 'Export quotes in USD, shipping and customs support. Request a commercial offer.',
      keywords: 'bententrade export, artificial rattan export, uzbekistan wholesale export',
    },
  };

  const seoData =
    language === 'uz' ? seoDataUz : language === 'en' ? seoDataEn : seoDataRu;
  const pageData = seoData[page];

  const title = customTitle || pageData.title;
  const description = customDescription || pageData.description;
  const generatedKeywords = getPageKeywords(page, language);
  const keywords = customKeywords || generatedKeywords.join(', ');
  const image = customImage || 'https://bententrade.uz/og-image.png';
  const canonicalUrl = customCanonicalUrl || (
    page === 'catalog'
      ? 'https://bententrade.uz/catalog'
      : page === 'profile'
        ? 'https://bententrade.uz/profile'
        : page === 'legal'
          ? 'https://bententrade.uz/legal'
          : page === 'blog'
            ? 'https://bententrade.uz/blog'
            : page === 'wholesale'
              ? 'https://bententrade.uz/wholesale'
              : page === 'export'
                ? 'https://bententrade.uz/export'
                : page === 'product'
                  ? 'https://bententrade.uz/catalog'
                  : 'https://bententrade.uz/'
  );

  useEffect(() => {
    const upsertMeta = (
      selector: string,
      attrs: Record<string, string>,
      content: string
    ) => {
      let meta = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        Object.entries(attrs).forEach(([key, value]) => meta!.setAttribute(key, value));
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const upsertLink = (
      selector: string,
      attrs: Record<string, string>
    ) => {
      let link = document.head.querySelector(selector) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        document.head.appendChild(link);
      }
      Object.entries(attrs).forEach(([key, value]) => {
        (link as HTMLLinkElement).setAttribute(key, value);
      });
    };

    // Обновляем title
    document.title = title;

    // Robots
    upsertMeta('meta[name="robots"]', { name: 'robots' }, 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    upsertMeta('meta[name="googlebot"]', { name: 'googlebot' }, 'index, follow');
    upsertMeta('meta[name="bingbot"]', { name: 'bingbot' }, 'index, follow');

    // Primary
    upsertMeta('meta[name="description"]', { name: 'description' }, description);
    upsertMeta('meta[name="keywords"]', { name: 'keywords' }, keywords);
    upsertMeta('meta[name="news_keywords"]', { name: 'news_keywords' }, generatedKeywords.slice(0, 50).join(', '));
    upsertMeta('meta[name="author"]', { name: 'author' }, 'Bententrade');

    // Language & geo
    upsertMeta(
      'meta[http-equiv="content-language"]',
      { 'http-equiv': 'content-language' },
      language === 'uz' ? 'uz-UZ' : language === 'en' ? 'en-UZ' : 'ru-UZ'
    );
    upsertMeta('meta[name="geo.region"]', { name: 'geo.region' }, 'UZ-TK');
    upsertMeta('meta[name="geo.placename"]', { name: 'geo.placename' }, 'Ташкент');
    upsertMeta('meta[name="geo.position"]', { name: 'geo.position' }, '41.2995;69.2401');
    upsertMeta('meta[name="ICBM"]', { name: 'ICBM' }, '41.2995, 69.2401');

    // Open Graph
    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl);
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, title);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, image);
    upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width' }, '1200');
    upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height' }, '630');
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt' }, 'Bententrade - ротанговая нить и плетеные кашпо');
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, 'Bententrade');
    upsertMeta(
      'meta[property="og:locale"]',
      { property: 'og:locale' },
      language === 'uz' ? 'uz_UZ' : language === 'en' ? 'en_US' : 'ru_UZ'
    );
    upsertMeta(
      'meta[property="og:locale:alternate"]',
      { property: 'og:locale:alternate' },
      language === 'uz' ? 'ru_UZ' : language === 'en' ? 'ru_UZ' : 'uz_UZ'
    );

    // Twitter
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
    upsertMeta('meta[name="twitter:url"]', { name: 'twitter:url' }, canonicalUrl);
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title);
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description);
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, image);
    upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt' }, 'Bententrade - каталог ротанговой нити и кашпо');

    // Mobile/perf
    upsertMeta('meta[name="viewport"]', { name: 'viewport' }, 'width=device-width, initial-scale=1.0, maximum-scale=5.0');
    upsertMeta('meta[name="theme-color"]', { name: 'theme-color' }, '#f8fafc');
    upsertMeta('meta[http-equiv="X-UA-Compatible"]', { 'http-equiv': 'X-UA-Compatible' }, 'IE=edge');
    upsertMeta('meta[name="format-detection"]', { name: 'format-detection' }, 'telephone=no');
    upsertMeta('meta[name="google-site-verification"]', { name: 'google-site-verification' }, 'QnkIBpzO6K2FktpV6_xI4QtjDQxHVcfVkNSC9WEstHY');

    // Canonical + hreflang
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });
    upsertLink('link[hreflang="ru"]', { rel: 'alternate', hreflang: 'ru', href: canonicalUrl });
    upsertLink('link[hreflang="uz"]', { rel: 'alternate', hreflang: 'uz', href: canonicalUrl });
    upsertLink('link[hreflang="x-default"]', { rel: 'alternate', hreflang: 'x-default', href: 'https://bententrade.uz/' });

  }, [title, description, keywords, image, canonicalUrl, language]);

  return null;
});