import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, Trash2, Edit } from 'lucide-react';
import EditIcon from '../../components/Icons/pencil.svg';
import './FlightScheduling.css';

const apiURL = import.meta.env.VITE_API_BASE_URL;
function FlightScheduling() {

    const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10 });

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

    // GET: api/Flight-ispravna

    const fetchFlights = async () => {
        try {
            const url = `${apiURL}/Flight?pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error fetching flights: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(data);
            setFlights(data);
            setPagination({ ...pagination, totalPages: data.totalPages });
        } catch (error) {
            console.error('Failed to fetch flights:', error);
        }
    };


    useEffect(() => {
        fetchFlights();
    }, [pagination.pageNumber, pagination.pageSize]);


    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return; 
        setPagination({ ...pagination, pageNumber: newPage });
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



    // POST: /api/Flight ispravna
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
            console.error("Greška prilikom kreiranja leta:", errorText);
            return null;
        }

        const createdFlight = await response.json();
        console.log("Uspešno kreiran let:", createdFlight);
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


    const handleEditFlight = (flight) => {

        console.log("Valid to: ", flight.validTo);
        const flightSchedule = initializeDaysFromSchedule(flight.schedule);
        console.log("schedule:", flightSchedule);

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
            console.error("Missing flight data");
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
            return true;  // Return true to indicate success
        } catch (error) {
            console.error('Failed to update flight:', error);
            return false;  
        }
    };








    // Funkcija koja provjerava da li destinacija postoji na osnovu cityCode
    const getDestinationIdByCityCode = async (cityCode) => {
        const response = await fetch(`${apiURL}/Destination/byCity/${cityCode}`);
        if (response.ok) {
            const destinations = await response.json();
            if (destinations.length > 0) {
                return destinations[0].id; // Vraća ID prve destinacije (ako postoji)
            } else {
                throw new Error("Destinacija nije pronađena.");
            }
        } else {
            throw new Error("Greška pri pronalaženju destinacije.");
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
                return aircraft.id; // Vraća ID aviona sa odgovarajućim modelom
            } else {
                throw new Error("Avion sa tim modelom nije pronađen.");
            }
        } else {
            throw new Error("Greška pri pronalaženju aviona.");
        }
    };


    // Funkcija za dodavanje novog leta  -ispravna 
    const handleAddFlight = async () => {
        if (!newFlight.flightNumber || !newFlight.origin || !newFlight.destination) {
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
            console.log("Flight added succesfully", createdFlight);
            setIsAddingNew(false);
            resetForm();
        } catch (error) {
            console.error("Greška pri kreiranju leta:", error.message);
        }
    };


    //DELETE: /api/Flight/id-ispravna
    const handleDeleteFlight = async (id) => {
        try {
           
            const response = await fetch(`${apiURL}/Flight/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                
                throw new Error('Greška pri brisanju leta');
            }

            setFlights(flights.filter(f => f.id !== id));
        } catch (error) {
            console.error('Došlo je do greške:', error);
            
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
                            <th>Times</th>
                            <th>Aircraft</th>
                            <th>Validity</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
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
                                    {new Date(flight.validFrom).toLocaleDateString('en-GB')} - {new Date(flight.validTo).toLocaleDateString('en-GB')}
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
                        onClick={() => handlePageChange(pagination.pageNumber - 1)}
                        disabled={pagination.pageNumber === 1}
                    >
                        Previous
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center' }}>Page {pagination.pageNumber}</span>
                    <button
                        onClick={() => handlePageChange(pagination.pageNumber + 1)}
                        disabled={pagination.pageNumber === pagination.totalPages}
                    >
                        Next

                    </button>
                </div>
            </div>
        </div>
    );
}

export default FlightScheduling;

/****************OVO JE MELIDIN KOD MOZDA POSLUZI NEKA LOGIKA OKO EDITA******************/
/*import React, { useState } from 'react';
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

export default FlightScheduling;*/