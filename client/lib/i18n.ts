import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from '../locales/tr.json';
import en from '../locales/en.json';

const resources = {
  tr: { translation: tr },
  en: { translation: en },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'tr', // Default language (Turkish)
  fallbackLng: 'en', // Fallback language
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
