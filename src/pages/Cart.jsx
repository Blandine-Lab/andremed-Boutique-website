// src/pages/Cart.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart, getTotal } = useCart();
  const { user } = useAuth();

  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null); // Stocker l'ID de la commande

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateOrderNumber = () => {
    const prefix = 'AND-';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}-${random}`;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      setError('Veuillez remplir tous les champs obligatoires.');
      setIsSubmitting(false);
      return;
    }

    const shippingInfo = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      notes: formData.notes,
    };

    const orderData = {
      order_number: generateOrderNumber(),
      user_id: user?.id || null,
      user_name: formData.name,
      user_email: formData.email,
      email: formData.email,
      phone: formData.phone,
      shipping_address: shippingInfo,
      shipping: shippingInfo,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      total: getTotal(),
      status: 'pending',
      status_label: 'En attente de paiement',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) throw error;

      // Récupérer l'ID de la commande créée
      const createdOrder = data[0];
      setOrderId(createdOrder.id);
      setSuccess(true);
      clearCart();

      // Rediriger vers la page de paiement après 2 secondes
      setTimeout(() => {
        setShowCheckout(false);
        navigate(`/payment/${createdOrder.id}`);
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la commande :', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <h2>🛒 Votre panier est vide</h2>
        <p>Continuez vos achats sur la boutique.</p>
        <Link to="/shop" className="btn-primary-shop" style={styles.returnBtn}>
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>🛒 Votre panier</h1>
      {cart.map(item => (
        <div key={item.id} style={styles.itemRow}>
          <div style={styles.itemInfo}>
            <strong>{item.name}</strong>
            <span style={styles.itemDetails}>
              {item.quantity} × {item.price.toFixed(2)} €
            </span>
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            style={styles.removeBtn}
          >
            🗑
          </button>
        </div>
      ))}
      <div style={styles.totalContainer}>
        <div style={styles.totalText}>
          Total : <strong>{getTotal().toFixed(2)} €</strong>
        </div>
        <div style={styles.actionButtons}>
          <button onClick={clearCart} style={styles.clearBtn}>
            Vider le panier
          </button>
          <button
            onClick={() => setShowCheckout(true)}
            style={styles.checkoutBtn}
          >
            Passer la commande
          </button>
        </div>
      </div>
      <Link to="/shop" style={styles.continueLink}>
        ← Continuer mes achats
      </Link>

      {showCheckout && (
        <div style={styles.modalOverlay} onClick={() => !isSubmitting && setShowCheckout(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>📋 Validation de la commande</h2>
            {success ? (
              <div style={styles.successMessage}>
                ✅ Commande enregistrée !<br />
                Vous allez être redirigé vers la page de paiement.
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder} style={styles.form}>
                <div style={styles.formGroup}>
                  <label>Nom complet *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+243 8X XXX XXXX"
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Adresse de livraison *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Rue, numéro, quartier"
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Ville</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ville"
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Instructions particulières</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Livraison, délai, etc."
                    rows="2"
                    style={styles.textarea}
                  />
                </div>

                {error && <div style={styles.errorMsg}>{error}</div>}

                <div style={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    style={styles.cancelBtn}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={styles.confirmBtn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Traitement...' : '✅ Valider la commande'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ========== STYLES ==========
const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    fontFamily: 'sans-serif',
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '3rem 1.5rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  returnBtn: {
    display: 'inline-block',
    padding: '10px 30px',
    background: '#FF9800',
    color: 'white',
    borderRadius: '30px',
    textDecoration: 'none',
    marginTop: '1rem',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    padding: '0.8rem 0',
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  itemDetails: {
    fontSize: '0.9rem',
    color: '#555',
  },
  removeBtn: {
    background: '#B41E1E',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  totalContainer: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '2px solid #ddd',
  },
  totalText: {
    fontSize: '1.3rem',
    marginBottom: '1rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  clearBtn: {
    background: '#666',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  checkoutBtn: {
    background: '#0A4D8C',
    color: 'white',
    border: 'none',
    padding: '10px 30px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  continueLink: {
    display: 'inline-block',
    marginTop: '1.5rem',
    color: '#0A4D8C',
    textDecoration: 'none',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '20px',
    maxWidth: '500px',
    width: '100%',
    padding: '2rem',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    color: '#0A4D8C',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '0.95rem',
  },
  textarea: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '0.95rem',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '0.5rem',
  },
  cancelBtn: {
    padding: '10px 20px',
    background: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  confirmBtn: {
    padding: '10px 24px',
    background: '#0A4D8C',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  errorMsg: {
    color: '#B41E1E',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  successMessage: {
    color: '#2E7D32',
    fontSize: '1.1rem',
    textAlign: 'center',
    padding: '1rem',
  },
};

export default Cart;