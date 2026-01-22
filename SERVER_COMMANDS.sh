#!/bin/bash
# Quick Command Reference for toystore.purushottam.dev
# Repository: https://github.com/puruistoxic/toystore.git

# ============================================
# INITIAL SERVER SETUP (One Time Only)
# ============================================

# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install docker-compose-plugin -y

# 2. Setup SSH key for GitHub
ssh-keygen -t ed25519 -C "your-email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub  # Add this to GitHub → Settings → SSH Keys
ssh -T git@github.com      # Test connection

# 3. Clone repository
sudo mkdir -p /opt/khandelwalstore
sudo chown -R $USER:$USER /opt/khandelwalstore
cd /opt
git clone git@github.com:puruistoxic/toystore.git khandelwalstore
cd khandelwalstore

# 4. Create Docker network
docker network create nginx_proxy

# 5. IMPORTANT: Edit docker-compose.yml and change:
#    - JWT_SECRET (line 13) - use: openssl rand -base64 32
#    - ADMIN_DEFAULT_PASSWORD (line 14)
nano docker-compose.yml

# 6. Deploy
chmod +x deploy.sh
./deploy.sh deploy

# 7. Initialize database
docker exec -it toystore-api node scripts/init-db.js
docker exec -it toystore-api node scripts/seed-masters.js

# 8. Configure Nginx Proxy Manager
#    - Add proxy host: toystore.purushottam.dev → toystore-web:80
#    - Enable SSL with Let's Encrypt

# ============================================
# REGULAR DEPLOYMENT (Updates)
# ============================================

# Pull latest code and deploy
cd /opt/khandelwalstore
git pull origin main
./deploy.sh deploy

# Or manual method
cd /opt/khandelwalstore
git pull origin main
docker-compose down
docker-compose up -d --build

# ============================================
# MONITORING & LOGS
# ============================================

# Check container status
docker ps | grep toystore
./deploy.sh status

# View logs
./deploy.sh logs
docker logs -f toystore-api
docker logs -f toystore-web
docker logs --tail 100 toystore-api

# Resource usage
docker stats toystore-web toystore-api

# Disk usage
df -h
docker system df

# ============================================
# TROUBLESHOOTING
# ============================================

# Restart containers
docker-compose restart
docker restart toystore-api
docker restart toystore-web

# Check health
curl http://localhost/health
curl https://toystore.purushottam.dev/health

# Rollback to previous version
./deploy.sh rollback

# View container details
docker inspect toystore-api
docker inspect toystore-web

# Check network connectivity
docker exec toystore-web ping toystore-api
docker network inspect nginx_proxy

# Access container shell
docker exec -it toystore-api sh
docker exec -it toystore-web sh

# ============================================
# DATABASE OPERATIONS
# ============================================

# Initialize database
docker exec -it toystore-api node scripts/init-db.js

# Seed master data
docker exec -it toystore-api node scripts/seed-masters.js

# Backup database
sudo mkdir -p /opt/backups/database
docker exec toystore-api sh -c 'mysqldump -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE' > /opt/backups/database/toystore_$(date +%Y%m%d_%H%M%S).sql

# Restore database
docker exec -i toystore-api sh -c 'mysql -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE' < /opt/backups/database/toystore_20260122.sql

# ============================================
# CLEANUP & MAINTENANCE
# ============================================

# Clean up Docker
docker system prune -a          # Remove all unused images/containers
docker image prune -a           # Remove unused images
docker volume prune             # Remove unused volumes
docker container prune          # Remove stopped containers

# Remove old backups (keep last 7 days)
find /opt/backups/database/ -name "*.sql" -mtime +7 -delete

# Update system packages
sudo apt update
sudo apt upgrade -y

# ============================================
# GIT OPERATIONS
# ============================================

# Pull latest code
cd /opt/khandelwalstore
git pull origin main

# Check current branch
git branch

# View recent commits
git log --oneline -10

# Check for uncommitted changes
git status

# Reset to specific commit (DANGEROUS)
# git reset --hard <commit-hash>

# ============================================
# NGINX PROXY MANAGER
# ============================================

# Proxy Host Configuration:
# Domain: toystore.purushottam.dev
# Forward to: toystore-web:80
# SSL: Let's Encrypt
# Force SSL: Yes
# HTTP/2: Yes

# ============================================
# TESTING
# ============================================

# Test website
curl https://toystore.purushottam.dev
curl -I https://toystore.purushottam.dev  # Check headers

# Test API
curl http://localhost:3001/health         # From inside network
curl https://toystore.purushottam.dev/api/health  # From outside

# Test SSL
openssl s_client -connect toystore.purushottam.dev:443 -servername toystore.purushottam.dev

# Check DNS
nslookup toystore.purushottam.dev
dig toystore.purushottam.dev

# ============================================
# FIREWALL
# ============================================

# Check firewall status
sudo ufw status

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# ============================================
# AUTOMATED BACKUP (Cron Job)
# ============================================

# Edit crontab
crontab -e

# Add daily backup at 2 AM
# 0 2 * * * docker exec toystore-api sh -c 'mysqldump -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE' > /opt/backups/database/toystore_$(date +\%Y\%m\%d).sql

# ============================================
# USEFUL ONE-LINERS
# ============================================

# Complete deployment in one command
cd /opt/khandelwalstore && git pull origin main && ./deploy.sh deploy

# Quick status check
docker ps | grep toystore && curl -s http://localhost/health

# View all logs
docker-compose logs --tail=50

# Restart everything
docker-compose restart && docker ps | grep toystore

# Emergency stop
docker-compose down

# Emergency restart
docker-compose down && docker-compose up -d

# ============================================
# CONTACT & SUPPORT
# ============================================

# Repository: https://github.com/puruistoxic/toystore.git
# Website: https://toystore.purushottam.dev
# Documentation: See SERVER_DEPLOYMENT_GUIDE.md

# For detailed help:
# - SERVER_DEPLOYMENT_GUIDE.md (Complete guide)
# - QUICK_DEPLOY.md (Quick start)
# - docs/DOCKER_DEPLOYMENT.md (Docker details)
# - docs/DEPLOYMENT_CHECKLIST.md (Checklist)
