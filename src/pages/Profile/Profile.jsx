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
    password: '********',
    loyaltyPoints: '',
  });
  const [discountData, setDiscountData] = useState(null);

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
        throw new Error(`${t("userNotFoundInStorage")}`);
      }

      console.log('Fetched user ID from localStorage:', userId);

      // Fetch user data from API using the userId
      const response = await fetch(`${apiURL}/Customer/${userId}`);
      if (!response.ok) {
        throw new Error(`${t("failedToFetchUserData")}`);
      }

      const data = await response.json();

      console.log('Fetched user data from API:', data); // Log the API response for debugging

      if (!data || !data.id) {
        throw new Error(`${t("userDataInvalidOrIdMissing")}`);
      }

      // Update the state with user data
      setUserData({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        username: data.username,
        password: '********', // Hide password for security reasons
        loyaltyPoints: data.loyaltyPoints || '0', // Default to 0 if not available
      });
      fetchDiscountData(data.id);

    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  };
  const fetchDiscountData = async (customerId) => {
  try {
    const flightId = localStorage.getItem('flightId');
    if (!flightId) {
      console.error('Flight ID not found in localStorage');
      return;
    }

    const response = await fetch(`${apiURL}/Booking/customer/${customerId}/flight/${flightId}/discounts`);
    if (!response.ok) {
      throw new Error('Failed to fetch discount data');
    }

    const data = await response.json();
    console.log("Fetched discount data:", data);
    setDiscountData(data);
  } catch (error) {
    console.error('Error fetching discount data:', error.message);
  }
};

  const handleUpdateProfile = () => {
    // Navigate to update profile page
    window.location.href = '/update-profile';
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>{t("profileInformation")}</h2>

        <div className="profile-field">
          <label>ID</label>
          <div className="field-value">{userData.id || 'Not available'}</div>
        </div>

        <div className="profile-field">
          <label>{t("firstName")}</label>
          <div className="field-value">{userData.firstName}</div>
        </div>

        <div className="profile-field">
          <label>{t("lastName")}</label>
          <div className="field-value">{userData.lastName}</div>
        </div>

        <div className="profile-field">
          <label>{t("email")}</label>
          <div className="field-value">{userData.email}</div>
        </div>

        <div className="profile-field">
          <label>{t("userName")}</label>
          <div className="field-value">{userData.username}</div>
        </div>

        <div className="profile-field">
          <label>{t("loyaltyPoints")}</label>
          <div className="field-value">{userData.loyaltyPoints} {t("loyaltyPointsValue")}</div>
        </div>
        {discountData && (
  <>
    <div className="profile-field">
      <label>{t("loyaltyClass")}</label>
      <div className="field-value">{discountData.loyaltyClass}</div>
    </div>

    <div className="profile-field">
      <label>{t("discountPercentage")}</label>
      <div className="field-value">{discountData.discountPercentage}%</div>
    </div>

    <div className="profile-field">
      <label>{t("discountedPrices")}</label>
      <div className="field-value">
        Economy: {discountData.discountedPrices.economyPrice} | 
        Business: {discountData.discountedPrices.businessPrice} | 
        First: {discountData.discountedPrices.firstClassPrice}
      </div>
    </div>
  </>
)}

        <div className="profile-field">
          <label>{t("password")}</label>
          <div className="field-value">{userData.password}</div>
        </div>
        

        <button className="update-button" onClick={handleUpdateProfile}>
        
         {t("updateProfile")}
        </button>
        <button
    type="submit"
    className="update-button"
    onClick={() => navigate('/')}
  >{t("backToHomePage")}</button>
  <button
    type="submit"
    className="update-button"
    onClick={() => navigate('/my-booking')}
  >{t("myBookings")}</button>
      </div>
    </div>
  );
}

export default Profile;
