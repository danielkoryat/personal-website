# Cloudflared System Service Setup

This guide explains how to set up cloudflared as a system service on your Linux Ubuntu server, replacing the Docker Compose configuration.

## Why Move to System Service?

Running cloudflared as a system service provides several advantages:
- **Shared tunnel**: Single tunnel can serve multiple repositories and services
- **Better reliability**: Automatic startup on boot and restart on failure
- **Security**: Runs with limited permissions as dedicated user
- **Performance**: No container overhead
- **Easier management**: Standard systemd service management

## Prerequisites

- Ubuntu/Debian Linux server
- sudo access
- Cloudflare tunnel token (from your tunnel configuration)

## Installation Steps

### 1. Download and Install cloudflared

```bash
# Download the latest cloudflared binary
sudo wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared

# Make it executable
sudo chmod +x /usr/local/bin/cloudflared

# Verify installation
cloudflared -v
```

### 2. Create System User

```bash
# Create a system user for cloudflared (no login access)
sudo useradd -s /usr/sbin/nologin -r -M cloudflared

# Change ownership of binary
sudo chown cloudflared:cloudflared /usr/local/bin/cloudflared
```

### 3. Configure cloudflared

Create the configuration directory and file:

```bash
# Create config directory
sudo mkdir -p /etc/cloudflared

# Create configuration file
sudo nano /etc/cloudflared/config.yml
```

Add the following configuration (replace with your actual values):

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /etc/cloudflared/YOUR_TUNNEL_ID.json
ingress:
  - hostname: your-portfolio-domain.com
    service: http://localhost:8080
  - service: http_status:404
```

### 4. Setup Tunnel Credentials

You'll need to transfer your tunnel credentials from your development machine:

```bash
# On your development machine (if you have cloudflared setup):
# scp ~/.cloudflared/YOUR_TUNNEL_ID.json daniel-koryat@192.168.0.165:/tmp/

# On the server:
sudo mv /tmp/YOUR_TUNNEL_ID.json /etc/cloudflared/
sudo chown cloudflared:cloudflared /etc/cloudflared/YOUR_TUNNEL_ID.json
sudo chmod 600 /etc/cloudflared/YOUR_TUNNEL_ID.json
```

### 5. Alternative: Token-based Configuration

If you prefer using tokens (simpler setup), create a service file with the token:

```bash
sudo nano /etc/systemd/system/cloudflared.service
```

Add the following content (replace YOUR_TUNNEL_TOKEN):

```ini
[Unit]
Description=Cloudflare Tunnel
After=syslog.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=cloudflared
Group=cloudflared
ExecStart=/usr/local/bin/cloudflared tunnel --no-autoupdate run --token YOUR_TUNNEL_TOKEN
Restart=on-failure
RestartSec=10
KillMode=process
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/log

[Install]
WantedBy=multi-user.target
```

### 6. Install and Start Service

```bash
# For config-file based setup:
sudo cloudflared service install

# For token-based setup, skip the above command since we created the service file manually

# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable cloudflared

# Start the service
sudo systemctl start cloudflared

# Check status
sudo systemctl status cloudflared
```

### 7. Verify Operation

```bash
# Check service status
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -f

# Test connectivity
curl -I https://your-domain.com
```

## DNS Configuration

If setting up a new tunnel, you'll need to configure DNS:

```bash
# Create DNS record pointing to tunnel
cloudflared tunnel route dns YOUR_TUNNEL_ID your-domain.com
```

## Managing the Service

```bash
# Start service
sudo systemctl start cloudflared

# Stop service
sudo systemctl stop cloudflared

# Restart service
sudo systemctl restart cloudflared

# Check status
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared

# Follow logs in real-time
sudo journalctl -u cloudflared -f
```

## Troubleshooting

### Common Issues

1. **Permission denied**: Ensure cloudflared user owns the binary and config files
2. **Config not found**: Verify config file path in service file
3. **Network issues**: Check firewall and network connectivity
4. **Token invalid**: Verify tunnel token is correct and not expired

### Log Locations

- Service logs: `sudo journalctl -u cloudflared`
- Systemd status: `sudo systemctl status cloudflared`

### Health Check

The updated health monitoring script now checks the system service:

```bash
# Manual health check
systemctl is-active --quiet cloudflared && echo "Running" || echo "Not running"
```

## Security Considerations

- The service runs as a non-privileged user
- No login access for the cloudflared user
- Protected system directories
- Minimal file system access

## Migration Notes

After setting up the system service:

1. **Remove old Docker Compose references**: Already removed from docker-compose.yml
2. **Update deployment scripts**: Already updated to remove cloudflared deployment
3. **Update monitoring**: Health monitoring now checks system service
4. **Environment cleanup**: CLOUDFLARED_TOKEN no longer needed in compose environment

## Next Steps

1. Set up the system service using this guide
2. Test connectivity to ensure everything works
3. Remove CLOUDFLARE_TUNNEL_TOKEN secret from GitHub if no longer needed
4. Consider setting up log rotation for cloudflared logs if needed

For additional configuration options, refer to the [official Cloudflare documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/local-management/as-a-service/linux/). 