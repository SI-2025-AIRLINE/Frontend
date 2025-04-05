import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    birthDate: '',
    email: '',
    password: '',
    phone: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.name || !formData.surname || !formData.email || !formData.password || !formData.phone) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://your-api-url.com/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleRegister = () => {
    window.location.href = 'https://your-api-url.com/api/auth/google';
  };

  return (
    <div className="register-container">
      <Header />
      <div className="register-form-container">
        <h2>Register</h2>
        <div className="message-container">
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input type="text" name="surname" placeholder="Surname" value={formData.surname} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <button onClick={handleGoogleRegister} className="google-login-button">
          Sign up with Google
        </button>
      </div>
    </div>
  );
};

export default Register;
