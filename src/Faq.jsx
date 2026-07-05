// src/pages/Faq.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState([]);

  // Charger les FAQ depuis Supabase
  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true });

      if (error) {
        console.error('Erreur chargement FAQ:', error);
        setFaqs([]);
      } else {
        setFaqs(data || []);
        setFilteredFaqs(data || []);
      }
      setLoading(false);
    };

    fetchFaqs();
  }, []);

  // Filtrer les FAQ par recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFaqs(faqs);
    } else {
      const filtered = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFaqs(filtered);
    }
  }, [searchTerm, faqs]);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner"></div>
        <p>Chargement des FAQ...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroBackground}>
          <img src="/fond-faq.png" alt="FAQ" style={styles.heroBgImage} />
          <div style={styles.heroOverlay}></div>
        </div>
        <div style={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 style={styles.title}>❓ Foire Aux <span style={styles.titleAccent}>Questions</span></h1>
            <p style={styles.subtitle}>Trouvez rapidement des réponses à vos interrogations</p>
          </motion.div>
        </div>
      </section>

      {/* Search & Stats */}
      <section style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button
                style={styles.clearBtn}
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
          <div style={styles.statsBadge}>
            {filteredFaqs.length} question{filteredFaqs.length > 1 && 's'}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section style={styles.faqSection}>
        {filteredFaqs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.emptyState}
          >
            <span style={styles.emptyIcon}>🔍</span>
            <p>Aucune question ne correspond à votre recherche</p>
            <button
              onClick={() => setSearchTerm('')}
              style={styles.resetBtn}
            >
              Réinitialiser la recherche
            </button>
          </motion.div>
        ) : (
          <div style={styles.faqList}>
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={styles.faqItem}
                className="faq-item"
              >
                <motion.button
                  style={styles.faqQuestion}
                  onClick={() => toggleFaq(index)}
                  whileHover={{ backgroundColor: '#f0f4f8' }}
                >
                  <span style={styles.faqIcon}>
                    {activeIndex === index ? '−' : '+'}
                  </span>
                  <span style={styles.faqQuestionText}>{faq.question}</span>
                </motion.button>
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={styles.faqAnswer}
                    >
                      <div style={styles.faqAnswerContent}>
                        <p>{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Contact Section */}
      <section style={styles.contactSection}>
        <div className="glass-card" style={styles.contactCard}>
          <h2 style={styles.contactTitle}>💬 Vous n'avez pas trouvé votre réponse ?</h2>
          <p style={styles.contactText}>
            Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons dans les plus brefs délais.
          </p>
          <div style={styles.contactButtons}>
            <a href="/contact" className="btn-primary-shop">
              📞 Nous contacter
            </a>
            <a href="/support" className="btn-secondary">
              💬 Support en ligne
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

// ========== STYLES ==========
const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f9fa',
    paddingTop: '80px'
  },
  hero: {
    minHeight: '40vh',
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
    fontSize: '1.2rem',
    opacity: 0.9
  },
  searchSection: {
    padding: '2rem 20px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  searchContainer: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
    minWidth: '250px'
  },
  searchIcon: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1rem',
    color: '#999'
  },
  searchInput: {
    width: '100%',
    padding: '14px 45px 14px 45px',
    borderRadius: '50px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s',
    backgroundColor: 'white'
  },
  clearBtn: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#999',
    padding: '0 5px'
  },
  statsBadge: {
    background: '#0A4D8C',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '50px',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap'
  },
  faqSection: {
    padding: '2rem 20px 4rem',
    maxWidth: '900px',
    margin: '0 auto'
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.3s ease'
  },
  faqQuestion: {
    width: '100%',
    padding: '1.2rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.2s ease',
    fontSize: '1rem',
    color: '#1A2A3A'
  },
  faqIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#0A4D8C',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    flexShrink: 0
  },
  faqQuestionText: {
    flex: 1,
    fontWeight: '500'
  },
  faqAnswer: {
    overflow: 'hidden'
  },
  faqAnswerContent: {
    padding: '0 1.5rem 1.5rem 4rem',
    color: '#4a5568',
    lineHeight: '1.6',
    fontSize: '0.95rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#6C757D'
  },
  emptyIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '1rem'
  },
  resetBtn: {
    marginTop: '1rem',
    padding: '8px 20px',
    background: '#0A4D8C',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '3rem',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  contactSection: {
    padding: '4rem 20px',
    background: '#f0f4f8',
    textAlign: 'center'
  },
  contactCard: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '3rem',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
  },
  contactTitle: {
    fontSize: '1.8rem',
    color: '#0A4D8C',
    marginBottom: '1rem'
  },
  contactText: {
    fontSize: '1rem',
    color: '#6C757D',
    marginBottom: '2rem',
    lineHeight: '1.6'
  },
  contactButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  }
};

// Injecter les styles globaux pour les boutons
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .btn-primary-shop {
    background: linear-gradient(135deg, #FF9800, #FFC107);
    color: white;
    padding: 12px 28px;
    border-radius: 40px;
    text-decoration: none;
    font-weight: bold;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    display: inline-block;
    box-shadow: 0 3px 12px rgba(255,152,0,0.3);
  }
  .btn-primary-shop:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255,152,0,0.5);
  }
  .btn-secondary {
    background: rgba(255,255,255,0.95);
    color: #0A4D8C;
    padding: 12px 28px;
    border-radius: 40px;
    text-decoration: none;
    font-weight: bold;
    transition: all 0.3s ease;
    border: 1px solid rgba(10,77,140,0.3);
    cursor: pointer;
    display: inline-block;
  }
  .btn-secondary:hover {
    background: white;
    transform: translateY(-2px);
    border-color: #0A4D8C;
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }
  .faq-item:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #0A4D8C;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Faq;
