import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { ApiService } from '../services/api';

const MobileConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [details, setDetails] = useState({});
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  
  const checkConnection = async () => {
    setChecking(true);
    setStatus('checking');
    setError(null);
    
    try {
      console.log('Comprobando conexión con el backend...');
      const baseUrl = ApiService.getBaseUrl();
      
      // Primero intentamos una llamada directa a /health
      try {
        const response = await fetch(`${baseUrl}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Mobile-Device': 'true'
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setStatus('connected');
          setDetails({
            baseUrl,
            isMobile: ApiService.isMobileDevice(),
            apiResponse: data
          });
          console.log('Conexión exitosa con el backend', data);
          setChecking(false);
          return;
        }
      } catch (directError) {
        console.error('Error en verificación directa:', directError);
      }
      
      // Si la llamada directa falla, intentamos un método alternativo
      try {
        const status = await ApiService.getApiStatus();
        setStatus('connected');
        setDetails({
          baseUrl,
          isMobile: ApiService.isMobileDevice(),
          apiResponse: status
        });
        console.log('Conexión exitosa con el backend (método alternativo)', status);
      } catch (apiError) {
        console.error('Error al verificar conexión con el backend:', apiError);
        setStatus('failed');
        setError(`No se pudo conectar con el backend en ${baseUrl}. Error: ${apiError.message}`);
      }
    } catch (err) {
      console.error('Error general al verificar la conexión:', err);
      setStatus('error');
      setError(`Error general: ${err.message}`);
    } finally {
      setChecking(false);
    }
  };
  
  // Verificar la conexión al cargar el componente
  useEffect(() => {
    checkConnection();
  }, []);
  
  return (
    <Card className="mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>Estado de Conexión {ApiService.isMobileDevice() ? '(Dispositivo Móvil)' : ''}</span>
        <Button 
          variant="outline-primary" 
          size="sm" 
          onClick={checkConnection} 
          disabled={checking}
        >
          {checking ? <Spinner animation="border" size="sm" /> : 'Verificar'}
        </Button>
      </Card.Header>
      <Card.Body>
        {status === 'checking' && (
          <div className="text-center py-3">
            <Spinner animation="border" />
            <p className="mt-2">Verificando conexión con el backend...</p>
          </div>
        )}
        
        {status === 'connected' && (
          <>
            <Alert variant="success">
              <strong>✓ Conectado al backend</strong>
              <div>URL: {details.baseUrl}</div>
            </Alert>
            
            <div className="mt-2 text-end">
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
              </Button>
            </div>
            
            {showDetails && (
              <div className="mt-2">
                <pre className="bg-light p-2 rounded">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
        
        {status === 'failed' && (
          <Alert variant="danger">
            <strong>✗ Error de conexión</strong>
            <p className="mt-2">{error}</p>
            <div className="mt-2">
              <p>Sugerencias:</p>
              <ul>
                <li>Verifique que el backend esté en ejecución</li>
                <li>Confirme que está conectado a la misma red</li>
                <li>Intente utilizar ngrok para acceso desde dispositivos móviles</li>
              </ul>
            </div>
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert variant="warning">
            <strong>⚠ Error durante la verificación</strong>
            <p className="mt-2">{error}</p>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default MobileConnectionStatus; 