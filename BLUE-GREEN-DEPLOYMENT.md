# Zero-Downtime Blue-Green Deployment Guide

This guide explains how to set up and use the zero-downtime blue-green deployment system for your portfolio application.

## Overview

The blue-green deployment strategy ensures zero downtime by maintaining two identical production environments (blue and green). Only one environment serves live traffic at any time, while the other remains idle or is updated with new code.

## Key Features

- **Zero Downtime**: Seamless switching between blue and green environments
- **Automatic Rollback**: Fails back to the previous version if health checks fail
- **Health Monitoring**: Continuous monitoring with automatic recovery
- **Auto-Restart**: Systemd services ensure the application restarts after server reboots
- **Cloudflare Tunnel Compatible**: Works with Cloudflare tunnels pointing to localhost:80

## Architecture

```
Cloudflare Tunnel → localhost:80 → Nginx → Blue/Green Containers
                                   ↓
                              Health Monitor
```

## Files Structure

```
.
├── docker-compose.yml              # Blue-green container configuration
├── nginx.conf                      # Nginx load balancer configuration
├── scripts/
│   ├── deploy-blue-green.sh       # Main deployment script
│   ├── health-monitor.sh          # Health monitoring script
│   ├── setup-server.sh            # Server setup script
│   └── portfolio-app.service      # Systemd service file
└── BLUE-GREEN-DEPLOYMENT.md       # This documentation
```

## Quick Start

### 1. Server Setup (Run on your Linux server)

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/your-username/personal-website/main/scripts/setup-server.sh -o setup-server.sh
sudo chmod +x setup-server.sh
sudo ./setup-server.sh
```

### 2. Manual Setup (Alternative)

If you prefer manual setup:

```bash
# 1. Copy files to your server
scp -r . user@your-server:/opt/portfolio/

