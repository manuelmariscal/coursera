# 🏥 MotoSegura - Sistema de Gestión de Fichas Médicas

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.9+-blue.svg" alt="Python 3.9+">
  <img src="https://img.shields.io/badge/Flask-2.3.3-green.svg" alt="Flask 2.3.3">
  <img src="https://img.shields.io/badge/React-18.0+-61DAFB.svg" alt="React 18.0+">
  <img src="https://img.shields.io/badge/Docker-Compatible-2496ED.svg" alt="Docker Compatible">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
</div>

## 📋 Descripción

MotoSegura es un sistema completo de gestión de fichas médicas que permite almacenar y acceder a información médica esencial a través de códigos QR. Diseñado específicamente para su uso en emergencias, permite que cualquier persona acceda rápidamente a información médica vital (tipo de sangre, alergias, medicamentos) sin necesidad de autenticación.

Los administradores pueden gestionar todas las fichas médicas, mientras que los usuarios no autenticados pueden consultar la información pública. El sistema incluye protección contra ataques mediante rate limiting, autenticación por API key y un diseño que funciona correctamente tanto en dispositivos móviles como en escritorio.

<p align="center">
  <img src="https://via.placeholder.com/800x400?text=MotoSegura+Screenshot" alt="MotoSegura Screenshot">
</p>

## 🚀 Características Principales

- ✅ **Gestión de Fichas Médicas**: Crear, editar, eliminar y buscar fichas médicas
- 🔒 **Seguridad por Capas**: Diferentes niveles de acceso (administrador/público)
- 📱 **Responsive**: Funciona perfectamente en dispositivos móviles y escritorio
- 🔄 **Rate Limiting**: Protección contra exceso de solicitudes (máx. 10/minuto)
- 🔑 **Autenticación API Key**: Para operaciones privilegiadas
- 📊 **Base de Datos Relacional**: Almacenamiento seguro con SQLite/PostgreSQL
- 📷 **Carga de Imágenes**: Soporte para fotos de perfil
- 🏞️ **Interfaz Moderna**: Diseño limpio y fácil de usar
- 🔍 **Búsqueda Inteligente**: Encuentra fichas rápidamente por nombre o apellido

## 💻 Requisitos del Sistema

- Docker y Docker Compose
- 1GB RAM mínimo (2GB recomendado)
- 1GB espacio disponible en disco
- Conexión a Internet (para descargar dependencias)
- Puertos disponibles: 5000 (backend), 3000 (frontend en desarrollo)

## ⚙️ Instalación y Despliegue Rápido

### Método 1: Script Automatizado (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/manuelmariscal/motosegura.git
cd motosegura

# 2. Ejecutar el script de configuración automatizado
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Método 2: Instalación por Componentes

Si prefieres configurar cada componente por separado:

```bash
# 1. Clonar el repositorio
git clone https://github.com/manuelmariscal/motosegura.git
cd motosegura

# 2. Configurar la base de datos
./scripts/setup/setup-persistence.sh

# 3. Configurar el backend
./scripts/setup/setup-backend.sh

# 4. Configurar el frontend
./scripts/setup/setup-frontend.sh

# 5. (Opcional) Configurar acceso externo con ngrok
./scripts/setup/setup-ngrok.sh
```

### Método 3: Manual

#### 1. Clonar el repositorio

```bash
git clone https://github.com/manuelmariscal/motosegura.git
cd motosegura
```

#### 2. Configurar variables de entorno

```bash
# Crear archivo .env en la raíz del proyecto
cp .env.example .env

# Editar el archivo .env con tus configuraciones
nano .env
```

Variables importantes a configurar:
- `API_KEY`: Clave para operaciones administrativas (ej. eliminar registros)
- `DATABASE_URI`: URI de conexión a la base de datos
- `JWT_SECRET`: Clave secreta para tokens JWT
- `UPLOAD_FOLDER`: Directorio para almacenar imágenes

#### 3. Construir y levantar los contenedores Docker

```bash
docker-compose build
docker-compose up -d
```

#### 4. Acceder a la aplicación

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 Estructura del Proyecto

