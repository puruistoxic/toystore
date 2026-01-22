# Docker Deployment Guide for toystore.purushottam.dev

This guide covers deploying the Khandelwal Toy Store application to an Ubuntu server using Docker.

## Prerequisites

### On Ubuntu Server
1. Docker and Docker Compose installed
2. Nginx Proxy Manager or similar reverse proxy configured
3. Domain `toystore.purushottam.dev` pointing to your server
4. MySQL database accessible (currently at 192.168.1.210)

### Required Credentials
- MySQL database credentials
- SMTP credentials for email
- JWT secret key (generate a strong random string)

## Architecture

The application consists of three main components:

1. **toystore-web**: React frontend served by Nginx (port 80 internal)
2. **toystore-api**: Node.js/Express backend API (port 3001 internal)
3. **MySQL Database**: External database at 192.168.1.210

Both containers connect to the `nginx_proxy` network for SSL termination and routing.

## Initial Setup on Ubuntu Server

### 1. Clone the Repository

```bash
cd /opt
sudo git clone <your-repo-url> khandelwalstore
cd khandelwalstore
sudo chown -R $USER:$USER .
```

### 2. Create Nginx Proxy Network (if not exists)

```bash
docker network create nginx_proxy
```

### 3. Update Environment Variables

The `docker-compose.yml` file contains environment variables. For production, you should:

**Option A: Use Environment File (Recommended)**

Create a `.env.production` file:

```env
# Server Configuration
NODE_ENV=production
PORT=3001

# JWT Configuration (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long

# Admin Configuration
ADMIN_DEFAULT_PASSWORD=your-secure-admin-password

# SMTP Configuration
SMTP_HOST=smtp.zeptomail.eu
SMTP_PORT=587
SMTP_USER=emailapikey
SMTP_PASSWORD=your-smtp-password

# MySQL Configuration
MYSQL_HOST=192.168.1.210
MYSQL_DATABASE=toystoredb
MYSQL_USER=dbuser
MYSQL_PASSWORD=your-mysql-password
MYSQL_PORT=3306
```

Then update `docker-compose.yml` to use it:

```yaml
services:
  toystore-api:
    env_file:
      - .env.production
```

**Option B: Update docker-compose.yml directly**

Edit the environment variables in `docker-compose.yml`:
- Change `JWT_SECRET` to a strong random string (minimum 32 characters)
- Update `ADMIN_DEFAULT_PASSWORD` if needed
- Verify MySQL credentials are correct

### 4. Configure Nginx Proxy Manager

In your Nginx Proxy Manager or reverse proxy:

1. Create a new Proxy Host for `toystore.purushottam.dev`
2. Forward to: `toystore-web` (container name) on port `80`
3. Enable SSL with Let's Encrypt
4. Enable "Websockets Support" (if available)
5. Enable "Block Common Exploits"

**Advanced Configuration** (if using custom nginx):

```nginx
server {
    listen 80;
    server_name toystore.purushottam.dev www.toystore.purushottam.dev;
    
    # Redirect to HTTPS
    return 301 https://toystore.purushottam.dev$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.toystore.purushottam.dev;
    
    # SSL configuration here
    
    # Redirect www to non-www
    return 301 https://toystore.purushottam.dev$request_uri;
}

server {
    listen 443 ssl http2;
    server_name toystore.purushottam.dev;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/toystore.purushottam.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/toystore.purushottam.dev/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://toystore-web:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Deployment

### Method 1: Using the Deploy Script (Recommended)

```bash
# Make the script executable
chmod +x deploy.sh

# Deploy the application
./deploy.sh deploy
```

The script will:
- Check Docker installation
- Create backups
- Pull latest code from Git
- Build Docker images
- Stop old containers
- Start new containers
- Run health checks
- Clean up old images

**Other commands:**

```bash
./deploy.sh status    # Check deployment status
./deploy.sh logs      # View application logs
./deploy.sh health    # Run health check
./deploy.sh rollback  # Rollback to previous version
```

### Method 2: Manual Deployment

```bash
# Stop and remove existing containers
docker-compose down

# Build and start containers
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Database Initialization

**First Time Setup Only:**

