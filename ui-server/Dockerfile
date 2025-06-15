# Dockerfile located at ui-server/Dockerfile
# Build context is the project root: linkindin.us/

# Stage 1: Build the frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app

# Copy frontend package files and install dependencies
# Copy package.json and lock files first to leverage Docker cache
COPY frontend/package.json ./frontend/
RUN cd frontend && \
    npm config set registry https://registry.npmjs.org/ && \
    npm config set //registry.npmjs.org/:_authToken "" && \
    rm -f package-lock.json && \
    npm cache clean --force && \
    npm install

# Copy the rest of the frontend source code
COPY frontend/ ./frontend/

# Build the frontend
RUN cd frontend && npm run build

# Stage 2: Setup the UI server (production)
FROM node:22-alpine AS ui-server-prod
WORKDIR /app

# Copy ui-server package files and install production dependencies
# Copy package.json and lock files first
COPY ui-server/package.json ./ui-server/
RUN cd ui-server && \
    npm config set registry https://registry.npmjs.org/ && \
    npm config set //registry.npmjs.org/:_authToken "" && \
    rm -f package-lock.json && \
    npm cache clean --force && \
    npm install --production

# Copy the rest of the ui-server application code
# Assuming your main server file is server.js as per your ui-server/package.json
COPY ui-server/app.js ./ui-server/app.js
# If you have other files for ui-server (e.g., routes, utils), copy them as well:
# COPY ui-server/src/ ./ui-server/src/

# Create public directory for static assets and logs directory
RUN mkdir -p ./ui-server/public ./ui-server/logs

# Copy built frontend assets from the frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist ./ui-server/public/

# Set working directory for the CMD
WORKDIR /app/ui-server

# Expose the port the ui-server will run on
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
# Add any other runtime environment variables your ui-server needs

# Command to run the ui-server
# This uses the "start" script from your ui-server/package.json if it\'s "node server.js"
# Or directly use "node server.js"
# CMD ["node", "app.js"]

# For more robust process management inside Docker, consider using pm2-runtime:
RUN npm install pm2 -g
CMD ["pm2-runtime", "start", "app.js", "--name", "linkindin-ui"]
