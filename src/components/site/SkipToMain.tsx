import { pickLang, useLanguage } from '../../utils/language-context';

/** Ссылка «к контенту» для клавиатуры и скринридеров */
export function SkipToMain() {
  const { language } = useLanguage();
  const label = pickLang(language, {
    ru: 'К основному содержимому',
    uz: 'Asosiy kontentga o‘tish',
    en: 'Skip to main content',
  });

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {label}
    </a>
  );
}
