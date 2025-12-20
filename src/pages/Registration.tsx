import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { RegistrationForm } from '@/components/registration/RegistrationForm';
import { LanguageSwitcherProminent } from '@/components/LanguageSwitcherProminent';

export default function Registration() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="gradient-hero min-h-screen">
        <div className="container-narrow py-12 md:py-20">
          {/* Prominent language switcher at the top */}
          <div className="mb-8">
            <LanguageSwitcherProminent />
          </div>
          
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
              {t('registration.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t('registration.intro')}
            </p>
          </div>
          <div className="card-elevated p-6 md:p-10">
            <RegistrationForm />
          </div>
        </div>
      </div>
    </Layout>
  );
}
