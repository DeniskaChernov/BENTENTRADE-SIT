import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle } from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';

export function CartFeedbackToast({ message }: { message: string | null }) {
  const { t } = useLanguage();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.94 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="fixed bottom-6 left-1/2 z-[120] flex max-w-[min(100vw-2rem,420px)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-primary/35 bg-background/90 px-4 py-3 text-sm shadow-lg backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          <motion.span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
            initial={reduce ? undefined : { scale: 0 }}
            animate={reduce ? undefined : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.05 }}
          >
            <CheckCircle className="h-5 w-5" aria-hidden />
          </motion.span>
          <span className="text-left leading-snug text-foreground">
            <span className="font-medium text-primary">{t.toastAddedToCart}</span>
            <span className="text-muted-foreground"> — {message}</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
