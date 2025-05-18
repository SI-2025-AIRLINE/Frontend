import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import './ChatManagement.css'; 

const ChatWindow = ({ ticketId = 1 }) => { // POSTAVLJENO NA 1 ZBOG TESTIRANJA
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const connectionRef = useRef(null);
  const [chatId, setChatId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Stanje za detalje korisnika koji je kreirao tiket
  const [customerDetails, setCustomerDetails] = useState({
    username: 'Korisnik',
    fullName: 'Učitavanje...'
  });
  const [isLoadingCustomerDetails, setIsLoadingCustomerDetails] = useState(true);

  // Stanje za detalje prijavljenog korisnika (admin/zaposlenik ili customer)
  const [userDetails, setUserDetails] = useState({
    id: null,
    role: null,
    username: 'Nepoznat',
    fullName: 'Nepoznat'
  });
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(true);

  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const hubPath = '/supportchathub'; // Ili vaša stvarna putanja do huba

  // 1. Učitavanje detalja prijavljenog korisnika (admina/zaposlenika ili customera)
  useEffect(() => {
    const storedUserIdString = localStorage.getItem('userId');
    const storedUserRole = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('userName'); // Ovo je username prijavljenog
    const storedFirstName = localStorage.getItem('name');   // Ime prijavljenog
    const storedLastName = localStorage.getItem('surname'); // Prezime prijavljenog

    let loadedId = null;
    let loadedRole = null;
    let loadedUsername = 'Admin';
    let loadedFullName = 'Admin Ime';

    if (storedUserIdString && storedUserRole) {
      const parsedUserId = parseInt(storedUserIdString, 10);
      if (!isNaN(parsedUserId)) {
        loadedId = parsedUserId;
        loadedRole = storedUserRole;
        loadedUsername = storedUsername || `Korisnik${parsedUserId}`;
        const fName = storedFirstName || '';
        const lName = storedLastName || '';
        loadedFullName = `${fName} ${lName}`.trim() || (loadedRole.toLowerCase() === 'customer' ? `Korisnik ${parsedUserId}` : `Admin ${parsedUserId}`);
      }
    }

    setUserDetails({
      id: loadedId,
      role: loadedRole,
      username: loadedUsername,
      fullName: loadedFullName
    });
    setIsLoadingUserDetails(false);
  }, []);

  // 2. Dohvaćanje detalja korisnika koji je vlasnik tiketa (customer)
  useEffect(() => {
    if (!ticketId || !backendUrl) {
      setIsLoadingCustomerDetails(false);
      console.warn("Ticket ID ili backend URL nedostaju za dohvaćanje detalja korisnika tiketa.");
      setCustomerDetails({ username: 'Greška', fullName: 'Nema ID-a tiketa' });
      return;
    }

    const fetchTicketUserDetails = async () => {
      setIsLoadingCustomerDetails(true);
      try {
        const response = await fetch(`${backendUrl}/Ticket/${ticketId}`);
        if (!response.ok) {
          throw new Error(`Greška pri dohvaćanju detalja tiketa: ${response.status}`);
        }
        const ticketData = await response.json();

        if (ticketData && ticketData.customer) { 
          setCustomerDetails({
            fullName: `${ticketData.customer.firstName || ''} ${ticketData.customer.lastName || ''}`.trim() || `Korisnik ${ticketData.customer.id || ''}`
          });
        } else {
          console.warn("Podaci o korisniku tiketa nisu pronađeni u odgovoru:", ticketData);
          setCustomerDetails({ username: 'Nepoznat', fullName: 'Nepoznati korisnik tiketa' });
        }
      } catch (error) {
        console.error("Greška pri dohvaćanju detalja korisnika tiketa:", error);
        setCustomerDetails({ username: 'Greška', fullName: 'Greška pri dohvaćanju podataka o korisniku' });
      } finally {
        setIsLoadingCustomerDetails(false);
      }
    };

    fetchTicketUserDetails();
  }, [ticketId, backendUrl]);

  // Funkcija za određivanje je li poruka od trenutno prijavljenog korisnika
  const isMyMessage = useCallback((messageIsAdminReply) => {
    if (!userDetails.id || !userDetails.role) return false;
    const isPrijavljeniAdmin = userDetails.role.toLowerCase() === 'admin' || userDetails.role.toLowerCase() === 'employee';
    // Poruka je 'moja' ako:
    // 1. Prijavljeni korisnik je admin I poruka je adminov odgovor (messageIsAdminReply === true)
    // 2. Prijavljeni korisnik NIJE admin (dakle, customer je) I poruka NIJE adminov odgovor (messageIsAdminReply === false)
    return isPrijavljeniAdmin ? messageIsAdminReply : !messageIsAdminReply;
  }, [userDetails.id, userDetails.role]);


  // 3. SignalR konekcija i logika
  useEffect(() => {
    if (isLoadingUserDetails || isLoadingCustomerDetails || !userDetails.id || !userDetails.role || !backendUrl || !ticketId) {
      console.log("SignalR: Preduvjeti nisu ispunjeni.", { isLoadingUserDetails, isLoadingCustomerDetails, userDetailsExists: !!userDetails.id, backendUrlExists: !!backendUrl, ticketId });
      return;
    }

    const url = `${backendUrl}${hubPath}?userId=${userDetails.id}&userRole=${userDetails.role}`;
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        // accessTokenFactory: () => localStorage.getItem('token') // Ako koristite token za autorizaciju
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = newConnection;

    const onChatJoined = (confirmedChatId) => {
      console.log('SignalR: ChatJoinedConfirmation, Chat ID:', confirmedChatId);
      setChatId(confirmedChatId);
    };

    const onReceiveMessage = (msg) => { // msg bi trebao imati: message, timestamp, isAdminReply, senderFullName (opcionalno)
      console.log('SignalR: ReceiveMessage:', msg);
      const senderDisplayName = msg.senderFullName || (msg.isAdminReply ? 'Podrška' : customerDetails.fullName);
      
      setMessages(prev => [...prev, {
        id: msg.chatContentId || `msg-${Date.now()}-${Math.random()}`,
        text: msg.message,
        senderName: senderDisplayName,
        timestamp: new Date(msg.timestamp),
        isMine: isMyMessage(msg.isAdminReply)
      }]);
    };

    const onReceiveHistoricalMessages = (msgs) => { // msgs je niz poruka
      console.log('SignalR: ReceiveHistoricalMessages:', msgs);
      if (Array.isArray(msgs)) {
        const formatted = msgs.map(msg => {
          const senderDisplayName = msg.senderFullName || (msg.isAdminReply ? 'Podrška' : customerDetails.fullName);
          return {
            id: msg.chatContentId,
            text: msg.message,
            senderName: senderDisplayName,
            timestamp: new Date(msg.timestamp),
            isMine: isMyMessage(msg.isAdminReply)
          };
        });
        setMessages(formatted);
      } else {
        console.warn("SignalR: ReceiveHistoricalMessages nije primio niz:", msgs);
        setMessages([]);
      }
    };

    const onChatClaimed = (claimData) => { // claimData: { chatId, adminId, adminName }
        console.log('SignalR: ChatClaimed:', claimData);
        if (claimData.chatId === chatId) { // Provjerite je li ovo chatId koji trenutno gledamo
            // Možete prikazati obavijest da je chat preuzet
            console.log(`Chat ${claimData.chatId} je preuzeo admin: ${claimData.adminName} (ID: ${claimData.adminId})`);
        }
    };

    const onReceiveError = (errorMessage) => {
        console.error("SignalR Greška:", errorMessage);
        // Ovdje možete prikazati grešku korisniku
    };

    newConnection.start()
      .then(() => {
        console.log('SignalR: Povezan.');
        setIsConnected(true);
        newConnection.on('ChatJoinedConfirmation', onChatJoined);
        newConnection.on('ReceiveMessage', onReceiveMessage);
        newConnection.on('ReceiveHistoricalMessages', onReceiveHistoricalMessages);
        newConnection.on('ChatClaimed', onChatClaimed);
        newConnection.on('ReceiveError', onReceiveError);

        console.log(`SignalR: Pozivam JoinChat za ticketId: ${ticketId}`);
        newConnection.invoke('JoinChat', ticketId).catch(err => console.error("SignalR: Greška pri pozivu JoinChat:", err));
      })
      .catch(err => console.error('SignalR: Greška pri povezivanju: ', err));

    return () => {
      setIsConnected(false);
      if (newConnection) {
        console.log('SignalR: Zaustavljam konekciju.');
        newConnection.off('ChatJoinedConfirmation');
        newConnection.off('ReceiveMessage');
        newConnection.off('ReceiveHistoricalMessages');
        newConnection.off('ChatClaimed');
        newConnection.off('ReceiveError');
        newConnection.stop().catch(err => console.error("SignalR: Greška pri zaustavljanju:", err));
      }
    };
  }, [isLoadingUserDetails, isLoadingCustomerDetails, userDetails.id, userDetails.role, backendUrl, ticketId, isMyMessage, customerDetails.fullName, hubPath]);

  // Automatsko skrolanje na dno
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !connectionRef.current || !chatId || !isConnected) {
      console.warn("Slanje poruke nije moguće:", { newMessageEmpty: !newMessage.trim(), connectionExists: !!connectionRef.current, chatId, isConnected });
      return;
    }
    console.log(`SignalR: Pozivam SendChatMessage za chatId: ${chatId}, poruka: ${newMessage}`);
    connectionRef.current.invoke('SendChatMessage', chatId, newMessage)
      .catch(err => console.error("SignalR: Greška pri slanju poruke:", err));
    setNewMessage('');
  }, [newMessage, chatId, isConnected]);

  const formatTime = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
        return ""; // Vrati prazan string za nevažeći datum
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoadingUserDetails || isLoadingCustomerDetails) {
    return <div className="chat-container"><p className="chat-loading-message">Učitavanje podataka za chat...</p></div>;
  }
  
  if (!ticketId) {
    return <div className="chat-container"><p className="chat-error-message">ID tiketa nije dostupan. Chat se ne može prikazati.</p></div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-fullname">{customerDetails.fullName}</div>
        </div>
        <div className="chat-status-info">
            <div>Ticket #{ticketId}</div>
            <div>Chat ID: {chatId || 'Nije dodijeljen'}</div>
            <div>Status: {isConnected ? <span className="status-connected">Povezan</span> : <span className="status-disconnected">Nije povezan</span>}</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && isConnected && (
          <div className="empty-chat-message">
            Nema poruka. Započnite razgovor!
          </div>
        )}
        {messages.length === 0 && !isConnected && !isLoadingUserDetails && !isLoadingCustomerDetails && (
          <div className="empty-chat-message">
            Povezivanje na chat servis...
          </div>
        )}
        
        {messages.map(msg => (
          <div
            key={msg.id} // Osigurajte jedinstveni ključ
            className={`message ${msg.isMine ? 'message-mine' : 'message-theirs'}`}
          >
            <div className="message-bubble">
              {!msg.isMine && <div className="message-sender-name">{msg.senderName}</div>}
              <div className="message-text">{msg.text}</div>
            </div>
            <div className={`message-time ${msg.isMine ? 'time-mine' : 'time-theirs'}`}>
              {formatTime(new Date(msg.timestamp))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input">
        <input
          type="text"
          placeholder="Upišite poruku..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={!isConnected || !chatId}
        />
        <button onClick={handleSendMessage} disabled={!isConnected || !chatId || !newMessage.trim()}>
          <Send size={20} /> 
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;