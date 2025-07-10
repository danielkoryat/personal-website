#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

# Function to check the health of a container
check_health() {
  local container_name=$1
  echo "🔍 Waiting for ${container_name} to become healthy..."
  for i in {1..30}; do
    HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' ${container_name} 2>/dev/null || echo "starting")
    if [ "${HEALTH_STATUS}" == "healthy" ]; then
      echo "✅ ${container_name} is healthy!"
      return 0
    fi
    echo "   - Still waiting... (Status: ${HEALTH_STATUS})"
    sleep 10
  done
  echo "❌ ${container_name} failed to become healthy. Aborting deployment."
  docker compose logs ${container_name}
  exit 1
}

# 1. Ensure Nginx and Cloudflared are running
echo "🌐 Ensuring core services (nginx, cloudflared) are up..."
docker compose up -d nginx cloudflared

# 2. Determine which environment is live and which is the target for deployment
# We check which server is active in active_upstream.conf
if grep -q "daniel-koryat-portfolio-blue" active_upstream.conf; then
    LIVE_SLOT="blue"
    DEPLOY_SLOT="green"
else
    LIVE_SLOT="green"
    DEPLOY_SLOT="blue"
fi

echo "🚀 Starting deployment..."
echo "  - Live Environment: ${LIVE_SLOT}"
echo "  - Deploying To: ${DEPLOY_SLOT}"

# 3. Build and deploy the new version to the standby slot
echo "🔨 Building and deploying the ${DEPLOY_SLOT} container..."
docker compose up --build -d "daniel-koryat-portfolio-${DEPLOY_SLOT}"

# 4. Wait for the new container to be healthy
check_health "daniel-koryat-portfolio-${DEPLOY_SLOT}"

# 5. Switch Nginx traffic to the newly deployed container
echo "🔄 Switching Nginx traffic to ${DEPLOY_SLOT}..."
# Backup current config
cp active_upstream.conf active_upstream.conf.backup

# Atomically switch the upstream
echo "set \$active_upstream daniel-koryat-portfolio-${DEPLOY_SLOT}:3000;" > active_upstream.conf

# Gracefully reload Nginx to apply the new configuration with zero downtime
docker compose exec nginx nginx -s reload
echo "✅ Traffic switched successfully."

# 6. Stop the old live container, making it the new standby
echo "🛑 Stopping the old ${LIVE_SLOT} container..."
docker compose stop "daniel-koryat-portfolio-${LIVE_SLOT}"

echo "🎉 Deployment complete. ${DEPLOY_SLOT} is now the live environment."
