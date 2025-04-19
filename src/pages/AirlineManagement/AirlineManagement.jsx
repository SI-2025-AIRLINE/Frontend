/*import React, { useState } from 'react';
import './AirlineManagement.css';
import EditIcon from '../../components/Icons/pencil.svg';
import Trash2Icon from '../../components/Icons/trash-2.svg';
import PlusCircleIcon from '../../components/Icons/circle-plus.svg';
import SaveIcon from '../../components/Icons/save.svg';

const initialAirlines = [
    { id: 1, name: 'American Airlines', iata: 'AA', icao: 'AAL' },
    { id: 2, name: 'United Airlines', iata: 'UA', icao: 'UAL' },
    { id: 3, name: 'Delta Air Lines', iata: 'DL', icao: 'DAL' },
];

function AirlineTable() {
    const [airlines, setAirlines] = useState(initialAirlines);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAirline, setEditingAirline] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        iata: '',
        icao: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAirline) {
            setAirlines((prev) =>
                prev.map((airline) =>
                    airline.id === editingAirline.id
                        ? { ...airline, ...formData }
                        : airline
                )
            );
        } else {
            const newAirline = {
                id: airlines.length + 1,
                ...formData,
            };
            setAirlines((prev) => [...prev, newAirline]);
        }
        handleCloseForm();
    };

    const handleEdit = (airline) => {
        setEditingAirline(airline);
        setFormData({
            name: airline.name,
            iata: airline.iata,
            icao: airline.icao,
        });
        setIsFormOpen(true);
    };

    const handleDelete = (id) => {
        setAirlines((prev) => prev.filter((airline) => airline.id !== id));
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingAirline(null);
        setFormData({ name: '', iata: '', icao: '' });
    };

    return (
        <div className="airline-page">

        <div className="container">
            <div className="add-button-container">
                    <button onClick={() => setIsFormOpen(true)} className="add-button" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={PlusCircleIcon} alt="Add New" style={{ width: 20, height: 20, marginRight: 8 }} />
                        Add New Airline
                    </button>
            </div>

            <div className="airline-management-container">
                {/* Editing and adding airline }
                {isFormOpen && (
                    <div className="add-form-modal">
                        {error && <p className="error-message">{error}</p>}

                        <div className="add-form-container">
                            <h2 className="section-title">{editingAirline ? 'Edit Airline' : 'Add New Airline'}</h2>
                            <form onSubmit={handleSubmit} className="form">
                                <div className="form-grid">
                                    <div className="form-field">
                                        <label className="form-label">Airline Name</label>
                                        <input
                                            type="text"
                                            placeholder="Lufthansa"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label className="form-label">IATA Code</label>
                                        <input
                                            type="text"
                                            placeholder="LH"
                                            value={formData.iata}
                                            onChange={(e) => setFormData({ ...formData, iata: e.target.value.toUpperCase() })}
                                            className="form-input"
                                            required
                                            maxLength={2}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label className="form-label">ICAO Code</label>
                                        <input
                                            type="text"
                                            placeholder="DLH"
                                            value={formData.icao}
                                            onChange={(e) => setFormData({ ...formData, icao: e.target.value.toUpperCase() })}
                                            className="form-input"
                                            required
                                            maxLength={3}
                                        />
                                    </div>
                                </div>

                                <div className="submit-button-container">
                                    <button className="btn" onClick={handleCloseForm}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-button">
                                        <img src={SaveIcon} alt="Save" style={{ width: 16, height: 16, marginRight: 8 }} />
                                        {editingAirline ? 'Save Changes' : 'Add Airline'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Loading and Error States 
                {loading && <p className="loading-message">Loading airlines...</p>}
                }

                {/* Airline list }
                <div className="airlines-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>IATA</th>
                                <th>ICAO</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {airlines.map((airline) => (
                                <tr key={airline.id}>
                                    <td>{airline.name}</td>
                                    <td>{airline.iata}</td>
                                    <td>{airline.icao}</td>
                                    <td className="airline-actions">
                                        <button className="btn btn-warning" onClick={() => handleEdit(airline)}>
                                            <img src={EditIcon} alt="Edit" style={{ width: 20, height: 20 }} />
                                        </button>
                                        <button className="btn btn-danger" onClick={() => handleDelete(airline.id)}>
                                            <img src={Trash2Icon} alt="Delete" style={{ width: 20, height: 20 }} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination }
                    {/*<div className="pagination">
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
                    </div>}

                </div>
            </div>
        </div>
        </div>
    );
}

export default AirlineTable;
*/
import React, { useState, useEffect } from 'react';
import './AirlineManagement.css';
import EditIcon from '../../components/Icons/pencil.svg';
import Trash2Icon from '../../components/Icons/trash-2.svg';
import PlusCircleIcon from '../../components/Icons/circle-plus.svg';
import SaveIcon from '../../components/Icons/save.svg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AirlineTable() {
    const [airlines, setAirlines] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAirline, setEditingAirline] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        iata: '',
        icao: '',
    });
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    
    // GET: Fetch airlines from backend
    /*const fetchAirlines = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/Airline`);
            const data = await res.json();
            setAirlines(data);
        } catch (err) {
            setError('Error fetching airlines.');
        } finally {
            setLoading(false);
        }
    };*/
    const fetchAirlines = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/Airline?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            const data = await res.json();
            setAirlines(data);
        } catch (err) {
            setError('Error fetching airlines.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchAirlines();
    }, [pageNumber, pageSize]);    

    /*useEffect(() => {
        fetchAirlines();
    }, []);*/

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingAirline ? 'PUT' : 'POST';
        const url = editingAirline
            ? `${API_BASE_URL}/Airline/${editingAirline.id}`
            : `${API_BASE_URL}/Airline`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    editingAirline ? { ...formData, id: editingAirline.id } : formData
                ),
            });

            if (!res.ok) {
                const message = await res.text();
                throw new Error(message || 'Failed to save airline.');
            }

            await fetchAirlines();
            handleCloseForm();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (airline) => {
        setEditingAirline(airline);
        setFormData({
            name: airline.name,
            iata: airline.iata,
            icao: airline.icao,
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this airline?')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/Airline/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Failed to delete.');
            }

            await fetchAirlines();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingAirline(null);
        setFormData({ name: '', iata: '', icao: '' });
        setError(null);
    };

    return (
        <div className="airline-page">
            <div className="container">
                <div className="add-button-container">
                    <button onClick={() => setIsFormOpen(true)} className="add-button" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={PlusCircleIcon} alt="Add New" style={{ width: 20, height: 20, marginRight: 8 }} />
                        Add New Airline
                    </button>
                </div>

                <div className="airline-management-container">
                    {isFormOpen && (
                        <div className="add-form-modal">
                            {error && <p className="error-message">{error}</p>}

                            <div className="add-form-container">
                                <h2 className="section-title">{editingAirline ? 'Edit Airline' : 'Add New Airline'}</h2>
                                <form onSubmit={handleSubmit} className="form">
                                    <div className="form-grid">
                                        <div className="form-field">
                                            <label className="form-label">Airline Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Lufthansa"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="form-input"
                                                required
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label className="form-label">IATA Code</label>
                                            <input
                                                type="text"
                                                name="iata"
                                                placeholder="LH"
                                                value={formData.iata}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, iata: e.target.value.toUpperCase() })
                                                }
                                                className="form-input"
                                                required
                                                maxLength={2}
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label className="form-label">ICAO Code</label>
                                            <input
                                                type="text"
                                                name="icao"
                                                placeholder="DLH"
                                                value={formData.icao}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, icao: e.target.value.toUpperCase() })
                                                }
                                                className="form-input"
                                                required
                                                maxLength={3}
                                            />
                                        </div>
                                    </div>

                                    <div className="submit-button-container">
                                        <button className="btn" onClick={handleCloseForm}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="submit-button">
                                            <img src={SaveIcon} alt="Save" style={{ width: 16, height: 16, marginRight: 8 }} />
                                            {editingAirline ? 'Save Changes' : 'Add Airline'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <p className="loading-message">Loading airlines...</p>
                    ) : (
                        <div className="airlines-list">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>IATA</th>
                                        <th>ICAO</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {airlines.map((airline) => (
                                        <tr key={airline.id}>
                                            <td>{airline.name}</td>
                                            <td>{airline.iata}</td>
                                            <td>{airline.icao}</td>
                                            <td className="airline-actions">
                                                <button className="btn btn-warning" onClick={() => handleEdit(airline)}>
                                                    <img src={EditIcon} alt="Edit" style={{ width: 20, height: 20 }} />
                                                </button>
                                                <button className="btn btn-danger" onClick={() => handleDelete(airline.id)}>
                                                    <img src={Trash2Icon} alt="Delete" style={{ width: 20, height: 20 }} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Simple pagination */}
                        <div className="pagination">
                            <button className="btn" disabled={pageNumber <= 1}
                             onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                            >
                              Previous
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center' }}>Page {pageNumber}</span>
                            <button className="btn"
                             onClick={() => setPageNumber(prev => prev + 1)}
                             disabled={airlines.length < pageSize}
                            >
                              Next
                            </button>
                        </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AirlineTable;
