import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Dialog, DialogContent } from './ui/dialog';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Search, Package, FileText, HelpCircle, Star, ArrowRight, Sparkles } from '../utils/lucide-stub';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'product' | 'blog' | 'faq' | 'review';
  image?: string;
  price?: number;
  category?: string;
  rating?: number;
  url?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string, id?: string) => void;
}

export function GlobalSearch({ isOpen, onClose, onNavigate }: GlobalSearchProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock данные для поиска
  const searchData: SearchResult[] = [
    // Товары
    {
      id: 'kashpo-5l-klassika-beige',
      title: 'Кашпо 5л с ручкой "Классика" бежевое',
      description: 'Плетёное кашпо с ручками для удобства переноски. Идеально для небольших растений.',
      type: 'product',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      price: 1200,
      category: 'Кашпо',
      rating: 4.8
    },
    {
      id: 'kashpo-10l-puhlyash-gray',
      title: 'Кашпо 10л "Пухляш" серое',
      description: 'Объёмное кашпо с мягким плетением для средних комнатных растений.',
      type: 'product',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      price: 1500,
      category: 'Кашпо',
      rating: 4.9
    },
    {
      id: 'rattan-thread-beige',
      title: 'Ротанговая нить бежевая 500м',
      description: 'Искусственная ротанговая нить высокого качества для плетения.',
      type: 'product',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      price: 800,
      category: 'Ротанг',
      rating: 4.7
    },
    
    // Статьи блога
    {
      id: 'artificial-rattan-guide',
      title: 'Искусственный ротанг: все, что нужно знать',
      description: 'Узнайте о преимуществах искусственного ротанга перед натуральным материалом.',
      type: 'blog',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'choose-perfect-kashpo',
      title: 'Как выбрать идеальное кашпо для вашего растения',
      description: 'Подробное руководство по выбору размера и стиля кашпо.',
      type: 'blog',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'care-for-wicker-products',
      title: 'Уход за плетёными изделиями: советы экспертов',
      description: 'Простые правила ухода, которые продлят жизнь вашим кашпо.',
      type: 'blog',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    
    // FAQ
    {
      id: 'faq-artificial-vs-natural',
      title: 'Чем искусственный ротанг лучше натурального?',
      description: 'Искусственный ротанг более долговечен, не боится влаги и температурных перепадов.',
      type: 'faq'
    },
    {
      id: 'faq-safety',
      title: 'Безопасен ли искусственный ротанг для растений?',
      description: 'Да, наш ротанг изготавливается из экологически безопасных материалов.',
      type: 'faq'
    },
    {
      id: 'faq-delivery',
      title: 'Какие у вас сроки доставки?',
      description: 'По Москве и МО доставляем в течение 1-2 дней. По России - 3-7 дней.',
      type: 'faq'
    },
    
    // Отзывы
    {
      id: 'review-maria',
      title: 'Отличные кашпо! Очень довольна качеством.',
      description: 'Мария К. о кашпо 10л "Пухляш"',
      type: 'review',
      rating: 5
    },
    {
      id: 'review-alex',
      title: 'Хорошая ротанговая нить, удобно плести.',
      description: 'Алексей П. о ротанговой нити',
      type: 'review',
      rating: 4
    }
  ];

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Имитация задержки API
    const timer = setTimeout(() => {
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase())
      );
      
      setResults(filtered);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (result: SearchResult) => {
    onNavigate?.(result.type, result.id);
    onClose();
    setSearch('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return Package;
      case 'blog': return FileText;
      case 'faq': return HelpCircle;
      case 'review': return Star;
      default: return Search;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'product': return 'Товар';
      case 'blog': return 'Блог';
      case 'faq': return 'FAQ';
      case 'review': return 'Отзыв';
      default: return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-primary/15 text-primary';
      case 'blog': return 'bg-blue-100 text-blue-700';
      case 'faq': return 'bg-green-100 text-green-700';
      case 'review': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          {/* Header */}
          <div className="relative border-b border-border bg-gradient-to-r from-card to-muted/30">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="relative">
                <Search className="w-5 h-5 text-primary" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-1 rounded-full bg-primary/20 blur-sm"
                />
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Поиск товаров, статей, FAQ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground"
              />
              {search && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Sparkles className="w-3 h-3" />
                  {results.length} результатов
                </motion.div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-3"
                  />
                  <p className="text-muted-foreground text-sm">Поиск...</p>
                </motion.div>
              ) : search && results.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-8 text-center"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium mb-2">Ничего не найдено</h3>
                  <p className="text-muted-foreground text-sm">
                    Попробуйте изменить поисковый запрос
                  </p>
                </motion.div>
              ) : search ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-2"
                >
                  {Object.entries(groupedResults).map(([type, items], groupIndex) => (
                    <div key={type} className="mb-2">
                      <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b border-gray-100/50 bg-gray-50/50">
                        {getTypeName(type)} ({items.length})
                      </div>
                      {items.map((result, index) => {
                        const Icon = getTypeIcon(result.type);
                        return (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ backgroundColor: 'rgba(251, 191, 36, 0.05)' }}
                            onClick={() => handleSelect(result)}
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 border-b border-gray-50 hover:border-primary/20"
                          >
                            {result.image ? (
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                <ImageWithFallback
                                  src={result.image}
                                  alt={result.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate">
                                  {result.title}
                                </h4>
                                <Badge className={`text-xs ${getTypeColor(result.type)} border-0`}>
                                  {getTypeName(result.type)}
                                </Badge>
                              </div>
                              
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {result.description}
                              </p>
                              
                              <div className="flex items-center gap-3 mt-1">
                                {result.price && (
                                  <span className="text-xs font-medium text-primary">
                                    ₽{result.price.toLocaleString()}
                                  </span>
                                )}
                                {result.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span className="text-xs text-muted-foreground">
                                      {result.rating}
                                    </span>
                                  </div>
                                )}
                                {result.category && (
                                  <span className="text-xs text-muted-foreground">
                                    {result.category}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <motion.div
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                              className="flex-shrink-0"
                            >
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 text-center"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/10">
                    <Search className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Начните поиск</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Найдите товары, статьи блога, ответы на вопросы и отзывы клиентов
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mt-6 max-w-xs mx-auto">
                    {[
                      { name: 'Кашпо', count: '12' },
                      { name: 'Ротанг', count: '4' },
                      { name: 'Статьи', count: '8' },
                      { name: 'FAQ', count: '15' }
                    ].map((item, index) => (
                      <motion.button
                        key={item.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onClick={() => setSearch(item.name.toLowerCase())}
                        className="text-xs bg-gray-50 hover:bg-primary/10 border border-gray-100 hover:border-primary/30 rounded-lg px-3 py-2 transition-colors duration-200"
                      >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-muted-foreground">{item.count}</div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {search && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-gray-100 px-4 py-3 bg-gray-50/50"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs">↑↓</kbd>
                  для навигации
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs">Enter</kbd>
                  для выбора
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs">Esc</kbd>
                  закрыть
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}