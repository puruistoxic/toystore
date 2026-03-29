# Server Deployment Guide - toystore.purushottam.dev

## GitHub Repository
- **Repository**: https://github.com/puruistoxic/toystore.git
- **SSH URL**: git@github.com:puruistoxic/toystore.git

---

## Part 1: Push Code to GitHub (From Your Local Machine)

### First Time Setup

```bash
# Navigate to your project
cd D:\Projects\khandelwalstore

# Initialize git (if not already done)
git init

# Add remote origin
git remote add origin https://github.com/puruistoxic/toystore.git

# Check current branch
git branch

# Create main branch if needed
git branch -M main

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Docker deployment for toystore.purushottam.dev"

# Push to GitHub
git push -u origin main
```

### For Subsequent Updates

```bash
cd D:\Projects\khandelwalstore
git add .
git commit -m "Your commit message here"
git push origin main
```

---

## Part 2: Server Setup and Deployment

### Step 1: SSH into Your Ubuntu Server

```bash
ssh your-username@your-server-ip
```

### Step 2: Install Docker and Docker Compose

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (replace 'your-username' with actual username)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installations
docker --version
docker compose version

# Log out and back in for group changes to take effect
exit
# SSH back in
ssh your-username@your-server-ip
```

### Step 3: Setup SSH Key for GitHub (On Server)

```bash
# Generate SSH key (press Enter for all prompts)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add SSH key to agent
ssh-add ~/.ssh/id_ed25519

# Display your public key
cat ~/.ssh/id_ed25519.pub
```

**Copy the output and add it to GitHub:**

1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Title: "Ubuntu Production Server"
4. Paste the key from the output above
5. Click "Add SSH key"

**Test SSH connection:**

```bash
ssh -T git@github.com
# Should see: "Hi puruistoxic! You've successfully authenticated..."
```

### Step 4: Clone Repository on Server

```bash
# Create project directory
sudo mkdir -p /opt/khandelwalstore
sudo chown -R $USER:$USER /opt/khandelwalstore

# Navigate to directory
cd /opt

# Clone repository using SSH (make sure SSH key is added to GitHub first)
git clone git@github.com:puruistoxic/toystore.git khandelwalstore

# Navigate into project
cd khandelwalstore

# Verify files
ls -la
```

### Step 5: Configure Environment Variables

**CRITICAL: Never commit real secrets.** Configuration lives in `.env` (gitignored), not in `docker-compose.yml`.

```bash
cd /opt/khandelwalstore   # or your clone path

# Create env from the template
cp .env.example .env
nano .env
```

**Set at minimum:**

- `JWT_SECRET` — generate with: `openssl rand -base64 32`
- `ADMIN_DEFAULT_PASSWORD` — strong password for first admin login
- `MYSQL_*` — host (LAN IP of the DB server is common), database, user, and **`MYSQL_PASSWORD`** (required if MySQL uses auth). Put this file beside `docker-compose.yml`. If the password contains `#` or `$`, wrap it in single quotes in `.env`.
- MySQL must allow the Docker bridge as a client (logs may show `user@172.x.x.x`). Grant for that host or `'%'` from your LAN, e.g. `CREATE USER ...`, `GRANT ... ON toystoredb.* TO 'dbuser'@'%';`
- `SMTP_*` — mail provider credentials (e.g. ZeptoMail)
- `PUBLIC_DOMAIN` and `NGINX_PROXY_REDIRECTS` — match your public hostname(s) for the reverse proxy labels
- `REACT_APP_TINYMCE_API_KEY` — optional; required for admin rich text if you use TinyMCE

Rebuild the **web** image after changing any `REACT_APP_*` variable:

```bash
docker compose build --no-cache toystore-web && docker compose up -d
```

### Step 6: Create Docker Network

```bash
# Create nginx_proxy network (for Nginx Proxy Manager)
docker network create nginx_proxy

# Verify network created
docker network ls | grep nginx_proxy
```

### Step 7: Deploy Application

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy (this will build and start containers)
./deploy.sh deploy
```

**This will:**
- Build Docker images for frontend and backend
- Start containers
- Run health checks
- Show deployment status

### Step 8: Initialize Database

```bash
# Initialize database tables
docker exec -it toystore-api node scripts/init-db.js

