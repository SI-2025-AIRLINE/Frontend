import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './CreateTicket.css';
import { LanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const CreateTicket = () => {
  // State for form fields
  const [ticketData, setTicketData] = useState({
    name: '',
    category: '',
    priority: '',
    description: ''
  });
   const { language, setLanguage } = useContext(LanguageContext);
    const { t } = useTranslation();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicketData({
      ...ticketData,
      [name]: value
    });
  };

  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to an API
    console.log('Ticket data submitted:', ticketData);
    // Placeholder for success message or redirect
    alert('Ticket created successfully!');
  };

  // Return to tickets page - this would be implemented based on your routing system
  const handleReturn = () => {
    // Navigation logic would go here, e.g., history.push('/tickets')
    navigate('/tickets-dashboard');
  };

  return (
    <div className="create-ticket-container">
      <div className="create-ticket-header">
        <button 
          onClick={handleReturn} 
          className="return-link"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'none', 
            border: 'none',
            color: '#555',
            fontSize: '14px',
            marginBottom: '16px',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          {t("backtotickets")}
        </button>
        <h1 className="create-ticket-title">{t("Create New Ticket")}</h1>
      </div>

      <form className="create-ticket-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="ticket-name">{t("Ticket Name")}</label>
          <input
            type="text"
            id="ticket-name"
            name="name"
            className="form-control"
            placeholder={t("Enter a descriptive name for the ticket")}
            value={ticketData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="ticket-category">{t("Category")}</label>
          <select
            id="ticket-category"
            name="category"
            className="form-control"
            value={ticketData.category}
            onChange={handleChange}
            required
          >
            <option value="" disabled>{t("Select a category")}</option>
            <option value="Reservation">Reservation</option>
            <option value="Baggage">Baggage</option>
            <option value="Refund">Refund</option>
            <option value="Scheduling">Scheduling</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Technical Issue">Technical Issue</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="ticket-priority">{t("Priority")}</label>
          <select
            id="ticket-priority"
            name="priority"
            className="form-control"
            value={ticketData.priority}
            onChange={handleChange}
            required
          >
            <option value="" disabled>{t("Select priority level")}</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="ticket-description">{t("Description")}</label>
          <textarea
            id="ticket-description"
            name="description"
            className="form-control text-area"
            placeholder={t("Please provide detailed information about the issue...")}
            value={ticketData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <button type="submit" className="submit-btn">
          {t("Create Ticket")}
        </button>
      </form>
    </div>
  );
};

export default CreateTicket;