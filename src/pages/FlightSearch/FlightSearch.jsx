import './FlightSearch.css';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const apiURL = import.meta.env.VITE_API_BASE_URL;

export default function FlightSearch() {
  /********************************
   *     Search Bar Logic         *
   ********************************/
  const today = new Date();
  const [originAirport, setOriginAirport] = useState("");
  const [destinationAirport, setDestinationAirport] = useState("");
  const [departDate, setDepartDate] = useState(null);

  const handleOriginChange = (e) => {
    setOriginAirport(e.target.value);
  };
  const handleDestinationChange = (e) => {
    setDestinationAirport(e.target.value);
  };
  const handleDepartChange = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setDepartDate(formattedDate);
  };

  /********************************
   *     Filter Bars Logic        *
   ********************************/
  const [data, setData] = useState([]);
  const [flights, setFlights] = useState([]);

  const [takeoffBegin, setTakeoffBegin] = useState(null);
  const [takeoffEnd, setTakeoffEnd] = useState(null);
  const [landingBegin, setLandingBegin] = useState(null);
  const [landingEnd, setLandingEnd] = useState(null);

  const [priceOption, setPriceOption] = useState("");
  const [durationOption, setDurationOption] = useState("");

  const priceFilterMap = {
    'Economy: Cheapest to Priciest': (a, b) => a.economyPrice - b.economyPrice,
    'Economy: Priciest to Cheapest': (a, b) => b.economyPrice - a.economyPrice,
    'Business: Cheapest to Priciest': (a, b) => a.businessPrice - b.businessPrice,
    'Business: Priciest to Cheapest': (a, b) => b.businessPrice - a.businessPrice,
    'First class: Cheapest to Priciest': (a, b) => a.firstClassPrice - b.firstClassPrice,
    'First class: Priciest to Cheapest': (a, b) => b.firstClassPrice - a.firstClassPrice,
  };

  const durationFilterMap = {
    'Shortest to Longest': (a, b) => {
      const durationA = (new Date(a.arrivalTime) - new Date(a.departureTime)) / 60000;
      const durationB = (new Date(b.arrivalTime) - new Date(b.departureTime)) / 60000;
      return durationA - durationB;
    },
    'Longest to Shortest': (a, b) => {
      const durationA = (new Date(a.arrivalTime) - new Date(a.departureTime)) / 60000;
      const durationB = (new Date(b.arrivalTime) - new Date(b.departureTime)) / 60000;
      return durationB - durationA;
    },
  };

  // Funkcija koja kombinuje sve filtere i sortiranje
  const applyFilters = () => {
    let filtered = [...flights];

    // Takeoff filter
    if (takeoffBegin || takeoffEnd) {
      filtered = filtered.filter(flight => {
        const takeoffTime = new Date(flight.departureTime);
        const flightMinutes = takeoffTime.getHours() * 60 + takeoffTime.getMinutes();
        const beginMinutes = takeoffBegin ? takeoffBegin.getHours() * 60 + takeoffBegin.getMinutes() : 0;
        const endMinutes = takeoffEnd ? takeoffEnd.getHours() * 60 + takeoffEnd.getMinutes() : 1440;
        return flightMinutes >= beginMinutes && flightMinutes <= endMinutes;
      });
    }

    // Landing filter
    if (landingBegin || landingEnd) {
      filtered = filtered.filter(flight => {
        const landingTime = new Date(flight.arrivalTime);
        const flightMinutes = landingTime.getHours() * 60 + landingTime.getMinutes();
        const beginMinutes = landingBegin ? landingBegin.getHours() * 60 + landingBegin.getMinutes() : 0;
        const endMinutes = landingEnd ? landingEnd.getHours() * 60 + landingEnd.getMinutes() : 1440;
        return flightMinutes >= beginMinutes && flightMinutes <= endMinutes;
      });
    }

    // Price filter
    if (priceOption) {
      filtered.sort(priceFilterMap[priceOption]);
    }

    // Duration filter
    if (durationOption) {
      filtered.sort(durationFilterMap[durationOption]);
    }

    setData(filtered);
  };

  // Filters reset button
  const resetFilters = () => {
    setTakeoffBegin(null);
    setTakeoffEnd(null);
    setLandingBegin(null);
    setLandingEnd(null);
    setPriceOption("");
    setDurationOption("");
    setData(flights);
  };

  useEffect(() => {
    applyFilters();
  }, [takeoffBegin, takeoffEnd, landingBegin, landingEnd, priceOption, durationOption, flights]);

  const handlePriceOptionChange = (e) => {
    setPriceOption(e.target.value);
  };
  const handleDurationOptionChange = (e) => {
    setDurationOption(e.target.value);
  };

  /*********************************
   *     Fetch Flights logic       *
   *********************************/
  const [showFlights, setShowFlights] = useState(false);

  const getFlights = () => {
    fetch(`${apiURL}/FlightSearch/search?from=${originAirport}&to=${destinationAirport}&date=${departDate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('HTTP greška: ' + res.status);
        return res.json();
      })
      .then(json => {
        resetFilters();
        setFlights(json);
        setData(json);
        setShowFlights(true);
      })
      .catch(error => {
        console.log(error);
      });
  };

  /********************************
   *          THE PAGE            *
   ********************************/
  return (
    <>
      {/********************************
       *          Search Bar          *
       ********************************/}
      <div className="FlightSearchDiv">
        <input
          type="text"
          placeholder="From where?"
          onChange={handleOriginChange}
          value={originAirport}
        />
        <input
          type="text"
          placeholder="To where?"
          onChange={handleDestinationChange}
          value={destinationAirport}
        />
        <DatePicker
          selected={departDate ? new Date(departDate) : null}
          onChange={handleDepartChange}
          dateFormat="dd/MM/yyyy"
          placeholderText="Select departure date"
          minDate={today}
          className="fs-input"
          wrapperClassName="fs-wrapper"
          onChangeRaw={(e) => e.preventDefault()}
        />
        <button
          className="Btn"
          onClick={getFlights}
          disabled={!originAirport || !destinationAirport}
        >
          Search
        </button>
      </div>

      {/********************************
       *          Filters Bar         *
       ********************************/}
      {showFlights && flights.length > 0 &&
        <div className="FlightFiltersDiv">
          <div className="TimeFilters">
            <DatePicker
              selected={takeoffBegin}
              onChange={(date) => setTakeoffBegin(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={10}
              timeCaption="Time"
              dateFormat="HH:mm"
              timeFormat="HH:mm"
              placeholderText="Takeoff start (e.g. 00:00)"
            />
            <DatePicker
              selected={takeoffEnd}
              onChange={(date) => setTakeoffEnd(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={10}
              timeCaption="Time"
              dateFormat="HH:mm"
              timeFormat="HH:mm"
              placeholderText="Takeoff end (e.g. 23:59)"
            />
            <DatePicker
              selected={landingBegin}
              onChange={(date) => setLandingBegin(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={10}
              timeCaption="Time"
              dateFormat="HH:mm"
              timeFormat="HH:mm"
              placeholderText="Landing start (e.g. 00:00)"
            />
            <DatePicker
              selected={landingEnd}
              onChange={(date) => setLandingEnd(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={10}
              timeCaption="Time"
              dateFormat="HH:mm"
              timeFormat="HH:mm"
              placeholderText="Landing end (e.g. 23:59)"
            />
          </div>

          <div className="SortFilters">
            <select
              id="FlightPriceDropdown"
              value={priceOption}
              onChange={handlePriceOptionChange}
            >
              <option value="" disabled hidden>Select Price Order</option>
              <option value="Economy: Cheapest to Priciest">Economy: Cheapest to Priciest</option>
              <option value="Economy: Priciest to Cheapest">Economy: Priciest to Cheapest</option>
              <option value="Business: Cheapest to Priciest">Business: Cheapest to Priciest</option>
              <option value="Business: Priciest to Cheapest">Business: Priciest to Cheapest</option>
              <option value="First class: Cheapest to Priciest">First class: Cheapest to Priciest</option>
              <option value="First class: Priciest to Cheapest">First class: Priciest to Cheapest</option>
            </select>

            <select
              id="FlightDurationDropdown"
              value={durationOption}
              onChange={handleDurationOptionChange}
            >
              <option value="" disabled hidden>Select Flight Duration Order</option>
              <option value="Shortest to Longest">Shortest to Longest</option>
              <option value="Longest to Shortest">Longest to Shortest</option>
            </select>
          </div>

          <button className="ResetBtn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      }

      {/********************************
       *          Flights Bar         *
       ********************************/}
      <div className="FlightTicketsDiv">
        {showFlights && flights.length > 0 ? (
          data.map((flight, index) => (
            <div className="FlightCard" key={index}>
              <div className="FlightRoute">
                <span className="Code">{flight.departureDestination.cityCode}</span>
                <span className="Arrow">→</span>
                <span className="Code">{flight.arrivalDestination.cityCode}</span>
              </div>

              <div className="FlightInfo">
                <div>
                  <p className="SmallLabel">Flight</p>
                  <p>{flight.flightNumber}</p>
                </div>
                <div>
                  <p className="SmallLabel">Departure</p>
                  <p>
                    {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="SmallLabel">Arrival</p>
                  <p>
                    {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="SmallLabel">Seats</p>
                  <p>{flight.availableSeats} left</p>
                </div>
              </div>

              <div className="FlightPrices">
                <p className={`Price ${priceOption.includes("Economy") ? "highlighted" : "normal"}`}>
                  Economy: €{flight.economyPrice}
                </p>
                <p className={`Price ${priceOption.includes("Business") ? "highlighted" : "normal"}`}>
                  Business: €{flight.businessPrice}
                </p>
                <p className={`Price ${priceOption.includes("First class") ? "highlighted" : "normal"}`}>
                  First Class: €{flight.firstClassPrice}
                </p>
                <button className="BookBtn">Book Now</button>
              </div>
            </div>
          ))
        ) : (
          showFlights && <p>No flights found.</p>
        )}
      </div>
    </>
  );
}
