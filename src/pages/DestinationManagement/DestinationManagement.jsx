
import { useState } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import './DestinationManagement.css';

export default function DestinationManagement() {
    const [airports, setAirports] = useState([
        {
            id: 1,
            name: 'JFK International Airport',
            city: 'New York',
            iata_code: 'JFK',
            active: true,
        },
    ]);

    const [formData, setFormData] = useState({
        name: '',
        city: '',       
        iata_code: '',        
        active: true,
    });

    const [showForm, setShowForm] = useState(false);
    const [editingAirport, setEditingAirport] = useState(null); 

    function handleSubmit(e) {
        e.preventDefault();
        if (!formData.name || !formData.city  || !formData.iata_code ) {
            alert("Please fill out all fields.");
            return;
        }
        if (editingAirport) {
            // Update the existing airport
            const updatedAirports = airports.map((airport) =>
                airport.id === editingAirport.id ? { ...formData, id: airport.id } : airport
            );
            setAirports(updatedAirports);
            alert('Airport updated successfully');
        } else {
            // Add new airport
            const newAirport = { ...formData, id: airports.length + 1 };
            setAirports([...airports, newAirport]);
            alert('Airport added successfully');
        }

        setFormData({ name: '', city: '', iata_code: '', active: true });
        setShowForm(false);
        setEditingAirport(null); 
    }

    function handleDelete(id) {
        const newAirports = airports.filter((airport) => airport.id !== id);
        setAirports(newAirports);
        alert('Airport deleted successfully');
    }

    function handleToggleActive(id) {
        const updatedAirports = airports.map((airport) =>
            airport.id === id ? { ...airport, active: !airport.active } : airport
        );
        setAirports(updatedAirports);
    }

    function handleEdit(airport) {
        setEditingAirport(airport); 
        setFormData({ ...airport }); 
        setShowForm(true); 
    }
    
    function handleCancel() {
        
        setFormData({ name: '', city: '', iata_code: '', active: true });
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
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>
                               
                                <div className="form-field">
                                    <label className="form-label">IATA Code</label>
                                    <input
                                        type="text"
                                        placeholder="JFK"
                                        value={formData.iata_code}
                                        onChange={(e) => setFormData({ ...formData, iata_code: e.target.value.toUpperCase() })}
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

            {/* Airport List */}
            <div className="airports-list">
                {airports.map((airport) => (
                    <div key={airport.id} className="airport-card">
                        <div className="airport-info-left">
                            <div className="airport-details">
                                <h3 className="airport-name">{airport.name}</h3>
                                <p className="airport-location">{airport.city}, {airport.country}</p>
                            </div>
                            <div className={`airport-codes`}>
                                <p className={`iata-info`}>IATA: {airport.iata_code}</p>
                                <p className={`icao-info`}>ICAO: {airport.icao_code}</p>
                                <p
                                    className={`status-info ${airport.active ? 'active' : 'inactive'}`}
                                    style={{
                                        color: airport.active ? 'green' : 'red',
                                    }}
                                >
                                    {airport.active ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>
                        <div className="airport-actions">
                            <FaEdit className="action-icon" onClick={() => handleEdit(airport)} />
                            <FaTrashAlt className="action-icon" onClick={() => handleDelete(airport.id)} />
                            <button className="toggle-status-button" onClick={() => handleToggleActive(airport.id)}>
                                Toggle Active Status
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
