import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, LogOut } from 'lucide-react';
import './ChatAdminManagement.css';
import { mockChats as initialMockChats } from './mockData';

const ChatButton = ({ unreadCount, onClick }) => (
    <button className="chat-button" onClick={onClick}>
        <MessageCircle size={24} />
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
    </button>
);

const ChatItem = ({ chat, isActive, onClick }) => {
    const { id, user, lastMessage, unreadCount, timestamp } = chat;

    return (
        <div
            className={`chat-item ${isActive ? 'active' : ''} ${unreadCount > 0 ? 'unread' : ''}`}
            onClick={() => onClick(id)}
        >
            <div className="chat-item-content">
                <div className="chat-item-header">
                    <h4>{user.name}</h4>
                    <span className="chat-item-time">{timestamp}</span>
                </div>
                <p className="chat-item-message">{lastMessage}</p>
                {unreadCount > 0 && <span className="chat-item-badge">{unreadCount}</span>}
            </div>
        </div>
    );
};

const Message = ({ message, isAdmin }) => (
    <div className={`message ${isAdmin ? 'admin' : 'customer'}`}>
        <div className="message-content">
            <p>{message.text}</p>
            <span className="message-time">{message.timestamp}</span>
        </div>
    </div>
);

const ChatDetail = ({ chat, onClose, onSendMessage }) => {
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat.messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        onSendMessage(chat.id, messageInput);
        setMessageInput('');
    };

    if (!chat) return <div className="chat-detail-empty">Select a conversation to view</div>;

    return (
        <div className="chat-detail">
            <div className="chat-detail-header">
                <div className="chat-detail-user">
                    <h3>{chat.user.name}</h3>
                    <span className="user-info">{chat.user.info}</span>
                </div>
                <div className="chat-detail-actions">
                    <button className="close-chat-button" onClick={() => onClose(chat.id)}>
                        <LogOut size={20} />
                        <span>Close Chat</span>
                    </button>
                </div>
            </div>

            <div className="chat-messages">
                <div className="timestamp-divider">
                    <span>Today</span>
                </div>

                {chat.messages.map((message, index) => (
                    <Message
                        key={index}
                        message={message}
                        isAdmin={message.sender === 'admin'}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                />
                <button type="submit" className="send-button">
                    <Send size={24} />
                </button>
            </form>
        </div>
    );
};

const ChatWindow = ({ isOpen, chats, activeChat, setActiveChat, onClose, onCloseChat, onSendMessage }) => {
    if (!isOpen) return null;

    const handleSelectChat = (chatId) => {
        setActiveChat(chatId);
    };

    return (
        <div className="chat-window">
            <div className="chat-window-header">
                <h2>Customer Support</h2>
                <button className="close-window-button" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>
            <div className="chat-window-content">
                <div className="chat-sidebar">
                    <div className="chat-sidebar-header">
                        <h3>Conversations</h3>
                        <span className="chat-count">{chats.length} Active</span>
                    </div>
                    <div className="chat-list">
                        {chats.map(chat => (
                            <ChatItem
                                key={chat.id}
                                chat={chat}
                                isActive={activeChat === chat.id}
                                onClick={handleSelectChat}
                            />
                        ))}
                        {chats.length === 0 && (
                            <div className="empty-chat-list">
                                <p>No active conversations</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="chat-main">
                    {activeChat ? (
                        <ChatDetail
                            chat={chats.find(chat => chat.id === activeChat)}
                            onClose={onCloseChat}
                            onSendMessage={onSendMessage}
                        />
                    ) : (
                        <div className="chat-detail-empty">
                            <div className="empty-state">
                                <MessageCircle size={48} />
                                <p>Select a conversation to view</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ChatAdminManagement = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [chats, setChats] = useState(initialMockChats);
    const [activeChat, setActiveChat] = useState(null);

    useEffect(() => {
        if (activeChat !== null) {
            setChats(prevChats =>
                prevChats.map(chat => {
                    if (chat.id === activeChat && chat.unreadCount > 0) {
                        return { ...chat, unreadCount: 0 };
                    }
                    return chat;
                })
            );
        }
    }, [activeChat]);

    const totalUnread = chats.reduce((acc, chat) => acc + chat.unreadCount, 0);

    const autoRespondedChats = useRef(new Set());

    const handleToggleChat = () => setIsOpen(!isOpen);

    const handleCloseChat = (chatId) => {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (activeChat === chatId) setActiveChat(null);
    };

    const handleCloseWindow = () => {
        setIsOpen(false);
        setActiveChat(null);
    };

    const handleSendMessage = (chatId, text, isAuto = false) => {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setChats(prevChats =>
            prevChats.map(chat => {
                if (chat.id !== chatId) return chat;

                const newMessages = [
                    ...chat.messages,
                    {
                        sender: 'admin',
                        text,
                        timestamp,
                    },
                ];

                return {
                    ...chat,
                    lastMessage: text,
                    unreadCount: 0,
                    messages: newMessages,
                };
            })
        );

        if (!isAuto && !autoRespondedChats.current.has(chatId)) {
            autoRespondedChats.current.add(chatId);

            setTimeout(() => {
                const autoResponse = {
                    sender: 'customer',
                    text: 'Thank you for your message! We will get back to you shortly.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };

                setChats(currentChats =>
                    currentChats.map(c => {
                        if (c.id !== chatId) return c;
                        return {
                            ...c,
                            lastMessage: autoResponse.text,
                            messages: [...c.messages, autoResponse],
                        };
                    })
                );
            }, 1500);

            setTimeout(() => {
                autoRespondedChats.current.delete(chatId);
            }, 5000);
        }
    };

    return (
        <div className="chat-admin-container">
            <ChatWindow
                isOpen={isOpen}
                chats={chats}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
                onClose={handleCloseWindow}
                onCloseChat={handleCloseChat}
                onSendMessage={handleSendMessage}
            />
            <ChatButton unreadCount={totalUnread} onClick={handleToggleChat} />
        </div>
    );
};

export default ChatAdminManagement;
