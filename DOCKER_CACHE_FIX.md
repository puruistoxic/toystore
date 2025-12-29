# Docker Cache Fix - Server Commands

## Quick Fix Commands (Run on Server)

### Option 1: Rebuild without cache (Recommended)
```bash
# SSH into your server, then run:
cd /path/to/wainsoweb  # Navigate to your project directory

# Stop containers
docker-compose down

# Rebuild without cache
docker-compose build --no-cache

# Start containers
docker-compose up -d

# Check status
docker-compose ps
```

### Option 2: Complete cache clear (More thorough)
```bash
# Stop containers
docker-compose down

# Remove all build cache
docker builder prune -af

# Remove unused images
docker image prune -af

# Rebuild without cache
docker-compose build --no-cache --pull

# Start containers
docker-compose up -d

# Check logs if needed
docker-compose logs -f
```

### Option 3: Force rebuild specific service
```bash
# Rebuild only the web container (frontend)
docker-compose build --no-cache wainso-web

# Rebuild only the API container (backend)
docker-compose build --no-cache wainso-api

# Restart the rebuilt service
docker-compose up -d --force-recreate wainso-web
```

## After Rebuilding

1. **Hard refresh browser**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Or clear browser cache completely**
3. **Check if changes are visible**

## Verify Changes

```bash
# Check container logs
docker-compose logs wainso-web

# Check if new build is running
docker-compose ps

# Test the application
curl http://localhost/health
```

## If Still Cached

1. **Check nginx cache**: The nginx.conf has been updated to disable HTML caching
2. **Restart nginx inside container**:
   ```bash
   docker-compose exec wainso-web nginx -s reload
   ```

3. **Or restart the container**:
   ```bash
   docker-compose restart wainso-web
   ```








