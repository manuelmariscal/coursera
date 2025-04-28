#!/bin/bash

# Script para configurar la integración de frontend y backend con ngrok
# Uso: ./setup-ngrok.sh <url_de_ngrok>

# Verificar si se proporcionó la URL de ngrok
if [ -z "$1" ]; then
  echo "Error: Debes proporcionar la URL de ngrok"
  echo "Uso: ./setup-ngrok.sh <url_de_ngrok>"
  echo "Ejemplo: ./setup-ngrok.sh https://1234abcd.ngrok-free.app"
  exit 1
fi

NGROK_URL=$1

# Eliminar la barra diagonal al final de la URL si existe
NGROK_URL=${NGROK_URL%/}

echo "==============================================="
echo "🚀 CONFIGURACIÓN DE NGROK PARA MOTOSEGURA"
echo "==============================================="

# Crear o actualizar archivo .env para el frontend
echo -e "\n📝 Configurando frontend para usar ngrok..."
echo "REACT_APP_BACKEND_URL=$NGROK_URL" > frontend/.env
echo "✅ Frontend configurado para usar el backend en: $NGROK_URL"

echo -e "\n📋 INSTRUCCIONES PARA EXPONER BACKEND Y FRONTEND"
echo "==============================================="

echo -e "\n1️⃣ BACKEND"
echo "   --------------------------------------"
echo "   a) Inicia el backend en el puerto 5000:"
echo "      cd backend && python app.py"
echo ""
echo "   b) En otra terminal, expón el backend con ngrok:"
echo "      ngrok http 5000"
echo ""
echo "   c) Copia la URL de ngrok para el backend (ej: https://xxxx.ngrok-free.app)"
echo "      ⚠️ Esta es la URL que debes usar en este script"

echo -e "\n2️⃣ FRONTEND"
echo "   --------------------------------------"
echo "   a) Verifica que la URL del backend está configurada:"
echo "      ✅ $NGROK_URL (ya configurada)"
echo ""
echo "   b) Inicia el frontend con acceso desde cualquier IP:"
echo "      cd frontend && npm run start:expose"
echo ""
echo "   c) Opcional: Expón también el frontend con ngrok:"
echo "      ngrok http 3000"

echo -e "\n3️⃣ VERIFICACIÓN"
echo "   --------------------------------------"
echo "   a) Abre el navegador y accede a tu frontend:"
echo "      - Si usas ngrok para el frontend: La URL de ngrok del frontend"
echo "      - Si no: http://tu-ip-local:3000"
echo ""
echo "   b) Verifica que puedes ver los datos desde el backend"
echo "      - Si hay errores, revisa la consola del navegador (F12)"

echo -e "\n❗ SOLUCIÓN DE PROBLEMAS COMUNES"
echo "==============================================="
echo "1. Error CORS: Asegúrate de que el backend tiene habilitado CORS para aceptar"
echo "   peticiones desde cualquier origen (headers Access-Control-Allow-Origin)."
echo ""
echo "2. Error de conexión: Verifica que las URLs de ngrok estén activas y correctas."
echo "   Recuerda que la versión gratuita de ngrok cambia la URL cada vez que se reinicia."
echo ""
echo "3. Error 'Cannot read properties of undefined': Es probable que el frontend"
echo "   no esté recibiendo correctamente los datos del backend. Usa las herramientas"
echo "   de diagnóstico en la aplicación para verificar."
echo ""
echo "4. Si tu ngrok usa la URL .ngrok-free.app, asegúrate de haber aceptado los términos"
echo "   del servicio en el navegador cuando accedas por primera vez."

echo -e "\n✅ CONFIGURACIÓN COMPLETADA"
echo "==============================================="
echo "Frontend configurado para usar el backend en: $NGROK_URL"
echo "Ejecuta: cd frontend && npm run start:expose"
echo "===============================================" 