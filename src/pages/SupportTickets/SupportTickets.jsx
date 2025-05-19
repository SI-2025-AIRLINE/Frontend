import React, { useState, useEffect } from 'react';
import { Search, Tag, Clock, MessageCircle, X, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import './SupportTickets.css'; 

const apiURL = import.meta.env.VITE_API_BASE_URL;

//Ovo se koristi samo za filtriranje
const TICKET_CATEGORIES = [
    'General',
    'Billing',
    'Technical', 
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
function SupportTickets() {
  const [tickets, setTickets] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null); 
  const [replyText, setReplyText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [isLoading, setIsLoading] = useState(true); 
  const [isPosting, setIsPosting] = useState(false); 
  const [error, setError] = useState(null); 

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);  
  

  // GET: /api/Ticket
  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${apiURL}/Ticket?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text(); 
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
       setTickets(data);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

    // GET: api/Ticket/${ticketId}
  const fetchTicketDetails = async (ticketId) => {
     setIsLoading(true);
     setError(null);
    try {
      const url = `${apiURL}/Ticket/${ticketId}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
        setSelectedTicket(data); 
             
    } catch (err) {
      console.error("Failed to fetch ticket details:", err);
      setError("Failed to load ticket details. Please try again.");
      setSelectedTicket(null); 
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

   
      if (status === undefined) {
          throw new Error(`Unknown status: ${status}`);
      }
      const requestBody = {
          userId: 1, ///////////////////////////HARDKODIRANO/////////////////////////
          isAdmin: true,
          ticketStatus: status,
          text: text, 
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

      const updatedTicket = await response.json(); 
      setTickets(prevTickets => prevTickets.map(t =>
          t.id === updatedTicket.id ? updatedTicket : t 
      ));
      console.log("Updated ticket:", updatedTicket);

      console.log("Updated ticket: status", updatedTicket.lastStatus);

      setSelectedTicket(null);
      setReplyText('');

      //alert(`Ticket ${updatedTicket.ticketNumber} status updated to ${updatedTicket.contents[updatedTicket.contents.length - 1].status}${text ? ' and reply sent.' : '.'}`);
      //window.location.reload(); // Refresh the page to see updated tickets
    } catch (err) {
      console.error("Failed to post ticket reply:", err);
      setError(`Failed to update ticket status or send reply: ${err.message}`);
       alert(`Error: Failed to update ticket status or send reply: ${err.message}`); 
    } finally {
        if(isPosting!=true)
            setIsPosting(true);
     // setIsPosting(false);
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


  //Ovo provjeriti da li radi okej preko api ruta
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchTerm === '' ||
      (ticket.customer?.firstName + ' ' + ticket.customer?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === '' || ticket.category === selectedCategory;
    const matchesStatus = selectedStatus === '' || ticket.lastStatus === selectedStatus; 

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)); 

  const handleTicketClick = (ticket) => {
      fetchTicketDetails(ticket.id);
  };


  const handleCloseTicket = (withReply = false) => {
      
    if (withReply && !replyText.trim()) {
        alert('Please enter a reply before closing and sending.');
        return;
    }

    if (!withReply) {
        const confirmClose = window.confirm('Are you sure you want to close this ticket?');
        if (!confirmClose) {
            return; 
        }
    }

    setIsPosting(false);
    
    postTicketReply(selectedTicket.id, 3, replyText); //Na backendu CLOSED je 3
  };

  const handleMarkSuccess = () => {
    if (!replyText.trim()) {
        alert('Please enter a reply before marking as resolved.');
        return;
    }
    postTicketReply(selectedTicket.id, 2, replyText);  //Na backendu RESOLVED je 2
  };


  if (isLoading && !selectedTicket) {
      return <div className="loading">Loading tickets...</div>;
  }

   if (error && !selectedTicket) {
      return <div className="error">Error: {error}</div>;
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
                                )}>   {/*Ovo se koristi radi prikaza samo */}
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
            <button className="btn btn-primary" onClick={() => {
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
                                      <span>{selectedTicket.category}
                                          {console.log("Selektovani ticket: ", selectedTicket)}                                      </span>
              </div>
                {/* Display current status in detail view */}
                 <span className={clsx(
                          'status-badge', // Reuse status badge styling
                          {
                              'status-open': selectedTicket.contents[selectedTicket.contents.length - 1].status === TICKET_STATUS.OPEN,
                              'status-in-progress': selectedTicket.contents[selectedTicket.contents.length - 1].status === TICKET_STATUS.IN_PROGRESS,
                              'status-resolved': selectedTicket.contents[selectedTicket.contents.length - 1].status === TICKET_STATUS.RESOLVED,
                              'status-closed': selectedTicket.contents[selectedTicket.contents.length - 1].status === TICKET_STATUS.CLOSED,
                            'status-reopened': selectedTicket.contents[selectedTicket.contents.length - 1].status === TICKET_STATUS.REOPENED
                          }
                                  )}>
                      {selectedTicket.contents[selectedTicket.contents.length - 1].status}
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
                 disabled={selectedTicket.contents[selectedTicket.contents.length - 1].status !== 'Open' ? true : false}
              />
            </div>

            <div className="action-buttons">
               {/* Disable buttons while posting */}
              <button
                className="btn-close"
                 onClick={() => handleCloseTicket(false)} // Pass false for no reply
                 disabled={selectedTicket.contents[selectedTicket.contents.length - 1].status !== 'Open' ? true : false}
              >
                <X size={18} />
                Close
              </button>
              <button
                className="btn-close-send"
                 onClick={() => handleCloseTicket(true)} // Pass true to send reply
                 disabled={selectedTicket.contents[selectedTicket.contents.length - 1].status !== "Open" ? true : false}
              >
                <Send size={18} />
                Close and Send
              </button>
              <button
                className="btn-success-admin"
                 onClick={handleMarkSuccess} // Call the success handler
                 disabled={selectedTicket.contents[selectedTicket.contents.length - 1].status !== 'Open' ? true : false}
              >
                <CheckCircle2 size={18} />
                Resolve
              </button>
            </div>
          </div>
        </div>
        </>
          )}


            {/* Pagination 
                /////////////////////////NAPOMENA: Naslijedjeni css za sve iznad pa ovo ne prikazuje fino /////////////////////////
            
            <div className="pagination">
                <button
                    className="btn"
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                >
                    Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center' }}>Page {pageNumber}</span>
                <button
                    className="btn"
                    onClick={() => setPageNumber(prev => prev + 1)}
                    disabled={tickets.length < pageSize}
                >
                    Next
                </button>
            </div>

        */}


    </div>
  );
}

export default SupportTickets;