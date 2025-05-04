import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, Trash2, Edit } from 'lucide-react';
import Select from 'react-select';
import './FareManagement.css';

const apiURL = import.meta.env.VITE_API_BASE_URL;
function FareManagement() {
  const [fares, setFares] = useState([

  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingFare, setEditingFare] = useState(null);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [pageSize, setPageSize] = useState(10);
    const [pageNumber, setPageNumber] = useState(1); 

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false);

    const [message, setMessage] = useState(null);
    const [showMessage, setShowMessage] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const [showForm, setShowForm] = useState(false);

  const [newFare, setNewFare] = useState({
    flightId: '',
    validFrom: '',
    validTo: '',
    firstClassPrice: '',
    businessPrice: '',
    economyPrice: ''
  });


   const [formData, setFormData] = useState({
       flightId: '',
       validFrom: '',
       validTo: '',
       firstClassPrice: '',
       businessPrice: '',
       economyPrice: ''
    });

    const [selectedFare, setSelectedFare] = useState(null);
    //let pageSize = 100;
    const [flights, setFlights] = useState([]);

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
                console.log("Flightd: ", mapped);
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
            console.log(data);
            setFares(data);

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
   /* function confirmModal(actionToRun) {
        setConfirmAction(() => actionToRun);
        setShowConfirm(true);
    }
    function handleDeleteFare(id) {
        confirmModal(async () => {
            const success = await deleteFare(id);
            if (success) {
                setMessage('Airport deleted successfully');
                setShowMessage(true);
            } else {
                setError('Failed to delete airport');
                setShowError(true);
            }
        });
    }*/

    //POST- /api/Fares
    const createFare = async(flightNumber, fareData) => {
        console.log("FlightNumber: ", flightNumber);
        try {
            const res = await fetch(`${apiURL}/Fares/${flightNumber}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fareData),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            await fetchFares(); // Refresh the airport list

            return true;
        } catch (error) {
            console.error('Failed to create fare:', error);
            return false;
        }
    };

    const handleAddFare = async () => {
        if (!selectedFlight) {
            alert("Please select a flight.");
            return;
        }

        const fareData = {
            flightId: selectedFlight.id,
            validFrom: newFare.validFrom,
            validTo: newFare.validTo,
            firstClassPrice: parseFloat(newFare.firstClassPrice) || 0,
            businessPrice: parseFloat(newFare.businessPrice) || 0,
            economyPrice: parseFloat(newFare.economyPrice) || 0,
        };

        console.log("fareData: ", fareData);

        const success = await createFare(selectedFlight.flightNumber, fareData);

        if (success) {
            alert('Fare added successfully');
            setShowMessage(true);
            setIsAddingNew(false);
            resetFareForm();
        } else {
            setError('Failed to add fare');
            setShowError(true);
        }
    };




    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };
    // Fetch the fare details based on the fare ID
    const fetchFareToEdit = async (id) => {
        console.log("Fare to fetch: ", id);
        try {
            const response = await fetch(`${apiURL}/Fares/${id}`);
            if (!response.ok) {
                throw new Error(`Error fetching fare details: ${response.statusText}`);
            }
            const fareData = await response.json();
            console.log('Fare data to edit:', fareData);

            const flight = flights.find(f => f.value === fareData.flightNumber);
            setSelectedFlight(flight);
            
            // Pre-fill the form fields with the fetched fare data
            setFormData({
                flightId: fareData.flightId,
                validFrom: formatDate(fareData.fare?.validFrom),
                validTo: formatDate(fareData.fare?.validTo),
                firstClassPrice: fareData.fare?.firstClassPrice,
                businessPrice: fareData.fare?.businessPrice,
                economyPrice: fareData.fare?.economyPrice,
            });
            setSelectedFare(fareData);  // Set the fare data to selectedFare for later use
        } catch (error) {
            console.error('Failed to fetch fare:', error);
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

            // After successful update, fetch the latest fares to reflect changes
            await fetchFares();
            return true;
        } catch (error) {
            console.error('Failed to update fare:', error);
            return false;
        }
    };

    const handleUpdateFare = async () => {
        if (!selectedFare) {
            alert("Please select a fare to edit.");
            return;
        }

        const updatedFareData = {
            validFrom: formData.validFrom,
            validTo: formData.validTo,
            firstClassPrice: parseFloat(formData.firstClassPrice) || 0,
            businessPrice: parseFloat(formData.businessPrice) || 0,
            economyPrice: parseFloat(formData.economyPrice) || 0,
        };

        console.log("Updated fare data:", updatedFareData);
        console.log("SelectedFare: ", selectedFare);

        const success = await updateFare(selectedFare.fare?.id, updatedFareData);

        if (success) {
            alert('Fare updated successfully');
            setShowMessage(true);
            setIsAddingNew(false);
            setShowForm(false);
        } else {
            setError('Failed to update fare');
            setShowError(true);
        }
    };
    const resetFareForm = () => {
        setFormData({
            flightId: '',
            validFrom: '',
            validTo: '',
            firstClassPrice: '',
            businessPrice: '',
            economyPrice: ''
        });
        setShowForm(false);
        setSelectedFare(null); // Clear selected fare
    };


    // Handle form data change and tracking
    const handleInputChange = (key, value) => {
        console.log("HandleInputChange");
       
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));

        setEditingFare((prev) => ({
            ...prev,
            [key]: value,
        }));
    };










    //PUT- api/Fares/id
    // PUT - api/Fares/id
 /*   const updateFare = async (id, fareData) => {
        try {
            const res = await fetch(`${apiURL}/Fares/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fareData),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            await fetchFares();
            return true;
        } catch (error) {
            console.error('Failed to update fare:', error);
            return false;
        }
    };

    // Handle editing a fare
    const handleEditFare = (fare) => {
        console.log('Edit fare: ', fare);

       

        console.log("Fare.FlightNumber", fare.flightNumber);

          
        setFormData({
            flightNumber: fare.flightNumber,
            validFrom: fare.validFrom,
            validTo: fare.validTo,
            firstClassPrice: fare.firstClassPrice,
            businessClassPrice: fare.businessClassPrice,
            economyClassPrice: fare.economyClassPrice,
        });
        console.log("FormData: ", formData);
        setIsAddingNew(false);
        setShowForm(true); // tek na kraju
 // Make sure the form is being shown
    };


    // Handle form data change and tracking
    const handleInputChange = (key, value) => {
        console.log("HandleInputChange");
        setEditingFare((prev) => ({
            ...prev,
            [key]: value,
        }));
    };


    // Handle form submission (Save changes)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const fareData = {
            flightNumber: formData.flightNumber,
            validFrom: formData.validFrom,
            validTo: formData.validTo,
            firstClassPrice: formData.firstClassPrice,
            businessClassPrice: formData.businessClassPrice,
            economyClassPrice: formData.economyClassPrice,
        };
        console.log("FareDataSubmit: ", fareData);
        const success = await updateFare(editingFare.id, fareData);

        if (success) {
            setShowForm(false); // Hide the form after successful update
        }
    };
  /*  const updateFare = async (id, fareData) => {
        try {
            const res = await fetch(`${apiURL}/Fares/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fareData),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            await fetchFares();
            return true;
        } catch (error) {
            console.error('Failed to update fare:', error);
            return false;
        }
    };



    const handleEditFare = (fare) => {
        console.log('Edit fare: ', fare);

        setNewFare({
            flightNumber: fare.flightNumber,
            validFrom: fare.validFrom,
            validTo: fare.validTo,
            firstClassPrice: fare.firstClassPrice,
            businessClassPrice: fare.businessClassPrice,
            economyClassPrice: fare.economyClassPrice,
        });

        const flight = flights.find(f => f.value === fare.flightNumber);
        setSelectedFlight(flight);

        setEditingFare(fare);
        setIsAddingNew(false);

        setFormData({
            flightNumber: fare.flightNumber,
            validFrom: fare.validFrom,
            validTo: fare.validTo,
            firstClassPrice: fare.firstClassPrice,
            businessClassPrice: fare.businessClassPrice,
            economyClassPrice: fare.economyClassPrice,
        });

        setShowForm(true);
    };*/

 /*   const handleEditFare = async (e) => {
        e.preventDefault();

        const fareData = {
            flightNumber: formData.flightNumber,
            validFrom: formData.fare?.validFrom,
            validTo: formData.fare?.validTo,
            firstClassPrice: formData.fare?.firstClassPrice,
            businessPrice: formData.fare?.businessPrice,
            economyPrice: formData.fare?.economyPrice
        };

        const success = await updateFare(editingFare.fare?.id, fareData);

        if (success) {
            setMessage('Fare updated successfully');
            setShowMessage(true);
            setEditingFare(null);
            setShowForm(false);
            resetFareForm();
        } else {
            setError('Failed to update fare');
            setShowError(true);
        }
    };*/
 

