import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import context
import { AuthProvider } from './context/AuthContext';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import MedicalRecord from './pages/MedicalRecord';
import MedicalRecords from './pages/MedicalRecords';
import Unauthorized from './pages/Unauthorized';
import ProfilePage from './pages/ProfilePage';
import UserDashboard from './pages/UserDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Motorcycles from './pages/Motorcycles';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container mt-3">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ficha/:id" element={<MedicalRecord />} />
            <Route path="/fichas" element={<MedicalRecords />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Rutas protegidas para usuarios autenticados */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/motorcycles" element={<Motorcycles />} />
            </Route>
            
            {/* Rutas protegidas para administradores */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/fichas" element={<MedicalRecords />} />
              {/* Estas rutas tendrán que ser implementadas más adelante */}
              {/* <Route path="/admin/fichas/create" element={<CreateFichaMedica />} />
              <Route path="/admin/fichas/edit/:id" element={<EditFichaMedica />} /> */}
            </Route>
            
            {/* Página para rutas no encontradas */}
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App; 