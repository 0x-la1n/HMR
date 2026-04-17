# Hotel Margarita Real (HMR) - Intranet & Management System

![HMR Banner](public/img/logo-hmr-main-white-.png) <!-- Replace with actual banner if available -->

HMR es una plataforma moderna e integral diseñada específicamente para cubrir y optimizar los flujos operativos internos del Hotel Margarita Real. Desarrollada con un enfoque central en el **minimalismo**, el rendimiento y la experiencia de usuario (UX/UI).

---

## 🚀 Filosofía de Diseño y UI/UX

El sistema está construido bajo estrictos principios de diseño visual moderno:
*   **Minimalismo Funcional**: Interfaces limpias que evitan la sobrecarga cognitiva. Menos ruido visual, más eficiencia en el trabajo diario.
*   **Estética "Glassmorphism" / Soft UI**: Uso de transparencias sutiles, bordes redondeados (border-radius consistentes) interacciones suaves al hacer hover, y fondos limpios.
*   **Paleta de Colores Corporativa**: Uso predominante del color oficial (`#009098` / `#0f7681`) mezclado con grises suaves para textos secundarios y divisores, manteniendo un aspecto pulido y premium.
*   **Disposición Modular / Apilada**: Preferencia por layouts horizontales organizados, dashboards inline, y componentes compactos integrados en una misma pantalla (Single Pane of Glass), evitando saltos innecesarios entre rutas.

## 🛠 Tech Stack

### Frontend (User Interface)
*   **React 19**: Construido con Hooks funcionales y los últimos estándares.
*   **Vite**: Entorno de desarrollo ultrarrápido y empaquetador eficiente.
*   **Tailwind CSS (v4)**: Framework de CSS utilitario para un diseño responsivo, estricto y altamente personalizable.
*   **Lucide React**: Iconografía elegante, minimalista y coherente con el estilo de la aplicación.
*   **html2canvas**: Renderizado del DOM a imágenes (utilizado en el Generador de Firmas).
*   **Recharts**: Visualización de datos estadísticos (Dashboards).
*   **React Router DOM v7**: Manejo de rutas y navegación estilo Single Page Application (SPA).

### Backend (API Server)
*   **FastAPI (Python)**: Framework asíncrono, moderno y de alto rendimiento para la API REST.
*   **PostgreSQL**: Motor de base de datos relacional robusto.
*   **Uvicorn**: Servidor ASGI de producción para Python.
*   **PyJWT / Bcrypt**: Autenticación segura mediante JSON Web Tokens (JWT) y hasheo de contraseñas.
*   **Pydantic**: Validación y serialización estricta de datos.

### Infraestructura
*   **Docker / Docker Compose**: Contenerización completa de los 3 servicios (Frontend, Backend, Database) para garantizar paridad entre desarrollo y producción.

---

## 📂 Módulos Principales (Features)

El sistema actualmente soporta los siguientes módulos core:

1.  **Dashboard de Mantenimiento (Control de Cerraduras)**
    *   Módulo unificado para el seguimiento de tareas preventivas y correctivas en habitaciones.
    *   Dashboard en línea con KPI's directos (Alertas predictivas, baterías críticas, reparaciones mecánicas).
    *   Filtros en tiempo real accionables sobre el historial.
2.  **Firmas Corporativas**
    *   Motor de generación dinámica de firmas de correo electrónico corporativo.
    *   Interfaz con validación de entradas de empleados para homologar el formato del hotel.
    *   Historial de firmas (CRUD completo) para re-edición y control del departamento de IT/RRHH.
    *   Previsualización exacta (WYSIWYG) con descarga inteligente (`html2canvas`) ocultando placeholders temporales.

---

## 📁 Estructura del Proyecto

El proyecto sigue una arquitectura clara separando frontend, backend y configuraciones de infraestructura.

```text
├── .git/
├── docker-compose.yml         # Orquestación de contenedores (App, API, DB)
├── Dockerfile                 # Dockerfile para compilar el Frontend (React/Vite)
├── package.json               # Dependencias del Frontend
├── tailwind.config.js / postcss.config.js # Configuración de estilos
├── server/                    # 🐍 BACKEND (FastAPI)
│   ├── Dockerfile             # Dockerfile para entorno Python
│   ├── requirements.txt       # Dependencias de Python
│   ├── main.py                # Entrypoint de FastAPI
│   ├── app/                   # Código de routers, bases de datos y modelos
│   └── ...
├── src/                       # ⚛️ FRONTEND (React)
│   ├── components/            # Componentes reutilizables modulares (ej. Signatures/, Maintenance/)
│   ├── context/               # Manejadores de Estado Global (ej. AuthContext)
│   ├── hooks/                 # Custom Hooks de React (ej. fetching unificado)
│   ├── pages/                 # Páginas completas/Rutas
│   ├── index.css              # Variables globales y directivas base
│   └── main.jsx               # Entrypoint de React
└── public/                    # Archivos estáticos puramente públicos (imágenes corporativas)
```

---

## ⚙️ Guía de Instalación y Despliegue Local

La forma más rápida de levantar el entorno local de desarrollo para uso inmediato y transparente es a través de Docker.

### Prerrequisitos
*   [Docker](https://docs.docker.com/get-docker/) y Docker Compose instalados.
*   Node.js (Opcional, sólo si deseas correr el frontend directamente sin el contenedor).

### Iniciar el entorno (Vía Docker)

1.  **Clona o navega al directorio del repositorio:**
    ```bash
    cd "HMR"
    ```

2.  **Construye y levanta el entorno de desarrollo:**
    Este comando descarga las imágenes de Postgres, Python y Node, instala dependencias e inicia los 3 servicios con Vite en modo desarrollo.
    ```bash
    docker-compose up -d --build
    ```

3.  **Verificar Servicios:**
    *   **Frontend (React/Vite):** Disponible en [http://localhost:5173](http://localhost:5173)
    *   **Backend (FastAPI):** Disponible en [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI automático).
    *   **Database (Postgres):** Accesible internamente por la red de Docker en el puerto 5432 (expuesto externamente en modo dev `15432`).

4.  **Para detener el entorno:**
    ```bash
    docker-compose down
    ```

### Iniciar el entorno de Producción

Si quieres una versión lista para despliegue, el frontend se compila y se sirve con Nginx en el puerto 80.

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

En este modo:

*   El frontend se sirve en [http://localhost](http://localhost).
*   Las rutas SPA se resuelven desde Nginx.
*   Las llamadas a `/api` se proxyan al backend FastAPI dentro de Docker.
*   El backend y PostgreSQL quedan internos en la red de Docker; no se exponen al host por defecto.

Para apagarlo:

```bash
docker compose -f docker-compose.prod.yml down
```

### Cómo elegir desarrollo o producción

*   Usa `docker-compose up -d --build` cuando estés programando y quieras hot reload en `5173`.
*   Usa `docker compose -f docker-compose.prod.yml up -d --build` cuando quieras simular o desplegar el sistema como usuario final.

### Iniciar el Frontend (Vía Node.js Nativo - Opcional)

Si deseas hacer cambios exclusivos visuales en el UI sin depender del reinicio del contenedor frontend:

```bash
# 1. Instalar dependencias
npm install

# 2. Correr el servidor de desarrollo en caliente
npm run dev
```

*(Recuerda que debes tener corriendo el backend `docker-compose up -d hmr-backend postgres` para realizar peticiones reales)*.
