# Dockerfile for Frontend
# Build context is the project root: linkindin.us/frontend

FROM node:22-alpine AS frontend-builder
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy source code and build
COPY . ./
RUN npm run build

# Serve the built frontend
FROM node:22-alpine AS frontend-server
WORKDIR /app

# Copy built assets
COPY --from=frontend-builder /app/dist ./public

# Install a lightweight HTTP server
RUN npm install -g serve

# Expose the frontend port
EXPOSE 3001

# Start the server
CMD ["serve", "-s", "public", "-l", "3001"]
