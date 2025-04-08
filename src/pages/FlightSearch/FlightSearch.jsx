import './FlightSearch.css';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function FlightSearch() {
    /********************************
     *     Search Bar Logic         *
     ********************************/
    const today = new Date();
    const [departDate, setDepartDate] = useState(null);
    const [returnDate, setReturnDate] = useState(null);

    const handleDepartChange = (date) => {
        setDepartDate(date);
        if (returnDate && (date > returnDate))
        setReturnDate(date);
    };

    const handleReturnChange = (date) => {
        setReturnDate(date);
    };

    /********************************
     *     Filter Bars Logic        *
     ********************************/
    const [showFilters, setShowFilters] = useState(false);

    const [takeoffTime, setTakeoffTime] = useState(null);
    const [landingTime, setLandingTime] = useState(null);
    const [priceOption, setPriceOption] = useState("");
    const [durationOption, setDurationOption] = useState("");

    // Handleri
    const handlePriceOptionChange = (e) => {
        setPriceOption(e.target.value);
    }
    const handleDurationOptionChange = (e) => {
        setDurationOption(e.target.value);
    }

     //Logovanje - pocetak - loguje se ispravno (izbrisati kasnije)
     useEffect(()=>{
        if(priceOption != "") console.log("Updated price option: ", priceOption);
    }, [priceOption]);

    useEffect(()=>{
        if(durationOption != "") console.log("Updated duration option: ", durationOption);
    }, [durationOption]);
    //Logovanje - kraj

    return (
    <>
        {/********************************
         *          Search Bar          *
         ********************************/}
        <div className="FlightSearchDiv">
        <input type="text" placeholder="From where?" />

        <button className="Btn">Swap</button>

        <input type="text" placeholder="To where?" />

        <DatePicker
                selected={departDate}
                onChange={handleDepartChange}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select departure date"
                minDate={today}
                className="fs-input"
                wrapperClassName="fs-wrapper"
                onChangeRaw={e => e.preventDefault()} // blokira bilo kakav raw unos
        />

        <DatePicker
            selected={returnDate}
            onChange={handleReturnChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select return date"
            minDate={departDate || today}
            className="fs-input"
            wrapperClassName="fs-wrapper"
            onChangeRaw={e => e.preventDefault()} // blokira bilo kakav raw unos
        />
        <button className="Btn" onClick={()=>{setShowFilters(true)}}>Search</button>
        </div>
        {/********************************
          *          Filters Bar         *
          ********************************/}
        {showFilters && <div className="FlightFiltersDiv">
            <DatePicker
                selected={takeoffTime}
                onChange={(date) => setTakeoffTime(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={10} //Promijeniti interval na koliko treba
                timeCaption="Time"
                dateFormat="HH:mm"
                timeFormat="HH:mm"
                placeholderText="Select takeoff time"
            />

            <DatePicker
                selected={landingTime}
                onChange={(date) => setLandingTime(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={10} //Promijeniti interval na koliko treba
                timeCaption="Time"
                dateFormat="HH:mm"
                timeFormat="HH:mm"
                placeholderText="Select landing time"
            />
            <select id="FlightPriceDropdown"
                    value={priceOption}
                    onChange = {handlePriceOptionChange}
                    placeholder = "Filter by price: "
            >
                <option value="" disabled hidden>Select Price Order</option>
                <option value="Cheapest to Priciest">Cheapest to Priciest</option>
                <option value="Priciest to Cheapest">Priciest to Cheapest</option>
            </select>
            <select id="FlightDurationDropdown"
                    value={durationOption}
                    onChange = {handleDurationOptionChange}
            >
                <option value="" disabled hidden>Select Flight Duration Order</option>
                <option value="Shortest to Longest">Shortest to Longest</option>
                <option value="Longest to Shortest">Longest to Shortest</option>
            </select>
        </div>}
    </>
  );
}
