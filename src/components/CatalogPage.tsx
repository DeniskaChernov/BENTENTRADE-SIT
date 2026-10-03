import { motion, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer@9.13.1';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Check, Star, Filter, Search, ArrowLeft, Package, Sparkles } from '../utils/lucide-stub';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ProductGridSkeleton } from './ProductCardSkeleton';
import { Breadcrumbs } from './Breadcrumbs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { pickLang, useLanguage } from '../utils/language-context';
import { formatPrice } from '../utils/translations';
import { trackEvent } from '../utils/analytics';
import { getProductIdForSlug, getSlugForProductId } from '../data/productSlugs';
import { MarketplacePDP } from './MarketplacePDP';
import { API_BASE_URL } from '../utils/env';

// Импорт изображений кашпо 5л с ручкой
import kashpo5lBeigeWithHandle from '@/assets/aaa3f6c434f81fb8787b230c4e80ff40a3ff1805.webp';
import kashpo5lGrayWithHandle from '@/assets/734c7fe27be9c768b54eb373aeac20283920d105.webp';
import kashpo5lWhiteBirchWithHandle from '@/assets/5701c82eee99edfcfac44cfab9b4fa6a6b5cdb96.webp';
// Импорт изображений для остальных кашпо
import kashpoBeige from '@/assets/0b7c7dcc56f444de68a9e6496bc108a610b7c82f.webp';
import kashpo5lGray from '@/assets/e8de77f3d28f94c652df287a8da1004169f8162e.webp';
import kashpo5lDarkGray from '@/assets/114bfc7a118b6cf373f80f044aa151482b15fa44.webp';
import kashpoBrownPuhlyash from '@/assets/5f133ac607b25721754cfe9f973bbe34b26e36ed.webp';
// Импорт изображения серого кашпо для Классика 10л и 16л
import kashpoGrayClassic from '@/assets/0e131a3e8829dc4da84f9e7575911fe10b4833d2.webp';
// Импорт изображения коричневого кашпо для Классика и Пухляш
import kashpoBrownClassicPuhlyash from '@/assets/dec339423c65660420decd542cca4f740c2299fb.webp';
// Импорт бежевого кашпо для Пухляш с логотипом BTT
import kashpoBeigePuhlyash from '@/assets/6d9496c1540d1c8b9f1aaa416fd88b8490415176.webp';
// Импорт Белая берёзка для Классика с логотипом BTT (ОБНОВЛЕНО)
import kashpoWhiteBirchClassic from '@/assets/3b4b7222cc87dd7311b78e54e217ce632dcf0d39.webp';
// Импорт Белая берёзка для Пухляш
import kashpoWhiteBirchPuhlyash from '@/assets/17b6a4aade43c236d9217a95e06e703ce84bbf1b.webp';
// Импорт Жёлтого кашпо для Пухляш (НОВОЕ!)
import kashpoYellowPuhlyash from '@/assets/9f329516c8d5112fbb9787ea70fdd093473d5a0f.webp';
// Импорт Жёлтого кашпо для Классика (НОВОЕ!)
import kashpoYellowClassic from '@/assets/21ce3b8cddac4fef8eb09323347c87f108aa2db9.webp';
// Импорт Кремового кашпо для Классика (НОВОЕ!)
import kashpoButteryClassic from '@/assets/6a9947a54669e33d505d5a2832d5e0f98e8f9366.webp';
// Импорт Кремового кашпо для Пухляш (НОВОЕ БЕЛОЕ ОКРУГЛОЕ!)
import kashpoButteryPuhlyash from '@/assets/8c0b031033de8bbdf5913fe421c9826a043b0c48.webp';
// Импорт Коричнево-Белого кашпо для Пухляш (НОВОЕ!)
import kashpoBrownWhitePuhlyash from '@/assets/92dff26663eec7d00cb2053e36c95d0a03961737.webp';
// Импорт Трёхцветного кашпо для Пухляш (НОВОЕ!)
import kashpoTricolorPuhlyash from '@/assets/ee3cad7c86c64ba4f0451d2507d30fd34b6ad147.webp'; // ✅ ОБНОВЛЕНО: трёхцветное кашпо Пухляш с чёткими полосами
// Импорт коричневого ротанга плоского (Артикул 0306Пл) - ФИНАЛЬНОЕ ПРАВИЛЬНОЕ ИЗОБРАЖЕНИЕ ✅✅
import rattanFlatBrown from '@/assets/177f1c7cd3459b0703ab2446345b951405612976.webp';
// Импорт бледно-жёлтого ротанга плоского (Артикул 1110Пл) - ПРАВИЛЬНОЕ ИЗОБРАЖЕНИЕ ✅
import rattanFlatPaleYellow from '@/assets/d17b9362fc21ad53ca996a3b990bb483b7ab28d5.webp';
// Импорт жемчужного ротанга плоского (Артикул 2305ПЛ) - НОВОЕ ИЗОБРАЖЕНИЕ ✅✅
import rattanFlatPearl from '@/assets/079b54909d5ddebe540fb63575239bb603b00f6b.webp';
// Импорт песочного ротанга плоского (Артикул 2310ПЛ) - ПРАВИЛЬНОЕ ИЗОБРАЖЕНИЕ ✅
import rattanFlatSand from '@/assets/c68a06636b80ab92df7afcd6fd298f4a16d5a241.webp';
// Импорт светло серого ротанга плоского (Артикул 2809ПЛ) - ПРАВИЛЬНОЕ ИЗОБРАЖЕНИЕ ✅
import rattanFlatLightGrey from '@/assets/c1b3a16137e1769f526c741e5ca9497aa721ae6d.webp';
// Импорт фиолетового ротанга плоского (Артикул 3034Пл) - ПРАВИЛЬНОЕ ИЗОБРАЖЕНИЕ ✅
import rattanFlatPurple from '@/assets/6f10cb4d8780e4ae7b62a1ff81a7d627cfb65c8e.webp';
// Импорт серого ротанга плоского (Артикул 3045ПЛ) - ПРАВИЛЬНОЕ ИЗОБРАЖЕНИЕ ✅
import rattanFlatGrey from '@/assets/f17fb0aea8be133d85d1ee2034c446e7b7cb7825.webp';
// Импорт жемчужного ротанга для Полусфера и Полумесяц (Артикулы 2305 и 2305П) - НОВОЕ ИЗОБРАЖЕНИЕ ✅
import rattanPearlSphereAndCrescent from '@/assets/efdbb313e67c9a0f8732fe579446757fb7a204c3.webp';
// Импорт песочного ротанга для Полусфера и Полумесяц (Артикулы 2310 и 2310П) - НОВОЕ ИЗОБРАЖЕНИЕ ✅
import rattanSandSphereAndCrescent from '@/assets/4935765782b02872c39cba831afac4bbbce963a0.webp';
// Импорт светло серого ротанга для Полусфера и Полумесяц (Артикулы 2708 и 2708П) - НОВОЕ ИЗОБРАЖЕНИЕ ✅
import rattanLightGreySphereAndCrescent from '@/assets/1d08d05a3da1322da08256c31cbbf11eeccea4a9.webp';
// Импорт золотого ротанга для Полусфера и Полумесяц (Артикулы 5830 и 5830П) - НОВОЕ ИЗОБРАЖЕНИЕ ✅
import rattanGoldSphereAndCrescent from '@/assets/aa6eddd7d37a9c9221523b2cbc73643ebacbcd2c.webp';
// Импорт серого с начёсом ротанга для Полусфера и Полумесяц (Артикулы 0510 и 0510П) - ОБНОВЛЕНО 13.10.2025 ✅
import rattanBrushedGreySphereAndCrescent from '@/assets/ba302a345a0cb69f4964b6987404c6b488e4b288.webp';
// Импорт красного дерева ротанга ТОЛЬКО для Полусфера (Артикул 0609) - ЭКСКЛЮЗИВНОЕ ИЗОБРАЖЕНИЕ ✅
import rattanMahoganySphere from '@/assets/fbf8283c67ac97c1347b3472c1517ee1ae106119.webp';
// Импорт красного дерева ротанга ТОЛЬКО для Полумесяц (Артикул 0609П) - ОБНОВЛЕНО 13.10.2025 ✅
import rattanMahoganyCrescent from '@/assets/37c359c15c64d258eb771fcba8f9ca0194c2b4f8.webp';
// Импорт белой берёзки ротанга ТОЛЬКО для Полусфера (Артикул 0310) - ОБНОВЛЕНО 13.10.2025 ✅
import rattanWhiteBirchSphere from '@/assets/eb870a79ea96a752b4661fca27c38a9e37139df9.webp';
// Импорт белого ротанга ТОЛЬКО для Полумесяц (Артикул 1706П) - ДОБАВЛЕНО 13.10.2025 ✅
import rattanWhiteCrescent from '@/assets/db2a62875e77da60e8554a91076168a4e7227223.webp';
// Импорт бронзового ротанга ТОЛЬКО для Полусфера (Артикул 1710) - ДОБАВЛЕНО 13.10.2025 ✅
import rattanBronzeSphere from '@/assets/0b3c1a7b210ae25d8352259acab51838a058c292.webp';
// Импорт фиолетового ротанга для ОБОИХ профилей (Артикулы 3034 и 3034П) - ДОБАВЛЕНО 13.10.2025 ✅
import rattanPurpleSphereAndCrescent from '@/assets/77acd21929ba49dbfb8d60d9c2295c649be7e90c.webp';
// Импорт серого ротанга для ОБОИХ профилей (Артикулы 3045 и 3045П) - ДОБАВЛЕНО 13.10.2025 ✅
import rattanGreySphereAndCrescent from '@/assets/ef423c69ddac97a18befa6f16beabc634c309e09.webp';
// Импорт черного с золотыми наплывами ротанга ТОЛЬКО для Трубка (Артикул 2104R) - ДОБАВЛЕНО 13.10.2025 ✅
import rattanBlackGoldTube from '@/assets/311b0c857221fd36e611935ba85e0a350e4c11de.webp';

interface ColorVariant {
  id: string;
  name: string;
  images: string[];
  color: string;
  gradient?: string; // Опциональный градиент для трёхцветного
  article?: string; // Опциональный артикул для ротанга
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  features?: string[];
  variants?: ColorVariant[];
  category: string;
  size?: string;
  style?: string;
  dimensions?: {
    height: number; // в мм
    diameter: number; // в мм
  };
}

interface CatalogPageProps {
  onAddToCart: (product: Product & { selectedVariant?: ColorVariant; selectedImageIndex?: number; lineMeta?: string }) => void;
  onBackToHome: () => void;
  onOpenConsult?: () => void;
  onOpenCart?: () => void;
  /** ЧПУ товара — открыта отдельная страница маркетплейса */
  productSlug?: string | null;
  onProductSlugChange?: (slug: string | null) => void;
  onExpressCheckout?: (args: {
    product: Product;
    selectedVariant: ColorVariant | undefined;
    widthMm: number | null;
  }) => void;
}

export function CatalogPage({
  onAddToCart,
  onBackToHome,
  onOpenConsult,
  onOpenCart,
  productSlug = null,
  onProductSlugChange,
  onExpressCheckout,
}: CatalogPageProps) {
  // Используем систему переводов
  const { language, t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  
  // Проверка загрузки изображений
  console.log('🎨 [CatalogPage] Коричневое изображение Пухляша загружено:', kashpoBrownPuhlyash);
  console.log('🎨 [CatalogPage] Ротанг плоский коричневый:', rattanFlatBrown);
  console.log('🎨 [CatalogPage] Ротанг плоский бледно-жёлтый:', rattanFlatPaleYellow);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Состояния для фильтрации и управления
  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: string}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [whereFilter, setWhereFilter] = useState<'all' | 'street' | 'home'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'order'>('all');
  const [shapeFilter, setShapeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'planters' | 'materials'>('planters');
  const [visibleCount, setVisibleCount] = useState(8);
  const [cmsProducts, setCmsProducts] = useState<Product[]>([]);

  // Логирование изменений selectedVariants
  useEffect(() => {
    console.log('🔄 [CatalogPage] selectedVariants изменён:', selectedVariants);
  }, [selectedVariants]);

  useEffect(() => {
    let mounted = true;
    const loadCmsProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/public/products`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted || !Array.isArray(data.products) || data.products.length === 0) return;
        const mapped: Product[] = data.products.map((p: any) => ({
          id: p.id,
          name: typeof p.title === 'object' ? p.title[language] || p.title.ru || p.slug : p.title || p.slug || p.id,
          description: typeof p.description === 'object' ? p.description[language] || p.description.ru || '' : p.description || '',
          image: p.image || '',
          features: [],
          variants: [],
          category: p.category || 'kashpo',
        }));
        setCmsProducts(mapped);
      } catch {
        // keep seeded products
      }
    };
    loadCmsProducts();
    return () => {
      mounted = false;
    };
  }, [language]);

  // Helper функция для перевода названий цветов
  const getColorName = (colorId: string): string => {
    const colorMap: {[key: string]: {ru: string; uz: string}} = {
      'yellow': { ru: 'Жёлтый', uz: 'Sariq' },
      'gray': { ru: 'Серый', uz: 'Kulrang' },
      'white-birch': { ru: 'Белая берёзка', uz: 'Oq qayin' },
      'beige': { ru: 'Бежевый', uz: 'Och jigarrang' },
      'buttery': { ru: 'Кремовый', uz: 'Krem' },
      'brown': { ru: 'Коричневый', uz: 'Jigarrang' },
      'brown-white': { ru: 'Коричнево-Белый', uz: 'Jigarrang-Oq' },
      'tricolor': { ru: 'Трёхцветный', uz: 'Uch rangli' },
      'pearl': { ru: 'Жемчужный', uz: 'Marvarid' },
      'sand': { ru: 'Песочный', uz: 'Qum' },
      'gold': { ru: 'Золото', uz: 'Oltin' },
      'brushed-grey': { ru: 'Серый с начёсом', uz: 'Yuvulgan kulrang' },
      'mahogany': { ru: 'Красное дерево', uz: 'Qizil yog\'och' },
      'white': { ru: 'Белый', uz: 'Oq' },
      'purple': { ru: 'Фиолетовый', uz: 'Binafsha' },
      'grey': { ru: 'Серый', uz: 'Kulrang' },
      'bronze': { ru: 'Бронза', uz: 'Bronza' },
      'black-gold': { ru: 'Черная с золотыми наплывами', uz: 'Oltin chiziqli qora' },
      'light-grey': { ru: 'Светло-серый', uz: 'Och kulrang' },
      'pale-yellow': { ru: 'Бледно-жёлтый', uz: 'Och sariq' },
    };
    return colorMap[colorId]?.[language] || colorId;
  };
  
  // Переводы для названий продуктов
  const getProductName = (productId: string): string => {
    const names: {[key: string]: {ru: string; uz: string}} = {
      '1': { ru: 'Ротанг Полусфера', uz: 'Rattan Yarim shar' },
      '1-sphere': { ru: 'Ротанг Сфера', uz: 'Rattan Shar' },
      '1-flat': { ru: 'Ротанг Плоский', uz: 'Rattan Tekis' },
      '1-crescent': { ru: 'Ротанг Полумесяц', uz: 'Rattan Yarim oy' },
      '1-tube': { ru: 'Ротанг Трубка', uz: 'Rattan Nay' },
      '2': { ru: 'Кашпо 5л с ручкой', uz: '5l dastali guldon' },
      '3': { ru: 'Кашпо 10л Классика', uz: '10l Klassik guldon' },
      '4': { ru: 'Кашпо 10л Пухляш', uz: '10l Puffy guldon' },
      '5': { ru: 'Кашпо 16л Классика', uz: '16l Klassik guldon' },
      '6': { ru: 'Кашпо 16л Пухляш', uz: '16l Puffy guldon' },
    };
    return names[productId]?.[language] || productId;
  };
  
  // Переводы для описаний продуктов
  const getProductDescription = (productId: string): string => {
    const descriptions: {[key: string]: {ru: string; uz: string}} = {
      '1': { 
        ru: 'Искусственная ротанговая нить профиль "Полусфера" - идеальна для классического плетения',
        uz: 'Sun\'iy rattan ip "Yarim shar" profili - klassik to\'qish uchun ideal'
      },
      '1-sphere': { 
        ru: 'Искусственная ротанговая нить профиль "Сфера" - округлая форма для объёмного плетения',
        uz: 'Sun\'iy rattan ip "Shar" profili - hajmli to\'qish uchun dumaloq shakl'
      },
      '1-flat': { 
        ru: 'Искусственная ротанговая нить профиль "Плоский" - для гладкого современного плетения',
        uz: 'Sun\'iy rattan ip "Tekis" profili - silliq zamonaviy to\'qish uchun'
      },
      '1-crescent': { 
        ru: 'Искусственная ротанговая нить профиль "Полумесяц" - для декоративного плетения',
        uz: 'Sun\'iy rattan ip "Yarim oy" profili - dekorativ to\'qish uchun'
      },
      '1-tube': { 
        ru: 'Искусственная ротанговая нить профиль "Трубка" - полая структура для лёгкого плетения',
        uz: 'Sun\'iy rattan ip "Nay" profili - yengil to\'qish uchun bo\'sh struktura'
      },
      '2': { 
        ru: 'Стильное плетёное кашпо объёмом 5 литров с удобной ручкой в различных цветах',
        uz: '5 litr tutumli turli xil ranglardagi qulay dastali zamonaviy to\'qilgan guldon'
      },
      '3': { 
        ru: 'Классическое большое кашпо объёмом 10 литров с традиционным плетением',
        uz: '10 litr tutumli an\'anaviy to\'qish uslubidagi klassik katta guldon'
      },
      '4': { 
        ru: 'Объёмное кашпо "Пухляш" на 10 литров с округлыми формами и мягким плетением',
        uz: 'Yumshoq to\'qish va dumaloq shaklga ega 10 litr tutumli "Puffy" guldon'
      },
      '5': { 
        ru: 'Большое классическое кашпо объёмом 16 литров для крупных растений',
        uz: 'Katta o\'simliklar uchun 16 litr tutumli katta klassik guldon'
      },
      '6': { 
        ru: 'Очень большое кашпо "Пухляш" на 16 литров с мягкими округлыми формами',
        uz: 'Yumshoq dumaloq shaklga ega katta o\'simliklar uchun 16 litr tutumli "Puffy" guldon'
      },
    };
    return descriptions[productId]?.[language] || '';
  };
  
  // Переводы для характеристик (features)
  const translateFeature = (feature: string): string => {
    const featureMap: {[key: string]: {ru: string; uz: string}} = {
      'Профиль полусфера': { ru: 'Профиль полусфера', uz: 'Yarim shar profili' },
      'Различные цвета': { ru: 'Различные цвета', uz: 'Turli ranglar' },
      'Высокая прочность': { ru: 'Высокая прочность', uz: 'Yuqori mustahkamlik' },
      'Для классического плетения': { ru: 'Для классического плетения', uz: 'Klassik to\'qish uchun' },
      'Профиль сфера': { ru: 'Профиль сфера', uz: 'Shar profili' },
      'Объёмное плетение': { ru: 'Объёмное плетение', uz: 'Hajmli to\'qish' },
      'Мягкая текстура': { ru: 'Мягкая текстура', uz: 'Yumshoq to\'qilma' },
      'Плоский профиль': { ru: 'Плоский профиль', uz: 'Tekis profil' },
      'Гладкое плетение': { ru: 'Гладкое плетение', uz: 'Silliq to\'qish' },
      'От 6 до 10мм': { ru: 'От 6 до 10мм', uz: '6 dan 10mm gacha' },
      'Профиль полумесяц': { ru: 'Профиль полумесяц', uz: 'Yarim oy profili' },
      'Декоративное плетение': { ru: 'Декоративное плетение', uz: 'Dekorativ to\'qish' },
      'Уникальная форма': { ru: 'Уникальная форма', uz: 'Noyob shakl' },
      'Профиль трубка': { ru: 'Профиль трубка', uz: 'Nay profili' },
      'Эксклюзивный цвет': { ru: 'Эксклюзивный цвет', uz: 'Eksklyuziv rang' },
      'Полая структура': { ru: 'Полая структура', uz: 'Bo\'sh struktura' },
      'Лёгкое плетение': { ru: 'Лёгкое плетение', uz: 'Yengil to\'qish' },
      'Объём 5 литров': { ru: 'Объём 5 литров', uz: '5 litr tutum' },
      'Удобная ручка': { ru: 'Удобная ручка', uz: 'Qulay dasta' },
      'Натуральный дизайн': { ru: 'Натуральный дизайн', uz: 'Tabiiy dizayn' },
      'Объём 10 литров': { ru: 'Объём 10 литров', uz: '10 litr tutum' },
      'Классический дизайн': { ru: 'Классический дизайн', uz: 'Klassik dizayn' },
      'Традиционное плетение': { ru: 'Традиционное плетение', uz: 'An\'anaviy to\'qish' },
      'Округлые формы': { ru: 'Округлые формы', uz: 'Dumaloq shakllar' },
      'Мягкое плетение': { ru: 'Мягкое плетение', uz: 'Yumshoq to\'qish' },
      'Объём 16 литров': { ru: 'Объём 16 литров', uz: '16 litr tutum' },
      'Для крупных растений': { ru: 'Для крупных растений', uz: 'Katta o\'simliklar uchun' },
      'Классический стиль': { ru: 'Классический стиль', uz: 'Klassik uslub' },
      'Мягкие округлые формы': { ru: 'Мягкие округлые формы', uz: 'Yumshoq dumaloq shakllar' },
      'Для больших растений': { ru: 'Для больших растений', uz: 'Katta o\'simliklar uchun' },
    };
    return featureMap[feature]?.[language] || feature;
  };

  // Цветовые варианты мемоизированы для стабильности ссылок
  // Цветовые варианты для кашпо 5л с ручкой (ОБНОВЛЕНО: Бежевый → Жёлтый)
  const colorVariantsWithHandle: ColorVariant[] = useMemo(() => [
    {
      id: 'yellow',
      name: getColorName('yellow'),
      images: [
        kashpo5lBeigeWithHandle,
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#FFD700'
    },
    {
      id: 'gray',
      name: getColorName('gray'),
      images: [
        kashpo5lGrayWithHandle,
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1493925410384-84f842e616fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#A9A9A9'
    },
    {
      id: 'white-birch',
      name: getColorName('white-birch'),
      images: [
        kashpo5lWhiteBirchWithHandle,
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#F5F5F0'
    }
  ], [language]);

  // Цветовые варианты для кашпо Пухляш (10л и 16л)
  const colorVariantsPuhlyash: ColorVariant[] = useMemo(() => [
    {
      id: 'beige',
      name: 'Бежевый',
      images: [
        kashpoBeigePuhlyash,
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#D2B48C'
    },
    {
      id: 'yellow',
      name: 'Жёлтый',
      images: [
        kashpoYellowPuhlyash, // ✅ Специальное жёлтое изображение для Пухляш
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#FFD700'
    },
    {
      id: 'buttery',
      name: 'Кремовый',
      images: [
        kashpoButteryPuhlyash, // ✅ НОВОЕ специальное кремовое изображение для Пухляш
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1493925410384-84f842e616fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#FFFDD0'
    },
    {
      id: 'white-birch',
      name: 'Белая берёзка',
      images: [
        kashpoWhiteBirchPuhlyash, // ✅ Специальное изображение Белая берёзка для Пухляш
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#F5F5F0'
    },
    {
      id: 'brown',
      name: 'Коричневый',
      images: [
        kashpoBrownClassicPuhlyash, // ✅ ОБНОВЛЕНО: специальное коричневое изображение для Пухляш
        kashpoBrownClassicPuhlyash,
        kashpoBrownClassicPuhlyash
      ],
      color: '#8B4513'
    },
    {
      id: 'brown-white',
      name: 'Коричнево-Белый',
      images: [
        kashpoBrownWhitePuhlyash, // ✅ НОВОЕ специальное коричнево-белое изображение для Пухляш
        'https://images.unsplash.com/photo-1627202626612-1e304a201b32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMHdoaXRlJTIwYmFza2V0fGVufDF8fHx8MTc2MDI3Nzk0MHww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#A0826D' // Коричнево-белый миксовый цвет
    },
    {
      id: 'tricolor',
      name: 'Трёхцветный',
      images: [
        kashpoTricolorPuhlyash, // ✅ НОВОЕ специальное трёхцветное изображение для Пухляш
        kashpoTricolorPuhlyash,
        kashpoTricolorPuhlyash
      ],
      color: '#C4A57B', // Запасной цвет
      gradient: 'linear-gradient(120deg, #FFFFFF 0%, #FFFFFF 33%, #8B4513 33%, #8B4513 66%, #BC9973 66%, #BC9973 100%)' // ⚪|🟤|🟫 РЕЗКИЙ ГРАДИЕНТ - 3 ЧЁТКИЕ ПОЛОСЫ
    }
  ], []);

  // Цветовые варианты для кашпо Классика (10л и 16л) с отдельным серым изображением
  const colorVariantsClassic: ColorVariant[] = useMemo(() => [
    {
      id: 'buttery',
      name: 'Кремовый',
      images: [
        kashpoButteryClassic, // ✅ НОВОЕ специальное кремовое изображение для Классика
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#FFFDD0'
    },
    {
      id: 'yellow',
      name: 'Жёлтый',
      images: [
        kashpoYellowClassic, // ✅ НОВОЕ специальное изображение для Классика
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#FFD700'
    },
    {
      id: 'gray',
      name: 'Серый',
      images: [
        kashpoGrayClassic,
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1493925410384-84f842e616fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#A9A9A9'
    },
    {
      id: 'white-birch',
      name: 'Белая берёзка',
      images: [
        kashpoWhiteBirchClassic, // ✅ Специальное изображение Белая берёзка с логотипом BTT для Классика
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#F5F5F0'
    }
    // ❌ УДАЛЁН: Коричневый цвет больше не доступен для Классика
  ], []);
  
  // Цветовые варианты для Плоского ротанга
  const colorVariantsFlatRattan: ColorVariant[] = useMemo(() => {
    console.log('🎨 [ВАЖНО] Импортированное коричневое изображение:', rattanFlatBrown);
    console.log('🎨 [ВАЖНО] Импортированное бледно-жёлтое изображение:', rattanFlatPaleYellow);
    console.log('🎨 [ВАЖНО] ✨ НОВОЕ Импортированное жемчужное изображение:', rattanFlatPearl);
    console.log('🎨 [ВАЖНО] Импортированное песочное изображение:', rattanFlatSand);
    console.log('🎨 [ВАЖНО] Импортированное светло серое изображение:', rattanFlatLightGrey);
    console.log('🎨 [ВАЖНО] Импортированное фиолетовое изображение:', rattanFlatPurple);
    console.log('🎨 [ВАЖНО] Импортированное серое изображение:', rattanFlatGrey);
    
    const variants = [
      {
        id: 'brown',
        name: 'Коричневый',
        images: [
          rattanFlatBrown,
          rattanFlatBrown,
          rattanFlatBrown
        ],
        color: '#8B4513',
        article: '0306Пл'
      },
      {
        id: 'pale-yellow',
        name: 'Бледно жёлтый',
        images: [
          rattanFlatPaleYellow,
          rattanFlatPaleYellow,
          rattanFlatPaleYellow
        ],
        color: '#F5DEB3',
        article: '1110Пл'
      },
      {
        id: 'pearl',
        name: 'Жемчуг',
        images: [
          rattanFlatPearl,
          rattanFlatPearl,
          rattanFlatPearl
        ],
        color: '#F0EAE4',
        article: '2305ПЛ'
      },
      {
        id: 'sand',
        name: 'Песочный',
        images: [
          rattanFlatSand,
          rattanFlatSand,
          rattanFlatSand
        ],
        color: '#E8D5B7',
        article: '2310ПЛ'
      },
      {
        id: 'light-grey',
        name: 'Светло серый',
        images: [
          rattanFlatLightGrey,
          rattanFlatLightGrey,
          rattanFlatLightGrey
        ],
        color: '#C0C0C0',
        article: '2809ПЛ'
      },
      {
        id: 'purple',
        name: 'Фиолетовый',
        images: [
          rattanFlatPurple,
          rattanFlatPurple,
          rattanFlatPurple
        ],
        color: '#8B7BA8',
        article: '3034Пл'
      },
      {
        id: 'grey',
        name: 'Серый',
        images: [
          rattanFlatGrey,
          rattanFlatGrey,
          rattanFlatGrey
        ],
        color: '#808080',
        article: '3045ПЛ'
      }
    ];
    console.log('🎨 [CatalogPage] Варианты плоского ротанга созданы:', variants);
    console.log('🎨 [ПРОВЕРКА] Коричневый вариант images[0]:', variants[0].images[0]);
    console.log('🎨 [ПРОВЕРКА] Бледно-жёлтый вариант images[0]:', variants[1].images[0]);
    console.log('🎨 [ПРОВЕРКА] Жемчужный вариант images[0]:', variants[2].images[0]);
    console.log('🎨 [ПРОВЕРКА] Песочный вариант images[0]:', variants[3].images[0]);
    console.log('🎨 [ПРОВЕРКА] Светло серый вариант images[0]:', variants[4].images[0]);
    console.log('🎨 [ПРОВЕРКА] Фиолетовый вариант images[0]:', variants[5].images[0]);
    console.log('🎨 [ПРОВЕРКА] Серый вариант images[0]:', variants[6].images[0]);
    return variants;
  }, []);

  // Цветовые варианты для Ротанга Полусфера (id: '1')
  const colorVariantsSphere: ColorVariant[] = useMemo(() => {
    console.log('🎨 [ВАЖНО] Жемчужное изображение для Полусферы:', rattanPearlSphereAndCrescent);
    console.log('🎨 [ВАЖНО] Песочное изображение для Полусферы:', rattanSandSphereAndCrescent);
    console.log('🎨 [ВАЖНО] Светло серое изображение для Полусферы:', rattanLightGreySphereAndCrescent);
    console.log('🎨 [ВАЖНО] Золотое изображение для Полусферы:', rattanGoldSphereAndCrescent);
    console.log('🎨 [ВАЖНО] Серое с начёсом изображение для Полусферы:', rattanBrushedGreySphereAndCrescent);
    console.log('🎨 [ВАЖНО] Красное дерево изображение для Полусферы:', rattanMahoganySphere);
    console.log('🎨 [ВАЖНО] Белая берёзка изображение для Полусферы (ЭКСКЛЮЗИВ!):', rattanWhiteBirchSphere);
    console.log('🎨 [ВАЖНО] Бронза изображение для Полусферы (НОВОЕ!):', rattanBronzeSphere);
    console.log('🎨 [ВАЖНО] Фиолетовое изображение для Полусферы (НОВОЕ!):', rattanPurpleSphereAndCrescent);
    console.log('🎨 [ВАЖНО] Серое изображение для Полусферы (НОВОЕ!):', rattanGreySphereAndCrescent);
    
    return [
      {
        id: 'pearl',
        name: 'Жемчужный',
        images: [
          rattanPearlSphereAndCrescent,
          rattanPearlSphereAndCrescent,
          rattanPearlSphereAndCrescent
        ],
        color: '#F0EAE4',
        article: '2305'
      },
      {
        id: 'sand',
        name: 'Песочный',
        images: [
          rattanSandSphereAndCrescent,
          rattanSandSphereAndCrescent,
          rattanSandSphereAndCrescent
        ],
        color: '#E8D5B7',
        article: '2310'
      },
      {
        id: 'light-grey',
        name: 'Светло серый',
        images: [
          rattanLightGreySphereAndCrescent,
          rattanLightGreySphereAndCrescent,
          rattanLightGreySphereAndCrescent
        ],
        color: '#C0C0C0',
        article: '2708'
      },
      {
        id: 'gold',
        name: 'Золото',
        images: [
          rattanGoldSphereAndCrescent,
          rattanGoldSphereAndCrescent,
          rattanGoldSphereAndCrescent
        ],
        color: '#FFD700',
        article: '5830'
      },
      {
        id: 'brushed-grey',
        name: 'Серый с начёсом',
        images: [
          rattanBrushedGreySphereAndCrescent,
          rattanBrushedGreySphereAndCrescent,
          rattanBrushedGreySphereAndCrescent
        ],
        color: '#808080',
        article: '0510'
      },
      {
        id: 'mahogany',
        name: 'Красное дерево',
        images: [
          rattanMahoganySphere,
          rattanMahoganySphere,
          rattanMahoganySphere
        ],
        color: '#7B3F00',
        article: '0609'
      },
      {
        id: 'white-birch',
        name: 'Белая берёзка',
        images: [
          rattanWhiteBirchSphere,
          rattanWhiteBirchSphere,
          rattanWhiteBirchSphere
        ],
        color: '#F5F5F0',
        article: '0310'
      },
      {
        id: 'bronze',
        name: 'Бронза',
        images: [
          rattanBronzeSphere,
          rattanBronzeSphere,
          rattanBronzeSphere
        ],
        color: '#CD7F32',
        article: '1710'
      },
      {
        id: 'purple',
        name: 'Фиолетовый',
        images: [
          rattanPurpleSphereAndCrescent,
          rattanPurpleSphereAndCrescent,
          rattanPurpleSphereAndCrescent
        ],
        color: '#8B7BA8',
        article: '3034'
      },
      {
        id: 'grey',
        name: 'Серый',
        images: [
          rattanGreySphereAndCrescent,
          rattanGreySphereAndCrescent,
          rattanGreySphereAndCrescent
        ],
        color: '#808080',
        article: '3045'
      }
    ];
  }, []);

  // Цветовые варианты для Ротанга Полумесяц (id: '1-crescent')
  const colorVariantsCrescent: ColorVariant[] = useMemo(() => {
    console.log('🎨 [ВАЖНО] Жемчужное изображение для Полумесяца:', rattanPearlSphereAndCrescent);
    console.log('🎨 [ВАЖНО] Песочное изображение для Полумесяца:', rattanSandSphereAndCrescent);
    console.log('🎨 [ВАЖНО] Светло серое изображение для Полумесяца:', rattanLightGreySphereAndCrescent);
    console.log('🎨 [ВАЖНО] Золотое изображение для Полумесяца:', rattanGoldSphereAndCrescent);
    console.log('🎨 [ВАЖНО] Серое с начёсом изображение для Полумесяца:', rattanBrushedGreySphereAndCrescent);
    console.log('🎨 [ВАЖНО] Красное дерево изображение для Полумесяца (ЭКСКЛЮЗИВ!):', rattanMahoganyCrescent);
    console.log('🎨 [ВАЖНО] Белое изображение для Полумесяца (НОВОЕ!):', rattanWhiteCrescent);
    console.log('🎨 [ВАЖНО] Фиолетовое изображение для Полумесяца (НОВОЕ!):', rattanPurpleSphereAndCrescent);
    console.log('🎨 [ВАЖНО] Серое изображение для Полумесяца (НОВОЕ!):', rattanGreySphereAndCrescent);
    
    return [
      {
        id: 'pearl',
        name: 'Жемчужный',
        images: [
          rattanPearlSphereAndCrescent,
          rattanPearlSphereAndCrescent,
          rattanPearlSphereAndCrescent
        ],
        color: '#F0EAE4',
        article: '2305П'
      },
      {
        id: 'sand',
        name: 'Песочный',
        images: [
          rattanSandSphereAndCrescent,
          rattanSandSphereAndCrescent,
          rattanSandSphereAndCrescent
        ],
        color: '#E8D5B7',
        article: '2310П'
      },
      {
        id: 'light-grey',
        name: 'Светло серый',
        images: [
          rattanLightGreySphereAndCrescent,
          rattanLightGreySphereAndCrescent,
          rattanLightGreySphereAndCrescent
        ],
        color: '#C0C0C0',
        article: '2708П'
      },
      {
        id: 'gold',
        name: 'Золото',
        images: [
          rattanGoldSphereAndCrescent,
          rattanGoldSphereAndCrescent,
          rattanGoldSphereAndCrescent
        ],
        color: '#FFD700',
        article: '5830П'
      },
      {
        id: 'brushed-grey',
        name: 'Серый с начёсом',
        images: [
          rattanBrushedGreySphereAndCrescent,
          rattanBrushedGreySphereAndCrescent,
          rattanBrushedGreySphereAndCrescent
        ],
        color: '#808080',
        article: '0510П'
      },
      {
        id: 'mahogany',
        name: 'Красное дерево',
        images: [
          rattanMahoganyCrescent,
          rattanMahoganyCrescent,
          rattanMahoganyCrescent
        ],
        color: '#7B3F00',
        article: '0609П'
      },
      {
        id: 'white',
        name: 'Белый',
        images: [
          rattanWhiteCrescent,
          rattanWhiteCrescent,
          rattanWhiteCrescent
        ],
        color: '#FFFFFF',
        article: '1706П'
      },
      {
        id: 'purple',
        name: 'Фиолетовый',
        images: [
          rattanPurpleSphereAndCrescent,
          rattanPurpleSphereAndCrescent,
          rattanPurpleSphereAndCrescent
        ],
        color: '#8B7BA8',
        article: '3034П'
      },
      {
        id: 'grey',
        name: 'Серый',
        images: [
          rattanGreySphereAndCrescent,
          rattanGreySphereAndCrescent,
          rattanGreySphereAndCrescent
        ],
        color: '#808080',
        article: '3045П'
      }
    ];
  }, []);

  // Цветовые варианты для Ротанга Трубка (id: '1-tube')
  const colorVariantsTube: ColorVariant[] = useMemo(() => {
    console.log('🎨 [ВАЖНО] Черное с золотыми наплывами изображение для Трубки (НОВОЕ!):', rattanBlackGoldTube);
    
    return [
      {
        id: 'black-gold',
        name: 'Черная с золотыми наплывами',
        images: [
          rattanBlackGoldTube,
          rattanBlackGoldTube,
          rattanBlackGoldTube
        ],
        color: '#1A1A1A',
        article: '2104R'
      }
    ];
  }, []);

  // Объединенный массив всех цветовых вариантов для фильтров
  const allColorVariants = useMemo(() => {
    const allVariants = [
      ...colorVariantsWithHandle,
      ...colorVariantsPuhlyash,
      ...colorVariantsSphere,
      ...colorVariantsCrescent,
      ...colorVariantsFlatRattan,
      ...colorVariantsTube
    ];
    
    // Удаляем дубликаты по id
    const uniqueVariants = allVariants.filter((variant, index, self) =>
      index === self.findIndex((v) => v.id === variant.id)
    );
    
    console.log('🎨 [CatalogPage] Всего уникальных цветовых вариантов:', uniqueVariants.length);
    console.log('🎨 [CatalogPage] Список всех цветов:', uniqueVariants.map(v => `${v.name} (${v.id})`).join(', '));
    
    return uniqueVariants;
  }, [colorVariantsWithHandle, colorVariantsPuhlyash, colorVariantsSphere, colorVariantsCrescent, colorVariantsFlatRattan, colorVariantsTube]);

  const products: Product[] = useMemo(() => {
    const productsList = [
    {
      id: '1',
      name: getProductName('1'),
      description: getProductDescription('1'),
      image: colorVariantsSphere[0].images[0],
      features: ['Профиль полусфера', 'Различные цвета', 'Высокая прочность', 'Для классического плетения'].map(translateFeature),
      variants: colorVariantsSphere,
      category: 'materials'
    },
    {
      id: '1-sphere',
      name: getProductName('1-sphere'),
      description: getProductDescription('1-sphere'),
      image: 'https://images.unsplash.com/photo-1737740068972-d3457e694bac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3ZlbiUyMGJhc2tldCUyMG1hdGVyaWFsfGVufDF8fHx8MTc2MDI5NTEwNnww&ixlib=rb-4.1.0&q=80&w=1080',
      features: ['Профиль сфера', 'Различные цвета', 'Объёмное плетение', 'Мягкая текстура'].map(translateFeature),
      category: 'materials'
    },
    {
      id: '1-flat',
      name: getProductName('1-flat'),
      description: getProductDescription('1-flat'),
      image: colorVariantsFlatRattan[0].images[0],
      features: ['Плоский профиль', 'Гладкое плетение', 'От 6 до 10мм', 'Высокая прочность'].map(translateFeature),
      variants: colorVariantsFlatRattan,
      category: 'materials'
    },
    {
      id: '1-crescent',
      name: getProductName('1-crescent'),
      description: getProductDescription('1-crescent'),
      image: colorVariantsCrescent[0].images[0],
      features: ['Профиль полумесяц', 'Различные цвета', 'Декоративное плетение', 'Уникальная форма'].map(translateFeature),
      variants: colorVariantsCrescent,
      category: 'materials'
    },
    {
      id: '1-tube',
      name: getProductName('1-tube'),
      description: getProductDescription('1-tube'),
      image: colorVariantsTube[0].images[0],
      features: ['Профиль трубка', 'Эксклюзивный цвет', 'Полая структура', 'Лёгкое плетение'].map(translateFeature),
      variants: colorVariantsTube,
      category: 'materials'
    },
    {
      id: '2',
      name: getProductName('2'),
      description: getProductDescription('2'),
      image: colorVariantsWithHandle[0].images[0],
      features: ['Объём 5 литров', 'Удобная ручка', 'Натуральный дизайн', 'Различные цвета'].map(translateFeature),
      variants: colorVariantsWithHandle,
      category: 'kashpo',
      size: '5л',
      style: 'с ручкой',
      dimensions: {
        height: 255,
        diameter: 290
      }
    },
    {
      id: '3',
      name: getProductName('3'),
      description: getProductDescription('3'),
      image: colorVariantsClassic[0].images[0],
      features: ['Объём 10 литров', 'Классический дизайн', 'Традиционное плетение', 'Различные цвета'].map(translateFeature),
      variants: colorVariantsClassic,
      category: 'kashpo',
      size: '10л',
      style: 'Классик',
      dimensions: {
        height: 240,
        diameter: 310
      }
    },
    {
      id: '4',
      name: getProductName('4'),
      description: getProductDescription('4'),
      image: colorVariantsPuhlyash[0].images[0],
      features: ['Объём 10 литров', 'Округлые формы', 'Мягкое плетение', 'Различные цвета'].map(translateFeature),
      variants: colorVariantsPuhlyash,
      category: 'kashpo',
      size: '10л',
      style: 'Пухляш',
      dimensions: {
        height: 240,
        diameter: 330
      }
    },
    {
      id: '5',
      name: getProductName('5'),
      description: getProductDescription('5'),
      image: colorVariantsClassic[0].images[0],
      features: ['Объём 16 литров', 'Для крупных растений', 'Классический стиль', 'Различные цвета'].map(translateFeature),
      variants: colorVariantsClassic,
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
      name: getProductName('6'),
      description: getProductDescription('6'),
      image: colorVariantsPuhlyash[0].images[0],
      features: ['Объём 16 литров', 'Мягкие округлые формы', 'Для больших растений', 'Различные цвета'].map(translateFeature),
      variants: colorVariantsPuhlyash,
      category: 'kashpo',
      size: '16л',
      style: 'Пухляш',
      dimensions: {
        height: 280,
        diameter: 360
      }
    }
  ];
    console.log('🎨 [CatalogPage] Продукты созданы, всего:', productsList.length);
    return productsList;
  }, [colorVariantsWithHandle, colorVariantsClassic, colorVariantsPuhlyash, colorVariantsFlatRattan, colorVariantsSphere, colorVariantsCrescent, colorVariantsTube, language]);
  const allProducts = useMemo(
    () => (cmsProducts.length ? [...cmsProducts, ...products] : products),
    [cmsProducts, products],
  );
  
  // Проверка товаров Пухляш
  console.log('🏺 Товар "Кашпо 10л Пухляш":', products.find(p => p.id === '4'));
  console.log('🏺 Товар "Кашпо 16л Пухляш":', products.find(p => p.id === '6'));

  // Инициализация выбранных вариантов
  useEffect(() => {
    const initialVariants: {[key: string]: string} = {};
    allProducts.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        initialVariants[product.id] = product.variants[0].id;
        
        // Логирование для товаров Пухляш
        if (product.name.includes('Пухляш')) {
          console.log(`🔧 Инициализация ${product.name}:`, {
            productId: product.id,
            defaultVariantId: product.variants[0].id,
            defaultVariantName: product.variants[0].name,
            defaultImage: product.variants[0].images[0]
          });
        }
      }
    });
    console.log('🔧 Инициализация selectedVariants:', initialVariants);
    setSelectedVariants(initialVariants);
  }, [allProducts]);

  const shapeIds: Record<string, string[]> = {
    hemi: ['1'],
    sphere: ['1-sphere'],
    flat: ['1-flat'],
    crescent: ['1-crescent'],
    tube: ['1-tube'],
  };

  const matchesShapeFor = (product: Product) => {
    if (shapeFilter === 'all') return true;
    if (product.category !== 'materials') return true;
    return shapeIds[shapeFilter]?.includes(product.id) ?? true;
  };

  // Фильтрация товаров с учетом активной категории
  const filteredProducts = allProducts.filter((product) => {
    // Фильтр по категории
    const matchesCategory =
      activeCategory === 'planters'
        ? product.category !== 'materials'
        : product.category === 'materials';

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesColor =
      colorFilter === 'all' ||
      (product.variants && product.variants.some((v) => v.id === colorFilter));

    const matchesSize = sizeFilter === 'all' || product.size === sizeFilter;
    const matchesStyle = styleFilter === 'all' || product.style === styleFilter;

    const isPlanter = product.category !== 'materials';
    const matchesWhere =
      whereFilter === 'all' ||
      (whereFilter === 'street' &&
        (product.category === 'materials' ||
          product.size === '10л' ||
          product.size === '16л')) ||
      (whereFilter === 'home' &&
        (product.category === 'materials' ||
          product.size === '5л' ||
          product.size === '10л' ||
          (isPlanter && product.size !== '16л')));

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'in_stock' && product.category !== 'materials') ||
      (stockFilter === 'order' && product.category === 'materials');

    const matchesShape = matchesShapeFor(product);

    return (
      matchesCategory &&
      matchesSearch &&
      matchesColor &&
      matchesSize &&
      matchesStyle &&
      matchesWhere &&
      matchesStock &&
      matchesShape
    );
  });

  // Сортировка товаров
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        if (!a.size || !b.size) return 0;
        const sizeA = parseInt(a.size);
        const sizeB = parseInt(b.size);
        return sizeA - sizeB;
      case 'style':
        return (a.style || '').localeCompare(b.style || '');
      default:
        return 0;
    }
  });
  const reduceListAnimations = prefersReducedMotion || sortedProducts.length > 8;

  useEffect(() => {
    setVisibleCount(8);
  }, [
    activeCategory,
    searchTerm,
    colorFilter,
    sizeFilter,
    styleFilter,
    whereFilter,
    stockFilter,
    shapeFilter,
    sortBy,
  ]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 8, sortedProducts.length));
        }
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [sortedProducts.length]);

  const handleVariantChange = (productId: string, variantId: string) => {
    console.log(`🎨 [CatalogPage] Изменение варианта для продукта ${productId} на ${variantId}`);
    
    setSelectedVariants(prev => {
      const newVariants = {
        ...prev,
        [productId]: variantId
      };
      console.log('✅ [CatalogPage] Новые выбранные варианты:', newVariants);
      return newVariants;
    });
  };

  const handleAddToCart = (product: Product) => {
    const selectedVariant = product.variants?.find(v => v.id === selectedVariants[product.id]);
    
    onAddToCart({
      ...product,
      selectedVariant,
      selectedImageIndex: 0,
      image: selectedVariant?.images[0] || product.image
    });
  };

  const getCurrentImage = (product: Product) => {
    if (product.variants && selectedVariants[product.id]) {
      const selectedVariant = product.variants.find(v => v.id === selectedVariants[product.id]);
      const currentImage = selectedVariant?.images[0] || product.image;
      
      // Детальное логирование для Ротанг Плоский
      if (product.name === 'Ротанг Плоский') {
        console.log(`🖼️ [РОТАНГ ПЛОСКИЙ] Получение изображения:`, {
          productId: product.id,
          selectedVariantId: selectedVariants[product.id],
          selectedVariantName: selectedVariant?.name,
          selectedVariantArticle: selectedVariant?.article,
          allVariants: product.variants.map(v => ({ id: v.id, name: v.name, firstImage: v.images[0] })),
          currentImage,
          imageType: typeof currentImage,
          imageStartsWith: typeof currentImage === 'string' ? currentImage.substring(0, 50) : 'not a string'
        });
      }
      
      // Логирование для товаров Пухляш и других Ротанговых материалов
      if (product.name.includes('Пухляш') || (product.name.includes('Ротанг') && product.name !== 'Ротанг Плоский')) {
        console.log(`🖼️ [CatalogPage] Текущее изображение для ${product.name}:`, {
          productId: product.id,
          variantId: selectedVariants[product.id],
          variantName: selectedVariant?.name,
          hasVariants: !!product.variants,
          variantsLength: product.variants?.length,
          currentImage,
          selectedVariant
        });
      }
      
      return currentImage;
    }
    return product.image;
  };

  const getImageGallery = (product: Product) => {
    if (product.variants && selectedVariants[product.id]) {
      const selectedVariant = product.variants.find(v => v.id === selectedVariants[product.id]);
      return selectedVariant?.images || [product.image];
    }
    return [product.image];
  };

  // Получение уникальных значений для фильтров
  // Доступные цвета только для текущей категории
  const availableColors = useMemo(() => {
    const categoryProducts = allProducts.filter(p => 
      activeCategory === 'planters' 
        ? p.category !== 'materials' 
        : p.category === 'materials'
    );
    
    const colors = Array.from(new Set(
      categoryProducts.flatMap(p => p.variants?.map(v => v.id) || [])
    ));
    
    console.log(`🎨 [CatalogPage] Доступные цвета для категории "${activeCategory}":`, colors);
    console.log(`🎨 [CatalogPage] Всего цветов в allColorVariants:`, allColorVariants.length);
    console.log(`🎨 [CatalogPage] Товаров в категории:`, categoryProducts.length);
    
    return colors;
  }, [allProducts, activeCategory, allColorVariants]);

  // Доступные размеры только для текущей категории
  const availableSizes = useMemo(() => {
    const categoryProducts = allProducts.filter(p => 
      activeCategory === 'planters' 
        ? p.category !== 'materials' 
        : p.category === 'materials'
    );
    
    return Array.from(new Set(
      categoryProducts.map(p => p.size).filter(Boolean)
    ));
  }, [allProducts, activeCategory]);

  // Доступные стили только для текущей категории
  const availableStyles = useMemo(() => {
    const categoryProducts = allProducts.filter(p => 
      activeCategory === 'planters' 
        ? p.category !== 'materials' 
        : p.category === 'materials'
    );
    
    return Array.from(new Set(
      categoryProducts.map(p => p.style).filter(Boolean)
    ));
  }, [allProducts, activeCategory]);

  // Счетчики товаров по категориям
  const plantersCount = allProducts.filter(p => p.category !== 'materials').length;
  const materialsCount = allProducts.filter(p => p.category === 'materials').length;
  const seoClusterContent = useMemo(() => {
    if (language === 'uz') {
      return activeCategory === 'materials'
        ? {
            title: 'Rattan ip katalogi: Toshkentda ulgurji va chakana',
            text: 'Suniy rattan ipning 5 turi (yarim shar, shar, tekis, yarim oy, nay), 18 rang va ishlab chiqaruvchidan to\'g\'ridan-to\'g\'ri narxlar. Ulgurji buyurtmalar va O\'zbekiston bo\'ylab yetkazib berish mavjud.',
            faq: [
              { q: 'Minimal buyurtma qancha?', a: 'Rattan ip uchun minimal buyurtma 5 kg.' },
              { q: 'Qaysi ranglar mavjud?', a: '18 xil rang va maxsus premium variantlar mavjud.' },
            ],
          }
        : {
            title: 'To\'qilgan kashpo katalogi: 5L, 10L, 16L',
            text: 'Qo\'lda to\'qilgan kashpolar turli hajm va uslublarda: klassika, puffy va rombik. Ichki va tashqi interyer uchun mos, to\'g\'ridan-to\'g\'ri ishlab chiqaruvchidan xarid qiling.',
            faq: [
              { q: 'Qaysi hajmlar bor?', a: 'Asosiy hajmlar: 5 litr, 10 litr, 16 litr.' },
              { q: 'Yetkazib berish bormi?', a: 'Ha, O\'zbekiston bo\'ylab yetkazib berish mavjud.' },
            ],
          };
    }

    if (activeCategory === 'materials') {
      return {
        title: 'Каталог ротанговой нити в Ташкенте: 5 типов и 18 цветов',
        text: 'Купить искусственный ротанг в Ташкенте напрямую от производителя Bententrade. В наличии профили полусфера, сфера, плоский, полумесяц и трубка. Подходит для плетения мебели, кашпо и декора; доступен опт и розница.',
        faq: [
          { q: 'Сколько стоит ротанговая нить?', a: 'Базовая цена: 36 000 сум за кг, минимальная покупка от 5 кг.' },
          { q: 'Есть ли оптовые цены на ротанг?', a: 'Да, для оптовых и регулярных заказов действуют специальные условия.' },
          { q: 'Какие цвета доступны?', a: 'В каталоге доступно 18 цветов, включая эксклюзивные оттенки.' },
        ],
      };
    }

    return {
      title: 'Каталог плетеных кашпо из ротанга: 5л, 10л, 16л',
      text: 'Плетеные кашпо ручной работы для дома, балкона и террасы. Модели в разных размерах и стилях: классика, пухляш, ромбик. Заказ напрямую у производителя в Ташкенте с доставкой по Узбекистану.',
      faq: [
        { q: 'Какие объемы кашпо доступны?', a: 'Основные размеры: 5 литров, 10 литров и 16 литров.' },
        { q: 'Можно ли заказать кашпо оптом?', a: 'Да, доступны розничные и оптовые заказы для бизнеса и проектов.' },
        { q: 'Подходит ли кашпо для улицы?', a: 'Да, материалы устойчивы к эксплуатации в интерьере и экстерьере.' },
      ],
    };
  }, [activeCategory, language]);
  const clusterFaqJsonLd = useMemo(() => {
    const faqItems = seoClusterContent.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems,
    };
  }, [seoClusterContent]);

  const focusedProductId = productSlug ? getProductIdForSlug(productSlug) : null;
  const focusedProduct = focusedProductId ? allProducts.find((p) => p.id === focusedProductId) : null;

  useEffect(() => {
    if (!productSlug || !focusedProduct) return;
    trackEvent('view_item', {
      item_id: focusedProduct.id,
      item_name: focusedProduct.name,
      item_category: focusedProduct.category,
    });
  }, [productSlug, focusedProduct?.id, focusedProduct?.name, focusedProduct?.category]);

  if (productSlug && onProductSlugChange) {
    if (!focusedProduct) {
      return (
        <div className="min-h-screen bg-background px-4 py-24 text-center">
          <p className="mb-4 text-muted-foreground">
            {pickLang(language, { ru: 'Товар не найден', uz: 'Mahsulot topilmadi', en: 'Product not found' })}
          </p>
          <Button type="button" onClick={() => onProductSlugChange(null)}>
            {t.catalog}
          </Button>
        </div>
      );
    }
    const pid = focusedProduct.id;
    const vid = selectedVariants[pid] || focusedProduct.variants?.[0]?.id || '';
    return (
      <MarketplacePDP
        product={focusedProduct}
        selectedVariantId={vid}
        onVariantChange={(variantId) => handleVariantChange(pid, variantId)}
        getColorName={getColorName}
        onBack={() => onProductSlugChange(null)}
        onAddToCart={({ widthMm }) => {
          const sv = focusedProduct.variants?.find((v) => v.id === selectedVariants[pid]);
          const lineMeta =
            widthMm != null
              ? pickLang(language, {
                  ru: `Ширина нити: ${widthMm} мм`,
                  uz: `Ip kengligi: ${widthMm} mm`,
                  en: `Thread width: ${widthMm} mm`,
                })
              : undefined;
          onAddToCart({
            ...focusedProduct,
            selectedVariant: sv,
            selectedImageIndex: 0,
            image: sv?.images[0] || focusedProduct.image,
            lineMeta,
          });
        }}
        onOneClick={({ widthMm }) => {
          const sv = focusedProduct.variants?.find((v) => v.id === selectedVariants[pid]);
          onExpressCheckout?.({ product: focusedProduct, selectedVariant: sv, widthMm });
        }}
        language={language}
        t={t}
        homeLabel={pickLang(language, { ru: 'Главная', uz: 'Bosh sahifa', en: 'Home' })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Современные декоративные элементы с glassmorphism */}
      <motion.div 
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(180, 83, 9, 0.08) 0%, transparent 70%)' }}
        animate={prefersReducedMotion ? undefined : { 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2] 
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      <motion.div 
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(77, 124, 15, 0.06) 0%, transparent 60%)' }}
        animate={prefersReducedMotion ? undefined : { 
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15] 
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      <motion.div 
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(120, 113, 108, 0.06) 0%, transparent 50%)' }}
        animate={prefersReducedMotion ? undefined : { 
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1] 
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      {/* Noise overlay для текстуры */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10 py-20" ref={ref}>
        {/* Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Breadcrumbs
            items={[
              { label: t.home, onClick: onBackToHome },
              { label: t.catalog }
            ]}
          />
        </motion.div>

        {/* Кнопка возврата и заголовок */}
        <div className="mb-16">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            onClick={onBackToHome}
            className="flex items-center gap-3 mb-8 glass-card px-4 py-2 rounded-xl border-primary/20 text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group micro-interaction"
          >
            <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
            <span className="group-hover:text-gradient transition-all duration-300">{t.backToMain}</span>
          </motion.button>

          <div className="text-center">
            <motion.h1 
              className="font-grotesk text-gradient mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6 }}
            >
              {t.catalogTitle}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={inView ? { opacity: 1, width: '120px' } : { opacity: 0, width: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-1 modern-gradient mx-auto rounded-full neon-glow"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-muted-foreground max-w-2xl mx-auto mt-6 text-balance"
            >
              {t.catalogDescription}
            </motion.p>
          </div>
        </div>

        {/* Табы для разделения категорий */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <Tabs 
            value={activeCategory} 
            onValueChange={(value) => {
              setActiveCategory(value as 'planters' | 'materials');
              // Сброс фильтров при смене категории
              setColorFilter('all');
              setSizeFilter('all');
              setStyleFilter('all');
              setWhereFilter('all');
              setStockFilter('all');
              setShapeFilter('all');
              setSearchTerm('');
            }}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-14 glass-effect border border-primary/20 p-1 rounded-2xl">
              <TabsTrigger 
                value="planters" 
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 h-full micro-interaction"
              >
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Package className="w-4 h-4" />
                  <span className="font-medium">{t.planters}</span>
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-primary/20 text-primary border-none"
                  >
                    {plantersCount}
                  </Badge>
                </motion.div>
              </TabsTrigger>
              <TabsTrigger 
                value="materials" 
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 h-full micro-interaction"
              >
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">{t.materials}</span>
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-primary/20 text-primary border-none"
                  >
                    {materialsCount}
                  </Badge>
                </motion.div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Описание активной категории */}
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mt-4 px-4"
          >
            {activeCategory === 'planters' ? (
              <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                {t.plantersDescription}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                {t.materialsDescription}
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* Панель поиска (упрощённая) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12 glass-effect p-6 md:p-8 rounded-3xl border border-primary/10"
        >
          {/* Поиск */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-xl glass-card border-primary/20 focus:border-primary/40 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Активный фильтр поиска */}
          {searchTerm && (
            <div className="flex justify-center mt-4">
              <Badge variant="secondary" className="glass-card border-primary/20 text-primary px-4 py-2 rounded-full neon-glow">
                {t.search}: {searchTerm}
                <button
                  type="button"
                  aria-label={language === 'uz' ? 'Qidiruvni tozalash' : 'Очистить поиск'}
                  onClick={() => setSearchTerm('')}
                  className="ml-3 text-primary/60 hover:text-primary micro-interaction font-bold"
                >
                  ×
                </button>
              </Badge>
            </div>
          )}

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.filterWhere}</p>
              <Select value={whereFilter} onValueChange={(v) => setWhereFilter(v as typeof whereFilter)}>
                <SelectTrigger className="glass-card border-primary/20 rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.filterWhereAll}</SelectItem>
                  <SelectItem value="street">{t.filterWhereStreet}</SelectItem>
                  <SelectItem value="home">{t.filterWhereHome}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.filterStock}</p>
              <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as typeof stockFilter)}>
                <SelectTrigger className="glass-card border-primary/20 rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.filterStockAll}</SelectItem>
                  <SelectItem value="in_stock">{t.filterStockIn}</SelectItem>
                  <SelectItem value="order">{t.filterStockOrder}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t.filterShape}</p>
              <Select value={shapeFilter} onValueChange={setShapeFilter} disabled={activeCategory !== 'materials'}>
                <SelectTrigger className="glass-card border-primary/20 rounded-xl h-11">
                  <SelectValue placeholder={t.filterShapeAll} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.filterShapeAll}</SelectItem>
                  <SelectItem value="hemi">{t.filterShapeHemi}</SelectItem>
                  <SelectItem value="sphere">{t.filterShapeSphere}</SelectItem>
                  <SelectItem value="flat">{t.filterShapeFlat}</SelectItem>
                  <SelectItem value="crescent">{t.filterShapeCrescent}</SelectItem>
                  <SelectItem value="tube">{t.filterShapeTube}</SelectItem>
                </SelectContent>
              </Select>
              {activeCategory !== 'materials' && (
                <p className="text-xs text-muted-foreground">{pickLang(language, { uz: 'Rattan bo‘limida ishlaydi', ru: 'Для раздела ротанга', en: 'Works in rattan tab' })}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 border-t border-primary/10 pt-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/60">
              {t.filterQuickPick}
            </span>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
              <Button
                type="button"
                variant={whereFilter === 'all' && stockFilter === 'all' && shapeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className="h-9 rounded-full px-4 text-xs"
                onClick={() => {
                  setWhereFilter('all');
                  setStockFilter('all');
                  setShapeFilter('all');
                }}
              >
                {t.filterStockAll}
              </Button>
              <Button
                type="button"
                variant={whereFilter === 'street' ? 'default' : 'outline'}
                size="sm"
                className="h-9 rounded-full px-4 text-xs"
                onClick={() => setWhereFilter('street')}
              >
                {t.filterWhereStreet}
              </Button>
              <Button
                type="button"
                variant={whereFilter === 'home' ? 'default' : 'outline'}
                size="sm"
                className="h-9 rounded-full px-4 text-xs"
                onClick={() => setWhereFilter('home')}
              >
                {t.filterWhereHome}
              </Button>
              <Button
                type="button"
                variant={activeCategory === 'planters' && stockFilter === 'in_stock' ? 'default' : 'outline'}
                size="sm"
                className="h-9 rounded-full px-4 text-xs"
                onClick={() => {
                  setActiveCategory('planters');
                  setStockFilter('in_stock');
                  setWhereFilter('all');
                  setShapeFilter('all');
                }}
              >
                {t.filterStockIn}
              </Button>
              <Button
                type="button"
                variant={activeCategory === 'materials' && stockFilter === 'order' ? 'default' : 'outline'}
                size="sm"
                className="h-9 rounded-full px-4 text-xs"
                onClick={() => {
                  setActiveCategory('materials');
                  setStockFilter('order');
                  setWhereFilter('all');
                  setShapeFilter('all');
                }}
              >
                {t.filterStockOrder}
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Товары */}
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.slice(0, visibleCount).map((product, index) => (
              <motion.div
                key={product.id}
                initial={reduceListAnimations ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.9 }}
                animate={inView ? (reduceListAnimations ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }) : { opacity: 0 }}
                transition={{ duration: reduceListAnimations ? 0.2 : 0.6, delay: reduceListAnimations ? 0 : index * 0.05 }}
                whileHover={reduceListAnimations ? undefined : { y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="group/card flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-md">
                  <CardHeader className="p-0 relative overflow-hidden">
                    <div className="aspect-square overflow-hidden relative">
                      {/* Изображение товара */}
                      <motion.div
                        whileHover={reduceListAnimations ? undefined : { scale: 1.05 }}
                        transition={{ duration: 0.25 }}
                        className="w-full h-full relative"
                      >
                        <ImageWithFallback
                          key={`${product.id}-${selectedVariants[product.id] || 'default'}`}
                          src={getCurrentImage(product)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-5 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <CardTitle className="group-hover:text-primary transition-colors font-grotesk text-xl leading-tight">
                        {product.name}
                      </CardTitle>
                      <div className="flex gap-1 ml-2 flex-wrap">
                        {product.size && (
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            {product.size}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-[15px]">
                      {getProductDescription(product.id)}
                    </p>

                    {/* Информация о размерах - универсальный блок с одинаковым отступом */}
                    {(product.dimensions || product.category === 'materials') && (
                      <motion.div
                        initial={reduceListAnimations ? { opacity: 1 } : { opacity: 0, y: 10 }}
                        animate={reduceListAnimations ? { opacity: 1 } : (inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 })}
                        transition={{ duration: reduceListAnimations ? 0 : 0.4, delay: reduceListAnimations ? 0 : index * 0.05 + 0.2 }}
                        className="mt-4 mb-4 p-4 glass-card rounded-xl border border-primary/10 hover:border-primary/20 transition-all duration-200"
                      >
                        {/* Размеры кашпо */}
                        {product.dimensions && (
                          <div className="flex items-center justify-around">
                            <div className="text-center">
                              <div className="text-primary font-medium mb-1 font-grotesk text-sm">
                                {t.height}
                              </div>
                              <div className="text-foreground font-grotesk text-lg font-medium">
                                {product.dimensions.height} {t.mm}
                              </div>
                            </div>
                            <div className="w-px h-10 bg-border" />
                            <div className="text-center">
                              <div className="text-primary font-medium mb-1 font-grotesk text-sm">
                                {t.diameter}
                              </div>
                              <div className="text-foreground font-grotesk text-lg font-medium">
                                {product.dimensions.diameter} {t.mm}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Размеры ротанга */}
                        {product.category === 'materials' && !product.dimensions && (
                          <div className="text-center">
                            <div className="text-primary font-medium mb-1 font-grotesk text-sm">
                              {t.sizeLabel}
                            </div>
                            <div className="text-foreground font-grotesk text-lg font-medium">
                              {product.id === '1-flat' && (language === 'uz' ? '6 dan 10mm gacha' : 'от 6 до 10мм')}
                              {product.id === '1-crescent' && (language === 'uz' ? '6 dan 9mm gacha' : 'от 6 до 9мм')}
                              {product.id === '1' && (language === 'uz' ? '5 dan 8mm gacha' : 'от 5 до 8мм')}
                              {product.id === '1-sphere' && '4mm'}
                              {product.id === '1-tube' && (language === 'uz' ? '4 dan 10mm gacha' : 'от 4 до 10мм')}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Селектор цвета для кашпо с вариантами */}
                    {product.variants && (
                      <motion.div
                        initial={reduceListAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
                        animate={reduceListAnimations ? { opacity: 1 } : (inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 })}
                        transition={{ duration: reduceListAnimations ? 0 : 0.5, delay: reduceListAnimations ? 0 : index * 0.05 + 0.3 }}
                        className="mb-4"
                      >
                        <p className="font-medium mb-4 text-primary font-grotesk">{t.selectColor}:</p>
                        <div className="flex gap-3 flex-wrap">
                          {product.variants.map((variant, variantIndex) => (
                            <motion.button
                              key={variant.id}
                              initial={reduceListAnimations ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                              animate={reduceListAnimations ? { opacity: 1, scale: 1 } : (inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 })}
                              transition={{ duration: reduceListAnimations ? 0 : 0.3, delay: reduceListAnimations ? 0 : index * 0.05 + variantIndex * 0.02 }}
                              whileHover={reduceListAnimations ? undefined : { scale: 1.05, y: -2 }}
                              whileTap={reduceListAnimations ? undefined : { scale: 0.95 }}
                              onClick={() => handleVariantChange(product.id, variant.id)}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 micro-interaction ${
                                selectedVariants[product.id] === variant.id
                                  ? 'border-primary bg-primary/10 text-primary neon-glow shadow-lg'
                                  : 'glass-card border-primary/20 text-muted-foreground hover:border-primary/40 hover:bg-primary/5'
                              }`}
                            >
                              <div
                                className="w-4 h-4 rounded-full border-2 border-foreground/20 shadow-sm"
                                style={{ background: variant.gradient || variant.color }}
                              />
                              <span className="font-medium">
                                {getColorName(variant.id)}
                                {product.category === 'materials' && variant.article && (
                                  <span className="text-xs opacity-70 ml-1">- {variant.article}</span>
                                )}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    
                    {product.features && (
                      <motion.ul className="text-muted-foreground space-y-1 mb-4 text-sm">
                        {product.features.slice(0, 3).map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            initial={reduceListAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                            animate={reduceListAnimations ? { opacity: 1, x: 0 } : (inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 })}
                            transition={{ duration: reduceListAnimations ? 0 : 0.4, delay: reduceListAnimations ? 0 : (index * 0.05) + (featureIndex * 0.02) }}
                            className="flex items-center group-hover:text-primary/80 transition-colors"
                          >
                            <motion.div
                              whileHover={reduceListAnimations ? undefined : { scale: 1.2, rotate: 360 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Check className="w-3 h-3 text-primary mr-2 flex-shrink-0" />
                            </motion.div>
                            {feature}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </CardContent>
                  
                  <CardFooter className="p-5 pt-0 flex flex-col gap-3">
                    {/* Цена товара */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      transition={{ duration: 0.4, delay: index * 0.05 + 0.4 }}
                      className="w-full text-center"
                    >
                      {(() => {
                        const isRattan = product.category === 'materials';
                        const is5l = product.size === '5л';
                        const is10l = product.size === '10л';
                        const is16l = product.size === '16л';
                        
                        let priceText = '';
                        
                        if (isRattan) {
                          priceText = pickLang(language, {
                            uz: `36 000 so'm/kg (min. 5kg = 180 000 so'm)`,
                            ru: `36 000 сум/кг (мин. 5кг = 180 000 сум)`,
                            en: `36,000 UZS/kg (min. 5 kg = 180,000 UZS)`,
                          });
                        } else if (is5l) {
                          priceText = pickLang(language, {
                            uz: '120 000 so\'m',
                            ru: '120 000 сум',
                            en: '120,000 UZS',
                          });
                        } else if (is10l) {
                          priceText = pickLang(language, {
                            uz: '187 000 so\'m',
                            ru: '187 000 сум',
                            en: '187,000 UZS',
                          });
                        } else if (is16l) {
                          priceText = pickLang(language, {
                            uz: '245 000 so\'m',
                            ru: '245 000 сум',
                            en: '245,000 UZS',
                          });
                        }
                        
                        return priceText ? (
                          <div className="text-lg font-bold text-primary font-grotesk">
                            {priceText}
                          </div>
                        ) : null;
                      })()}
                    </motion.div>
                    
                    <div className="flex flex-col gap-2 w-full">
                      {onProductSlugChange && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-10 rounded-xl border-primary/30"
                          onClick={() => onProductSlugChange(getSlugForProductId(product.id))}
                        >
                          {t.pdpOpen}
                        </Button>
                      )}
                      <motion.div
                        whileHover={reduceListAnimations ? undefined : { scale: 1.02 }}
                        whileTap={reduceListAnimations ? undefined : { scale: 0.98 }}
                        className="w-full"
                      >
                        <Button
                          className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 micro-interaction rounded-xl font-grotesk font-medium shadow-md"
                          onClick={() => handleAddToCart(product)}
                        >
                          <motion.span
                            whileHover={reduceListAnimations ? undefined : { scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                          >
                            {product.category === 'materials'
                              ? pickLang(language, {
                                  uz: '5kg dan buyurtma',
                                  ru: 'Заказать от 5кг',
                                  en: 'Order from 5 kg',
                                })
                              : t.order}
                            <Star className="w-4 h-4" />
                          </motion.span>
                        </Button>
                      </motion.div>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        {!isLoading && visibleCount < sortedProducts.length && (
          <div ref={loadMoreRef} className="h-8 w-full mt-6" aria-hidden="true" />
        )}

        {/* Сообщение об отсутствии результатов */}
        {!isLoading && sortedProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="glass-effect rounded-3xl p-10 md:p-16 border border-primary/10">
              <motion.div 
                className="w-20 h-20 glass-card rounded-full flex items-center justify-center mx-auto mb-8 neon-glow"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0] 
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Search className="w-10 h-10 text-primary" />
              </motion.div>
              <h3 className="font-grotesk text-gradient mb-6 text-2xl">
                {t.noProductsFound}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-balance">
                {t.noProductsFoundDescription}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setColorFilter('all');
                  setSizeFilter('all');
                  setStyleFilter('all');
                  setWhereFilter('all');
                  setStockFilter('all');
                  setShapeFilter('all');
                }}
                variant="outline"
                className="glass-card border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 micro-interaction h-12 px-8 rounded-xl font-grotesk"
              >
                {t.resetFilters}
              </Button>
            </div>
          </motion.div>
        )}

        {/* SEO кластерный контент: catalog/materials/kashpo */}
        {!isLoading && (
          <section className="mt-16 glass-card rounded-3xl border border-primary/10 p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-grotesk text-gradient mb-4">{seoClusterContent.title}</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{seoClusterContent.text}</p>

            <h3 className="text-xl font-semibold mb-4">
              {language === 'uz' ? 'Ko\'p so\'raladigan savollar' : 'Часто задаваемые вопросы'}
            </h3>
            <div className="space-y-3 mb-8">
              {seoClusterContent.faq.map((item) => (
                <details key={item.q} className="glass-effect rounded-xl p-4 border border-primary/10">
                  <summary className="cursor-pointer font-medium">{item.q}</summary>
                  <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="/catalog" className="text-sm text-primary hover:underline">
                {language === 'uz' ? 'To\'liq katalog' : 'Полный каталог'}
              </a>
              <button
                onClick={() => setActiveCategory('materials')}
                className="text-sm text-primary hover:underline"
              >
                {language === 'uz' ? 'Rattan ip bo\'limi' : 'Раздел ротанговой нити'}
              </button>
              <button
                onClick={() => setActiveCategory('planters')}
                className="text-sm text-primary hover:underline"
              >
                {language === 'uz' ? 'Kashpo bo\'limi' : 'Раздел кашпо'}
              </button>
            </div>
          </section>
        )}
        {!isLoading && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(clusterFaqJsonLd) }}
          />
        )}

      </div>
    </div>
  );
}