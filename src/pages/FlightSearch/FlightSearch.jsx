import './FlightSearch.css';
import { useState, useEffect, useContext } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const apiURL = import.meta.env.VITE_API_BASE_URL;

export default function FlightSearch() {
  const { language, setLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();

  const today = new Date();
  const navigate = useNavigate();
  /********************************
   *     Search Bar Logic         *
   ********************************/
 const [originAirport, setOriginAirport] = useState('');
const [destinationAirport, setDestinationAirport] = useState('');
  const [departDate, setDepartDate] = useState(null);
  const handleOriginChange = async (e) => {
    const input = e.target.value;
    setOriginAirport(input);

    if (input.length >= 2) {
      try {
        const response = await fetch(`${apiURL}/Destination/search?term=${input}`);
        const data = await response.json();
        const mapped = data.map(dest => ({
          label: `${dest.name}`,
          value: dest.cityCode
        }));
        setFilteredOrigins(mapped);
      } catch (error) {
        console.error('Greška prilikom dohvaćanja destinacija:', error);
      }
    } else {
      setFilteredOrigins([]);
    }
  };

const handleDestinationChange = async (e) => {
    const input = e.target.value;
    setDestinationAirport(input);

    if (input.length >= 2) {
      try {
        const response = await fetch(`${apiURL}/Destination/search?term=${input}`);
        const data = await response.json();
        const mapped = data.map(dest => ({
          label: `${dest.name}`,
          value: dest.cityCode
        }));
        setFilteredDestinations(mapped);
      } catch (error) {
        console.error('Greška prilikom dohvaćanja destinacija:', error);
      }
    } else {
      setFilteredDestinations([]);
    }
  };
  const handleDepartChange = (date) => {
    setDepartDate(date);
  };
  const [selectedClass, setSelectedClass] = useState("all");
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
  const [classOption] = useState("All");

  

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

  const applyFilters = () => {
    let filtered = [...flights];

    if (takeoffBegin || takeoffEnd) {
      filtered = filtered.filter(flight => {
        const takeoffTime = new Date(flight.departureTime);
        const flightMinutes = takeoffTime.getHours() * 60 + takeoffTime.getMinutes();
        const beginMinutes = takeoffBegin ? takeoffBegin.getHours() * 60 + takeoffBegin.getMinutes() : 0;
        const endMinutes = takeoffEnd ? takeoffEnd.getHours() * 60 + takeoffEnd.getMinutes() : 1440;
        return flightMinutes >= beginMinutes && flightMinutes <= endMinutes;
      });
    }

    if (landingBegin || landingEnd) {
      filtered = filtered.filter(flight => {
        const landingTime = new Date(flight.arrivalTime);
        const flightMinutes = landingTime.getHours() * 60 + landingTime.getMinutes();
        const beginMinutes = landingBegin ? landingBegin.getHours() * 60 + landingBegin.getMinutes() : 0;
        const endMinutes = landingEnd ? landingEnd.getHours() * 60 + landingEnd.getMinutes() : 1440;
        return flightMinutes >= beginMinutes && flightMinutes <= endMinutes;
      });
    }

    if (classOption !== "All") {
    filtered = filtered.filter(flight => {
      if (classOption === "Economy") return flight.economyPrice !== null;
      if (classOption === "Business") return flight.businessPrice !== null;
      if (classOption === "First") return flight.firstClassPrice !== null;
      return true;
    });
  }

    if (priceOption) {
      filtered.sort(priceFilterMap[priceOption]);
    }

    if (durationOption) {
      filtered.sort(durationFilterMap[durationOption]);
    }

    setData(filtered);
  };

  const resetFilters = () => {
    setTakeoffBegin(null);
    setTakeoffEnd(null);
    setLandingBegin(null);
    setLandingEnd(null);
    setPriceOption("");
    setDurationOption("");
    setData(flights);
  };
  const handleClassChange = (e) => {
    const selected = e.target.value;
    setSelectedClass(selected);
    localStorage.setItem('selectedClass', selected.toUpperCase()); 
    sessionStorage.setItem('class', selected); 
  };
  

  useEffect(() => {
  applyFilters();
}, [takeoffBegin, takeoffEnd, landingBegin, landingEnd, priceOption, durationOption, flights, classOption]);

  const handlePriceOptionChange = (e) => {
    setPriceOption(e.target.value);
  };
  const handleDurationOptionChange = (e) => {
    setDurationOption(e.target.value);
  };

  /*********************************
   *     Fetch Flights logic       *
   *********************************/

  
 
  const [filteredOrigins, setFilteredOrigins] = useState([]);
const [filteredDestinations, setFilteredDestinations] = useState([]);




  const [showFlights, setShowFlights] = useState(false);

  const getFlights = () => {
    const formattedDate = departDate?.toLocaleDateString('en-CA'); // yyyy-mm-dd
  
    // Mapiranje za API
    const seatClassParam = classOption === 'First' ? 'First Class' : classOption;
  
    // Mapiranje za lookup u fares
    const classKeyMap = {
      Economy: 'economyPrice',
      Business: 'businessPrice',
      'First': 'firstClassPrice',
    };
    const seatClassKey = classKeyMap[classOption];
  
    const url = new URL(`${apiURL}/FlightSearch/search`);
    url.searchParams.append('from', originAirport);
    url.searchParams.append('to', destinationAirport);
    url.searchParams.append('date', formattedDate);
    if (seatClassParam !== 'All') {
      url.searchParams.append('seatClass', seatClassParam);
    }
  
    fetch(url.toString(), {
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
  
      const flightData = Array.isArray(json) ? json[0] : null;
  
      if (!flightData || !flightData.fares) {
        console.log('Nema validnog flightData ili fares objekta.');
        return;
      }
  
      const fares = flightData.fares;
      let selectedPrice = 0;
  
      if (classOption === 'All') {
        
        selectedPrice = fares.economyPrice || fares.businessPrice || fares.firstClassPrice || 0;
  
        if (selectedPrice === 0) {
          console.log('Nema cene za All klasu.');
        }
      } else {
        selectedPrice = fares[seatClassKey];
      }
  
      
      if (selectedPrice !== 0) {
        
        localStorage.setItem('selectedPrice', selectedPrice);
        console.log(`Cijena za ${classOption} klasu je sačuvana u localStorage: ${selectedPrice}`);
      } else {
        console.log('Cijena nije sačuvana jer je 0 ili nepoznata klasa.');
      }
    })
    .catch(error => {
      console.log(error);
    });
  };

  




  /*********************************
   *       Fetch Seats data        *
   *********************************/
  const classMap = {
    0: 'Economy',
    1: 'Business',
    2: 'First Class'
  };

  const getSeatData = (aircraftId) => {
    fetch(`${apiURL}/SeatingConfig/aircraft/${aircraftId}/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('HTTP greška: ' + res.status);
      return res.json();
    })
    .then(json => {
      const cfgData = json.configurations.map(config => ({
        seatClass: classMap[config.seatClass],
        rowCount: config.rowCount,
        seatsPerRow: config.seatsPerRow
      }));
      sessionStorage.setItem('seats', JSON.stringify(cfgData));
    })
    .catch(error => {
      console.log(error);
    });
  };

  /********************************
   *          THE PAGE            *
   ********************************/
  if (sessionStorage.getItem("flight")) {
    sessionStorage.removeItem("flight");
  }
  if (sessionStorage.getItem("class")){
    sessionStorage.removeItem("class");
  }
  if(sessionStorage.getItem("seats")){
    sessionStorage.removeItem("seats");
  }
  
  return (
    <>
      {/********************************
        *          Search Bar          *
        ********************************/}
     <div className="FlightSearchDiv">
      {/* From where? */}
      <div className="input-wrapper" style={{ position: "relative", flex: 1 }}>
        <input
          type="text"
          placeholder={t("searchFrom")}
          onChange={handleOriginChange}
          value={originAirport}
        />
        {filteredOrigins.length > 0 && (
          <ul className="autocomplete-list" style={{ position: 'absolute', backgroundColor: 'white', zIndex: 10 }}>
            {filteredOrigins.map((d, i) => (
              <li
                key={i}
                onClick={() => {
                  setOriginAirport(d.label);
                  setFilteredOrigins([]);
                }}
                style={{ cursor: 'pointer', padding: '5px 10px' }}
              >
                {d.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* To where? */}
      <div className="input-wrapper" style={{ position: "relative", flex: 1 }}>
        <input
          type="text"
          placeholder={t("searchTo")}
          onChange={handleDestinationChange}
          value={destinationAirport}
        />
        {filteredDestinations.length > 0 && (
          <ul className="autocomplete-list" style={{ position: 'absolute', backgroundColor: 'white', zIndex: 10 }}>
            {filteredDestinations.map((d, i) => (
              <li
                key={i}
                onClick={() => {
                  setDestinationAirport(d.label);
                  setFilteredDestinations([]);
                }}
                style={{ cursor: 'pointer', padding: '5px 10px' }}
              >
                {d.label}
              </li>
            ))}
          </ul>
        )}
      </div>
  



        <DatePicker
          selected={departDate}
          onChange={handleDepartChange}
          dateFormat="dd/MM/yyyy"
          placeholderText={t("selectDepartureDate")}
          minDate={today}
          className="fs-input"
          wrapperClassName="fs-wrapper"
          onChangeRaw={(e) => e.preventDefault()}
        />
        <select
  id="FlightClassDropdown"
  value={selectedClass}  
  onChange={handleClassChange}  
  className="fs-input"
>
  <option value="all">{t("searchallClasses")}</option>
  <option value="economy">{t("economy")}</option>
  <option value="business">{t("business")}</option>
  <option value="firstClass">{t("firstClass")}</option>
</select>

        <button
          className="Btn"
          onClick={getFlights}
          disabled={!originAirport || !destinationAirport || !departDate}
        >
          {t("search")}
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
              placeholderText="EDT"
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
              placeholderText="LDT"
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
              placeholderText="EAT"
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
              placeholderText="LAT"
            />
          </div>

          <div className="SortFilters">
            <select
              id="FlightPriceDropdown"
              value={priceOption}
              onChange={handlePriceOptionChange}
            >
              <option value="" disabled hidden>{t("selectPriceOrder")}</option>
              <option value="Economy: Cheapest to Priciest">{`E: ${t("cheapestToPriciest")}`}</option>
              <option value="Economy: Priciest to Cheapest">{`E: ${t("priciestToCheapest")}`}</option>
              <option value="Business: Cheapest to Priciest">{`B: ${t("cheapestToPriciest")}`}</option>
              <option value="Business: Priciest to Cheapest">{`B: ${t("priciestToCheapest")}`}</option>
              <option value="First class: Cheapest to Priciest">{`F: ${t("cheapestToPriciest")}`}</option>
              <option value="First class: Priciest to Cheapest">{`F: ${t("priciestToCheapest")}`}</option>
            </select>

            <select
              id="FlightDurationDropdown"
              value={durationOption}
              onChange={handleDurationOptionChange}
            >
              <option value="" disabled hidden>{t("flightDurationOrder")}</option>
              <option value="Shortest to Longest">{t("shortestToLongest")}</option>
              <option value="Longest to Shortest">{t("longestToShortest")}</option>
            </select>

            <button className="ResetBtn" onClick={resetFilters}>
            {t("resetFilters")}
            </button>
          </div>

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
                  <p className="SmallLabel">{t("flight")}</p>
                  <p>{flight.flightNumber}</p>
                </div>
                <div>
                  <p className="SmallLabel">{t("departure")}</p>
                  <p>
                    {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12:false })}
                  </p>
                </div>
                <div>
                  <p className="SmallLabel">{t("arrival")}</p>
                  <p>
                    {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12:false })}
                  </p>
                </div>
                <div>
                  <p className="SmallLabel">{t("seats")}</p>
                  <p>{t("seatsLeft", {value: flight.availableSeats})}</p>
                </div>
              </div>

              <div className="FlightPrices">
  {flight.fares && (
    <>
      {(selectedClass === "all" || selectedClass === "economy") && (
        <p className={`Price ${priceOption.includes("Economy") ? "highlighted" : "normal"}`}>
          {t("economyPriceValue", {value: flight.fares.economyPrice !== null ? `€${flight.fares.economyPrice}` : `${t("notAvailable")}`})}
        </p>
      )}

      {(selectedClass === "all" || selectedClass === "business") && (
        <p className={`Price ${priceOption.includes("Business") ? "highlighted" : "normal"}`}>
          {t("businessPriceValue", {value: flight.fares.businessPrice !== null ? `€${flight.fares.businessPrice}` : `${t("notAvailable")}`})}
        </p>
      )}

      {(selectedClass === "all" || selectedClass === "firstClass") && (
        <p className={`Price ${priceOption.includes("First class") ? "highlighted" : "normal"}`}>
          {t("firstClassPriceValue", {value: flight.fares.firstClassPrice !== null ? `€${flight.fares.firstClassPrice}` : `${t("notAvailable")}`})}
        </p>
      )}

      {flight.fares.validFrom && flight.fares.validTo && (() => {
      const dateRange = `${new Date(flight.fares.validFrom).toLocaleDateString()} – ${new Date(flight.fares.validTo).toLocaleDateString()}`;
      return (
        <p className="valid-period">
        {t("faresValidValue", { value: dateRange })}
        </p>
      );
})()}

    </>
  )}




                <button className="BookBtn" onClick={
  () => {
    sessionStorage.setItem('flight', JSON.stringify(flight));
    
    // Map the class option to the format expected in BookFlight
    let classForBooking;
    if (classOption === "All") {
      classForBooking = "BUSINESS"; // Default if no specific class was selected
    } else if (classOption === "Economy") {
      classForBooking = "ECONOMY";
    } else if (classOption === "Business") {
      classForBooking = "BUSINESS";
    } else if (classOption === "First") {
      classForBooking = "FIRST_CLASS";
    }
    
    sessionStorage.setItem('class', classForBooking);
    sessionStorage.setItem('classLocked', classOption !== "All" ? "true" : "false");
    
    getSeatData(flight.aircraftId);
    navigate('/book-flight');
  }
}>{t("bookNow")}</button>
              </div>
            </div>
          ))
        ) : (
          showFlights && <p>{t("noFlightsFound")}</p>
        )}
      </div>
    </>
  );
}
