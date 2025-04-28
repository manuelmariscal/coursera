#!/bin/bash

# Script para configurar y ejecutar el backend
# Este script instala las dependencias necesarias y ejecuta el backend

# Colores para la salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con formato
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}! $1${NC}"
}

# Verificar si estamos en un entorno virtual
if [ -z "$VIRTUAL_ENV" ]; then
    print_warning "No se detectó un entorno virtual activo."
    read -p "¿Deseas crear y activar un entorno virtual? (s/n): " create_venv
    if [[ $create_venv == "s" || $create_venv == "S" ]]; then
        print_header "Creando entorno virtual"
        python -m venv venv
        print_success "Entorno virtual creado"
        
        # Activar el entorno virtual
        source venv/bin/activate
        print_success "Entorno virtual activado"
    else
        print_warning "Continuando sin entorno virtual. Las dependencias se instalarán globalmente."
    fi
fi

print_header "Configurando directorio persistente para imágenes"
# Crear el directorio persistente
mkdir -p ~/motosegura-data/uploads
print_success "Directorio creado: ~/motosegura-data/uploads"

# Crear archivo .env
print_header "Configurando variables de entorno"
cat > backend/.env << EOL
PERSISTENT_UPLOAD_FOLDER=${HOME}/motosegura-data/uploads
UPLOAD_FOLDER=static/uploads
API_KEY=motosegura-api-key
SECRET_KEY=motosegura-secret-key
EOL
print_success "Archivo .env creado en backend/.env"

# Instalar dependencias
print_header "Instalando dependencias"
pip install -r backend/requirements.txt

if [ $? -eq 0 ]; then
    print_success "Dependencias instaladas correctamente"
else
    print_error "Error al instalar dependencias"
    exit 1
fi

# Crear directorios de uploads
print_header "Creando directorios de uploads"
mkdir -p backend/static/uploads
print_success "Directorio backend/static/uploads creado"

# Iniciar el backend
print_header "Iniciando el backend"
echo "El backend se iniciará en el puerto 5000"
echo "Presiona Ctrl+C para detener el servidor"
cd backend && python app.py 