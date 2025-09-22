import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import des traductions
import frCommon from '../locales/fr';
import enCommon from '../locales/en';

const resources = {
  fr: {
    common: frCommon,
  },
  en: {
    common: enCommon,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // langue par défaut
    fallbackLng: 'fr',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;
