# Frontend Dockerfile - Desarrollo con Vite
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Puerto de desarrollo de Vite
EXPOSE 5173

# Comando de desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
