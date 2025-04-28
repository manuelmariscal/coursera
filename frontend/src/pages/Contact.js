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
              <p>Av. Salud 123, Distrito Médico Central</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">📞</div>
            <div className="info-text">
              <h3>Teléfono</h3>
              <p>+57 300 123 4567</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">✉️</div>
            <div className="info-text">
              <h3>Email</h3>
              <p>soporte@motosegura.com</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">🏥</div>
            <div className="info-text">
              <h3>Emergencias</h3>
              <p>Línea 24/7: +57 300 765 4321</p>
            </div>
          </div>
        </div>

        <div className="contact-form">
          <h2>Envíenos un mensaje</h2>
          {formStatus.submitted && formStatus.success ? (
            <div className="success-message">{formStatus.message}</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Asunto</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Mensaje</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                ></textarea>
              </div>
              <button type="submit" className="submit-button">Enviar Mensaje</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact; 