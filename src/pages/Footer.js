// src/components/Footer.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Footer() {
  const [settings, setSettings] = useState({
    facebook_url: '',
    linkedin_url: '',
    tiktok_url: ''
  });

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
    <footer className="custom-footer" style={styles.footer}>
      <div style={styles.footerContainer}>
        {/* Colonne 1 - About Us */}
        <div style={styles.footerColumn}>
          <h3 style={styles.footerTitle}>About Us</h3>
          <ul style={styles.footerList}>
            <li><Link to="/about#company-overview">Company Overview</Link></li>
            <li><Link to="/about#video">Andremed Introduction Video</Link></li>
            <li><Link to="/about#certifications">Certifications</Link></li>
            <li><Link to="/about#exhibitions">Exhibitions</Link></li>
            <li><Link to="/about#mission">Our Mission</Link></li>
            <li><Link to="/about#vision">Our Vision</Link></li>
            <li><Link to="/about#values">Our Values</Link></li>
            <li><Link to="/about#history">Our History</Link></li>
            <li><Link to="/about#team">Leadership Team</Link></li>
            <li><Link to="/about#partners">Partners</Link></li>
          </ul>
        </div>

        {/* Colonne 2 - Products */}
        <div style={styles.footerColumn}>
          <h3 style={styles.footerTitle}>Products</h3>
          <ul style={styles.footerList}>
            <li><Link to="/shop?category=imaging">Imaging system equipment</Link></li>
            <li><Link to="/shop?category=laboratory">Laboratory equipment</Link></li>
            <li><Link to="/shop?category=gynecology">Gynecology & Obstetrics</Link></li>
            <li><Link to="/shop?category=operation">Operation room equipment</Link></li>
            <li><Link to="/shop?category=dental">Eye/Dental/ENT</Link></li>
            <li><Link to="/shop?category=monitoring">Patient Monitoring</Link></li>
            <li><Link to="/shop?category=ventilators">Ventilators & Anesthesia</Link></li>
            <li><Link to="/shop?category=sterilization">Sterilization Equipment</Link></li>
            <li><Link to="/shop?category=furniture">Hospital Furniture</Link></li>
            <li><Link to="/shop?category=consumables">Medical Consumables</Link></li>
          </ul>
        </div>

        {/* Colonne 3 - Resource Center */}
        <div style={styles.footerColumn}>
          <h3 style={styles.footerTitle}>Resource Center</h3>
          <ul style={styles.footerList}>
            <li><Link to="/catalog">Product catalogue</Link></li>
            <li><Link to="/videos">Product video</Link></li>
            <li><Link to="/downloads">Download</Link></li>
            <li><Link to="/blog">Blog & News</Link></li>
            <li><Link to="/case-studies">Case Studies</Link></li>
            <li><Link to="/whitepapers">Whitepapers</Link></li>
            <li><Link to="/webinars">Webinars</Link></li>
            <li><Link to="/brochures">Brochures</Link></li>
            <li><Link to="/manuals">User Manuals</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>

        {/* Colonne 4 - Member */}
        <div style={styles.footerColumn}>
          <h3 style={styles.footerTitle}>Member</h3>
          <ul style={styles.footerList}>
            <li><Link to="/member/create-account">Create an Account</Link></li>
            <li><Link to="/member/change-account">Change Account</Link></li>
            <li><Link to="/member/wishlist">WishList</Link></li>
            <li><Link to="/member/order-tracking">Order Tracking</Link></li>
            <li><Link to="/member/login">Login / Sign in</Link></li>
            <li><Link to="/member/reset-password">Reset Password</Link></li>
            <li><Link to="/member/profile">My Profile</Link></li>
            <li><Link to="/member/addresses">My Addresses</Link></li>
            <li><Link to="/member/newsletter-settings">Newsletter Settings</Link></li>
            <li><Link to="/member/notification-settings">Notification Settings</Link></li>
          </ul>
        </div>

        {/* Colonne 5 - Services & Support */}
        <div style={styles.footerColumn}>
          <h3 style={styles.footerTitle}>Services & Support</h3>
          <ul style={styles.footerList}>
            <li><Link to="/services">Our Services</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/help">Help center</Link></li>
            <li><Link to="/join">Join us</Link></li>
            <li><Link to="/technical-support">Technical Support</Link></li>
            <li><Link to="/training">Training Programs</Link></li>
            <li><Link to="/maintenance">Maintenance Services</Link></li>
            <li><Link to="/warranty">Warranty Information</Link></li>
            <li><Link to="/returns">Returns & Refunds</Link></li>
            <li><Link to="/feedback">Customer Feedback</Link></li>
          </ul>
        </div>

        {/* Colonne 6 - Contact avec les nouvelles adresses email */}
        <div style={styles.footerColumn}>
          <h3 style={styles.footerTitle}>Contact</h3>
          <ul style={styles.footerList}>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/support">Customer Support</Link></li>
            <li><Link to="/sales">Sales Inquiries</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/press">Press & Media</Link></li>
            <li><Link to="/legal">Legal Notice</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/sitemap">Sitemap</Link></li>
            <li><Link to="/accessibility">Accessibility</Link></li>
          </ul>

          {/* ✅ NOUVELLES ADRESSES EMAIL AJOUTÉES */}
          <div style={styles.contactInfo}>
            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>📧</span>
              <span style={styles.contactLabel}>Information :</span>
              <a href="mailto:contact@andremed.org" style={styles.contactLink}>contact@andremed.org</a>
            </div>
            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>📦</span>
              <span style={styles.contactLabel}>Commandes & Livraison :</span>
              <a href="mailto:supporttechn.log@andremed.org" style={styles.contactLink}>supporttechn.log@andremed.org</a>
            </div>
            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>💰</span>
              <span style={styles.contactLabel}>Administration & Finance :</span>
              <a href="mailto:admin.finance@andremed.org" style={styles.contactLink}>admin.finance@andremed.org</a>
            </div>
            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>👔</span>
              <span style={styles.contactLabel}>Direction :</span>
              <a href="mailto:andre.kabe@andremed.org" style={styles.contactLink}>andre.kabe@andremed.org</a>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div style={styles.socialLinks}>
            <a href={settings.facebook_url || "https://facebook.com"} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
              <img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png" alt="Facebook" style={{ width: '28px', height: '28px' }} />
            </a>
            <a href={settings.linkedin_url || "https://linkedin.com"} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
              <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" alt="LinkedIn" style={{ width: '28px', height: '28px' }} />
            </a>
            <a href={settings.tiktok_url || "https://tiktok.com"} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
              <img src="https://cdn-icons-png.flaticon.com/512/3046/3046126.png" alt="TikTok" style={{ width: '28px', height: '28px' }} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
              <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style={{ width: '28px', height: '28px' }} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style={{ width: '28px', height: '28px' }} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
              <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" style={{ width: '28px', height: '28px' }} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div style={styles.footerBottom}>
        <div style={styles.footerBottomLinks}>
          <Link to="/">Home</Link> | <Link to="/about">About us</Link> | <Link to="/blog">Blog</Link> | <Link to="/contact">Contact us</Link> | GlobalMind.MK.Innotech
        </div>
        <div style={styles.paymentIcons}>
          <span>MobileMoney</span> <span>FedEx</span> <span>TNT</span> <span>EMS</span> <span>VISA</span> <span>MasterCard</span> <span>PayPal</span>
        </div>
        <div style={styles.copyright}>
          Copyright © 2017 Andremed Medical . All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

