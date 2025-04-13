import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import './ResetPassword.css';

const apiURL = import.meta.env.VITE_API_BASE_URL;

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailValid) {
      try {
        const response = await fetch(`${apiURL}/Customer/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (data.exists !== false) {
          setIsEmailValid(true);
          setErrorMessage('');
        } else {
          setErrorMessage('Email not registered!');
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setErrorMessage('Server error. Please try again.');
      }
    } else {
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
          alert('Password successfully changed!');
          setEmail('');
          setToken('');
          setNewPassword('');
          setConfirmPassword('');
          setIsEmailValid(false);
          setErrorMessage('');
        } else {
          setErrorMessage(data.message || 'Password change failed.');
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
        <p>Enter your email address to receive a reset token.</p>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {isEmailValid && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>
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
            {isEmailValid ? 'Change Password' : 'Send Reset Token'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;