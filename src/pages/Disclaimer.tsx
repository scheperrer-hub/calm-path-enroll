import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="gradient-hero min-h-screen py-16 md:py-24">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">{t('disclaimer.title')}</h1>
            <p className="text-xl text-primary font-serif">{t('disclaimer.subtitle')}</p>
          </div>

          <div className="card-elevated p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-warm-orange/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-warm-orange" />
              </div>
              <div>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {t('disclaimer.content')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}