import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookFlight.css';

function BookFlight() {
  const navigate = useNavigate();
  const [step, setStep] = useState('passengers');
  const [passengerCount, setPassengerCount] = useState({ adults: 1, children: 0 });
  const [currentPassenger, setCurrentPassenger] = useState(0);
  const [passengers, setPassengers] = useState([]);
  const [showBoardingPasses, setShowBoardingPasses] = useState(false);
//trenutni hardkodirani dio
  const flightData = {
    from: 'NEW YORK',
    to: 'LONDON',
    date: '25JUL',
    time: '10:30',
    flight: 'A 0137',
    gate: '18',
    boardTill: '10:10'
  };

  const handlePassengerCountSubmit = () => {
    const totalPassengers = passengerCount.adults + passengerCount.children;
    setPassengers(new Array(totalPassengers).fill({
      name: '',
      surname: '',
      dateOfBirth: '',
      gender: '',
      email: '',
      seat: '39F',
      class: 'BUSINESS'
    }));
    setStep('details');
  };

  const handlePassengerDetailsSubmit = (passengerData) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[currentPassenger] = passengerData;
    setPassengers(updatedPassengers);

    if (currentPassenger < passengers.length - 1) {
      setCurrentPassenger(currentPassenger + 1);
    } else {
      setShowBoardingPasses(true);
    }
  };

  const handleSeatSelection = () => {
    navigate('/seat-selection');
  };

  const BoardingPass = ({ passenger }) => (
    <div className="boarding-pass-card">
      <div className="boarding-pass-header">
        <div className="airline-info">
          <div className="airline-logo-circle">
            <span className="plane-icon">✈</span>
          </div>
          <h2>Sky Airlines</h2>
        </div>
        <div className="pass-labels">
          <span className="boarding-label">Boarding pass</span>
          <span className="class-type">{passenger.class}</span>
        </div>
      </div>
      <div className="boarding-pass-content">
        <div className="left-section">
          <div className="barcode"></div>
          <div className="passenger-details">
            <div className="detail-group">
              <span className="label">Passenger name</span>
              <span className="value">{passenger.name.toUpperCase()} {passenger.surname.toUpperCase()}</span>
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
          <div className="detail-group">
            <span className="label">Gate</span>
            <span className="value">{flightData.gate}</span>
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

  if (showBoardingPasses) {
    return (
      <div className="boarding-passes-container">
        <div className="boarding-passes-grid">
          {passengers.map((passenger, index) => (
            <BoardingPass key={index} passenger={passenger} />
          ))}
        </div>
      </div>
    );
  }

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
              onChange={(e) => setPassengerCount({ ...passengerCount, adults: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label>Children:</label>
            <input
              type="number"
              min="0"
              value={passengerCount.children}
              onChange={(e) => setPassengerCount({ ...passengerCount, children: parseInt(e.target.value) })}
            />
          </div>
        </div>
        <button className="update-button" onClick={handlePassengerCountSubmit}>Continue</button>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="booking-scroll-wrapper">
        <div className="boarding-pass">
          <div className="airline-header">
            <div className="airline-logo"></div>
            <h1>SI 2025 Airline</h1>
            <select
              className="class-select"
              value={passengers[currentPassenger]?.class || 'BUSINESS'}
              onChange={(e) => {
                const updated = [...passengers];
                updated[currentPassenger].class = e.target.value;
                setPassengers(updated);
              }}
            >
              <option value="ECONOMY">ECONOMY</option>
              <option value="BUSINESS">BUSINESS</option>
              <option value="FIRST CLASS">FIRST CLASS</option>
            </select>
          </div>

          <div className="flight-info">
            <div className="passenger-info">
              <h3>Passenger {currentPassenger + 1} of {passengers.length}</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                handlePassengerDetailsSubmit({
                  name: e.target.name.value,
                  surname: e.target.surname.value,
                  dateOfBirth: e.target.dateOfBirth.value,
                  gender: e.target.gender.value,
                  email: e.target.email.value,
                  seat: '39F',
                  class: passengers[currentPassenger]?.class || 'BUSINESS'
                });
              }}>
                <div className="form-group">
                  <input type="text" name="name" placeholder="First Name" required />
                  <input type="text" name="surname" placeholder="Last Name" required />
                </div>
                <div className="form-group">
                  <input type="date" name="dateOfBirth" required />
                  <select name="gender" required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <input type="email" name="email" placeholder="Email" required />
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
                    <p>Gate: {flightData.gate}</p>
                  </div>
                  <button type="button" onClick={handleSeatSelection} className="seat-button">
                    Select Seat
                  </button>
                </div>
                <button className="update-button">
                  {currentPassenger < passengers.length - 1 ? 'Next Passenger' : 'Complete Booking'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookFlight;
