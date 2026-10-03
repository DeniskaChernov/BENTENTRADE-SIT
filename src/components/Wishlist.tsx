import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';
import { Heart, ShoppingCart, X, Package, Sparkles, ArrowRight } from '../utils/lucide-stub';
import { toast } from '../utils/sonner-stub';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
  discount?: number;
}

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: WishlistItem) => void;
}

export function Wishlist({ isOpen, onClose, onAddToCart }: WishlistProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock данные для wishlist
  const mockWishlistItems: WishlistItem[] = [
    {
      id: 'kashpo-5l-klassika-beige',
      name: 'Кашпо 5л с ручкой "Классика" бежевое',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Плетёное кашпо с ручками для удобства переноски',
      category: 'Кашпо',
      inStock: true,
      discount: 15
    },
    {
      id: 'rattan-thread-gray',
      name: 'Ротанговая нить серая 500м',
      price: 800,
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Искусственная ротанговая нить высокого качества',
      category: 'Ротанг',
      inStock: true
    },
    {
      id: 'kashpo-16l-puhlyash-brown',
      name: 'Кашпо 16л "Пухляш" коричневое',
      price: 2200,
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Большое объёмное кашпо для крупных растений',
      category: 'Кашпо',
      inStock: false
    }
  ];

  useEffect(() => {
    // Имитация загрузки данных
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setWishlistItems(mockWishlistItems);
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Товар удален из избранного');
  };

  const addToCart = (item: WishlistItem) => {
    if (!item.inStock) {
      toast.error('Товар временно отсутствует');
      return;
    }
    
    onAddToCart?.(item);
    toast.success('Товар добавлен в корзину');
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    toast.success('Избранное очищено');
  };

  const totalItems = wishlistItems.length;
  const inStockItems = wishlistItems.filter(item => item.inStock).length;
  const totalValue = wishlistItems.reduce((sum, item) => {
    const price = item.discount ? item.price * (1 - item.discount / 100) : item.price;
    return sum + price;
  }, 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="border-b border-primary/20 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-5 h-5 text-red-500 fill-current" />
              </motion.div>
              Избранное
              {totalItems > 0 && (
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  {totalItems}
                </Badge>
              )}
            </SheetTitle>
            
            {totalItems > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearWishlist}
                className="text-muted-foreground hover:text-red-600"
              >
                Очистить все
              </Button>
            )}
          </div>
          
          <SheetDescription className="sr-only">
            Список избранных товаров. Здесь вы можете просматривать, добавлять в корзину и удалять понравившиеся товары.
          </SheetDescription>
          
          {totalItems > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-4 pt-4"
            >
              <div className="text-center">
                <div className="text-lg font-semibold">{totalItems}</div>
                <div className="text-xs text-muted-foreground">товаров</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{inStockItems}</div>
                <div className="text-xs text-muted-foreground">в наличии</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-primary">₽{totalValue.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">сумма</div>
              </div>
            </motion.div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-3"
                  />
                  <p className="text-muted-foreground text-sm">Загрузка избранного...</p>
                </div>
              </motion.div>
            ) : totalItems === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center px-6">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Heart className="w-12 h-12 text-red-300" />
                  </motion.div>
                  <h3 className="font-semibold mb-3">Избранное пусто</h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    Добавляйте понравившиеся товары в избранное, нажимая на ❤️ в каталоге
                  </p>
                  <Button 
                    onClick={onClose}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Перейти к покупкам
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto py-4 space-y-4"
              >
                {wishlistItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    layout
                  >
                    <Card className="overflow-hidden border-primary/20 hover:shadow-md transition-shadow duration-300">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {/* Изображение */}
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                              <ImageWithFallback
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Скидка */}
                            {item.discount && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full"
                              >
                                -{item.discount}%
                              </motion.div>
                            )}
                            
                            {/* Статус наличия */}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              item.inStock ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                          </div>

                          {/* Информация */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm line-clamp-2 mb-1">
                                  {item.name}
                                </h4>
                                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                  {item.category}
                                </Badge>
                              </div>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeFromWishlist(item.id)}
                                className="flex-shrink-0 p-1 text-muted-foreground hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                              {item.description}
                            </p>

                            {/* Цена и кнопки */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {item.discount ? (
                                  <>
                                    <span className="font-semibold text-sm text-primary">
                                      ₽{Math.round(item.price * (1 - item.discount / 100)).toLocaleString()}
                                    </span>
                                    <span className="text-xs text-muted-foreground line-through">
                                      ₽{item.price.toLocaleString()}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-semibold text-sm">
                                    ₽{item.price.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                  disabled={!item.inStock}
                                  className={`h-8 px-3 text-xs ${
                                    item.inStock 
                                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                                      : 'bg-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  {item.inStock ? (
                                    <>
                                      <ShoppingCart className="w-3 h-3 mr-1" />
                                      В корзину
                                    </>
                                  ) : (
                                    'Нет в наличии'
                                  )}
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* Кнопки действий */}
                {inStockItems > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-primary/20 pt-4 mt-6"
                  >
                    <div className="space-y-3">
                      <Button
                        onClick={() => {
                          wishlistItems
                            .filter(item => item.inStock)
                            .forEach(item => addToCart(item));
                        }}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Добавить все в корзину ({inStockItems})
                      </Button>
                      
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Sparkles className="w-3 h-3" />
                        Экономия от скидок: ₽{
                          wishlistItems
                            .filter(item => item.discount)
                            .reduce((sum, item) => sum + (item.price * (item.discount! / 100)), 0)
                            .toLocaleString()
                        }
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Компонент кнопки избранного для добавления в товары
export function WishlistButton({ 
  productId, 
  className = "",
  size = "default" 
}: { 
  productId: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleWishlist = async () => {
    setIsLoading(true);
    
    // Имитация API запроса
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setIsInWishlist(!isInWishlist);
    setIsLoading(false);
    
    if (!isInWishlist) {
      toast.success('Добавлено в избранное ❤️');
    } else {
      toast.success('Удалено из избранного');
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8 p-1.5",
    default: "w-10 h-10 p-2",
    lg: "w-12 h-12 p-2.5"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    default: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleWishlist}
        disabled={isLoading}
        className={`
          relative rounded-full transition-all duration-300 border-0 outline-none
          ${isInWishlist 
            ? 'bg-red-100 text-red-600 shadow-md' 
            : 'bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 shadow-sm hover:shadow-md'
          }
          ${sizeClasses[size]}
          ${className}
        `}
        title={isInWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`${iconSizes[size]} animate-spin border-2 border-current border-t-transparent rounded-full`}
            />
          ) : (
            <motion.div
              key={isInWishlist ? "filled" : "empty"}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Heart 
                className={`${iconSizes[size]} ${isInWishlist ? 'fill-current' : ''}`} 
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Пульсирующий эффект при добавлении */}
        {isInWishlist && (
          <motion.div
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 rounded-full bg-red-500"
          />
        )}
      </motion.button>
    </div>
  );
}