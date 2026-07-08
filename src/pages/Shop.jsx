// src/pages/Shop.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';

function Shop() {
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [message, setMessage] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  console.log('🛒 Shop - panier actuel :', cart);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement produits:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const categories = [
    { id: 'all', name: 'Tous les produits', icon: '🏥' },
    ...Array.from(new Set(products.map(p => p.category))).filter(Boolean).map(cat => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      icon: '📦'
    }))
  ];

  const sortOptions = [
    { value: 'popular', label: 'Plus populaires' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
    { value: 'newest', label: 'Nouveautés' }
  ];

  const filteredProducts = products
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => selectedType === 'all' || p.type === selectedType)
    .filter(p => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1])
    .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      return (b.rating || 0) - (a.rating || 0);
    });

  const handleAddToCart = (product) => {
    addToCart(product);
    setMessage(`✅ ${product.name} ajouté au panier !`);
    setTimeout(() => setMessage(''), 2000);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={styles.heroTitle}
          >
            🛒 Boutique <span style={styles.heroAccent}>Médicale</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={styles.heroSubtitle}
          >
            Équipements médicaux de pointe pour votre établissement
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={styles.heroStats}
          >
            <span>🏥 {products.length} produits certifiés</span>
            <span>🚚 Livraison internationale</span>
            <span>🛡️ Garantie jusqu'à 5 ans</span>
            <span>🔧 Installation incluse</span>
          </motion.div>
        </div>
      </section>

      {cartCount > 0 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={styles.floatingCart}>
          <button onClick={() => navigate('/cart')} style={styles.cartButton}>
            🛒 Panier ({cartCount}) - {cartTotal.toLocaleString()} €
          </button>
        </motion.div>
      )}

      {message && <div style={styles.notification}>{message}</div>}

      <div style={styles.searchBar}>
        <div style={styles.searchInputWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Rechercher un équipement médical..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <button onClick={() => setFilterOpen(!filterOpen)} style={styles.filterToggle}>
          🔧 Filtres {filterOpen ? '▲' : '▼'}
        </button>
      </div>

      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={styles.filterPanel}
          >
            <div style={styles.filterRow}>
              <div style={styles.filterGroup}>
                <label>Catégorie</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={styles.filterSelect}>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div style={styles.filterGroup}>
                <label>Type</label>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={styles.filterSelect}>
                  <option value="all">📦 Tous</option>
                  <option value="equipement">🔧 Équipements</option>
                  <option value="consommable">😷 Consommables</option>
                </select>
              </div>
              <div style={styles.filterGroup}>
                <label>Prix (€)</label>
                <div style={styles.priceRange}>
                  <span>{priceRange[0].toLocaleString()} €</span>
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    style={styles.rangeInput}
                  />
                  <span>{priceRange[1].toLocaleString()} €</span>
                </div>
              </div>
              <div style={styles.filterGroup}>
                <label>Trier par</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.filterSelect}>
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Chargement des produits...</div>
      ) : (
        <div style={styles.productsGrid}>
          {filteredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -8 }}
              style={styles.productCard}
            >
              {product.featured && (
                <div style={styles.featuredBadge}>⭐ Produit vedette</div>
              )}
              <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={styles.productImageWrapper}>
                  {/* ===== NOUVEAU : utilisation de image ou image_url + placeholder ===== */}
                  <img
                    src={product.image || product.image_url || '/placeholder.png'}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />
                  {product.oldPrice && (
                    <div style={styles.promoBadge}>
                      -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                    </div>
                  )}
                </div>
              </Link>
              <div style={styles.productInfo}>
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={styles.productHeader}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <div style={styles.productRating}>
                      <span style={styles.ratingStar}>★</span>
                      <span>{product.rating || 0}</span>
                    </div>
                  </div>
                </Link>
                <p style={styles.productDesc}>{product.description || 'Aucune description'}</p>
                <div style={styles.productMeta}>
                  <span style={styles.productBrand}>{product.brand || 'Andremed'}</span>
                  <span style={styles.productWarranty}>🛡️ {product.warranty || 'Standard'}</span>
                  <span style={styles.productDelivery}>🚚 {product.delivery || 'Sur devis'}</span>
                </div>
                <div style={styles.productFooter}>
                  <div style={styles.priceContainer}>
                    {product.oldPrice && <span style={styles.oldPrice}>{product.oldPrice.toLocaleString()} €</span>}
                    <span style={styles.price}>{product.price.toLocaleString()} €</span>
                  </div>
                  <div style={styles.stockInfo}>
                    {(product.quantity || product.stock) > 10 ? (
                      <span style={styles.inStock}>✓ En stock ({product.quantity || product.stock})</span>
                    ) : (product.quantity || product.stock) > 0 ? (
                      <span style={styles.lowStock}>⚠️ Stock limité ({product.quantity || product.stock})</span>
                    ) : (
                      <span style={styles.outStock}>✗ Rupture</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    style={{...styles.addButton, opacity: (product.quantity || product.stock) === 0 ? 0.5 : 1}}
                    disabled={(product.quantity || product.stock) === 0}
                  >
                    {(product.quantity || product.stock) > 0 ? '🛒 Ajouter au panier' : '❌ Rupture'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>🔍</span>
          <p>Aucun produit ne correspond à votre recherche</p>
          <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setPriceRange([0, 500000]); }} style={styles.resetBtn}>
            Réinitialiser les filtres
          </button>
        </div>
      )}

      <section style={styles.advantagesSection}>
        <h2 style={styles.advantagesTitle}>✨ Pourquoi choisir Andremed ?</h2>
        <div style={styles.advantagesGrid}>
          <div className="glass-card" style={styles.advantageCard}>
            <div style={styles.advantageIcon}>🚚</div>
            <h3>Livraison express</h3>
            <p>Dans toute la RDC en 48-72h<br/>International 5-15 jours</p>
          </div>
          <div className="glass-card" style={styles.advantageCard}>
            <div style={styles.advantageIcon}>🛡️</div>
            <h3>Garantie premium</h3>
            <p>Jusqu'à 5 ans sur nos équipements<br/>Extension possible</p>
          </div>
          <div className="glass-card" style={styles.advantageCard}>
            <div style={styles.advantageIcon}>🔧</div>
            <h3>Installation incluse</h3>
            <p>Par nos techniciens certifiés<br/>Formation du personnel</p>
          </div>
          <div className="glass-card" style={styles.advantageCard}>
            <div style={styles.advantageIcon}>🎓</div>
            <h3>Formation offerte</h3>
            <p>Pour votre équipe médicale<br/>Certification incluse</p>
          </div>
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div className="glass-card" style={styles.ctaCard}>
          <h2>🏥 Besoin d'un devis personnalisé ?</h2>
          <p>Contactez notre équipe commerciale pour un accompagnement sur mesure</p>
          <div style={styles.ctaButtons}>
            <a href="/contact" className="btn-primary">📞 Demander un devis</a>
            <a href="/services" className="btn-secondary">🔧 Services après-vente</a>
          </div>
        </div>
      </section>
    </div>
  );
}

