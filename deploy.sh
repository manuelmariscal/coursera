#!/bin/bash

# Script de despliegue automático de MotoSegura para Raspberry Pi
# Este script prepara el entorno, instala dependencias y configura el servicio

set -e  # Detener en caso de error

echo "======= Iniciando despliegue de MotoSegura ======="
BASEDIR=$(pwd)

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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
required_commands=("python3" "pip" "npm" "node")
missing_commands=0

for cmd in "${required_commands[@]}"; do
  if ! check_command $cmd; then
    missing_commands=$((missing_commands + 1))
  fi
done

if [ $missing_commands -gt 0 ]; then
  echo -e "${YELLOW}Instalando dependencias faltantes...${NC}"
  sudo apt-get update
  sudo apt-get install -y python3 python3-pip python3-venv nodejs npm nginx
fi

# 2. Configurar entorno virtual Python
echo -e "${YELLOW}Configurando entorno virtual Python...${NC}"
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
source venv/bin/activate

# 3. Instalar dependencias de Python
echo -e "${YELLOW}Instalando dependencias de Python...${NC}"
pip install -r backend/requirements.txt
pip install gunicorn

# 4. Configurar frontend
echo -e "${YELLOW}Preparando frontend...${NC}"
cd frontend

# Instalar dependencias de Node.js
echo -e "${YELLOW}Instalando dependencias de Node.js...${NC}"
npm install

# Construir versión de producción
echo -e "${YELLOW}Construyendo frontend para producción...${NC}"
npm run build

cd $BASEDIR

# 5. Configurar directorios necesarios
echo -e "${YELLOW}Configurando directorios...${NC}"
mkdir -p uploads
sudo chmod 777 uploads
mkdir -p backend/uploads
sudo chmod 777 backend/uploads
mkdir -p logs
sudo chmod 777 logs

# 6. Configurar NGINX
echo -e "${YELLOW}Configurando Nginx...${NC}"
NGINX_CONF="/etc/nginx/sites-available/motosegura"
NGINX_ENABLED="/etc/nginx/sites-enabled/motosegura"

# Crear archivo de configuración Nginx
sudo tee $NGINX_CONF > /dev/null << EOF
server {
    listen 80;
    server_name _;  # Cambia esto por tu dominio si lo tienes

    # Archivos estáticos del frontend
    location / {
        root $BASEDIR/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy para la API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Proxy para endpoints específicos
    location /health {
        proxy_pass http://localhost:5000/health;
    }

    # Directorio de uploads
    location /uploads {
        alias $BASEDIR/uploads;
    }

    # Archivos de logs
    access_log $BASEDIR/logs/access.log;
    error_log $BASEDIR/logs/error.log;
}
EOF

# Habilitar sitio
if [ -f "$NGINX_ENABLED" ]; then
    sudo rm $NGINX_ENABLED
fi
sudo ln -s $NGINX_CONF $NGINX_ENABLED

# Validar configuración
sudo nginx -t && sudo systemctl restart nginx

# 7. Crear script de inicio del backend
echo -e "${YELLOW}Creando script de inicio...${NC}"
START_SCRIPT="$BASEDIR/start_backend.sh"

tee $START_SCRIPT > /dev/null << EOF
#!/bin/bash
cd $BASEDIR
source venv/bin/activate
export FLASK_DEBUG=False
export FLASK_HOST=127.0.0.1
export FLASK_PORT=5000
export UPLOAD_DIR=$BASEDIR/uploads

# Iniciar con Gunicorn
exec gunicorn --workers=3 --bind=127.0.0.1:5000 --log-level=info backend.production:app
EOF

chmod +x $START_SCRIPT

# 8. Crear servicio de systemd
echo -e "${YELLOW}Configurando servicio systemd...${NC}"
SERVICE_FILE="/etc/systemd/system/motosegura.service"

sudo tee $SERVICE_FILE > /dev/null << EOF
[Unit]
Description=MotoSegura API Service
After=network.target

[Service]
User=$(whoami)
WorkingDirectory=$BASEDIR
ExecStart=$BASEDIR/start_backend.sh
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable motosegura.service
sudo systemctl start motosegura.service

# 9. Verificar estado
echo -e "${YELLOW}Verificando estado del servicio...${NC}"
sudo systemctl status motosegura.service --no-pager

echo -e "${GREEN}¡Despliegue completado! MotoSegura está ahora disponible en http://localhost${NC}"
echo -e "${YELLOW}Para acceder desde otros dispositivos, usa la IP de esta Raspberry Pi${NC}"
echo -e "${YELLOW}Para verificar logs del backend: sudo journalctl -u motosegura.service${NC}" 