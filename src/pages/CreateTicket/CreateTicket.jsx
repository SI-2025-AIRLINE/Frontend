import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './CreateTicket.css';
import { LanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const apiURL = import.meta.env.VITE_API_BASE_URL;

// Mapiranje imena kategorija na ID-jeve (prilagodi prema backendu)
const categoryMap = {
  Reservation: 1,
  Baggage: 2,
  Refund: 3,
  Scheduling: 4,
  "Customer Service": 5,
  "Technical Issue": 6,
  Other: 7,
};

const CreateTicket = () => {
  const [ticketData, setTicketData] = useState({
    name: '',
    category: '',
    description: ''
  });

  const { language, setLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicketData({
      ...ticketData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validacija - provjeri da je korisnik prijavljen i da su potrebna polja popunjena
    const customerId = localStorage.getItem('userId');
    if (!customerId) {
      alert(t("You must be logged in to create a ticket."));
      return;
    }
    if (!ticketData.category || !ticketData.description || !ticketData.name) {
      alert(t("Please fill all required fields."));
      return;
    }

    // Pripremi payload za POST
    const payload = {
      category: categoryMap[ticketData.category] || 0, // ID kategorije
      subject: ticketData.name,
      customerId: parseInt(customerId, 10),
      initialMessage: ticketData.description,
    };

    try {
      const response = await fetch(`${apiURL}/Ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      // Opcionalno: možeš dobiti vraćeni ticket, ali ovdje samo ideš na dashboard
      alert(t("Ticket created successfully!"));
      navigate('/tickets-dashboard');
    } catch (error) {
      console.error(error);
      alert(t("Error creating ticket. Please try again later."));
    }
  };

  const handleReturn = () => {
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
