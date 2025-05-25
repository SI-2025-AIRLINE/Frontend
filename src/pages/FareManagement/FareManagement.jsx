import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, Trash2, Edit, X, Info } from 'lucide-react';
import Select from 'react-select';
import './FareManagement.css'

const apiURL = import.meta.env.VITE_API_BASE_URL;
function FareManagement() {
    const [fares, setFares] = useState([]);
    const [selectedAirline, setSelectedAirline] = useState(null);
    const [updateFare, setUpdateFare] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingFare, setEditingFare] = useState(null);
    const [selectedFlights, setSelectedFlights] = useState([]);

    const [pageSize, setPageSize] = useState(10);
    const [pageNumber, setPageNumber] = useState(1);

    const [flightNumber, setFlightNumber] = useState('');
    const [isFlightRangeMode, setIsFlightRangeMode] = useState(false);
    const [fieldsLocked, setFieldsLocked] = useState(false); 

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false);

    const [message, setMessage] = useState(null);
    const [showMessage, setShowMessage] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const [showForm, setShowForm] = useState(false);

    const [expandedRow, setExpandedRow] = React.useState(null);
    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const [allDestinations, setAllDestinations] = useState([]);
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

    const [airports, setAirports] = useState([]);
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

    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const maxValues = {
        bronze: 10,
        silver: 20,
        gold: 30,
        platinum: 40,
        diamond: 50,
    };

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
        bronzeTier: '',
        silverTier: '',
        goldTier: '',
        platinumTier: '',
        diamondTier: '',
        selectedFlights: []
    });

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
        bronzeTier: '',
        silverTier: '',
        goldTier: '',
        platinumTier: '',
        diamondTier: '',
        selectedFlights: []
    });

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

    const [selectedFare, setSelectedFare] = useState(null);
    const [flights, setFlights] = useState([]);
    const [airlines, setAirlines] = useState([]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

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
                    validTo: flight.validTo,
                    departureDestination: flight.departureDestination,
                    arrivalDestination: flight.arrivalDestination,
                    fareId: flight.fareId // Add this to track if fare is already applied
                }));
                setFlights(mapped);
            })
            .catch(console.error);

    }, []);

    // GET: api/Fares
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
                bronzeTier: item.fare.bronzeTierDiscount,
                silverTier: item.fare.silverTierDiscount,
                goldTier: item.fare.goldTierDiscount,
                platinumTier: item.fare.platinumTierDiscount,
                diamondTier: item.fare.diamondTierDiscount,
                validFrom: item.fare.validFrom,
                validTo: item.fare.validTo,
                flightNumber: item.flightNumber
            }));

            setFares(mappedFares);

        } catch (error) {
            console.error('Failed to fetch flights:', error);
        }
    };

    useEffect(() => {
        fetchFares();
    }, [pageNumber, pageSize]);

    //DELETE- api/Fares/id
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

    //POST- /api/Fares
    const createFare = async (fareData) => {
        try {
            const res = await fetch(`${apiURL}/Fares/List`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fareData),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            await fetchFares();

            return true;
        } catch (error) {
            console.error('Failed to create fare:', error);
            return false;
        }
    };

    const handleAddFare = async () => {
        if (!selectedFlights || selectedFlights.length === 0) {
            setError("Please select or add flights.");
            setShowError(true);
            return;
        }

        if( !newFare.validFrom || !newFare.validTo) {
            setError("Please select valid dates.");
            setShowError(true);
            return;
        }
        if (!newFare.firstClassPrice && !newFare.businessClassPrice && !newFare.economyClassPrice) {
            setError("Please enter at least one fare price.");
            setShowError(true);
            return;
        }
        if (newFare.validFrom > newFare.validTo) {
            setError("Valid From date cannot be later than Valid To date.");
            setShowError(true);
            return;
        }
        if (newFare.validFrom < new Date().toISOString().split("T")[0]) {
            setError("Valid From date cannot be in the past.");
            setShowError(true);
            return;
        }           

        console.log("Selected flights:", selectedFlights);

        // // Parse range values first
        // const rangeFrom = parseInt(newFare.flightNumberFrom) || 0;
        // const rangeTo = parseInt(newFare.flightNumberTo) || 0;

        // // Determine the mode directly from the data, don't rely on isFlightRangeMode state
        // const hasFlightRange = rangeFrom > 0 && rangeTo >= rangeFrom;
        // const hasSingleFlights = selectedFlights.length > 0;

        // Pozivanje handleFlightRangeInput ako je potrebno
        // handleFlightRangeInput({ target: { value: rangeFrom } }, 'flightNumberFrom');
        // handleFlightRangeInput({ target: { value: rangeTo } }, 'flightNumberTo');

        // let departureId = 0;
        // let arrivalId = 0;

        // Only try to get destination IDs if we're not using flight range
        // if (!hasFlightRange && newFare.origin && newFare.destination) {
        //     try {
        //         departureId = await getDestinationIdByCityCode(newFare.origin);
        //         arrivalId = await getDestinationIdByCityCode(newFare.destination);
        //     } catch (err) {
        //         console.error("Destination error:", err);
        //         alert("Invalid origin or destination.");
        //         return;
        //     }
        // }

        // Check if we have valid data
        // const hasValidDestinations = departureId && arrivalId;

        // if (!hasFlightRange && !hasValidDestinations && !hasSingleFlights) {
        //     alert("Please add flights or fill either origin/destination or flight number range.");
        //     return;
        // }

        for (const tier of tiers) {
            const discount = parseFloat(newFare[`${tier}Tier`]);
            if (discount > maxValues[tier]) {
                setError(`${tier} discount exceeds max of ${maxValues[tier]}%`);
                setShowError(true);
                return;
            }
        }

        const fareData = {
            FareCode: newFare.fareCode,
            EconomyPrice: parseFloat(newFare.economyClassPrice) || 0,
            BusinessPrice: parseFloat(newFare.businessClassPrice) || 0,
            FirstClassPrice: parseFloat(newFare.firstClassPrice) || 0,
            BronzeTierDiscount: parseFloat(newFare.bronzeTier) || 0,
            SilverTierDiscount: parseFloat(newFare.silverTier) || 0,
            GoldTierDiscount: parseFloat(newFare.goldTier) || 0,
            PlatinumTierDiscount: parseFloat(newFare.platinumTier) || 0,
            DiamondTierDiscount: parseFloat(newFare.diamondTier) || 0,
            ValidFrom: newFare.validFrom,
            ValidTo: newFare.validTo,
            flightNumbers: selectedFlights.map(flight => {
                if (typeof flight === 'object') {
                    return flight.flightNumber;
                }
                return flight;
            })
        };

        console.log("Fare data:", fareData);

        try {
            const result = await createFare(fareData);

            if (result) {
                setMessage("Fare successfully added to flight(s).");
                setShowMessage(true);
                setIsAddingNew(false);
                setEditingFare(null);
                resetForm();
            } else {
                throw new Error("Failed to save fare.");
            }
        } catch (err) {
            console.error(err);
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

    const handleAddFlights = () => {
        const prefix = newFare.airline.iata;
        console.log("Prefix:", prefix);
        
        let airlineFlights = flights.filter(flight => flight.flightNumber.startsWith(prefix));
        console.log("Airline flights:", airlineFlights);
        
        if (isFlightRangeMode) {
            if (!newFare.flightNumberFrom || !newFare.flightNumberTo || !newFare.airline) return;

            const start = parseInt(newFare.flightNumberFrom);
            const end = parseInt(newFare.flightNumberTo);

            const affectedFlights = airlineFlights.filter(flight => {
                const flightNumber = parseInt(flight.flightNumber.replace(prefix + "-", ''));
                return flightNumber >= start && flightNumber <= end;
            });

            console.log("Affected flights:", affectedFlights);

            if(affectedFlights.length === 0) {
                setError("No flights found in the specified range.");
                setShowError(true);
                return;
            }

            // Use flight objects instead of strings
            setSelectedFlights([...new Set([...selectedFlights, ...affectedFlights])]);

        } else {
            if (!newFare.origin || !newFare.destination || !newFare.airline) return;

            // Find flights that match origin and destination
            const matchingFlights = airlineFlights.filter(flight => {
                const departure = flight.departureDestination?.cityCode || flight.departureDestination?.airportCode;
                const arrival = flight.arrivalDestination?.cityCode || flight.arrivalDestination?.airportCode;
                return departure === newFare.origin && arrival === newFare.destination;
            });
            console.log("Matching flights:", matchingFlights);
            if (matchingFlights.length === 0) {
                setError("No flights found for the selected origin and destination.");
                setShowError(true);
                return;
            }

            setSelectedFlights([...new Set([...selectedFlights, ...matchingFlights])]);
        }
        
        setIsFlightRangeMode(false);
        setFieldsLocked(true); 
    };

    const handleAddFlight = () => {
        if (!flightNumber) return;

        var flightNumberWithPrefix = selectedAirline?.iata + '-' + flightNumber;

        const existingFlight = flights.find(flight => flight.flightNumber === flightNumberWithPrefix);
        const isInSelected = selectedFlights.find(flight => flight.flightNumber === flightNumberWithPrefix);

        if (existingFlight && !isInSelected) {
            setSelectedFlights([...new Set([...selectedFlights, existingFlight])]);
        }

        setFlightNumber('');
    };

    const handleRemoveFlight = (flight) => {
        setSelectedFlights(selectedFlights.filter(f => {
            if (typeof f === 'object' && typeof flight === 'object') {
                return f.id !== flight.id;
            }
            return f !== flight;
        }));
    };

    const handleEditFare = async (id) => {
        try {
            const response = await fetch(`${apiURL}/Fares/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch fare data.');
            }

            var fareData = await response.json();
            const fare = fareData.fare;
            console.log("Fare data:", fare);

            const convertedFare = { ...fare };
            tiers.forEach(tier => {
                const key = `${tier}TierDiscount`;
                const val = convertedFare[key];
                if (val !== undefined && val !== null) {
                    convertedFare[key] = Math.round(val * 100);
                }
            });

            setUpdateFare({
                ...convertedFare
            });
            setIsAddingNew(false);
            setEditingFare(true);
        } catch (error) {
            console.error('Error fetching fare data:', error);
            setError('Failed to load fare data for editing.');
            setShowError(true);
        }
    };

    const handleUpdateFare = async () => {
        for (const tier of tiers) {
            const discount = parseFloat(updateFare[`${tier}TierDiscount`]);
            if (discount > maxValues[tier]) {
                setError(`${tier.charAt(0).toUpperCase() + tier.slice(1)} discount exceeds max of ${maxValues[tier]}%`);
                setShowError(true);
                return; // prekini ako je validacija neuspešna
            }
        }
        try {
            const fareData = {
                ...updateFare
            };

            console.log("Update fare data:", fareData);

            const response = await fetch(`${apiURL}/Fares/${updateFare.id}`, {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fareData),
            });

            if (!response.ok) {
                throw new Error('Failed to update fare.');
            }

            setMessage('Fare updated successfully.');
            setShowMessage(true);
            setIsAddingNew(false);
            setEditingFare(null);
            setNewFare({});
            await fetchFares(); 
        } catch (error) {
            console.error('Error updating fare:', error);
            setError('Failed to update fare.');
            setShowError(true);
        }
    };

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
            economyClassPrice: '',
            bronzeTier: '',
            silverTier: '',
            goldTier: '',
            platinumTier: '',
            diamondTier: ''
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
            economyClassPrice: '',
            bronzeTier: '',
            silverTier: '',
            goldTier: '',
            platinumTier: '',
            diamondTier: ''
        });
        setSelectedFlights([]); // Reset selected flights
        setShowForm(false);
        setSelectedFare(null);
        setIsFlightRangeMode(false);
        setFieldsLocked(false);
        setEditingFare(null);
        setFlightNumber(''); // Reset the flight number input too
        setSelectedAirline(null);
    };

    // Handle form data change and tracking
    const handleInputChange = (key, value) => {
        const intValue = value === '' ? '' : parseInt(value, 10);
        if (intValue === '' || (!isNaN(intValue) && intValue >= 0)) {
            setFormData(prev => ({
                ...prev,
                [key]: intValue
            }));
            setUpdateFare(prev => ({
                ...prev,
                [key]: intValue,
            }));
        }
    };

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
                            isSearchable
                            onChange={(selectedOption) => {
                                setSelectedAirline(selectedOption);
                                setNewFare({ ...newFare, airline: selectedOption });
                            }}
                            placeholder="Search airline..."
                            value={newFare.airline}
                            styles={selectStyles}
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Flight number from</label>
                            <div className="flight-number-wrapper">
                                <span className="flight-prefix">
                                    {selectedAirline ? `${selectedAirline.iata}-` : ''}
                                </span>
                                <input
                                    type="text"
                                    className="flight-number-suffix"
                                    value={newFare.flightNumberFrom} // Remove prefix for input
                                    onChange={(e) => handleFlightRangeInput(e, 'flightNumberFrom')}
                                    disabled={!selectedAirline}
                                    placeholder="e.g. 1234"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Flight number from</label>
                            <div className="flight-number-wrapper">
                                <span className="flight-prefix">
                                    {selectedAirline ? `${selectedAirline.iata}-` : ''}
                                </span>
                                <input
                                    type="text"
                                    className="flight-number-suffix"
                                    value={newFare.flightNumberTo} // Remove prefix for input
                                    onChange={(e) => handleFlightRangeInput(e, 'flightNumberTo')}
                                    disabled={!selectedAirline}
                                    placeholder="e.g. 1235"
                                />
                            </div>
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
                                isDisabled={selectedAirline === null || fieldsLocked || !!editingFare || !!(newFare.flightNumberFrom || newFare.flightNumberTo)} //ZAKLJUCAJ SVE
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
                                isDisabled={selectedAirline === null || fieldsLocked || !!editingFare || !!(newFare.flightNumberFrom || newFare.flightNumberTo)} //ZAKLJUCAJ SVE 
                            />
                        </div>
                    </div>

                    {((newFare.flightNumberFrom && newFare.flightNumberTo) ||
                        (newFare.origin && newFare.destination)) && 
                        (selectedFlights.length === 0 || !fieldsLocked) && (
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
                                disabled={selectedAirline === null}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={handleAddFlight}>
                            Add Flight
                        </button>
                    </div>

                    {selectedFlights && selectedFlights.length > 0 && (
                        <div className="selected-flights-container" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>Selected Flights ({selectedFlights.length})</h4>
                            </div>
                            <div className="flights-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {selectedFlights.map((flight, index) => {
                                    const isFlightObject = typeof flight === 'object';
                                    const flightNumber = isFlightObject ? flight.flightNumber : flight;
                                    const departureCode = isFlightObject ? flight.departureDestination?.airportCode : '';
                                    const arrivalCode = isFlightObject ? flight.arrivalDestination?.airportCode : '';
                                    const hasFare = isFlightObject && flight.fareId;

                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '0.75rem',
                                                marginBottom: '0.5rem',
                                                backgroundColor: 'white',
                                                borderRadius: '6px',
                                                border: '1px solid #e9ecef',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '0.25rem' }}>
                                                    {flightNumber}
                                                </div>
                                                {isFlightObject && (
                                                    <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                                        {departureCode} → {arrivalCode}
                                                        {hasFare && (
                                                            <span style={{
                                                                marginLeft: '0.5rem',
                                                                padding: '0.25rem 0.5rem',
                                                                backgroundColor: '#f8d7da',
                                                                color: '#721c24',
                                                                fontSize: '0.75rem',
                                                                borderRadius: '4px',
                                                                fontWeight: '500'
                                                            }}>
                                                                Fare Already Applied
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {!isFlightObject && (
                                                    <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                                        Manual entry - details unavailable
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFlight(flight)}
                                                style={{
                                                    padding: '0.5rem',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                                                onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {selectedFlights.length == 0 && (
                        <div className="no-flights-message" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', color: 'rgb(220, 53, 69)' }}>
                            No flights selected. Please add flights to proceed.
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
                                min={new Date().toISOString().split("T")[0]} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Valid To</label>
                            <input
                                type="date"
                                className="form-input"
                                value={newFare.validTo}
                                onChange={(e) => setNewFare({ ...newFare, validTo: e.target.value })}
                                min={newFare.validFrom || new Date().toISOString().split("T")[0]} 
                            />
                        </div>
                    </div>

                    {/* dodano za loyalty */ }
                    <label className="form-label">Discounts per Tier (%)</label>
                    <div className="fare-section">
                        <div className="fare-discounts">
                            {tiers.map((tier) => (
                                <div key={tier} className="discount-input-row">
                                    <span className={`tier-badge ${tier}`}>
                                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                    </span>
                                    <input
                                        type="number"
                                        className="discount-input"
                                        name={tier}
                                        value={newFare[`${tier}Tier`]}
                                        max={maxValues[tier]}
                                        onChange={e => setNewFare({
                                            ...newFare,
                                            [`${tier}Tier`]: e.target.value
                                        })}
                                        placeholder={`0 - ${maxValues[tier]}%`}
                                    />
                                </div>
                            ))}
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
                                bronzeTier: '',
                                silverTier: '',
                                goldTier: '',
                                platinumTier: '',
                                diamondTier: '',
                                selectedFlights: ''
                            });
                            resetForm();
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

            {editingFare && (
              <div className="form-container">
                  <h3 className="form-title">Edit Fare</h3>

                  <div className="form-group">
                      <label className="form-label">Fare Code</label>
                      <input
                          type="text"
                          value={updateFare.fareCode}
                          styles={selectStyles}
                          disabled
                      />
                  </div>

                  <div className="flight-valid-container">
                      <label className="form-label">Flight Valid:</label>
                      <div className="flight-valid-dates" >
                          {updateFare ? (
                              <>
                                  <span> From {updateFare.validFrom ? formatDate(updateFare.validFrom) : ''}</span>
                                  <span> To {updateFare.validTo ? formatDate(updateFare.validTo) : ''}</span>
                              </>
                          ) : (
                              <span>Select a flight to see validity.</span>
                          )}
                      </div>
                    </div>

                    {/* dodano za loyalty */}
                    <label className="form-label">Discounts per Tier (%)</label>
                    <div className="fare-section">
                        <div className="fare-discounts">
                            {tiers.map((tier) => (
                                <div key={tier} className="discount-input-row">
                                    <span className={`tier-badge ${tier}`}>
                                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                    </span>
                                    <input
                                        type="number"
                                        className="discount-input"
                                        name={tier}
                                        value={updateFare[`${tier}TierDiscount`]}
                                        max={maxValues[tier]}
                                        onChange={e => handleInputChange(`${tier}TierDiscount`, e.target.value)}
                                        placeholder={`0 - ${maxValues[tier]}%`}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="fare-inputs">
                            <div className="fare-input-group">
                                <label className="fare-label">First Class Price</label>
                                <div className="price-input-wrapper">
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={updateFare.firstClassPrice}
                                        onChange={(e) => handleInputChange('firstClassPrice', e.target.value)}
                                        name="firstClassPrice"
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
                                        value={updateFare.businessPrice}
                                        onChange={(e) => handleInputChange('businessPrice', e.target.value)} // Handle change here
                                        name="businessPrice"
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
                                        value={updateFare.economyPrice}
                                        onChange={(e) => handleInputChange('economyPrice', e.target.value)} // Handle change here
                                        name="economyPrice"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                  <div className="actions">
                      <button
                          className="btn"
                          onClick={() => {
                              setEditingFare(null);
                              setSelectedFare(null);
                              resetForm();
                          }}
                      >
                          Cancel
                      </button>
                      <button className="btn btn-primary" onClick={handleUpdateFare}>  {/* Handle submit here */}
                          <Save style={{ width: 16, height: 16, marginRight: 8 }} />
                          Update Fare
                      </button>
                  </div>
              </div>
          )}

            {error && showError && (
                <div className="modal-overlay-flightScheduling">
                    <div className="error-modal-flightScheduling">
                        <p>{error}</p>
                        <button onClick={() => setShowError(false)} className="modal-close-btn-flightScheduling">
                            OK
                        </button>
                    </div>
                </div>
            )}

            {message && showMessage && (
                <div className="modal-overlay-flightScheduling">
                    <div className="message-modal-flightScheduling">
                        <p>{message}</p>
                        <button onClick={() => setShowMessage(false)} className="modal-close-btn-flightScheduling">
                            OK
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
                            <th>Tier Discounts</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fares.map((fare) => (
                            <React.Fragment key={fare.id}>
                                <tr>
                                    <td>{fare.code}</td>
                                    <td>{new Date(fare.validFrom).toLocaleDateString()} - {new Date(fare.validTo).toLocaleDateString()}</td>
                                    <td>${fare.firstClassPrice}</td>
                                    <td>${fare.businessPrice}</td>
                                    <td>${fare.economyPrice}</td>
                                    <td>
                                        <button
                                            className="btn-icon info-btn"
                                            onClick={() => toggleRow(fare.id)}
                                            aria-label="Toggle tier discounts"
                                            style={{ background: "none", border: "none", cursor: "pointer" }}
                                        >
                                            <Info style={{ width: 20, height: 20 }} />
                                        </button>
                                    </td>
                                    <td>
                                        <div className="button-group">
                                            <button className="btn btn-icon" onClick={() => handleEditFare(fare.id)}>
                                                <Edit style={{ width: 20, height: 20 }} />
                                            </button>
                                            <button className="btn btn-danger" onClick={() => handleDeleteFare(fare.id)}>
                                                <Trash2 style={{ width: 20, height: 20, color: "red" }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {expandedRow === fare.id && (
                                    <tr className="tier-details-row">
                                        <td colSpan={7}>
                                            <div className="tier-badge-row">
                                                <div className="tier-badge-display bronze">Bronze: {(fare.bronzeTier * 100).toFixed(0)}%</div>
                                                <div className="tier-badge-display silver">Silver: {(fare.silverTier * 100).toFixed(0)}%</div>
                                                <div className="tier-badge-display gold">Gold: {(fare.goldTier * 100).toFixed(0)}%</div>
                                                <div className="tier-badge-display platinum">Platinum: {(fare.platinumTier * 100).toFixed(0)}%</div>
                                                <div className="tier-badge-display diamond">Diamond: {(fare.diamondTier * 100).toFixed(0)}%</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
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
                        disabled={fares.length < pageSize}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FareManagement;