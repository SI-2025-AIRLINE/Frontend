import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, Trash2, Edit, DollarSign } from 'lucide-react';
import Select from 'react-select';
import './FareManagement.css'

const apiURL = import.meta.env.VITE_API_BASE_URL;
function FareManagement() {

    // -------------------------------------------------------------------------
    // State hooks
    // -------------------------------------------------------------------------

    // Fares, flights, destinations, airports
    const [fares, setFares] = useState([]);
    const [selectedFlights, setSelectedFlights] = useState([]);
    const [allDestinations, setAllDestinations] = useState([]);
    const [airports, setAirports] = useState([]);
    const [airlines, setAirlines] = useState([]);
    const [selectedAirline, setSelectedAirline] = useState(null);
    const [flights, setFlights] = useState([]);
    
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingFare, setEditingFare] = useState(null);

    // Page
    const [pageSize, setPageSize] = useState(10);
    const [pageNumber, setPageNumber] = useState(1);

    const [flightNumber, setFlightNumber] = useState('');
    const [isFlightRangeMode, setIsFlightRangeMode] = useState(false);

    // Lock all fields
    const [fieldsLocked, setFieldsLocked] = useState(false); //ZAKLJUCAVANJE

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false);

    const [message, setMessage] = useState(null);
    const [showMessage, setShowMessage] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const [showForm, setShowForm] = useState(false);

    const [selectedFare, setSelectedFare] = useState(null);

    // New fare object
    const [newFare, setNewFare] = useState({
        fareCode: '',
        airline: null,
        flightNumberFrom: '',
        flightNumberTo: '',
        origin: '',
        destination: '',
        validFrom: '',
        validTo: '',
        firstClassPrice: '',
        businessClassPrice: '',
        economyClassPrice: '',
        selectedFlights: []
    });

    // Form data object
    const [formData, setFormData] = useState({
        fareCode: '',
        airline: '',
        flightNumberFrom: '',
        flightNumberTo: '',
        origin: '',
        destination: '',
        validFrom: '',
        validTo: '',
        firstClassPrice: '',
        businessClassPrice: '',
        economyClassPrice: '',
        selectedFlights: []
    });

    // Style
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '42px',
            borderColor: state.isDisabled ? 'var(--gray-200)' : 'var(--gray-300)',
            backgroundColor: state.isDisabled ? 'var(--gray-100)' : 'white',
            '&:hover': {
                borderColor: state.isDisabled ? 'var(--gray-200)' : 'var(--primary-color)'
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

    // -------------------------------------------------------------------------
    // Effect hooks
    // -------------------------------------------------------------------------
    
    // Get all destinations
    useEffect(() => {
        fetch(`${apiURL}/Destination/all`)
            .then(res => res.json())
            .then(data => {
                const mapped = data.map(dest => ({
                    label: `${dest.name} (${dest.cityCode} / ${dest.airportCode})`,
                    value: dest.cityCode
                }));
                setAllDestinations(mapped);
                setLoading(false);
            });
    }, []);

    // Get all airports
    useEffect(() => {
        fetch(`${apiURL}/Aircraft`)
            .then(res => res.json())
            .then(data => {
                const mapped = data.map(a => ({
                    value: a.id,
                    label: `${a.name} (${a.airportCode})`
                }));
                setAirports(mapped);
            })
            .catch(err => console.error("Failed to fetch airports:", err));
    }, []);

    // Get all airlines
    useEffect(() => {
        fetch(`${apiURL}/Airline/all`)
            .then(res => res.json())
            .then(data => {
                const mapped = data.map(airline => ({
                    id: airline.id,
                    name: airline.name,
                    label: `${airline.name} (${airline.iata})`,
                    value: airline.id,
                    iata: airline.iata,
                }));
                setAirlines(mapped);
            })
            .catch(console.error);
    }, []);

    // Get all flight instances
    useEffect(() => {
        fetch(`${apiURL}/Flight/instances`)
            .then(res => res.json())
            .then(data => {
                const mapped = data.map(flight => ({
                    id: flight.id,
                    flightNumber: flight.flightNumber,
                    label: `${flight.flightNumber} (${flight.departureDestination?.airportCode} → ${flight.arrivalDestination?.airportCode})`,
                    value: flight.id,
                    validFrom: flight.validFrom,
                    validTo: flight.validTo
                }));
                setFlights(mapped);
            })
            .catch(console.error);

    }, []);

    // Gets all fares
    useEffect(() => {
        fetchFares();
    }, [pageNumber, pageSize]);
    
    // -------------------------------------------------------------------------
    // API call functions
    // -------------------------------------------------------------------------

    /**
    * Fetches all fares (GET: api/Fares)
    */
    const fetchFares = async () => {
        try {
            const url = `${apiURL}/Fares?pageNumber=${pageNumber}&pageSize=${pageSize}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error fetching flights: ${response.statusText}`);
            }

            const data = await response.json();
            const mappedFares = data.map(item => ({
                id: item.fare.id,
                code: item.fare.fareCode,
                economyPrice: item.fare.economyPrice,
                businessPrice: item.fare.businessPrice,
                firstClassPrice: item.fare.firstClassPrice,
                validFrom: item.fare.validFrom,
                validTo: item.fare.validTo,
                flightNumber: item.flightNumber
            }));

            setFares(mappedFares);

        } catch (error) {
            console.error('Failed to fetch flights:', error);
        }
    };

    /**
     * Returns a destination ID based on its city code.
     * @param {Number} cityCode City code
     * @returns Destination's ID
     */
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

    //
    /**
     * Creates a new fare (POST: /api/Fares)
     * @param {*} fareData 
     * @returns 
     */
    const createFare = async (fareData) => {
        try {
            const res = await fetch(`${apiURL}/Fares/Form`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fareData),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            //const result = await res.json(); 

            await fetchFares();

            return true;
        } catch (error) {
            console.error('Failed to create fare:', error);
            return false;
        }
    };

    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------

    /*
    const handleAddFare = async () => {
        if (!selectedFlights) {
            alert("Please select a flight.");
            return;
        }

        let departureId = 0;
        let arrivalId = 0;


        // Ako nismo u flight range režimu i origin/destination su postavljeni, dohvatimo ID-jeve
        if (!isFlightRangeMode) {
            //console.log("ovdje pada");
            try {
                departureId = await getDestinationIdByCityCode(newFare.origin);
                arrivalId = await getDestinationIdByCityCode(newFare.destination);
            } catch (err) {
                console.error("Destination error:", err);
                alert("Invalid origin or destination.");
                return;
            }
        }

        const rangeFrom = parseInt(newFare.flightNumberFrom) || 0;
        const rangeTo = parseInt(newFare.flightNumberTo) || 0;

        const fareData = {
            FareCode: newFare.fareCode,
            AirlineId: newFare.airline.value,
            EconomyPrice: parseFloat(newFare.economyClassPrice) || 0,
            BusinessPrice: parseFloat(newFare.businessClassPrice) || 0,
            FirstClassPrice: parseFloat(newFare.firstClassPrice) || 0,
            ValidFrom: newFare.validFrom,
            ValidTo: newFare.validTo,
            SingleFlights: selectedFlights
                .map(f => {
                    const numberPart = f.split(/[^0-9]/g).pop(); // uzimamo broj iz stringa (npr. "XY123" -> "123")
                    const parsed = parseInt(numberPart);
                    return isNaN(parsed) ? null : parsed;
                })
                .filter(f => f !== null),
            RangeFrom: rangeFrom,
            RangeTo: rangeTo,
            DestinationIdFrom: departureId,
            DestinationIdTo: arrivalId
        };

        // Validacija: mora biti unesen flight range ILI destinacije
        const hasValidRange = rangeFrom > 0 && rangeTo >= rangeFrom;
        const hasValidDestinations = departureId && arrivalId;

        if (!hasValidRange && !hasValidDestinations) {
            alert("Please fill either origin/destination or flight number range.");
            return;
        }

        try {
            const result = await createFare(fareData);

            if (result) {
                alert("Fare successfully added to flight(s).");
                setShowMessage(true);
                setIsAddingNew(false);
                setEditingFare(null);
                resetForm();
                //setFares(prev => [...prev, result.Fare]);
            } else {
                throw new Error("Failed to save fare.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to save fare.");
            setError(err.message);
            setShowError(true);
        }
    };

    /*
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    */

    // const handleAddFare_nevaljala = async () => {
    //     if (!selectedFlights) {
    //         alert("Please select a flight.");
    //         return;
    //     }

    //     let departureId = 0;
    //     let arrivalId= 0;

    //     // Ako nismo u flight range režimu i origin/destination su postavljeni, dohvatimo ID-jeve
    //     if (!isFlightRangeMode) {
    //         try {
    //             departureId = await getDestinationIdByCityCode(newFare.origin);
    //             arrivalId = await getDestinationIdByCityCode(newFare.destination);
    //         } catch (err) {
    //             console.error("Destination error:", err);
    //             alert("Invalid origin or destination.");
    //             return;
    //         }
    //     }

    //     // Ažuriranje za flight range
    //     const rangeFrom = parseInt(newFare.flightNumberFrom) || 0;
    //     const rangeTo = parseInt(newFare.flightNumberTo) || 0;

    //     // Validacija: mora biti unesen flight range ILI destinacije
    //     const hasValidRange = rangeFrom > 0 && rangeTo >= rangeFrom;
    //     const hasValidDestinations = departureId && arrivalId;

    //     // Ako nijedno nije ispunjeno, tražimo korisniku da popuni podatke
    //     if (!hasValidRange && !hasValidDestinations) {
    //         alert("Please fill either origin/destination or flight number range.");
    //         return;
    //     }

    //     // Pozivanje handleFlightRangeInput ako je potrebno
    //     handleFlightRangeInput({ target: { value: rangeFrom } }, 'flightNumberFrom');
    //     handleFlightRangeInput({ target: { value: rangeTo } }, 'flightNumberTo');

    //     // Pozivanje handleOriginDestinationChange ako je potrebno
    //     if (!isFlightRangeMode) {
    //         handleOriginDestinationChange(newFare.origin, 'origin');
    //         handleOriginDestinationChange(newFare.destination, 'destination');
    //     }

    //     const fareData = {
    //         FareCode: newFare.fareCode,
    //         AirlineId: newFare.airline.value,
    //         EconomyPrice: parseFloat(newFare.economyClassPrice) || 0,
    //         BusinessPrice: parseFloat(newFare.businessClassPrice) || 0,
    //         FirstClassPrice: parseFloat(newFare.firstClassPrice) || 0,
    //         ValidFrom: newFare.validFrom,
    //         ValidTo: newFare.validTo,
    //         SingleFlights: selectedFlights
    //             .map(f => {
    //                 const numberPart = f.split(/[^0-9]/g).pop(); // uzimamo broj iz stringa (npr. "XY123" -> "123")
    //                 const parsed = parseInt(numberPart);
    //                 return isNaN(parsed) ? null : parsed;
    //             })
    //             .filter(f => f !== null),
    //         RangeFrom: rangeFrom,
    //         RangeTo: rangeTo,
    //         DestinationIdFrom: departureId,
    //         DestinationIdTo: arrivalId
    //     };

    //     resetForm();
        
    //     try {
    //         const result = await createFare(fareData);

    //         if (result) {
    //             alert("Fare successfully added to flight(s).");
    //             setShowMessage(true);
    //             setIsAddingNew(false);
    //             setEditingFare(null);
    //         } else {
    //             throw new Error("Failed to save fare.");
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         alert("Failed to save fare.");
    //         setError(err.message);
    //         setShowError(true);
    //     }
    // };

    /**
     * Deletes a fare with ID `id` (DELETE: api/Fares/id)
     * @param {Number} id Fare ID
     * @returns 
     */
    const handleDeleteFare = async (id) => {
        if (!window.confirm('Are you sure you want to delete this fare?')) {
            return;
        }

        setLoading(true);
        resetForm();
        setError(null);
        try {
            const res = await fetch(`${apiURL}/Fares/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            await fetchFares();
            return true;
        } catch (error) {
            console.error('Failed to delete airport:', error);
            return false;
        }
    };

    const handleAddFare = async () => {
        if (!selectedFlights) {
            alert("Please select a flight.");
            return;
        }

        // Parse range values first
        const rangeFrom = parseInt(newFare.flightNumberFrom) || 0;
        const rangeTo = parseInt(newFare.flightNumberTo) || 0;
        
        // Determine the mode directly from the data, don't rely on isFlightRangeMode state
        const hasFlightRange = rangeFrom > 0 && rangeTo >= rangeFrom;
        const hasSingleFlights = selectedFlights.length > 0;

        // Pozivanje handleFlightRangeInput ako je potrebno
        handleFlightRangeInput({ target: { value: rangeFrom } }, 'flightNumberFrom');
        handleFlightRangeInput({ target: { value: rangeTo } }, 'flightNumberTo');
        
        let departureId = 0;
        let arrivalId = 0;
        
        // Only try to get destination IDs if we're not using flight range
        if (!hasFlightRange && newFare.origin && newFare.destination) {
            try {
                departureId = await getDestinationIdByCityCode(newFare.origin);
                arrivalId = await getDestinationIdByCityCode(newFare.destination);
            } catch (err) {
                console.error("Destination error:", err);
                alert("Invalid origin or destination.");
                return;
            }
        }
        
        // Check if we have valid data
        const hasValidDestinations = departureId && arrivalId;
        
        if (!hasFlightRange && !hasValidDestinations && !hasSingleFlights) {
            alert("Please add flights or fill either origin/destination or flight number range.");
            return;
        }
        
        const fareData = {
            FareCode: newFare.fareCode,
            AirlineId: newFare.airline.value,
            EconomyPrice: parseFloat(newFare.economyClassPrice) || 0,
            BusinessPrice: parseFloat(newFare.businessClassPrice) || 0,
            FirstClassPrice: parseFloat(newFare.firstClassPrice) || 0,
            ValidFrom: newFare.validFrom,
            ValidTo: newFare.validTo,
            SingleFlights: selectedFlights
                .map(f => {
                    const numberPart = f.split(/[^0-9]/g).pop(); // uzimamo broj iz stringa (npr. "XY123" -> "123")
                    const parsed = parseInt(numberPart);
                    return isNaN(parsed) ? null : parsed;
                })
                .filter(f => f !== null),
            RangeFrom: rangeFrom,
            RangeTo: rangeTo,
            DestinationIdFrom: departureId,
            DestinationIdTo: arrivalId
        };
        
        try {
            const result = await createFare(fareData);

            if (result) {
                alert("Fare successfully added to flight(s).");
                setShowMessage(true);
                setIsAddingNew(false);
                setEditingFare(false);
                resetForm();
            } else {
                throw new Error("Failed to save fare.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to save fare.");
            setError(err.message);
            setShowError(true);
            resetForm();
        }
    };

    const handleFlightRangeInput = (e, field) => {
        const value = e.target.value;
        setNewFare({ ...newFare, [field]: value });
        setIsFlightRangeMode(!!value || !!newFare[field === 'flightNumberFrom' ? 'flightNumberTo' : 'flightNumberFrom']);
        if (value) {
            setNewFare(prev => ({
                ...prev,
                origin: '',
                destination: ''
            }));
        }
    };
    
    const handleOriginDestinationChange = (selected, field) => {
      setNewFare({ ...newFare, [field]: selected });
      setIsFlightRangeMode(false);
      if (selected || newFare[field === 'origin' ? 'destination' : 'origin']) {
        setNewFare(prev => ({
          ...prev,
          flightNumberFrom: '',
          flightNumberTo: ''
        }));
      }
    };
    
    /**
     * Add all the flights in range to the `selectedFlights` list
     */
    const handleAddFlights = () => {
        if (isFlightRangeMode) {
            if (!newFare.flightNumberFrom || !newFare.flightNumberTo || !newFare.airline) return;

            const prefix = newFare.airline.value;
            const start = parseInt(newFare.flightNumberFrom);
            const end = parseInt(newFare.flightNumberTo);

            const flights = [];
            for (let i = start; i <= end; i++) {
                flights.push(`${prefix}${i.toString().padStart(3, '0')}`);
            }

            setSelectedFlights([...new Set([...selectedFlights, ...flights])]);

        } else {
            if (!newFare.origin || !newFare.destination || !newFare.airline) return;

            const flight = `${newFare.airline.value}${Math.floor(Math.random() * 900 + 100)}`;
            setSelectedFlights([...selectedFlights, flight]);
        }

        setIsFlightRangeMode(false);
        setFieldsLocked(true); // ZAKLJUČAJ SVE
    };

    const handleAddFlight = () => {
        if (!flightNumber) return;
        setSelectedFlights([...selectedFlights, flightNumber]);
        setFlightNumber('');
    };
    /*
    const handleRemoveFlight = (flightToRemove) => {
        setFormData(prev => ({
            ...prev,
            selectedFlights: prev.selectedFlights.filter(f => f !== flightToRemove)
        }));
    };*/

    /**
     * Removes a flight from `selectedFlights`
     * @param {String} flight Flight number
     */
    const handleRemoveFlight = (flight) => {
        setSelectedFlights(selectedFlights.filter(f => f !== flight));
    };
    /*
    const handleAddFare = () => {
      if (!newFare.code || !newFare.airline || !selectedFlights.length) return;
      
      const fareData = {
        ...newFare,
        id: editingFare || Math.random().toString(36).substr(2, 9),
        flights: selectedFlights,
        airline: newFare.airline.label,
        origin: newFare.origin?.value,
        destination: newFare.destination?.value
      };
  
      if (editingFare) {
        setFares(fares.map(fare => fare.id === editingFare ? fareData : fare));
        setEditingFare(null);
      } else {
        setFares([...fares, fareData]);
      }
  
      setIsAddingNew(false);
      resetForm();
    };
  
    const handleEditFare = (fare) => {
      setEditingFare(fare.id);
      setNewFare({
        ...fare,
        airline: airlines.find(a => a.label === fare.airline),
        origin: airports.find(a => a.value === fare.origin),
        destination: airports.find(a => a.value === fare.destination)
      });
      setSelectedFlights(fare.flights);
      setIsAddingNew(true);
    };
    
    const handleDeleteFare = (id) => {
      setFares(fares.filter(f => f.id !== id));
    };*/
    /*
    const fetchFareToEdit = async (id) => {
        try {
            const response = await fetch(`${apiURL}/Fares/${id}`);
            if (!response.ok) {
                throw new Error(`Error fetching fare: ${response.statusText}`);
            }

            const fareData = await response.json();
            setSelectedFare(fareData);

            // Pronađi sve povezane entitete
            const airline = airlines.find(a => a.value === fareData.airlineId);
            const origin = airports.find(a => a.value === fareData.origin);
            const destination = airports.find(a => a.value === fareData.destination);
            const relatedFlights = flights.filter(f => fareData.flightIds?.includes(f.id));

            // Popuni formu (newFare)
            setNewFare({
                code: fareData.code,
                airline,
                origin,
                destination,
                validFrom: fareData.validFrom?.split('T')[0],
                validTo: fareData.validTo?.split('T')[0],
                firstClassPrice: fareData.firstClassPrice,
                businessPrice: fareData.businessPrice,
                economyPrice: fareData.economyPrice,
            });
            /*
            setSelectedFlights(relatedFlights);
            setEditingFare(fareId);
            setIsAddingNew(true);
        } catch (err) {
            console.error("Failed to fetch fare for edit:", err);
        }
    };
    
    const handleEditFare = (fareId) => {
        fetchFareToEdit(fareId);
        setEditingFare(true); // Show the form for editing
    };

    const updateFare = async (fareId, updatedFareData) => {
        try {
            const res = await fetch(`${apiURL}/Fares/${fareId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedFareData),
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            await fetchFares(); // ponovno učitaj sve tarife
            return true;
        } catch (error) {
            console.error('Failed to update fare:', error);
            return false;
        }
    };


    const handleUpdateFare = async () => {
        if (!editingFare) {
            alert("Please select a fare to edit.");
            return;
        }

        const updatedFareData = {
            code: newFare.code,
            validFrom: newFare.validFrom,
            validTo: newFare.validTo,
            firstClassPrice: parseFloat(newFare.firstClassPrice) || 0,
            businessPrice: parseFloat(newFare.businessPrice) || 0,
            economyPrice: parseFloat(newFare.economyPrice) || 0,
            airline: newFare.airline?.label,
            airlineId: newFare.airline?.value, // ako ti backend koristi ID
            origin: newFare.origin?.value,
            destination: newFare.destination?.value,
            flightIds: selectedFlights.map(flight => flight.id)
        };

        const success = await updateFare(editingFare, updatedFareData);

        if (success) {
            alert('Fare updated successfully');
            setShowMessage(true);
            setIsAddingNew(false);
            resetForm(); // koristi novu reset funkciju
            setEditingFare(null);
        } else {
            alert('Failed to update fare');
            setError('Failed to update fare');
            setShowError(true);
        }
    };*/

    const handleEditFare = async (id) => {
        try {
            // Poziv na API da dobijemo detalje o tarifi prema ID-u
            const response = await fetch(`${apiURL}/Fares/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch fare data.');
            }

            const fare = await response.json();

            // Postavljamo vrednosti u stanje nakon što smo dobili podatke
            setEditingFare(id);
            setNewFare({
                ...fare,
                airline: airlines.find(a => a.label === fare.airline),
                origin: airports.find(a => a.value === fare.origin),
                destination: airports.find(a => a.value === fare.destination)
            });
            setSelectedFlights(fare.flights);
            setIsAddingNew(true);
        } catch (error) {
            console.error('Error fetching fare data:', error);
            alert('Failed to load fare data for editing.');
        }
    };

    // TODO
    // const handleUpdateFare = async () => {
    //     try {
    //         const fareData = {
    //             ...newFare, // Koristimo nove vrednosti koje je korisnik uneo
    //             airline: newFare.airline.value, // Ako je "airline" objekat, pretvaramo ga u odgovarajući format
    //             origin: newFare.origin.value,   // Isto za origin
    //             destination: newFare.destination.value, // I za destination
    //         };

    //         const response = await fetch(`${apiURL}/Fares/${editingFare}`, {
    //             method: 'PUT', // Metoda za ažuriranje resursa
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(fareData),
    //         });

    //         if (!response.ok) {
    //             throw new Error('Failed to update fare.');
    //         }

    //         const updatedFare = await response.json();

    //         alert('Fare updated successfully.');
    //         setIsAddingNew(false);
    //         setEditingFare(null);
    //         setNewFare({}); // Resetujemo formu nakon uspešnog ažuriranja
    //         await fetchFares(); // Ponovno učitaj sve tarife
    //     } catch (error) {
    //         console.error('Error updating fare:', error);
    //         alert('Failed to update fare.');
    //     }
    // };


    const resetForm = () => {
        setNewFare({
            fareCode: '',
            airline: null, // Must be null for Select
            flightNumberFrom: '',
            flightNumberTo: '',
            origin: '',
            destination: '',
            validFrom: '',
            validTo: '',
            firstClassPrice: '',
            businessClassPrice: '',
            economyClassPrice: ''
        });
        setFormData({
            code: '',
            airline: '',
            flightNumberFrom: '',
            flightNumberTo: '',
            origin: '',
            destination: '',
            validFrom: '',
            validTo: '',
            firstClassPrice: '',
            businessClassPrice: '',
            economyClassPrice: ''
        });
        setSelectedFlights([]); // Reset selected flights
        setShowForm(false);
        setSelectedFare(null);
        setIsFlightRangeMode(false);
        setFieldsLocked(false);
        setEditingFare(null);
        setFlightNumber(''); // Reset the flight number input too
    };

    // Handle form data change and tracking
    const handleInputChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));

        setEditingFare((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // -------------------------------------------------------------------------
    // Component render
    // -------------------------------------------------------------------------

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
                        <label className="form-label">Code</label>
                        <input
                            type="text"
                            className="form-input"
                            value={newFare.fareCode}
                            onChange={(e) => setNewFare({ ...newFare, fareCode: e.target.value })}
                            placeholder="Enter fare code"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Airline</label>
                        <Select
                            options={airlines}
                            value={newFare.airline}
                            onChange={(selected) => setNewFare({ ...newFare, airline: selected })}
                            styles={selectStyles}
                            placeholder="Select airline..."
                            isSearchable
                            isDisabled={!!editingFare || fieldsLocked} //ZAKLJUCAJ SVE
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Flight number from</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newFare.flightNumberFrom}
                                onChange={(e) => handleFlightRangeInput(e, 'flightNumberFrom')}
                                placeholder="Start number"
                                //disabled={!!(newFare.origin || newFare.destination)}
                                disabled={fieldsLocked || !!editingFare || !!(newFare.origin || newFare.destination)} //ZAKLJUCAJ SVE
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Flight number to</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newFare.flightNumberTo}
                                onChange={(e) => handleFlightRangeInput(e, 'flightNumberTo')}
                                placeholder="End number"
                                //disabled={!!(newFare.origin || newFare.destination)}
                                disabled={fieldsLocked || !!editingFare || !!(newFare.origin || newFare.destination)} //ZAKLJUCAJ SVE
                            />
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Origin</label>
                            <Select
                                options={allDestinations}
                                value={allDestinations.find(option => option.value === newFare.origin) || null}
                                onChange={(selectedOption) =>
                                    setNewFare({ ...newFare, origin: selectedOption.value })
                                }
                                styles={selectStyles}
                                placeholder="Select origin..."
                                isSearchable
                                isClearable
                                //isDisabled={isFlightRangeMode}
                                isDisabled={fieldsLocked || !!editingFare || !!(newFare.flightNumberFrom || newFare.flightNumberTo)} //ZAKLJUCAJ SVE
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Destination</label>
                            <Select
                                options={allDestinations}
                                value={allDestinations.find(option => option.value === newFare.destination) || null}
                                onChange={(selectedOption) =>
                                    setNewFare({ ...newFare, destination: selectedOption.value })
                                }
                                styles={selectStyles}
                                placeholder="Select destination..."
                                isSearchable
                                isClearable
                                //isDisabled={isFlightRangeMode}
                                isDisabled={fieldsLocked || !!editingFare || !!(newFare.flightNumberFrom || newFare.flightNumberTo)} //ZAKLJUCAJ SVE 
                            />
                        </div>
                    </div>

                    {((newFare.flightNumberFrom && newFare.flightNumberTo) ||
                        (newFare.origin && newFare.destination)) && !fieldsLocked && (
                            <div className="form-group" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="btn btn-primary" onClick={handleAddFlights}>
                                    Add Flights
                                </button>
                            </div>
                        )}

                    <div className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Flight number</label>
                            <input
                                type="text"
                                className="form-input"
                                value={flightNumber}
                                onChange={(e) => setFlightNumber(e.target.value)}
                                placeholder="Enter flight number"
                            />
                        </div>
                        <button className="btn btn-primary" onClick={handleAddFlight}>
                            Add Flight
                        </button>
                    </div>

                    {selectedFlights.length > 0 && (
                        <div className="selected-flights">
                            <label className="form-label">Selected Flights</label>
                            <div className="flight-chips">
                                {selectedFlights.map((flight) => (
                                    <div key={flight} className="flight-chip">
                                        {flight}
                                        <button
                                            className="flight-chip-remove"
                                            onClick={() => handleRemoveFlight(flight)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Valid From</label>
                            <input
                                type="date"
                                className="form-input"
                                value={newFare.validFrom}
                                onChange={(e) => setNewFare({ ...newFare, validFrom: e.target.value })}
                                min={new Date().toISOString().split("T")[0]} //OD DANASNJEG DATUMA
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Valid To</label>
                            <input
                                type="date"
                                className="form-input"
                                value={newFare.validTo}
                                onChange={(e) => setNewFare({ ...newFare, validTo: e.target.value })}
                                min={newFare.validFrom || new Date().toISOString().split("T")[0]} //OD FROM DATUMA
                            />
                        </div>
                    </div>

                    <div className="fare-inputs">
                        <div className="fare-input-group">
                            <label className="fare-label">First Class Price</label>
                            <div className="price-input-wrapper">
                                <input
                                    type="number"
                                    className="form-input"
                                    value={newFare.firstClassPrice}
                                    onChange={(e) => setNewFare({ ...newFare, firstClassPrice: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="fare-input-group">
                            <label className="fare-label">Business Class Price</label>
                            <div className="price-input-wrapper">
                                <input
                                    type="number"
                                    className="form-input"
                                    value={newFare.businessClassPrice}
                                    onChange={(e) => setNewFare({ ...newFare, businessClassPrice: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="fare-input-group">
                            <label className="fare-label">Economy Class Price</label>
                            <div className="price-input-wrapper">
                                <input
                                    type="number"
                                    className="form-input"
                                    value={newFare.economyClassPrice}
                                    onChange={(e) => setNewFare({ ...newFare, economyClassPrice: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="actions">
                        <button className="btn" onClick={() => {
                            setIsAddingNew(false);
                            setEditingFare(null);
                            setNewFare({
                                code: '',
                                airline: '',
                                flightNumberFrom: '',
                                flightNumberTo: '',
                                origin: '',
                                destination: '',
                                validFrom: '',
                                validTo: '',
                                firstClassPrice: '',
                                businessClassPrice: '',
                                economyClassPrice: '',
                                selectedFlights: ''
                            });
                            //setSelectedFlight(null);
                        }}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleAddFare}>
                            <Save style={{ width: 16, height: 16, marginRight: 8 }} />
                            {editingFare ? 'Update Fare' : 'Add Fare'}
                        </button>
                    </div>
                </div>
            )}

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Code</th>
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
                                <td>{fare.code}</td>
                                <td>{new Date(fare.validFrom).toLocaleDateString()} - {new Date(fare.validTo).toLocaleDateString()}</td>
                                <td>${fare.firstClassPrice}</td>
                                <td>${fare.businessPrice}</td>
                                <td>${fare.economyPrice}</td>
                                <td>
                                    <div className="button-group">
                                        <button className="btn btn-icon" onClick={() => handleEditFare(fare.id)}>
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