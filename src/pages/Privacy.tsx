import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { Shield, Eye, Database, UserCheck } from 'lucide-react';

export default function Privacy() {
  const { t } = useTranslation();

  const sections = [
    { icon: Database, title: t('privacy.section1.title'), content: t('privacy.section1.content') },
    { icon: Eye, title: t('privacy.section2.title'), content: t('privacy.section2.content') },
    { icon: Shield, title: t('privacy.section3.title'), content: t('privacy.section3.content') },
    { icon: UserCheck, title: t('privacy.section4.title'), content: t('privacy.section4.content') },
  ];

  return (
    <Layout>
      <div className="gradient-hero min-h-screen py-16 md:py-24">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">{t('privacy.title')}</h1>
            <p className="text-lg text-muted-foreground">{t('privacy.intro')}</p>
          </div>
          <div className="space-y-6">
            {sections.map((section, i) => (
              <div key={i} className="card-elevated p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-foreground mb-2">{section.title}</h2>
                    <p className="text-muted-foreground">{section.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
