import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LanguageSwitcherProminent() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center justify-center gap-2 p-4 bg-secondary/50 rounded-xl border border-border">
      <Globe className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm text-muted-foreground mr-2">{t('common.selectLanguage')}:</span>
      <div className="flex gap-2">
        <Button 
          variant={i18n.language === 'de' ? 'default' : 'outline'}
          size="sm"
          onClick={() => changeLanguage('de')}
          className="gap-2"
        >
          🇩🇪 {t('common.german')}
        </Button>
        <Button 
          variant={i18n.language === 'en' ? 'default' : 'outline'}
          size="sm"
          onClick={() => changeLanguage('en')}
          className="gap-2"
        >
          🇬🇧 {t('common.english')}
        </Button>
      </div>
    </div>
  );
}