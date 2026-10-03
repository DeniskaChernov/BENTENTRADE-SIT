import {
  useState,
  useEffect,
  Suspense,
  lazy,
  useCallback,
  useMemo,
  startTransition,
  useRef,
  type ComponentProps,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from './components/ui/sonner';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ScrollToTop } from './components/ScrollToTop';
import { LanguageProvider, pickLang, type Language } from './utils/language-context';
import { SEOHead } from './components/SEOHead';
import { StructuredData } from './components/StructuredData';
import { Header } from './components/Header';
import { HomePage } from './components/site/HomePage';
import { SkipToMain } from './components/site/SkipToMain';
import { WholesalePage, ExportPage } from './components/B2BTradePages';
import { trackEvent } from './utils/analytics';
import { defaultQuantity, unitPriceUzs } from './utils/pricing';
import { Cart } from './components/Cart';
import { CartFeedbackToast } from './components/CartFeedbackToast';
import { OneClickCheckoutSheet, type OneClickLine } from './components/OneClickCheckoutSheet';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { LegalDocuments, LegalDocumentType } from './components/LegalDocuments';
import { TelegramQuickFixWizard } from './components/TelegramQuickFixWizard';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Lock, Shield, AlertCircle, Sparkles } from './utils/lucide-stub';
import { API_BASE_URL, API_TOKEN } from './utils/env';
import { getBlogPostBySlug } from './data/blogPosts';

// Optimized lazy loading with shorter timeout and retry mechanism
const CatalogPage = lazy(() => 
  import('./components/CatalogPage')
    .then(module => ({ default: module.CatalogPage }))
    .catch(() => ({ default: () => <div className="text-center p-8 text-muted-foreground">Каталог временно недоступен</div> }))
);
const AdminPanel = lazy(() => 
  import('./components/admin/AdminPanel')
    .then(module => ({ default: module.default }))
    .catch(() => ({ default: () => <div className="text-center p-8 text-muted-foreground">Админ-панель временно недоступна</div> }))
);
const BlogPostPage = lazy(() => import('./components/BlogPostPage').then(module => ({ default: module.BlogPostPage })));
const BlogListPage = lazy(() => import('./components/BlogListPage').then(module => ({ default: module.BlogListPage })));
const UserProfilePage = lazy(() =>
  import('./components/UserProfilePage').then((m) => ({ default: m.UserProfilePage })),
);

/** Ключ sessionStorage для JWT после входа в админку (не localStorage — закрытие вкладки = выход). */
const ADMIN_JWT_STORAGE_KEY = 'benten-admin-jwt';

interface ColorVariant {
  id: string;
  name: string;
  image: string;
  color: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  selectedVariant?: ColorVariant;
  selectedImageIndex?: number;
  size?: string;
  style?: string;
  category?: string; // 'materials' для ротанга, иначе кашпо
  lineMeta?: string;
}

interface CartItem extends Product {
  quantity: number;
}

function readUiLanguage(): Language {
  try {
    const s = localStorage.getItem('bententrade-language');
    if (s === 'uz' || s === 'ru' || s === 'en') return s;
  } catch {
    /* private mode */
  }
  return 'ru';
}

function cartLineId(p: Pick<Product, 'id' | 'selectedVariant' | 'selectedImageIndex' | 'lineMeta'>): string {
  const base = p.selectedVariant
    ? `${p.id}-${p.selectedVariant.id}-${p.selectedImageIndex ?? 0}`
    : p.id;
  return p.lineMeta ? `${base}::${p.lineMeta}` : base;
}

function AppCartBlock({
  feedback,
  ...cartProps
}: ComponentProps<typeof Cart> & { feedback: string | null }) {
  return (
    <>
      <Cart {...cartProps} />
      <CartFeedbackToast message={feedback} />
    </>
  );
}

