import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { useLanguage } from '../utils/language-context';
import { Globe } from '../utils/lucide-stub';
import { useState } from 'react';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'uz' as const, name: 'O\'zbekcha', flag: '🇺🇿' },
    { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-10 px-3 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">{currentLanguage?.flag}</span>
        <span className="ml-1 hidden md:inline">{currentLanguage?.name}</span>
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-border bg-popover shadow-lg z-50">
            <div className="py-1">
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-200 text-left hover:bg-muted ${
                    language === lang.code
                      ? 'bg-primary/10 text-foreground font-medium'
                      : 'text-muted-foreground'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                  {language === lang.code && (
                    <motion.div
                      className="ml-auto w-2 h-2 bg-primary rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}