# Hey, I'm Daniel 👋

Welcome to my personal website! I'm a backend developer with professional experience building AI-powered systems and scalable microservices. Currently, I work at Sidekick Platform, focusing on modern cloud and AI infrastructure.

---

## About This Project

This website is more than just a portfolio—it's a full-stack, production-grade template for anyone who wants to self-host their own personal website on their own server. The architecture is designed for reliability, scalability, and easy DevOps automation.

### Tech Stack & Architecture

- **Frontend & Backend:** Next.js 14 (App Router, TypeScript)
- **Styling:** TailwindCSS, Framer Motion for animations
- **Email:** Nodemailer (contact form, no third-party SaaS required)
- **Data:** JSON-based CMS (easy to edit, no database needed)
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (reverse proxy, blue/green deployment)
- **CI/CD:** GitHub Actions (self-hosted runner)
- **Cloudflare Tunnel:** For secure public access (no open ports required)

### How the Server Runs

- The site is built and deployed using Docker Compose.
- Nginx handles HTTPS, reverse proxy, and zero-downtime blue/green deployments.
- A self-hosted GitHub Actions runner on your server automates deployments on every push to `main`.
- Cloudflare Tunnel exposes your site securely to the internet, even behind NAT/firewall.

---

## Content Management

The website uses a simple JSON-based content management system for easy updates:

### How to Update Content:
1. **Edit the configuration file** at `data/site-config.json`
2. **Update your skills, experience, and other content** directly in the JSON file
3. **Push changes to trigger automatic deployment** via the CI/CD pipeline

### Content Structure:
- Skills and expertise with categories and certifications
- Professional experience with detailed descriptions
- Contact information and personal details
- All content is version-controlled and easily maintainable

---

## CI/CD Pipeline

The project uses a comprehensive CI/CD pipeline with separate workflows:

### 🔍 CI/CD Pipeline (`.github/workflows/deploy.yml`)
**Triggers:** Push to main, Pull requests, Manual dispatch

**Jobs:**
1. **Continuous Integration**
   - Code checkout and Node.js setup
   - Dependency installation
   - Type checking and linting
   - Application build
   - Security scanning (on main branch)

2. **Deployment** (main branch only)
   - Blue/green deployment to home server
   - Health checks and validation
   - Email notifications on completion

### 🔧 Scheduled Maintenance (`.github/workflows/scheduled-maintenance.yml`)
**Triggers:** Weekly schedule (Sundays 2 AM UTC), Manual dispatch

**Tasks:**
- Docker system cleanup
- Log rotation
- System health monitoring
- Resource usage reporting

---

## Use This as Your Own Self-Hosted Template

You can fork this repo and use it as a starting point for your own self-hosted portfolio or personal site. All configuration is handled via environment variables and simple JSON files.

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/danielkoryat/personal-website.git
   cd personal-website
   ```
2. **Edit your content**
   - Update `data/site-config.json` with your info, experience, and skills.
   - All content is managed through simple JSON configuration files.
3. **Set up environment variables**
   - Create a `.env.local` for local dev, or use GitHub Secrets for production:
     - `EMAIL_USER` (Gmail address for contact form)
     - `EMAIL_PASS` (Gmail app password)
     
4. **Build and run locally**
   ```bash
   npm install
   npm run dev
   # or use Docker:
   docker compose up --build
   ```
5. **Set up your self-hosted server**
   - Install Docker, Docker Compose, and a GitHub Actions runner on your server.
   - Add your secrets to your GitHub repo (Settings > Secrets > Actions).
   - Push to `main` to trigger a full blue/green deployment.

### Deployment & Blue/Green Zero Downtime

- The CI/CD pipeline automates:
  - Building and testing the site
  - Security scanning with CodeQL
  - Deploying to a new Docker container (blue/green)
  - Switching Nginx upstreams with zero downtime
  - Stopping the old container
  - Post-deployment health checks

### Why Self-Host?

- Full control over your data and deployment
- No monthly SaaS fees
- Use as a learning template for Docker, CI/CD, and modern web dev
- Easily extensible for blogs, portfolios, or even SaaS landing pages

---

## Troubleshooting & Maintenance

### Health Monitoring

The project includes several monitoring and debugging tools:

```bash
# Check service health
./scripts/health-monitor.sh

# Detailed health check with logs
./scripts/health-monitor.sh --verbose

# Manual deployment/rollback
./scripts/deploy.sh
./scripts/deploy.sh --rollback
```

### Common Issues & Solutions

**Nginx "host not found in upstream" Error:**
- **Cause:** Nginx starts before the portfolio service is ready
- **Solution:** Fixed in the updated deployment workflow - portfolio service now starts first
- **Prevention:** Proper service dependencies and health checks in docker-compose.yml

**Service Startup Order:**
- Portfolio service → Nginx → Cloudflare Tunnel
- Each service waits for the previous one to be healthy before starting

**Health Check Endpoints:**
- Application: `http://localhost:8080/health`
- Nginx: `http://localhost:8080/nginx-health`
- Use these endpoints to verify service status

### Recent Fixes (Latest Update)

1. **Fixed Deployment Order:** Portfolio service now starts before nginx to prevent upstream resolution errors
2. **Enhanced Health Checks:** Improved health check configuration with proper timeouts and retries
3. **Better Error Handling:** Added comprehensive error handling and logging in deployment scripts
4. **Rate Limiting:** Added nginx rate limiting for API endpoints and general traffic
5. **Gzip Compression:** Enabled compression for better performance
6. **Monitoring Scripts:** Added health monitoring and deployment scripts for easier troubleshooting

---

## Questions or Want to Connect?

- [LinkedIn](https://www.linkedin.com/in/daniel-koryat)
- [GitHub](https://github.com/danielkoryat)

Feel free to fork, star, or open an issue if you have questions or want to contribute! 