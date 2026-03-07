# HMR

Proyecto frontend orientado a la hotelería (sistema centralizador de aplicaciones pequeñas integradas).
Este proyecto utiliza React + Vite con Tailwind CSS.

## 🚀 Guía de Inicio Rápido con Docker

Este proyecto está preparado para funcionar en un entorno de desarrollo con Docker Compose.

### Requisitos Previos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Despliegue

Para levantar el entorno de desarrollo, simplemente ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker-compose up --build
```

Esto levantará el contenedor de desarrollo Vite en el puerto `http://localhost:5173`.
Los cambios realizados en el código fuente (`src/`) se reflejarán automáticamente en el navegador gracias a HMR (Hot Module Replacement).

### Comandos Locales Útiles (sin Docker)

Si prefieres ejecutar el proyecto localmente con Node.js en lugar de Docker:

```bash
npm install     # Instalar dependencias
npm run dev     # Iniciar servidor de desarrollo
npm run build   # Construir para producción
```
