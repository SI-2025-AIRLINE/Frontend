import React, { useState } from 'react';
import { X, Edit2, Calendar, MapPin, Clock } from 'lucide-react';
import './MyBooking.css';

// Sample booking data - in a real app, this would come from an API
const bookingsData = [
  {
    id: 1,
    passengerName: 'Emina Sahbaz',
    flightNumber: 'FL1234',
    date: 'Sep 12, 2022',
    time: '5:00pm',
    seat: '12A',
    gate: 'G12',
    status: 'Confirmed',
    isPast: true,
    profileImage: 'https://i.ibb.co/MxcDmrTB/blank-profile-picture-973460-1280.png'
  },
  {
    id: 2,
    passengerName: 'Emina Sahbaz',
    flightNumber: 'FL5678',
    date: 'Sep 28, 2022',
    time: '5:00pm',
    seat: '14B',
    gate: 'G7',
    status: 'Confirmed',
    isPast: true,
    profileImage: 'https://i.ibb.co/MxcDmrTB/blank-profile-picture-973460-1280.png'
  },
  {
    id: 3,
    passengerName: 'Emina Sahbaz',
    flightNumber: 'FL9012',
    date: 'May 15, 2025',
    time: '10:30am',
    seat: '21C',
    gate: 'G3',
    status: 'Confirmed',
    isPast: false,
    profileImage: 'https://i.ibb.co/MxcDmrTB/blank-profile-picture-973460-1280.png'
  }
];

const MyBooking = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Filter bookings based on active tab
  const filteredBookings = bookingsData.filter(booking => 
    (activeTab === 'upcoming' && !booking.isPast) || 
    (activeTab === 'past' && booking.isPast)
  );

  const handleCancel = (bookingId) => {
    // In a real app, this would make an API call to cancel the booking
    console.log(`Cancelling booking ${bookingId}`);
    alert(`Booking ${bookingId} would be cancelled in a real application`);
  };

  const handleModify = (bookingId) => {
    // In a real app, this would navigate to a booking modification page
    console.log(`Modifying booking ${bookingId}`);
    alert(`You would be redirected to modify booking ${bookingId} in a real application`);
  };

  return (
    <div className="booking-containera">
      <h1 className="booking-title">Your Bookings</h1>
      
      <div className="booking-tabs">
        <button 
          className={`booking-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`booking-tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
      </div>
      
      <div className="booking-list">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <div key={booking.id} className={`booking-item ${booking.isPast ? 'past' : ''}`}>
              <div className="booking-profile">
                <img 
                  src={booking.profileImage} 
                  alt={booking.passengerName} 
                  className="booking-profile-image"
                />
                <div className="booking-profile-info">
                  <h3 className="booking-passenger-name">{booking.passengerName}</h3>
                  <div className="booking-date">
                    <Calendar size={14} />
                    <span>{booking.date} at {booking.time}</span>
                  </div>
                </div>
              </div>
              
              <div className="booking-details">
                <div className="booking-detail">
                  <span className="booking-detail-label">Flight:</span>
                  <span className="booking-detail-value">{booking.flightNumber}</span>
                </div>
                <div className="booking-detail">
                  <span className="booking-detail-label">Seat:</span>
                  <span className="booking-detail-value">{booking.seat}</span>
                </div>
                <div className="booking-detail">
                  <span className="booking-detail-label">Gate:</span>
                  <span className="booking-detail-value">{booking.gate}</span>
                </div>
                <div className="booking-detail">
                  <span className="booking-detail-label">Status:</span>
                  <span className="booking-detail-value">{booking.status}</span>
                </div>
              </div>
              
              <div className="booking-actions">
                {!booking.isPast && (
                  <button 
                    className="booking-action-button modify"
                    onClick={() => handleModify(booking.id)}
                  >
                    <Edit2 size={16} />
                    <span>Modify</span>
                  </button>
                )}
                <button 
                  className="booking-action-button cancel"
                  onClick={() => handleCancel(booking.id)}
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="booking-empty">
            <p>No {activeTab} bookings found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooking;