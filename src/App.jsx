import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
//import Header from './components/Header/Header';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import './App.css';
import New_button from './components/New_button/New_button';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import UpdateDetails from './pages/UpdateDetails/UpdateDetails';
import DestinationManagement from './pages/DestinationManagement/DestinationManagement';
import AircraftManagement from './pages/AircraftManagement/AircraftManagement';
import UserManagement from './pages/UserManagement/UserManagement';
import HeaderWrapper from './components/Header/HeaderWrapper';
import AdminHomePage from './pages/AdminHomePage/AdminHomePage';
import {FlightSearch} from './pages'


function App() {
  return (
    <Router>
      <div className="app-container">
        <HeaderWrapper />
        <Routes>
        
          <Route path="/" element={
            <div className="home-content">
              <h1>Welcome to SI 2025 Airline </h1>
              <h2>You can search, book, and manage flight tickets!</h2>
              <div className="home-buttons">
                <New_button label="Book flights" onClick={() => console.log('Book clicked')} />
                <Link to='/flight-search'>
                <New_button label="Search flights" />
                </Link>
              </div>
            </div>
          } />
          <Route path="/flight-search" element={<FlightSearch />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-profile" element={<UpdateDetails />} />
          <Route path="/destination-management" element={<DestinationManagement />} />
          <Route path="/aircraft-management" element={<AircraftManagement />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/admin-homepage" element={<AdminHomePage />} />
      </Routes>

      </div>
    </Router>
  );
}

export default App;