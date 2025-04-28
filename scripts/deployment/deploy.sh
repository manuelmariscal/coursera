#!/bin/bash
#
# Script de Despliegue Automatizado para MotoSegura
# Este script configura y despliega toda la aplicación MotoSegura
#

# Colores para una mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con formato
print_message() {
  local type=$1
  local message=$2
  
  case $type in
    "info")
      echo -e "[${BLUE}INFO${NC}] $message"
      ;;
    "success")
      echo -e "[${GREEN}OK${NC}] $message"
      ;;
    "warning")
      echo -e "[${YELLOW}ADVERTENCIA${NC}] $message"
      ;;
    "error")
      echo -e "[${RED}ERROR${NC}] $message"
      ;;
    *)
      echo -e "$message"
      ;;
  esac
}

# Función para verificar si un comando está disponible
check_command() {
  local cmd=$1
  if ! command -v $cmd &> /dev/null; then
    print_message "error" "El comando '$cmd' no está instalado. Por favor, instálelo e inténtelo de nuevo."
    return 1
  fi
  return 0
}

# Función para generar una clave aleatoria segura
generate_secure_key() {
  local length=$1
  if [[ -z "$length" ]]; then
    length=32
  fi
  
  if check_command openssl; then
    openssl rand -hex $((length/2))
  else
    # Fallback si openssl no está disponible
    cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w $length | head -n 1
  fi
}

# Banner de inicio
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║        DESPLIEGUE AUTOMATIZADO                ║"
echo "║             MOTOSEGURA                        ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar requisitos
print_message "info" "Verificando requisitos del sistema..."

# Verificar Docker
if ! check_command docker; then
  print_message "error" "Docker no está instalado. Por favor, instale Docker: https://docs.docker.com/get-docker/"
  exit 1
fi
print_message "success" "Docker está instalado"

# Verificar Docker Compose
if ! check_command docker-compose; then
  print_message "error" "Docker Compose no está instalado. Por favor, instale Docker Compose: https://docs.docker.com/compose/install/"
  exit 1
fi
print_message "success" "Docker Compose está instalado"

# Verificar Git
if ! check_command git; then
  print_message "error" "Git no está instalado. Por favor, instale Git: https://git-scm.com/downloads"
  exit 1
fi
print_message "success" "Git está instalado"

# Crear directorios necesarios
print_message "info" "Creando directorios persistentes..."
mkdir -p data/uploads
mkdir -p data/db
print_message "success" "Directorios creados"

# Configurar variables de entorno
print_message "info" "Configurando variables de entorno..."

# Verificar si .env ya existe
if [ -f .env ]; then
  print_message "warning" "El archivo .env ya existe. ¿Desea sobrescribirlo? (s/n)"
  read -r answer
  if [[ "$answer" != "s" ]] && [[ "$answer" != "S" ]]; then
    print_message "info" "Manteniendo archivo .env existente"
  else
    # Crear nuevo .env
    if [ -f .env.example ]; then
      cp .env.example .env
    else
      # Si no existe .env.example, crear uno básico
      cat > .env << EOL
# Configuración generada por deploy.sh
API_KEY=$(generate_secure_key 32)
JWT_SECRET=$(generate_secure_key 64)
DATABASE_URI=sqlite:///motosegura.db
FLASK_DEBUG=False
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
UPLOAD_FOLDER=uploads
PERSISTENT_UPLOAD_FOLDER=/data/motosegura/uploads
EOL
    fi
    print_message "success" "Archivo .env creado con éxito"
  fi
else
  # Crear nuevo .env
  if [ -f .env.example ]; then
    cp .env.example .env
    print_message "info" "Copiado .env.example a .env"
  else
    # Si no existe .env.example, crear uno básico
    cat > .env << EOL
# Configuración generada por deploy.sh
API_KEY=$(generate_secure_key 32)
JWT_SECRET=$(generate_secure_key 64)
DATABASE_URI=sqlite:///motosegura.db
FLASK_DEBUG=False
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
UPLOAD_FOLDER=uploads
PERSISTENT_UPLOAD_FOLDER=/data/motosegura/uploads
EOL
    print_message "success" "Archivo .env creado con éxito"
  fi
fi

# Crear frontend/.env si no existe
if [ ! -f frontend/.env ]; then
  print_message "info" "Creando archivo .env para frontend..."
  cat > frontend/.env << EOL
REACT_APP_API_URL=http://localhost:5000
EOL
  print_message "success" "Archivo frontend/.env creado con éxito"
fi

# Construir y levantar los contenedores
print_message "info" "Construyendo y levantando contenedores Docker..."
if docker-compose build; then
  print_message "success" "Construcción completada con éxito"
else
  print_message "error" "Error al construir los contenedores"
  exit 1
fi

if docker-compose up -d; then
  print_message "success" "Contenedores levantados con éxito"
else
  print_message "error" "Error al levantar los contenedores"
  exit 1
fi

# Verificar que los servicios están funcionando
print_message "info" "Verificando que los servicios estén en ejecución..."
sleep 5 # Dar tiempo a los servicios para iniciar

# Verificar backend
backend_status=$(docker-compose ps backend | grep "Up" | wc -l)
if [ "$backend_status" -gt 0 ]; then
  print_message "success" "Backend está en ejecución"
else
  print_message "error" "Backend no está en ejecución. Verifique los logs: docker-compose logs backend"
fi

# Verificar frontend
frontend_status=$(docker-compose ps frontend | grep "Up" | wc -l)
if [ "$frontend_status" -gt 0 ]; then
  print_message "success" "Frontend está en ejecución"
else
  print_message "error" "Frontend no está en ejecución. Verifique los logs: docker-compose logs frontend"
fi

# Mostrar información final
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════╗"
echo "║        DESPLIEGUE COMPLETADO                  ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

echo "MotoSegura está ahora disponible en:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:5000"
echo ""
echo "Comandos útiles:"
echo "- Ver logs: docker-compose logs -f"
echo "- Detener servicios: docker-compose down"
echo "- Reiniciar servicios: docker-compose restart"
echo ""
echo "¡Gracias por usar MotoSegura!"

exit 0 