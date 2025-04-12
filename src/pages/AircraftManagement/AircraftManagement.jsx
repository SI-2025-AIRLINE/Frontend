import React, { useState, useEffect } from 'react';
import './AircraftManagement.css';

// Import local icons
import PlusCircleIcon from '../../components/Icons/circle-plus.svg';
import EditIcon from '../../components/Icons/pencil.svg';
import Trash2Icon from '../../components/Icons/trash-2.svg';
import SaveIcon from '../../components/Icons/save.svg';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AircraftManagement() {
  const [aircraft, setAircraft] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editAircraft, setEditAircraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [newAircraft, setNewAircraft] = useState({
    model: '',
    description: '',
    registrationNumber: '',
    // We'll handle seat configurations separately
  });

  // Fetch all aircraft on component mount
  useEffect(() => {
    fetchAircraft();
  }, [pageNumber, pageSize]);

  const fetchAircraft = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Aircraft?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // For each aircraft, fetch its seating configurations
      const aircraftWithSeating = await Promise.all(
        data.map(async (a) => {
          const seatingResponse = await fetch(`${API_BASE_URL}/Aircraft/${a.id}/seating`);
          
          if (!seatingResponse.ok) {
            console.error(`Failed to fetch seating for aircraft ${a.id}`);
            return { ...a, seatingConfigs: [] };
          }
          
          const seatingData = await seatingResponse.json();
          return { ...a, seatingConfigs: seatingData };
        })
      );
      
      setAircraft(aircraftWithSeating);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching aircraft:', err);
    } finally {
      setLoading(false);
    }
  };

  // Convert the seating configs to the format expected by the UI
  const getFormattedSeatingConfig = (seatingConfigs) => {
    const result = {
      firstClass: { total: 0, seatsPerRow: 0 },
      businessClass: { total: 0, seatsPerRow: 0 },
      economyClass: { total: 0, seatsPerRow: 0 }
    };
    
    seatingConfigs.forEach(config => {
      let classKey;
      switch (config.seatClass) {
        case 0: // Economy
          classKey = 'economyClass';
          break;
        case 1: // Business
          classKey = 'businessClass';
          break;
        case 2: // First
          classKey = 'firstClass';
          break;
        default:
          classKey = 'economyClass';
      }
      
      result[classKey] = {
        total: config.rowCount * config.seatsPerRow,
        seatsPerRow: config.seatsPerRow,
        rowCount: config.rowCount
      };
    });
    
    return result;
  };

  // Convert UI format to API format for seating configs
  const convertToApiSeatingConfigs = (aircraftId, uiSeatingConfig) => {
    const configs = [];
    
    // First class
    if (uiSeatingConfig.firstClass.total > 0 && uiSeatingConfig.firstClass.seatsPerRow > 0) {
      const rowCount = Math.ceil(uiSeatingConfig.firstClass.total / uiSeatingConfig.firstClass.seatsPerRow);
      configs.push({
        aircraftId: aircraftId,
        seatClass: 2, // First class
        rowCount: rowCount,
        seatsPerRow: uiSeatingConfig.firstClass.seatsPerRow
      });
    }
    
    // Business class
    if (uiSeatingConfig.businessClass.total > 0 && uiSeatingConfig.businessClass.seatsPerRow > 0) {
      const rowCount = Math.ceil(uiSeatingConfig.businessClass.total / uiSeatingConfig.businessClass.seatsPerRow);
      configs.push({
        aircraftId: aircraftId,
        seatClass: 1, // Business class
        rowCount: rowCount,
        seatsPerRow: uiSeatingConfig.businessClass.seatsPerRow
      });
    }
    
    // Economy class
    if (uiSeatingConfig.economyClass.total > 0 && uiSeatingConfig.economyClass.seatsPerRow > 0) {
      const rowCount = Math.ceil(uiSeatingConfig.economyClass.total / uiSeatingConfig.economyClass.seatsPerRow);
      configs.push({
        aircraftId: aircraftId,
        seatClass: 0, // Economy class
        rowCount: rowCount,
        seatsPerRow: uiSeatingConfig.economyClass.seatsPerRow
      });
    }
    
    return configs;
  };

  const handleAddAircraft = async () => {
    if (!newAircraft.registrationNumber) return;

    try {
      // 1. Create the aircraft first
      const aircraftResponse = await fetch(`${API_BASE_URL}/Aircraft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: newAircraft.model,
          description: newAircraft.description,
          registrationNumber: newAircraft.registrationNumber
        })
      });

      if (!aircraftResponse.ok) {
        throw new Error(`Failed to create aircraft: ${aircraftResponse.statusText}`);
      }

      const createdAircraft = await aircraftResponse.json();
      
      // 2. Create seating configs
      const seatingConfigs = convertToApiSeatingConfigs(
        createdAircraft.id, 
        newAircraft.seatConfiguration
      );
      
      if (seatingConfigs.length > 0) {
        const seatingResponse = await fetch(`${API_BASE_URL}/SeatingConfig/batch?aircraftId=${createdAircraft.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(seatingConfigs)
        });

        if (!seatingResponse.ok) {
          console.error(`Warning: Failed to create seating configurations: ${seatingResponse.statusText}`);
        }
      }
      
      // 3. Refresh the aircraft list
      fetchAircraft();
      
      // Reset form
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
      
    } catch (err) {
      setError(err.message);
      console.error('Error adding aircraft:', err);
    }
  };

  const handleEditAircraft = async (id) => {
    try {
      const aircraftToEdit = aircraft.find((a) => a.id === id);
      
      // Create a formatted version with the UI-expected structure
      const formattedAircraft = {
        ...aircraftToEdit,
        seatConfiguration: getFormattedSeatingConfig(aircraftToEdit.seatingConfigs)
      };
      
      setEditAircraft(formattedAircraft);
      setIsEditing(true);
    } catch (err) {
      console.error('Error preparing aircraft for edit:', err);
    }
  };

  const handleSaveEdit = async () => {
    try {
      // 1. Update the aircraft details
      const aircraftResponse = await fetch(`${API_BASE_URL}/Aircraft/${editAircraft.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editAircraft.id,
          model: editAircraft.model,
          description: editAircraft.description,
          registrationNumber: editAircraft.registrationNumber
        })
      });

      if (!aircraftResponse.ok) {
        throw new Error(`Failed to update aircraft: ${aircraftResponse.statusText}`);
      }
      
      // 2. Delete existing seating configs
      const deleteSeatingResponse = await fetch(`${API_BASE_URL}/SeatingConfig/aircraft/${editAircraft.id}`, {
        method: 'DELETE'
      });

      if (!deleteSeatingResponse.ok) {
        console.error(`Warning: Failed to delete existing seating configurations: ${deleteSeatingResponse.statusText}`);
      }
      
      // 3. Create new seating configs
      const seatingConfigs = convertToApiSeatingConfigs(
        editAircraft.id, 
        editAircraft.seatConfiguration
      );
      
      if (seatingConfigs.length > 0) {
        const seatingResponse = await fetch(`${API_BASE_URL}/SeatingConfig/batch?aircraftId=${editAircraft.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(seatingConfigs)
        });

        if (!seatingResponse.ok) {
          console.error(`Warning: Failed to create seating configurations: ${seatingResponse.statusText}`);
        }
      }
      
      // 4. Refresh the aircraft list
      fetchAircraft();
      
      // Reset form
      setIsEditing(false);
      setEditAircraft(null);
      
    } catch (err) {
      setError(err.message);
      console.error('Error updating aircraft:', err);
    }
  };

  const handleDeleteAircraft = async (id) => {
    if (window.confirm('Are you sure you want to delete this aircraft?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/Aircraft/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`Failed to delete aircraft: ${response.statusText}`);
        }
        
        // Refresh the aircraft list
        fetchAircraft();
        
      } catch (err) {
        setError(err.message);
        console.error('Error deleting aircraft:', err);
      }
    }
  };

  // Reset the form when exiting add/edit mode
  const handleCancel = () => {
    setIsAddingNew(false);
    setIsEditing(false);
    setEditAircraft(null);
    setError(null);
  };

  return (
    <div className="container">
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="btn_add">
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
                placeholder="Enter Registration Number"
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
                    value={isEditing 
                      ? (editAircraft.seatConfiguration[classType]?.total || 0) 
                      : (newAircraft.seatConfiguration?.[classType]?.total || 0)}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
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
                            ...(newAircraft.seatConfiguration || {}),
                            [classType]: {
                              ...(newAircraft.seatConfiguration?.[classType] || {}),
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
                    value={isEditing 
                      ? (editAircraft.seatConfiguration[classType]?.seatsPerRow || 0) 
                      : (newAircraft.seatConfiguration?.[classType]?.seatsPerRow || 0)}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
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
                            ...(newAircraft.seatConfiguration || {}),
                            [classType]: {
                              ...(newAircraft.seatConfiguration?.[classType] || {}),
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
            <button className="btn" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={isEditing ? handleSaveEdit : handleAddAircraft}>
              <img src={SaveIcon} alt="Save" style={{ width: 16, height: 16, marginRight: 8 }} />
              {isEditing ? 'Save Changes' : 'Save Aircraft'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading aircraft data...</div>
      ) : (
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {aircraft.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No aircraft found</td>
                </tr>
              ) : (
                aircraft.map((plane) => {
                  // Format seating configs for display
                  const seatingConfig = getFormattedSeatingConfig(plane.seatingConfigs);
                  
                  return (
                    <tr key={plane.id}>
                      <td>{plane.model}</td>
                      <td>{plane.description}</td>
                      <td>{plane.registrationNumber}</td>
                      <td>
                        {seatingConfig.firstClass.total > 0 
                          ? `${seatingConfig.firstClass.total} seats (${seatingConfig.firstClass.seatsPerRow}/row)` 
                          : 'None'}
                      </td>
                      <td>
                        {seatingConfig.businessClass.total > 0 
                          ? `${seatingConfig.businessClass.total} seats (${seatingConfig.businessClass.seatsPerRow}/row)` 
                          : 'None'}
                      </td>
                      <td>
                        {seatingConfig.economyClass.total > 0 
                          ? `${seatingConfig.economyClass.total} seats (${seatingConfig.economyClass.seatsPerRow}/row)` 
                          : 'None'}
                      </td>
                      <td>
                        <button className="btn btn-warning" onClick={() => handleEditAircraft(plane.id)}>
                          <img src={EditIcon} alt="Edit" style={{ width: 20, height: 20 }} />
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDeleteAircraft(plane.id)}>
                          <img src={Trash2Icon} alt="Delete" style={{ width: 20, height: 20 }} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          
          {/* Simple pagination */}
          <div className="pagination">
            <button 
              className="btn" 
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center' }}>Page {pageNumber}</span>
            <button 
              className="btn"
              onClick={() => setPageNumber(prev => prev + 1)}
              disabled={aircraft.length < pageSize}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AircraftManagement;