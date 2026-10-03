import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Shield, 
  Cookie, 
  FileText, 
  Building, 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  CreditCard,
  Package,
  RotateCcw,
  Users
} from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';

export type LegalDocumentType = 'privacy' | 'cookies' | 'terms' | 'company';

interface LegalDocumentsProps {
  type: LegalDocumentType;
  onBack: () => void;
}

export function LegalDocuments({ type, onBack }: LegalDocumentsProps) {
  const { t } = useLanguage();

  const getDocumentIcon = () => {
    switch (type) {
      case 'privacy': return Shield;
      case 'cookies': return Cookie;
      case 'terms': return FileText;
      case 'company': return Building;
      default: return FileText;
    }
  };

  const getDocumentTitle = () => {
    switch (type) {
      case 'privacy': return t.privacyPolicyTitle;
      case 'cookies': return t.cookiesPolicyTitle;
      case 'terms': return t.termsOfUseTitle;
      case 'company': return t.companyDetailsTitle;
      default: return '';
    }
  };

  const Icon = getDocumentIcon();

  const renderPrivacyPolicy = () => (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <p className="text-base text-muted-foreground leading-relaxed">
          {t.privacyPolicyIntro}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {t.whatDataWeCollect}
        </h3>
        <div className="pl-7 space-y-3">
          <p className="text-muted-foreground leading-relaxed">{t.dataWeCollectDesc}</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t.whyWeUseData}
        </h3>
        <div className="pl-7 space-y-3">
          <p className="text-muted-foreground leading-relaxed">{t.dataUsageDesc}</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <Package className="w-5 h-5" />
          {t.dataSharing}
        </h3>
        <div className="pl-7 space-y-3">
          <p className="text-muted-foreground leading-relaxed">{t.dataSharingDesc}</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {t.dataRetention}
        </h3>
        <div className="pl-7 space-y-3">
          <p className="text-muted-foreground leading-relaxed">{t.dataRetentionDesc}</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {t.yourRights}
        </h3>
        <div className="pl-7 space-y-3">
          <p className="text-muted-foreground leading-relaxed">{t.yourRightsDesc}</p>
        </div>
      </motion.div>

      <Separator className="my-8" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-6 rounded-xl border-primary/20"
      >
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          Контакты по вопросам данных
        </h4>
        <p className="text-muted-foreground">{t.dataContacts}</p>
      </motion.div>
    </div>
  );

  const renderCookiesPolicy = () => (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <p className="text-base text-muted-foreground leading-relaxed">
          {t.cookiesPolicyIntro}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <Cookie className="w-5 h-5" />
          {t.cookieTypes}
        </h3>
        <div className="pl-7 space-y-3">
          <p className="text-muted-foreground leading-relaxed">{t.cookieTypesDesc}</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t.whatYouCanDo}
        </h3>
        <div className="pl-7 space-y-3">
          <p className="text-muted-foreground leading-relaxed">{t.whatYouCanDoDesc}</p>
        </div>
      </motion.div>
    </div>
  );

  const renderTermsOfUse = () => (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <p className="text-base text-muted-foreground leading-relaxed">
          {t.termsIntro}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t.paymentAndDelivery}
        </h3>
        <div className="pl-7 space-y-3">
          <p className="text-muted-foreground leading-relaxed">{t.paymentAndDeliveryDesc}</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <RotateCcw className="w-5 h-5" />
          {t.returnAndExchange}
        </h3>
        <div className="pl-7 space-y-3">
          <p className="text-muted-foreground leading-relaxed">{t.returnAndExchangeDesc}</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t.partyResponsibilities}
        </h3>
        <div className="pl-7 space-y-3">
          <p className="text-muted-foreground leading-relaxed">{t.partyResponsibilitiesDesc}</p>
        </div>
      </motion.div>
    </div>
  );

  const renderCompanyDetails = () => (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6"
      >
        <div className="glass-card p-6 rounded-xl border-primary/20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">{t.companyName}</span>
            </div>
            
            <div className="space-y-3 pl-8">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t.companyTIN}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t.companyAddress}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t.companyPhone}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t.companyEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'privacy': return renderPrivacyPolicy();
      case 'cookies': return renderCookiesPolicy();
      case 'terms': return renderTermsOfUse();
      case 'company': return renderCompanyDetails();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass-effect border-primary/20 shadow-2xl">
            <CardHeader className="border-b border-primary/10 glass-card rounded-t-2xl">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    onClick={onBack}
                    className="h-10 w-10 p-0 rounded-xl hover:bg-primary/10 micro-interaction"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </motion.div>

                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-12 h-12 rounded-xl glass-card flex items-center justify-center border border-primary/20"
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="w-6 h-6 text-primary" />
                  </motion.div>
                  
                  <CardTitle className="text-foreground font-grotesk text-xl">
                    {getDocumentTitle()}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="p-8">
                  {renderContent()}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}