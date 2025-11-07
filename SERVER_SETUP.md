# Server Setup Guide - Git Pull and Deploy

This guide walks you through setting up the WAINSO web application on your server using Git.

## Prerequisites

- Server with SSH access
- Docker and Docker Compose installed
- Git installed on server
- `nginx_proxy` network exists (for nginx-proxy integration)

---

## Step 1: Initial Server Setup

### 1.1 Connect to Your Server

```bash
ssh user@your-server-ip
# or
ssh user@your-domain.com
```

### 1.2 Create Application Directory

```bash
# Create directory for the application
sudo mkdir -p /srv/apps/wainso.com
# or use your preferred location
sudo mkdir -p /opt/wainso

# Set ownership to your user
sudo chown -R $USER:$USER /srv/apps/wainso.com
# or
sudo chown -R $USER:$USER /opt/wainso

# Navigate to directory
cd /srv/apps/wainso.com
# or
cd /opt/wainso
```

### 1.3 Verify Docker is Installed

```bash
# Check Docker
docker --version
docker compose version

# Check if nginx_proxy network exists
docker network ls | grep nginx_proxy

# If nginx_proxy doesn't exist, create it
docker network create nginx_proxy
```

---

## Step 2: Clone Repository

### 2.1 Clone from Git Repository

**Option A: Using HTTPS (if public or with credentials)**

```bash
cd /srv/apps/wainso.com

# Clone the repository
git clone https://github.com/yourusername/wainsoweb.git .

# Or if repository is private, use:
git clone https://username:token@github.com/yourusername/wainsoweb.git .
```

**Option B: Using SSH (recommended for private repos)**

```bash
cd /srv/apps/wainso.com

# Clone using SSH
git clone git@github.com:yourusername/wainsoweb.git .

# If SSH key is not set up, you'll need to add your SSH key first
```

**Option C: Initialize if you're pushing from local**

```bash
cd /srv/apps/wainso.com

# Initialize git if not already a repo
git init
git remote add origin https://github.com/yourusername/wainsoweb.git
# or
git remote add origin git@github.com:yourusername/wainsoweb.git

# Pull from remote
git pull origin main
# or
git pull origin master
```

### 2.2 Verify Files

```bash
# Check that all files are present
ls -la

# Should see:
# - Dockerfile
# - docker-compose.yml
# - package.json
# - src/
# - public/
# - nginx.conf
```

---

## Step 3: Create Required Directories

```bash
# Create logs directory for Nginx logs
mkdir -p logs

# Verify directory structure
ls -la
```

---

## Step 4: Configure Environment (Optional)

### 4.1 Create .env File (if needed)

```bash
# Create .env file if your app uses environment variables
nano .env
```

Add any required environment variables:
```env
NODE_ENV=production
REACT_APP_API_URL=https://api.wainso.com
```

### 4.2 Update Domain in docker-compose.yml

```bash
# Edit docker-compose.yml to set your domain
nano docker-compose.yml
```

Update the domain label:
```yaml
labels:
  - "nginx.proxy.domain=wainso.com"  # Change to your domain
  - "nginx.proxy.redirects=www.wainso.com:https://wainso.com"
```

---

## Step 5: Build and Deploy

### 5.1 Build and Start Container

```bash
# Build the Docker image and start the container
docker compose up -d --build
```

This will:
- Build the React application
- Create the Docker image
- Start the container
- Connect to nginx_proxy network

### 5.2 Verify Deployment

```bash
# Check if container is running
docker ps

# Check container logs
docker logs wainso-web

# Check health endpoint (from inside container)
docker exec wainso-web wget -O- http://localhost/health

# Check if container is on nginx_proxy network
docker network inspect nginx_proxy | grep wainso-web
```

---

## Step 6: Update Process (Git Pull)

### 6.1 Pull Latest Changes

```bash
# Navigate to application directory
cd /srv/apps/wainso.com
# or
cd /opt/wainso

# Pull latest changes from Git
git pull origin main
# or
git pull origin master

# If you have uncommitted changes, stash them first:
# git stash
# git pull origin main
# git stash pop
```

### 6.2 Rebuild and Restart

```bash
# Stop current container
docker compose down

# Rebuild and start with new changes
docker compose up -d --build

# Or in one command:
docker compose up -d --build --force-recreate
```

### 6.3 Verify Update

```bash
# Check logs for any errors
docker logs -f wainso-web

# Check container status
docker ps
```

---

## Step 7: Automated Update Script (Optional)

Create a script to automate the update process:

```bash
# Create update script
nano /srv/apps/wainso.com/update.sh
```

Add this content:
```bash
#!/bin/bash

set -e  # Exit on error

APP_DIR="/srv/apps/wainso.com"
cd "$APP_DIR"

echo "Pulling latest changes..."
git pull origin main

echo "Rebuilding and restarting container..."
docker compose down
docker compose up -d --build

echo "Checking container status..."
sleep 5
docker ps | grep wainso-web

echo "Update complete!"
```

Make it executable:
```bash
chmod +x /srv/apps/wainso.com/update.sh
```

Use it:
```bash
/srv/apps/wainso.com/update.sh
```

---

## Step 8: Troubleshooting

### Git Pull Fails

```bash
# Check Git remote
git remote -v

# If remote is wrong, update it:
git remote set-url origin https://github.com/yourusername/wainsoweb.git

# Check branch
git branch

# Switch to correct branch
git checkout main
# or
git checkout master
```

### Container Won't Start

```bash
# Check logs
docker logs wainso-web

# Check if nginx_proxy network exists
docker network ls

# Recreate network if needed
docker network create nginx_proxy

# Check Docker Compose syntax
docker compose config
```

### Build Fails

```bash
# Clean Docker cache
docker builder prune

# Rebuild without cache
docker compose build --no-cache

# Check disk space
df -h
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R $USER:$USER /srv/apps/wainso.com

# Fix logs directory
chmod 755 logs
```

---

## Quick Reference Commands

```bash
# Navigate to app directory
cd /srv/apps/wainso.com

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose up -d --build

# View logs
docker logs -f wainso-web

# Stop application
docker compose down

# Start application
docker compose up -d

# Check status
docker ps
docker compose ps

# Restart application
docker compose restart
```

---

## First-Time Setup Checklist

- [ ] Server has Docker and Docker Compose installed
- [ ] `nginx_proxy` network exists
- [ ] Application directory created with proper permissions
- [ ] Repository cloned successfully
- [ ] `logs/` directory created
- [ ] Domain updated in `docker-compose.yml`
- [ ] Container built and started successfully
- [ ] Container is running and healthy
- [ ] Application accessible via domain

---

## Daily Update Workflow

```bash
# 1. SSH into server
ssh user@your-server

# 2. Navigate to app directory
cd /srv/apps/wainso.com

# 3. Pull latest changes
git pull origin main

# 4. Rebuild and restart
docker compose up -d --build

# 5. Verify
docker logs -f wainso-web
```

---

## Automated Updates with Cron (Optional)

Set up automatic updates:

```bash
# Edit crontab
crontab -e

# Add this line to update daily at 2 AM
0 2 * * * cd /srv/apps/wainso.com && git pull origin main && docker compose up -d --build >> /var/log/wainso-update.log 2>&1
```

---

**Your application should now be set up and ready to update via Git pull!**

