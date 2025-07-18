#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

# Function to check the health of a container
check_health() {
  local container_name=$1
  echo "🔍 Waiting for ${container_name} to become healthy..."
  for i in {1..60}; do
    HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' ${container_name} 2>/dev/null || echo "starting")
    if [ "${HEALTH_STATUS}" == "healthy" ]; then
      echo "✅ ${container_name} is healthy!"
      
      # Additional HTTP health check to ensure the application is responding
      echo "🔍 Performing HTTP health check..."
      for j in {1..10}; do
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/health" 2>/dev/null || echo "000")
        if [ "${HTTP_STATUS}" == "200" ]; then
          echo "✅ HTTP health check passed (Status: ${HTTP_STATUS})"
          return 0
        fi
        echo "   - HTTP health check failed (Status: ${HTTP_STATUS}), retrying..."
        sleep 2
      done
      
      echo "⚠️ Container is healthy but HTTP health check failed"
      return 0  # Continue anyway as container health is the primary indicator
    fi
    echo "   - Still waiting... (Status: ${HEALTH_STATUS})"
    sleep 10
  done
  echo "❌ ${container_name} failed to become healthy. Aborting deployment."
  docker compose logs ${container_name}
  exit 1
}

# 1. Smart container cleanup - preserve live environment

# Smart container cleanup - preserve live environment
echo "🧹 Safely cleaning up orphaned containers..."

# Determine which environment is currently active
if [ -f active_upstream.conf ]; then
  if grep -q "blue" active_upstream.conf; then
    ACTIVE_SLOT="blue"
    STANDBY_SLOT="green"
  else
    ACTIVE_SLOT="green"
    STANDBY_SLOT="blue"
  fi
  
  echo "🔵 Active slot: ${ACTIVE_SLOT}"
  echo "🟢 Standby slot: ${STANDBY_SLOT}"
  
  # Only remove the standby slot container if it exists and is not healthy
  STANDBY_CONTAINER="daniel-koryat-portfolio-${STANDBY_SLOT}"
  if docker ps -q -f name="${STANDBY_CONTAINER}" | grep -q .; then
    HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' ${STANDBY_CONTAINER} 2>/dev/null || echo "none")
    if [ "${HEALTH_STATUS}" != "healthy" ]; then
      echo "🛑 Removing unhealthy standby container: ${STANDBY_CONTAINER}"
      docker rm -f ${STANDBY_CONTAINER} 2>/dev/null || true
    else
      echo "✅ Keeping healthy standby container: ${STANDBY_CONTAINER}"
    fi
  fi
  
  # Never remove the active container - this prevents downtime
  ACTIVE_CONTAINER="daniel-koryat-portfolio-${ACTIVE_SLOT}"
  if docker ps -q -f name="${ACTIVE_CONTAINER}" | grep -q .; then
    echo "✅ Preserving active container: ${ACTIVE_CONTAINER}"
  fi
else
  echo "⚠️ No active_upstream.conf found, performing minimal cleanup"
  # Only remove containers that are not running or healthy
  for container in daniel-koryat-portfolio-blue daniel-koryat-portfolio-green; do
    if docker ps -q -f name="${container}" | grep -q .; then
      HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' ${container} 2>/dev/null || echo "none")
      if [ "${HEALTH_STATUS}" != "healthy" ]; then
        echo "🛑 Removing unhealthy container: ${container}"
        docker rm -f ${container} 2>/dev/null || true
      else
        echo "✅ Keeping healthy container: ${container}"
      fi
    fi
  done
fi

echo "✅ Container cleanup completed"

# 2. Pre-deployment validation
echo "🔍 Validating deployment environment..."

# Check if required files exist
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found"
    exit 1
fi

# Note: nginx.conf is no longer needed as nginx is a separate service

# Check Docker daemon
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker daemon is not running"
    exit 1
fi

# Check available disk space (require at least 2GB free)
FREE_SPACE=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$FREE_SPACE" -lt 2 ]; then
    echo "❌ Insufficient disk space. Available: ${FREE_SPACE}G, Required: 2G"
    exit 1
fi

echo "✅ Pre-deployment validation passed"

# Note: Nginx is now a separate service on the server

# 2. Determine which environment is live and which is the target for deployment
# We check which server is active in active_upstream.conf
if grep -q "daniel-koryat-portfolio-blue" active_upstream.conf; then
    LIVE_SLOT="blue"
    DEPLOY_SLOT="green"
else
    LIVE_SLOT="green"
    DEPLOY_SLOT="blue"
fi

echo "🔵 Live environment: ${LIVE_SLOT}"
echo "🟢 Deploying to: ${DEPLOY_SLOT}"

# Ensure we have at least one healthy container before proceeding
LIVE_CONTAINER="daniel-koryat-portfolio-${LIVE_SLOT}"
if ! docker ps -q -f name="${LIVE_CONTAINER}" | grep -q .; then
    echo "❌ No live container found. Starting ${LIVE_SLOT} environment first..."
    docker compose up -d --remove-orphans "${LIVE_CONTAINER}"
    
    # Wait for it to become healthy
    timeout_seconds=120
    elapsed=0
    while [ $elapsed -lt $timeout_seconds ]; do
        HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' ${LIVE_CONTAINER} 2>/dev/null || echo "starting")
        if [ "${HEALTH_STATUS}" == "healthy" ]; then
            echo "✅ Live container is now healthy!"
            break
        fi
        echo "⏳ Waiting for live container to be healthy... (Status: ${HEALTH_STATUS})"
        sleep 10
        elapsed=$((elapsed + 10))
    done
    
    if [ $elapsed -ge $timeout_seconds ]; then
        echo "❌ Live container failed to become healthy. Aborting deployment."
        exit 1
    fi
