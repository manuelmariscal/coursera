# MotoSegura Frontend

Este es el frontend para la aplicación MotoSegura, una plataforma de seguridad para motocicletas.

## Tecnologías utilizadas

- React.js
- React Router para la navegación
- Axios para comunicación con la API
- Bootstrap para estilos base

## Estructura del proyecto

```
frontend/
  ├── public/            # Archivos públicos
  ├── src/               # Código fuente
  │   ├── assets/        # Imágenes y recursos estáticos
  │   ├── components/    # Componentes reutilizables
  │   ├── pages/         # Componentes de páginas
  │   ├── services/      # Servicios para API
  │   ├── utils/         # Utilidades y helpers
  │   ├── App.js         # Componente principal
  │   ├── index.js       # Punto de entrada
  │   └── ...
  ├── package.json
  └── README.md
```

## Cómo ejecutar

### Desarrollo local

1. Instalar dependencias:
   ```
   npm install
   ```

2. Iniciar servidor de desarrollo:
   ```
   npm start
   ```

### Con Docker

Usando docker-compose desde el directorio raíz del proyecto:

```
docker-compose up
```

El frontend estará disponible en http://localhost:3000 y se comunicará con el backend en http://localhost:5002.
