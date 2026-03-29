#!/bin/bash

# ToyStore (toystore.purushottam.dev) Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Configuration (full stack: API + nginx web via docker compose)
COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="/opt/backups/toystore"
LOG_FILE="/var/log/toystore-deploy.log"

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
    
    for name in toystore-web toystore-api; do
        if docker ps -a --format "{{.Names}}" | grep -q "^${name}$"; then
            log "Backing up image from container ${name}..."
            docker commit "$name" "${name}:backup_$TIMESTAMP" || warning "Failed to commit ${name}"
            docker save "${name}:backup_$TIMESTAMP" | sudo tee "$BACKUP_PATH/${name}_backup.tar" > /dev/null || warning "Failed to save ${name} image"
        fi
    done
    
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

run_compose() {
    if docker compose version &> /dev/null 2>&1; then
        docker compose -f "$COMPOSE_FILE" "$@"
    else
        docker-compose -f "$COMPOSE_FILE" "$@"
    fi
}

# Build images (web + API)
build_image() {
    log "Building Docker images (compose)..."
    run_compose build --pull || error "Failed to build images"
    success "Docker images built successfully"
}

stop_stack() {
    log "Stopping compose stack..."
    run_compose down || warning "Compose down reported an issue"
}

start_stack() {
    log "Starting compose stack..."
    run_compose up -d || error "Failed to start stack"
    success "Stack started"
}

# Health check (works when 80 is not published to host — uses exec inside containers)
health_check() {
    log "Performing health check..."
    sleep 8
    if ! docker ps --format "{{.Names}}" | grep -q "^toystore-web$"; then
        error "toystore-web container is not running"
    fi
    if ! docker ps --format "{{.Names}}" | grep -q "^toystore-api$"; then
        error "toystore-api container is not running"
    fi
    for i in $(seq 1 30); do
        if docker exec toystore-api wget -qO- http://127.0.0.1:3001/health >/dev/null 2>&1 \
            && docker exec toystore-web wget -qO- http://127.0.0.1/health >/dev/null 2>&1; then
            success "Health check passed (API + web)"
            return 0
        fi
        log "Health check attempt $i/30 failed, retrying in 5 seconds..."
        sleep 5
    done
    error "Health check failed after 30 attempts"
}

cleanup() {
    log "Cleaning up dangling images..."
    docker image prune -f || warning "Failed to prune dangling images"
    success "Cleanup completed"
}

# Rollback function
rollback() {
    warning "Compose rollback: check out a known-good commit (git checkout <hash>), then run ./deploy.sh deploy."
    warning "Or load backup tar files from $BACKUP_DIR/<timestamp>/ and retag images to match this project’s compose image names, then docker compose up -d."
}

check_env_file() {
    if [[ ! -f .env ]]; then
        error "Missing .env in $(pwd). Copy .env.example to .env and set secrets, MySQL, SMTP, and PUBLIC_DOMAIN."
    fi
}

# Main deployment function
deploy() {
    log "Starting deployment process..."
    
    check_root
    check_docker
    check_docker_compose
    check_env_file
    create_backup
    pull_changes
    log "Building and starting stack..."
    run_compose up -d --build || error "Compose up failed"
    health_check
    cleanup
    
    success "Deployment completed successfully!"
    log "Containers: toystore-web (nginx + static app), toystore-api (Node). Point your reverse proxy at the published proxy network."
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
    log "Showing compose logs (Ctrl+C to exit)..."
    run_compose logs -f
}

# Show status
show_status() {
    log "Deployment Status:"
    echo ""
    run_compose ps
    echo ""
    echo "Health (inside containers):"
    if docker exec toystore-api wget -qO- http://127.0.0.1:3001/health >/dev/null 2>&1 \
        && docker exec toystore-web wget -qO- http://127.0.0.1/health >/dev/null 2>&1; then
        success "API and web respond on internal health endpoints"
    else
        warning "One or both containers failed the internal health check (see docker compose logs)"
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
