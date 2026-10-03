import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer@9.13.1';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShoppingCart, ChevronRight, Sparkles, Star } from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';
import { useMemo, useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { API_BASE_URL } from '../utils/env';

// Импорт изображений кашпо 5л с ручкой
import kashpo5lBeigeWithHandle from '@/assets/aaa3f6c434f81fb8787b230c4e80ff40a3ff1805.webp';
import kashpo5lGrayWithHandle from '@/assets/734c7fe27be9c768b54eb373aeac20283920d105.webp';
import kashpo5lWhiteBirchWithHandle from '@/assets/5701c82eee99edfcfac44cfab9b4fa6a6b5cdb96.webp';

// Импорт изображений для Пухляш
import kashpoBeigePuhlyash from '@/assets/6d9496c1540d1c8b9f1aaa416fd88b8490415176.webp';
import kashpoYellowPuhlyash from '@/assets/9f329516c8d5112fbb9787ea70fdd093473d5a0f.webp';
import kashpoButteryPuhlyash from '@/assets/8c0b031033de8bbdf5913fe421c9826a043b0c48.webp';
import kashpoWhiteBirchPuhlyash from '@/assets/17b6a4aade43c236d9217a95e06e703ce84bbf1b.webp';
import kashpoBrownWhitePuhlyash from '@/assets/92dff26663eec7d00cb2053e36c95d0a03961737.webp';
import kashpoTricolorPuhlyash from '@/assets/ee3cad7c86c64ba4f0451d2507d30fd34b6ad147.webp';
import kashpoBrownClassicPuhlyash from '@/assets/dec339423c65660420decd542cca4f740c2299fb.webp'; // ✅ Коричневое кашпо для Пухляш

// Импорт изображений для Классика
import kashpoButteryClassic from '@/assets/6a9947a54669e33d505d5a2832d5e0f98e8f9366.webp';
import kashpoYellowClassic from '@/assets/21ce3b8cddac4fef8eb09323347c87f108aa2db9.webp';
import kashpoGrayClassic from '@/assets/0e131a3e8829dc4da84f9e7575911fe10b4833d2.webp';
import kashpoWhiteBirchClassic from '@/assets/3b4b7222cc87dd7311b78e54e217ce632dcf0d39.webp';

// Импорт изображений ротанговой нити
import rattanWhiteBirchSphere from '@/assets/eb870a79ea96a752b4661fca27c38a9e37139df9.webp';
import rattanPearlSphereAndCrescent from '@/assets/efdbb313e67c9a0f8732fe579446757fb7a204c3.webp';
import rattanSandSphereAndCrescent from '@/assets/4935765782b02872c39cba831afac4bbbce963a0.webp';
import rattanGoldSphereAndCrescent from '@/assets/aa6eddd7d37a9c9221523b2cbc73643ebacbcd2c.webp';

interface ColorVariant {
  id: string;
  name: string;
  images: string[];
  color: string;
  gradient?: string;
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
  popular?: boolean;
  dimensions?: {
    height: number; // в мм
    diameter: number; // в мм
  };
}

interface MiniCatalogProps {
  onAddToCart: (product: Product & { selectedVariant?: ColorVariant; selectedImageIndex?: number }) => void;
  onViewFullCatalog: () => void;
}

export function MiniCatalog({ onAddToCart, onViewFullCatalog }: MiniCatalogProps) {
  const { t, language } = useLanguage();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: string}>({});
  const [cmsProducts, setCmsProducts] = useState<Product[]>([]);

  // Цветовые варианты мемоизированы для стабильности ссылок (ОБНОВЛЕНО: Бежевый → Жёлтый для 5л)
  const colorVariants5lWithHandle: ColorVariant[] = useMemo(() => [
    {
      id: 'yellow',
      name: t.yellow,
      images: [
        kashpo5lBeigeWithHandle,
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#FFD700'
    },
    {
      id: 'gray',
      name: t.gray,
      images: [
        kashpo5lGrayWithHandle,
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1493925410384-84f842e616fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#A9A9A9'
    },
    {
      id: 'white-birch',
      name: t.whiteBirch,
      images: [
        kashpo5lWhiteBirchWithHandle,
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#F5F5F0'
    }
  ], [t.yellow, t.gray, t.whiteBirch]);

  // Цветовые варианты для кашпо Классика (10л и 16л) с отдельным серым изображением
  const colorVariantsClassic: ColorVariant[] = useMemo(() => [
    {
      id: 'buttery',
      name: t.buttery,
      images: [
        kashpoButteryClassic, // ✅ НОВОЕ специальное кремовое изображение для Классика
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#FFFDD0'
    },
    {
      id: 'yellow',
      name: t.yellow,
      images: [
        kashpoYellowClassic, // ✅ НОВОЕ специальное изображение для Классика
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#FFD700'
    },
    {
      id: 'gray',
      name: t.gray,
      images: [
        kashpoGrayClassic,
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1493925410384-84f842e616fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#A9A9A9'
    },
    {
      id: 'white-birch',
      name: t.whiteBirch,
      images: [
        kashpoWhiteBirchClassic, // ✅ Специальное изображение Белая берёзка с логотипом BTT для Классика
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#F5F5F0'
    }
    // ❌ УДАЛЁН: Коричневый цвет больше не доступен для Классика
  ], [t.buttery, t.yellow, t.gray, t.whiteBirch]);

  // Цветовые варианты для кашпо Пухляш (10л и 16л)
  const colorVariantsPuhlyash: ColorVariant[] = useMemo(() => [
    {
      id: 'beige',
      name: t.beige,
      images: [
        kashpoBeigePuhlyash,
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#D2B48C'
    },
    {
      id: 'yellow',
      name: t.yellow,
      images: [
        kashpoYellowPuhlyash, // ✅ Специальное жёлтое изображение для Пухляш
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#FFD700'
    },
    {
      id: 'buttery',
      name: t.buttery,
      images: [
        kashpoButteryPuhlyash, // ✅ НОВОЕ специальное кремовое изображение для Пухляш
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1493925410384-84f842e616fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#FFFDD0'
    },
    {
      id: 'white-birch',
      name: t.whiteBirch,
      images: [
        kashpoWhiteBirchPuhlyash, // ✅ Специальное изображение Белая берёзка для Пухляш
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#F5F5F0'
    },
    {
      id: 'brown',
      name: t.brown,
      images: [
        kashpoBrownClassicPuhlyash, // ✅ ОБНОВЛЕНО: специальное коричневое изображение для Пухляш
        kashpoBrownClassicPuhlyash,
        kashpoBrownClassicPuhlyash
      ],
      color: '#8B4513'
    },
    {
      id: 'brown-white',
      name: t.brownWhite,
      images: [
        kashpoBrownWhitePuhlyash, // ✅ НОВОЕ специальное коричнево-белое изображение для Пухляш
        'https://images.unsplash.com/photo-1627202626612-1e304a201b32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMHdoaXRlJTIwY2l2aWwJTIwYmFza2V0fGVufDF8fHx8MTc2MDI3Nzk0MHww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      color: '#A0826D' // Коричнево-белый миксовый цвет
    },
    {
      id: 'tricolor',
      name: t.tricolor,
      images: [
        kashpoTricolorPuhlyash, // ✅ НОВОЕ специальное трёхцветное изображение для Пухляш
        kashpoTricolorPuhlyash,
        kashpoTricolorPuhlyash
      ],
      color: '#C4A57B', // Запасной цвет
      gradient: 'linear-gradient(120deg, #FFFFFF 0%, #FFFFFF 33%, #8B4513 33%, #8B4513 66%, #BC9973 66%, #BC9973 100%)' // ⚪|🟤|🟫 РЕЗКИЙ ГРАДИЕНТ - 3 ЧЁТКИЕ ПОЛОСЫ
    }
  ], [t.beige, t.yellow, t.buttery, t.whiteBirch, t.brown, t.brownWhite, t.tricolor]);

  // Цветовые варианты для ротанговой нити
  const colorVariantsRattan: ColorVariant[] = useMemo(() => [
    {
      id: 'white-birch',
      name: t.whiteBirch,
      images: [
        rattanWhiteBirchSphere,
        rattanWhiteBirchSphere,
        rattanWhiteBirchSphere
      ],
      color: '#F5F5F0'
    },
    {
      id: 'pearl',
      name: t.pearl,
      images: [
        rattanPearlSphereAndCrescent,
        rattanPearlSphereAndCrescent,
        rattanPearlSphereAndCrescent
      ],
      color: '#FFF8E7'
    },
    {
      id: 'sand',
      name: t.sand,
      images: [
        rattanSandSphereAndCrescent,
        rattanSandSphereAndCrescent,
        rattanSandSphereAndCrescent
      ],
      color: '#C2B280'
    },
    {
      id: 'gold',
      name: t.gold,
      images: [
        rattanGoldSphereAndCrescent,
        rattanGoldSphereAndCrescent,
        rattanGoldSphereAndCrescent
      ],
      color: '#FFD700'
    }
  ], [t.whiteBirch, t.pearl, t.sand, t.gold]);

  // Популярные товары для мини-каталога
  const popularProducts: Product[] = useMemo(() => [
    {
      id: '1',
      name: t.rattanThread,
      description: t.rattanThreadDesc,
      image: colorVariantsRattan[0].images[0],
      features: [t.differentColors, t.differentLengths, t.durableMaterials],
      variants: colorVariantsRattan,
      category: 'materials',
      popular: true
    },
    {
      id: '2',
      name: t.kashpo5l,
      description: t.kashpo5lDesc,
      image: colorVariants5lWithHandle[0].images[0],
      features: [t.volume5l, t.convenientHandle, t.naturalDesign, t.differentColors],
      variants: colorVariants5lWithHandle,
      category: 'kashpo',
      size: '5л',
      style: 'с ручкой',
      popular: true,
      dimensions: {
        height: 255,
        diameter: 290
      }
    },
    {
      id: '3',
      name: t.kashpo10lClassic,
      description: t.kashpo10lClassicDesc,
      image: colorVariantsClassic[0].images[0],
      features: [t.volume10l, t.classicDesign, t.traditionalWeaving],
      variants: colorVariantsClassic,
      category: 'kashpo',
      size: '10л',
      style: 'Классика',
      popular: true,
      dimensions: {
        height: 240,
        diameter: 310
      }
    },
    {
      id: '4',
      name: t.kashpo16lPuffy,
      description: t.kashpo16lPuffyDesc,
      image: colorVariantsPuhlyash[0].images[0],
      features: [t.volume16l, t.softRoundedForms, t.forBigPlants],
      variants: colorVariantsPuhlyash,
      category: 'kashpo',
      size: '16л',
      style: 'Пухляш',
      popular: true,
      dimensions: {
        height: 280,
        diameter: 360
      }
    }
  ], [
    t.rattanThread, t.rattanThreadDesc, t.differentColors, t.differentLengths, t.durableMaterials,
    t.kashpo5l, t.kashpo5lDesc, t.volume5l, t.convenientHandle, t.naturalDesign, t.differentColors,
    t.kashpo10lClassic, t.kashpo10lClassicDesc, t.volume10l, t.classicDesign, t.traditionalWeaving,
    t.kashpo16lPuffy, t.kashpo16lPuffyDesc, t.volume16l, t.softRoundedForms, t.forBigPlants,
    colorVariants5lWithHandle, colorVariantsClassic, colorVariantsPuhlyash, colorVariantsRattan
  ]);
  const displayProducts = useMemo(
    () => (cmsProducts.length ? [...cmsProducts, ...popularProducts].slice(0, 4) : popularProducts),
    [cmsProducts, popularProducts],
  );

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
          category: p.category || 'kashpo',
          variants: [],
          features: [],
        }));
        setCmsProducts(mapped);
      } catch {
        // fallback to static products
      }
    };
    loadCmsProducts();
    return () => {
      mounted = false;
    };
  }, [language]);

  // Инициализация выбранных вариантов
  useEffect(() => {
    const initialVariants: {[key: string]: string} = {};
    displayProducts.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        initialVariants[product.id] = product.variants[0].id;
        
      }
    });
    setSelectedVariants(initialVariants);
  }, [displayProducts]);
  
  const handleVariantChange = (productId: string, variantId: string) => {
    setSelectedVariants(prev => {
      return {
        ...prev,
        [productId]: variantId
      };
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
      
      return currentImage;
    }
    return product.image;
  };

  return (
    <section id="catalog" className="section-y relative scroll-mt-24 overflow-hidden border-b border-border bg-muted/25">
      <div className="section-inset-wide relative z-10" ref={ref}>
        <header className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
          <p className="section-eyebrow">
            {language === 'uz' ? 'Tanlangan' : language === 'en' ? 'Featured' : 'Подборка'}
          </p>
          <motion.h2
            className="section-head text-balance"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.5 }}
          >
            {t.popularProducts}
          </motion.h2>
          <motion.p
            className="section-desc mx-auto text-balance"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            {language === 'uz'
              ? 'Toshkentda ishlab chiqarilgan sun\'iy rattandan eng mashhur mahsulotlarimiz'
              : 'Наши самые востребованные плетёные изделия из искусственного ротанга, произведённые в Ташкенте'}
          </motion.p>
          <div className="section-divider" aria-hidden />
        </header>

        {/* Товары */}
        <div className="mx-auto mb-14 grid max-w-7xl gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-8">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="card-elevated h-full overflow-hidden transition-all duration-300">
                <CardHeader className="p-0 m-0 relative overflow-hidden aspect-square">
                  <ImageWithFallback
                    key={`${product.id}-${selectedVariants[product.id] || 'default'}`}
                    src={getCurrentImage(product)}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-600 hover:scale-105"
                  />
                  
                  {/* Бейдж "Популярное" */}
                  {product.popular && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="border-0 bg-primary/15 font-medium text-primary hover:bg-primary/20">
 ⭐ {t.popular}
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="p-4 md:p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <CardTitle className="group-hover:text-primary transition-colors text-lg leading-tight">
                      {product.name}
                    </CardTitle>
                    <div className="flex gap-1 ml-2">
                      {product.size && (
                        <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                          {product.size}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed text-sm flex-1">
                    {product.description}
                  </p>

                  {/* Размеры кашпо */}
                  {product.dimensions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                      className="mb-4 p-3 glass-card rounded-xl border border-primary/10"
                    >
                      <div className="flex items-center justify-around text-xs">
                        <div className="text-center">
                          <div className="text-primary font-medium mb-1">
                            {language === 'uz' ? 'Balandlik' : 'Высота'}
                          </div>
                          <div className="text-foreground font-grotesk">
                            {product.dimensions.height} {language === 'uz' ? 'mm' : 'мм'}
                          </div>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="text-center">
                          <div className="text-primary font-medium mb-1">
                            {language === 'uz' ? 'Diametr' : 'Диаметр'}
                          </div>
                          <div className="text-foreground font-grotesk">
                            {product.dimensions.diameter} {language === 'uz' ? 'mm' : 'мм'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Селектор цвета для кашпо с вариантами */}
                  {product.variants && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                      className="mb-4"
                    >
                      <p className="text-sm font-medium mb-2 text-primary">{t.color}:</p>
                      <div className="flex gap-2 flex-wrap">
                        {product.variants.slice(0, 3).map((variant) => (
                          <motion.button
                            key={variant.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleVariantChange(product.id, variant.id)}
                            aria-label={`${t.color}: ${variant.name}`}
                            title={variant.name}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all duration-300 ${
                              selectedVariants[product.id] === variant.id
                                ? 'border-primary bg-primary/15 text-primary shadow-none ring-1 ring-primary/30'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                            }`}
                          >
                            <div
                              className="w-4 h-4 rounded-full border-2 border-foreground/20 shadow-sm"
                              style={{ background: variant.gradient || variant.color }}
                            />
                            <span className="hidden sm:inline">{variant.name}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {product.features && (
                    <motion.ul className="text-sm text-muted-foreground space-y-1">
                      {product.features.slice(0, 2).map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ duration: 0.4, delay: (index * 0.1) + (featureIndex * 0.05) }}
                          className="flex items-center group-hover:text-primary transition-colors"
                        >
                          <Sparkles className="mr-2 h-3 w-3 flex-shrink-0 text-primary" />
                          {feature}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </CardContent>
                
                <CardFooter className="p-4 md:p-5 pt-0 flex flex-col gap-3">
                  {/* Цена товара */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
                    className="w-full text-center"
                  >
                    {(() => {
                      const isRattan = product.category === 'materials';
                      const is5l = product.size === '5л';
                      const is10l = product.size === '10л';
                      const is16l = product.size === '16л';
                      
                      let priceText = '';
                      
                      if (isRattan) {
                        priceText = language === 'uz'
                          ? `36 000 so'm/kg (min. 5kg = 180 000 so'm)`
                          : `36 000 сум/кг (мин. 5кг = 180 000 сум)`;
                      } else if (is5l) {
                        priceText = language === 'uz'
                          ? '120 000 so\'m'
                          : '120 000 сум';
                      } else if (is10l) {
                        priceText = language === 'uz'
                          ? '187 000 so\'m'
                          : '187 000 сум';
                      } else if (is16l) {
                        priceText = language === 'uz'
                          ? '245 000 so\'m'
                          : '245 000 сум';
                      }
                      
                      return priceText ? (
                        <div className="text-lg font-bold text-primary font-grotesk">
                          {priceText}
                        </div>
                      ) : null;
                    })()}
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Button 
                      className="w-full h-11 text-sm font-medium rounded-xl micro-interaction group bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      <span>{t.order}</span>
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Кнопка просмотра всего каталога */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button
            onClick={onViewFullCatalog}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl transition-all duration-200 group font-bold shadow-md"
          >
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
{t.viewFullCatalog}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </Button>
          
          <p className="text-muted-foreground text-sm mt-4">
{t.moreProducts}
          </p>
        </motion.div>
      </div>
    </section>
  );
}