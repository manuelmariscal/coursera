import React, { useState, useEffect, useContext } from 'react';
import { ApiService } from '../services/api';
import { Modal, Button, Form, Table, Alert, Row, Col, Card, Image, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './MedicalRecords.css';
import BackendTester from '../components/BackendTester';
import MobileConnectionStatus from '../components/MobileConnectionStatus';
import RateLimitWarning from '../components/RateLimitWarning';
import { AuthContext } from '../context/AuthContext';

const MedicalRecords = () => {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useContext(AuthContext);
  
  // Estado para administración de fichas
  const [selectedFichas, setSelectedFichas] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingFichas, setDeletingFichas] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [useAdminPassword, setUseAdminPassword] = useState(true);
  const [showAdminPasswordInfo, setShowAdminPasswordInfo] = useState(false);
  
  // Estado para rate limit
  const [showRateLimitWarning, setShowRateLimitWarning] = useState(false);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);

  // Detectar si es un dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/android|iPad|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        setIsMobile(true);
        console.log("Dispositivo móvil detectado");
      }
    };

    checkIfMobile();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipo_sangre: '',
    contacto_emergencia: '',
    codigo_pais: '+57',
    numero_contacto: '',
    alergias: '',
    medicaciones: ''
  });

  // Cargar fichas médicas
  const loadFichas = async () => {
    try {
      setLoading(true);
      console.log("Cargando fichas médicas...");
      
      // Intentar obtener las fichas con un timeout más largo para redes móviles
      let data;
      
      try {
        data = await ApiService.getAllFichas();
        console.log("Respuesta de getAllFichas:", data);
      } catch (apiError) {
        console.error("Error inicial en getAllFichas:", apiError);
        
        // Verificar si es error de rate limit
        if (apiError.response && apiError.response.status === 429) {
          handleRateLimitError(apiError);
          return;
        }
        
        if (isMobile) {
          // En dispositivos móviles, intentamos un enfoque alternativo con fetch
          console.log("Usando estrategia alternativa para móviles...");
          try {
            // Construir URL completa
            const baseUrl = ApiService.getBaseUrl();
            const apiUrl = `${baseUrl}/api/fichas`;
            console.log("Intentando conexión directa a:", apiUrl);
            
            const response = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Mobile-Device': 'true'
              },
              // Para garantizar que las credenciales se envían
              credentials: 'include'
            });
            
            if (!response.ok) {
              // Verificar si es error de rate limit
              if (response.status === 429) {
                const data = await response.json();
                setError('Límite de solicitudes excedido. Por favor, espere antes de intentar nuevamente.');
                setShowRateLimitWarning(true);
                setRetryAfterSeconds(60); // Valor por defecto si no hay header
                return;
              }
              throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const jsonData = await response.json();
            console.log("Respuesta del fetch directo:", jsonData);
            
            if (jsonData && jsonData.status === 'success' && Array.isArray(jsonData.fichas)) {
              setFichas(jsonData.fichas);
              setLoading(false);
              setError(null);
              return;
            } else {
              throw new Error("Formato de respuesta inválido");
            }
          } catch (fetchError) {
            console.error("Error en estrategia alternativa:", fetchError);
            throw fetchError; // Propagar el error para manejo posterior
          }
        } else {
          throw apiError; // Propagar el error original si no es móvil
        }
      }
      
      // Verificar si la respuesta es válida (un array)
      if (Array.isArray(data)) {
        console.log(`Se obtuvieron ${data.length} fichas médicas`);
        setFichas(data);
        setError(null);
      } else {
        console.error('Respuesta inválida de la API: la respuesta no es un array', data);
        setFichas([]);
        setError('Error: La respuesta del servidor no tiene el formato esperado');
      }
    } catch (err) {
      console.error('Error al cargar las fichas médicas:', err);
      
      // Verificar si es error de rate limit
      if (err.response && err.response.status === 429) {
        handleRateLimitError(err);
        return;
      }
      
      setFichas([]);
      setError(`Error al cargar las fichas médicas: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar errores de rate limit
  const handleRateLimitError = (error) => {
    console.warn('Rate limit excedido:', error);
    
    // Extraer tiempo de espera recomendado si está disponible
    let retryAfter = 60; // Valor por defecto: 1 minuto
    
    if (error.response) {
      // Intentar obtener el tiempo de espera del header o datos de la respuesta
      const retryHeader = error.response.headers['retry-after'];
      
      if (retryHeader) {
        retryAfter = parseInt(retryHeader, 10);
      } else if (error.response.data && error.response.data.reset) {
        const resetTime = new Date(error.response.data.reset);
        retryAfter = Math.ceil((resetTime - new Date()) / 1000);
      }
      
      // Asegurarse de que sea un valor razonable
      if (isNaN(retryAfter) || retryAfter <= 0) {
        retryAfter = 60;
      } else if (retryAfter > 300) {
        retryAfter = 300; // Máximo 5 minutos
      }
    }
    
    setError('Límite de solicitudes excedido. Por favor, espere antes de intentar nuevamente.');
    setShowRateLimitWarning(true);
    setRetryAfterSeconds(retryAfter);
  };

  useEffect(() => {
    loadFichas();
  }, []);

  // Buscar fichas
  const searchFichas = async () => {
    if (!searchTerm.trim()) {
      loadFichas();
      return;
    }

    try {
      setLoading(true);
      
      // Parámetros de búsqueda
      const searchParams = { 
        nombre: searchTerm,
        apellido: searchTerm
      };
      
      // Intentar buscar por nombre o apellido
      let data;
      
      try {
        data = await ApiService.searchFichas(searchParams);
      } catch (apiError) {
        console.error("Error inicial en searchFichas:", apiError);
        
        // Verificar si es error de rate limit
        if (apiError.response && apiError.response.status === 429) {
          handleRateLimitError(apiError);
          return;
        }
        
        if (isMobile) {
          // En dispositivos móviles, intentamos un enfoque alternativo con fetch
          console.log("Usando estrategia alternativa de búsqueda para móviles...");
          try {
            // Construir URL completa con parámetros de consulta
            const baseUrl = ApiService.getBaseUrl();
            const queryString = new URLSearchParams({
              nombre: searchTerm,
              apellido: searchTerm
            }).toString();
            const apiUrl = `${baseUrl}/api/buscar/fichas?${queryString}`;
            console.log("Intentando búsqueda directa a:", apiUrl);
            
            const response = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Mobile-Device': 'true'
              },
              credentials: 'include'
            });
            
            if (!response.ok) {
              // Verificar si es error de rate limit
              if (response.status === 429) {
                const data = await response.json();
                handleRateLimitError({ response: { data } });
                return;
              }
              throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const jsonData = await response.json();
            console.log("Respuesta de búsqueda directa:", jsonData);
            
            if (jsonData && jsonData.status === 'success' && Array.isArray(jsonData.fichas)) {
              setFichas(jsonData.fichas);
              setLoading(false);
              setError(null);
              return;
            } else {
              throw new Error("Formato de respuesta inválido en búsqueda");
            }
          } catch (fetchError) {
            console.error("Error en estrategia alternativa de búsqueda:", fetchError);
            throw fetchError; // Propagar el error para manejo posterior
          }
        } else {
          throw apiError; // Propagar el error original si no es móvil
        }
      }
      
      // Verificar si la respuesta es válida
      if (Array.isArray(data)) {
        setFichas(data);
        setError(null);
      } else {
        console.error('Respuesta inválida de la API en búsqueda: la respuesta no es un array', data);
        setFichas([]);
        setError('Error: La respuesta del servidor no tiene el formato esperado');
      }
    } catch (err) {
      console.error('Error al buscar fichas médicas:', err);
      
      // Verificar si es error de rate limit
      if (err.response && err.response.status === 429) {
        handleRateLimitError(err);
        return;
      }
      
      setFichas([]);
      setError(`Error al buscar fichas médicas: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Manejo del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validar que no se usen emojis ni caracteres especiales
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/; // Solo letras, espacios y caracteres acentuados
    if (name === 'nombre' || name === 'apellido' || name === 'contacto_emergencia') {
      if (!regex.test(value)) {
        setError('Solo se permiten letras y espacios. No se permiten emojis ni caracteres especiales.');
        return;
      } else {
        setError(null);
      }
    }

    // Validar que el número de contacto tenga exactamente 10 dígitos
    if (name === 'numero_contacto') {
      const phoneRegex = /^\d{0,10}$/; // Permitir hasta 10 dígitos
      if (!phoneRegex.test(value)) {
        setError('El número de contacto debe contener exactamente 10 dígitos.');
        return;
      } else {
        setError(null);
      }
    }

    // Capitalizar automáticamente la primera letra de cada palabra
    const capitalizeWords = (text) => {
      return text
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'nombre' || name === 'apellido' || name === 'contacto_emergencia'
        ? capitalizeWords(value)
        : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      tipo_sangre: '',
      contacto_emergencia: '',
      codigo_pais: '+57',
      numero_contacto: '',
      alergias: '',
      medicaciones: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que todos los campos requeridos estén completos
    if (!formData.nombre || !formData.apellido || !formData.numero_contacto) {
      setError('Por favor, complete todos los campos obligatorios.');
      return;
    }

    // Validar que el número de contacto tenga exactamente 10 dígitos
    if (formData.numero_contacto.length !== 10) {
      setError('El número de contacto debe contener exactamente 10 dígitos.');
      return;
    }

    try {
      const formattedData = {
        ...formData,
        numero_contacto: `${formData.codigo_pais} ${formData.numero_contacto}`,
      };

      const response = await ApiService.createFicha(formattedData);
      if (response && response.ficha) {
        setSuccessMessage('Ficha médica registrada con éxito - ID: ' + response.ficha.id);
        setShowModal(false);
        loadFichas();
        setTimeout(() => {
          navigate(`/ficha/${response.ficha.id}`, { state: { isNew: true } });
        }, 2000);
      } else {
        setError('Error: La respuesta del servidor no tiene el formato esperado.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la ficha médica');
      console.error(err);
    }
  };

  const viewFicha = (fichaId) => {
    navigate(`/ficha/${fichaId}`);
  };

  // Función para obtener la URL correcta de la imagen para cualquier dispositivo
  const getImageUrl = (ficha) => {
    if (!ficha || !ficha.foto_url || ficha.foto_url === 'default.png') {
      return 'https://via.placeholder.com/200?text=Default+Profile';
    }
    if (ficha.foto_url_completa) {
      return ficha.foto_url_completa;
    }
    return `${ApiService.getBaseUrl()}/uploads/${ficha.foto_url}`;
  };
  
  // Administración de fichas (solo para administradores)
  const toggleSelectFicha = (e, fichaId) => {
    // Prevenir que el evento propague al componente padre
    e.stopPropagation();
    
    if (selectedFichas.includes(fichaId)) {
      setSelectedFichas(selectedFichas.filter(id => id !== fichaId));
    } else {
      setSelectedFichas([...selectedFichas, fichaId]);
    }
  };
  
  const toggleSelectAll = () => {
    if (selectedFichas.length === fichas.length) {
      // Si todas están seleccionadas, deseleccionar todas
      setSelectedFichas([]);
    } else {
      // Seleccionar todas
      setSelectedFichas(fichas.map(ficha => ficha.id));
    }
  };
  
  const handleShowDeleteModal = () => {
    if (selectedFichas.length === 0) {
      setError('Seleccione al menos una ficha para eliminar');
      return;
    }
    
    // Si el usuario ya está autenticado como admin, no necesitamos pedir password de nuevo
    if (user && isAdmin) {
      setShowDeleteModal(true);
    } else {
      setShowApiKeyModal(true);
    }
  };
  
  const handleDeleteSelected = async () => {
    try {
      setDeletingFichas(true);
      
      // Usar la contraseña del admin como API key o la API key directa
      const keyToUse = useAdminPassword ? (user?.password || apiKey) : apiKey;
      
      // Verificar que tenemos una clave para usar
      if (!keyToUse) {
        setError('No se proporcionó una clave válida para la eliminación');
        setDeletingFichas(false);
        return;
      }

      console.log(`Usando ${useAdminPassword ? 'contraseña de administrador' : 'API key directa'} para autorización`);
      
      // Si solo hay una ficha seleccionada, usar deleteFicha
      if (selectedFichas.length === 1) {
        await ApiService.deleteFicha(selectedFichas[0], keyToUse);
        setSuccessMessage(`Ficha médica ${selectedFichas[0]} eliminada correctamente`);
      } else {
        // Si hay múltiples fichas, usar deleteManyFichas
        const result = await ApiService.deleteManyFichas(selectedFichas, keyToUse);
        setSuccessMessage(result.message);
        
        if (result.failed && result.failed.length > 0) {
          console.error('Errores al eliminar fichas:', result.failed);
          
          // Si todas fallaron con 403, probablemente es un problema de API key
          const all403 = result.failed.every(f => f.status === 403);
          if (all403) {
            setError('Error de autorización: La clave proporcionada no es válida para eliminar registros');
          }
        }
      }
      
      // Limpiar selecciones y recargar datos
      setSelectedFichas([]);
      setShowDeleteModal(false);
      setApiKey('');
      loadFichas();
    } catch (err) {
      if (err.message.includes('API key inválida') || err.message.includes('Acceso denegado')) {
        setError('Error de autorización: La clave proporcionada no es válida');
      } else {
        setError('Error al eliminar las fichas: ' + err.message);
      }
    } finally {
      setDeletingFichas(false);
    }
  };
  
  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    
    // Verificar que el usuario proporcionó una contraseña
    if (!apiKey) {
      setPasswordError('Debe ingresar la contraseña de administrador');
      return;
    }
    
    setPasswordError('');
    setShowApiKeyModal(false);
    setShowDeleteModal(true);
  };

  return (
    <div className="medical-records-container">
      <div className="medical-records-header">
        <h1>Fichas Médicas</h1>
        <p className="subtitle">Consulte y registre información médica esencial</p>
        {isMobile && <p className="small text-muted">Accediendo desde dispositivo móvil</p>}
      </div>

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
          <hr />
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={() => setShowDiagnostics(!showDiagnostics)}
            >
              {showDiagnostics ? 'Ocultar diagnóstico' : 'Mostrar diagnóstico'}
            </Button>
          </div>
        </Alert>
      )}

      {showDiagnostics && (
        <>
          <MobileConnectionStatus />
          <BackendTester />
        </>
      )}
      
      {/* Componente de advertencia de rate limit */}
      <RateLimitWarning 
        isVisible={showRateLimitWarning}
        retryAfter={retryAfterSeconds}
        onClose={() => setShowRateLimitWarning(false)}
      />

      <div className="medical-records-actions">
        <div className="search-box">
          <Form.Control
            type="text"
            placeholder="Buscar por nombre o apellido"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchFichas()}
          />
          <Button variant="outline-primary" onClick={searchFichas}>Buscar</Button>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={openCreateModal}>
            Crear Nueva Ficha Médica
          </Button>
          
          {isAdmin && selectedFichas.length > 0 && (
            <Button 
              variant="danger" 
              onClick={handleShowDeleteModal}
            >
              Eliminar {selectedFichas.length > 1 ? `(${selectedFichas.length})` : ''}
            </Button>
          )}
        </div>
      </div>
      
      {isAdmin && fichas && fichas.length > 0 && (
        <div className="admin-controls mb-3">
          <div className="d-flex align-items-center">
            <Form.Check 
              type="checkbox" 
              id="select-all"
              label="Seleccionar todos" 
              checked={selectedFichas.length === fichas.length}
              onChange={toggleSelectAll}
              className="me-2"
            />
            <span className="ms-3">
              {selectedFichas.length} {selectedFichas.length === 1 ? 'ficha seleccionada' : 'fichas seleccionadas'}
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-message">Cargando fichas médicas...</div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {!fichas || fichas.length === 0 ? (
            <Col className="text-center w-100">
              <p>No hay fichas médicas registradas</p>
              {isMobile && (
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={loadFichas}
                  className="mt-2"
                >
                  Recargar datos
                </Button>
              )}
            </Col>
          ) : (
            fichas.map((ficha) => (
              <Col key={ficha.id}>
                <Card className={`medical-card ${selectedFichas.includes(ficha.id) ? 'selected' : ''}`}>
                  {isAdmin && (
                    <div 
                      className="admin-select-overlay"
                      onClick={(e) => toggleSelectFicha(e, ficha.id)}
                    >
                      <Form.Check 
                        type="checkbox" 
                        checked={selectedFichas.includes(ficha.id)}
                        onChange={(e) => toggleSelectFicha(e, ficha.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  <Card.Body onClick={() => viewFicha(ficha.id)}>
                    <div className="patient-photo-container">
                      <Image 
                        src={getImageUrl(ficha)} 
                        alt="Foto del paciente" 
                        className="patient-photo" 
                        onError={(e) => {
                          if (e.target.src !== '/default-profile.png') {
                            console.log('Error al cargar imagen, usando imagen por defecto');
                            e.target.src = '/default-profile.png';
                          }
                        }}
                      />
                    </div>
                    <Card.Title className="text-center mb-3">
                      {ficha.nombre} {ficha.apellido}
                      {isAdmin && selectedFichas.includes(ficha.id) && (
                        <Badge bg="danger" className="ms-2">Seleccionada</Badge>
                      )}
                    </Card.Title>
                    <div className="medical-info">
                      <p><strong>ID:</strong> {ficha.id}</p>
                      <p><strong>Tipo de Sangre:</strong> {ficha.tipo_sangre}</p>
                      <p><strong>Contacto:</strong> {ficha.contacto_emergencia}</p>
                    </div>
                    <div className="text-center mt-3">
                      <Button variant="outline-success" size="sm">Ver Detalles</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}

      {/* Modal para crear ficha médica */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton className="medical-modal-header">
          <Modal.Title>
            Crear Nueva Ficha Médica
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    required 
                    placeholder="Ingrese el nombre (solo letras)"
                  />
                  <Form.Text className="text-muted">
                    Solo se permiten letras y espacios. No se permiten emojis ni caracteres especiales.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="apellido" 
                    value={formData.apellido} 
                    onChange={handleChange} 
                    required 
                    placeholder="Ingrese el apellido (solo letras)"
                  />
                  <Form.Text className="text-muted">
                    Solo se permiten letras y espacios. No se permiten emojis ni caracteres especiales.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Sangre</Form.Label>
              <Form.Select 
                name="tipo_sangre" 
                value={formData.tipo_sangre} 
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contacto de Emergencia</Form.Label>
              <Form.Control 
                type="text" 
                name="contacto_emergencia" 
                value={formData.contacto_emergencia} 
                onChange={handleChange} 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Número de Contacto</Form.Label>
              <Row>
                <Col xs={4} sm={3}>
                  <Form.Select
                    name="codigo_pais"
                    value={formData.codigo_pais || '+57'}
                    onChange={handleChange}
                    required
                  >
                    <option value="+1">+1 (USA/Canadá)</option>
                    <option value="+52">+52 (México)</option>
                    <option value="+54">+54 (Argentina)</option>
                    <option value="+55">+55 (Brasil)</option>
                    <option value="+56">+56 (Chile)</option>
                    <option value="+57">+57 (Colombia)</option>
                    <option value="+58">+58 (Venezuela)</option>
                    <option value="+34">+34 (España)</option>
                    <option value="+49">+49 (Alemania)</option>
                    <option value="+33">+33 (Francia)</option>
                    <option value="+44">+44 (Reino Unido)</option>
                  </Form.Select>
                </Col>
                <Col>
                  <Form.Control 
                    type="text" 
                    name="numero_contacto" 
                    value={formData.numero_contacto} 
                    onChange={handleChange} 
                    required 
                    placeholder="Número sin prefijo (10 dígitos)"
                  />
                  <Form.Text className="text-muted">
                    El número debe contener exactamente 10 dígitos.
                  </Form.Text>
                </Col>
              </Row>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Alergias</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                name="alergias" 
                value={formData.alergias} 
                onChange={handleChange} 
                placeholder="Dejarlo en blanco si no tiene" 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Medicaciones</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                name="medicaciones" 
                value={formData.medicaciones} 
                onChange={handleChange} 
                placeholder="Dejarlo en blanco si no tiene" 
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Modal de confirmación para eliminar fichas */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="medical-modal-header">
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Está seguro que desea eliminar {selectedFichas.length > 1 ? 'estas' : 'esta'} {selectedFichas.length} {selectedFichas.length > 1 ? 'fichas médicas' : 'ficha médica'}?</p>
          <p><strong>Esta acción no se puede deshacer.</strong></p>
          
          {selectedFichas.length <= 5 && (
            <ul className="mt-3">
              {selectedFichas.map(id => {
                const ficha = fichas.find(f => f.id === id);
                return ficha ? (
                  <li key={id}>
                    {ficha.nombre} {ficha.apellido} (ID: {ficha.id})
                  </li>
                ) : null;
              })}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteSelected}
            disabled={deletingFichas}
          >
            {deletingFichas ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Eliminando...
              </>
            ) : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para ingresar contraseña de administrador */}
      <Modal 
        show={showApiKeyModal} 
        onHide={() => setShowApiKeyModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Autenticación de Administrador</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleApiKeySubmit}>
          <Modal.Body>
            <p>Para eliminar registros debe ingresar la clave correcta.</p>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="radio" 
                id="use-admin-password"
                label="Usar contraseña de administrador" 
                checked={useAdminPassword}
                onChange={() => setUseAdminPassword(true)}
                name="auth-type"
              />
              <Form.Check 
                type="radio" 
                id="use-api-key"
                label="Usar API key del sistema" 
                checked={!useAdminPassword}
                onChange={() => setUseAdminPassword(false)}
                name="auth-type"
              />
              <Form.Text className="text-muted">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0"
                  onClick={() => setShowAdminPasswordInfo(!showAdminPasswordInfo)}
                >
                  ¿Qué debo usar?
                </Button>
              </Form.Text>
              
              {showAdminPasswordInfo && (
                <Alert variant="info" className="mt-2">
                  <p><strong>Contraseña de administrador:</strong> La contraseña de su cuenta de administrador.</p>
                  <p><strong>API key del sistema:</strong> La clave configurada en el archivo .env del backend (API_KEY).</p>
                </Alert>
              )}
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{useAdminPassword ? "Contraseña de Administrador" : "API Key del Sistema"}</Form.Label>
              <Form.Control 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                placeholder={`Ingrese ${useAdminPassword ? "contraseña de administrador" : "API key del sistema"}`}
                isInvalid={!!passwordError}
              />
              {passwordError && (
                <Form.Control.Feedback type="invalid">
                  {passwordError}
                </Form.Control.Feedback>
              )}
              <Form.Text className="text-muted">
                {useAdminPassword 
                  ? "Esta es la contraseña de su cuenta de administrador" 
                  : "Esta es la clave API configurada en el archivo .env del backend"}
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowApiKeyModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={!apiKey}>
              Continuar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicalRecords;