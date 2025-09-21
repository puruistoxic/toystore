#!/bin/bash

# WAINSO.com Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Configuration
PROJECT_NAME="wainso-web"
DOCKER_IMAGE="wainso-web"
CONTAINER_NAME="wainso-web"
BACKUP_DIR="/opt/backups/wainso"
LOG_FILE="/var/log/wainso-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Check if Docker is installed and running
check_docker() {
    log "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker service."
    fi
    
    success "Docker is installed and running"
}

# Check if docker-compose is available
check_docker_compose() {
    log "Checking Docker Compose..."
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    success "Docker Compose is available"
}

# Create backup of current deployment
create_backup() {
    log "Creating backup of current deployment..."
    
    # Create backup directory if it doesn't exist
    sudo mkdir -p "$BACKUP_DIR"
    
    # Get current timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
    
    # Create backup directory
    sudo mkdir -p "$BACKUP_PATH"
    
    # Backup current container if it exists
    if docker ps -a --format "table {{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
        log "Backing up current container..."
        docker commit "$CONTAINER_NAME" "${DOCKER_IMAGE}:backup_$TIMESTAMP" || warning "Failed to create container backup"
        docker save "${DOCKER_IMAGE}:backup_$TIMESTAMP" | sudo tee "$BACKUP_PATH/container_backup.tar" > /dev/null || warning "Failed to save container backup"
    fi
    
    # Backup current images
    if docker images --format "table {{.Repository}}:{{.Tag}}" | grep -q "^$DOCKER_IMAGE:"; then
        log "Backing up current images..."
        docker save "$DOCKER_IMAGE:latest" | sudo tee "$BACKUP_PATH/image_backup.tar" > /dev/null || warning "Failed to save image backup"
    fi
    
    success "Backup created at $BACKUP_PATH"
}

# Pull latest changes from Git
pull_changes() {
    log "Pulling latest changes from Git..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a Git repository. Please clone the repository first."
    fi
    
    # Fetch latest changes
    git fetch origin || error "Failed to fetch from origin"
    
    # Get current branch
    CURRENT_BRANCH=$(git branch --show-current)
    log "Current branch: $CURRENT_BRANCH"
    
    # Pull changes
    git pull origin "$CURRENT_BRANCH" || error "Failed to pull changes"
    
    success "Latest changes pulled successfully"
}

# Build Docker image
build_image() {
    log "Building Docker image..."
    
    # Build the image
    docker build -t "$DOCKER_IMAGE:latest" . || error "Failed to build Docker image"
    
    # Tag with timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    docker tag "$DOCKER_IMAGE:latest" "$DOCKER_IMAGE:$TIMESTAMP"
    
    success "Docker image built successfully"
}

# Stop and remove existing container
stop_container() {
    log "Stopping existing container..."
    
    if docker ps --format "table {{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
        docker stop "$CONTAINER_NAME" || warning "Failed to stop container"
        success "Container stopped"
    else
        log "No running container found"
    fi
    
    if docker ps -a --format "table {{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
        docker rm "$CONTAINER_NAME" || warning "Failed to remove container"
        success "Container removed"
    fi
}

# Start new container
start_container() {
    log "Starting new container..."
    
    # Use docker-compose if available, otherwise use docker run
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d || error "Failed to start with docker-compose"
    elif docker compose version &> /dev/null; then
        docker compose up -d || error "Failed to start with docker compose"
    else
        # Fallback to docker run
        docker run -d \
            --name "$CONTAINER_NAME" \
            --restart unless-stopped \
            -p 80:80 \
            -p 443:443 \
            -v "$(pwd)/logs:/var/log/nginx" \
            "$DOCKER_IMAGE:latest" || error "Failed to start container"
    fi
    
    success "Container started successfully"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for container to be ready
    sleep 10
    
    # Check if container is running
    if ! docker ps --format "table {{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
        error "Container is not running"
    fi
    
    # Check if application is responding
    for i in {1..30}; do
        if curl -f http://localhost/health &> /dev/null; then
            success "Health check passed"
            return 0
        fi
        log "Health check attempt $i/30 failed, retrying in 5 seconds..."
        sleep 5
    done
    
    error "Health check failed after 30 attempts"
}

# Cleanup old images
cleanup() {
    log "Cleaning up old images..."
    
    # Remove dangling images
    docker image prune -f || warning "Failed to prune dangling images"
    
    # Keep only last 3 versions of our image
    docker images "$DOCKER_IMAGE" --format "table {{.Tag}}" | grep -v "latest" | tail -n +4 | xargs -r docker rmi || warning "Failed to remove old images"
    
    success "Cleanup completed"
}

# Rollback function
rollback() {
    log "Rolling back to previous version..."
    
    # Stop current container
    stop_container
    
    # Find latest backup
    LATEST_BACKUP=$(sudo ls -t "$BACKUP_DIR" | head -n 1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found for rollback"
    fi
    
    log "Rolling back to backup: $LATEST_BACKUP"
    
    # Load backup image
    sudo cat "$BACKUP_DIR/$LATEST_BACKUP/image_backup.tar" | docker load || error "Failed to load backup image"
    
    # Start container with backup image
    docker run -d \
        --name "$CONTAINER_NAME" \
        --restart unless-stopped \
        -p 80:80 \
        -p 443:443 \
        -v "$(pwd)/logs:/var/log/nginx" \
        "$DOCKER_IMAGE:latest" || error "Failed to start rollback container"
    
    success "Rollback completed"
}

# Main deployment function
deploy() {
    log "Starting deployment process..."
    
    check_root
    check_docker
    check_docker_compose
    create_backup
    pull_changes
    build_image
    stop_container
    start_container
    health_check
    cleanup
    
    success "Deployment completed successfully!"
    log "Application is available at: http://localhost"
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  deploy     Deploy the application (default)"
    echo "  rollback   Rollback to previous version"
    echo "  health     Check application health"
    echo "  logs       Show application logs"
    echo "  status     Show deployment status"
    echo "  help       Show this help message"
    echo ""
}

# Show logs
show_logs() {
    log "Showing application logs..."
    docker logs -f "$CONTAINER_NAME"
}

# Show status
show_status() {
    log "Deployment Status:"
    echo ""
    echo "Container Status:"
    docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "Image Status:"
    docker images "$DOCKER_IMAGE" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    echo ""
    echo "Health Check:"
    if curl -f http://localhost/health &> /dev/null; then
        success "Application is healthy"
    else
        error "Application is not responding"
    fi
}

# Main script logic
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    health)
        health_check
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    help)
        usage
        ;;
    *)
        error "Unknown option: $1. Use 'help' for usage information."
        ;;
esac
