import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header/Header';
import './UpdateDetails.css';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const apiURL = import.meta.env.VITE_API_BASE_URL;

const UpdateDetails = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setErrorMessage(`${t("authTokenNotFound")}.`);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Dinamički payload: samo uključujemo popunjena polja
    const payload = {};
    if (formData.name.trim() !== '') payload.firstName = formData.name;
    if (formData.surname.trim() !== '') payload.lastName = formData.surname;
    if (formData.email.trim() !== '') payload.email = formData.email;
    if (formData.password.trim() !== '') payload.password = formData.password;
  
    if (Object.keys(payload).length === 0) {
      setErrorMessage(`${t("fillAtleastOneFieldMsg")}.`);
      setSuccessMessage('');
      return;
    }
  
    try {
      const response = await fetch(`${apiURL}/Customer/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `${t("smthWentWrong")}.`);
      }
  
      const result = await response.text();
      setSuccessMessage(result || `${t("profileUpdatedSuccessfully")}`);
      setErrorMessage('');
      console.log('Server response:', result);
    } catch (error) {
      setSuccessMessage('');
      setErrorMessage(error.message);
      console.error('Error updating profile:', error);
    }
  };
  
  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="update-details-container">
      
      <div className="update-form-container">
        <h2>{t("updateProfile")}</h2>
        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {token ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder={t("firstName")}
                value={formData.name}
                onChange={handleChange}
              
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="surname"
                placeholder={t("lastName")}
                value={formData.surname}
                onChange={handleChange}
                
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder={t("email")}
                value={formData.email}
                onChange={handleChange}
                
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder={t("newPassword")}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="update-button">{t("updateProfile")}</button>
            <button type="submit" className="update-button" onClick={() => navigate('/profile')}>{t("backToProfile")}</button>
            <p className="info-note">{t("leaveFieldsEmptyMsg")}</p>
          </form>
        ) : (
          <p className="not-logged-in">{t("pleaseLogIn")}</p>
        )}
      </div>
    </div>
  );
};

export default UpdateDetails;
