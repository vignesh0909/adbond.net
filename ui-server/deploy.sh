#!/bin/bash

# LinkinDin UI Server Deployment Script
echo "🚀 Starting LinkinDin UI Server Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're on EC2 by looking for EC2 metadata service
check_ec2() {
    if curl -s --max-time 2 http://169.254.169.254/latest/meta-data/ > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Step 1: Build the frontend
print_status "Building frontend application..."
cd ../frontend
if npm run build; then
    print_status "Frontend build completed successfully!"
else
    print_error "Frontend build failed!"
    exit 1
fi

# Step 2: Copy build files to ui-server
print_status "Copying build files to ui-server..."
cd ../ui-server
mkdir -p public
cp -r ../frontend/dist/* public/
print_status "Build files copied successfully!"

# Step 3: Install dependencies
print_status "Installing ui-server dependencies..."
if npm install --production; then
    print_status "Dependencies installed successfully!"
else
    print_error "Failed to install dependencies!"
    exit 1
fi

# Step 4: Check if running on EC2
if check_ec2; then
    print_status "Detected EC2 environment - Setting up PM2..."
    
    # Install PM2 globally if not exists
    if ! command -v pm2 &> /dev/null; then
        print_status "Installing PM2..."
        sudo npm install -g pm2
    fi
    
    # Stop existing PM2 process if running
    pm2 stop linkindin-ui 2>/dev/null || true
    pm2 delete linkindin-ui 2>/dev/null || true
    
    # Start the application with PM2
    print_status "Starting application with PM2..."
    pm2 start app.js --name "linkindin-ui" --log-file logs/ui-server.log
    pm2 save
    pm2 startup
    
    print_status "Application deployed successfully on EC2!"
    print_status "The application is running with PM2 process manager"
    
else
    print_status "Local environment detected - Starting development server..."
    npm start &
    print_status "UI Server started successfully!"
    print_status "Visit: http://localhost:3001"
fi

print_status "🎉 Deployment completed successfully!"