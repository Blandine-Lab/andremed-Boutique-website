// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mobgoxdfmhkmqpiwyhhj.supabase.co',
  'sb_publishable_GcGYY4d9w-uPgavGF4mdYQ_T-IwO88o'
);

function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isUserHidden, setIsUserHidden] = useState(false); // Cache manuel par l'utilisateur
  const [settings, setSettings] = useState({});
  const navbarRef = useRef(null);

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

  // Gestion du scroll normal
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (!isUserHidden) {
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          setIsVisible(true);
        }
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isUserHidden]);

  // Gestion du glissement tactile (swipe) sur la navbar
  useEffect(() => {
    const navbar = navbarRef.current;
    if (!navbar) return;

    const handleTouchStart = (e) => {
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
      const touchEndY = e.touches[0].clientY;
      const diffY = touchEndY - touchStartY;
      
      // Glisser vers le HAUT (différence négative) -> Cacher la navbar
      if (diffY < -30 && isVisible) {
        setIsVisible(false);
        setIsUserHidden(true);
        // Feedback haptique (vibration) si supporté
        if (navigator.vibrate) navigator.vibrate(50);
      }
      
      // Glisser vers le BAS (différence positive) -> Afficher la navbar
      if (diffY > 30 && !isVisible) {
        setIsVisible(true);
        setIsUserHidden(false);
        if (navigator.vibrate) navigator.vibrate(50);
      }
    };

    navbar.addEventListener('touchstart', handleTouchStart);
    navbar.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      navbar.removeEventListener('touchstart', handleTouchStart);
      navbar.removeEventListener('touchmove', handleTouchMove);
    };
  }, [touchStartY, isVisible]);

  // Réafficher la navbar au scroll vers le haut si elle a été cachée manuellement
  useEffect(() => {
    const handleScrollShow = () => {
      const currentScrollY = window.scrollY;
      if (isUserHidden && currentScrollY < lastScrollY) {
        setIsVisible(true);
        setIsUserHidden(false);
      }
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScrollShow);
    return () => window.removeEventListener('scroll', handleScrollShow);
  }, [isUserHidden, lastScrollY]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navItems = [
    { path: '/shop', label: 'Boutique', icon: '🛒' },
    { path: '/blog', label: 'Blog', icon: '📝' },
    { path: '/about', label: 'À propos', icon: '🏢' },
    { path: '/services', label: 'Services', icon: '🔧' },
    { path: '/support', label: 'Support', icon: '💬' },
    { path: '/realisations', label: 'Réalisations', icon: '🏆' },
    { path: '/account', label: 'Mon compte', icon: '👤' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav 
        ref={navbarRef}
        style={{
          ...styles.navbar,
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease-in-out',
          background: 'rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(12px)',
          cursor: 'pointer',
        }}
      >
        <div style={styles.navContainer}>
          <Link to="/" style={styles.logo}>
            <img src="/Andremed.jpg" alt="Andremed" style={styles.logoImage} />
            <span style={styles.logoText}>Andremed Medical</span>
          </Link>

          {/* Indicateur de swipe (visible uniquement sur mobile) */}
          <div style={styles.swipeIndicator}>
            <span style={styles.swipeIcon}>⋮</span>
          </div>

          <div style={styles.navMenu}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navLink,
                  ...(isActive(item.path) ? styles.navLinkActive : {})
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    style={styles.activeIndicator}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <button 
            style={styles.menuButton} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <span style={{
              ...styles.burgerLine,
              transform: isMenuOpen ? 'rotate(45deg) translate(5px, 6px)' : 'none'
            }} />
            <span style={{
              ...styles.burgerLine,
              opacity: isMenuOpen ? 0 : 1
            }} />
            <span style={{
              ...styles.burgerLine,
              transform: isMenuOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none'
            }} />
          </button>
        </div>
      </nav>

      {/* Petit bouton flottant pour réafficher la navbar (optionnel) */}
      {!isVisible && (
        <button 
          onClick={() => {
            setIsVisible(true);
            setIsUserHidden(false);
          }}
          style={styles.showButton}
          className="show-navbar-btn"
        >
          ☰
        </button>
      )}

      {/* Menu Mobile */}
      <div style={{
        ...styles.mobileMenu,
        transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
      }}>
        <div style={styles.mobileMenuHeader}>
          <img src="/Andremed.jpg" alt="Andremed" style={styles.mobileLogo} />
          <span style={styles.mobileLogoText}>Andremed Medical</span>
          <button 
            style={styles.closeButton}
            onClick={() => setIsMenuOpen(false)}
          >
            ✕
          </button>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.mobileNavLink,
              ...(isActive(item.path) ? styles.mobileNavLinkActive : {})
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            <span style={styles.mobileIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        
        {settings.phone1 && (
          <div style={styles.mobileContact}>
            <span>📞 {settings.phone1}</span>
          </div>
        )}
      </div>

      {isMenuOpen && (
        <div style={styles.overlay} onClick={() => setIsMenuOpen(false)} />
      )}
    </>
  );
}

const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxShadow: 'none',
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoImage: {
    height: '40px',
    width: 'auto',
    borderRadius: '8px',
  },
  logoText: {
    fontSize: 'clamp(0.9rem, 4vw, 1.1rem)',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  },
  swipeIndicator: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    top: '5px',
    display: 'none',
    cursor: 'grab',
  },
  swipeIcon: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '2px',
  },
  navMenu: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  navLink: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '40px',
    textDecoration: 'none',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  },
  navLinkActive: {
    color: '#FFD166',
    background: 'rgba(255,255,255,0.15)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '-2px',
    left: '10%',
    width: '80%',
    height: '3px',
    background: '#FFD166',
    borderRadius: '3px',
  },
  menuButton: {
    display: 'none',
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: '30px',
    height: '25px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    zIndex: 10,
  },
  burgerLine: {
    width: '100%',
    height: '3px',
    backgroundColor: 'white',
    borderRadius: '2px',
    transition: 'all 0.3s ease',
  },
  showButton: {
    position: 'fixed',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    width: '50px',
    height: '40px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '1.5rem',
    zIndex: 999,
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
  },
  mobileMenu: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '320px',
    maxWidth: '85%',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(15px)',
    padding: '60px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    zIndex: 999,
    transition: 'transform 0.3s ease-in-out',
    boxShadow: '-5px 0 30px rgba(0,0,0,0.3)',
  },
  mobileMenuHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '20px',
    marginBottom: '10px',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    position: 'relative',
  },
  mobileLogo: {
    width: '45px',
    height: '45px',
    borderRadius: '10px',
  },
  mobileLogoText: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  closeButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    fontSize: '1.2rem',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  mobileNavLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    textDecoration: 'none',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  mobileNavLinkActive: {
    background: 'rgba(255,209,102,0.2)',
    color: '#FFD166',
  },
  mobileIcon: {
    fontSize: '1.2rem',
  },
  mobileContact: {
    marginTop: '20px',
    padding: '15px 16px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.85rem',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 998,
    transition: 'all 0.3s ease',
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @media (max-width: 968px) {
    .navMenu {
      display: none !important;
    }
    .menuButton {
      display: flex !important;
    }
    .swipeIndicator {
      display: block !important;
    }
    .show-navbar-btn {
      display: flex !important;
      align-items: center;
      justify-content: center;
    }
  }
  
  @media (min-width: 969px) {
    .show-navbar-btn {
      display: none !important;
    }
  }
`;
if (!document.querySelector('#navbar-styles')) {
  styleSheet.id = 'navbar-styles';
  document.head.appendChild(styleSheet);
}

export default Navbar;