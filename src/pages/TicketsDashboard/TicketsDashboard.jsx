import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useContext } from 'react';
import { Search, Tag, Clock } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import './TicketsDashboard.css';
import { LanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const apiURL = import.meta.env.VITE_API_BASE_URL;

const TICKET_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
  REOPENED: 'Reopened',
};

const TICKET_CATEGORIES = [
  'Technical',
  'Billing',
  'General',
  'Feature Request',
  'Other',
];

function TicketsDashboard() {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const { language } = useContext(LanguageContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');

  useEffect(() => {
  if (!userId) return;

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${apiURL}/Customer/${userId}/mytickets`);
      if (!response.ok) throw new Error('Failed to fetch tickets');

      const data = await response.json();

      const mappedTickets = data.map(ticket => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        userName: '', // Nema `customer` objekta u odgovoru, pa ovo ostaje prazno ili koristi trenutno prijavljenog korisnika ako želiš
        category: ticket.category || 'Other',
        subject: ticket.subject || '',
        description: ticket.description || ticket.subject || '',
        status: ticket.status || TICKET_STATUS.OPEN,
        priority: 'Medium', // Nema `priority` u odgovoru, default je 'Medium'
        createdAt: new Date(ticket.dateCreated),
        lastUpdated: new Date(ticket.dateCreated), // Nema `lastUpdated`, koristi `dateCreated`
        hasChat: ticket.hasChat,
        chatId: ticket.chatId
      }));

      setTickets(mappedTickets);
    } catch (error) {
      console.error(error);
    }
  };

  fetchTickets();
}, [userId]);


  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const filteredTickets = tickets.filter(ticket => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      ticket.userName.toLowerCase().includes(search) ||
      ticket.ticketNumber.toLowerCase().includes(search) ||
      ticket.subject.toLowerCase().includes(search);

    const matchesCategory = selectedCategory === '' || ticket.category === selectedCategory;
    const matchesStatus = selectedStatus === '' || ticket.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => b.lastUpdated - a.lastUpdated);

  const handleTicketClick = (ticket) => {
  setSelectedTicket(ticket);
  localStorage.setItem('ticketId', ticket.id);  // Dodano pamćenje u localStorage
};


  const handleCloseTicket = () => {
    setTickets(tickets.map(t =>
      t.id === selectedTicket.id
        ? { ...t, status: TICKET_STATUS.CLOSED, lastUpdated: new Date() }
        : t
    ));
    setSelectedTicket(null);
  };

  const handleMarkSuccess = () => {
    setTickets(tickets.map(t =>
      t.id === selectedTicket.id
        ? { ...t, status: TICKET_STATUS.RESOLVED, lastUpdated: new Date() }
        : t
    ));
    setSelectedTicket(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="support-container">
      {!selectedTicket ? (
        <div>
          <div className="filters-container">
            <div className="search-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder={t("Search tickets...")}
                className="search-input"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="filters">
              <select
                className="filter-select"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">{t("allCategories")}</option>
                {TICKET_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                className="filter-select"
                value={selectedStatus}
                onChange={handleStatusChange}
              >
                <option value="">{t("All Statuses")}</option>
                {Object.values(TICKET_STATUS).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button className="btn-create-ticket" onClick={() => navigate("/create-ticket")}>
                {t("Create Ticket")}
              </button>
            </div>
          </div>

          <div className="tickets-list">
            {filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                className="ticket-item"
                onClick={() => handleTicketClick(ticket)}
              >
                <div className="ticket-header">
                  <div className="ticket-main-info">
                    <span className="ticket-number">{ticket.ticketNumber}</span>
                    <span className="ticket-user">{ticket.userName}</span>
                    <span className={`priority-badge ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={clsx(
                      'status-badge',
                      {
                        'status-open': ticket.status === TICKET_STATUS.OPEN,
                        'status-in-progress': ticket.status === TICKET_STATUS.IN_PROGRESS,
                        'status-on-hold': ticket.status === TICKET_STATUS.ON_HOLD,
                        'status-resolved': ticket.status === TICKET_STATUS.RESOLVED,
                        'status-closed': ticket.status === TICKET_STATUS.CLOSED,
                        'status-cancelled': ticket.status === TICKET_STATUS.CANCELLED,
                        'status-reopened': ticket.status === TICKET_STATUS.REOPENED,
                      }
                    )}>
                      {ticket.status}
                    </span>
                  </div>
                  <span className="ticket-time">
                    {format(ticket.lastUpdated, 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <div className="ticket-category">
                  <Tag size={16} />
                  <span>{ticket.category}</span>
                </div>
                <h3 className="ticket-subject">{ticket.subject}</h3>
                <p className="ticket-preview">{ticket.description.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="td-ticket-detail-container">
          <div className="td-ticket-detail">
            <div className="td-detail-left">
              <div className="td-detail-header">
                <div className="td-detail-category">
                  <Tag size={16} />
                  <span>{selectedTicket.category}</span>
                </div>
                <div className={`priority-badge ${getPriorityColor(selectedTicket.priority)}`}>
                  {selectedTicket.priority}
                </div>
              </div>
              <h2 className="detail-subject">{selectedTicket.subject}</h2>
              <div className="detail-meta">
                <Clock size={16} />
                <span>Created {format(selectedTicket.createdAt, 'MMM d, yyyy HH:mm')}</span>
              </div>
              <div className="customer-message">
                <div className="customer-info">
                  <div className="customer-avatar">
                    {selectedTicket.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="customer-name">{selectedTicket.userName}</div>
                    <div className="customer-ticket">{selectedTicket.ticketNumber}</div>
                  </div>
                </div>
                <p className="message-content">{selectedTicket.description}</p>
              </div>
            </div>
            <div className="chat-section">
              {/* Ovdje možeš dodati chat komponentu ako postoji */}
            </div>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              onClick={() => navigate('/customer-chat')}
              className="btn-success"
            >
              {t("Open Chat")}
            </button>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSelectedTicket(null)}
              className="btn-success"
            >
              {t("Back to Tickets")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketsDashboard;
