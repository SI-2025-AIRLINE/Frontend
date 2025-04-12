import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import './Header.css';
import { Link } from 'react-router-dom';

const HeaderAdmin = () => {
    const navigate = useNavigate();

    return (
        <header className="header">
                  <Link to="/admin-homepage" className="logo" style={{ textDecoration: 'none', color: 'white' }}>
              Airline System
            </Link>
            <nav>
                <Button text="Home" onClick={() => navigate('/admin-homepage')} />
                <Button text="Users" onClick={() => navigate('/user-management')} />
                <Button text="Aircrafts" onClick={() => navigate('/aircraft-management')} />
                <Button text="Destinations" onClick={() => navigate('/destination-management')} />
                <Button text="Flights" onClick={() => navigate('/flight-scheduling')} />


            </nav>
        </header>
    );
};

export default HeaderAdmin;
