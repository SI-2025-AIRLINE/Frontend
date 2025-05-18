import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import '../ChatManagement/ChatManagement.css';
import * as signalR from '@microsoft/signalr';

const ChatWindow = ({ ticketId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const messagesEndRef = useRef(null);
  const [connection, setConnection] = useState(null);

  const apiURL = import.meta.env.VITE_API_BASE_URL;
  const userId = localStorage.getItem('userId');
  const userRole = 'Customer'; // možeš dinamički mijenjati ako admin
  const customerUsername = localStorage.getItem('userName') || 'unknown_user';

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  const firstName = localStorage.getItem('name') || '';
  const lastName = localStorage.getItem('surname') || '';
  const customerFullName = `${capitalize(firstName)} ${capitalize(lastName)}`;


  // 📡 SignalR konekcija
  useEffect(() => {
    if (!userId || !ticketId) return;

   const newConnection = new signalR.HubConnectionBuilder()
  .withUrl(`${apiURL}/api/supportchathub?userId=${userId}&userRole=${userRole}`)
  .withAutomaticReconnect()
  .build();


    setConnection(newConnection);
  }, [userId, ticketId]);

  useEffect(() => {
    if (!connection) return;

    connection.start()
      .then(() => {
        console.log('Connected to SignalR Hub');
        return connection.invoke('JoinChat', ticketId);
      })
      .catch(err => console.error('Connection failed: ', err));

    connection.on('ReceiveMessage', (data) => {
      setMessages(prev => [...prev, {
        id: data.chatContentId,
        text: data.message,
        sender: data.isAdminReply ? 'admin' : 'customer',
        timestamp: data.timestamp
      }]);
    });

    return () => {
      connection.invoke('LeaveChat', ticketId);
      connection.stop();
    };
  }, [connection, ticketId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await connection.invoke('SendChatMessage', ticketId, newMessage);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🎫 Fetch subject od tiketa
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await fetch(`${apiURL}/Customer/${userId}/mytickets`);
        if (!response.ok) throw new Error('Failed to fetch tickets');

        const data = await response.json();
        const ticket = data.find(t => t.id === ticketId);
        if (ticket) setSubject(ticket.subject);
      } catch (error) {
        console.error('Error fetching subject:', error);
      }
    };

    fetchSubject();
  }, [userId, ticketId]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-username">@{customerUsername}</div>
          <div className="chat-fullname">{customerFullName}</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-chat">
            <p className="text-gray-500 text-center my-8">
              No messages yet. Start a conversation!
            </p>
            {subject && (
              <p className="text-blue-600 text-center mb-6">
                Chat for subject: <strong>{subject}</strong>
              </p>
            )}
          </div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`message message-${message.sender}`}
          >
            <div className="message-bubble">
              {message.text}
            </div>
            <div className="message-time">
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>
          <Send size={16} />
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
