import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../Button/Button';  
import './Header.css';
import profileImage from '../../assets/profile.png'; 

const Header = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('userName'); 
  const fullName = username;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('surname');
    localStorage.removeItem('userName');  
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'white' }}>
          Airline System
        </Link>
      </div>

      {token && fullName && (
        <div className="header-center">
          <Button text="Flights" onClick={() => navigate('/flight-search')} />
        </div>
      )}

      <div className="header-right">
        {token && fullName ? (
          <>
            <img
              src={profileImage}  
              alt="Profile"
              className="profile-icon"
              onClick={() => navigate('/profile')}
            />
            <Button text="Logout" onClick={handleLogout} />
          </>
        ) : (
          <>
            <Button text="Register" onClick={() => navigate('/register')} />
            <Button text="Login" onClick={() => navigate('/login')} />
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
