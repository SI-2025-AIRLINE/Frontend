import React from 'react';
import { Link } from 'react-router-dom';
import HeaderWrapper from '../../components/Header/HeaderWrapper'; 
import './AdminHomePage.css';

function AdminPage() {
    return (
        <div className="admin-page">
            <HeaderWrapper /> 

            <section className="admin-welcome">
                <h2>Welcome, Admin!</h2>
                <p>Here you can manage users, destinations, and other important tasks. Use the navigation above to get started.</p>
            </section>
        </div>
    );
}

export default AdminPage;
