# Combined Dockerfile for frontend and backend
# Build context is the project root: linkindin.us/

# Stage 1: Build the frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app

# Copy frontend package.json and install dependencies
COPY frontend/package.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# Copy frontend source and build
WORKDIR /app
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm run build

# Stage 2: Setup the backend
FROM node:22-alpine AS backend-prod
WORKDIR /app

# Copy backend package.json and install dependencies
COPY backend/package.json ./backend/
WORKDIR /app/backend
RUN npm install --production

# Copy backend source
WORKDIR /app
COPY backend/ ./backend/

# Create directories for logs
RUN mkdir -p ./backend/logs

# Copy built frontend assets from the frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist ./backend/public/

# Expose ports for both frontend and backend
EXPOSE 3001 5000

# Set environment variables
ENV NODE_ENV=production
ENV FRONTEND_PORT=3001
ENV BACKEND_PORT=5000

# Start both frontend and backend applications
CMD ["sh", "-c", "pm2-runtime start backend/src/app.js --name adbond-backend && pm2-runtime start frontend/src/main.jsx --name adbond-frontend"]
