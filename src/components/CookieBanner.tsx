import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Cookie, X, Info } from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';

interface CookieBannerProps {
  onViewPrivacyPolicy?: () => void;
}

export function CookieBanner({ onViewPrivacyPolicy }: CookieBannerProps) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Определяем мобильное устройство
    setIsMobile(window.innerWidth < 640);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Проверяем, дал ли пользователь согласие ранее
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      // Показываем баннер через небольшую задержку (больше для мобильных для лучшей загрузки)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, isMobile ? 2500 : 2000);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  const handleAccept = () => {
    setIsAnimating(true);
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
    }, 300);
  };

  const handleDecline = () => {
    setIsAnimating(true);
    localStorage.setItem('cookie-consent', 'declined');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
    }, 300);
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ y: isMobile ? 120 : 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: isMobile ? 120 : 100, opacity: 0 }}
          transition={{ 
            duration: isMobile ? 0.4 : 0.5, 
            ease: "easeOut",
            opacity: { duration: isMobile ? 0.3 : 0.4 }
          }}
          className="fixed bottom-3 left-3 right-3 xs:bottom-4 xs:left-4 xs:right-4 sm:bottom-6 sm:left-6 sm:right-6 md:left-auto md:right-6 md:max-w-md lg:max-w-lg z-50"
          style={{
            paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
            willChange: 'transform, opacity'
          }}
        >
          <Card className="border-primary/20 p-3.5 xs:p-4 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            style={{ 
              WebkitOverflowScrolling: 'touch' as any,
              background: 'rgba(10, 9, 8, 0.85)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(212, 165, 116, 0.2)'
            }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: isAnimating ? 0.95 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Заголовок с иконкой */}
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.div
                    animate={!isMobile ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                  >
                    <Cookie className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </motion.div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground font-grotesk">
                    🍪 Cookies
                  </h3>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-7 w-7 sm:h-6 sm:w-6 p-0 rounded-full hover:bg-primary/10 opacity-60 hover:opacity-100 micro-interaction -mt-1 sm:mt-0"
                >
                  <X className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                </Button>
              </div>

              {/* Текст */}
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                {t.cookieBannerText}
              </p>

              {/* Кнопки */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <motion.div
                    whileHover={!isMobile ? { scale: 1.02 } : {}}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 order-1"
                  >
                    <Button
                      onClick={handleAccept}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg sm:rounded-xl h-11 sm:h-10 text-sm active:scale-95 transition-transform touch-target"
                      disabled={isAnimating}
                    >
                      <Cookie className="w-4 h-4 mr-2" />
                      {t.cookieBannerAccept}
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={!isMobile ? { scale: 1.02 } : {}}
                    whileTap={{ scale: 0.98 }}
                    className="sm:w-auto order-2"
                  >
                    <Button
                      variant="outline"
                      onClick={handleDecline}
                      className="w-full sm:w-auto glass-card border-primary/20 hover:border-primary/40 rounded-lg sm:rounded-xl h-11 sm:h-10 px-4 text-sm active:scale-95 transition-transform touch-target"
                      disabled={isAnimating}
                    >
                      {t.cookieBannerDecline}
                    </Button>
                  </motion.div>
                </div>

                {/* Ссылка на политику */}
                {onViewPrivacyPolicy && (
                  <Button
                    variant="ghost"
                    onClick={onViewPrivacyPolicy}
                    className="w-full text-xs text-primary hover:text-primary/80 h-9 sm:h-8 rounded-lg sm:rounded-xl hover:bg-primary/5 active:scale-95 transition-transform touch-target"
                    disabled={isAnimating}
                  >
                    <Info className="w-3 h-3 mr-1.5 sm:mr-2" />
                    {t.cookieBannerLearnMore}
                  </Button>
                )}
              </div>

              {/* Индикатор */}
              <div className="flex items-center justify-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-primary/10">
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary/40 rounded-full animate-pulse" />
                  <span>Bententrade</span>
                </div>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}