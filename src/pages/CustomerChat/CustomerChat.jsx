import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react'; 
import * as signalR from '@microsoft/signalr';
import './CustomerChat.css'; 

const ChatWindow = ({
  initialMessages = [], 
  customerUsername: propCustomerUsername = 'User', 
  customerFullName: propCustomerFullName = 'User Name' 
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const connectionRef = useRef(null);
  const [chatId, setChatId] = useState(null); 
  const [isConnected, setIsConnected] = useState(false); 
  const messagesEndRef = useRef(null); 
  const [ticketId, setTicketId] = useState(null); 

  const [userDetails, setUserDetails] = useState({
    id: null,
    role: null,
    username: propCustomerUsername,
    fullName: propCustomerFullName
  });
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(true); 

  useEffect(() => {
    console.log("[ChatWindow Effect] Pokušavam učitati korisnika i ticketId iz localStorage...");
    const storedUserIdString = localStorage.getItem('userId');
    const storedUserRole = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('userName');
    const storedFirstName = localStorage.getItem('name');
    const storedLastName = localStorage.getItem('surname');
    const storedTicketId = localStorage.getItem('ticketId');

    let loadedId = null;
    let loadedRole = null;
    let loadedUsername = propCustomerUsername; 
    let loadedFullName = propCustomerFullName; 

    if (storedUserIdString && storedUserRole) {
      const parsedUserId = parseInt(storedUserIdString, 10);
      if (!isNaN(parsedUserId)) {
        loadedId = parsedUserId;
        loadedRole = storedUserRole;
        loadedUsername = storedUsername || `Korisnik${parsedUserId}`;
        const fName = storedFirstName || '';
        const lName = storedLastName || '';
        loadedFullName = `${fName} ${lName}`.trim() || `Korisnik ${parsedUserId}`;
      } else {
        console.error("[ChatWindow Effect] userId iz localStorage nije validan broj:", storedUserIdString);
      }
    }

    const parsedTicketId = parseInt(storedTicketId, 10);
    if (!isNaN(parsedTicketId)) {
      setTicketId(parsedTicketId);
    } else {
      console.warn("[ChatWindow Effect] ticketId nije pronađen ili nije broj.");
    }

    setUserDetails({
      id: loadedId,
      role: loadedRole,
      username: loadedUsername,
      fullName: loadedFullName
    });
    setIsLoadingUserDetails(false);
  }, [propCustomerUsername, propCustomerFullName]);

  const backendUrl = import.meta.env.VITE_API_BASE_URL; 
  const hubPath = '/supportchathub';

  const isMyMessage = useCallback((messageSenderType, messageIsAdminReply) => {
    if (!userDetails.id || !userDetails.role) return false;

    const currentUserIsAdminOrEmployee =
      userDetails.role.toLowerCase() === 'admin' ||
      userDetails.role.toLowerCase() === 'employee';

    return currentUserIsAdminOrEmployee ? messageIsAdminReply : !messageIsAdminReply;
  }, [userDetails]);

  useEffect(() => {
    if (isLoadingUserDetails || !userDetails.id || !userDetails.role || !backendUrl || !ticketId) return;

    const currentConnectionUrl = `${backendUrl}${hubPath}?userId=${encodeURIComponent(userDetails.id)}&userRole=${encodeURIComponent(userDetails.role)}`;
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(currentConnectionUrl)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = newConnection;

    const onChatJoinedConfirmation = (confirmedChatId) => setChatId(confirmedChatId);

    const onReceiveMessage = (receivedMessage) => {
      if (chatId === null || receivedMessage.chatId === chatId || typeof receivedMessage.chatId === 'undefined') {
        setMessages(prev => [
          ...prev,
          {
            id: receivedMessage.chatContentId || `msg-${Date.now()}`,
            text: receivedMessage.message,
            sender: receivedMessage.isAdminReply ? 'admin' : 'customer',
            senderName: receivedMessage.senderName,
            timestamp: new Date(receivedMessage.timestamp),
            isMine: isMyMessage(receivedMessage.senderType, receivedMessage.isAdminReply),
          },
        ]);
      }
    };

    const onReceiveHistoricalMessages = (historical) => {
      if (historical?.length) {
        const formatted = historical.map(msg => ({
          id: msg.chatContentId,
          text: msg.message,
          sender: msg.senderType?.toLowerCase().includes('admin') ? 'admin' : 'customer',
          senderName: msg.senderName,
          timestamp: new Date(msg.timestamp),
          isMine: isMyMessage(msg.senderType, msg.senderType?.toLowerCase().includes('admin')),
        }));
        setMessages(formatted);
      } else {
        setMessages([]);
      }
    };

    newConnection.start()
      .then(() => {
        setIsConnected(true);
        newConnection.on('ChatJoinedConfirmation', onChatJoinedConfirmation);
        newConnection.on('ReceiveMessage', onReceiveMessage);
        newConnection.on('ReceiveHistoricalMessages', onReceiveHistoricalMessages);
        newConnection.invoke('JoinChat', ticketId).catch(console.error);
      })
      .catch(err => {
        console.error("[SignalR] Connection error:", err);
        setIsConnected(false);
      });

    return () => {
      setIsConnected(false);
      if (connectionRef.current) {
        connectionRef.current.stop().catch(console.error);
        connectionRef.current = null;
      }
    };
  }, [userDetails, isLoadingUserDetails, ticketId, backendUrl, hubPath, isMyMessage, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected || !chatId || !userDetails.id || !userDetails.role) return;

    connectionRef.current.invoke('SendChatMessage', chatId, newMessage)
      .catch(err => console.error('[Chat SendMessage] Error:', err));

    setNewMessage('');
  }, [newMessage, chatId, userDetails]);

  const formatTime = (date) => {
    if (!(date instanceof Date)) return 'Invalid Date';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoadingUserDetails) {
    return <div className="chat-container"><p className="text-center p-4">Učitavanje podataka o korisniku...</p></div>;
  }

  if (!userDetails.id || !userDetails.role) {
    return <div className="chat-container"><p className="text-center p-4 text-red-500">Greška: Podaci o korisniku nisu dostupni.</p></div>;
  }

  if (!ticketId) {
    return <div className="chat-container"><p className="text-center p-4 text-red-500">Greška: Ticket ID nije pronađen u localStorage.</p></div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-username">Ticket #{ticketId} (Chat ID: {chatId || 'N/A'})</div>
          <div className="chat-fullname">Korisnik: {userDetails.fullName} (@{userDetails.username})</div>
          <div className="chat-status" style={{ color: isConnected ? 'green' : 'red' }}>
            {isConnected ? `Povezan kao ${userDetails.role}` : 'Nije povezan'}
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map(message => (
          <div
            key={message.id}
            className={`message message-${message.sender} ${message.isMine ? 'message-mine' : 'message-theirs'} ${message.sender === 'system' ? 'message-system' : ''}`}
          >
            <div className="message-bubble">
              {!message.isMine && message.senderName && message.sender !== 'system' && (
                <div className="message-sender-name">{message.senderName}</div>
              )}
              {message.text}
            </div>
            <div className="message-time">{formatTime(message.timestamp)}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Napišite poruku..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={!isConnected || !chatId}
        />
        <button onClick={handleSendMessage} disabled={!isConnected || !chatId}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
