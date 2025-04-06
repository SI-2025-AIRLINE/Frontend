import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/'); 
    }
  }, [navigate]);

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://your-api-url.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('name', data.name);
      localStorage.setItem('surname', data.surname); 

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

/*
// PROVJERA
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setLoading(true);

  if (!formData.email || !formData.password) {
    setError('Email and password are required.');
    setLoading(false);
    return;
  }

  setTimeout(() => {
    const mockResponse = {
      token: 'mockToken123456', 
      userName: 'Una Sahbaz'      
    };

    localStorage.setItem('token', mockResponse.token);
    localStorage.setItem('userName', mockResponse.userName);

    setSuccess('Login successful! Redirecting...');
    setTimeout(() => navigate('/'), 2000); 
  }, 1000); 

  setLoading(false);
};
*/

  const handleGoogleLogin = () => {
    window.location.href = 'https://your-api-url.com/api/auth/google';
  };

  return (
    <div className="login-container">
      <Header />
      <div className="login-form-container">
        <h2>Login</h2>

        {(error || success) && (
          <div className="message-container">
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <button onClick={handleGoogleLogin} className="google-login-button">
          Sign in with Google
        </button>

        <Link to="/reset-password" className="forgot-password">
          Forgot your password?
        </Link>
      </div>
    </div>
  );
};

export default Login;
