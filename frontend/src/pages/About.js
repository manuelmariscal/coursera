import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>Acerca de MotoSegura</h1>
        <p className="about-subtitle">Nuestra misión es proteger la salud de los motociclistas a través de fichas médicas digitales</p>
      </div>

      <div className="about-content">
        <div className="about-section">
          <h2>Nuestra Historia</h2>
          <p>
            MotoSegura nació de la necesidad de proporcionar una solución eficaz ante emergencias médicas 
            que pueden sufrir los motociclistas. Fundada en 2023, nuestra plataforma combina 
            tecnología QR con fichas médicas digitales para proporcionar acceso rápido a 
            información vital en caso de accidentes, facilitando la atención médica oportuna.
          </p>
        </div>

        <div className="about-section">
          <h2>Nuestra Visión</h2>
          <p>
            Aspiramos a crear un futuro donde todos los motociclistas puedan contar con un sistema 
            de fichas médicas digitales accesible y eficiente. Buscamos reducir los tiempos de 
            respuesta en emergencias médicas y mejorar los resultados de atención en accidentes, 
            salvando vidas a través de la tecnología y la información inmediata.
          </p>
        </div>

        <div className="team-section">
          <h2>Nuestro Equipo</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">👨‍⚕️</div>
              <h3>Juan Pérez</h3>
              <p>Fundador & Médico Especialista</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">👩‍💻</div>
              <h3>María López</h3>
              <p>CTO & Desarrolladora</p>
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