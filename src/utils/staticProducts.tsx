// Статические данные товаров для fallback и миграции
import type { Product, ColorVariant } from './useProducts';

// Импорт изображений кашпо 5л с ручкой
import kashpo5lBeigeWithHandle from '@/assets/aaa3f6c434f81fb8787b230c4e80ff40a3ff1805.webp';
import kashpo5lGrayWithHandle from '@/assets/734c7fe27be9c768b54eb373aeac20283920d105.webp';
import kashpo5lWhiteBirchWithHandle from '@/assets/5701c82eee99edfcfac44cfab9b4fa6a6b5cdb96.webp';

// Импорт изображений для остальных кашпо
import kashpoBeige from '@/assets/0b7c7dcc56f444de68a9e6496bc108a610b7c82f.webp';
import kashpo5lGray from '@/assets/e8de77f3d28f94c652df287a8da1004169f8162e.webp';
import kashpo5lDarkGray from '@/assets/114bfc7a118b6cf373f80f044aa151482b15fa44.webp';

// Цветовые варианты для кашпо 5л с ручкой
export const colorVariants5lWithHandle: ColorVariant[] = [
  {
    id: 'beige',
    name: 'Бежевый',
    images: [
      kashpo5lBeigeWithHandle,
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    color: '#D2B48C'
  },
  {
    id: 'gray',
    name: 'Серый',
    images: [
      kashpo5lGrayWithHandle,
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493925410384-84f842e616fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    color: '#A9A9A9'
  },
  {
    id: 'white-birch',
    name: 'Белая берёзка',
    images: [
      kashpo5lWhiteBirchWithHandle,
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    color: '#F5F5F0'
  }
];

// Цветовые варианты для остальных кашпо
export const colorVariantsOther: ColorVariant[] = [
  {
    id: 'beige',
    name: 'Бежевый',
    images: [
      kashpoBeige,
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    color: '#D2B48C'
  },
  {
    id: 'gray',
    name: 'Серый',
    images: [
      kashpo5lGray,
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493925410384-84f842e616fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    color: '#A9A9A9'
  },
  {
    id: 'white-birch',
    name: 'Белая берёзка',
    images: [
      kashpo5lDarkGray,
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    color: '#F5F5F0'
  },
  {
    id: 'brown',
    name: 'Коричневый',
    images: [
      'https://images.unsplash.com/photo-1485199433301-0b7252b63fdb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    color: '#8B4513'
  }
];

// Все товары для миграции
export const staticProducts: Product[] = [
  {
    id: '2',
    name: 'Кашпо 5л с ручкой',
    description: 'Стильное плетёное кашпо объёмом 5 литров с удобной ручкой в различных цветах',
    image: colorVariants5lWithHandle[0].images[0],
    features: ['Объём 5 литров', 'Удобная ручка', 'Натуральный дизайн', 'Различные цвета'],
    variants: colorVariants5lWithHandle,
    category: 'kashpo',
    size: '5л',
    dimensions: {
      height: 165,
      diameter: 230
    }
  },
  {
    id: '3',
    name: 'Кашпо 10л Классика',
    description: 'Классическое большое кашпо объёмом 10 литров с традиционным плетением',
    image: colorVariantsOther[0].images[0],
    features: ['Объём 10 литров', 'Классический дизайн', 'Традиционное плетение', 'Различные цвета'],
    variants: colorVariantsOther,
    category: 'kashpo',
    size: '10л',
    style: 'Классика',
    dimensions: {
      height: 225,
      diameter: 295
    }
  },
  {
    id: '4',
    name: 'Кашпо 10л Пухляш',
    description: 'Объёмное кашпо "Пухляш" на 10 литров с округлыми формами и мягким плетением',
    image: colorVariantsOther[0].images[0],
    features: ['Объём 10 литров', 'Округлые формы', 'Мягкое плетение', 'Различные цвета'],
    variants: colorVariantsOther,
    category: 'kashpo',
    size: '10л',
    style: 'Пухляш',
    dimensions: {
      height: 220,
      diameter: 295
    }
  },
  {
    id: '5',
    name: 'Кашпо 16л Классика',
    description: 'Большое классическое кашпо объёмом 16 литров для крупных растений',
    image: colorVariantsOther[0].images[0],
    features: ['Объём 16 литров', 'Для крупных растений', 'Классический стиль', 'Различные цвета'],
    variants: colorVariantsOther,
    category: 'kashpo',
    size: '16л',
    style: 'Классика',
    dimensions: {
      height: 285,
      diameter: 350
    }
  },
  {
    id: '6',
    name: 'Кашпо 16л Пухляш',
    description: 'Очень большое кашпо "Пухляш" на 16 литров с мягкими округлыми формами',
    image: colorVariantsOther[0].images[0],
    features: ['Объём 16 литров', 'Мягкие округлые формы', 'Для больших растений', 'Различные цвета'],
    variants: colorVariantsOther,
    category: 'kashpo',
    size: '16л',
    style: 'Пухляш',
    dimensions: {
      height: 280,
      diameter: 360
    }
  }
];