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

); const ChatDetail = ({ chat, onClose, onSendMessage, connection }) => {
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        console.log("Chat prop u useEffect:", chat);

        if (chat && connection.current && connection.current.state === signalR.HubConnectionState.Connected) {
            console.log("Pokušavam JoinChat za chat ID:", chat.ticket.id);
            connection.current.invoke("JoinChat", chat.ticket.id)
                .catch(err => console.error("Error joining chat: ", err));

            const handleReceiveHistoricalMessages = (historicalMessages) => {
                console.log("Primljene povijesne poruke:", historicalMessages);
                const formattedHistoricalMessages = historicalMessages.map(msg => ({
                    message: msg.message, // Backend šalje 'Text' kao poruku (mapirano na 'message' u backendu)
                    isAdmin: msg.isAdminReply, // Backend koristi boolean 'adminReply'
                    timestamp: new Date(msg.timestamp).toISOString() // Backend šalje 'PostedAt'
                }));

                console.log("formattedHistoricalMessages:", formattedHistoricalMessages);
                setMessages(formattedHistoricalMessages);
                scrollToBottom(); // Osiguraj da se skrola na dno nakon učitavanja
            };
            connection.current.on("ReceiveHistoricalMessages", handleReceiveHistoricalMessages);

            const handleNewMessage = (receivedChat) => {
                
                if (receivedChat.chatId === chat.id) {
                    const formattedMessage = {
                        message: receivedChat.message,
                        isAdmin: receivedChat.senderType === 'admin',
                        timestamp: receivedChat.timestamp
                    };
                    
                    setMessages(prevMessages => {
                         const newMessages = [...prevMessages, formattedMessage];
                         return newMessages;
                    });
                    scrollToBottom();
                }
            };
            connection.current.on("ReceiveMessage", handleNewMessage);

            return () => {
                connection.current.off("ReceiveHistoricalMessages", handleReceiveHistoricalMessages); // Važno je i ovdje očistiti listener
                connection.current.off("ReceiveMessage", handleNewMessage);
            };
        } else if (connection.current) {
            console.log("SignalR veza nije uspostavljena ili je prekinuta. Trenutno stanje:", connection.current.state);
        }
    }, [chat, connection]);


    const handleSendMessageLocal = (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        console.log("Status veze prije slanja:", connection.current?.state);
        onSendMessage(chat.id, messageInput);
        console.log("Status veze poslije slanja:", connection.current?.state);
        setMessageInput('');
    };

    if (!chat) return <div className="chat-detail-empty">Select a conversation to view</div>;

    return (
        <div className="chat-detail">
            <div className="chat-detail-header">
                <div className="chat-detail-user">
                    <h3>{chat.ticket?.customer.firstName}</h3>
                    <span className="user-info">{chat.ticket?.customer.email}</span>
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
                {messages.map((msg, index) => {
                    const isAdminMessage = msg.isAdmin;
                    let senderName = '';

                    if (isAdminMessage && chat.admin) {
                        senderName = chat.admin.username;
                    } else if (!isAdminMessage && chat.ticket && chat.ticket.customer) {
                        senderName = chat.ticket.customer.firstName;
                    } else {
                        senderName = 'Nepoznato';
                    }

                    return (
                        <Message
                            key={index}
                            message={{ message: msg.message, timestamp: msg.timestamp }}
                            isAdmin={isAdminMessage}
                            senderName={senderName}
                        />
                    );
                })}
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



const ChatWindow = ({ isOpen, chats, activeChat, setActiveChat, onClose, onCloseChat, onSendMessage, connection }) => {
    if (!isOpen) return null;

    /*console.log("ChatWindow chats: ", chats);
    console.log("ChatWindow isOpen: ", isOpen);
    console.log("ChatWindow activeChat: ", activeChat);
    console.log("ChatWindow onClose,: ", onClose);
    console.log("ChatWindow connection: ", connection);
    console.log("ChatWindow onSendMessage: ", onSendMessage);*/

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
                        {chats.map(chat => {
                            console.log("Trenutni chat u listi ChatWindow:", chat);
                            return (
                                <ChatItem
                                    key={chat.id}
                                    chat={chat}
                                    isActive={activeChat === chat.id}
                                    onClick={handleSelectChat}
                                />
                            );
                        })}
                        {chats.length === 0 && (
                            <div className="empty-chat-list">
                                <p>No active conversations</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="chat-main">
                    {/*console.log("Svi chatovi u ChatWindow:", chats)*/}
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
    const [messages, setMessages] = useState([]);


    const userId = 1; // Simulisani ID administratora (treba doći iz konteksta aplikacije)
    const userRole = 'Admin'; // Hardkodirana rola administratora (treba doći iz konteksta aplikacije)

    const backendUrl = import.meta.env.VITE_API_BASE_URL;
    const hubPath = '/supportchathub';

    const fetchChats = async () => {
        try {
            const response = await fetch(`${backendUrl}/Chat`);
            const data = await response.json();
            setChats(data);
            setMessages(data.contents);
        } catch (error) {
            console.error("Greška pri dohvatanju chatova:", error);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${backendUrl}${hubPath}?userId=${userId}&userRole=${userRole}`) // Dodaj userId i userRole
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        connection.start()
            .then(() => console.log("SignalR Connected"))
            .catch(err => console.error("SignalR Connection Error: ", err));

        connection.on("ReceiveMessage", (message) => {
            //console.log("ID gdje je error: ", chatId);
            //console.log("Message gdje je error: ", message);
            setChats(prevChats => {
                let chatExists = prevChats.find(chat => chat.id === message.chatId);

                if (chatExists) {
                    return prevChats.map(chat =>
                        chat.id === message.chatId
                            ? {
                                ...chat,
                                contents: [...chat.contents, message], 
                                lastMessage: message.message, 
                                unreadCount: activeChat === message.chatId ? 0 : (chat.unreadCount + 1)
                            }
                            : chat
                    );
                } else {
                    // Ako chat ne postoji — dodaj novi chat (možda se dogodi ako se nova poruka primi prije fetchChats)
                    const newChat = {
                        id: message.chatId,
                        ticket: { customer: { firstName: message} }, // Pokušaj rekonstruirati osnovne info
                        contents: [message],
                        lastMessage: message.message,
                        unreadCount: 1
                    };
                    return [...prevChats, newChat];
                }
            });
        });

        connection.on("ChatClaimed", (claimInfo) => {
            setChats(prevChats =>
                prevChats.map(chat =>
                    chat.id === claimInfo.chatId
                        ? { ...chat, adminId: claimInfo.adminId, adminName: claimInfo.adminName }
                        : chat
                )
            );
        });

        connection.on("ReceiveError", (errorMessage) => {
            console.error("SignalR Error: ", errorMessage);
            
        });

        connection.onclose(() => console.log('SignalR veza je zatvorena')); // Dodaj listener za zatvaranje veze
        connection.onreconnecting(() => console.log('Pokušavam ponovno povezivanje...')); // Dodaj listener za ponovno povezivanje
        connection.onreconnected(() => console.log('Ponovno povezano!')); // Dodaj listener za uspješno ponovno povezivanje

        return () => {
            connection.stop();
        };
    }, [activeChat, userId, userRole]);

    const handleToggleChat = () => setIsOpen(!isOpen);

    const handleCloseChat = (chatId) => {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (activeChat === chatId) setActiveChat(null);
    };

    const handleCloseWindow = () => {
        setIsOpen(false);
        setActiveChat(null);
    };

    const handleSendMessage = (chatId, text) => {

        console.log(`Pokušavam poslati poruku "${text}" u chat ${chatId}. Status veze:`, connectionRef.current?.state);
        if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {


            connectionRef.current.invoke("SendChatMessage", chatId, text)
                .then(() => console.log("Poruka uspješno poslana."))
                .catch(err => console.error("Greška prilikom slanja poruke: ", err));
            
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Koristi ISO format za konzistentnost
            setChats(prevChats =>
                prevChats.map(chat => {
                    console.log("Provjeravam chat:", chat);
                    if (chat.id === chatId) {
                        return {
                            ...chat,
                            contents: [...(chat.contents || []), { message: text, sender: 'admin', timestamp: timestamp, isAdminReply: true }],
                            lastMessage: text
                        };
                    } else {
                        return chat;
                    }
                })
            );
        } else {
            console.log("SignalR veza nije aktivna, poruka nije poslana.");
        }
        
    };

    const totalUnread = Array.isArray(chats) ? chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0) : 0;
    console.log("TotalUnread: ", totalUnread);
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
                connection={connectionRef} 
            />
            <ChatButton unreadCount={totalUnread} onClick={handleToggleChat} />
        </div>
    );
};

export default ChatAdminManagement;