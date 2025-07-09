# Self-Hosted Deployment Guide

This guide covers deploying Daniel Koryat's portfolio website on a self-hosted Linux server using Docker and GitHub Actions.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (80/443)│────│  Next.js App    │────│   GitHub Actions│
│   (Reverse Proxy)│    │   (Port 3000)   │    │   (Self-hosted) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

### Server Requirements
- Linux server (Ubuntu 20.04+ recommended)
- Docker and Docker Compose installed
- Git installed
- Ports 80, 443, and 8080 available
- GitHub Actions self-hosted runner configured

### Software Installation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Logout and login again for Docker group changes
```

## 🚀 Initial Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd personal-website
```

### 2. Setup SSL Certificates
```bash
# Make script executable
chmod +x scripts/setup-ssl.sh

# Generate self-signed certificates (for testing)
./scripts/setup-ssl.sh

# For production, replace with Let's Encrypt certificates
# sudo certbot certonly --standalone -d yourdomain.com
# cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
# cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
```

### 3. Configure GitHub Actions Runner

On your server, set up a self-hosted runner:

```bash
# Create runner directory
mkdir actions-runner && cd actions-runner

# Download runner (replace with your token from GitHub)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configure runner
./config.sh --url https://github.com/yourusername/yourrepo --token YOUR_TOKEN

# Install and start as service
sudo ./svc.sh install
sudo ./svc.sh start
```

## 🔧 Configuration

### Environment Variables
Create `.env` file (optional):
```bash
# .env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Custom Domain (Optional)
If using a custom domain:

1. Update `nginx.conf`:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

2. Update DNS records to point to your server IP

3. Use Let's Encrypt for SSL certificates

## 🚀 Deployment

### Manual Deployment
```bash
# Build and start containers
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Automated Deployment (Recommended)
1. Push changes to `main` branch
2. GitHub Actions will automatically deploy to your server
3. Monitor deployment in GitHub Actions tab

## 📊 Monitoring

### Health Checks
```bash
# Check application health
curl http://localhost/health

# Check container status
docker compose ps

# View logs
docker compose logs portfolio
docker compose logs nginx
```

### Performance Monitoring
```bash
# Check resource usage
docker stats

# Monitor disk space
df -h

# Check memory usage
free -h
```

## 🔒 Security

### Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### SSL Certificate Renewal (Let's Encrypt)
```bash
# Add to crontab for automatic renewal
sudo crontab -e

# Add this line (runs twice daily)
0 12 * * * /usr/bin/certbot renew --quiet && docker compose restart nginx
```

## 🛠️ Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check logs
docker compose logs portfolio

# Check if port is in use
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

**SSL certificate issues:**
```bash
# Test SSL configuration
openssl s_client -connect localhost:443 -servername localhost

# Check certificate validity
openssl x509 -in ssl/cert.pem -text -noout
```

**Nginx configuration errors:**
```bash
# Test nginx config
docker exec portfolio-nginx nginx -t

# Reload nginx
docker exec portfolio-nginx nginx -s reload
```

### Log Locations
- Application logs: `docker compose logs portfolio`
- Nginx logs: `docker compose logs nginx`
- System logs: `/var/log/syslog`

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale the application
docker compose up -d --scale portfolio=3
```

### Load Balancer
For high traffic, consider adding a load balancer like Traefik or HAProxy.

## 🔄 Updates

### Application Updates
1. Push changes to GitHub
2. GitHub Actions automatically deploys
3. Monitor deployment logs

### System Updates
```bash
# Update Docker images
docker compose pull
docker compose up -d

# Update system packages
sudo apt update && sudo apt upgrade -y
```

## 📞 Support

For deployment issues:
- Check GitHub Actions logs
- Review container logs: `docker compose logs`
- Verify SSL certificates
- Test connectivity: `curl -I http://localhost`

## 🔗 Useful Commands

```bash
# Quick status check
docker compose ps

# View real-time logs
docker compose logs -f

# Restart services
docker compose restart

# Stop all services
docker compose down

# Clean up unused resources
docker system prune -f

# Backup data (if any)
docker compose exec portfolio tar czf backup.tar.gz /app/data
```

---

**Note:** This setup is optimized for a self-hosted environment. For production use, consider:
- Using a proper domain name
- Implementing Let's Encrypt SSL certificates
- Setting up monitoring and alerting
- Configuring automated backups
- Implementing rate limiting and DDoS protection 