import { useTranslation as useReactI18next } from 'react-i18next';

export const useTranslation = (namespace = 'common') => {
  const { t, i18n } = useReactI18next(namespace);
  
  return {
    t,
    i18n,
    changeLanguage: (locale: string) => i18n.changeLanguage(locale),
    currentLanguage: i18n.language,
  };
};
