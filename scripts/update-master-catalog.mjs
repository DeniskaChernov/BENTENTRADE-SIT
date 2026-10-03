// scripts/update-master-catalog.mjs
// Updates table prices and adds table lamps & artificial rattan to data/products-master.json

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MASTER_PATH = path.join(ROOT, 'data', 'products-master.json');

const master = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));

// 1. Update existing table prices according to SSOT
const tableUpdates = {
  'stol-vertex-d90': 730000,
  'stol-taper-rotang-80': 904000,
  'stol-taper-135': 910000,
  'stol-taper-rotang-135': 954000
};

master.forEach(p => {
  if (tableUpdates[p.slug]) {
    p.price = tableUpdates[p.slug];
  }
});

// 2. Prepare new table lamps (6 items)
const lamps = [
  {
    slug: 'lampa-nova',
    legacyId: 'l1',
    model: 'NOVA',
    category: 'lighting',
    price: 401000,
    dimensions: '23,5 × 30,9 см',
    materials: ['металл', 'акрил', 'LED'],
    maxLoad: null,
    confirmedColors: [
      {
        id: 'gold',
        name: { ru: 'Золотистый', uz: 'Oltinrang', en: 'Gold' },
        hex: '#C5A059',
        image: 'assets/prod-lamp-nova.svg',
        images: ['assets/prod-lamp-nova.svg']
      }
    ],
    isTable: false,
    images: ['assets/prod-lamp-nova.svg'],
    i18n: {
      ru: {
        name: 'Настольная лампа «NOVA»',
        category_label: 'Настольные лампы',
        description: 'Настольная лампа NOVA с мягким тёплым освещением. Лаконичный силуэт и комфортный рассеянный свет для спальни, гостиной и рабочего стола.',
        usage: 'Для спальни, кабинета, прикроватной тумбы и гостиной',
        seo_title: 'Купить Настольная лампа «NOVA» в Ташкенте - BTT',
        seo_description: 'Настольная лампа «NOVA» от BTT. Мягкое тёплое освещение. Размеры: 23,5 × 30,9 см. Доставка по Ташкенту и всему Узбекистану.'
      },
      uz: {
        name: '«NOVA» stol lampasi',
        category_label: 'Stol lampalari',
        description: 'Yumshoq iliq nur taratuvchi NOVA stol lampasi. Yotoqxona, mehmonxona va ish stoli uchun zamonaviy qulay dizayn.',
        usage: 'Yotoqxona, kabinet, tumba va mehmonxona uchun',
        seo_title: 'Toshkentda «NOVA» stol lampasi sotib olish - BTT',
        seo_description: 'BTT dan «NOVA» stol lampasi. O‘lchamlari: 23,5 × 30,9 sm. Toshkent va butun O‘zbekiston bo‘ylab yetkazib berish.'
      },
      en: {
        name: 'NOVA Table Lamp',
        category_label: 'Table lamps',
        description: 'NOVA table lamp delivering soft warm ambient light. Clean minimal silhouette for bedside tables, desks, and cozy living corners.',
        usage: 'For bedrooms, desks, bedside stands, and living spaces',
        seo_title: 'Buy NOVA Table Lamp in Tashkent - BTT',
        seo_description: 'NOVA Table Lamp by BTT. Dimensions: 23.5 × 30.9 cm. Delivery across Tashkent and Uzbekistan.'
      }
    },
    status: 'in_stock',
    availability: 'in_stock',
    active: 1,
    currency: 'сум'
  },
  {
    slug: 'lampa-sora',
    legacyId: 'l2',
    model: 'SORA',
    category: 'lighting',
    price: 740000,
    dimensions: '25 × 43 см',
    materials: ['металл', 'акрил', 'LED'],
    maxLoad: null,
    confirmedColors: [
      {
        id: 'amber',
        name: { ru: 'Янтарный', uz: 'Qahrabo', en: 'Amber' },
        hex: '#D49B5B',
        image: 'assets/prod-lamp-sora.svg',
        images: ['assets/prod-lamp-sora.svg']
      }
    ],
    isTable: false,
    images: ['assets/prod-lamp-sora.svg'],
    i18n: {
      ru: {
        name: 'Настольная лампа «SORA»',
        category_label: 'Настольные лампы',
        description: 'Настольная лампа SORA с мягким тёплым освещением. Выразительный куполообразный плафон и гармоничные пропорции для акцентного света.',
        usage: 'Для гостиной, консоли, прикроватной зоны и кабинета',
        seo_title: 'Купить Настольная лампа «SORA» в Ташкенте - BTT',
        seo_description: 'Настольная лампа «SORA» от BTT. Мягкое тёплое освещение. Размеры: 25 × 43 см. Доставка по Ташкенту и всему Узбекистану.'
      },
      uz: {
        name: '«SORA» stol lampasi',
        category_label: 'Stol lampalari',
        description: 'Yumshoq iliq yorug‘likli SORA stol lampasi. Gumbazsimon qopqoq va interyer uchun nafis proporsiyalar.',
        usage: 'Mehmonxona, konsol, karavot yonidagi hudud va ish xonasi uchun',
        seo_title: 'Toshkentda «SORA» stol lampasi sotib olish - BTT',
        seo_description: 'BTT dan «SORA» stol lampasi. O‘lchamlari: 25 × 43 sm. Toshkent va butun O‘zbekiston bo‘ylab yetkazib berish.'
      },
      en: {
        name: 'SORA Table Lamp',
        category_label: 'Table lamps',
        description: 'SORA table lamp offering gentle warm lighting. Elegant dome shade and balanced proportions for refined interior styling.',
        usage: 'For living room, console, bedside area, and study',
        seo_title: 'Buy SORA Table Lamp in Tashkent - BTT',
        seo_description: 'SORA Table Lamp by BTT. Dimensions: 25 × 43 cm. Delivery across Tashkent and Uzbekistan.'
      }
    },
    status: 'in_stock',
    availability: 'in_stock',
    active: 1,
    currency: 'сум'
  },
  {
    slug: 'lampa-vela',
    legacyId: 'l3',
    model: 'VELA',
    category: 'lighting',
    price: 332000,
    dimensions: '25 × 43 см',
    materials: ['металл', 'акрил', 'LED'],
    maxLoad: null,
    confirmedColors: [
      {
        id: 'sand',
        name: { ru: 'Песочный', uz: 'Qumrang', en: 'Sand' },
        hex: '#C9B086',
        image: 'assets/prod-lamp-vela.svg',
        images: ['assets/prod-lamp-vela.svg']
      }
    ],
    isTable: false,
    images: ['assets/prod-lamp-vela.svg'],
    i18n: {
      ru: {
        name: 'Настольная лампа «VELA»',
        category_label: 'Настольные лампы',
        description: 'Настольная лампа VELA с мягким тёплым освещением. Лаконичная геометрия и уютный вечерний свет для дома.',
        usage: 'Для спальни, прикроватной тумбочки и зоны отдыха',
        seo_title: 'Купить Настольная лампа «VELA» в Ташкенте - BTT',
        seo_description: 'Настольная лампа «VELA» от BTT. Мягкое тёплое освещение. Размеры: 25 × 43 см. Доставка по Ташкенту и всему Узбекистану.'
      },
      uz: {
        name: '«VELA» stol lampasi',
        category_label: 'Stol lampalari',
        description: 'Yumshoq iliq nurli VELA stol lampasi. Uy uchun qulay kechki muhit yaratuvchi sodda va ixcham dizayn.',
        usage: 'Yotoqxona, tumba va dam olish hududi uchun',
        seo_title: 'Toshkentda «VELA» stol lampasi sotib olish - BTT',
        seo_description: 'BTT dan «VELA» stol lampasi. O‘lchamlari: 25 × 43 sm. Toshkent va butun O‘zbekiston bo‘ylab yetkazib berish.'
      },
      en: {
        name: 'VELA Table Lamp',
        category_label: 'Table lamps',
        description: 'VELA table lamp with soft warm illumination. Understated geometry that creates a restful atmosphere at home.',
        usage: 'For bedrooms, bedside tables, and lounge spots',
        seo_title: 'Buy VELA Table Lamp in Tashkent - BTT',
        seo_description: 'VELA Table Lamp by BTT. Dimensions: 25 × 43 cm. Delivery across Tashkent and Uzbekistan.'
      }
    },
    status: 'in_stock',
    availability: 'in_stock',
    active: 1,
    currency: 'сум'
  },
  {
    slug: 'lampa-runa',
    legacyId: 'l4',
    model: 'RUNA',
    category: 'lighting',
    price: 491000,
    dimensions: '19 × 22,3 см',
    materials: ['металл', 'акрил', 'LED'],
    maxLoad: null,
    confirmedColors: [
      {
        id: 'ochre',
        name: { ru: 'Охра', uz: 'Oxra', en: 'Ochre' },
        hex: '#BA7E45',
        image: 'assets/prod-lamp-runa.svg',
        images: ['assets/prod-lamp-runa.svg']
      }
    ],
    isTable: false,
    images: ['assets/prod-lamp-runa.svg'],
    i18n: {
      ru: {
        name: 'Настольная лампа «RUNA»',
        category_label: 'Настольные лампы',
        description: 'Настольная лампа RUNA с мягким тёплым освещением. Компактные габариты позволяют удобно разместить лампу на полке, подоконнике или столике.',
        usage: 'Для журнального столика, полок, спальни и рабочего места',
        seo_title: 'Купить Настольная лампа «RUNA» в Ташкенте - BTT',
        seo_description: 'Настольная лампа «RUNA» от BTT. Мягкое тёплое освещение. Размеры: 19 × 22,3 см. Доставка по Ташкенту и всему Узбекистану.'
      },
      uz: {
        name: '«RUNA» stol lampasi',
        category_label: 'Stol lampalari',
        description: 'Yumshoq iliq nurlanishli RUNA stol lampasi. Ixcham o‘lchamlari tufayli javonlar va kofe stollari ustiga qulay joylashadi.',
        usage: 'Kofe stoli, javonlar, yotoqxona va ish joyi uchun',
        seo_title: 'Toshkentda «RUNA» stol lampasi sotib olish - BTT',
        seo_description: 'BTT dan «RUNA» stol lampasi. O‘lchamlari: 19 × 22,3 sm. Toshkent va butun O‘zbekiston bo‘ylab yetkazib berish.'
      },
      en: {
        name: 'RUNA Table Lamp',
        category_label: 'Table lamps',
        description: 'RUNA table lamp featuring soft warm illumination. Compact footprint fits neatly on shelves, coffee tables, or nightstands.',
        usage: 'For coffee tables, shelving, bedrooms, and workstations',
        seo_title: 'Buy RUNA Table Lamp in Tashkent - BTT',
        seo_description: 'RUNA Table Lamp by BTT. Dimensions: 19 × 22.3 cm. Delivery across Tashkent and Uzbekistan.'
      }
    },
    status: 'in_stock',
    availability: 'in_stock',
    active: 1,
    currency: 'сум'
  },
  {
    slug: 'lampa-liva',
    legacyId: 'l5',
    model: 'LIVA',
    category: 'lighting',
    price: 442000,
    dimensions: '12 × 24,8 см',
    materials: ['металл', 'акрил', 'LED'],
    maxLoad: null,
    confirmedColors: [
      {
        id: 'bronze',
        name: { ru: 'Бронза', uz: 'Bronza', en: 'Bronze' },
        hex: '#A26E3F',
        image: 'assets/prod-lamp-liva.svg',
        images: ['assets/prod-lamp-liva.svg']
      }
    ],
    isTable: false,
    images: ['assets/prod-lamp-liva.svg'],
    i18n: {
      ru: {
        name: 'Настольная лампа «LIVA»',
        category_label: 'Настольные лампы',
        description: 'Настольная лампа LIVA с мягким тёплым освещением. Изящный узкий корпус для компактных столиков и акцентного интерьерного света.',
        usage: 'Для прикроватной тумбочки, кафе, ресторанов и столика',
        seo_title: 'Купить Настольная лампа «LIVA» в Ташкенте - BTT',
        seo_description: 'Настольная лампа «LIVA» от BTT. Мягкое тёплое освещение. Размеры: 12 × 24,8 см. Доставка по Ташкенту и всему Узбекистану.'
      },
      uz: {
        name: '«LIVA» stol lampasi',
        category_label: 'Stol lampalari',
        description: 'Yumshoq iliq nurli LIVA stol lampasi. Ixcham nozik korpusi kichik stollar va interyer yorug‘ligi uchun mos keladi.',
        usage: 'Karavot yonidagi tumba, qahvaxona, restoran va stollar uchun',
        seo_title: 'Toshkentda «LIVA» stol lampasi sotib olish - BTT',
        seo_description: 'BTT dan «LIVA» stol lampasi. O‘lchamlari: 12 × 24,8 sm. Toshkent va butun O‘zbekiston bo‘ylab yetkazib berish.'
      },
      en: {
        name: 'LIVA Table Lamp',
        category_label: 'Table lamps',
        description: 'LIVA table lamp with warm ambient glow. Slender footprint fits compact tabletops, restaurant tables, and bedside areas.',
        usage: 'For nightstands, restaurant tables, and accent lighting',
        seo_title: 'Buy LIVA Table Lamp in Tashkent - BTT',
        seo_description: 'LIVA Table Lamp by BTT. Dimensions: 12 × 24.8 cm. Delivery across Tashkent and Uzbekistan.'
      }
    },
    status: 'in_stock',
    availability: 'in_stock',
    active: 1,
    currency: 'сум'
  },
  {
    slug: 'lampa-aria',
    legacyId: 'l6',
    model: 'ARIA',
    category: 'lighting',
    price: 317000,
    dimensions: '11,8 × 24,35 см',
    materials: ['металл', 'акрил', 'LED'],
    maxLoad: null,
    confirmedColors: [
      {
        id: 'brass',
        name: { ru: 'Латунь', uz: 'Latun', en: 'Brass' },
        hex: '#B8860B',
        image: 'assets/prod-lamp-aria.svg',
        images: ['assets/prod-lamp-aria.svg']
      }
    ],
    isTable: false,
    images: ['assets/prod-lamp-aria.svg'],
    i18n: {
      ru: {
        name: 'Настольная лампа «ARIA»',
        category_label: 'Настольные лампы',
        description: 'Настольная лампа ARIA с мягким тёплым освещением. Минималистичный светильник для камерной атмосферы и вечернего чтения.',
        usage: 'Для чтения, спальни, рабочего стола и прикроватной зоны',
        seo_title: 'Купить Настольная лампа «ARIA» в Ташкенте - BTT',
        seo_description: 'Настольная лампа «ARIA» от BTT. Мягкое тёплое освещение. Размеры: 11,8 × 24,35 см. Доставка по Ташкенту и всему Узбекистану.'
      },
      uz: {
        name: '«ARIA» stol lampasi',
        category_label: 'Stol lampalari',
        description: 'Yumshoq iliq nurli ARIA stol lampasi. Oqshomgi mutolaa va shinam atmosfera uchun minimalistik ixcham chiroq.',
        usage: 'Mutolaa, yotoqxona, ish stoli va karavot yonidagi tumba uchun',
        seo_title: 'Toshkentda «ARIA» stol lampasi sotib olish - BTT',
        seo_description: 'BTT dan «ARIA» stol lampasi. O‘lchamlari: 11,8 × 24,35 sm. Toshkent va butun O‘zbekiston bo‘ylab yetkazib berish.'
      },
      en: {
        name: 'ARIA Table Lamp',
        category_label: 'Table lamps',
        description: 'ARIA table lamp with soft warm lighting. Minimalist fixture designed for evening reading and ambient relaxation.',
        usage: 'For reading nooks, bedrooms, desks, and nightstands',
        seo_title: 'Buy ARIA Table Lamp in Tashkent - BTT',
        seo_description: 'ARIA Table Lamp by BTT. Dimensions: 11.8 × 24.35 cm. Delivery across Tashkent and Uzbekistan.'
      }
    },
    status: 'in_stock',
    availability: 'in_stock',
    active: 1,
    currency: 'сум'
  }
];

