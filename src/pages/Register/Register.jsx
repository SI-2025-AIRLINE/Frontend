import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './Register.css';
import { LanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const apiURL = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    dob: '', // Novi unos za datum rođenja
    gender: '' // Novi unos za spol
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isValidEmail = (email) => {
    // Mora imati nešto prije @, nešto poslije @, tačku i barem 2 slova za domen
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password || !formData.dob || !formData.gender) {
      setError(t("allFieldsRequired"));
      setLoading(false);
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError(t("enterValidMail"));
      setLoading(false);
      return;
    }

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      dob: formData.dateofbirth, // Dodajemo datum rođenja
      gender: formData.gender // Dodajemo spol
    };

    try {
      const response = await fetch(`${apiURL}/Customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      let data;
      try {
        data = await response.json();
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        const text = await response.text();
        throw new Error(text);
      }

      if (!response.ok) {
        throw new Error(data.message || `${t("registrationFailed")}.`);
      }

      setSuccess(t("registrationSuccessful"));
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h2>{t("register")}</h2>
        <div className="message-container">
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name={t("firstName")}
              placeholder={t("firstName")}
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name={t("lastName")}
              placeholder={t("lastName")}
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name={t("userName")}
              placeholder={t("userName")}
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name={t("email")}
              placeholder={t("email")}
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name={t("password")}
              placeholder={t("password")}
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="date"
              name={t("dob")}
              placeholder={t("dob")}
              value={formData.dob}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <select
              name={t("gender")}
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">{t("selectGender")}</option>
              <option value="male">{t("male")}</option>
              <option value="female">{t("female")}</option>
             
            </select>
          </div>
          <button type="submit" className="update-button" disabled={loading}>
            {loading ? `${t("registering")}...` : `${t("register")}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
