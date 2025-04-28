import React, { useState, useContext, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './ProfilePage.css';

const ProfilePage = () => {
  const { currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  
  useEffect(() => {
    // Load user profile data
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/users/profile');
        setProfile(response.data);
      } catch (err) {
        setError('Error al cargar datos del perfil');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await axios.put('/api/users/profile', profile);
      
      setSuccess('Perfil actualizado correctamente');
      setEditing(false);
    } catch (err) {
      setError('Error al actualizar el perfil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (!currentUser) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Debes iniciar sesión para ver tu perfil.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="profile-card">
            <Card.Header className="bg-primary text-white">
              <h2 className="mb-0">Mi Perfil</h2>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              {editing ? (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setEditing(false)}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  <div className="profile-info">
                    <div className="profile-field">
                      <strong>Nombre:</strong>
                      <span>{profile.name}</span>
                    </div>
                    
                    <div className="profile-field">
                      <strong>Email:</strong>
                      <span>{profile.email}</span>
                    </div>
                    
                    <div className="profile-field">
                      <strong>Teléfono:</strong>
                      <span>{profile.phone || 'No especificado'}</span>
                    </div>
                    
                    <div className="profile-field">
                      <strong>Dirección:</strong>
                      <span>{profile.address || 'No especificado'}</span>
                    </div>
                    
                    <div className="profile-field">
                      <strong>Rol:</strong>
                      <span>{currentUser.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-end mt-3">
                    <Button
                      variant="primary"
                      onClick={() => setEditing(true)}
                    >
                      Editar Perfil
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage; 