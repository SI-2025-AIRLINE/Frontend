import React, {useContext } from 'react';
import { ArrowLeft } from 'lucide-react';
import FeedbackForm from './FeedbackForm';
import './Feedback.css';
import { LanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const Feedback = () => {
  const handleSubmit = (formData) => {
    console.log('Feedback submitted:', formData);
    // In a real application, you would send this data to your backend
    // and handle the navigation after successful submission
    
    // For now, we'll just log it and simulate navigation after 1 second
    setTimeout(() => {
      // Navigate to home page
      window.location.href = '/';
    }, 1000);
  };

  const { language } = useContext(LanguageContext);
  const { t } = useTranslation();

  /*const handleBackClick = () => {
    // Navigate back to home page
    window.location.href = '/';
  };*/

  return (
    <div className="feedback-container">
      <div className="feedback-content">
        
        <div className="feedback-header">
          <h1>{t("We Value Your Feedback")}</h1>
          <p>{t("Please take a moment to share your thoughts with us.")}</p>
        </div>
        
        <div className="feedback-card">
          <FeedbackForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default Feedback;