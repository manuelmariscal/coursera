#!/bin/bash

# Script para configurar el almacenamiento persistente de imágenes en MotoSegura
# Este script debe ejecutarse antes de iniciar la aplicación

# Directorio donde se guardarán de forma persistente las imágenes
PERSISTENT_DIR="${HOME}/motosegura-data/uploads"
ENV_FILE=".env"

echo "==============================================="
echo "🚀 CONFIGURACIÓN DE ALMACENAMIENTO PERSISTENTE"
echo "==============================================="

# Crear directorio persistente
echo -e "\n📁 Creando directorio persistente..."
mkdir -p "${PERSISTENT_DIR}"
echo "✅ Directorio creado: ${PERSISTENT_DIR}"

# Verificar si ya existe un archivo .env
if [ -f "$ENV_FILE" ]; then
    echo -e "\n📝 Actualizando archivo .env existente..."
    # Verificar si ya existe la variable PERSISTENT_UPLOAD_FOLDER
    if grep -q "PERSISTENT_UPLOAD_FOLDER" "$ENV_FILE"; then
        # Actualizar la variable existente
        sed -i "s|PERSISTENT_UPLOAD_FOLDER=.*|PERSISTENT_UPLOAD_FOLDER=${PERSISTENT_DIR}|g" "$ENV_FILE"
    else
        # Añadir la variable al final del archivo
        echo "PERSISTENT_UPLOAD_FOLDER=${PERSISTENT_DIR}" >> "$ENV_FILE"
    fi
else
    echo -e "\n📝 Creando nuevo archivo .env..."
    echo "PERSISTENT_UPLOAD_FOLDER=${PERSISTENT_DIR}" > "$ENV_FILE"
fi

echo "✅ Archivo .env configurado con el directorio persistente"

# Mostrar permisos del directorio
echo -e "\n🔒 Permisos del directorio persistente:"
ls -ld "${PERSISTENT_DIR}"

# Mostrar cuánto espacio hay disponible
echo -e "\n💾 Espacio disponible en el sistema:"
df -h | grep -E '(Filesystem|/$)'

echo -e "\n✅ CONFIGURACIÓN COMPLETADA"
echo "==============================================="
echo "Variables de entorno configuradas:"
echo "PERSISTENT_UPLOAD_FOLDER=${PERSISTENT_DIR}"
echo ""
echo "Para iniciar la aplicación con estas configuraciones:"
echo "1. Backend: cd backend && python app.py"
echo "2. Frontend: cd frontend && npm start"
echo "==============================================="

# Instrucciones adicionales
echo -e "\n📋 NOTAS IMPORTANTES:"
echo "- Las imágenes se guardarán en ${PERSISTENT_DIR}"
echo "- Estas imágenes persistirán entre reinicios"
echo "- Si necesitas mover este directorio a otro lugar, actualiza la variable PERSISTENT_UPLOAD_FOLDER en .env"
echo "- Para una solución más robusta en producción, considera usar un volumen Docker o almacenamiento en la nube" 