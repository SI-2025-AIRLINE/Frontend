import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './Login.css';

const apiURL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/login');
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
  
    if (!formData.username || !formData.password) {
      setError('Username and password are required.');
      setLoading(false);
      return;
    }
  
    try {
      console.log('Requesting login with:', formData);
  
      const response = await fetch(`${apiURL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
  
      console.log('Response status:', response.status);
      const data = await response.json();
  
      console.log('Response data:', data);
  
      if (!response.ok) throw new Error(data.message || 'Login failed');
  
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('name', data.firstName);
      localStorage.setItem('surname', data.lastName); 
      localStorage.setItem('userName', data.username); 
      localStorage.setItem('role', data.role); 
      
       
  
       setSuccess('Login successful! Redirecting...');
       setTimeout(() => {
         if (data.role === 'Admin') {
           navigate('/admin');  
         } else {
           navigate('/');  
         } 
        window.location.reload(); 
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    }
    setLoading(false);
  };
  

  return (
    <div className="login-container">
      
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
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
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

        <Link to="/reset-password" className="forgot-password">
          Forgot your password?
        </Link>
      </div>
    </div>
  );
};

export default Login;
