import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { de } from './de';
import { en } from './en';

const resources = {
  de: { translation: de },
  en: { translation: en },
};

// Get browser language and map to supported languages
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0];
  return ['de', 'en'].includes(browserLang) ? browserLang : 'de';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getBrowserLanguage(),
    fallbackLng: 'de',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
