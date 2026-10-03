import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer@9.13.1';
import { useLanguage } from '../utils/language-context';
import { Package, Palette, ShoppingBag, TrendingUp } from '../utils/lucide-stub';

export function SEOContent() {
  const { language } = useLanguage();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  if (language === 'uz') return null; // Показываем только на русском для SEO

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto px-4" style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0
      }}>
        <div className="max-w-6xl mx-auto">
          {/* Основной заголовок */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
              Ротанговая нить и плетеные кашпо в Ташкенте
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Производство и продажа искусственной ротанговой нити премиум-качества и плетеных кашпо ручной работы. 
              Широкий выбор типов плетения, размеров и цветов для создания уникальных изделий.
            </p>
          </motion.div>

          {/* Основной контент с ключевыми словами */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Ротанговая нить */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-8 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Искусственная ротанговая нить</h3>
              </div>
              
              <p className="text-lg mb-4 leading-relaxed">
                <strong>Купить ротанговую нить в Ташкенте</strong> высокого качества теперь легко! 
                ы предлагаем <strong>синтетический ротанг</strong> собственного производства по доступной цене - 
                всего <strong>36 000 сум за килограмм</strong>.
              </p>

              <p className="mb-4 leading-relaxed">
                Наша <strong>мебельная нить</strong> идеально подходит для плетения кашпо, корзин, мебели и других изделий. 
                Доступны <strong>5 типов ротанга</strong>:
              </p>

              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Ротанг полусфера</strong> - универсальный тип для большинства изделий</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Ротанг сфера</strong> - круглое сечение для классического плетения</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Ротанг плоский</strong> - для декоративных элементов и узоров</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Ротанг полумесяц</strong> - специальная форма для объемного плетения</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Ротанг трубка</strong> - полая нить для легких конструкций</span>
                </li>
              </ul>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-sm">
                  <strong className="text-primary">Важно:</strong> Минимальная покупка ротанговой нити - от 5 кг. 
                  Доступна <strong>оптовая продажа ротанга</strong> с дополнительными скидками при заказе от 50 кг.
                </p>
              </div>
            </motion.div>

            {/* Плетеные кашпо */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-card p-8 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Плетеные кашпо ручной работы</h3>
              </div>
              
              <p className="text-lg mb-4 leading-relaxed">
                <strong>Купить кашпо в Ташкенте</strong> напрямую от производителя! 
                Все наши <strong>кашпо из ротанга</strong> изготавливаются вручную опытными мастерами 
                с соблюдением всех стандартов качества.
              </p>

              <p className="mb-4 leading-relaxed">
                Пред��агаем <strong>плетеные кашпо</strong> различных размеров и стилей плетения:
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                  <div>
                    <strong>Кашпо классика 5л</strong> с ручкой<br/>
                    <span className="text-sm text-muted-foreground">Идеально для небольших растений</span>
                  </div>
                  <strong className="text-primary">120 000 сум</strong>
                </div>

                <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                  <div>
                    <strong>Кашпо классика 10л</strong><br/>
                    <span className="text-sm text-muted-foreground">Средний размер, универсальное</span>
                  </div>
                  <strong className="text-primary">187 000 сум</strong>
                </div>

                <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                  <div>
                    <strong>Кашпо классика 16л</strong><br/>
                    <span className="text-sm text-muted-foreground">Большой объем для крупных растений</span>
                  </div>
                  <strong className="text-primary">245 000 сум</strong>
                </div>

                <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                  <div>
                    <strong>Кашпо пухляш 10л</strong><br/>
                    <span className="text-sm text-muted-foreground">Объемное плетение</span>
                  </div>
                  <strong className="text-primary">187 000 сум</strong>
                </div>

                <div className="flex justify-between items-center pb-2">
                  <div>
                    <strong>Кашпо ромбик 10л</strong><br/>
                    <span className="text-sm text-muted-foreground">Декоративный узор ромбами</span>
                  </div>
                  <strong className="text-primary">187 000 сум</strong>
                </div>
              </div>

              <div className="bg-green-400/5 border border-green-400/20 rounded-xl p-4">
                <p className="text-sm text-green-400">
                  <strong>Бонус:</strong> При заказе от 10 кашпо - скидка 10%! 
                  Доставка по Ташкенту бесплатно при заказе от 500 000 сум.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Цвета */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card p-8 rounded-2xl mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Palette className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">18 цветов ротанга и кашпо</h3>
            </div>

            <p className="text-lg mb-6 leading-relaxed">
              Наша уникальная <strong>палитра из 18 цветов</strong> позволяет создавать изделия на любой вкус. 
              Все цвета доступны как для <strong>ротанговой нити</strong>, так и для готовых <strong>плетеных кашпо</strong>.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {[
                'Белый', 'Бежевый', 'Крем', 'Капучино', 'Коричневый', 'Шоколад',
                'Терракота', 'Красный', 'Бордо', 'Малиновый', 'Лаванда', 'Серый',
                'Графит', 'Чёрный', 'Голубой', 'Изумруд', 'Оливковый', 'Черный с золотом'
              ].map((color, i) => (
                <div key={color} className="text-center p-3 glass-effect rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
                  <span className="text-sm">{color}</span>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground">
              <strong>Эксклюзив:</strong> Цвет "Черный с золотыми наплывами" - наша фирменная разработка, 
              создающая эффект роскоши и премиальности. Идеально для современных интерьеров.
            </p>
          </motion.div>

          {/* Преимущества */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-3xl font-bold mb-8 text-center">
              Почему стоит купить ротанг и кашпо в Bententrade?
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: '🏭',
                  title: 'Прямой производитель',
                  text: 'Работаем без посредников, поэтому предлагаем лучшие цены на ротанговую нить в Ташкенте'
                },
                {
                  icon: '✨',
                  title: 'Высокое качество',
                  text: 'Используем только проверенное сырье. Каждый метр ротанга проходит контроль качества'
                },
                {
                  icon: '🎨',
                  title: 'Широкий выбор',
                  text: '18 цветов, 5 типов ротанга, 5 моделей кашпо. Возможность индивидуал��ного заказа'
                },
                {
                  icon: '🚚',
                  title: 'Доставка по Узбекистану',
                  text: 'Быстрая доставка в любой город: Ташкент, Самарканд, Бухара, Фергана и другие'
                }
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                  className="text-center p-6 glass-card rounded-xl border border-primary/10"
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Призыв к действию */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-16 text-center glass-card p-8 rounded-2xl border-2 border-primary/20"
          >
            <h3 className="text-2xl font-bold mb-4">
              Готовы заказать ротанг или кашпо?
            </h3>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Свяжитесь с нами по телефону <a href="tel:+998771044422" className="text-primary font-bold hover:underline">+998 77 104 44 22</a> или 
              через Telegram <a href="https://t.me/BenTenTrade" className="text-primary font-bold hover:underline" target="_blank" rel="noopener">@BenTenTrade</a>. 
              Наши специалисты помогут подобрать нужный тип ротанга, рассчитать количество материала и оформить заказ.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span>⏰ Режим работы: Пн-Сб 9:00-18:00</span>
              <span>📍 Город: Ташкент, Узбекистан</span>
              <span>💳 Оплата: нал/безнал</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}