```bash
# Access the API container
docker exec -it toystore-api sh

# Inside the container, run database initialization
node scripts/init-db.js

# Optionally seed master data
node scripts/seed-masters.js

# Exit container
exit
```

## Post-Deployment Checks

### 1. Check Container Status

```bash
docker ps | grep toystore
```

You should see both `toystore-web` and `toystore-api` running.

### 2. Check Logs

```bash
# Web container logs
docker logs toystore-web

# API container logs
docker logs toystore-api

# Follow logs in real-time
docker logs -f toystore-api
```

### 3. Test Health Endpoints

```bash
# Test web health
curl http://localhost/health

# Test API health (from inside web container or host)
curl http://toystore-api:3001/health
```

### 4. Test the Website

Visit:
- https://toystore.purushottam.dev
- https://toystore.purushottam.dev/admin (login page)

## Updating the Application

### Regular Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Or use the deployment script
./deploy.sh deploy
```

### Database Schema Updates

If there are database schema changes:

```bash
docker exec -it toystore-api sh
node scripts/migrate-schema.js
exit
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs toystore-web
docker logs toystore-api

# Check if network exists
docker network ls | grep nginx_proxy

# Recreate network if needed
docker network create nginx_proxy
```

### Database Connection Issues

```bash
# Test database connectivity from API container
docker exec -it toystore-api sh
ping 192.168.1.210

# Check MySQL credentials in docker-compose.yml
```

### 502 Bad Gateway

- Check if both containers are running: `docker ps`
- Check API container logs: `docker logs toystore-api`
- Verify nginx proxy configuration
- Check if containers are on the same network

### Port Conflicts

```bash
# Check what's using port 80
sudo lsof -i :80

# Check what's using port 3001
sudo lsof -i :3001
```

## Backup and Restore

### Manual Backup

```bash
# Create backup directory
sudo mkdir -p /opt/backups/toystore

# Backup containers
docker commit toystore-web toystore-web:backup-$(date +%Y%m%d)
docker commit toystore-api toystore-api:backup-$(date +%Y%m%d)

# Save images
docker save toystore-web:backup-$(date +%Y%m%d) | gzip > /opt/backups/toystore/web-$(date +%Y%m%d).tar.gz
docker save toystore-api:backup-$(date +%Y%m%d) | gzip > /opt/backups/toystore/api-$(date +%Y%m%d).tar.gz
```

### Restore from Backup

```bash
# Stop current containers
docker-compose down

# Load backup images
docker load < /opt/backups/toystore/web-YYYYMMDD.tar.gz
docker load < /opt/backups/toystore/api-YYYYMMDD.tar.gz

# Tag as latest
docker tag toystore-web:backup-YYYYMMDD toystore-web:latest
docker tag toystore-api:backup-YYYYMMDD toystore-api:latest

# Start containers
docker-compose up -d
```

## Security Recommendations

1. **Change Default Passwords**: Update JWT_SECRET and ADMIN_DEFAULT_PASSWORD
2. **Use Environment Files**: Don't commit sensitive data to Git
3. **Enable Firewall**: 
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
4. **Regular Updates**: Keep Docker and Ubuntu updated
5. **SSL Certificates**: Use Let's Encrypt for free SSL
6. **Database Security**: Ensure MySQL is not publicly accessible
7. **Backup Strategy**: Implement automated backups

## Monitoring

### View Resource Usage

```bash
# Container stats
docker stats toystore-web toystore-api

# Disk usage
docker system df
```

### Health Monitoring

Set up monitoring with:
- Uptime Robot (external monitoring)
- Prometheus + Grafana (advanced monitoring)
- Docker health checks (built-in)

## Maintenance

### Clean Up Old Images

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a
```

### Update Docker Images

```bash
# Pull base images
docker pull node:18-alpine
docker pull nginx:alpine

# Rebuild
docker-compose up -d --build
```

## Support

For issues specific to:
- **Application bugs**: Check application logs
- **Docker issues**: Check Docker logs and Docker documentation
- **Database issues**: Check MySQL logs on 192.168.1.210
- **SSL/Domain issues**: Check Nginx Proxy Manager configuration

## Quick Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Check status
docker-compose ps

# Execute command in container
docker exec -it toystore-api sh

# View resource usage
docker stats
```
