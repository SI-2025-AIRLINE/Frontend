import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';  
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    if (token && name) {
      setUserName(name); 
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setUserName(''); 
    navigate('/login'); 
  };

  return (
    <header className="header">
      <div className="logo">Airline System</div>
      <nav>
        <Button text="Flights" onClick={() => navigate('/')} />
        
        {/* Provjeravamo da li je korisnik logiran */}
        {userName ? (
          <div className="user-info">
            <Button text={userName} onClick={() => navigate('/update-profile')} />
            <Button text="Logout" onClick={handleLogout} /> {/* Logout dugme */}
          </div>
        ) : (
          <>
            <Button text="Register" onClick={() => navigate('/register')} />
            <Button text="Login" onClick={() => navigate('/login')} />
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
