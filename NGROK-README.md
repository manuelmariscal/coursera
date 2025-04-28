# Configuración de MotoSegura con ngrok

Este documento explica cómo configurar MotoSegura para que sea accesible desde Internet utilizando ngrok.

## Requisitos previos

- Tener instalado ngrok ([Descargar desde ngrok.com](https://ngrok.com/download))
- Tener la aplicación MotoSegura (frontend y backend) funcionando localmente

## Paso 1: Iniciar el backend

```bash
cd backend
python app.py
# O utiliza el comando específico para tu entorno
```

El backend debe estar ejecutándose en el puerto 5000.

## Paso 2: Crear un túnel con ngrok para el backend

Abre una nueva terminal y ejecuta:

```bash
ngrok http 5000
```

ngrok te mostrará una URL (por ejemplo, `https://1234abcd.ngrok-free.app`). **Copia esta URL** para el siguiente paso.

## Paso 3: Configurar el frontend para usar la URL de ngrok

Utiliza el script de configuración incluido:

```bash
./setup-ngrok.sh https://1234abcd.ngrok-free.app
```

Reemplaza `https://1234abcd.ngrok-free.app` con la URL que te proporcionó ngrok.

## Paso 4: Iniciar el frontend

```bash
cd frontend
npm run start:expose
```

Este comando inicia el frontend permitiendo acceso desde cualquier IP.

## Paso 5: Acceder a la aplicación

Ahora puedes acceder a tu aplicación MotoSegura desde cualquier dispositivo usando:

1. **Para el frontend**: `http://tu-ip-local:3000` 
   - También puedes usar ngrok para exponer el frontend si lo deseas (ver sección adicional más abajo)
   
2. **Para el backend**: La URL de ngrok que obtuviste en el paso 2.

## Solución de problemas

### Error: Cannot read properties of undefined (reading 'length')

Este error ocurre cuando el componente MedicalRecords intenta acceder a la propiedad 'length' de un objeto que es undefined. Lo más probable es que la comunicación entre el frontend y el backend no se esté realizando correctamente.

Solución:

1. **Verifica que las URLs sean correctas**:
   - Asegúrate de que estás usando la URL correcta de ngrok para el backend
   - Comprueba que la URL no tenga una barra (`/`) al final
   - Abre la consola del navegador (F12) para ver los mensajes de error detallados

2. **Usa el componente de diagnóstico**:
   - Cuando aparezca un error, haz clic en "Mostrar diagnóstico"
   - Ejecuta las pruebas para verificar la conexión con el backend
   - Revisa los detalles de la respuesta para identificar el problema específico

3. **Problemas de CORS**:
   - Si ves errores de CORS en la consola, necesitas configurar correctamente los encabezados en el backend
   - Los errores de CORS generalmente aparecen como "Access to XMLHttpRequest has been blocked by CORS policy"

### Problemas con CORS

CORS (Cross-Origin Resource Sharing) es un mecanismo de seguridad que puede bloquear las solicitudes del frontend al backend cuando están en dominios diferentes.

Para solucionar problemas de CORS:

1. **Verificar la configuración del backend**:
   - Asegúrate de que CORS está habilitado en el backend y configurado para aceptar solicitudes desde cualquier origen
   - En Flask, se configura con `CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)`

2. **Configurar correctamente las credenciales**:
   - En el archivo api.js, asegúrate de que la opción `withCredentials` esté configurada correctamente:
     ```javascript
     const api = axios.create({
       baseURL: apiBaseUrl,
       headers: {
         'Content-Type': 'application/json',
       },
       withCredentials: true  // Importante para CORS con credenciales
     });
     ```

3. **Verificar encabezados HTTP**:
   - La respuesta del servidor debe incluir:
     ```
     Access-Control-Allow-Origin: *  (o el origen específico)
     Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
     Access-Control-Allow-Headers: Content-Type, X-API-Key
     Access-Control-Allow-Credentials: true
     ```

4. **Solución temporal para probar**:
   - Puedes usar una extensión de navegador como "CORS Unblock" para deshabilitar temporalmente CORS y verificar si ese es el problema
   - Nota: Esto solo es para pruebas locales, no para producción

### El frontend no puede conectarse al backend

- **El frontend no puede conectarse al backend**: Asegúrate de que la URL de ngrok esté correctamente configurada en el archivo `.env` del frontend.
  
- **Errores CORS**: El backend tiene configurado CORS para permitir solicitudes de cualquier origen, pero si tienes problemas, verifica la configuración en el backend.

## Configuración avanzada: Exponer también el frontend con ngrok

Si deseas exponer también el frontend con ngrok (para que sea accesible desde cualquier dispositivo sin necesidad de estar en la misma red):

1. Inicia el frontend como se indicó anteriormente
2. En otra terminal, ejecuta: `ngrok http 3000`
3. Usa la nueva URL proporcionada por ngrok para acceder al frontend

Nota: En este caso, aún necesitas configurar el frontend para que se comunique con el backend a través de la URL de ngrok del backend.

## Consideraciones de seguridad

- ngrok expone tu aplicación a Internet. En un entorno de producción, deberías considerar otras soluciones más seguras.
- No expongas datos sensibles ni credenciales a través de tu aplicación mientras usas ngrok.
- La versión gratuita de ngrok asigna URLs aleatorias cada vez que inicias un túnel. Para URLs permanentes, considera usar una cuenta de pago. 