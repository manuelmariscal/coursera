import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './UserDashboard.css';

const UserDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [userRecords, setUserRecords] = useState([]);
  const [userMotorcycles, setUserMotorcycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user records
        const recordsResponse = await axios.get('/api/records/user');
        setUserRecords(recordsResponse.data);
        
        // Fetch user motorcycles
        const motorcyclesResponse = await axios.get('/api/motorcycles/user');
        setUserMotorcycles(motorcyclesResponse.data);
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Error al cargar datos del usuario');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  if (!currentUser) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Debes iniciar sesión para ver tu panel de control.
        </Alert>
      </Container>
    );
  }
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Panel de Control</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col lg={4} className="mb-4">
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Información del Usuario</Card.Title>
              <div className="user-info">
                <p><strong>Nombre:</strong> {currentUser.name}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>Rol:</strong> {currentUser.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
              </div>
              <Link to="/profile">
                <Button variant="outline-primary" className="mt-2 w-100">
                  Ver Perfil Completo
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8} className="mb-4">
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Mis Fichas Médicas</Card.Title>
              {userRecords.length > 0 ? (
                <Table responsive hover className="mt-3">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRecords.map(record => (
                      <tr key={record.id}>
                        <td>{record.id}</td>
                        <td>{new Date(record.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${record.status.toLowerCase()}`}>
                            {record.status}
                          </span>
                        </td>
                        <td>
                          <Link to={`/ficha/${record.id}`}>
                            <Button variant="sm" size="sm">Ver</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info" className="mt-3">
                  No tienes fichas médicas registradas.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card className="dashboard-card">
            <Card.Body>
              <Card.Title>Mis Motocicletas</Card.Title>
              {userMotorcycles.length > 0 ? (
                <Table responsive hover className="mt-3">
                  <thead>
                    <tr>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Año</th>
                      <th>Matrícula</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userMotorcycles.map(motorcycle => (
                      <tr key={motorcycle.id}>
                        <td>{motorcycle.marca}</td>
                        <td>{motorcycle.modelo}</td>
                        <td>{motorcycle.anio}</td>
                        <td>{motorcycle.matricula}</td>
                        <td>
                          <Link to={`/motorcycles/${motorcycle.id}`}>
                            <Button variant="sm" size="sm">Ver</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info" className="mt-3">
                  No tienes motocicletas registradas.
                </Alert>
              )}
              
              <div className="d-flex justify-content-end mt-3">
                <Link to="/motorcycles/add">
                  <Button variant="success">
                    Registrar Nueva Motocicleta
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard; 