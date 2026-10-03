import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, ShoppingCart, Globe, X, Sparkles, User } from '../utils/lucide-stub';
import { pickLang, useLanguage } from '../utils/language-context';
import { LanguageToggle } from './LanguageToggle';
import logoImage from '@/assets/fae59665fd1772cdd61f6a4d1c95ed996e1502f5.webp';

interface HeaderProps {
  cartItems: number;
  /** Инкремент при добавлении в корзину — микро-анимация бейджа */
  cartBump?: number;
  onCartClick: () => void;
  currentPage: 'home' | 'catalog' | 'profile' | 'admin' | 'legal' | 'blog' | 'wholesale' | 'export';
  onNavigate: (page: 'home' | 'catalog' | 'profile' | 'admin' | 'blog' | 'wholesale' | 'export') => void;
  onLogoSecretAccess?: (e: React.MouseEvent | React.TouchEvent) => void;
  onLogoLongPress?: () => void;
  isAdminMode?: boolean;
}

export const Header = memo(function Header({ 
  cartItems,
  cartBump = 0,
  onCartClick, 
  currentPage, 
  onNavigate, 
  onLogoSecretAccess,
  onLogoLongPress,
  isAdminMode = false 
}: HeaderProps) {
  const { t, language } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    // Вызываем сразу при монтировании
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (page: 'home' | 'catalog' | 'profile' | 'admin' | 'blog' | 'wholesale' | 'export') => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    if (currentPage !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleLongPressStart = () => {
    setIsLongPressing(true);
    longPressTimer.current = setTimeout(() => {
      if (onLogoLongPress) {
        onLogoLongPress();
        setIsLongPressing(false);
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
      }
    }, 3000);
  };

  const handleLongPressEnd = () => {
    setIsLongPressing(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const blogNavLabel = pickLang(language, {
    uz: 'Blog va yangiliklar',
    ru: 'Блог и новости',
    en: 'Blog & news',
  });

  const primaryMenuItems: Array<
    | { name: string; id: string; navPage?: undefined }
    | { name: string; id: string; navPage: 'catalog' | 'blog' | 'wholesale' | 'export' }
  > = [
    { name: t.about, id: 'about' },
    { name: t.catalog, id: 'catalog', navPage: 'catalog' },
    { name: t.navWholesale, id: 'wholesale', navPage: 'wholesale' },
    { name: t.navExport, id: 'export', navPage: 'export' },
    { name: t.projectGallery, id: 'gallery' },
    { name: blogNavLabel, id: 'blog-list', navPage: 'blog' },
    { name: t.contacts, id: 'contacts' },
  ];

  const secondaryMenuItems = [
    { name: t.whyUsTitle, id: 'why-us' },
    { name: t.projectGallery, id: 'gallery' },
    {
      name: pickLang(language, {
        uz: 'Blog (bosh sahifa)',
        ru: 'Блог на главной',
        en: 'Blog on home',
      }),
      id: 'blog',
    },
    { name: 'FAQ', id: 'faq' },
    {
      name: pickLang(language, { uz: 'Sharhlar', ru: 'Отзывы', en: 'Reviews' }),
      id: 'reviews',
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled
          ? 'border-b border-border/90 bg-background/92 shadow-sm backdrop-blur-xl'
          : 'border-b border-transparent bg-background/65 backdrop-blur-md'
      } ${isAdminMode ? 'border-b-red-400/40' : ''}`}
    >
      <div className="container mx-auto px-4 py-3.5 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.button
            onClick={(e) => {
              if (!e.shiftKey) {
                handleNavigation('home');
              }
              if (onLogoSecretAccess) {
                onLogoSecretAccess(e);
              }
            }}
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            className={`flex items-center gap-3 relative ${
              isAdminMode ? 'ring-2 ring-red-400/50 rounded-xl px-3 py-2' : ''
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            title={isAdminMode ? "🔐 Админ-режим активен" : "Главная (Shift+Click для админ-панели)"}
          >
            {/* Индикатор долгого удержания */}
            {isLongPressing && (
              <motion.div
                className="absolute inset-0 bg-red-400/20 rounded-xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 3 }}
              />
            )}
            
            <div className="relative">
              <motion.div
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                whileHover={{ rotate: 4 }}
                transition={{ duration: 0.2 }}
              >
                <img 
                  src={logoImage} 
                  alt="Bententrade Logo" 
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="h-8 w-8 object-contain"
                />
              </motion.div>
              
              {isAdminMode && (
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>
            
            <div className="flex flex-col text-left">
              <span className="font-grotesk text-lg font-semibold tracking-tight text-foreground">
                Bententrade
              </span>
              <span className="text-xs text-muted-foreground">
                {pickLang(language, {
                  uz: 'Premium sifat',
                  ru: 'Премиум качество',
                  en: 'Premium quality',
                })}
              </span>
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            {primaryMenuItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => {
                  if ('navPage' in item && item.navPage) {
                    handleNavigation(item.navPage);
                  } else {
                    scrollToSection(item.id);
                  }
                }}
                className={`group h-auto rounded-lg px-3 py-2 text-base font-medium micro-interaction ${
                  'navPage' in item &&
                  item.navPage &&
                  (currentPage === 'blog' ||
                    currentPage === 'catalog' ||
                    currentPage === 'wholesale' ||
                    currentPage === 'export') &&
                  item.navPage === currentPage
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/90 hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="transition-colors duration-300">{item.name}</span>
              </Button>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation('profile')}
              aria-label={t.navProfile}
              className={`hidden sm:inline-flex h-10 rounded-xl px-3 micro-interaction ${
                currentPage === 'profile' ? 'bg-primary/10 text-primary' : ''
              }`}
            >
              <User className="h-4 w-4 sm:mr-2" />
              <span className="hidden md:inline">{t.navProfile}</span>
            </Button>

            {/* Cart Button */}
            <Button
              onClick={onCartClick}
              variant="outline"
              size="sm"
              aria-label={pickLang(language, {
                uz: 'Savatni ochish',
                ru: 'Открыть корзину',
                en: 'Open cart',
              })}
              className="relative h-10 rounded-lg border border-border bg-card px-4 shadow-sm micro-interaction hover:border-primary/40 hover:bg-muted/50"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems > 0 && (
                <motion.div
                  key={cartBump}
                  initial={{ scale: 0.65, opacity: 0.85 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                  className="absolute -top-2 -right-2"
                >
                  <Badge
                    variant="destructive"
                    className="h-6 min-w-6 rounded-full bg-primary px-2 text-xs text-primary-foreground shadow-sm"
                  >
                    {cartItems}
                  </Badge>
                </motion.div>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={pickLang(language, {
                    uz: 'Menyuni ochish',
                    ru: 'Открыть меню',
                    en: 'Open menu',
                  })}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-nav-sheet"
                  className="h-10 rounded-lg border border-border bg-card px-3 shadow-sm lg:hidden hover:border-primary/40"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              
              <SheetContent 
                id="mobile-nav-sheet"
                side="right" 
                aria-labelledby="mobile-nav-title"
                className="w-80 border-l border-border bg-background p-0 shadow-xl"
              >
                <motion.div
                  initial={{ x: 300 }}
                  animate={{ x: 0 }}
                  exit={{ x: 300 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <span id="mobile-nav-title" className="font-bold text-gradient">
                        {pickLang(language, { uz: 'Menyu', ru: 'Меню', en: 'Menu' })}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label={pickLang(language, {
                        uz: 'Menyuni yopish',
                        ru: 'Закрыть меню',
                        en: 'Close menu',
                      })}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Menu Items */}
                  <div className="flex-1 p-6 space-y-6">
                    {/* Primary Menu */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium opacity-60 mb-3">
                        {pickLang(language, {
                          uz: 'Asosiy menyu',
                          ru: 'Основное меню',
                          en: 'Main menu',
                        })}
                      </h3>
                      {primaryMenuItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Button
                            variant="ghost"
                            onClick={() =>
                              'navPage' in item && item.navPage
                                ? handleNavigation(item.navPage)
                                : scrollToSection(item.id)
                            }
                            className="w-full justify-start text-base p-4 h-auto rounded-xl hover:bg-primary/10 micro-interaction text-left"
                          >
                            {item.name}
                          </Button>
                        </motion.div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleNavigation('profile')}
                        className={`w-full justify-start gap-2 text-base p-4 h-auto rounded-xl hover:bg-primary/10 micro-interaction text-left ${
                          currentPage === 'profile' ? 'bg-primary/10 text-primary' : ''
                        }`}
                      >
                        <User className="h-4 w-4 shrink-0 opacity-80" />
                        {t.navProfile}
                      </Button>
                    </div>

                    {/* Secondary Menu */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium opacity-60 mb-3">
                        {pickLang(language, { uz: 'Qo‘shimcha', ru: 'Дополнительно', en: 'More' })}
                      </h3>
                      {secondaryMenuItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (primaryMenuItems.length + index) * 0.1 }}
                        >
                          <Button
                            variant="ghost"
                            onClick={() => scrollToSection(item.id)}
                            className="w-full justify-start text-base p-4 h-auto rounded-xl hover:bg-primary/10 micro-interaction text-left"
                          >
                            {item.name}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-primary/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm opacity-60">
                        {pickLang(language, { uz: 'Til', ru: 'Язык', en: 'Language' })}
                      </span>
                      <LanguageToggle />
                    </div>
                  </div>
                </motion.div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
});