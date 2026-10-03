import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackEvent } from './analytics';
import { translations, Translations } from './translations';

export type Language = 'uz' | 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

/** Тройной выбор строки для компонентов, ещё не переведённых на `t.*`. */
export function pickLang(language: Language, m: Record<Language, string>): string {
  return m[language];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ru');

  useEffect(() => {
    try {
      // Загружаем сохранённый язык из localStorage
      const savedLanguage = localStorage.getItem('bententrade-language') as Language;
      if (savedLanguage && (savedLanguage === 'uz' || savedLanguage === 'ru' || savedLanguage === 'en')) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      // Если localStorage недоступен, используем русский по умолчанию
      setLanguage('ru');
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage((current) => {
      if (current !== lang) {
        trackEvent('lang_switch', { from_lang: current, to_lang: lang });
      }
      return lang;
    });
    try {
      localStorage.setItem('bententrade-language', lang);
    } catch (error) {
      console.warn('Could not save language preference:', error);
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}