/*import React, { useState } from 'react';
import { Search, Tag, Clock, MessageCircle, X, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import './SupportTickets.css';

const TICKET_CATEGORIES = [
  'General',
  'Billing',
  'Tehnical',
  'Baggage',
  'FlightIssue',
  'Refund',
  'Other'
];

const TICKET_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
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
    createdAt: new Date('2024-03-10T10:30:00')
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-002',
    userName: 'Sarah Johnson',
    category: 'Baggage',
    subject: 'Lost luggage on flight AF456',
    description: 'My luggage didn\'t arrive at the destination. I\'ve been waiting at the baggage claim for over an hour.',
    status: TICKET_STATUS.IN_PROGRESS,
    createdAt: new Date('2024-03-09T15:45:00')
  },
  {
    id: '3',
    ticketNumber: 'TKT-2024-003',
    userName: 'Michael Brown',
    category: 'Refund',
    subject: 'Refund for cancelled flight',
    description: 'My flight was cancelled due to weather conditions and I would like to request a refund.',
    status: TICKET_STATUS.RESOLVED,
    createdAt: new Date('2024-03-08T09:15:00')
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
  }).sort((a, b) => b.createdAt - a.createdAt);

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
        ? { ...t, status: TICKET_STATUS.CLOSED }
        : t
    ));
    setSelectedTicket(null);
    setReplyText('');
  };

  const handleMarkSuccess = () => {
    setTickets(tickets.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, status: TICKET_STATUS.RESOLVED }
        : t
    ));
    setSelectedTicket(null);
    setReplyText('');
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
                    <span className={clsx(
                      'status-badge',
                      {
                        'status-open': ticket.status === TICKET_STATUS.OPEN,
                        'status-in-progress': ticket.status === TICKET_STATUS.IN_PROGRESS,
                        'status-resolved': ticket.status === TICKET_STATUS.RESOLVED,
                        'status-closed': ticket.status === TICKET_STATUS.CLOSED,
                        'status-reopened': ticket.status === TICKET_STATUS.REOPENED
                      }
                    )}>
                      {ticket.status}
                    </span>
                  </div>
                  <span className="ticket-time">
                    {format(ticket.createdAt, 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <div className="ticket-category">
                  <Tag size={16} />
                  <span>{ticket.category}</span>
                </div>
                <h3 className="ticket-subject">{ticket.subject}</h3>
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

export default SupportTickets;*/
import React, { useState, useEffect } from 'react';
import { Search, Tag, Clock, MessageCircle, X, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import './SupportTickets.css'; 

const apiURL = import.meta.env.VITE_API_BASE_URL;

const TICKET_CATEGORIES = [
  'General',
  'Billing',
  'Technical', // Corrected typo 'Tehnical' -> 'Technical'
  'Baggage',
  'FlightIssue',
  'Refund',
  'Other'
];

const TICKET_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened'
};

const STATUS_MAPPING = {
    [TICKET_STATUS.OPEN]: 0,
    [TICKET_STATUS.IN_PROGRESS]: 1,
    [TICKET_STATUS.RESOLVED]: 2,
    [TICKET_STATUS.CLOSED]: 3,
    [TICKET_STATUS.REOPENED]: 4,
};

