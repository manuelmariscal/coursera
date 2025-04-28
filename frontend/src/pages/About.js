import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>Acerca de MotoSegura</h1>
        <p className="about-subtitle">Nuestra misión es proteger tu motocicleta con tecnología innovadora</p>
      </div>

      <div className="about-content">
        <div className="about-section">
          <h2>Nuestra Historia</h2>
          <p>
            MotoSegura nació de la necesidad de proporcionar una solución efectiva contra 
            el robo de motocicletas, un problema creciente en nuestra comunidad. Fundada en 2023,
            nuestra plataforma combina tecnología QR con una base de datos centralizada para
            crear un sistema de seguridad robusto y accesible.
          </p>
        </div>

        <div className="about-section">
          <h2>Nuestra Visión</h2>
          <p>
            Aspiramos a crear un futuro donde los propietarios de motocicletas puedan
            tener tranquilidad sabiendo que sus vehículos están protegidos por la
            tecnología más avanzada. Buscamos reducir drásticamente los robos de
            motocicletas y crear una comunidad más segura para todos.
          </p>
        </div>

        <div className="team-section">
          <h2>Nuestro Equipo</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">👨‍💻</div>
              <h3>Juan Pérez</h3>
              <p>Fundador & CEO</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">👩‍💻</div>
              <h3>María López</h3>
              <p>CTO</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">👨‍💼</div>
              <h3>Carlos Rodríguez</h3>
              <p>Director de Operaciones</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 