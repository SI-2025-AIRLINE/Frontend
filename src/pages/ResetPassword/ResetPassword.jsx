import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';

import Header from '../../components/Header/Header';
import './ResetPassword.css';
import { LanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const apiURL = import.meta.env.VITE_API_BASE_URL;

const ResetPassword = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenFromURL = searchParams.get('token');
    const emailFromURL = searchParams.get('email');

    if (emailFromURL) {
      setEmail(emailFromURL);
    }

    if (tokenFromURL) {
      setToken(tokenFromURL);
    }

    setIsInitialized(true);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1: Request reset token
    if (!token) {
      try {
        const response = await fetch(`${apiURL}/Customer/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (data.exists !== false) {
          setSuccessMessage(`${t("sendResetLinkMsg")}.`);
          setErrorMessage('');
        } else {
          setErrorMessage(`${t("emailNotRegisteredMsg")}.`);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setErrorMessage(`${t("serverErrorMsg")}.`);
      }
    } else {
      // Step 2: Reset password
      if (newPassword !== confirmPassword) {
        setErrorMessage(`${t("passwordsDontMatchErrMsg")}.`);
        return;
      }

      try {
        const response = await fetch(`${apiURL}/Customer/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword, confirmPassword }),
        });

        const data = await response.json();

        if (data.success) {
          alert(`${t("passwordChangedMsg")}!`);
          setEmail('');
          setToken('');
          setNewPassword('');
          setConfirmPassword('');
          setErrorMessage('');
          setSuccessMessage('');
        } else {
          setErrorMessage(data.message || `${t("passwordResetFailed")}.`);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setErrorMessage(`${t("severErrorWhileResettingPw")}.`);
      }
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form-container">
        <h2>{t("resetPassword")}</h2>
        <p>
          {!token
            ? `${t("enterMailMsg")}.`
            : `${t("enterPwMsg")}.`}
        </p>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        {isInitialized && !successMessage && (
          <form onSubmit={handleSubmit}>
            {!token && (
              <div className="form-group">
                <input
                  type="email"
                  placeholder={t("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            {token && (
              <>
                <div className="form-group">
                  <input
                    type="password"
                    placeholder={t("newPassword")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    placeholder={t("confirmNewPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" className="update-button">
              {!token ? `${t("sendResetLink")}` : `${t("changePassword")}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
