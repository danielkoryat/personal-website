#!/bin/bash

# Server Setup Script for Zero-Downtime Portfolio Application
# This script sets up the entire blue-green deployment system on a fresh Linux server

set -e

# Configuration
PROJECT_NAME="daniel-koryat-portfolio"
APP_DIR="/opt/portfolio"
SERVICE_USER="portfolio"
GITHUB_REPO="https://github.com/your-username/personal-website.git"  # Update this

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

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VERSION=$VERSION_ID
    else
        error "Cannot detect operating system"
        exit 1
    fi
    
    log "Detected OS: $OS $VERSION"
}

# Function to update system
update_system() {
    log "Updating system packages..."
    
    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get upgrade -y
        apt-get install -y curl wget git unzip software-properties-common
    elif command -v yum &> /dev/null; then
        yum update -y
        yum install -y curl wget git unzip
    else
        error "Unsupported package manager"
        exit 1
    fi
    
    success "System updated successfully"
}

# Function to install Docker
install_docker() {
    if command -v docker &> /dev/null; then
        log "Docker is already installed"
        return 0
    fi
    
    log "Installing Docker..."
    
    # Install Docker using official script
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    success "Docker installed successfully"
}

# Function to create service user
create_service_user() {
    if id "$SERVICE_USER" &>/dev/null; then
        log "Service user $SERVICE_USER already exists"
    else
        log "Creating service user: $SERVICE_USER"
        useradd -r -s /bin/bash -d "$APP_DIR" "$SERVICE_USER"
        usermod -aG docker "$SERVICE_USER"
    fi
    
    # Create application directory
    mkdir -p "$APP_DIR"
    chown -R "$SERVICE_USER:$SERVICE_USER" "$APP_DIR"
    
    success "Service user created successfully"
}

# Function to setup application directory
setup_application() {
    log "Setting up application directory..."
    
    # Create necessary directories
    mkdir -p "$APP_DIR"/{ssl,letsencrypt,certbot/www,scripts,logs}
    
    # Set proper permissions
    chown -R "$SERVICE_USER:$SERVICE_USER" "$APP_DIR"
    chmod 755 "$APP_DIR"
    
    success "Application directory setup complete"
}

