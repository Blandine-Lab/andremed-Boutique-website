import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ChatWidget = ({ productId, productName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState('');
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [userChatId, setUserChatId] = useState(null);
  const [lastUpdateId, setLastUpdateId] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('chatWidget_history');
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatWidget_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!userChatId) return;
    const interval = setInterval(() => checkForReplies(), 2000);
    return () => clearInterval(interval);
  }, [userChatId]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) {
      setSendStatus('Veuillez écrire un message');
      setTimeout(() => setSendStatus(''), 3000);
      return;
    }

    setIsSending(true);
    setSendStatus('');

    const clientId = userChatId || 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    if (!userChatId) setUserChatId(clientId);

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    setMessages(prev => [...prev, newMessage]);

    let fullMessage = inputMessage;
    if (productName) fullMessage = `[${productName}] ${inputMessage}`;
    if (productId) fullMessage = `Produit #${productId} - ${fullMessage}`;

    try {
      const response = await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          message: fullMessage,
          userId: clientId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setUserChatId(data.userId);
        setSendStatus('✅ Message envoyé ! En attente de réponse...');
        setInputMessage('');
        setIsWaitingResponse(true);
        setMessages(prev => prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ));
        setTimeout(() => setSendStatus(''), 3000);
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setSendStatus(`❌ Erreur: ${error.message}`);
      setMessages(prev => prev.map(msg =>
        msg.id === newMessage.id ? { ...msg, status: 'error' } : msg
      ));
    } finally {
      setIsSending(false);
    }
  };

  const checkForReplies = async () => {
    if (!userChatId) return;
    try {
      const response = await fetch(`${API_URL}/chat/updates`);
      const data = await response.json();
      if (data.ok && data.result) {
        for (const update of data.result) {
          if (update.message && update.message.text) {
            const messageText = update.message.text;
            const replyPattern = new RegExp(`/reply_${userChatId}[\\s,:;]+(.+)`, 'i');
            const match = messageText.match(replyPattern);
            if (match && update.update_id > lastUpdateId) {
              const replyText = match[1].trim();
              const newReply = {
                id: Date.now(),
                text: replyText,
                sender: 'support',
                timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                status: 'received'
              };
              setMessages(prev => {
                const exists = prev.some(msg => msg.text === replyText && msg.sender === 'support');
                if (exists) return prev;
                return [...prev, newReply];
              });
              setIsWaitingResponse(false);
              setSendStatus('📩 Nouvelle réponse du support !');
              setTimeout(() => setSendStatus(''), 3000);
              setLastUpdateId(update.update_id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur polling:', error);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>💬 Chat avec le support</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.messagesContainer}>
          {messages.length === 0 && (
            <div style={styles.emptyState}>
              <p>👋 Bonjour ! Comment pouvons-nous vous aider ?</p>
              <p style={styles.emptySubtext}>Notre équipe vous répondra dans les plus brefs délais.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{ ...styles.message, ...(msg.sender === 'user' ? styles.messageUser : styles.messageSupport) }}
            >
              <div style={styles.messageHeader}>
                <span>{msg.sender === 'user' ? 'Vous' : 'Support Andremed'}</span>
                <span style={styles.messageTime}>{msg.timestamp}</span>
              </div>
              <div style={styles.messageText}>{msg.text}</div>
              {msg.sender === 'user' && msg.status === 'sent' && (
                <div style={styles.statusSent}>✓ Envoyé</div>
              )}
              {msg.sender === 'user' && msg.status === 'delivered' && (
                <div style={styles.statusDelivered}>✓✓ Livré</div>
              )}
            </div>
          ))}
          {isWaitingResponse && (
            <div style={styles.waitingIndicator}>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={styles.typingDots}
              >
                ●●●
              </motion.div>
              <span style={styles.waitingText}>Notre support vous répond dans quelques instants...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div style={styles.inputArea}>
          <input
            type="text"
            placeholder="Votre nom (optionnel)"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={styles.inputName}
          />
          <input
            type="email"
            placeholder="Votre email (optionnel)"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            style={styles.inputEmail}
          />
          <div style={styles.inputWrapper}>
            <textarea
              placeholder="Votre message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              style={styles.textarea}
              rows="2"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              style={styles.sendBtn}
              onClick={sendMessage}
              disabled={isSending || !inputMessage.trim()}
            >
              {isSending ? '...' : '➤'}
            </button>
          </div>
          {sendStatus && (
            <p style={sendStatus.includes('✅') ? styles.statusSuccess : styles.statusError}>
              {sendStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 7000,
    padding: '20px',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '450px',
    height: '70vh',
    maxHeight: '600px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  header: {
    background: 'linear-gradient(135deg, #0A4D8C, #00A3B2)',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    flexShrink: 0,
  },
  title: { margin: 0, fontSize: '1.2rem' },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0 5px',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#f5f5f5',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666',
  },
  emptySubtext: {
    fontSize: '0.8rem',
    marginTop: '10px',
    color: '#999',
  },
  message: {
    maxWidth: '80%',
    padding: '10px 12px',
    borderRadius: '15px',
    position: 'relative',
  },
  messageUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#0A4D8C',
    color: 'white',
    borderBottomRightRadius: '5px',
  },
  messageSupport: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    color: '#333',
    borderBottomLeftRadius: '5px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    marginBottom: '5px',
    opacity: 0.8,
  },
  messageTime: { fontSize: '0.65rem' },
  messageText: { fontSize: '0.9rem', wordBreak: 'break-word' },
  statusSent: { fontSize: '0.6rem', textAlign: 'right', marginTop: '3px', opacity: 0.7 },
  statusDelivered: { fontSize: '0.6rem', textAlign: 'right', marginTop: '3px', color: '#25D366' },
  waitingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '15px',
    alignSelf: 'flex-start',
    marginTop: '5px',
  },
  typingDots: { fontSize: '1.2rem', letterSpacing: '2px', color: '#0A4D8C' },
  waitingText: { fontSize: '0.75rem', color: '#666' },
  inputArea: {
    padding: '15px',
    borderTop: '1px solid #eee',
    backgroundColor: 'white',
    flexShrink: 0,
  },
  inputName: {
    width: '100%',
    padding: '10px',
    marginBottom: '8px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    fontSize: '0.85rem',
    boxSizing: 'border-box',
  },
  inputEmail: {
    width: '100%',
    padding: '10px',
    marginBottom: '8px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    fontSize: '0.85rem',
    boxSizing: 'border-box',
  },
  inputWrapper: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    fontSize: '0.9rem',
    resize: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  sendBtn: {
    background: 'linear-gradient(135deg, #25D366, #128C7E)',
    color: 'white',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
  },
  statusSuccess: { color: '#2E7D32', fontSize: '0.75rem', marginTop: '8px', textAlign: 'center' },
  statusError: { color: '#B41E1E', fontSize: '0.75rem', marginTop: '8px', textAlign: 'center' },
};

export default ChatWidget;