// 3. Prepare new artificial rattan profiles (6 items)
const rattanProfiles = [
  {
    slug: 'rotang-polutrubka',
    legacyId: 'r1',
    model: 'Полутрубка',
    category: 'rattan-raw',
    price: 120000,
    dimensions: 'Бухты / бобины',
    materials: ['первичный полимер', 'УФ-стабилизатор'],
    maxLoad: null,
    confirmedColors: [
      {
        id: 'chocolate',
        name: { ru: 'Шоколадный', uz: 'Shokolad', en: 'Chocolate' },
        hex: '#4A3525',
        image: 'assets/prod-rattan-polutrubka.svg',
        images: ['assets/prod-rattan-polutrubka.svg']
      }
    ],
    isTable: false,
    images: ['assets/prod-rattan-polutrubka.svg'],
    i18n: {
      ru: {
        name: 'Искусственный ротанг - профиль Полутрубка',
        category_label: 'Искусственный ротанг',
        description: 'Первичный искусственный ротанг BTT, профиль Полутрубка для производства плетёной мебели и декора. Расчёт под объём и MOQ.',
        usage: 'Для мебельных производств, ремесленных мастерских и плетения',
        seo_title: 'Искусственный ротанг Полутрубка оптом в Ташкенте - BTT',
        seo_description: 'Искусственный ротанг BTT профиль Полутрубка. Производство плетёной мебели в Ташкенте.'
      },
      uz: {
        name: 'Sun‘iy rotang - Yarim trubka profili',
        category_label: 'Sun‘iy rotang',
        description: 'Mebel ishlab chiqarish va bezash uchun BTT sun‘iy rotangi, Yarim trubka profili. Buyurtma hajmi va MOQ bo‘yicha hisoblanadi.',
        usage: 'Mebel ishlab chiqarish, ustaxonalar va to‘quv uchun',
        seo_title: 'Toshkentda sun‘iy rotang Yarim trubka - BTT',
        seo_description: 'BTT dan sun‘iy rotang Yarim trubka profili. Toshkentda to‘qilgan mebel ishlab chiqarish uchun.'
      },
      en: {
        name: 'Synthetic Rattan - Semi-tube Profile',
        category_label: 'Synthetic rattan',
        description: 'BTT synthetic rattan raw material, Semi-tube profile for outdoor furniture manufacturing. Quoted by order volume and MOQ.',
        usage: 'For furniture makers, workshops, and weaving craft',
        seo_title: 'Synthetic Rattan Semi-tube Profile in Tashkent - BTT',
        seo_description: 'BTT Synthetic Rattan Semi-tube Profile for outdoor furniture manufacturing.'
      }
    },
    status: 'on_request',
    availability: 'on_request',
    active: 1,
    currency: 'сум'
  },
  {
    slug: 'rotang-polumesyats',
    legacyId: 'r2',
    model: 'Полумесяц',
    category: 'rattan-raw',
    price: 120000,
    dimensions: 'Бухты / бобины',
    materials: ['первичный полимер', 'УФ-стабилизатор'],
    maxLoad: null,
    confirmedColors: [
      {
        id: 'graphite',
        name: { ru: 'Графит', uz: 'Grafit', en: 'Graphite' },
        hex: '#3E3E3E',
        image: 'assets/prod-rattan-polumesyats.svg',
        images: ['assets/prod-rattan-polumesyats.svg']
      }
    ],
    isTable: false,
    images: ['assets/prod-rattan-polumesyats.svg'],
    i18n: {
      ru: {
        name: 'Искусственный ротанг - профиль Полумесяц',
        category_label: 'Искусственный ротанг',
        description: 'Первичный искусственный ротанг BTT, профиль Полумесяц для ручного и машинного плетения. Расчёт под объём и MOQ.',
        usage: 'Для мебельных фабрик и мастерских плетения',
        seo_title: 'Искусственный ротанг Полумесяц в Ташкенте - BTT',
        seo_description: 'Искусственный ротанг BTT профиль Полумесяц. Сырьё для мебели в Ташкенте.'
      },
      uz: {
        name: 'Sun‘iy rotang - Yarim oy profili',
        category_label: 'Sun‘iy rotang',
        description: 'Qo‘lda va stanokda to‘qish uchun BTT sun‘iy rotangi, Yarim oy profili. Buyurtma hajmi va MOQ bo‘yicha hisoblanadi.',
        usage: 'Mebel fabrikalari va to‘quv ustaxonalari uchun',
        seo_title: 'Toshkentda sun‘iy rotang Yarim oy - BTT',
        seo_description: 'BTT dan sun‘iy rotang Yarim oy profili. Toshkentda mebel ishlab chiqarish uchun xomashyo.'
      },
      en: {
        name: 'Synthetic Rattan - Half-moon Profile',
        category_label: 'Synthetic rattan',
        description: 'BTT synthetic rattan, Half-moon profile for manual and industrial weaving. Quoted based on volume and MOQ.',
        usage: 'For furniture factories and weaving studios',
        seo_title: 'Synthetic Rattan Half-moon Profile in Tashkent - BTT',
        seo_description: 'BTT Synthetic Rattan Half-moon profile raw material.'
      }
    },
    status: 'on_request',
    availability: 'on_request',
    active: 1,
    currency: 'сум'
  },
  {
    slug: 'rotang-ploskaya-lenta',
    legacyId: 'r3',
    model: 'Плоская лента',
    category: 'rattan-raw',
    price: 120000,
    dimensions: 'Бухты / бобины',
    materials: ['первичный полимер', 'УФ-стабилизатор'],
    maxLoad: null,
    confirmedColors: [
      {
        id: 'walnut',
        name: { ru: 'Орех', uz: 'Yong‘oq', en: 'Walnut' },
        hex: '#5C4033',
        image: 'assets/prod-rattan-ploskaya-lenta.svg',
        images: ['assets/prod-rattan-ploskaya-lenta.svg']
      }
    ],
    isTable: false,
    images: ['assets/prod-rattan-ploskaya-lenta.svg'],
    i18n: {
      ru: {
        name: 'Искусственный ротанг - профиль Плоская лента',
        category_label: 'Искусственный ротанг',
        description: 'Первичный искусственный ротанг BTT, профиль Плоская лента для каркасной мебели и ограждений. Расчёт под объём и MOQ.',
        usage: 'Для плетения шезлонгов, столов, диванов и перегородок',
        seo_title: 'Искусственный ротанг Плоская лента в Ташкенте - BTT',
        seo_description: 'Искусственный ротанг BTT профиль Плоская лента в Ташкенте.'
      },
      uz: {
        name: 'Sun‘iy rotang - Yassi lenta profili',
        category_label: 'Sun‘iy rotang',
        description: 'Karkasli mebel va to‘siqlar uchun BTT sun‘iy rotangi, Yassi lenta profili. Buyurtma hajmi va MOQ bo‘yicha hisoblanadi.',
        usage: 'Shezlong, stol, divan va to‘siqlarni to‘qish uchun',
        seo_title: 'Toshkentda sun‘iy rotang Yassi lenta - BTT',
        seo_description: 'BTT dan sun‘iy rotang Yassi lenta profili.'
      },
      en: {
        name: 'Synthetic Rattan - Flat Ribbon Profile',
        category_label: 'Synthetic rattan',
        description: 'BTT synthetic rattan, Flat Ribbon profile for loungers, sofas, and dividers. Quoted by volume and MOQ.',
        usage: 'For sun loungers, tables, sofas, and partitions',
        seo_title: 'Synthetic Rattan Flat Ribbon Profile in Tashkent - BTT',
        seo_description: 'BTT Synthetic Rattan Flat Ribbon profile for outdoor furniture.'
      }
    },
    status: 'on_request',
    availability: 'on_request',
    active: 1,
    currency: 'сум'
  },
  {
    slug: 'rotang-trubka',
    legacyId: 'r4',
    model: 'Трубка',
    category: 'rattan-raw',
    price: 120000,
    dimensions: 'Бухты / бобины',
    materials: ['первичный полимер', 'УФ-стабилизатор'],
    maxLoad: null,
    confirmedColors: [
      {
        id: 'taupe',
        name: { ru: 'Тауп', uz: 'Taup', en: 'Taupe' },
        hex: '#8B8589',
        image: 'assets/prod-rattan-trubka.svg',
        images: ['assets/prod-rattan-trubka.svg']
      }
    ],
    isTable: false,
    images: ['assets/prod-rattan-trubka.svg'],
    i18n: {
      ru: {
        name: 'Искусственный ротанг - профиль Трубка',
        category_label: 'Искусственный ротанг',
        description: 'Первичный искусственный ротанг BTT, профиль Трубка для структурного плетения. Расчёт под объём и MOQ.',
        usage: 'Для структурных элементов мебели, кашпо и корзин',
        seo_title: 'Искусственный ротанг Трубка в Ташкенте - BTT',
        seo_description: 'Искусственный ротанг BTT профиль Трубка в Ташкенте.'
      },
      uz: {
        name: 'Sun‘iy rotang - Trubka profili',
        category_label: 'Sun‘iy rotang',
        description: 'Mustahkam to‘qish uchun BTT sun‘iy rotangi, Trubka profili. Buyurtma hajmi va MOQ bo‘yicha hisoblanadi.',
        usage: 'Mebelning asosiy to‘qilishi, kashpo va savatlar uchun',
        seo_title: 'Toshkentda sun‘iy rotang Trubka - BTT',
        seo_description: 'BTT dan sun‘iy rotang Trubka profili.'
      },
      en: {
        name: 'Synthetic Rattan - Round Tube Profile',
        category_label: 'Synthetic rattan',
        description: 'BTT synthetic rattan, Round Tube profile for structural weaves and planters. Quoted by volume and MOQ.',
        usage: 'For structural furniture elements, planters, and baskets',
        seo_title: 'Synthetic Rattan Round Tube Profile in Tashkent - BTT',
        seo_description: 'BTT Synthetic Rattan Round Tube profile.'
      }
    },
    status: 'on_request',
    availability: 'on_request',
    active: 1,
    currency: 'сум'
  },
  {
    slug: 'rotang-polusfera',
    legacyId: 'r5',
    model: 'Полусфера',
    category: 'rattan-raw',
    price: 120000,
    dimensions: 'Бухты / бобины',
    materials: ['первичный полимер', 'УФ-стабилизатор'],
    maxLoad: null,
    confirmedColors: [
      {
        id: 'mocha',
        name: { ru: 'Мокко', uz: 'Mokko', en: 'Mocha' },
        hex: '#6F4E37',
        image: 'assets/prod-rattan-polusfera.svg',
        images: ['assets/prod-rattan-polusfera.svg']
      }
    ],
    isTable: false,
    images: ['assets/prod-rattan-polusfera.svg'],
    i18n: {
      ru: {
        name: 'Искусственный ротанг - профиль Полусфера',
        category_label: 'Искусственный ротанг',
        description: 'Первичный искусственный ротанг BTT, профиль Полусфера для декоративного плетения. Расчёт под объём и MOQ.',
        usage: 'Для кресел, столов и декоративных интерьерных решений',
        seo_title: 'Искусственный ротанг Полусфера в Ташкенте - BTT',
        seo_description: 'Искусственный ротанг BTT профиль Полусфера в Ташкенте.'
      },
      uz: {
        name: 'Sun‘iy rotang - Yarim sfera profili',
        category_label: 'Sun‘iy rotang',
        description: 'Dekorativ to‘qish uchun BTT sun‘iy rotangi, Yarim sfera profili. Buyurtma hajmi va MOQ bo‘yicha hisoblanadi.',
        usage: 'Kreslo, stol va dekorativ interyer to‘quvlari uchun',
        seo_title: 'Toshkentda sun‘iy rotang Yarim sfera - BTT',
        seo_description: 'BTT dan sun‘iy rotang Yarim sfera profili.'
      },
      en: {
        name: 'Synthetic Rattan - Semi-sphere Profile',
        category_label: 'Synthetic rattan',
        description: 'BTT synthetic rattan, Semi-sphere profile for decorative weaving. Quoted by volume and MOQ.',
        usage: 'For chairs, dining sets, and decor items',
        seo_title: 'Synthetic Rattan Semi-sphere Profile in Tashkent - BTT',
        seo_description: 'BTT Synthetic Rattan Semi-sphere profile.'
      }
    },
    status: 'on_request',
    availability: 'on_request',
    active: 1,
    currency: 'сум'
  },
  {
    slug: 'rotang-twist',
    legacyId: 'r6',
    model: 'TWIST',
    category: 'rattan-raw',
    price: 120000,
    dimensions: 'Бухты / бобины',
    materials: ['первичный полимер', 'УФ-стабилизатор'],
    maxLoad: null,
    confirmedColors: [
      {
        id: 'dark-coffee',
        name: { ru: 'Тёмный кофе', uz: 'To‘q kofe', en: 'Dark Coffee' },
        hex: '#3B2F2F',
        image: 'assets/prod-rattan-twist.svg',
        images: ['assets/prod-rattan-twist.svg']
      }
    ],
    isTable: false,
    images: ['assets/prod-rattan-twist.svg'],
    i18n: {
      ru: {
        name: 'Искусственный ротанг - профиль TWIST',
        category_label: 'Искусственный ротанг',
        description: 'Первичный искусственный ротанг BTT, профиль TWIST для плетёных кресел и диванов. Расчёт под объём и MOQ.',
        usage: 'Для плетёных кресел Vertex, Corda, диванов и шезлонгов',
        seo_title: 'Искусственный ротанг TWIST в Ташкенте - BTT',
        seo_description: 'Искусственный ротанг BTT кручёный профиль TWIST в Ташкенте.'
      },
      uz: {
        name: 'Sun‘iy rotang - TWIST profili',
        category_label: 'Sun‘iy rotang',
        description: 'To‘qilgan kreslo va divanlar uchun BTT sun‘iy rotangi, buralgan TWIST profili. Buyurtma hajmi va MOQ bo‘yicha hisoblanadi.',
        usage: 'Vertex, Corda kreslolari, divanlar va shezlonglar uchun',
        seo_title: 'Toshkentda sun‘iy rotang TWIST - BTT',
        seo_description: 'BTT dan buralgan sun‘iy rotang TWIST profili.'
      },
      en: {
        name: 'Synthetic Rattan - TWIST Profile',
        category_label: 'Synthetic rattan',
        description: 'BTT synthetic rattan, twisted TWIST profile for wicker chairs and lounges. Quoted by volume and MOQ.',
        usage: 'For Vertex and Corda chairs, sofas, and sun loungers',
        seo_title: 'Synthetic Rattan TWIST Profile in Tashkent - BTT',
        seo_description: 'BTT Synthetic Rattan twisted TWIST profile.'
      }
    },
    status: 'on_request',
    availability: 'on_request',
    active: 1,
    currency: 'сум'
  }
];

// Append new items if they don't already exist
const existingSlugs = new Set(master.map(p => p.slug));

[...lamps, ...rattanProfiles].forEach(item => {
  if (!existingSlugs.has(item.slug)) {
    master.push(item);
    existingSlugs.add(item.slug);
  }
});

// Update sort indexes
master.forEach((p, idx) => {
  p.sort = idx;
});

fs.writeFileSync(MASTER_PATH, JSON.stringify(master, null, 2) + '\n', 'utf8');
console.log(`Updated data/products-master.json with ${master.length} total products.`);
