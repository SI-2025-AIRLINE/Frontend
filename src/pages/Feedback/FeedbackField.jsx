import React from 'react';
import './Feedback.css';

const FeedbackField = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  required = false, 
  placeholder = '', 
  error = '',
  maxLength,
  options = [],
  ...rest // ⬅️ Dodaj ovo
}) => {
  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`feedback-input feedback-textarea ${error ? 'feedback-input-error' : ''}`}
          maxLength={maxLength}
          {...rest} 
        />
      );
    } else if (type === 'select') {
      return (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`feedback-input feedback-select ${error ? 'feedback-input-error' : ''}`}
          {...rest} 
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    } else {
      return (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`feedback-input ${error ? 'feedback-input-error' : ''}`}
          maxLength={maxLength}
          {...rest} 
        />
      );
    }
  };

  return (
    <div className="feedback-field">
      <label className="feedback-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      {renderInput()}
      {error && <p className="feedback-error">{error}</p>}
    </div>
  );
};

export default FeedbackField;
