# Guion de Presentación: Proceso de Desarrollo de MotoSegura

## 1. Introducción

MotoSegura es un sistema digital que permite almacenar y consultar información médica esencial de manera rápida y segura, especialmente pensado para situaciones de emergencia. El proyecto fue desarrollado por estudiantes de preparatoria como parte de un reto STEAM.

---

## 2. ¿Cómo se desarrolló el proyecto?

### a) Planeación y Diseño
- **Identificación del problema:** Se detectó la necesidad de que motociclistas y personas en riesgo puedan tener su información médica accesible en caso de accidente.
- **Definición de funcionalidades:** Se decidió que el sistema debía permitir crear, consultar, editar y eliminar fichas médicas, así como generar códigos QR para acceso rápido.
- **Diseño de la experiencia de usuario:** Se realizaron bocetos y diagramas para visualizar cómo sería la aplicación tanto en computadoras como en celulares.
- **Asesoría externa:** Para la parte de desarrollo y elección del tech stack, el equipo fue asesorado por un maestro externo, quien fue guiando el proceso de diseño y de desarrollo, ayudando a tomar decisiones técnicas y a resolver dudas durante el proyecto.
- **Herramientas de GenAI:** Además, se utilizaron herramientas de Inteligencia Artificial Generativa (GenAI) para la creación de código, resolución de problemas y mejoras en el desarrollo, lo que permitió acelerar el proceso y encontrar soluciones innovadoras. Las herraminetas mayormente utilizadas fueron las plataformas de OpenAI (ChatGPT) y Claude.
- **Dominio propio y despliegue en Raspberry Pi:** Se compró un dominio web, el cual fue bastante económico, para poder montar la página correctamente y facilitar el acceso a los usuarios. Además, el aplicativo está montado y funcionando en una Raspberry Pi, lo que demuestra que el sistema puede operar en hardware accesible y de bajo costo.

### b) Elección de Tecnologías (Tech Stack)
- **Frontend (Interfaz de usuario):**
  - **React.js:** Permite crear páginas web interactivas y rápidas. Se usó para construir la parte visual que ven los usuarios.
  - **React Router:** Permite navegar entre diferentes páginas de la aplicación sin recargar la web.
  - **Bootstrap:** Biblioteca de estilos para que la aplicación se vea moderna y sea fácil de usar.
  - **Axios:** Herramienta para que la aplicación pueda comunicarse con el servidor y obtener o enviar datos.

- **Backend (Servidor y lógica):**
  - **Python + Flask:** Flask es un "mini-servidor" que recibe las peticiones de la app, procesa la información y responde. Se usó para crear la API que maneja las fichas médicas.
  - **SQLite (desarrollo) / PostgreSQL (producción):** Bases de datos donde se guarda la información médica y de usuarios.
  - **Docker:** Permite que todo el sistema se pueda instalar y ejecutar fácilmente en cualquier computadora, sin importar el sistema operativo.
  - **Cloudflare Tunnels:** Permite que la aplicación sea accesible desde cualquier lugar de internet, de forma segura.

### c) Desarrollo de Funcionalidades

1. **Creación de la base de datos:**
   - Se diseñó una estructura para guardar la información médica y de usuarios.
2. **Desarrollo del backend:**
   - Se programaron rutas para crear, consultar, editar y eliminar fichas médicas.
   - Se implementó la generación de códigos QR para cada ficha.
   - Se agregaron medidas de seguridad como límites de solicitudes y autenticación.
3. **Desarrollo del frontend:**
   - Se crearon páginas para que los usuarios puedan ver y registrar sus fichas.
   - Se agregó la funcionalidad para escanear y mostrar información usando QR.
   - Se diseñó la interfaz para que sea fácil de usar en computadoras y celulares.
4. **Pruebas y ajustes:**
   - Se probaron todas las funciones en diferentes dispositivos.
   - Se corrigieron errores y se mejoró la experiencia de usuario.

### d) Seguridad y Buenas Prácticas
- **Rate Limiting:** Limita la cantidad de veces que un usuario puede hacer peticiones para evitar abusos.
- **Autenticación:** Solo usuarios registrados pueden modificar o eliminar información.
- **Validación de datos:** Se revisa que la información ingresada sea correcta y segura.

### e) Despliegue y Uso
- Se prepararon scripts para instalar y poner en marcha el sistema fácilmente.
- Se documentó el proceso para que cualquier persona pueda instalarlo y usarlo.

---

## 3. ¿Cómo funciona MotoSegura?

1. **Registro de Fichas Médicas:**
   - Un usuario ingresa sus datos médicos y de contacto en la aplicación.
   - La información se guarda de forma segura en la base de datos.
2. **Generación de Código QR:**
   - Por cada ficha médica, se genera un código QR único.
   - Este QR puede ser impreso o guardado en el celular.
3. **Consulta en Emergencias:**
   - En caso de accidente, cualquier persona puede escanear el QR y ver la información médica esencial, incluso desde un celular.
4. **Administración:**
   - Los administradores pueden gestionar todas las fichas, eliminar registros y mantener el sistema seguro.

---

## 4. Explicación de cada tecnología

- **React.js:** Permite crear interfaces de usuario modernas y reactivas. Cada vez que el usuario interactúa, la página responde sin recargar.
- **Flask:** Es un servidor ligero en Python que recibe las peticiones de la app, procesa la lógica y responde con datos.
- **SQLite/PostgreSQL:** Son bases de datos que almacenan la información. SQLite es simple y se usa para pruebas; PostgreSQL es más robusto y se usa en producción.
- **Docker:** Empaqueta toda la aplicación para que funcione igual en cualquier computadora.
- **Cloudflare Tunnels:** Hace que la aplicación sea accesible desde internet de forma segura, sin exponer directamente la computadora.
- **Bootstrap:** Da estilos y componentes visuales listos para usar, haciendo que la app se vea profesional.
- **Axios:** Permite que el frontend (lo que ve el usuario) se comunique con el backend (el servidor).

---

## 5. Conclusión

MotoSegura es el resultado de un proceso colaborativo, donde se aplicaron tecnologías modernas para resolver un problema real. El sistema es fácil de usar, seguro y accesible desde cualquier lugar, ayudando a salvar vidas en situaciones de emergencia.

---

