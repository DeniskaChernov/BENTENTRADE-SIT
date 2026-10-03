import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer@9.13.1';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Check, Star, ChevronLeft, ChevronRight, Settings } from '../utils/lucide-stub';
import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { ProductFilter } from './ProductFilter';
import { useProducts, type Product as APIProduct, type ColorVariant } from '../utils/useProducts';
import { AdminPanel } from './AdminPanel';
import { staticProducts, colorVariants5lWithHandle, colorVariantsOther } from '../utils/staticProducts';

// Интерфейсы
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
    height: number;
    diameter: number;
  };
}

interface CatalogProps {
  onAddToCart: (product: Product & { selectedVariant?: ColorVariant; selectedImageIndex?: number }) => void;
}

export function Catalog({ onAddToCart }: CatalogProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Загрузка продуктов из API
  const { products: apiProducts, loading, error } = useProducts();
  
  // Используем данные из API или fallback на статические
  const products = apiProducts.length > 0 ? apiProducts : staticProducts;
  
  // Состояние админ-панели
  const [showAdmin, setShowAdmin] = useState(false);

  // Состояния для фильтрации и управления
  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: string}>({});
  const [selectedImages, setSelectedImages] = useState<{[key: string]: number}>({});
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  // Инициализация выбранных вариантов
  useEffect(() => {
    const initialVariants: {[key: string]: string} = {};
    const initialImages: {[key: string]: number} = {};
    products.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        initialVariants[product.id] = product.variants[0].id;
        initialImages[product.id] = 0;
      }
    });
    setSelectedVariants(initialVariants);
    setSelectedImages(initialImages);
  }, [products]);

  // Фильтрация товаров
  const filteredProducts = products.filter(product => {
    const matchesColor = colorFilter === 'all' || 
                        (product.variants && product.variants.some(v => v.id === colorFilter));
    
    const matchesSize = sizeFilter === 'all' || product.size === sizeFilter;
    
    return matchesColor && matchesSize;
  });

  // Сортировка товаров
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'size':
        if (!a.size || !b.size) return 0;
        const sizeA = parseInt(a.size);
        const sizeB = parseInt(b.size);
        return sizeA - sizeB;
      case 'size-desc':
        if (!a.size || !b.size) return 0;
        const sizeDescA = parseInt(a.size);
        const sizeDescB = parseInt(b.size);
        return sizeDescB - sizeDescA;
      default:
        return 0;
    }
  });

  const handleVariantChange = (productId: string, variantId: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variantId
    }));
    setSelectedImages(prev => ({
      ...prev,
      [productId]: 0
    }));
  };

  const handleImageChange = (productId: string, imageIndex: number) => {
    setSelectedImages(prev => ({
      ...prev,
      [productId]: imageIndex
    }));
  };

  const handleAddToCart = (product: Product) => {
    const selectedVariant = product.variants?.find(v => v.id === selectedVariants[product.id]);
    const selectedImageIndex = selectedImages[product.id] || 0;
    
    onAddToCart({
      ...product,
      selectedVariant,
      selectedImageIndex,
      image: selectedVariant?.images[selectedImageIndex] || product.image
    });
  };

  const getCurrentImage = (product: Product) => {
    if (product.variants && selectedVariants[product.id]) {
      const selectedVariant = product.variants.find(v => v.id === selectedVariants[product.id]);
      const imageIndex = selectedImages[product.id] || 0;
      return selectedVariant?.images[imageIndex] || product.image;
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
  const availableColors = Array.from(new Set(
    products.flatMap(p => p.variants?.map(v => v.id) || [])
  ));

  const availableSizes = Array.from(new Set(
    products.map(p => p.size).filter(Boolean)
  ));

  // Все доступные цветовые варианты (объединяем все варианты)
  const allColorVariants = [...colorVariants5lWithHandle, ...colorVariantsOther].filter(
    (variant, index, self) => 
      index === self.findIndex((v) => v.id === variant.id)
  );

  return (
    <section id="catalog" className="relative overflow-hidden bg-background py-20">
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-primary/8 to-cyan-500/5 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-gradient-to-l from-violet-500/8 to-transparent blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-emerald-800 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6 }}
          >
            Каталог товаров
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={inView ? { opacity: 1, width: '100px' } : { opacity: 0, width: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-primary to-emerald-700 mx-auto rounded-full"
          />
        </div>

        {/* Новый компонент фильтра */}
        <ProductFilter
          colorFilter={colorFilter}
          onColorChange={setColorFilter}
          availableColors={availableColors}
          colorVariants={allColorVariants}
          sizeFilter={sizeFilter}
          onSizeChange={setSizeFilter}
          availableSizes={availableSizes}
          sortBy={sortBy}
          onSortChange={setSortBy}
          inView={inView}
        />
        
        {/* Товары */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
          {sortedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="overflow-hidden border-border bg-card transition-all duration-500 hover:shadow-[0_0_0_1px_rgba(212,255,74,0.12)]">
                <CardHeader className="p-0 relative overflow-hidden">
                  <div className="aspect-square overflow-hidden relative">
                    {/* Галерея изображений */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                      className="w-full h-full relative"
                    >
                      <ImageWithFallback
                        src={getCurrentImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Навигация по изображениям */}
                      {product.variants && getImageGallery(product).length > 1 && (
                        <>
                          <button
                            onClick={() => handleImageChange(
                              product.id, 
                              selectedImages[product.id] > 0 
                                ? selectedImages[product.id] - 1 
                                : getImageGallery(product).length - 1
                            )}
                            aria-label="Предыдущее фото"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronLeft className="w-4 h-4 text-primary" />
                          </button>
                          
                          <button
                            onClick={() => handleImageChange(
                              product.id, 
                              selectedImages[product.id] < getImageGallery(product).length - 1 
                                ? selectedImages[product.id] + 1 
                                : 0
                            )}
                            aria-label="Следующее фото"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronRight className="w-4 h-4 text-primary" />
                          </button>

                          {/* Индикаторы изображений */}
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                            {getImageGallery(product).map((_, imgIndex) => (
                              <button
                                key={imgIndex}
                                onClick={() => handleImageChange(product.id, imgIndex)}
                                aria-label={`Перейти к фото ${imgIndex + 1}`}
                                className={`h-2 w-2 rounded-full transition-all ${
                                  selectedImages[product.id] === imgIndex 
                                    ? 'bg-primary' 
                                    : 'bg-white/40 hover:bg-white/70'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                    <div className="flex gap-1 ml-2">
                      {product.size && (
                        <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                          {product.size}
                        </Badge>
                      )}
                      {product.style && (
                        <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                          {product.style}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Размеры кашпо */}
                  {product.dimensions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                      className="mb-4 rounded-xl border border-primary/25 bg-primary/10 p-3"
                    >
                      <div className="flex items-center justify-around text-xs">
                        <div className="text-center">
                          <div className="text-primary font-medium mb-1">
                            Высота
                          </div>
                          <div className="text-foreground font-semibold">
                            {product.dimensions.height} мм
                          </div>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="text-center">
                          <div className="text-primary font-medium mb-1">
                            Диаметр
                          </div>
                          <div className="text-foreground font-semibold">
                            {product.dimensions.diameter} мм
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
                      <p className="text-sm font-medium mb-3 text-primary">Выберите цвет:</p>
                      <div className="flex gap-2 flex-wrap">
                        {product.variants.map((variant, variantIndex) => (
                          <motion.button
                            key={variant.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 + variantIndex * 0.05 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleVariantChange(product.id, variant.id)}
                            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-all duration-300 ${
                              selectedVariants[product.id] === variant.id
                                ? 'border-primary bg-primary/15 text-primary shadow-none ring-1 ring-primary/30'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/50'
                            }`}
                          >
                            <div
                              className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                              style={{ backgroundColor: variant.color }}
                            />
                            {variant.name}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {product.features && (
                    <motion.ul className="text-sm text-muted-foreground space-y-2">
                      {product.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ duration: 0.4, delay: (index * 0.1) + (featureIndex * 0.05) }}
                          className="flex items-center group-hover:text-primary transition-colors"
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                          </motion.div>
                          {feature}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </CardContent>
                
                <CardFooter className="p-6 pt-0">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground transition-all duration-300 hover:from-primary/90 hover:to-emerald-600/90 hover:shadow-lg"
                      onClick={() => handleAddToCart(product)}
                    >
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        Заказать
                      </motion.span>
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Сообщение об отсутствии результатов */}
        {sortedProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 mt-12"
          >
            <p className="text-muted-foreground text-lg">
              По вашему запросу товары не найдены
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setColorFilter('all');
                setSizeFilter('all');
              }}
              className="mt-4 border-primary/30 hover:bg-primary/10 text-primary"
            >
              Сбросить фильтры
            </Button>
          </motion.div>
        )}

        {/* Скрытая кнопка админки (Ctrl/Cmd + Shift + A) */}
        {showAdmin && (
          <AdminPanel 
            onClose={() => setShowAdmin(false)}
            initialProducts={staticProducts}
          />
        )}
        
        {/* Кнопка админки (появляется при hover в правом нижнем углу) */}
        <motion.button
          onClick={() => setShowAdmin(true)}
          className="fixed bottom-8 right-8 p-3 bg-primary text-primary-foreground rounded-full shadow-lg opacity-20 hover:opacity-100 transition-opacity z-40"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Админ-панель (Ctrl+Shift+A)"
        >
          <Settings className="w-6 h-6" />
        </motion.button>
      </div>
    </section>
  );
}