# Seed master data (countries, states, etc.)
docker exec -it toystore-api node scripts/seed-masters.js

# Optional: Seed sample products (if available)
docker exec -it toystore-api node scripts/seed-products.js || echo "No product seeder available"
```

### Step 9: Verify Deployment

```bash
# Check containers are running
docker ps | grep toystore

# Should see:
# toystore-web    (nginx)
# toystore-api    (node)

# Check logs
docker logs toystore-web
docker logs toystore-api

# Test health endpoints
curl http://localhost/health
# Should return: healthy

# Check container status
./deploy.sh status
```

---

## Part 3: Configure Nginx Proxy Manager

### Access Nginx Proxy Manager

1. Open your Nginx Proxy Manager web interface
2. Login with admin credentials

### Add Proxy Host

**Proxy Hosts → Add Proxy Host**

**Details Tab:**
- Domain Names: `toystore.purushottam.dev`
- Scheme: `http`
- Forward Hostname/IP: `toystore-web`
- Forward Port: `80`
- Cache Assets: ✅ (enabled)
- Block Common Exploits: ✅ (enabled)
- Websockets Support: ✅ (enabled)

**SSL Tab:**
- SSL Certificate: "Request a new SSL Certificate"
- Force SSL: ✅ (enabled)
- HTTP/2 Support: ✅ (enabled)
- HSTS Enabled: ✅ (enabled)
- Email Address: your-email@example.com
- I Agree to the Let's Encrypt Terms: ✅

**Advanced Tab (Optional):**
```nginx
# Increase upload size if needed
client_max_body_size 100M;

# Additional security headers (if not already in app)
# add_header X-Frame-Options "SAMEORIGIN" always;
# add_header X-Content-Type-Options "nosniff" always;
```

Click **Save**

### Add www Redirect (Optional)

Create another proxy host:

**Details Tab:**
- Domain Names: `www.toystore.purushottam.dev`
- Scheme: `http`
- Forward Hostname/IP: `toystore-web`
- Forward Port: `80`

**SSL Tab:**
- Same SSL certificate settings

**Advanced Tab:**
```nginx
# Redirect www to non-www
return 301 https://toystore.purushottam.dev$request_uri;
```

---

## Part 4: Verify Everything Works

### Test Website

```bash
# From server
curl https://toystore.purushottam.dev
curl https://toystore.purushottam.dev/health

# Check SSL
curl -I https://toystore.purushottam.dev
```

**From your browser:**
1. Visit: https://toystore.purushottam.dev
2. Verify SSL certificate is valid (🔒 in address bar)
3. Test homepage loads correctly
4. Visit: https://toystore.purushottam.dev/admin
5. Login with your admin credentials
6. Test product pages and functionality

### Check Application Logs

```bash
# View real-time logs
docker logs -f toystore-api

# View web logs
docker logs -f toystore-web

# View last 100 lines
docker logs --tail 100 toystore-api
```

### Monitor Resources

```bash
# Check resource usage
docker stats toystore-web toystore-api

# Check disk usage
df -h
docker system df
```

---

## Part 5: Regular Updates and Maintenance

### Deploy Updates

When you push changes to GitHub:

```bash
# SSH into server
ssh your-username@your-server-ip

# Navigate to project
cd /opt/khandelwalstore

# Pull latest changes
git pull origin main

# Deploy updates
./deploy.sh deploy

# Check status
./deploy.sh status
```

### Manual Update Process

```bash
cd /opt/khandelwalstore
git pull origin main
docker-compose down
docker-compose up -d --build
docker-compose ps
```

### View Logs

```bash
cd /opt/khandelwalstore
./deploy.sh logs
```

### Rollback (if something breaks)

```bash
cd /opt/khandelwalstore
./deploy.sh rollback
```

---

## Part 6: Database Backup

### Manual Backup

```bash
# Create backup directory
sudo mkdir -p /opt/backups/database

