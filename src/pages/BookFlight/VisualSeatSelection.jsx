import './VisualSeatSelection.css';
import { useState, useContext} from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

export default function VisualSeatSelection(props) {
  const { language, setLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();

  const rawSeatsData = JSON.parse(sessionStorage.getItem('seats') || '[]');
  const classPriority = { 'First Class': 0, 'Business': 1, 'Economy': 2 };

  const seatsData = rawSeatsData.sort(
    (a, b) => classPriority[a.seatClass] - classPriority[b.seatClass]
  );

  const classMap = {
    ECONOMY: 2,
    BUSINESS: 1,
    FIRSTCLASS: 0
  };

  let classtyper = props.passengers[props.currentPassenger].class;
  if (classtyper === 'ALL'){
    classtyper = 'BUSINESS';
  }
  const classType = classtyper;
  const classIndex = classMap[classType];

  if (classIndex === undefined || classIndex >= seatsData.length) {
    return <p style={{ color: 'red' }}>{`${t("noSeatMapAvailableForClass", {value: classType})}`}</p>;
  }

  const { rowCount, seatsPerRow } = seatsData[classIndex];

  const startingRow = seatsData
    .slice(0, classIndex)
    .reduce((sum, cls) => sum + cls.rowCount, 0) + 1;

  const takenSeats = [
    ...(props.bookedSeats || []),
    ...props.passengers
      .map((p, i) => (i !== props.currentPassenger ? p.seat : ''))
      .filter(seat => !!seat)
  ];
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedSeat, setSelectedSeat] = useState(
    props.passengers[props.currentPassenger].seat || ''
  );

  const handleSeatSelection = seatLabel => {
    if (takenSeats.includes(seatLabel)) {
      alert(`${t("seatAlreadyTaken")}.`);
      return;
    }
    setSelectedSeat(seatLabel);

    const updatedPassengers = [...props.passengers];
    updatedPassengers[props.currentPassenger].seat = seatLabel;
    props.onSave(updatedPassengers);

    if (props.onSeatSelect) props.onSeatSelect(seatLabel);
  };

  const renderSeatButton = seatLabel => {
    const isBooked = props.bookedSeats?.includes(seatLabel); // putnici iz baze
    const isTakenByOthers = props.passengers
      .map((p, i) => (i !== props.currentPassenger ? p.seat : ''))
      .includes(seatLabel); // putnici u sesiji
    const isSelected = seatLabel === selectedSeat;
  
    let seatClass = 'seat';
    if (isBooked) seatClass += ' booked';
    else if (isTakenByOthers) seatClass += ' taken';
    else if (isSelected) seatClass += ' selected';
    else seatClass += ' available';

    //vidjet da ovime nisam nesto zajebo
    return (
      <button
        key={seatLabel}
        className={seatClass}
        onClick={() => handleSeatSelection(seatLabel)}
        disabled={isBooked || isTakenByOthers}
        title={
          isBooked
            ? `${t("alreadyBooked")}`
            : isTakenByOthers
            ? `${t("takenByOthers")}`
            : isSelected
            ? `${t("yourSelectedSeat")}`
            : `${t("available")}`
        }
      >
        {seatLabel}
      </button>
    );
  };


  return (
    <>
    <div className="visual-seat-selection">
          <div id="Header">
        <h1 id="HeaderTitle">{`${t("chooseYourSeat")}:`}</h1>
        { selectedSeat && (
          <p style={{ color: '#333', textAlign: 'center' }}>
           {`${t("selectedSeat")}:`} <strong>{selectedSeat}</strong>
          </p>
        )}
      </div>
      <div id="Seats">
        <div className="seat-grid">
          <div className="seat-side">
            {[...Array(rowCount)].map((_, rowIndex) => (
              <div className="seat-row" key={`left-${rowIndex}`}>
                {[...Array(seatsPerRow / 2)].map((_, colIndex) => {
                  const seatLabel = `${startingRow + rowIndex}${String.fromCharCode(65 + colIndex)}`;
                  return renderSeatButton(seatLabel);
                })}
              </div>
            ))}
          </div>

          <div className="seat-gap" />

          <div className="seat-side">
            {[...Array(rowCount)].map((_, rowIndex) => (
              <div className="seat-row" key={`right-${rowIndex}`}>
                {[...Array(seatsPerRow / 2)].map((_, colIndex) => {
                  const seatLabel = `${startingRow + rowIndex}${String.fromCharCode(
                    65 + colIndex + seatsPerRow / 2
                  )}`;
                  return renderSeatButton(seatLabel);
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
