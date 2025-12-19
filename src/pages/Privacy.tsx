import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { Shield, Eye, Database, UserCheck, Building, Cookie } from 'lucide-react';

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="gradient-hero min-h-screen py-16 md:py-24">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">{t('privacy.title')}</h1>
            <p className="text-xl text-primary font-serif">{t('privacy.subtitle')}</p>
          </div>

          {/* Introduction */}
          <div className="card-elevated p-6 mb-8">
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {t('privacy.intro')}
            </p>
          </div>

          <div className="space-y-6">
            {/* Responsible Party */}
            <div className="card-elevated p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-xl text-foreground mb-2">{t('privacy.responsibleParty.title')}</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{t('privacy.responsibleParty.content')}</p>
                </div>
              </div>
            </div>

            {/* Definitions */}
            <div className="card-elevated p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-xl text-foreground mb-2">{t('privacy.definitions.title')}</h2>
                  <p className="text-muted-foreground">{t('privacy.definitions.content')}</p>
                </div>
              </div>
            </div>

            {/* Cookies */}
            <div className="card-elevated p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Cookie className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-xl text-foreground mb-2">{t('privacy.cookies.title')}</h2>
                  <p className="text-muted-foreground">{t('privacy.cookies.content')}</p>
                </div>
              </div>
            </div>

            {/* Deletion */}
            <div className="card-elevated p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-xl text-foreground mb-2">{t('privacy.deletion.title')}</h2>
                  <p className="text-muted-foreground">{t('privacy.deletion.content')}</p>
                </div>
              </div>
            </div>

            {/* Rights */}
            <div className="card-elevated p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-xl text-foreground mb-2">{t('privacy.rights.title')}</h2>
                  <p className="text-muted-foreground">{t('privacy.rights.content')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}