# Quick Deploy Guide - toystore.purushottam.dev

## 🚀 Quick Deployment (5 Minutes)

### Prerequisites (One-Time Setup)

```bash
# 1. On your Ubuntu server, install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 2. Install Docker Compose
sudo apt update
sudo apt install docker-compose-plugin -y

# 3. Create nginx_proxy network
docker network create nginx_proxy

# 4. Clone the repository
cd /opt
sudo git clone <your-repo-url> khandelwalstore
cd khandelwalstore
sudo chown -R $USER:$USER .
```

### First Deployment

```bash
# 1. Navigate to project directory
cd /opt/khandelwalstore

# 2. Update secrets in docker-compose.yml (IMPORTANT!)
nano docker-compose.yml
# Change:
# - JWT_SECRET (line 13) - use a strong random string
# - ADMIN_DEFAULT_PASSWORD (line 14) - change from default

# 3. Make deploy script executable
chmod +x deploy.sh

# 4. Deploy
./deploy.sh deploy

# 5. Initialize database (first time only)
docker exec -it toystore-api node scripts/init-db.js
docker exec -it toystore-api node scripts/seed-masters.js

# 6. Check status
docker ps | grep toystore
```

### Configure Nginx Proxy Manager

In your Nginx Proxy Manager web interface:

1. Add **Proxy Host**:
   - Domain Names: `toystore.purushottam.dev`
   - Scheme: `http`
   - Forward Hostname: `toystore-web`
   - Forward Port: `80`
   - ✅ Block Common Exploits
   - ✅ Websockets Support

2. **SSL Tab**:
   - ✅ SSL Certificate: Request New (Let's Encrypt)
   - ✅ Force SSL
   - ✅ HTTP/2 Support

3. **Advanced** (Optional):
   ```nginx
   # Additional nginx configuration if needed
   client_max_body_size 100M;
   ```

### Verify Deployment

```bash
# Check containers are running
docker ps

# View logs
docker logs toystore-web
docker logs toystore-api

# Test health endpoints
curl http://localhost/health

# Check from outside (after proxy setup)
curl https://toystore.purushottam.dev
```

### Access the Application

- **Website**: https://toystore.purushottam.dev
- **Admin Panel**: https://toystore.purushottam.dev/admin
- **Default Admin**: Check your ADMIN_DEFAULT_PASSWORD in docker-compose.yml

## 🔄 Regular Updates

```bash
cd /opt/khandelwalstore
git pull origin main
./deploy.sh deploy
```

## 🛠️ Useful Commands

```bash
# View logs
./deploy.sh logs

# Check status
./deploy.sh status

# Rollback to previous version
./deploy.sh rollback

# Restart containers
docker-compose restart

# Stop everything
docker-compose down

# Rebuild from scratch
docker-compose down
docker-compose up -d --build
```

## ⚠️ Important Security Notes

**Before going live, MUST change:**

1. `JWT_SECRET` in `docker-compose.yml` (line 13)
   ```bash
   # Generate a strong secret:
   openssl rand -base64 32
   ```

2. `ADMIN_DEFAULT_PASSWORD` in `docker-compose.yml` (line 14)

3. Verify database credentials match your MySQL server

## 📊 Monitoring

```bash
# View resource usage
docker stats toystore-web toystore-api

# Check disk usage
docker system df

# View container details
docker inspect toystore-web
```

## 🐛 Troubleshooting

### Container won't start
```bash
docker logs toystore-web
docker logs toystore-api
```

### 502 Bad Gateway
```bash
# Check if containers are running
docker ps | grep toystore

# Check if on same network
docker network inspect nginx_proxy

# Restart containers
docker-compose restart
```

### Database connection failed
```bash
# Check database connectivity
docker exec -it toystore-api sh
ping 192.168.1.210
exit
```

### Can't access website
1. Check DNS: `nslookup toystore.purushottam.dev`
2. Check firewall: `sudo ufw status`
3. Check Nginx Proxy Manager configuration
4. Check SSL certificate

## 📁 Project Structure

```
khandelwalstore/
├── Dockerfile              # Frontend build
├── docker-compose.yml      # Main deployment config
├── nginx.conf             # Nginx configuration
├── deploy.sh              # Deployment script
├── server/
│   ├── Dockerfile         # Backend build
│   └── ...
├── docs/
│   ├── DOCKER_DEPLOYMENT.md      # Full deployment guide
│   └── DEPLOYMENT_CHECKLIST.md   # Detailed checklist
└── DEPLOYMENT_SUMMARY.md         # Changes summary
```

## 🆘 Need Help?

1. **Full Documentation**: See `docs/DOCKER_DEPLOYMENT.md`
2. **Detailed Checklist**: See `docs/DEPLOYMENT_CHECKLIST.md`
3. **Changes Summary**: See `DEPLOYMENT_SUMMARY.md`

## ✅ Deployment Checklist

- [ ] Docker and Docker Compose installed
- [ ] nginx_proxy network created
- [ ] Repository cloned to /opt/khandelwalstore
- [ ] JWT_SECRET changed in docker-compose.yml
- [ ] ADMIN_DEFAULT_PASSWORD changed
- [ ] Database credentials verified
- [ ] Deployment successful (./deploy.sh deploy)
- [ ] Database initialized
- [ ] Nginx Proxy Manager configured
- [ ] SSL certificate installed
- [ ] Website accessible at https://toystore.purushottam.dev
- [ ] Admin panel accessible

---

**🎉 Your toy store is now live at**: https://toystore.purushottam.dev
