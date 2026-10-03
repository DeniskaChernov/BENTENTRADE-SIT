import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  Shield, 
  Cookie, 
  FileText, 
  Building, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  MessageCircle,
  Instagram,
  Send,
  Sparkles
} from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';
import { LanguageToggle } from './LanguageToggle';
import logoImage from '@/assets/fae59665fd1772cdd61f6a4d1c95ed996e1502f5.webp';

export type FooterLegalDocumentType = 'privacy' | 'cookies' | 'terms' | 'company';

interface FooterProps {
  onLegalDocumentClick: (type: FooterLegalDocumentType) => void;
  /** Переход на страницу списка статей /blog */
  onBlogClick?: () => void;
}

export function Footer({ onLegalDocumentClick, onBlogClick }: FooterProps) {
  const { t, language } = useLanguage();

  const legalLinks = [
    {
      type: 'privacy' as FooterLegalDocumentType,
      label: t.privacyPolicy,
      icon: Shield
    },
    {
      type: 'cookies' as FooterLegalDocumentType,
      label: t.cookiesPolicy,
      icon: Cookie
    },
    {
      type: 'terms' as FooterLegalDocumentType,
      label: t.termsOfUse,
      icon: FileText
    },
    {
      type: 'company' as FooterLegalDocumentType,
      label: t.companyDetails,
      icon: Building
    }
  ];

  const socialLinks = [
    {
      name: 'Telegram',
      icon: Send,
      href: 'https://t.me/bententrade',
      color: 'hover:text-blue-400'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      href: 'https://instagram.com/bententrade',
      color: 'hover:text-pink-400'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: 'https://wa.me/998771044422',
      color: 'hover:text-green-400'
    }
  ];

  return (
    <footer className="relative mt-20 border-t border-border bg-gradient-to-b from-muted/50 to-background md:mt-28">
      <div className="relative">
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Логотип и описание */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                {/* Логотип */}
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                    whileHover={{ rotate: 4, scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img 
                      src={logoImage} 
                      alt="Bententrade Logo" 
                      className="h-8 w-8 object-contain"
                    />
                  </motion.div>
                  
                  <div className="flex flex-col">
                    <span className="font-grotesk text-xl font-semibold tracking-tight text-foreground">
                      Bententrade
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {language === 'uz' ? 'Premium sifat' : 'Премиум качество'}
                    </span>
                  </div>
                </div>

                {/* Описание */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === 'uz' 
                    ? 'Toshkentda joylashgan sifatli sun\'iy rattan va to\'qilgan guldonlar ishlab chiqaruvchi.'
                    : 'Производитель качественного искусственного ротанга и плетёных кашпо в Ташкенте.'
                  }
                </p>

                {/* Социальные сети */}
                <div className="flex items-center gap-3">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors duration-300 ${social.color} hover:border-primary/35`}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <social.icon className="w-4 h-4" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Контакты */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground font-grotesk flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  {t.contactsTitle}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 group">
                    <Phone className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {t.phoneNumber}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 group">
                    <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      info@btt.uz
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 group">
                    <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {t.addressText}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 group">
                    <Clock className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {t.workingHoursText}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Быстрые ссылки */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground font-grotesk flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {language === 'uz' ? 'Tezkor havolalar' : 'Быстрые ссылки'}
                </h3>
                
                <div className="space-y-3">
                  {[
                    { label: t.about, href: '#about', kind: 'hash' as const },
                    { label: t.catalog, href: '#catalog', kind: 'hash' as const },
                    { label: t.navWholesale, href: '/wholesale', kind: 'route' as const },
                    { label: t.navExport, href: '/export', kind: 'route' as const },
                    {
                      label: language === 'uz' ? 'Blog va yangiliklar' : 'Блог и новости',
                      href: '/blog',
                      kind: 'blog' as const,
                    },
                    { label: t.whyUsTitle, href: '#why-us', kind: 'hash' as const },
                    { label: t.contactsTitle, href: '#contacts', kind: 'hash' as const },
                  ].map((link, index) =>
                    link.kind === 'route' ? (
                      <motion.a
                        key={link.href}
                        href={link.href}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-300 hover:translate-x-2"
                        whileHover={{ x: 4 }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        {link.label}
                      </motion.a>
                    ) : link.kind === 'blog' ? (
                      onBlogClick ? (
                        <motion.button
                          key={link.label}
                          type="button"
                          onClick={onBlogClick}
                          className="block w-full text-left text-sm text-muted-foreground hover:text-primary transition-colors duration-300 hover:translate-x-2"
                          whileHover={{ x: 4 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          {link.label}
                        </motion.button>
                      ) : (
                        <motion.a
                          key={link.label}
                          href="/blog"
                          className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-300 hover:translate-x-2"
                          whileHover={{ x: 4 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          {link.label}
                        </motion.a>
                      )
                    ) : (
                      <motion.a
                        key={link.label}
                        href={link.href}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-300 hover:translate-x-2"
                        whileHover={{ x: 4 }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        {link.label}
                      </motion.a>
                    ),
                  )}
                </div>
              </div>
            </motion.div>

            {/* Юридическая информация */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground font-grotesk flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  {language === 'uz' ? 'Hujjatlar' : 'Документы'}
                </h3>
                
                <div className="space-y-3">
                  {legalLinks.map((link, index) => (
                    <motion.div
                      key={link.type}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      {link.type !== 'company' && (
                        <Button
                          variant="ghost"
                          onClick={() => onLegalDocumentClick(link.type)}
                          className="w-full justify-start h-auto p-2 rounded-lg hover:bg-primary/5 text-left group"
                        >
                          <link.icon className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                            {link.label}
                          </span>
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>

          <Separator className="my-12 bg-primary/10" />

          {/* Нижняя часть */}
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-between gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 Bententrade. {language === 'uz' ? 'Barcha huquqlar himoyalangan.' : 'Все права защищены.'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {language === 'uz' ? 'Til:' : 'Язык:'}
              </span>
              <LanguageToggle />
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}