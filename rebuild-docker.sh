#!/bin/bash

# Script to rebuild Docker containers without cache
# This ensures fresh builds and clears any cached content

echo "🔄 Rebuilding Docker containers without cache..."

# Stop and remove existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Remove old images (optional - uncomment if you want to force fresh pull)
# echo "🗑️  Removing old images..."
# docker-compose rm -f

# Rebuild without cache
echo "🔨 Rebuilding containers without cache..."
docker-compose build --no-cache

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Show logs
echo "📋 Container status:"
docker-compose ps

echo ""
echo "✅ Rebuild complete!"
echo "💡 If you still see cached content:"
echo "   1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   2. Clear browser cache"
echo "   3. Try incognito/private mode"










