// src/pages/Realisations.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { supabase } from '../lib/supabase';

function Realisations() {
  const [realisations, setRealisations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vidéo tournante (4 vidéos)
  const realisationVideos = ['/Livraison1.mp4', '/Livraison2.mp4', '/Livraison3.mp4', '/Livraison4.mp4'];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % realisationVideos.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Charger les réalisations depuis Supabase
  useEffect(() => {
    const fetchRealisations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('realisations')
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true });

      if (error) {
        console.error('Erreur chargement réalisations:', error);
      } else {
        setRealisations(data || []);
      }
      setLoading(false);
    };

    fetchRealisations();
  }, []);

  // Compteurs (statistiques)
  const [counters, setCounters] = useState({
    projets: 0,
    villes: 0,
    institutions: 0,
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
      animateCounter('projets', 50);
      animateCounter('villes', 6);
      animateCounter('institutions', 25);
      animateCounter('satisfaction', 100);
    }
  }, [statsInView]);

  return (
    <div style={styles.container}>
      {/* Hero Section avec vidéo tournante (sans overlay) */}
      <section style={styles.hero}>
        <div style={styles.videoBackground}>
          <AnimatePresence mode="wait">
            <motion.video
              key={currentVideoIndex}
              autoPlay
              loop
              muted
              playsInline
              style={styles.backgroundVideo}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <source src={realisationVideos[currentVideoIndex]} type="video/mp4" />
            </motion.video>
          </AnimatePresence>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={styles.heroContent}
        >
          <h1 style={styles.title}>
            📊 NOS <span style={styles.titleAccent}>SOLUTIONS</span>
          </h1>
          <p style={styles.subtitle}>Réalisations & Impact</p>
          <p style={styles.description}>
            Depuis sa création, ANDREMED – PROSPERITY DIAGNOSTICS s'engage à accompagner les institutions de santé
            en République Démocratique du Congo dans la modernisation de leurs plateaux techniques.
          </p>
        </motion.div>
      </section>

      {/* Section Statistiques */}
      <section ref={statsRef} style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <div className="glass-card" style={styles.statCard}>
            <div style={styles.statIcon}>🏥</div>
            <div style={styles.statNumber}>{counters.projets}+</div>
            <p style={styles.statLabel}>Projets Réalisés</p>
          </div>
          <div className="glass-card" style={styles.statCard}>
            <div style={styles.statIcon}>📍</div>
            <div style={styles.statNumber}>{counters.villes}</div>
            <p style={styles.statLabel}>Villes Couvertes</p>
          </div>
          <div className="glass-card" style={styles.statCard}>
            <div style={styles.statIcon}>🤝</div>
            <div style={styles.statNumber}>{counters.institutions}+</div>
            <p style={styles.statLabel}>Institutions Partenaires</p>
          </div>
          <div className="glass-card" style={styles.statCard}>
            <div style={styles.statIcon}>⭐</div>
            <div style={styles.statNumber}>{counters.satisfaction}%</div>
            <p style={styles.statLabel}>Satisfaction Client</p>
          </div>
        </div>
      </section>

      {/* Galerie des réalisations (dynamique depuis Supabase) */}
      <section style={styles.gallerySection}>
        <h2 style={styles.sectionTitle}>🏆 Nos Réalisations Concrètes</h2>
        <p style={styles.sectionSubtitle}>Découvrez nos livraisons et installations à travers la RDC</p>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement des réalisations...</p>
        ) : realisations.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#6C757D' }}>
            Aucune réalisation enregistrée pour le moment.
          </p>
        ) : (
          <div style={styles.projectsList}>
            {realisations.map((project) => (
              <div key={project.id} style={styles.projectCard}>
                <h3 style={styles.projectTitle}>{project.project_label}</h3>
                <div style={styles.galleryGrid}>
                  {project.images && project.images.length > 0 ? (
                    project.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        style={styles.galleryItem}
                        className="gallery-item"
                      >
                        <img
                          src={imgUrl}
                          alt={`${project.project_label} ${idx + 1}`}
                          style={styles.galleryImage}
                          loading="lazy"
                          onError={(e) => { e.target.src = '/placeholder.png'; }}
                        />
                      </div>
                    ))
                  ) : (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999' }}>
                      Aucune image pour ce projet.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section Impact */}
      <section style={styles.impactSection}>
        <h2 style={styles.sectionTitle}>💪 Notre Impact</h2>
        <p style={styles.sectionSubtitle}>À travers ces projets, nous démontrons notre capacité à transformer le paysage médical congolais</p>
        <div style={styles.impactGrid}>
          {[
            { icon: "🔧", title: "Solutions Complètes", desc: "De la livraison à l'installation, nous gérons l'ensemble du processus", link: "/services" },
            { icon: "🏥", title: "Services Clés", desc: "Renforcement des services d'imagerie, dentisterie et laboratoires", link: "/services" },
            { icon: "🤝", title: "Accompagnement", desc: "Conseils techniques, formations et suivi de maintenance", link: "/services" },
            { icon: "⭐", title: "Partenariat Stratégique", desc: "Vision tournée vers la qualité, la fiabilité et l'innovation", link: "/services" }
          ].map((impact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="glass-card"
              style={styles.impactCard}
            >
              <div style={styles.impactIcon}>{impact.icon}</div>
              <h3 style={styles.impactTitle}>{impact.title}</h3>
              <p style={styles.impactDesc}>{impact.desc}</p>
              <a href={impact.link} style={styles.impactLink}>En savoir plus →</a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Partenaire Stratégique de Confiance */}
      <section style={styles.partnerSection}>
        <div className="glass-card" style={styles.partnerCard}>
          <h2 style={styles.partnerTitle}>🤝 Partenaire Stratégique de Confiance</h2>
          <p style={styles.partnerText}>
            Chaque partenariat réalisé confirme notre rôle de partenaire stratégique des institutions de santé en RDC,
            avec une vision tournée vers la qualité, la fiabilité et l'innovation.
          </p>
          <div style={styles.partnerStats}>
            <span>🏥 50+ Projets</span>
            <span>📍 6 Villes</span>
            <span>🤝 25+ Partenaires</span>
            <span>⭐ 100% Satisfaction</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ========== STYLES (inchangés) ==========
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    paddingTop: '80px'
  },
  hero: {
    position: 'relative',
    minHeight: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    overflow: 'hidden'
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0
  },
  backgroundVideo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    minWidth: '100%',
    minHeight: '100%',
    width: 'auto',
    height: 'auto',
    transform: 'translateX(-50%) translateY(-50%)',
    objectFit: 'cover'
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    color: 'white',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    textShadow: '1px 1px 4px rgba(0,0,0,0.3)'
  },
  title: {
    fontSize: '3.5rem',
    marginBottom: '1rem'
  },
  titleAccent: {
    background: 'linear-gradient(135deg, #fff, #FFD166)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '1.8rem',
    marginBottom: '1rem'
  },
  description: {
    fontSize: '1.1rem',
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
  statIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem'
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#0A4D8C'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#6C757D'
  },
  gallerySection: {
    padding: '60px 20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  sectionTitle: {
    fontSize: '2.5rem',
    color: '#0A4D8C',
    textAlign: 'center',
    marginBottom: '1rem'
  },
  sectionSubtitle: {
    fontSize: '1.1rem',
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: '3rem'
  },
  projectsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem'
  },
  projectCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.05)'
  },
  projectTitle: {
    fontSize: '1.5rem',
    color: '#0A4D8C',
    marginBottom: '20px',
    borderLeft: '4px solid #FF9800',
    paddingLeft: '15px'
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px'
  },
  galleryItem: {
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    cursor: 'pointer',
    width: '100%',
    paddingBottom: '100%',
    position: 'relative',
    transition: 'box-shadow 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  galleryImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  impactSection: {
    padding: '60px 20px',
    background: '#f0f4f8',
    textAlign: 'center'
  },
  impactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  impactCard: {
    padding: '2rem',
    background: 'white',
    borderRadius: '20px',
    textAlign: 'center',
    transition: 'all 0.3s'
  },
  impactIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem'
  },
  impactTitle: {
    fontSize: '1.3rem',
    color: '#0A4D8C',
    marginBottom: '0.5rem'
  },
  impactDesc: {
    fontSize: '0.9rem',
    color: '#6C757D',
    marginBottom: '1rem'
  },
  impactLink: {
    color: '#00A3B2',
    textDecoration: 'none',
    fontWeight: 'bold'
  },
  partnerSection: {
    padding: '60px 20px',
    textAlign: 'center'
  },
  partnerCard: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '3rem',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
  },
  partnerTitle: {
    fontSize: '2rem',
    color: '#0A4D8C',
    marginBottom: '1rem'
  },
  partnerText: {
    fontSize: '1rem',
    color: '#6C757D',
    marginBottom: '2rem',
    lineHeight: '1.6'
  },
  partnerStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
    fontSize: '1rem',
    color: '#0A4D8C',
    fontWeight: 'bold'
  }
};

// Effet de survol par ombre (pas de scale)
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .gallery-item:hover {
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  }
`;
document.head.appendChild(styleSheet);

export default Realisations;
