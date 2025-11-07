# Docker Deployment Steps for Bare Metal Server

This guide provides step-by-step instructions to deploy the WAINSO web application on a bare metal server using Docker.

## Prerequisites

- **Server**: Ubuntu 20.04 LTS or later (or any Linux distribution)
- **Access**: SSH access with sudo/root privileges
- **Domain**: (Optional) Domain name pointing to your server IP
- **Resources**: Minimum 2GB RAM, 20GB storage

---

## Step 1: Server Preparation

### 1.1 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Docker

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

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Verify installation
docker --version
docker compose version
```

**Note**: Log out and log back in for group changes to take effect, or run `newgrp docker`

### 1.3 Configure Firewall

```bash
# Install UFW if not installed
sudo apt install -y ufw

# Enable firewall
sudo ufw enable

# Allow SSH (important - do this first!)
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check firewall status
sudo ufw status
```

---

## Step 2: Prepare Application Files

### 2.1 Transfer Files to Server

**Option A: Using Git (Recommended)**

```bash
# Create application directory
sudo mkdir -p /opt/wainso
sudo chown $USER:$USER /opt/wainso
cd /opt/wainso

# Clone your repository
git clone <your-repository-url> .

# Or if you have the files locally, use SCP:
# scp -r /path/to/wainsoweb user@server:/opt/wainso
```

**Option B: Using SCP from Local Machine**

```bash
# From your local machine
scp -r D:\Projects\wainsoweb user@your-server-ip:/opt/wainso
```

### 2.2 Verify Required Files

Ensure these files exist in `/opt/wainso`:
- `Dockerfile`
- `docker-compose.yml`
- `nginx.conf`
- `package.json`
- `src/` directory
- `public/` directory

```bash
cd /opt/wainso
ls -la
```

---

## Step 3: Build and Deploy

### 3.1 Create Logs Directory

```bash
mkdir -p /opt/wainso/logs
```

### 3.2 Build Docker Image

```bash
cd /opt/wainso

# Build the image
docker build -t wainso-web:latest .
```

This will:
- Install all dependencies
- Build the React application
- Create a production-ready Nginx image

**Expected time**: 5-10 minutes depending on server speed

### 3.3 Deploy with Docker Compose

```bash
# Start the application
docker compose up -d

# Or using docker-compose (older versions)
docker-compose up -d
```

The `-d` flag runs containers in detached mode (background).

### 3.4 Verify Deployment

```bash
# Check if container is running
docker ps

# Check container logs
docker logs wainso-web

# Test health endpoint
curl http://localhost/health

# Test main application
curl http://localhost
```

---

## Step 4: Access Your Application

### 4.1 Local Access

Your application should now be accessible at:
- **http://your-server-ip**
- **http://localhost** (from the server itself)

### 4.2 Configure Domain (Optional)

If you have a domain name:

1. **Point DNS to your server**:
   - Add an A record: `@` → `your-server-ip`
   - Add a CNAME record: `www` → `your-domain.com`

2. **Update nginx.conf** (if needed):
   ```bash
   sudo nano /opt/wainso/nginx.conf
   # Change `server_name localhost;` to `server_name your-domain.com www.your-domain.com;`
   ```

3. **Rebuild and restart**:
   ```bash
   docker compose down
   docker compose up -d --build
   ```

---

## Step 5: SSL/HTTPS Setup (Optional but Recommended)

### Option A: Using Traefik with Let's Encrypt

```bash
# Create SSL directory
mkdir -p /opt/wainso/letsencrypt

# Update docker-compose.yml with your domain and email
nano /opt/wainso/docker-compose.yml
# Update: DOMAIN=wainso.com and EMAIL=admin@wainso.com

# Start with SSL profile
docker compose --profile ssl up -d
```

### Option B: Using Certbot (Standalone Nginx)

```bash
# Install Certbot
sudo apt install -y certbot

# Stop the Docker container temporarily
docker compose down

# Obtain certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Certificate will be saved to: /etc/letsencrypt/live/your-domain.com/
```

Then configure nginx to use SSL certificates (requires custom nginx setup).

---

## Step 6: Management Commands

### View Logs

```bash
# Application logs
docker logs wainso-web

# Follow logs in real-time
docker logs -f wainso-web

# Nginx access logs
tail -f /opt/wainso/logs/access.log

# Nginx error logs
tail -f /opt/wainso/logs/error.log
```

### Restart Application

```bash
# Restart container
docker compose restart

# Or stop and start
docker compose down
docker compose up -d
```

### Update Application

```bash
cd /opt/wainso

# Pull latest changes (if using Git)
git pull origin main

# Rebuild and restart
docker compose down
docker compose up -d --build
```

### Stop Application

```bash
docker compose down
```

### Remove Everything

```bash
# Stop and remove containers
docker compose down

# Remove image
docker rmi wainso-web:latest

# Remove volumes (if any)
docker volume prune
```

---

## Step 7: Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs wainso-web

# Check if port 80 is in use
sudo netstat -tulpn | grep :80
# or
sudo lsof -i :80

# Kill process using port 80 (if needed)
sudo fuser -k 80/tcp
```

### Application Not Loading

```bash
# Check container status
docker ps -a

# Check if container is healthy
docker inspect wainso-web | grep -A 10 Health

# Test from inside container
docker exec wainso-web wget -O- http://localhost/health

# Check Nginx configuration
docker exec wainso-web nginx -t
```

### Build Errors

```bash
# Clean Docker cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t wainso-web:latest .
```

### Permission Issues

```bash
# Fix logs directory permissions
sudo chown -R $USER:$USER /opt/wainso/logs
```

---

## Step 8: Production Optimizations

### Enable Auto-restart

The `docker-compose.yml` already includes `restart: unless-stopped`, which means containers will automatically restart on server reboot.

### Set Up Monitoring

```bash
# Monitor resource usage
docker stats

# Set up log rotation
sudo nano /etc/logrotate.d/docker-containers
```

Add:
```
/opt/wainso/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

### Backup Strategy

```bash
# Create backup script
nano /opt/backup-wainso.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/wainso"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup docker-compose and config files
tar -czf $BACKUP_DIR/wainso-config-$DATE.tar.gz \
    /opt/wainso/docker-compose.yml \
    /opt/wainso/nginx.conf \
    /opt/wainso/Dockerfile

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Make executable:
```bash
chmod +x /opt/backup-wainso.sh
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /opt/backup-wainso.sh
```

---

## Quick Reference Commands

```bash
# Start application
docker compose up -d

# Stop application
docker compose down

# View logs
docker logs -f wainso-web

# Restart application
docker compose restart

# Rebuild and restart
docker compose up -d --build

# Check status
docker ps
docker compose ps

# Health check
curl http://localhost/health

# Access container shell
docker exec -it wainso-web sh
```

---

## Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH key authentication enabled
- [ ] Docker running as non-root user
- [ ] SSL/HTTPS configured (for production)
- [ ] Regular system updates scheduled
- [ ] Backup strategy in place
- [ ] Log rotation configured
- [ ] Strong passwords for all accounts

---

## Support

If you encounter issues:

1. Check container logs: `docker logs wainso-web`
2. Check system resources: `docker stats`
3. Verify network connectivity: `curl http://localhost/health`
4. Review firewall rules: `sudo ufw status`
5. Check Docker service: `sudo systemctl status docker`

---

**Your application should now be running on http://your-server-ip!**

