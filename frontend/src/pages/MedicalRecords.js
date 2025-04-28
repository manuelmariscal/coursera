import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Modal, Button, Form, Table, Alert, Row, Col, Card, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './MedicalRecords.css';

const MedicalRecords = () => {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipo_sangre: '',
    contacto_emergencia: '',
    numero_contacto: '',
    alergias: '',
    medicaciones: ''
  });

  // Cargar fichas médicas
  const loadFichas = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAllFichas();
      setFichas(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las fichas médicas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFichas();
  }, []);

  // Buscar fichas
  const searchFichas = async () => {
    if (!searchTerm.trim()) {
      loadFichas();
      return;
    }

    try {
      setLoading(true);
      // Intentar buscar por nombre o apellido
      const data = await ApiService.searchFichas({ 
        nombre: searchTerm,
        apellido: searchTerm
      });
      setFichas(data);
    } catch (err) {
      setError('Error al buscar fichas médicas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Manejo del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      tipo_sangre: '',
      contacto_emergencia: '',
      numero_contacto: '',
      alergias: '',
      medicaciones: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await ApiService.createFicha(formData);
      setSuccessMessage('Ficha médica registrada con éxito - ID: ' + response.ficha.id);
      
      // Cerrar modal y recargar datos
      setShowModal(false);
      loadFichas();

      // Redirigir a la página de vista de QR después de 2 segundos
      setTimeout(() => {
        navigate(`/ficha/${response.ficha.id}`, { state: { isNew: true } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la ficha médica');
      console.error(err);
    }
  };

  const viewFicha = (fichaId) => {
    navigate(`/ficha/${fichaId}`);
  };

  return (
    <div className="medical-records-container">
      <div className="medical-records-header">
        <h1>Fichas Médicas</h1>
        <p className="subtitle">Consulte y registre información médica esencial</p>
      </div>

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <div className="medical-records-actions">
        <div className="search-box">
          <Form.Control
            type="text"
            placeholder="Buscar por nombre o apellido"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchFichas()}
          />
          <Button variant="outline-primary" onClick={searchFichas}>Buscar</Button>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          Crear Nueva Ficha Médica
        </Button>
      </div>

      {loading ? (
        <div className="loading-message">Cargando fichas médicas...</div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {fichas.length === 0 ? (
            <Col className="text-center w-100">
              <p>No hay fichas médicas registradas</p>
            </Col>
          ) : (
            fichas.map((ficha) => (
              <Col key={ficha.id}>
                <Card className="medical-card" onClick={() => viewFicha(ficha.id)}>
                  <Card.Body>
                    <div className="patient-photo-container">
                      <Image 
                        src={ficha.foto_url === 'default.jpg' 
                          ? '/default-profile.png' 
                          : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${ficha.foto_url}`} 
                        alt="Foto del paciente" 
                        className="patient-photo" 
                      />
                    </div>
                    <Card.Title className="text-center mb-3">
                      {ficha.nombre} {ficha.apellido}
                    </Card.Title>
                    <div className="medical-info">
                      <p><strong>ID:</strong> {ficha.id}</p>
                      <p><strong>Tipo de Sangre:</strong> {ficha.tipo_sangre}</p>
                      <p><strong>Contacto:</strong> {ficha.contacto_emergencia}</p>
                    </div>
                    <div className="text-center mt-3">
                      <Button variant="outline-success" size="sm">Ver Detalles</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}

      {/* Modal para crear ficha médica */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton className="medical-modal-header">
          <Modal.Title>
            Crear Nueva Ficha Médica
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido *</Form.Label>
                  <Form.Control
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Tipo de Sangre *</Form.Label>
              <Form.Select
                name="tipo_sangre"
                value={formData.tipo_sangre}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contacto de Emergencia *</Form.Label>
              <Form.Control
                type="text"
                name="contacto_emergencia"
                value={formData.contacto_emergencia}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Número de Contacto *</Form.Label>
              <Form.Control
                type="text"
                name="numero_contacto"
                value={formData.numero_contacto}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Alergias</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="alergias"
                value={formData.alergias}
                onChange={handleChange}
                placeholder="Ninguna"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Medicaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="medicaciones"
                value={formData.medicaciones}
                onChange={handleChange}
                placeholder="Ninguna"
              />
            </Form.Group>

            <div className="form-actions">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Registrar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MedicalRecords; 