// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Produit non trouvé');

        setProduct(data);
        setCurrentIndex(0);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // ===== Extraire les URLs des images =====
  const getImageUrls = () => {
    if (!product) return [];

    if (product.media && Array.isArray(product.media) && product.media.length > 0) {
      return product.media.map(item => {
        if (typeof item === 'string') return item;
        return item?.url || null;
      }).filter(Boolean);
    }

    if (product.image) {
      return [product.image];
    }

    return [];
  };

  const imageUrls = getImageUrls();
  const currentImage = imageUrls[currentIndex] || null;

  // ===== Navigation =====
  const nextImage = () => {
    if (imageUrls.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    if (imageUrls.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${product.name} ajouté au panier !`);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner"></div>
        <p>Chargement du produit...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={styles.errorContainer}>
        <h2>❌ Produit introuvable</h2>
        <p>{error || 'Ce produit n\'existe pas ou a été supprimé.'}</p>
        <Link to="/shop" className="btn-secondary" style={styles.backLink}>
          ← Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.breadcrumb}>
        <Link to="/shop">Boutique</Link> &gt; <span>{product.name}</span>
      </div>

      <div style={styles.productLayout}>
        {/* ===== GALERIE D'IMAGES ===== */}
        <div style={styles.gallery}>
          <div style={styles.mainImageWrapper}>
            {currentImage ? (
              <>
                <img
                  src={currentImage}
                  alt={product.name}
                  style={styles.mainImage}
                  onClick={() => setShowZoom(true)}
                  onError={(e) => { e.target.src = '/placeholder.png'; }}
                />
                {/* Flèches de navigation (si plus d'une image) */}
                {imageUrls.length > 1 && (
                  <>
                    <button
                      style={{ ...styles.navButton, left: '10px' }}
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      aria-label="Image précédente"
                    >
                      ◀
                    </button>
                    <button
                      style={{ ...styles.navButton, right: '10px' }}
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      aria-label="Image suivante"
                    >
                      ▶
                    </button>
                    <div style={styles.counter}>
                      {currentIndex + 1} / {imageUrls.length}
                    </div>
                  </>
                )}
                <div style={styles.zoomHint}>🔍 Cliquer pour zoomer</div>
              </>
            ) : (
              <div style={styles.noImage}>Aucune image</div>
            )}
          </div>

          {/* Miniatures */}
          {imageUrls.length > 1 && (
            <div style={styles.thumbnails}>
              {imageUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`${product.name} - ${idx+1}`}
                  style={{
                    ...styles.thumbnail,
                    border: currentIndex === idx ? '3px solid #0A4D8C' : '1px solid #ddd'
                  }}
                  onClick={() => setCurrentIndex(idx)}
                  onError={(e) => { e.target.src = '/placeholder.png'; }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ===== INFOS PRODUIT ===== */}
        <div style={styles.info}>
          <h1 style={styles.productName}>{product.name}</h1>
          {product.brand && <p style={styles.brand}>Marque : {product.brand}</p>}
          <p style={styles.category}>Catégorie : {product.category || 'Non catégorisé'}</p>
          <p style={styles.price}>{product.price.toLocaleString()} €</p>
          <div style={styles.stock}>
            {(product.quantity || product.stock) > 0 ? (
              <span style={styles.inStock}>✅ En stock ({product.quantity || product.stock})</span>
            ) : (
              <span style={styles.outStock}>❌ Rupture de stock</span>
            )}
          </div>
          <div style={styles.description}>
            <h3>Description</h3>
            <p>{product.description || 'Aucune description disponible.'}</p>
          </div>

          <div style={styles.actions}>
            <div style={styles.quantitySelector}>
              <label>Quantité :</label>
              <input
                type="number"
                min="1"
                max={product.quantity || 99}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={styles.quantityInput}
              />
            </div>
            <button
              onClick={handleAddToCart}
              disabled={(product.quantity || product.stock) === 0}
              style={{
                ...styles.addButton,
                opacity: (product.quantity || product.stock) === 0 ? 0.5 : 1
              }}
            >
              {(product.quantity || product.stock) > 0 ? '🛒 Ajouter au panier' : '❌ Rupture'}
            </button>
          </div>
          <div style={styles.meta}>
            <p>Référence : #{product.id}</p>
            {product.warranty && <p>Garantie : {product.warranty}</p>}
            {product.delivery && <p>Livraison : {product.delivery}</p>}
          </div>
        </div>
      </div>

      {/* ===== MODALE DE ZOOM ===== */}
      {showZoom && currentImage && (
        <div style={styles.modalOverlay} onClick={() => setShowZoom(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowZoom(false)}>✕</button>
            {imageUrls.length > 1 && (
              <>
                <button
                  style={{ ...styles.navButtonModal, left: '20px' }}
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                >
                  ◀
                </button>
                <button
                  style={{ ...styles.navButtonModal, right: '20px' }}
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                >
                  ▶
                </button>
                <div style={styles.counterModal}>
                  {currentIndex + 1} / {imageUrls.length}
                </div>
              </>
            )}
            <img
              src={currentImage}
              alt={product.name}
              style={styles.zoomedImage}
              onError={(e) => { e.target.src = '/placeholder.png'; }}
            />
            <p style={styles.zoomHintModal}>Cliquez sur l'image ou appuyez sur Échap pour fermer</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== STYLES ==========
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    fontFamily: 'sans-serif',
  },
  breadcrumb: {
    fontSize: '0.9rem',
    color: '#6C757D',
    marginBottom: '2rem',
  },
  productLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '1.5rem',
    },
  },
  gallery: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  mainImageWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #eee',
    cursor: 'pointer',
  },
  mainImage: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transition: 'transform 0.3s ease',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.5)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    zIndex: 2,
  },
  navButtonModal: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.3)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    zIndex: 10001,
  },
  counter: {
    position: 'absolute',
    bottom: '15px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    zIndex: 2,
  },
  counterModal: {
    position: 'absolute',
    bottom: '70px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    zIndex: 10001,
  },
  zoomHint: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.7rem',
    opacity: 0.8,
    zIndex: 2,
  },
  noImage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999',
    fontSize: '1.2rem',
  },
  thumbnails: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  thumbnail: {
    width: '70px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '1px solid #ddd',
    transition: 'all 0.2s',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  productName: {
    fontSize: '2rem',
    color: '#1A2A3A',
    margin: 0,
  },
  brand: {
    fontSize: '1rem',
    color: '#6C757D',
    margin: 0,
  },
  category: {
    fontSize: '0.9rem',
    color: '#0A4D8C',
    background: '#e8f0fe',
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    width: 'fit-content',
  },
  price: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#0A4D8C',
    margin: '0.5rem 0',
  },
  stock: {
    fontSize: '0.9rem',
  },
  inStock: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  outStock: {
    color: '#B41E1E',
    fontWeight: 'bold',
  },
  description: {
    borderTop: '1px solid #eee',
    paddingTop: '1rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
  },
  quantitySelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  quantityInput: {
    width: '60px',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    textAlign: 'center',
  },
  addButton: {
    padding: '12px 30px',
    background: '#0A4D8C',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  meta: {
    borderTop: '1px solid #eee',
    paddingTop: '1rem',
    fontSize: '0.85rem',
    color: '#6C757D',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '2rem',
  },
  modalContent: {
    position: 'relative',
    maxWidth: '90%',
    maxHeight: '90%',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: '-40px',
    right: '0',
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '2rem',
    cursor: 'pointer',
    padding: '0 10px',
    zIndex: 10001,
  },
  zoomedImage: {
    maxWidth: '90vw',
    maxHeight: '80vh',
    objectFit: 'contain',
    borderRadius: '8px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    cursor: 'zoom-out',
  },
  zoomHintModal: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '0.8rem',
    position: 'absolute',
    bottom: '-30px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '3rem',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '3rem',
  },
  backLink: {
    display: 'inline-block',
    marginTop: '1rem',
  },
};

export default ProductDetails;
