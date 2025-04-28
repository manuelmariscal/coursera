#!/bin/bash

# Script para diagnosticar y probar el acceso desde dispositivos móviles
# Este script debe ejecutarse después de configurar ngrok

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

# Solicitar la URL del backend
read -p "Ingresa la URL del backend (por ejemplo, https://tu-dominio-ngrok.ngrok-free.app): " BACKEND_URL

# Verificar si la URL es válida
if [ -z "$BACKEND_URL" ]; then
    print_error "No se proporcionó una URL. Saliendo."
    exit 1
fi

# Eliminar barra diagonal al final, si existe
BACKEND_URL=${BACKEND_URL%/}

print_header "DIAGNÓSTICO DE ACCESO DESDE DISPOSITIVOS MÓVILES"
echo "URL del backend: $BACKEND_URL"

# 1. Verificar si el servidor está en línea
print_header "Verificando si el servidor está en línea"
HEALTH_RESPONSE=$(curl -s -X GET "${BACKEND_URL}/health" \
    -H "X-Mobile-Device: true" \
    -H "User-Agent: Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36" \
    -H "Accept: application/json")

if [ -z "$HEALTH_RESPONSE" ]; then
    print_error "No se pudo conectar al servidor. Verifica que la URL sea correcta y que el servidor esté en funcionamiento."
    exit 1
else
    print_success "El servidor está en línea"
    echo "Respuesta: $HEALTH_RESPONSE"
fi

# 2. Verificar los encabezados CORS
print_header "Verificando encabezados CORS"
CORS_HEADERS=$(curl -s -I -X OPTIONS "${BACKEND_URL}/api/fichas" \
    -H "Origin: https://example.com" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: X-Mobile-Device")

if echo "$CORS_HEADERS" | grep -q "Access-Control-Allow-Origin"; then
    print_success "Encabezados CORS configurados correctamente"
else
    print_error "Encabezados CORS no encontrados o incorrectos"
    echo "Respuesta:"
    echo "$CORS_HEADERS"
fi

# 3. Obtener la lista de fichas médicas
print_header "Obteniendo lista de fichas médicas"
FICHAS_RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/fichas" \
    -H "X-Mobile-Device: true" \
    -H "Accept: application/json")

if [ -z "$FICHAS_RESPONSE" ]; then
    print_error "No se pudo obtener la lista de fichas médicas"
else
    if echo "$FICHAS_RESPONSE" | grep -q "\"fichas\""; then
        print_success "Se obtuvieron las fichas médicas correctamente"
        # Contar cuántas fichas hay
        if command -v jq &> /dev/null; then
            NUM_FICHAS=$(echo "$FICHAS_RESPONSE" | jq '.fichas | length')
            print_success "Se encontraron $NUM_FICHAS fichas"
        else
            print_warning "Instala 'jq' para ver estadísticas detalladas de las fichas"
        fi
    else
        print_error "Respuesta recibida, pero no contiene la lista de fichas"
        echo "Respuesta: $FICHAS_RESPONSE"
    fi
fi

# 4. Verificar acceso a imágenes
print_header "Verificando acceso a imágenes"
# Intentar obtener la imagen por defecto
IMAGE_RESPONSE=$(curl -s -I "${BACKEND_URL}/uploads/default_profile.png")

if echo "$IMAGE_RESPONSE" | grep -q "200 OK"; then
    print_success "Acceso a imágenes funcionando correctamente"
else
    print_warning "No se pudo acceder a la imagen por defecto"
    echo "Esto podría no ser un problema si no existe ese archivo específico"
fi

# 5. Proporcionar instrucciones para acceder desde dispositivos móviles
print_header "INSTRUCCIONES PARA ACCEDER DESDE DISPOSITIVOS MÓVILES"
echo "1. Asegúrate de que tanto el backend como el frontend estén ejecutándose"
echo "2. En tu dispositivo móvil, abre el navegador y visita la URL del frontend:"
echo "   - Si expusiste el frontend con ngrok: URL de ngrok del frontend"
echo "   - Si solo expusiste el backend: Usa la IP local de tu computadora y el puerto 3000"
echo ""
echo "3. Si encuentras problemas de conexión:"
echo "   a) Verifica que estés en la misma red que tu computadora"
echo "   b) Comprueba que no haya firewall bloqueando las conexiones"
echo "   c) Intenta usar la URL de ngrok para el frontend también"
echo ""
echo "4. Para depurar problemas en el dispositivo móvil:"
echo "   a) En Android: Usa chrome://inspect en tu computadora para depurar remotamente"
echo "   b) En iOS: Usa Safari Web Inspector para depurar remotamente"
echo ""

print_header "RESUMEN"
echo "URL de backend: $BACKEND_URL"
echo "Frontend configurado para usar este backend: $(grep REACT_APP_BACKEND_URL .env | cut -d '=' -f2)"
echo ""
echo "Para actualizar la configuración del frontend:"
echo "./setup-ngrok.sh $BACKEND_URL"
echo ""
echo "Para reiniciar el backend con la configuración actualizada:"
echo "cd backend && python app.py"
echo "" 