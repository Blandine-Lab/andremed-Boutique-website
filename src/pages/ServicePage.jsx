import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mobgoxdfmhkmqpiwyhhj.supabase.co',
  'sb_publishable_GcGYY4d9w-uPgavGF4mdYQ_T-IwO88o'
);

function ServicePage() {
  const { pageKey } = useParams();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      
      // Si pas de pageKey, essayer de déterminer depuis l'URL
      let key = pageKey;
      if (!key) {
        const path = window.location.pathname;
        // Enlever le premier slash
        let pathKey = path.substring(1);
        
        // Si c'est "services" ou vide, utiliser "services" par défaut
        if (!pathKey || pathKey === 'services') {
          key = 'services';
        } else {
          key = pathKey;
        }
      }
      
      console.log('🔍 Recherche de la page avec clé:', key);
      
      const { data, error } = await supabase
        .from('service_pages')
        .select('*')
        .eq('page_key', key)
        .eq('active', true)
        .single();
      
      if (error || !data) {
        console.error('❌ Erreur ou page non trouvée:', error);
        setError(true);
      } else {
        console.log('✅ Page trouvée:', data.title);
        setPageData(data);
      }
      setLoading(false);
    };
    
    fetchPageData();
  }, [pageKey]);

  // Ajouter un effet pour les redirections si nécessaire
  useEffect(() => {
    if (!pageKey && !loading && error) {
      // Rediriger vers la page par défaut après 2 secondes
      const timer = setTimeout(() => {
        navigate('/service/services');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pageKey, loading, error, navigate]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div style={styles.errorContainer}>
        <h1>Page non trouvée</h1>
        <p>Désolé, la page que vous recherchez n'existe pas.</p>
        <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
          Redirection vers la page d'accueil dans quelques secondes...
        </p>
        <Link to="/" className="btn-primary-shop" style={styles.backBtn}>
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={styles.heroTitle}
          >
            {pageData.icon} {pageData.title}
          </motion.h1>
        </div>
      </section>

      <section style={styles.contentSection}>
        <div style={styles.contentCard}>
          <div dangerouslySetInnerHTML={{ __html: pageData.content }} style={styles.contentHtml} />
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    paddingTop: '80px'
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '80px'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0A4D8C',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    paddingTop: '80px'
  },
  backBtn: {
    marginTop: '20px',
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#0A4D8C',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'background-color 0.3s'
  },
  hero: {
    position: 'relative',
    height: '30vh',
    minHeight: '250px',
    backgroundImage: 'url("/fond-accueil.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
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
    position: 'relative',
    zIndex: 2,
    color: 'white'
  },
  heroTitle: {
    fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
    marginBottom: '0.5rem'
  },
  contentSection: {
    padding: '60px 20px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  contentCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
  },
  contentHtml: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#4a5568'
  }
};

// Ajouter les styles d'animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (!document.head.querySelector('#service-page-styles')) {
  styleSheet.id = 'service-page-styles';
  document.head.appendChild(styleSheet);
}

export default ServicePage;