function SupportTickets() {
  const [tickets, setTickets] = useState([]); // Start with empty array, fetch data
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null); // Store the FULL ticket details including contents
  const [replyText, setReplyText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [isLoading, setIsLoading] = useState(true); // Loading state for initial fetch
  const [isPosting, setIsPosting] = useState(false); // Loading state for replies/status updates
  const [error, setError] = useState(null); // Error state

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Fetch 10 tickets per page initially 
  // --- API Call Functions ---

  // Fetch list of tickets
  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${apiURL}/Ticket?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      const response = await fetch(url);

      if (!response.ok) {
        // Handle HTTP errors
        const errorText = await response.text(); // Get more details if possible
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      // The API returns an array directly: [ { ... }, { ... } ]
      // Assuming the data structure matches the API example for the list view
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch details for a single ticket
  const fetchTicketDetails = async (ticketId) => {
     setIsLoading(true); // Use main loading state, or add a separate one for details
     setError(null);
    try {
      const url = `${apiURL}/Ticket/${ticketId}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      setSelectedTicket(data); // Set the detailed ticket object
      
    } catch (err) {
      console.error("Failed to fetch ticket details:", err);
      setError("Failed to load ticket details. Please try again.");
      setSelectedTicket(null); // Clear selected ticket on error
    } finally {
       setIsLoading(false);
    }
  };

  // Post a reply and potentially update status
  const postTicketReply = async (ticketId, status, text = '') => {
      setIsPosting(true);
      setError(null);
    try {
      const url = `${apiURL}/Ticket/${ticketId}/reply`;

      // Find the integer status value based on the frontend status string
      const statusInt = STATUS_MAPPING[status];
      if (statusInt === undefined) {
          throw new Error(`Unknown status: ${status}`);
      }
      const requestBody = {
          userId: 1, // <<< REPLACE WITH ACTUAL ADMIN USER ID
          isAdmin: true,
          ticketStatus: statusInt,
          text: text, // Send the reply text (can be empty if only changing status)
      };

       const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const updatedTicket = await response.json(); // API returns the updated ticket

      // Update the list of tickets with the potentially changed status of this ticket
      setTickets(prevTickets => prevTickets.map(t =>
          t.id === updatedTicket.id ? updatedTicket : t // Replace the old ticket with the updated one
      ));

      // Clear selected ticket and reply text to return to list view as per original logic
      setSelectedTicket(null);
      setReplyText('');

       // Optionally, show a success message
      alert(`Ticket ${updatedTicket.ticketNumber} status updated to ${updatedTicket.lastStatus}${text ? ' and reply sent.' : '.'}`);

    } catch (err) {
      console.error("Failed to post ticket reply:", err);
      setError(`Failed to update ticket status or send reply: ${err.message}`);
       alert(`Error: Failed to update ticket status or send reply: ${err.message}`); // Show alert for immediate feedback
    } finally {
      setIsPosting(false);
    }
  };


  useEffect(() => {
    fetchTickets();
  }, [pageNumber, pageSize]); 

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
      (ticket.customer?.firstName + ' ' + ticket.customer?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || // Use API customer name
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === '' || ticket.category === selectedCategory;
    const matchesStatus = selectedStatus === '' || ticket.lastStatus === selectedStatus; // Use API lastStatus

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)); // Use API dateCreated and parse as Date

  const handleTicketClick = (ticket) => {
      fetchTicketDetails(ticket.id);
  };


  const handleCloseTicket = (withReply = false) => {
      if (withReply && !replyText.trim()) {
          alert('Please enter a reply before closing and sending.');
          return;
      }

      // Implement the confirmation for 'Close' only
      if (!withReply) {
          const confirmClose = window.confirm('Are you sure you want to close this ticket?');
          if (!confirmClose) {
              return; // User cancelled
          }
      }

      // Call API to post reply/update status
      // If withReply is true, send the reply text. Otherwise, text will be empty string.
      postTicketReply(selectedTicket.id, TICKET_STATUS.CLOSED, withReply ? replyText : '');
  };

  const handleMarkSuccess = () => {
      postTicketReply(selectedTicket.id, TICKET_STATUS.RESOLVED, replyText); 
  };


  if (isLoading && !selectedTicket) {
      return <div className="loading">Loading tickets...</div>;
  }

   if (error && !selectedTicket) {
      return <div className="error">Error: {error}</div>;
  }

  // Display loading indicator while posting reply/status update
   if (isPosting) {
       return <div className="loading">Updating ticket...</div>;
   }


  return (
    <div className="support-container">
      {!selectedTicket ? (
        // --- Tickets List View ---
        <div>
           {/* ... (filters container code - no changes needed here) ... */}
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

          {/* ... (tickets list code) ... */}
           <div className="tickets-list">
             {filteredTickets.length > 0 ? (
                filteredTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className="ticket-item"
                    onClick={() => handleTicketClick(ticket)} // Use the updated handler
                  >
                    <div className="ticket-header">
                      <div className="ticket-main-info">
                        <span className="ticket-number">{ticket.ticketNumber}</span>
                         {/* Display customer name from API data */}
                        <span className="ticket-user">{`${ticket.customer?.firstName || ''} ${ticket.customer?.lastName || ''}`}</span>
                         {/* Use API lastStatus for the badge */}
                        <span className={clsx(
                          'status-badge',
                          {
                            'status-open': ticket.lastStatus === TICKET_STATUS.OPEN,
                            'status-in-progress': ticket.lastStatus === TICKET_STATUS.IN_PROGRESS,
                            'status-resolved': ticket.lastStatus === TICKET_STATUS.RESOLVED,
                            'status-closed': ticket.lastStatus === TICKET_STATUS.CLOSED,
                            'status-reopened': ticket.lastStatus === TICKET_STATUS.REOPENED
                          }
                        )}>
                           {ticket.lastStatus} {/* Use API lastStatus */}
                        </span>
                      </div>
                       {/* Use API dateCreated for time */}
                      <span className="ticket-time">
                        {ticket.dateCreated ? format(new Date(ticket.dateCreated), 'MMM d, yyyy HH:mm') : 'N/A'}
                      </span>
                    </div>
                    <div className="ticket-category">
                      <Tag size={16} />
                      <span>{ticket.category}</span>
                    </div>
                    <h3 className="ticket-subject">{ticket.subject}</h3>
                  </div>
                ))
             ) : (
                 isLoading ? null : <div className="no-tickets">No tickets found.</div> // Show message if no tickets after loading
             )}
           </div>
             {/* Add pagination controls here if needed, e.g., buttons for next/prev page */}
        </div>
      ) : (
        // --- Ticket Detail View ---
          <>
           {isLoading && <div className="loading-overlay">Loading details...</div>} {/* Optional: overlay loading for detail fetch */}
            {error && <div className="error-message">Error loading details: {error}</div>} {/* Optional: display error in detail view */}

           {/* Back button to return to list */}
            <button className="back-button" onClick={() => {
                setSelectedTicket(null); // Go back to list view
                 setReplyText(''); // Clear reply text
            }}>
                ← Back to Tickets
            </button>
            <div className="ticket-detail">
          <div className="detail-left">
            <div className="detail-header">
              <div className="detail-category">
                <Tag size={16} />
                <span>{selectedTicket.category}</span>
              </div>
                {/* Display current status in detail view */}
                 <span className={clsx(
                          'status-badge', // Reuse status badge styling
                          {
                            'status-open': selectedTicket.lastStatus === TICKET_STATUS.OPEN,
                            'status-in-progress': selectedTicket.lastStatus === TICKET_STATUS.IN_PROGRESS,
                            'status-resolved': selectedTicket.lastStatus === TICKET_STATUS.RESOLVED,
                            'status-closed': selectedTicket.lastStatus === TICKET_STATUS.CLOSED,
                            'status-reopened': selectedTicket.lastStatus === TICKET_STATUS.REOPENED
                          }
                        )}>
                           {selectedTicket.lastStatus}
                        </span>
            </div>
            <h2 className="detail-subject">{selectedTicket.subject}</h2>
            <div className="detail-meta">
              <Clock size={16} />
              <span>Created {selectedTicket.dateCreated ? format(new Date(selectedTicket.dateCreated), 'MMM d, yyyy HH:mm') : 'N/A'}</span> {/* Use API dateCreated */}
            </div>

              <div className="customer-message">
               <div className="customer-info">
                 <div className="customer-avatar">
                   {selectedTicket.customer?.firstName.charAt(0) || '?'}
                 </div>
                 <div>
                   <div className="customer-name">{`${selectedTicket.customer?.firstName || ''} ${selectedTicket.customer?.lastName || ''}`}</div>
                   <div className="customer-ticket">{selectedTicket.ticketNumber}</div>
                 </div>
               </div>
                <div className="message-contents">
                 {/* The first item might be the original message, the rest are replies */}
                 {selectedTicket.contents && selectedTicket.contents.length > 0 ? (
                     selectedTicket.contents
                        .sort((a, b) => new Date(a.postedAt) - new Date(b.postedAt))
                        .slice(0, 1)
                        .map((content, index) => (
                         <div key={content.id || index} className="message-item"> 
                             <p className="message-content">{content.text}</p>
                             {/* Optionally display content status if relevant: {content.status} */}
                         </div>
                     ))
                 ) : (
                     <div className="no-messages">No conversation history available.</div>
                 )}
             </div>
             </div> 

          </div>

          <div className="detail-right">
            {/*<div className="reply-section">
              <h3>Reply to Customer</h3>
              <textarea
                className="reply-textarea"
                placeholder="Type your response here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                 disabled={isPosting} // Disable textarea while posting
              />
            </div>*/}
            <div className="reply-section">
              <h3>Reply to Customer</h3>
               <textarea
                 className="reply-textarea"
                 placeholder="Type your response here..."
                 value={
                     selectedTicket.contents && selectedTicket.contents.length > 1
                     ? [...selectedTicket.contents]
                      .sort((a, b) => new Date(a.postedAt) - new Date(b.postedAt))[1].text
                     : replyText
                }
                 onChange={(e) => setReplyText(e.target.value)}
                 disabled={
                  isPosting ||
                  (selectedTicket.contents && selectedTicket.contents.length > 1)
                } // Disable if posting or if there's a second message
              />
            </div>

            <div className="action-buttons">
               {/* Disable buttons while posting */}
              <button
                className="btn-close"
                 onClick={() => handleCloseTicket(false)} // Pass false for no reply
                 disabled={isPosting }
              >
                <X size={18} />
                Close
              </button>
              <button
                className="btn-close-send"
                 onClick={() => handleCloseTicket(true)} // Pass true to send reply
                 disabled={isPosting || !replyText.trim()} // Disable if no reply text
              >
                <Send size={18} />
                Close and Send
              </button>
              <button
                className="btn-success"
                 onClick={handleMarkSuccess} // Call the success handler
                 disabled={isPosting}
              >
                <CheckCircle2 size={18} />
                Success
              </button>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

export default SupportTickets;