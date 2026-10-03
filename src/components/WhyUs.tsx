import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer@9.13.1';
import { Factory, Shield, Users, Truck } from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';

export function WhyUs() {
  const { t, language } = useLanguage();
  const { ref, inView } = useInView({
    threshold: 0.12,
    triggerOnce: true,
  });

  const reasons = [
    {
      icon: Factory,
      title: t.manufacturer,
      description: t.manufacturerDesc,
    },
    {
      icon: Shield,
      title: t.quality,
      description: t.qualityDesc,
    },
    {
      icon: Users,
      title: language === 'uz' ? 'Ulgurji va chakana' : 'Опт и розница',
      description:
        language === 'uz' ? 'Har qanday hajmlar bilan ishlaymiz' : 'Работаем с любыми объёмами',
    },
    {
      icon: Truck,
      title: t.delivery,
      description: t.deliveryDesc,
    },
  ];

  const eyebrow =
    language === 'uz' ? 'Afzalliklar' : language === 'en' ? 'Why choose us' : 'Преимущества';

  return (
    <section id="why-us" className="section-y surface-band relative scroll-mt-24">
      <div className="section-inset-wide relative z-10" ref={ref}>
        <header className="mx-auto mb-14 max-w-3xl text-center md:mb-20">
          <p className="section-eyebrow">{eyebrow}</p>
          <h2 className="section-head text-balance">{t.whyUsTitle}</h2>
          <p className="section-desc mx-auto text-balance">
            {language === 'uz'
              ? 'Ishlab chiqaruvchi sifatida shaffof narxlar, barqaror ranglar va qulay yetkazib berish.'
              : language === 'en'
                ? 'Manufacturer-direct quality, stable colours, and delivery you can plan around.'
                : 'Как производитель — прозрачные условия, стабильные цвета и доставка без сюрпризов.'}
          </p>
          <div className="section-divider" aria-hidden />
        </header>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {reasons.map((reason, index) => (
            <motion.article
              key={reason.title}
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: index * 0.07 }}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-md md:p-7"
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                aria-hidden
              >
                <reason.icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="mb-2 font-grotesk text-lg font-semibold leading-snug tracking-tight text-foreground">
                {reason.title}
              </h3>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
                {reason.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
