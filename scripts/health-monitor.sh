#!/bin/bash

# Health monitoring script for the portfolio deployment
# Usage: ./scripts/health-monitor.sh [--verbose]

set -e

VERBOSE=false
if [[ "$1" == "--verbose" ]]; then
    VERBOSE=true
fi

echo "🔍 Portfolio Health Monitor"
echo "=========================="
echo ""

# Check if docker compose is available
if ! command -v docker compose &> /dev/null; then
    echo "❌ docker compose is not installed or not in PATH"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

echo "📊 Service Status:"
echo "-----------------"

# Check portfolio service
echo -n "Portfolio Service: "
if docker ps -q -f name=daniel-koryat-portfolio | grep -q .; then
    HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' daniel-koryat-portfolio 2>/dev/null || echo "no-health-check")
    if [ "$HEALTH_STATUS" == "healthy" ]; then
        echo "✅ Healthy"
    elif [ "$HEALTH_STATUS" == "starting" ]; then
        echo "🔄 Starting"
    elif [ "$HEALTH_STATUS" == "unhealthy" ]; then
        echo "❌ Unhealthy"
    else
        echo "⚠️ Running (no health check)"
    fi
else
    echo "❌ Not running"
fi

# Note: Nginx service has been moved to a separate service on the server

# Check cloudflared service (system service)
echo -n "Cloudflare Tunnel: "
if systemctl is-active --quiet cloudflared; then
    echo "✅ Running (system service)"
else
    echo "❌ Not running (system service)"
fi

echo ""
echo "🌐 Network Connectivity:"
echo "----------------------"

# Note: Portfolio now exposes port 3000 directly, no internal nginx connection needed

# Test external health endpoints
echo -n "External Health Check: "
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "✅ Available"
else
    echo "❌ Failed"
fi

# Note: Nginx health check has been moved to external service

echo ""
echo "📋 Container Details:"
echo "-------------------"

if [ "$VERBOSE" = true ]; then
    echo "Portfolio Container:"
    docker inspect daniel-koryat-portfolio --format='  Status: {{.State.Status}}
  Health: {{.State.Health.Status}}
  Started: {{.State.StartedAt}}
  Image: {{.Image}}' 2>/dev/null || echo "  Not found"
    
    
    echo ""
    echo "Recent Logs (last 10 lines):"
    echo "Portfolio:"
    docker logs --tail 10 daniel-koryat-portfolio 2>/dev/null || echo "  No logs available"
else
    echo "Run with --verbose for detailed container information and logs"
fi

echo ""
echo "🔧 Quick Actions:"
echo "---------------"
echo "• View logs: docker compose logs [service]"
echo "• Restart services: docker compose restart"
echo "• Full restart: docker compose down && docker compose up -d"
echo "• Check config: docker compose config" 