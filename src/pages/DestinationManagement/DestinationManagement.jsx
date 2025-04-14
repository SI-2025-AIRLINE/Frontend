import { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import './DestinationManagement.css';
import EditIcon from '../../components/Icons/pencil.svg';
import Trash2Icon from '../../components/Icons/trash-2.svg';
import PlusCircleIcon from '../../components/Icons/circle-plus.svg';

const apiURL = import.meta.env.VITE_API_BASE_URL;

export default function DestinationManagement() {
    const [airports, setAirports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // For pagination
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchAirports();
    }, [pageNumber, pageSize]);

    // Fetch airports from API
    const fetchAirports = async () => {
        setLoading(true);
        setError(null);

        try {
            const url = `${apiURL}/Destination?pageNumber=${pageNumber}&pageSize=${pageSize}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();
            setAirports(data);
            
        } catch (err) {
            setError(err.message);
            console.error("Error fetching airports:", err);
        } finally {
            setLoading(false);
        }
    };

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

   /* const checkIataCodeExists = async (iataCode) => {
        try {
            const response = await fetch(`${apiURL}/Destination/byAirport/${iataCode}`);
            if (response.ok) {
                const airport = await response.json();
                return airport ? true : false;
            } else {
                throw new Error('Failed API call');
            }
        } catch (error) {
            console.error('Error checking IATA code: ', error);
            return false;
        }
    };*/

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.name || !formData.cityCode || !formData.airportCode) {
            alert("Please fill out all required fields.");
            return;
        }

        const onlyLettersRegex = /^[A-Za-z]+$/;
        const onlyLettersAndSpacesRegex = /^[A-Za-z\s]+$/;

        if (
            !onlyLettersAndSpacesRegex.test(formData.name) ||
            !onlyLettersRegex.test(formData.cityCode) ||
            !onlyLettersRegex.test(formData.airportCode)
        ) {
            alert("Fields 'Airport name', 'City' and 'IATA' must contain only letters.");
            return;
        }


         let success;
        if (editingAirport) {
            // Update existing airport
            success = await updateAirport(editingAirport.id, formData);
            if (success) {
                alert('Airport updated successfully');
            } else {
                alert('Failed to update airport, check IATA code.');
                return;
            }
        } else {
            // Create new airport
            delete formData.id;

            formData.Status = Number(formData.Status);
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
        setEditingAirport(null);
        setShowForm(false); 
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
        setError(null);
    }
    function handleCancel() {
        setFormData({ id: null, name: '', cityCode: '', airportCode: '', Status: true });
        setShowForm(false);
        setEditingAirport(null);
        setError(null);
    }

    return (
        <div className="container">

         <div className="add-button-container">
                {!showForm ? (
                    <button onClick={() => setShowForm(true)} className="add-button" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={PlusCircleIcon} alt="Add New" style={{ width: 20, height: 20, marginRight: 8 }} />
                        Add New Airport
                    </button>
                ) : (
                    <button onClick={handleCancel} className="cancel-button">Cancel</button>
                )}
            </div>
        <div className="destination-management-container">
           

            {/* Add or Edit Airport Form (Modal) */}
            {showForm && (
                    <div className="add-form-modal">

                        {error && <p className="error-message">{error}</p>}

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
                                <div className="submit-button-container">
                                    <button type="submit" className="submit-button">
                                        {editingAirport ? 'Update Airport' : 'Add Airport'}
                                    </button>
                                </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Loading and Error States */}
            {loading && <p className="loading-message">Loading airports...</p>}
            

            {/* Airport List */}

                <div className="airports-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>City</th>
                                <th>IATA</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {airports.map((airport) => (
                                <tr key={airport.id}>
                                    <td>{airport.name}</td>
                                    <td>{airport.cityCode}</td>
                                    <td>{airport.airportCode}</td>
                                    <td className={`status-info ${airport.status ? 'active' : 'inactive'}`}>
                                        {airport.status ? 'Active' : 'Inactive'}
                                    </td>

                                    <td className="airport-actions" style={{ textAlign: 'right' }}>
                                        <button
                                            className="btn btn-warning"
                                            onClick={() => handleEdit(airport)}
                                        >
                                            <img src={EditIcon} alt="Edit" style={{ width: 20, height: 20 }} />
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(airport.id)}
                                        >
                                            <img src={Trash2Icon} alt="Delete" style={{ width: 20, height: 20 }} />
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            onClick={() => handleToggleActive(airport.id, airport.status)}
                                        >
                                            Status
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
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
                            disabled={airports.length < pageSize}
                        >
                            Next
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}