import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import en from '../i18n/en.json';
import bs from '../i18n/bs.json';

const translations = { en, bs };

export const useTranslation = () => {
  const { language } = useContext(LanguageContext);

  const t = (key, variables = {}) => {
  let translation = translations[language]?.[key] || key;

  // Zamjena {imeVarijable} sa vrijednostima
  Object.keys(variables).forEach(varKey => {
    const regex = new RegExp(`{${varKey}}`, 'g');
    translation = translation.replace(regex, variables[varKey]);
  });

  return translation;
};

  return { t, language };
};
