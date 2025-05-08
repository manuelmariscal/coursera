# 🏥 MotoSegura - Sistema de Gestión de Fichas Médicas

## 📋 Descripción

MotoSegura es un sistema contenerizado diseñado para la gestión de fichas médicas, permitiendo almacenar y acceder a información médica esencial a través de códigos QR. Este sistema está optimizado para emergencias, ofreciendo acceso rápido a información médica vital como tipo de sangre, alergias y medicamentos.

## 🚀 Tech Stack

- **Backend**: Python (Flask)
- **Frontend**: React
- **Base de Datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **Contenerización**: Docker y Docker Compose
- **Túneles de Exposición**: Cloudflare Tunnels (uno para el frontend y otro para el backend)

## 🌐 Puertos y DNS

- **Frontend**: Expuesto en el puerto `3000` a través de un túnel de Cloudflare
- **Backend**: Expuesto en el puerto `5000` a través de un túnel de Cloudflare

## 🔒 Medidas de Seguridad

1. **Rate Limiting**: Límite de solicitudes para prevenir abusos (10 solicitudes por minuto por IP).
2. **Autenticación API Key**: Operaciones privilegiadas como eliminar o actualizar fichas requieren una API key.
3. **JWT Tokens**: Autenticación segura para usuarios registrados.
4. **Túneles Cloudflare**: Todo el tráfico hacia el frontend y backend pasa por túneles seguros de Cloudflare.
5. **Validación de Datos**: Validación estricta de entradas en el backend para prevenir inyecciones.

## 📦 Componentes

- **Backend**: API RESTful para gestionar fichas médicas, generar códigos QR y manejar autenticación.
- **Frontend**: Interfaz moderna y responsiva para usuarios y administradores.
- **Base de Datos**: Almacena información médica y usuarios.
- **Túneles Cloudflare**: Exponen el sistema de manera segura a internet.

## ⚙️ Uso

### Clonar el Repositorio

```bash
git clone https://github.com/manuelmariscal/motosegura.git
cd motosegura
```

### Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
API_KEY=tu_api_key
DATABASE_URI=sqlite:///instance/motosegura.db
JWT_SECRET=tu_jwt_secret
UPLOAD_FOLDER=uploads
```

### Levantar el Sistema

Ejecuta el siguiente comando para construir y levantar los contenedores:

```bash
sudo docker compose up -d --build
```

### Acceso

- **Frontend**: Accede al frontend a través del túnel de Cloudflare configurado.
- **Backend**: Accede al backend a través del túnel de Cloudflare configurado.

## 🖥️ Funcionalidades

1. **Gestión de Fichas Médicas**: Crear, editar, eliminar y buscar fichas médicas.
2. **Códigos QR**: Generación de códigos QR para acceso rápido a fichas médicas.
3. **Carga de Imágenes**: Soporte para fotos de perfil.
4. **Responsive Design**: Interfaz optimizada para dispositivos móviles y escritorio.

## 🤝 Contribución

1. Haz un fork del proyecto.
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y commitea (`git commit -m 'Añadir nueva funcionalidad'`).
4. Sube tu rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

