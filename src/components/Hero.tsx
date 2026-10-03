import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ShoppingBag, Phone, ChevronDown, Sun, Droplets, MapPin } from '../utils/lucide-stub';
import { pickLang, useLanguage } from '../utils/language-context';
import { sendQuickConsultationRequest } from '../utils/telegram';
import { ImageWithFallback } from './figma/ImageWithFallback';
import heroShowcase from '@/assets/aaa3f6c434f81fb8787b230c4e80ff40a3ff1805.webp';

interface HeroProps {
  onViewCatalog?: () => void;
}

export function Hero({ onViewCatalog }: HeroProps = {}) {
  const { t, language } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLowPowerDevice, setIsLowPowerDevice] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const reduceHeavyMotion = prefersReducedMotion || isLowPowerDevice;

  const normalizePhoneInput = (raw: string) => {
    const sanitized = raw.replace(/[^\d+]/g, '');
    const plusCount = (sanitized.match(/\+/g) || []).length;
    if (plusCount > 1) return `+${sanitized.replace(/\+/g, '')}`.slice(0, 20);
    if (sanitized.includes('+') && !sanitized.startsWith('+')) {
      return `+${sanitized.replace(/\+/g, '')}`.slice(0, 20);
    }
    return sanitized.slice(0, 20);
  };

  const formatUzbekPhone = (value: string) => {
    const raw = normalizePhoneInput(value);
    if (!raw) return '';
    let digits = raw.replace(/\D/g, '');
    if (raw.startsWith('+')) {
      if (!digits.startsWith('998')) digits = `998${digits}`;
      digits = digits.slice(0, 12);
      const cc = digits.slice(0, 3);
      const p1 = digits.slice(3, 5);
      const p2 = digits.slice(5, 8);
      const p3 = digits.slice(8, 10);
      const p4 = digits.slice(10, 12);
      return `+${cc}${p1 ? ` ${p1}` : ''}${p2 ? ` ${p2}` : ''}${p3 ? ` ${p3}` : ''}${p4 ? ` ${p4}` : ''}`;
    }
    return raw;
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    const update = () => setIsLowPowerDevice(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  const handleConsultationClick = () => {
    setShowConsultationForm(true);
  };

  const scrollToProducts = () => {
    const element = document.getElementById('catalog');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToNext = () => {
    const element = document.getElementById('catalog');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await sendQuickConsultationRequest({
        name: formData.name,
        phone: formData.phone,
        message:
          formData.message ||
          pickLang(language, {
            uz: 'Tezkor maslahat so‘rovi',
            ru: 'Запрос быстрой консультации',
            en: 'Quick consultation request',
          })
      });

      if (success) {
        // Успешная отправка
        const notification = document.createElement('div');
        notification.className = 'fixed top-6 right-6 p-4 rounded-2xl shadow-lg z-[9999] transition-all duration-500 max-w-sm glass-effect border-green-400/20 text-green-400';
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        notification.textContent = pickLang(language, {
          uz: 'Xabar yuborildi! Tez orada bog\'lanamiz.',
          ru: 'Заявка отправлена! Скоро свяжемся с вами.',
          en: 'Sent! We will contact you shortly.',
        });
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
          }
        }, 4000);

        setFormData({ name: '', phone: '', message: '' });
        setShowConsultationForm(false);
      } else {
        throw new Error('Failed to send request');
      }
    } catch (error) {
      console.error('Error sending consultation request:', error);
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-6 right-6 p-4 rounded-2xl shadow-lg z-[9999] transition-all duration-500 max-w-sm glass-effect border-red-400/20 text-red-400';
      notification.setAttribute('role', 'alert');
      notification.setAttribute('aria-live', 'assertive');
      notification.textContent = pickLang(language, {
        uz: 'Xatolik yuz berdi. Qayta urinib ko\'ring.',
        ru: 'Произошла ошибка. Попробуйте еще раз.',
        en: 'Something went wrong. Please try again.',
      });
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.transform = 'translateX(100%)';
          notification.style.opacity = '0';
          setTimeout(() => notification.remove(), 300);
        }
      }, 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative flex min-h-[min(100dvh,920px)] items-center overflow-hidden border-b border-border/60 pb-20 pt-24 md:pb-28 md:pt-28">
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ y: prefersReducedMotion ? '0%' : y }}
        >
          <div
            className="absolute -right-24 top-10 h-[min(420px,70vw)] w-[min(420px,70vw)] rounded-full opacity-45 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(13, 148, 136, 0.14) 0%, transparent 65%)' }}
          />
          <div
            className="absolute bottom-0 left-[-15%] h-[min(360px,60vw)] w-[min(360px,60vw)] rounded-full opacity-35 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 60%)' }}
          />
        </motion.div>

        <motion.div
          className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
          style={{ opacity: prefersReducedMotion ? 1 : opacity }}
        >
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-x-14">
            {/* Текст и действия */}
            <div className="order-2 text-center lg:order-1 lg:col-span-6 lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.05 }}
              >
                <motion.div
                  className="mb-6 inline-flex rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  {t.heroBadge}
                </motion.div>

                <h1 className="font-grotesk text-balance">
                  <span className="block text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[3.35rem] lg:leading-[1.02]">
                    {t.heroTitle}
                  </span>
                  <span className="mt-5 block font-montserrat text-lg font-normal leading-snug text-muted-foreground md:text-xl">
                    {t.heroSubtitle}
                  </span>
                </h1>

                <p className="mx-auto mt-6 max-w-xl text-balance font-montserrat text-base leading-relaxed text-muted-foreground md:text-lg lg:mx-0">
                  {t.heroLead}
                </p>

                <motion.div
                  className="mt-6 flex flex-wrap justify-center gap-2.5 md:gap-3 lg:justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  {[
                    {
                      icon: Sun,
                      text: t.heroTrustSun,
                      title: pickLang(language, {
                        uz: 'UV barqarorligi — rang uzoq vaqt ochilmaydi',
                        ru: 'Устойчивость к ультрафиолету — цвет держится дольше',
                        en: 'UV-stable pigments for longer-lasting colour',
                      }),
                    },
                    {
                      icon: Droplets,
                      text: t.heroTrustWater,
                      title: pickLang(language, {
                        uz: 'Nam va yomg‘irga chidamli — tashqi muhit uchun mos',
                        ru: 'Не боится влаги и дождя — подходит для улицы и террасы',
                        en: 'Moisture-resistant — fine for terraces and outdoor use',
                      }),
                    },
                    {
                      icon: MapPin,
                      text: t.heroTrustOutdoor,
                      title: pickLang(language, {
                        uz: 'Ko‘cha, bog‘ va ochiq maydonlar uchun',
                        ru: 'Для улицы, сада и открытых площадок',
                        en: 'Made for streets, gardens and open spaces',
                      }),
                    },
                  ].map(({ icon: Icon, text, title: tip }) => (
                    <motion.span
                      key={text}
                      whileHover={reduceHeavyMotion ? undefined : { y: -1 }}
                      className="trust-pill-interactive flex cursor-default items-center gap-2 rounded-full border border-border/90 bg-card/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-sm md:text-sm"
                      title={tip}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                      {text}
                    </motion.span>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
                >
                  <Button
                    onClick={onViewCatalog}
                    size="lg"
                    className="agency-cta-primary micro-interaction h-12 min-w-[220px] rounded-xl px-8 text-sm font-semibold shadow-md"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {t.heroCtaBuy}
                  </Button>
                  <Button
                    onClick={handleConsultationClick}
                    variant="outline"
                    size="lg"
                    className="micro-interaction h-12 min-w-[220px] rounded-xl border-border bg-card px-8 text-sm font-medium text-foreground shadow-sm hover:border-primary/35 hover:bg-muted/50"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    {t.getConsultation}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-12 border-t border-border/80 pt-8"
                >
                  <div className="grid grid-cols-3 gap-4 md:gap-8">
                    {[
                      {
                        number: '500+',
                        label: pickLang(language, {
                          uz: 'Mamnun mijozlar',
                          ru: 'Довольных клиентов',
                          en: 'Happy customers',
                        }),
                      },
                      {
                        number: '3+',
                        label: pickLang(language, {
                          uz: 'Yillik tajriba',
                          ru: 'Года опыта',
                          en: 'Years of craft',
                        }),
                      },
                      {
                        number: '100%',
                        label: pickLang(language, {
                          uz: 'Sifat kafolati',
                          ru: 'Гарантия качества',
                          en: 'Quality focus',
                        }),
                      },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center lg:text-left">
                        <div className="font-grotesk text-2xl font-semibold text-primary md:text-3xl">{stat.number}</div>
                        <div className="mt-1 text-[0.7rem] uppercase tracking-wider text-muted-foreground md:text-xs">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Витрина */}
            <div className="order-1 lg:order-2 lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative mx-auto max-w-lg lg:mx-0 lg:ml-auto lg:max-w-none"
              >
                <div
                  className="absolute -right-3 -top-3 h-28 w-28 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent opacity-80"
                  aria-hidden
                />
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_28px_64px_-16px_rgba(15,23,42,0.18)] ring-1 ring-border">
                  <ImageWithFallback
                    src={heroShowcase}
                    alt={pickLang(language, {
                      uz: 'Bententrade — pletёnaya kolleksiya',
                      ru: 'Bententrade — плетёная коллекция кашпо',
                      en: 'Bententrade — woven planter collection',
                    })}
                    className="h-full w-full object-cover object-center"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/15 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>
                <p className="mt-4 text-center text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground lg:text-left">
                  {pickLang(language, {
                    uz: '5l kolleksiya — batafsil katalogda',
                    ru: 'Коллекция 5л — в каталоге',
                    en: '5L collection — see catalog',
                  })}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Кнопка прокрутки с пульсацией */}
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          onClick={scrollToNext}
          aria-label={pickLang(language, {
            uz: 'Keyingi bo\'limga o\'tish',
            ru: 'Прокрутить к следующему разделу',
            en: 'Scroll to next section',
          })}
          className="group absolute left-1/2 -translate-x-1/2 transform cursor-pointer rounded-full border border-border bg-card p-3 shadow-md micro-interaction hover:border-primary/40"
          style={{ bottom: '17px' }}
          whileHover={{ y: -4, scale: 1.1 }}
          whileTap={{ y: 0, scale: 0.95 }}
        >
          {/* Пульсирующие круги */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            animate={reduceHeavyMotion ? undefined : {
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            animate={reduceHeavyMotion ? undefined : {
              scale: [1, 1.8, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          
          <motion.div
            className="relative z-10"
            animate={reduceHeavyMotion ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-primary group-hover:text-primary/80" />
          </motion.div>
        </motion.button>
      </section>

      {/* Форма консультации */}
      <Dialog open={showConsultationForm} onOpenChange={setShowConsultationForm}>
        <DialogContent className="sm:max-w-md border-border bg-card shadow-xl">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-2xl text-center">
                <span className="text-gradient">
                  {pickLang(language, {
                    uz: 'Tezkor maslahat',
                    ru: 'Быстрая консультация',
                    en: 'Quick help',
                  })}
                </span>
              </DialogTitle>
              <DialogDescription className="text-center text-base opacity-80">
                {pickLang(language, {
                  uz: 'Ma\'lumotlaringizni qoldiring, biz siz bilan bog\'lanamiz',
                  ru: 'Оставьте свои данные, и мы свяжемся с вами',
                  en: 'Leave your details and we will get back to you',
                })}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitConsultation} className="space-y-6 mt-6" aria-busy={isSubmitting}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="consultation-name" className="sr-only">
                    {pickLang(language, { uz: 'Ismingiz', ru: 'Ваше имя', en: 'Your name' })}
                  </label>
                  <Input
                    id="consultation-name"
                    type="text"
                    placeholder={pickLang(language, { uz: 'Ismingiz', ru: 'Ваше имя', en: 'Your name' })}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    autoComplete="name"
                    disabled={isSubmitting}
                    className="h-12 rounded-xl border border-border bg-background"
                  />
                </div>
                
                <div>
                  <label htmlFor="consultation-phone" className="sr-only">
                    {pickLang(language, { uz: 'Telefon raqami', ru: 'Номер телефона', en: 'Phone number' })}
                  </label>
                  <Input
                    id="consultation-phone"
                    type="tel"
                    placeholder={pickLang(language, { uz: 'Telefon raqami', ru: 'Номер телефона', en: 'Phone number' })}
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: normalizePhoneInput(e.target.value) }))}
                    onFocus={() => {
                      setFormData((prev) => ({
                        ...prev,
                        phone: prev.phone.trim() ? prev.phone : '+998 ',
                      }));
                    }}
                    onBlur={(e) => setFormData(prev => ({ ...prev, phone: formatUzbekPhone(e.target.value).trim() }))}
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    pattern="^\+?[0-9\s\-()]{9,20}$"
                    minLength={9}
                    title={pickLang(language, {
                      uz: 'To\'g\'ri telefon raqamini kiriting',
                      ru: 'Введите корректный номер телефона',
                      en: 'Enter a valid phone number',
                    })}
                    disabled={isSubmitting}
                    className="h-12 rounded-xl border border-border bg-background"
                  />
                </div>
                
                <div>
                  <label htmlFor="consultation-message" className="sr-only">
                    {pickLang(language, {
                      uz: 'Qo\'shimcha xabar',
                      ru: 'Дополнительное сообщение',
                      en: 'Optional message',
                    })}
                  </label>
                  <Textarea
                    id="consultation-message"
                    placeholder={pickLang(language, {
                      uz: 'Qo\'shimcha xabar (ixtiyoriy)',
                      ru: 'Дополнительное сообщение (необязательно)',
                      en: 'Optional message',
                    })}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    autoComplete="off"
                    disabled={isSubmitting}
                    className="rounded-xl border border-border bg-background"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConsultationForm(false)}
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl glass-card border-primary/20 hover:border-primary/40 micro-interaction"
                >
                  {pickLang(language, { uz: 'Bekor qilish', ru: 'Отмена', en: 'Cancel' })}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.phone}
                  className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 micro-interaction shadow-md"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="sr-only">
                        {pickLang(language, { uz: 'Yuborilmoqda...', ru: 'Отправка...', en: 'Sending...' })}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      {t.send}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}