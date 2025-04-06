import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import './Header.css';

const HeaderAdmin = () => {
    const navigate = useNavigate();

    return (
        <header className="header">
            <div className="logo">Airline System</div>
            <nav>
                <Button text="Home" onClick={() => navigate('/admin-homepage')} />
                <Button text="Users" onClick={() => navigate('/user-management')} />
                <Button text="Aircrafts" onClick={() => navigate('/aircraft-management')} />
                <Button text="Destinations" onClick={() => navigate('/destination-management')} />


            </nav>
        </header>
    );
};

export default HeaderAdmin;
