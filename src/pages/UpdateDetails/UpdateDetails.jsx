import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import './UpdateDetails.css';

const apiURL = import.meta.env.VITE_API_BASE_URL;

const UpdateDetails = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: ''
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
  
    // Dinamički payload: samo uključujemo popunjena polja
    const payload = {};
    if (formData.name.trim() !== '') payload.firstName = formData.name;
    if (formData.surname.trim() !== '') payload.lastName = formData.surname;
    if (formData.email.trim() !== '') payload.email = formData.email;
    if (formData.password.trim() !== '') payload.password = formData.password;
  
    if (Object.keys(payload).length === 0) {
      setErrorMessage('Please fill in at least one field to update.');
      setSuccessMessage('');
      return;
    }
  
    try {
      const response = await fetch(`${apiURL}/Customer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong.');
      }
  
      const result = await response.text();
      setSuccessMessage(result || 'Profile updated successfully!');
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
              
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="surname"
                placeholder="Surname"
                value={formData.surname}
                onChange={handleChange}
                
              />
            </div>
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
                placeholder="New Password (leave empty to keep current)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="submit-button">Update Profile</button>
            <p className="info-note">Leave fields empty if you don't want to change them.</p>
          </form>
        ) : (
          <p className="not-logged-in">Please log in to access this page.</p>
        )}
      </div>
    </div>
  );
};

export default UpdateDetails;
