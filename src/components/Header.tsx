import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container-wide flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-serif text-xl">V</span>
          </div>
          <span className="font-serif text-xl text-foreground hidden sm:inline">
            Vipassana Retreat
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link 
            to="/anmeldung" 
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-3 py-2"
          >
            {t('nav.registration')}
          </Link>
          <Link 
            to="/privacy" 
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-3 py-2 hidden sm:inline"
          >
            {t('nav.privacy')}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
