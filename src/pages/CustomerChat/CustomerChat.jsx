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
  const connectionRef = useRef(null); // Za čuvanje SignalR konekcije
  const [chatId, setChatId] = useState(null); // ID chata dobiven od servera
  const [isConnected, setIsConnected] = useState(false); // Status konekcije
  const messagesEndRef = useRef(null); // Za automatsko skrolanje

  const HARDCODED_TICKET_ID = 1; // Hardkodirani ID tiketa za chat

  // Stanje za korisničke detalje učitane iz localStorage
  const [userDetails, setUserDetails] = useState({
    id: null,
    role: null,
    username: propCustomerUsername,
    fullName: propCustomerFullName
  });
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(true); // Status učitavanja korisničkih detalja

  // 1. Efekt za učitavanje korisničkih podataka iz localStorage
  useEffect(() => {
    console.log("[ChatWindow Effect] Pokušavam učitati korisnika iz localStorage...");
    const storedUserIdString = localStorage.getItem('userId');
    const storedUserRole = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('userName');
    const storedFirstName = localStorage.getItem('name');
    const storedLastName = localStorage.getItem('surname');

    let loadedId = null;
    let loadedRole = null;
    let loadedUsername = propCustomerUsername; // Koristi prop kao fallback
    let loadedFullName = propCustomerFullName; // Koristi prop kao fallback

    if (storedUserIdString && storedUserRole) {
      const parsedUserId = parseInt(storedUserIdString, 10);
      if (!isNaN(parsedUserId)) {
        loadedId = parsedUserId;
        loadedRole = storedUserRole;
        loadedUsername = storedUsername || `Korisnik${parsedUserId}`;
        const fName = storedFirstName || '';
        const lName = storedLastName || '';
        loadedFullName = `${fName} ${lName}`.trim() || `Korisnik ${parsedUserId}`;
        console.log("[ChatWindow Effect] Korisnik učitan iz localStorage:", { id: loadedId, role: loadedRole, username: loadedUsername, fullName: loadedFullName });
      } else {
        console.error("[ChatWindow Effect] userId iz localStorage nije validan broj:", storedUserIdString);
      }
    } else {
      console.warn("[ChatWindow Effect] Nisu pronađeni userId ili role u localStorage. Koristim fallback propse ako su dostupni.");
    }

    setUserDetails({
      id: loadedId,
      role: loadedRole,
      username: loadedUsername,
      fullName: loadedFullName
    });
    setIsLoadingUserDetails(false);
  }, [propCustomerUsername, propCustomerFullName]); // Ovisnosti su fallback props

  // URL-ovi za SignalR konekciju
  const backendUrl = import.meta.env.VITE_API_BASE_URL; // Npr. http://localhost:5165
  const hubPath = '/supportchathub'; // Putanja do huba na backendu

  // Pomoćna funkcija za određivanje da li je poruka od trenutnog korisnika
  // Mora biti definirana ovdje kako bi bila dostupna u SignalR useEffectu
