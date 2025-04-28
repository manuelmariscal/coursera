import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Modal, Button, Form, Table, Alert } from 'react-bootstrap';
import './Motorcycles.css';

const Motorcycles = () => {
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentMoto, setCurrentMoto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    año: '',
    color: '',
    propietario: ''
  });

  // Cargar motocicletas
  const loadMotorcycles = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAllMotos();
      setMotos(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las motocicletas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMotorcycles();
  }, []);

  // Buscar motocicletas
  const searchMotorcycles = async () => {
    if (!searchTerm.trim()) {
      loadMotorcycles();
      return;
    }

    try {
      setLoading(true);
      // Intentar buscar por placa y propietario
      const data = await ApiService.searchMotos({ 
        placa: searchTerm,
        propietario: searchTerm
      });
      setMotos(data);
    } catch (err) {
      setError('Error al buscar motocicletas');
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
      placa: '',
      marca: '',
      modelo: '',
      año: '',
      color: '',
      propietario: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setCurrentMoto(null);
    setShowModal(true);
  };

  const openEditModal = (moto) => {
    setFormData({
      placa: moto.placa,
      marca: moto.marca,
      modelo: moto.modelo,
      año: moto.año.toString(),
      color: moto.color,
      propietario: moto.propietario
    });
    setCurrentMoto(moto);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        año: parseInt(formData.año) || 0
      };

      let response;
      if (currentMoto) {
        // Actualizar
        response = await ApiService.updateMoto(currentMoto.id, payload);
        setSuccessMessage('Motocicleta actualizada con éxito');
      } else {
        // Crear nueva
        response = await ApiService.createMoto(payload);
        setSuccessMessage('Motocicleta registrada con éxito');
      }

      // Cerrar modal y recargar datos
      setShowModal(false);
      loadMotorcycles();

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la motocicleta');
      console.error(err);
    }
  };

  const handleDelete = async (motoId) => {
    if (window.confirm('¿Está seguro que desea eliminar esta motocicleta?')) {
      try {
        await ApiService.deleteMoto(motoId);
        setSuccessMessage('Motocicleta eliminada con éxito');
        loadMotorcycles();
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        setError('Error al eliminar la motocicleta');
        console.error(err);
      }
    }
  };

  return (
    <div className="motorcycles-container">
      <div className="motorcycles-header">
        <h1>Gestión de Motocicletas</h1>
        <p className="subtitle">Administre el registro de motocicletas en el sistema</p>
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

      <div className="motorcycles-actions">
        <div className="search-box">
          <Form.Control
            type="text"
            placeholder="Buscar por placa o propietario"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchMotorcycles()}
          />
          <Button variant="outline-primary" onClick={searchMotorcycles}>Buscar</Button>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          Registrar Nueva Motocicleta
        </Button>
      </div>

      {loading ? (
        <div className="loading-message">Cargando motocicletas...</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Placa</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Año</th>
              <th>Color</th>
              <th>Propietario</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {motos.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">No hay motocicletas registradas</td>
              </tr>
            ) : (
              motos.map((moto) => (
                <tr key={moto.id}>
                  <td>{moto.placa}</td>
                  <td>{moto.marca}</td>
                  <td>{moto.modelo}</td>
                  <td>{moto.año}</td>
                  <td>{moto.color}</td>
                  <td>{moto.propietario}</td>
                  <td>{moto.fecha_registro}</td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      className="me-2"
                      onClick={() => openEditModal(moto)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(moto.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal para crear/editar motocicleta */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentMoto ? 'Editar Motocicleta' : 'Registrar Nueva Motocicleta'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Placa *</Form.Label>
              <Form.Control
                type="text"
                name="placa"
                value={formData.placa}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Marca *</Form.Label>
              <Form.Control
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Modelo *</Form.Label>
              <Form.Control
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Año</Form.Label>
              <Form.Control
                type="number"
                name="año"
                value={formData.año}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <Form.Control
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Propietario *</Form.Label>
              <Form.Control
                type="text"
                name="propietario"
                value={formData.propietario}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="form-actions">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {currentMoto ? 'Actualizar' : 'Registrar'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Motorcycles; 