import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer@9.13.1';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Star, Quote } from '../utils/lucide-stub';

export function Reviews() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  
  const reviews = [
    {
      name: 'Дониёр Шакиров',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      text: 'Нить самого лучшего качества',
      rating: 5,
      role: 'Владелец мебельной фабрики'
    },
    {
      name: 'Рустам Каримов',
      avatar: '',
      text: 'Кашпо превосходного качества, быстрая доставка. Рекомендую для оптовых закупок! Клиенты всегда довольны.',
      rating: 5,
      role: 'Владелец цветочного магазина'
    },
    {
      name: 'Малика Ахмедова',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      text: 'Заказывала кашпо для своего бизнеса. Качество превосходное, цены адекватные. Очень рекомендую!',
      rating: 5,
      role: 'Предприниматель'
    }
  ];

  return (
    <section className="section-y-compact relative overflow-hidden border-b border-border bg-muted/20">
      <div className="section-inset-wide relative z-10" ref={ref}>
        <header className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
          <p className="section-eyebrow">Отзывы</p>
          <motion.h2
            className="section-head text-balance"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.5 }}
          >
            Отзывы клиентов
          </motion.h2>
          <p className="section-desc mx-auto text-balance">
            Реальный опыт тех, кто уже заказывал ротанг и кашпо Bententrade.
          </p>
          <div className="section-divider" aria-hidden />
        </header>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.15,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -12, 
                scale: 1.03,
                transition: { duration: 0.3 }
              }}
              className="group"
            >
              <Card className="h-full border-border glass-card hover:glass-effect transition-all duration-300 relative overflow-hidden">
                {/* Анимированный фон при наведении */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 opacity-0 group-hover:opacity-100"
                  initial={false}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Декоративная кавычка с анимацией */}
                <motion.div 
                  className="absolute top-4 right-4 text-primary/60"
                  initial={{ rotate: -20, opacity: 0 }}
                  animate={inView ? { rotate: 0, opacity: 0.6 } : { rotate: -20, opacity: 0 }}
                  transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
                  whileHover={{ 
                    rotate: 15, 
                    scale: 1.2,
                    opacity: 1,
                    transition: { duration: 0.3 }
                  }}
                >
                  <Quote className="w-6 h-6" />
                </motion.div>
                
                <CardContent className="p-6">
                  {/* Рейтинг сверху с анимацией */}
                  <div className="flex items-center gap-1 mb-4 relative z-10">
                    {[...Array(review.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0, rotate: -180 }}
                        transition={{ 
                          delay: index * 0.15 + i * 0.05, 
                          duration: 0.5,
                          type: "spring",
                          stiffness: 200
                        }}
                        whileHover={{ 
                          scale: 1.3, 
                          rotate: 360,
                          transition: { duration: 0.3 }
                        }}
                      >
                        <Star 
                          className="w-4 h-4 fill-primary text-primary" 
                        />
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Текст отзыва */}
                  <blockquote className="text-muted-foreground leading-relaxed mb-6 text-sm">
                    "{review.text}"
                  </blockquote>
                  
                  {/* Автор внизу */}
                  <div className="flex items-center">
                    <Avatar className="w-10 h-10 mr-3 ring-1 ring-border">
                      <AvatarImage src={review.avatar} alt={review.name} className="object-cover" />
                      <AvatarFallback className="glass-card text-primary text-sm">
                        {review.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="font-medium text-sm text-foreground">
                        {review.name}
                      </div>
                      <div className="text-xs text-primary/80">
                        {review.role}
                      </div>
                    </div>
                  </div>
                  
                  {/* Декоративная линия */}
                  <div className="mt-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}