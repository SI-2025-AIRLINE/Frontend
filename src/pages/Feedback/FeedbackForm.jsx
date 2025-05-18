import React, { useState } from 'react';
import FeedbackField from './FeedbackField';
import './Feedback.css';

const FeedbackForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
    rating: 0
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjectOptions = [
    { value: 'general', label: 'General Feedback' },
    { value: 'suggestion', label: 'Feature Suggestion' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'compliment', label: 'Compliment' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Please provide your feedback';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Feedback must be at least 10 characters';
    }
    
    if (formData.rating === 0) {
      newErrors.rating = 'Please provide a rating';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (onSubmit) {
          onSubmit(formData);
        }
        
        // In a real app, you'd redirect here after successful submission
        // For now, we'll just show an alert
        alert('Thank you for your feedback!');
        
        // Reset form
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
        alert('There was an error submitting your feedback. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <FeedbackField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          placeholder="John"
          error={errors.firstName}
        />
        
        <FeedbackField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          placeholder="Doe"
          error={errors.lastName}
        />
      </div>
      
      <FeedbackField
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="john.doe@example.com"
        error={errors.email}
      />
      
      <FeedbackField
        label="Subject"
        type="select"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        required
        placeholder="Select a subject"
        error={errors.subject}
        options={subjectOptions}
      />
      
      <FeedbackField
        label="How would you rate your experience?"
        type="rating"
        name="rating"
        value={formData.rating}
        onChange={handleChange}
        required
        error={errors.rating}
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