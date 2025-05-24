import React, { useEffect, useState, useContext } from 'react';
import { X, Edit2, Calendar } from 'lucide-react';
import './MyBooking.css';
import { LanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import axios from 'axios';
import downloadIcon from '../../assets/download.png';


const apiURL = import.meta.env.VITE_API_BASE_URL;

const MyBooking = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState(null);
  const [modifyingBookingId, setModifyingBookingId] = useState(null);
  const [newFlightId, setNewFlightId] = useState('');


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
        if (!response.ok) throw new Error(`${t("failedToFetchBookings")}`);
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
        alert(`${t("bookingCancelledSuccessfully")}`);
        setBookings(prevBookings =>
          prevBookings.map(b =>
            b.id === bookingId ? { ...b, status: 'Canceled', isCanceled: true } : b
          )
        );
      } else if (response.status === 404) {
        alert(`${t("bookingNotFound")}.`);
      } else if (response.status === 400) {
        alert(`${t("errCancelingBooking")}.`);
      } else {
        alert(`${t("unexpectedErr")}.`);
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert(`${t("failedCancelingBooking")}.`);
    }
  };

  const handleModify = async (bookingId) => {
    if (!newFlightId) {
      alert(`${t("pleaseEnterNewFlightId")}.`);
      return;
    }
  
    try {
      const response = await fetch(`${apiURL}/Booking/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newFlightId: parseInt(newFlightId, 10) }),
      });
  
      if (response.status === 204) {
        alert(`${t("bookingSuccessfullyModified")}.`);
        setModifyingBookingId(null);
        setNewFlightId('');
      } else if (response.status === 400) {
        const errorText = await response.text();
        alert(`${t("badRequest")}: ${errorText}`);
      } else if (response.status === 404) {
        alert(`${t("bookingNotFound")}.`);
      } else {
        alert(`${t("unexpectedModifyErr")}.`);
      }
    } catch (error) {
      console.error(`${t("errorModifyingBooking")}:`, error);
      alert(`${t("failedToModifyBooking")}`);
    }
  };

  const handleDownloadICS = async (bookingId) => {
  try {
    const response = await axios.get(`${apiURL}/Booking/export-ics/${bookingId}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/calendar' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'flight-booking.ics');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Download failed', error);
    alert(t("failedToDownloadICS"));
  }
};
  

  if (loading) {
    return <div className="booking-containera">{t("loadingYourBookings")}</div>;
  }

  return (
    <div className="booking-containera">
      <h1 className="booking-title">{t("yourBookings")}</h1>

      <div className="booking-tabs">
        <button
          className={`booking-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          {t("upcoming")}
        </button>
        <button
          className={`booking-tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          {t("past")}
        </button>
        <button
          className={`booking-tab ${activeTab === 'canceled' ? 'active' : ''}`}
          onClick={() => setActiveTab('canceled')}
        >
          {("Cancelled")}
        </button>
      </div>

      <div className="booking-list">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <div
              key={booking.id}
              className={`booking-item ${booking.isPast ? `${t("past")}` : ''} ${booking.isCanceled ? `${t("canceled")}` : ''}`}
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
                  <span className="booking-detail-label">{`${t("Flight")}:`}</span>
                  <span className="booking-detail-value">{booking.flightNumber}</span>
                </div>
                <div className="booking-detail">
                  <span className="booking-detail-label">{`${t("seat")}:`}</span>
                  <span className="booking-detail-value">{booking.seat}</span>
                </div>
                <div className="booking-detail">
                  <span className="booking-detail-label">{`${t("seatClass")}:`}</span>
                  <span className="booking-detail-value">{booking.seatClass}</span>
                </div>
                <div className="booking-detail">
                  <span className="booking-detail-label">{`${t("status")}:`}</span>
                  <span className="booking-detail-value">{booking.status}</span>
                </div>
              </div>

              <div className="booking-actions">

  {!booking.isPast && !booking.isCanceled && (
    <>
      <button
        className="booking-action-button modify"
        onClick={() =>
          setModifyingBookingId(
            modifyingBookingId === booking.id ? null : booking.id
          )
        }
      >
        <Edit2 size={16} />
        <span>{t("modify")}</span>
      </button>

      {modifyingBookingId === booking.id && (
        <div className="modify-input-group">
          <input
            type="number"
            placeholder={t("enterNewFlightId")}
            value={newFlightId}
            onChange={(e) => setNewFlightId(e.target.value)}
            className="modify-input"
          />
          <button
            className="booking-action-button confirm"
            onClick={() => handleModify(booking.id)}
          >
            {t("confirm")}
          </button>
        </div>
      )}

      <button
        className="booking-action-button cancel"
        onClick={() => handleCancel(booking.id)}
      >
        <X size={16} />
        <span>{t("cancel")}</span>
      </button>

      <button
  className="booking-action-button download"
  onClick={() => handleDownloadICS(booking.id)}
  title={t("downloadICS")}
>
  <img src={downloadIcon} alt="Download ICS" className="download-ics" />
</button>

    </>
  )}
</div>


            </div>
          ))
        ) : (
          <div className="booking-empty">
            <p>{t("noBookingsFound", { tab: activeTab })}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooking;
