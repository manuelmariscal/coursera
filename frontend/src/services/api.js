import axios from 'axios';

// Detectar si se está ejecutando en un dispositivo móvil
const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|iPad|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
};

// URL base del backend configurada por variable de entorno o predeterminada
const apiBaseUrl = process.env.REACT_APP_BACKEND_URL || 'https://api.motosegura.online';
console.log('URL base del backend:', apiBaseUrl);


// Aumentar timeout para dispositivos móviles
const defaultTimeout = isMobileDevice() ? 30000 : 15000;

// Create an axios instance with default config
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  // Aumentar el timeout para permitir conexiones más lentas en redes públicas
  timeout: defaultTimeout,
  // Permitir cookies y credenciales para CORS
  withCredentials: true
});

// Interceptor para logs y diagnóstico
api.interceptors.request.use(
  (config) => {
    console.log(`[API] Llamada a ${config.method.toUpperCase()} ${config.url}`);
    
    // Para dispositivos móviles, añadir encabezados especiales
    if (isMobileDevice()) {
      config.headers['X-Mobile-Device'] = 'true';
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API] Respuesta ${response.status} de ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de estado diferente de 2xx
      console.error(`[API] Error ${error.response.status} en ${error.config.url}:`, error.response.data);
      
      // Manejo específico para límite de solicitudes excedido
      if (error.response.status === 429) {
        const resetTime = error.response.data.reset;
        let waitMessage = "Por favor, espere antes de intentar nuevamente.";
        
        if (resetTime) {
          const resetDate = new Date(resetTime);
          const waitSeconds = Math.ceil((resetDate - new Date()) / 1000);
          waitMessage = `Por favor, espere ${waitSeconds} segundos antes de intentar nuevamente.`;
        }
        
        error.message = `Límite de solicitudes excedido. ${waitMessage}`;
        console.warn('[API] Rate limit excedido:', error.message);
      }
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      console.error('[API] No se recibió respuesta del servidor:', error.request);
    } else {
      // Error al configurar la solicitud
      console.error('[API] Error de configuración:', error.message);
    }
    return Promise.reject(error);
  }
);

