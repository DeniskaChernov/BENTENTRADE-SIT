import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from './ui/button';
import { Sparkles, ArrowRight, LayoutGrid } from '../utils/lucide-stub';
import { pickLang, useLanguage } from '../utils/language-context';
import { trackEvent } from '../utils/analytics';

type Segment = 'A' | 'B' | 'C' | null;
type ProductNeed = 'rattan' | 'planter' | 'both' | null;
type Place = 'outdoor' | 'indoor' | 'both' | null;
type Volume = '12' | '5' | '10' | 'unsure' | null;
type Timing = 'asap' | 'week' | 'flex' | null;

interface RattanQuizSectionProps {
  onOpenCatalog: () => void;
  onScrollToHits: () => void;
  onScrollToContacts: () => void;
  onOpenCart: () => void;
}

export function RattanQuizSection({
  onOpenCatalog,
  onScrollToHits,
  onScrollToContacts,
  onOpenCart,
}: RattanQuizSectionProps) {
  const { t, language } = useLanguage();
  const reduceMotion = useReducedMotion();

  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [step, setStep] = useState(0);
  const [segment, setSegment] = useState<Segment>(null);
  const [productNeed, setProductNeed] = useState<ProductNeed>(null);
  const [place, setPlace] = useState<Place>(null);
  const [volume, setVolume] = useState<Volume>(null);
  const [timing, setTiming] = useState<Timing>(null);

  const totalSteps = 5;

  const showQuoteResult = useMemo(
    () => segment === 'C' || volume === 'unsure',
    [segment, volume],
  );

  const reset = useCallback(() => {
    setPhase('intro');
    setStep(0);
    setSegment(null);
    setProductNeed(null);
    setPlace(null);
    setVolume(null);
    setTiming(null);
  }, []);

  const goResult = useCallback(() => {
    trackEvent('quiz_complete', {
      quiz_segment: segment,
      quiz_product: productNeed,
      quiz_place: place,
      quiz_volume: volume,
      quiz_timing: timing,
      quiz_result: showQuoteResult ? 'quote' : 'retail',
    });
    setPhase('result');
  }, [segment, productNeed, place, volume, timing, showQuoteResult]);

  const startQuiz = () => {
    trackEvent('quiz_start', {});
    setPhase('quiz');
    setStep(1);
  };

  const canNext = useMemo(() => {
    switch (step) {
      case 1:
        return segment !== null;
      case 2:
        return productNeed !== null;
      case 3:
        return place !== null;
      case 4:
        return volume !== null;
      case 5:
        return timing !== null;
      default:
        return false;
    }
  }, [step, segment, productNeed, place, volume, timing]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else if (canNext) {
      goResult();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else {
      setPhase('intro');
      setStep(0);
    }
  };

  const progress = phase === 'quiz' ? (step / totalSteps) * 100 : 0;

  const choiceBtn =
    'w-full rounded-xl border border-border bg-background px-4 py-3 text-left text-sm transition-all hover:border-primary/35 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25';

  return (
    <section
      id="rattan-quiz"
      className="section-y relative scroll-mt-24 overflow-hidden border-b border-border"
      aria-labelledby="rattan-quiz-heading"
    >
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div
          className="absolute top-1/4 right-0 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(180, 83, 9, 0.12) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6">
        <header className="mb-12 text-center md:mb-14">
          <p className="section-eyebrow">
            {pickLang(language, { uz: 'Yordamchi', ru: 'Подбор', en: 'Matcher' })}
          </p>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-primary shadow-sm">
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
            <span>Quiz</span>
          </div>
          <h2
            id="rattan-quiz-heading"
            className="section-head text-balance"
          >
            {t.quizTitle}
          </h2>
          <p className="section-desc mx-auto mt-3 text-balance">
            {t.quizSubtitle}
          </p>
          <div className="section-divider" aria-hidden />
        </header>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-md md:p-8">
          <AnimatePresence mode="wait">
            {phase === 'intro' && (
              <motion.div
                key="intro"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                className="text-center space-y-6"
              >
                <Sparkles className="w-10 h-10 mx-auto text-primary/70" aria-hidden />
                <Button
                  type="button"
                  size="lg"
                  className="rounded-xl h-12 px-8 gap-2 micro-interaction"
                  onClick={startQuiz}
                >
                  {t.quizBegin}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {phase === 'quiz' && (
              <motion.div
                key={`step-${step}`}
                initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>
                      {t.quizStep} {step} {t.quizOf} {totalSteps}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full bg-primary/10 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={step}
                    aria-valuemin={1}
                    aria-valuemax={totalSteps}
                  >
                    <motion.div
                      className="h-full rounded-full bg-primary/70 origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: progress / 100 }}
                      transition={{
                        type: 'spring',
                        stiffness: 120,
                        damping: 20,
                      }}
                      style={{ transformOrigin: 'left' }}
                    />
                  </div>
                  {!reduceMotion && (
                    <p className="text-[11px] text-muted-foreground/70 mt-2 text-center animate-pulse">
                      · · ·
                    </p>
                  )}
                </div>

                {step === 1 && (
                  <div className="space-y-3">
                    <p className="font-medium mb-2">{t.quizQ1Title}</p>
                    {(
                      [
                        ['A', segment === 'A', () => setSegment('A'), t.quizQ1A],
                        ['B', segment === 'B', () => setSegment('B'), t.quizQ1B],
                        ['C', segment === 'C', () => setSegment('C'), t.quizQ1C],
                      ] as const
                    ).map(([key, active, onSelect, label]) => (
                      <button
                        key={key}
                        type="button"
                        className={`${choiceBtn} ${active ? 'border-primary/50 bg-primary/10' : ''}`}
                        onClick={onSelect}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3">
                    <p className="font-medium mb-2">{t.quizQ2Title}</p>
                    {(
                      [
                        ['rattan', productNeed === 'rattan', () => setProductNeed('rattan'), t.quizQ2Rattan],
                        ['planter', productNeed === 'planter', () => setProductNeed('planter'), t.quizQ2Planter],
                        ['both', productNeed === 'both', () => setProductNeed('both'), t.quizQ2Both],
                      ] as const
                    ).map(([key, active, onSelect, label]) => (
                      <button
                        key={key}
                        type="button"
                        className={`${choiceBtn} ${active ? 'border-primary/50 bg-primary/10' : ''}`}
                        onClick={onSelect}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <p className="font-medium mb-2">{t.quizQ3Title}</p>
                    {(
                      [
                        ['outdoor', place === 'outdoor', () => setPlace('outdoor'), t.quizQ3Outdoor],
                        ['indoor', place === 'indoor', () => setPlace('indoor'), t.quizQ3Indoor],
                        ['both', place === 'both', () => setPlace('both'), t.quizQ3Both],
                      ] as const
                    ).map(([key, active, onSelect, label]) => (
                      <button
                        key={key}
                        type="button"
                        className={`${choiceBtn} ${active ? 'border-primary/50 bg-primary/10' : ''}`}
                        onClick={onSelect}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-3">
                    <p className="font-medium mb-2">{t.quizQ4Title}</p>
                    {(
                      [
                        ['12', volume === '12', () => setVolume('12'), t.quizQ412],
                        ['5', volume === '5', () => setVolume('5'), t.quizQ45],
                        ['10', volume === '10', () => setVolume('10'), t.quizQ410],
                        ['unsure', volume === 'unsure', () => setVolume('unsure'), t.quizQ4Unsure],
                      ] as const
                    ).map(([key, active, onSelect, label]) => (
                      <button
                        key={key}
                        type="button"
                        className={`${choiceBtn} ${active ? 'border-primary/50 bg-primary/10' : ''}`}
                        onClick={onSelect}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-3">
                    <p className="font-medium mb-2">{t.quizQ5Title}</p>
                    {(
                      [
                        ['asap', timing === 'asap', () => setTiming('asap'), t.quizQ5Asap],
                        ['week', timing === 'week', () => setTiming('week'), t.quizQ5Week],
                        ['flex', timing === 'flex', () => setTiming('flex'), t.quizQ5Flex],
                      ] as const
                    ).map(([key, active, onSelect, label]) => (
                      <button
                        key={key}
                        type="button"
                        className={`${choiceBtn} ${active ? 'border-primary/50 bg-primary/10' : ''}`}
                        onClick={onSelect}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={handleBack}>
                    {t.quizBack}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 rounded-xl gap-2"
                    disabled={!canNext}
                    onClick={() => {
                      if (step === totalSteps && canNext) goResult();
                      else handleNext();
                    }}
                  >
                    {step === totalSteps ? t.quizFinish : t.quizNext}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div
                key="result"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-center"
              >
                {showQuoteResult ? (
                  <>
                    <h3 className="text-xl font-semibold">{t.quizResultQuoteTitle}</h3>
                    <p className="text-sm text-muted-foreground text-balance">{t.quizResultQuoteText}</p>
                    <Button
                      type="button"
                      className="w-full rounded-xl h-11 gap-2"
                      onClick={() => {
                        trackEvent('quote_submit', {
                          source: 'rattan_quiz',
                          quiz_segment: segment,
                          quiz_volume: volume,
                        });
                        onScrollToContacts();
                      }}
                    >
                      {t.quizCtaQuote}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold">{t.quizResultAbTitle}</h3>
                    <p className="text-sm text-muted-foreground text-balance">{t.quizResultAbText}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button type="button" variant="outline" className="flex-1 rounded-xl h-11" onClick={onScrollToHits}>
                        {t.quizCtaHits}
                      </Button>
                      <Button type="button" className="flex-1 rounded-xl h-11" onClick={onOpenCatalog}>
                        {t.quizCtaCatalog}
                      </Button>
                    </div>
                    <Button type="button" variant="ghost" className="w-full rounded-xl" onClick={onOpenCart}>
                      {t.quizCtaCart}
                    </Button>
                  </>
                )}
                <Button type="button" variant="link" className="text-muted-foreground text-sm" onClick={reset}>
                  {t.quizRestart}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
