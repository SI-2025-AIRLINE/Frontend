import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, Trash2, Edit } from 'lucide-react';
import Select from 'react-select';

function FareManagement() {
  const [fares, setFares] = useState([
    {
      id: '1',
      flightNumber: 'BA123',
      validFrom: '2024-03-01',
      validTo: '2024-10-31',
      firstClassPrice: 1200,
      businessClassPrice: 800,
      economyClassPrice: 300
    }
  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingFare, setEditingFare] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);

  const [newFare, setNewFare] = useState({
    flightNumber: '',
    validFrom: '',
    validTo: '',
    firstClassPrice: '',
    businessClassPrice: '',
    economyClassPrice: ''
  });

  const flights = [
    { 
      value: 'BA123', 
      label: 'BA123 (LHR → CDG)',
      validFrom: '2024-03-01',
      validTo: '2024-10-31'
    },
    { 
      value: 'BA456', 
      label: 'BA456 (LHR → JFK)',
      validFrom: '2024-03-01',
      validTo: '2024-12-31'
    },
    { 
      value: 'BA789', 
      label: 'BA789 (LHR → DXB)',
      validFrom: '2024-04-01',
      validTo: '2024-11-30'
    }
  ];

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '42px',
      borderColor: 'var(--gray-300)',
      '&:hover': {
        borderColor: 'var(--primary-color)'
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

  const handleAddFare = () => {
    if (!selectedFlight || !newFare.validFrom || !newFare.validTo) return;

    if (editingFare) {
      setFares(fares.map(fare => 
        fare.id === editingFare ? { ...newFare, id: editingFare } : fare
      ));
      setEditingFare(null);
    } else {
      setFares([...fares, {
        ...newFare,
        flightNumber: selectedFlight.value,
        id: Math.random().toString(36).substr(2, 9)
      }]);
    }

    setIsAddingNew(false);
    setNewFare({
      flightNumber: '',
      validFrom: '',
      validTo: '',
      firstClassPrice: '',
      businessClassPrice: '',
      economyClassPrice: ''
    });
    setSelectedFlight(null);
  };

  const handleEditFare = (fare) => {
    setEditingFare(fare.id);
    setNewFare({
      flightNumber: fare.flightNumber,
      validFrom: fare.validFrom,
      validTo: fare.validTo,
      firstClassPrice: fare.firstClassPrice,
      businessClassPrice: fare.businessClassPrice,
      economyClassPrice: fare.economyClassPrice
    });
    const flight = flights.find(f => f.value === fare.flightNumber);
    setSelectedFlight(flight);
    setIsAddingNew(true);
  };

  const handleDeleteFare = (id) => {
    setFares(fares.filter(f => f.id !== id));
  };

  const handleFlightSelect = (selected) => {
    setSelectedFlight(selected);
    if (selected) {
      setNewFare(prev => ({
        ...prev,
        validFrom: selected.validFrom,
        validTo: selected.validTo
      }));
    }
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
            <label className="form-label">{editingFare ? 'Flight' : 'Select Flight'}</label>
            <Select
              options={flights}
              value={selectedFlight}
              onChange={handleFlightSelect}
              styles={selectStyles}
              placeholder="Search for a flight..."
              isSearchable
              isDisabled={!!editingFare}
            />
          </div>

          <div className="flight-valid-container">
            <label className="form-label">Flight Valid:</label>
            <div className="flight-valid-dates">
              {selectedFlight ? (
                <>
                  <span>From {new Date(selectedFlight.validFrom).toLocaleDateString()}</span>
                  <span> To {new Date(selectedFlight.validTo).toLocaleDateString()}</span>
                </>
              ) : (
                <span>Select a flight to see validity.</span>
              )}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">From</label>
              <input
                type="date"
                className="form-input"
                value={newFare.validFrom}
                onChange={(e) => setNewFare({ ...newFare, validFrom: e.target.value })}
                min={selectedFlight?.validFrom}
                max={selectedFlight?.validTo}
              />
            </div>
            <div className="form-group">
              <label className="form-label">To</label>
              <input
                type="date"
                className="form-input"
                value={newFare.validTo}
                onChange={(e) => setNewFare({ ...newFare, validTo: e.target.value })}
                min={selectedFlight?.validFrom}
                max={selectedFlight?.validTo}
              />
            </div>
          </div>

          <div className="fare-inputs" style={{ display: 'flex', gap: '20px' }}>
            <div className="fare-input-group" style={{ flex: 1 }}>
              <label className="form-label">First Class Price</label>
              <input
                type="number"
                className="form-input"
                value={newFare.firstClassPrice}
                onChange={(e) => setNewFare({ ...newFare, firstClassPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="fare-input-group" style={{ flex: 1 }}>
              <label className="form-label">Business Class Price</label>
              <input
                type="number"
                className="form-input"
                value={newFare.businessClassPrice}
                onChange={(e) => setNewFare({ ...newFare, businessClassPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="fare-input-group" style={{ flex: 1 }}>
              <label className="form-label">Economy Class Price</label>
              <input
                type="number"
                className="form-input"
                value={newFare.economyClassPrice}
                onChange={(e) => setNewFare({ ...newFare, economyClassPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn" onClick={() => {
              setIsAddingNew(false);
              setEditingFare(null);
              setNewFare({
                flightNumber: '',
                validFrom: '',
                validTo: '',
                firstClassPrice: '',
                businessClassPrice: '',
                economyClassPrice: ''
              });
              setSelectedFlight(null);
            }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddFare}>
              <Save style={{ width: 16, height: 16, marginRight: 8 }} />
              {editingFare ? 'Update Fare' : 'Save Fare'}
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Flight</th>
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
                <td>{fare.flightNumber}</td>
                <td>{new Date(fare.validFrom).toLocaleDateString()} - {new Date(fare.validTo).toLocaleDateString()}</td>
                <td>{fare.firstClassPrice}</td>
                <td>{fare.businessClassPrice}</td>
                <td>{fare.economyClassPrice}</td>
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

