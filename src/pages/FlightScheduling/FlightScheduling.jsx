import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, Trash2, Edit } from 'lucide-react';
//import EditIcon from '../../components/Icons/pencil.svg';
import './FlightScheduling.css';

const apiURL = import.meta.env.VITE_API_BASE_URL;
function FlightScheduling() {

    //messages 
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false);

    const [message, setMessage] = useState(null);
    const [showMessage, setShowMessage] = useState(false);




    const [pageNumber, setPageNumber] = useState(1);       // pagination
    const [isCanceling, setIsCanceling] = useState(false); //cancellation
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
            setError("An error ocurred while creating a flight!");
            setShowError(true);
            return null;
        }

        const createdFlight = await response.json();
        console.log("Flight is created:", createdFlight);
        setMessage("Flight is added successfully!");
        setShowMessage(true);
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


    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Ovo mozda nece trebati jer se u editu  koristilo
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
    ///////////////////////////////////////////////////////////////////////////////////////////////////////


    const formatDateForInput = (dateString) => {
        console.log(dateString);
        const [month, day, year] = dateString.split('-');
        return `${month}-${day}-${year}`;
    };

    const closeCancelForm = () => {
        setIsAddingNew(false);
        setIsCanceling(null);
        resetForm();
    };
    /*
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
        };*/

    /*  // Update flight via API
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
      };*/

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
            setError("Missing information!");
            setShowError(true);
            return;
        }
        console.log(newFlight.origin);
        console.log(newFlight.schedule);
        console.log(newFlight.aircraftType);
        console.log(newFlight.origin);
        console.log(newFlight.destination);

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
                availableSeats: 370,
                status: 0,
            };

            const createdFlight = await createFlight(flightPayload);

            if (createdFlight) {
                setMessage("Flight was successfully added.");
                console.log("Flight added successfully", createdFlight);
                setShowMessage(true);
            } else {
                setError("Failed to add flight.");
                console.error("Flight creation failed", createdFlight);
                setShowError(true);
            }

            setIsAddingNew(false);
            resetForm();
            await fetchFlights();
        } catch (error) {
            console.error("Flight creation failed:", error.message);
        }
    };

    /* Delete vise nije potreban

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
                
                throw new Error('Failed to delete flight');
            }

            setFlights(flights.filter(f => f.id !== id));
            window.alert("Flight deleted successfully.");

            fetchFlights(); 
        } catch (error) {
            console.error('An error occured:', error);
            window.alert("Failed to delete flight.");
        }
    };*/

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



    ////////////////////////////////////////Cancelation/////////////////////////////////////////////

    //PATCH:  /api/Flight/cancel/schedule
    const cancelFlights = async (flight) => {

        //provjera u konzoli odredjenih vrijednosti
        console.log("Flight data: ", flight.id);
        console.log("FlightScedule: ", flight.schedule);
        console.log("New flight schedule: ", newFlight.schedule);
        console.log("Valid from: ", flight.validFrom);
        console.log("Valid to: ", flight.validTo);
        console.log("Cancel from: ", newFlight.validFrom);
        console.log("Cancel to: : ", newFlight.validTo);

        if (!newFlight.flightNumber || !newFlight.validFrom || !newFlight.validTo || !newFlight.schedule) {
            setError("Please select schedule and valid dates to cancel flights.");
            setShowError(true);
            return;
        }

        try {

            const payload = {
                flightNumber: flight.flightNumber,
                cancelFrom: flight.validFrom,
                cancelTo: flight.validTo,
                schedule: newFlight.schedule

            };

            const res = await fetch(`${apiURL}/Flight/cancel/schedule`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errText}`);
            } else {
                setMessage("Flight succesfully cancelled!");
                setShowMessage(true);
            }

            await fetchFlights();
            closeCancelForm();
            setIsCanceling(false);
            setEditingFlight(null);
        } catch (error) {
            console.error("Cancel failed:", error);
            setError("Failed to cancel flights.");
            setShowError(true);
        }
    };

    // Inicijalizacija dostupnih i selektovanih dana
    const [cancelAvailableDays, setCancelAvailableDays] = useState({
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
    });

    const [cancelSelectedDays, setCancelSelectedDays] = useState({
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
    });

    // Konverzija schedule stringa u dostupne dane
    const convertScheduleToDaysObject = (scheduleString) => {
        const dayMap = {
            1: 'mon',
            2: 'tue',
            3: 'wed',
            4: 'thu',
            5: 'fri',
            6: 'sat',
            7: 'sun',
        };

        const availableDays = {
            mon: false,
            tue: false,
            wed: false,
            thu: false,
            fri: false,
            sat: false,
            sun: false,
        };

        scheduleString?.split("").forEach((char) => {
            const dayKey = dayMap[parseInt(char)];
            if (dayKey) {
                availableDays[dayKey] = true;
            }
        });

        return availableDays;
    };


    const handleCancelFlight = (flight) => {
        console.log("Flight schedule string:", flight.schedule);

        const availableDays = convertScheduleToDaysObject(flight.schedule);
        setCancelAvailableDays(availableDays);
        console.log("Available days for cancelation:", availableDays);


        // Svi checkboxovi su prazni na početku
        setCancelSelectedDays({
            mon: false,
            tue: false,
            wed: false,
            thu: false,
            fri: false,
            sat: false,
            sun: false,
        });


        setIsCanceling(true);
        setEditingFlight(flight);
        setNewFlight({
            flightNumber: flight.flightNumber,
            schedule: flight.schedule,
            aircraftType: flight.aircraft?.model,
            departureTime: flight.departureTime.slice(11, 16),
            arrivalTime: flight.arrivalTime.slice(11, 16),
            origin: flight.departureDestination?.cityCode,
            destination: flight.arrivalDestination?.cityCode,
            validTo: formatDateForInput(flight.validTo.slice(0, 10)),
            validFrom: formatDateForInput(flight.validFrom.slice(0, 10)),
        });
    };


    const handleCancelDayChange = (dayKey) => {
        if (!cancelAvailableDays[dayKey]) return;

        const updatedSelectedDays = {
            ...cancelSelectedDays,
            [dayKey]: !cancelSelectedDays[dayKey],
        };

        setCancelSelectedDays(updatedSelectedDays);

        const dayMap = {
            mon: 1,
            tue: 2,
            wed: 3,
            thu: 4,
            fri: 5,
            sat: 6,
            sun: 7,
        };

        const newSchedule = Object.entries(updatedSelectedDays)
            .filter(([key, value]) => value)
            .map(([key]) => dayMap[key])
            .sort()
            .join("");

        setNewFlight((prevFlight) => ({
            ...prevFlight,
            schedule: newSchedule,
        }));
    };


    //Koristi se za prikaz statusa flighta
    const statusMap = {
        0: 'Scheduled',
        1: 'Departed',
        2: 'InAir',
        3: 'Landed',
        4: 'Delayed',
        5: 'Cancelled',
        6: 'Diverted'
    };


    return (
        <div className="container">
            <div className="button-container">
                <button className="btn btn-primary" onClick={() => setIsAddingNew(true)}>
                    <PlusCircle style={{ width: 20, height: 20, marginRight: 8 }} />
                    Add New Flight
                </button>
            </div>

            {/*forma za dodavanje leta*/}

            {isAddingNew && (
                <div className="form-container">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                        {'Add New Flight'}
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
                        <button className="btn btn-primary" onClick={handleAddFlight}>
                            <Save style={{ width: 16, height: 16, marginRight: 8 }} />
                            {'Save Flight'}
                        </button>

                    </div>
                </div>
            )}

            {/* Forma za otkazivanje leta */}
            {editingFlight && isCanceling && (
                <div className="form-container">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Cancel Flight</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="time-label">Flight Number</label>
                            <input
                                type="text"
                                className="form-input"
                                value={editingFlight.flightNumber}
                                disabled
                            />
                        </div>
                        <div className="form-group">
                            <label className="time-label">Aircraft Type</label>
                            <input
                                type="text"
                                className="form-input"
                                value={editingFlight.aircraft?.model}
                                disabled
                            />
                        </div>
                    </div>

                    {/* Schedule */}
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
                                        checked={cancelSelectedDays[key]}
                                        onChange={() => handleCancelDayChange(key)}

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
                                disabled
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
                                disabled
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
                                    disabled
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
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="time-label">Cancel From</label>
                            <input
                                type="date"
                                className="form-input"
                                value={editingFlight.validFrom}
                                onChange={(e) => setEditingFlight({ ...editingFlight, validFrom: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="time-label">Cancel To</label>
                            <input
                                type="date"
                                className="form-input"
                                value={editingFlight.validTo}
                                onChange={(e) => setEditingFlight({ ...editingFlight, validTo: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="actions">
                        <button
                            className="btn"
                            onClick={() => {
                                setIsCanceling(false);
                                setEditingFlight(null);
                                closeCancelForm();
                            }}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={() => cancelFlights(editingFlight)}>
                            <Save style={{ width: 16, height: 16, marginRight: 8 }} />
                            Cancel Flight
                        </button>
                    </div>
                </div>
            )}

            {/* Error States */}

            {error && showError && (
                <div className="modal-overlay">
                    <div className="error-modal">
                        <p>{error}</p>
                        <button onClick={() => setShowError(false)} className="modal-close-btn">
                            OK!
                        </button>
                    </div>
                </div>
            )}

            {message && showMessage && (
                <div className="modal-overlay">
                    <div className="message-modal">
                        <p>{message}</p>
                        <button onClick={() => setShowMessage(false)} className="modal-close-btn">
                            OK!
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
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flights.map((flight) => (
                            <tr
                                key={flight.id}
                                className={flight.status === 5 ? 'inactive-row' : ''}
                            >
                                <td>{flight.flightNumber}</td>
                                <td>{formatSchedule(flight.schedule)}</td>
                                <td>{flight.departureDestination?.name} → {flight.arrivalDestination?.name}</td>
                                <td>
                                    {flight.departureTime.slice(11, 16)} - {flight.arrivalTime.slice(11, 16)}
                                </td>

                                <td>{flight.aircraft?.model}</td>

                                <td>
                                    {flight.departureTime ? new Date(flight.departureTime).toLocaleDateString('en-GB') : ''}
                                </td>
                                <td className={`status-info status-${flight.status}`}>
                                    {statusMap[flight.status] || 'Unknown'}
                                </td>

                                <td style={{ textAlign: 'right' }}>
                                    <div className="button-group">
                                        {flight.status !== 5 && (
                                            <button className="btn btn-danger"
                                                style={{ backgroundColor: 'white' }}
                                                onClick={() => handleCancelFlight(flight)}>
                                                <Trash2 style={{ width: 20, height: 20 }} />
                                            </button>
                                        )}
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