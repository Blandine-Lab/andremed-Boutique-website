import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ChatWidget from '../components/ChatWidget';
import VoiceRecorder from '../components/VoiceRecorder';

function Services() {
  // ========== ÉTATS POUR LE DEVIS ==========
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    equipmentType: '',
    description: ''
  });
  const [quoteSending, setQuoteSending] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState('');
  const [quoteAudioBlob, setQuoteAudioBlob] = useState(null);

  // ========== ÉTAT POUR LE CHAT ==========
  const [showChat, setShowChat] = useState(false);

  // ========== ÉTATS POUR LE CHECK-UP CENTER ==========
  const [checkupFormData, setCheckupFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    checkupType: 'bilan_essentiel',
    date: '',
    time: 'matin',
    message: ''
  });
  const [checkupSending, setCheckupSending] = useState(false);
  const [checkupStatus, setCheckupStatus] = useState('');

  // Configuration Telegram
  const TELEGRAM_BOT_TOKEN = '8570394266:AAE1_Az0Hzot09m8u3s4Ml-EUMHQjgqunwY';
  const GROUP_CHAT_ID = '-5293060257';

  // ========== FONCTIONS DEVIS ==========
  const sendQuoteToTelegram = async (formData, audioBlob) => {
    const message = `📋 **NOUVELLE DEMANDE DE DEVIS**
━━━━━━━━━━━━━━━━━━
👤 Nom: ${formData.firstName} ${formData.lastName}
📞 Téléphone: ${formData.phone || 'Non renseigné'}
✉️ Email: ${formData.email}
🏥 Type d'équipement: ${formData.equipmentType || 'Non précisé'}
📝 Description:
${formData.description}

📅 ${new Date().toLocaleString('fr-FR')}`;
    try {
      const textResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: GROUP_CHAT_ID, text: message, parse_mode: 'Markdown' })
      });
      let textOk = textResponse.ok;
      let audioOk = true;
      if (audioBlob) {
        const formDataAudio = new FormData();
        formDataAudio.append('chat_id', GROUP_CHAT_ID);
        formDataAudio.append('voice', audioBlob, 'voice_message.ogg');
        const audioResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVoice`, {
          method: 'POST',
          body: formDataAudio
        });
        audioOk = audioResponse.ok;
      }
      return textOk && audioOk;
    } catch (error) {
      console.error('Erreur envoi Telegram devis:', error);
      return false;
    }
  };

  const sendQuoteEmail = async (formData) => {
    const WEB3FORMS_KEY1 = 'ad320909-c81a-4b9d-98fa-a545b02ed85d';
    const WEB3FORMS_KEY2 = 'd6b21a56-7c37-4919-8aa8-b533918b3ccb';
    const emailContent = `
      Bonjour ${formData.firstName} ${formData.lastName},
      
      Nous avons bien reçu votre demande de devis pour ${formData.equipmentType || 'matériel médical'}.
      
      Voici le récapitulatif de votre demande :
      - Nom : ${formData.firstName} ${formData.lastName}
      - Téléphone : ${formData.phone || 'Non renseigné'}
      - Email : ${formData.email}
      - Type d'équipement : ${formData.equipmentType || 'Non précisé'}
      - Description : ${formData.description}
      
      Notre équipe va étudier votre demande et vous recontactera dans les plus brefs délais.
      
      Cordialement,
      L'équipe Andremed Medical
    `;
    const sendToWeb3Forms = async (accessKey) => {
      const formDataEmail = new FormData();
      formDataEmail.append('access_key', accessKey);
      formDataEmail.append('subject', `Demande de devis - ${formData.equipmentType || 'Matériel médical'}`);
      formDataEmail.append('from_name', 'Andremed Medical');
      formDataEmail.append('replyto', 'contact@andremed.org');
      formDataEmail.append('message', emailContent);
      try {
        const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formDataEmail });
        const result = await response.json();
        return result.success;
      } catch (error) {
        console.error(`Erreur Web3Forms (clé ${accessKey}):`, error);
        return false;
      }
    };
    const success1 = await sendToWeb3Forms(WEB3FORMS_KEY1);
    const success2 = await sendToWeb3Forms(WEB3FORMS_KEY2);
    return success1 && success2;
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!quoteForm.email || !quoteForm.firstName || !quoteForm.description) {
      setQuoteStatus('Veuillez remplir les champs obligatoires (nom, email, description).');
      return;
    }
    setQuoteSending(true);
    setQuoteStatus('');
    const telegramOk = await sendQuoteToTelegram(quoteForm, quoteAudioBlob);
    const emailOk = await sendQuoteEmail(quoteForm);
    if (telegramOk && emailOk) {
      setQuoteStatus('✅ Votre demande de devis a été envoyée avec succès. Nous vous répondrons rapidement.');
      setQuoteForm({ firstName: '', lastName: '', email: '', phone: '', equipmentType: '', description: '' });
      setQuoteAudioBlob(null);
      setTimeout(() => {
        setShowQuoteModal(false);
        setQuoteStatus('');
      }, 3000);
    } else {
      setQuoteStatus('❌ Une erreur est survenue. Veuillez réessayer ou nous contacter directement.');
    }
    setQuoteSending(false);
  };

  // ========== FONCTIONS POUR CHECK-UP ==========
  const sendCheckupToTelegram = async (formData) => {
    const typeLabels = {
      bilan_essentiel: 'Diagnostic essentiel (gratuit)',
      bilan_confort: 'Audit technique avancé',
      bilan_premium: 'Stratégie premium'
    };
    const typeLabel = typeLabels[formData.checkupType] || formData.checkupType;
    const message = `🔬 **DEMANDE DE DIAGNOSTIC / CONSEIL**
━━━━━━━━━━━━━━━━━━
👤 Client: ${formData.fullname}
📞 Téléphone: ${formData.phone}
✉️ Email: ${formData.email}
📋 Offre: ${typeLabel}
📅 Date souhaitée: ${formData.date || 'Non précisée'}
⏰ Créneau: ${formData.time === 'matin' ? 'Matin (9h-12h)' : 'Après-midi (14h-17h)'}
💬 Message: ${formData.message || 'Aucun'}

📅 ${new Date().toLocaleString('fr-FR')}`;
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: GROUP_CHAT_ID, text: message, parse_mode: 'Markdown' })
      });
      return response.ok;
    } catch (error) {
      console.error('Erreur envoi Telegram checkup:', error);
      return false;
    }
  };

  const sendCheckupEmail = async (formData) => {
    const WEB3FORMS_KEY = 'ad320909-c81a-4b9d-98fa-a545b02ed85d';
    const typeLabels = {
      bilan_essentiel: 'Diagnostic essentiel',
      bilan_confort: 'Audit technique avancé',
      bilan_premium: 'Stratégie premium'
    };
    const typeLabel = typeLabels[formData.checkupType] || formData.checkupType;
    const emailContent = `
      Bonjour ${formData.fullname},
      
      Nous avons bien reçu votre demande de diagnostic / conseil (${typeLabel}).
      
      Récapitulatif :
      - Date souhaitée : ${formData.date || 'Non précisée'}
      - Créneau : ${formData.time === 'matin' ? 'Matin (9h-12h)' : 'Après-midi (14h-17h)'}
      - Message : ${formData.message || 'Aucun'}
      
      Un de nos experts vous recontactera sous 48h pour confirmer le rendez-vous.
      
      Cordialement,
      L'équipe Andremed Medical
    `;
    const formDataEmail = new FormData();
    formDataEmail.append('access_key', WEB3FORMS_KEY);
    formDataEmail.append('subject', `Demande de diagnostic - ${typeLabel}`);
    formDataEmail.append('to', formData.email);
    formDataEmail.append('from_name', 'Andremed Medical');
    formDataEmail.append('replyto', 'contact@andremed.org');
    formDataEmail.append('message', emailContent);
    try {
      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formDataEmail });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Erreur envoi email checkup:', error);
      return false;
    }
  };

  const handleCheckupSubmit = async (e) => {
    e.preventDefault();
    if (!checkupFormData.fullname || !checkupFormData.email || !checkupFormData.phone) {
      setCheckupStatus('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setCheckupSending(true);
    const telegramOk = await sendCheckupToTelegram(checkupFormData);
    const emailOk = await sendCheckupEmail(checkupFormData);
    if (telegramOk && emailOk) {
      setCheckupStatus('✅ Votre demande a été envoyée. Nous vous recontacterons dans les plus brefs délais.');
      setCheckupFormData({
        fullname: '',
        email: '',
        phone: '',
        checkupType: 'bilan_essentiel',
        date: '',
        time: 'matin',
        message: ''
      });
      setTimeout(() => setCheckupStatus(''), 4000);
    } else {
      setCheckupStatus('❌ Une erreur est survenue. Veuillez réessayer.');
    }
    setCheckupSending(false);
  };

  // ========== COMPTEURS STATISTIQUES ==========
  const [counters, setCounters] = useState({
    support: 0,
    installations: 0,
    formations: 0,
    satisfaction: 0
  });
  const { ref: statsRef, inView: statsInView } = useInView({ triggerOnce: true });

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
      animateCounter('installations', 100);
      animateCounter('formations', 500);
      animateCounter('satisfaction', 99);
    }
  }, [statsInView]);

  // ========== DONNÉES STATIQUES ==========
  const services = [
    {
      icon: "🔧",
      title: "Installation & Configuration",
      desc: "Installation professionnelle et configuration complète de vos équipements médicaux",
      points: ["Installation sur site", "Configuration personnalisée", "Tests de fonctionnement", "Certification de conformité"],
      color: "#0A4D8C"
    },
    {
      icon: "🛠️",
      title: "Maintenance Préventive",
      desc: "Maintenance régulière pour assurer la longévité et performance optimale",
      points: ["Maintenance préventive", "Réparations d'urgence", "Pièces de rechange", "Contrats de maintenance"],
      color: "#00A3B2"
    },
    {
      icon: "🎓",
      title: "Formation du Personnel",
      desc: "Formation complète de votre équipe médicale sur l'utilisation des équipements",
      points: ["Formation théorique", "Pratique hands-on", "Certification utilisateurs", "Support continu"],
      color: "#B41E1E"
    },
    {
      icon: "📞",
      title: "Support Technique 24/7",
      desc: "Assistance technique disponible 24h/24 et 7j/7 pour vos urgences",
      points: ["Hotline 24/7", "Support à distance", "Intervention rapide", "Documentation technique"],
      color: "#2E7D32"
    }
  ];

  const process = [
    { step: "01", title: "Consultation", desc: "Analyse de vos besoins et recommandations personnalisées", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format", gradient: "linear-gradient(135deg, rgba(10,77,140,0.9), rgba(10,77,140,0.7))" },
    { step: "02", title: "Planification", desc: "Élaboration d'un plan d'installation et de déploiement", image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format", gradient: "linear-gradient(135deg, rgba(0,163,178,0.9), rgba(0,163,178,0.7))" },
    { step: "03", title: "Installation", desc: "Installation professionnelle et mise en service", image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800&auto=format", gradient: "linear-gradient(135deg, rgba(180,30,30,0.9), rgba(180,30,30,0.7))" },
    { step: "04", title: "Formation", desc: "Formation complète de votre équipe médicale", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format", gradient: "linear-gradient(135deg, rgba(46,125,50,0.9), rgba(46,125,50,0.7))" },
    { step: "05", title: "Support", desc: "Accompagnement continu et maintenance préventive", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format", gradient: "linear-gradient(135deg, rgba(255,193,7,0.9), rgba(255,193,7,0.7))" }
  ];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 style={styles.title}>📋 NOS <span style={styles.titleAccent}>SERVICES</span></h1>
          <p style={styles.subtitle}>De l'installation à la maintenance, nous vous accompagnons à chaque étape</p>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <div className="glass-card" style={styles.statCard}><div style={styles.statIcon}>⏰</div><div style={styles.statNumber}>{counters.support}/<span style={{fontSize:'1rem'}}>7</span></div><p style={styles.statLabel}>Support Disponible</p></div>
          <div className="glass-card" style={styles.statCard}><div style={styles.statIcon}>🏥</div><div style={styles.statNumber}>{counters.installations}+</div><p style={styles.statLabel}>Installations Réalisées</p></div>
          <div className="glass-card" style={styles.statCard}><div style={styles.statIcon}>👨‍⚕️</div><div style={styles.statNumber}>{counters.formations}+</div><p style={styles.statLabel}>Personnels Formés</p></div>
          <div className="glass-card" style={styles.statCard}><div style={styles.statIcon}>⭐</div><div style={styles.statNumber}>{counters.satisfaction}%</div><p style={styles.statLabel}>Satisfaction Client</p></div>
        </div>
      </section>

      {/* Services Principaux */}
      <section style={styles.servicesSection}>
        <h2 style={styles.sectionTitle}>✨ Nos Services Principaux</h2>
        <p style={styles.sectionSubtitle}>Une gamme complète de services pour vous accompagner</p>
        <div style={styles.servicesGrid}>
          {services.map((service, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -10, scale: 1.02 }} className="glass-card" style={{...styles.serviceCard, borderTop: `4px solid ${service.color}`}}>
              <div style={{...styles.serviceIcon, background: `${service.color}20`}}>{service.icon}</div>
              <h3 style={styles.serviceTitle}>{service.title}</h3>
              <p style={styles.serviceDesc}>{service.desc}</p>
              <ul style={styles.servicePoints}>{service.points.map((point, j) => <li key={j}>✓ {point}</li>)}</ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section : Centre de Diagnostic & Conseil */}
      <section style={styles.checkupSection}>
        <div style={styles.checkupHeader}>
          <h2 style={styles.checkupTitle}>🔬 Centre de diagnostic & conseil</h2>
          <p style={styles.checkupSubtitle}>Évaluez vos besoins en équipements médicaux avec nos experts</p>
        </div>
        <div style={styles.checkupGrid}>
          <div className="glass-card" style={styles.checkupCard}>
            <h3 style={styles.checkupCardTitle}>Diagnostic essentiel</h3>
            <div style={styles.checkupPrice}>Gratuit</div>
            <ul style={styles.checkupList}>
              <li>✓ Analyse des besoins immédiats</li>
              <li>✓ Devis personnalisé</li>
              <li>✓ Orientation produit</li>
              <li>✓ Rendez-vous téléphonique</li>
            </ul>
            <button className="btn-checkup" onClick={() => document.getElementById('checkupForm').scrollIntoView({ behavior: 'smooth' })} style={styles.checkupBtn}>Demander</button>
          </div>
          <div className="glass-card" style={styles.checkupCard}>
            <h3 style={styles.checkupCardTitle}>Audit technique avancé</h3>
            <div style={styles.checkupPrice}>À partir de 150€</div>
            <ul style={styles.checkupList}>
              <li>✓ Diagnostic essentiel inclus</li>
              <li>✓ Inspection sur site ou à distance</li>
              <li>✓ Rapport détaillé + préconisations</li>
              <li>✓ Plan d'équipement personnalisé</li>
            </ul>
            <button className="btn-checkup" onClick={() => document.getElementById('checkupForm').scrollIntoView({ behavior: 'smooth' })} style={styles.checkupBtn}>Demander</button>
          </div>
          <div className="glass-card" style={styles.checkupCard}>
            <h3 style={styles.checkupCardTitle}>Stratégie premium</h3>
            <div style={styles.checkupPrice}>À partir de 450€</div>
            <ul style={styles.checkupList}>
              <li>✓ Audit technique avancé inclus</li>
              <li>✓ Étude de faisabilité complète</li>
              <li>✓ Accompagnement jusqu'à l'installation</li>
              <li>✓ Suivi de performance pendant 1 an</li>
            </ul>
            <button className="btn-checkup" onClick={() => document.getElementById('checkupForm').scrollIntoView({ behavior: 'smooth' })} style={styles.checkupBtn}>Demander</button>
          </div>
        </div>

        {/* Formulaire de demande de diagnostic */}
        <div style={styles.checkupFormContainer} id="checkupForm">
          <h3 style={styles.checkupFormTitle}>📄 Demander un diagnostic ou un audit</h3>
          <form onSubmit={handleCheckupSubmit} style={styles.checkupForm}>
            <div style={styles.checkupFormRow}>
              <div style={styles.checkupFormGroup}>
                <label>Nom complet *</label>
                <input type="text" value={checkupFormData.fullname} onChange={(e) => setCheckupFormData({...checkupFormData, fullname: e.target.value})} required />
              </div>
              <div style={styles.checkupFormGroup}>
                <label>Email *</label>
                <input type="email" value={checkupFormData.email} onChange={(e) => setCheckupFormData({...checkupFormData, email: e.target.value})} required />
              </div>
            </div>
            <div style={styles.checkupFormRow}>
              <div style={styles.checkupFormGroup}>
                <label>Téléphone *</label>
                <input type="tel" value={checkupFormData.phone} onChange={(e) => setCheckupFormData({...checkupFormData, phone: e.target.value})} required />
              </div>
              <div style={styles.checkupFormGroup}>
                <label>Offre choisie</label>
                <select value={checkupFormData.checkupType} onChange={(e) => setCheckupFormData({...checkupFormData, checkupType: e.target.value})}>
                  <option value="bilan_essentiel">Diagnostic essentiel (gratuit)</option>
                  <option value="bilan_confort">Audit technique avancé (150€)</option>
                  <option value="bilan_premium">Stratégie premium (450€)</option>
                </select>
              </div>
            </div>
            <div style={styles.checkupFormRow}>
              <div style={styles.checkupFormGroup}>
                <label>Date souhaitée</label>
                <input type="date" value={checkupFormData.date} onChange={(e) => setCheckupFormData({...checkupFormData, date: e.target.value})} />
              </div>
              <div style={styles.checkupFormGroup}>
                <label>Créneau</label>
                <select value={checkupFormData.time} onChange={(e) => setCheckupFormData({...checkupFormData, time: e.target.value})}>
                  <option value="matin">Matin (9h-12h)</option>
                  <option value="apresmidi">Après-midi (14h-17h)</option>
                </select>
              </div>
            </div>
            <div style={styles.checkupFormGroup}>
              <label>Message / remarques</label>
              <textarea rows="3" value={checkupFormData.message} onChange={(e) => setCheckupFormData({...checkupFormData, message: e.target.value})}></textarea>
            </div>
            <button type="submit" style={styles.checkupSubmitBtn} disabled={checkupSending}>{checkupSending ? 'Envoi...' : 'Envoyer la demande'}</button>
            {checkupStatus && <p style={checkupStatus.includes('✅') ? styles.checkupSuccess : styles.checkupError}>{checkupStatus}</p>}
          </form>
        </div>
      </section>

      {/* Process Section */}
      <section style={styles.processSection}>
        <h2 style={styles.sectionTitle}>⚙️ Notre Processus</h2>
        <p style={styles.sectionSubtitle}>Une approche structurée pour garantir le succès de votre projet</p>
        <div style={styles.processContainer}>
          {process.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -80 : 80, scale: 0.9 }} whileInView={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: i * 0.15, duration: 0.6 }} whileHover={{ scale: 1.05, transition: { duration: 0.2 } }} style={{...styles.processCard, backgroundImage: `linear-gradient(135deg, ${item.gradient}), url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={styles.processStep}>{item.step}</div>
              <h3 style={styles.processTitle}>{item.title}</h3>
              <p style={styles.processDesc}>{item.desc}</p>
              <div style={styles.processOverlay}></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div className="glass-card" style={styles.ctaCard}>
          <h2 style={styles.ctaTitle}>🚀 Prêt à Démarrer Votre Projet ?</h2>
          <p style={styles.ctaText}>Contactez-nous dès aujourd'hui pour une consultation gratuite et découvrez comment nous pouvons vous aider à moderniser vos équipements médicaux.</p>
          <div style={styles.ctaButtons}>
            <button onClick={() => setShowChat(true)} className="btn-primary" style={{...styles.ctaButton, background: '#0A4D8C', color: 'white', border: 'none'}}>📞 Nous contacter</button>
            <button onClick={() => setShowQuoteModal(true)} className="btn-secondary" style={styles.ctaButton}>📋 Demander un devis</button>
          </div>
        </div>
      </section>

      {/* Modal Devis */}
      {showQuoteModal && (
        <div style={styles.quoteModal} onClick={() => setShowQuoteModal(false)}>
          <div style={styles.quoteModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.quoteModalHeader}>
              <h3>📋 Demande de devis</h3>
              <button style={styles.quoteModalClose} onClick={() => setShowQuoteModal(false)}>✕</button>
            </div>
            <form onSubmit={handleQuoteSubmit} style={styles.quoteForm}>
              <div style={styles.quoteFormRow}>
                <input type="text" placeholder="Prénom *" value={quoteForm.firstName} onChange={(e) => setQuoteForm({...quoteForm, firstName: e.target.value})} required style={styles.quoteInput} />
                <input type="text" placeholder="Nom *" value={quoteForm.lastName} onChange={(e) => setQuoteForm({...quoteForm, lastName: e.target.value})} required style={styles.quoteInput} />
              </div>
              <input type="email" placeholder="Email *" value={quoteForm.email} onChange={(e) => setQuoteForm({...quoteForm, email: e.target.value})} required style={styles.quoteInput} />
              <input type="tel" placeholder="Téléphone" value={quoteForm.phone} onChange={(e) => setQuoteForm({...quoteForm, phone: e.target.value})} style={styles.quoteInput} />
              <input type="text" placeholder="Type d'équipement souhaité" value={quoteForm.equipmentType} onChange={(e) => setQuoteForm({...quoteForm, equipmentType: e.target.value})} style={styles.quoteInput} />
              <textarea placeholder="Description de votre besoin *" rows="4" value={quoteForm.description} onChange={(e) => setQuoteForm({...quoteForm, description: e.target.value})} required style={styles.quoteTextarea}></textarea>
              <VoiceRecorder onAudioReady={(blob) => setQuoteAudioBlob(blob)} />
              <button type="submit" style={styles.quoteSubmitBtn} disabled={quoteSending}>{quoteSending ? 'Envoi en cours...' : 'Envoyer la demande'}</button>
              {quoteStatus && <p style={quoteStatus.includes('✅') ? styles.quoteSuccess : styles.quoteError}>{quoteStatus}</p>}
            </form>
          </div>
        </div>
      )}

      {/* ✅ Widget Chat - avec overlay correct */}
      {showChat && (
        <div style={styles.chatOverlay}>
          <ChatWidget 
            productId={null} 
            productName="Support Andremed" 
            onClose={() => setShowChat(false)} 
          />
        </div>
      )}
    </div>
  );
}