# Function to install application files
install_application() {
    log "Installing application files..."
    
    # Clone repository or copy files
    if [ -n "$GITHUB_REPO" ]; then
        log "Cloning repository from: $GITHUB_REPO"
        cd "$APP_DIR"
        sudo -u "$SERVICE_USER" git clone "$GITHUB_REPO" .
    else
        warning "No repository URL provided. You'll need to manually copy your application files to $APP_DIR"
    fi
    
    # Make scripts executable
    chmod +x "$APP_DIR"/scripts/*.sh
    
    success "Application files installed"
}

# Function to setup systemd service
setup_systemd_service() {
    log "Setting up systemd service..."
    
    # Update the service file with correct paths
    cat > /etc/systemd/system/portfolio-app.service << EOF
[Unit]
Description=Daniel Koryat Portfolio Application
Requires=docker.service
After=docker.service
StartLimitIntervalSec=0

[Service]
Type=oneshot
RemainAfterExit=yes
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d --remove-orphans daniel-koryat-portfolio-blue
ExecStop=/usr/local/bin/docker-compose down
ExecReload=/bin/bash -c '/usr/local/bin/docker-compose up -d --remove-orphans daniel-koryat-portfolio-blue'
TimeoutStartSec=0
Restart=on-failure
RestartSec=30

# Environment variables
Environment=COMPOSE_PROJECT_NAME=daniel-koryat-portfolio
Environment=DOCKER_BUILDKIT=1

[Install]
WantedBy=multi-user.target
EOF
    
    # Enable the service
    systemctl daemon-reload
    systemctl enable portfolio-app.service
    
    success "Systemd service setup complete"
}

# Function to setup health monitoring
setup_monitoring() {
    log "Setting up health monitoring..."
    
    # Create monitoring service
    cat > /etc/systemd/system/portfolio-monitor.service << EOF
[Unit]
Description=Portfolio Application Health Monitor
After=portfolio-app.service
Requires=portfolio-app.service

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/scripts/health-monitor.sh monitor
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF
    
    # Create log rotation for monitoring
    cat > /etc/logrotate.d/portfolio-monitor << EOF
/var/log/portfolio-health.log {
    weekly
    rotate 4
    compress
    delaycompress
    missingok
    notifempty
    create 644 $SERVICE_USER $SERVICE_USER
}
EOF
    
    # Enable monitoring service
    systemctl daemon-reload
    systemctl enable portfolio-monitor.service
    
    success "Health monitoring setup complete"
}

# Note: Nginx configuration has been moved to a separate service on the server

# Function to setup firewall
setup_firewall() {
    log "Setting up firewall..."
    
    if command -v ufw &> /dev/null; then
        # Ubuntu/Debian UFW
        ufw --force enable
        ufw allow ssh
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 3000/tcp  # For direct application access
        ufw reload
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS/RHEL firewalld
        systemctl start firewalld
        systemctl enable firewalld
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --permanent --add-port=3000/tcp
        firewall-cmd --reload
    else
        warning "No supported firewall found. Please configure firewall manually."
    fi
    
    success "Firewall setup complete"
}

# Function to create maintenance scripts
create_maintenance_scripts() {
    log "Creating maintenance scripts..."
    
    # Create backup script
    cat > "$APP_DIR/scripts/backup.sh" << 'EOF'
#!/bin/bash
# Backup script for portfolio application

BACKUP_DIR="/opt/portfolio-backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# Backup application files
tar -czf "$BACKUP_DIR/portfolio-app-$DATE.tar.gz" -C /opt/portfolio . --exclude='node_modules' --exclude='.git'

# Backup Docker images
docker save daniel-koryat-portfolio-blue daniel-koryat-portfolio-green | gzip > "$BACKUP_DIR/portfolio-images-$DATE.tar.gz"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "portfolio-*" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/portfolio-app-$DATE.tar.gz"
EOF
    
    # Create log cleanup script
    cat > "$APP_DIR/scripts/cleanup-logs.sh" << 'EOF'
#!/bin/bash
# Log cleanup script

# Clean Docker logs
docker system prune -f --volumes
docker container prune -f
docker image prune -f

# Clean application logs
find /var/log -name "*.log" -mtime +30 -delete

echo "Log cleanup completed"
EOF
    
    # Make scripts executable
    chmod +x "$APP_DIR/scripts/backup.sh"
    chmod +x "$APP_DIR/scripts/cleanup-logs.sh"
    
    # Setup cron jobs
    cat > /tmp/portfolio-cron << EOF
# Daily backup at 2 AM
0 2 * * * $APP_DIR/scripts/backup.sh
# Weekly log cleanup on Sunday at 3 AM
0 3 * * 0 $APP_DIR/scripts/cleanup-logs.sh
# Health check every 5 minutes
*/5 * * * * $APP_DIR/scripts/health-monitor.sh check
EOF
    
    crontab -u "$SERVICE_USER" /tmp/portfolio-cron
    rm /tmp/portfolio-cron
    
    success "Maintenance scripts created"
}

# Function to start services
start_services() {
    log "Starting services..."
    
    # Start the application
    systemctl start portfolio-app.service
    
    # Wait a bit for containers to start
    sleep 30
    
    # Start monitoring
    systemctl start portfolio-monitor.service
    
    success "Services started successfully"
}

# Function to display final information
display_final_info() {
    echo
    success "=== Server Setup Complete ==="
    echo
    echo "Your zero-downtime portfolio application is now set up!"
    echo
    echo "Next steps:"
    echo "1. Configure your external nginx service to point to localhost:3000"
    echo "2. Configure SSL certificates using: $APP_DIR/scripts/setup-ssl.sh"
    echo "3. Deploy your application: $APP_DIR/scripts/deploy-blue-green.sh deploy"
    echo "4. Check status: $APP_DIR/scripts/deploy-blue-green.sh status"
    echo "5. Monitor health: $APP_DIR/scripts/health-monitor.sh status"
    echo
    echo "Important paths:"
    echo "- Application directory: $APP_DIR"
    echo "- Deployment script: $APP_DIR/scripts/deploy-blue-green.sh"
    echo "- Health monitor: $APP_DIR/scripts/health-monitor.sh"
    echo "- Logs: /var/log/portfolio-health.log"
    echo
    echo "Services:"
    echo "- Application: systemctl status portfolio-app.service"
    echo "- Monitor: systemctl status portfolio-monitor.service"
    echo
    echo "To connect with Cloudflare tunnel:"
    echo "- Point your tunnel to: localhost:3000"
    echo "- The application will be available through the tunnel"
    echo
}

# Main installation function
main() {
    log "Starting server setup for zero-downtime portfolio application..."
    
    check_root
    detect_os
    update_system
    install_docker
    create_service_user
    setup_application
    install_application
    setup_systemd_service
    setup_monitoring
    setup_firewall
    create_maintenance_scripts
    start_services
    display_final_info
    
    success "Server setup completed successfully!"
}

# Run main function
main "$@" 