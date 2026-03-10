# HMR (Hotel Management Project)

Proyecto frontend y backend orientado a la hotelería (sistema centralizador de aplicaciones pequeñas integradas).
Este proyecto utiliza **React + Vite** con **Tailwind CSS** en el frontend, soportado por un backend en **FastAPI** y una base de datos **PostgreSQL**.

---

## 🚀 Guía Rápida para Levantar el Proyecto (Recomendado)

La forma más sencilla de ejecutar este proyecto en cualquier computadora es a través de **Docker**. Esto garantiza que no tengas problemas de versiones, bases de datos o dependencias locales.

### 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:
- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://docs.docker.com/desktop/) (o Docker y Docker Compose)

### 🛠️ Pasos para Iniciar

1. **Clona el repositorio e ingresa a la carpeta** (si aún no lo has hecho):
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd HMR
   ```

2. **Levanta todos los servicios**:
   Ejecuta el siguiente comando en la raíz del proyecto (donde se encuentra el archivo `docker-compose.yml`):
   ```bash
   docker-compose up -d --build
   ```
   *Nota: La opción `-d` corre los contenedores en segundo plano. La bandera `--build` asegura que se construyan las imágenes con tu código más reciente.*

3. **Accede a la aplicación**:
   Una vez que los contenedores estén corriendo, abre tu navegador y visita:
   - 🌐 **Frontend (Aplicación Web):** [http://localhost:5173](http://localhost:5173)
   - ⚙️ **Backend API (Documentación Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

4. **Para detener el proyecto**:
   Cuando termines de trabajar, puedes apagar los contenedores y liberar recursos ejecutando:
   ```bash
   docker-compose down
   ```

---

## 💻 Desarrollo Local Manual (Avanzado, sin usar Docker)

Si por alguna razón prefieres trabajar localmente sin contenedores, deberás levantar el Frontend y Backend por separado:

### 1. Levantar el Frontend (React + Vite)
Requiere [Node.js](https://nodejs.org/) (versión 18+ recomendada).
```bash
# En la raíz del proyecto
npm install     # Instala todas las dependencias
npm run dev     # Inicia el servidor de desarrollo Vite
```

### 2. Levantar el Backend (FastAPI)
Requiere [Python 3.9+](https://www.python.org/downloads/).
```bash
# Entra a la carpeta del servidor
cd server

# Crea y activa un entorno virtual (recomendado)
python -m venv venv
# Activar en Windows:
venv\Scripts\activate
# Activar en Linux/Mac:
source venv/bin/activate

# Instala los requerimientos
pip install -r requirements.txt

# Inicia el servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
> **Atención:** Para que el backend funcione localmente sin Docker, deberás tener una base de datos PostgreSQL corriendo en tu PC y configurar las variables de entorno (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, etc.) adecuadamente. Por eso **se recomienda fuertemente usar Docker**.
