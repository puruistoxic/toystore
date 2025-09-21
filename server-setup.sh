#!/bin/bash

# WAINSO.com Server Setup Script
# This script sets up an Ubuntu server for deploying the WAINSO application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    error "This script should not be run as root. Please run as a regular user with sudo privileges."
fi

# Check if sudo is available
if ! sudo -n true 2>/dev/null; then
    error "This script requires sudo privileges. Please ensure your user has sudo access."
fi

log "Starting WAINSO server setup..."

# Update system packages
log "Updating system packages..."
sudo apt update && sudo apt upgrade -y
success "System packages updated"

# Install required packages
log "Installing required packages..."
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release software-properties-common git ufw
success "Required packages installed"

# Install Docker
log "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
success "Docker installed"

# Add user to docker group
log "Adding user to docker group..."
sudo usermod -aG docker $USER
success "User added to docker group"

# Enable Docker to start on boot
log "Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker
success "Docker service enabled and started"

# Install Docker Compose (fallback)
log "Installing Docker Compose..."
sudo apt install -y docker-compose
success "Docker Compose installed"

# Configure firewall
log "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8080  # For Traefik dashboard
success "Firewall configured"

# Create application directory
log "Creating application directory..."
sudo mkdir -p /opt/wainso
sudo chown $USER:$USER /opt/wainso
success "Application directory created"

# Create backup directory
log "Creating backup directory..."
sudo mkdir -p /opt/backups/wainso
sudo chown $USER:$USER /opt/backups/wainso
success "Backup directory created"

# Create log directory
log "Creating log directory..."
sudo mkdir -p /var/log/wainso
sudo chown $USER:$USER /var/log/wainso
success "Log directory created"

# Install additional monitoring tools
log "Installing monitoring tools..."
sudo apt install -y htop iotop nethogs
success "Monitoring tools installed"

# Configure log rotation
log "Configuring log rotation..."
sudo tee /etc/logrotate.d/wainso > /dev/null <<EOF
/var/log/wainso/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF
success "Log rotation configured"

# Create systemd service for application (optional)
log "Creating systemd service template..."
sudo tee /etc/systemd/system/wainso.service > /dev/null <<EOF
[Unit]
Description=WAINSO Web Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/wainso
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0
User=$USER
Group=$USER

[Install]
WantedBy=multi-user.target
EOF
success "Systemd service created"

# Create health check script
log "Creating health check script..."
tee /opt/wainso/health-check.sh > /dev/null <<EOF
#!/bin/bash
# Health check script for WAINSO application

LOG_FILE="/var/log/wainso/health-check.log"
APP_URL="http://localhost/health"

# Check if application is responding
if curl -f -s \$APP_URL > /dev/null; then
    echo "\$(date): Application is healthy" >> \$LOG_FILE
    exit 0
else
    echo "\$(date): Application health check failed" >> \$LOG_FILE
    # Restart application if health check fails
    cd /opt/wainso && docker-compose restart
    exit 1
fi
EOF

chmod +x /opt/wainso/health-check.sh
success "Health check script created"

# Create backup script
log "Creating backup script..."
tee /opt/wainso/backup.sh > /dev/null <<EOF
#!/bin/bash
# Backup script for WAINSO application

BACKUP_DIR="/opt/backups/wainso"
TIMESTAMP=\$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="\$BACKUP_DIR/backup_\$TIMESTAMP"

# Create backup directory
mkdir -p "\$BACKUP_PATH"

# Backup application code
cd /opt/wainso
tar -czf "\$BACKUP_PATH/application.tar.gz" --exclude=node_modules --exclude=.git .

# Backup Docker images
docker save wainso-web:latest | gzip > "\$BACKUP_PATH/docker-image.tar.gz"

# Backup Docker volumes (if any)
docker run --rm -v wainso_data:/data -v "\$BACKUP_PATH":/backup alpine tar czf /backup/volumes.tar.gz -C /data .

# Keep only last 7 days of backups
find "\$BACKUP_DIR" -type d -name "backup_*" -mtime +7 -exec rm -rf {} +

echo "\$(date): Backup completed - \$BACKUP_PATH" >> /var/log/wainso/backup.log
EOF

chmod +x /opt/wainso/backup.sh
success "Backup script created"

# Create update script
log "Creating update script..."
tee /opt/wainso/update.sh > /dev/null <<EOF
#!/bin/bash
# Update script for WAINSO application

cd /opt/wainso

# Pull latest changes
git pull origin main

# Run deployment script
./deploy.sh deploy

echo "\$(date): Application updated" >> /var/log/wainso/update.log
EOF

chmod +x /opt/wainso/update.sh
success "Update script created"

# Configure cron jobs
log "Configuring cron jobs..."
(crontab -l 2>/dev/null; echo "# WAINSO Health Check - every 5 minutes") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/wainso/health-check.sh") | crontab -
(crontab -l 2>/dev/null; echo "# WAINSO Backup - daily at 2 AM") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/wainso/backup.sh") | crontab -
(crontab -l 2>/dev/null; echo "# WAINSO Log Rotation - weekly") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 /usr/sbin/logrotate /etc/logrotate.d/wainso") | crontab -
success "Cron jobs configured"

# Set up SSH key for Git (optional)
log "Setting up Git configuration..."
read -p "Do you want to configure Git with your credentials? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your Git username: " git_username
    read -p "Enter your Git email: " git_email
    git config --global user.name "$git_username"
    git config --global user.email "$git_email"
    success "Git configured"
fi

# Final instructions
log "Setup completed successfully!"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Log out and log back in to apply Docker group changes"
echo "2. Clone your repository to /opt/wainso:"
echo "   cd /opt/wainso"
echo "   git clone https://github.com/yourusername/wainsoweb.git ."
echo "3. Run the deployment script:"
echo "   ./deploy.sh deploy"
echo ""
echo -e "${YELLOW}Important notes:${NC}"
echo "- Make sure your domain points to this server's IP address"
echo "- Configure SSL certificates for production use"
echo "- Review and customize the configuration files"
echo "- Test the deployment before going live"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "- Check application status: ./deploy.sh status"
echo "- View logs: ./deploy.sh logs"
echo "- Health check: ./deploy.sh health"
echo "- Manual backup: ./backup.sh"
echo "- Manual update: ./update.sh"
echo ""
echo -e "${GREEN}Server setup completed!${NC}"
