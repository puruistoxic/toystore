#!/bin/bash

# Quick script to clear Docker cache and rebuild

echo "🧹 Clearing Docker cache and rebuilding..."

# Stop containers
docker-compose down

# Remove all build cache
echo "🗑️  Removing Docker build cache..."
docker builder prune -af

# Remove unused images
echo "🗑️  Removing unused images..."
docker image prune -af

# Rebuild without cache
echo "🔨 Rebuilding without cache..."
docker-compose build --no-cache --pull

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Show status
echo ""
echo "📋 Container status:"
docker-compose ps

echo ""
echo "✅ Done! Containers rebuilt without cache."
echo ""
echo "💡 Next steps:"
echo "   1. Hard refresh browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
echo "   2. Or clear browser cache completely"
echo "   3. Check if changes are visible"


