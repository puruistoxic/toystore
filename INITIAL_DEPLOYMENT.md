# Initial Deployment Checklist - First Time Setup

Follow these steps in order for your first deployment to toystore.purushottam.dev

---

## ✅ Step 1: Push Code to GitHub (Local Machine)

**Location**: Your Windows machine (`D:\Projects\khandelwalstore`)

### 1.1 Open PowerShell/Terminal in Project Directory

```powershell
cd D:\Projects\khandelwalstore
```

### 1.2 Initialize Git and Push

```bash
# Check if git is already initialized
git status

# If not initialized, run:
git init

# Add remote repository
git remote add origin https://github.com/puruistoxic/toystore.git

# Or if remote already exists, update it:
git remote set-url origin https://github.com/puruistoxic/toystore.git

# Create main branch
git branch -M main

# Add all files
git add .

# Commit
git commit -m "Initial commit - Docker deployment for toystore.purushottam.dev"

# Push to GitHub
git push -u origin main
```

**Expected Result**: Code should be visible at https://github.com/puruistoxic/toystore

---

## ✅ Step 2: Prepare Ubuntu Server

**Location**: SSH into your Ubuntu server

### 2.1 SSH into Server

```bash
ssh your-username@your-server-ip
# Enter your password when prompted
```

### 2.2 Install Docker

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (replace with your username)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version

# Log out and back in for group changes
exit
```

**SSH back in**: `ssh your-username@your-server-ip`

### 2.3 Setup GitHub SSH Key

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter for all prompts (use default location and no passphrase)

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to agent
ssh-add ~/.ssh/id_ed25519

# Display public key
cat ~/.ssh/id_ed25519.pub
```

**Copy the entire output** (starts with `ssh-ed25519`)

### 2.4 Add SSH Key to GitHub

1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Title: `Ubuntu Production Server`
4. Paste the key you copied
5. Click **"Add SSH key"**

### 2.5 Test SSH Connection

```bash
ssh -T git@github.com
# Should see: "Hi puruistoxic! You've successfully authenticated..."
```

---

## ✅ Step 3: Clone Repository and Setup

### 3.1 Create Project Directory

```bash
# Create directory
sudo mkdir -p /opt/khandelwalstore
sudo chown -R $USER:$USER /opt/khandelwalstore

# Navigate to /opt
cd /opt
```

### 3.2 Clone Repository

**Important**: Make sure you completed Step 2.3-2.5 (SSH key setup) before this step!

```bash
git clone git@github.com:puruistoxic/toystore.git khandelwalstore
```

**Expected Result**: Should clone without asking for password (uses SSH key authentication)

### 3.3 Navigate to Project

```bash
cd khandelwalstore
ls -la
```

**Expected Result**: Should see all project files (Dockerfile, docker-compose.yml, etc.)

---

## ✅ Step 4: Configure Secrets (CRITICAL!)

### 4.1 Generate Strong JWT Secret

```bash
# Generate a strong secret
openssl rand -base64 32
```

**Copy the output** (example: `abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx`)

### 4.2 Edit docker-compose.yml

```bash
nano docker-compose.yml
```

**Find and update these lines:**

**Line 13** - Change JWT_SECRET:
```yaml
- JWT_SECRET=abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx
```
(Paste your generated secret from step 4.1)