// ========== STYLES ==========
const styles = {
  footer: {
    backgroundImage: 'url("/footer-bg.jpeg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    color: '#fff',
    padding: '50px 20px 20px'
  },
  footerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '30px'
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  footerTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#FFD166'
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  // ✅ Styles pour les contacts
  contactInfo: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid rgba(255,255,255,0.15)'
  },
  contactItem: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '5px',
    marginBottom: '6px',
    fontSize: '0.75rem'
  },
  contactIcon: {
    fontSize: '0.8rem',
    marginRight: '3px'
  },
  contactLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500'
  },
  contactLink: {
    color: '#FFD166',
    textDecoration: 'none',
    wordBreak: 'break-all',
    transition: 'color 0.3s ease'
  },
  socialLinks: {
    display: 'flex',
    gap: '12px',
    marginTop: '15px',
    flexWrap: 'wrap'
  },
  socialIcon: {
    display: 'inline-block',
    transition: 'transform 0.3s ease'
  },
  footerBottom: {
    textAlign: 'center',
    paddingTop: '30px',
    marginTop: '30px',
    borderTop: '1px solid rgba(255,255,255,0.2)',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.7)'
  },
  footerBottomLinks: {
    marginBottom: '10px'
  },
  paymentIcons: {
    marginBottom: '10px'
  },
  copyright: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.6)'
  }
};

// Styles injectés globalement
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .custom-footer .footerList li { margin-bottom: 8px; }
  .custom-footer .footerList li a { 
    color: rgba(255,255,255,0.8);
    text-decoration: none;
    font-size: 0.85rem;
    transition: color 0.3s ease;
  }
  .custom-footer .footerList li a:hover { color: #FFD166; }
  .custom-footer .socialIcon:hover { transform: translateY(-3px); }
  .custom-footer .contactLink:hover { color: #fff; }
  .custom-footer .footerBottomLinks a { 
    color: rgba(255,255,255,0.8); 
    text-decoration: none; 
    margin: 0 5px; 
  }
  .custom-footer .footerBottomLinks a:hover { color: #FFD166; }
  .custom-footer .paymentIcons span { 
    margin: 0 8px; 
    font-size: 0.7rem; 
    opacity: 0.8; 
    color: white; 
  }
`;
document.head.appendChild(styleSheet);

export default Footer;
