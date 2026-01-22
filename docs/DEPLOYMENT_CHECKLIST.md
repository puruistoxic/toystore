# Deployment Checklist for toystore.purushottam.dev

Use this checklist when deploying to the Ubuntu server.

## Pre-Deployment

- [ ] Domain `toystore.purushottam.dev` DNS configured and pointing to server
- [ ] Ubuntu server accessible via SSH
- [ ] Docker and Docker Compose installed on server
- [ ] Nginx Proxy Manager or reverse proxy configured
- [ ] MySQL database running and accessible at 192.168.1.210
- [ ] Database `toystoredb` created
- [ ] Database user `dbuser` created with proper permissions

## First-Time Setup

### 1. Server Preparation
- [ ] Create project directory: `/opt/khandelwalstore`
- [ ] Clone repository to server
- [ ] Create nginx_proxy network: `docker network create nginx_proxy`
- [ ] Set proper file permissions

### 2. Configuration
- [ ] Update JWT_SECRET in docker-compose.yml (minimum 32 characters)
- [ ] Update ADMIN_DEFAULT_PASSWORD if needed
- [ ] Verify MySQL credentials in docker-compose.yml
- [ ] Verify SMTP credentials for email functionality

### 3. Database Setup
- [ ] Run database initialization: `docker exec -it toystore-api node scripts/init-db.js`
- [ ] Seed master data: `docker exec -it toystore-api node scripts/seed-masters.js`
- [ ] Verify database tables created

### 4. Proxy Configuration
- [ ] Add proxy host in Nginx Proxy Manager for toystore.purushottam.dev
- [ ] Forward to `toystore-web:80`
- [ ] Enable SSL with Let's Encrypt
- [ ] Configure www redirect: `www.toystore.purushottam.dev` → `toystore.purushottam.dev`
- [ ] Test SSL certificate

## Deployment Steps

### Quick Deployment (Recommended)
- [ ] Navigate to project directory: `cd /opt/khandelwalstore`
- [ ] Pull latest changes: `git pull origin main`
- [ ] Run deployment script: `./deploy.sh deploy`
- [ ] Wait for deployment to complete
- [ ] Check deployment status: `./deploy.sh status`

### Manual Deployment
- [ ] Navigate to project directory: `cd /opt/khandelwalstore`
- [ ] Pull latest changes: `git pull origin main`
- [ ] Stop containers: `docker-compose down`
- [ ] Build and start: `docker-compose up -d --build`
- [ ] Check status: `docker-compose ps`
- [ ] View logs: `docker-compose logs -f`

## Post-Deployment Verification

### Container Health
- [ ] Check containers running: `docker ps | grep toystore`
- [ ] Verify toystore-web is running
- [ ] Verify toystore-api is running
- [ ] Check health status: `docker-compose ps` (should show "healthy")

### Logs Check
- [ ] Check web logs: `docker logs toystore-web` (no errors)
- [ ] Check API logs: `docker logs toystore-api` (no errors)
- [ ] Verify database connection successful in logs

### Functionality Tests
- [ ] Visit https://toystore.purushottam.dev (homepage loads)
- [ ] Check https redirect (http → https)
- [ ] Check www redirect (www → non-www)
- [ ] Test product pages
- [ ] Test search functionality
- [ ] Test admin login: https://toystore.purushottam.dev/admin
- [ ] Verify API endpoints working (check Network tab in browser)

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Images loading properly
- [ ] Videos loading properly
- [ ] Mobile responsiveness working
- [ ] SSL certificate valid (A+ rating on SSL Labs)

## Monitoring Setup

- [ ] Set up external monitoring (Uptime Robot, Pingdom, etc.)
- [ ] Configure health check alerts
- [ ] Set up log rotation if needed
- [ ] Configure backup schedule

## Security Checklist

- [ ] JWT_SECRET changed from default
- [ ] Admin password changed from default
- [ ] Firewall configured (ports 80, 443 open)
- [ ] Database not publicly accessible
- [ ] SSL certificate valid and auto-renewing
- [ ] Security headers configured (check nginx.conf)
- [ ] Rate limiting enabled (check nginx.conf)

## Backup Verification

- [ ] Backup directory exists: `/opt/backups/toystore`
- [ ] Backup script working: `./deploy.sh` creates backups
- [ ] Database backup strategy in place
- [ ] Restore procedure tested

## Common Issues & Solutions

### Issue: Containers won't start
- [ ] Check Docker daemon: `sudo systemctl status docker`
- [ ] Check logs: `docker-compose logs`
- [ ] Verify network exists: `docker network ls | grep nginx_proxy`

### Issue: 502 Bad Gateway
- [ ] Check containers running: `docker ps`
- [ ] Check API logs: `docker logs toystore-api`
- [ ] Verify proxy configuration
- [ ] Check network connectivity: `docker exec toystore-web ping toystore-api`

### Issue: Database connection failed
- [ ] Verify MySQL running: Test from server: `ping 192.168.1.210`
- [ ] Check credentials in docker-compose.yml
- [ ] Verify database user permissions
- [ ] Test connection from container: `docker exec -it toystore-api sh`

### Issue: SSL certificate issues
- [ ] Check Nginx Proxy Manager SSL settings
- [ ] Verify domain DNS is correct
- [ ] Check Let's Encrypt logs
- [ ] Ensure ports 80 and 443 are accessible

## Rollback Procedure

If deployment fails:
- [ ] Run rollback script: `./deploy.sh rollback`
- [ ] Or manually: `docker-compose down && docker load < backup.tar`
- [ ] Verify old version working
- [ ] Investigate deployment failure
- [ ] Fix issues before next deployment

## Regular Maintenance

### Weekly
- [ ] Check container health: `docker ps`
- [ ] Review logs for errors
- [ ] Check disk space: `df -h`
- [ ] Verify backups created

### Monthly
- [ ] Update base images: `docker pull node:18-alpine nginx:alpine`
- [ ] Rebuild containers: `docker-compose up -d --build`
- [ ] Clean up old images: `docker image prune -a`
- [ ] Test restore from backup
- [ ] Review and rotate logs

### Quarterly
- [ ] Update Ubuntu packages: `sudo apt update && sudo apt upgrade`
- [ ] Update Docker: `sudo apt install docker-ce docker-ce-cli`
- [ ] Review security settings
- [ ] Update SSL certificates if needed
- [ ] Performance optimization review

## Emergency Contacts

- Server Provider Support: _______________
- Domain Registrar Support: _______________
- Database Administrator: _______________
- Team Lead: _______________

## Notes

Date: _______________
Deployed By: _______________
Version/Commit: _______________
Issues Encountered: _______________
Resolution: _______________

---

**Last Updated:** January 2026
**Deployment Domain:** toystore.purushottam.dev
**Server Location:** Ubuntu Server
**Deployment Method:** Docker + Docker Compose + Nginx Proxy