```
motosegura/
├── backend/               # Servidor API Flask
│   ├── app/               # Módulos de la aplicación
│   │   ├── __init__.py    # Inicialización de Flask
│   │   ├── models.py      # Modelos de la base de datos
│   │   ├── routes.py      # Rutas y endpoints API
│   │   └── utils.py       # Funciones utilitarias
│   ├── debug_app.py       # Aplicación para desarrollo
│   ├── production.py      # Configuración de producción
│   ├── requirements.txt   # Dependencias Python
│   └── Dockerfile         # Configuración Docker para backend
│
├── frontend/              # Aplicación cliente React
│   ├── public/            # Archivos estáticos públicos
│   ├── src/               # Código fuente React
│   │   ├── components/    # Componentes reutilizables
│   │   ├── context/       # Context API para estado global
│   │   ├── pages/         # Páginas/vistas principales
│   │   └── services/      # Servicios API y utilidades
│   ├── package.json       # Dependencias npm
│   └── Dockerfile         # Configuración Docker para frontend
│
├── scripts/               # Scripts para configuración y mantenimiento
│   ├── backup/            # Scripts de respaldo y restauración
│   ├── deployment/        # Scripts de despliegue
│   ├── setup/             # Scripts de configuración
│   ├── test/              # Scripts de pruebas
│   ├── backup-manager.sh  # Gestor de respaldos
│   ├── deploy.sh          # Herramienta de despliegue
│   ├── setup.sh           # Configuración completa
│   └── test-app.sh        # Pruebas de la aplicación
│
├── docker-compose.yml     # Configuración para orquestar contenedores
└── README.md              # Este archivo
```

## 🖥️ Uso

### Acceso como Usuario Público

1. Abrir la URL del sistema en un navegador
2. Ver la lista de fichas médicas disponibles
3. Buscar fichas por nombre o apellido
4. Ver detalles de una ficha específica
5. Escanear código QR para acceso rápido desde dispositivos móviles

### Acceso como Administrador

1. Acceder con credenciales de administrador
2. Gestionar fichas médicas (crear, actualizar, eliminar)
3. Seleccionar múltiples fichas para operaciones por lote
4. Realizar búsquedas avanzadas
5. Subir fotografías para las fichas médicas

## 🔐 Seguridad y Mantenimiento

- **API Key**: Todas las operaciones privilegiadas (eliminar, actualizar) requieren una API key que debe configurarse en el archivo `.env`
- **Rate Limiting**: El sistema limita las solicitudes a 10 por minuto por IP para prevenir ataques
- **Logs**: Revise los logs de Docker para detectar problemas: `docker-compose logs -f`
- **Respaldo**: Respalde regularmente la base de datos ejecutando: `./scripts/backup-manager.sh`
- **Actualización**: Para actualizar el sistema ejecute: `git pull && docker-compose up -d --build`

## 🚀 Entornos de Despliegue

### Desarrollo Local

```bash
# Configuración completa del entorno de desarrollo
./scripts/setup.sh
```

### Producción

```bash
# Despliegue en entorno de producción
./scripts/deploy.sh
```

### Despliegue en Raspberry Pi

```bash
# Despliegue optimizado para Raspberry Pi
./scripts/deploy.sh
# Luego seleccionar la opción 2) Raspberry Pi deployment
```

## 🧪 Pruebas

```bash
# Ejecutar las pruebas de la aplicación
./scripts/test-app.sh

# O ejecutar pruebas específicas
cd backend
python -m unittest discover tests

# Pruebas de frontend
cd frontend
npm test
```

## 📱 Acceso Móvil

El sistema está optimizado para detectar automáticamente dispositivos móviles y adaptar las conexiones API para garantizar un funcionamiento óptimo incluso en redes móviles lentas o inestables.

Para acceder desde un dispositivo móvil:
1. Conectarse a la misma red que el servidor
2. Acceder a la IP del servidor: `http://<ip-servidor>:3000`
3. O utilizar ngrok para acceso externo (configurar con `./scripts/setup/setup-ngrok.sh`)
4. Probar la conectividad móvil con `./scripts/test/test-mobile-access.sh`

## 🤝 Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feature/amazing-feature`)
3. Realiza tus cambios y commitea (`git commit -m 'Add some amazing feature'`)
4. Sube tu rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - vea el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

Si tienes preguntas o sugerencias, no dudes en abrir un issue o contactar al equipo de desarrollo.

