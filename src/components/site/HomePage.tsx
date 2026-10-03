import { Suspense, lazy, type RefObject } from 'react';
import { Hero } from '../Hero';
import { AudiencePathsSection } from '../AudiencePathsSection';
import { RattanQuizSection } from '../RattanQuizSection';
import { ErrorBoundary } from '../ErrorBoundary';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Button } from '../ui/button';
import type { Product, ColorVariant } from '../../utils/useProducts';

const Gallery = lazy(() =>
  import('../Gallery')
    .then((m) => ({ default: m.Gallery }))
    .catch(() => ({ default: () => <div className="p-8 text-center text-muted-foreground">Галерея временно недоступна</div> })),
);
const Trend2025 = lazy(() =>
  import('../Trend2025')
    .then((m) => ({ default: m.Trend2025 }))
    .catch(() => ({ default: () => <div className="p-8 text-center text-muted-foreground">Раздел временно недоступен</div> })),
);
const About = lazy(() => import('../About').then((m) => ({ default: m.About })));
const MiniCatalog = lazy(() => import('../MiniCatalog').then((m) => ({ default: m.MiniCatalog })));
const WhyUs = lazy(() => import('../WhyUs').then((m) => ({ default: m.WhyUs })));
const FAQ = lazy(() => import('../FAQ').then((m) => ({ default: m.FAQ })));
const Reviews = lazy(() => import('../Reviews').then((m) => ({ default: m.Reviews })));
const Contacts = lazy(() => import('../Contacts').then((m) => ({ default: m.Contacts })));
const BlogSection = lazy(() => import('../BlogSection').then((m) => ({ default: m.BlogSection })));
const SEOContent = lazy(() => import('../SEOContent').then((m) => ({ default: m.SEOContent })));
const HomeSEOClusters = lazy(() => import('../HomeSEOClusters').then((m) => ({ default: m.HomeSEOClusters })));

const LazyLoadError = ({ error }: { error?: Error }) => (
  <div className="flex min-h-64 items-center justify-center p-8">
    <div className="glass-card max-w-md rounded-2xl p-8 text-center">
      <p className="mb-2 text-muted-foreground">Блок временно недоступен</p>
      <p className="mb-4 text-xs text-muted-foreground/70">{error?.message}</p>
      <Button type="button" variant="outline" size="sm" onClick={() => window.location.reload()}>
        Обновить страницу
      </Button>
    </div>
  </div>
);

export interface HomePageProps {
  trendTriggerRef: RefObject<HTMLDivElement | null>;
  shouldRenderTrend: boolean;
  onNavigateCatalog: () => void;
  onAddToCart: (product: Product & { selectedVariant?: ColorVariant; selectedImageIndex?: number }) => void;
  onOpenBlogPost: (slug: string) => void;
  onOpenBlogList: () => void;
  onCartClick: () => void;
}

/**
 * Единая точка сборки главной: порядок секций и ленивая загрузка.
 * Логика: витрина → доверие → история → B2B-пути → квиз → тренд → визуал → SEO → блог → соцдоказательства → контакты.
 */
export function HomePage({
  trendTriggerRef,
  shouldRenderTrend,
  onNavigateCatalog,
  onAddToCart,
  onOpenBlogPost,
  onOpenBlogList,
  onCartClick,
}: HomePageProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main id="main-content" tabIndex={-1} className="relative z-10 outline-none">
      {/* 1. Герой */}
      <Hero onViewCatalog={onNavigateCatalog} />

      {/* 2. Витрина — сразу после героя */}
      <Suspense fallback={<section className="py-12" aria-hidden="true" />}>
        <MiniCatalog onAddToCart={onAddToCart} onViewFullCatalog={onNavigateCatalog} />
      </Suspense>

      {/* 3. Почему мы */}
      <Suspense fallback={<section className="py-10" aria-hidden="true" />}>
        <WhyUs />
      </Suspense>

      {/* 4. О компании */}
      <Suspense fallback={<section className="py-10" aria-hidden="true" />}>
        <About />
      </Suspense>

      {/* 5. Сценарии: розница / опт / экспорт */}
      <AudiencePathsSection
        onOpenFullCatalog={onNavigateCatalog}
        onScrollToHits={() => scrollTo('catalog')}
        onScrollToQuote={() => scrollTo('contacts')}
      />

      {/* 6. Квиз / подбор */}
      <RattanQuizSection
        onOpenCatalog={onNavigateCatalog}
        onScrollToHits={() => scrollTo('catalog')}
        onScrollToContacts={() => scrollTo('contacts')}
        onOpenCart={onCartClick}
      />

      {/* 7. Тренд (лениво по скроллу) */}
      <div ref={trendTriggerRef} className="h-2 w-full" aria-hidden="true" />
      {shouldRenderTrend ? (
        <Suspense
          fallback={
            <section className="py-24">
              <div className="container mx-auto px-4">
                <LoadingSpinner size="lg" text="Загрузка тренда 2025..." />
              </div>
            </section>
          }
        >
          <ErrorBoundary fallback={<LazyLoadError />}>
            <Trend2025 />
          </ErrorBoundary>
        </Suspense>
      ) : (
        <section className="py-12" aria-hidden="true" />
      )}

      {/* 8. Галерея */}
      <Suspense
        fallback={
          <section className="py-24">
            <div className="container mx-auto px-4">
              <LoadingSpinner size="lg" text="Загрузка галереи..." />
            </div>
          </section>
        }
      >
        <ErrorBoundary fallback={<LazyLoadError />}>
          <Gallery />
        </ErrorBoundary>
      </Suspense>

      {/* 9. SEO-блоки */}
      <Suspense fallback={<section className="py-8" aria-hidden="true" />}>
        <SEOContent />
      </Suspense>
      <Suspense fallback={<section className="py-8" aria-hidden="true" />}>
        <HomeSEOClusters />
      </Suspense>

      {/* 10. Блог */}
      <Suspense fallback={<section className="py-8" aria-hidden="true" />}>
        <BlogSection onOpenPost={onOpenBlogPost} />
      </Suspense>
      <div className="pb-12 text-center md:pb-16">
        <Button
          variant="outline"
          onClick={onOpenBlogList}
          className="rounded-lg border-border bg-card px-8 text-base shadow-none hover:border-primary/40"
        >
          Все статьи блога
        </Button>
      </div>

      {/* 11–12. Вопросы и отзывы */}
      <Suspense fallback={<section className="py-8" aria-hidden="true" />}>
        <FAQ />
      </Suspense>
      <Suspense fallback={<section className="py-8" aria-hidden="true" />}>
        <Reviews />
      </Suspense>

      {/* 13. Контакты */}
      <Suspense fallback={<section className="py-8" aria-hidden="true" />}>
        <Contacts />
      </Suspense>
    </main>
  );
}
