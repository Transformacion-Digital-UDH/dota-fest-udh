# Utilizar una imagen oficial de Node.js
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Construir el proyecto para producción
RUN npm run build

# Imagen final para producción
FROM node:20-alpine AS runtime

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias de producción (en standalone a veces algunas se necesitan) y el código compilado
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Exponer el puerto 3001 como solicitaste
EXPOSE 3001

# Variables de entorno de Node / Astro
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

# Comando para ejecutar astro en modo SSR (Standalone usa este entrypoint)
CMD ["node", "./dist/server/entry.mjs", "--host"]
