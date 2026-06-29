// src/pages/Payment.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Déclaré AVANT toute utilisation

  console.log('🔐 Utilisateur connecté :', user);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('mobile_money');
  const [reference, setReference] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error(err);
        setError('Commande introuvable.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile) {
      setError('Veuillez sélectionner une preuve de paiement (capture d\'écran ou bordereau).');
      return;
    }
    if (!reference && method === 'bank_transfer') {
      setError('Veuillez indiquer la référence du virement.');
      return;
    }
    setUploading(true);
    setError('');

    try {
      // 1. Upload du fichier
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
      const filePath = `${orderId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payments')
        .upload(filePath, proofFile);
      if (uploadError) throw uploadError;

      // 2. Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('payments')
        .getPublicUrl(filePath);
      const proofUrl = urlData.publicUrl;

      // 3. Insérer dans la table payments
      const { data: paymentData, error: insertError } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          user_id: user?.id || null,
          method: method,
          amount: order.total,
          reference: reference || null,
          proof_url: proofUrl,
          status: 'pending',
          notes: `Paiement via ${method === 'mobile_money' ? 'Mobile Money' : 'Virement bancaire'}`
        })
        .select()
        .single();
      if (insertError) throw insertError;

      setSuccess(true);
      setSubmitted(true);
      setTimeout(() => {
        navigate('/account');
      }, 4000);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la soumission du paiement. Veuillez réessayer.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Chargement...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '3rem', color: '#B41E1E' }}>{error}</div>;
  if (!order) return <div style={{ textAlign: 'center', padding: '3rem' }}>Commande non trouvée</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💳 Paiement de la commande #{order.order_number}</h1>
      <p style={styles.subtitle}>Montant total : <strong>{order.total} €</strong></p>

      {success ? (
        <div style={styles.successCard}>
          <h2>✅ Paiement envoyé !</h2>
          <p>Votre preuve de paiement a été soumise avec succès. L'administrateur la vérifiera dans les plus brefs délais.</p>
          <p>Vous serez redirigé vers votre compte dans quelques instants.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.methodSelector}>
            <h3>Choisissez votre méthode de paiement :</h3>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                value="mobile_money"
                checked={method === 'mobile_money'}
                onChange={() => setMethod('mobile_money')}
              />
              📱 Mobile Money (RDC)
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                value="bank_transfer"
                checked={method === 'bank_transfer'}
                onChange={() => setMethod('bank_transfer')}
              />
              🏦 Virement bancaire
            </label>
          </div>

          {method === 'mobile_money' && (
            <div style={styles.infoBox}>
              <h4>📱 Mobile Money</h4>
              <p>Effectuez votre paiement vers l'un des numéros suivants :</p>
              <ul>
                <li>
                  <strong>M-Pesa / Orange Money / Airtel Money :</strong><br />
                  <span style={{ fontSize: '1.2rem' }}>+243 81 70 29 631</span>
                </li>
                <li>
                  <strong>M-Pesa / Orange Money / Airtel Money :</strong><br />
                  <span style={{ fontSize: '1.2rem' }}>+243 829 984 833</span>
                </li>
              </ul>
              <p>Après le paiement, prenez une capture d'écran de la transaction.</p>
            </div>
          )}

          {method === 'bank_transfer' && (
            <div style={styles.infoBox}>
              <h4>🏦 Virement bancaire</h4>
              <p>Effectuez un virement à l'ordre de :</p>
              <ul>
                <li><strong>Bénéficiaire :</strong> ANDREMED PROSPERITY DIAGNOSTICS SARL</li>
                <li><strong>Compte :</strong> 1252-3914019-00-95</li>
                <li><strong>Banque :</strong> Trust Merchant Bank S.A</li>
                <li><strong>Code SWIFT :</strong> TRMSCD3L</li>
                <li><strong>Adresse de la banque :</strong> 177, Boulevard de la Libération, Lumumba Bunia, ITURI-DRC</li>
              </ul>
              <p>Après le virement, téléchargez le bordereau ou une capture de l'écran de confirmation.</p>
            </div>
          )}

          <div style={styles.formGroup}>
            <label>Référence de paiement (optionnel) :</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Numéro de transaction, référence du virement..."
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Télécharger la preuve de paiement * :</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setProofFile(e.target.files[0])}
              required
              style={styles.fileInput}
            />
            {proofFile && <p style={styles.fileName}>📎 {proofFile.name}</p>}
          </div>

          {error && <p style={styles.errorMsg}>{error}</p>}

          <button type="submit" style={styles.submitBtn} disabled={uploading || !proofFile}>
            {uploading ? 'Envoi en cours...' : '📤 Envoyer la preuve de paiement'}
          </button>
          <Link to="/account" style={styles.cancelLink}>Annuler</Link>
        </form>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    fontFamily: 'sans-serif',
  },
  title: {
    fontSize: '2rem',
    color: '#0A4D8C',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  methodSelector: {
    background: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
  },
  radioLabel: {
    display: 'block',
    margin: '0.5rem 0',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  infoBox: {
    background: '#fff3cd',
    padding: '1.2rem',
    borderRadius: '8px',
    border: '1px solid #ffc107',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
  },
  fileInput: {
    padding: '8px',
  },
  fileName: {
    fontSize: '0.9rem',
    color: '#0A4D8C',
    marginTop: '4px',
  },
  submitBtn: {
    padding: '12px 24px',
    background: '#0A4D8C',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  cancelLink: {
    display: 'inline-block',
    marginTop: '0.5rem',
    color: '#6C757D',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  errorMsg: {
    color: '#B41E1E',
    fontSize: '0.9rem',
  },
  successCard: {
    background: '#d4edda',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid #b7eb8f',
    textAlign: 'center',
  },
};

export default Payment;