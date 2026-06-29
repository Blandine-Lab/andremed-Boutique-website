import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mobgoxdfmhkmqpiwyhhj.supabase.co',
  'sb_publishable_GcGYY4d9w-uPgavGF4mdYQ_T-IwO88o'
);

function Footer() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.section}>
          <h3>Andremed Medical</h3>
          <p>Matériel médical de qualité</p>
          <p>© 2024 Andremed Medical</p>
          <p>Tous droits réservés</p>
        </div>
        
        <div style={styles.section}>
          <h3>Liens rapides</h3>
          <a href="/about" style={styles.link}>À propos</a>
          <a href="/services" style={styles.link}>Services</a>
          <a href="/shop" style={styles.link}>Boutique</a>
          <a href="/contact" style={styles.link}>Contact</a>
        </div>
        
        <div style={styles.section}>
          <h3>Contact</h3>
          {settings.phone1 && <p style={styles.contactItem}>📞 {settings.phone1}</p>}
          {settings.phone2 && <p style={styles.contactItem}>📞 {settings.phone2}</p>}
          {settings.email && <p style={styles.contactItem}>✉️ {settings.email}</p>}
          {settings.address && <p style={styles.contactItem}>📍 {settings.address}</p>}
        </div>
        
        <div style={styles.section}>
          <h3>Suivez-nous</h3>
          <div style={styles.socialLinks}>
            {settings.facebook_url && (
              <a 
                href={settings.facebook_url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={styles.socialLink}
              >
                📘 Facebook
              </a>
            )}
            {settings.linkedin_url && (
              <a 
                href={settings.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={styles.socialLink}
              >
                🔗 LinkedIn
              </a>
            )}
            {settings.tiktok_url && (
              <a 
                href={settings.tiktok_url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={styles.socialLink}
              >
                🎵 TikTok
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#0A4D8C',
    color: 'white',
    padding: '40px 20px',
    marginTop: 'auto'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px'
  },
  section: {
    marginBottom: '20px'
  },
  link: {
    display: 'block',
    color: 'white',
    textDecoration: 'none',
    marginBottom: '10px',
    transition: 'opacity 0.3s'
  },
  contactItem: {
    marginBottom: '10px'
  },
  socialLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  socialLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    transition: 'opacity 0.3s'
  }
};

// Ajout du hover style
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  a:hover {
    opacity: 0.8;
  }
`;
if (!document.head.querySelector('#footer-styles')) {
  styleSheet.id = 'footer-styles';
  document.head.appendChild(styleSheet);
}

export default Footer;