import React, { useState } from 'react';
import { PlusCircle, Save, Trash2, Edit } from 'lucide-react';
import EditIcon from '../../components/Icons/pencil.svg';
import './FlightScheduling.css';

function FlightScheduling() {
  const [flights, setFlights] = useState([
    {
      id: '1',
      flightNumber: 'BA123',
      schedule: '1234567',
      departureTime: '10:00',
      arrivalTime: '12:00',
      origin: 'LHR',
      destination: 'CDG',
      aircraftType: '747',
      validFrom: '2024-03-01',
      validTo: '2024-10-31'
    }
  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [newFlight, setNewFlight] = useState({
    flightNumber: '',
    schedule: '',
    departureTime: '',
    arrivalTime: '',
    origin: '',
    destination: '',
    aircraftType: '747',
    validFrom: '',
    validTo: ''
  });

  // State for managing day selections
  const [selectedDays, setSelectedDays] = useState({
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false
  });

  const handleDayChange = (day) => {
    const newSelectedDays = { ...selectedDays, [day]: !selectedDays[day] };
    setSelectedDays(newSelectedDays);

    // Convert selected days to schedule string
    const schedule = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      .map((d, index) => newSelectedDays[d] ? (index + 1).toString() : '')
      .join('');

    setNewFlight({ ...newFlight, schedule });
  };

  const initializeDaysFromSchedule = (schedule) => {
    const days = {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false
    };

    schedule.split('').forEach((day) => {
      const index = parseInt(day) - 1;
      const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      if (index >= 0 && index < 7) {
        days[dayKeys[index]] = true;
      }
    });

    return days;
  };

  const handleEditFlight = (flight) => {
    setEditingFlight(flight.id);
    setNewFlight(flight);
    setSelectedDays(initializeDaysFromSchedule(flight.schedule));
    setIsAddingNew(true);
  };

  const handleAddFlight = () => {
    if (!newFlight.flightNumber || !newFlight.origin || !newFlight.destination) return;
    
    if (editingFlight) {
      setFlights(flights.map(flight => 
        flight.id === editingFlight ? { ...newFlight } : flight
      ));
      setEditingFlight(null);
    } else {
      setFlights([...flights, {
        ...newFlight,
        id: Math.random().toString(36).substr(2, 9)
      }]);
    }

    setIsAddingNew(false);
    setNewFlight({
      flightNumber: '',
      schedule: '',
      departureTime: '',
      arrivalTime: '',
      origin: '',
      destination: '',
      aircraftType: '747',
      validFrom: '',
      validTo: ''
    });
    setSelectedDays({
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false
    });
  };

  const handleDeleteFlight = (id) => {
    setFlights(flights.filter(f => f.id !== id));
  };

  const formatSchedule = (schedule) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return schedule.split('').map((day, index) => 
      day === (index + 1).toString() ? days[index] : ''
    ).filter(Boolean).join(', ');
  };

  return (
    <div className="container">
      <div className="section-header">
        <h2>Flight Scheduling</h2>
        <button className="btn btn-primary" onClick={() => setIsAddingNew(true)}>
          <PlusCircle style={{ width: 20, height: 20, marginRight: 8 }} />
          Add New Flight
        </button>
      </div>

      {isAddingNew && (
        <div className="form-container">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            {editingFlight ? 'Edit Flight' : 'Add New Flight'}
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="time-label">Flight Number</label>
              <input
                type="text"
                className="form-input"
                value={newFlight.flightNumber}
                onChange={(e) => setNewFlight({ ...newFlight, flightNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="time-label">Aircraft Type</label>
              <select
                className="form-select"
                value={newFlight.aircraftType}
                onChange={(e) => setNewFlight({ ...newFlight, aircraftType: e.target.value })}
              >
                <option value="747">Boeing 747</option>
                <option value="320">Airbus 320</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Flight Schedule</label>
            <div className="schedule-checkboxes">
              {[
                { key: 'mon', label: 'Mon' },
                { key: 'tue', label: 'Tue' },
                { key: 'wed', label: 'Wed' },
                { key: 'thu', label: 'Thu' },
                { key: 'fri', label: 'Fri' },
                { key: 'sat', label: 'Sat' },
                { key: 'sun', label: 'Sun' }
              ].map(({ key, label }) => (
                <label key={key} className="schedule-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedDays[key]}
                    onChange={() => handleDayChange(key)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="time-label">Origin</label>
              <input
                type="text"
                className="form-input"
                value={newFlight.origin}
                placeholder="LHR"
                onChange={(e) => setNewFlight({ ...newFlight, origin: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="form-group">
              <label className="time-label">Destination</label>
              <input
                type="text"
                className="form-input"
                value={newFlight.destination}
                placeholder="CDG"
                onChange={(e) => setNewFlight({ ...newFlight, destination: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div className="form-group time-inputs">
            <label className="form-label">Flight Times</label>
            <div className="time-input-group">
              <div className="time-input">
                <span className="time-label">Departure</span>
                <input
                  type="time"
                  className="form-input"
                  value={newFlight.departureTime}
                  onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })}
                />
              </div>
              <div className="time-separator">→</div>
              <div className="time-input">
                <span className="time-label">Arrival</span>
                <input
                  type="time"
                  className="form-input"
                  value={newFlight.arrivalTime}
                  onChange={(e) => setNewFlight({ ...newFlight, arrivalTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="time-label">Valid From</label>
              <input
                type="date"
                className="form-input"
                value={newFlight.validFrom}
                onChange={(e) => setNewFlight({ ...newFlight, validFrom: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="time-label">Valid To</label>
              <input
                type="date"
                className="form-input"
                value={newFlight.validTo}
                onChange={(e) => setNewFlight({ ...newFlight, validTo: e.target.value })}
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn" onClick={() => {
              setIsAddingNew(false);
              setEditingFlight(null);
              setNewFlight({
                flightNumber: '',
                schedule: '',
                departureTime: '',
                arrivalTime: '',
                origin: '',
                destination: '',
                aircraftType: '747',
                validFrom: '',
                validTo: ''
              });
            }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddFlight}>
              <Save style={{ width: 16, height: 16, marginRight: 8 }} />
              {editingFlight ? 'Update Flight' : 'Save Flight'}
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Flight</th>
              <th>Schedule</th>
              <th>Route</th>
              <th>Times</th>
              <th>Aircraft</th>
              <th>Validity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => (
              <tr key={flight.id}>
                <td>{flight.flightNumber}</td>
                <td>{formatSchedule(flight.schedule)}</td>
                <td>{flight.origin} → {flight.destination}</td>
                <td>{flight.departureTime} - {flight.arrivalTime}</td>
                <td>{flight.aircraftType === '747' ? 'Boeing 747' : 'Airbus 320'}</td>
                <td>{new Date(flight.validFrom).toLocaleDateString()} - {new Date(flight.validTo).toLocaleDateString()}</td>
                <td>
                  <div className="button-group">
                    <button className="btn btn-icon" onClick={() => handleEditFlight(flight)}>
                      <img src={EditIcon} alt="Edit" style={{ width: 20, height: 20 }} />
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDeleteFlight(flight.id)}>
                      <Trash2 style={{ width: 20, height: 20 }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FlightScheduling;