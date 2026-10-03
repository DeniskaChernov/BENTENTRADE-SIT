const baseTopicsRu = [
  'ротанговая нить',
  'искусственный ротанг',
  'синтетический ротанг',
  'ротанг для плетения',
  'ротанг оптом',
  'ротанг в розницу',
  'плетеные кашпо',
  'кашпо из ротанга',
  'кашпо ручной работы',
  'садовые кашпо',
  'напольные кашпо',
  'подвесные кашпо',
  'декоративные кашпо',
  'материалы для плетения',
  'ротанг для мебели',
  'рattan материал',
];

const intentRu = [
  'купить',
  'заказать',
  'цена',
  'стоимость',
  'недорого',
  'лучшее предложение',
  'от производителя',
  'с доставкой',
  'в наличии',
  'оптом',
  'для бизнеса',
  'для дома',
  'каталог',
  'прайс',
];

const geoRu = [
  'в ташкенте',
  'ташкент',
  'в узбекистане',
  'узбекистан',
  'по узбекистану',
  'ташкент цена',
  'ташкент оптом',
];

const productDetailsRu = [
  '18 цветов',
  '5 типов',
  'полусфера',
  'сфера',
  'плоский',
  'полумесяц',
  'трубка',
  '5 кг минимум',
  'ротанг 36000 сум',
  'кашпо от 120000 сум',
  'кашпо 5л',
  'кашпо 10л',
  'кашпо 16л',
];

function uniq(input: string[]) {
  return [...new Set(input.map((s) => s.trim().toLowerCase()))];
}

function buildRuKeywords(): string[] {
  const phrases: string[] = [];

  for (const topic of baseTopicsRu) {
    for (const intent of intentRu) {
      for (const geo of geoRu) {
        phrases.push(`${intent} ${topic} ${geo}`);
      }
    }
  }

  for (const topic of baseTopicsRu) {
    for (const detail of productDetailsRu) {
      phrases.push(`${topic} ${detail}`);
      phrases.push(`купить ${topic} ${detail} в ташкенте`);
      phrases.push(`${topic} ${detail} цена`);
    }
  }

  // Брендовые и транзакционные хвосты.
  const brandTail = [
    'bententrade ротанг',
    'bententrade кашпо',
    'bententrade ташкент',
    'bententrade каталог',
    'производитель ротанга bententrade',
    'плетеные кашпо bententrade',
    'искусственный ротанг bententrade',
  ];
  phrases.push(...brandTail);

  return uniq(phrases).slice(0, 1100);
}

export const SEO_KEYWORDS_RU = buildRuKeywords();

export function getPageKeywords(
  page: 'home' | 'catalog' | 'product' | 'profile' | 'legal' | 'blog' | 'wholesale' | 'export',
  language: 'ru' | 'uz' | 'en',
): string[] {
  if (language === 'en') {
    if (page === 'wholesale') {
      return [
        'wholesale artificial rattan uzbekistan',
        'b2b planters tashkent',
        'bententrade wholesale',
        'hoReCa rattan supplier',
      ];
    }
    if (page === 'export') {
      return [
        'export rattan uzbekistan',
        'bententrade export',
        'commercial invoice planters',
        'usd rattan supplier',
      ];
    }
    if (page === 'product') {
      return [
        'bententrade product',
        'artificial rattan tashkent',
        'planters buy uzbekistan',
        'rattan thread price',
      ];
    }
    if (page === 'profile') {
      return ['bententrade profile', 'guest checkout', 'fast order uzbekistan'];
    }
    return [
      'artificial rattan uzbekistan',
      'rattan thread tashkent',
      'woven planters uzbekistan',
      'synthetic rattan wholesale',
      'bententrade',
      'planters manufacturer tashkent',
      'buy rattan uzbekistan',
      'uv resistant rattan',
    ];
  }

  if (language === 'uz') {
    if (page === 'wholesale') {
      return ['rattan opt', 'kashpo ulgurji', 'bententrade opt', 'hoReCa rattan'];
    }
    if (page === 'export') {
      return ['rattan eksport', 'kashpo eksport', 'bententrade eksport', 'usd yetkazib berish'];
    }
    if (page === 'product') {
      return ['bententrade mahsulot', 'rattan sotib olish', 'kashpo narxi', 'tez buyurtma'];
    }
    if (page === 'profile') {
      return ['bententrade profil', 'tez buyurtma', 'mehmon profili'];
    }
    return [
      'rattan ip',
      'suniy rattan',
      'rattan ip narxi',
      'toshkent rattan',
      'kashpo buyurtma',
      'toqilgan kashpo',
      'rattan ulgurji',
      'bententrade',
      'rattan katalog',
      'ozbekiston boylab yetkazib berish',
    ];
  }

  if (page === 'wholesale') {
    return SEO_KEYWORDS_RU.filter((k) => k.includes('опт')).slice(0, 400);
  }

  if (page === 'export') {
    return [
      'экспорт ротанга узбекистан',
      'ротанг оптом экспорт',
      'кашпо экспорт bententrade',
      'коммерческое предложение ротанг',
    ];
  }

  if (page === 'catalog' || page === 'product') {
    return SEO_KEYWORDS_RU.filter(
      (k) =>
        k.includes('купить') ||
        k.includes('цена') ||
        k.includes('каталог') ||
        k.includes('оптом')
    ).slice(0, 1000);
  }

  if (page === 'profile') {
    return [
      'профиль bententrade',
      'быстрый заказ bententrade',
      'оформление в один клик',
      'гостевой профиль заказ',
    ];
  }

  if (page === 'legal') {
    return [
      'политика конфиденциальности bententrade',
      'условия использования bententrade',
      'публичная оферта bententrade',
      'правовая информация bententrade',
      'обработка персональных данных bententrade',
    ];
  }

  if (page === 'blog') {
    return SEO_KEYWORDS_RU.filter(
      (k) =>
        k.includes('ротанг') ||
        k.includes('кашпо') ||
        k.includes('каталог') ||
        k.includes('плетеные')
    ).slice(0, 400);
  }

  return SEO_KEYWORDS_RU.slice(0, 1000);
}
