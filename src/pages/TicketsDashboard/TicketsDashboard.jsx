import { useNavigate } from 'react-router-dom';
import React, { useState, useContext, useEffect } from 'react';
import { Search, Tag, Clock, X, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import './TicketsDashboard.css';
import { LanguageContext } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const TICKET_CATEGORIES = [
  'General',
  'Billing',
  'Technical',
  'Baggage',
  'Flight Issue',
  'Refund',
  'Other'
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

function TicketsDashboard() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const { language } = useContext(LanguageContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      setError(null);

      const userId = localStorage.getItem('userId'); 

      if (!userId) {
        setError(t("User ID not found in local storage. Please log in again."));
        setIsLoading(false);
        setTickets([]); 
        return;
      }

      try {
        const urlString = `${apiBaseUrl}/Customer/${userId}/mytickets`;

        console.log("Fetching tickets from URL:", urlString); 

        const response = await fetch(urlString);

        if (!response.ok) {
          let errorData = { message: `${t('HTTP error! Status:')} ${response.status}` };
          try {
            if (response.headers.get('content-type')?.includes('application/json')) {
              const jsonError = await response.json();
              errorData.message = jsonError.message || jsonError.title || errorData.message;
            } else {
              const textError = await response.text();
              console.error("Server response (not ok, not JSON):", textError);
              errorData.message = `${t('Server returned an error:')} ${textError.substring(0, 200)}...`; 
            }
          } catch (e) {
            console.error("Could not parse error response body:", e);
          }
          throw new Error(errorData.message);
        }
        
        const data = await response.json(); 
        
        if (!Array.isArray(data)) {
          console.error(t("Expected data is not an array:"), data);
          throw new Error(t("Data format from server is incorrect."));
        }

        const formattedData = data.map(ticket => ({
          ...ticket,
          createdAt: ticket.createdAt ? new Date(ticket.createdAt) : new Date(),
          lastUpdated: ticket.lastUpdated ? new Date(ticket.lastUpdated) : new Date()
        }));
        setTickets(formattedData);
      } catch (e) {
        console.error(t("Error fetching tickets:"), e); 
        setError(e.message || t('An error occurred while fetching tickets.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [apiBaseUrl]); 

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
      (ticket.userName && ticket.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.ticketNumber && ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.subject && ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === '' || ticket.category === selectedCategory;
    const matchesStatus = selectedStatus === '' || ticket.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    const dateA = a.lastUpdated instanceof Date ? a.lastUpdated.getTime() : 0;
    const dateB = b.lastUpdated instanceof Date ? b.lastUpdated.getTime() : 0;
    return dateB - dateA;
  });

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setError(null); 
  };
  
  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    setIsLoading(true); 
    setError(null);
    const userId = localStorage.getItem('userId'); 

    if (!userId) {
      setError(t("User ID not found. Cannot update ticket."));
      setIsLoading(false);
      return;
    }
    if (!ticketId) {
        setIsLoading(false);
        return;
    }

    const urlString = `${apiBaseUrl}/Customer/${userId}/mytickets/${ticketId}`; 

    try {
      const response = await fetch(urlString, {
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        let errorData = { message: `${t('Error updating ticket status. Status:')} ${response.status}` };
         try {
            if (response.headers.get('content-type')?.includes('application/json')) {
              const jsonError = await response.json();
              errorData.message = jsonError.message || jsonError.title || errorData.message;
            } else {
              const textError = await response.text();
              console.error("Server response (update not ok, not JSON):", textError);
              errorData.message = `${t('Server returned an error during update:')} ${textError.substring(0, 100)}...`;
            }
          } catch (e) {
            console.error("Could not parse error response body during update:", e);
          }
        throw new Error(errorData.message);
      }

      const updatedTicketData = await response.json(); 
      
      setTickets(prevTickets => 
        prevTickets.map(t => 
          t.id === ticketId 
            ? { ...t, status: updatedTicketData.status || newStatus, lastUpdated: new Date(updatedTicketData.lastUpdated || Date.now()) }
            : t
        )
      );
      setSelectedTicket(prevSelected => 
        prevSelected && prevSelected.id === ticketId 
          ? { ...prevSelected, status: updatedTicketData.status || newStatus, lastUpdated: new Date(updatedTicketData.lastUpdated || Date.now()) } 
          : prevSelected
      );
      
    } catch (e) {
      console.error(t("Error updating ticket:"), e);
      setError(e.message || t('An error occurred while updating the ticket.'));
    } finally {
        setIsLoading(false);
    }
  };

  const handleCloseTicket = () => {
    if (selectedTicket) {
      handleUpdateTicketStatus(selectedTicket.id, TICKET_STATUS.CLOSED);
    }
  };

  const handleMarkSuccess = () => {
    if (selectedTicket) {
      handleUpdateTicketStatus(selectedTicket.id, TICKET_STATUS.RESOLVED);
    }
  };
  
  const handleOpenChat = () => {
    if (!selectedTicket) return;
    const userId = localStorage.getItem('userId'); 
    if (!userId) {
      setError(t("User ID not found. Cannot open chat."));
      return;
    }
    navigate(`/customer-chat/`);  //TRENUTNO OTVARA HARDKODIRANU STRANICU ZA TICKET 1 
  };

  const getPriorityColor = (priority) => {
    if (!priority) return 'text-gray-600 bg-gray-50';
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

  if (isLoading && tickets.length === 0 && !error) {
    return <div className="support-container" style={{ textAlign: 'center', padding: '20px' }}>{t("Loading tickets...")}</div>;
  }

  if (error && !selectedTicket && !isLoading) { 
    return <div className="support-container" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{t("Error")}: {error}</div>;
  }

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
                  <option key={category} value={category}>{t(category) || category}</option> 
                ))}
              </select>
              <select
                className="filter-select"
                value={selectedStatus}
                onChange={handleStatusChange}
              >
                <option value="">{t("All Statuses")}</option>
                {Object.values(TICKET_STATUS).map(status => (
                  <option key={status} value={status}>{t(status) || status}</option>
                ))}
              </select>
              <button className="btn-create-ticket" onClick={() => navigate("/create-ticket")}>
                {t("Create Ticket")}
              </button>
            </div>
          </div>
          
          {/* Prikaz greške ako se dogodila, a nema tiketa za prikaz */}
          {error && filteredTickets.length === 0 && !isLoading && (
             <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{t("Error")}: {error}</div>
          )}
          
          {/* Prikaz poruke o učitavanju ako se filtrira ili ponovno dohvaća */}
          {isLoading && (<div style={{ textAlign: 'center', padding: '20px' }}>{t("Loading...")}</div>)}

          <div className="tickets-list">
            {!isLoading && filteredTickets.length > 0 ? (
              filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="ticket-item"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <div className="ticket-header">
                    <div className="ticket-main-info">
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
                        {t(ticket.status) || ticket.status}
                      </span>
                    </div>
                    <span className="ticket-time">
                      {ticket.lastUpdated instanceof Date ? format(ticket.lastUpdated, 'MMM d, yyyy HH:mm') : t('N/A')}
                    </span>
                  </div>
                  <div className="ticket-category">
                    <Tag size={16} />
                    <span>{t(ticket.category) || ticket.category}</span>
                  </div>
                  <h3 className="ticket-subject">{ticket.subject}</h3>
                  <p className="ticket-preview">
                    {ticket.description ? ticket.description.substring(0, 100) : ''}...
                  </p>
                </div>
              ))
            ) : (
              !error && !isLoading && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  {t("No tickets match your filters or you have no tickets yet.")}
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="td-ticket-detail-container">
          {error && (
            <div style={{ textAlign: 'center', padding: '10px', color: 'red', backgroundColor: '#ffebee', border: '1px solid red', marginBottom: '10px' }}>
              {t("Error")}: {error} <button onClick={() => setError(null)} style={{marginLeft: '10px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight:'bold'}}>X</button>
            </div>
          )}
          {isLoading && (<div style={{ textAlign: 'center', padding: '10px' }}>{t("Updating ticket...")}</div>)}
          <div className="td-ticket-detail">
            <div className="td-detail-left">
              <div className="td-detail-header">
                <div className="td-detail-category">
                  <Tag size={16} />
                  <span>{t(selectedTicket.category) || selectedTicket.category}</span>
                </div>
                <div className={clsx(
                    'status-badge',
                    {
                      'status-open': selectedTicket.status === TICKET_STATUS.OPEN,
                      'status-in-progress': selectedTicket.status === TICKET_STATUS.IN_PROGRESS,
                      'status-on-hold': selectedTicket.status === TICKET_STATUS.ON_HOLD,
                      'status-resolved': selectedTicket.status === TICKET_STATUS.RESOLVED,
                      'status-closed': selectedTicket.status === TICKET_STATUS.CLOSED,
                      'status-cancelled': selectedTicket.status === TICKET_STATUS.CANCELLED,
                      'status-reopened': selectedTicket.status === TICKET_STATUS.REOPENED
                    },
                    'ml-auto'
                  )}>
                    {t(selectedTicket.status) || selectedTicket.status}
                  </div>
              </div>
              <h2 className="detail-subject">{selectedTicket.subject}</h2>
              <div className="detail-meta">
                <Clock size={16} />
                <span>Created {selectedTicket.createdAt instanceof Date ? format(selectedTicket.createdAt, 'MMM d, yyyy HH:mm') : t('N/A')}</span>
                <span style={{ marginLeft: '10px' }}>Last updated {selectedTicket.lastUpdated instanceof Date ? format(selectedTicket.lastUpdated, 'MMM d, yyyy HH:mm') : t('N/A')}</span>
              </div>
              <div className="customer-message">
                <p className="message-content">{selectedTicket.description}</p>
              </div>
            </div>
            <div className="chat-section">
            </div>
          </div>

          <div className="td-detail-actions" style={{ marginTop: '1rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button onClick={() => { setSelectedTicket(null); setError(null); }} className="btn-success" disabled={isLoading}>
              <X size={18} style={{ marginRight: '5px' }}/> {t("Back to List")}
            </button>
            <button
              onClick={handleOpenChat}
              className="btn-success"
              disabled={isLoading}
            >
              {t("Open Chat")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketsDashboard;