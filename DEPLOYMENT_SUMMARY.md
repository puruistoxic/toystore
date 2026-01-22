# Docker Deployment Configuration Summary

## Overview

The Khandelwal Toy Store has been configured for Docker deployment to **toystore.purushottam.dev** on an Ubuntu server.

## Changes Made

### 1. Docker Configuration Files Updated

#### `docker-compose.yml`
- **Service Names**: Changed from `wainso-*` to `toystore-*`
  - `wainso-api` → `toystore-api`
  - `wainso-web` → `toystore-web`
- **Domain**: Updated to `toystore.purushottam.dev`
- **Container Names**: Updated to match service names
- **Labels**: Updated nginx proxy labels for correct routing
- **Redirects**: Configured www → non-www redirect

#### `nginx.conf`
- **Backend Proxy**: Updated API proxy from `wainso-api` to `toystore-api`
- All other nginx settings remain optimized for production

#### `deploy.sh`
- **Project Name**: Changed to `toystore-web`
- **Backup Directory**: Updated to `/opt/backups/toystore`
- **Log File**: Updated to `/var/log/toystore-deploy.log`
- All deployment logic remains the same

#### `.dockerignore` (NEW)
- Created to optimize Docker build performance
- Excludes unnecessary files from build context
- Reduces build time and image size

### 2. SEO and Metadata Files Updated

#### `public/manifest.json`
- **Short Name**: Changed from "WAINSO" to "Toy Store"
- **Full Name**: Updated to "Khandelwal Toy Store - Premium Toys for Kids"

#### `public/robots.txt`
- **Domain**: Updated to `toystore.purushottam.dev`
- **Sitemap URL**: Updated to new domain
- Removed service-specific pages (WAINSO references)

#### `public/sitemap.xml`
- **Domain**: All URLs updated to `toystore.purushottam.dev`
- **Date**: Updated to 2026-01-22
- Removed old WAINSO/CCTV product pages
- Added placeholder for dynamic toy products
- **Note**: Should be regenerated dynamically from database after deployment

### 3. Documentation Created

#### `docs/DOCKER_DEPLOYMENT.md` (NEW)
Comprehensive deployment guide covering:
- Prerequisites and architecture
- Initial setup steps
- Deployment procedures (automated and manual)
- Database initialization
- Post-deployment verification
- Troubleshooting
- Backup and restore procedures
- Security recommendations
- Monitoring and maintenance

#### `docs/DEPLOYMENT_CHECKLIST.md` (NEW)
Step-by-step checklist for:
- Pre-deployment preparation
- First-time setup
- Deployment execution
- Post-deployment verification
- Security checks
- Regular maintenance tasks

## Docker Architecture

```
┌─────────────────────────────────────────────┐
│         Nginx Proxy Manager                 │
│         (SSL Termination)                   │
│    toystore.purushottam.dev → HTTPS         │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │  nginx_proxy      │  (Docker Network)
        │     Network       │
        └─────────┬─────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
   ┌────▼─────┐        ┌─────▼──────┐
   │ toystore │        │ toystore   │
   │   -web   │──────▶ │   -api     │
   │ (nginx)  │        │ (Node.js)  │
   │ Port 80  │        │ Port 3001  │
   └──────────┘        └─────┬──────┘
                             │
                      ┌──────▼──────┐
                      │   MySQL     │
                      │ 192.168.1.  │
                      │    210      │
                      └─────────────┘
```

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

```bash
cd /opt/khandelwalstore
git pull origin main
./deploy.sh deploy
```

### Method 2: Manual Deployment

```bash
cd /opt/khandelwalstore
git pull origin main
docker-compose down
docker-compose up -d --build
docker-compose ps
```

## Important Notes

### Environment Variables

The following environment variables are set in `docker-compose.yml`:

**Critical - MUST CHANGE IN PRODUCTION:**
- `JWT_SECRET` - Generate a strong 32+ character random string
- `ADMIN_DEFAULT_PASSWORD` - Change from default

**Verify Correctness:**
- `MYSQL_HOST=192.168.1.210`
- `MYSQL_DATABASE=toystoredb`
- `MYSQL_USER=dbuser`
- `MYSQL_PASSWORD` - Ensure this matches your database

**Email Configuration:**
- SMTP credentials are configured for Zeptomail
- Verify these are still valid

### Network Configuration

The containers use the `nginx_proxy` network. This network must exist before deployment:

```bash
docker network create nginx_proxy
```

### First-Time Database Setup

After first deployment, initialize the database:

```bash
docker exec -it toystore-api node scripts/init-db.js
docker exec -it toystore-api node scripts/seed-masters.js
```

## Files That Still Need Attention

The following files may still contain WAINSO references but don't affect Docker deployment:

- Source code files (`.tsx`, `.ts`) - Frontend components
- Documentation files in `docs/`
- Sample data in `src/data/`

These should be updated for branding consistency but won't prevent the app from running.

## Quick Reference Commands

```bash
# Check container status
docker ps | grep toystore

# View logs
docker logs -f toystore-web
docker logs -f toystore-api

# Restart containers
docker-compose restart

# Stop containers
docker-compose down

# View resource usage
docker stats toystore-web toystore-api

# Access container shell
docker exec -it toystore-api sh
docker exec -it toystore-web sh

# Check health
curl http://localhost/health
docker-compose ps
```

## Security Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Update `ADMIN_DEFAULT_PASSWORD`
- [ ] Verify MySQL is not publicly accessible
- [ ] Configure SSL certificate in Nginx Proxy Manager
- [ ] Enable firewall (ports 80, 443 only)
- [ ] Set up automated backups
- [ ] Configure monitoring/alerting
- [ ] Test SSL configuration (SSL Labs)

## Support and Troubleshooting

Refer to:
- **Full Guide**: `docs/DOCKER_DEPLOYMENT.md`
- **Checklist**: `docs/DEPLOYMENT_CHECKLIST.md`
- **Deployment Script**: `./deploy.sh help`

## Next Steps

1. **Push to Git**: Commit and push these changes to your repository
2. **Server Setup**: Ensure Ubuntu server has Docker, Docker Compose, and nginx_proxy network
3. **Clone Repository**: Clone on server at `/opt/khandelwalstore`
4. **Configure Secrets**: Update JWT_SECRET and passwords in docker-compose.yml
5. **Deploy**: Run `./deploy.sh deploy`
6. **Configure Proxy**: Add toystore.purushottam.dev in Nginx Proxy Manager
7. **Test**: Visit https://toystore.purushottam.dev

## Files Modified

- `docker-compose.yml` - Service names and domain
- `nginx.conf` - Backend service name
- `deploy.sh` - Project names and paths
- `public/manifest.json` - App metadata
- `public/robots.txt` - SEO configuration
- `public/sitemap.xml` - Site structure

## Files Created

- `.dockerignore` - Build optimization
- `docs/DOCKER_DEPLOYMENT.md` - Deployment guide
- `docs/DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- `DEPLOYMENT_SUMMARY.md` - This file

---

**Deployment Target**: toystore.purushottam.dev  
**Configuration Date**: January 22, 2026  
**Status**: Ready for deployment ✅