/*
    async function handleSubmit(e) {
        e.preventDefault();
        /*if (!formData.name || !formData.cityCode || !formData.airportCode) {
            setError("Please fill out all required fields.");
            setShowError(true);
            return;
        }

        const onlyLettersRegex = /^[A-Za-z]+$/;
        const onlyLettersAndSpacesRegex = /^[A-Za-z\s]+$/;

        if (
            !onlyLettersAndSpacesRegex.test(formData.name) ||
            !onlyLettersRegex.test(formData.cityCode) ||
            !onlyLettersRegex.test(formData.airportCode)
        ) {
            setError("Fields 'Airport name', 'City' and 'IATA' must contain only letters.");
            setShowError(true);
            return;
        }


        let success;
        if (editingFare) {
            // Update existing airport
            success = await updateFare(editingFare.fare?.id, formData);
            if (success) {
                setMessage('Fare updated successfully');
                setShowMessage(true);
            } else {
                setError('Failed to update fare');
                setShowError(true);
                return;
            }
        } else {
            // Create new airport
            delete formData.fare?.id;

           
            success = await createFare(formData);
            if (success) {
                setMessage('Fare added successfully');
                setShowMessage(true);
            } else {
                setError('Failed to add fare');
                setShowError(true);
                return;
            }
        }

        // Reset form state
        setFormData({ name: '', cityCode: '', airportCode: '', Status: 1 });
        setEditingFare(null);
        setShowForm(false);


    }
    */





  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '42px',
      borderColor: 'var(--gray-300)',
      '&:hover': {
        borderColor: 'var(--primary-color)'
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
  /*
  const handleAddFare = () => {
    if (!selectedFlight || !newFare.validFrom || !newFare.validTo) return;

    if (editingFare) {
      setFares(fares.map(fare => 
        fare.id === editingFare ? { ...newFare, id: editingFare } : fare
      ));
      setEditingFare(null);
    } else {
      setFares([...fares, {
        ...newFare,
        flightNumber: selectedFlight.value,
        id: Math.random().toString(36).substr(2, 9)
      }]);
    }

    setIsAddingNew(false);
    setNewFare({
      flightNumber: '',
      validFrom: '',
      validTo: '',
      firstClassPrice: '',
      businessClassPrice: '',
      economyClassPrice: ''
    });
    setSelectedFlight(null);
  };
/*
 const handleEditFare = (fare) => {
    setEditingFare(fare.id);
    setNewFare({
      flightNumber: fare.flightNumber,
      validFrom: fare.validFrom,
      validTo: fare.validTo,
      firstClassPrice: fare.firstClassPrice,
      businessClassPrice: fare.businessClassPrice,
      economyClassPrice: fare.economyClassPrice
    });
    const flight = flights.find(f => f.value === fare.flightNumber);
    setSelectedFlight(flight);
    setIsAddingNew(true);
  };

  
  const handleDeleteFare = (id) => {
    setFares(fares.filter(f => f.id !== id));
  };*/

  const handleFlightSelect = (selected) => {
    setSelectedFlight(selected);
    console.log("Selected Flight data:", selected)
    if (selected) {
      setNewFare(prev => ({
        ...prev,
        validFrom: selected.validFrom,
        validTo: selected.validTo
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

          {/* {isAddingNew && (
        <div className="form-container">
          <div className="form-group">
            <label className="form-label">{editingFare ? 'Flight' : 'Select Flight'}</label>
            <Select
              options={flights}
              value={selectedFlight}
              onChange={handleFlightSelect}
              styles={selectStyles}
              placeholder="Search for a flight..."
              isSearchable
              isDisabled={!!editingFare}
            />
          </div>

          <div className="flight-valid-container">
            <label className="form-label">Flight Valid:</label>
            <div className="flight-valid-dates">
              {selectedFlight ? (
                <>
                  <span>From {new Date(selectedFlight.validFrom).toLocaleDateString()}</span>
                  <span> To {new Date(selectedFlight.validTo).toLocaleDateString()}</span>
                </>
              ) : (
                <span>Select a flight to see validity.</span>
              )}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">From</label>
              <input
                type="date"
                className="form-input"
                value={newFare.validFrom}
                onChange={(e) => setNewFare({ ...newFare, validFrom: e.target.value })}
                min={selectedFlight?.validFrom}
                max={selectedFlight?.validTo}
              />
            </div>
            <div className="form-group">
              <label className="form-label">To</label>
              <input
                type="date"
                className="form-input"
                value={newFare.validTo}
                onChange={(e) => setNewFare({ ...newFare, validTo: e.target.value })}
                min={selectedFlight?.validFrom}
                max={selectedFlight?.validTo}
              />
            </div>
          </div>

          <div className="fare-inputs" style={{ display: 'flex', gap: '20px' }}>
            <div className="fare-input-group" style={{ flex: 1 }}>
              <label className="form-label">First Class Price</label>
              <input
                type="number"
                className="form-input"
                value={newFare.firstClassPrice}
                onChange={(e) => setNewFare({ ...newFare, firstClassPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="fare-input-group" style={{ flex: 1 }}>
              <label className="form-label">Business Class Price</label>
              <input
                type="number"
                className="form-input"
                value={newFare.businessClassPrice}
                onChange={(e) => setNewFare({ ...newFare, businessPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="fare-input-group" style={{ flex: 1 }}>
              <label className="form-label">Economy Class Price</label>
              <input
                type="number"
                className="form-input"
                value={newFare.economyClassPrice}
                onChange={(e) => setNewFare({ ...newFare, economyPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn" onClick={() => {
              setIsAddingNew(false);
              setEditingFare(null);
              setNewFare({
                flightNumber: '',
                validFrom: '',
                validTo: '',
                firstClassPrice: '',
                businessClassPrice: '',
                economyClassPrice: ''
              });
              setSelectedFlight(null);
            }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddFare}>
              <Save style={{ width: 16, height: 16, marginRight: 8 }} />
              {editingFare ? 'Update Fare' : 'Save Fare'}
            </button>
          </div>
        </div>
      )}
      */}
          {isAddingNew && (
              <div className="form-container">
                  <h3 className="form-title">Add New Fare</h3>

                  <div className="form-group">
                      <label className="form-label">Select Flight</label>
                      <Select
                          options={flights}
                          value={selectedFlight}
                          onChange={handleFlightSelect}
                          styles={selectStyles}
                          placeholder="Search for a flight..."
                          isSearchable
                      />
                  </div>

                  <div className="flight-valid-container">
                      <label className="form-label">Flight Valid:</label>
                      <div className="flight-valid-dates">
                          {selectedFlight ? (
                              <>
                                  <span>From {new Date(selectedFlight.validFrom).toLocaleDateString()}</span>
                                  <span> To {new Date(selectedFlight.validTo).toLocaleDateString()}</span>
                              </>
                          ) : (
                              <span>Select a flight to see validity.</span>
                          )}
                      </div>
                  </div>

                  <div className="form-grid">
                      <div className="form-group">
                          <label className="form-label">From</label>
                          <input
                              type="date"
                              className="form-input"
                              value={newFare.validFrom}
                              onChange={(e) => setNewFare({ ...newFare, validFrom: e.target.value })}
                              min={selectedFlight ? formatDate(selectedFlight.validFrom) : ''}
                              max={selectedFlight ? formatDate(selectedFlight.validTo) : ''}
                              disabled = {!selectedFlight}
                          />
                      </div>
                      <div className="form-group">
                          <label className="form-label">To</label>
                          <input
                              type="date"
                              className="form-input"
                              value={newFare.validTo}
                              onChange={(e) => setNewFare({ ...newFare, validTo: e.target.value })}
                              min={selectedFlight ? formatDate(selectedFlight.validFrom) : ''}
                              max={selectedFlight ? formatDate(selectedFlight.validTo) : ''}
                              disabled = {!selectedFlight}
                          />
                      </div>
                  </div>

                  <div className="fare-inputs" style={{ display: 'flex', gap: '20px' }}>
                      <div className="fare-input-group" style={{ flex: 1 }}>
                          <label className="form-label">First Class Price</label>
                          <input
                              type="number"
                              className="form-input"
                              value={newFare.firstClassPrice}
                              onChange={(e) => setNewFare({ ...newFare, firstClassPrice: e.target.value })}
                              placeholder="0.00"
                          />
                      </div>

                      <div className="fare-input-group" style={{ flex: 1 }}>
                          <label className="form-label">Business Class Price</label>
                          <input
                              type="number"
                              className="form-input"
                              value={newFare.businessPrice}
                              onChange={(e) => setNewFare({ ...newFare, businessPrice: e.target.value })}
                              placeholder="0.00"
                          />
                      </div>

                      <div className="fare-input-group" style={{ flex: 1 }}>
                          <label className="form-label">Economy Class Price</label>
                          <input
                              type="number"
                              className="form-input"
                              value={newFare.economyPrice}
                              onChange={(e) => setNewFare({ ...newFare, economyPrice: e.target.value })}
                              placeholder="0.00"
                          />
                      </div>
                  </div>

                  <div className="actions">
                      <button
                          className="btn"
                          onClick={() => {
                              setIsAddingNew(false);
                              setNewFare({
                                  flightNumber: '',
                                  validFrom: '',
                                  validTo: '',
                                  firstClassPrice: '',
                                  businessPrice: '',
                                  economyPrice: ''
                              });
                              setSelectedFlight(null);
                          }}
                      >
                          Cancel
                      </button>
                      <button className="btn btn-primary" onClick={handleAddFare}>
                          <Save style={{ width: 16, height: 16, marginRight: 8 }} />
                          Save Fare
                      </button>
                  </div>
              </div>
          )}
          {editingFare && (
              <div className="form-container">
                  <h3 className="form-title">Edit Fare</h3>

                  <div className="form-group">
                      <label className="form-label">Flight</label>
                      <input
                          type="text"
                          value={selectedFare ? selectedFare.flightNumber : ''}
                          styles={selectStyles}
                          disabled
                      />
                  </div>

                  <div className="flight-valid-container">
                      <label className="form-label">Flight Valid:</label>
                      <div className="flight-valid-dates">
                          {selectedFare ? (
                              <>
                                  <span>From {new Date(selectedFare.validFrom).toLocaleDateString()}</span>
                                  <span> To {new Date(selectedFare.validTo).toLocaleDateString()}</span>
                              </>
                          ) : (
                              <span>Select a flight to see validity.</span>
                          )}
                      </div>
                  </div>

                  <div className="form-grid">
                      <div className="form-group">
                          <label className="form-label">From</label>
                          <input
                              type="date"
                              className="form-input"
                              value={formData.validFrom}
                              onChange={(e) => handleInputChange('validFrom', e.target.value)} // Handle change here
                              name="validFrom"
                              min={selectedFare?.validFrom}
                              max={selectedFare?.validTo}
                          />
                      </div>
                      <div className="form-group">
                          <label className="form-label">To</label>
                          <input
                              type="date"
                              className="form-input"
                              value={formData.validTo}
                              onChange={(e) => handleInputChange('validTo', e.target.value)} // Handle change here
                              name="validTo"
                              min={formData.validFrom}
                              max={formData.validTo}
                          />
                      </div>
                  </div>

                  <div className="fare-inputs" style={{ display: 'flex', gap: '20px' }}>
                      <div className="fare-input-group" style={{ flex: 1 }}>
                          <label className="form-label">First Class Price</label>
                          <input
                              type="number"
                              className="form-input"
                              value={formData.firstClassPrice}
                              onChange={(e) => handleInputChange('firstClassPrice', e.target.value)} // Handle change here
                              name="firstClassPrice"
                              placeholder="0.00"
                          />
                      </div>

                      <div className="fare-input-group" style={{ flex: 1 }}>
                          <label className="form-label">Business Class Price</label>
                          <input
                              type="number"
                              className="form-input"
                              value={formData.businessPrice}
                              onChange={(e) => handleInputChange('businessPrice', e.target.value)} // Handle change here
                              name="businessPrice"
                              placeholder="0.00"
                          />
                      </div>

                      <div className="fare-input-group" style={{ flex: 1 }}>
                          <label className="form-label">Economy Class Price</label>
                          <input
                              type="number"
                              className="form-input"
                              value={formData.economyPrice}
                              onChange={(e) => handleInputChange('economyPrice', e.target.value)} // Handle change here
                              name="economyPrice"
                              placeholder="0.00"
                          />
                      </div>
                  </div>

                  <div className="actions">
                      <button
                          className="btn"
                          onClick={() => {
                              setEditingFare(null);
                              setSelectedFare(null);
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



      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Flight</th>
              <th>Validity Period</th>
              <th>First Class</th>
              <th>Business Class</th>
              <th>Economy Class</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fares.map((fareDB) => (
              <tr key={fareDB.fare?.id}>
                <td>{fareDB.flightNumber}</td>
                <td>{new Date(fareDB.fare?.validFrom).toLocaleDateString()} - {new Date(fareDB.fare?.validTo).toLocaleDateString()}</td>
                <td>{fareDB.fare?.firstClassPrice}</td>
                <td>{fareDB.fare?.businessPrice}</td>
                <td>{fareDB.fare?.economyPrice}</td>
                <td>
                  <div className="button-group">
                    <button className="btn btn-icon" onClick={() => handleEditFare(fareDB.fare?.id)}>
                      <Edit style={{ width: 20, height: 20 }} />
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDeleteFare(fareDB.fare?.id)}>
                      <Trash2 style={{ width: 20, height: 20 }} />
                    </button>
                  </div>
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