# 2. Make scripts executable
chmod +x scripts/*.sh

# 3. Install systemd service
sudo cp scripts/portfolio-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable portfolio-app.service

# 4. Start the application
sudo systemctl start portfolio-app.service
```

### 3. Deploy Updates

```bash
# Deploy new version with zero downtime
./scripts/deploy-blue-green.sh deploy

# Check deployment status
./scripts/deploy-blue-green.sh status

# Rollback if needed
./scripts/deploy-blue-green.sh rollback
```

## Detailed Setup Instructions

### Server Requirements

- Linux server (Ubuntu 18.04+ or CentOS 7+)
- Docker and Docker Compose
- Nginx (handled by Docker)
- Minimum 2GB RAM, 2 CPU cores
- Port 80 and 443 available

### Environment Configuration

1. **Update docker-compose.yml**:
   - Replace `your-domain.com` with your actual domain
   - Update environment variables as needed

2. **Update nginx.conf**:
   - Replace `your-domain.com` with your actual domain
   - Configure SSL certificate paths

3. **Update GitHub Actions**:
   - The workflow will automatically use the blue-green deployment

### Cloudflare Tunnel Configuration

1. Install Cloudflare Tunnel on your server:
   ```bash
   # Install cloudflared
   wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   
   # Authenticate
   cloudflared tunnel login
   
   # Create tunnel
   cloudflared tunnel create portfolio-app
   
   # Configure tunnel to point to localhost:80
   echo "tunnel: <YOUR_TUNNEL_ID>
   credentials-file: /home/user/.cloudflared/<YOUR_TUNNEL_ID>.json
   
   ingress:
     - hostname: your-domain.com
       service: http://localhost:80
     - service: http_status:404" > ~/.cloudflared/config.yml
   
   # Run tunnel
   cloudflared tunnel run portfolio-app
   ```

2. Set up tunnel as a service:
   ```bash
   sudo cloudflared service install
   sudo systemctl enable cloudflared
   sudo systemctl start cloudflared
   ```

## How It Works

### Blue-Green Deployment Process

1. **Current State**: One environment (e.g., blue) serves all traffic
2. **New Deployment**: Green environment is updated with new code
3. **Health Checks**: System verifies green environment is healthy
4. **Traffic Switch**: Nginx switches traffic to green environment
5. **Cleanup**: Blue environment is stopped and cleaned up

### Health Monitoring

The system continuously monitors:
- Container health status
- HTTP endpoint availability
- Resource usage
- Automatic failure recovery

### Automatic Recovery

If issues are detected:
1. Attempts to restart unhealthy containers
2. Switches to backup environment if primary fails
3. Sends alerts (email/webhook configurable)
4. Logs all events for debugging

## Usage Commands

### Deployment Script

```bash
# Deploy new version
./scripts/deploy-blue-green.sh deploy

# Check current status
./scripts/deploy-blue-green.sh status

# Rollback to previous version
./scripts/deploy-blue-green.sh rollback
```

### Health Monitor

```bash
# One-time health check
./scripts/health-monitor.sh check

# Show detailed status
./scripts/health-monitor.sh status

# Start monitoring daemon
./scripts/health-monitor.sh monitor

# Clean up logs
./scripts/health-monitor.sh cleanup
```

### System Services

```bash
# Check application service
sudo systemctl status portfolio-app.service

# Check monitoring service
sudo systemctl status portfolio-monitor.service

# Restart services
sudo systemctl restart portfolio-app.service
sudo systemctl restart portfolio-monitor.service

# View logs
sudo journalctl -u portfolio-app.service -f
sudo journalctl -u portfolio-monitor.service -f
```

## GitHub Actions Integration

The system automatically integrates with your existing GitHub Actions workflow:

```yaml
- name: Build and deploy application with zero downtime
  run: |
    # Make deployment script executable
    chmod +x scripts/deploy-blue-green.sh
    
    # Run blue-green deployment
    ./scripts/deploy-blue-green.sh deploy
    
    # Check deployment status
    ./scripts/deploy-blue-green.sh status
```

## Monitoring and Alerting

### Log Files

- Application logs: `/var/log/portfolio-health.log`
- System logs: `journalctl -u portfolio-app.service`
- Nginx logs: Docker container logs

### Health Checks

- HTTP endpoint: `http://localhost/api/health`
- Container health: Docker health checks
- Resource monitoring: CPU, memory usage

### Alerts

Configure alerts in `health-monitor.sh`:
- Email notifications
- Webhook integrations (Slack, Discord, etc.)
- Custom alert handlers

## Troubleshooting

### Common Issues

1. **Containers not starting**:
   ```bash
   # Check logs
   docker-compose logs portfolio-blue
   docker-compose logs portfolio-green
   
   # Check resources
   docker system df
   free -h
   ```

2. **Health checks failing**:
   ```bash
   # Test health endpoint
   curl -I http://localhost/api/health
   
   # Check container health
   docker inspect daniel-koryat-portfolio-blue | grep Health
   ```

3. **Nginx configuration issues**:
   ```bash
   # Test nginx config
   docker exec portfolio-nginx nginx -t
   
   # View nginx logs
   docker logs portfolio-nginx
   ```

4. **Deployment stuck**:
   ```bash
   # Check deployment status
   ./scripts/deploy-blue-green.sh status
   
   # Manual rollback
   ./scripts/deploy-blue-green.sh rollback
   ```

### Recovery Procedures

1. **Complete system failure**:
   ```bash
   # Stop all containers
   docker-compose down
   
   # Start fresh
   systemctl restart portfolio-app.service
   ```

2. **Corrupted configuration**:
   ```bash
   # Restore from backup
   tar -xzf /opt/portfolio-backups/portfolio-app-latest.tar.gz
   
   # Restart services
   systemctl restart portfolio-app.service
   ```

## Security Considerations

1. **Firewall**: Only ports 80, 443 are exposed
2. **SSL**: Automatic SSL certificate management
3. **Updates**: Regular security updates via cron jobs
4. **Monitoring**: Continuous health monitoring
5. **Backups**: Daily automated backups

## Performance Optimization

1. **Resource Limits**: Set appropriate Docker resource limits
2. **Caching**: Nginx caching for static assets
3. **Compression**: Gzip compression enabled
4. **Rate Limiting**: API rate limiting configured

## Backup and Recovery

### Automated Backups

- Daily application backups at 2 AM
- Weekly log cleanup
- 7-day retention policy

### Manual Backup

```bash
# Create backup
./scripts/backup.sh

# Restore from backup
tar -xzf /opt/portfolio-backups/portfolio-app-DATE.tar.gz
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs in `/var/log/portfolio-health.log`
3. Check system service status
4. Review GitHub Actions workflow logs

## Best Practices

1. **Testing**: Always test deployments in staging first
2. **Monitoring**: Set up proper alerting
3. **Backups**: Verify backup integrity regularly
4. **Updates**: Keep system packages updated
5. **Documentation**: Document any custom configurations

---

This zero-downtime deployment system ensures your portfolio application is always available to users, even during deployments and server maintenance. 