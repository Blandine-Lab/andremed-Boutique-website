// src/pages/Account.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase'; // ✅ UNIQUE client Supabase

function Account() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour les formulaires
  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Récupérer les commandes si utilisateur connecté
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Erreur chargement commandes :', err);
        setError('Impossible de charger vos commandes.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Souscription temps réel pour les mises à jour de statut
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === payload.new.id ? payload.new : order
          )
        );
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user]);

  // ========== FONCTIONS D'AUTHENTIFICATION (DIRECTEMENT SUPABASE) ==========

  const linkOrdersToUser = async (userId, email, phone) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ user_id: userId })
        .or(`email.eq.${email},phone.eq.${phone}`)
        .is('user_id', null);
      if (error) throw error;
    } catch (err) {
      console.error('Erreur liaison des commandes :', err);
      setFormError('Vos commandes existantes n\'ont pas pu être liées automatiquement. Contactez le support.');
    }
  };

  // Connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      // Recharger la page pour mettre à jour le contexte
      window.location.reload();
    } catch (err) {
      setFormError('Échec de la connexion : ' + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Inscription
  const handleSignup = async (e) => {
    e.preventDefault();
    setFormError('');

    if (signupPassword !== signupConfirm) {
      setFormError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (signupPassword.length < 6) {
      setFormError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }

    setFormLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
      });
      if (error) throw error;

      if (data.user) {
        await linkOrdersToUser(data.user.id, signupEmail, signupPhone);
      }

      window.location.reload();
    } catch (err) {
      setFormError('Inscription échouée : ' + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // ========== AFFICHAGE ==========

  // Mise à jour des statuts pour correspondre aux nouveaux labels de suivi
  const getStatusInfo = (status) => {
    const map = {
      'commande_confirmee': { label: 'Commande confirmée', color: '#4CAF50' },
      'colis_prepare': { label: 'Colis préparé', color: '#8BC34A' },
      'colis_transit_etranger': { label: 'Colis en transit vers l\'étranger', color: '#00BCD4' },
      'colis_transit_rdc': { label: 'Colis en transit vers la RDC', color: '#2196F3' },
      'colis_arrive_douane': { label: 'Colis arrivé à la douane', color: '#3F51B5' },
      'sous_douane': { label: 'Sous douane', color: '#9C27B0' },
      'dedouanement': { label: 'Dédouanement en cours', color: '#FF9800' },
      'colis_entrepos': { label: 'Colis dans l\'entrepôt', color: '#FF5722' },
      'livraison_faite': { label: 'Livraison faite', color: '#4CAF50' },
      // Anciens statuts pour compatibilité
      'pending': { label: 'En attente', color: '#FF9800' },
      'processing': { label: 'En préparation', color: '#2196F3' },
      'shipped': { label: 'Expédiée', color: '#9C27B0' },
      'delivered': { label: 'Livrée', color: '#4CAF50' },
      'cancelled': { label: 'Annulée', color: '#B41E1E' },
    };
    return map[status] || { label: status || 'Statut inconnu', color: '#6C757D' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ========== RENDU ==========

  if (user) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>👤 Mon compte</h1>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user.email}</span>
            <button onClick={logout} style={styles.logoutBtn}>Déconnexion</button>
          </div>
        </div>

        {loading ? (
          <div style={styles.loading}>⏳ Chargement de vos commandes...</div>
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : orders.length === 0 ? (
          <div style={styles.card}>
            <h2 style={styles.title}>📦 Aucune commande</h2>
            <p style={styles.subtitle}>
              Vous n'avez pas encore passé de commande, ou vos commandes passées en tant qu'invité n'ont pas été liées.
              <br />
              <small>Si vous avez passé une commande sans compte, contactez le support pour la lier.</small>
            </p>
            <Link to="/shop" className="btn-primary-shop" style={styles.button}>
              🛒 Découvrir la boutique
            </Link>
          </div>
        ) : (
          <>
            <h2 style={styles.sectionTitle}>📋 Historique de vos commandes</h2>
            <div style={styles.ordersGrid}>
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const history = order.status_history || [];
                return (
                  <motion.div
                    key={order.id}
                    style={styles.orderCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div style={styles.orderHeader}>
                      <span style={styles.orderNumber}>Commande #{order.order_number}</span>
                      <span style={styles.orderDate}>{formatDate(order.created_at)}</span>
                    </div>
                    <div style={styles.orderBody}>
                      <div style={styles.orderTotal}>
                        <strong>Total :</strong> {order.total} €
                      </div>
                      <div style={styles.orderStatus}>
                        <span style={{ ...styles.statusBadge, backgroundColor: statusInfo.color }}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                    {order.items && (
                      <div style={styles.orderItems}>
                        {order.items.slice(0, 3).map((item, idx) => (
                          <span key={idx} style={styles.orderItem}>
                            {item.name} × {item.quantity}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span style={styles.moreItems}>+{order.items.length - 3} autres</span>
                        )}
                      </div>
                    )}

                    {/* ===== TIMELINE DE SUIVI ===== */}
                    {history.length > 0 && (
                      <div style={styles.timeline}>
                        <h4 style={styles.timelineTitle}>📦 Suivi de votre commande</h4>
                        <div style={styles.timelineContainer}>
                          {history.map((entry, idx) => {
                            const isLast = idx === history.length - 1;
                            const entryStatus = getStatusInfo(entry.status);
                            return (
                              <div
                                key={idx}
                                style={{
                                  ...styles.timelineItem,
                                  borderLeft: `4px solid ${isLast ? '#4CAF50' : entryStatus.color || '#ddd'}`
                                }}
                              >
                                <div style={{ ...styles.timelineDot, backgroundColor: entryStatus.color || '#0A4D8C' }}></div>
                                <div style={styles.timelineContent}>
                                  <div style={styles.timelineLabel}>{entry.label || entryStatus.label}</div>
                                  <div style={styles.timelineDate}>{new Date(entry.date).toLocaleString('fr-FR')}</div>
                                  {entry.comment && <div style={styles.timelineComment}>📝 {entry.comment}</div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Link to={`/order/${order.id}`} style={styles.detailLink}>
                      Voir le détail →
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        <div style={styles.backHome}>
          <Link to="/" className="btn-secondary" style={styles.backLink}>
            🏠 Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // === UTILISATEUR NON CONNECTÉ ===
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>👤 Mon compte</h1>
      </div>

      <div style={styles.authContainer}>
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(isLogin ? styles.tabActive : {}) }}
            onClick={() => setIsLogin(true)}
          >
            Se connecter
          </button>
          <button
            style={{ ...styles.tab, ...(!isLogin ? styles.tabActive : {}) }}
            onClick={() => setIsLogin(false)}
          >
            Créer un compte
          </button>
        </div>

        {formError && <div style={styles.formError}>{formError}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Adresse e‑mail</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="votre@email.com"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mot de passe</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn-primary-shop" style={styles.submitBtn} disabled={formLoading}>
              {formLoading ? 'Connexion...' : 'Se connecter'}
            </button>
            <p style={styles.helper}>
              Pas encore de compte ? <span style={styles.link} onClick={() => setIsLogin(false)}>Créez‑en un</span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Adresse e‑mail *</label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="votre@email.com"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Numéro de téléphone (optionnel)</label>
              <input
                type="tel"
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                style={styles.input}
                placeholder="+243 8X XXX XXXX"
              />
              <small style={styles.hint}>
                Renseignez le même numéro que lors de votre commande pour lier automatiquement vos achats.
              </small>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mot de passe *</label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="Min 6 caractères"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirmer le mot de passe *</label>
              <input
                type="password"
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
                required
                style={styles.input}
                placeholder="Répétez le mot de passe"
              />
            </div>
            <button type="submit" className="btn-primary-shop" style={styles.submitBtn} disabled={formLoading}>
              {formLoading ? 'Inscription...' : 'Créer mon compte'}
            </button>
            <p style={styles.helper}>
              Déjà un compte ? <span style={styles.link} onClick={() => setIsLogin(true)}>Connectez‑vous</span>
            </p>
            <p style={styles.note}>
              💡 En vous inscrivant avec l'e‑mail ou le téléphone utilisé lors de votre commande, celle‑ci sera automatiquement rattachée à votre compte et vous pourrez suivre son évolution.
            </p>
          </form>
        )}
      </div>

      <div style={styles.backHome}>
        <Link to="/" className="btn-secondary" style={styles.backLink}>
          🏠 Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

// ========== STYLES ==========
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    minHeight: '80vh',
    fontFamily: 'sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f0f0f0',
  },
  pageTitle: {
    fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
    color: '#0A4D8C',
    margin: 0,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userName: {
    fontWeight: 'bold',
    color: '#0A4D8C',
  },
  logoutBtn: {
    background: '#B41E1E',
    color: 'white',
    border: 'none',
    padding: '6px 16px',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
    color: '#0A4D8C',
    margin: '2rem 0 1.5rem',
  },
  ordersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '1.5rem',
  },
  orderCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '1.5rem',
    boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
    border: '1px solid #f0f0f0',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.8rem',
    flexWrap: 'wrap',
  },
  orderNumber: {
    fontWeight: 'bold',
    color: '#0A4D8C',
    fontSize: '1rem',
  },
  orderDate: {
    fontSize: '0.8rem',
    color: '#6C757D',
  },
  orderBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.8rem',
  },
  orderTotal: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2E7D32',
  },
  orderStatus: {
    display: 'flex',
    alignItems: 'center',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  orderItems: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '0.5rem',
    borderTop: '1px solid #eee',
    paddingTop: '0.8rem',
  },
  orderItem: {
    background: '#f8f9fa',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: '#333',
  },
  moreItems: {
    fontSize: '0.7rem',
    color: '#6C757D',
    alignSelf: 'center',
  },
  detailLink: {
    display: 'inline-block',
    marginTop: '0.8rem',
    color: '#FF9800',
    fontWeight: '500',
    textDecoration: 'none',
    fontSize: '0.85rem',
    transition: 'all 0.3s',
  },
  // === TIMELINE STYLES ===
  timeline: {
    marginTop: '1.2rem',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '1rem',
  },
  timelineTitle: {
    fontSize: '0.9rem',
    marginBottom: '0.8rem',
    color: '#0A4D8C',
  },
  timelineContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    paddingLeft: '10px',
    paddingBottom: '8px',
    position: 'relative',
  },
  timelineDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '4px',
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1A2A3A',
  },
  timelineDate: {
    fontSize: '0.7rem',
    color: '#6C757D',
  },
  timelineComment: {
    fontSize: '0.8rem',
    color: '#555',
    fontStyle: 'italic',
    marginTop: '2px',
  },
  // === FIN TIMELINE ===
  card: {
    textAlign: 'center',
    padding: '3rem 2rem',
    background: 'white',
    borderRadius: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    maxWidth: '500px',
    margin: '2rem auto',
  },
  title: {
    fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
    color: '#0A4D8C',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6C757D',
    marginBottom: '1.5rem',
  },
  button: {
    display: 'inline-block',
    padding: '10px 30px',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#6C757D',
    marginTop: '3rem',
  },
  error: {
    textAlign: 'center',
    color: '#B41E1E',
    marginTop: '2rem',
  },
  backHome: {
    marginTop: '3rem',
    textAlign: 'center',
  },
  backLink: {
    display: 'inline-block',
    padding: '10px 30px',
  },
  authContainer: {
    maxWidth: '450px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '24px',
    padding: '2rem 1.5rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },
  tabs: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    borderBottom: '1px solid #eee',
  },
  tab: {
    flex: 1,
    padding: '0.8rem 0',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#6C757D',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#0A4D8C',
    borderBottomColor: '#0A4D8C',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#0A4D8C',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    fontSize: '0.95rem',
    transition: 'border 0.2s',
    outline: 'none',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    marginTop: '0.5rem',
  },
  helper: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#6C757D',
    marginTop: '0.5rem',
  },
  link: {
    color: '#0A4D8C',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  note: {
    fontSize: '0.8rem',
    color: '#6C757D',
    background: '#f8f9fa',
    padding: '0.8rem',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px dashed #0A4D8C',
  },
  formError: {
    background: '#fde8e8',
    color: '#B41E1E',
    padding: '0.8rem',
    borderRadius: '10px',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  hint: {
    fontSize: '0.7rem',
    color: '#6C757D',
    marginTop: '0.2rem',
  },
};

export default Account;