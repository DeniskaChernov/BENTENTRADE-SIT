import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer@9.13.1';
import { useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Award, Users, Truck, Phone } from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';
import aboutImage from '@/assets/4a325745d14bda219a7c6548cbb5b9e9b8c0bd41.webp'; // ✅ Новое изображение для секции About

export function About() {
  const { t, language } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Award,
      title: language === 'uz' ? 'Premium sifat' : 'Премиум качество',
      description: language === 'uz' 
        ? 'Yuqori sifatli sun\'iy rattan ipdan tayyorlangan'
        : 'Изготовлено из высококачественной искусственной ротанговой нити'
    },
    {
      icon: Users,
      title: language === 'uz' ? '500+ mijoz' : '500+ клиентов',
      description: language === 'uz' 
        ? 'Bizning mahsulotlarimizdan mamnun mijozlar'
        : 'Довольных клиентов используют наши товары'
    },
    {
      icon: Truck,
      title: language === 'uz' ? 'Tez yetkazish' : 'Быстрая доставка',
      description: language === 'uz' 
        ? 'O\'zbekiston bo\'ylab tez va xavfsiz yetkazish'
        : 'Быстрая и безопасная доставка по Узбекистану'
    }
  ];

  const scrollToContact = () => {
    const element = document.getElementById('contacts');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="about" className="section-y relative scroll-mt-24 overflow-hidden border-b border-border">
      <div className="section-inset-wide">
        <div ref={ref} className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="mb-14 text-center md:mb-20"
          >
            <p className="section-eyebrow">
              {language === 'uz' ? 'Kompaniya' : language === 'en' ? 'About' : 'О компании'}
            </p>
            <h2 className="section-head mx-auto max-w-3xl text-balance">
              {language === 'uz'
                ? 'Bententrade — sifat va ishonch'
                : language === 'en'
                  ? 'Bententrade — quality you can trust'
                  : 'Bententrade — качество и доверие'}
            </h2>
            <p className="section-desc mx-auto text-balance">
              {language === 'uz'
                ? 'Biz 3 yildan ortiq vaqtdan beri yuqori sifatli sun\'iy rattan ip va pletilgan koshpo ishlab chiqaramiz. Maqsadimiz — har bir mijozga eng yaxshi mahsulot va xizmat.'
                : language === 'en'
                  ? 'For over three years we have crafted artificial rattan thread and woven planters. Our goal is the best product and service for every customer.'
                  : 'Более трёх лет производим искусственную ротанговую нить и плетёные кашпо. Цель — лучший продукт и сервис для каждого клиента.'}
            </p>
            <div className="section-divider" aria-hidden />
          </motion.div>

          {/* Content Grid */}
          <div className="mb-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left - Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <div className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border bg-card shadow-md">
                <motion.img
                  src={aboutImage}
                  alt="Плетеные изделия Bententrade"
                  className="w-full h-96 object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                
                {/* Эффект свечения при наведении */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 opacity-0 group-hover:opacity-100"
                  initial={{ opacity: 0 }}
                  whileHover={{ 
                    opacity: 1,
                    background: 'linear-gradient(135deg, rgba(212,165,116,0.1) 0%, rgba(212,165,116,0) 100%)'
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Floating badges с анимацией */}
                <motion.div
                  className="absolute top-6 left-6"
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.8,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ scale: 1.1, rotate: 3 }}
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Badge 
                      className="glass-effect border-primary/20 text-primary"
                      style={{
                        backdropFilter: 'blur(40px)',
                        WebkitBackdropFilter: 'blur(40px)',
                        background: 'rgba(245, 243, 240, 0.08)',
                        borderWidth: '1.5px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 20px rgba(212, 165, 116, 0.15)'
                      }}
                    >
                      3+ {language === 'uz' ? 'yil tajriba' : 'года опыта'}
                    </Badge>
                  </motion.div>
                </motion.div>
                
                <motion.div
                  className="absolute top-6 right-6"
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ 
                    duration: 0.6, 
                    delay: 1,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ scale: 1.1, rotate: -3 }}
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  >
                    <Badge className="glass-effect border-green-400/20 text-green-400">
                      100% {language === 'uz' ? 'sifat' : 'качество'}
                    </Badge>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-8"
            >
              <div>
                <h3 className="mb-4 font-grotesk text-2xl font-semibold tracking-tight text-foreground">
                  {language === 'uz' ? 'Nima uchun bizni tanlash kerak?' : 'Почему выбирают нас?'}
                </h3>
                <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                  {language === 'uz' 
                    ? 'Bizning mahsulotlarimiz nafaqat chiroyli, balki uzoq muddat xizmat qiladi. Har bir mahsulot alohida e\'tibor va sifat nazorati bilan tayyorlanadi.'
                    : 'Наши изделия не только красивы, но и долговечны. Каждый продукт изготавливается с особым вниманием и контролем качества.'
                  }
                </p>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { number: '500+', label: language === 'uz' ? 'Mijozlar' : 'Клиентов' },
                    { number: '100%', label: language === 'uz' ? 'Sifat' : 'Качество' }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm"
                    >
                      <div className="text-2xl font-bold text-primary mb-1">{stat.number}</div>
                      <div className="text-sm opacity-80">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                <Button
                  onClick={scrollToContact}
                  size="lg"
                  className="h-12 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 micro-interaction neon-glow"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  {language === 'uz' ? 'Bog\'lanish' : 'Связаться с нами'}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Features Grid с улучшенной анимацией */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.7 + index * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.03,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="glass-card p-6 text-center border-primary/10 relative overflow-hidden group">
                  {/* Анимированный градиент при наведении */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 opacity-0 group-hover:opacity-100"
                    initial={false}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl glass-effect flex items-center justify-center relative z-10"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6, type: "spring" }}
                  >
                    {/* Пульсирующее свечение за иконкой */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-primary/20"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                    />
                    <feature.icon className="w-8 h-8 text-primary relative z-10" />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-xl font-bold mb-3 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.9 + index * 0.15 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p 
                    className="opacity-80 leading-relaxed relative z-10"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 0.8 } : {}}
                    transition={{ delay: 1 + index * 0.15 }}
                  >
                    {feature.description}
                  </motion.p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}