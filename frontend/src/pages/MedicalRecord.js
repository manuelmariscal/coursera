import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ApiService } from '../services/api';
import { Container, Row, Col, Card, Image, Button, Alert, Spinner, Form } from 'react-bootstrap';
import './MedicalRecord.css';

const MedicalRecord = () => {
  const { id } = useParams();
  const location = useLocation();
  const isNewRecord = location.state?.isNew;

  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Cargar datos de la ficha médica
  useEffect(() => {
    const loadFicha = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getFichaById(id);
        setFicha(data);
        setQrUrl(ApiService.getQRCode(id));
        
        if (isNewRecord) {
          setSuccessMessage('¡Ficha médica creada con éxito! Guarde o comparta su QR para acceso rápido.');
        }
      } catch (err) {
        setError('Error al cargar la ficha médica');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadFicha();
    }
  }, [id, isNewRecord]);

  // Manejar cambio de foto
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Subir foto
  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    
    try {
      setUploadingPhoto(true);
      const response = await ApiService.uploadPhoto(id, photoFile);
      
      // Actualizar ficha con nueva foto
      setFicha({
        ...ficha,
        foto_url: response.foto_url
      });
      
      setSuccessMessage('Foto actualizada correctamente');
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      setError('Error al subir la foto');
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Renderizar cargando
  if (loading) {
    return (
      <Container className="medical-record-container text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando información médica...</p>
      </Container>
    );
  }

  // Renderizar error
  if (error || !ficha) {
    return (
      <Container className="medical-record-container py-4">
        <Alert variant="danger">
          {error || 'Ficha médica no encontrada'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="medical-record-container py-4">
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
          {successMessage}
        </Alert>
      )}
      
      <Card className="medical-record-card">
        <Card.Header as="h2" className="text-center">
          Información Médica
        </Card.Header>
        
        <Card.Body>
          <Row>
            <Col md={4} className="text-center mb-4">
              <div className="patient-photo-container-large">
                <Image 
                  src={photoPreview || (ficha.foto_url === 'default.png' 
                    ? '/default-profile.png' 
                    : `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/uploads/${ficha.foto_url}`)} 
                  alt="Foto del paciente" 
                  className="patient-photo-large" 
                  rounded
                />
              </div>
              
              <div className="mt-3">
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>Cambiar foto</Form.Label>
                  <Form.Control 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={uploadingPhoto}
                  />
                </Form.Group>
                
                {photoFile && (
                  <Button 
                    variant="primary" 
                    onClick={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? 'Subiendo...' : 'Guardar Foto'}
                  </Button>
                )}
              </div>
              
              <div className="qr-container mt-4">
                <h5>Código QR</h5>
                <Image src={qrUrl} alt="Código QR" className="qr-code" />
                <div className="mt-2">
                  <a href={qrUrl} download={`ficha-medica-${id}.png`} className="btn btn-sm btn-outline-primary">
                    Descargar QR
                  </a>
                </div>
              </div>
            </Col>
            
            <Col md={8}>
              <Row>
                <Col xs={12}>
                  <h3 className="patient-name">{ficha.nombre} {ficha.apellido}</h3>
                  <div className="patient-id">ID: {ficha.id}</div>
                </Col>
                
                <Col xs={12} className="mt-4">
                  <Card className="info-card">
                    <Card.Header className="info-header">
                      Información Personal
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col sm={6}>
                          <p><strong>Tipo de Sangre:</strong></p>
                          <p className="data-value blood-type">{ficha.tipo_sangre}</p>
                        </Col>
                        <Col sm={6}>
                          <p><strong>Fecha de Registro:</strong></p>
                          <p className="data-value">{ficha.fecha_registro}</p>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col xs={12} className="mt-3">
                  <Card className="info-card">
                    <Card.Header className="info-header">
                      Contacto de Emergencia
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col sm={6}>
                          <p><strong>Nombre:</strong></p>
                          <p className="data-value">{ficha.contacto_emergencia}</p>
                        </Col>
                        <Col sm={6}>
                          <p><strong>Teléfono:</strong></p>
                          <p className="data-value">
                            {ficha.numero_contacto ? 
                              (ficha.numero_contacto.startsWith('+') ? 
                                ficha.numero_contacto : 
                                `+${ficha.numero_contacto}`) 
                            : ''}
                          </p>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col xs={12} className="mt-3">
                  <Card className="info-card">
                    <Card.Header className="info-header">
                      Información Médica
                    </Card.Header>
                    <Card.Body>
                      <p><strong>Alergias:</strong></p>
                      <p className="data-value">{ficha.alergias || 'Ninguna'}</p>
                      
                      <p className="mt-3"><strong>Medicaciones:</strong></p>
                      <p className="data-value">{ficha.medicaciones || 'Ninguna'}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MedicalRecord; 