# Dockerfile for Backend
# Build context is the project root: linkindin.us/backend

FROM node:22-alpine AS backend-builder
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --production

# Copy source code
COPY . ./

# Expose the backend port
EXPOSE 5000

# Start the backend application
CMD ["node", "src/app.js"]
