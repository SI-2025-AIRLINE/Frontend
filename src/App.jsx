import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { LanguageProvider } from './context/LanguageContext';
import { useTranslation } from './hooks/useTranslation';

import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
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
import MyBooking from './pages/MyBooking/MyBooking';
import AirlineManagement from './pages/AirlineManagement/AirlineManagement';
import { FlightSearch } from './pages';
import FareManagement from './pages/FareManagement/FareManagement';
import AirlineAdminAnalytics from './pages/Analytics/Analytics';
import SupportTickets from './pages/SupportTickets/SupportTickets';
import FeedbackAdmin from './pages/FeedbackAdmin/FeedbackAdmin';
import TicketsDashboard from './pages/TicketsDashboard/TicketsDashboard';
import CreateTicket from './pages/CreateTicket/CreateTicket';
import CustomerChat from './pages/CustomerChat/CustomerChat';
import Feedback from './pages/Feedback/Feedback';
import ChatAdminManagement from './components/ChatAdminManagement/ChatAdminManagement';
import ExportICS from './pages/ExportICSPage/ExportICS';

function App() {
  const isAdminRoute = location.pathname.startsWith('/admin');
  return (
    <LanguageProvider>
      <Router>
        <div className="app-container">
          <HeaderWrapper />
          <Routes>
            <Route path="/" element={<Home />} />
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
            <Route path="/book-flight" element={<BookFlight />} />
            <Route path="/my-booking" element={<MyBooking />} />
            <Route path="/admin/airlineManagement" element={<AirlineManagement />} />
            <Route path="/admin/fareManagement" element={<FareManagement />} />
            <Route path="/admin/analytics" element={<AirlineAdminAnalytics />} />
            <Route path="/admin/supportTickets" element={<SupportTickets />} />
            <Route path="/admin/feedbackAdmin" element={<FeedbackAdmin />} />
            <Route path="/tickets-dashboard" element={<TicketsDashboard />} />
            <Route path="/create-ticket" element={<CreateTicket />} />
            <Route path="/customer-chat" element={<CustomerChat />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/export-ics" element={<ExportICS />} />
          </Routes>
          {isAdminRoute && <ChatAdminManagement />}
        </div>
      </Router>
    </LanguageProvider>
  );
}

const Home = () => {
  const { t } = useTranslation();
  return (
    <div className="home-content">
      <h1>{t('message1')}</h1>
      <h2>{t('message2')}</h2>
    </div>
  );
};

export default App;