const isMyMessage = useCallback((messageSenderType, messageIsAdminReply) => {
  console.log('[isMyMessage Check] UserDetails:', userDetails, 'SenderType:', messageSenderType, 'IsAdminReply:', messageIsAdminReply); // << DODAJ OVAJ LOG
  if (!userDetails.id || !userDetails.role) {
    console.log('[isMyMessage Check] UserDetails not fully loaded, returning false.');
    return false;
  }

  const currentUserIsAdminOrEmployee =
    userDetails.role.toLowerCase() === 'admin' ||
    userDetails.role.toLowerCase() === 'employee';

  let result;
  if (currentUserIsAdminOrEmployee) {
    result = messageIsAdminReply;
  } else {
    result = !messageIsAdminReply;
  }
  console.log(`[isMyMessage Check] CurrentUserIsAdmin: ${currentUserIsAdminOrEmployee}, Calculated isMine: ${result}`);
  return result;
}, [userDetails.id, userDetails.role]);

  // 2. Glavni efekt za SignalR konekciju, registraciju handlera i cleanup
  useEffect(() => {
    if (isLoadingUserDetails || !userDetails.id || !userDetails.role || !backendUrl) {
      if (!isLoadingUserDetails && !backendUrl) console.error("[ChatWindow SignalR] VITE_API_BASE_URL nije postavljen!");
      if (!isLoadingUserDetails && (!userDetails.id || !userDetails.role)) console.warn("[ChatWindow SignalR] Korisnički podaci (ID/Role) nedostaju za konekciju.");
      return;
    }

    const currentConnectionUrl = `${backendUrl}${hubPath}?userId=${encodeURIComponent(userDetails.id)}&userRole=${encodeURIComponent(userDetails.role)}`;
    console.log(`[ChatWindow SignalR] Inicijaliziram konekciju na: ${currentConnectionUrl} (Ticket: ${HARDCODED_TICKET_ID})`);

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(currentConnectionUrl)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = newConnection;

    const onChatJoinedConfirmation = (confirmedChatId) => {
      console.log(`[SignalR Handler] ChatJoinedConfirmation (Ticket ${HARDCODED_TICKET_ID}) primljen. Chat ID:`, confirmedChatId);
      setChatId(confirmedChatId);
    };

    const onReceiveMessage = (receivedMessage) => {
      console.log(`[SignalR Handler] ReceiveMessage (Ticket ${HARDCODED_TICKET_ID}) primljen. Podaci:`, receivedMessage);
      if (chatId === null || (receivedMessage.chatId && receivedMessage.chatId === chatId) || typeof receivedMessage.chatId === 'undefined') {
        console.log(`[SignalR Handler] Poruka je za trenutni chat...`);
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: receivedMessage.chatContentId || `msg-id-${Date.now()}-${Math.random()}`,
            text: receivedMessage.message,
            sender: receivedMessage.isAdminReply ? 'admin' : 'customer',
            senderName: receivedMessage.senderName,
            timestamp: new Date(receivedMessage.timestamp),
            isMine: isMyMessage(receivedMessage.senderType, receivedMessage.isAdminReply), // Koristi pomoćnu funkciju
          },
        ]);
      } else {
        console.warn(`[SignalR Handler] Primljena poruka za chat ${receivedMessage.chatId}, ali trenutni chat je ${chatId}. Poruka ignorirana.`);
      }
    };

    const onReceiveError = (errorMessage) => {
      console.error(`[SignalR Handler] Hub Error (Ticket ${HARDCODED_TICKET_ID}):`, errorMessage);
    };

    const onChatClaimed = (claimData) => {
      console.log(`[SignalR Handler] ChatClaimed (Ticket ${HARDCODED_TICKET_ID}) primljen. Podaci:`, claimData);
      if (chatId === null || (claimData.chatId && claimData.chatId === chatId)) {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: `system-claim-${Date.now()}`,
            text: `${claimData.adminName || 'Administrator'} je preuzeo ovaj chat.`,
            sender: 'system',
            timestamp: new Date(),
            isMine: false, // Sistemske poruke nisu "moje" u smislu poravnanja
          },
        ]);
      }
    };

    const onReceiveHistoricalMessages = (historical) => {
      console.log(`[SignalR Handler] ReceiveHistoricalMessages ... Broj poruka: ${historical?.length || 0}.`);
      if (historical && historical.length > 0) {
        const formattedHistorical = historical.map(msg => ({
          id: msg.chatContentId,
          text: msg.message,
          sender: msg.senderType?.toLowerCase().includes('admin') || msg.senderType?.toLowerCase().includes('employee') ? 'admin' : 'customer',
          senderName: msg.senderName,
          timestamp: new Date(msg.timestamp),
          isMine: isMyMessage(msg.senderType, msg.senderType?.toLowerCase().includes('admin') || msg.senderType?.toLowerCase().includes('employee')), // Koristi pomoćnu funkciju
        }));
        console.log(`[SignalR Handler] Formatirane povijesne poruke s 'isMine' flagom:`, formattedHistorical);
        setMessages([...formattedHistorical]);
      } else {
        console.log(`[SignalR Handler] Nema povijesnih poruka...`);
        setMessages([]);
      }
    };

    if (newConnection.state === signalR.HubConnectionState.Disconnected) {
      console.log(`[ChatWindow SignalR] Pokušavam se spojiti na SignalR (Ticket ${HARDCODED_TICKET_ID})...`);
      newConnection.start()
        .then(() => {
          console.log(`[ChatWindow SignalR] USPJEŠNO SPOJEN na SignalR (Ticket ${HARDCODED_TICKET_ID})! UserID: ${userDetails.id}, ConnectionID: ${newConnection.connectionId}`);
          setIsConnected(true);
          newConnection.on('ChatJoinedConfirmation', onChatJoinedConfirmation);
          newConnection.on('ReceiveMessage', onReceiveMessage);
          newConnection.on('ReceiveError', onReceiveError);
          newConnection.on('ChatClaimed', onChatClaimed);
          newConnection.on('ReceiveHistoricalMessages', onReceiveHistoricalMessages);
          console.log(`[ChatWindow SignalR] Pozivam 'JoinChat' za Ticket ${HARDCODED_TICKET_ID}...`);
          newConnection.invoke('JoinChat', HARDCODED_TICKET_ID)
            .catch(err => console.error(`[ChatWindow SignalR] Greška pri pozivu 'JoinChat' (Ticket ${HARDCODED_TICKET_ID}): `, err));
        })
        .catch(err => {
          console.error(`[ChatWindow SignalR] GREŠKA pri spajanju na SignalR (Ticket ${HARDCODED_TICKET_ID}): `, err);
          setIsConnected(false);
        });
    }

    return () => {
      console.log(`[ChatWindow SignalR Cleanup] Pokrećem cleanup za Ticket ${HARDCODED_TICKET_ID}. Trenutni ConnectionID: ${connectionRef.current?.connectionId}`);
      setIsConnected(false);
      if (connectionRef.current) {
        const connToStop = connectionRef.current;
        console.log(`[ChatWindow SignalR Cleanup] Uklanjam handlere za ConnectionID: ${connToStop.connectionId}`);
        connToStop.off('ChatJoinedConfirmation', onChatJoinedConfirmation);
        connToStop.off('ReceiveMessage', onReceiveMessage);
        connToStop.off('ReceiveError', onReceiveError);
        connToStop.off('ChatClaimed', onChatClaimed);
        connToStop.off('ReceiveHistoricalMessages', onReceiveHistoricalMessages);
        console.log(`[ChatWindow SignalR Cleanup] Pokušavam zaustaviti konekciju (ID: ${connToStop.connectionId})...`);
        connToStop.stop()
          .then(() => console.log(`[ChatWindow SignalR Cleanup] Konekcija (ID: ${connToStop.connectionId}) uspješno zaustavljena.`))
          .catch(err => console.error(`[ChatWindow SignalR Cleanup] Greška pri zaustavljanju konekcije (ID: ${connToStop.connectionId}):`, err));
        connectionRef.current = null;
      }
    };
  }, [userDetails.id, userDetails.role, isLoadingUserDetails, HARDCODED_TICKET_ID, backendUrl, hubPath, isMyMessage, chatId]); // Dodan isMyMessage i chatId kao ovisnosti

  // 3. Efekt za automatsko skrolanje na dno kada se dodaju nove poruke
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Callback funkcija za slanje nove poruke
  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() === '') {
      console.warn("[Chat SendMessage] Poruka je prazna, ne šaljem.");
      return;
    }
    if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      console.warn("[Chat SendMessage] Nije moguće poslati poruku, SignalR nije spojen.");
      return;
    }
    if (!chatId) {
      console.warn("[Chat SendMessage] Nije moguće poslati poruku, ChatID nije postavljen.");
      return;
    }
    if (!userDetails.id || !userDetails.role) {
      console.error("[Chat SendMessage] Nije moguće poslati poruku, korisnički podaci (ID/Role) nedostaju.");
      return;
    }
    console.log(`[Chat SendMessage] Pokušavam poslati poruku. ChatID: ${chatId}, Poruka: "${newMessage}"`);
    connectionRef.current.invoke('SendChatMessage', chatId, newMessage)
      .then(() => {
        console.log(`[Chat SendMessage] Poruka "${newMessage}" uspješno poslana na hub (metoda SendChatMessage pozvana).`);
      })
      .catch(err => {
        console.error('[Chat SendMessage] Greška pri pozivu SendChatMessage na hubu: ', err);
      });
    setNewMessage('');
  }, [newMessage, chatId, userDetails.id, userDetails.role]);

  const formatTime = (date) => {
    if (!(date instanceof Date) || isNaN(date.valueOf())) {
      return 'Invalid Date';
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  let connectionStatusMessage = "Inicijalizacija...";
  if (!isLoadingUserDetails) {
    if (!userDetails.id || !userDetails.role) {
      connectionStatusMessage = "Greška: Korisnik nije učitan.";
    } else if (!backendUrl) {
      connectionStatusMessage = "Greška: URL servera nije konfiguriran.";
    } else if (connectionRef.current) {
      switch (connectionRef.current.state) {
        case signalR.HubConnectionState.Disconnected:
          connectionStatusMessage = "Nije povezan.";
          break;
        case signalR.HubConnectionState.Connecting:
        case signalR.HubConnectionState.Reconnecting:
          connectionStatusMessage = "Povezivanje...";
          break;
        case signalR.HubConnectionState.Connected:
          connectionStatusMessage = `Povezan kao ${userDetails.role}`;
          break;
        default:
          connectionStatusMessage = "Nepoznato stanje.";
      }
    } else {
      connectionStatusMessage = "Čekanje na uspostavu konekcije...";
    }
  }

  if (isLoadingUserDetails) {
    return <div className="chat-container"><p className="text-center p-4">Učitavanje podataka o korisniku...</p></div>;
  }

  if (!userDetails.id || !userDetails.role) {
    return (
      <div className="chat-container">
        <p className="text-center p-4 text-red-500">
          Greška: Nije moguće dohvatiti podatke o korisniku. Molimo provjerite da ste prijavljeni.
        </p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-username">Ticket #{HARDCODED_TICKET_ID} (Chat ID: {chatId || 'N/A'})</div>
          <div className="chat-fullname">Korisnik: {userDetails.fullName} (@{userDetails.username})</div>
          <div className="chat-status" style={{ color: isConnected ? 'green' : 'red' }}>
            {connectionStatusMessage}
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && isConnected && (
          <div className="empty-chat">
            <p className="text-gray-500 text-center my-8">Nema poruka. Započnite razgovor!</p>
          </div>
        )}
        {messages.length === 0 && !isConnected && connectionRef.current &&
         (connectionRef.current.state === signalR.HubConnectionState.Connecting ||
          connectionRef.current.state === signalR.HubConnectionState.Reconnecting) && (
            <div className="empty-chat"><p className="text-center p-4">Učitavanje poruka ili povezivanje na chat...</p></div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`message 
                        message-${message.sender} 
                        ${message.isMine ? 'message-mine' : 'message-theirs'}
                        ${message.sender === 'system' ? 'message-system' : ''}`}
          >
            <div className="message-bubble">
              {/* Prikazuj ime pošiljatelja za tuđe poruke ako nije sistemska */}
              {!message.isMine && message.senderName && message.sender !== 'system' && (
                <div className="message-sender-name">{message.senderName}</div>
              )}
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