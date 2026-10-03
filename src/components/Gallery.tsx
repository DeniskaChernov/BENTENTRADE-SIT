import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer@9.13.1';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight, Filter } from '../utils/lucide-stub';
import { useState } from 'react';
import { Button } from './ui/button';
import { useLanguage } from '../utils/language-context';
import galleryInterior from '@/assets/34e1e699efb1018641d9930a394dc723bdc50adb.webp'; // ✅ Новое изображение интерьера с кашпо
import galleryBalcony from '@/assets/7905d3aa42621eee5548ee5f00682ef7af0c51c3.webp'; // ✅ Три плетёных кашпо на балконе
import galleryBalconyTable from '@/assets/71bfd806bb1277b91db0ddf2bfda802015f357b8.webp'; // ✅ Лоджия-оранжерея с множеством растений в плетёных кашпо
import galleryTerrace from '@/assets/c6279dc196e639ab9117b3bd52d9643cec978332.webp'; // ✅ Садовая терраса с ротанговой мебелью на закате
import galleryOffice from '@/assets/16309b32c3ec97655ada1f9929625a07524f4a43.webp'; // ✅ Офис с плетёным кашпо
import galleryKitchen from '@/assets/2a3211d68096375b397daebf7f56a693cb94e135.webp'; // ✅ Кня с плетёным кашпо

interface GalleryProject {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'interior' | 'garden' | 'balcony' | 'office';
  tags: string[];
}

