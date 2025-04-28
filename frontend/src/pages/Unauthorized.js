import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <Container className="py-5">
      <Alert variant="danger">
        <Alert.Heading>Acceso Denegado</Alert.Heading>
        <p>
          No tienes los permisos necesarios para acceder a esta página. Esta sección
          está reservada para administradores del sistema.
        </p>
        <hr />
        <div className="d-flex justify-content-between">
          <Link to="/">
            <Button variant="outline-secondary">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </Alert>
    </Container>
  );
};

export default Unauthorized; 