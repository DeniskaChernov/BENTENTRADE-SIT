import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ShoppingBag, LayoutGrid, Building } from '../utils/lucide-stub';
import { Button } from './ui/button';
import { pickLang, useLanguage } from '../utils/language-context';
import { trackEvent } from '../utils/analytics';

type PathId = 'A' | 'B' | 'C';

interface AudiencePathsSectionProps {
  onOpenFullCatalog: () => void;
  onScrollToHits: () => void;
  onScrollToQuote: () => void;
}

export function AudiencePathsSection({
  onOpenFullCatalog,
  onScrollToHits,
  onScrollToQuote,
}: AudiencePathsSectionProps) {
  const { t, language } = useLanguage();
  const reduceMotion = useReducedMotion();

  const runPath = (id: PathId, action: () => void) => {
    trackEvent('audience_path_click', { audience_path: id });
    action();
  };

  const cards: Array<{
    id: PathId;
    badge: string;
    icon: typeof ShoppingBag;
    title: string;
    body: string;
    cta: string;
    onClick: () => void;
  }> = [
    {
      id: 'A',
      badge: 'A',
      icon: ShoppingBag,
      title: t.audiencePathNewTitle,
      body: t.audiencePathNewBody,
      cta: t.audiencePathNewCta,
      onClick: () => runPath('A', onScrollToHits),
    },
    {
      id: 'B',
      badge: 'B',
      icon: LayoutGrid,
      title: t.audiencePathProTitle,
      body: t.audiencePathProBody,
      cta: t.audiencePathProCta,
      onClick: () => runPath('B', onOpenFullCatalog),
    },
    {
      id: 'C',
      badge: 'C',
      icon: Building,
      title: t.audiencePathB2BTitle,
      body: t.audiencePathB2BBody,
      cta: t.audiencePathB2BCta,
      onClick: () => runPath('C', onScrollToQuote),
    },
  ];

  return (
    <section
      id="audience-paths"
      className="section-y-compact relative border-b border-border scroll-mt-24"
      aria-labelledby="audience-paths-heading"
    >
      <div className="section-inset">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45 }}
          className="mx-auto mb-14 max-w-3xl text-center md:mb-16"
        >
          <p className="section-eyebrow">
            {pickLang(language, { uz: 'Tez yo‘l', ru: 'Быстрый старт', en: 'Quick paths' })}
          </p>
          <h2
            id="audience-paths-heading"
            className="section-head text-balance"
          >
            {t.audiencePathsTitle}
          </h2>
          <p className="section-desc mx-auto text-balance">
            {t.audiencePathsSubtitle}
          </p>
          <div className="section-divider" aria-hidden />
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3 md:gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <motion.article
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-24px' }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -6,
                      transition: { type: 'spring', stiffness: 400, damping: 22 },
                    }
              }
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              className="card-spotlight-hover group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/35"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                  aria-hidden
                >
                  {card.badge}
                </span>
                <card.icon className="w-5 h-5 text-primary/60" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold tracking-tight mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                {card.body}
              </p>
              <Button
                type="button"
                onClick={card.onClick}
                className="agency-cta-primary w-full rounded-xl text-primary-foreground hover:bg-primary/95 h-11 gap-2 micro-interaction shadow-sm"
              >
                {card.cta}
                <ArrowRight className="w-4 h-4 opacity-90" />
              </Button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
