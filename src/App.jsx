import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import FlightScheduling from './pages/FlightScheduling/FlightScheduling';


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
      <New_button label="Search flights" onClick={() => console.log('Search clicked')} />
    </div>
            </div>
          } />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-profile" element={<UpdateDetails />} />
          <Route path="/admin/destinationManagement" element={<DestinationManagement />} />
          <Route path="/admin/aircraftManagement" element={<AircraftManagement />} />
          <Route path="/admin/userManagement" element={<UserManagement />} />
          <Route path="/admin" element={<AdminHomePage />} />
          <Route path="/admin/flightScheduling" element={<FlightScheduling />} />
      </Routes>

      </div>
    </Router>
  );
}

export default App;