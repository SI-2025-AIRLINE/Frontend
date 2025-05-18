import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import './ChatManagement.css';

const ChatWindow = ({ initialMessages = [],customerUsername = 'johndoe', customerFullName = 'John Doe' }) => { 
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'admin') {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev, 
          { 
            id: Date.now(), 
            text: 'Thanks for your help!', 
            sender: 'customer', 
            timestamp: new Date() 
          }
        ]);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'admin',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
        
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