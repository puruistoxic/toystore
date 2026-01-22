# 🚀 START HERE - Deployment Guide for toystore.purushottam.dev

## Quick Navigation

Choose your scenario:

### 🆕 First Time Deployment
**You haven't deployed yet** → Follow: **[INITIAL_DEPLOYMENT.md](INITIAL_DEPLOYMENT.md)**

This covers:
1. ✅ Pushing code to GitHub
2. ✅ Setting up Ubuntu server
3. ✅ Installing Docker
4. ✅ Cloning repository
5. ✅ Deploying application
6. ✅ Configuring SSL
7. ✅ Complete verification

**Time required**: ~30 minutes

---

### ⚡ Quick 5-Minute Deploy
**Server is ready, just want to deploy** → Follow: **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)**

Quick commands to get running fast.

---

### 🔄 Regular Updates
**Already deployed, making updates** → Follow these steps:

**On Windows (Local):**
```bash
cd D:\Projects\khandelwalstore
git add .
git commit -m "Your update description"
git push origin main
```

**On Ubuntu Server:**
```bash
cd /opt/khandelwalstore
git pull origin main
./deploy.sh deploy
```

---

### 📖 Detailed Documentation

| Document | Purpose |
|----------|---------|
| **[INITIAL_DEPLOYMENT.md](INITIAL_DEPLOYMENT.md)** | Complete first-time setup (Start here!) |
| **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** | Fast deployment for experienced users |
| **[SERVER_DEPLOYMENT_GUIDE.md](SERVER_DEPLOYMENT_GUIDE.md)** | Complete server setup and deployment guide |
| **[SERVER_COMMANDS.sh](SERVER_COMMANDS.sh)** | All commands in one place |
| **[docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)** | Detailed Docker documentation |
| **[docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** | Step-by-step checklist |
| **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** | Summary of all changes made |

---

## 📋 At a Glance

### Repository Information
- **GitHub**: https://github.com/puruistoxic/toystore.git
- **SSH**: `git@github.com:puruistoxic/toystore.git`
- **Website**: https://toystore.purushottam.dev

### Project Structure
```
khandelwalstore/
├── Dockerfile                    # Frontend Docker build
├── docker-compose.yml            # Main deployment configuration
├── nginx.conf                    # Nginx web server config
├── deploy.sh                     # Automated deployment script
├── server/                       # Backend API
│   ├── Dockerfile               # Backend Docker build
│   └── ...
├── src/                         # React frontend source
├── public/                      # Static assets
└── docs/                        # Documentation
```

### Key Services
- **toystore-web**: React frontend (Nginx) - Port 80
- **toystore-api**: Node.js backend API - Port 3001
- **MySQL Database**: External at 192.168.1.210

---

## ⚠️ Important Before Deployment

### Must Change in `docker-compose.yml`:

1. **Line 13** - JWT_SECRET
   ```bash
   # Generate a strong secret:
   openssl rand -base64 32
   ```

2. **Line 14** - ADMIN_DEFAULT_PASSWORD
   ```yaml
   - ADMIN_DEFAULT_PASSWORD=YourSecurePassword123!
   ```

3. **Lines 19-23** - Verify MySQL credentials

---

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────┐
│  Internet Users                     │
└──────────────┬──────────────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────────────┐
│  Nginx Proxy Manager                 │
│  - SSL Termination (Let's Encrypt)   │
│  - Domain: toystore.purushottam.dev  │
└──────────────┬───────────────────────┘
               │ nginx_proxy network
               ▼
┌──────────────────────────────────────┐
│  toystore-web (Docker Container)     │
│  - Nginx serving React app           │
│  - Port 80                            │
│  - Health endpoint: /health           │
└──────────────┬───────────────────────┘
               │ API requests (/api/*)
               ▼
┌──────────────────────────────────────┐
│  toystore-api (Docker Container)     │
│  - Node.js/Express API                │
│  - Port 3001                          │
│  - Health endpoint: /api/health       │
└──────────────┬───────────────────────┘
               │ Database queries
               ▼
┌──────────────────────────────────────┐
│  MySQL Database                       │
│  - Host: 192.168.1.210               │
│  - Database: toystoredb              │
└──────────────────────────────────────┘
```

---

## 🛠️ Quick Commands Reference

### On Server

```bash
# Deploy/Update
cd /opt/khandelwalstore && git pull origin main && ./deploy.sh deploy

# Check Status
docker ps | grep toystore

# View Logs
docker logs -f toystore-api
docker logs -f toystore-web

# Restart
docker-compose restart

# Stop
docker-compose down

# Rollback
./deploy.sh rollback
```

### On Local Machine

```bash
# Push Updates
cd D:\Projects\khandelwalstore
git add .
git commit -m "Update message"
git push origin main
```

---

## ✅ Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Docker installed on server
- [ ] SSH key added to GitHub
- [ ] Repository cloned to `/opt/khandelwalstore`
- [ ] JWT_SECRET changed in docker-compose.yml
- [ ] ADMIN_DEFAULT_PASSWORD changed in docker-compose.yml
- [ ] MySQL credentials verified
- [ ] nginx_proxy network created
- [ ] Nginx Proxy Manager configured
- [ ] SSL certificate obtained

---

## 🎉 Success Indicators

After deployment, you should have:

✅ Containers running: `docker ps | grep toystore` shows 2 containers
✅ Health check passes: `curl http://localhost/health` returns "healthy"
✅ Website accessible: https://toystore.purushottam.dev loads
✅ SSL valid: 🔒 icon in browser address bar
✅ Admin panel works: https://toystore.purushottam.dev/admin
✅ No errors in logs: `docker logs toystore-api` shows no critical errors

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Container won't start | Check logs: `docker logs toystore-api` |
| 502 Bad Gateway | Verify containers running: `docker ps` |
| Can't access website | Check Nginx Proxy Manager configuration |
| Database connection failed | Verify MySQL credentials in docker-compose.yml |
| SSL not working | Check Let's Encrypt settings in Nginx Proxy Manager |

**For detailed troubleshooting**, see: [SERVER_DEPLOYMENT_GUIDE.md](SERVER_DEPLOYMENT_GUIDE.md)

---

## 📞 Support

- **Documentation**: Check the files listed above
- **Repository**: https://github.com/puruistoxic/toystore
- **Logs**: `docker logs toystore-api` and `docker logs toystore-web`

---

## 🚀 Next Steps After Deployment

1. **Test thoroughly**
   - Homepage loads correctly
   - Product pages work
   - Admin panel accessible
   - Search functionality works

2. **Add content**
   - Add products through admin panel
   - Update company information
   - Add product images

3. **Setup monitoring**
   - UptimeRobot or similar service
   - Setup backup cron jobs
   - Monitor server resources

4. **Optimize**
   - Check SSL rating (SSL Labs)
   - Test page speed (GTmetrix)
   - Mobile responsiveness check

---

**Ready to deploy?** Start with **[INITIAL_DEPLOYMENT.md](INITIAL_DEPLOYMENT.md)**

**Already deployed?** Use the Quick Commands above for updates.

**Need help?** Check the detailed guides or inspect container logs.

---

*Last Updated: January 22, 2026*
*Domain: toystore.purushottam.dev*
*Repository: github.com/puruistoxic/toystore*
