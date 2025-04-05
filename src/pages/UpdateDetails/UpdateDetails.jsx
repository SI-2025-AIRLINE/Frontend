import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import './UpdateDetails.css';

const UpdateDetails = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    birthDate: '',
    email: '',
    password: '',
    phone: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setErrorMessage('Authentication token not found.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong.');
      }

      const result = await response.json();
      setSuccessMessage('Profile updated successfully!');
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
      <Header />
      <div className="update-form-container">
        <h2>Update Profile</h2>
        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {token ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="surname"
                placeholder="Surname"
                value={formData.surname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="New Password (leave empty to keep current)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="submit-button">Update Profile</button>
          </form>
        ) : (
          <p className="not-logged-in">Please log in to access this page.</p>
        )}
      </div>
    </div>
  );
};

export default UpdateDetails;
