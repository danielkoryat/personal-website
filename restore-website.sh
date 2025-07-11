#!/bin/bash
# Emergency Website Restoration Script
# This script will restore the website after a failed deployment

echo "🚨 EMERGENCY WEBSITE RESTORATION"
echo "================================"

# Check current container status
echo "🔍 Checking current container status..."
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check active upstream configuration
echo ""
echo "🔍 Current upstream configuration:"
cat active_upstream.conf

# Determine which container should be running
if grep -q "blue" active_upstream.conf; then
    EXPECTED_CONTAINER="daniel-koryat-portfolio-blue"
    EXPECTED_SLOT="blue"
else
    EXPECTED_CONTAINER="daniel-koryat-portfolio-green"
    EXPECTED_SLOT="green"
fi

echo ""
echo "🎯 Expected live container: ${EXPECTED_CONTAINER}"

# Check if expected container is running
if docker ps -q -f name="${EXPECTED_CONTAINER}" | grep -q .; then
    echo "✅ Expected container is running"
    
    # Check health status
    HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' ${EXPECTED_CONTAINER} 2>/dev/null || echo "none")
    echo "📊 Health status: ${HEALTH_STATUS}"
    
    if [ "${HEALTH_STATUS}" == "healthy" ]; then
        echo "✅ Website should be working normally"
        exit 0
    else
        echo "⚠️ Container is running but not healthy yet"
        echo "⏳ Waiting for health check..."
        sleep 10
        
        HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' ${EXPECTED_CONTAINER} 2>/dev/null || echo "none")
        if [ "${HEALTH_STATUS}" == "healthy" ]; then
            echo "✅ Website is now healthy"
            exit 0
        else
            echo "⚠️ Container is still not healthy - checking logs..."
            docker logs --tail 20 ${EXPECTED_CONTAINER}
        fi
    fi
else
    echo "❌ Expected container is not running!"
    echo "🚀 Starting ${EXPECTED_CONTAINER}..."
    
    # Start the expected container
    docker compose up -d --remove-orphans "${EXPECTED_CONTAINER}"
    
    echo "⏳ Waiting for container to become healthy..."
    timeout_seconds=120
    elapsed=0
    
    while [ $elapsed -lt $timeout_seconds ]; do
        HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' ${EXPECTED_CONTAINER} 2>/dev/null || echo "starting")
        if [ "${HEALTH_STATUS}" == "healthy" ]; then
            echo "✅ ${EXPECTED_CONTAINER} is now healthy!"
            echo "🎉 Website restored successfully!"
            break
        fi
        echo "⏳ Waiting... (Status: ${HEALTH_STATUS}) - ${elapsed}s elapsed"
        sleep 5
        elapsed=$((elapsed + 5))
    done
    
    if [ $elapsed -ge $timeout_seconds ]; then
        echo "❌ Container failed to become healthy within timeout"
        echo "📋 Container logs:"
        docker logs --tail 30 ${EXPECTED_CONTAINER}
        exit 1
    fi
fi

echo ""
echo "🔍 Final status check:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 Testing website availability..."
sleep 5
if curl -f -s http://localhost:8080/api/health > /dev/null; then
    echo "✅ Website is responding to health checks"
    echo "🎉 Emergency restoration completed successfully!"
else
    echo "❌ Website is not responding to health checks"
    echo "📋 Please check nginx and container logs manually"
    exit 1
fi 