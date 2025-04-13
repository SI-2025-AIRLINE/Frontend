import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import './HeaderAdmin.css';
import { Link } from 'react-router-dom';

const HeaderAdmin = () => {
    const navigate = useNavigate();

    return (
        <header className="header">

            <div className="header-left">

                <Link to="/admin" className="logo" style={{ textDecoration: 'none', color: 'white' }}>
                    Airline System
                </Link>

            </div>

            <div className="header-center">
                <nav>

                    <Button text="Users" onClick={() => navigate('/admin/userManagement')} />
                    <Button text="Aircrafts" onClick={() => navigate('/admin/aircraftManagement')} />
                    <Button text="Destinations" onClick={() => navigate('/admin/destinationManagement')} />
                    <Button text="Flights" onClick={() => navigate('/admin/flightScheduling')} />

                </nav>

            </div>

            <div className="header-right">
                <Button text="Logout" onClick={() => navigate('/login')} />
            </div>

            <div>

            </div>

        </header>
    );
};

export default HeaderAdmin;