// Современный компонент для админ-логина
function ModernAdminLogin({ isOpen, onClose, onLogin }: { isOpen: boolean; onClose: () => void; onLogin: (session: { token: string }) => void }) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_TIME = 30000;

  const showNotification = (message: string, type: 'success' | 'error' = 'error') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-6 right-6 p-4 rounded-xl shadow-lg z-[9999] transition-all duration-500 max-w-sm glass-effect ${
      type === 'success' 
        ? 'border-emerald-500/30 text-emerald-400' 
        : 'border-red-500/30 text-red-400'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      showNotification('Вход заблокирован. Попробуйте позже.');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
          'X-Admin-Password': password,
        },
        body: JSON.stringify({}),
      });
      const result = await response.json().catch(() => ({}));

      if (response.status === 429) {
        showNotification(String(result.error || 'Слишком много попыток входа. Повторите позже.'));
        setPassword('');
        return;
      }

      if (!response.ok || !result.success || !result.token) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          showNotification(`Превышено количество попыток. Доступ заблокирован на ${LOCKOUT_TIME / 1000} секунд.`);

          setTimeout(() => {
            setIsLocked(false);
            setAttempts(0);
          }, LOCKOUT_TIME);
        } else {
          showNotification(
            String(result.error || `Неверный пароль. Осталось попыток: ${MAX_ATTEMPTS - newAttempts}`),
          );
        }
        setPassword('');
        return;
      }

      showNotification('Добро пожаловать в админ-панель! ✨', 'success');
      setPassword('');
      setAttempts(0);
      onLogin({ token: result.token });
    } catch {
      showNotification('Не удалось связаться с сервером.');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPassword('');
      setAttempts(0);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md border-border bg-card shadow-xl">
            <DialogHeader className="space-y-4">
              <DialogTitle className="flex items-center justify-center gap-3 text-2xl">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="p-2 rounded-full bg-primary/10"
                >
                  <Shield className="w-6 h-6 text-primary" />
                </motion.div>
                <span className="text-gradient">Админ-панель</span>
              </DialogTitle>
              <DialogDescription className="text-center text-base opacity-80">
                Введите пароль для доступа к панели управления
              </DialogDescription>
            </DialogHeader>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >

              <div className="space-y-6">
                <motion.div 
                  className="flex items-center gap-3 p-4 glass-card rounded-xl border-primary/25"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-primary/90">Доступ только для авторизованного персонала</span>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div 
                    className="space-y-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label htmlFor="admin-password" className="text-sm font-medium text-foreground/90">
                      Пароль администратора
                    </label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Введите пароль..."
                      disabled={isLoading || isLocked}
                      autoComplete="current-password"
                      className="glass-card border-primary/20 text-base h-12 rounded-xl"
                    />
                  </motion.div>

                  {attempts > 0 && !isLocked && (
                    <motion.div 
                      className="flex items-center gap-3 text-sm text-orange-400/90"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Неверных попыток: {attempts} из {MAX_ATTEMPTS}</span>
                    </motion.div>
                  )}

                  {isLocked && (
                    <motion.div 
                      className="flex items-center gap-3 p-3 glass-card border-red-400/20 rounded-xl text-sm text-red-400"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Lock className="w-4 h-4" />
                      <span>Вход временно заблокирован</span>
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="flex-1 h-12 rounded-xl glass-card border-primary/20 hover:border-primary/40 micro-interaction"
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      disabled={!password || isLoading || isLocked}
                      className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 micro-interaction neon-glow"
                    >
                      {isLoading ? (
                        <motion.div
                          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Войти
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <motion.div 
                  className="text-xs text-center opacity-60 border-t border-primary/10 pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.4 }}
                >
                  <Sparkles className="inline w-3 h-3 mr-1" />
                  Проверка пароля выполняется на сервере Railway
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<
    'home' | 'catalog' | 'profile' | 'admin' | 'legal' | 'blog' | 'wholesale' | 'export'
  >('home');
  const [catalogProductSlug, setCatalogProductSlug] = useState<string | null>(null);
  const [oneClickOpen, setOneClickOpen] = useState(false);
  const [oneClickLines, setOneClickLines] = useState<OneClickLine[]>([]);
  const [currentBlogSlug, setCurrentBlogSlug] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [currentLegalDocument, setCurrentLegalDocument] = useState<LegalDocumentType | null>(null);
  const [showTelegramHelper, setShowTelegramHelper] = useState(false);
  const [telegramError, setTelegramError] = useState<any>(null);
  const [shouldRenderTrend, setShouldRenderTrend] = useState(false);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);
  const [cartBump, setCartBump] = useState(0);
  const trendTriggerRef = useRef<HTMLDivElement | null>(null);

  const legalFromPath = useCallback((path: string): LegalDocumentType | null => {
    const legacyMap: Record<string, LegalDocumentType> = {
      '/privacy': 'privacy',
      '/cookies': 'cookies',
      '/terms': 'terms',
      '/company': 'company',
    };
    if (legacyMap[path]) return legacyMap[path];
    if (path.startsWith('/legal/')) {
      const slug = path.replace('/legal/', '');
      if (slug === 'privacy' || slug === 'cookies' || slug === 'terms' || slug === 'company') {
        return slug;
      }
    }
    return null;
  }, []);

  const blogFromPath = useCallback((path: string): string | null => {
    if (path === '/blog') return '__list__';
    if (!path.startsWith('/blog/')) return null;
    const slug = path.replace('/blog/', '');
    if (!slug) return null;
    return slug;
  }, []);

  const updateUrl = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  }, []);

  // ✅ Обработка начальной навигации по URL (для SEO и прямых ссылок)
  useEffect(() => {
    const path = window.location.pathname;
    
    if (path === '/catalog') {
      startTransition(() => {
        setCurrentPage('catalog');
        setCatalogProductSlug(null);
      });
    } else if (path.startsWith('/product/')) {
      const slug = path.slice('/product/'.length).replace(/\/+$/, '').split('/')[0];
      if (slug) {
        startTransition(() => {
          setCurrentPage('catalog');
          setCatalogProductSlug(slug);
        });
      }
    } else if (path === '/profile') {
      startTransition(() => setCurrentPage('profile'));
    } else if (path === '/wholesale') {
      startTransition(() => setCurrentPage('wholesale'));
    } else if (path === '/export') {
      startTransition(() => setCurrentPage('export'));
    } else if (path === '/admin') {
      startTransition(() => {
        setCurrentPage('admin');
        try {
          const stored = sessionStorage.getItem(ADMIN_JWT_STORAGE_KEY);
          if (stored) {
            setAdminToken(stored);
            setIsAuthenticated(true);
            setIsAdminMode(true);
          } else {
            setShowAdminLogin(true);
          }
        } catch {
          setShowAdminLogin(true);
        }
      });
    } else if (path === '/legal') {
      startTransition(() => {
        setCurrentLegalDocument('privacy');
        setCurrentPage('legal');
      });
    } else {
      const blogSlug = blogFromPath(path);
      if (blogSlug) {
        startTransition(() => {
          setCurrentPage('blog');
          setCurrentBlogSlug(blogSlug === '__list__' ? null : blogSlug);
          setCurrentLegalDocument(null);
        });
        return;
      }

      const legalType = legalFromPath(path);
      if (legalType) {
        startTransition(() => {
          setCurrentLegalDocument(legalType);
          setCurrentPage('legal');
        });
      }
    }
  }, [blogFromPath, legalFromPath]);

  // Синхронизация SPA состояния с back/forward браузера.
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      if (path === '/catalog') {
        setCurrentPage('catalog');
        setCatalogProductSlug(null);
        setCurrentLegalDocument(null);
        return;
      }
      if (path.startsWith('/product/')) {
        const slug = path.slice('/product/'.length).replace(/\/+$/, '').split('/')[0];
        if (slug) {
          setCurrentPage('catalog');
          setCatalogProductSlug(slug);
          setCurrentLegalDocument(null);
          setCurrentBlogSlug(null);
          return;
        }
      }
      if (path === '/profile') {
        setCurrentPage('profile');
        setCurrentLegalDocument(null);
        setCurrentBlogSlug(null);
        setCatalogProductSlug(null);
        return;
      }
      if (path === '/wholesale') {
        setCurrentPage('wholesale');
        setCurrentLegalDocument(null);
        setCurrentBlogSlug(null);
        return;
      }
      if (path === '/export') {
        setCurrentPage('export');
        setCurrentLegalDocument(null);
        setCurrentBlogSlug(null);
        return;
      }
      if (path === '/admin') {
        setCurrentPage('admin');
        try {
          const stored = sessionStorage.getItem(ADMIN_JWT_STORAGE_KEY);
          if (stored) {
            setAdminToken(stored);
            setIsAuthenticated(true);
            setIsAdminMode(true);
          } else {
            setAdminToken('');
            setIsAuthenticated(false);
            setIsAdminMode(false);
            setShowAdminLogin(true);
          }
        } catch {
          setShowAdminLogin(true);
        }
        return;
      }
      if (path === '/legal') {
        setCurrentPage('legal');
        setCurrentLegalDocument('privacy');
        return;
      }
      const legalType = legalFromPath(path);
      if (legalType) {
        setCurrentPage('legal');
        setCurrentLegalDocument(legalType);
        setCurrentBlogSlug(null);
        return;
      }
      const blogSlug = blogFromPath(path);
      if (blogSlug) {
        setCurrentPage('blog');
        setCurrentBlogSlug(blogSlug === '__list__' ? null : blogSlug);
        setCurrentLegalDocument(null);
        return;
      }
      setCurrentPage('home');
      setCurrentLegalDocument(null);
      setCurrentBlogSlug(null);
      setCatalogProductSlug(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [blogFromPath, legalFromPath]);

  useEffect(() => {
    if (currentPage !== 'home' || shouldRenderTrend || !trendTriggerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldRenderTrend(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(trendTriggerRef.current);
    return () => observer.disconnect();
  }, [currentPage, shouldRenderTrend]);

  // ✅ SEO теги управляются компонентом <SEOHead /> - НЕ дублируем здесь!
  // Удалён дублирующий useEffect для мета-тегов

  const handleExitAdmin = useCallback(() => {
    setIsAdminMode(false);
    setIsAuthenticated(false);
    setAdminToken('');
    try {
      sessionStorage.removeItem(ADMIN_JWT_STORAGE_KEY);
    } catch {
      /* private mode */
    }
    setCurrentPage('home');
    updateUrl('/');
  }, [updateUrl]);

  // Скрытые способы доступа к админ-панели
  useEffect(() => {
    const handleKeyboardAccess = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminLogin(true);
      }
      
      // Горячая клавиша для Telegram Helper: Ctrl+Shift+T
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setShowTelegramHelper(true);
      }
      
      if (e.key === 'Escape' && isAdminMode) {
        handleExitAdmin();
      }
    };

    window.addEventListener('keydown', handleKeyboardAccess);
    return () => window.removeEventListener('keydown', handleKeyboardAccess);
  }, [isAdminMode, handleExitAdmin]);

  // Обработчик событий Telegram ошибок
  useEffect(() => {
    const handleTelegramSetup = (event: any) => {
      console.log('📥 Opening Telegram Setup Helper', event.detail);
      setTelegramError(event.detail?.error);
      setShowTelegramHelper(true);
    };

    window.addEventListener('openTelegramSetup' as any, handleTelegramSetup);
    return () => window.removeEventListener('openTelegramSetup' as any, handleTelegramSetup);
  }, []);

  const cartItemsCount = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.quantity, 0), 
    [cartItems]
  );

  const addToCart = useCallback((product: Product) => {
    const isRattan = product.category === 'materials';
    const incrementStep = isRattan ? 5 : 1;
    const lineId = cartLineId(product);
    trackEvent('add_to_cart', {
      currency: 'UZS',
      items: [
        {
          item_id: lineId,
          item_name: product.name,
          item_category: isRattan ? 'materials' : 'planter',
          quantity: incrementStep,
        },
      ],
    });

    setCartItems(prev => {
      const itemId = cartLineId(product);

      const existingItem = prev.find((item) => cartLineId(item) === itemId);

      // Для ротанга (materials) шаг увеличения 5кг, для кашпо - 1шт
      const initialQuantity = isRattan ? 5 : 1;

      if (existingItem) {
        return prev.map((item) =>
          cartLineId(item) === itemId ? { ...item, quantity: item.quantity + incrementStep } : item,
        );
      }
      return [...prev, { ...product, quantity: initialQuantity }];
    });
    setIsCartOpen(true);
    setCartFeedback(product.name);
    setCartBump((n) => n + 1);
    window.setTimeout(() => setCartFeedback(null), 2200);
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (cartLineId(item) === id ? { ...item, quantity } : item)),
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => cartLineId(item) !== id));
  }, []);

  const handleExpressCheckout = useCallback(
    (args: { product: Product; selectedVariant: Product['selectedVariant']; widthMm: number | null }) => {
      const { product, selectedVariant, widthMm } = args;
      const lang = readUiLanguage();
      const qty = defaultQuantity({ category: product.category, size: product.size });
      const price = unitPriceUzs({ category: product.category, size: product.size });
      const lineMeta =
        widthMm != null
          ? pickLang(lang, {
              ru: `Ширина нити: ${widthMm} мм`,
              uz: `Ip kengligi: ${widthMm} mm`,
              en: `Thread width: ${widthMm} mm`,
            })
          : undefined;
      const name = selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name;
      setOneClickLines([
        {
          name,
          quantity: qty,
          price,
          total: price * qty,
          variant: selectedVariant?.name,
          size: product.size,
          style: product.style,
          lineMeta,
        },
      ]);
      setOneClickOpen(true);
    },
    [],
  );

  const handleProductSlugChange = useCallback(
    (slug: string | null) => {
      setCatalogProductSlug(slug);
      if (slug) updateUrl(`/product/${slug}`);
      else updateUrl('/catalog');
    },
    [updateUrl],
  );

  const handleNavigateToContacts = useCallback(() => {
    startTransition(() => {
      setCurrentPage('home');
      setCurrentBlogSlug(null);
      setCurrentLegalDocument(null);
    });
    updateUrl('/');
    window.setTimeout(() => {
      document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }, [updateUrl]);

  const handleNavigate = useCallback(
    (page: 'home' | 'catalog' | 'profile' | 'admin' | 'blog' | 'wholesale' | 'export') => {
    if (page === 'blog') {
      startTransition(() => {
        setCurrentPage('blog');
        setCurrentBlogSlug(null);
        setCurrentLegalDocument(null);
        setCatalogProductSlug(null);
      });
      updateUrl('/blog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (page === 'admin') {
      let stored: string | null = null;
      try {
        stored = sessionStorage.getItem(ADMIN_JWT_STORAGE_KEY);
      } catch {
        /* private mode */
      }
      startTransition(() => {
        setCurrentPage('admin');
        setCurrentBlogSlug(null);
        setCurrentLegalDocument(null);
        setCatalogProductSlug(null);
        if (stored) {
          setAdminToken(stored);
          setIsAuthenticated(true);
          setIsAdminMode(true);
        } else {
          setShowAdminLogin(true);
        }
      });
      updateUrl('/admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (page === 'profile') {
      startTransition(() => {
        setCurrentPage('profile');
        setCurrentBlogSlug(null);
        setCurrentLegalDocument(null);
        setCatalogProductSlug(null);
      });
      updateUrl('/profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    startTransition(() => {
      setCurrentPage(page);
      setCurrentBlogSlug(null);
      setCurrentLegalDocument(null);
      setCatalogProductSlug(null);
    });
    const path =
      page === 'catalog'
        ? '/catalog'
        : page === 'wholesale'
          ? '/wholesale'
          : page === 'export'
            ? '/export'
            : '/';
    updateUrl(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  [updateUrl],
);

  const handleLogoSecretAccess = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if ('shiftKey' in e && e.shiftKey) {
      e.preventDefault();
      setShowAdminLogin(true);
      return;
    }
  }, []);

  const handleLogoLongPress = useCallback(() => {
    setShowAdminLogin(true);
  }, []);

  const handleAdminLogin = useCallback(({ token }: { token: string }) => {
    try {
      sessionStorage.setItem(ADMIN_JWT_STORAGE_KEY, token);
    } catch {
      /* private mode — сессия только до перезагрузки */
    }
    setAdminToken(token);
    setIsAuthenticated(true);
    setIsAdminMode(true);
    setShowAdminLogin(false);
    setCurrentPage('admin');
    updateUrl('/admin');
  }, [updateUrl]);

  const handleCartClick = useCallback(() => setIsCartOpen(true), []);
  const handleCartClose = useCallback(() => setIsCartOpen(false), []);

  const handleLegalDocumentClick = useCallback((type: LegalDocumentType) => {
    startTransition(() => {
      setCurrentLegalDocument(type);
      setCurrentPage('legal');
    });
    updateUrl(`/legal/${type}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const handleBackFromLegal = useCallback(() => {
    startTransition(() => {
      setCurrentPage('home');
      setCurrentLegalDocument(null);
    });
    updateUrl('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const handleViewPrivacyPolicy = useCallback(() => {
    handleLegalDocumentClick('privacy');
  }, [handleLegalDocumentClick]);

  const handleOpenBlogPost = useCallback((slug: string) => {
    startTransition(() => {
      setCurrentPage('blog');
      setCurrentBlogSlug(slug);
      setCurrentLegalDocument(null);
    });
    updateUrl(`/blog/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const handleOpenBlogList = useCallback(() => {
    startTransition(() => {
      setCurrentPage('blog');
      setCurrentBlogSlug(null);
      setCurrentLegalDocument(null);
    });
    updateUrl('/blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const handleBackFromBlog = useCallback(() => {
    startTransition(() => {
      setCurrentPage('home');
      setCurrentBlogSlug(null);
    });
    updateUrl('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  // Оптимизированный фон с упрощенными эффектами
  const ModernBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 bg-[#f8fafc]"
        style={{
          backgroundImage: `radial-gradient(ellipse 110% 70% at 95% -10%, rgba(13, 148, 136, 0.09), transparent 52%),
            radial-gradient(ellipse 90% 55% at 5% 105%, rgba(99, 102, 241, 0.06), transparent 48%),
            linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.35] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.07) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />
    </div>
  );

  const LazyLoadError = ({ error }: { error?: Error }) => (
    <div className="flex items-center justify-center min-h-96 p-8">
      <div className="text-center glass-card p-8 rounded-2xl max-w-md">
        <p className="text-muted-foreground mb-2">Компонент временно недоступен</p>
        <p className="text-xs text-muted-foreground/60 mb-4">
          {error?.message || 'Попробуйте обновить страницу'}
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="micro-interaction"
          size="sm"
        >
          Обновить страницу
        </Button>
      </div>
    </div>
  );

  // Админ-панель
  if (currentPage === 'admin' && isAuthenticated) {
    return (
      <LanguageProvider>
        <ErrorBoundary>
          <Header 
            cartItems={cartItemsCount}
            cartBump={cartBump}
            onCartClick={handleCartClick}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogoSecretAccess={handleLogoSecretAccess}
            onLogoLongPress={handleLogoLongPress}
            isAdminMode={isAdminMode}
          />
          
          <div className="min-h-screen">
            <ModernBackground />
            
            <motion.div 
              className="fixed left-0 right-0 top-0 z-50 border-b border-red-300/40 bg-background/95 py-2 text-center text-sm text-red-600 backdrop-blur-md dark:text-red-400"
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Режим администратора | Нажмите ESC для выхода
              </div>
            </motion.div>
            
            <div className="pt-16 relative z-10">
              <Suspense fallback={
                <div className="container mx-auto px-4 py-16">
                  <LoadingSpinner size="lg" text="Загрузка админ-панели..." />
                </div>
              }>
                <ErrorBoundary fallback={<LazyLoadError />}>
                  <AdminPanel onExit={handleExitAdmin} adminToken={adminToken} />
                </ErrorBoundary>
              </Suspense>
            </div>
            
            <Toaster />
          </div>
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  // Страница каталога
  if (currentPage === 'catalog') {
    return (
      <LanguageProvider>
        <ErrorBoundary>
          <SEOHead
            page={catalogProductSlug ? 'product' : 'catalog'}
            canonicalUrl={
              catalogProductSlug
                ? `https://bententrade.uz/product/${catalogProductSlug}`
                : 'https://bententrade.uz/catalog'
            }
          />
          <StructuredData type="catalog" />
          
          <Header 
            cartItems={cartItemsCount}
            cartBump={cartBump}
            onCartClick={handleCartClick}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogoSecretAccess={handleLogoSecretAccess}
            onLogoLongPress={handleLogoLongPress}
            isAdminMode={isAdminMode}
          />
          
          <div className="min-h-screen">
            <ModernBackground />
            
            <main className="pt-20 relative z-10">
              <h1 className="sr-only">Каталог Bententrade: ротанговая нить и плетеные кашпо</h1>
              <Suspense fallback={
                <div className="container mx-auto px-4 py-8">
                  <LoadingSpinner size="lg" text="Загрузка каталога..." />
                </div>
              }>
                <ErrorBoundary fallback={<LazyLoadError />}>
                  <CatalogPage
                    onAddToCart={addToCart}
                    onBackToHome={() => handleNavigate('home')}
                    onOpenCart={() => setIsCartOpen(true)}
                    productSlug={catalogProductSlug}
                    onProductSlugChange={handleProductSlugChange}
                    onExpressCheckout={handleExpressCheckout}
                    onOpenConsult={() => {
                      handleNavigate('home');
                      requestAnimationFrame(() => {
                        document.getElementById('rattan-quiz')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      });
                    }}
                  />
                </ErrorBoundary>
              </Suspense>
            </main>

            <AppCartBlock
              feedback={cartFeedback}
              isOpen={isCartOpen}
              onClose={handleCartClose}
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
            />

            <OneClickCheckoutSheet
              open={oneClickOpen}
              onClose={() => setOneClickOpen(false)}
              lines={oneClickLines}
              onSuccess={() => setOneClickLines([])}
            />

            <ScrollToTop />
            <Toaster />
          </div>
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  if (currentPage === 'profile') {
    return (
      <LanguageProvider>
        <ErrorBoundary>
          <SEOHead page="profile" />
          <StructuredData type="home" />

          <Header
            cartItems={cartItemsCount}
            cartBump={cartBump}
            onCartClick={handleCartClick}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogoSecretAccess={handleLogoSecretAccess}
            onLogoLongPress={handleLogoLongPress}
            isAdminMode={isAdminMode}
          />

          <div className="min-h-screen">
            <ModernBackground />

            <main className="relative z-10">
              <Suspense
                fallback={
                  <div className="container mx-auto px-4 py-24">
                    <LoadingSpinner size="lg" text="Загрузка профиля…" />
                  </div>
                }
              >
                <ErrorBoundary fallback={<LazyLoadError />}>
                  <UserProfilePage onBack={() => handleNavigate('home')} />
                </ErrorBoundary>
              </Suspense>
            </main>

            <AppCartBlock
              feedback={cartFeedback}
              isOpen={isCartOpen}
              onClose={handleCartClose}
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
            />

            <ScrollToTop />
            <Toaster />
          </div>
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  if (currentPage === 'wholesale') {
    return (
      <LanguageProvider>
        <ErrorBoundary>
          <SEOHead page="wholesale" />
          <StructuredData type="home" />
          <Header
            cartItems={cartItemsCount}
            cartBump={cartBump}
            onCartClick={handleCartClick}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogoSecretAccess={handleLogoSecretAccess}
            onLogoLongPress={handleLogoLongPress}
            isAdminMode={isAdminMode}
          />
          <div className="min-h-screen">
            <ModernBackground />
            <main className="relative z-10">
              <h1 className="sr-only">Опт ротанга и кашпо Bententrade</h1>
              <WholesalePage onHome={() => handleNavigate('home')} onContacts={handleNavigateToContacts} />
            </main>
            <Footer onLegalDocumentClick={handleLegalDocumentClick} onBlogClick={handleOpenBlogList} />
            <AppCartBlock
              feedback={cartFeedback}
              isOpen={isCartOpen}
              onClose={handleCartClose}
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
            />
            <ScrollToTop />
            <Toaster />
          </div>
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  if (currentPage === 'export') {
    return (
      <LanguageProvider>
        <ErrorBoundary>
          <SEOHead page="export" />
          <StructuredData type="home" />
          <Header
            cartItems={cartItemsCount}
            cartBump={cartBump}
            onCartClick={handleCartClick}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogoSecretAccess={handleLogoSecretAccess}
            onLogoLongPress={handleLogoLongPress}
            isAdminMode={isAdminMode}
          />
          <div className="min-h-screen">
            <ModernBackground />
            <main className="relative z-10">
              <h1 className="sr-only">Экспорт ротанга и кашпо Bententrade</h1>
              <ExportPage onHome={() => handleNavigate('home')} onContacts={handleNavigateToContacts} />
            </main>
            <Footer onLegalDocumentClick={handleLegalDocumentClick} onBlogClick={handleOpenBlogList} />
            <AppCartBlock
              feedback={cartFeedback}
              isOpen={isCartOpen}
              onClose={handleCartClose}
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
            />
            <ScrollToTop />
            <Toaster />
          </div>
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  // Страница юридических документов
  if (currentPage === 'legal' && currentLegalDocument) {
    return (
      <LanguageProvider>
        <ErrorBoundary>
          <SEOHead page="legal" />
          <StructuredData type="home" />
          
          <Header 
            cartItems={cartItemsCount}
            cartBump={cartBump}
            onCartClick={handleCartClick}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogoSecretAccess={handleLogoSecretAccess}
            onLogoLongPress={handleLogoLongPress}
            isAdminMode={isAdminMode}
          />
          
          <div className="min-h-screen">
            <ModernBackground />
            
            <main className="relative z-10">
              <h1 className="sr-only">Юридическая информация Bententrade</h1>
              <LegalDocuments 
                type={currentLegalDocument}
                onBack={handleBackFromLegal}
              />
            </main>

            <AppCartBlock
              feedback={cartFeedback}
              isOpen={isCartOpen}
              onClose={handleCartClose}
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
            />

            <ScrollToTop />
            <Toaster />
          </div>
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  // Страница публикации блога
  if (currentPage === 'blog' && currentBlogSlug) {
    const post = getBlogPostBySlug(currentBlogSlug);
    const blogTitle = post ? post.title.ru : 'Блог Bententrade';
    const blogDescription = post ? post.description.ru : 'Новости и статьи Bententrade';
    const canonicalBlogUrl = `https://bententrade.uz/blog/${currentBlogSlug}`;
    return (
      <LanguageProvider>
        <ErrorBoundary>
          <SEOHead
            page="blog"
            title={blogTitle}
            description={blogDescription}
            canonicalUrl={canonicalBlogUrl}
            image={post?.image}
          />
          <StructuredData type="home" />
          <Header 
            cartItems={cartItemsCount}
            cartBump={cartBump}
            onCartClick={handleCartClick}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogoSecretAccess={handleLogoSecretAccess}
            onLogoLongPress={handleLogoLongPress}
            isAdminMode={isAdminMode}
          />
          <div className="min-h-screen">
            <ModernBackground />
            <main className="relative z-10">
              <Suspense fallback={<section className="py-10" aria-hidden="true" />}>
                <BlogPostPage slug={currentBlogSlug} onBack={handleBackFromBlog} />
              </Suspense>
            </main>
            <Footer onLegalDocumentClick={handleLegalDocumentClick} onBlogClick={handleOpenBlogList} />
            <AppCartBlock
              feedback={cartFeedback}
              isOpen={isCartOpen}
              onClose={handleCartClose}
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
            />
            <ScrollToTop />
            <Toaster />
          </div>
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  if (currentPage === 'blog' && !currentBlogSlug) {
    return (
      <LanguageProvider>
        <ErrorBoundary>
          <SEOHead page="blog" canonicalUrl="https://bententrade.uz/blog" />
          <StructuredData type="home" />
          <Header 
            cartItems={cartItemsCount}
            cartBump={cartBump}
            onCartClick={handleCartClick}
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogoSecretAccess={handleLogoSecretAccess}
            onLogoLongPress={handleLogoLongPress}
            isAdminMode={isAdminMode}
          />
          <div className="min-h-screen">
            <ModernBackground />
            <main className="relative z-10">
              <Suspense fallback={<section className="py-10" aria-hidden="true" />}>
                <BlogListPage onBack={handleBackFromBlog} onOpenPost={handleOpenBlogPost} />
              </Suspense>
            </main>
            <Footer onLegalDocumentClick={handleLegalDocumentClick} onBlogClick={handleOpenBlogList} />
            <AppCartBlock
              feedback={cartFeedback}
              isOpen={isCartOpen}
              onClose={handleCartClose}
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
            />
            <ScrollToTop />
            <Toaster />
          </div>
        </ErrorBoundary>
      </LanguageProvider>
    );
  }

  // Главная страница
  return (
    <LanguageProvider>
      <ErrorBoundary>
        <SEOHead page="home" />
        <StructuredData type="home" />
        
        <Header
          cartItems={cartItemsCount}
          cartBump={cartBump}
          onCartClick={handleCartClick}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogoSecretAccess={handleLogoSecretAccess}
          onLogoLongPress={handleLogoLongPress}
          isAdminMode={isAdminMode}
        />
        
        <div className="min-h-screen">
          <SkipToMain />
          <ModernBackground />
          <HomePage
            trendTriggerRef={trendTriggerRef}
            shouldRenderTrend={shouldRenderTrend}
            onNavigateCatalog={() => handleNavigate('catalog')}
            onAddToCart={addToCart}
            onOpenBlogPost={handleOpenBlogPost}
            onOpenBlogList={handleOpenBlogList}
            onCartClick={handleCartClick}
          />

          <Footer onLegalDocumentClick={handleLegalDocumentClick} onBlogClick={handleOpenBlogList} />

          <AppCartBlock
            feedback={cartFeedback}
            isOpen={isCartOpen}
            onClose={handleCartClose}
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
          />

          <CookieBanner onViewPrivacyPolicy={handleViewPrivacyPolicy} />

          <ModernAdminLogin
            isOpen={showAdminLogin}
            onClose={() => setShowAdminLogin(false)}
            onLogin={handleAdminLogin}
          />

          <TelegramQuickFixWizard
            isOpen={showTelegramHelper}
            onClose={() => setShowTelegramHelper(false)}
            error={telegramError}
          />

          <ScrollToTop />
          <Toaster />
          
          {isAdminMode && (
            <motion.div 
              className="fixed bottom-4 right-4 w-3 h-3 bg-red-400 rounded-full opacity-50 pointer-events-none neon-glow"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
      </ErrorBoundary>
    </LanguageProvider>
  );
}