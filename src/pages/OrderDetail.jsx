// src/pages/OrderDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error(err);
        setError('Commande introuvable');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</div>;
  if (error || !order) return <div style={{ textAlign: 'center', padding: '2rem' }}>Commande non trouvée</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>📦 Détail de la commande #{order.order_number}</h1>
      <p><strong>Date :</strong> {new Date(order.created_at).toLocaleString('fr-FR')}</p>
      <p><strong>Statut :</strong> {order.status_label}</p>
      <p><strong>Total :</strong> {order.total.toFixed(2)} €</p>
      <h3>Adresse de livraison</h3>
      <pre>{JSON.stringify(order.shipping_address, null, 2)}</pre>
      <h3>Articles</h3>
      <ul>
        {order.items.map((item, idx) => (
          <li key={idx}>
            {item.name} × {item.quantity} = {item.total.toFixed(2)} €
          </li>
        ))}
      </ul>
      <Link to="/account">← Retour à mon compte</Link>
    </div>
  );
}

export default OrderDetail;