// ================= STYLES =================
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    paddingTop: '80px'
  },
  hero: {
    background: 'linear-gradient(135deg, #0A4D8C 0%, #00A3B2 100%)',
    color: 'white',
    padding: '80px 20px',
    textAlign: 'center'
  },
  title: { fontSize: '3.5rem', marginBottom: '1rem' },
  titleAccent: { background: 'linear-gradient(135deg, #fff, #FFD166)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', opacity: 0.9 },
  statsSection: { padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' },
  statCard: { textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '20px', transition: 'transform 0.3s', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  statIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
  statNumber: { fontSize: '2.5rem', fontWeight: 'bold', color: '#0A4D8C' },
  statLabel: { fontSize: '0.9rem', color: '#6C757D' },
  servicesSection: { padding: '60px 20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' },
  sectionTitle: { fontSize: '2.5rem', color: '#0A4D8C', textAlign: 'center', marginBottom: '1rem' },
  sectionSubtitle: { fontSize: '1.1rem', color: '#6C757D', textAlign: 'center', marginBottom: '3rem' },
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' },
  serviceCard: { padding: '2rem', background: 'white', borderRadius: '20px', textAlign: 'left', transition: 'all 0.3s', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  serviceIcon: { fontSize: '2.5rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', marginBottom: '1rem' },
  serviceTitle: { fontSize: '1.3rem', color: '#1A2A3A', marginBottom: '0.5rem' },
  serviceDesc: { fontSize: '0.9rem', color: '#6C757D', marginBottom: '1rem' },
  servicePoints: { listStyle: 'none', padding: 0, margin: 0 },
  processSection: { padding: '60px 20px', background: '#f0f4f8', textAlign: 'center' },
  processContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' },
  processCard: { position: 'relative', padding: '2rem', borderRadius: '20px', overflow: 'hidden', color: 'white', textAlign: 'center', minHeight: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  processOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 0, transition: 'background 0.3s' },
  processStep: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem', position: 'relative', zIndex: 1, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' },
  processTitle: { fontSize: '1.5rem', marginBottom: '0.5rem', position: 'relative', zIndex: 1, fontWeight: 'bold' },
  processDesc: { fontSize: '0.9rem', opacity: 0.9, position: 'relative', zIndex: 1, maxWidth: '90%' },
  ctaSection: { padding: '60px 20px', textAlign: 'center' },
  ctaCard: { maxWidth: '800px', margin: '0 auto', padding: '3rem', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  ctaTitle: { fontSize: '2rem', color: '#0A4D8C', marginBottom: '1rem' },
  ctaText: { fontSize: '1.1rem', color: '#6C757D', marginBottom: '2rem', lineHeight: '1.6' },
  ctaButtons: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  ctaButton: { cursor: 'pointer', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', color: '#0A4D8C', padding: '12px 28px', borderRadius: '40px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.3s ease', border: '1px solid rgba(10,77,140,0.3)', display: 'inline-block' },
  quoteModal: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000 },
  quoteModalContent: { background: 'white', borderRadius: '20px', width: '90%', maxWidth: '550px', maxHeight: '85vh', overflow: 'auto' },
  quoteModalHeader: { background: 'linear-gradient(135deg, #0A4D8C, #00A3B2)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' },
  quoteModalClose: { background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' },
  quoteForm: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  quoteFormRow: { display: 'flex', gap: '10px' },
  quoteInput: { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  quoteTextarea: { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  quoteSubmitBtn: { background: '#0A4D8C', color: 'white', border: 'none', padding: '12px', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },
  quoteSuccess: { color: '#2E7D32', textAlign: 'center', marginTop: '10px' },
  quoteError: { color: '#B41E1E', textAlign: 'center', marginTop: '10px' },

  // ========== STYLES POUR LA SECTION CHECK-UP ==========
  checkupSection: {
    padding: '60px 20px',
    background: 'linear-gradient(135deg, #f0f7fc 0%, #ffffff 100%)',
    borderRadius: '30px',
    margin: '0 20px 60px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
  },
  checkupHeader: { textAlign: 'center', marginBottom: '3rem' },
  checkupTitle: { fontSize: '2.2rem', color: '#0A4D8C', marginBottom: '0.5rem' },
  checkupSubtitle: { fontSize: '1.1rem', color: '#6C757D' },
  checkupGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto 3rem' },
  checkupCard: { background: 'white', borderRadius: '24px', padding: '1.8rem', textAlign: 'center', transition: 'transform 0.3s', cursor: 'pointer' },
  checkupCardTitle: { fontSize: '1.5rem', color: '#0A4D8C', marginBottom: '0.5rem' },
  checkupPrice: { fontSize: '1.8rem', fontWeight: 'bold', color: '#00A3B2', margin: '1rem 0' },
  checkupList: { listStyle: 'none', padding: 0, margin: '1rem 0 1.5rem', textAlign: 'left' },
  checkupBtn: { background: '#0A4D8C', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  checkupFormContainer: { background: 'white', borderRadius: '30px', padding: '2rem', maxWidth: '800px', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #eef2f8' },
  checkupFormTitle: { fontSize: '1.5rem', color: '#0A4D8C', marginBottom: '1.5rem', textAlign: 'center' },
  checkupForm: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  checkupFormRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  checkupFormGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  checkupSubmitBtn: { background: '#0A4D8C', color: 'white', border: 'none', padding: '12px', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' },
  checkupSuccess: { color: '#2E7D32', textAlign: 'center', marginTop: '10px' },
  checkupError: { color: '#B41E1E', textAlign: 'center', marginTop: '10px' },

  // ========== STYLES POUR LE CHAT ==========
  chatOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px'
  }
};

export default Services;