// ========== STYLES (inchangés) ==========
const styles = {
  container: { minHeight: '100vh', background: '#f8f9fa', paddingTop: '0' },
  hero: {
    position: 'relative',
    background: 'linear-gradient(135deg, #0A4D8C 0%, #00A3B2 100%)',
    padding: '80px 20px',
    textAlign: 'center',
    overflow: 'hidden'
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
  },
  heroContent: { position: 'relative', zIndex: 2, maxWidth: '1000px', margin: '0 auto' },
  heroTitle: { fontSize: '3.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' },
  heroAccent: { background: 'linear-gradient(135deg, #FFD166, #FFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSubtitle: { fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' },
  heroStats: { display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' },
  floatingCart: { position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 },
  cartButton: {
    background: 'linear-gradient(135deg, #FF9800, #FFC107)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '50px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  notification: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    background: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  searchBar: { display: 'flex', justifyContent: 'center', gap: '1rem', padding: '2rem', maxWidth: '1000px', margin: '0 auto', flexWrap: 'wrap' },
  searchInputWrapper: { flex: 1, position: 'relative', minWidth: '250px' },
  searchIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' },
  searchInput: {
    width: '100%',
    padding: '12px 15px 12px 40px',
    borderRadius: '50px',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.3s'
  },
  filterToggle: { padding: '12px 24px', borderRadius: '50px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontWeight: 'bold' },
  filterPanel: { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 2rem', overflow: 'hidden' },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
    justifyContent: 'center',
    background: 'white',
    padding: '1.5rem',
    borderRadius: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  filterGroup: { flex: 1, minWidth: '180px' },
  filterSelect: { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' },
  priceRange: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' },
  rangeInput: { flex: 1, height: '4px', borderRadius: '2px', background: '#ddd' },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '2rem',
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  productCard: {
    background: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
    transition: 'all 0.3s',
    position: 'relative'
  },
  featuredBadge: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    background: 'linear-gradient(135deg, #FFD166, #FFA500)',
    color: '#0A4D8C',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    zIndex: 2
  },
  productImageWrapper: {
    position: 'relative',
    height: '200px',
    background: 'linear-gradient(135deg, #f5f7fa, #e9ecef)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  promoBadge: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: '#f44336',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: 'bold'
  },
  productInfo: { padding: '1.5rem' },
  productHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  productName: { fontSize: '1.1rem', fontWeight: 'bold', color: '#1A2A3A', margin: 0 },
  productRating: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#FFD166' },
  ratingStar: { color: '#FFD166' },
  productDesc: { fontSize: '0.8rem', color: '#6C757D', marginBottom: '0.8rem', lineHeight: '1.4' },
  productMeta: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem', fontSize: '0.7rem', color: '#0A4D8C' },
  productBrand: { background: '#e8f0fe', padding: '2px 8px', borderRadius: '12px' },
  productWarranty: { background: '#e8f0fe', padding: '2px 8px', borderRadius: '12px' },
  productDelivery: { background: '#e8f0fe', padding: '2px 8px', borderRadius: '12px' },
  productFooter: { marginTop: '1rem' },
  priceContainer: { marginBottom: '0.5rem' },
  oldPrice: { fontSize: '0.8rem', color: '#999', textDecoration: 'line-through', marginRight: '8px' },
  price: { fontSize: '1.3rem', fontWeight: 'bold', color: '#0A4D8C' },
  stockInfo: { marginBottom: '0.8rem', fontSize: '0.7rem' },
  inStock: { color: '#4CAF50' },
  lowStock: { color: '#FF9800' },
  outStock: { color: '#f44336' },
  addButton: {
    width: '100%',
    padding: '10px',
    background: '#0A4D8C',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },
  emptyState: { textAlign: 'center', padding: '60px', color: '#6C757D' },
  emptyIcon: { fontSize: '3rem', display: 'block', marginBottom: '1rem' },
  resetBtn: { marginTop: '1rem', padding: '8px 20px', background: '#0A4D8C', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' },
  advantagesSection: { padding: '60px 20px', background: '#f0f4f8', textAlign: 'center' },
  advantagesTitle: { fontSize: '2rem', marginBottom: '2rem', color: '#0A4D8C' },
  advantagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  advantageCard: { padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' },
  advantageIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
  ctaSection: { padding: '60px 20px', textAlign: 'center', background: '#f8f9fa' },
  ctaCard: { maxWidth: '800px', margin: '0 auto', padding: '2.5rem', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  ctaButtons: { display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }
};

export default Shop;
