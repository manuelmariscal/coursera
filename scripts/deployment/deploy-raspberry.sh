#!/bin/bash

# Script de despliegue automático de MotoSegura para Raspberry Pi
# Este script prepara el entorno, instala dependencias y configura el servicio

set -e  # Detener en caso de error

echo "======= Iniciando despliegue de MotoSegura en Raspberry Pi ======="
BASEDIR=$(pwd)

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones auxiliares
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}Error: $1 no está instalado.${NC}"
    return 1
  fi
  return 0
}

# 1. Verificar requisitos
echo -e "${YELLOW}Verificando requisitos...${NC}"

# Verificar si estamos en Raspberry Pi
if [ ! -f /etc/os-release ] || ! grep -q "Raspberry Pi" /proc/cpuinfo; then
  echo -e "${YELLOW}Advertencia: No se detectó Raspberry Pi, pero continuando de todos modos...${NC}"
fi

# Verificar comandos requeridos
required_commands=("python3" "pip" "docker" "docker-compose")
missing_commands=0

for cmd in "${required_commands[@]}"; do
  if ! check_command $cmd; then
    missing_commands=$((missing_commands + 1))
  fi
done

if [ $missing_commands -gt 0 ]; then
  echo -e "${YELLOW}Instalando dependencias faltantes...${NC}"
  sudo apt-get update
  sudo apt-get install -y python3 python3-pip python3-venv
  
  # Instalar Docker si no está presente
  if ! check_command docker; then
    echo -e "${YELLOW}Instalando Docker...${NC}"
    curl -sSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo -e "${YELLOW}Se agregó tu usuario al grupo docker. Por favor, cierra sesión y vuelve a iniciar para aplicar cambios.${NC}"
    echo -e "${YELLOW}Luego ejecuta este script nuevamente.${NC}"
    exit 0
  fi
  
  # Instalar Docker Compose si no está presente
  if ! check_command docker-compose; then
    echo -e "${YELLOW}Instalando Docker Compose...${NC}"
    sudo pip3 install docker-compose
  fi
fi

# 2. Verificar hardware Raspberry Pi
echo -e "${YELLOW}Verificando hardware Raspberry Pi...${NC}"
# Obtener información del modelo
model=$(cat /proc/cpuinfo | grep Model | cut -d ':' -f 2 | sed 's/^ //')
memory=$(free -m | grep Mem | awk '{print $2}')
echo -e "${GREEN}Modelo detectado: $model${NC}"
echo -e "${GREEN}Memoria RAM: $memory MB${NC}"

if [ $memory -lt 1000 ]; then
  echo -e "${YELLOW}Advertencia: La Raspberry Pi tiene menos de 1GB de RAM.${NC}"
  echo -e "${YELLOW}El rendimiento puede verse afectado. Se recomienda usar una Raspberry Pi con al menos 2GB de RAM.${NC}"
  read -p "¿Desea continuar? (s/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Instalación cancelada.${NC}"
    exit 1
  fi
fi

# 3. Configurar directorios persistentes
echo -e "${YELLOW}Configurando directorios persistentes...${NC}"
sudo mkdir -p /data/motosegura/uploads
sudo mkdir -p /data/motosegura/db
sudo chown -R $USER:$USER /data/motosegura
echo -e "${GREEN}Directorios persistentes creados en /data/motosegura${NC}"

# 4. Configurar variables de entorno
echo -e "${YELLOW}Configurando variables de entorno...${NC}"
if [ ! -f .env ]; then
  # Generar API key y JWT secret aleatorios
  API_KEY=$(openssl rand -hex 16)
  JWT_SECRET=$(openssl rand -hex 32)
  
  # Crear archivo .env
  cat > .env << EOL
# Configuración para MotoSegura en Raspberry Pi
API_KEY=$API_KEY
JWT_SECRET=$JWT_SECRET
DATABASE_URI=sqlite:///motosegura.db
FLASK_DEBUG=False
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
UPLOAD_FOLDER=/data/motosegura/uploads
PERSISTENT_UPLOAD_FOLDER=/data/motosegura/uploads
EOL
  echo -e "${GREEN}Archivo .env creado${NC}"
else
  echo -e "${YELLOW}Ya existe un archivo .env. Se usará la configuración existente.${NC}"
fi

# 5. Configurar el frontend
echo -e "${YELLOW}Configurando frontend...${NC}"
if [ ! -f frontend/.env ]; then
  # Crear archivo .env para el frontend
  cat > frontend/.env << EOL
REACT_APP_API_URL=http://localhost:5000
EOL
  echo -e "${GREEN}Archivo frontend/.env creado${NC}"
fi

# 6. Crear servicios systemd para autoarranque
echo -e "${YELLOW}Configurando servicios systemd...${NC}"

# Servicio para Docker Compose
SERVICE_FILE="/etc/systemd/system/motosegura.service"

sudo tee $SERVICE_FILE > /dev/null << EOF
[Unit]
Description=MotoSegura Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$BASEDIR
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Recargar servicios de systemd
sudo systemctl daemon-reload
sudo systemctl enable motosegura.service
echo -e "${GREEN}Servicio systemd configurado y habilitado${NC}"

# 7. Construir y levantar contenedores
echo -e "${YELLOW}Construyendo y levantando contenedores...${NC}"
docker-compose build
docker-compose up -d

# 8. Configurar Nginx como proxy inverso
echo -e "${YELLOW}Configurando Nginx como proxy inverso...${NC}"

# Instalar Nginx si no está presente
if ! check_command nginx; then
  echo -e "${YELLOW}Instalando Nginx...${NC}"
  sudo apt-get update
  sudo apt-get install -y nginx
fi

# Crear configuración de Nginx
NGINX_CONF="/etc/nginx/sites-available/motosegura"
NGINX_ENABLED="/etc/nginx/sites-enabled/motosegura"

sudo tee $NGINX_CONF > /dev/null << EOF
server {
    listen 80;
    server_name _;  # Cambia esto por tu dominio si lo tienes

    # Proxy para frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Proxy para API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Endpoint para health check
    location /health {
        proxy_pass http://localhost:5000/health;
    }

    # Servir archivos subidos
    location /uploads {
        alias /data/motosegura/uploads;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
EOF

# Habilitar el sitio
if [ -f "$NGINX_ENABLED" ]; then
    sudo rm $NGINX_ENABLED
fi
sudo ln -s $NGINX_CONF $NGINX_ENABLED

# Verificar configuración de Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
echo -e "${GREEN}Nginx configurado como proxy inverso${NC}"

# 9. Mostrar información y resumen
IP_ADDRESS=$(hostname -I | awk '{print $1}')

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════╗"
echo "║        DESPLIEGUE COMPLETADO                  ║"
echo "║             MOTOSEGURA                        ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

echo "MotoSegura está disponible en:"
echo "- Localmente: http://localhost"
echo "- En tu red: http://$IP_ADDRESS"
echo ""
echo "API Key (para operaciones admin): $API_KEY"
echo ""
echo "Para administrar el servicio:"
echo "- Iniciar: sudo systemctl start motosegura"
echo "- Detener: sudo systemctl stop motosegura"
echo "- Reiniciar: sudo systemctl restart motosegura"
echo "- Ver estado: sudo systemctl status motosegura"
echo ""
echo "Para ver los logs: docker-compose logs -f"
echo ""
echo "¡Gracias por usar MotoSegura!"

exit 0 