import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../Button/Button';  
import './Header.css';
import profileImage from '../../assets/profile.png'; 

import { useTranslation } from '../../hooks/useTranslation';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import { LanguageContext } from '../../context/LanguageContext'; 

const Header = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { language, setLanguage } = useContext(LanguageContext);

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('userName'); 
  const fullName = username;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('surname');
    localStorage.removeItem('userName');  
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'white' }}>
          Airline System
        </Link>
      </div>

      {token && fullName && (
        <div className="header-center">
          <Button text={t("flights")} onClick={() => navigate('/flight-search')} />
          <Button text={t("Tickets")} onClick={() => navigate('/tickets-dashboard')} />
        </div>
      )}

      <div className="header-right">
        {token && fullName ? (
          <>
            <img
              src={profileImage}  
              alt="Profile"
              className="profile-icon"
              onClick={() => navigate('/profile')}
            />
            <Button text={t("logout")} onClick={handleLogout} />
            <LanguageSelector
              currentLanguage={language} 
              onChangeLanguage={(lang) => setLanguage(lang)}
            />
          </>
        ) : (
          <>
            <Button text={`${t("register")}`} onClick={() => navigate('/register')} />
            <Button text={`${t("login")}`} onClick={() => navigate('/login')} />
            <LanguageSelector
              currentLanguage={language}
              onChangeLanguage={(lang) => setLanguage(lang)}
            />
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
