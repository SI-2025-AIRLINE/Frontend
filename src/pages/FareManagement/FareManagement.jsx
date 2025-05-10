import React, { useState } from 'react';
import { PlusCircle, Save, Trash2, Edit, DollarSign } from 'lucide-react';
import Select from 'react-select';
import './FareManagement.css'
function FareManagement() {
  const [fares, setFares] = useState([
    {
      id: '1',
      code: 'FARE001',
      airline: 'British Airways',
      flights: ['BA123', 'BA456'],
      origin: 'LHR',
      destination: 'CDG',
      validFrom: '2024-03-01',
      validTo: '2024-10-31',
      firstClassPrice: 1200,
      businessClassPrice: 800,
      economyClassPrice: 300
    }
  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingFare, setEditingFare] = useState(null);
  const [selectedFlights, setSelectedFlights] = useState([]);
  const [flightNumber, setFlightNumber] = useState('');
  const [isFlightRangeMode, setIsFlightRangeMode] = useState(false);
  const [fieldsLocked, setFieldsLocked] = useState(false); //ZAKLJUCAVANJE

  const [newFare, setNewFare] = useState({
    code: '',
    airline: null,
    flightNumberFrom: '',
    flightNumberTo: '',
    origin: null,
    destination: null,
    validFrom: '',
    validTo: '',
    firstClassPrice: '',
    businessClassPrice: '',
    economyClassPrice: ''
  });

  const airlines = [
    { value: 'BA', label: 'British Airways' },
    { value: 'LH', label: 'Lufthansa' },
    { value: 'AF', label: 'Air France' }
  ];

  const airports = [
    { value: 'LHR', label: 'London Heathrow (LHR)' },
    { value: 'CDG', label: 'Paris Charles de Gaulle (CDG)' },
    { value: 'FRA', label: 'Frankfurt (FRA)' },
    { value: 'JFK', label: 'New York JFK (JFK)' }
  ];

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      borderColor: state.isDisabled ? 'var(--gray-200)' : 'var(--gray-300)',
      backgroundColor: state.isDisabled ? 'var(--gray-100)' : 'white',
      '&:hover': {
        borderColor: state.isDisabled ? 'var(--gray-200)' : 'var(--primary-color)'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? 'var(--primary-color)' : state.isFocused ? 'var(--gray-100)' : 'white',
      '&:active': {
        backgroundColor: 'var(--primary-color)'
      }
    })
  };

  const handleFlightRangeInput = (e, field) => {
    const value = e.target.value;
    setNewFare({ ...newFare, [field]: value });
    setIsFlightRangeMode(!!value || !!newFare[field === 'flightNumberFrom' ? 'flightNumberTo' : 'flightNumberFrom']);
  };

  const handleOriginDestinationChange = (selected, field) => {
    setNewFare({ ...newFare, [field]: selected });
    setIsFlightRangeMode(false);
    if (selected || newFare[field === 'origin' ? 'destination' : 'origin']) {
      setNewFare(prev => ({
        ...prev,
        flightNumberFrom: '',
        flightNumberTo: ''
      }));
    }
  };

  const handleAddFlights = () => {
    if (isFlightRangeMode) {
      if (!newFare.flightNumberFrom || !newFare.flightNumberTo || !newFare.airline) return;
      
      const prefix = newFare.airline.value;
      const start = parseInt(newFare.flightNumberFrom);
      const end = parseInt(newFare.flightNumberTo);
      
      const flights = [];
      for (let i = start; i <= end; i++) {
        flights.push(`${prefix}${i.toString().padStart(3, '0')}`);
      }
      
      setSelectedFlights([...new Set([...selectedFlights, ...flights])]);
      setNewFare({ ...newFare, flightNumberFrom: '', flightNumberTo: '' });
    } else {
      if (!newFare.origin || !newFare.destination || !newFare.airline) return;
      
      const flight = `${newFare.airline.value}${Math.floor(Math.random() * 900 + 100)}`;
      setSelectedFlights([...selectedFlights, flight]);
    }
    
    setIsFlightRangeMode(false);
    setFieldsLocked(true); // ZAKLJUČAJ SVE
  };

  const handleAddFlight = () => {
    if (!flightNumber) return;
    setSelectedFlights([...selectedFlights, flightNumber]);
    setFlightNumber('');
  };

  const handleRemoveFlight = (flight) => {
    setSelectedFlights(selectedFlights.filter(f => f !== flight));
  };

  const handleAddFare = () => {
    if (!newFare.code || !newFare.airline || !selectedFlights.length) return;
    
    const fareData = {
      ...newFare,
      id: editingFare || Math.random().toString(36).substr(2, 9),
      flights: selectedFlights,
      airline: newFare.airline.label,
      origin: newFare.origin?.value,
      destination: newFare.destination?.value
    };

    if (editingFare) {
      setFares(fares.map(fare => fare.id === editingFare ? fareData : fare));
      setEditingFare(null);
    } else {
      setFares([...fares, fareData]);
    }

    setIsAddingNew(false);
    resetForm();
  };

  const handleEditFare = (fare) => {
    setEditingFare(fare.id);
    setNewFare({
      ...fare,
      airline: airlines.find(a => a.label === fare.airline),
      origin: airports.find(a => a.value === fare.origin),
      destination: airports.find(a => a.value === fare.destination)
    });
    setSelectedFlights(fare.flights);
    setIsAddingNew(true);
  };

  const handleDeleteFare = (id) => {
    setFares(fares.filter(f => f.id !== id));
  };

  const resetForm = () => {
    setNewFare({
      code: '',
      airline: null,
      flightNumberFrom: '',
      flightNumberTo: '',
      origin: null,
      destination: null,
      validFrom: '',
      validTo: '',
      firstClassPrice: '',
      businessClassPrice: '',
      economyClassPrice: ''
    });
    setSelectedFlights([]);
    setIsFlightRangeMode(false);
    setFieldsLocked(false);
  };

  return (
    <div className="container">
      <div className="btn_add">
        <button className="btn btn-primary" onClick={() => setIsAddingNew(true)}>
          <PlusCircle style={{ width: 20, height: 20, marginRight: 8 }} />
          Add New Fare
        </button>
      </div>

      {isAddingNew && (
        <div className="form-container">
          <div className="form-group">
            <label className="form-label">Code</label>
            <input
              type="text"
              className="form-input"
              value={newFare.code}
              onChange={(e) => setNewFare({ ...newFare, code: e.target.value })}
              placeholder="Enter fare code"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Airline</label>
            <Select
              options={airlines}
              value={newFare.airline}
              onChange={(selected) => setNewFare({ ...newFare, airline: selected })}
              styles={selectStyles}
              placeholder="Select airline..."
              isSearchable
              isDisabled={!!editingFare || fieldsLocked} //ZAKLJUCAJ SVE
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Flight number from</label>
              <input
                type="text"
                className="form-input"
                value={newFare.flightNumberFrom}
                onChange={(e) => handleFlightRangeInput(e, 'flightNumberFrom')}
                placeholder="Start number"
                //disabled={!!(newFare.origin || newFare.destination)}
                disabled={fieldsLocked || !!editingFare || !!(newFare.origin || newFare.destination)} //ZAKLJUCAJ SVE
              />
            </div>
            <div className="form-group">
              <label className="form-label">Flight number to</label>
              <input
                type="text"
                className="form-input"
                value={newFare.flightNumberTo}
                onChange={(e) => handleFlightRangeInput(e, 'flightNumberTo')}
                placeholder="End number"
                //disabled={!!(newFare.origin || newFare.destination)}
                disabled={fieldsLocked ||!!editingFare || !!(newFare.origin || newFare.destination)} //ZAKLJUCAJ SVE
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Origin</label>
              <Select
                options={airports}
                value={newFare.origin}
                onChange={(selected) => handleOriginDestinationChange(selected, 'origin')}
                styles={selectStyles}
                placeholder="Select origin..."
                isSearchable
                isClearable
                //isDisabled={isFlightRangeMode}
                isDisabled={fieldsLocked || !!editingFare || !!(newFare.flightNumberFrom || newFare.flightNumberTo)} //ZAKLJUCAJ SVE
              />
            </div>
            <div className="form-group">
              <label className="form-label">Destination</label>
              <Select
                options={airports}
                value={newFare.destination}
                onChange={(selected) => handleOriginDestinationChange(selected, 'destination')}
                styles={selectStyles}
                placeholder="Select destination..."
                isSearchable
                isClearable
                //isDisabled={isFlightRangeMode}
                 isDisabled={fieldsLocked || !!editingFare || !!(newFare.flightNumberFrom || newFare.flightNumberTo)} //ZAKLJUCAJ SVE 
              />
            </div>
          </div>

          {((newFare.flightNumberFrom && newFare.flightNumberTo) || 
            (newFare.origin && newFare.destination)) && !fieldsLocked && (
            <div className="form-group" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleAddFlights}>
                Add Flights
              </button>
            </div>
          )}

          <div className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Flight number</label>
              <input
                type="text"
                className="form-input"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="Enter flight number"
              />
            </div>
            <button className="btn btn-primary" onClick={handleAddFlight}>
              Add Flight
            </button>
          </div>

          {selectedFlights.length > 0 && (
            <div className="selected-flights">
              <label className="form-label">Selected Flights</label>
              <div className="flight-chips">
                {selectedFlights.map((flight) => (
                  <div key={flight} className="flight-chip">
                    {flight}
                    <button
                      className="flight-chip-remove"
                      onClick={() => handleRemoveFlight(flight)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Valid From</label>
              <input
                type="date"
                className="form-input"
                value={newFare.validFrom}
                onChange={(e) => setNewFare({ ...newFare, validFrom: e.target.value })}
                min={new Date().toISOString().split("T")[0]} //OD DANASNJEG DATUMA
              />
            </div>
            <div className="form-group">
              <label className="form-label">Valid To</label>
              <input
                type="date"
                className="form-input"
                value={newFare.validTo}
                onChange={(e) => setNewFare({ ...newFare, validTo: e.target.value })}
                min={newFare.validFrom || new Date().toISOString().split("T")[0]} //OD FROM DATUMA
              />
            </div>
          </div>

          <div className="fare-inputs">
            <div className="fare-input-group">
              <label className="fare-label">First Class Price</label>
              <div className="price-input-wrapper">
                <input
                  type="number"
                  className="form-input"
                  value={newFare.firstClassPrice}
                  onChange={(e) => setNewFare({ ...newFare, firstClassPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="fare-input-group">
              <label className="fare-label">Business Class Price</label>
              <div className="price-input-wrapper">
                <input
                  type="number"
                  className="form-input"
                  value={newFare.businessClassPrice}
                  onChange={(e) => setNewFare({ ...newFare, businessClassPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="fare-input-group">
              <label className="fare-label">Economy Class Price</label>
              <div className="price-input-wrapper">
                <input
                  type="number"
                  className="form-input"
                  value={newFare.economyClassPrice}
                  onChange={(e) => setNewFare({ ...newFare, economyClassPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="actions">
            <button className="btn" onClick={() => {
              setIsAddingNew(false);
              setEditingFare(null);
              resetForm();
            }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddFare}>
              <Save style={{ width: 16, height: 16, marginRight: 8 }} />
              {editingFare ? 'Update Fare' : 'Add Fare'}
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Validity Period</th>
              <th>First Class</th>
              <th>Business Class</th>
              <th>Economy Class</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fares.map((fare) => (
              <tr key={fare.id}>
                <td>{fare.code}</td>
                <td>{new Date(fare.validFrom).toLocaleDateString()} - {new Date(fare.validTo).toLocaleDateString()}</td>
                <td>${fare.firstClassPrice}</td>
                <td>${fare.businessClassPrice}</td>
                <td>${fare.economyClassPrice}</td>
                <td>
                  <div className="button-group">
                    <button className="btn btn-icon" onClick={() => handleEditFare(fare)}>
                      <Edit style={{ width: 20, height: 20 }} />
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDeleteFare(fare.id)}>
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

export default FareManagement;