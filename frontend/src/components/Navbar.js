import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Navbar as BootstrapNavbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" className="navbar">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="navbar-brand">
          MotoSegura
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="nav-link">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/fichas" className="nav-link">Fichas Médicas</Nav.Link>
            <Nav.Link as={Link} to="/about" className="nav-link">Acerca de</Nav.Link>
            <Nav.Link as={Link} to="/contact" className="nav-link">Contacto</Nav.Link>
          </Nav>
          
          <Nav>
            {currentUser ? (
              <NavDropdown 
                title={currentUser.name || 'Mi Cuenta'} 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/dashboard">
                  Panel de Control
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/profile">
                  Mi Perfil
                </NavDropdown.Item>
                
                {isAdmin() && (
                  <>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/admin/fichas">
                      Panel de Administración
                    </NavDropdown.Item>
                  </>
                )}
                
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Cerrar Sesión
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login" className="nav-link">
                Iniciar Sesión
              </Nav.Link>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 