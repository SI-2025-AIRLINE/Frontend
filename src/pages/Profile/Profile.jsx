import React, { useState, useEffect, useContext } from 'react';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const apiURL = import.meta.env.VITE_API_BASE_URL;

function Profile() {
  const { language, setLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();
  const [userData, setUserData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '********'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get user ID from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found in localStorage');
        throw new Error('User ID not found in localStorage');
      }

      console.log('Fetched user ID from localStorage:', userId);

      // Fetch user data from API using the userId
      const response = await fetch(`${apiURL}/Customer/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();

      console.log('Fetched user data from API:', data); // Log the API response for debugging

      if (!data || !data.id) {
        throw new Error('User data is invalid or ID is missing');
      }

      // Update the state with user data
      setUserData({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        username: data.username,
        password: '********', // Hide password for security reasons
      });
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  };

  const handleUpdateProfile = () => {
    // Navigate to update profile page
    window.location.href = '/update-profile';
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Profile Information</h2>

        <div className="profile-field">
          <label>ID</label>
          <div className="field-value">{userData.id || 'Not available'}</div>
        </div>

        <div className="profile-field">
          <label>First Name</label>
          <div className="field-value">{userData.firstName}</div>
        </div>

        <div className="profile-field">
          <label>Last Name</label>
          <div className="field-value">{userData.lastName}</div>
        </div>

        <div className="profile-field">
          <label>Email</label>
          <div className="field-value">{userData.email}</div>
        </div>

        <div className="profile-field">
          <label>Username</label>
          <div className="field-value">{userData.username}</div>
        </div>

        <div className="profile-field">
          <label>Password</label>
          <div className="field-value">{userData.password}</div>
        </div>

        <button className="update-button" onClick={handleUpdateProfile}>
        
         Update Profile
        </button>
        <button
    type="submit"
    className="update-button"
    onClick={() => navigate('/')}
  >Back to home page</button>
  <button
    type="submit"
    className="update-button"
    onClick={() => navigate('/my-booking')}
  >My Bookings</button>
      </div>
    </div>
  );
}

export default Profile;
