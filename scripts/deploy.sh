#!/bin/bash

# Deployment script for the portfolio application
# Usage: ./scripts/deploy.sh [--rollback]

set -e

ROLLBACK=false
if [[ "$1" == "--rollback" ]]; then
    ROLLBACK=true
fi

echo "🚀 Portfolio Deployment Script"
echo "============================="
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

# Function to check if a container is healthy
is_healthy() {
    local container_name=$1
    local health_status=$(docker inspect --format '{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "none")
    [ "$health_status" = "healthy" ]
}

# Function to wait for container health
wait_for_health() {
    local container_name=$1
    local timeout=$2
    local elapsed=0
    
    echo "⏳ Waiting for $container_name to be healthy..."
    while [ $elapsed -lt $timeout ]; do
        if is_healthy "$container_name"; then
            echo "✅ $container_name is healthy!"
            return 0
        fi
        echo "⏳ Waiting... (${elapsed}s elapsed)"
        sleep 10
        elapsed=$((elapsed + 10))
    done
    
    echo "❌ $container_name failed to become healthy within ${timeout}s"
    return 1
}

if [ "$ROLLBACK" = true ]; then
    echo "🔄 Performing rollback..."
    
    # Stop all services
    echo "🛑 Stopping all services..."
    docker compose down
    
    # Remove any failed containers
    docker compose rm -f 2>/dev/null || true
    
    # Start services in correct order
    echo "🚀 Starting services in rollback mode..."
    docker compose up -d portfolio
    
    if ! wait_for_health "daniel-koryat-portfolio" 120; then
        echo "❌ Rollback failed - portfolio service is not healthy"
        docker compose logs portfolio
        exit 1
    fi
    
    echo "✅ Rollback completed successfully!"
else
    echo "🚀 Performing deployment..."
    
    # Validate configuration
    echo "🔍 Validating configuration..."
    if ! docker compose config >/dev/null 2>&1; then
        echo "❌ Docker Compose configuration is invalid"
        docker compose config
        exit 1
    fi
    
    # Build the new image
    echo "🏗️ Building new image..."
    DOCKER_BUILDKIT=1 docker compose build --build-arg BUILDKIT_INLINE_CACHE=1 portfolio
    
    # Deploy with zero downtime
    echo "🚀 Deploying new version..."
    
    # Start portfolio service
    docker compose up -d --force-recreate portfolio
    
    # Wait for portfolio to be healthy
    if ! wait_for_health "daniel-koryat-portfolio" 120; then
        echo "❌ Deployment failed - portfolio service is not healthy"
        docker compose logs portfolio
        exit 1
    fi
    
    # Final validation
    echo "🔍 Performing final validation..."
    
    # Test health endpoints
    if ! curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        echo "❌ Final validation failed - health endpoint not responding"
        exit 1
    fi
    
    echo "✅ Deployment completed successfully!"
fi

# Show final status
echo ""
echo "📊 Final Status:"
docker compose ps

echo ""
echo "🌐 Health Endpoints:"
echo "• Application: http://localhost:3000/api/health" 