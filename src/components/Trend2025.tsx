import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer@9.13.1';
import { useRef, useState, useEffect, memo, useMemo, useCallback } from 'react';
import { Badge } from './ui/badge';
import { Sparkles, X } from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Trend2025() {
  const { language } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSpool, setHoveredSpool] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [assets, setAssets] = useState<any>(null);
  const reduceAnimations = prefersReducedMotion || isCompactLayout;
  
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  // Отслеживаем прогресс скролла этого контейнера
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end start"] // Начинаем анимацию раньше
  });

  // Моток падает сверху вниз параллельно скроллу (начинается разу)
  const ropeY = useTransform(scrollYProgress, [0, 0.3], [-100, 100]);
  const ropeOpacity = useTransform(scrollYProgress, [0, 0.15, 0.3], [0, 1, 1]);
  
  // Разделитель появляется когда моток касается дна
  const dividerScale = useTransform(scrollYProgress, [0.25, 0.4], [0, 1]);
  const dividerOpacity = useTransform(scrollYProgress, [0.25, 0.35], [0, 1]);
  
  // Дополнительные мотки появляются позади когда основной коснется дна
  const backgroundSpoolsOpacity = useTransform(scrollYProgress, [0.25, 0.4], [0, 1]);
  const backgroundSpoolsScale = useTransform(scrollYProgress, [0.25, 0.4], [0.8, 1]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(max-width: 1024px)');
    const apply = () => setIsCompactLayout(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);
  
  // Закрытие lightbox по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxImage) {
        setLightboxImage(null);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [lightboxImage]);

  useEffect(() => {
    let cancelled = false;
    import('../data/trend-assets').then((module) => {
      if (!cancelled) {
        setAssets(module);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    ropeSpool,
    ropeSpool1,
    ropeSpool2,
    ropeSpool3,
    ropeSpool5,
    furnitureCenter,
    furnitureDresser,
    furnitureShelf,
    furnitureChair,
    furnitureChair2,
    ropeColors,
  } = assets || {};

  if (!assets) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">Загрузка блока...</div>
        </div>
      </section>
    );
  }
  
  return (
    <section 
      ref={containerRef}
      className="py-32 relative overflow-hidden bg-background"
    >
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Заголовок секции */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/50 px-6 py-2 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            {language === 'uz' ? '2025 yil trendi' : 'Тренд 2025 года'}
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {language === 'uz' 
              ? 'Burma rattan - zamonaviy dizaynning yangi so\'zi'
              : 'Крученый ротанг - новое слово в современном дизайне'}
          </h2>

          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={inView ? { opacity: 1, width: '150px' } : { opacity: 0, width: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-primary via-primary/50 to-primary mx-auto rounded-full"
          />
        </motion.div>

        {/* Контейнер с падающим мотком */}
        <div ref={ref} className="flex justify-center items-center py-20 min-h-[600px] relative">
          <div className="w-full max-w-7xl h-96 flex items-center justify-center relative overflow-visible">
            
            {/* Третий план (дальний) */}
            
            {/* Третий план слева - Светло-коричневый */}
            <motion.div
              className="absolute cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{
                y: 60,
                x: -380,
                zIndex: 1
              }}
              onHoverStart={reduceAnimations ? undefined : () => setHoveredSpool('spool3')}
              onHoverEnd={reduceAnimations ? undefined : () => setHoveredSpool(null)}
            >
              <motion.img 
                src={ropeSpool3} 
                alt={language === 'uz' ? 'Burma rattan fotosi' : 'Моток крученого ротанга'}
                className="w-72 h-72 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {!reduceAnimations && hoveredSpool === 'spool3' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 glass-card px-4 py-3 rounded-xl border border-primary/30 min-w-[160px] text-center"
                >
                  <div className="text-xs text-primary/80 mb-2 uppercase tracking-wider">
                    {language === 'uz' ? 'Eksklyuziv' : 'Эксклюзив'}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {language === 'uz' ? ropeColors.spool3.uz : ropeColors.spool3.ru}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Третий план справа - Натуральный беж */}
            <motion.div
              className="absolute cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                y: 60,
                x: 380,
                zIndex: 1
              }}
              onHoverStart={reduceAnimations ? undefined : () => setHoveredSpool('spool2')}
              onHoverEnd={reduceAnimations ? undefined : () => setHoveredSpool(null)}
            >
              <motion.img 
                src={ropeSpool2} 
                alt={language === 'uz' ? 'Burma rattan fotosi' : 'Моток крученого ротанга'}
                className="w-72 h-72 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {!reduceAnimations && hoveredSpool === 'spool2' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 glass-card px-4 py-3 rounded-xl border border-primary/30 min-w-[160px] text-center"
                >
                  <div className="text-xs text-primary/80 mb-2 uppercase tracking-wider">
                    {language === 'uz' ? 'Eksklyuziv' : 'Эксклюзив'}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {language === 'uz' ? ropeColors.spool2.uz : ropeColors.spool2.ru}
                  </div>
                </motion.div>
              )}
            </motion.div>
            
            {/* Второй план */}

            {/* Второй план слева - Классический коричнвый */}
            <motion.div
              className="absolute cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                y: 40,
                x: -200,
                zIndex: 5
              }}
              onHoverStart={reduceAnimations ? undefined : () => setHoveredSpool('spool1')}
              onHoverEnd={reduceAnimations ? undefined : () => setHoveredSpool(null)}
            >
              <motion.img 
                src={ropeSpool1} 
                alt={language === 'uz' ? 'Burma rattan fotosi' : 'Моток крученого ротанга'}
                className="w-56 h-56 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {!reduceAnimations && hoveredSpool === 'spool1' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-32 left-1/2 -translate-x-1/2 glass-card px-4 py-3 rounded-xl border border-primary/30 min-w-[160px] text-center"
                >
                  <div className="text-xs text-primary/80 mb-2 uppercase tracking-wider">
                    {language === 'uz' ? 'Eksklyuziv' : 'Эксклюзив'}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {language === 'uz' ? ropeColors.spool1.uz : ropeColors.spool1.ru}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Второй план справа - Песочный */}
            <motion.div
              className="absolute cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              style={{
                y: 60,
                x: 200,
                zIndex: 5
              }}
              onHoverStart={reduceAnimations ? undefined : () => setHoveredSpool('spool5')}
              onHoverEnd={reduceAnimations ? undefined : () => setHoveredSpool(null)}
            >
              <motion.img 
                src={ropeSpool5} 
                alt={language === 'uz' ? 'Burma rattan fotosi' : 'Моток крученого ротнга'}
                className="w-80 h-80 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {!reduceAnimations && hoveredSpool === 'spool5' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 glass-card px-4 py-3 rounded-xl border border-primary/30 min-w-[160px] text-center"
                >
                  <div className="text-xs text-primary/80 mb-2 uppercase tracking-wider">
                    {language === 'uz' ? 'Eksklyuziv' : 'Эксклюзив'}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {language === 'uz' ? ropeColors.spool5.uz : ropeColors.spool5.ru}
                  </div>
                </motion.div>
              )}
            </motion.div>
            
            {/* Передний план (центр) - Классический черный */}
            <motion.div
              className="absolute cursor-pointer"
              initial={{ opacity: 0, y: -100 }}
              animate={inView ? { opacity: 1, y: 30 } : { opacity: 0, y: -100 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                zIndex: 10
              }}
              onHoverStart={reduceAnimations ? undefined : () => setHoveredSpool('main')}
              onHoverEnd={reduceAnimations ? undefined : () => setHoveredSpool(null)}
            >
              <motion.img 
                src={ropeSpool} 
                alt={language === 'uz' ? 'Burma rattan fotosi' : 'Моток крученого ротанга'}
                className="w-80 h-80 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {!reduceAnimations && hoveredSpool === 'main' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-24 left-1/2 -translate-x-1/2 glass-card px-4 py-3 rounded-xl border-2 border-primary/50 min-w-[180px] text-center shadow-xl shadow-primary/20"
                >
                  <div className="text-xs text-primary/80 mb-2 uppercase tracking-wider">
                    {language === 'uz' ? 'Eksklyuziv' : 'Эксклюзив'}
                  </div>
                  <div className="font-bold text-foreground">
                    {language === 'uz' ? ropeColors.main.uz : ropeColors.main.ru}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Разделитель появляется под мотком огда он касается дна */}
            <motion.div 
              className="absolute top-full -mt-4 w-full"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <svg className="w-full mb-8" height="40" viewBox="0 0 1000 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="curvedLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="var(--primary)" stopOpacity="1" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 35 Q 250 5, 500 0 T 1000 35"
                  stroke="url(#curvedLineGradient)"
                  strokeWidth="2"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              
              <div className="grid grid-cols-3 gap-8 px-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">10+</div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'uz' ? 'Yillik kafolat' : 'Лет гарантии'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'uz' ? 'Ekologik xavfsiz' : 'Экологично'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">UV</div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'uz' ? 'Himoyalangan' : 'Защищено'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Текстовый бок */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="glass-card p-8 md:p-12 rounded-3xl border border-primary/20">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
              {language === 'uz'
                ? 'Nima uchun burma rattan?'
                : 'Почему крученый ротанг?'}
            </h3>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                {language === 'uz'
                  ? 'Burma rattan - bu zamonaviy material bo\'lib, u to\'qilgan mebellar, kashpo, savatlar va ichki bezak elementlarini ishlab chiqarishda qo\'llaniladi. Tashqi ko\'rinishida u chiroyli o\'ralgan ip kabi bo\'lib, relyefli teksturaga ega. Shu tufayli buyumlar ta\'sirchan, ozoda va oddiy tekis rattanga nisbatan "premium" ko\'rinishga ega.'
                  : 'Кручёный ротанг — это современный материал, который используют в производстве плетёной мебели, кашпо, корзин и элеентов интерьера. По внешнему виду он напоминает аккуратно закрученную нить с рельефной фактурой, благодаря чему изделия выглядят выразительно, аккуратно и «премиальнее» обычного плоского ротанга.'}
              </p>

              <div>
                <h4 className="font-semibold text-foreground mb-4">
                  {language === 'uz'
                    ? 'Nima uchun aynan burma rattanni tanlashadi:'
                    : 'Почему выбирают менно кручёный ротанг:'}
                </h4>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>
                      {language === 'uz'
                        ? 'to\'g\'ridan-to\'g\'ri quyosh nurida ham rangini saqlaydi'
                        : 'сохраняет цвет даже под прямым солнем'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>
                      {language === 'uz'
                        ? 'yomg\'ir va nam tozalashdan qo\'rqmaydi'
                        : 'не боится дождя и влажной уборки'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>
                      {language === 'uz'
                        ? 'yirtilmaydi va qatlamlanmaydi'
                        : 'не рвётся и не расслаивается'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>
                      {language === 'uz'
                        ? 'o\'rash tufayli ozoda va hajmli ko\'rinadi'
                        : 'выглядит аккуратно и объёмно за счёт скрутки'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>
                      {language === 'uz'
                        ? 'mebellar, kashpo, savatlar va dekorativ elementlar uchun mos keladi'
                        : 'подходит для мебели, кашпо, корзин и декоативных элементов'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Галерея мебели из крученого ротана */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-foreground text-center">
              {language === 'uz'
                ? 'Burma rattandan yasalgan mebellar'
                : 'Мебель из крученого ротанга'}
            </h3>
            
            <div className="grid grid-cols-6 grid-rows-2 gap-4 h-[500px]">
              {/* Левый верхний - Стелаж */}
              <motion.div 
                className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer"
                whileHover={reduceAnimations ? undefined : { scale: 1.02 }}
                transition={{ duration: 0.3 }}
                onClick={() => setLightboxImage({ 
                  src: furnitureShelf, 
                  alt: language === 'uz' ? 'Rattan shkaf' : 'Ротанговый шкаф' 
                })}
              >
                <ImageWithFallback
                  src={furnitureShelf}
                  alt={language === 'uz' ? 'Rattan shkaf' : 'Ротанговый шкаф'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>

              {/* Центр большой - Обеденная зона */}
              <motion.div 
                className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer"
                whileHover={reduceAnimations ? undefined : { scale: 1.02 }}
                transition={{ duration: 0.3 }}
                onClick={() => setLightboxImage({ 
                  src: furnitureCenter, 
                  alt: language === 'uz' ? 'Rattan ovqatlanish stoli' : 'Обеденный стол из ротанга' 
                })}
              >
                <ImageWithFallback
                  src={furnitureCenter}
                  alt={language === 'uz' ? 'Rattan ovqatlanish stoli' : 'Обеденны стол из ротанга'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <span className="text-foreground font-semibold text-lg">
                    {language === 'uz' ? 'Ovqatlanish zonasi' : 'Обеденная зона'}
                  </span>
                </div>
              </motion.div>

              {/* Правый верхний - Комод */}
              <motion.div 
                className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer"
                whileHover={reduceAnimations ? undefined : { scale: 1.02 }}
                transition={{ duration: 0.3 }}
                onClick={() => setLightboxImage({ 
                  src: furnitureChair2, 
                  alt: language === 'uz' ? 'Rattan kreslo' : 'Кресло из ротанга' 
                })}
              >
                <ImageWithFallback
                  src={furnitureChair2}
                  alt={language === 'uz' ? 'Rattan kreslo' : 'Кресло из ротанга'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>

              {/* Левый нижний - Кресло */}
              <motion.div 
                className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer"
                whileHover={reduceAnimations ? undefined : { scale: 1.02 }}
                transition={{ duration: 0.3 }}
                onClick={() => setLightboxImage({ 
                  src: furnitureDresser, 
                  alt: language === 'uz' ? 'Rattan mebel' : 'Комод с ротангом' 
                })}
              >
                <ImageWithFallback
                  src={furnitureDresser}
                  alt={language === 'uz' ? 'Rattan mebel' : 'Комод с ротангом'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>

              {/* Правый нижний - Столовая */}
              <motion.div 
                className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer"
                whileHover={reduceAnimations ? undefined : { scale: 1.02 }}
                transition={{ duration: 0.3 }}
                onClick={() => setLightboxImage({ 
                  src: furnitureChair, 
                  alt: language === 'uz' ? 'Rattan kreslo' : 'Кресло из ротанга' 
                })}
              >
                <ImageWithFallback
                  src={furnitureChair}
                  alt={language === 'uz' ? 'Rattan kreslo' : 'Кресло из ротанга'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </div>
          </motion.div>

          {/* Инструкция по использованию */}
          <div className="glass-card p-8 md:p-12 rounded-3xl border border-primary/20 mt-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">
              {language === 'uz'
                ? 'Burma sun\'iy rattanni qanday ishlatish kerak'
                : 'Как использовать кручёный искусственный ротанг'}
            </h3>
            
            <div className="space-y-6">
              {/* Шаг 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                  <span className="font-bold text-primary">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">
                    {language === 'uz' ? 'Asosni tayyorlang' : 'Подготовьте основу'}
                  </h4>
                  <p className="text-muted-foreground">
                    {language === 'uz'
                      ? 'Mebellar, kashpo yoki savatlar uchun mustahkam asos kerak: metall, plastik yoki yog\'och karkas. Rattan asosning ustiga o\'raladi.'
                      : 'Для мебели, кашпо или корзин нужна прочная база: металический, пластиковый или деревянный каркас. Ротанг плетётся поверх основы.'}
                  </p>
                </div>
              </div>

              {/* Шаг 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                  <span className="font-bold text-primary">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">
                    {language === 'uz' ? 'Kerakli uzunlikni kesing' : 'Нарежьте нужную длину'}
                  </h4>
                  <p className="text-muted-foreground">
                    {language === 'uz'
                      ? 'Materialni qaychi yoki qisqich bilan osongina kesish mumkin. Kesishdan keyin tolalar tarqalmaydi va parchalanmaydi.'
                      : 'Материал легко режется ножницами или кусачками. После реза не махрится и не распадается.'}
                  </p>
                </div>
              </div>

              {/* Шаг 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                  <span className="font-bold text-primary">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">
                    {language === 'uz' ? 'Birinchi uchini mahkamlang' : 'Закрепите первый край'}
                  </h4>
                  <p className="text-muted-foreground">
                    {language === 'uz'
                      ? 'Bog\'lovchi, shayba bilan vint yoki mebel stepleri ishlatish mumkin. Stepler mebel o\'rashda qulay  skripslarni karkasning ichki tomoniga qo\'ying, shunda ular ko\'rinmaydi.'
                      : 'Можно использовать стяжку, саморез с шайбой или мебельный степлер. Степлер удобен при плетении мебели — скобы ставьте с внутренней стороны каркаса, чтобы их не было видно.'}
                  </p>
                </div>
              </div>

              {/* Шаг 4 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                  <span className="font-bold text-primary">4</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">
                    {language === 'uz' ? 'O\'rishni boshlang' : 'Начните плетение'}
                  </h4>
                  <p className="text-muted-foreground">
                    {language === 'uz'
                      ? 'Turli xil sxemalar mos keladi: to\'g\'ri, xoch shaklida, diagonal. O\'rash o\'zi-o\'zidan ozoda tekstura yaratadi.'
                      : 'Подойдут разные схемы: прямое, крестовое, диагональное. Скрутка сама создаёт аккуратную текстуру.'}
                  </p>
                </div>
              </div>

              {/* Шаг 5 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                  <span className="font-bold text-primary">5</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">
                    {language === 'uz' ? 'Aylanalarni bir xilda torting' : 'Подтягивайте витки равномерно'}
                  </h4>
                  <p className="text-muted-foreground">
                    {language === 'uz'
                      ? 'Rattan shaklni yaxshi ushlab turadi, shuning uchun tajribasiz ham o\'rash tekis chiqadi.'
                      : 'Ротанг хорошо держит форму, поэтому плетение получается ровным даже без опыта.'}
                  </p>
                </div>
              </div>

              {/* Шаг 6 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                  <span className="font-bold text-primary">6</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">
                    {language === 'uz' ? 'Oxirini mahkamlang' : 'Закрепите конец'}
                  </h4>
                  <p className="text-muted-foreground">
                    {language === 'uz'
                      ? 'Rattanning uchini ichkariga bukib, xuddi shunday usulda mahkamlang: bog\'lovchi, stepler yoki vint bilan. Xohlaganingizda chiroyli ko\'rinish uchun bir tomchi yelim qo\'shishingiz mumkin.'
                      : 'Конец ротанга загибают внутрь и фиксируют тем же способом: стяжкой, степлером или саморезом. При елании можно добавить каплю клея для аккуратности.'}
                  </p>
                </div>
              </div>

              {/* Шаг 7 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                  <span className="font-bold text-primary">7</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">
                    {language === 'uz' ? 'Tayyor mahsulotni darhol ishlatish mumkin' : 'Готовое изделие можно сразу использовать'}
                  </h4>
                  <p className="text-muted-foreground">
                    {language === 'uz'
                      ? 'Material quyosh, namlik va harorat o\'zgarishlaridan qo\'rqmaydi — uy va ko\'cha uchun mos keladi.'
                      : 'Материал не боится солнца, влаги и перепадов температуры — подходит для дма и улицы.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Lightbox модальное окно */}
      {lightboxImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-lg p-4"
          onClick={() => setLightboxImage(null)}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 md:top-8 md:right-8 w-12 h-12 rounded-full glass-card border border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-colors z-10"
            aria-label={language === 'uz' ? 'Yopish' : 'Закрыть'}
          >
            <X className="w-6 h-6 text-foreground" />
          </button>

          {/* Изображение */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageWithFallback
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl shadow-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}