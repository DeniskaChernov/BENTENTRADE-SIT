import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Breadcrumbs } from './Breadcrumbs';
import { Building, CheckCircle, Globe } from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';
import { trackEvent } from '../utils/analytics';

export function WholesalePage({
  onHome,
  onContacts,
}: {
  onHome: () => void;
  onContacts: () => void;
}) {
  const { t } = useLanguage();
  const steps = [t.wholesaleStep1, t.wholesaleStep2, t.wholesaleStep3];

  return (
    <div className="min-h-screen pt-24 pb-20 relative z-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <Breadcrumbs items={[{ label: t.home, onClick: onHome }, { label: t.navWholesale }]} />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <Building className="w-12 h-12 mx-auto text-primary mb-4" aria-hidden />
          <h1 className="text-3xl md:text-4xl font-semibold font-grotesk mb-4 text-balance">
            {t.wholesalePageTitle}
          </h1>
          <p className="text-muted-foreground text-balance max-w-xl mx-auto">{t.wholesalePageLead}</p>
        </motion.div>

        <div className="mt-10 space-y-4">
          <h2 className="font-medium text-lg">{t.wholesaleStepsTitle}</h2>
          <ol className="space-y-3 list-none p-0 m-0">
            {steps.map((s, i) => (
              <li
                key={i}
                className="flex gap-3 glass-card rounded-xl p-4 border border-primary/15 items-start"
              >
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden />
                <span className="text-sm md:text-base text-left">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-8 text-sm text-muted-foreground text-center text-balance">{t.wholesaleFormNote}</p>

        <Button
          type="button"
          className="w-full mt-6 h-12 rounded-xl text-base"
          onClick={() => {
            trackEvent('quote_submit', { source: 'wholesale_page' });
            onContacts();
          }}
        >
          {t.pageCtaContacts}
        </Button>
      </div>
    </div>
  );
}

export function ExportPage({
  onHome,
  onContacts,
}: {
  onHome: () => void;
  onContacts: () => void;
}) {
  const { t } = useLanguage();
  const points = [t.exportPoint1, t.exportPoint2, t.exportPoint3];

  return (
    <div className="min-h-screen pt-24 pb-20 relative z-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <Breadcrumbs items={[{ label: t.home, onClick: onHome }, { label: t.navExport }]} />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <Globe className="w-12 h-12 mx-auto text-primary mb-4" aria-hidden />
          <h1 className="text-3xl md:text-4xl font-semibold font-grotesk mb-4 text-balance">
            {t.exportPageTitle}
          </h1>
          <p className="text-muted-foreground text-balance max-w-xl mx-auto">{t.exportPageLead}</p>
        </motion.div>

        <ul className="mt-10 space-y-3 list-none p-0 m-0">
          {points.map((s, i) => (
            <li
              key={i}
              className="flex gap-3 glass-card rounded-xl p-4 border border-primary/15 items-start"
            >
              <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden />
              <span className="text-sm md:text-base text-left">{s}</span>
            </li>
          ))}
        </ul>

        <Button
          type="button"
          className="w-full mt-10 h-12 rounded-xl text-base"
          onClick={() => {
            trackEvent('quote_submit', { source: 'export_page' });
            onContacts();
          }}
        >
          {t.pageCtaContacts}
        </Button>
      </div>
    </div>
  );
}
