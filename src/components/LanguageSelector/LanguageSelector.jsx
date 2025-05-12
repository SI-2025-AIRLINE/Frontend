import React, { useContext, useState, useEffect } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import './LanguageSelector.css';
import { useTranslation } from '../../hooks/useTranslation';

const LanguageSelector = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleSelect = (lang) => {
    setLanguage(lang);
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.language-selector-container')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="language-selector-container">
      <button className="language-selector-button" onClick={toggleMenu}>
        {t("languages")}
      </button>
      {menuOpen && (
        <div className="menu-items">
          <button onClick={() => handleSelect('en')}>
            {language === 'en' && <span className="checkmark">✔</span>} {t("english")}
          </button>
          <button onClick={() => handleSelect('bs')}>
            {language === 'bs' && <span className="checkmark">✔</span>} {t("bosnian")}
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
