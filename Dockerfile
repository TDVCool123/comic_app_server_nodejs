FROM node:20-alpine3.19
WORKDIR /app
COPY package.json ./
RUN npm install 
RUN npm install -g typescript
COPY . .
EXPOSE 5000
CMD ["tsc"]
