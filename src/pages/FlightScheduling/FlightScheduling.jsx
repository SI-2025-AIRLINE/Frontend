import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, Trash2, Edit } from 'lucide-react';
import EditIcon from '../../components/Icons/pencil.svg';
import './FlightScheduling.css';

const apiURL = import.meta.env.VITE_API_BASE_URL;
function FlightScheduling() {
    // For pagination
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [flights, setFlights] = useState([
        {
            id: '',
            flightNumber: '',
            schedule: '',
            departureTime: '',
            arrivalTime: '',
            origin: '',
            destination: '',
            aircraftType: '',
            validFrom: '',
            validTo: ''
        }
    ]);

    useEffect(() => {
        fetchFlights();
    }, [pageNumber, pageSize]);

    // GET: api/Flight-ispravna
    const fetchFlights = async () => {
        try {
            const url = `${apiURL}/Flight?pageNumber=${pageNumber}&pageSize=${pageSize}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error fetching flights: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(data);
            setFlights(data);

        } catch (error) {
            console.error('Failed to fetch flights:', error);
        }
    };

    const resetForm = () => {
        setNewFlight({
            flightNumber: '',
            schedule: '',
            departureTime: '',
            arrivalTime: '',
            origin: '',
            destination: '',
            aircraftType: '',
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

    // POST: /api/Flight
    async function createFlight(flightData) {
        const response = await fetch(`${apiURL}/Flight`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(flightData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log("Error while creating a flight:", errorText);
            window.alert("An error ocurred while creating a flight!");
            return null;
        }

        const createdFlight = await response.json();
        console.log("Flight is created:", createdFlight);
        window.alert("Flight is added successfully!");
        return createdFlight;
    }

    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingFlight, setEditingFlight] = useState(null);
    const [newFlight, setNewFlight] = useState({
        flightNumber: '',
        aircraftType: '',
        schedule: '',
        departureTime: '',
        arrivalTime: '',
        origin: '',
        destination: '',
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

        // Konvertuje selektovane dane u string format za schedule
        const schedule = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
            .map((d, index) => newSelectedDays[d] ? (index + 1).toString() : '')
            .join('');

        setNewFlight({ ...newFlight, schedule });
    };

    const convertScheduleStringToSelectedDays = (scheduleString) => {
        const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        const selected = {};

        for (let i = 0; i < dayKeys.length; i++) {
            // scheduleString sadrži brojeve dana: 1 (Mon) do 7 (Sun)
            selected[dayKeys[i]] = scheduleString.includes((i + 1).toString());
        }

        return selected;
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

    const formatDateForInput = (dateString) => {
        console.log(dateString);
        const [month, day, year] = dateString.split('-');
        return `${month}-${day}-${year}`; 
    };

    const closeEditForm = () => {
        setIsAddingNew(false); 
        setEditingFlight(null);
        resetForm(); 
    };

    const handleEditFlight = (flight) => {
        console.log("Valid to: ", flight.validTo);
        const flightSchedule = initializeDaysFromSchedule(flight.schedule);
        console.log("schedule:", flightSchedule);

        const selected = convertScheduleStringToSelectedDays(flight.schedule); 
        setSelectedDays(selected); 

        setIsAddingNew(true); 
        setEditingFlight(flight); 
        setNewFlight({
            flightNumber: flight.flightNumber,
            schedule: flightSchedule,
            aircraftType: flight.aircraft?.model,
            departureTime: flight.departureTime.slice(11, 16),
            arrivalTime: flight.arrivalTime.slice(11, 16),
            origin: flight.departureDestination?.cityCode,
            destination: flight.arrivalDestination?.cityCode,
            validTo: formatDateForInput(flight.validTo.slice(0, 10)),
            validFrom: formatDateForInput(flight.validFrom.slice(0, 10)),
        });
    };

    // Update flight via API
    const updateFlight = async (flightData) => {
        // If newFlight is undefined or lacks essential information, exit early
        if (!newFlight || !newFlight.flightNumber || !newFlight.origin || !newFlight.destination) {
            window.alert("Missing flight data");
            return false;
        }
        console.log("Editing data: ", editingFlight);
        console.log("FlightData: ", flightData);
        console.log("New flight: ", newFlight);

        try {
            // Fetch IDs for the aircraft, departure, and arrival destinations
            const aircraftId = await getAircraftIdByModel(newFlight.aircraftType);
            const departureId = await getDestinationIdByCityCode(newFlight.origin);
            const arrivalId = await getDestinationIdByCityCode(newFlight.destination);

            // Prepare updated flight data payload
            const updatedFlightData = {
                flightNumber: newFlight.flightNumber,
                schedule: newFlight.schedule,
                aircraftId: aircraftId,
                departureDestinationId: departureId,
                arrivalDestinationId: arrivalId,
                departureTime: `2025-01-01T${newFlight.departureTime}`.toString(),
                arrivalTime: `2025-01-01T${newFlight.arrivalTime}`.toString(),
                // Ensure correct date format
                validFrom: newFlight.validFrom,
                validTo: newFlight.validTo,
                economyPrice: flightData.economyPrice,
                businessPrice: flightData.businessPrice,
                firstClassPrice: flightData.firstClassPrice,
                capacity: flightData.capacity,
                availableSeats: flightData.availableSeats,
            };

            console.log(updatedFlightData);

            // Send PUT request to update the flight
            const res = await fetch(`${apiURL}/Flight/${flightData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedFlightData),
            });

            // Check for successful response
            if (!res.ok) {
                // Only consume the body once
                const errorResponse = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorResponse}`);
            }

            // Refresh flight list after update
            await fetchFlights();  // Re-fetch updated list of flights
            closeEditForm();
            window.alert("Flight is successfully updated!");
            return true;  // Return true to indicate success
        } catch (error) {
            console.log('Failed to update flight:', error);
            window.alert('Failed to update flight.');
            return false;  
        }
    };

    const getDestinationIdByCityCode = async (cityCode) => {
        const response = await fetch(`${apiURL}/Destination/byCity/${cityCode}`);
        if (response.ok) {
            const destinations = await response.json();
            if (destinations.length > 0) {
                return destinations[0].id;
            } else {
                throw new Error("Destination can't be found.");
            }
        } else {
            throw new Error("Error finding a destination.");
        }
    };

    const getAircraftIdByModel = async (model) => {
        const response = await fetch(`${apiURL}/Aircraft/byModel/${model}`);
        console.log("model: ", model);

        if (response.ok) {
            const aircrafts = await response.json();
            console.log("aircrafts: ", aircrafts);

            const aircraft = aircrafts.find(aircraft => String(aircraft.model) === String(model));

            if (aircraft) {
                return aircraft.id; 
            } else {
                throw new Error("Plane with that model can't be found.");
            }
        } else {
            throw new Error("Error finding an plane.");
        }
    };

    // Funkcija za dodavanje novog leta  
    const handleAddFlight = async () => {
        if (!newFlight.flightNumber || !newFlight.origin || !newFlight.destination) {
            window.alert("Missing information!");
            return;
        }
        console.log(newFlight.origin);
        console.log(newFlight.schedule);
        console.log(newFlight.aircraftType);

        try {

            const aircraftID = await getAircraftIdByModel(newFlight.aircraftType);
            const departureId = await getDestinationIdByCityCode(newFlight.origin);
            const arrivalId = await getDestinationIdByCityCode(newFlight.destination);


            const flightPayload = {
                flightNumber: newFlight.flightNumber,
                schedule: newFlight.schedule,
                departureTime: `2025-01-01T${newFlight.departureTime}`,
                arrivalTime: `2025-01-01T${newFlight.arrivalTime}`,
                validFrom: newFlight.validFrom,
                validTo: newFlight.validTo,
                aircraftId: aircraftID,
                departureDestinationId: departureId,
                arrivalDestinationId: arrivalId,
                economyPrice: 150,
                businessPrice: 200,
                firstClassPrice: 250,
                capacity: 375,
                availableSeats: 370
            };

            const createdFlight = await createFlight(flightPayload);

            if (createdFlight) {
                window.alert("Flight was successfully added.");
                console.log("Flight added successfully", createdFlight);
            } else {
                window.alert("Failed to add flight.");
                console.error("Flight creation failed", createdFlight);
            }

            setIsAddingNew(false);
            resetForm();
            await fetchFlights();
        } catch (error) {
            console.error("Flight creation failed:", error.message);
        }
    };

    //DELETE: /api/Flight/id
    const handleDeleteFlight = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this flight?");

        if (!confirmDelete) {
            return; 
        }

        try {
           
            const response = await fetch(`${apiURL}/Flight/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                
                throw new Error('Greška pri brisanju leta');
            }

            setFlights(flights.filter(f => f.id !== id));
            window.alert("Flight deleted successfully.");

            fetchFlights(); 
        } catch (error) {
            console.error('An error occured:', error);
            window.alert("Failed to delete flight.");
        }
    };

    const formatSchedule = (schedule) => {
        if (!schedule) return '';

        const daysMap = {
            '1': 'Mon',
            '2': 'Tue',
            '3': 'Wed',
            '4': 'Thu',
            '5': 'Fri',
            '6': 'Sat',
            '7': 'Sun'
        };

        const formatted = schedule
            .split('')
            .map(day => daysMap[day])
            .filter(Boolean)
            .join(', ');

        return formatted;
    };

    return (
        <div className="container">
            <div className="button-container">
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
                                disabled={editingFlight !== null}
                            />
                        </div>
                        <div className="form-group">
                            <label className="time-label">Aircraft Type</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newFlight.aircraftType}
                                onChange={(e) => setNewFlight({ ...newFlight, aircraftType: e.target.value.toUpperCase() })}
                                placeholder="BCS1"
                            />
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
                                placeholder="AAP"
                                onChange={(e) => setNewFlight({ ...newFlight, origin: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="time-label">Destination</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newFlight.destination}
                                placeholder="ABJ"
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
                                aircraftType: '',
                                validFrom: '',
                                validTo: ''
                            });
                        }}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={editingFlight ? () => updateFlight(editingFlight) : handleAddFlight}>
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
                            <th>D/A Times</th>
                            <th>Aircraft</th>
                            <th>Departure Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flights.map((flight) => (
                            // console.log("FLIGHT:", flight); return (
                            <tr key={flight.id}>
                                <td>{flight.flightNumber}</td>
                                <td>{formatSchedule(flight.schedule)}</td>
                                <td>{flight.departureDestination?.name} → {flight.arrivalDestination?.name}</td>
                                <td>
                                    {flight.departureTime.slice(11, 16)} - {flight.arrivalTime.slice(11, 16)}
                                </td>

                                <td>{flight.aircraft?.model}</td>

                                <td>
                                    {flight.departureTime ? new Date(flight.departureTime).toLocaleDateString('en-GB') : ''                                    }
                                </td>

                                <td style={{ textAlign: 'right' }}>
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
                        disabled={flights.length < pageSize}
                    >
                        Next

                    </button>
                </div>
            </div>
        </div>
    );
}

export default FlightScheduling;