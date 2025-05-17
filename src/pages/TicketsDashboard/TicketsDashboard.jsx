import { useNavigate } from 'react-router-dom';
import React, { useState, useContext } from 'react';
import { Search, Tag, Clock, MessageCircle, X, CheckCircle2, Send } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import './TicketsDashboard.css';
import { LanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const TICKET_CATEGORIES = [
  'Reservation',
  'Baggage',
  'Refund',
  'Account Issues',
  'Flight Change',
  'Payment Problem'
];

const TICKET_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
  REOPENED: 'Reopened'
};

const MOCK_TICKETS = [
  {
    id: '2',
    ticketNumber: 'TKT-2024-002',
    userName: 'Sarah Johnson',
    category: 'Baggage',
    subject: 'Lost luggage on flight AF456',
    description: 'My luggage didn\'t arrive at the destination. I\'ve been waiting at the baggage claim for over an hour.',
    status: TICKET_STATUS.IN_PROGRESS,
    priority: 'Medium',
    createdAt: new Date('2024-03-09T15:45:00'),
    lastUpdated: new Date('2024-03-09T16:20:00')
  },
  {
    id: '3',
    ticketNumber: 'TKT-2024-003',
    userName: 'Michael Brown',
    category: 'Refund',
    subject: 'Refund for cancelled flight',
    description: 'My flight was cancelled due to weather conditions and I would like to request a refund.',
    status: TICKET_STATUS.RESOLVED,
    priority: 'Low',
    createdAt: new Date('2024-03-08T09:15:00'),
    lastUpdated: new Date('2024-03-08T14:30:00')
  }
];

function TicketsDashboard() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const { language, setLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

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
    const matchesSearch = searchTerm === '' || 
      ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || ticket.category === selectedCategory;
    const matchesStatus = selectedStatus === '' || ticket.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => b.lastUpdated - a.lastUpdated);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
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
                        'status-reopened': ticket.status === TICKET_STATUS.REOPENED
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
        <div className="ticket-detail-container">
          <div className="ticket-detail">
            <div className="detail-left1">
              <div className="detail-header">
                <div className="detail-category">
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
            </div>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              onClick={() => navigate('/customer-chat')}
              className="btn-success"
            >
              Open Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketsDashboard;
