#!/bin/bash

# Zero-downtime Blue-Green Deployment Script
# This script manages the deployment process ensuring no downtime

set -e

# Configuration
PROJECT_NAME="daniel-koryat-portfolio"
HEALTH_CHECK_URL="http://localhost/api/health"
NGINX_CONTAINER="portfolio-nginx"
TIMEOUT=300  # 5 minutes timeout
RETRY_INTERVAL=10  # 10 seconds between retries

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Function to check if a container is running
is_container_running() {
    local container_name=$1
    docker ps --filter "name=$container_name" --filter "status=running" --format "{{.Names}}" | grep -q "^$container_name$"
}

# Function to check if a container is healthy
is_container_healthy() {
    local container_name=$1
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "none")
    [ "$health_status" = "healthy" ]
}

# Function to wait for container to be healthy
wait_for_healthy() {
    local container_name=$1
    local timeout=$2
    local elapsed=0
    
    log "Waiting for $container_name to be healthy..."
    
    while [ $elapsed -lt $timeout ]; do
        if is_container_healthy "$container_name"; then
            success "$container_name is healthy"
            return 0
        fi
        
        log "Waiting for $container_name to be healthy... (${elapsed}s/${timeout}s)"
        sleep $RETRY_INTERVAL
        elapsed=$((elapsed + RETRY_INTERVAL))
    done
    
    error "$container_name failed to become healthy within ${timeout}s"
    return 1
}

# Function to perform health check via HTTP
perform_health_check() {
    local url=$1
    local timeout=$2
    local elapsed=0
    
    log "Performing health check on $url..."
    
    while [ $elapsed -lt $timeout ]; do
        if curl -sf "$url" >/dev/null 2>&1; then
            success "Health check passed for $url"
            return 0
        fi
        
        log "Health check failed, retrying... (${elapsed}s/${timeout}s)"
        sleep $RETRY_INTERVAL
        elapsed=$((elapsed + RETRY_INTERVAL))
    done
    
    error "Health check failed for $url after ${timeout}s"
    return 1
}

# Function to determine current active environment
get_active_environment() {
    if is_container_running "${PROJECT_NAME}-blue"; then
        if is_container_running "${PROJECT_NAME}-green"; then
            # Both are running, check which is primary in nginx config
            local blue_status=$(docker exec $NGINX_CONTAINER nginx -T 2>/dev/null | grep -c "server daniel-koryat-portfolio-blue:3000.*backup" || echo 0)
            if [ "$blue_status" -eq 0 ]; then
                echo "blue"
            else
                echo "green"
            fi
        else
            echo "blue"
        fi
    elif is_container_running "${PROJECT_NAME}-green"; then
        echo "green"
    else
        echo "none"
    fi
}

# Function to update nginx upstream configuration
update_nginx_upstream() {
    local active_env=$1
    local inactive_env=$2
    
    log "Updating nginx upstream configuration - Active: $active_env, Standby: $inactive_env"
    
    # Create temporary nginx config
    local temp_config="/tmp/nginx_upstream_update.conf"
    
    if [ "$active_env" = "blue" ]; then
        cat > "$temp_config" << EOF
upstream portfolio {
    server daniel-koryat-portfolio-blue:3000 max_fails=3 fail_timeout=30s;
    server daniel-koryat-portfolio-green:3000 max_fails=3 fail_timeout=30s backup;
}
EOF
    else
        cat > "$temp_config" << EOF
upstream portfolio {
    server daniel-koryat-portfolio-green:3000 max_fails=3 fail_timeout=30s;
    server daniel-koryat-portfolio-blue:3000 max_fails=3 fail_timeout=30s backup;
}
EOF
    fi
    
    # Replace the upstream block in nginx.conf
    sed -i '/# Upstream for the Next.js application - Blue\/Green deployment/,/^    }$/c\
    # Upstream for the Next.js application - Blue/Green deployment\
    upstream portfolio {\
        server daniel-koryat-portfolio-'$active_env':3000 max_fails=3 fail_timeout=30s;\
        server daniel-koryat-portfolio-'$inactive_env':3000 max_fails=3 fail_timeout=30s backup;\
    }' nginx.conf
    
    # Test nginx configuration
    if docker exec $NGINX_CONTAINER nginx -t; then
        # Reload nginx configuration
        docker exec $NGINX_CONTAINER nginx -s reload
        success "Nginx configuration updated and reloaded"
    else
        error "Nginx configuration test failed"
        return 1
    fi
}

