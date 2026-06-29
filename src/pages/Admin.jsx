import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [news, setNews] = useState([]);
  const [about, setAbout] = useState(null);
  const [team, setTeam] = useState([]);
  const [contact, setContact] = useState({});
  const [social, setSocial] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Vérification du mot de passe
  const handleLogin = async (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setAuthenticated(true);
      loadData();
    } else {
      alert('Mot de passe incorrect');
    }
  };

  // Chargement des données
  const loadData = async () => {
    const res = await fetch('/api/site-data');
    const data = await res.json();
    setNews(data.news);
    setAbout(data.about);
    setTeam(data.about.team);
    setContact(data.about.contact);
    setSocial(data.about.social);
    setLoading(false);
  };

  // Sauvegarde des actualités
  const saveNews = async () => {
    const res = await fetch('/api/admin/update-news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword: 'admin123', news })
    });
    if (res.ok) alert('Actualités mises à jour');
    else alert('Erreur');
  };

  // Ajout d'une actualité
  const addNews = () => {
    const newId = Math.max(...news.map(n => n.id), 0) + 1;
    setNews([...news, {
      id: newId,
      type: 'promotion',
      title: 'Nouvelle promotion',
      description: 'Description',
      date: 'À venir',
      icon: '🎉',
      productLink: '/shop'
    }]);
  };

  const updateNewsField = (id, field, value) => {
    setNews(news.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const deleteNews = (id) => {
    setNews(news.filter(item => item.id !== id));
  };

  // Sauvegarde des coordonnées
  const saveContact = async () => {
    const res = await fetch('/api/admin/update-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword: 'admin123', contact })
    });
    if (res.ok) alert('Coordonnées mises à jour');
    else alert('Erreur');
  };

  // Sauvegarde des réseaux sociaux
  const saveSocial = async () => {
    const res = await fetch('/api/admin/update-social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword: 'admin123', social })
    });
    if (res.ok) alert('Liens sociaux mis à jour');
    else alert('Erreur');
  };

  // Gestion de l'équipe
  const addTeamMember = () => {
    setTeam([...team, { name: 'Nouveau membre', role: 'Rôle', photo: '/team/default.jpg', bio: '' }]);
  };

  const updateTeamMember = (index, field, value) => {
    const updated = [...team];
    updated[index][field] = value;
    setTeam(updated);
  };

  const deleteTeamMember = (index) => {
    setTeam(team.filter((_, i) => i !== index));
  };

  const saveTeam = async () => {
    const res = await fetch('/api/admin/update-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword: 'admin123', team })
    });
    if (res.ok) alert('Équipe mise à jour');
    else alert('Erreur');
  };

  // Sauvegarde globale de "À propos" (texte, vision, mission)
  const saveAboutText = async () => {
    const updatedAbout = { ...about, team };
    const res = await fetch('/api/admin/update-about', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword: 'admin123', about: updatedAbout })
    });
    if (res.ok) alert('Texte "À propos" mis à jour');
    else alert('Erreur');
  };

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

  if (loading) return <div>Chargement...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Panneau d'administration</h1>
      <button onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>Retour au site</button>

      {/* SECTION ACTUALITÉS */}
      <section style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
        <h2>Actualités & Promotions</h2>
        <button onClick={addNews}>➕ Ajouter une actualité</button>
        {news.map(item => (
          <div key={item.id} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem' }}>
            <div><label>Type :</label> <input value={item.type} onChange={e => updateNewsField(item.id, 'type', e.target.value)} /></div>
            <div><label>Titre :</label> <input value={item.title} onChange={e => updateNewsField(item.id, 'title', e.target.value)} style={{ width: '100%' }} /></div>
            <div><label>Description :</label> <textarea value={item.description} onChange={e => updateNewsField(item.id, 'description', e.target.value)} rows="2" style={{ width: '100%' }} /></div>
            <div><label>Date :</label> <input value={item.date} onChange={e => updateNewsField(item.id, 'date', e.target.value)} /></div>
            <div><label>Icône (emoji) :</label> <input value={item.icon} onChange={e => updateNewsField(item.id, 'icon', e.target.value)} /></div>
            <div><label>Lien produit (ex: /shop) :</label> <input value={item.productLink || ''} onChange={e => updateNewsField(item.id, 'productLink', e.target.value)} /></div>
            <button onClick={() => deleteNews(item.id)} style={{ background: '#B41E1E', color: 'white' }}>🗑 Supprimer</button>
          </div>
        ))}
        <button onClick={saveNews} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Enregistrer toutes les actualités</button>
      </section>

      {/* SECTION À PROPOS (texte) */}
      <section style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
        <h2>À propos – Texte principal</h2>
        <div><label>Titre :</label> <input value={about.title} onChange={e => setAbout({ ...about, title: e.target.value })} style={{ width: '100%' }} /></div>
        <div><label>Description :</label> <textarea value={about.description} onChange={e => setAbout({ ...about, description: e.target.value })} rows="4" style={{ width: '100%' }} /></div>
        <div><label>Vision :</label> <textarea value={about.vision} onChange={e => setAbout({ ...about, vision: e.target.value })} rows="2" style={{ width: '100%' }} /></div>
        <div><label>Mission :</label> <textarea value={about.mission} onChange={e => setAbout({ ...about, mission: e.target.value })} rows="2" style={{ width: '100%' }} /></div>
        <button onClick={saveAboutText}>💾 Enregistrer le texte</button>
      </section>

      {/* SECTION COORDONNÉES (téléphone, email, adresse) */}
      <section style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
        <h2>Coordonnées</h2>
        <div><label>Téléphone 1 :</label> <input value={contact.phone1} onChange={e => setContact({ ...contact, phone1: e.target.value })} /></div>
        <div><label>Téléphone 2 :</label> <input value={contact.phone2} onChange={e => setContact({ ...contact, phone2: e.target.value })} /></div>
        <div><label>Email :</label> <input value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} /></div>
        <div><label>Email support :</label> <input value={contact.supportEmail} onChange={e => setContact({ ...contact, supportEmail: e.target.value })} /></div>
        <div><label>Adresse :</label> <textarea value={contact.address} onChange={e => setContact({ ...contact, address: e.target.value })} rows="2" style={{ width: '100%' }} /></div>
        <button onClick={saveContact}>💾 Enregistrer les coordonnées</button>
      </section>

      {/* SECTION RÉSEAUX SOCIAUX */}
      <section style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
        <h2>Réseaux sociaux</h2>
        <div><label>Facebook :</label> <input value={social.facebook} onChange={e => setSocial({ ...social, facebook: e.target.value })} style={{ width: '100%' }} /></div>
        <div><label>LinkedIn :</label> <input value={social.linkedin} onChange={e => setSocial({ ...social, linkedin: e.target.value })} style={{ width: '100%' }} /></div>
        <div><label>TikTok :</label> <input value={social.tiktok} onChange={e => setSocial({ ...social, tiktok: e.target.value })} style={{ width: '100%' }} /></div>
        <button onClick={saveSocial}>💾 Enregistrer les liens</button>
      </section>

      {/* SECTION ÉQUIPE */}
      <section style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
        <h2>Équipe</h2>
        <button onClick={addTeamMember}>➕ Ajouter un membre</button>
        {team.map((member, idx) => (
          <div key={idx} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem' }}>
            <div><label>Nom :</label> <input value={member.name} onChange={e => updateTeamMember(idx, 'name', e.target.value)} /></div>
            <div><label>Rôle :</label> <input value={member.role} onChange={e => updateTeamMember(idx, 'role', e.target.value)} /></div>
            <div><label>Photo (URL) :</label> <input value={member.photo} onChange={e => updateTeamMember(idx, 'photo', e.target.value)} style={{ width: '100%' }} /></div>
            <div><label>Biographie :</label> <textarea value={member.bio} onChange={e => updateTeamMember(idx, 'bio', e.target.value)} rows="3" style={{ width: '100%' }} /></div>
            <button onClick={() => deleteTeamMember(idx)} style={{ background: '#B41E1E', color: 'white' }}>🗑 Supprimer</button>
          </div>
        ))}
        <button onClick={saveTeam} style={{ marginTop: '1rem', background: '#2E7D32', color: 'white' }}>💾 Enregistrer l’équipe</button>
      </section>
    </div>
  );
}

export default Admin;