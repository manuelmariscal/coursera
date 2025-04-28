import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiService } from '../services/api';
import './Home.css';

const Home = () => {
  const [apiStatus, setApiStatus] = useState('Loading...');
  const [fichasCount, setFichasCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch API status and medical records count on component mount
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch API status
        const statusData = await ApiService.getApiStatus();
        setApiStatus(statusData.message);
        
        // Fetch medical records to get count
        const fichas = await ApiService.getAllFichas();
        setFichasCount(fichas.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        setApiStatus('Error connecting to API');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Bienvenido a MotoSegura</h1>
        <p className="hero-subtitle">Tu información médica esencial, siempre a mano</p>
        <Link to="/fichas" className="cta-button">Gestionar Fichas Médicas</Link>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <h3>Fichas Médicas Registradas</h3>
          <div className="stat-value">{loading ? '...' : fichasCount}</div>
          <Link to="/fichas" className="stat-link">Ver todas</Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Nuestros servicios</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏥</div>
            <h3>Fichas Médicas Digitales</h3>
            <p>Almacena tu información médica esencial en formato digital para acceso rápido</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Acceso por QR</h3>
            <p>Accede a tu información médica escaneando un simple código QR desde cualquier dispositivo</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Seguridad y Privacidad</h3>
            <p>Tu información médica está protegida con las más altas medidas de seguridad</p>
          </div>
        </div>
      </div>

      <div className="api-status">
        <h3>Estado del API:</h3>
        <p>{apiStatus}</p>
      </div>
    </div>
  );
};

export default Home; 