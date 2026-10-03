import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer@9.13.1';
import { Card, CardContent } from './ui/card';
import { ChevronDown, HelpCircle, Leaf, Package, Truck, Phone } from '../utils/lucide-stub';
import { useState } from 'react';
import { useLanguage } from '../utils/language-context';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'materials' | 'products' | 'delivery';
  icon: React.ElementType;
}

export function FAQ() {
  const { language } = useLanguage();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const faqItems: FAQItem[] = [
    // Материалы
    {
      id: '1',
      question: language === 'uz' ? 'Sun\'iy rattan tabiiy rattandan nimasi bilan yaxshi?' : 'Чем искусственный ротанг лучше натурального?',
      answer: language === 'uz' ? 'Sun\'iy rattan bardoshli, namlikdan va harorat o\'zgarishlaridan qo\'rqmaydi, quyosh nurlarida rangi o\'chirmaydi va maxsus parvarishni talab qilmaydi. Shu bilan birga, u tabiiy rattanning teksturasi va tashqi ko\'rinishini to\'liq taqlid qiladi.' : 'Искусственный ротанг более долговечен, не боится влаги и температурных перепадов, не выгорает на солнце и не требует специального ухода. При этом он полностью имитирует текстуру и внешний вид натурального ротанга.',
      category: 'materials',
      icon: Leaf
    },
    {
      id: '2',
      question: language === 'uz' ? 'Sun\'iy rattan o\'simliklar uchun xavfsizmi?' : 'Безопасен ли искусственный ротанг для растений?',
      answer: language === 'uz' ? 'Ha, bizning sun\'iy rattanimiz ekologik xavfsiz materiallardan tayyorlanadi, ular zararsiz moddalar chiqarmaydi va o\'simliklar va odamlar uchun mutlaqo xavfsizdir.' : 'Да, наш искусственный ротанг изготавливается из экологически безопасных материалов, которые не выделяют вредных веществ и абсолютно безопасны для растений и людей.',
      category: 'materials',
      icon: Leaf
    },
    {
      id: '3',
      question: language === 'uz' ? 'Rattan ipida necha metr bor?' : 'Какова длина ротанговой нити в мотке?',
      answer: language === 'uz' ? '1 kg da 100 metr rattan ipi bor. Minimal buyurtma 500 metr (5 kg) dan boshlanadi. Buyurtma bo\'yicha turli hajmdagi iplar ham mavjud.' : 'В 1 кг содержится 100 метров ротанговой нити. Минимальный заказ составляет 500 метров (5 кг). Также доступны различные объёмы под заказ.',
      category: 'materials',
      icon: Leaf
    },
    
    // Товары
    {
      id: '4',
      question: language === 'uz' ? '"Klassik" va "Puffy" uslublari o\'rtasida qanday farq bor?' : 'В чём разница между стилями "Классика" и "Пухляш"?',
      answer: language === 'uz' ? '"Klassik" aniq geometrik shakllar bilan an\'anaviy to\'qishga ega, "Puffy" esa yumshoq dumaloq shakllari va hajmli to\'qishi bilan shinam ko\'rinish yaratadi.' : '"Классика" имеет традиционное плетение с чёткими геометричными формами, а "Пухляш" отличается более мягкими, округлыми формами и объёмным плетением, создающим уютный вид.',
      category: 'products',
      icon: Package
    },
    {
      id: '5',
      question: language === 'uz' ? 'To\'g\'ri hajmdagi guldonni qanday tanlash mumkin?' : 'Как выбрать правильный размер кашпо?',
      answer: language === 'uz' ? 'Kichik o\'simliklar (binafshalar, sukkulentlar) uchun 5 litrli guldon mos keladi. O\'rta xonali o\'simliklar uchun 10 litrni tanlang, katta o\'simliklar (fikuslar, palma) uchun - 16 litrli guldon.' : 'Для небольших растений (фиалки, суккуленты) подойдёт 5л кашпо. Для средних комнатных растений выбирайте 10л, а для крупных растений (фикусы, пальмы) - 16л кашпо.',
      category: 'products',
      icon: Package
    },
    {
      id: '6',
      question: language === 'uz' ? 'Guldonlarni ko\'chada ishlatish mumkinmi?' : 'Можно ли использовать кашпо на улице?',
      answer: language === 'uz' ? 'Ha, bizning guldonlar ko\'chada foydalanish uchun juda mos. Sun\'iy rattan yomg\'ir, qor va quyosh nurlaridan qo\'rqmaydi, yillar davomida o\'z tashqi ko\'rinishini saqlaydi.' : 'Да, наши кашпо отлично подходят для использования на улице. Искусственный ротанг не боится дождя, снега и солнечных лучей, сохраняя свой внешний вид годами.',
      category: 'products',
      icon: Package
    },
    
    // Доставка
    {
      id: '7',
      question: language === 'uz' ? 'Yetkazib berish muddatlari qanday?' : 'Какие у вас сроки доставки?',
      answer: language === 'uz' ? 'Toshkent bo\'ylab 1-2 kun ichida yetkazib beramiz. O\'zbekiston va MDH davlatlari bo\'ylab transport kompaniyalari orqali - hududga qarab 3-7 kun. Aniq muddatlarni buyurtma rasmiylashtirish paytida aniqlaymiz.' : 'По Ташкенту доставляем в течение 1-2 дней. По Узбекистану и странам СНГ через транспортные компании - 3-7 дней в зависимости от региона. Точные сроки уточним при оформлении заказа.',
      category: 'delivery',
      icon: Truck
    },
    {
      id: '8',
      question: language === 'uz' ? 'Hududlarga yetkazib berasizmi?' : 'Доставляете ли вы в регионы?',
      answer: language === 'uz' ? 'Ha, biz butun O\'zbekiston va MDH davlatlariga ishonchli transport kompaniyalari orqali yetkazib beramiz. Yetkazib berish narxi individual hisoblanadi.' : 'Да, мы доставляем по всему Узбекистану и странам СНГ через надёжные транспортные компании. Стоимость доставки рассчитывается индивидуально.',
      category: 'delivery',
      icon: Truck
    },
    {
      id: '9',
      question: language === 'uz' ? 'Buyurtmani o\'zim olib ketishim mumkinmi?' : 'Можно ли забрать заказ самовывозом?',
      answer: language === 'uz' ? 'Albatta! Toshkentda bizning topshirish punktimiz bor. Manzil va ish vaqtini buyurtma rasmiylashtirganingizdan keyin xabar qilamiz. O\'zi olib ketish bepul.' : 'Конечно! У нас есть пункт выдачи в Ташкенте. Адрес и время работы сообщим после оформления заказа. Самовывоз бесплатный.',
      category: 'delivery',
      icon: Truck
    }
  ];

  const categories = [
    { id: 'all', name: language === 'uz' ? 'Barcha savollar' : 'Все вопросы', icon: HelpCircle },
    { id: 'materials', name: language === 'uz' ? 'Materiallar' : 'Материалы', icon: Leaf },
    { id: 'products', name: language === 'uz' ? 'Mahsulotlar' : 'Товары', icon: Package },
    { id: 'delivery', name: language === 'uz' ? 'Yetkazib berish' : 'Доставка', icon: Truck }
  ];

  const filteredFAQ = activeCategory === 'all' 
    ? faqItems 
    : faqItems.filter(item => item.category === activeCategory);

  const toggleItem = (id: string) => {
    setActiveItem(activeItem === id ? null : id);
  };

  return (
    <section id="faq" className="section-y-compact relative scroll-mt-24 overflow-hidden border-b border-border">
      <div className="section-inset-wide relative z-10" ref={ref}>
        <header className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
          <p className="section-eyebrow">FAQ</p>
          <motion.h2
            className="section-head text-balance"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.5 }}
          >
            {language === 'uz' ? 'Ko\'p so\'raladigan savollar' : 'Часто задаваемые вопросы'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="section-desc mx-auto text-balance"
          >
            {language === 'uz'
              ? 'Mahsulotlarimiz va xizmatlarimiz haqidagi eng mashhur savollarga javoblar'
              : 'Ответы на популярные вопросы о товарах и услугах'}
          </motion.p>
          <div className="section-divider" aria-hidden />
        </header>

        {/* Фильтры по категориям */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'border-primary/40 glass-effect text-primary neon-glow'
                    : 'border-border glass-card text-muted-foreground hover:border-primary/20 hover:glass-effect hover:text-foreground'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {category.name}
              </motion.button>
            );
          })}
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {filteredFAQ.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = activeItem === item.id;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden border-border glass-card hover:glass-effect transition-all duration-300">
                      <CardContent className="p-0">
                        <motion.button
                          whileHover={{ x: 5 }}
                          onClick={() => toggleItem(item.id)}
                          className="w-full p-6 text-left flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                                <IconComponent className="w-5 h-5 text-primary group-hover:text-primary/80" />
                              </div>
                            </div>
                            <h3 className="font-medium text-base group-hover:text-primary transition-colors pr-4">
                              {item.question}
                            </h3>
                          </div>
                          
                          <motion.div
                            animate={{ rotate: isActive ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex-shrink-0"
                          >
                            <ChevronDown className="w-5 h-5 text-primary/80" />
                          </motion.div>
                        </motion.button>
                        
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6 pl-20">
                                <motion.p
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2, delay: 0.1 }}
                                  className="text-muted-foreground leading-relaxed"
                                >
                                  {item.answer}
                                </motion.p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Блок "Не нашли ответ?" */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16"
        >

        </motion.div>
      </div>
    </section>
  );
}