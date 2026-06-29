import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import Home from './pages/Home';
import About from './pages/About';
import './App.css';
import Services from './pages/Services';
import Realisations from './pages/Realisations';
import Support from './pages/Support';
import Shop from './pages/Shop';
import Account from './pages/Account';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';      // ← NOUVEAU

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="App">
              <div className="medical-background">
                <div className="blood-wave"></div>
                <div className="blood-wave"></div>
                <div className="blood-wave"></div>
                <div className="heartbeat-effect"></div>
                <div className="ecg-line"></div>
                <div className="ecg-line"></div>
                <div className="ecg-line"></div>
              </div>
              <Routes>
                {/* Routes publiques */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Routes publiques sans authentification */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/realisations" element={<Realisations />} />
                <Route path="/support" element={<Support />} />
                <Route path="/shop" element={<Shop />} />
                
                {/* Route protégée : nécessite d'être connecté */}
                <Route path="/account" element={
                  <PrivateRoute>
                    <Account />
                  </PrivateRoute>
                } />

                {/* Route d'administration (protégée + mot de passe interne) */}
                <Route path="/admin" element={
                  <PrivateRoute>
                    <AdminPanel />
                  </PrivateRoute>
                } />
              </Routes>
            </div>
          </BrowserRouter>
        </CartProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;