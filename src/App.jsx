// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Shop from './pages/Shop';
import Services from './pages/Services';
import Support from './pages/Support';
import Realisations from './pages/Realisations';
import Account from './pages/Account';
import AdminPanel from './pages/AdminPanel';
import ServicePage from './pages/ServicePage';
import ContactPage from './pages/ContactPage';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Downloads from './pages/Downloads';
import MemberPage from './pages/MemberPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import OrderDetail from './pages/OrderDetail';
import Payment from './pages/Payment';
import Faq from './pages/Faq';

function AppContent() {
  const location = useLocation();
  
  // ✅ Suppression de la condition : le footer s'affiche partout
  // const hideFooter = location.pathname === '/';
  
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '70px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/services" element={<Services />} />
          <Route path="/support" element={<Support />} />
          <Route path="/realisations" element={<Realisations />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/catalog" element={<Downloads />} />
          <Route path="/catalogues" element={<Downloads />} />
          <Route path="/brochures" element={<Downloads />} />
          <Route path="/manuals" element={<Downloads />} />
          <Route path="/case-studies" element={<Downloads />} />
          <Route path="/whitepapers" element={<Downloads />} />
          <Route path="/videos" element={<Downloads />} />
          <Route path="/webinars" element={<Downloads />} />
          <Route path="/member/:pageKey" element={<MemberPage />} />
          <Route path="/register" element={<MemberPage />} />
          <Route path="/wishlist" element={<MemberPage />} />
          <Route path="/orders" element={<MemberPage />} />
          <Route path="/login" element={<MemberPage />} />
          <Route path="/reset-password" element={<MemberPage />} />
          <Route path="/profile" element={<MemberPage />} />
          <Route path="/addresses" element={<MemberPage />} />
          <Route path="/newsletter" element={<MemberPage />} />
          <Route path="/notifications" element={<MemberPage />} />
          <Route path="/service/:pageKey" element={<ServicePage />} />
          <Route path="/help" element={<Navigate to="/service/help" replace />} />
          <Route path="/join" element={<Navigate to="/service/join" replace />} />
          <Route path="/technical-support" element={<Navigate to="/service/technical-support" replace />} />
          <Route path="/training" element={<Navigate to="/service/training" replace />} />
          <Route path="/maintenance" element={<Navigate to="/service/maintenance" replace />} />
          <Route path="/warranty" element={<Navigate to="/service/warranty" replace />} />
          <Route path="/returns" element={<Navigate to="/service/returns" replace />} />
          <Route path="/feedback" element={<Navigate to="/service/feedback" replace />} />
          <Route path="/contact/:pageKey" element={<ContactPage />} />
          <Route path="/contact-us" element={<Navigate to="/contact/contact-us" replace />} />
          <Route path="/customer-support" element={<Navigate to="/contact/customer-support" replace />} />
          <Route path="/sales-inquiries" element={<Navigate to="/contact/sales-inquiries" replace />} />
          <Route path="/careers" element={<Navigate to="/contact/careers" replace />} />
          <Route path="/press-media" element={<Navigate to="/contact/press-media" replace />} />
          <Route path="/legal-notice" element={<Navigate to="/contact/legal-notice" replace />} />
          <Route path="/privacy-policy" element={<Navigate to="/contact/privacy-policy" replace />} />
          <Route path="/terms-of-service" element={<Navigate to="/contact/terms-of-service" replace />} />
          <Route path="/sitemap" element={<Navigate to="/contact/sitemap" replace />} />
          <Route path="/accessibility" element={<Navigate to="/contact/accessibility" replace />} />
          <Route path="/privacy" element={<Navigate to="/contact/privacy" replace />} />
          <Route path="/terms" element={<Navigate to="/contact/terms" replace />} />
          <Route path="/legal" element={<Navigate to="/contact/legal" replace />} />
          <Route path="/press" element={<Navigate to="/contact/press" replace />} />
          <Route path="/sales" element={<Navigate to="/contact/sales" replace />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="/contact" element={<Navigate to="/contact/contact" replace />} />
          <Route path="/services" element={<Navigate to="/service/services" replace />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order/:id" element={<OrderDetail />} />
        </Routes>
      </div>
      {/* ✅ Footer de Home affiché sur toutes les pages */}
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
