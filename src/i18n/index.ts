import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { de } from './de';
import { en } from './en';

const resources = {
  de: { translation: de },
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'de', // Default language
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