**Line 14** - Change Admin Password:
```yaml
- ADMIN_DEFAULT_PASSWORD=YourSecurePassword123!
```
(Use a strong password you'll remember)

**Lines 19-23** - Verify MySQL credentials are correct:
```yaml
- MYSQL_HOST=192.168.1.210
- MYSQL_DATABASE=toystoredb
- MYSQL_USER=dbuser
- MYSQL_PASSWORD='X9@uP!z1qF#D'
- MYSQL_PORT=3306
```

**Save and exit**: `Ctrl+X`, then `Y`, then `Enter`

---

## ✅ Step 5: Create Docker Network

```bash
# Create nginx_proxy network
docker network create nginx_proxy

# Verify it was created
docker network ls | grep nginx_proxy
```

**Expected Result**: Should see `nginx_proxy` in the list

---

## ✅ Step 6: Deploy Application

### 6.1 Make Deploy Script Executable

```bash
chmod +x deploy.sh
```

### 6.2 Run Deployment

```bash
./deploy.sh deploy
```

**This will take 5-10 minutes** as it:
- Builds Docker images
- Starts containers
- Runs health checks

**Expected Result**: Should see "Deployment completed successfully!"

### 6.3 Verify Containers are Running

```bash
docker ps | grep toystore
```

**Expected Result**: Should see two containers:
- `toystore-web` (nginx)
- `toystore-api` (node)

---

## ✅ Step 7: Initialize Database

### 7.1 Create Database Tables

```bash
docker exec -it toystore-api node scripts/init-db.js
```

**Expected Result**: Should see messages about tables being created

### 7.2 Seed Master Data

```bash
docker exec -it toystore-api node scripts/seed-masters.js
```

**Expected Result**: Should see messages about data being seeded

---

## ✅ Step 8: Configure Nginx Proxy Manager

### 8.1 Access Nginx Proxy Manager

Open your Nginx Proxy Manager web interface (usually at http://your-server-ip:81)

**Default credentials** (if first time):
- Email: `admin@example.com`
- Password: `changeme`

### 8.2 Add Proxy Host

Click **"Proxy Hosts"** → **"Add Proxy Host"**

**Details Tab:**
- Domain Names: `toystore.purushottam.dev`
- Scheme: `http`
- Forward Hostname / IP: `toystore-web`
- Forward Port: `80`
- ✅ Cache Assets
- ✅ Block Common Exploits
- ✅ Websockets Support

**SSL Tab:**
- ✅ SSL Certificate: "Request a new SSL Certificate"
- ✅ Force SSL
- ✅ HTTP/2 Support
- ✅ HSTS Enabled
- Email Address: `your-email@example.com`
- ✅ I Agree to the Let's Encrypt Terms of Service

Click **"Save"**

**Expected Result**: SSL certificate should be issued automatically

---

## ✅ Step 9: Test Deployment

### 9.1 Check from Server

```bash
# Test local health endpoint
curl http://localhost/health
# Should return: healthy

# Test domain with SSL
curl https://toystore.purushottam.dev
# Should return HTML content

# Check SSL headers
curl -I https://toystore.purushottam.dev
# Should see "HTTP/2 200"
```

### 9.2 Check from Browser

Open in your browser:

1. **Homepage**: https://toystore.purushottam.dev
   - Should load without SSL warnings
   - Check that 🔒 icon appears in address bar

2. **Admin Panel**: https://toystore.purushottam.dev/admin
   - Should show login page
   - Try logging in with your ADMIN_DEFAULT_PASSWORD

3. **Products**: Navigate through the site
   - Check product pages work
   - Test search functionality

---

## ✅ Step 10: Final Checks

### 10.1 Check Logs

```bash
# Check for any errors
docker logs toystore-api
docker logs toystore-web
```

**Expected Result**: Should see no critical errors

### 10.2 Check Resource Usage

```bash
docker stats toystore-web toystore-api
```

**Expected Result**: Memory and CPU usage should be reasonable (< 50% for both)

### 10.3 Check SSL Grade (Optional but Recommended)

Visit: https://www.ssllabs.com/ssltest/analyze.html?d=toystore.purushottam.dev

**Expected Result**: Should get A or A+ rating

---

## ✅ Step 11: Setup Monitoring (Recommended)

### 11.1 Setup Uptime Monitoring

Use a service like:
- **UptimeRobot** (free): https://uptimerobot.com
- **Pingdom** (paid)
- **StatusCake** (free tier)

Monitor: `https://toystore.purushottam.dev`

### 11.2 Setup Backup Cron Job

```bash
# Create backup directory
sudo mkdir -p /opt/backups/database

# Edit crontab
crontab -e

# Add this line (daily backup at 2 AM):
0 2 * * * docker exec toystore-api sh -c 'mysqldump -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE' > /opt/backups/database/toystore_$(date +\%Y\%m\%d).sql
```

---

## 🎉 Deployment Complete!

Your toy store is now live at: **https://toystore.purushottam.dev**

### What's Next?

- ✅ Test all functionality thoroughly
- ✅ Add products through admin panel
- ✅ Configure email settings if needed
- ✅ Share the website link
- ✅ Monitor performance and logs

### Quick Reference for Future Updates

When you make changes and want to deploy:

**On Local Machine (Windows):**
```bash
cd D:\Projects\khandelwalstore
git add .
git commit -m "Your update message"
git push origin main
```

**On Server:**
```bash
cd /opt/khandelwalstore
git pull origin main
./deploy.sh deploy
```

---

## 📚 Documentation

- **Quick Deploy**: [QUICK_DEPLOY.md](QUICK_DEPLOY.md)
- **Server Guide**: [SERVER_DEPLOYMENT_GUIDE.md](SERVER_DEPLOYMENT_GUIDE.md)
- **Full Docker Guide**: [docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)
- **Command Reference**: [SERVER_COMMANDS.sh](SERVER_COMMANDS.sh)

---

## 🆘 Troubleshooting

If something goes wrong, check:

1. **Container Logs**: `docker logs toystore-api`
2. **Deployment Status**: `./deploy.sh status`
3. **Network**: `docker network inspect nginx_proxy`
4. **Full Guide**: [SERVER_DEPLOYMENT_GUIDE.md](SERVER_DEPLOYMENT_GUIDE.md)

---

**Need help?** Refer to the detailed guides or check container logs for specific errors.
