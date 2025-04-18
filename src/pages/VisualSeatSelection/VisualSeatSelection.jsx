import './VisualSeatSelection.css';
import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

export default function VisualSeatSelection(){
    const seatsData = JSON.parse(sessionStorage.getItem('seats'));
    const classType = JSON.parse(sessionStorage.getItem('class'));

    const classMap = {
        'Economy': 0,
        'Business': 1,
        'First Class': 2
      };

    const rowCount = seatsData[classMap[classType]].rowCount;
    const seatsPerRow =  seatsData[classMap[classType]].seatsPerRow;

    let seatsString = '';
    seatsString += classType[0];

    const handleSeatSelection = (seatLabel) => { //99% izbaciti i raditi sa websocketom
        seatsString += seatLabel;
    }

    return(
        <>
            <div id="Header">
            <h1 id="HeaderTitle">Choose your seats please:</h1> 
            </div>
            <div id="Seats">
                <div className="seat-grid">
                    <div className="seat-side">
                    {[...Array(rowCount)].map((_, rowIndex) => (
                        <div className="seat-row" key={`left-${rowIndex}`}>
                        {[...Array(seatsPerRow / 2)].map((_, colIndex) => {
                            const seatLabel = `${rowIndex + 1}${String.fromCharCode(97 + colIndex)}`;
                            return (
                            <button
                                className="seat"
                                key={`${seatLabel}`}
                                onClick={() => handleSeatSelection(seatLabel)} 
                            >
                                {seatLabel}
                            </button>
                            );
                        })}
                        </div>
                    ))}
                    </div>

                    <div className="seat-gap"></div>

                    <div className="seat-side">
                    {[...Array(rowCount)].map((_, rowIndex) => (
                        <div className="seat-row" key={`right-${rowIndex}`}>
                        {[...Array(seatsPerRow / 2)].map((_, colIndex) => {
                            const seatLabel = `${rowIndex + 1}${String.fromCharCode(97 + colIndex + seatsPerRow / 2)}`;
                            return (
                            <button
                                className="seat"
                                key={`${seatLabel}`}
                                onClick={() => handleSeatSelection(seatLabel)}
                            >
                                {seatLabel}
                            </button>
                            );
                        })}
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        </>
    );
}