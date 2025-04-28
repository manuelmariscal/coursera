#!/bin/bash
#
# Script de respaldo para MotoSegura
# Realiza copias de seguridad de la base de datos y archivos subidos
#

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración de directorio de respaldos
BACKUP_DIR="./backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="motosegura_backup_$DATE.tar.gz"

# Mensaje inicial
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}       RESPALDO DEL SISTEMA MOTOSEGURA         ${NC}"
echo -e "${BLUE}================================================${NC}"
echo

# Crear directorio de respaldos si no existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}Creando directorio de respaldos...${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Verificar si se está ejecutando con Docker
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker y/o Docker Compose no están instalados.${NC}"
    echo -e "${YELLOW}Este script está diseñado para respaldar una instalación basada en Docker.${NC}"
    exit 1
fi

# Verificar si los contenedores están en ejecución
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${YELLOW}Advertencia: Los contenedores no parecen estar en ejecución.${NC}"
    read -p "¿Desea continuar con el respaldo? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${YELLOW}Operación cancelada.${NC}"
        exit 0
    fi
fi

echo -e "${YELLOW}Iniciando proceso de respaldo...${NC}"

# Crear directorio temporal para el respaldo
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}Directorio temporal creado: $TEMP_DIR${NC}"

# Respaldar la base de datos
echo -e "${YELLOW}Respaldando base de datos...${NC}"

# Detectar tipo de base de datos
if docker-compose exec backend ls /motosegura.db &> /dev/null; then
    # SQLite
    echo -e "${YELLOW}Detectada base de datos SQLite${NC}"
    docker-compose exec backend sh -c "sqlite3 /motosegura.db .dump" > "$TEMP_DIR/database_dump.sql"
    # También copiar el archivo SQLite directamente
    docker-compose cp backend:/motosegura.db "$TEMP_DIR/motosegura.db"
elif docker-compose exec db psql -U postgres -l &> /dev/null; then
    # PostgreSQL
    echo -e "${YELLOW}Detectada base de datos PostgreSQL${NC}"
    docker-compose exec db pg_dump -U postgres -d motosegura > "$TEMP_DIR/database_dump.sql"
else
    echo -e "${RED}No se pudo detectar el tipo de base de datos.${NC}"
    echo -e "${YELLOW}Se continuará con el respaldo de los archivos.${NC}"
fi

# Respaldar archivos de uploads
echo -e "${YELLOW}Respaldando archivos subidos...${NC}"
mkdir -p "$TEMP_DIR/uploads"

# Intentar copiar archivos desde el contenedor
if docker-compose exec backend ls /uploads &> /dev/null; then
    docker-compose cp backend:/uploads/. "$TEMP_DIR/uploads/"
elif [ -d "./uploads" ]; then
    # Si no se puede desde el contenedor, intentar desde el host
    cp -r ./uploads/* "$TEMP_DIR/uploads/" 2>/dev/null || :
elif [ -d "/data/motosegura/uploads" ]; then
    # Para instalaciones en Raspberry Pi
    cp -r /data/motosegura/uploads/* "$TEMP_DIR/uploads/" 2>/dev/null || :
else
    echo -e "${YELLOW}No se encontraron archivos subidos para respaldar.${NC}"
fi

# Respaldar archivos de configuración
echo -e "${YELLOW}Respaldando archivos de configuración...${NC}"
mkdir -p "$TEMP_DIR/config"

# Copiar archivo .env si existe
if [ -f ".env" ]; then
    cp .env "$TEMP_DIR/config/"
fi

# Copiar .env.example si existe
if [ -f ".env.example" ]; then
    cp .env.example "$TEMP_DIR/config/"
fi

# Copiar docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml "$TEMP_DIR/config/"
fi

# Compresión del respaldo
echo -e "${YELLOW}Comprimiendo archivos de respaldo...${NC}"
tar -czf "$BACKUP_DIR/$BACKUP_FILE" -C "$TEMP_DIR" .

# Verificar si el respaldo fue exitoso
if [ $? -eq 0 ]; then
    echo -e "${GREEN}¡Respaldo completado con éxito!${NC}"
    echo -e "${GREEN}Archivo de respaldo: $BACKUP_DIR/$BACKUP_FILE${NC}"
    echo -e "${GREEN}Tamaño del respaldo: $(du -h $BACKUP_DIR/$BACKUP_FILE | cut -f1)${NC}"
else
    echo -e "${RED}Error al crear el archivo de respaldo.${NC}"
fi

# Limpiar directorio temporal
echo -e "${YELLOW}Limpiando archivos temporales...${NC}"
rm -rf "$TEMP_DIR"

# Limitar el número de respaldos (mantener los últimos 5)
echo -e "${YELLOW}Manteniendo sólo los 5 respaldos más recientes...${NC}"
if [ $(ls -1 $BACKUP_DIR/motosegura_backup_*.tar.gz 2>/dev/null | wc -l) -gt 5 ]; then
    ls -t $BACKUP_DIR/motosegura_backup_*.tar.gz | tail -n +6 | xargs rm --
    echo -e "${GREEN}Respaldos antiguos eliminados.${NC}"
fi

echo
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}       PROCESO DE RESPALDO FINALIZADO          ${NC}"
echo -e "${BLUE}================================================${NC}"
echo
echo -e "Para restaurar este respaldo, use el script: ${YELLOW}./restore.sh $BACKUP_FILE${NC}"
echo

exit 0 