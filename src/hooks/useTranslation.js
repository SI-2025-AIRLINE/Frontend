import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import en from '../i18n/en.json';
import bs from '../i18n/bs.json';

const translations = { en, bs };

export const useTranslation = () => {
  const { language } = useContext(LanguageContext);

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  return { t, language };
};
