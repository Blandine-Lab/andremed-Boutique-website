// src/pages/Home.js
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ParticlesBackground from '../components/Particles/BloodCells';
import AnimatedCounter from '../components/AnimatedCounter';
import VoiceRecorder from '../components/VoiceRecorder';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

function Home() {
  const { user, logout } = useAuth();

  // ========== ÉTATS SUPABASE ==========
  const [newsItems, setNewsItems] = useState([]);
  const [settings, setSettings] = useState({
    phone1: '', phone2: '', email: '', supportEmail: '', address: '',
    facebook_url: '', linkedin_url: '', tiktok_url: ''
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========== ÉTATS EXISTANTS ==========
  const [language, setLanguage] = useState('fr');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayMessage, setDisplayMessage] = useState('');
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
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
  const [leftOffset, setLeftOffset] = useState(0);
  const [rightOffset, setRightOffset] = useState(0);
  const realisationVideos = ['/Livraison1.mp4', '/Livraison2.mp4', '/Livraison3.mp4', '/Livraison4.mp4'];
  const [currentRealisationVideoIndex, setCurrentRealisationVideoIndex] = useState(0);
  const [activeProject, setActiveProject] = useState('kalememi');
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(null);

  // ========== COMPTEUR SECRET POUR ADMIN ==========
  const [adminClickCount, setAdminClickCount] = useState(0);
  const adminTimeoutRef = useRef(null);

  const handleAdminClick = () => {
    if (adminTimeoutRef.current) clearTimeout(adminTimeoutRef.current);
    const newCount = adminClickCount + 1;
    setAdminClickCount(newCount);
    if (newCount >= 5) {
      window.location.href = '/admin-panel';
      setAdminClickCount(0);
    } else {
      adminTimeoutRef.current = setTimeout(() => setAdminClickCount(0), 2000);
    }
  };

  const images = Array.from({ length: 21 }, (_, i) => `${i + 1}.png`);
  const videos = ['/v1.mp4', '/v2.mp4', '/v3.mp4', '/v4.mp4'];
  const itemHeight = 112;
  const totalHeight = images.length * itemHeight;
  const TELEGRAM_BOT_TOKEN = '8570394266:AAE1_Az0Hzot09m8u3s4Ml-EUMHQjgqunwY';
  const GROUP_CHAT_ID = '-5293060257';

  // ========== DEVIS ==========
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

  // ========== NEWSLETTER ==========
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [subscribedEmails, setSubscribedEmails] = useState(() => {
    const saved = localStorage.getItem('newsletter_emails');
    return saved ? JSON.parse(saved) : [];
  });

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');

  // ========== SOUTIEN ==========
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({
    type: 'don',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    amount: '',
    message: ''
  });
  const [supportSending, setSupportSending] = useState(false);
  const [supportStatus, setSupportStatus] = useState('');

  // ========== CHARGEMENT DES DONNÉES SUPABASE ==========
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: newsData } = await supabase
        .from('site_news')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true })
        .order('date_published', { ascending: false });
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
      const { data: teamData } = await supabase
        .from('team_members')
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true });
      const { data: citiesData } = await supabase
        .from('cities_coverage')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true });
      const { data: testimonialsData } = await supabase
        .from('testimonials')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true });
      const { data: newProductsData } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .eq('is_new', true)
        .order('created_at', { ascending: false })
        .limit(15);
      const { data: blogData } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('active', true)
        .order('published_at', { ascending: false })
        .limit(9);

      setNewsItems(newsData || []);
      if (settingsData) setSettings(settingsData);
      setTeamMembers(teamData || []);
      setCitiesList(citiesData || []);
      setTestimonials(testimonialsData || []);
      setNewProducts(newProductsData || []);
      setBlogPosts(blogData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // ========== NEWSLETTER : INSCRIPTION ==========
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterStatus('Veuillez entrer un email valide.');
      return;
    }
    if (subscribedEmails.includes(newsletterEmail)) {
      setNewsletterStatus('Cet email est déjà inscrit.');
      return;
    }
    const newList = [...subscribedEmails, newsletterEmail];
    setSubscribedEmails(newList);
    localStorage.setItem('newsletter_emails', JSON.stringify(newList));
    setNewsletterStatus('✅ Inscription réussie ! Vous recevrez nos actualités.');
    setNewsletterEmail('');
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: GROUP_CHAT_ID,
        text: `📧 Nouvelle inscription newsletter : ${newsletterEmail}`
      })
    }).catch(e => console.error(e));
    setTimeout(() => setNewsletterStatus(''), 3000);
  };

  // ========== NEWSLETTER : ENVOI GROUPÉ (ADMIN) ==========
  const handleBulkSend = async () => {
    const backendUrl = import.meta.env.VITE_NEWSLETTER_BACKEND_URL || 'https://andremed-email-backend.onrender.com/api/send-emails';

    if (adminPassword.trim() !== '@M@thurkayo219901990@@@@1') {
      setBulkStatus('❌ Mot de passe administrateur incorrect.');
      return;
    }
    if (!bulkSubject.trim() || !bulkMessage.trim()) {
      setBulkStatus('❌ Veuillez remplir le sujet et le message.');
      return;
    }
    if (subscribedEmails.length === 0) {
      setBulkStatus('❌ Aucun abonné à la newsletter.');
      return;
    }
    setBulkSending(true);
    setBulkStatus(`📧 Envoi en cours à ${subscribedEmails.length} abonné(s)...`);
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: subscribedEmails,
          subject: bulkSubject,
          message: bulkMessage,
          adminPassword: adminPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setBulkStatus(`✅ Terminé : ${data.successCount} succès, ${data.failCount} échecs.`);
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: GROUP_CHAT_ID,
            text: `📢 Envoi groupé via Brevo : ${data.successCount} destinataires. Sujet : "${bulkSubject}"`
          })
        });
      } else {
        setBulkStatus(`❌ Erreur serveur : ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setBulkStatus(`❌ Impossible de contacter le serveur backend.`);
    }
    setBulkSending(false);
    setTimeout(() => {
      setShowBulkModal(false);
      setBulkSubject('');
      setBulkMessage('');
      setAdminPassword('');
      setBulkStatus('');
    }, 4000);
  };
  // ========== SOUTIEN ==========
  const sendSupportToTelegram = async (formData) => {
    const typeLabel = formData.type === 'don' ? '💝 Don' : formData.type === 'partenariat' ? '🤝 Partenariat' : '📝 Autre';
    const amountText = formData.amount ? `Montant : ${formData.amount} €\n` : '';
    const message = `📢 **NOUVELLE DEMANDE DE SOUTIEN**
━━━━━━━━━━━━━━━━━━
Type : ${typeLabel}
👤 Nom : ${formData.firstName} ${formData.lastName}
📞 Téléphone : ${formData.phone || 'Non renseigné'}
✉️ Email : ${formData.email}
${amountText}💬 Message : ${formData.message || 'Aucun'}

📅 ${new Date().toLocaleString('fr-FR')}`;
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: GROUP_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Erreur envoi Telegram soutien:', error);
      return false;
    }
  };

  const sendSupportEmail = async (formData) => {
    const WEB3FORMS_KEY1 = 'ad320909-c81a-4b9d-98fa-a545b02ed85d';
    const WEB3FORMS_KEY2 = 'd6b21a56-7c37-4919-8aa8-b533918b3ccb';
    const typeLabel = formData.type === 'don' ? 'Don' : formData.type === 'partenariat' ? 'Partenariat' : 'Autre';
    const emailContent = `
      Bonjour ${formData.firstName} ${formData.lastName},
      
      Nous vous remercions pour votre intérêt à soutenir Andremed Medical.
      ... (contenu identique) ...
    `;
    const sendToWeb3Forms = async (accessKey) => {
      const formDataEmail = new FormData();
      formDataEmail.append('access_key', accessKey);
      formDataEmail.append('subject', `Demande de soutien - ${typeLabel}`);
      formDataEmail.append('to', formData.email);
      formDataEmail.append('from_name', 'Andremed Medical');
      formDataEmail.append('replyto', 'contact@andremed.org');
      formDataEmail.append('message', emailContent);
      try {
        const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formDataEmail });
        const result = await response.json();
        return result.success;
      } catch (error) {
        console.error(`Erreur Web3Forms:`, error);
        return false;
      }
    };
    const success1 = await sendToWeb3Forms(WEB3FORMS_KEY1);
    const success2 = await sendToWeb3Forms(WEB3FORMS_KEY2);
    return success1 && success2;
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportForm.email || !supportForm.firstName) {
      setSupportStatus('Veuillez remplir au moins votre nom et email.');
      return;
    }
    setSupportSending(true);
    setSupportStatus('');
    const telegramOk = await sendSupportToTelegram(supportForm);
    const emailOk = await sendSupportEmail(supportForm);
    if (telegramOk && emailOk) {
      setSupportStatus('✅ Votre demande a été envoyée. Nous vous recontacterons rapidement.');
      setSupportForm({ type: 'don', firstName: '', lastName: '', email: '', phone: '', amount: '', message: '' });
      setTimeout(() => {
        setShowSupportModal(false);
        setSupportStatus('');
      }, 3000);
    } else {
      setSupportStatus('❌ Une erreur est survenue. Veuillez réessayer.');
    }
    setSupportSending(false);
  };

  // ========== DEVIS ==========
  const sendQuoteToTelegram = async (formData, audioBlob) => {
    const message = `📋 **NOUVELLE DEMANDE DE DEVIS**\n...`;
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
    const emailContent = `Bonjour ...`;
    const sendToWeb3Forms = async (accessKey) => {
      const formDataEmail = new FormData();
      formDataEmail.append('access_key', accessKey);
      formDataEmail.append('subject', `Demande de devis - ${formData.equipmentType || 'Matériel médical'}`);
      formDataEmail.append('to', formData.email);
      formDataEmail.append('from_name', 'Andremed Medical');
      formDataEmail.append('replyto', 'contact@andremed.org');
      formDataEmail.append('message', emailContent);
      try {
        const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formDataEmail });
        const result = await response.json();
        return result.success;
      } catch (error) {
        console.error(`Erreur Web3Forms:`, error);
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
      setQuoteStatus('✅ Votre demande de devis a été envoyée avec succès.');
      setQuoteForm({ firstName: '', lastName: '', email: '', phone: '', equipmentType: '', description: '' });
      setQuoteAudioBlob(null);
      setTimeout(() => {
        setShowQuoteModal(false);
        setQuoteStatus('');
      }, 3000);
    } else {
      setQuoteStatus('❌ Une erreur est survenue. Veuillez réessayer.');
    }
    setQuoteSending(false);
  };

  // ========== AUTRES DONNÉES STATIQUES (projets) ==========
  const projectsData = {
    kalememi: { label: 'Kalememi', images: ['K1.jpeg', 'K2.png', 'K23.png', 'K12.jpeg', 'K11.jpeg', 'K22.png'] },
    chBunia: { label: 'CH Bunia-Cité', images: ['B1.jpeg', 'B2.jpeg'] },
    radioDentaire: { label: 'Radio dentaire - HGR Bunia', images: ['G1.jpeg', 'G2.jpeg', 'G3.jpeg', 'G4.jpeg', 'G5.jpeg'] },
    cliniqueLubumbashi: { label: 'Clinique de Lubumbashi', images: ['LS1.jpeg', 'LS2.jpeg', 'LS3.jpeg'] },
    polycliniqueCitadelle: { label: 'Polyclinique Citadelle (Néonatalogie)', images: ['c1.jpeg', 'c2.jpeg', 'c3.jpeg', 'c4.jpeg', 'c12.jpeg', 'c13.jpeg', 'c14.jpeg'] },
    consommables: { label: 'Ventes de consommables', images: ['con1.jpeg', 'con2.jpeg', 'con3.jpeg', 'con4.jpeg', 'con5.jpeg'] },
    cliniqueSommet: { label: 'Clinique Sommet du pouvoir (Dr Sumbu)', images: ['cli1.jpeg', 'cli2.jpeg', 'cli3.jpeg', 'cli4.jpeg', 'cli5.jpeg'] },
    HopitalgeneraldeKinshasa: { label: 'Hopital general de Kinshasa', images: ['cc1.jpeg', 'cc2.jpeg', 'cc3.jpeg', 'cc4.jpeg', 'cc5.jpeg'] },
    radiologiealhopitaldeKolwezi: { label: 'hopital de Kolwezi', images: ['ccc1.jpeg', 'ccc2.jpeg', 'ccc3.jpeg', 'ccc4.jpeg', 'ccc5.jpeg'] },
    CentreHospitalierNotredamedAfriqueMONTCARMELGOMA: { label: 'hopital MONT CARMEL GOMA', images: ['cccc1.jpeg', 'cccc2.jpeg', 'cccc3.jpeg', 'cccc4.jpeg', 'cccc5.jpeg'] }
  };

  // ========== ROTATIONS ET ANIMATIONS ==========
  useEffect(() => {
    const interval = setInterval(() => setCurrentVideoIndex(prev => (prev + 1) % videos.length), 8000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const interval = setInterval(() => setCurrentRealisationVideoIndex(prev => (prev + 1) % realisationVideos.length), 8000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (autoRotate) {
      autoRotateRef.current = setInterval(() => {
        const projectKeys = Object.keys(projectsData);
        const currentIndex = projectKeys.indexOf(activeProject);
        setActiveProject(projectKeys[(currentIndex + 1) % projectKeys.length]);
      }, 5000);
    } else if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    return () => { if (autoRotateRef.current) clearInterval(autoRotateRef.current); };
  }, [autoRotate, activeProject]);

  // ========== CHAT ==========
  const sendToTelegram = async () => {
    if (!chatMessage.trim()) {
      setSendStatus('Veuillez écrire un message');
      setTimeout(() => setSendStatus(''), 3000);
      return;
    }
    setIsSending(true);
    setSendStatus('');
    const clientChatId = userChatId || 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    if (!userChatId) setUserChatId(clientChatId);
    const newMessage = { id: Date.now(), text: chatMessage, sender: 'user', timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), status: 'sent' };
    setChatHistory(prev => [...prev, newMessage]);
    const supportMessageText = `📩 NOUVEAU MESSAGE\n\n🆔 ID: ${clientChatId}\n👤 Nom: ${chatName || 'Non renseigné'}\n📧 Email: ${chatEmail || 'Non renseigné'}\n💬 Message: ${chatMessage}\n\n📅 ${new Date().toLocaleString('fr-FR')}\n\n⚠️ POUR RÉPONDRE, TAPEZ:\n/reply_${clientChatId} Votre message ici`;
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: GROUP_CHAT_ID, text: supportMessageText })
      });
      const data = await response.json();
      if (data.ok) {
        setSendStatus('✅ Message envoyé ! En attente de réponse...');
        setChatMessage('');
        setIsWaitingResponse(true);
        setChatHistory(prev => prev.map(msg => msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg));
        setTimeout(() => setSendStatus(''), 3000);
      } else {
        setSendStatus(`❌ Erreur: ${data.description || 'Erreur lors de l\'envoi'}`);
        setChatHistory(prev => prev.map(msg => msg.id === newMessage.id ? { ...msg, status: 'error' } : msg));
      }
    } catch (error) {
      setSendStatus(`❌ Erreur: ${error.message}`);
      setChatHistory(prev => prev.map(msg => msg.id === newMessage.id ? { ...msg, status: 'error' } : msg));
    } finally { setIsSending(false); }
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
              const newReply = { id: Date.now(), text: replyText, sender: 'support', timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), status: 'received' };
              setChatHistory(prev => { const exists = prev.some(msg => msg.text === replyText && msg.sender === 'support'); if (exists) return prev; return [...prev, newReply]; });
              setIsWaitingResponse(false);
              setSendStatus('📩 Nouvelle réponse du support !');
              setTimeout(() => setSendStatus(''), 3000);
              setLastUpdateId(update.update_id);
            }
          }
        }
      }
    } catch (error) { console.error('Erreur:', error); }
  };

  useEffect(() => {
    if (!isChatOpen || !userChatId) return;
    const interval = setInterval(() => checkForReplies(), 2000);
    return () => clearInterval(interval);
  }, [isChatOpen, userChatId]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // ========== CARROUSELS LATÉRAUX ==========
  useEffect(() => {
    let animationId, lastTimestamp = 0, currentOffset = 0, speed = 0.5;
    const animate = (timestamp) => {
      if (!lastTimestamp) { lastTimestamp = timestamp; animationId = requestAnimationFrame(animate); return; }
      currentOffset += speed;
      setLeftOffset(currentOffset % totalHeight);
      lastTimestamp = timestamp;
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [totalHeight]);
  useEffect(() => {
    let animationId, lastTimestamp = 0, currentOffset = 0, speed = 0.5;
    const animate = (timestamp) => {
      if (!lastTimestamp) { lastTimestamp = timestamp; animationId = requestAnimationFrame(animate); return; }
      currentOffset -= speed;
      setRightOffset(currentOffset % totalHeight);
      lastTimestamp = timestamp;
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [totalHeight]);

  const repeatedImages = [...images, ...images, ...images];
  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' }
  ];
  const currentLang = languages.find(l => l.code === language);

  // ========== TRADUCTIONS ==========
  const translations = {
    fr: {
      messages: ["Excellence en Équipements Médicaux", "Technologie Médicale de Pointe", "Innovation Médicale Durable", "Matériels de Haute Précision", "Équipements Certifiés CE/ISO"],
      shop: "🛒 Boutique", about: "📖 À propos", services: "🔧 Services", support: "📞 Support", blog: "📝 Blog", realisations: "🏆 Réalisations", monCompte: "👤 Mon compte",
      platformTitle: "🛒 Plateforme de vente des équipements médicaux",
      stats: [{ label: "Hôpitaux équipés", suffix: "+" }, { label: "Professionnels formés", suffix: "+" }, { label: "Partenaires européens", suffix: "+" }, { label: "Satisfaction client", suffix: "%" }, { label: "Produits disponibles", suffix: "+" }],
      engagementsTitle: "✨ Notre Engagement pour la Santé", engagementsSubtitle: "Chez Andremed, chaque équipement joue un rôle crucial dans le sauvetage de vies.",
      engagements: [{ title: "Équipements certifiés ISO et CE", desc: "Conformité aux normes internationales" }, { title: "Support technique 24/7", desc: "Assistance permanente" }, { title: "Formation complète incluse", desc: "Pour votre équipe médicale" }, { title: "Installation et maintenance", desc: "Service complet" }],
      mapTitle: "🌍 Nos livraisons en temps réel", mapSubtitle: "Présents dans toute la RDC et sur 4 continents, nous livrons partout dans le monde", mapInfo: "🚚 Livraison dans toutes les villes de la RDC",
      shopCtaTitle: "Découvrez notre Boutique Médicale", shopCtaText: "Plus de 1000 équipements médicaux disponibles • Livraison dans toute la RDC • Garantie 5 ans • Installation incluse", shopCtaBtn1: "🛒 Accéder à la boutique", shopCtaBtn2: "📋 Voir le catalogue", shopStats: ["🏥 1000+ produits", "🚚 Livraison 48h", "🛡️ Garantie 5 ans", "🔧 Installation incluse", "🎓 Formation offerte"],
      realisationsTitle: "🏆 Nos réalisations", realisationsSubtitle: "Découvrez nos dernières livraisons et installations à travers la RDC", autoRotateLabel: "Rotation automatique",
      projectKalememi: "Kalememi", projectCHBunia: "CH Bunia-Cité", projectRadio: "Radio dentaire - HGR Bunia", projectLubumbashi: "Clinique de Lubumbashi", projectCitadelle: "Polyclinique Citadelle", projectConsommables: "Ventes consommables", projectSommet: "Clinique Sommet du pouvoir",
      temoignagesTitle: "⭐ Témoignages", temoignagesSubtitle: "Ce que disent nos Clients",
      ctaTitle: "Prêt à équiper votre établissement ?", ctaText: "Rejoignez les 150+ hôpitaux qui nous font confiance", ctaBtn1: "🛒 Visiter la boutique", ctaBtn2: "💬 Demander un devis", ctaBtn3: "🏆 Nos réalisations",
      shopHint: "Cliquez →", chatPlaceholder: "Écrivez votre message...", chatNamePlaceholder: "Votre nom (optionnel)", chatEmailPlaceholder: "Votre email (optionnel)", chatSend: "Envoyer", chatClose: "Fermer", chatTitle: "💬 Chat avec notre support", supportTyping: "Notre support vous répondra dans quelques instants", you: "Vous", supportLabel: "Support Andremed",
      teamTitle: "👥 Notre Équipe d'Excellence", teamSubtitle: "Des professionnels dévoués à votre santé",
      newProductsTitle: "🆕 Nouveautés", newProductsSubtitle: "Découvrez nos derniers équipements médicaux"
    },
    en: {
      messages: ["Excellence in Medical Equipment", "Cutting-Edge Medical Technology", "Sustainable Medical Innovation", "High Precision Equipment", "CE/ISO Certified Equipment"],
      shop: "🛒 Shop", about: "📖 About", services: "🔧 Services", support: "📞 Support", blog: "📝 Blog", realisations: "🏆 Achievements", monCompte: "👤 My account",
      platformTitle: "🛒 Medical Equipment Sales Platform",
      stats: [{ label: "Hospitals Equipped", suffix: "+" }, { label: "Professionals Trained", suffix: "+" }, { label: "European Partners", suffix: "+" }, { label: "Client Satisfaction", suffix: "%" }, { label: "Products Available", suffix: "+" }],
      engagementsTitle: "✨ Our Commitment to Health", engagementsSubtitle: "At Andremed, every piece of equipment plays a crucial role in saving lives.",
      engagements: [{ title: "ISO & CE Certified Equipment", desc: "Compliance with international standards" }, { title: "24/7 Technical Support", desc: "Permanent assistance" }, { title: "Complete Training Included", desc: "For your medical team" }, { title: "Installation & Maintenance", desc: "Comprehensive service" }],
      mapTitle: "🌍 Real-time Deliveries", mapSubtitle: "Present throughout DRC and on 4 continents, we deliver worldwide", mapInfo: "🚚 Delivery to all cities in DRC",
      shopCtaTitle: "Discover Our Medical Shop", shopCtaText: "Over 1000 medical equipment available • Delivery throughout DRC • 5-year warranty • Installation included", shopCtaBtn1: "🛒 Go to shop", shopCtaBtn2: "📋 View catalog", shopStats: ["🏥 1000+ products", "🚚 48h delivery", "🛡️ 5-year warranty", "🔧 Installation included", "🎓 Free training"],
      realisationsTitle: "🏆 Our Achievements", realisationsSubtitle: "Discover our latest deliveries and installations across the DRC", autoRotateLabel: "Auto-rotate",
      projectKalememi: "Kalememi", projectCHBunia: "CH Bunia-Cité", projectRadio: "Dental X-ray - HGR Bunia", projectLubumbashi: "Lubumbashi Clinic", projectCitadelle: "Citadelle Polyclinic", projectConsommables: "Consumables Sales", projectSommet: "Sommet du pouvoir Clinic",
      temoignagesTitle: "⭐ Testimonials", temoignagesSubtitle: "What our Clients say",
      ctaTitle: "Ready to equip your facility?", ctaText: "Join the 150+ hospitals that trust us", ctaBtn1: "🛒 Visit the shop", ctaBtn2: "💬 Request a quote", ctaBtn3: "🏆 Our achievements",
      shopHint: "Click →", chatPlaceholder: "Type your message...", chatNamePlaceholder: "Your name (optional)", chatEmailPlaceholder: "Your email (optional)", chatSend: "Send", chatClose: "Close", chatTitle: "💬 Chat with support", supportTyping: "Our support will respond shortly", you: "You", supportLabel: "Andremed Support",
      teamTitle: "👥 Our Excellence Team", teamSubtitle: "Dedicated professionals for your health",
      newProductsTitle: "🆕 New Arrivals", newProductsSubtitle: "Discover our latest medical equipment"
    }
  };

  const t = translations[language] || translations.fr;
  const messagesList = t.messages;

  // Animation des messages
  useEffect(() => {
    let timeout;
    const currentMsg = messagesList[currentMessageIndex];
    if (!isDeletingMessage) {
      if (displayMessage.length < currentMsg.length) {
        timeout = setTimeout(() => setDisplayMessage(currentMsg.substring(0, displayMessage.length + 1)), 30);
      } else {
        timeout = setTimeout(() => setIsDeletingMessage(true), 1500);
      }
    } else {
      if (displayMessage.length > 0) {
        timeout = setTimeout(() => setDisplayMessage(displayMessage.substring(0, displayMessage.length - 1)), 20);
      } else {
        setIsDeletingMessage(false);
        setCurrentMessageIndex((prev) => (prev + 1) % messagesList.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayMessage, isDeletingMessage, currentMessageIndex, messagesList]);

  const stats = [
    { value: 150, suffix: t.stats[0].suffix, label: t.stats[0].label, icon: "/hopital.png", color: "#0A4D8C", type: "image" },
    { value: 50000, suffix: t.stats[1].suffix, label: t.stats[1].label, icon: "/professionnel.png", color: "#00A3B2", type: "image" },
    { value: 15, suffix: t.stats[2].suffix, label: t.stats[2].label, icon: "/partenaire.png", color: "#B41E1E", type: "image" },
    { value: 98, suffix: t.stats[3].suffix, label: t.stats[3].label, icon: "⭐", color: "#2E7D32", type: "emoji" },
    { value: 1000, suffix: t.stats[4].suffix, label: t.stats[4].label, icon: "🛒", color: "#FF9800", link: "/shop", type: "emoji" }
  ];

  const engagements = [
    { icon: "✅", title: t.engagements[0].title, desc: t.engagements[0].desc },
    { icon: "📞", title: t.engagements[1].title, desc: t.engagements[1].desc },
    { icon: "🎓", title: t.engagements[2].title, desc: t.engagements[2].desc },
    { icon: "🔧", title: t.engagements[3].title, desc: t.engagements[3].desc }
  ];

  // ========== RENDU JSX ==========
  return (
    <>
      <ParticlesBackground />

      {user && (
        <div style={styles.userMenu}>
          <span>👋 {user.name || user.email}</span>
          <button onClick={logout} style={styles.logoutBtn}>Déconnexion</button>
        </div>
      )}

      <div style={styles.chatButton} onClick={() => setIsChatOpen(true)}>
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={styles.chatIcon}>💬</motion.div>
        <span style={styles.chatText}>Chat with us</span>
      </div>

      {isChatOpen && (
        <div style={styles.chatModal}>
          <div style={styles.chatModalContent}>
            <div style={styles.chatModalHeader}>
              <h3 style={styles.chatModalTitle}>{t.chatTitle}</h3>
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
                      <span style={styles.chatMessageSender}>{msg.sender === 'user' ? t.you : t.supportLabel}</span>
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
                  <span style={styles.waitingText}>{t.supportTyping}</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={styles.chatInputArea}>
              <input type="text" placeholder={t.chatNamePlaceholder} value={chatName} onChange={(e) => setChatName(e.target.value)} style={styles.chatInputName} />
              <input type="email" placeholder={t.chatEmailPlaceholder} value={chatEmail} onChange={(e) => setChatEmail(e.target.value)} style={styles.chatInputEmail} />
              <div style={styles.chatInputWrapper}>
                <textarea placeholder={t.chatPlaceholder} value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} style={styles.chatTextarea} rows="2" onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendToTelegram(); } }} />
                <button style={styles.chatSendBtn} onClick={sendToTelegram} disabled={isSending || !chatMessage.trim()}>{isSending ? '...' : '➤'}</button>
              </div>
              {sendStatus && <p style={sendStatus.includes('✅') ? styles.chatSuccess : styles.chatError}>{sendStatus}</p>}
            </div>
          </div>
        </div>
      )}

      <div style={styles.langSelectorContainer}>
        <div style={styles.langSelector} onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}>
          <span style={styles.langFlag}>{currentLang.flag}</span>
          <span style={styles.langName}>{currentLang.name}</span>
          <span style={styles.langArrow}>▼</span>
        </div>
        {isLangMenuOpen && (
          <div style={styles.langMenu}>
            {languages.map(lang => (
              <div key={lang.code} style={{ ...styles.langMenuItem, ...(language === lang.code ? styles.langMenuItemActive : {}) }} onClick={() => { setLanguage(lang.code); setIsLangMenuOpen(false); }}>
                <span style={styles.langFlag}>{lang.flag}</span>
                <span style={styles.langName}>{lang.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <section style={{ ...styles.hero, direction: currentLang.dir }}>
        <div style={styles.heroBackground}>
          <img src="/fond-accueil.png" alt="ANDREMED MEDICAL" style={styles.heroBgImage} />
        </div>
        <div style={styles.leftCarousel}>
          <div style={{ ...styles.carouselTrack, transform: `translateY(${-leftOffset}px)` }}>
            {repeatedImages.map((img, idx) => (
              <div key={`left-${idx}`} style={styles.carouselImage}>
                <img src={`/${img}`} alt="medical" style={styles.carouselImg} />
                <div style={styles.imageOverlay}></div>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.rightCarousel}>
          <div style={{ ...styles.carouselTrack, transform: `translateY(${rightOffset}px)` }}>
            {repeatedImages.map((img, idx) => (
              <div key={`right-${idx}`} style={styles.carouselImage}>
                <img src={`/${img}`} alt="medical" style={styles.carouselImg} />
                <div style={styles.imageOverlay}></div>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.heroContent}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: "spring", stiffness: 100 }} style={styles.titleMainContainer}>
            <motion.img
              src="/Andremed.jpg"
              alt="ANDREMED MEDICAL"
              style={styles.logoImage}
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={handleAdminClick}
            />
            <div style={styles.titleWrapper}>
              <div style={styles.titleBackground}><motion.h1 style={styles.title}>ANDREMED <motion.span style={styles.titleAccent}>PROSPERITY</motion.span></motion.h1></div>
              <div style={styles.titleBackground}><motion.h1 style={styles.titleDiagnostics}>DIAGNOSTICS</motion.h1></div>
              <div style={styles.titleBackground}><motion.p style={styles.titleMedical}>MEDICAL</motion.p></div>
            </div>
          </motion.div>
          <motion.div style={styles.statsGrid} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            {stats.map((stat, index) => (
              <motion.div key={index} style={{ ...styles.statCard, borderTop: `4px solid ${stat.color}`, cursor: stat.link ? 'pointer' : 'default' }} onClick={() => stat.link && (window.location.href = stat.link)} whileHover={{ scale: 1.05, y: -5 }}>
                {stat.type === 'image' ? <motion.img src={stat.icon} alt={stat.label} style={styles.statImage} whileHover={{ scale: 1.1, rotate: 5 }} /> : <motion.div style={styles.statIcon} whileHover={{ scale: 1.2, rotate: 10 }}>{stat.icon}</motion.div>}
                <div style={{ ...styles.statNumber, color: stat.color }}><AnimatedCounter end={stat.value} suffix={stat.suffix} /></div>
                <p style={styles.statLabel}>{stat.label}</p>
                {stat.link && <p style={styles.statShopHint}>{t.shopHint}</p>}
              </motion.div>
            ))}
          </motion.div>
          <motion.div style={styles.buttons} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <Link to="/shop" className="btn-primary-shop" style={{ zIndex: 10 }}>{t.shop}</Link>
            <Link to="/blog" className="btn-secondary" style={{ zIndex: 10 }}>{t.blog}</Link>
            <Link to="/about" className="btn-secondary" style={{ zIndex: 10 }}>{t.about}</Link>
            <Link to="/services" className="btn-secondary" style={{ zIndex: 10 }}>{t.services}</Link>
            <Link to="/support" className="btn-secondary" style={{ zIndex: 10 }}>{t.support}</Link>
            <Link to="/realisations" className="btn-secondary" style={{ zIndex: 10 }}>{t.realisations}</Link>
            <Link to="/account" className="btn-secondary" style={{ zIndex: 10 }}>{t.monCompte}</Link>
          </motion.div>
          <motion.div style={styles.messagesContainer} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
            <div style={styles.messagesTitleContainer}><motion.p style={styles.messagesTitle}>{t.platformTitle}</motion.p></div>
            <motion.div style={styles.messagesBox} whileHover={{ scale: 1.02 }}>
              <motion.span style={styles.messagesIcon} animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>✨</motion.span>
              <div style={styles.messagesTextWrapper}>
                <motion.span key={displayMessage} style={styles.messagesText}>{displayMessage}</motion.span>
                <motion.span style={styles.messagesCursor} animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>|</motion.span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section style={styles.engagementsSection}>
        <div style={styles.videoBackground}>
          <AnimatePresence mode="wait">
            <motion.video key={currentVideoIndex} autoPlay loop muted playsInline style={styles.backgroundVideo} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
              <source src={videos[currentVideoIndex]} type="video/mp4" />
            </motion.video>
          </AnimatePresence>
          <div style={styles.videoIndicator}>
            {videos.map((_, index) => (
              <div key={index} style={{ ...styles.videoDot, ...(currentVideoIndex === index ? styles.videoDotActive : {}) }} onClick={() => setCurrentVideoIndex(index)} />
            ))}
          </div>
        </div>
        <div style={styles.engagementsContent}>
          <h2 style={styles.sectionTitleWhite}>{t.engagementsTitle}</h2>
          <p style={styles.sectionSubtitleWhite}>{t.engagementsSubtitle}</p>
          <div style={styles.engagementsGrid}>
            {engagements.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={styles.engagementCardVideo}>
                <div style={styles.engagementIcon}>{item.icon}</div>
                <h3 style={styles.engagementTitle}>{item.title}</h3>
                <p style={styles.engagementDesc}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ SECTION NOUVEAUTÉS - 15 derniers produits avec correction image */}
      {newProducts.length > 0 && (
        <section style={styles.newProductsSection}>
          <div style={styles.newProductsHeader}>
            <h2 style={styles.sectionTitleDark}>{t.newProductsTitle}</h2>
            <p style={styles.sectionSubtitleDark}>{t.newProductsSubtitle}</p>
          </div>
          <div style={styles.newProductsGrid}>
            {newProducts.map((product) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={styles.newProductCard}>
                <div style={styles.newProductImageContainer}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} style={styles.newProductImage} />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#0A4D8C',
                      color: 'white',
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                    }}>
                      {product.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div style={styles.newProductBadge}>NEW</div>
                </div>
                <h3 style={styles.newProductName}>{product.name}</h3>
                <p style={styles.newProductDesc}>{product.description?.substring(0, 80)}...</p>
                {product.price && <p style={styles.newProductPrice}>{product.price} €</p>}
                <Link to={`/product/${product.slug || product.id}`} className="btn-secondary" style={{ marginTop: '10px', display: 'inline-block' }}>Voir le produit →</Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ✅ SECTION BLOG - 9 derniers articles */}
      {blogPosts.length > 0 && (
        <section style={styles.blogSection}>
          <div style={styles.blogContainer}>
            <div style={styles.blogHeader}>
              <h2 style={styles.sectionTitleDark}>📝 Derniers articles du blog</h2>
              <p style={styles.sectionSubtitleDark}>Actualités, conseils et innovations médicales</p>
            </div>
            <div style={styles.blogGrid}>
              {blogPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  style={styles.blogCard}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div style={styles.blogImageWrapper}>
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        style={styles.blogImageStyled}
                        onError={(e) => { e.target.src = '/placeholder.png'; }}
                      />
                    ) : (
                      <div style={styles.blogImagePlaceholder}>
                        <span>📰</span>
                      </div>
                    )}
                    <div style={styles.blogDateBadge}>
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date non définie'}
                    </div>
                  </div>
                  <div style={styles.blogContentStyled}>
                    <div style={styles.blogMetaStyled}>
                      <span style={styles.blogAuthorStyled}>👤 {post.author || 'Andremed'}</span>
                      <span style={styles.blogCategoryStyled}>📂 {post.category || 'Actualités'}</span>
                    </div>
                    <h3 style={styles.blogTitleStyled}>{post.title}</h3>
                    <p style={styles.blogExcerptStyled}>
                      {post.excerpt?.substring(0, 100) || post.content?.substring(0, 100) || 'Découvrez cet article sur notre blog...'}
                    </p>
                    <Link to={`/blog/${post.slug || post.id}`} style={styles.blogReadMoreStyled}>
                      Lire la suite <span style={styles.blogArrowStyled}>→</span>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            <div style={styles.blogFooter}>
              <Link to="/blog" className="btn-primary-shop" style={styles.blogViewAllBtn}>
                📖 Voir tous les articles
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ✅ SECTION ACTUALITÉS & PROMOTIONS (CORRIGÉE) */}
      <section style={styles.newsSection}>
        <div style={styles.newsHeader}>
          <h2 style={styles.sectionTitleDark}>📢 Actualités & Promotions</h2>
          <p style={styles.sectionSubtitleDark}>Ne manquez pas nos offres et événements</p>
        </div>
        <div style={styles.newsGrid}>
          {!loading && newsItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card"
              style={{
                ...styles.newsCard,
                cursor: 'pointer',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
              onClick={() => {
                window.location.href = item.product_link || '/shop';
              }}
            >
              {item.image_url && (
                <div style={styles.newsImageContainer}>
                  <img src={item.image_url} alt={item.title} style={styles.newsImage} />
                </div>
              )}
              <div style={styles.newsIcon}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} style={styles.newsIconImage} />
                ) : (
                  <span style={styles.newsIconEmoji}>{item.icon}</span>
                )}
              </div>
              <h3 style={styles.newsTitle}>{item.title}</h3>
              <p style={styles.newsDesc}>{item.description}</p>
              <div style={styles.newsDate}>
                📅 {item.date_published ? new Date(item.date_published).toLocaleDateString('fr-FR') : item.date}
              </div>
              {item.product_link && (
                <Link
                  to={item.product_link}
                  className="btn-secondary"
                  style={styles.newsBtn}
                  onClick={(e) => e.stopPropagation()}
                >
                  En savoir plus →
                </Link>
              )}
            </motion.div>
          ))}
          {loading && <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement des actualités...</p>}
        </div>
      </section>

      <section style={styles.newsletterSection}>
        <div style={styles.newsletterCard}>
          <h2 style={styles.newsletterTitle}>📧 Restez informés</h2>
          <p style={styles.newsletterText}>
            Inscrivez-vous à notre newsletter pour recevoir nos actualités, promotions et événements exclusifs.
          </p>
          <form onSubmit={handleNewsletterSubmit} style={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Votre adresse email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              style={styles.newsletterInput}
              autoComplete="off"
            />
            <button type="submit" className="btn-primary-shop" style={styles.newsletterBtn}>
              S'inscrire
            </button>
          </form>
          {newsletterStatus && <p style={styles.newsletterStatus}>{newsletterStatus}</p>}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button onClick={() => setShowBulkModal(true)} className="btn-secondary" style={{ background: '#0A4D8C', color: 'white' }}>
              📢 Envoyer une info à tous les abonnés (Admin)
            </button>
          </div>
        </div>
      </section>

      <section style={styles.supportSection}>
        <div className="glass-card" style={styles.supportCard}>
          <h2 style={styles.supportTitle}>🤝 Nous soutenir</h2>
          <p style={styles.supportText}>
            Vous souhaitez faire un don, établir un partenariat ou nous aider autrement ? Remplissez ce formulaire, nous vous répondrons rapidement.
          </p>
          <button onClick={() => setShowSupportModal(true)} className="btn-primary-shop" style={styles.supportBtn}>📢 Je soutiens Andremed</button>
        </div>
      </section>

      {showSupportModal && (
        <div style={styles.supportModal} onClick={() => setShowSupportModal(false)}>
          <div style={styles.supportModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.supportModalHeader}>
              <h3>🤝 Soutenir Andremed</h3>
              <button style={styles.supportModalClose} onClick={() => setShowSupportModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSupportSubmit} style={styles.supportForm}>
              <select value={supportForm.type} onChange={(e) => setSupportForm({ ...supportForm, type: e.target.value })} style={styles.supportSelect}>
                <option value="don">💝 Faire un don</option>
                <option value="partenariat">🤝 Devenir partenaire</option>
                <option value="autre">📝 Autre forme de soutien</option>
              </select>
              <div style={styles.supportFormRow}>
                <input type="text" placeholder="Prénom *" value={supportForm.firstName} onChange={(e) => setSupportForm({ ...supportForm, firstName: e.target.value })} required style={styles.supportInput} />
                <input type="text" placeholder="Nom" value={supportForm.lastName} onChange={(e) => setSupportForm({ ...supportForm, lastName: e.target.value })} style={styles.supportInput} />
              </div>
              <input type="email" placeholder="Email *" value={supportForm.email} onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })} required style={styles.supportInput} />
              <input type="tel" placeholder="Téléphone" value={supportForm.phone} onChange={(e) => setSupportForm({ ...supportForm, phone: e.target.value })} style={styles.supportInput} />
              {supportForm.type === 'don' && (
                <input type="number" placeholder="Montant (€)" value={supportForm.amount} onChange={(e) => setSupportForm({ ...supportForm, amount: e.target.value })} style={styles.supportInput} />
              )}
              <textarea placeholder="Votre message (optionnel)" rows="4" value={supportForm.message} onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })} style={styles.supportTextarea} />
              <button type="submit" style={styles.supportSubmitBtn} disabled={supportSending}>{supportSending ? 'Envoi...' : 'Envoyer'}</button>
              {supportStatus && <p style={supportStatus.includes('✅') ? styles.supportSuccess : styles.supportError}>{supportStatus}</p>}
            </form>
          </div>
        </div>
      )}

      <motion.section style={styles.mapSectionVideo} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
        <div style={styles.mapVideoBackground}>
          <video autoPlay loop muted playsInline style={styles.mapBackgroundVideo}>
            <source src="/T1.mp4" type="video/mp4" />
          </video>
          <div style={styles.mapVideoOverlay}></div>
        </div>
        <div style={styles.mapContent}>
          <h2 style={styles.sectionTitleWhite}>{t.mapTitle}</h2>
          <p style={styles.sectionSubtitleWhite}>{t.mapSubtitle}</p>
          <div className="glass-card" style={styles.mapContainerVideo}>
            <div style={styles.mapPlaceholder}>
              <div style={styles.mapAnimation}>
                <div style={styles.pulseDot}></div>
                <div style={styles.pulseRing}></div>
              </div>
              <p style={styles.mapInfoVideo}>🚚 {t.mapInfo} - {citiesList.length} villes desservies</p>
              <div style={styles.citiesGridContainer}>
                <div style={styles.citiesGrid}>
                  {!loading && citiesList.map((city, idx) => (
                    <div key={city.id || idx} style={styles.cityTagVideo}>
                      <span style={styles.cityIcon}>📍</span>
                      <span style={styles.cityName}>{city.city_name}</span>
                    </div>
                  ))}
                  {loading && <p>Chargement des villes...</p>}
                </div>
              </div>
              <div style={styles.deliveryBadge}>📦 Livraison express partout en RDC - {citiesList.length} villes couvertes</div>
            </div>
          </div>
        </div>
      </motion.section>

      <section style={styles.shopCtaSection}>
        <div style={styles.shopCtaCard}>
          <div style={styles.shopCtaIcon}>🛒</div>
          <h2 style={styles.shopCtaTitle}>{t.shopCtaTitle}</h2>
          <p style={styles.shopCtaText}>{t.shopCtaText}</p>
          <div style={styles.shopCtaButtons}>
            <Link to="/shop" className="btn-primary-shop" style={{ zIndex: 10, position: 'relative' }}>{t.shopCtaBtn1}</Link>
            <Link to="/shop" className="btn-secondary" style={{ zIndex: 10, position: 'relative' }}>{t.shopCtaBtn2}</Link>
          </div>
          <div style={styles.shopStats}>
            {t.shopStats.map((stat, i) => (<span key={i}>{stat}</span>))}
          </div>
        </div>
      </section>

      <motion.section style={styles.realisationsSection} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
        <div style={styles.realisationsVideoBackground}>
          <AnimatePresence mode="wait">
            <motion.video key={currentRealisationVideoIndex} autoPlay loop muted playsInline style={styles.realisationsBgVideo} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
              <source src={realisationVideos[currentRealisationVideoIndex]} type="video/mp4" />
            </motion.video>
          </AnimatePresence>
          <div style={styles.realisationsVideoIndicator}>
            {realisationVideos.map((_, idx) => (
              <div key={idx} style={{ ...styles.videoDot, ...(currentRealisationVideoIndex === idx ? styles.videoDotActive : {}) }} onClick={() => setCurrentRealisationVideoIndex(idx)} />
            ))}
          </div>
        </div>
        <div style={styles.realisationsContent}>
          <h2 style={styles.sectionTitleWhite}>{t.realisationsTitle}</h2>
          <p style={styles.sectionSubtitleWhite}>{t.realisationsSubtitle}</p>
          <div style={styles.autoRotateControl}>
            <label style={styles.autoRotateLabel}>
              <input type="checkbox" checked={autoRotate} onChange={() => setAutoRotate(!autoRotate)} style={styles.autoRotateCheckbox} />
              {t.autoRotateLabel}
            </label>
          </div>
          <div style={styles.projectFilters}>
            {Object.keys(projectsData).map((key) => (
              <motion.button
                key={key}
                className={activeProject === key ? 'filter-btn active' : 'filter-btn'}
                style={{
                  ...styles.filterButton,
                  background: activeProject === key ? 'linear-gradient(135deg, #0A4D8C, #00A3B2)' : 'rgba(255,255,255,0.9)',
                  color: activeProject === key ? 'white' : '#0A4D8C',
                  border: activeProject === key ? 'none' : '1px solid rgba(10,77,140,0.3)'
                }}
                onClick={() => setActiveProject(key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {projectsData[key].label}
              </motion.button>
            ))}
          </div>
          <motion.div key={activeProject} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={styles.galleryGrid}>
            {projectsData[activeProject].images.map((imgName, idx) => (
              <motion.div key={idx} style={styles.galleryItem} whileHover={{ scale: 1.03, rotate: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                <img src={`/${imgName}`} alt={`${projectsData[activeProject].label} - ${idx+1}`} style={styles.galleryImage} onError={(e) => { e.target.src = '/placeholder.png'; }} />
                <div style={styles.galleryOverlay}>
                  <span style={styles.galleryBadge}>{projectsData[activeProject].label}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <section style={styles.temoignagesSection}>
        <h2 style={styles.sectionTitle}>{t.temoignagesTitle}</h2>
        <p style={styles.sectionSubtitle}>{t.temoignagesSubtitle}</p>
        <div style={styles.temoignagesGrid}>
          {testimonials.map((temoignage, i) => (
            <motion.div key={temoignage.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={styles.temoignageCard}>
              <div style={styles.temoignagePhotoContainer}>
                {temoignage.photo_url ? (
                  <img
                    src={temoignage.photo_url}
                    alt={temoignage.name}
                    style={styles.temoignagePhoto}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      const initials = temoignage.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                      const parent = e.target.parentElement;
                      parent.style.display = 'flex';
                      parent.style.alignItems = 'center';
                      parent.style.justifyContent = 'center';
                      parent.style.backgroundColor = '#0A4D8C';
                      parent.style.color = 'white';
                      parent.style.fontSize = '1.5rem';
                      parent.style.fontWeight = 'bold';
                      parent.innerText = initials;
                    }}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#0A4D8C',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    borderRadius: '50%'
                  }}>
                    {temoignage.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div style={styles.temoignageStars}>⭐⭐⭐⭐⭐</div>
              <p style={styles.temoignageText}>"{temoignage.content}"</p>
              <h4 style={styles.temoignageName}>{temoignage.name}</h4>
              <p style={styles.temoignageRole}>{temoignage.role}</p>
              <p style={styles.temoignageHospital}>{temoignage.hospital}, {temoignage.city}</p>
            </motion.div>
          ))}
          {testimonials.length === 0 && !loading && <p>Aucun témoignage pour le moment.</p>}
        </div>
      </section>

      <motion.section style={styles.ctaSection} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
        <div style={styles.ctaCard}>
          <h2 style={styles.ctaTitle}>{t.ctaTitle}</h2>
          <p style={styles.ctaText}>{t.ctaText}</p>
          <div style={styles.ctaButtons}>
            <Link to="/shop" className="btn-primary-shop" style={{ zIndex: 10 }}>{t.ctaBtn1}</Link>
            <button onClick={() => setShowQuoteModal(true)} className="btn-secondary" style={{ cursor: 'pointer', zIndex: 10 }}>{t.ctaBtn2}</button>
            <Link to="/realisations" className="btn-secondary" style={{ zIndex: 10 }}>{t.ctaBtn3}</Link>
          </div>
        </div>
      </motion.section>

      <footer className="custom-footer" style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerTitle}>About Us</h3>
            <ul style={styles.footerList}>
              <li><Link to="/about#company-overview">Company Overview</Link></li>
              <li><Link to="/about#video">Andremed Introduction Video</Link></li>
              <li><Link to="/about#certifications">Certifications</Link></li>
              <li><Link to="/about#exhibitions">Exhibitions</Link></li>
              <li><Link to="/about#mission">Our Mission</Link></li>
              <li><Link to="/about#vision">Our Vision</Link></li>
              <li><Link to="/about#values">Our Values</Link></li>
              <li><Link to="/about#history">Our History</Link></li>
              <li><Link to="/about#team">Leadership Team</Link></li>
              <li><Link to="/about#partners">Partners</Link></li>
            </ul>
          </div>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerTitle}>Products</h3>
            <ul style={styles.footerList}>
              <li><Link to="/shop?category=imaging">Imaging system equipment</Link></li>
              <li><Link to="/shop?category=laboratory">Laboratory equipment</Link></li>
              <li><Link to="/shop?category=gynecology">Gynecology & Obstetrics</Link></li>
              <li><Link to="/shop?category=operation">Operation room equipment</Link></li>
              <li><Link to="/shop?category=dental">Eye/Dental/ENT</Link></li>
              <li><Link to="/shop?category=monitoring">Patient Monitoring</Link></li>
              <li><Link to="/shop?category=ventilators">Ventilators & Anesthesia</Link></li>
              <li><Link to="/shop?category=sterilization">Sterilization Equipment</Link></li>
              <li><Link to="/shop?category=furniture">Hospital Furniture</Link></li>
              <li><Link to="/shop?category=consumables">Medical Consumables</Link></li>
            </ul>
          </div>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerTitle}>Resource Center</h3>
            <ul style={styles.footerList}>
              <li><Link to="/catalog">Product catalogue</Link></li>
              <li><Link to="/videos">Product video</Link></li>
              <li><Link to="/downloads">Download</Link></li>
              <li><Link to="/blog">Blog & News</Link></li>
              <li><Link to="/case-studies">Case Studies</Link></li>
              <li><Link to="/whitepapers">Whitepapers</Link></li>
              <li><Link to="/webinars">Webinars</Link></li>
              <li><Link to="/brochures">Brochures</Link></li>
              <li><Link to="/manuals">User Manuals</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerTitle}>Member</h3>
            <ul style={styles.footerList}>
              <li><Link to="/member/create-account">Create an Account</Link></li>
              <li><Link to="/member/change-account">Change Account</Link></li>
              <li><Link to="/member/wishlist">WishList</Link></li>
              <li><Link to="/member/order-tracking">Order Tracking</Link></li>
              <li><Link to="/member/login">Login / Sign in</Link></li>
              <li><Link to="/member/reset-password">Reset Password</Link></li>
              <li><Link to="/member/profile">My Profile</Link></li>
              <li><Link to="/member/addresses">My Addresses</Link></li>
              <li><Link to="/member/newsletter-settings">Newsletter Settings</Link></li>
              <li><Link to="/member/notification-settings">Notification Settings</Link></li>
            </ul>
          </div>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerTitle}>Services & Support</h3>
            <ul style={styles.footerList}>
              <li><Link to="/services">Our Services</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/help">Help center</Link></li>
              <li><Link to="/join">Join us</Link></li>
              <li><Link to="/technical-support">Technical Support</Link></li>
              <li><Link to="/training">Training Programs</Link></li>
              <li><Link to="/maintenance">Maintenance Services</Link></li>
              <li><Link to="/warranty">Warranty Information</Link></li>
              <li><Link to="/returns">Returns & Refunds</Link></li>
              <li><Link to="/feedback">Customer Feedback</Link></li>
            </ul>
          </div>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerTitle}>Contact</h3>
            <ul style={styles.footerList}>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/support">Customer Support</Link></li>
              <li><Link to="/sales">Sales Inquiries</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/press">Press & Media</Link></li>
              <li><Link to="/legal">Legal Notice</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/sitemap">Sitemap</Link></li>
              <li><Link to="/accessibility">Accessibility</Link></li>
            </ul>
            <div style={styles.socialLinks}>
              <a href={settings.facebook_url || "https://facebook.com"} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                <img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png" alt="Facebook" style={{ width: '28px', height: '28px' }} />
              </a>
              <a href={settings.linkedin_url || "https://linkedin.com"} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" alt="LinkedIn" style={{ width: '28px', height: '28px' }} />
              </a>
              <a href={settings.tiktok_url || "https://tiktok.com"} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                <img src="https://cdn-icons-png.flaticon.com/512/3046/3046126.png" alt="TikTok" style={{ width: '28px', height: '28px' }} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style={{ width: '28px', height: '28px' }} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style={{ width: '28px', height: '28px' }} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" style={{ width: '28px', height: '28px' }} />
              </a>
            </div>
          </div>
          {/* NOUVELLE COLONNE INFORMATIONS AVEC LES EMAILS */}
          <div style={styles.footerColumn}>
            <h3 style={styles.footerTitle}>Informations</h3>
            <ul style={styles.footerList}>
              <li><a href="mailto:contact@andremed.org" style={{ color: '#FFD166', textDecoration: 'none' }}>📧 contact@andremed.org</a> (Général)</li>
              <li><a href="mailto:supporttechn.log@andremed.org" style={{ color: '#FFD166', textDecoration: 'none' }}>📦 supporttechn.log@andremed.org</a> (Commandes & Livraison)</li>
              <li><a href="mailto:admin.finance@andremed.org" style={{ color: '#FFD166', textDecoration: 'none' }}>💰 admin.finance@andremed.org</a> (Administration & Finance)</li>
              <li><a href="mailto:andre.kabe@andremed.org" style={{ color: '#FFD166', textDecoration: 'none' }}>👔 andre.kabe@andremed.org</a> (Direction)</li>
            </ul>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <div style={styles.footerBottomLinks}>
            <Link to="/">Home</Link> | <Link to="/about">About us</Link> | <Link to="/blog">Blog</Link> | <Link to="/contact">Contact us</Link> | GlobalMind.MK.Innotech
          </div>
          <div style={styles.paymentIcons}>
            <span>MobileMoney</span> <span>FedEx</span> <span>TNT</span> <span>EMS</span> <span>VISA</span> <span>MasterCard</span> <span>PayPal</span>
          </div>
          <div style={styles.copyright}>
            Copyright © 2017 Andremed Medical . All Rights Reserved.
          </div>
        </div>
      </footer>

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

      {showBulkModal && (
        <div style={styles.quoteModal} onClick={() => setShowBulkModal(false)}>
          <div style={styles.quoteModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.quoteModalHeader}>
              <h3>📢 Envoyer une communication à tous les abonnés</h3>
              <button style={styles.quoteModalClose} onClick={() => setShowBulkModal(false)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <p><strong>Nombre d'abonnés :</strong> {subscribedEmails.length}</p>
              <input type="password" placeholder="Mot de passe administrateur" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} style={styles.quoteInput} />
              <input type="text" placeholder="Sujet de l'email" value={bulkSubject} onChange={(e) => setBulkSubject(e.target.value)} style={styles.quoteInput} />
              <textarea placeholder="Votre message (HTML accepté)" rows="6" value={bulkMessage} onChange={(e) => setBulkMessage(e.target.value)} style={styles.quoteTextarea} />
              <button onClick={handleBulkSend} disabled={bulkSending} style={styles.quoteSubmitBtn}>
                {bulkSending ? 'Envoi en cours...' : 'Envoyer à tous'}
              </button>
              {bulkStatus && <p style={{ marginTop: '15px', fontSize: '0.9rem', color: bulkStatus.includes('✅') ? '#2E7D32' : '#B41E1E' }}>{bulkStatus}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ========== STYLES COMPLETS ==========
const styles = {
  chatButton: {
    position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000,
    background: 'linear-gradient(135deg, #25D366, #128C7E)', borderRadius: '50px',
    padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'transform 0.3s ease',
    border: 'none', color: 'white', fontWeight: 'bold'
  },
  chatIcon: { fontSize: '1.5rem' },
  chatText: { fontSize: '0.9rem' },
  chatModal: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000, animation: 'fadeIn 0.3s ease'
  },
  chatModalContent: {
    backgroundColor: 'white', borderRadius: '20px', width: '90%', maxWidth: '450px',
    height: '70%', maxHeight: '600px', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden'
  },
  chatModalHeader: {
    background: 'linear-gradient(135deg, #0A4D8C, #00A3B2)', padding: '15px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', flexShrink: 0
  },
  chatModalTitle: { margin: 0, fontSize: 'clamp(1rem, 5vw, 1.2rem)' },
  chatCloseBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', padding: '5px' },
  chatMessagesArea: { flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f5f5f5' },
  chatEmptyState: { textAlign: 'center', padding: '40px 20px', color: '#666' },
  chatEmptySubtext: { fontSize: '0.8rem', marginTop: '10px', color: '#999' },
  chatMessage: { maxWidth: '80%', padding: '10px 12px', borderRadius: '15px', position: 'relative', wordBreak: 'break-word' },
  chatMessageUser: { alignSelf: 'flex-end', backgroundColor: '#0A4D8C', color: 'white', borderBottomRightRadius: '5px' },
  chatMessageSupport: { alignSelf: 'flex-start', backgroundColor: 'white', color: '#333', borderBottomLeftRadius: '5px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
  chatMessageHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '5px', opacity: 0.8 },
  chatMessageSender: { fontWeight: 'bold' },
  chatMessageTime: { fontSize: '0.65rem' },
  messageStatus: { fontSize: '0.6rem', textAlign: 'right', marginTop: '3px', opacity: 0.7 },
  messageStatusDelivered: { fontSize: '0.6rem', textAlign: 'right', marginTop: '3px', color: '#25D366' },
  waitingIndicator: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: 'white', borderRadius: '15px', alignSelf: 'flex-start', marginTop: '5px' },
  typingDots: { fontSize: '1.2rem', letterSpacing: '2px', color: '#0A4D8C' },
  waitingText: { fontSize: '0.75rem', color: '#666' },
  chatInputArea: { padding: '15px', borderTop: '1px solid #eee', backgroundColor: 'white', flexShrink: 0 },
  chatInputName: { width: '100%', padding: '10px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '20px', fontSize: '0.85rem', boxSizing: 'border-box' },
  chatInputEmail: { width: '100%', padding: '10px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '20px', fontSize: '0.85rem', boxSizing: 'border-box' },
  chatInputWrapper: { display: 'flex', gap: '8px', alignItems: 'flex-end' },
  chatTextarea: { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '20px', fontSize: '0.9rem', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  chatSendBtn: { background: 'linear-gradient(135deg, #25D366, #128C7E)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s ease' },
  chatSuccess: { color: '#2E7D32', fontSize: '0.75rem', marginTop: '8px', textAlign: 'center' },
  chatError: { color: '#B41E1E', fontSize: '0.75rem', marginTop: '8px', textAlign: 'center' },
  langSelectorContainer: { position: 'fixed', top: '20px', right: '20px', zIndex: 1000, fontFamily: 'sans-serif' },
  langSelector: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '40px', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', transition: 'all 0.3s ease', border: '1px solid rgba(10,77,140,0.2)' },
  langFlag: { fontSize: '1.2rem' }, langName: { fontSize: '0.9rem', color: '#0A4D8C', fontWeight: '500' }, langArrow: { fontSize: '0.7rem', color: '#0A4D8C' },
  langMenu: { position: 'absolute', top: '50px', right: '0', background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(10px)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 1001, border: '1px solid rgba(10,77,140,0.2)' },
  langMenuItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', cursor: 'pointer', transition: 'background 0.2s ease', minWidth: '120px' },
  langMenuItemActive: { background: 'rgba(10,77,140,0.1)' },
  hero: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  heroBackground: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 },
  heroBgImage: { width: '100%', height: '100%', objectFit: 'cover' },
  leftCarousel: { position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: '110px', height: '450px', overflow: 'hidden', borderRadius: '12px' },
  rightCarousel: { position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: '110px', height: '450px', overflow: 'hidden', borderRadius: '12px' },
  carouselTrack: { display: 'flex', flexDirection: 'column', gap: '10px', willChange: 'transform' },
  carouselImage: { width: '100%', height: '90px', overflow: 'hidden', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', position: 'relative', flexShrink: 0 },
  carouselImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '25px', background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', borderRadius: '0 0 10px 10px' },
  heroContent: { textAlign: 'center', zIndex: 2, padding: '1rem', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
  titleMainContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '0.5rem' },
  logoImage: { height: '70px', width: 'auto', borderRadius: '12px', objectFit: 'contain' },
  titleWrapper: { textAlign: 'center' },
  titleBackground: { background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '15px', padding: '8px 20px', margin: '5px 0', display: 'inline-block', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
  title: { fontSize: 'clamp(1.2rem, 5vw, 2rem)', fontWeight: 'bold', color: '#0A4D8C', margin: 0, lineHeight: '1.2' },
  titleAccent: { background: 'linear-gradient(135deg, #2E7D32, #4CAF50)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  titleDiagnostics: { fontSize: 'clamp(1rem, 4vw, 1.6rem)', fontWeight: 'bold', color: '#0A4D8C', margin: 0 },
  titleMedical: { fontSize: 'clamp(0.8rem, 3vw, 1.1rem)', color: '#2E7D32', letterSpacing: '3px', margin: 0, fontWeight: 'bold' },
  statsGrid: { display: 'flex', justifyContent: 'center', gap: 'clamp(0.5rem, 2vw, 1.2rem)', marginBottom: '1.5rem', flexWrap: 'wrap' },
  statCard: { textAlign: 'center', padding: '1rem', minWidth: '120px', background: 'rgba(255,255,255,0.95)', borderRadius: '20px', backdropFilter: 'blur(10px)', transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '150px' },
  statIcon: { fontSize: '2rem', marginBottom: '0.3rem' },
  statImage: { width: '55px', height: '55px', objectFit: 'contain', marginBottom: '0.5rem', marginLeft: 'auto', marginRight: 'auto' },
  statNumber: { fontSize: 'clamp(1rem, 4vw, 1.5rem)', fontWeight: 'bold' },
  statLabel: { fontSize: '0.7rem', color: '#2c3e50' },
  statShopHint: { fontSize: '0.6rem', color: '#FF9800', marginTop: '5px', opacity: 0.8 },
  buttons: { display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' },
  messagesContainer: { marginTop: '1.5rem', textAlign: 'center', width: '100%' },
  messagesTitleContainer: { display: 'inline-block', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '50px', padding: '12px 30px', marginBottom: '1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
  messagesTitle: { fontSize: 'clamp(1rem, 4vw, 1.6rem)', fontWeight: 'bold', color: '#0A4D8C', margin: 0, letterSpacing: '2px', textTransform: 'uppercase' },
  messagesBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', background: 'rgba(255,255,255,0.95)', padding: 'clamp(10px, 3vw, 18px) clamp(15px, 5vw, 35px)', borderRadius: '70px', backdropFilter: 'blur(20px)', width: 'fit-content', margin: '0 auto', border: '2px solid rgba(10,77,140,0.3)', boxShadow: '0 0 30px rgba(10,77,140,0.2)' },
  messagesIcon: { fontSize: '1.5rem', filter: 'drop-shadow(0 0 8px #0A4D8C)' },
  messagesTextWrapper: { display: 'flex', alignItems: 'center', gap: '5px' },
  messagesText: { fontSize: 'clamp(0.9rem, 3vw, 1.3rem)', fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', letterSpacing: '1px', minWidth: 'auto' },
  messagesCursor: { fontSize: '1.5rem', color: '#0A4D8C', fontWeight: 'bold' },
  engagementsSection: { padding: '70px 20px', position: 'relative', overflow: 'hidden', minHeight: '500px', display: 'flex', alignItems: 'center' },
  videoBackground: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 },
  backgroundVideo: { position: 'absolute', top: '50%', left: '50%', minWidth: '100%', minHeight: '100%', width: 'auto', height: 'auto', transform: 'translateX(-50%) translateY(-50%)', objectFit: 'cover' },
  videoIndicator: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 3 },
  videoDot: { width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.3s ease' },
  videoDotActive: { width: '30px', borderRadius: '10px', background: '#FFD166' },
  engagementsContent: { position: 'relative', zIndex: 2, width: '100%', maxWidth: '1200px', margin: '0 auto' },
  sectionTitleWhite: { fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: 'white', marginBottom: '1rem', textAlign: 'center', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' },
  sectionSubtitleWhite: { fontSize: 'clamp(0.8rem, 3vw, 1rem)', color: 'rgba(255,255,255,0.95)', marginBottom: '3rem', textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' },
  engagementsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.8rem', maxWidth: '1100px', margin: '0 auto' },
  engagementCardVideo: { padding: '1.8rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' },
  engagementIcon: { fontSize: '2.2rem', marginBottom: '0.6rem' },
  engagementTitle: { color: '#0A4D8C', marginBottom: '0.5rem', fontSize: 'clamp(1rem, 3vw, 1.1rem)' },
  engagementDesc: { color: '#4a5568', fontSize: '0.9rem' },
  newProductsSection: { padding: '60px 20px', background: '#f8f9fa', textAlign: 'center' },
  newProductsHeader: { maxWidth: '800px', margin: '0 auto 2rem' },
  newProductsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' },
  newProductCard: { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', transition: 'transform 0.3s', padding: '1rem' },
  newProductImageContainer: { position: 'relative', paddingTop: '75%', overflow: 'hidden', borderRadius: '12px' },
  newProductImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
  newProductBadge: { position: 'absolute', top: '10px', right: '10px', background: '#FF9800', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' },
  newProductName: { fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', margin: '0.8rem 0 0.3rem', color: '#0A4D8C' },
  newProductDesc: { fontSize: '0.85rem', color: '#6C757D' },
  newProductPrice: { fontSize: '1rem', fontWeight: 'bold', color: '#2E7D32', margin: '0.5rem 0' },
  newsSection: { padding: '60px 20px', background: '#f0f4f8', textAlign: 'center' },
  newsHeader: { maxWidth: '800px', margin: '0 auto 3rem' },
  sectionTitleDark: { fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', color: '#0A4D8C', marginBottom: '1rem' },
  sectionSubtitleDark: { fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', color: '#6C757D' },
  newsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' },
  newsCard: { padding: '2rem', background: 'white', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', textAlign: 'left', transition: 'transform 0.3s' },
  newsImageContainer: { width: '100%', height: '180px', overflow: 'hidden', borderRadius: '12px', marginBottom: '1rem' },
  newsImage: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' },
  newsIcon: { marginBottom: '1rem' },
  newsIconImage: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '12px' },
  newsIconEmoji: { fontSize: '2.5rem' },
  newsTitle: { fontSize: 'clamp(1rem, 3vw, 1.3rem)', color: '#0A4D8C', marginBottom: '0.5rem', wordBreak: 'break-word' },
  newsDesc: { fontSize: '0.9rem', color: '#6C757D', marginBottom: '1rem', wordBreak: 'break-word' },
  newsDate: { fontSize: '0.8rem', color: '#999', marginBottom: '1rem' },
  newsBtn: { display: 'inline-block', marginTop: '0.5rem' },
  newsletterSection: { padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #0A4D8C, #00A3B2)', position: 'relative', zIndex: 1 },
  newsletterCard: { maxWidth: '700px', margin: '0 auto', padding: 'clamp(1.5rem, 5vw, 3rem)', background: 'white', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10 },
  newsletterTitle: { fontSize: 'clamp(1.2rem, 5vw, 2rem)', color: '#0A4D8C', marginBottom: '1rem' },
  newsletterText: { fontSize: 'clamp(0.8rem, 3vw, 1rem)', color: '#6C757D', marginBottom: '2rem' },
  newsletterForm: { display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 20 },
  newsletterInput: { flex: 1, minWidth: '250px', padding: '12px 20px', borderRadius: '50px', border: '1px solid #ddd', fontSize: '1rem', backgroundColor: '#fff', color: '#000', outline: 'none', transition: 'all 0.3s ease', zIndex: 30, position: 'relative', pointerEvents: 'auto' },
  newsletterBtn: { padding: '12px 30px' },
  newsletterStatus: { marginTop: '1rem', fontSize: '0.9rem', color: '#2E7D32' },
  supportSection: { padding: '60px 20px', textAlign: 'center', background: '#f8f9fa' },
  supportCard: { maxWidth: '800px', margin: '0 auto', padding: '3rem', background: 'white', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  supportTitle: { fontSize: 'clamp(1.2rem, 5vw, 2rem)', color: '#0A4D8C', marginBottom: '1rem' },
  supportText: { fontSize: 'clamp(0.8rem, 3vw, 1rem)', color: '#6C757D', marginBottom: '2rem', lineHeight: '1.6' },
  supportBtn: { padding: '12px 30px', fontSize: '1rem' },
  supportModal: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6000 },
  supportModalContent: { background: 'white', borderRadius: '20px', width: '90%', maxWidth: '550px', maxHeight: '85vh', overflow: 'auto' },
  supportModalHeader: { background: 'linear-gradient(135deg, #0A4D8C, #00A3B2)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' },
  supportModalClose: { background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' },
  supportForm: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  supportFormRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  supportSelect: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', width: '100%' },
  supportInput: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  supportTextarea: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  supportSubmitBtn: { background: '#0A4D8C', color: 'white', border: 'none', padding: '12px', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },
  supportSuccess: { color: '#2E7D32', textAlign: 'center', marginTop: '10px' },
  supportError: { color: '#B41E1E', textAlign: 'center', marginTop: '10px' },
  mapSectionVideo: { padding: '5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: '700px', display: 'flex', alignItems: 'center' },
  mapVideoBackground: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 },
  mapBackgroundVideo: { position: 'absolute', top: '50%', left: '50%', minWidth: '100%', minHeight: '100%', width: 'auto', height: 'auto', transform: 'translateX(-50%) translateY(-50%)', objectFit: 'cover' },
  mapVideoOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(10,77,140,0.7), rgba(0,163,178,0.7))', zIndex: 1 },
  mapContent: { position: 'relative', zIndex: 2, width: '100%', maxWidth: '1200px', margin: '0 auto' },
  mapContainerVideo: { maxWidth: '1200px', margin: '0 auto', padding: '2rem', overflow: 'hidden', background: 'rgba(255,255,255,0.95)', borderRadius: '20px', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  mapPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  mapAnimation: { position: 'relative', marginBottom: '1.8rem' },
  pulseDot: { width: '18px', height: '18px', background: '#B41E1E', borderRadius: '50%', margin: '0 auto' },
  pulseRing: { position: 'absolute', top: '-14px', left: '-14px', width: '46px', height: '46px', background: 'rgba(180,30,30,0.3)', borderRadius: '50%', animation: 'pulse 2s infinite' },
  mapInfoVideo: { fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', color: '#0A4D8C', marginBottom: '1.5rem', fontWeight: 'bold' },
  citiesGridContainer: { width: '100%', marginBottom: '1.5rem', borderRadius: '15px', background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(10,77,140,0.2)', overflow: 'hidden' },
  citiesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto', padding: '1rem' },
  cityTagVideo: { background: 'linear-gradient(135deg, #0A4D8C, #00A3B2)', padding: '0.5rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', color: 'white', fontWeight: '500', textAlign: 'center', transition: 'transform 0.2s ease', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cityIcon: { fontSize: '0.7rem' }, cityName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  deliveryBadge: { background: '#FF9800', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '40px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block', marginTop: '0.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' },
  shopCtaSection: { padding: '70px 20px', background: 'linear-gradient(135deg, #FF9800, #FFC107)', textAlign: 'center' },
  shopCtaCard: { maxWidth: '850px', margin: '0 auto', padding: '2.5rem', background: 'rgba(255,255,255,0.95)', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
  shopCtaIcon: { fontSize: '3.5rem', marginBottom: '1rem' }, shopCtaTitle: { fontSize: 'clamp(1.2rem, 5vw, 1.8rem)', color: '#0A4D8C', marginBottom: '1rem' },
  shopCtaText: { fontSize: 'clamp(0.8rem, 3vw, 1rem)', color: '#4a5568', marginBottom: '1.8rem' },
  shopCtaButtons: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.8rem' },
  shopStats: { display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', paddingTop: '1.5rem', borderTop: '1px solid #eee' },
  realisationsSection: { padding: '70px 20px', position: 'relative', overflow: 'hidden', minHeight: '700px', display: 'flex', alignItems: 'center' },
  realisationsVideoBackground: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 },
  realisationsBgVideo: { position: 'absolute', top: '50%', left: '50%', minWidth: '100%', minHeight: '100%', width: 'auto', height: 'auto', transform: 'translateX(-50%) translateY(-50%)', objectFit: 'cover' },
  realisationsVideoIndicator: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 3 },
  realisationsContent: { position: 'relative', zIndex: 2, width: '100%', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' },
  autoRotateControl: { marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.8rem', alignItems: 'center' },
  autoRotateLabel: { background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', padding: '8px 18px', borderRadius: '40px', fontSize: '0.85rem', fontWeight: '500', color: '#0A4D8C', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' },
  autoRotateCheckbox: { width: '18px', height: '18px', cursor: 'pointer' },
  projectFilters: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.8rem', marginBottom: '2.5rem' },
  filterButton: { padding: '10px 20px', borderRadius: '40px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
  galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '1rem' },
  galleryItem: { position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', background: 'white', aspectRatio: '1 / 1', cursor: 'pointer' },
  galleryImage: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' },
  galleryOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', padding: '10px', textAlign: 'center' },
  galleryBadge: { background: 'rgba(255,193,7,0.9)', color: '#0A4D8C', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' },
  temoignagesSection: { padding: '70px 20px', background: '#ffffff', textAlign: 'center' },
  temoignagesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto' },
  temoignageCard: { padding: '2rem', background: 'white', borderRadius: '20px', textAlign: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' },
  temoignageStars: { fontSize: '1.2rem', marginBottom: '0.8rem', color: '#FFD166' },
  temoignageText: { fontSize: '0.9rem', color: '#4a5568', lineHeight: '1.5', marginBottom: '1rem', wordBreak: 'break-word' },
  temoignageRole: { fontSize: '0.8rem', color: '#6c757d' },
  temoignageHospital: { fontSize: '0.75rem', color: '#0A4D8C' },
  sectionTitle: { fontSize: 'clamp(1.2rem, 5vw, 2rem)', color: '#0A4D8C', marginBottom: '1rem', textAlign: 'center' },
  sectionSubtitle: { fontSize: 'clamp(0.8rem, 3vw, 1rem)', color: '#6c757d', marginBottom: '3rem', textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem' },
  footerTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#FFD166'
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  socialLinks: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
    flexWrap: 'wrap'
  },
  temoignagePhotoContainer: {
    width: '80px',
    height: '80px',
    margin: '0 auto 1rem',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid #0A4D8C',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
  },
  temoignagePhoto: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  temoignageName: {
    fontSize: '1rem',
    color: '#0A4D8C',
    marginBottom: '0.3rem',
    marginTop: '0.5rem'
  },
  blogSection: {
    padding: '70px 20px',
    background: '#f8f9fa',
    position: 'relative',
  },
  blogContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  blogHeader: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  blogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  },
  blogCard: {
    background: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
  },
  blogImageWrapper: {
    position: 'relative',
    height: '220px',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  blogImageStyled: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  blogImagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    fontSize: '3rem',
    color: '#999',
  },
  blogDateBadge: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    background: 'rgba(10,77,140,0.9)',
    padding: '5px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.7rem',
    fontWeight: '500',
  },
  blogContentStyled: {
    padding: '1.5rem',
  },
  blogMetaStyled: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.8rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  blogAuthorStyled: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  blogCategoryStyled: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#f0f4f8',
    padding: '3px 10px',
    borderRadius: '20px',
    color: '#0A4D8C',
  },
  blogTitleStyled: {
    fontSize: 'clamp(1rem, 3vw, 1.2rem)',
    color: '#0A4D8C',
    marginBottom: '0.8rem',
    lineHeight: '1.4',
    fontWeight: '600',
  },
  blogExcerptStyled: {
    fontSize: '0.85rem',
    color: '#6C757D',
    lineHeight: '1.5',
    marginBottom: '1.2rem',
  },
  blogReadMoreStyled: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    color: '#FF9800',
    fontSize: '0.85rem',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'gap 0.3s ease',
  },
  blogArrowStyled: {
    transition: 'transform 0.3s ease',
  },
  blogFooter: {
    textAlign: 'center',
    marginTop: '1rem',
  },
  blogViewAllBtn: {
    display: 'inline-block',
    padding: '12px 32px',
    fontSize: '1rem',
  },
  teamSection: { padding: '70px 20px', background: '#F8F9FA', textAlign: 'center' },
  teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' },
  teamCard: { background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', transition: 'transform 0.3s' },
  teamPhoto: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem', border: '4px solid #0A4D8C' },
  teamName: { fontSize: 'clamp(1rem, 3vw, 1.3rem)', color: '#0A4D8C', marginBottom: '0.3rem' },
  teamRole: { fontSize: '0.9rem', color: '#FF9800', fontWeight: 'bold', marginBottom: '0.5rem' },
  teamBio: { fontSize: '0.85rem', color: '#6C757D' },
  ctaSection: { padding: '5rem 2rem', textAlign: 'center' },
  ctaCard: { maxWidth: '750px', margin: '0 auto', padding: '2.5rem', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  ctaTitle: { fontSize: 'clamp(1.2rem, 5vw, 1.8rem)', marginBottom: '1rem', color: '#0A4D8C' },
  ctaText: { fontSize: 'clamp(0.8rem, 3vw, 1rem)', color: '#6C757D', marginBottom: '2rem' },
  ctaButtons: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  footer: {
    backgroundImage: 'url("/footer-bg.jpeg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    color: '#fff',
    padding: '50px 20px 20px'
  },
  footerContainer: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' },
  footerColumn: { display: 'flex', flexDirection: 'column', gap: '10px' },
  footerLogo: { height: '50px', width: 'auto', borderRadius: '10px', marginBottom: '10px' },
  footerDescription: { fontSize: '0.85rem', lineHeight: '1.5', color: 'rgba(255,255,255,0.9)' },
  footerContact: { fontSize: '0.85rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.9)' },
  footerBottom: { textAlign: 'center', paddingTop: '30px', marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' },
  footerBottomLinks: { marginBottom: '10px' },
  paymentIcons: { marginBottom: '10px' },
  copyright: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' },
  quoteModal: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000 },
  quoteModalContent: { background: 'white', borderRadius: '20px', width: '90%', maxWidth: '550px', maxHeight: '85vh', overflow: 'auto' },
  quoteModalHeader: { background: 'linear-gradient(135deg, #0A4D8C, #00A3B2)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' },
  quoteModalClose: { background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' },
  quoteForm: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  quoteFormRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  quoteInput: { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  quoteTextarea: { padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  quoteSubmitBtn: { background: '#0A4D8C', color: 'white', border: 'none', padding: '12px', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },
  quoteSuccess: { color: '#2E7D32', textAlign: 'center', marginTop: '10px' },
  quoteError: { color: '#B41E1E', textAlign: 'center', marginTop: '10px' },
  userMenu: { position: 'fixed', top: '20px', left: '20px', zIndex: 1000, background: 'white', padding: '8px 16px', borderRadius: '40px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontSize: '0.9rem', fontWeight: '500', color: '#0A4D8C' },
  logoutBtn: { background: '#B41E1E', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '30px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }
};

// ========== INJECTION CSS GLOBALE ==========
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  * { box-sizing: border-box; }
  body { overflow-x: hidden; margin: 0; padding: 0; }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .btn-primary-shop { background: linear-gradient(135deg, #FF9800, #FFC107); color: white; padding: 9px 24px; border-radius: 40px; text-decoration: none; font-weight: bold; font-size: 0.9rem; transition: all 0.3s ease; border: none; cursor: pointer; display: inline-block; box-shadow: 0 3px 12px rgba(255,152,0,0.3); }
  .btn-primary-shop:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,152,0,0.5); }
  .btn-secondary { background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); color: #0A4D8C; padding: 9px 24px; border-radius: 40px; text-decoration: none; font-weight: bold; font-size: 0.9rem; transition: all 0.3s ease; border: 1px solid rgba(10,77,140,0.3); cursor: pointer; display: inline-block; }
  .btn-secondary:hover { background: white; transform: translateY(-2px); border-color: #0A4D8C; box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
  .filter-btn { transition: all 0.2s ease; }
  .filter-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.15); }
  .galleryItem:hover img { transform: scale(1.05); }
  .citiesGrid::-webkit-scrollbar { width: 8px; }
  .citiesGrid::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
  .citiesGrid::-webkit-scrollbar-thumb { background: #0A4D8C; border-radius: 10px; }
  .cityTagVideo:hover { transform: scale(1.02); background: linear-gradient(135deg, #2E7D32, #4CAF50); }
  .footerList li { margin-bottom: 8px; }
  .footerList li a:hover { color: #FFD166; }
  .socialIcon:hover { transform: translateY(-3px); }
  .chatModalContent { animation: slideUp 0.3s ease; }

  .blogCard:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
  .blogCard:hover .blogImageStyled { transform: scale(1.05); }
  .blogReadMoreStyled:hover { gap: 8px; }
  .blogReadMoreStyled:hover .blogArrowStyled { transform: translateX(3px); }

  .footerBottomLinks a { color: rgba(255,255,255,0.8); text-decoration: none; margin: 0 5px; }
  .footerBottomLinks a:hover { color: #FFD166; }
  .paymentIcons span { margin: 0 8px; font-size: 0.7rem; opacity: 0.8; color: white; }

  @media (max-width: 768px) {
    .citiesGrid { grid-template-columns: repeat(2, 1fr) !important; }
    .galleryGrid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important; }
    .shopCtaButtons { flex-direction: column; align-items: center; width: 100%; }
    .shopCtaButtons a, .shopCtaButtons button { width: 100%; max-width: 280px; text-align: center; }
    .shopStats { gap: 0.8rem; }
    .newProductsGrid { grid-template-columns: 1fr !important; }
    .blogGrid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 600px) {
    .citiesGrid { grid-template-columns: 1fr !important; }
    .statsGrid { gap: 0.5rem; }
    .statCard { min-width: 100px; padding: 0.5rem; }
    .statNumber { font-size: 1rem; }
  }

  .custom-footer::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.2);
    z-index: 1;
  }
  .custom-footer > * {
    position: relative;
    z-index: 2;
  }
`;

if (!document.querySelector('#home-styles')) {
  styleSheet.id = 'home-styles';
  document.head.appendChild(styleSheet);
}

export default Home;
