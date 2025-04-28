import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';

const BackendStatus = () => {
  const [status, setStatus] = useState('Desconocido');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        setLoading(true);
        // Intentar obtener el estado del backend
        const response = await ApiService.checkHealth();
        setStatus(response.status || 'OK');
        // Mostrar la URL base que se está utilizando
        setUrl(ApiService.getBaseUrl ? ApiService.getBaseUrl() : 'No disponible');
      } catch (err) {
        console.error('Error al verificar el backend:', err);
        setStatus('Error');
        setError(err.message || 'No se pudo conectar con el backend');
      } finally {
        setLoading(false);
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="backend-status card p-3 mb-4">
      <h5>Estado de la Conexión con el Backend</h5>
      {loading ? (
        <p>Verificando conexión...</p>
      ) : error ? (
        <div className="alert alert-danger">
          <strong>Error de conexión:</strong> {error}
          <hr />
          <p className="mb-0">
            <strong>URL configurada:</strong> {url}
          </p>
          <p className="mb-0 small text-muted">
            Si estás usando ngrok, verifica que la URL configurada sea correcta y que el túnel esté activo.
          </p>
        </div>
      ) : (
        <div className="alert alert-success">
          <strong>Conexión establecida</strong>
          <p className="mb-0">Estado: {status}</p>
          <p className="mb-0">URL del backend: {url}</p>
        </div>
      )}
    </div>
  );
};

export default BackendStatus; 