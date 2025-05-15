import React from "react";
import "./Card.css";
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

export function CardYearMonthDropdown({ years, months, renderContent, className }) {
  const [selectedYear, setSelectedYear] = useState(years[0].value);
  const [selectedMonth, setSelectedMonth] = useState(months[0].value);

  return (
    <div className={`card-dropdown ${className || ''}`}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
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
          onChange={e => setSelectedMonth(e.target.value)}
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

// Usage example:
// <Card className={CardVariants.PRIMARY}>...</Card>