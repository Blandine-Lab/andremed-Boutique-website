// src/pages/About.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase'; // ✅ Client centralisé

function About() {
  const [settings, setSettings] = useState({
    about_description: '',
    about_mission: '',
    about_vision: '',
    foundation_year: 2017,
    team_members: 15,
    projects_done: 100
  });
  const [cities, setCities] = useState([]); // ✅ Villes dynamiques
  const [loading, setLoading] = useState(true);

  // ========== MEMBRES DE L'ÉQUIPE ==========
  const teamMembers = [
    {
      id: 1,
      name: "Marthe MUSIMBI",
      role: "Comptable",
      bio: "Une comptable assurant la gestion financière et la transparence.",
      photo_url: "/team/Marthe.jpeg"
    },
    {
      id: 2,
      name: "Cléophas MASUDI",
      role: "Ir Biomedical",
      bio: "Ingénieur technicien spécialisé dans le montage et l'intégration des solutions médicales.",
      photo_url: "/team/Cleophas.jpeg"
    },
    {
      id: 3,
      name: "Papy SIMOKO",
      role: "Support technique & Logistique",
      bio: "Technicien support spécialisé dans l'installation, la maintenance et l'intégration des équipements médicaux.",
      photo_url: "/team/Papy.jpeg"
    },
    {
      id: 4,
      name: "Joël KASUMBA",
      role: "Pharmacien",
      bio: "Pharmacien spécialisé dans la gestion des produits de santé.",
      photo_url: "/team/Joel.jpeg"
    },
    {
      id: 5,
      name: "Josué MWENELWATA",
      role: "Chargé de conformité de commande",
      bio: "Chargé de conformité de commande, garantissant la conformité des commandes aux normes et réglementations en vigueur.",
      photo_url: "/team/Josue.jpeg"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Charger les paramètres
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

      // ✅ Charger les villes actives depuis la table cities_coverage
      const { data: citiesData } = await supabase
        .from('cities_coverage')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true });

      if (settingsData) {
        setSettings({
          about_description: settingsData.about_description || '',
          about_mission: settingsData.about_mission || '',
          about_vision: settingsData.about_vision || '',
          foundation_year: settingsData.foundation_year || 2017,
          team_members: settingsData.team_members || 15,
          projects_done: settingsData.projects_done || 100
        });
      }

      if (citiesData) {
        setCities(citiesData);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // ========== STATISTIQUES ==========
  // ✅ Le nombre de villes est calculé dynamiquement
  const stats = [
    { value: settings.foundation_year, suffix: "", label: "Année de fondation", image: "/cities/calendrier.png" },
    { value: cities.length, suffix: "", label: "Villes couvertes", image: "/cities/carte.png" },
    { value: settings.team_members, suffix: "+", label: "Membres d'équipe", image: "/cities/membre.png" },
    { value: settings.projects_done, suffix: "+", label: "Projets réalisés", image: "/cities/projet.png" }
  ];

  const valeurs = [
    { title: "Qualité", desc: "Des produits certifiés CE/ISO provenant de partenaires européens et asiatiques de renom", icon: "⭐" },
    { title: "Accessibilité", desc: "Faciliter l'accès aux équipements et consommables médicaux partout en RDC", icon: "🌍" },
    { title: "Innovation", desc: "Intégrer des solutions technologiques modernes pour la santé", icon: "💡" },
    { title: "Fiabilité", desc: "Une équipe qualifiée et disponible pour assurer un service continu", icon: "🤝" },
    { title: "Engagement", desc: "Contribuer activement au renforcement du système de santé congolais", icon: "❤️" }
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Chargement...</div>;
  }

  return (
    <div style={styles.container}>
      {/* HERO SECTION */}
      <section style={styles.hero}>
        <div style={styles.heroBackground}>
          <img src="/fond-histoire.png" alt="ANDREMED HISTOIRE" style={styles.heroBgImage} />
          <div style={styles.heroOverlay}></div>
        </div>
        <div style={styles.heroContent}>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 style={styles.title}>✨ À PROPOS DE <span style={styles.titleAccent}>NOUS</span></h1>
            <p style={styles.subtitle}>ANDREMEDPROSPERITY DIAGNOSTICS</p>
            <p style={styles.description}>
              {settings.about_description ||
                "Être le partenaire de confiance des hôpitaux et institutions de santé en RDC et en Afrique, en garantissant la disponibilité d'équipements médicaux modernes et en accompagnant nos clients avec des services adaptés (installation, formation, maintenance)."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card" style={styles.statCard}>
              <div style={styles.statImageContainer}>
                <img src={stat.image} alt={stat.label} style={styles.statImage} onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <div style={styles.statValue}>{stat.value}{stat.suffix}</div>
              <p style={styles.statLabel}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section style={styles.missionSection}>
        <div style={styles.missionContainer}>
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} className="glass-card" style={styles.missionCard}>
            <div style={styles.missionImageContainer}>
              <img src="/cities/mission.png" alt="Notre Mission" style={styles.missionImage} onError={(e) => e.target.style.display = 'none'} />
            </div>
            <h2 style={styles.sectionTitle}>🎯 Notre Mission</h2>
            <p style={styles.missionText}>{settings.about_mission || "Fournir aux hôpitaux, cliniques et laboratoires des solutions fiables, innovantes et accessibles, afin de contribuer à l'amélioration durable de la qualité des soins offerts aux populations."}</p>
            <div style={styles.missionPoints}>
              <span>✅ Solutions médicales innovantes</span>
              <span>✅ Équipements certifiés et fiables</span>
              <span>✅ Support technique complet</span>
              <span>✅ Formation du personnel médical</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} className="glass-card" style={styles.visionCard}>
            <div style={styles.visionImageContainer}>
              <img src="/cities/vision.png" alt="Notre Vision" style={styles.visionImage} onError={(e) => e.target.style.display = 'none'} />
            </div>
            <h2 style={styles.sectionTitle}>👁️ Notre Vision</h2>
            <p style={styles.visionText}>{settings.about_vision || "Être le partenaire de confiance des hôpitaux et institutions de santé en RDC et en Afrique, en garantissant la disponibilité d'équipements médicaux modernes et en accompagnant nos clients avec des services adaptés (installation, formation, maintenance)."}</p>
          </motion.div>
        </div>
      </section>

      {/* Valeurs */}
      <section style={styles.valuesSection}>
        <h2 style={styles.sectionTitle}>✨ Nos Valeurs</h2>
        <p style={styles.sectionSubtitle}>Les principes qui guident notre action quotidienne</p>
        <div style={styles.valuesGrid}>
          {valeurs.map((v, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="glass-card" style={styles.valueCard}>
              <div style={styles.valueIcon}>{v.icon}</div>
              <h3 style={styles.valueTitle}>{v.title}</h3>
              <p style={styles.valueDesc}>{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ✅ Présence – dynamique depuis Supabase */}
      <section style={styles.presenceSection}>
        <h2 style={styles.sectionTitle}>📍 Notre Présence</h2>
        <p style={styles.sectionSubtitle}>Une implantation multisectorielle pour être au plus proche de vos besoins</p>
        {cities.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6C757D' }}>Aucune ville enregistrée pour le moment.</p>
        ) : (
          <div style={styles.presenceGrid}>
            {cities.map((city) => {
              const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city.city_name + ', RDC')}`;
              return (
                <a
                  key={city.id}
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="glass-card"
                    style={styles.presenceCard}
                  >
                    <div style={styles.presenceImageContainer}>
                      {city.image_url ? (
                        <img
                          src={city.image_url}
                          alt={city.city_name}
                          style={styles.presenceImage}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            parent.style.display = 'flex';
                            parent.style.alignItems = 'center';
                            parent.style.justifyContent = 'center';
                            parent.style.backgroundColor = '#0A4D8C';
                            parent.style.color = 'white';
                            parent.style.fontSize = '2.5rem';
                            parent.style.fontWeight = 'bold';
                            parent.innerText = city.city_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                          }}
                        />
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
                          {city.city_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div style={styles.presenceIcon}>📍</div>
                    <h3 style={styles.presenceCity}>{city.city_name}</h3>
                    <p style={styles.presenceRegion}>{city.region || 'RDC'}</p>
                    <p style={styles.presenceAddress}>{city.address || 'Représentation'}</p>
                  </motion.div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* Équipe */}
      <section style={styles.teamSection}>
        <h2 style={styles.sectionTitle}>👥 Notre Équipe d'Excellence</h2>
        <p style={styles.sectionSubtitle}>Nous croyons fermement que la qualité des services repose sur les compétences humaines.</p>
        <div style={styles.teamGrid}>
          {teamMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="glass-card"
              style={styles.teamCard}
            >
              <div style={styles.teamImageContainer}>
                <img 
                  src={member.photo_url} 
                  alt={member.name} 
                  style={styles.teamImage} 
                  onError={(e) => { e.target.src = '/placeholder.png'; }} 
                />
              </div>
              <h3 style={styles.teamName}>{member.name}</h3>
              <p style={styles.teamRole}>{member.role}</p>
              <p style={styles.teamDesc}>{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ========== STYLES (inchangés) ==========
const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f9fa',
    paddingTop: '80px'
  },
  hero: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0
  },
  heroBgImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(10,77,140,0.85), rgba(0,163,178,0.85))'
  },
  heroContent: {
    textAlign: 'center',
    zIndex: 2,
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
    color: 'white'
  },
  title: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  titleAccent: {
    background: 'linear-gradient(135deg, #FFD166, #FFF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    opacity: 0.9
  },
  description: {
    fontSize: '1.1rem',
    maxWidth: '800px',
    margin: '0 auto',
    lineHeight: '1.6',
    opacity: 0.9
  },
  statsSection: {
    padding: '60px 20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem'
  },
  statCard: {
    textAlign: 'center',
    padding: '2rem',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
  },
  statImageContainer: {
    width: '60px',
    height: '60px',
    margin: '0 auto 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#0A4D8C',
    marginBottom: '0.5rem'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#6C757D'
  },
  missionSection: {
    padding: '60px 20px',
    background: '#f0f4f8'
  },
  missionContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  missionCard: {
    padding: '2rem',
    background: 'white',
    borderRadius: '20px',
    textAlign: 'center'
  },
  missionImageContainer: {
    width: '100%',
    maxWidth: '200px',
    margin: '0 auto 1rem'
  },
  missionImage: {
    width: '100%',
    height: 'auto',
    objectFit: 'contain'
  },
  missionText: {
    fontSize: '1rem',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
    color: '#1A2A3A'
  },
  missionPoints: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  visionCard: {
    padding: '2rem',
    background: 'white',
    borderRadius: '20px',
    textAlign: 'center'
  },
  visionImageContainer: {
    width: '100%',
    maxWidth: '200px',
    margin: '0 auto 1rem'
  },
  visionImage: {
    width: '100%',
    height: 'auto',
    objectFit: 'contain'
  },
  sectionTitle: {
    fontSize: '1.8rem',
    color: '#0A4D8C',
    marginBottom: '1rem'
  },
  visionText: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#1A2A3A'
  },
  valuesSection: {
    padding: '60px 20px',
    textAlign: 'center',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  sectionSubtitle: {
    fontSize: '1rem',
    color: '#6C757D',
    marginBottom: '3rem'
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '2rem'
  },
  valueCard: {
    padding: '2rem',
    background: 'white',
    borderRadius: '20px',
    textAlign: 'center'
  },
  valueIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem'
  },
  valueTitle: {
    fontSize: '1.2rem',
    color: '#0A4D8C',
    marginBottom: '0.5rem'
  },
  valueDesc: {
    fontSize: '0.85rem',
    color: '#6C757D'
  },
  presenceSection: {
    padding: '60px 20px',
    background: '#f0f4f8',
    textAlign: 'center'
  },
  presenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  presenceCard: {
    padding: '1.5rem',
    background: 'white',
    borderRadius: '20px',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
    cursor: 'pointer'
  },
  presenceImageContainer: {
    width: '100%',
    height: '150px',
    marginBottom: '1rem',
    overflow: 'hidden',
    borderRadius: '12px'
  },
  presenceImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },
  presenceIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem'
  },
  presenceCity: {
    fontSize: '1.2rem',
    color: '#0A4D8C',
    marginBottom: '0.5rem'
  },
  presenceRegion: {
    fontSize: '0.85rem',
    color: '#00A3B2',
    marginBottom: '0.5rem'
  },
  presenceAddress: {
    fontSize: '0.75rem',
    color: '#6C757D'
  },
  teamSection: {
    padding: '60px 20px',
    textAlign: 'center',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem'
  },
  teamCard: {
    padding: '1.5rem',
    background: 'white',
    borderRadius: '20px',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
    cursor: 'pointer'
  },
  teamImageContainer: {
    width: '120px',
    height: '120px',
    margin: '0 auto 1rem',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid #0A4D8C',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
  },
  teamImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  teamName: {
    fontSize: '1.1rem',
    color: '#0A4D8C',
    marginBottom: '0.3rem'
  },
  teamRole: {
    fontSize: '0.85rem',
    color: '#00A3B2',
    marginBottom: '0.5rem',
    fontWeight: 'bold'
  },
  teamDesc: {
    fontSize: '0.8rem',
    color: '#6C757D'
  }
};

export default About;