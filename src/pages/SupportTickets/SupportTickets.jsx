import React, { useState } from 'react';
import { Search, Tag, Clock, MessageCircle, X, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import './SupportTickets.css';

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
    id: '1',
    ticketNumber: 'TKT-2024-001',
    userName: 'John Smith',
    category: 'Reservation',
    subject: 'Unable to book flight BA123',
    description: 'I’m experiencing a problem while trying to complete my purchase on your website. When I reach the checkout page and enter my payment details, the system processes the payment but then returns an error message saying, “Payment could not be completed at this time. Please try again later.” Despite this, my bank statement shows that the amount has been deducted twice.I have already checked my internet connection and tried using different browsers and devices, but the issue persists. This is quite urgent because I need to confirm my order for an upcoming event, and I am worried about being charged twice without receiving the order confirmation.',
    status: TICKET_STATUS.OPEN,
    priority: 'High',
    createdAt: new Date('2024-03-10T10:30:00'),
    lastUpdated: new Date('2024-03-10T10:30:00')
  },
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

function SupportTickets() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

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

  const handleCloseTicket = (withReply = false) => {
    if (withReply && !replyText.trim()) {
      alert('Please enter a reply before closing the ticket.');
      return;
    }

    setTickets(tickets.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, status: TICKET_STATUS.CLOSED, lastUpdated: new Date() }
        : t
    ));
    setSelectedTicket(null);
    setReplyText('');
  };

  const handleMarkSuccess = () => {
    setTickets(tickets.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, status: TICKET_STATUS.RESOLVED, lastUpdated: new Date() }
        : t
    ));
    setSelectedTicket(null);
    setReplyText('');
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
                placeholder="Search tickets..."
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
                <option value="">All Categories</option>
                {TICKET_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                className="filter-select"
                value={selectedStatus}
                onChange={handleStatusChange}
              >
                <option value="">All Statuses</option>
                {Object.values(TICKET_STATUS).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
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
        <div className="ticket-detail">
          <div className="detail-left">
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

          <div className="detail-right">
            <div className="reply-section">
              <h3>Reply to Customer</h3>
              <textarea
                className="reply-textarea"
                placeholder="Type your response here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
            <div className="action-buttons">
              <button
                className="btn-close"
                onClick={() => handleCloseTicket(false)}
              >
                <X size={18} />
                Close
              </button>
              <button
                className="btn-close-send"
                onClick={() => handleCloseTicket(true)}
              >
                <Send size={18} />
                Close and Send
              </button>
              <button
                className="btn-success"
                onClick={handleMarkSuccess}
              >
                <CheckCircle2 size={18} />
                Success
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportTickets;