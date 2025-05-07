import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send the form data to your API
    console.log('Form data submitted:', formData);
    
    // Simulate successful submission
    setFormStatus({
      submitted: true,
      success: true,
      message: 'Su mensaje ha sido enviado. ¡Gracias por contactarnos!'
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contacto</h1>
        <p className="contact-subtitle">¿Tiene preguntas sobre nuestro sistema de fichas médicas? Estamos aquí para ayudar.</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-item">
            <div className="info-icon">📍</div>
            <div className="info-text">
              <h3>Dirección</h3>
              <p>Enrique Díaz de León #205, Arboledas, 46616 Ameca, Jal.</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">✉️</div>
            <div className="info-text">
              <h3>Email</h3>
              <p>contacto@motosegura.online</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">🏥</div>
            <div className="info-text">
              <h3>Emergencias</h3>
              <p>Línea 24/7: 911</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 