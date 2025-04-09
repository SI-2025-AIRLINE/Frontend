import { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import './DestinationManagement.css';

const apiURL = import.meta.env.VITE_API_BASE_URL;

export default function DestinationManagement() {
    const [airports, setAirports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch airports from API
    const fetchAirports = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${apiURL}/Destination`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setAirports(data);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch airports:', error);
            setError('Failed to load airports. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAirports();
    }, []);

    const [formData, setFormData] = useState({
        id: null,
        name: '',
        cityCode: '',       
        airportCode: '',        
        Status: 1,
    });

    const [showForm, setShowForm] = useState(false);
    const [editingAirport, setEditingAirport] = useState(null); 

    // Create new airport via API
    const createAirport = async (airportData) => {
        try {
            const res = await fetch(`${apiURL}/Destination`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(airportData),
            });
            
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            await fetchAirports(); // Refresh the airport list
            return true;
        } catch (error) {
            console.error('Failed to create airport:', error);
            return false;
        }
    };

    // Update airport via API
    const updateAirport = async (id, airportData) => {
        try {
            console.log("Updating airport with ID:", id, "Data:", airportData);
            const res = await fetch(`${apiURL}/Destination/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(airportData, id),
            });
            
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            await fetchAirports(); // Refresh the airport list
            return true;
        } catch (error) {
            console.error('Failed to update airport:', error);
            return false;
        }
    };

    // Delete airport via API
    const deleteAirport = async (id) => {
        try {
            const res = await fetch(`${apiURL}/Destination/${id}`, {
                method: 'DELETE',
            });
            
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            await fetchAirports(); // Refresh the airport list
            return true;
        } catch (error) {
            console.error('Failed to delete airport:', error);
            return false;
        }
    };

    // Toggle airport active status via API
    const toggleAirportStatus = async (id, currentStatus) => {
        try {
            const res = await fetch(`${apiURL}/Destination/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Status: Number(!currentStatus) }),
            });
            
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            await fetchAirports(); // Refresh the airport list
            return true;
        } catch (error) {
            console.error('Failed to toggle airport status:', error);
            return false;
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.name || !formData.cityCode || !formData.airportCode) {
            alert("Please fill out all required fields.");
            return;
        }

        let success = false;

        if (editingAirport) {
            // Update existing airport
            success = await updateAirport(editingAirport.id, formData);
            if (success) {
                alert('Airport updated successfully');
            } else {
                alert('Failed to update airport');
                return;
            }
        } else {
            // Create new airport
            delete formData.id; // Remove id from formData if it exists
            formData.Status = Number(formData.Status); // Ensure Status is a number
            success = await createAirport(formData);
            if (success) {
                alert('Airport added successfully');
            } else {
                alert('Failed to add airport');
                return;
            }
        }

        // Reset form state
        setFormData({ name: '', cityCode: '', airportCode: '', Status: 1 });
        setShowForm(false);
        setEditingAirport(null);
    }

    async function handleDelete(id) {
        if (window.confirm('Are you sure you want to delete this airport?')) {
            const success = await deleteAirport(id);
            if (success) {
                alert('Airport deleted successfully');
            } else {
                alert('Failed to delete airport');
            }
        }
    }

    async function handleToggleActive(id, currentStatus) {
        const success = await toggleAirportStatus(id, currentStatus);
        if (!success) {
            alert('Failed to toggle airport status');
        }
    }

    function handleEdit(airport) {
        setEditingAirport(airport); 
        setFormData({
            id: airport.id, 
            name: airport.name,
            cityCode: airport.cityCode,
            airportCode: airport.airportCode,
            Status: airport.status
        }); 
        setShowForm(true); 
    }
    
    function handleCancel() {
        setFormData({ id: null, name: '', cityCode: '', airportCode: '', Status: true });
        setShowForm(false);
        setEditingAirport(null);
    }

    return (
        <div className="destination-management-container">
            <div className="add-button-container">
                {!showForm ? (
                    <button onClick={() => setShowForm(true)} className="add-button">+ Add New Airport</button>
                ) : (
                    <button onClick={handleCancel} className="cancel-button">Cancel</button>
                )}
            </div>

            {/* Add or Edit Airport Form (Modal) */}
            {showForm && (
                <div className="add-form-modal">
                    <div className="add-form-container">
                        <h2 className="section-title">{editingAirport ? 'Edit Airport' : 'Add New Airport'}</h2>
                        <form onSubmit={handleSubmit} className="form">
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">Airport Name</label>
                                    <input
                                        type="text"
                                        placeholder="JFK International Airport"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">City</label>
                                    <input
                                        type="text"
                                        placeholder="New York"
                                        value={formData.cityCode}
                                        onChange={(e) => setFormData({ ...formData, cityCode: e.target.value.toUpperCase() })}
                                        className="form-input"
                                        required
                                    />
                                </div>
                               
                                <div className="form-field">
                                    <label className="form-label">IATA Code</label>
                                    <input
                                        type="text"
                                        placeholder="JFK"
                                        value={formData.airportCode}
                                        onChange={(e) => setFormData({ ...formData, airportCode: e.target.value.toUpperCase() })}
                                        className="form-input"
                                        required
                                        maxLength={3}
                                    />
                                </div>
                               
                            </div>
                            <button type="submit" className="submit-button">{editingAirport ? 'Update Airport' : 'Add Airport'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Loading and Error States */}
            {loading && <p className="loading-message">Loading airports...</p>}
            {error && <p className="error-message">{error}</p>}

            {/* Airport List */}
            <div className="airports-list">
                {airports.map((airport) => (
                    <div key={airport.id} className="airport-card">
                        <div className="airport-info-left">
                            <div className="airport-details">
                                <h3 className="airport-name">{airport.name}</h3>
                                <p className="airport-location">{airport.cityCode}</p>
                            </div>
                            <div className="airport-codes">
                                <p className="iata-info">IATA: {airport.airportCode}</p>
                                {airport.icao_code && <p className="icao-info">ICAO: {airport.icao_code}</p>}
                                <p
                                    className={`status-info ${airport.Status ? 'active' : 'inactive'}`}
                                    style={{
                                        color: airport.status ? 'green' : 'red',
                                    }}
                                >
                                    {airport.status ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>
                        <div className="airport-actions">
                            <FaEdit className="action-icon" onClick={() => handleEdit(airport)} />
                            <FaTrashAlt className="action-icon" onClick={() => handleDelete(airport.id)} />
                            <button className="toggle-status-button" onClick={() => handleToggleActive(airport.id, airport.status)}>
                                Toggle Active Status
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}