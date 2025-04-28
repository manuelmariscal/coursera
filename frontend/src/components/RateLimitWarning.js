import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'react-bootstrap';

/**
 * Componente para mostrar advertencias sobre el límite de solicitudes (rate limit)
 * y proporcionar información útil al usuario.
 */
const RateLimitWarning = ({ isVisible, retryAfter, onClose }) => {
  const [countdown, setCountdown] = useState(retryAfter || 60);
  const [intervalId, setIntervalId] = useState(null);

  // Iniciar/detener el temporizador de cuenta regresiva cuando cambian las props
  useEffect(() => {
    if (isVisible && retryAfter && retryAfter > 0) {
      setCountdown(retryAfter);
      
      // Iniciar el temporizador
      const id = setInterval(() => {
        setCountdown(prevCount => {
          if (prevCount <= 1) {
            clearInterval(id);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
      
      setIntervalId(id);
      
      // Limpiar el temporizador cuando el componente se desmonta
      return () => {
        if (id) clearInterval(id);
      };
    } else {
      // Detener el temporizador si el componente se oculta
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  }, [isVisible, retryAfter]);

  // Si no es visible, no renderizar nada
  if (!isVisible) return null;

  return (
    <Alert 
      variant="warning" 
      className="rate-limit-alert"
      dismissible
      onClose={onClose}
    >
      <Alert.Heading>Límite de solicitudes excedido</Alert.Heading>
      <p>
        Se ha excedido el límite de solicitudes permitidas al servidor 
        (máx. 10 solicitudes por minuto).
      </p>
      {countdown > 0 && (
        <p>
          <strong>
            Por favor espere {countdown} {countdown === 1 ? 'segundo' : 'segundos'} 
            antes de intentar nuevamente.
          </strong>
        </p>
      )}
      <hr />
      <p className="mb-0">
        Esto ayuda a proteger el servidor contra sobrecarga y garantiza 
        un servicio estable para todos los usuarios.
      </p>
      <div className="d-flex justify-content-end mt-2">
        <Button 
          variant="outline-secondary" 
          size="sm"
          onClick={onClose}
        >
          Entendido
        </Button>
      </div>
    </Alert>
  );
};

export default RateLimitWarning; 