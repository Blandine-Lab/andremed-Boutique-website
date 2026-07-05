import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';

const supabase = createClient(
  'https://mobgoxdfmhkmqpiwyhhj.supabase.co',
  'sb_publishable_GcGYY4d9w-uPgavGF4mdYQ_T-IwO88o'
);

function Blog() {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
      setProducts(productsData || []);
      setSettings(settingsData || {});
      setLoading(false);
    };
    fetchData();
  }, []);

  const closeModal = () => setSelectedProduct(null);

  // Fonction pour afficher les initiales du produit
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div style={styles.blogContainer}>
      {/* Hero - l'image est affichée en entier, sans rognage */}
      <div style={styles.heroBlog}>
        <img src="/Blog-background.jpg" alt="Blog Andremed" style={styles.heroImage} />
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroTextContainer}>
          <h1 style={styles.heroTitle}>
            Chez Andremed, la science au service du soin
          </h1>
          <p style={styles.heroSubtitle}>
            Actualités, conseils et innovations en équipements médicaux
          </p>
        </div>
      </div>

      <div style={styles.productsGrid}>
        {loading ? (
          <p>Chargement des équipements...</p>
        ) : products.length === 0 ? (
          <p>Aucun équipement disponible.</p>
        ) : (
          products.map((product) => (
            <motion.div
              key={product.id}
              style={styles.productCard}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedProduct(product)}
            >
              <div style={styles.productImageContainer}>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    style={styles.productImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      parent.style.display = 'flex';
                      parent.style.alignItems = 'center';
                      parent.style.justifyContent = 'center';
                      parent.style.backgroundColor = '#0A4D8C';
                      parent.style.color = 'white';
                      parent.style.fontSize = '2rem';
                      parent.style.fontWeight = 'bold';
                      parent.innerText = getInitials(product.name);
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0A4D8C',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                  }}>
                    {getInitials(product.name)}
                  </div>
                )}
              </div>
              <h3 style={styles.productName}>{product.name}</h3>
            </motion.div>
          ))
        )}
      </div>

      {selectedProduct && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={closeModal}>✕</button>
            {selectedProduct.image ? (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={styles.modalImage}
                onError={(e) => { e.target.src = '/placeholder.png'; }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0A4D8C',
                color: 'white',
                fontSize: '3rem',
                fontWeight: 'bold',
                borderRadius: '12px',
                marginBottom: '1rem',
              }}>
                {getInitials(selectedProduct.name)}
              </div>
            )}
            <h2>{selectedProduct.name}</h2>
            <p style={styles.modalDescription}>{selectedProduct.description || 'Aucune description disponible.'}</p>
            {selectedProduct.price && <p><strong>Prix :</strong> {selectedProduct.price} €</p>}
            <Link to={`/product/${selectedProduct.slug || selectedProduct.id}`} className="btn-primary-shop" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Voir le produit →
            </Link>
          </div>
        </div>
      )}

      {/* Footer (inchangé) */}
      <footer style={styles.blogFooter}>
        <div style={styles.footerTop}>
          <div style={styles.footerColumn}>
            <img src="/Andremed.jpg" alt="Site Logo" style={styles.footerLogo} />
            <p>Contact Us</p>
            <div style={styles.socialIcons}>
              <a href="#">Facebook</a> | <a href="#">Linkedin</a> | <a href="#">Youtube</a> | <a href="#">Tiktok</a>
            </div>
          </div>
          <div style={styles.footerColumn}>
            <h4>Products</h4>
            <ul>
              <li>MY-D055Y-(A/B/C/E)</li><li>MY-D054E</li><li>MY-D019D-N</li>
              <li>MY-D023G DR System</li><li>MY-D056B-N</li><li>MY-D054K</li>
              <li>MY-D055C-D</li><li>MY-D065B-N</li><li>MY-D032E</li>
            </ul>
          </div>
          <div style={styles.footerColumn}>
            <h4>Blog</h4>
            <ul>
              <li>X-ray machine</li><li>Uncategorized</li><li>News</li>
              <li>MRI</li><li>Medical Equipment News</li>
              <li>Flat Panel Detector</li><li>CT Scanner</li><li>BLOG</li>
            </ul>
          </div>
          <div style={styles.footerColumn}>
            <h4>Navigation</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/product">Product</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/forums">Forums</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/shop">Maya Shop</Link></li>
            </ul>
          </div>
        </div>
        <div style={styles.footerBottom}>
          Copyright © 2017 | Powered by Andremed Medical
        </div>
      </footer>
    </div>
  );
}

// ========== STYLES (inchangés) ==========
const styles = {
  blogContainer: { minHeight: '100vh', background: '#f5f5f5' },
  heroBlog: {
    position: 'relative',
    width: '100%',
  },
  heroImage: {
    display: 'block',
    width: '100%',
    height: 'auto',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
    zIndex: 1,
  },
  heroTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '1rem',
    zIndex: 2,
  },
  heroTitle: {
    color: 'white',
    fontSize: '3.8rem',
    fontWeight: 'bold',
    fontFamily: "'Playfair Display', 'Georgia', serif",
    textShadow: '2px 2px 10px rgba(0,0,0,0.8)',
    marginBottom: '0.5rem',
    lineHeight: '1.2',
  },
  heroSubtitle: {
    color: 'white',
    fontSize: '1.8rem',
    fontFamily: "'Poppins', 'Arial', sans-serif",
    textShadow: '1px 1px 6px rgba(0,0,0,0.8)',
    maxWidth: '800px',
    fontWeight: '300',
    letterSpacing: '0.5px',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '2rem',
    padding: '3rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  productCard: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  productImageContainer: {
    width: '100%',
    paddingTop: '100%',
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  productImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  productName: {
    padding: '1rem',
    fontSize: '1rem',
    textAlign: 'center',
    color: '#0A4D8C',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modalContent: {
    background: 'white',
    borderRadius: '20px',
    maxWidth: '500px',
    width: '90%',
    padding: '1.5rem',
    position: 'relative',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  modalImage: {
    width: '100%',
    borderRadius: '12px',
    marginBottom: '1rem',
    objectFit: 'cover',
  },
  modalDescription: {
    fontSize: '0.9rem',
    color: '#555',
  },
  blogFooter: {
    background: '#1e2a3a',
    color: '#fff',
    padding: '2rem 1rem 1rem',
    marginTop: '2rem',
  },
  footerTop: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  footerColumn: {
    h4: { marginBottom: '1rem', color: '#FFD166' },
    ul: { listStyle: 'none', padding: 0 },
    li: { marginBottom: '0.5rem', fontSize: '0.8rem' },
    a: { color: '#ccc', textDecoration: 'none' },
  },
  footerLogo: { width: '80px', marginBottom: '1rem' },
  socialIcons: {
    marginTop: '0.5rem',
    a: { color: '#ccc', marginRight: '10px', fontSize: '0.8rem' },
  },
  footerBottom: {
    textAlign: 'center',
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.2)',
    fontSize: '0.7rem',
  },
};

export default Blog;