export function Gallery() {
  const { language } = useLanguage();
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  
  // Функция перевода категорий
  const getCategoryName = (categoryId: string): string => {
    const categories: {[key: string]: {ru: string; uz: string}} = {
      'all': { ru: 'Все проекты', uz: 'Barcha loyihalar' },
      'interior': { ru: 'Интерьер', uz: 'Interer' },
      'garden': { ru: 'Сад', uz: 'Bog\'' },
      'balcony': { ru: 'Балкон', uz: 'Balkon' },
      'office': { ru: 'Офис', uz: 'Ofis' }
    };
    return categories[categoryId]?.[language] || categoryId;
  };
  
  // Функция перевода тегов
  const translateTag = (tag: string): string => {
    const tags: {[key: string]: {ru: string; uz: string}} = {
      'скандинавский': { ru: 'скандинавский', uz: 'skandinav' },
      'гостиная': { ru: 'гостиная', uz: 'mehmonxona' },
      'бежевый': { ru: 'бежевый', uz: 'och jigarrang' },
      'пухляш': { ru: 'пухляш', uz: 'puffy' },
      'балкон': { ru: 'балкон', uz: 'balkon' },
      'коллекция': { ru: 'коллекция', uz: 'kolleksiya' },
      'растения': { ru: 'растения', uz: 'o\'simliklar' },
      'терраса': { ru: 'терраса', uz: 'terrasa' },
      'коричневый': { ru: 'коричневый', uz: 'jigarrang' },
      'классика': { ru: 'классика', uz: 'klassik' },
      'загородный': { ru: 'загородный', uz: 'shaxar tashqarisi' },
      'офис': { ru: 'фис', uz: 'ofis' },
      'современный': { ru: 'современный', uz: 'zamonaviy' },
      'кухня': { ru: 'кухня', uz: 'oshxona' },
      'травы': { ru: 'травы', uz: 'o\'tlar' },
      'с ручкой': { ru: 'с ручкой', uz: 'dastali' },
      'лоджия': { ru: 'лоджия', uz: 'lodzhiya' },
      'оранжерея': { ru: 'оранжерея', uz: 'issiqxona' }
    };
    return tags[tag]?.[language] || tag;
  };
  
  // Функция перевода заголовков проектов
  const getProjectTitle = (projectId: string): string => {
    const titles: {[key: string]: {ru: string; uz: string}} = {
      '1': { 
        ru: 'Уютная гостиная в скандинавском стиле',
        uz: 'Skandinav uslubidagi qulay mehmonxona'
      },
      '2': { 
        ru: 'Зелёный оазис на балконе',
        uz: 'Balkondagi yashil vohа'
      },
      '3': { 
        ru: 'Садовая терраса в загородном доме',
        uz: 'Shaxar tashqarisidagi uy terrasasi'
      },
      '4': { 
        ru: 'Современный офис с живыми растениями',
        uz: 'Jonli o\'simliklar bilan zamonaviy ofis'
      },
      '5': { 
        ru: 'Кухня с зелёным уголком',
        uz: 'Yashil burchakli oshxona'
      },
      '6': { 
        ru: 'Лоджия-оранжерея',
        uz: 'Lodzhiya-issiqxona'
      }
    };
    return titles[projectId]?.[language] || '';
  };
  
  // Функция перевода описаний проектов
  const getProjectDescription = (projectId: string): string => {
    const descriptions: {[key: string]: {ru: string; uz: string}} = {
      '1': { 
        ru: 'Кашпо 16л "Пухляш" в бежевом цвете идеально дополнили интерьер, создав атмосферу уюта и природной гармонии.',
        uz: '16l "Puffy" guldon och jigarrang rangda intererni mukammal to\'ldirdi, qulaylik va tabiiy uyg\'unlik muhitini yaratdi.'
      },
      '2': { 
        ru: 'Коллекция кашпо разных размеров создала настоящий садик на городском балконе. Использованы кашпо 10л и 16л.',
        uz: 'Turli o\'lchamdagi guldonlar kolleksiyasi shahar balkonida haqiqiy bog\' yaratdi. 10l va 16l guldonlar ishlatilgan.'
      },
      '3': { 
        ru: 'Большие кашпо 16л "Классика" в коричневом цвете стали акцентом террасы, подчеркнув естественную красоту сада.',
        uz: 'Katta 16l "Klassik" guldon jigarrang rangda terrasa uchun aksent bo\'lib, bog\'ning tabiiy go\'zalligini ta\'kidladi.'
      },
      '4': { 
        ru: 'Кашпо 10л "Классика" добавили офисному пространству живости и свежести, улучшив рабочую атмосферу.',
        uz: '10l "Klassik" guldon ofis hududiga jonlilik va yangilik qo\'shdi, ish muhitini yaxshiladi.'
      },
      '5': { 
        ru: 'Небольшие кашпо 5л с ручками в бежевом цвете создали уютный зелёный уголок на кухне, где растут свежие травы.',
        uz: 'Kichik 5l dastali guldonlar och jigarrang rangda oshxonada yangi o\'tlar o\'sadigan qulay yashil burchak yaratdi.'
      },
      '6': { 
        ru: 'Застеклённая лоджия превратилась в настоящую оранжерею благодаря кашпо "Пухляш" разных размеров.',
        uz: 'Oynali lodzhiya turli o\'lchamdagi "Puffy" guldonlar tufayli haqiqiy issiqxonaga aylandi.'
      }
    };
    return descriptions[projectId]?.[language] || '';
  };

  const projects: GalleryProject[] = [
    {
      id: '1',
      title: getProjectTitle('1'),
      description: getProjectDescription('1'),
      image: galleryInterior,
      category: 'interior',
      tags: ['скандинавский', 'гостиная', 'бежевый', 'пухляш']
    },
    {
      id: '2',
      title: getProjectTitle('2'),
      description: getProjectDescription('2'),
      image: galleryBalcony,
      category: 'balcony',
      tags: ['балкон', 'коллекция', 'растения']
    },
    {
      id: '3',
      title: getProjectTitle('3'),
      description: getProjectDescription('3'),
      image: galleryTerrace,
      category: 'garden',
      tags: ['терраса', 'коричневый', 'классика', 'загородны']
    },
    {
      id: '4',
      title: getProjectTitle('4'),
      description: getProjectDescription('4'),
      image: galleryOffice,
      category: 'office',
      tags: ['офис', 'классика', 'современный']
    },
    {
      id: '5',
      title: getProjectTitle('5'),
      description: getProjectDescription('5'),
      image: galleryKitchen,
      category: 'interior',
      tags: ['кухня', 'травы', 'с ручкой', 'бежевый']
    },
    {
      id: '6',
      title: getProjectTitle('6'),
      description: getProjectDescription('6'),
      image: galleryBalconyTable,
      category: 'balcony',
      tags: ['лоджия', 'оранжерея', 'пухляш']
    }
  ];

  const categories = [
    { id: 'all', name: getCategoryName('all') },
    { id: 'interior', name: getCategoryName('interior') },
    { id: 'garden', name: getCategoryName('garden') },
    { id: 'balcony', name: getCategoryName('balcony') },
    { id: 'office', name: getCategoryName('office') }
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

  return (
    <section id="gallery" className="section-y-compact relative scroll-mt-24 overflow-hidden border-b border-border">
      <div className="section-inset-wide relative z-10" ref={ref}>
        <header className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
          <p className="section-eyebrow">
            {language === 'uz' ? 'Portfolio' : language === 'en' ? 'Portfolio' : 'Портфолио'}
          </p>
          <motion.h2
            className="section-head text-balance"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.5 }}
          >
            {language === 'uz' ? 'Loyihalar galereyasi' : 'Галерея проектов'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="section-desc mx-auto text-balance"
          >
            {language === 'uz'
              ? 'Bizning guldonlarimiz mijozlarimizning uylari va ofislarini qanday o\'zgartirganini ko\'ring'
              : 'Посмотрите, как наши кашпо преобразили дома и офисы наших клиентов'}
          </motion.p>
          <div className="section-divider" aria-hidden />
        </header>

        {/* Сетка проектов */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                onHoverStart={() => setHoveredProject(project.id)}
                onHoverEnd={() => setHoveredProject(null)}
                className="group cursor-pointer"
              >
                <Card className="flex h-full flex-col overflow-hidden border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
                  {/* Изображение */}
                  <div className="aspect-[4/3] overflow-hidden relative rounded-t-xl">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Категория badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="!scale-100 border-0 bg-background/90 capitalize text-foreground shadow-sm backdrop-blur-sm">
                        {categories.find(c => c.id === project.category)?.name}
                      </Badge>
                    </div>
                  </div>

                  {/* Контент */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Заголовок */}
                    <h3 className="mb-3 line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                      {project.title}
                    </h3>
                    
                    {/* Описание */}
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Теги */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.slice(0, 3).map(tag => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="border-primary/30 text-xs text-primary"
                        >
                          {translateTag(tag)}
                        </Badge>
                      ))}
                    </div>

                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Кнопка "Больше проектов" */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >

        </motion.div>


      </div>
    </section>
  );
}