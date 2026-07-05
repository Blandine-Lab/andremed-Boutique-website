import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { supabase } from '../lib/supabase'; // ✅ Import Supabase

function Support() {
  const [counters, setCounters] = useState({
    support: 0,
    reponse: 0,
    resolus: 0,
    clients: 0
  });

  const { ref: statsRef, inView: statsInView } = useInView({ triggerOnce: true });

  // ✅ États pour les FAQ dynamiques
  const [faqQuestions, setFaqQuestions] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);

  // États pour le chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatName, setChatName] = useState('');
  const [chatEmail, setChatEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [userChatId, setUserChatId] = useState(null);
  const [lastUpdateId, setLastUpdateId] = useState(0);
  const chatEndRef = useRef(null);

  // État pour la modale FAQ
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [faqName, setFaqName] = useState('');
  const [faqInstitution, setFaqInstitution] = useState('');
  const [faqSending, setFaqSending] = useState(false);
  const [faqStatus, setFaqStatus] = useState('');

  // État pour le modal email
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  // Configuration Telegram
  const TELEGRAM_BOT_TOKEN = '8570394266:AAE1_Az0Hzot09m8u3s4Ml-EUMHQjgqunwY';
  const GROUP_CHAT_ID = '-5293060257';

  // ✅ Charger les FAQ depuis Supabase
  useEffect(() => {
    const fetchFaqs = async () => {
      setFaqLoading(true);
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true });

      if (error) {
        console.error('Erreur chargement FAQ:', error);
        setFaqQuestions([]);
      } else {
        setFaqQuestions(data || []);
      }
      setFaqLoading(false);
    };

    fetchFaqs();
  }, []);

  useEffect(() => {
    if (statsInView) {
      const animateCounter = (key, target) => {
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            setCounters(prev => ({ ...prev, [key]: target }));
            clearInterval(timer);
          } else {
            setCounters(prev => ({ ...prev, [key]: Math.floor(start) }));
          }
        }, 16);
        return () => clearInterval(timer);
      };
      animateCounter('support', 24);
      animateCounter('reponse', 2);
      animateCounter('resolus', 99);
      animateCounter('clients', 500);
    }
  }, [statsInView]);

  const sendToTelegram = async (userMessage, userName, userEmail) => {
    if (!userMessage.trim()) {
      setSendStatus('Veuillez écrire un message');
      setTimeout(() => setSendStatus(''), 3000);
      return false;
    }

    const clientChatId = userChatId || 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    if (!userChatId) setUserChatId(clientChatId);

    const newMessage = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    setChatHistory(prev => [...prev, newMessage]);

    const supportMessageText = `📩 NOUVEAU MESSAGE (Support)

🆔 ID: ${clientChatId}
👤 Nom: ${userName || 'Non renseigné'}
📧 Email: ${userEmail || 'Non renseigné'}
💬 Message: ${userMessage}

📅 ${new Date().toLocaleString('fr-FR')}

⚠️ POUR RÉPONDRE, TAPEZ:
/reply_${clientChatId} Votre message ici`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: GROUP_CHAT_ID, text: supportMessageText }),
      });
      const data = await response.json();
      if (data.ok) {
        setSendStatus('✅ Message envoyé ! En attente de réponse...');
        setChatMessage('');
        setIsWaitingResponse(true);
        setChatHistory(prev => prev.map(msg => msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg));
        setTimeout(() => setSendStatus(''), 3000);
        return true;
      } else {
        console.error('Erreur Telegram:', data);
        setSendStatus(`❌ Erreur: ${data.description || 'Erreur lors de l\'envoi'}`);
        setChatHistory(prev => prev.map(msg => msg.id === newMessage.id ? { ...msg, status: 'error' } : msg));
        return false;
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      setSendStatus(`❌ Erreur: ${error.message}`);
      setChatHistory(prev => prev.map(msg => msg.id === newMessage.id ? { ...msg, status: 'error' } : msg));
      return false;
    }
  };

  const checkForReplies = async () => {
    if (!userChatId) return;
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
      const data = await response.json();
      if (data.ok && data.result && data.result.length > 0) {
        for (const update of data.result) {
          if (update.message && update.message.text) {
            const messageText = update.message.text;
            const replyPattern = new RegExp(`/reply_${userChatId}[\\s,:;]+(.+)`, 'i');
            const match = messageText.match(replyPattern);
            if (match && update.update_id > lastUpdateId) {
              let replyText = match[1].trim();
              const newReply = {
                id: Date.now(),
                text: replyText,
                sender: 'support',
                timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                status: 'received'
              };
              setChatHistory(prev => {
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
      console.error('Erreur:', error);
    }
  };

  useEffect(() => {
    if (!isChatOpen || !userChatId) return;
    const interval = setInterval(() => checkForReplies(), 2000);
    return () => clearInterval(interval);
  }, [isChatOpen, userChatId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const sendEmail = async (to, subject, message, clientEmail = null) => {
    const WEB3FORMS_KEY = 'ad320909-c81a-4b9d-98fa-a545b02ed85d';
    const recipients = ['contact@andremed.org', 'supporttechn.log@andremed.org'];
    const emailContent = `
      Nom: ${chatName || 'Non renseigné'}
      Email: ${chatEmail || 'Non renseigné'}
      Message: ${message}
    `;
    let allSuccess = true;
    for (const recipient of recipients) {
      const formData = new FormData();
      formData.append('access_key', WEB3FORMS_KEY);
      formData.append('subject', subject);
      formData.append('to', recipient);
      formData.append('from_name', chatName || 'Client Support');
      formData.append('replyto', chatEmail || '');
      formData.append('message', emailContent);
      try {
        const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
        const result = await response.json();
        if (!result.success) allSuccess = false;
      } catch (error) {
        console.error('Erreur envoi email:', error);
        allSuccess = false;
      }
    }
    return allSuccess;
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    if (!faqName || !faqInstitution) {
      setFaqStatus('Veuillez remplir votre nom et établissement.');
      return;
    }
    setFaqSending(true);
    const message = `Question: ${selectedQuestion.question}\n\nNom: ${faqName}\nÉtablissement: ${faqInstitution}`;
    const telegramOk = await sendToTelegram(message, faqName, '');
    const emailOk = await sendEmail('support', `Question FAQ - ${selectedQuestion.question.substring(0, 50)}`, message);
    if (telegramOk && emailOk) {
      setFaqStatus('✅ Votre question a été envoyée. Nous vous répondrons rapidement.');
      setTimeout(() => {
        setShowFaqModal(false);
        setFaqStatus('');
        setFaqName('');
        setFaqInstitution('');
        setSelectedQuestion(null);
      }, 2000);
    } else {
      setFaqStatus('❌ Une erreur est survenue. Veuillez réessayer.');
    }
    setFaqSending(false);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailSubject || !emailMessage) {
      setEmailStatus('Veuillez remplir le sujet et le message.');
      return;
    }
    setEmailSending(true);
    const message = `Sujet: ${emailSubject}\n\nMessage: ${emailMessage}`;
    const telegramOk = await sendToTelegram(message, chatName || 'Client', chatEmail || '');
    const emailOk = await sendEmail('support', emailSubject, message);
    if (telegramOk && emailOk) {
      setEmailStatus('✅ Email envoyé avec succès !');
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailStatus('');
        setEmailSubject('');
        setEmailMessage('');
      }, 2000);
    } else {
      setEmailStatus('❌ Erreur lors de l\'envoi.');
    }
    setEmailSending(false);
  };

  const canaux = [
    {
      icon: "📞",
      title: "Support Téléphonique",
      desc: "Assistance immédiate par téléphone 24h/24",
      contacts: ["+243 82 99 84 833", "+243 82 91 29 933"],
      disponibilite: "24h/24 - 7j/7",
      reponse: "Immédiat",
      color: "#0A4D8C",
      action: "call"
    },
    {
      icon: "📧",
      title: "Support Email",
      desc: "Assistance technique par email avec suivi",
      contact: "Envoyer un email",
      disponibilite: "Lun-Ven 8h-17h",
      reponse: "< 2 heures",
      color: "#00A3B2",
      action: "email"
    },
    {
      icon: "💬",
      title: "Chat en Direct",
      desc: "Discussion instantanée avec nos experts",
      contact: "Ouvrir le chat",
      disponibilite: "Lun-Ven 8h-17h",
      reponse: "< 5 minutes",
      color: "#B41E1E",
      action: "chat"
    }
  ];

  const openFaqModal = (question) => {
    setSelectedQuestion(question);
    setShowFaqModal(true);
    setFaqName('');
    setFaqInstitution('');
    setFaqStatus('');
  };

  const openChat = () => {
    setIsChatOpen(true);
  };

  const openEmailModal = () => {
    setShowEmailModal(true);
    setEmailSubject('');
    setEmailMessage('');
    setEmailStatus('');
  };

  const makeCall = (number) => {
    window.location.href = `tel:${number.replace(/\s/g, '')}`;
  };

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 style={styles.title}>🔧 SUPPORT <span style={styles.titleAccent}>TECHNIQUE</span></h1>
          <p style={styles.subtitle}>Support 24/7</p>
          <p style={styles.description}>
            Notre équipe d'experts est disponible 24h/24 et 7j/7 pour vous assister et résoudre tous vos problèmes techniques rapidement.
          </p>
        </motion.div>
      </section>

      <section ref={statsRef} style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <div className="glass-card" style={styles.statCard}>
            <div style={styles.statIcon}>⏰</div>
            <div style={styles.statNumber}>{counters.support}/<span style={{fontSize:'1rem'}}>7</span></div>
            <p style={styles.statLabel}>Support Disponible</p>
          </div>
          <div className="glass-card" style={styles.statCard}>
            <div style={styles.statIcon}>⚡</div>
            <div style={styles.statNumber}>&lt; {counters.reponse}h</div>
            <p style={styles.statLabel}>Temps de Réponse</p>
          </div>
          <div className="glass-card" style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statNumber}>{counters.resolus}%</div>
            <p style={styles.statLabel}>Problèmes Résolus</p>
          </div>
          <div className="glass-card" style={styles.statCard}>
            <div style={styles.statIcon}>😊</div>
            <div style={styles.statNumber}>{counters.clients}+</div>
            <p style={styles.statLabel}>Clients Satisfaits</p>
          </div>
        </div>
      </section>

      <section style={styles.canauxSection}>
        <h2 style={styles.sectionTitle}>📞 Canaux de Support</h2>
        <p style={styles.sectionSubtitle}>Plusieurs moyens pour nous contacter selon l'urgence de votre demande</p>
        <div style={styles.canauxGrid}>
          {canaux.map((canal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="glass-card"
              style={{...styles.canalCard, borderTop: `4px solid ${canal.color}`}}
            >
              <div style={styles.canalIcon}>{canal.icon}</div>
              <h3 style={styles.canalTitle}>{canal.title}</h3>
              <p style={styles.canalDesc}>{canal.desc}</p>
              <div style={styles.canalInfo}>
                {canal.action === 'call' ? (
                  canal.contacts.map((number, idx) => (
                    <div key={idx} style={styles.canalContact}>
                      <span>📞</span> <a href={`tel:${number.replace(/\s/g, '')}`} style={styles.contactLink}>{number}</a>
                    </div>
                  ))
                ) : (
                  <div style={styles.canalContact}>
                    <span>{canal.icon === '📧' ? '✉️' : '💬'}</span> {canal.contact}
                  </div>
                )}
                <div style={styles.canalDispo}><span>⏰</span> {canal.disponibilite}</div>
                <div style={styles.canalReponse}><span>⚡</span> Réponse: {canal.reponse}</div>
              </div>
              {canal.action === 'call' ? (
                <div style={styles.callButtons}>
                  {canal.contacts.map((number, idx) => (
                    <button key={idx} onClick={() => makeCall(number)} style={styles.contactBtn}>📞 Appeler {number}</button>
                  ))}
                  <button onClick={openChat} style={{...styles.contactBtn, background: '#25D366'}}>💬 Demander un appel via le chat</button>
                </div>
              ) : canal.action === 'email' ? (
                <button onClick={openEmailModal} style={styles.contactBtn}>✉️ Envoyer un email</button>
              ) : (
                <button onClick={openChat} style={styles.contactBtn}>💬 Ouvrir le chat</button>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ✅ Section FAQ dynamique */}
      <section style={styles.faqSection}>
        <h2 style={styles.sectionTitle}>❓ Questions Fréquentes</h2>
        <p style={styles.sectionSubtitle}>Trouvez rapidement des réponses à vos questions</p>
        
        {faqLoading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement des FAQ...</p>
        ) : faqQuestions.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6C757D' }}>
            Aucune FAQ disponible pour le moment.
          </p>
        ) : (
          <div style={styles.faqGrid}>
            {faqQuestions.map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card"
                style={styles.faqCard}
                onClick={() => openFaqModal(item)}
              >
                <div style={styles.faqQuestion}>
                  <span style={styles.faqIcon}>❓</span>
                  <h3>{item.question}</h3>
                </div>
                <p style={styles.faqAnswer}>{item.answer}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section style={styles.ctaSection}>
        <div className="glass-card" style={styles.ctaCard}>
          <h2 style={styles.ctaTitle}>🚀 Besoin d'assistance immédiate ?</h2>
          <p style={styles.ctaText}>Notre équipe technique est prête à vous aider. Contactez-nous dès maintenant !</p>
          <div style={styles.ctaButtons}>
            <a href="tel:+243829984833" className="btn-primary">📞 Appeler +243 82 99 84 833</a>
            <button onClick={openEmailModal} className="btn-secondary">📧 Envoyer un email</button>
            <button onClick={openChat} className="btn-secondary">💬 Chat en direct</button>
          </div>
        </div>
      </section>

      {/* Modales (FAQ, Email, Chat) */}
      {showFaqModal && selectedQuestion && (
        <div style={styles.modal} onClick={() => setShowFaqModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>❓ {selectedQuestion.question}</h3>
              <button style={styles.modalClose} onClick={() => setShowFaqModal(false)}>✕</button>
            </div>
            <form onSubmit={handleFaqSubmit} style={styles.modalForm}>
              <input type="text" placeholder="Votre nom *" value={faqName} onChange={(e) => setFaqName(e.target.value)} required style={styles.modalInput} />
              <input type="text" placeholder="Nom de votre établissement *" value={faqInstitution} onChange={(e) => setFaqInstitution(e.target.value)} required style={styles.modalInput} />
              <button type="submit" style={styles.modalSubmit} disabled={faqSending}>{faqSending ? 'Envoi...' : 'Envoyer la question'}</button>
              {faqStatus && <p style={faqStatus.includes('✅') ? styles.modalSuccess : styles.modalError}>{faqStatus}</p>}
            </form>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div style={styles.modal} onClick={() => setShowEmailModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>✉️ Envoyer un email au support</h3>
              <button style={styles.modalClose} onClick={() => setShowEmailModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEmailSubmit} style={styles.modalForm}>
              <input type="text" placeholder="Sujet *" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} required style={styles.modalInput} />
              <textarea placeholder="Votre message *" rows="5" value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} required style={styles.modalTextarea}></textarea>
              <button type="submit" style={styles.modalSubmit} disabled={emailSending}>{emailSending ? 'Envoi...' : 'Envoyer'}</button>
              {emailStatus && <p style={emailStatus.includes('✅') ? styles.modalSuccess : styles.modalError}>{emailStatus}</p>}
            </form>
          </div>
        </div>
      )}

      {isChatOpen && (
        <div style={styles.chatModal}>
          <div style={styles.chatModalContent}>
            <div style={styles.chatModalHeader}>
              <h3>💬 Chat avec le support</h3>
              <button style={styles.chatCloseBtn} onClick={() => setIsChatOpen(false)}>✕</button>
            </div>
            <div style={styles.chatMessagesArea}>
              {chatHistory.length === 0 ? (
                <div style={styles.chatEmptyState}>
                  <p>👋 Bonjour ! Comment pouvons-nous vous aider ?</p>
                  <p style={styles.chatEmptySubtext}>Notre équipe vous répondra dans les plus brefs délais.</p>
                </div>
              ) : (
                chatHistory.map((msg) => (
                  <div key={msg.id} style={{ ...styles.chatMessage, ...(msg.sender === 'user' ? styles.chatMessageUser : styles.chatMessageSupport) }}>
                    <div style={styles.chatMessageHeader}>
                      <span>{msg.sender === 'user' ? 'Vous' : 'Support Andremed'}</span>
                      <span style={styles.chatMessageTime}>{msg.timestamp}</span>
                    </div>
                    <div style={styles.chatMessageText}>{msg.text}</div>
                    {msg.sender === 'user' && msg.status === 'sent' && <div style={styles.messageStatus}>✓ Envoyé</div>}
                    {msg.sender === 'user' && msg.status === 'delivered' && <div style={styles.messageStatusDelivered}>✓✓ Livré</div>}
                  </div>
                ))
              )}
              {isWaitingResponse && (
                <div style={styles.waitingIndicator}>
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} style={styles.typingDots}>●●●</motion.div>
                  <span style={styles.waitingText}>Notre support vous répondra dans quelques instants...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={styles.chatInputArea}>
              <input type="text" placeholder="Votre nom (optionnel)" value={chatName} onChange={(e) => setChatName(e.target.value)} style={styles.chatInputName} />
              <input type="email" placeholder="Votre email (optionnel)" value={chatEmail} onChange={(e) => setChatEmail(e.target.value)} style={styles.chatInputEmail} />
              <div style={styles.chatInputWrapper}>
                <textarea placeholder="Votre message..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} style={styles.chatTextarea} rows="2" onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendToTelegram(chatMessage, chatName, chatEmail); } }} />
                <button style={styles.chatSendBtn} onClick={() => sendToTelegram(chatMessage, chatName, chatEmail)} disabled={isSending || !chatMessage.trim()}>{isSending ? '...' : '➤'}</button>
              </div>
              {sendStatus && <p style={sendStatus.includes('✅') ? styles.chatSuccess : styles.chatError}>{sendStatus}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== STYLES (inchangés) ==========
const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', paddingTop: '80px' },
  hero: { background: 'linear-gradient(135deg, #0A4D8C 0%, #00A3B2 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' },
  title: { fontSize: '3.5rem', marginBottom: '1rem' },
  titleAccent: { background: 'linear-gradient(135deg, #fff, #FFD166)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { fontSize: '1.8rem', marginBottom: '1rem' },
  description: { fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6', opacity: 0.9 },
  statsSection: { padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' },
  statCard: { textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  statIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
  statNumber: { fontSize: '2.5rem', fontWeight: 'bold', color: '#0A4D8C' },
  statLabel: { fontSize: '0.9rem', color: '#6C757D' },
  canauxSection: { padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' },
  sectionTitle: { fontSize: '2.5rem', color: '#0A4D8C', textAlign: 'center', marginBottom: '1rem' },
  sectionSubtitle: { fontSize: '1.1rem', color: '#6C757D', textAlign: 'center', marginBottom: '3rem' },
  canauxGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' },
  canalCard: { padding: '2rem', background: 'white', borderRadius: '20px', textAlign: 'center', transition: 'all 0.3s' },
  canalIcon: { fontSize: '3rem', marginBottom: '1rem' },
  canalTitle: { fontSize: '1.3rem', color: '#0A4D8C', marginBottom: '0.5rem' },
  canalDesc: { fontSize: '0.9rem', color: '#6C757D', marginBottom: '1rem' },
  canalInfo: { marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '12px' },
  canalContact: { fontSize: '0.9rem', marginBottom: '0.5rem' },
  canalDispo: { fontSize: '0.9rem', marginBottom: '0.5rem' },
  canalReponse: { fontSize: '0.9rem' },
  contactLink: { color: '#0A4D8C', textDecoration: 'none' },
  callButtons: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' },
  contactBtn: { marginTop: '0.5rem', padding: '0.8rem 1rem', background: '#0A4D8C', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', width: '100%', fontSize: '0.9rem' },
  faqSection: { padding: '60px 20px', background: '#f0f4f8' },
  faqGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' },
  faqCard: { padding: '1.5rem', background: 'white', borderRadius: '15px', cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-3px)' } },
  faqQuestion: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' },
  faqIcon: { fontSize: '1.5rem' },
  faqAnswer: { fontSize: '0.9rem', color: '#6C757D', lineHeight: '1.5', paddingLeft: '2.5rem' },
  ctaSection: { padding: '60px 20px', textAlign: 'center' },
  ctaCard: { maxWidth: '800px', margin: '0 auto', padding: '3rem', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  ctaTitle: { fontSize: '2rem', color: '#0A4D8C', marginBottom: '1rem' },
  ctaText: { fontSize: '1.1rem', color: '#6C757D', marginBottom: '2rem' },
  ctaButtons: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  modal: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000 },
  modalContent: { background: 'white', borderRadius: '20px', width: '90%', maxWidth: '500px', overflow: 'hidden' },
  modalHeader: { background: 'linear-gradient(135deg, #0A4D8C, #00A3B2)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' },
  modalClose: { background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' },
  modalForm: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  modalInput: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' },
  modalTextarea: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit' },
  modalSubmit: { background: '#0A4D8C', color: 'white', border: 'none', padding: '12px', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },
  modalSuccess: { color: '#2E7D32', textAlign: 'center', marginTop: '10px' },
  modalError: { color: '#B41E1E', textAlign: 'center', marginTop: '10px' },
  chatModal: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6000 },
  chatModalContent: { backgroundColor: 'white', borderRadius: '20px', width: '90%', maxWidth: '450px', height: '70%', maxHeight: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatModalHeader: { background: 'linear-gradient(135deg, #0A4D8C, #00A3B2)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', flexShrink: 0 },
  chatCloseBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' },
  chatMessagesArea: { flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f5f5f5' },
  chatEmptyState: { textAlign: 'center', padding: '40px 20px', color: '#666' },
  chatEmptySubtext: { fontSize: '0.8rem', marginTop: '10px', color: '#999' },
  chatMessage: { maxWidth: '80%', padding: '10px 12px', borderRadius: '15px', position: 'relative' },
  chatMessageUser: { alignSelf: 'flex-end', backgroundColor: '#0A4D8C', color: 'white', borderBottomRightRadius: '5px' },
  chatMessageSupport: { alignSelf: 'flex-start', backgroundColor: 'white', color: '#333', borderBottomLeftRadius: '5px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
  chatMessageHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '5px', opacity: 0.8 },
  chatMessageTime: { fontSize: '0.65rem' },
  chatMessageText: { fontSize: '0.9rem', wordBreak: 'break-word' },
  messageStatus: { fontSize: '0.6rem', textAlign: 'right', marginTop: '3px', opacity: 0.7 },
  messageStatusDelivered: { fontSize: '0.6rem', textAlign: 'right', marginTop: '3px', color: '#25D366' },
  waitingIndicator: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: 'white', borderRadius: '15px', alignSelf: 'flex-start', marginTop: '5px' },
  typingDots: { fontSize: '1.2rem', letterSpacing: '2px', color: '#0A4D8C' },
  waitingText: { fontSize: '0.75rem', color: '#666' },
  chatInputArea: { padding: '15px', borderTop: '1px solid #eee', backgroundColor: 'white', flexShrink: 0 },
  chatInputName: { width: '100%', padding: '10px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '20px', fontSize: '0.85rem', boxSizing: 'border-box' },
  chatInputEmail: { width: '100%', padding: '10px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '20px', fontSize: '0.85rem', boxSizing: 'border-box' },
  chatInputWrapper: { display: 'flex', gap: '8px', alignItems: 'flex-end' },
  chatTextarea: { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '20px', fontSize: '0.9rem', resize: 'none', fontFamily: 'inherit' },
  chatSendBtn: { background: 'linear-gradient(135deg, #25D366, #128C7E)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chatSuccess: { color: '#2E7D32', fontSize: '0.75rem', marginTop: '8px', textAlign: 'center' },
  chatError: { color: '#B41E1E', fontSize: '0.75rem', marginTop: '8px', textAlign: 'center' }
};

export default Support;
