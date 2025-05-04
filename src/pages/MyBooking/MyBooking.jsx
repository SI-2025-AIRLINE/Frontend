import React, { useEffect, useState } from 'react';
import { X, Edit2, Calendar } from 'lucide-react';
import './MyBooking.css';

const apiURL = import.meta.env.VITE_API_BASE_URL;

const MyBooking = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      setCustomerId(storedId);
    } else {
      console.error('User ID not found in localStorage');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${apiURL}/Customer/${customerId}/mybookings?customerId=${customerId}`);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const data = await response.json();

        const formattedBookings = data.map(booking => ({
          id: booking.id,
          passengerName: booking.extraReservations,
          flightNumber: `FL-${booking.flightId}`,
          departureDate: new Date(booking.flight?.departureTime).toLocaleDateString(),
          departureTime: new Date(booking.flight?.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seat: booking.seatNumber,
          status: booking.status,
          seatClass: booking.seatClass,
          isPast: new Date(booking.flight?.departureTime) < new Date(),
          isCanceled: booking.status === 'Canceled',
          profileImage: 'https://i.ibb.co/MxcDmrTB/blank-profile-picture-973460-1280.png'
        }));

        setBookings(formattedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchBookings();
    }
  }, [customerId]);

  const filteredBookings = bookings.filter(booking =>
    (activeTab === 'upcoming' && !booking.isPast && !booking.isCanceled) ||
    (activeTab === 'past' && booking.isPast && !booking.isCanceled) ||
    (activeTab === 'canceled' && booking.isCanceled)
  );

  const handleCancel = async (bookingId) => {
    try {
      const response = await fetch(`${apiURL}/Booking/${bookingId}/cancel`, {
        method: 'PATCH',
      });

      if (response.status === 204) {
        alert('Booking canceled successfully.');
        setBookings(prevBookings =>
          prevBookings.map(b =>
            b.id === bookingId ? { ...b, status: 'Canceled', isCanceled: true } : b
          )
        );
      } else if (response.status === 404) {
        alert('Booking not found.');
      } else if (response.status === 400) {
        alert('Error canceling booking.');
      } else {
        alert('An unexpected error occurred.');
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Failed to cancel booking.');
    }
  };

  const handleModify = async (bookingId) => {
    const newFlightId = prompt('Enter the new Flight ID:');
    if (!newFlightId) return;

    try {
      const response = await fetch(`${apiURL}/Booking/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newFlightId: parseInt(newFlightId, 10) }),
      });

      if (response.status === 204) {
        alert('Booking successfully modified.');
        // Optionally reload or update local state here
      } else if (response.status === 400) {
        const errorText = await response.text();
        alert(`Bad request: ${errorText}`);
      } else if (response.status === 404) {
        alert('Booking not found.');
      } else {
        alert('An unexpected error occurred while modifying.');
      }
    } catch (error) {
      console.error('Error modifying booking:', error);
      alert('Failed to modify booking.');
    }
  };

  if (loading) {
    return <div className="booking-containera">Loading your bookings...</div>;
  }

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
        <button
          className={`booking-tab ${activeTab === 'canceled' ? 'active' : ''}`}
          onClick={() => setActiveTab('canceled')}
        >
          Canceled
        </button>
      </div>

      <div className="booking-list">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <div
              key={booking.id}
              className={`booking-item ${booking.isPast ? 'past' : ''} ${booking.isCanceled ? 'canceled' : ''}`}
            >
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
                    <span>{booking.departureDate} at {booking.departureTime}</span>
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
                  <span className="booking-detail-label">Seat Class:</span>
                  <span className="booking-detail-value">{booking.seatClass}</span>
                </div>
                <div className="booking-detail">
                  <span className="booking-detail-label">Status:</span>
                  <span className="booking-detail-value">{booking.status}</span>
                </div>
              </div>

              <div className="booking-actions">
                {!booking.isPast && !booking.isCanceled && (
                  <button
                    className="booking-action-button modify"
                    onClick={() => handleModify(booking.id)}
                  >
                    <Edit2 size={16} />
                    <span>Modify</span>
                  </button>
                )}
                {!booking.isCanceled && (
                  <button
                    className="booking-action-button cancel"
                    onClick={() => handleCancel(booking.id)}
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                )}
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
