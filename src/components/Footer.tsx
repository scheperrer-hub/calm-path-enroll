import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Settings } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-charcoal text-cream py-12">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warm-orange flex items-center justify-center">
                <span className="text-charcoal font-serif text-xl font-bold">B</span>
              </div>
              <span className="font-serif text-xl text-cream">
                Buddhayana e.V.
              </span>
            </div>
            <div className="space-y-2 text-cream/70 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-warm-orange" />
                <span>{t('footer.email')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-warm-orange" />
                <span>{t('footer.address')}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-warm-orange">Links</h3>
            <nav className="flex flex-col gap-2 text-sm text-cream/70">
              <Link to="/anmeldung" className="hover:text-warm-orange transition-colors">
                {t('nav.registration')}
              </Link>
              <Link to="/privacy" className="hover:text-warm-orange transition-colors">
                {t('nav.privacy')}
              </Link>
              <Link to="/disclaimer" className="hover:text-warm-orange transition-colors">
                {t('nav.disclaimer')}
              </Link>
            </nav>
          </div>

          {/* Legal + Admin */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-warm-orange">{t('footer.contact')}</h3>
            <p className="text-sm text-cream/70">
              Vipassana Meditationszentrum<br />
              {t('footer.address')}
            </p>
            <div className="pt-2">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-xs text-cream/40 hover:text-warm-orange transition-colors"
              >
                <Settings className="w-3 h-3" />
                Admin
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-charcoal-light flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-cream/50">
          <span>{t('footer.copyright')}</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-warm-orange transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/disclaimer" className="hover:text-warm-orange transition-colors">
              {t('footer.disclaimer')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}