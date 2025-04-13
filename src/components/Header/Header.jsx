import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';  
import './Header.css';
import { Link } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  
  const token = localStorage.getItem('token');
  //const name = localStorage.getItem('name');
  //const surname = localStorage.getItem('surname');
  const username = localStorage.getItem('userName'); 
  
  
  const fullName =  username;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('surname');
    localStorage.removeItem('userName');  
    navigate('/login');
  };

  return (
    <header className="header">
      <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'white' }}>
  Airline System
</Link>

      <nav>
        <Button text="Flights" onClick={() => navigate('/flight-search')} />

        {token && fullName ? (
          <div className="user-info">
            <Button text={`Hello, ${fullName}`} onClick={() => navigate('/update-profile')} />
            <Button text="Logout" onClick={handleLogout} />
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
