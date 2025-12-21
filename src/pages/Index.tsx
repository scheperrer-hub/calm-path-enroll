import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf, Heart, Sun } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Index() {
  const { t } = useTranslation();

  return (
    <Layout>
      <section className="gradient-hero min-h-[85vh] flex items-center relative">
        {/* Language switcher in top right */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        
        <div className="container-wide py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-4 mb-8 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center">
                <Leaf className="w-6 h-6 text-forest" />
              </div>
              <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center delay-100 animate-fade-in">
                <Heart className="w-6 h-6 text-forest" />
              </div>
              <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center delay-200 animate-fade-in">
                <Sun className="w-6 h-6 text-forest" />
              </div>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6 animate-slide-up">
              Vipassana<br />Meditation Retreat
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto animate-slide-up delay-100">
              {t('registration.intro')}
            </p>
            <Link to="/anmeldung">
              <Button size="lg" className="gap-3 text-lg px-8 py-6 bg-primary hover:bg-primary/90 animate-slide-up delay-200">
                {t('nav.registration')} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
