#!/bin/bash
#
# Script de restauración para MotoSegura
# Restaura una copia de seguridad previamente generada
#

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar si se proporcionó un archivo de respaldo
if [ -z "$1" ]; then
    echo -e "${RED}Error: No se proporcionó un archivo de respaldo.${NC}"
    echo -e "Uso: $0 <archivo_de_respaldo>"
    echo
    echo -e "Respaldos disponibles:"
    
    # Comprobar si hay respaldos
    if [ -d "./backups" ] && [ "$(ls -A ./backups)" ]; then
        ls -lh ./backups/*.tar.gz 2>/dev/null | awk '{print $9 " (" $5 ")"}'
    else
        echo -e "${YELLOW}No se encontraron respaldos disponibles.${NC}"
    fi
    
    exit 1
fi

# Definir ruta del archivo de respaldo
BACKUP_FILE="$1"

# Si no se especifica la ruta completa, asumir que está en ./backups
if [[ ! "$BACKUP_FILE" == /* ]] && [[ ! "$BACKUP_FILE" == ./* ]]; then
    BACKUP_FILE="./backups/$BACKUP_FILE"
fi

# Verificar si el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: El archivo de respaldo '$BACKUP_FILE' no existe.${NC}"
    exit 1
fi

# Mensaje inicial
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}     RESTAURACIÓN DEL SISTEMA MOTOSEGURA        ${NC}"
echo -e "${BLUE}================================================${NC}"
echo
echo -e "${YELLOW}Archivo de respaldo: $BACKUP_FILE${NC}"
echo

# Advertencia
echo -e "${RED}¡ADVERTENCIA!${NC}"
echo -e "${YELLOW}Este proceso eliminará los datos actuales y los reemplazará con el respaldo.${NC}"
echo -e "${YELLOW}Asegúrese de que los contenedores estén detenidos antes de continuar.${NC}"
echo

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker y/o Docker Compose no están instalados.${NC}"
    echo -e "${YELLOW}Este script está diseñado para restaurar una instalación basada en Docker.${NC}"
    exit 1
fi

# Verificar si los contenedores están en ejecución
if docker-compose ps | grep -q "Up"; then
    echo -e "${YELLOW}Algunos contenedores están en ejecución. Se recomienda detenerlos antes de continuar.${NC}"
    read -p "¿Desea detener los contenedores? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${YELLOW}Deteniendo contenedores...${NC}"
        docker-compose down
    else
        echo -e "${YELLOW}Continuando con los contenedores en ejecución.${NC}"
        echo -e "${RED}¡Esto puede causar problemas durante la restauración!${NC}"
    fi
fi

# Confirmar restauración
read -p "¿Está seguro de que desea restaurar este respaldo? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Operación cancelada.${NC}"
    exit 0
fi

# Crear directorio temporal para la restauración
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}Creando directorio temporal: $TEMP_DIR${NC}"

# Descomprimir respaldo en directorio temporal
echo -e "${YELLOW}Descomprimiendo archivo de respaldo...${NC}"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Verificar si la descompresión fue exitosa
if [ $? -ne 0 ]; then
    echo -e "${RED}Error al descomprimir el archivo de respaldo.${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Restaurar archivos de configuración
echo -e "${YELLOW}Restaurando archivos de configuración...${NC}"

# Restaurar .env si existe en el respaldo
if [ -f "$TEMP_DIR/config/.env" ]; then
    cp "$TEMP_DIR/config/.env" ./.env
    echo -e "${GREEN}Archivo .env restaurado.${NC}"
else
    echo -e "${YELLOW}No se encontró el archivo .env en el respaldo.${NC}"
fi

# Restaurar docker-compose.yml si existe en el respaldo
if [ -f "$TEMP_DIR/config/docker-compose.yml" ]; then
    # Hacer copia de seguridad del actual si existe
    if [ -f "./docker-compose.yml" ]; then
        cp ./docker-compose.yml ./docker-compose.yml.bak
        echo -e "${YELLOW}Se ha creado una copia de seguridad del archivo docker-compose.yml actual.${NC}"
    fi
    
    cp "$TEMP_DIR/config/docker-compose.yml" ./docker-compose.yml
    echo -e "${GREEN}Archivo docker-compose.yml restaurado.${NC}"
fi

# Crear directorio de uploads si no existe
if [ ! -d "./uploads" ]; then
    mkdir -p ./uploads
fi

# Restaurar archivos de uploads
echo -e "${YELLOW}Restaurando archivos subidos...${NC}"
if [ -d "$TEMP_DIR/uploads" ] && [ "$(ls -A $TEMP_DIR/uploads)" ]; then
    # Limpiar directorio de uploads actual
    rm -rf ./uploads/*
    
    # Copiar uploads del respaldo
    cp -r "$TEMP_DIR/uploads/." ./uploads/
    echo -e "${GREEN}Archivos subidos restaurados.${NC}"
    
    # Si hay una instalación en Raspberry Pi, copiar también allí
    if [ -d "/data/motosegura/uploads" ]; then
        rm -rf /data/motosegura/uploads/*
        cp -r "$TEMP_DIR/uploads/." /data/motosegura/uploads/
        echo -e "${GREEN}Archivos subidos copiados a /data/motosegura/uploads/.${NC}"
    fi
else
    echo -e "${YELLOW}No se encontraron archivos subidos en el respaldo.${NC}"
fi

# Recrear contenedores para asegurarse de que estén actualizados
echo -e "${YELLOW}Creando contenedores con la configuración restaurada...${NC}"
docker-compose up -d

# Esperar a que los contenedores estén en funcionamiento
echo -e "${YELLOW}Esperando a que los contenedores estén listos...${NC}"
sleep 10

# Restaurar base de datos
echo -e "${YELLOW}Restaurando base de datos...${NC}"

# Verificar si hay un dump de SQLite
if [ -f "$TEMP_DIR/motosegura.db" ]; then
    echo -e "${YELLOW}Restaurando base de datos SQLite...${NC}"
    docker-compose cp "$TEMP_DIR/motosegura.db" backend:/motosegura.db
    echo -e "${GREEN}Base de datos SQLite restaurada.${NC}"
# Verificar si hay un dump SQL
elif [ -f "$TEMP_DIR/database_dump.sql" ]; then
    echo -e "${YELLOW}Restaurando dump SQL...${NC}"
    
    # Detectar tipo de base de datos
    if docker-compose exec backend ls /motosegura.db &> /dev/null; then
        # SQLite
        echo -e "${YELLOW}Detectada base de datos SQLite${NC}"
        cat "$TEMP_DIR/database_dump.sql" | docker-compose exec -T backend sqlite3 /motosegura.db
        echo -e "${GREEN}Base de datos SQLite restaurada.${NC}"
    elif docker-compose exec db psql -U postgres -l &> /dev/null; then
        # PostgreSQL
        echo -e "${YELLOW}Detectada base de datos PostgreSQL${NC}"
        # Recrear la base de datos
        docker-compose exec db psql -U postgres -c "DROP DATABASE IF EXISTS motosegura;"
        docker-compose exec db psql -U postgres -c "CREATE DATABASE motosegura;"
        cat "$TEMP_DIR/database_dump.sql" | docker-compose exec -T db psql -U postgres -d motosegura
        echo -e "${GREEN}Base de datos PostgreSQL restaurada.${NC}"
    else
        echo -e "${RED}No se pudo detectar el tipo de base de datos.${NC}"
        echo -e "${YELLOW}Debe restaurar la base de datos manualmente.${NC}"
    fi
else
    echo -e "${YELLOW}No se encontró un dump de base de datos en el respaldo.${NC}"
fi

# Reiniciar los contenedores para aplicar cambios
echo -e "${YELLOW}Reiniciando contenedores para aplicar cambios...${NC}"
docker-compose restart

# Limpiar directorio temporal
echo -e "${YELLOW}Limpiando archivos temporales...${NC}"
rm -rf "$TEMP_DIR"

echo
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}      PROCESO DE RESTAURACIÓN FINALIZADO       ${NC}"
echo -e "${BLUE}================================================${NC}"
echo
echo -e "${GREEN}¡El sistema MotoSegura ha sido restaurado!${NC}"
echo -e "Puede acceder a la aplicación en: ${YELLOW}http://localhost:3000${NC}"
echo

exit 0 