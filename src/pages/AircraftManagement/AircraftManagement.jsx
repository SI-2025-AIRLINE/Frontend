import React, { useState } from 'react';
import './AircraftManagement.css';

// Importuj lokalne ikone iz foldera "icons"
import PlaneIcon from '../../components/Icons/plane.svg';
import PlusCircleIcon from '../../components/Icons/circle-plus.svg';
import EditIcon from '../../components/Icons/pencil.svg';
import Trash2Icon from '../../components/Icons/trash-2.svg';
import SaveIcon from '../../components/Icons/save.svg';

function AircraftManagment() {
  const [aircraft, setAircraft] = useState([
    {
      id: '1',
      model: 'Boeing 747',
      description: 'Long-haul wide-body aircraft',
      registrationNumber: 'N123BA',
      seatConfiguration: {
        firstClass: { total: 10, seatsPerRow: 2 },
        businessClass: { total: 20, seatsPerRow: 4 },
        economyClass: { total: 120, seatsPerRow: 6 }
      }
    }
  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editAircraft, setEditAircraft] = useState(null);

  const [newAircraft, setNewAircraft] = useState({
    model: '',
    description: '',
    registrationNumber: '',
    seatConfiguration: {
      firstClass: { total: 0, seatsPerRow: 0 },
      businessClass: { total: 0, seatsPerRow: 0 },
      economyClass: { total: 0, seatsPerRow: 0 }
    }
  });

  const handleAddAircraft = () => {
    if (!newAircraft.registrationNumber) return;

    setAircraft([...aircraft, {
      ...newAircraft,
      id: Math.random().toString(36).substr(2, 9)
    }]);
    setIsAddingNew(false);
    setNewAircraft({
      model: '',
      description: '',
      registrationNumber: '',
      seatConfiguration: {
        firstClass: { total: 0, seatsPerRow: 0 },
        businessClass: { total: 0, seatsPerRow: 0 },
        economyClass: { total: 0, seatsPerRow: 0 }
      }
    });
  };

  const handleEditAircraft = (id) => {
    const aircraftToEdit = aircraft.find((a) => a.id === id);
    setEditAircraft({ ...aircraftToEdit });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setAircraft(aircraft.map(a => a.id === editAircraft.id ? editAircraft : a));
    setIsEditing(false);
    setEditAircraft(null);
  };

  const handleDeleteAircraft = (id) => {
    setAircraft(aircraft.filter(a => a.id !== id));
  };

  return (
    <div className="container">
      <div className="header">
        <div className="header-title">
          <img src={PlaneIcon} alt="Plane" className="icon" style={{ width: 32, height: 32, color: '#2563eb' }} />
          <h1>Aircraft Fleet Management</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddingNew(true)}>
          <img src={PlusCircleIcon} alt="Add New" style={{ width: 20, height: 20, marginRight: 8 }} />
          Add New Aircraft
        </button>
      </div>

      {(isAddingNew || isEditing) && (
        <div className="form-container">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            {isEditing ? 'Edit Aircraft' : 'Add New Aircraft'}
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                type="text"
                className="form-input"
                value={isEditing ? editAircraft.model : newAircraft.model}
                onChange={(e) => isEditing
                  ? setEditAircraft({ ...editAircraft, model: e.target.value })
                  : setNewAircraft({ ...newAircraft, model: e.target.value })}
                placeholder="Enter Aircraft Model"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-input"
                value={isEditing ? editAircraft.description : newAircraft.description}
                onChange={(e) => isEditing
                  ? setEditAircraft({ ...editAircraft, description: e.target.value })
                  : setNewAircraft({ ...newAircraft, description: e.target.value })}
                placeholder="Enter Description"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Registration Number</label>
              <input
                type="text"
                className="form-input"
                value={isEditing ? editAircraft.registrationNumber : newAircraft.registrationNumber}
                onChange={(e) => isEditing
                  ? setEditAircraft({ ...editAircraft, registrationNumber: e.target.value })
                  : setNewAircraft({ ...newAircraft, registrationNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: '1.5rem' }}>
            {['firstClass', 'businessClass', 'economyClass'].map((classType) => (
              <div key={classType}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                  {classType.charAt(0).toUpperCase() + classType.slice(1).replace(/([A-Z])/g, ' $1')}
                </h3>
                <div className="form-group">
                  <label className="form-label">Total Seats</label>
                  <input
                    type="number"
                    className="form-input"
                    value={isEditing ? editAircraft.seatConfiguration[classType].total : newAircraft.seatConfiguration[classType].total}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isEditing) {
                        setEditAircraft({
                          ...editAircraft,
                          seatConfiguration: {
                            ...editAircraft.seatConfiguration,
                            [classType]: {
                              ...editAircraft.seatConfiguration[classType],
                              total: value
                            }
                          }
                        });
                      } else {
                        setNewAircraft({
                          ...newAircraft,
                          seatConfiguration: {
                            ...newAircraft.seatConfiguration,
                            [classType]: {
                              ...newAircraft.seatConfiguration[classType],
                              total: value
                            }
                          }
                        });
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Seats per Row</label>
                  <input
                    type="number"
                    className="form-input"
                    value={isEditing ? editAircraft.seatConfiguration[classType].seatsPerRow : newAircraft.seatConfiguration[classType].seatsPerRow}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isEditing) {
                        setEditAircraft({
                          ...editAircraft,
                          seatConfiguration: {
                            ...editAircraft.seatConfiguration,
                            [classType]: {
                              ...editAircraft.seatConfiguration[classType],
                              seatsPerRow: value
                            }
                          }
                        });
                      } else {
                        setNewAircraft({
                          ...newAircraft,
                          seatConfiguration: {
                            ...newAircraft.seatConfiguration,
                            [classType]: {
                              ...newAircraft.seatConfiguration[classType],
                              seatsPerRow: value
                            }
                          }
                        });
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="actions">
            <button className="btn" onClick={() => { setIsAddingNew(false); setIsEditing(false); }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={isEditing ? handleSaveEdit : handleAddAircraft}>
              <img src={SaveIcon} alt="Save" style={{ width: 16, height: 16, marginRight: 8 }} />
              {isEditing ? 'Save Changes' : 'Save Aircraft'}
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Description</th>
              <th>Registration</th>
              <th>First Class</th>
              <th>Business Class</th>
              <th>Economy Class</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {aircraft.map((plane) => (
              <tr key={plane.id}>
                <td>{plane.model}</td>
                <td>{plane.description}</td>
                <td>{plane.registrationNumber}</td>
                <td>{plane.seatConfiguration.firstClass.total} seats ({plane.seatConfiguration.firstClass.seatsPerRow}/row)</td>
                <td>{plane.seatConfiguration.businessClass.total} seats ({plane.seatConfiguration.businessClass.seatsPerRow}/row)</td>
                <td>{plane.seatConfiguration.economyClass.total} seats ({plane.seatConfiguration.economyClass.seatsPerRow}/row)</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-warning" onClick={() => handleEditAircraft(plane.id)}>
                    <img src={EditIcon} alt="Edit" style={{ width: 20, height: 20 }} />
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDeleteAircraft(plane.id)}>
                    <img src={Trash2Icon} alt="Delete" style={{ width: 20, height: 20 }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AircraftManagment;
