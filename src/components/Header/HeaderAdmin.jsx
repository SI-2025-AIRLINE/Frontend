import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import './Header.css';
import { Link } from 'react-router-dom';

const HeaderAdmin = () => {
    const navigate = useNavigate();

    return (
        <header className="header">
                  <Link to="/admin" className="logo" style={{ textDecoration: 'none', color: 'white' }}>
              Airline System
            </Link>
            <nav>
                
                <Button text="Users" onClick={() => navigate('/admin/userManagement')} />
                <Button text="Aircrafts" onClick={() => navigate('/admin/aircraftManagement')} />
                <Button text="Destinations" onClick={() => navigate('/admin/destinationManagement')} />
                <Button text="Flights" onClick={() => navigate('/admin/flightScheduling')} />


            </nav>
        </header>
    );
};

export default HeaderAdmin;
