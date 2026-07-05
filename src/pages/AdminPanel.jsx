// src/pages/AdminPanel.js
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';
emailjs.init(import.meta.env.VITE_EMAILJS_USER_ID);

function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('news');

  const [news, setNews] = useState([]);
  const [settings, setSettings] = useState({});
  const [team, setTeam] = useState([]);
  const [cities, setCities] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [realisations, setRealisations] = useState([]);
  const [faq, setFaq] = useState([]);
  const [orders, setOrders] = useState([]);
  const [diagnosticOffers, setDiagnosticOffers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [memberPages, setMemberPages] = useState([]);
  const [servicePages, setServicePages] = useState([]);
  const [contactPages, setContactPages] = useState([]);
  const [partners, setPartners] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [newsletter, setNewsletter] = useState([]);
  const [payments, setPayments] = useState([]);

  const [orderStatuses, setOrderStatuses] = useState({});
  const [orderComments, setOrderComments] = useState({});

  const TELEGRAM_BOT_TOKEN = '8570394266:AAE1_Az0Hzot09m8u3s4Ml-EUMHQjgqunwY';
  const GROUP_CHAT_ID = '-5293060257';

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '@M@thurkayo219901990@@@@1') {
      setAuthenticated(true);
      loadAllData();
    } else {
      alert('Mot de passe incorrect');
    }
  };

  // ================= FONCTIONS UPLOAD =================
  const uploadImage = async (file, folder = 'images') => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    const { error } = await supabase.storage.from('public-images').upload(filePath, file);
    if (error) {
      console.error('Erreur upload:', error);
      return null;
    }
    const { data } = supabase.storage.from('public-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const uploadDownloadFile = async (file, folder) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    const { error } = await supabase.storage.from('downloads').upload(filePath, file);
    if (error) return null;
    const { data } = supabase.storage.from('downloads').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // ================= ENVOI D'EMAIL AVEC EMAILJS =================
  const sendOrderStatusEmail = async (order, newStatus, comment) => {
    const statusLabels = {
      'commande_confirmee': 'Commande confirmée',
      'colis_prepare': 'Colis préparé',
      'colis_transit_etranger': 'Colis en transit vers l\'étranger',
      'colis_transit_rdc': 'Colis en transit vers la RDC',
      'colis_arrive_douane': 'Colis arrivé à la douane',
      'sous_douane': 'Sous douane',
      'dedouanement': 'Dédouanement en cours',
      'colis_entrepos': 'Colis dans l\'entrepôt',
      'livraison_faite': 'Livraison faite'
    };

    const statusLabel = statusLabels[newStatus] || newStatus;
    const recipientEmail = order.email || order.user_email;
    if (!recipientEmail) {
      console.warn(`❌ Aucun email trouvé pour la commande #${order.order_number}`);
      return false;
    }

    console.log(`📧 Envoi d'email à ${recipientEmail} pour le statut : ${statusLabel}`);

    const templateParams = {
      to_email: recipientEmail,
      to_name: order.user_name || order.name || 'Client',
      order_number: order.order_number || 'N/A',
      status: statusLabel,
      comment: comment || '',
      account_link: `${window.location.origin}/account`,
      from_name: 'Andremed Medical',
      from_email: 'contact@andremed.org'
    };

    try {
      const result = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_USER_ID
      );
      if (result.status === 200) {
        console.log('✅ Email envoyé avec succès');
        return true;
      } else {
        console.error('❌ Erreur EmailJS:', result);
        return false;
      }
    } catch (err) {
      console.error('❌ Erreur envoi email:', err);
      return false;
    }
  };

  // ================= CHARGEMENT DES DONNÉES =================
  const loadAllData = async () => {
    setLoading(true);
    
    const { data: newsData } = await supabase.from('site_news').select('*').order('id');
    const { data: settingsData } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    const { data: teamData } = await supabase.from('team_members').select('*').order('order');
    const { data: citiesData } = await supabase.from('cities_coverage').select('*').order('order_index');
    const { data: productsData } = await supabase.from('products').select('*').order('id');
    const { data: servicesData } = await supabase.from('services').select('*').order('order');
    const { data: realisationsData } = await supabase.from('realisations').select('*').order('order');
    const { data: faqData } = await supabase.from('faq').select('*').order('order');
    const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const { data: diagnosticOffersData } = await supabase.from('diagnostic_offers').select('*').order('order');
    const { data: testimonialsData } = await supabase.from('testimonials').select('*').order('order_index');
    const { data: blogPostsData } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
    const { data: downloadsData } = await supabase.from('downloads').select('*').order('order');
    const { data: memberPagesData } = await supabase.from('member_pages').select('*').order('order_index');
    const { data: servicePagesData } = await supabase.from('service_pages').select('*').order('order_index');
    const { data: contactPagesData } = await supabase.from('contact_pages').select('*').order('order_index');
    const { data: partnersData } = await supabase.from('partners').select('*').order('order_index');
    const { data: certificationsData } = await supabase.from('certifications').select('*').order('order_index');
    const { data: eventsData } = await supabase.from('events').select('*').order('date', { ascending: false });
    const { data: jobsData } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    const { data: newsletterData } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('*, orders(order_number, user_name, email)')
      .order('submitted_at', { ascending: false });

    setNews(newsData || []);
    setSettings(settingsData || {});
    setTeam(teamData || []);
    setCities(citiesData || []);
    setProducts(productsData || []);
    setServices(servicesData || []);
    setRealisations(realisationsData || []);
    setFaq(faqData || []);
    setOrders(ordersData || []);
    setDiagnosticOffers(diagnosticOffersData || []);
    setTestimonials(testimonialsData || []);
    setBlogPosts(blogPostsData || []);
    setDownloads(downloadsData || []);
    setMemberPages(memberPagesData || []);
    setServicePages(servicePagesData || []);
    setContactPages(contactPagesData || []);
    setPartners(partnersData || []);
    setCertifications(certificationsData || []);
    setEvents(eventsData || []);
    setJobs(jobsData || []);
    setNewsletter(newsletterData || []);
    setPayments(paymentsData || []);
    
    setLoading(false);
  };

  // ================= GESTION NEWS =================
  const addNews = () => {
    setNews([...news, {
      id: Date.now(),
      type: 'promotion',
      title: '',
      description: '',
      date: '',
      icon: '📢',
      product_link: '',
      image_url: '',
      date_published: '',
      display_order: 0,
      active: true,
      created_at: new Date().toISOString()
    }]);
  };
  const updateNews = (idx, field, val) => setNews(news.map((n, i) => i === idx ? { ...n, [field]: val } : n));
  const deleteNews = async (idx) => {
    const item = news[idx];
    if (item.id && typeof item.id === 'number' && item.id < 1000000000000) await supabase.from('site_news').delete().eq('id', item.id);
    setNews(news.filter((_, i) => i !== idx));
  };
  const saveNewsAll = async () => {
    for (const item of news) {
      const toUpsert = { ...item };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      if (!toUpsert.date_published) toUpsert.date_published = null;
      await supabase.from('site_news').upsert(toUpsert);
    }
    alert('Actualités sauvegardées');
    loadAllData();
  };

  // ================= GESTION SETTINGS =================
  const saveSettings = async () => {
    await supabase.from('site_settings').upsert({ ...settings, id: 1, updated_at: new Date().toISOString() });
    alert('Paramètres mis à jour');
  };

  // ================= GESTION ÉQUIPE =================
  const addTeam = () => setTeam([...team, { id: Date.now(), name: '', role: '', photo_url: '', bio: '', order: team.length, active: true }]);
  const updateTeam = (idx, field, val) => setTeam(team.map((m, i) => i === idx ? { ...m, [field]: val } : m));
  const deleteTeam = async (idx) => {
    const member = team[idx];
    if (member.id && member.id < 1000000000000) await supabase.from('team_members').delete().eq('id', member.id);
    setTeam(team.filter((_, i) => i !== idx));
  };
  const saveTeam = async () => {
    for (const m of team) {
      const toUpsert = { ...m };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('team_members').upsert(toUpsert);
    }
    alert('Équipe sauvegardée');
    loadAllData();
  };

  // ================= GESTION VILLES =================
  const addCity = () => setCities([...cities, { id: Date.now(), city_name: 'Nouvelle ville', region: '', address: '', image_url: '', order_index: cities.length, active: true }]);
  const updateCity = (idx, field, val) => setCities(cities.map((c, i) => i === idx ? { ...c, [field]: val } : c));
  const deleteCity = async (idx) => {
    const city = cities[idx];
    if (city.id && city.id < 1000000000000) await supabase.from('cities_coverage').delete().eq('id', city.id);
    setCities(cities.filter((_, i) => i !== idx));
  };
  const saveCities = async () => {
    for (const c of cities) {
      const toUpsert = { ...c };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('cities_coverage').upsert(toUpsert);
    }
    alert('Villes sauvegardées');
    loadAllData();
  };

  // ================= GESTION PRODUITS =================
  const addProduct = () => setProducts([...products, { 
    id: Date.now(), 
    name: 'Nouveau produit', 
    category: '', 
    quantity: 0, 
    price: 0, 
    unit: 'pièce', 
    seuil_alerte: 10, 
    image: '📦', 
    media: [],
    is_new: false, 
    active: true 
  }]);
  const updateProduct = (idx, field, val) => setProducts(products.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  const deleteProduct = async (idx) => {
    const p = products[idx];
    if (p.id && typeof p.id === 'number' && p.id < 1000000000000) await supabase.from('products').delete().eq('id', p.id);
    setProducts(products.filter((_, i) => i !== idx));
  };
  const saveProducts = async () => {
    for (const p of products) {
      const toUpsert = { ...p };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('products').upsert(toUpsert);
    }
    alert('Produits sauvegardés');
    loadAllData();
  };

  // ================= GESTION SERVICES =================
  const addService = () => setServices([...services, { id: Date.now(), title: 'Nouveau service', description: '', icon: '🔧', points: [], color: '#0A4D8C', active: true, order: services.length }]);
  const updateService = (idx, field, val) => setServices(services.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  const deleteService = async (idx) => {
    const s = services[idx];
    if (s.id && s.id < 1000000000000) await supabase.from('services').delete().eq('id', s.id);
    setServices(services.filter((_, i) => i !== idx));
  };
  const saveServices = async () => {
    for (const s of services) {
      const toUpsert = { ...s };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('services').upsert(toUpsert);
    }
    alert('Services sauvegardés');
    loadAllData();
  };

  // ================= GESTION RÉALISATIONS =================
  const addRealis = () => setRealisations([...realisations, { id: Date.now(), project_key: `projet_${Date.now()}`, project_label: 'Nouveau projet', images: [], active: true, order: realisations.length }]);
  const updateRealis = (idx, field, val) => setRealisations(realisations.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  const deleteRealis = async (idx) => {
    const r = realisations[idx];
    if (r.id && r.id < 1000000000000) await supabase.from('realisations').delete().eq('id', r.id);
    setRealisations(realisations.filter((_, i) => i !== idx));
  };
  const saveRealisations = async () => {
    for (const r of realisations) {
      const toUpsert = { ...r };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('realisations').upsert(toUpsert);
    }
    alert('Réalisations sauvegardées');
    loadAllData();
  };

  // ================= GESTION FAQ =================
  const addFaq = () => setFaq([...faq, { id: Date.now(), question: 'Nouvelle question', answer: '', active: true, order: faq.length }]);
  const updateFaq = (idx, field, val) => setFaq(faq.map((f, i) => i === idx ? { ...f, [field]: val } : f));
  const deleteFaq = async (idx) => {
    const f = faq[idx];
    if (f.id && f.id < 1000000000000) await supabase.from('faq').delete().eq('id', f.id);
    setFaq(faq.filter((_, i) => i !== idx));
  };
  const saveFaq = async () => {
    for (const f of faq) {
      const toUpsert = { ...f };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('faq').upsert(toUpsert);
    }
    alert('FAQ sauvegardée');
    loadAllData();
  };

  // ================= GESTION DIAGNOSTIC =================
  const addDiagnosticOffer = () => setDiagnosticOffers([...diagnosticOffers, { id: Date.now(), title: 'Nouvelle offre', price: '', description: '', features: [], order: diagnosticOffers.length, active: true }]);
  const updateDiagnosticOffer = (idx, field, val) => setDiagnosticOffers(diagnosticOffers.map((o, i) => i === idx ? { ...o, [field]: val } : o));
  const deleteDiagnosticOffer = async (idx) => {
    const offer = diagnosticOffers[idx];
    if (offer.id && offer.id < 1000000000000) await supabase.from('diagnostic_offers').delete().eq('id', offer.id);
    setDiagnosticOffers(diagnosticOffers.filter((_, i) => i !== idx));
  };
  const saveDiagnosticOffers = async () => {
    for (const o of diagnosticOffers) {
      const toUpsert = { ...o };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('diagnostic_offers').upsert(toUpsert);
    }
    alert('Offres de diagnostic sauvegardées');
    loadAllData();
  };

  // ================= GESTION TÉMOIGNAGES =================
  const addTestimonial = () => {
    setTestimonials([...testimonials, {
      id: Date.now(),
      name: '',
      role: '',
      content: '',
      hospital: '',
      city: '',
      photo_url: '',
      order_index: testimonials.length,
      active: true
    }]);
  };
  const updateTestimonial = (idx, field, val) => {
    setTestimonials(testimonials.map((t, i) => i === idx ? { ...t, [field]: val } : t));
  };
  const deleteTestimonial = async (idx) => {
    const t = testimonials[idx];
    if (t.id && t.id < 1000000000000) await supabase.from('testimonials').delete().eq('id', t.id);
    setTestimonials(testimonials.filter((_, i) => i !== idx));
  };
  const saveTestimonials = async () => {
    for (const t of testimonials) {
      const toUpsert = { ...t };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('testimonials').upsert(toUpsert);
    }
    alert('Témoignages sauvegardés');
    loadAllData();
  };

  // ================= GESTION BLOG =================
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const addBlogPost = () => {
    setBlogPosts([...blogPosts, {
      id: Date.now(),
      title: 'Nouvel article',
      slug: `nouvel-article-${Date.now()}`,
      excerpt: 'Résumé de l\'article...',
      content: '<p>Contenu de l\'article...</p>',
      featured_image: '',
      category: 'Actualités',
      author: 'Andremed Medical',
      published_at: new Date().toISOString(),
      active: true,
      views: 0,
      created_at: new Date().toISOString()
    }]);
  };
  const updateBlogPost = (idx, field, val) => {
    setBlogPosts(blogPosts.map((post, i) => i === idx ? { ...post, [field]: val } : post));
  };
  const deleteBlogPost = async (idx) => {
    const post = blogPosts[idx];
    if (post.id && typeof post.id === 'number' && post.id < 1000000000000) {
      await supabase.from('blog_posts').delete().eq('id', post.id);
    }
    setBlogPosts(blogPosts.filter((_, i) => i !== idx));
  };
  const saveBlogPosts = async () => {
    for (const post of blogPosts) {
      const toUpsert = { ...post };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      if (!toUpsert.slug && toUpsert.title) {
        toUpsert.slug = generateSlug(toUpsert.title);
      }
      await supabase.from('blog_posts').upsert(toUpsert);
    }
    alert('Articles du blog sauvegardés');
    loadAllData();
  };

  // ================= GESTION TÉLÉCHARGEMENTS =================
  const addDownload = () => {
    setDownloads([...downloads, {
      id: Date.now(),
      name: 'Nouveau document',
      type: 'PDF',
      category: 'catalogues',
      size: '0 MB',
      icon: '📘',
      file_url: '',
      active: true,
      order: downloads.length,
      date: new Date().toISOString().slice(0,10)
    }]);
  };
  const updateDownload = (idx, field, val) => {
    setDownloads(downloads.map((d, i) => i === idx ? { ...d, [field]: val } : d));
  };
  const deleteDownload = async (idx) => {
    const d = downloads[idx];
    if (d.id && d.id < 1000000000000) await supabase.from('downloads').delete().eq('id', d.id);
    setDownloads(downloads.filter((_, i) => i !== idx));
  };
  const saveDownloads = async () => {
    for (const d of downloads) {
      const toUpsert = { ...d };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('downloads').upsert(toUpsert);
    }
    alert('Téléchargements sauvegardés');
    loadAllData();
  };

  // ================= GESTION PAGES MEMBRES =================
  const updateMemberPage = (idx, field, val) => {
    setMemberPages(memberPages.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };
  const saveMemberPages = async () => {
    for (const page of memberPages) {
      const toUpsert = { ...page };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('member_pages').upsert(toUpsert);
    }
    alert('Pages membres sauvegardées');
    loadAllData();
  };

  // ================= GESTION PAGES SERVICES =================
  const updateServicePage = (idx, field, val) => {
    setServicePages(servicePages.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };
  const saveServicePages = async () => {
    for (const page of servicePages) {
      const toUpsert = { ...page };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('service_pages').upsert(toUpsert);
    }
    alert('Pages services sauvegardées');
    loadAllData();
  };

  // ================= GESTION PAGES CONTACT =================
  const updateContactPage = (idx, field, val) => {
    setContactPages(contactPages.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };
  const saveContactPages = async () => {
    for (const page of contactPages) {
      const toUpsert = { ...page };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('contact_pages').upsert(toUpsert);
    }
    alert('Pages contact sauvegardées');
    loadAllData();
  };

  // ================= GESTION PARTENAIRES =================
  const addPartner = () => {
    setPartners([...partners, {
      id: Date.now(),
      name: 'Nouveau partenaire',
      logo_url: '',
      website: '',
      description: '',
      order_index: partners.length,
      active: true
    }]);
  };
  const updatePartner = (idx, field, val) => {
    setPartners(partners.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };
  const deletePartner = async (idx) => {
    const p = partners[idx];
    if (p.id && p.id < 1000000000000) await supabase.from('partners').delete().eq('id', p.id);
    setPartners(partners.filter((_, i) => i !== idx));
  };
  const savePartners = async () => {
    for (const p of partners) {
      const toUpsert = { ...p };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('partners').upsert(toUpsert);
    }
    alert('Partenaires sauvegardés');
    loadAllData();
  };

  // ================= GESTION CERTIFICATIONS =================
  const addCertification = () => {
    setCertifications([...certifications, {
      id: Date.now(),
      name: 'Nouvelle certification',
      logo_url: '',
      issuer: '',
      year: new Date().getFullYear(),
      description: '',
      order_index: certifications.length,
      active: true
    }]);
  };
  const updateCertification = (idx, field, val) => {
    setCertifications(certifications.map((c, i) => i === idx ? { ...c, [field]: val } : c));
  };
  const deleteCertification = async (idx) => {
    const c = certifications[idx];
    if (c.id && c.id < 1000000000000) await supabase.from('certifications').delete().eq('id', c.id);
    setCertifications(certifications.filter((_, i) => i !== idx));
  };
  const saveCertifications = async () => {
    for (const c of certifications) {
      const toUpsert = { ...c };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('certifications').upsert(toUpsert);
    }
    alert('Certifications sauvegardées');
    loadAllData();
  };

  // ================= GESTION ÉVÉNEMENTS =================
  const addEvent = () => {
    setEvents([...events, {
      id: Date.now(),
      title: 'Nouvel événement',
      description: '',
      date: new Date().toISOString(),
      location: '',
      image_url: '',
      registration_link: '',
      active: true
    }]);
  };
  const updateEvent = (idx, field, val) => {
    setEvents(events.map((e, i) => i === idx ? { ...e, [field]: val } : e));
  };
  const deleteEvent = async (idx) => {
    const e = events[idx];
    if (e.id && e.id < 1000000000000) await supabase.from('events').delete().eq('id', e.id);
    setEvents(events.filter((_, i) => i !== idx));
  };
  const saveEvents = async () => {
    for (const e of events) {
      const toUpsert = { ...e };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('events').upsert(toUpsert);
    }
    alert('Événements sauvegardés');
    loadAllData();
  };

  // ================= GESTIONS OFFRES D'EMPLOI =================
  const addJob = () => {
    setJobs([...jobs, {
      id: Date.now(),
      title: 'Nouveau poste',
      department: 'Médical',
      location: 'Yaoundé',
      type: 'CDI',
      description: '',
      requirements: '',
      contact_email: 'recrutement@andremed.com',
      active: true,
      created_at: new Date().toISOString()
    }]);
  };
  const updateJob = (idx, field, val) => {
    setJobs(jobs.map((j, i) => i === idx ? { ...j, [field]: val } : j));
  };
  const deleteJob = async (idx) => {
    const j = jobs[idx];
    if (j.id && j.id < 1000000000000) await supabase.from('jobs').delete().eq('id', j.id);
    setJobs(jobs.filter((_, i) => i !== idx));
  };
  const saveJobs = async () => {
    for (const j of jobs) {
      const toUpsert = { ...j };
      if (toUpsert.id > 1000000000000) delete toUpsert.id;
      await supabase.from('jobs').upsert(toUpsert);
    }
    alert('Offres d\'emploi sauvegardées');
    loadAllData();
  };

  // ================= GESTION NEWSLETTER =================
  const deleteNewsletter = async (idx) => {
    const sub = newsletter[idx];
    if (sub.id && sub.id < 1000000000000) await supabase.from('newsletter_subscribers').delete().eq('id', sub.id);
    setNewsletter(newsletter.filter((_, i) => i !== idx));
    alert('Abonné supprimé');
  };

  const exportNewsletter = () => {
    const emails = newsletter.map(sub => sub.email).join('\n');
    const blob = new Blob([emails], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter_emails.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ================= COMPOSANT UPLOADFIELD =================
  const UploadField = ({ value, onValueChange, folder = 'images', accept = 'image/*', label = 'Image' }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFile = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      const url = await uploadImage(file, folder);
      setUploading(false);
      if (url) onValueChange(url);
      e.target.value = '';
    };

    const triggerFileInput = () => {
      fileInputRef.current?.click();
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder={`URL de ${label}`}
            value={value || ''}
            onChange={(e) => onValueChange(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="file"
            accept={accept}
            onChange={handleFile}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <button
            type="button"
            onClick={triggerFileInput}
            style={{ padding: '8px 16px', background: '#00A3B2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            disabled={uploading}
          >
            {uploading ? 'Upload...' : '📂 Choisir un fichier'}
          </button>
        </div>
        {value && (
          <div style={{ marginTop: '5px' }}>
            <img src={value} alt="Prévisualisation" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px', border: '1px solid #ddd' }} />
          </div>
        )}
      </div>
    );
  };

  // ================= RENDU =================
  if (!authenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
        <h2>Administration</h2>
        <form onSubmit={handleLogin}>
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <button type="submit" style={{ padding: '10px 20px', background: '#0A4D8C', color: 'white', border: 'none', borderRadius: '5px' }}>Se connecter</button>
        </form>
      </div>
    );
  }
  
  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</div>;

  const tabStyle = (tab) => ({
    padding: '10px 20px',
    background: activeTab === tab ? '#0A4D8C' : '#f0f0f0',
    color: activeTab === tab ? 'white' : '#333',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
    marginRight: '10px',
    marginBottom: '10px'
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>📝 Panneau d'administration complet</h1>
      <a href="/" style={{ display: 'inline-block', marginBottom: '1rem', textDecoration: 'none', background: '#0A4D8C', color: 'white', padding: '8px 16px', borderRadius: '8px' }}>← Retour au site</a>
      
      <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button onClick={() => setActiveTab('news')} style={tabStyle('news')}>📰 Actualités</button>
        <button onClick={() => setActiveTab('about')} style={tabStyle('about')}>🏢 À propos</button>
        <button onClick={() => setActiveTab('team')} style={tabStyle('team')}>👥 Équipe</button>
        <button onClick={() => setActiveTab('cities')} style={tabStyle('cities')}>📍 Villes</button>
        <button onClick={() => setActiveTab('products')} style={tabStyle('products')}>📦 Produits</button>
        <button onClick={() => setActiveTab('services')} style={tabStyle('services')}>🔧 Services</button>
        <button onClick={() => setActiveTab('realisations')} style={tabStyle('realisations')}>🏆 Réalisations</button>
        <button onClick={() => setActiveTab('faq')} style={tabStyle('faq')}>❓ FAQ</button>
        <button onClick={() => setActiveTab('orders')} style={tabStyle('orders')}>📦 Commandes</button>
        <button onClick={() => setActiveTab('diagnostic')} style={tabStyle('diagnostic')}>🩺 Diagnostic</button>
        <button onClick={() => setActiveTab('testimonials')} style={tabStyle('testimonials')}>⭐ Témoignages</button>
        <button onClick={() => setActiveTab('blog')} style={tabStyle('blog')}>📝 Blog</button>
        <button onClick={() => setActiveTab('downloads')} style={tabStyle('downloads')}>📥 Téléchargements</button>
        <button onClick={() => setActiveTab('memberPages')} style={tabStyle('memberPages')}>👥 Pages Membres</button>
        <button onClick={() => setActiveTab('servicePages')} style={tabStyle('servicePages')}>🔧 Pages Services</button>
        <button onClick={() => setActiveTab('contactPages')} style={tabStyle('contactPages')}>📞 Pages Contact</button>
        <button onClick={() => setActiveTab('partners')} style={tabStyle('partners')}>🤝 Partenaires</button>
        <button onClick={() => setActiveTab('certifications')} style={tabStyle('certifications')}>🏅 Certifications</button>
        <button onClick={() => setActiveTab('events')} style={tabStyle('events')}>📅 Événements</button>
        <button onClick={() => setActiveTab('jobs')} style={tabStyle('jobs')}>💼 Offres d'emploi</button>
        <button onClick={() => setActiveTab('newsletter')} style={tabStyle('newsletter')}>📧 Newsletter</button>
        <button onClick={() => setActiveTab('payments')} style={tabStyle('payments')}>💳 Paiements</button>
      </div>

      {/* ================= ONGLET ACTUALITÉS ================= */}
      {activeTab === 'news' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>📰 Actualités & Promotions</h2>
          <button onClick={addNews}>➕ Ajouter une actualité</button>
          {news.map((item, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <select value={item.type} onChange={e => updateNews(idx, 'type', e.target.value)}>
                <option value="promotion">Promotion</option>
                <option value="nouveaute">Nouveauté</option>
                <option value="evenement">Événement</option>
              </select>
              <input placeholder="Titre" value={item.title} onChange={e => updateNews(idx, 'title', e.target.value)} style={{ width: '100%', marginTop: '8px' }} />
              <textarea placeholder="Description" value={item.description} onChange={e => updateNews(idx, 'description', e.target.value)} rows="2" style={{ width: '100%', marginTop: '8px' }} />
              <input placeholder="Date" value={item.date || ''} onChange={e => updateNews(idx, 'date', e.target.value)} style={{ width: '100%', marginTop: '8px' }} />
              <input placeholder="Icône (emoji)" value={item.icon || '📢'} onChange={e => updateNews(idx, 'icon', e.target.value)} style={{ width: '100%', marginTop: '8px' }} />
              <input placeholder="Lien produit" value={item.product_link || ''} onChange={e => updateNews(idx, 'product_link', e.target.value)} style={{ width: '100%', marginTop: '8px' }} />
              <UploadField
                label="Image"
                value={item.image_url}
                onValueChange={(url) => updateNews(idx, 'image_url', url)}
                folder="news"
              />
              <div>
                <label>Date de publication :</label>
                <input type="datetime-local" value={item.date_published?.slice(0,16) || ''} onChange={e => updateNews(idx, 'date_published', e.target.value)} />
              </div>
              <div>
                <label>Ordre d'affichage :</label>
                <input type="number" value={item.display_order || 0} onChange={e => updateNews(idx, 'display_order', parseInt(e.target.value))} />
              </div>
              <label><input type="checkbox" checked={item.active} onChange={e => updateNews(idx, 'active', e.target.checked)} /> Actif</label>
              <button onClick={() => deleteNews(idx)} style={{ background: '#B41E1E', color: 'white', marginLeft: '10px' }}>🗑 Supprimer</button>
            </div>
          ))}
          <button onClick={saveNewsAll} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder toutes</button>
        </section>
      )}

      {/* ================= ONGLET À PROPOS ================= */}
      {activeTab === 'about' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>🏢 À propos & coordonnées</h2>
          <input placeholder="Titre À propos" value={settings.about_title || ''} onChange={e => setSettings({ ...settings, about_title: e.target.value })} style={{ width: '100%', marginBottom: '8px' }} />
          <textarea placeholder="Description" rows="3" value={settings.about_description || ''} onChange={e => setSettings({ ...settings, about_description: e.target.value })} style={{ width: '100%', marginBottom: '8px' }} />
          
          {/* ✅ AJOUT : Mission et Vision */}
          <textarea placeholder="Mission" rows="3" value={settings.about_mission || ''} onChange={e => setSettings({ ...settings, about_mission: e.target.value })} style={{ width: '100%', marginBottom: '8px' }} />
          <textarea placeholder="Vision" rows="3" value={settings.about_vision || ''} onChange={e => setSettings({ ...settings, about_vision: e.target.value })} style={{ width: '100%', marginBottom: '8px' }} />

          <h4 style={{ marginTop: '16px' }}>📊 Statistiques de la page À propos</h4>
          <input 
            placeholder="Année de fondation" 
            type="number" 
            value={settings.foundation_year || 2017} 
            onChange={e => setSettings({ ...settings, foundation_year: parseInt(e.target.value) })} 
            style={{ width: '100%', marginBottom: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} 
          />
          <input 
            placeholder="Villes couvertes" 
            type="number" 
            value={settings.cities_covered || 6} 
            onChange={e => setSettings({ ...settings, cities_covered: parseInt(e.target.value) })} 
            style={{ width: '100%', marginBottom: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} 
          />
          <input 
            placeholder="Membres d'équipe" 
            type="number" 
            value={settings.team_members || 15} 
            onChange={e => setSettings({ ...settings, team_members: parseInt(e.target.value) })} 
            style={{ width: '100%', marginBottom: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} 
          />
          <input 
            placeholder="Projets réalisés" 
            type="number" 
            value={settings.projects_done || 100} 
            onChange={e => setSettings({ ...settings, projects_done: parseInt(e.target.value) })} 
            style={{ width: '100%', marginBottom: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} 
          />

          <h4 style={{ marginTop: '16px' }}>📞 Coordonnées</h4>
          <input placeholder="Téléphone 1" value={settings.phone1 || ''} onChange={e => setSettings({ ...settings, phone1: e.target.value })} style={{ width: '100%', marginBottom: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          <input placeholder="Email" value={settings.email || ''} onChange={e => setSettings({ ...settings, email: e.target.value })} style={{ width: '100%', marginBottom: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          <textarea placeholder="Adresse" rows="2" value={settings.address || ''} onChange={e => setSettings({ ...settings, address: e.target.value })} style={{ width: '100%', marginBottom: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          
          <button onClick={saveSettings} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET ÉQUIPE ================= */}
      {activeTab === 'team' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>👥 Équipe</h2>
          <button onClick={addTeam}>➕ Ajouter un membre</button>
          {team.map((m, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Nom" value={m.name} onChange={e => updateTeam(idx, 'name', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Rôle" value={m.role} onChange={e => updateTeam(idx, 'role', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <textarea placeholder="Bio" rows="2" value={m.bio || ''} onChange={e => updateTeam(idx, 'bio', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <UploadField
                label="Photo"
                value={m.photo_url}
                onValueChange={(url) => updateTeam(idx, 'photo_url', url)}
                folder="team"
              />
              <div>
                <label>Ordre :</label>
                <input type="number" value={m.order} onChange={e => updateTeam(idx, 'order', parseInt(e.target.value))} />
              </div>
              <label><input type="checkbox" checked={m.active} onChange={e => updateTeam(idx, 'active', e.target.checked)} /> Actif</label>
              <button onClick={() => deleteTeam(idx)} style={{ background: '#B41E1E', color: 'white', marginLeft: '10px' }}>🗑 Supprimer</button>
            </div>
          ))}
          <button onClick={saveTeam} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET VILLES ================= */}
      {activeTab === 'cities' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>📍 Villes couvertes</h2>
          <button onClick={addCity}>➕ Ajouter une ville</button>
          {cities.map((c, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Nom ville" value={c.city_name} onChange={e => updateCity(idx, 'city_name', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Région" value={c.region || ''} onChange={e => updateCity(idx, 'region', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Adresse" value={c.address || ''} onChange={e => updateCity(idx, 'address', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <UploadField
                label="Image"
                value={c.image_url}
                onValueChange={(url) => updateCity(idx, 'image_url', url)}
                folder="cities"
              />
              <div>
                <label>Ordre :</label>
                <input type="number" value={c.order_index} onChange={e => updateCity(idx, 'order_index', parseInt(e.target.value))} />
              </div>
              <label><input type="checkbox" checked={c.active} onChange={e => updateCity(idx, 'active', e.target.checked)} /> Actif</label>
              <button onClick={() => deleteCity(idx)} style={{ background: '#B41E1E', color: 'white', marginLeft: '10px' }}>🗑 Supprimer</button>
            </div>
          ))}
          <button onClick={saveCities} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET PRODUITS (AVEC IMAGES MULTIPLES) ================= */}
      {activeTab === 'products' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>📦 Produits</h2>
          <button onClick={addProduct}>➕ Ajouter un produit</button>
          {products.map((p, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input
                placeholder="Nom"
                value={p.name}
                onChange={e => updateProduct(idx, 'name', e.target.value)}
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <input
                placeholder="Catégorie"
                value={p.category || ''}
                onChange={e => updateProduct(idx, 'category', e.target.value)}
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <input
                placeholder="Prix"
                type="number"
                value={p.price}
                onChange={e => updateProduct(idx, 'price', parseFloat(e.target.value))}
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <input
                placeholder="Quantité"
                type="number"
                value={p.quantity}
                onChange={e => updateProduct(idx, 'quantity', parseInt(e.target.value))}
                style={{ width: '100%', marginBottom: '8px' }}
              />

              <UploadField
                label="Image principale"
                value={p.image}
                onValueChange={(url) => updateProduct(idx, 'image', url)}
                folder="products"
              />

              <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <label><strong>Images supplémentaires :</strong></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                  {(p.media || []).map((url, imgIdx) => (
                    <div key={imgIdx} style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={url}
                        alt={`Produit ${idx} supplémentaire ${imgIdx+1}`}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                      />
                      <button
                        onClick={() => {
                          const newMedia = (p.media || []).filter((_, i) => i !== imgIdx);
                          updateProduct(idx, 'media', newMedia);
                        }}
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: '#B41E1E',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          lineHeight: '20px',
                          textAlign: 'center'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    const currentMedia = p.media || [];
                    let newMedia = [...currentMedia];
                    for (const file of files) {
                      const url = await uploadImage(file, 'products');
                      if (url) newMedia.push(url);
                    }
                    updateProduct(idx, 'media', newMedia);
                    e.target.value = '';
                  }}
                  style={{ marginTop: '8px', display: 'block' }}
                />
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                  Sélectionnez plusieurs fichiers (Ctrl+clic) pour ajouter plusieurs images.
                </p>
              </div>

              <div style={{ marginTop: '12px' }}>
                <label><input type="checkbox" checked={p.is_new} onChange={e => updateProduct(idx, 'is_new', e.target.checked)} /> Nouveau</label>
                <label style={{ marginLeft: '15px' }}><input type="checkbox" checked={p.active !== false} onChange={e => updateProduct(idx, 'active', e.target.checked)} /> Actif</label>
              </div>
              <button onClick={() => deleteProduct(idx)} style={{ background: '#B41E1E', color: 'white', marginTop: '10px', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                🗑 Supprimer
              </button>
            </div>
          ))}
          <button onClick={saveProducts} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            💾 Sauvegarder tous les produits
          </button>
        </section>
      )}

      {/* ================= ONGLET SERVICES ================= */}
      {activeTab === 'services' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>🔧 Services</h2>
          <button onClick={addService}>➕ Ajouter un service</button>
          {services.map((s, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Titre" value={s.title} onChange={e => updateService(idx, 'title', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <textarea placeholder="Description" rows="2" value={s.description || ''} onChange={e => updateService(idx, 'description', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Icône" value={s.icon || '🔧'} onChange={e => updateService(idx, 'icon', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Couleur (ex: #0A4D8C)" value={s.color || '#0A4D8C'} onChange={e => updateService(idx, 'color', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <label><input type="checkbox" checked={s.active !== false} onChange={e => updateService(idx, 'active', e.target.checked)} /> Actif</label>
              <button onClick={() => deleteService(idx)} style={{ background: '#B41E1E', color: 'white', marginLeft: '10px' }}>🗑 Supprimer</button>
            </div>
          ))}
          <button onClick={saveServices} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET RÉALISATIONS ================= */}
      {activeTab === 'realisations' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>🏆 Réalisations</h2>
          <button onClick={addRealis}>➕ Ajouter un projet</button>
          {realisations.map((r, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Nom du projet" value={r.project_label} onChange={e => updateRealis(idx, 'project_label', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <div>
                <label>Images du projet :</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {(r.images || []).map((img, imgIdx) => (
                    <div key={imgIdx} style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={img} alt={`Projet ${idx}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                      <button
                        onClick={() => {
                          const newImages = (r.images || []).filter((_, i) => i !== imgIdx);
                          updateRealis(idx, 'images', newImages);
                        }}
                        style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#B41E1E', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', lineHeight: '20px', textAlign: 'center' }}
                      >✕</button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    const currentImages = r.images || [];
                    let newImages = [...currentImages];
                    for (const file of files) {
                      const url = await uploadImage(file, 'realisations');
                      if (url) newImages.push(url);
                    }
                    updateRealis(idx, 'images', newImages);
                    e.target.value = '';
                  }}
                  style={{ marginTop: '8px' }}
                />
              </div>
              <label><input type="checkbox" checked={r.active !== false} onChange={e => updateRealis(idx, 'active', e.target.checked)} /> Actif</label>
              <button onClick={() => deleteRealis(idx)} style={{ background: '#B41E1E', color: 'white', marginLeft: '10px' }}>🗑 Supprimer</button>
            </div>
          ))}
          <button onClick={saveRealisations} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET FAQ ================= */}
      {activeTab === 'faq' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>❓ FAQ</h2>
          <button onClick={addFaq}>➕ Ajouter une question</button>
          {faq.map((f, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Question" value={f.question} onChange={e => updateFaq(idx, 'question', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <textarea placeholder="Réponse" rows="2" value={f.answer} onChange={e => updateFaq(idx, 'answer', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <label><input type="checkbox" checked={f.active !== false} onChange={e => updateFaq(idx, 'active', e.target.checked)} /> Actif</label>
              <button onClick={() => deleteFaq(idx)} style={{ background: '#B41E1E', color: 'white', marginLeft: '10px' }}>🗑 Supprimer</button>
            </div>
          ))}
          <button onClick={saveFaq} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET COMMANDES ================= */}
      {activeTab === 'orders' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>📦 Commandes clients</h2>
          {orders.length === 0 ? (
            <p>Aucune commande.</p>
          ) : (
            orders.map(order => {
              const statusOptions = [
                { value: 'commande_confirmee', label: 'Commande confirmée' },
                { value: 'colis_prepare', label: 'Colis préparé' },
                { value: 'colis_transit_etranger', label: 'Colis en transit vers l\'étranger' },
                { value: 'colis_transit_rdc', label: 'Colis en transit vers la RDC' },
                { value: 'colis_arrive_douane', label: 'Colis arrivé à la douane' },
                { value: 'sous_douane', label: 'Sous douane' },
                { value: 'dedouanement', label: 'Dédouanement en cours' },
                { value: 'colis_entrepos', label: 'Colis dans l\'entrepôt' },
                { value: 'livraison_faite', label: 'Livraison faite' }
              ];

              const currentStatus = orderStatuses[order.id] || order.status || 'commande_confirmee';
              const currentComment = orderComments[order.id] || '';

              const handleStatusChange = (e) => {
                setOrderStatuses(prev => ({ ...prev, [order.id]: e.target.value }));
              };

              const handleCommentChange = (e) => {
                setOrderComments(prev => ({ ...prev, [order.id]: e.target.value }));
              };

              const handleUpdate = async () => {
                const newStatus = orderStatuses[order.id] || order.status || 'commande_confirmee';
                const newComment = orderComments[order.id] || '';

                const newHistory = [...(order.status_history || []), {
                  status: newStatus,
                  label: statusOptions.find(o => o.value === newStatus)?.label || newStatus,
                  date: new Date().toISOString(),
                  comment: newComment || ''
                }];

                try {
                  const { error } = await supabase
                    .from('orders')
                    .update({
                      status: newStatus,
                      status_label: statusOptions.find(o => o.value === newStatus)?.label || newStatus,
                      status_history: newHistory,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', order.id);

                  if (error) throw error;

                  const emailSent = await sendOrderStatusEmail(order, newStatus, newComment);
                  if (emailSent) {
                    alert('✅ Statut mis à jour et email envoyé !');
                  } else {
                    alert('⚠️ Statut mis à jour mais l\'email n\'a pas pu être envoyé.');
                  }

                  await loadAllData();
                } catch (err) {
                  alert('❌ Erreur lors de la mise à jour');
                  console.error(err);
                }
              };

              const statusHistory = order.status_history || [];

              return (
                <div key={order.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
                  <h3>Commande #{order.order_number}</h3>
                  <p><strong>Client :</strong> {order.user_name || order.email}</p>
                  <p><strong>Email :</strong> {order.email}</p>
                  <p><strong>Téléphone :</strong> {order.phone}</p>
                  <p><strong>Total :</strong> {Number(order.total).toLocaleString()} €</p>
                  <p><strong>Statut actuel :</strong> {order.status_label}</p>

                  <div style={{ marginTop: '1rem' }}>
                    <label>Nouveau statut :</label>
                    <select
                      value={currentStatus}
                      onChange={handleStatusChange}
                      style={{ marginLeft: '10px', padding: '5px' }}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <label>Commentaire (optionnel) :</label>
                    <input
                      type="text"
                      value={currentComment}
                      onChange={handleCommentChange}
                      placeholder="Ex: colis suivi par transporteur X"
                      style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                  </div>

                  <button
                    onClick={handleUpdate}
                    style={{ marginTop: '1rem', background: '#0A4D8C', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    📤 Mettre à jour & envoyer l'email
                  </button>

                  {statusHistory.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h4>📋 Historique des statuts</h4>
                      <ul style={{ paddingLeft: '20px' }}>
                        {statusHistory.map((entry, idx) => (
                          <li key={idx} style={{ marginBottom: '5px' }}>
                            <strong>{entry.label}</strong> – {new Date(entry.date).toLocaleString('fr-FR')}
                            {entry.comment && ` (${entry.comment})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}

      {/* ================= ONGLET DIAGNOSTIC ================= */}
      {activeTab === 'diagnostic' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>🩺 Offres diagnostic</h2>
          <button onClick={addDiagnosticOffer}>➕ Ajouter une offre</button>
          {diagnosticOffers.map((offer, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Titre" value={offer.title} onChange={e => updateDiagnosticOffer(idx, 'title', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Prix" value={offer.price} onChange={e => updateDiagnosticOffer(idx, 'price', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <textarea placeholder="Description" rows="2" value={offer.description || ''} onChange={e => updateDiagnosticOffer(idx, 'description', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <label><input type="checkbox" checked={offer.active !== false} onChange={e => updateDiagnosticOffer(idx, 'active', e.target.checked)} /> Actif</label>
              <button onClick={() => deleteDiagnosticOffer(idx)} style={{ background: '#B41E1E', color: 'white', marginLeft: '10px' }}>🗑 Supprimer</button>
            </div>
          ))}
          <button onClick={saveDiagnosticOffers} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET TÉMOIGNAGES ================= */}
      {activeTab === 'testimonials' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>⭐ Témoignages</h2>
          <button onClick={addTestimonial}>➕ Ajouter un témoignage</button>
          {testimonials.map((t, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Nom" value={t.name} onChange={e => updateTestimonial(idx, 'name', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Rôle" value={t.role || ''} onChange={e => updateTestimonial(idx, 'role', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Hôpital / Institution" value={t.hospital || ''} onChange={e => updateTestimonial(idx, 'hospital', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Ville" value={t.city || ''} onChange={e => updateTestimonial(idx, 'city', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <textarea placeholder="Témoignage" rows="3" value={t.content} onChange={e => updateTestimonial(idx, 'content', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <UploadField
                label="Photo"
                value={t.photo_url}
                onValueChange={(url) => updateTestimonial(idx, 'photo_url', url)}
                folder="testimonials"
              />
              <label><input type="checkbox" checked={t.active !== false} onChange={e => updateTestimonial(idx, 'active', e.target.checked)} /> Actif</label>
              <button onClick={() => deleteTestimonial(idx)} style={{ background: '#B41E1E', color: 'white', marginLeft: '10px' }}>🗑 Supprimer</button>
            </div>
          ))}
          <button onClick={saveTestimonials} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET BLOG ================= */}
      {activeTab === 'blog' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>📝 Blog</h2>
          <button onClick={addBlogPost}>➕ Nouvel article</button>
          {blogPosts.map((post, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Titre" value={post.title} onChange={e => updateBlogPost(idx, 'title', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Slug (laisser vide pour auto-générer)" value={post.slug || ''} onChange={e => updateBlogPost(idx, 'slug', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Extrait" value={post.excerpt || ''} onChange={e => updateBlogPost(idx, 'excerpt', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <textarea placeholder="Contenu HTML" rows="6" value={post.content || ''} onChange={e => updateBlogPost(idx, 'content', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <UploadField
                label="Image à la une"
                value={post.featured_image}
                onValueChange={(url) => updateBlogPost(idx, 'featured_image', url)}
                folder="blog"
              />
              <input placeholder="Catégorie" value={post.category || ''} onChange={e => updateBlogPost(idx, 'category', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Auteur" value={post.author || ''} onChange={e => updateBlogPost(idx, 'author', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input type="datetime-local" value={post.published_at?.slice(0,16) || ''} onChange={e => updateBlogPost(idx, 'published_at', e.target.value)} />
              <label><input type="checkbox" checked={post.active} onChange={e => updateBlogPost(idx, 'active', e.target.checked)} /> Actif</label>
              <button onClick={() => deleteBlogPost(idx)} style={{ background: '#B41E1E', color: 'white', marginLeft: '10px' }}>🗑 Supprimer</button>
            </div>
          ))}
          <button onClick={saveBlogPosts} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET TÉLÉCHARGEMENTS ================= */}
      {activeTab === 'downloads' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>📥 Téléchargements</h2>
          <button onClick={addDownload}>➕ Ajouter un document</button>
          {downloads.map((d, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Nom" value={d.name} onChange={e => updateDownload(idx, 'name', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <select value={d.type || 'PDF'} onChange={e => updateDownload(idx, 'type', e.target.value)}>
                <option>PDF</option><option>MP4</option><option>ZIP</option><option>DOC</option><option>XLS</option>
              </select>
              <input placeholder="Catégorie" value={d.category || ''} onChange={e => updateDownload(idx, 'category', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Taille (ex: 2.5 MB)" value={d.size || ''} onChange={e => updateDownload(idx, 'size', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <UploadField
                label="Fichier"
                value={d.file_url}
                onValueChange={(url) => updateDownload(idx, 'file_url', url)}
                folder="downloads"
                accept="*/*"
              />
              <label><input type="checkbox" checked={d.active} onChange={e => updateDownload(idx, 'active', e.target.checked)} /> Actif</label>
              <button onClick={() => deleteDownload(idx)} style={{ background: '#B41E1E', color: 'white', marginLeft: '10px' }}>🗑 Supprimer</button>
            </div>
          ))}
          <button onClick={saveDownloads} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET PAGES MEMBRES ================= */}
      {activeTab === 'memberPages' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>👥 Pages Membres</h2>
          {memberPages.map((page, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Titre" value={page.title} onChange={e => updateMemberPage(idx, 'title', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <textarea placeholder="Contenu HTML" rows="4" value={page.content || ''} onChange={e => updateMemberPage(idx, 'content', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Icône" value={page.icon || ''} onChange={e => updateMemberPage(idx, 'icon', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <label><input type="checkbox" checked={page.active} onChange={e => updateMemberPage(idx, 'active', e.target.checked)} /> Actif</label>
            </div>
          ))}
          <button onClick={saveMemberPages} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET PAGES SERVICES ================= */}
      {activeTab === 'servicePages' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>🔧 Pages Services & Support</h2>
          <p style={{ color: '#6C757D', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Gérez le contenu des pages : Our Services, Support technique, FAQ, Formation, Help Center, Join Us, 
            Technical Support, Training Programs, Maintenance Services, Warranty Information, Returns & Refunds, Customer Feedback
          </p>
          
          {servicePages.length === 0 ? (
            <p>Aucune page service enregistrée.</p>
          ) : (
            servicePages.map((page, idx) => (
              <div key={idx} style={{ 
                border: '1px solid #ddd', 
                padding: '1rem', 
                marginTop: '1rem', 
                borderRadius: '8px',
                background: page.active === false ? '#f8f9fa' : 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: '#0A4D8C' }}>
                    {page.icon || '📄'} {page.title || 'Sans titre'}
                  </h4>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '3px 10px', 
                    borderRadius: '20px',
                    background: page.active !== false ? '#4CAF50' : '#B41E1E',
                    color: 'white'
                  }}>
                    {page.active !== false ? '✅ Actif' : '❌ Inactif'}
                  </span>
                </div>
                
                <input 
                  placeholder="Titre de la page" 
                  value={page.title || ''} 
                  onChange={e => updateServicePage(idx, 'title', e.target.value)} 
                  style={{ width: '100%', marginBottom: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} 
                />
                
                <input 
                  placeholder="Icône (ex: 🔧)" 
                  value={page.icon || ''} 
                  onChange={e => updateServicePage(idx, 'icon', e.target.value)} 
                  style={{ width: '100%', marginBottom: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} 
                />
                
                <textarea 
                  placeholder="Contenu HTML de la page" 
                  rows="6" 
                  value={page.content || ''} 
                  onChange={e => updateServicePage(idx, 'content', e.target.value)} 
                  style={{ width: '100%', marginBottom: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'monospace' }} 
                />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={page.active !== false} 
                      onChange={e => updateServicePage(idx, 'active', e.target.checked)} 
                    /> 
                    <span style={{ color: page.active !== false ? '#2E7D32' : '#B41E1E' }}>
                      {page.active !== false ? '✅ Actif' : '❌ Inactif'}
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Ordre : 
                    <input 
                      type="number" 
                      value={page.order_index || 0} 
                      onChange={e => updateServicePage(idx, 'order_index', parseInt(e.target.value) || 0)} 
                      style={{ width: '60px', padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px' }} 
                    />
                  </label>
                  <span style={{ fontSize: '0.8rem', color: '#999' }}>
                    Page key: {page.page_key || 'non défini'}
                  </span>
                </div>
              </div>
            ))
          )}
          
          <button onClick={saveServicePages} style={{ 
            marginTop: '1.5rem', 
            background: '#2E7D32', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}>
            💾 Sauvegarder toutes les pages services
          </button>
        </section>
      )}

      {/* ================= ONGLET PAGES CONTACT ================= */}
      {activeTab === 'contactPages' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>📞 Pages Contact</h2>
          {contactPages.map((page, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Titre" value={page.title} onChange={e => updateContactPage(idx, 'title', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <textarea placeholder="Contenu HTML" rows="4" value={page.content || ''} onChange={e => updateContactPage(idx, 'content', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Icône" value={page.icon || ''} onChange={e => updateContactPage(idx, 'icon', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <label><input type="checkbox" checked={page.active} onChange={e => updateContactPage(idx, 'active', e.target.checked)} /> Actif</label>
            </div>
          ))}
          <button onClick={saveContactPages} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET PARTENAIRES ================= */}
      {activeTab === 'partners' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>🤝 Partenaires</h2>
          <button onClick={addPartner}>➕ Ajouter un partenaire</button>
          {partners.map((p, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Nom" value={p.name} onChange={e => updatePartner(idx, 'name', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <UploadField
                label="Logo"
                value={p.logo_url}
                onValueChange={(url) => updatePartner(idx, 'logo_url', url)}
                folder="partners"
              />
              <input placeholder="Site web" value={p.website || ''} onChange={e => updatePartner(idx, 'website', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <textarea placeholder="Description" rows="2" value={p.description || ''} onChange={e => updatePartner(idx, 'description', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <label><input type="checkbox" checked={p.active} onChange={e => updatePartner(idx, 'active', e.target.checked)} /> Actif</label>
              <button onClick={() => deletePartner(idx)} style={{ background: '#B41E1E', color: 'white', marginLeft: '10px' }}>🗑 Supprimer</button>
            </div>
          ))}
          <button onClick={savePartners} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET CERTIFICATIONS ================= */}
      {activeTab === 'certifications' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>🏅 Certifications</h2>
          <button onClick={addCertification}>➕ Ajouter une certification</button>
          {certifications.map((c, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Nom" value={c.name} onChange={e => updateCertification(idx, 'name', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <UploadField
                label="Logo"
                value={c.logo_url}
                onValueChange={(url) => updateCertification(idx, 'logo_url', url)}
                folder="certifications"
              />
              <input placeholder="Émetteur" value={c.issuer || ''} onChange={e => updateCertification(idx, 'issuer', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Année" type="number" value={c.year || new Date().getFullYear()} onChange={e => updateCertification(idx, 'year', parseInt(e.target.value))} style={{ width: '100%', marginBottom: '8px' }} />
              <textarea placeholder="Description" rows="2" value={c.description || ''} onChange={e => updateCertification(idx, 'description', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <label><input type="checkbox" checked={c.active} onChange={e => updateCertification(idx, 'active', e.target.checked)} /> Actif</label>
              <button onClick={() => deleteCertification(idx)} style={{ background: '#B41E1E', color: 'white', marginLeft: '10px' }}>🗑 Supprimer</button>
            </div>
          ))}
          <button onClick={saveCertifications} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET ÉVÉNEMENTS ================= */}
      {activeTab === 'events' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>📅 Événements</h2>
          <button onClick={addEvent}>➕ Ajouter un événement</button>
          {events.map((e, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Titre" value={e.title} onChange={e => updateEvent(idx, 'title', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <textarea placeholder="Description" rows="2" value={e.description || ''} onChange={e => updateEvent(idx, 'description', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <UploadField
                label="Image"
                value={e.image_url}
                onValueChange={(url) => updateEvent(idx, 'image_url', url)}
                folder="events"
              />
              <input placeholder="Lieu" value={e.location || ''} onChange={e => updateEvent(idx, 'location', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input type="date" value={e.date?.slice(0,10) || ''} onChange={e => updateEvent(idx, 'date', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Lien d'inscription" value={e.registration_link || ''} onChange={e => updateEvent(idx, 'registration_link', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <label><input type="checkbox" checked={e.active} onChange={e => updateEvent(idx, 'active', e.target.checked)} /> Actif</label>
              <button onClick={() => deleteEvent(idx)} style={{ background: '#B41E1E', color: 'white', marginLeft: '10px' }}>🗑 Supprimer</button>
            </div>
          ))}
          <button onClick={saveEvents} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET OFFRES D'EMPLOI ================= */}
      {activeTab === 'jobs' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>💼 Offres d'emploi</h2>
          <button onClick={addJob}>➕ Ajouter une offre</button>
          {jobs.map((j, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
              <input placeholder="Titre du poste" value={j.title} onChange={e => updateJob(idx, 'title', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Département" value={j.department || ''} onChange={e => updateJob(idx, 'department', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Lieu" value={j.location || ''} onChange={e => updateJob(idx, 'location', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <select value={j.type || 'CDI'} onChange={e => updateJob(idx, 'type', e.target.value)} style={{ width: '100%', marginBottom: '8px' }}>
                <option>CDI</option><option>CDD</option><option>Stage</option><option>Freelance</option>
              </select>
              <textarea placeholder="Description" rows="3" value={j.description || ''} onChange={e => updateJob(idx, 'description', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <textarea placeholder="Exigences" rows="2" value={j.requirements || ''} onChange={e => updateJob(idx, 'requirements', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <input placeholder="Email de contact" value={j.contact_email || ''} onChange={e => updateJob(idx, 'contact_email', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} />
              <label><input type="checkbox" checked={j.active} onChange={e => updateJob(idx, 'active', e.target.checked)} /> Actif</label>
              <button onClick={() => deleteJob(idx)} style={{ background: '#B41E1E', color: 'white', marginLeft: '10px' }}>🗑 Supprimer</button>
            </div>
          ))}
          <button onClick={saveJobs} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Sauvegarder</button>
        </section>
      )}

      {/* ================= ONGLET NEWSLETTER ================= */}
      {activeTab === 'newsletter' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>📧 Abonnés Newsletter</h2>
          <button onClick={exportNewsletter} style={{ background: '#0A4D8C', color: 'white', marginBottom: '1rem' }}>📥 Exporter les emails (CSV)</button>
          <p>Total abonnés: {newsletter.length}</p>
          {newsletter.length === 0 ? (
            <p>Aucun abonné.</p>
          ) : (
            newsletter.map((sub, idx) => (
              <div key={idx} style={{ border: '1px solid #ddd', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>{sub.email}</strong> - Inscrit le {new Date(sub.subscribed_at).toLocaleDateString()}</span>
                <button onClick={() => deleteNewsletter(idx)} style={{ background: '#B41E1E', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>🗑 Supprimer</button>
              </div>
            ))
          )}
        </section>
      )}

      {/* ================= ONGLET PAIEMENTS ================= */}
      {activeTab === 'payments' && (
        <section style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>💳 Preuves de paiement</h2>
          {payments.length === 0 ? (
            <p>Aucun paiement soumis.</p>
          ) : (
            payments.map(payment => (
              <div key={payment.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
                <p><strong>Commande :</strong> #{payment.orders?.order_number || payment.order_id}</p>
                <p><strong>Client :</strong> {payment.orders?.user_name || payment.user_id}</p>
                <p><strong>Email :</strong> {payment.orders?.email}</p>
                <p><strong>Méthode :</strong> {payment.method === 'mobile_money' ? 'Mobile Money' : 'Virement bancaire'}</p>
                <p><strong>Montant :</strong> {payment.amount} €</p>
                <p><strong>Référence :</strong> {payment.reference || 'Non renseignée'}</p>
                <p><strong>Statut :</strong> <span style={{ fontWeight: 'bold', color: payment.status === 'pending' ? '#FF9800' : payment.status === 'verified' ? '#4CAF50' : '#B41E1E' }}>{payment.status}</span></p>
                <p><strong>Soumis le :</strong> {new Date(payment.submitted_at).toLocaleString('fr-FR')}</p>
                {payment.proof_url && (
                  <div>
                    <p><strong>Preuve :</strong></p>
                    <a href={payment.proof_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0A4D8C' }}>📎 Voir la preuve</a>
                    <img src={payment.proof_url} alt="Preuve" style={{ maxWidth: '200px', maxHeight: '200px', display: 'block', marginTop: '8px', border: '1px solid #ddd', borderRadius: '8px' }} />
                  </div>
                )}
                <div style={{ marginTop: '1rem' }}>
                  {payment.status === 'pending' && (
                    <>
                      <button
                        onClick={async () => {
                          await supabase.from('payments').update({ status: 'verified', verified_at: new Date().toISOString() }).eq('id', payment.id);
                          await supabase.from('orders').update({ status: 'paid' }).eq('id', payment.order_id);
                          alert('✅ Paiement validé');
                          loadAllData();
                        }}
                        style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
                      >
                        ✅ Valider
                      </button>
                      <button
                        onClick={async () => {
                          await supabase.from('payments').update({ status: 'rejected' }).eq('id', payment.id);
                          alert('❌ Paiement rejeté');
                          loadAllData();
                        }}
                        style={{ background: '#B41E1E', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        ❌ Rejeter
                      </button>
                    </>
                  )}
                  {payment.status === 'verified' && (
                    <span style={{ color: '#4CAF50' }}>✅ Déjà validé</span>
                  )}
                  {payment.status === 'rejected' && (
                    <span style={{ color: '#B41E1E' }}>❌ Rejeté</span>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}

export default AdminPanel;
