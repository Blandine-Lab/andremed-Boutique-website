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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      if (!error) setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Fonction robuste pour récupérer l'URL de l'image
  const getImageUrl = (product) => {
    // 1. image
    if (product.image && product.image.trim() !== '') return product.image;
    // 2. image_url
    if (product.image_url && product.image_url.trim() !== '') return product.image_url;
    // 3. media (premier élément)
    if (product.media && Array.isArray(product.media) && product.media.length > 0) {
      const first = product.media[0];
      if (typeof first === 'string') return first;
      if (first && first.url) return first.url;
    }
    // 4. fallback
    return '/placeholder.png';
  };

  return (
    <div style={styles.blogContainer}>
      {/* Hero */}
      <div style={styles.heroBlog}>
        <img src="/Blog-background.jpg" alt="Blog" style={styles.heroImage} />
        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>La science au service du soin</h1>
        </div>
      </div>

      {/* Grille des produits */}
      <div style={styles.productsGrid}>
        {loading ? (
          <p>Chargement des équipements...</p>
        ) : (
          products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              style={{ textDecoration: 'none' }}
            >
              <motion.div
                style={styles.productCard}
                whileHover={{ scale: 1.02 }}
              >
                <div style={styles.productImageContainer}>
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      style={styles.productImage}
                      onError={(e) => { e.target.src = '/placeholder.png'; }}
                    />
                    <img
                      src="/logo-andremed.png"
                      alt="Andremed"
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        width: '32px',
                        height: '32px',
                        pointerEvents: 'none',
                        zIndex: 2,
                      }}
                    />
                  </div>
                </div>
                <h3 style={styles.productName}>{product.name}</h3>
              </motion.div>
            </Link>
          ))
        )}
      </div>

      {/* Footer (identique) */}
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
          Copyright © 2025 | Powered by Maya Medical
        </div>
      </footer>
    </div>
  );
}

const styles = {
  blogContainer: { minHeight: '100vh', background: '#f5f5f5' },
  heroBlog: { position: 'relative', height: '40vh', overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%', objectFit: 'cover' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: 'white', fontSize: '2.5rem', textAlign: 'center', padding: '1rem', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' },
  productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem', padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' },
  productCard: { background: 'white', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.2s' },
  productImageContainer: { width: '100%', paddingTop: '100%', position: 'relative' },
  productImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
  productName: { padding: '1rem', fontSize: '1rem', textAlign: 'center', color: '#0A4D8C' },
  blogFooter: { background: '#1e2a3a', color: '#fff', padding: '2rem 1rem 1rem', marginTop: '2rem' },
  footerTop: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' },
  footerColumn: { h4: { marginBottom: '1rem', color: '#FFD166' }, ul: { listStyle: 'none', padding: 0 }, li: { marginBottom: '0.5rem', fontSize: '0.8rem' }, a: { color: '#ccc', textDecoration: 'none' } },
  footerLogo: { width: '80px', marginBottom: '1rem' },
  socialIcons: { marginTop: '0.5rem', a: { color: '#ccc', marginRight: '10px', fontSize: '0.8rem' } },
  footerBottom: { textAlign: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: '0.7rem' }
};

export default Blog;
