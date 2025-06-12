// This file needs to be updated to add the onYearChange and onMonthChange props to the CardYearMonthDropdown component

import React from "react";
import "./card.css";
import { useState } from "react";

// Main Card wrapper
export function Card({ className, children, ...props }) {
  return (
    <div
      className={`card ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Optional: Header section of the card
export function CardHeader({ className, children }) {
  return (
    <div className={`card-header ${className || ''}`}>
      {children}
    </div>
  );
}

// Optional: Title for CardHeader
export function CardTitle({ className, children }) {
  return (
    <h3 className={`card-title ${className || ''}`}>
      {children}
    </h3>
  );
}

// Optional: Card body/content
export function CardContent({ className, children }) {
  return (
    <div className={`card-content ${className || ''}`}>
      {children}
    </div>
  );
}

// Optional: Footer (e.g., buttons)
export function CardFooter({ className, children }) {
  return (
    <div className={`card-footer ${className || ''}`}>
      {children}
    </div>
  );
}

// Optional: Button inside the card
export function CardButton({ className, children, ...props }) {
  return (
    <button
      className={`card-button ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function CardMonthDropdown({ months, renderContent, className, onMonthChange, initialMonth }) {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(newMonth);
    }
  };

  return (
    <div className={`card-dropdown ${className || ''}`}>
      <div style={{ marginBottom: "12px" }}>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="card-dropdown-select"
          aria-label="Select Month"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>
      <div className="card-dropdown-content">
        {renderContent(selectedMonth)}
      </div>
    </div>
  );
}

export function CardYearMonthDropdown({ years, months, renderContent, className, onYearChange, onMonthChange, initialYear, initialMonth }) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  const handleYearChangeYearMonth = (e) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);
    if (onYearChange) {
      onYearChange(newYear);
    }
  };

  const handleMonthChangeYearMonth = (e) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(newMonth);
    }
  };

  return (
    <div className={`card-dropdown ${className || ''}`}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
        <select
          value={selectedYear}
          onChange={handleYearChangeYearMonth}
          className="card-dropdown-select"
          aria-label="Select Year"
        >
          {years.map((year) => (
            <option key={year.value} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={handleMonthChangeYearMonth}
          className="card-dropdown-select"
          aria-label="Select Month"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card-dropdown-content">
        {renderContent(selectedYear, selectedMonth)}
      </div>
    </div>
  );
}

// Optional: Card variants can be exported as well for easier usage
export const CardVariants = {
  PRIMARY: "card-primary",
  SECONDARY: "card-secondary",
  SUCCESS: "card-success",
  DANGER: "card-danger",
  WARNING: "card-warning"
};