FROM node:20-alpine3.19

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm ci
RUN npm install -g typescript

# Copiar código fuente
COPY . .

# Copiar credentials.json a /app/src y /app/dist
COPY credentials.json /app/src/credentials.json
COPY credentials.json /app/dist/credentials.json

# Exponer el puerto de la aplicación
EXPOSE 3000

CMD ["npm", "run", "dev:ts"]