# Backup database
docker exec toystore-api sh -c 'mysqldump -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' > /opt/backups/database/toystore_$(date +%Y%m%d_%H%M%S).sql
```

### Automated Backup (Cron Job)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * docker exec toystore-api sh -c 'mysqldump -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE' > /opt/backups/database/toystore_$(date +\%Y\%m\%d).sql
```

### Restore from Backup

```bash
# Restore database
docker exec -i toystore-api sh -c 'mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE' < /opt/backups/database/toystore_20260122.sql
```

---

## Part 7: Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs toystore-web
docker logs toystore-api

# Check if network exists
docker network ls | grep nginx_proxy

# Recreate network if needed
docker network create nginx_proxy

# Restart containers
docker-compose restart
```

### 502 Bad Gateway

```bash
# Check containers running
docker ps | grep toystore

# Check if containers can communicate
docker exec toystore-web ping toystore-api

# Check nginx proxy configuration
# Ensure Forward Hostname is: toystore-web (not localhost or IP)

# Restart containers
docker-compose restart
```

### Database Connection Failed

```bash
# Test database connectivity from server
ping 192.168.1.210

# Test from API container
docker exec -it toystore-api sh
ping 192.168.1.210
# Try to connect to MySQL
# mysql -h 192.168.1.210 -u dbuser -p
exit

# Check MySQL-related variables (do not paste passwords into chat logs)
grep '^MYSQL_' .env
```

### Can't Access Website

```bash
# Check DNS
nslookup toystore.purushottam.dev

# Check firewall
sudo ufw status

# If firewall is blocking, allow ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check containers
docker ps | grep toystore

# Check Nginx Proxy Manager logs
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a
docker volume prune

# Remove old images
docker images | grep toystore
docker rmi <image-id>
```

---

## Quick Reference Commands

### Git Commands
```bash
# Pull latest code
git pull origin main

# Check status
git status

# View commit history
git log --oneline -10
```

### Docker Commands
```bash
# View running containers
docker ps

# View all containers
docker ps -a

# View logs
docker logs -f toystore-api

# Restart container
docker restart toystore-api

# Stop all containers
docker-compose down

# Start all containers
docker-compose up -d

# Rebuild and restart
docker-compose up -d --build

# View resource usage
docker stats

# Clean up
docker system prune -a
```

### Application Commands
```bash
# Deploy
./deploy.sh deploy

# Status
./deploy.sh status

# Logs
./deploy.sh logs

# Rollback
./deploy.sh rollback

# Health check
curl http://localhost/health
```

### Database Commands
```bash
# Initialize database
docker exec -it toystore-api node scripts/init-db.js

# Seed data
docker exec -it toystore-api node scripts/seed-masters.js

# Access MySQL from API container
docker exec -it toystore-api sh
```

---

## Security Checklist

- [x] Change JWT_SECRET from default
- [x] Change ADMIN_DEFAULT_PASSWORD from default
- [x] Verify MySQL credentials are correct
- [x] SSL certificate installed and valid
- [x] Firewall configured (ports 80, 443)
- [x] SSH key authentication for GitHub
- [ ] Setup automated backups
- [ ] Setup monitoring/alerting
- [ ] Regular security updates (`sudo apt update && sudo apt upgrade`)

---

## Support Files

- **Quick Start**: `QUICK_DEPLOY.md`
- **Full Docker Guide**: `docs/DOCKER_DEPLOYMENT.md`
- **Deployment Checklist**: `docs/DEPLOYMENT_CHECKLIST.md`
- **Changes Summary**: `DEPLOYMENT_SUMMARY.md`

---

## Summary of Complete Workflow

### Initial Setup (One Time)
1. Push code to GitHub from local machine
2. SSH into Ubuntu server
3. Install Docker and Docker Compose
4. Setup SSH key for GitHub
5. Clone repository
6. Copy `.env.example` to `.env` and set secrets
7. Create nginx_proxy network
8. Deploy application
9. Initialize database
10. Configure Nginx Proxy Manager
11. Test website

### Regular Updates
1. Make changes locally
2. Commit and push to GitHub
3. SSH into server
4. Pull changes: `git pull origin main`
5. Deploy: `./deploy.sh deploy`
6. Test website

---

**Your toy store will be live at**: https://toystore.purushottam.dev 🎉
