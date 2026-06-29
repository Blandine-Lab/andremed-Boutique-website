import React from 'react';
import { motion } from 'framer-motion';

function Downloads() {
  return (
    <div style={{ minHeight: '100vh', padding: '120px 20px 60px', background: '#f8f9fa' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#0A4D8C' }}>📥 Téléchargements</h1>
        <p style={{ fontSize: '1.2rem', color: '#6C757D' }}>Catalogues, brochures, manuels et autres ressources seront disponibles prochainement.</p>
      </motion.div>
    </div>
  );
}

export default Downloads;