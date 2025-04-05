import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import './ResetPassword.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailValid) {
      try {
        const response = await fetch('http://localhost:5000/api/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (data.exists) {
          setIsEmailValid(true);
          setErrorMessage('');
        } else {
          setErrorMessage('Email not registered!');
        }
      } catch (error) {
        setErrorMessage('Server error. Please try again.');
      }
    } else {
      try {
        const response = await fetch('http://localhost:5000/api/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, oldPassword, newPassword }),
        });

        const data = await response.json();

        if (data.success) {
          alert('Password successfully changed!');
          setEmail('');
          setOldPassword('');
          setNewPassword('');
          setIsEmailValid(false);
          setErrorMessage('');
        } else {
          setErrorMessage(data.message || 'Password change failed.');
        }
      } catch (error) {
        setErrorMessage('Server error while resetting password.');
      }
    }
  };

  return (
    <div className="reset-password-container">
      <Header />
      <div className="reset-password-form-container">
        <h2>Reset Password</h2>
        <p>Enter your email address to reset your password.</p>
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
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
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
            </>
          )}

          <button type="submit" className="submit-button">
            {isEmailValid ? 'Change Password' : 'Verify Email'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
