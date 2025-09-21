# WAINSO.com Deployment Guide

This guide provides comprehensive instructions for deploying the WAINSO.com React application on an Ubuntu server using Docker.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Application Deployment](#application-deployment)
4. [SSL Configuration](#ssl-configuration)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Server Requirements
- Ubuntu 20.04 LTS or later
- Minimum 2GB RAM
- Minimum 20GB storage
- Root or sudo access
- Domain name pointed to server IP

### Local Requirements
- Git
- SSH access to server
- Basic knowledge of Linux commands

## Server Setup

### 1. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker

```bash
# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker
```

### 3. Install Docker Compose (if not included)

```bash
sudo apt install -y docker-compose
```

### 4. Install Additional Tools

```bash
# Install curl for health checks
sudo apt install -y curl

# Install Git
sudo apt install -y git

# Install UFW firewall
sudo apt install -y ufw
```

### 5. Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

## Application Deployment

### 1. Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/wainso
sudo chown $USER:$USER /opt/wainso
cd /opt/wainso

# Clone repository
git clone https://github.com/yourusername/wainsoweb.git .
```

### 2. Configure Environment

```bash
# Create environment file
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Deploy Application

#### Option A: Using Deployment Script (Recommended)

```bash
# Make script executable
chmod +x deploy.sh

# Deploy application
./deploy.sh deploy

# Check status
./deploy.sh status
```

#### Option B: Manual Deployment

```bash
# Build and start with docker-compose
docker-compose up -d --build

# Or using docker compose (newer syntax)
docker compose up -d --build
```

### 4. Verify Deployment

```bash
# Check container status
docker ps

# Check application health
curl http://localhost/health

# View logs
docker logs wainso-web
```

## SSL Configuration

### Option 1: Using Traefik with Let's Encrypt (Recommended)

```bash
# Create SSL directory
sudo mkdir -p /opt/wainso/letsencrypt
sudo chown $USER:$USER /opt/wainso/letsencrypt

# Start with SSL profile
docker compose --profile ssl up -d

# Access Traefik dashboard
# http://your-domain:8080
```

### Option 2: Using Certbot with Nginx

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d wainso.com -d www.wainso.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Monitoring & Maintenance

### 1. Log Management

```bash
# View application logs
docker logs -f wainso-web

# View Nginx logs
tail -f logs/access.log
tail -f logs/error.log
```

### 2. Backup Strategy

```bash
# Create backup script
sudo nano /opt/backup-wainso.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /opt/backup-wainso.sh
```

### 3. Update Process

```bash
# Pull latest changes
git pull origin main

# Redeploy
./deploy.sh deploy
```

### 4. Health Monitoring

```bash
# Create monitoring script
nano /opt/health-check.sh

# Add to crontab
crontab -e
# Add: */5 * * * * /opt/health-check.sh
```

## Deployment Script Usage

The `deploy.sh` script provides several commands:

```bash
# Deploy application
./deploy.sh deploy

# Rollback to previous version
./deploy.sh rollback

# Check application health
./deploy.sh health

# View logs
./deploy.sh logs

# Show deployment status
./deploy.sh status

# Show help
./deploy.sh help
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Application
NODE_ENV=production
REACT_APP_API_URL=https://api.wainso.com
REACT_APP_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# Docker
COMPOSE_PROJECT_NAME=wainso
DOCKER_IMAGE_TAG=latest

# SSL
DOMAIN=wainso.com
EMAIL=admin@wainso.com
```

## Docker Commands Reference

```bash
# Build image
docker build -t wainso-web .

# Run container
docker run -d --name wainso-web -p 80:80 wainso-web

# Stop container
docker stop wainso-web

# Remove container
docker rm wainso-web

# View logs
docker logs wainso-web

# Execute commands in container
docker exec -it wainso-web sh

# Clean up unused images
docker image prune -f
```

## Troubleshooting

### Common Issues

#### 1. Container Won't Start

```bash
# Check logs
docker logs wainso-web

# Check if port is in use
sudo netstat -tulpn | grep :80

# Kill process using port 80
sudo fuser -k 80/tcp
```

#### 2. Application Not Loading

```bash
# Check container status
docker ps

# Check Nginx configuration
docker exec wainso-web nginx -t

# Restart container
docker restart wainso-web
```

#### 3. SSL Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check Traefik logs
docker logs traefik
```

#### 4. Performance Issues

```bash
# Check resource usage
docker stats

# Check disk space
df -h

# Clean up Docker
docker system prune -f
```

### Log Locations

- Application logs: `docker logs wainso-web`
- Nginx access logs: `./logs/access.log`
- Nginx error logs: `./logs/error.log`
- Deployment logs: `/var/log/wainso-deploy.log`

### Performance Optimization

1. **Enable Gzip Compression**: Already configured in nginx.conf
2. **Set Cache Headers**: Already configured for static assets
3. **Use CDN**: Consider using CloudFlare or AWS CloudFront
4. **Monitor Resources**: Use `docker stats` to monitor usage

## Security Best Practices

1. **Keep System Updated**: Regularly update packages
2. **Use Strong Passwords**: For all accounts
3. **Enable Firewall**: UFW is configured in setup
4. **Regular Backups**: Automated backup strategy
5. **Monitor Logs**: Regular log review
6. **SSL/TLS**: Always use HTTPS in production
7. **Container Security**: Run containers as non-root user

## Support

For deployment issues:

1. Check the logs first
2. Review this documentation
3. Check Docker and system resources
4. Contact system administrator

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)
