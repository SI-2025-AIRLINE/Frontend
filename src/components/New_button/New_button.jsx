import React from 'react';
import './New_button.css';

function New_button({ label, onClick, className }) {
  return (
    <button className={`new-button ${className}`} onClick={onClick}>
      {label}
    </button>
  );
}

export default New_button;
