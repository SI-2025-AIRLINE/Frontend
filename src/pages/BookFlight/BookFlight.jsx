import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookFlight.css';
import VisualSeatSelection from '../VisualSeatSelection/VisualSeatSelection';

function BookFlight() {
  const [step, setStep] = useState('passengers');
  const [passengerCount, setPassengerCount] = useState({ adults: 1, children: 0 });
  const [currentPassenger, setCurrentPassenger] = useState(0);
  const [passengers, setPassengers] = useState([]);
  const [showBoardingPasses, setShowBoardingPasses] = useState(false);
  const [selectedSeatDisplay, setSelectedSeatDisplay] = useState('');

  // Load flight and seat configuration from sessionStorage
  const flight = JSON.parse(sessionStorage.getItem('flight'));
  const seatData = JSON.parse(sessionStorage.getItem('seats') || '[]');

  // Compute available seats per class
  const seatCounts = seatData.reduce((acc, { seatClass, rowCount, seatsPerRow }) => {
    const key = seatClass.toUpperCase().replace(' ', '_');
    acc[key] = rowCount * seatsPerRow;
    return acc;
  }, { ECONOMY: 0, BUSINESS: 0, FIRST_CLASS: 0 });

  // Prepare display data for flight
  const departureTime = new Date(flight.departureTime);
  const flightData = {
    from: flight.departureDestination.name,
    to: flight.arrivalDestination.name,
    date: flight.departureTime.split('T')[0],
    time: flight.departureTime.split('T')[1].slice(0, 5),
    flight: flight.flightNumber,
    gate: '18',
    boardTill: new Date(departureTime.getTime() - 20 * 60000).toTimeString().slice(0, 5)
  };

  // Initialize passengers array based on count
  const handlePassengerCountSubmit = () => {
    const total = passengerCount.adults + passengerCount.children;
    setPassengers(new Array(total).fill(null).map(() => ({
      name: '', surname: '', dateOfBirth: '', gender: '', email: '', seat: '', class: 'BUSINESS'
    })));
    setStep('details');
  };

  // Save passenger details or complete booking
  const handlePassengerDetailsSubmit = (data) => {
    const updated = [...passengers];
    updated[currentPassenger] = data;
    setPassengers(updated);

    if (currentPassenger < passengers.length - 1) {
      setCurrentPassenger(currentPassenger + 1);
      setSelectedSeatDisplay('');
    } else {
      setShowBoardingPasses(true);
    }
  };

  // Seat selection handlers
  const handleSeatSelection = () => setStep('seat-selection');
  const handleSelectedSeatDisplay = (seat) => setSelectedSeatDisplay(seat);

  // Handle field changes, including class change
  const handlePassengerInputChange = (field, value) => {
    if (field === 'class') {
      const total = passengers.length;
      if (seatCounts[value] >= total) {
        // Reset seats but keep other passenger data
        const updated = passengers.map(p => ({ ...p, class: value, seat: '' }));
        setPassengers(updated);
        setSelectedSeatDisplay('');
        // Reset to first passenger details for new seat selection
        setCurrentPassenger(0);
        setStep('details');
      } else {
        alert(`Not enough seats available in ${value} class.`);
      }
      return;
    }
    // Normal update for other fields
    const updated = [...passengers];
    updated[currentPassenger] = { ...updated[currentPassenger], [field]: value };
    setPassengers(updated);
  };

  // Boarding pass component
  const BoardingPass = ({ passenger }) => (
    <div className="boarding-pass-card">
      <div className="boarding-pass-header">
        <div className="airline-info">
          <div className="airline-logo-circle"><span className="plane-icon">✈</span></div>
          <h2>Sky Airlines</h2>
        </div>
        <div className="pass-labels">
          <span className="boarding-label">Boarding pass</span>
          <span className="class-type">{passenger.class}</span>
        </div>
      </div>
      <div className="boarding-pass-content">
        <div className="left-section">
          <div className="barcode" />
          <div className="passenger-details">
            <div className="detail-group">
              <span className="label">Passenger name</span>
              <span className="value">{passenger.name.toUpperCase()} {passenger.surname.toUpperCase()}</span>
            </div>
            <div className="detail-group"><span className="label">From</span><span className="value">{flightData.from}</span></div>
            <div className="detail-group"><span className="label">To</span><span className="value">{flightData.to}</span></div>
          </div>
        </div>
        <div className="middle-section">
          <div className="detail-group"><span className="label">Date</span><span className="value">{flightData.date}</span></div>
          <div className="detail-group"><span className="label">Flight</span><span className="value">{flightData.flight}</span></div>
          <div className="detail-group"><span className="label">Gate</span><span className="value">{flightData.gate}</span></div>
        </div>
        <div className="right-section">
          <div className="detail-group"><span className="label">Time</span><span className="value">{flightData.time}</span></div>
          <div className="detail-group"><span className="label">Seat</span><span className="value">{passenger.seat}</span></div>
          <div className="detail-group"><span className="label">Board till</span><span className="value">{flightData.boardTill}</span></div>
        </div>
      </div>
    </div>
  );

  // Show boarding passes when complete
  if (showBoardingPasses) {
    return (
      <div className="boarding-passes-container">
        <div className="boarding-passes-grid">
          {passengers.map((p, i) => <BoardingPass key={i} passenger={p} />)}
        </div>
      </div>
    );
  }

  // Passenger count step
  if (step === 'passengers') {
    return (
      <div className="passenger-count-container">
        <h2>How many passengers?</h2>
        <div className="passenger-inputs">
          <div><label>Adults:</label><input type="number" min="1" value={passengerCount.adults} onChange={e => setPassengerCount({ ...passengerCount, adults: parseInt(e.target.value) })} /></div>
          <div><label>Children:</label><input type="number" min="0" value={passengerCount.children} onChange={e => setPassengerCount({ ...passengerCount, children: parseInt(e.target.value) })} /></div>
        </div>
        <button className="update-button" onClick={handlePassengerCountSubmit}>Continue</button>
      </div>
    );
  }

  // Seat selection step
  if (step === 'seat-selection') {
    return (
      <div className="booking-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <VisualSeatSelection
          passengers={passengers}
          currentPassenger={currentPassenger}
          onSave={updated => { setPassengers(updated); setStep('details'); }}
          onCancel={() => setStep('details')}
          onSeatSelect={handleSelectedSeatDisplay}
        />
        {selectedSeatDisplay && <p className="seat-info">You selected seat: <strong>{selectedSeatDisplay}</strong></p>}
      </div>
    );
  }

  // Passenger details form
  const passenger = passengers[currentPassenger] || {};
  const totalPassengers = passengers.length;

  // Only display classes that have some seats available
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
              <h3>Passenger {currentPassenger + 1} of {totalPassengers}</h3>
              <form onSubmit={e => {
                e.preventDefault();
                if (!passenger.seat) {
                  alert('Please select a seat before proceeding.');
                  return;
                }
                handlePassengerDetailsSubmit(passenger);
              }}>
                <div className="form-group">
                  <input type="text" name="name" placeholder="First Name" required value={passenger.name} onChange={e => handlePassengerInputChange('name', e.target.value)} />
                  <input type="text" name="surname" placeholder="Last Name" required value={passenger.surname} onChange={e => handlePassengerInputChange('surname', e.target.value)} />
                </div>
                <div className="form-group">
                  <input type="date" name="dateOfBirth" required value={passenger.dateOfBirth} onChange={e => handlePassengerInputChange('dateOfBirth', e.target.value)} />
                  <select name="gender" required value={passenger.gender} onChange={e => handlePassengerInputChange('gender', e.target.value)}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <input type="email" name="email" placeholder="Email" required value={passenger.email} onChange={e => handlePassengerInputChange('email', e.target.value)} />
                </div>
                <div className="flight-details">
                  <div><p>From: {flightData.from}</p><p>To: {flightData.to}</p></div>
                  <div><p>Date: {flightData.date}</p><p>Time: {flightData.time}</p></div>
                  <div><p>Flight: {flightData.flight}</p><p>Gate: {flightData.gate}</p></div>
                  <div className="seat-group">
                    <button type="button" onClick={handleSeatSelection} className="seat-button">Select Seat</button>
                  </div>
                  <div>
                  {passenger.seat && <p className="seat-info">Selected seat: <strong>{passenger.seat}</strong></p>}
                  </div>
                </div>
                <button className="update-button">{currentPassenger < totalPassengers - 1 ? 'Next Passenger' : 'Complete Booking'}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookFlight;
