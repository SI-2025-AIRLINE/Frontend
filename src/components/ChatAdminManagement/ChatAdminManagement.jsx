import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, LogOut } from 'lucide-react';
import './ChatAdminManagement.css';
import * as signalR from '@microsoft/signalr';


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
                    <h4>{chat.ticket?.customer.firstName}</h4>
                    <span className="chat-item-time">{new Date(chat.dateStarted).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="chat-item-message">{lastMessage}</p>
                {unreadCount > 0 && <span className="chat-item-badge">{unreadCount}</span>}
            </div>
        </div>
    );
};

const Message = ({ message, isAdmin, senderName }) => (
    <div className={`message ${isAdmin ? 'admin' : 'customer'}`}>
        <div className="message-content">
            <div className="message-header">
                <span className="sender-name">{senderName}</span>
                <span className="message-time">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p>{message.message}</p>
        </div>
    </div>
); 

const ChatDetail = ({ chat, onClose, onSendMessage, connection }) => {
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const joinChatAttempted = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Reset state when chat changes
    useEffect(() => {
        if (chat) {
            console.log("Chat changed to:", chat);
            setMessages([]);
            setIsLoading(true);
            joinChatAttempted.current = false;
        }
    }, [chat?.id]); // Only run when chat ID changes

    // Handle SignalR connection and message fetching
    useEffect(() => {
        if (!chat || !chat.ticket || !connection.current) return;
        
        console.log("Setting up chat connection for chat ID:", chat.id, "ticket ID:", chat.ticket.id);
        
        // Define event handlers
        const handleReceiveHistoricalMessages = (historicalMessages) => {
            console.log("Received historical messages:", historicalMessages);
            if (!Array.isArray(historicalMessages)) {
                console.error("Expected an array of messages but got:", historicalMessages);
                setIsLoading(false);
                return;
            }
            
            const formattedMessages = historicalMessages.map(msg => ({
                message: msg.message,
                isAdmin: msg.isAdminReply,
                timestamp: new Date(msg.timestamp).toISOString()
            }));
            
            console.log("Formatted messages:", formattedMessages);
            setMessages(formattedMessages);
            setIsLoading(false);
            scrollToBottom();
        };
        
        const handleNewMessage = (receivedMessage) => {
            console.log("Received new message:", receivedMessage);
            if (receivedMessage.chatId === chat.id) {
                const formattedMessage = {
                    message: receivedMessage.message,
                    isAdmin: receivedMessage.senderType === 'Admin',
                    timestamp: receivedMessage.timestamp
                };
                
                setMessages(prevMessages => [...prevMessages, formattedMessage]);
                scrollToBottom();
            }
        };
        
        // Clean up existing handlers to prevent duplicates
        connection.current.off("ReceiveHistoricalMessages");
        connection.current.off("ReceiveMessage");
        
        // Set up event handlers
        connection.current.on("ReceiveHistoricalMessages", handleReceiveHistoricalMessages);
        connection.current.on("ReceiveMessage", handleNewMessage);
        
        // Function to join chat and get history
        const joinChatAndGetHistory = () => {
            if (joinChatAttempted.current) return;
            
            joinChatAttempted.current = true;
            console.log("Joining chat with ticket ID:", chat.ticket.id);
            
            connection.current.invoke("JoinChat", chat.ticket.id)
                .then(() => {
                    console.log("Successfully joined chat");
                })
                .catch(err => {
                    console.error("Error joining chat:", err);
                    joinChatAttempted.current = false;
                    setIsLoading(false);
                });
        };
        
        // Join chat based on connection state
        if (connection.current.state === signalR.HubConnectionState.Connected) {
            joinChatAndGetHistory();
        }
        
        // Handle reconnection
        const reconnectedHandler = () => {
            console.log("Reconnected to SignalR hub");
            joinChatAttempted.current = false;
            joinChatAndGetHistory();
        };
        
        connection.current.onreconnected(reconnectedHandler);
        
        // Set a fallback timer in case the server doesn't respond
        const loadingTimeout = setTimeout(() => {
            if (isLoading) {
                console.log("Loading timeout - no response from server");
                setIsLoading(false);
            }
        }, 10000); // 10 seconds timeout
        
        return () => {
            // Clean up
            connection.current.off("ReceiveHistoricalMessages", handleReceiveHistoricalMessages);
            connection.current.off("ReceiveMessage", handleNewMessage);
            clearTimeout(loadingTimeout);
        };
    }, [chat, connection.current]);

    const handleSendMessageLocal = (e) => {
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
                    <h3>{chat.ticket?.customer.firstName || 'Customer'}</h3>
                    <span className="user-info">{chat.ticket?.customer.email || ''}</span>
                </div>
                <div className="chat-detail-actions">
                    <button className="close-chat-button" onClick={() => onClose(chat.id)}>
                        <LogOut size={20} />
                        <span>Close Chat</span>
                    </button>
                </div>
            </div>

            <div className="chat-messages">
                <div className="timestamp-divider"><span>Today</span></div>
                {isLoading ? (
                    <div className="empty-messages loading">
                        <p>Loading chat history...</p>
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((msg, index) => {
                        const isAdminMessage = msg.isAdmin;
                        let senderName = '';

                        if (isAdminMessage && chat.admin) {
                            senderName = chat.admin.username || 'Support';
                        } else if (!isAdminMessage && chat.ticket && chat.ticket.customer) {
                            senderName = chat.ticket.customer.firstName || 'Customer';
                        } else {
                            senderName = isAdminMessage ? 'Support' : 'Customer';
                        }

                        return (
                            <Message
                                key={index}
                                message={{ message: msg.message, timestamp: msg.timestamp }}
                                isAdmin={isAdminMessage}
                                senderName={senderName}
                            />
                        );
                    })
                ) : (
                    <div className="empty-messages">
                        <p>No messages in this conversation yet.</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSendMessageLocal}>
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

// Here's a simplified implementation of the ChatWindow component
// that correctly passes down the chat selection logic
const ChatWindow = ({ isOpen, chats, activeChat, setActiveChat, onClose, onCloseChat, onSendMessage, connection }) => {
    if (!isOpen) return null;

    const handleSelectChat = (chatId) => {
        console.log("Selected chat ID:", chatId);
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
                            connection={connection}
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
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const connectionRef = useRef(null);

    const userId = 1; // Simulated admin ID
    const userRole = 'Admin'; // Hardcoded admin role

    const backendUrl = import.meta.env.VITE_API_BASE_URL;
    const hubPath = '/supportchathub';

    const fetchChats = async () => {
        try {
            const response = await fetch(`${backendUrl}/Chat`);
            const data = await response.json();
            console.log("Fetched chats:", data);
            setChats(data);
        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${backendUrl}${hubPath}?userId=${userId}&userRole=${userRole}`)
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        const startConnection = async () => {
            try {
                await connection.start();
                console.log("SignalR Connected");
            } catch (err) {
                console.error("SignalR Connection Error:", err);
                setTimeout(startConnection, 5000);
            }
        };

        startConnection();

        connection.on("ChatClaimed", (claimInfo) => {
            setChats(prevChats =>
                prevChats.map(chat =>
                    chat.id === claimInfo.chatId
                        ? { ...chat, adminId: claimInfo.adminId, adminName: claimInfo.adminName }
                        : chat
                )
            );
        });
        
        connection.on("ReceiveMessage", (message) => {
            setChats(prevChats => {
                let chatExists = prevChats.find(chat => chat.id === message.chatId);

                if (chatExists) {
                    return prevChats.map(chat =>
                        chat.id === message.chatId
                            ? {
                                ...chat,
                                contents: [...(chat.contents || []), message], 
                                lastMessage: message.message, 
                                unreadCount: activeChat === message.chatId ? 0 : (chat.unreadCount || 0) + 1
                            }
                            : chat
                    );
                } else {
                    // If chat doesn't exist — add new chat
                    const newChat = {
                        id: message.chatId,
                        ticket: { customer: { firstName: 'Customer' } },
                        contents: [message],
                        lastMessage: message.message,
                        unreadCount: 1
                    };
                    return [...prevChats, newChat];
                }
            });
        });

        connection.on("ReceiveError", (errorMessage) => {
            console.error("SignalR Error:", errorMessage);
        });

        return () => {
            if (connection.state === signalR.HubConnectionState.Connected) {
                connection.stop();
            }
        };
    }, [userId, userRole]);

    const handleToggleChat = () => setIsOpen(!isOpen);

    const handleCloseChat = (chatId) => {
        // Properly clean up when closing a chat
        if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
            connectionRef.current.invoke("LeaveChat", chatId)
                .then(() => console.log("Left chat successfully"))
                .catch(err => console.error("Error leaving chat:", err));
        }
        
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (activeChat === chatId) setActiveChat(null);
    };

    const handleCloseWindow = () => {
        setIsOpen(false);
    };

    const handleSetActiveChat = (chatId) => {
        setActiveChat(chatId);
        
        // Mark messages as read when selecting a chat
        setChats(prevChats =>
            prevChats.map(chat =>
                chat.id === chatId
                    ? { ...chat, unreadCount: 0 }
                    : chat
            )
        );
    };

    const handleSendMessage = (chatId, text) => {
        if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
            connectionRef.current.invoke("SendChatMessage", chatId, text)
                .then(() => console.log("Message sent successfully"))
                .catch(err => console.error("Error sending message:", err));
            
            const timestamp = new Date().toISOString();
            setChats(prevChats =>
                prevChats.map(chat => {
                    if (chat.id === chatId) {
                        return {
                            ...chat,
                            contents: [...(chat.contents || []), { 
                                message: text, 
                                isAdminReply: true,
                                timestamp: timestamp 
                            }],
                            lastMessage: text
                        };
                    } else {
                        return chat;
                    }
                })
            );
        } else {
            console.log("SignalR connection is not active, message not sent");
        }
    };

    const totalUnread = Array.isArray(chats) ? chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0) : 0;
    
    return (
        <div className="chat-admin-container">
            <ChatWindow
                isOpen={isOpen}
                chats={chats}
                activeChat={activeChat}
                setActiveChat={handleSetActiveChat}
                onClose={handleCloseWindow}
                onCloseChat={handleCloseChat}
                onSendMessage={handleSendMessage}
                connection={connectionRef}
            />
            <ChatButton unreadCount={totalUnread} onClick={handleToggleChat} />
        </div>
    );
};

export default ChatAdminManagement;