#!/bin/bash

# Health Monitor Script for Portfolio Application
# This script monitors the application health and can automatically restart services

set -e

# Configuration
HEALTH_CHECK_URL="http://localhost/api/health"
CLOUDFLARE_TUNNEL_URL="http://localhost:80"
PROJECT_NAME="daniel-koryat-portfolio"
NGINX_CONTAINER="portfolio-nginx"
LOG_FILE="/var/log/portfolio-health.log"
ALERT_EMAIL=""  # Set this to receive email alerts
RETRY_ATTEMPTS=3
RETRY_DELAY=30
MONITORING_INTERVAL=300  # 5 minutes

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

error() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1"
    echo -e "${RED}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

success() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1"
    echo -e "${GREEN}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

warning() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1"
    echo -e "${YELLOW}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

# Function to send alerts (can be extended with email/Slack/etc.)
send_alert() {
    local subject="$1"
    local message="$2"
    
    log "ALERT: $subject - $message"
    
    # Send email alert if configured
    if [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "$subject" "$ALERT_EMAIL" 2>/dev/null || true
    fi
    
    # Add webhook notifications here if needed
    # curl -X POST -H 'Content-type: application/json' \
    #   --data '{"text":"'"$subject: $message"'"}' \
    #   "$SLACK_WEBHOOK_URL" 2>/dev/null || true
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

# Function to perform HTTP health check
perform_health_check() {
    local url=$1
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    [ "$response_code" = "200" ]
}

# Function to get active environment
get_active_environment() {
    if is_container_running "${PROJECT_NAME}-blue"; then
        if is_container_running "${PROJECT_NAME}-green"; then
            # Both running, check nginx config
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

# Function to restart container
restart_container() {
    local container_name=$1
    log "Restarting container: $container_name"
    
    if docker restart "$container_name"; then
        success "Container $container_name restarted successfully"
        return 0
    else
        error "Failed to restart container $container_name"
        return 1
    fi
}

# Function to check and fix nginx
check_and_fix_nginx() {
    if ! is_container_running "$NGINX_CONTAINER"; then
        warning "Nginx container is not running"
        send_alert "Nginx Down" "Nginx container is not running, attempting to restart"
        
        if docker-compose up -d nginx; then
            success "Nginx container restarted successfully"
            return 0
        else
            error "Failed to restart Nginx container"
            send_alert "Nginx Restart Failed" "Failed to restart Nginx container"
            return 1
        fi
    fi
    
    # Check nginx configuration
    if ! docker exec $NGINX_CONTAINER nginx -t >/dev/null 2>&1; then
        warning "Nginx configuration is invalid"
        send_alert "Nginx Config Invalid" "Nginx configuration test failed"
        return 1
    fi
    
    return 0
}

# Function to check and fix application containers
check_and_fix_application() {
    local active_env=$(get_active_environment)
    
    if [ "$active_env" = "none" ]; then
        warning "No active application environment detected"
        send_alert "Application Down" "No active application environment detected, starting blue environment"
        
        if docker-compose up -d portfolio-blue; then
            success "Blue environment started successfully"
            return 0
        else
            error "Failed to start blue environment"
            send_alert "Application Start Failed" "Failed to start application environment"
            return 1
        fi
    fi
    
    # Check if active environment is healthy
    if ! is_container_healthy "${PROJECT_NAME}-${active_env}"; then
        warning "Active environment $active_env is not healthy"
        
        # Try to restart the container
        if restart_container "${PROJECT_NAME}-${active_env}"; then
            # Wait for container to become healthy
            sleep 30
            if is_container_healthy "${PROJECT_NAME}-${active_env}"; then
                success "Active environment $active_env is now healthy"
                return 0
            fi
        fi
        
        # If restart failed, try to switch to other environment
        local other_env
        if [ "$active_env" = "blue" ]; then
            other_env="green"
        else
            other_env="blue"
        fi
        
        warning "Attempting to switch to $other_env environment"
        send_alert "Environment Switch" "Active environment $active_env is unhealthy, switching to $other_env"
        
        if docker-compose up -d "portfolio-${other_env}"; then
            sleep 30
            if is_container_healthy "${PROJECT_NAME}-${other_env}"; then
                # Switch nginx configuration
                if ./scripts/deploy-blue-green.sh status | grep -q "Active Environment: $other_env"; then
                    success "Successfully switched to $other_env environment"
                    return 0
                fi
            fi
        fi
        
        error "Failed to switch environments"
        send_alert "Environment Switch Failed" "Failed to switch to backup environment"
        return 1
    fi
    
    return 0
}

# Function to perform comprehensive health check
comprehensive_health_check() {
    local issues=0
    
    log "Starting comprehensive health check..."
    
    # Check Docker daemon
    if ! docker info >/dev/null 2>&1; then
        error "Docker daemon is not running"
        send_alert "Docker Daemon Down" "Docker daemon is not responding"
        return 1
    fi
    
    # Check and fix nginx
    if ! check_and_fix_nginx; then
        ((issues++))
    fi
    
    # Check and fix application
    if ! check_and_fix_application; then
        ((issues++))
    fi
    
    # Check HTTP endpoints
    if ! perform_health_check "$HEALTH_CHECK_URL"; then
        warning "Health check endpoint is not responding"
        ((issues++))
        
        # Try a few more times with delay
        for i in $(seq 1 $RETRY_ATTEMPTS); do
            log "Retrying health check ($i/$RETRY_ATTEMPTS)..."
            sleep $RETRY_DELAY
            if perform_health_check "$HEALTH_CHECK_URL"; then
                success "Health check endpoint is now responding"
                ((issues--))
                break
            fi
        done
        
        if [ $issues -gt 0 ]; then
            send_alert "Health Check Failed" "Application health check endpoint is not responding after $RETRY_ATTEMPTS attempts"
        fi
    fi
    
    # Check Cloudflare tunnel endpoint
    if ! perform_health_check "$CLOUDFLARE_TUNNEL_URL"; then
        warning "Cloudflare tunnel endpoint check failed"
        # This is less critical, don't increment issues
    fi
    
    if [ $issues -eq 0 ]; then
        success "All health checks passed"
        return 0
    else
        error "Health check completed with $issues issues"
        return 1
    fi
}

# Function to show detailed status
show_detailed_status() {
    local active_env=$(get_active_environment)
    
    echo "=== Portfolio Application Health Status ==="
    echo "Timestamp: $(date)"
    echo "Active Environment: $active_env"
    echo
    
    echo "=== Container Status ==="
    echo "  Blue:   $(is_container_running "${PROJECT_NAME}-blue" && echo "Running" || echo "Stopped")"
    echo "  Green:  $(is_container_running "${PROJECT_NAME}-green" && echo "Running" || echo "Stopped")"
    echo "  Nginx:  $(is_container_running "$NGINX_CONTAINER" && echo "Running" || echo "Stopped")"
    echo
    
    echo "=== Health Status ==="
    if is_container_running "${PROJECT_NAME}-blue"; then
        echo "  Blue:   $(is_container_healthy "${PROJECT_NAME}-blue" && echo "Healthy" || echo "Unhealthy")"
    fi
    if is_container_running "${PROJECT_NAME}-green"; then
        echo "  Green:  $(is_container_healthy "${PROJECT_NAME}-green" && echo "Healthy" || echo "Unhealthy")"
    fi
    echo
    
    echo "=== HTTP Endpoints ==="
    echo "  Health: $(perform_health_check "$HEALTH_CHECK_URL" && echo "OK" || echo "Failed")"
    echo "  App:    $(perform_health_check "$CLOUDFLARE_TUNNEL_URL" && echo "OK" || echo "Failed")"
    echo
    
    echo "=== Resource Usage ==="
    if is_container_running "${PROJECT_NAME}-blue"; then
        echo "  Blue CPU/Memory:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" "${PROJECT_NAME}-blue" 2>/dev/null || echo "    Unable to get stats"
    fi
    if is_container_running "${PROJECT_NAME}-green"; then
        echo "  Green CPU/Memory:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" "${PROJECT_NAME}-green" 2>/dev/null || echo "    Unable to get stats"
    fi
}

# Function to start monitoring daemon
start_monitoring() {
    log "Starting health monitoring daemon (interval: ${MONITORING_INTERVAL}s)..."
    
    # Create log file if it doesn't exist
    touch "$LOG_FILE"
    
    while true; do
        comprehensive_health_check
        sleep $MONITORING_INTERVAL
    done
}

# Function to clean up old logs
cleanup_logs() {
    if [ -f "$LOG_FILE" ]; then
        # Keep only last 1000 lines
        tail -n 1000 "$LOG_FILE" > "${LOG_FILE}.tmp"
        mv "${LOG_FILE}.tmp" "$LOG_FILE"
        log "Log file cleaned up"
    fi
}

# Main script logic
case "${1:-check}" in
    check)
        comprehensive_health_check
        ;;
    status)
        show_detailed_status
        ;;
    monitor)
        start_monitoring
        ;;
    cleanup)
        cleanup_logs
        ;;
    *)
        echo "Usage: $0 {check|status|monitor|cleanup}"
        echo "  check   - Perform one-time health check and auto-fix issues"
        echo "  status  - Show detailed status of all components"
        echo "  monitor - Start continuous monitoring daemon"
        echo "  cleanup - Clean up old log files"
        exit 1
        ;;
esac 