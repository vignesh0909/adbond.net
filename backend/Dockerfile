FROM node:22-alpine AS backend-builder
WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . ./

EXPOSE 5000

CMD ["node", "app.js"]