import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions for different endpoints
export const ApiService = {
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
      const response = await api.get('/api/fichas');
      return response.data.fichas;
    } catch (error) {
      console.error('Error getting fichas médicas:', error);
      throw error;
    }
  },

  getFichaById: async (fichaId) => {
    try {
      const response = await api.get(`/api/fichas/${fichaId}`);
      return response.data.ficha;
    } catch (error) {
      console.error(`Error getting ficha médica ${fichaId}:`, error);
      throw error;
    }
  },

  createFicha: async (fichaData) => {
    try {
      const response = await api.post('/api/fichas', fichaData);
      return response.data;
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
      const response = await api.delete(`/api/fichas/${fichaId}`, {
        headers: {
          'X-API-Key': apiKey
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting ficha médica ${fichaId}:`, error);
      throw error;
    }
  },

  searchFichas: async (params) => {
    try {
      const response = await api.get('/api/buscar/fichas', { params });
      return response.data.fichas;
    } catch (error) {
      console.error('Error searching fichas médicas:', error);
      throw error;
    }
  },

  getQRCode: (fichaId) => {
    // Esta URL devuelve directamente la imagen del QR
    return `${api.defaults.baseURL}/api/qr/${fichaId}`;
  },

  uploadPhoto: async (fichaId, photoFile) => {
    try {
      const formData = new FormData();
      formData.append('file', photoFile);
      
      const response = await axios.post(
        `${api.defaults.baseURL}/api/upload_photo/${fichaId}`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error uploading photo for ficha ${fichaId}:`, error);
      throw error;
    }
  }
};

export default api; 