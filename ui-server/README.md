# LinkinDin UI Server

A Node.js Express server for serving the LinkinDin frontend application.

## Features

- 🚀 Serves static React build files
- 🛡️ Security headers with Helmet
- 🗜️ Gzip compression
- 🔄 CORS enabled
- 📱 SPA routing support (React Router)
- 🚀 PM2 process management on EC2

## Local Development

```bash
# Install dependencies
npm install

# Build frontend and start server
npm run build
npm start

# Development mode with nodemon
npm run dev
```

## Deployment to AWS EC2

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add UI server setup"
   git push origin main
   ```

2. **On EC2 Instance:**
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/linkindin.us.git
   cd linkindin.us/ui-server
   
   # Run deployment script
   npm run deploy
   ```

3. **Manual Deployment:**
   ```bash
   # Install Node.js on EC2 first
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 globally
   sudo npm install -g pm2
   
   # Run the deployment
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

## PM2 Commands (On EC2)

```bash
# View status
pm2 status

# View logs
pm2 logs linkindin-ui

# Restart application
pm2 restart linkindin-ui

# Stop application
pm2 stop linkindin-ui
```

## Nginx Configuration (Optional)

If using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```