// API functions for different endpoints
export const ApiService = {
  // Función para obtener la URL base configurada (útil para diagnóstico)
  getBaseUrl: () => {
    return apiBaseUrl;
  },
  
  // Verificar si es un dispositivo móvil
  isMobileDevice: () => {
    return isMobileDevice();
  },

  // Health check
  checkHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  },

  // Get API status
  getApiStatus: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Error getting API status:', error);
      throw error;
    }
  },

  // Fichas Médicas
  getAllFichas: async () => {
    try {
      // Intentar obtener las fichas
      console.log('Obteniendo fichas médicas...');
      const response = await api.get('/api/fichas');
      
      // Validar la respuesta
      if (response.data && Array.isArray(response.data.fichas)) {
        console.log(`Fichas obtenidas exitosamente: ${response.data.fichas.length}`);
        return response.data.fichas;
      } else {
        console.error('Respuesta inválida de getAllFichas:', response.data);
        
        // Intentar parsear la respuesta por si viene en un formato diferente
        if (response.data && typeof response.data === 'object') {
          if (response.data.status === 'success' && Array.isArray(response.data.fichas)) {
            return response.data.fichas;
          }
        }
        
        throw new Error('La respuesta del servidor no tiene el formato esperado');
      }
    } catch (error) {
      console.error('Error getting fichas médicas:', error);
      // Reenviar el error pero con contexto adicional
      if (error.message === 'La respuesta del servidor no tiene el formato esperado') {
        throw error;
      } else {
        throw new Error(`Error al cargar las fichas médicas: ${error.message}`);
      }
    }
  },

  getFichaById: async (fichaId) => {
    try {
      const response = await api.get(`/api/fichas/${fichaId}`);
      
      // Validar la respuesta
      if (response.data && response.data.ficha) {
        return response.data.ficha;
      } else if (response.data && response.data.status === 'success' && response.data.ficha) {
        return response.data.ficha;
      } else {
        console.error(`Respuesta inválida de getFichaById para ID ${fichaId}:`, response.data);
        throw new Error('La respuesta del servidor no tiene el formato esperado');
      }
    } catch (error) {
      console.error(`Error getting ficha médica ${fichaId}:`, error);
      throw error;
    }
  },

  createFicha: async (fichaData) => {
    try {
      const response = await api.post('/api/fichas', fichaData);
      
      // Validar la respuesta
      if (response.data && response.data.ficha) {
        return response.data;
      } else if (response.data && response.data.status === 'success' && response.data.ficha) {
        return response.data;
      } else {
        console.error('Respuesta inválida de createFicha:', response.data);
        throw new Error('La respuesta del servidor no tiene el formato esperado');
      }
    } catch (error) {
      console.error('Error creating ficha médica:', error);
      throw error;
    }
  },

  updateFicha: async (fichaId, fichaData) => {
    try {
      const response = await api.put(`/api/fichas/${fichaId}`, fichaData);
      return response.data;
    } catch (error) {
      console.error(`Error updating ficha médica ${fichaId}:`, error);
      throw error;
    }
  },

  deleteFicha: async (fichaId, apiKey) => {
    try {
      console.log(`Intentando eliminar ficha ${fichaId} con apiKey: ${apiKey ? '(apiKey provista)' : 'NO PROVISTA'}`);
      
      // Asegurarse de que el apiKey esté presente
      if (!apiKey) {
        console.error('Error al eliminar: API key no proporcionada');
        throw new Error('Se requiere una API key para eliminar fichas');
      }
      
      const response = await api.delete(`/api/fichas/${fichaId}`, {
        headers: {
          'X-API-Key': apiKey
        }
      });
      
      console.log('Respuesta de eliminación:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting ficha médica ${fichaId}:`, error);
      
      // Proporcionar más detalles sobre el error para depuración
      if (error.response) {
        console.error(`Código de estado: ${error.response.status}`);
        console.error('Datos de la respuesta:', error.response.data);
        
        // Si es un error 403, dar un mensaje más específico
        if (error.response.status === 403) {
          throw new Error('Acceso denegado: API key inválida o faltante');
        }
      }
      
      throw error;
    }
  },

  // Función para eliminar múltiples fichas médicas
  deleteManyFichas: async (fichaIds, apiKey) => {
    try {
      console.log(`Intentando eliminar ${fichaIds.length} fichas con apiKey: ${apiKey ? '(apiKey provista)' : 'NO PROVISTA'}`);
      
      // Asegurarse de que el apiKey esté presente
      if (!apiKey) {
        console.error('Error al eliminar: API key no proporcionada');
        throw new Error('Se requiere una API key para eliminar fichas');
      }
      
      const deletePromises = fichaIds.map(id => 
        api.delete(`/api/fichas/${id}`, {
          headers: {
            'X-API-Key': apiKey
          }
        })
      );
      
      const results = await Promise.allSettled(deletePromises);
      
      // Procesar resultados
      const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value.data);
      
      const failed = results
        .filter(result => result.status === 'rejected')
        .map((result, index) => ({
          id: fichaIds[index],
          error: result.reason.message,
          status: result.reason.response?.status
        }));
      
      return {
        status: failed.length === 0 ? "success" : "partial",
        message: `${successful.length} fichas eliminadas, ${failed.length} fallidas`,
        successful,
        failed
      };
    } catch (error) {
      console.error(`Error deleting multiple fichas:`, error);
      throw error;
    }
  },

  searchFichas: async (params) => {
    try {
      const response = await api.get('/api/buscar/fichas', { params });
      
      // Validar la respuesta
      if (response.data && Array.isArray(response.data.fichas)) {
        return response.data.fichas;
      } else {
        console.error('Respuesta inválida de searchFichas:', response.data);
        throw new Error('La respuesta del servidor no tiene el formato esperado');
      }
    } catch (error) {
      console.error('Error searching fichas médicas:', error);
      throw error;
    }
  },

  getQRCode: (fichaId) => {
    // Use the frontend URL for QR code generation
    return `api.motosegura.online/api/qr/${fichaId}`;
  },

  uploadPhoto: async (fichaId, photoFile) => {
    try {
      const formData = new FormData();
      formData.append('file', photoFile);
      
      // Añadir encabezado para indicar si es un dispositivo móvil
      const headers = {
        'Content-Type': 'multipart/form-data'
      };
      
      if (isMobileDevice()) {
        headers['X-Mobile-Device'] = 'true';
      }
      
      const response = await axios.post(
        `${apiBaseUrl}/api/upload_photo/${fichaId}`, 
        formData, 
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error uploading photo for ficha ${fichaId}:`, error);
      throw error;
    }
  }
};

export default api;