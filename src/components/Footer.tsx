import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-charcoal text-cream py-8">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright with link */}
          <a 
            href="https://buddhayana-ev.de/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-cream/70 hover:text-warm-orange transition-colors"
          >
            © 2024 Buddhayana e.V.
          </a>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-cream/70">
            <Link to="/anmeldung" className="hover:text-warm-orange transition-colors">
              {t('nav.registration')}
            </Link>
            <Link to="/privacy" className="hover:text-warm-orange transition-colors">
              {t('nav.privacy')}
            </Link>
            <Link to="/disclaimer" className="hover:text-warm-orange transition-colors">
              {t('nav.disclaimer')}
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-1 text-cream/40 hover:text-warm-orange transition-colors"
            >
              <Settings className="w-3 h-3" />
              Admin
            </Link>
          </nav>

          {/* Language Switcher */}
          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
