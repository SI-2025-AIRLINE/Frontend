import React, { useContext } from 'react';
import './Feedback.css';
import { LanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

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
  ...rest
}) => {
  const { language } = useContext(LanguageContext);
  const { t } = useTranslation();

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={t(placeholder)}
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
          <option value="" disabled>{t(placeholder)}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
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
          placeholder={t(placeholder)}
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
        {t(label)}
        {required && <span className="required-indicator">*</span>}
      </label>
      {renderInput()}
      {error && <p className="feedback-error">{t(error)}</p>}
    </div>
  );
};

export default FeedbackField;
