import React, { useState } from 'react';
import FeedbackField from './FeedbackField';
import './Feedback.css';

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
const apiURL = import.meta.env.VITE_API_BASE_URL;
const FeedbackForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: capitalize(localStorage.getItem('name')),
    lastName: capitalize(localStorage.getItem('surname')),
    username: localStorage.getItem('userName') || '',
    subject: '',
    message: '',
    rating: 0
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const customerId = localStorage.getItem('userId');
    if (!customerId) {
      alert('User ID not found. Please log in again.');
      return;
    }

    const payload = {
      customerId: parseInt(customerId, 10),
      text: formData.message
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiURL}/Feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to send feedback');

      if (onSubmit) onSubmit(formData);

      alert('Thank you for your feedback!');

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: '',
        rating: 0
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('There was an error submitting your feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <FeedbackField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          readOnly
          placeholder=""
          error={errors.firstName}
        />

        <FeedbackField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          readOnly
          placeholder=""
          error={errors.lastName}
        />
      </div>

      <FeedbackField
        label="Username"
        type="text"
        name="username"
        value={formData.username}
        readOnly
        placeholder=""
        error={errors.username}
      />

      <FeedbackField
        label="Your Feedback"
        type="textarea"
        name="message"
        value={formData.message}
        onChange={handleChange}
        required
        placeholder="Please describe your feedback in detail..."
        error={errors.message}
        maxLength={500}
      />

      <div className="feedback-actions">
        <button 
          type="submit" 
          className="send-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Feedback'}
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;