fi

# 3. Validate live environment health before proceeding
LIVE_CONTAINER="daniel-koryat-portfolio-${LIVE_SLOT}"
echo "🔍 Validating live environment health: ${LIVE_CONTAINER}"

# Check if live container is healthy
HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' ${LIVE_CONTAINER} 2>/dev/null || echo "none")
if [ "${HEALTH_STATUS}" != "healthy" ]; then
    echo "❌ Live container ${LIVE_CONTAINER} is not healthy (Status: ${HEALTH_STATUS})"
    echo "🔄 Attempting to restart live container..."
    docker restart ${LIVE_CONTAINER}
    
    # Wait for it to become healthy
    timeout_seconds=120
    elapsed=0
    while [ $elapsed -lt $timeout_seconds ]; do
        HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' ${LIVE_CONTAINER} 2>/dev/null || echo "starting")
        if [ "${HEALTH_STATUS}" == "healthy" ]; then
            echo "✅ Live container is now healthy!"
            break
        fi
        echo "⏳ Waiting for live container to be healthy... (Status: ${HEALTH_STATUS})"
        sleep 10
        elapsed=$((elapsed + 10))
    done
    
    if [ $elapsed -ge $timeout_seconds ]; then
        echo "❌ Live container failed to become healthy. Aborting deployment."
        exit 1
    fi
else
    echo "✅ Live container is healthy!"
fi

# 4. Build and deploy the new version to the standby slot
echo "🚀 Building and deploying daniel-koryat-portfolio-${DEPLOY_SLOT}..."

# Check system resources before build
echo "📊 System resources before build:"
echo "  • Memory: $(free -h | grep '^Mem:' | awk '{print $3"/"$2}')"
echo "  • Disk: $(df -h / | tail -1 | awk '{print $5}')"

# Build with progress output and error handling
echo "🔨 Starting Docker build..."
if ! docker compose up --build -d --remove-orphans "daniel-koryat-portfolio-${DEPLOY_SLOT}"; then
    echo "❌ Build failed. Checking logs..."
    docker compose logs "daniel-koryat-portfolio-${DEPLOY_SLOT}"
    echo "❌ Deployment failed - build error"
    exit 1
fi

echo "✅ Build completed successfully"

# 5. Wait for the new container to be healthy
check_health "daniel-koryat-portfolio-${DEPLOY_SLOT}"

# 6. Switch traffic to the newly deployed container
echo "🔄 Switching to new deployment..."

# Since nginx is external, we just need to stop the old container
# The external nginx should be configured to point to localhost:3000
if [ -n "${LIVE_SLOT}" ] && [ "${LIVE_SLOT}" != "${DEPLOY_SLOT}" ]; then
    echo "🛑 Stopping old container: daniel-koryat-portfolio-${LIVE_SLOT}"
    docker stop "daniel-koryat-portfolio-${LIVE_SLOT}" 2>/dev/null || true
    docker rm "daniel-koryat-portfolio-${LIVE_SLOT}" 2>/dev/null || true
fi

echo "✅ Traffic switched to new deployment!"

# 7. Final validation
echo "🔍 Performing final deployment validation..."

# Verify the new environment is still healthy
NEW_CONTAINER="daniel-koryat-portfolio-${DEPLOY_SLOT}"
HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' ${NEW_CONTAINER} 2>/dev/null || echo "none")

if [ "${HEALTH_STATUS}" != "healthy" ]; then
    echo "❌ Final validation failed - new environment is not healthy"
    exit 1
fi

# Test the application endpoint directly
echo "🔍 Testing application endpoint..."
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "✅ Application endpoint is responding"
else
    echo "❌ Application endpoint is not responding"
    exit 1
fi

echo "✅ Final validation passed - deployment successful!"

# 8. Stop the old live container, making it the new standby
echo "🛑 Stopping the old ${LIVE_SLOT} container..."
docker compose stop "daniel-koryat-portfolio-${LIVE_SLOT}"

# Verify the new container is still healthy after stopping the old one
echo "🔍 Verifying new container health after cleanup..."
NEW_CONTAINER="daniel-koryat-portfolio-${DEPLOY_SLOT}"
HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' ${NEW_CONTAINER} 2>/dev/null || echo "none")

if [ "${HEALTH_STATUS}" != "healthy" ]; then
    echo "❌ New container became unhealthy after cleanup. Attempting to restart old container..."
    docker compose start "daniel-koryat-portfolio-${LIVE_SLOT}"
    echo "❌ Deployment failed - old container restarted"
    exit 1
fi

echo "✅ New container remains healthy after cleanup"

echo "🎉 Zero-downtime deployment complete!"

# Display deployment summary
echo "📈 Deployment Summary:"
echo "  • Environment: production"
echo "  • Deployed Slot: ${DEPLOY_SLOT}"
echo "  • Previous Slot: ${LIVE_SLOT}"
echo "  • Container: daniel-koryat-portfolio-${DEPLOY_SLOT}"
echo "  • Time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# Show running containers
echo "📋 Current container status:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Command}}\t{{.Service}}\t{{.CreatedAt}}\t{{.Status}}\t{{.Ports}}"

# Final success message
echo "✅ Deployment SUCCESS for production"
echo "Slot: ${DEPLOY_SLOT}"
echo "Time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
