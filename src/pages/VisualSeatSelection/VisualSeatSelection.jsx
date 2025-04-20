import './VisualSeatSelection.css';
import { useState } from 'react';

export default function VisualSeatSelection(props){
    const seatsData = JSON.parse(sessionStorage.getItem('seats'));
    const classMap = {
        'ECONOMY': 0,
        'BUSINESS': 1,
        'FIRST_CLASS': 2
    };

    const classType = props.passengers[props.currentPassenger].class;
    const rowCount = seatsData[classMap[classType]].rowCount;
    const seatsPerRow = seatsData[classMap[classType]].seatsPerRow;

    const takenSeats = props.passengers.map(p => p.seat).filter(seat => seat !== '');
    const [selectedSeat, setSelectedSeat] = useState(props.passengers[props.currentPassenger].seat);

    const handleSeatSelection = (seatLabel) => {
        if (takenSeats.includes(seatLabel)) {
            alert("This seat is already taken. Please select another.");
            return;
        }

        setSelectedSeat(seatLabel);
        const updatedPassengers = [...props.passengers];
        updatedPassengers[props.currentPassenger].seat = seatLabel;
        props.onSave(updatedPassengers);
    };

    const renderSeatButton = (seatLabel) => {
        const isTaken = takenSeats.includes(seatLabel);
        const isSelected = seatLabel === selectedSeat;
        return (
            <button
                className="seat"
                key={seatLabel}
                onClick={() => handleSeatSelection(seatLabel)}
                disabled={isTaken}
                style={{
                    backgroundColor: isTaken ? '#555' : isSelected ? '#00a1e4' : undefined,
                    color: isSelected ? 'white' : undefined,
                    cursor: isTaken ? 'not-allowed' : 'pointer'
                }}
            >
                {seatLabel}
            </button>
        );
    };

    return(
        <>
            <div id="Header">
                <h1 id="HeaderTitle">Choose your seat:</h1>
                {selectedSeat && (
                    <p style={{ color: 'white', textAlign: 'center' }}>Selected Seat: <strong>{selectedSeat}</strong></p>
                )}
            </div>
            <div id="Seats">
                <div className="seat-grid">
                    <div className="seat-side">
                        {[...Array(rowCount)].map((_, rowIndex) => (
                            <div className="seat-row" key={`left-${rowIndex}`}>
                                {[...Array(seatsPerRow / 2)].map((_, colIndex) => {
                                    const seatLabel = `${rowIndex + 1}${String.fromCharCode(65 + colIndex)}`;
                                    return renderSeatButton(seatLabel);
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="seat-gap"></div>

                    <div className="seat-side">
                        {[...Array(rowCount)].map((_, rowIndex) => (
                            <div className="seat-row" key={`right-${rowIndex}`}>
                                {[...Array(seatsPerRow / 2)].map((_, colIndex) => {
                                    const seatLabel = `${rowIndex + 1}${String.fromCharCode(65 + colIndex + seatsPerRow / 2)}`;
                                    return renderSeatButton(seatLabel);
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
