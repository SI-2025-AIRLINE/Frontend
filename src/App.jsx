import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import Header from './components/Header/Header';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import './App.css';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import UpdateDetails from './pages/UpdateDetails/UpdateDetails';
import DestinationManagement from './pages/DestinationManagement/DestinationManagement';
import AircraftManagement from './pages/AircraftManagement/AircraftManagement';
import UserManagement from './pages/UserManagement/UserManagement';
import HeaderWrapper from './components/Header/HeaderWrapper';
import AdminHomePage from './pages/AdminHomePage/AdminHomePage';
import Profile from './pages/Profile/Profile';
import FlightScheduling from './pages/FlightScheduling/FlightScheduling';
import BookFlight from './pages/BookFlight/BookFlight';
import AirlineManagement from './pages/AirlineManagement/AirlineManagement'
import { FlightSearch } from './pages';

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
              <div className="home-buttons"></div>
            </div>
            } 
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-profile" element={<UpdateDetails />} />
          <Route path="/admin/destinationManagement" element={<DestinationManagement />} />
          <Route path="/admin/aircraftManagement" element={<AircraftManagement />} />
          <Route path="/admin/userManagement" element={<UserManagement />} />
          <Route path="/admin/flightScheduling" element={<FlightScheduling />} />
          <Route path="/admin" element={<AdminHomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/flight-search" element={<FlightSearch />} />
          <Route path="/bookflight" element={<BookFlight />} />
          <Route path="/admin/airlineManagement" element={<AirlineManagement />} />
      </Routes>

      </div>
    </Router>
  );
}

export default App;