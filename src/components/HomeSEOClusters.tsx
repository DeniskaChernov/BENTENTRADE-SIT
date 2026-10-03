import { memo, useMemo } from 'react';
import { useLanguage } from '../utils/language-context';

export const HomeSEOClusters = memo(function HomeSEOClusters() {
  const { language } = useLanguage();

  const content = useMemo(() => {
    if (language === 'uz') {
      return {
        title: 'Rattan ip va kashpo: Bententrade ekspert yo\'riqnomasi',
        body: 'Biz rattan ip va to\'qilgan kashpo bo\'yicha ishlab chiqaruvchi sifatida ulgurji va chakana buyurtmalarni qabul qilamiz. Katalogda 5 turdagi profil, 18 rang va turli hajmdagi kashpolar mavjud.',
        links: [
          { href: '/catalog', text: 'To\'liq katalog' },
          { href: '/catalog', text: 'Rattan ip bo\'limi' },
          { href: '/catalog', text: 'Kashpo bo\'limi' },
        ],
        faq: [
          { q: 'Rattan ipning minimal buyurtmasi qancha?', a: 'Minimal buyurtma 5 kg.' },
          { q: 'Kashpo qaysi hajmlarda mavjud?', a: 'Asosiy variantlar: 5 litr, 10 litr, 16 litr.' },
        ],
      };
    }

    return {
      title: 'Ротанговая нить и кашпо: экспертный гид от Bententrade',
      body: 'Bententrade производит искусственную ротанговую нить и плетеные кашпо в Ташкенте. В каталоге представлены профили для разных техник плетения, 18 цветов, модели кашпо 5л, 10л и 16л для дома и бизнеса.',
      links: [
        { href: '/catalog', text: 'Смотреть весь каталог' },
        { href: '/catalog', text: 'Раздел ротанговой нити' },
        { href: '/catalog', text: 'Раздел кашпо' },
      ],
      faq: [
        { q: 'Где купить ротанговую нить в Ташкенте?', a: 'В Bententrade: доступна розница и опт с доставкой по Узбекистану.' },
        { q: 'Какая минимальная партия ротанга?', a: 'Минимальный заказ ротанговой нити — от 5 кг.' },
        { q: 'Какие размеры кашпо доступны?', a: 'Основные размеры: 5л, 10л и 16л.' },
      ],
    };
  }, [language]);

  const faqSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: content.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    }),
    [content]
  );

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="glass-card rounded-3xl border border-primary/10 p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-grotesk text-gradient mb-4">{content.title}</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">{content.body}</p>
          <div className="flex flex-wrap gap-3 mb-8">
            {content.links.map((link) => (
              <a key={link.text} href={link.href} className="text-sm text-primary hover:underline">
                {link.text}
              </a>
            ))}
          </div>
          <h3 className="text-xl font-semibold mb-4">
            {language === 'uz' ? 'Ko\'p so\'raladigan savollar' : 'Часто задаваемые вопросы'}
          </h3>
          <div className="space-y-3">
            {content.faq.map((item) => (
              <details key={item.q} className="glass-effect rounded-xl p-4 border border-primary/10">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </section>
  );
});
