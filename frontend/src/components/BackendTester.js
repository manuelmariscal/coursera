import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, Alert, Table } from 'react-bootstrap';
import { ApiService } from '../services/api';

const BackendTester = () => {
  const [backendUrl, setBackendUrl] = useState(ApiService.getBaseUrl());
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseDetails, setResponseDetails] = useState(null);

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    setResponseDetails(null);
    
    // Prueba 1: Verificar conexión al backend (health check)
    try {
      const startTime = new Date().getTime();
      const response = await axios.get(`${backendUrl}/health`, { timeout: 5000 });
      const endTime = new Date().getTime();
      
      setTestResults(prev => [...prev, {
        name: 'Conexión al backend',
        status: 'Exitoso',
        time: `${endTime - startTime}ms`,
        details: response.data,
        response: response
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        name: 'Conexión al backend',
        status: 'Fallido',
        error: error.message,
        details: error.response?.data || 'Sin respuesta del servidor'
      }]);
    }
    
    // Prueba 2: Obtener fichas médicas
    try {
      const startTime = new Date().getTime();
      const response = await axios.get(`${backendUrl}/api/fichas`, { timeout: 5000 });
      const endTime = new Date().getTime();
      
      setTestResults(prev => [...prev, {
        name: 'Obtener fichas médicas',
        status: 'Exitoso',
        time: `${endTime - startTime}ms`,
        details: `Se obtuvo una respuesta con ${response.data?.fichas ? response.data.fichas.length : 0} fichas`,
        response: response
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        name: 'Obtener fichas médicas',
        status: 'Fallido',
        error: error.message,
        details: error.response?.data || 'Sin respuesta del servidor'
      }]);
    }
    
    setLoading(false);
  };
  
  const viewDetails = (result) => {
    setResponseDetails(result);
  };
  
  const updateBackendUrl = () => {
    const newUrl = prompt('Ingresa la URL del backend:', backendUrl);
    if (newUrl) {
      setBackendUrl(newUrl);
    }
  };

  return (
    <Card className="mt-3 mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Diagnóstico de conexión con el backend</h5>
        <div>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="me-2" 
            onClick={updateBackendUrl}
          >
            Cambiar URL
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={runTests} 
            disabled={loading}
          >
            {loading ? 'Ejecutando pruebas...' : 'Ejecutar pruebas'}
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Alert variant="info">
          <strong>URL del backend:</strong> {backendUrl}
          <br />
          <small className="text-muted">
            Esta es la URL configurada para la comunicación con el backend. Si es incorrecta, 
            puedes cambiarla haciendo clic en "Cambiar URL".
          </small>
        </Alert>
        
        {testResults.length > 0 ? (
          <div>
            <Table striped bordered hover className="mt-3">
              <thead>
                <tr>
                  <th>Prueba</th>
                  <th>Estado</th>
                  <th>Tiempo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result, index) => (
                  <tr key={index} className={result.status === 'Exitoso' ? 'table-success' : 'table-danger'}>
                    <td>{result.name}</td>
                    <td>{result.status}</td>
                    <td>{result.time || '-'}</td>
                    <td>
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        onClick={() => viewDetails(result)}
                      >
                        Ver detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            {responseDetails && (
              <div className="mt-4">
                <h6>Detalles de la respuesta: {responseDetails.name}</h6>
                <div className="bg-light p-3 rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {responseDetails.status === 'Fallido' ? (
                    <div className="text-danger">
                      <strong>Error:</strong> {responseDetails.error}
                      <br />
                      <strong>Detalles:</strong> {JSON.stringify(responseDetails.details, null, 2)}
                    </div>
                  ) : (
                    <pre className="mb-0">
                      {JSON.stringify(responseDetails.response?.data || responseDetails.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center mt-3">
            {loading ? (
              <p>Ejecutando pruebas, por favor espera...</p>
            ) : (
              <p className="text-muted">Haz clic en "Ejecutar pruebas" para diagnosticar la conexión</p>
            )}
          </div>
        )}
      </Card.Body>
      <Card.Footer className="text-muted">
        <small>
          Componente de diagnóstico para solucionar problemas de comunicación con el backend
        </small>
      </Card.Footer>
    </Card>
  );
};

export default BackendTester; 