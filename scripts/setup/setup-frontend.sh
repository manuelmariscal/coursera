#!/bin/bash

# Script para configurar y ejecutar el frontend
# Este script instala las dependencias necesarias y ejecuta el frontend

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

# Verificar si node y npm están instalados
print_header "Verificando requisitos"
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor, instálalo antes de continuar."
    exit 1
else
    node_version=$(node -v)
    print_success "Node.js está instalado (versión: $node_version)"
fi

if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado. Por favor, instálalo antes de continuar."
    exit 1
else
    npm_version=$(npm -v)
    print_success "npm está instalado (versión: $npm_version)"
fi

# Instalar dependencias del frontend
print_header "Instalando dependencias del frontend"
cd frontend && npm install

if [ $? -eq 0 ]; then
    print_success "Dependencias del frontend instaladas correctamente"
else
    print_error "Error al instalar dependencias del frontend"
    exit 1
fi

# Preguntar por la URL del backend
print_header "Configuración del backend"
echo "Si estás usando ngrok, ingresa la URL completa de ngrok (ej: https://xxxx-xx-xx-xxx-xx.ngrok-free.app)"
echo "Si estás ejecutando el backend localmente, presiona Enter para usar http://localhost:5000"
read -p "URL del backend: " backend_url

if [ -z "$backend_url" ]; then
    backend_url="http://localhost:5000"
    print_warning "Usando URL del backend por defecto: $backend_url"
else
    print_success "URL del backend configurada: $backend_url"
fi

# Crear archivo .env para el frontend
print_header "Configurando variables de entorno del frontend"
cat > frontend/.env << EOL
REACT_APP_API_URL=$backend_url
EOL
print_success "Archivo .env creado en frontend/.env"

# Iniciar el frontend
print_header "Iniciando el frontend"
echo "El frontend se iniciará en http://localhost:3000"
echo "Presiona Ctrl+C para detener el servidor"

# Verificar si se quiere exponer a la red
read -p "¿Deseas exponer el frontend a la red local? (s/n): " expose_network
if [[ $expose_network == "s" || $expose_network == "S" ]]; then
    print_warning "El frontend estará disponible en tu red local"
    cd frontend && npm run start:expose
else
    print_success "El frontend solo estará disponible localmente"
    cd frontend && npm start
fi 