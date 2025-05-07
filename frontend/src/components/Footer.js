import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>MotoSegura</h3>
            <p>Protección de emergencia avanzada para ti con tecnología QR</p>
          </div>
          
          <div className="footer-section">
            <h3>Enlaces Rápidos</h3>
            <ul className="footer-links">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/about">Acerca de</Link></li>
              <li><Link to="/contact">Contacto</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contacto</h3>
            <p>Email: contacto@motosegura.online</p>
            <p>Instagram: @motoseguraameca.online</p>
          </div>
        </div>

        
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} MotoSegura. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 