# Function to deploy new version
deploy_new_version() {
    local current_active=$(get_active_environment)
    local new_env
    local old_env
    
    log "Current active environment: $current_active"
    
    # Determine target environment
    if [ "$current_active" = "blue" ]; then
        new_env="green"
        old_env="blue"
    elif [ "$current_active" = "green" ]; then
        new_env="blue"
        old_env="green"
    else
        # Neither is running, default to blue
        new_env="blue"
        old_env="green"
        warning "No active environment detected, deploying to blue"
    fi
    
    log "Deploying new version to $new_env environment"
    
    # Build and start new environment
    log "Building and starting $new_env environment..."
    docker-compose up -d --build --force-recreate "${PROJECT_NAME}-${new_env}"
    
    # Wait for new environment to be healthy
    if ! wait_for_healthy "${PROJECT_NAME}-${new_env}" $TIMEOUT; then
        error "New environment failed to become healthy, rolling back..."
        docker-compose stop "${PROJECT_NAME}-${new_env}"
        return 1
    fi
    
    # Perform additional health checks
    if [ "$new_env" = "blue" ]; then
        local test_url="http://localhost:8080/api/health"
    else
        local test_url="http://localhost:8081/api/health"
    fi
    
    if ! perform_health_check "$test_url" 60; then
        error "Health check failed for new environment, rolling back..."
        docker-compose stop "${PROJECT_NAME}-${new_env}"
        return 1
    fi
    
    # Update nginx configuration to switch traffic
    if ! update_nginx_upstream "$new_env" "$old_env"; then
        error "Failed to update nginx configuration, rolling back..."
        docker-compose stop "${PROJECT_NAME}-${new_env}"
        return 1
    fi
    
    # Final health check through nginx
    if ! perform_health_check "$HEALTH_CHECK_URL" 60; then
        error "Final health check failed, rolling back..."
        update_nginx_upstream "$old_env" "$new_env"
        docker-compose stop "${PROJECT_NAME}-${new_env}"
        return 1
    fi
    
    # Stop old environment
    if [ "$current_active" != "none" ]; then
        log "Stopping old environment: $old_env"
        docker-compose stop "${PROJECT_NAME}-${old_env}"
    fi
    
    # Clean up old images
    log "Cleaning up old images..."
    docker image prune -f
    
    success "Deployment completed successfully! New active environment: $new_env"
}

# Function to rollback to previous version
rollback() {
    local current_active=$(get_active_environment)
    local rollback_env
    
    if [ "$current_active" = "blue" ]; then
        rollback_env="green"
    elif [ "$current_active" = "green" ]; then
        rollback_env="blue"
    else
        error "Cannot rollback - no active environment detected"
        return 1
    fi
    
    log "Rolling back from $current_active to $rollback_env"
    
    # Start rollback environment
    docker-compose up -d "${PROJECT_NAME}-${rollback_env}"
    
    # Wait for rollback environment to be healthy
    if ! wait_for_healthy "${PROJECT_NAME}-${rollback_env}" $TIMEOUT; then
        error "Rollback environment failed to become healthy"
        return 1
    fi
    
    # Switch nginx configuration
    if ! update_nginx_upstream "$rollback_env" "$current_active"; then
        error "Failed to update nginx configuration during rollback"
        return 1
    fi
    
    # Stop current environment
    docker-compose stop "${PROJECT_NAME}-${current_active}"
    
    success "Rollback completed successfully! Active environment: $rollback_env"
}

# Function to show status
show_status() {
    local active_env=$(get_active_environment)
    
    echo "=== Blue-Green Deployment Status ==="
    echo "Active Environment: $active_env"
    echo
    echo "Container Status:"
    echo "  Blue:  $(is_container_running "${PROJECT_NAME}-blue" && echo "Running" || echo "Stopped")"
    echo "  Green: $(is_container_running "${PROJECT_NAME}-green" && echo "Running" || echo "Stopped")"
    echo
    echo "Health Status:"
    if is_container_running "${PROJECT_NAME}-blue"; then
        echo "  Blue:  $(is_container_healthy "${PROJECT_NAME}-blue" && echo "Healthy" || echo "Unhealthy")"
    fi
    if is_container_running "${PROJECT_NAME}-green"; then
        echo "  Green: $(is_container_healthy "${PROJECT_NAME}-green" && echo "Healthy" || echo "Unhealthy")"
    fi
}

# Main script logic
case "${1:-deploy}" in
    deploy)
        log "Starting blue-green deployment..."
        deploy_new_version
        ;;
    rollback)
        log "Starting rollback..."
        rollback
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|status}"
        echo "  deploy  - Deploy new version with zero downtime"
        echo "  rollback - Rollback to previous version"
        echo "  status  - Show current deployment status"
        exit 1
        ;;
esac 