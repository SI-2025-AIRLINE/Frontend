import { useState, useEffect } from 'react';
import './BookFlight.css';
import VisualSeatSelection from './VisualSeatSelection.jsx';

const apiURL = import.meta.env.VITE_API_BASE_URL;

export default function BookFlight() {
  const [step, setStep] = useState('passengers');
  const [passengerCount, setPassengerCount] = useState({ adults: 1, children: 0 });
  const [currentPassenger, setCurrentPassenger] = useState(0);
  const [passengers, setPassengers] = useState([]);
  const [showBoardingPasses, setShowBoardingPasses] = useState(false);
  const [selectedSeatDisplay, setSelectedSeatDisplay] = useState('');
  const [bookedSeats, setBookedSeats] = useState([]);
  
  


  const totalPassengerss = passengerCount.adults + passengerCount.children;

  const customerId = localStorage.getItem('userId');
  const flight = JSON.parse(sessionStorage.getItem('flight') || '{}');
  const seatData = JSON.parse(sessionStorage.getItem('seats') || '[]');
  

  
  useEffect(() => {
    const getBookedSeats = async () => {
      try {
        const res = await fetch(`${apiURL}/Bookings/seats/${flight.id}`,{
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        const parsed = data.flatMap(str => {
          const cleaned = /^[EBF]/.test(str) ? str.slice(1) : str;
          return cleaned.match(/\d+[A-Z]/g) || [];
        });
        setBookedSeats(parsed);
      } catch (err) {
        console.error('Error fetching booked seats:', err);
      }
    };
    if (flight.id) getBookedSeats();
  }, [flight.id]);


  const postBookedSeats = async (updatedPassengers) => {
    try {
      const classLetter = updatedPassengers[0].class === 'ECONOMY' ? 'E' : updatedPassengers[0].class === 'BUSINESS' ? 'B' : 'F';

      const seatsOnly = updatedPassengers
        .map(p => p.seat)
        .join('');
  
      const seatNumbers = classLetter + seatsOnly;
  
      const extraReservations = updatedPassengers
        .map(p => `${p.name} ${p.surname}`)
        .join(',');
  
      const payload = {
        flightId: flight.id,
        customerId,
        seatNumber: seatNumbers,
        extraReservations
      };
  
      const res = await fetch(`${apiURL}/Bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
  
      if (!res.ok) console.error('Failed to post booking:', res.status);
    } catch (err) {
      console.error('Error posting booking:', err);
    }
  };

  // Compute available seats per class
  const seatCounts = seatData.reduce((acc, { seatClass, rowCount, seatsPerRow }) => {
    const key = seatClass.toUpperCase().replace(' ', '_');
    acc[key] = rowCount * seatsPerRow;
    return acc;
  }, { ECONOMY: 0, BUSINESS: 0, FIRST_CLASS: 0 });


  const departureTime = new Date(flight.departureTime);
  const flightData = {
    from: flight.departureDestination?.name || '',
    to: flight.arrivalDestination?.name || '',
    date: flight.departureTime?.split('T')[0] || '',
    time: flight.departureTime?.split('T')[1]?.slice(0, 5) || '',
    flight: flight.flightNumber || '',
    boardTill: flight.departureTime
      ? new Date(departureTime.getTime() - 20 * 60000).toTimeString().slice(0, 5)
      : ''
  };

  const handlePassengerCountSubmit = () => {
    const total = passengerCount.adults + passengerCount.children;
    setPassengers(new Array(total).fill(null).map(() => ({
      name: '', surname: '', dateOfBirth: '', gender: '', email: '', seat: '', class: 'BUSINESS'
    })));
    setStep('details');
  };

  const handlePassengerDetailsSubmit = (data) => {
    const updated = [...passengers];
    updated[currentPassenger] = data;
    setPassengers(updated);

    if (currentPassenger < passengers.length - 1) {
      setCurrentPassenger(currentPassenger + 1);
      setSelectedSeatDisplay('');
    } else {
      setShowBoardingPasses(true);
      postBookedSeats(updated);
    }
  };

  const handleSeatSelection = () => setStep('seat-selection');
  const handleSelectedSeatDisplay = (seat) => setSelectedSeatDisplay(seat);

  const handlePassengerInputChange = (field, value) => {
    if (field === 'class') {
      if (seatCounts[value] >= passengers.length) {
        const reset = passengers.map(p => ({ ...p, class: value, seat: '' }));
        setPassengers(reset);
        setCurrentPassenger(0);
        setStep('details');
      } else {
        alert(`Not enough seats available in ${value}.`);
      }
      return;
    }
    const updated = [...passengers];
    updated[currentPassenger] = { ...updated[currentPassenger], [field]: value };
    setPassengers(updated);
  };

  // BoardingPass component
  const BoardingPass = ({ passenger, flightData }) => (
    <div className="boarding-pass-card">
      <div className="boarding-pass-header">
        <div className="airline-info">
          <div className="airline-logo-circle">
            <span className="plane-icon">✈</span>
          </div>
          <h2>SI 2025 Airline</h2>
        </div>
        <div className="pass-labels">
          <span className="boarding-label">Boarding pass</span>
          <span className="class-type">{passenger.class.replace('_', ' ')}</span>
        </div>
      </div>
      <div className="boarding-pass-content">
        <div className="left-section">
          <div className="barcode"></div>
          <div className="passenger-details">
            <div className="detail-group">
              <span className="label">Passenger name</span>
              <span className="value">
                {passenger.name.toUpperCase()} {passenger.surname.toUpperCase()}
              </span>
            </div>
            <div className="detail-group">
              <span className="label">From</span>
              <span className="value">{flightData.from}</span>
            </div>
            <div className="detail-group">
              <span className="label">To</span>
              <span className="value">{flightData.to}</span>
            </div>
          </div>
        </div>
        <div className="middle-section">
          <div className="detail-group">
            <span className="label">Date</span>
            <span className="value">{flightData.date}</span>
          </div>
          <div className="detail-group">
            <span className="label">Flight</span>
            <span className="value">{flightData.flight}</span>
          </div>
        </div>
        <div className="right-section">
          <div className="detail-group">
            <span className="label">Time</span>
            <span className="value">{flightData.time}</span>
          </div>
          <div className="detail-group">
            <span className="label">Seat</span>
            <span className="value">{passenger.seat}</span>
          </div>
          <div className="detail-group">
            <span className="label">Board till</span>
            <span className="value">{flightData.boardTill}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render boarding passes
  if (showBoardingPasses) {
    return (
      <div className="boarding-passes-container">
        <div className="boarding-passes-grid">
          {passengers.map((p, i) => (
            <BoardingPass key={i} passenger={p} flightData={flightData} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            className="submit-button"
            onClick={() => window.location.href = '/flight-search'}
          >
            Finalize
          </button>
        </div>
      </div>
    );
  }

  // Render passenger-count step
  if (step === 'passengers') {
    return (
      <div className="passenger-count-container">
      <h2>How many passengers?</h2>
      <div className="passenger-inputs">
        <div>
          <label>Adults:</label>
          <input
            type="number"
            min="1"
            value={passengerCount.adults}
            onChange={(e) => {
              const newAdults = parseInt(e.target.value) || 0;
              const total = newAdults + passengerCount.children;
              if (total <= 5) {
                setPassengerCount({ ...passengerCount, adults: newAdults });
              }
            }}
          />
        </div>
        <div>
          <label>Children:</label>
          <input
            type="number"
            min="0"
            value={passengerCount.children}
            onChange={(e) => {
              const newChildren = parseInt(e.target.value) || 0;
              const total = passengerCount.adults + newChildren;
              if (total <= 5) {
                setPassengerCount({ ...passengerCount, children: newChildren });
              }
            }}
          />
        </div>
      </div>

      {totalPassengerss > 5 && (
        <p style={{ color: "red" }}>Maximum number of passengers is 5.</p>
      )}

      <button
        className="update-button"
        onClick={handlePassengerCountSubmit}
        disabled={totalPassengerss > 5}
      >
        Continue
      </button>
    </div>
    );
  }

  // Render seat-selection step - Benjamin Uzunovic
  if (step === 'seat-selection') {
    return (
      <div className="booking-container">
        <VisualSeatSelection
          passengers={passengers}
          currentPassenger={currentPassenger}
          bookedSeats={bookedSeats}
          onSave={updated => { 
            setPassengers(updated); 
            setStep('details'); 
          }}
          onCancel={() => setStep('details')}
          onSeatSelect={handleSelectedSeatDisplay}
        />
      </div>
    );
  }

  const passenger = passengers[currentPassenger] || {};
  const totalPassengers = passengers.length;
  const classOptions = ['ECONOMY', 'BUSINESS', 'FIRST_CLASS'].filter(c => seatCounts[c] > 0);

  return (
    <div className="booking-container">
      <div className="booking-scroll-wrapper">
        <div className="boarding-pass">
          <div className="airline-header">
            <div className="airline-logo" />
            <h1>SI 2025 Airline</h1>
            <select
              className="class-select"
              value={passenger.class}
              onChange={e => handlePassengerInputChange('class', e.target.value)}
            >
              {classOptions.map(cls => (
                <option key={cls} value={cls}>
                  {cls.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="flight-info">
            <div className="passenger-info">
              <h3>
                Passenger {currentPassenger + 1} of {totalPassengers}
              </h3>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!passenger.seat) {
                    alert('Please select a seat before proceeding.');
                    return;
                  }
                  handlePassengerDetailsSubmit(passenger);
                }}
              >
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="First Name"
                    required
                    value={passenger.name}
                    onChange={e => handlePassengerInputChange('name', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    required
                    value={passenger.surname}
                    onChange={e => handlePassengerInputChange('surname', e.target.value)}
                  />
                </div>
                {/* Date of birth and gender field */}
<div className="form-group">
  {(() => {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];
    const isChild = currentPassenger >= passengerCount.adults;

    const minDateChild = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    const maxDateChild = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    const maxDateAdult = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate());
    const minDateAdult = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());

    return (
      <>
        <input
          type="date"
          required
          value={passenger.dateOfBirth}
          onChange={e => handlePassengerInputChange('dateOfBirth', e.target.value)}
          min={formatDate(isChild ? minDateChild : minDateAdult)}
          max={formatDate(isChild ? maxDateChild : maxDateAdult)}
        />
        <select
          required
          value={passenger.gender}
          onChange={e => handlePassengerInputChange('gender', e.target.value)}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </>
    );
  })()}
</div>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={passenger.email}
                    onChange={e => handlePassengerInputChange('email', e.target.value)}
                  />
                </div>
                <div className="flight-details">
                  <div>
                    <p>From: {flightData.from}</p>
                    <p>To: {flightData.to}</p>
                  </div>
                  <div>
                    <p>Date: {flightData.date}</p>
                    <p>Time: {flightData.time}</p>
                  </div>
                  <div>
                    <p>Flight: {flightData.flight}</p>
                   
                  </div>
                  <div className="seat-group">
                    <button type="button" className="seat-button" onClick={handleSeatSelection}>
                      Select Seat
                    </button>
                  </div>
                  {passenger.seat && (
                    <div>
                      <p className="seat-info">
                        Selected seat: <strong>{passenger.seat}</strong>
                      </p>
                    </div>
                  )}
                </div>
                <button className="update-button">
                  {currentPassenger < totalPassengers - 1 ? 'Next Passenger' : 'Complete Booking'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
