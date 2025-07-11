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

# Check nginx service
echo -n "Nginx Service: "
if docker ps -q -f name=portfolio-nginx | grep -q .; then
    HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' portfolio-nginx 2>/dev/null || echo "no-health-check")
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

# Check cloudflared service
echo -n "Cloudflare Tunnel: "
if docker ps -q -f name=cloudflare-tunnel | grep -q .; then
    echo "✅ Running"
else
    echo "❌ Not running"
fi

echo ""
echo "🌐 Network Connectivity:"
echo "----------------------"

# Test internal connectivity
echo -n "Portfolio -> Nginx: "
if docker exec daniel-koryat-portfolio curl -f http://portfolio-nginx/nginx-health >/dev/null 2>&1; then
    echo "✅ Connected"
else
    echo "❌ Failed"
fi

# Test external health endpoints
echo -n "External Health Check: "
if curl -f http://localhost:8080/health >/dev/null 2>&1; then
    echo "✅ Available"
else
    echo "❌ Failed"
fi

echo -n "Nginx Health: "
if curl -f http://localhost:8080/nginx-health >/dev/null 2>&1; then
    echo "✅ Available"
else
    echo "❌ Failed"
fi

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
    echo "Nginx Container:"
    docker inspect portfolio-nginx --format='  Status: {{.State.Status}}
  Health: {{.State.Health.Status}}
  Started: {{.State.StartedAt}}
  Image: {{.Image}}' 2>/dev/null || echo "  Not found"
    
    echo ""
    echo "Recent Logs (last 10 lines):"
    echo "Portfolio:"
    docker logs --tail 10 daniel-koryat-portfolio 2>/dev/null || echo "  No logs available"
    
    echo ""
    echo "Nginx:"
    docker logs --tail 10 portfolio-nginx 2>/dev/null || echo "  No logs available"
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