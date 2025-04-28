# 🏥 MotoSegura - Medical Records Management System

## 📋 Overview
MotoSegura is a secure medical records management system that allows users to store and access medical information through QR codes. The system is designed to be minimalist, secure, and user-friendly.

## 🚀 Features
- QR code generation for medical records
- Secure API with rate limiting
- User-friendly interface
- Containerized deployment
- PostgreSQL database
- API key authentication for admin operations

## 🛠️ Tech Stack
- Backend: Python Flask
- Frontend: HTML, CSS, JavaScript
- Database: PostgreSQL
- Containerization: Docker
- Deployment: Raspberry Pi

## 📦 Project Structure
```
motosegura/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── utils.py
│   ├── config.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── templates/
├── docker-compose.yml
└── README.md
```

## 🔧 Setup Instructions
1. Clone the repository
2. Set up environment variables
3. Build and run Docker containers
4. Access the application at http://localhost:5001

## 🔒 Security Features
- Rate limiting to prevent DDoS attacks
- API key authentication for admin operations
- Secure data storage
- QR code-based access

## 📝 License
MIT License

# 🚀 IBM DevOps and Software Engineering Professional Certification

## 📚 About This Repository
This repository serves as my personal learning journey through the IBM DevOps and Software Engineering Professional Certification program. Here, I document my progress, projects, and hands-on experience with various DevOps tools and software engineering practices.

## 🎯 What I'm Learning
- DevOps methodologies and practices
- Software engineering best practices
- CI/CD pipeline implementation
- Containerization and orchestration
- Cloud-native development
- Agile methodologies
- Automated testing and deployment

## 🛠️ Technologies & Tools
- Docker 🐳
- Kubernetes ☸️
- Jenkins 🔧
- Git & GitHub 📦
- Python 🐍
- Cloud platforms ☁️
- And more!

## 📝 Progress Tracking
This repository will be continuously updated as I progress through the certification program, showcasing my practical implementations and learning outcomes.

---
*"The best way to predict the future is to create it."* - Peter Drucker

# MotoSegura - Fichas Médicas para Motociclistas

MotoSegura es una aplicación web que permite a los motociclistas registrar y acceder a sus fichas médicas mediante códigos QR.

## Características Principales

- Registro de fichas médicas con información personal y de salud
- Códigos QR para acceso rápido en caso de emergencia
- Subida de fotos para identificación
- Gestión de motocicletas asociadas a usuarios
- Panel administrativo para gestión de fichas

## Requisitos de Instalación

- Python 3.9 o superior
- Node.js 16.x o superior
- Nginx
- Base de datos (en memoria para desarrollo)

## Despliegue Rápido en Raspberry Pi

El proyecto incluye un script de despliegue automatizado para Raspberry Pi:

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/motosegura.git
cd motosegura

# 2. Hacer ejecutable el script de despliegue
chmod +x deploy.sh

# 3. Ejecutar el script de despliegue (requiere permisos sudo)
./deploy.sh
```

El script se encargará de:
- Instalar todas las dependencias necesarias
- Configurar el entorno virtual de Python
- Construir la aplicación React para producción
- Configurar Nginx como servidor web y proxy inverso
- Configurar el backend como servicio systemd
- Establecer los permisos correctos para archivos de subida

## Configuración Manual

Si prefieres realizar la configuración manual, sigue estos pasos:

### Backend (Flask)

```bash
# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r backend/requirements.txt

# Ejecutar en desarrollo
cd backend
python debug_app.py

# Ejecutar en producción
gunicorn --workers=3 --bind=127.0.0.1:5000 backend.production:app
```

### Frontend (React)

```bash
# Instalar dependencias
cd frontend
npm install

# Ejecutar en desarrollo
npm start

# Construir para producción
npm run build
```

## Variables de Entorno

El backend soporta las siguientes variables de entorno:

- `FLASK_DEBUG`: Habilita o deshabilita el modo debug (True/False)
- `FLASK_HOST`: Host en el que se ejecutará el servidor (por defecto 0.0.0.0)
- `FLASK_PORT`: Puerto en el que se ejecutará el servidor (por defecto 5000)
- `UPLOAD_DIR`: Directorio para almacenar las fotos subidas (por defecto 'uploads')

## Acceder a la Aplicación

Una vez desplegada, la aplicación estará disponible en:

- http://localhost (o la IP de tu Raspberry Pi)

## Soporte

Para soporte técnico o preguntas, contacta al equipo de desarrollo.

