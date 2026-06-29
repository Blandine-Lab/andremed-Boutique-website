import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={{
      background: '#0A2A3B',
      color: '#fff',
      padding: '40px 20px 20px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '30px'
      }}>
        <div>
          <h3 style={{ color: '#FFD166' }}>Andremed Medical</h3>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
            Leader en solutions médicales innovantes depuis plus de 8 ans.
          </p>
        </div>
        <div>
          <h4 style={{ color: '#FFD166' }}>Liens rapides</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Accueil</Link></li>
            <li><Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>À propos</Link></li>
            <li><Link to="/shop" style={{ color: 'white', textDecoration: 'none' }}>Boutique</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: '#FFD166' }}>Contact</h4>
          <p>📞 +243 82 99 84 833</p>
          <p>✉️ contact@andremed.org</p>
        </div>
      </div>
      <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '20px' }}>
        <p>&copy; 2024 Andremed Medical. Tous droits réservés.</p>
      </div>
    </footer>
  );
}

export default Footer;