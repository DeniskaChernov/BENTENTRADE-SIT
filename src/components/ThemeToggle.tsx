import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from '../utils/lucide-stub';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Получаем сохраненную тему из localStorage
    const savedTheme = localStorage.getItem('theme') as Theme || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const getNextTheme = (): Theme => {
    switch (theme) {
      case 'light': return 'dark';
      case 'dark': return 'system';
      case 'system': return 'light';
      default: return 'light';
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'system': return Monitor;
      default: return Sun;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Светлая тема';
      case 'dark': return 'Темная тема';
      case 'system': return 'Системная тема';
      default: return 'Светлая тема';
    }
  };

  if (!mounted) {
    return (
      <div className={`w-9 h-9 ${className}`}>
        <div className="w-full h-full bg-gray-200 animate-pulse rounded-md" />
      </div>
    );
  }

  const Icon = getThemeIcon();

  return (
    <div className="relative group">
      <motion.button
        onClick={() => handleThemeChange(getNextTheme())}
        className={`relative p-2 rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-300 ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={getThemeLabel()}
      >
        <motion.div
          key={theme}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <Icon className="w-5 h-5" />
          
          {/* Анимированный ореол */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute inset-0 rounded-full ${
              theme === 'light' ? 'bg-yellow-400' : 
              theme === 'dark' ? 'bg-blue-400' : 'bg-gray-400'
            }`}
          />
        </motion.div>
        
        {/* Фоновый эффект при hover */}
        <motion.div
          className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/0 to-cyan-500/0"
          whileHover={{
            background: [
              "linear-gradient(90deg, rgba(251,191,36,0) 0%, rgba(251,146,60,0) 100%)",
              "linear-gradient(90deg, rgba(251,191,36,0.1) 0%, rgba(251,146,60,0.1) 100%)",
              "linear-gradient(90deg, rgba(251,191,36,0) 0%, rgba(251,146,60,0) 100%)"
            ]
          }}
          transition={{ duration: 0.6 }}
        />
      </motion.button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {getThemeLabel()}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}