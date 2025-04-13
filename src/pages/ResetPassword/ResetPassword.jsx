import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import Header from '../../components/Header/Header';
import './ResetPassword.css';

const apiURL = import.meta.env.VITE_API_BASE_URL;

const ResetPassword = () => {
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
          setSuccessMessage('A reset link has been sent to your email address.');
          setErrorMessage('');
        } else {
          setErrorMessage('Email is not registered.');
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setErrorMessage('Server error. Please try again.');
      }
    } else {
      // Step 2: Reset password
      if (newPassword !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
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
          alert('Password changed successfully!');
          setEmail('');
          setToken('');
          setNewPassword('');
          setConfirmPassword('');
          setErrorMessage('');
          setSuccessMessage('');
        } else {
          setErrorMessage(data.message || 'Password reset failed.');
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setErrorMessage('Server error while resetting password.');
      }
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form-container">
        <h2>Reset Password</h2>
        <p>
          {!token
            ? "Enter your email to receive a reset link."
            : "Enter your new password."}
        </p>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        {isInitialized && !successMessage && (
          <form onSubmit={handleSubmit}>
            {!token && (
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
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
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" className="update-button">
              {!token ? 'Send Reset Link' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
