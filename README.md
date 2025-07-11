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

## Admin Panel Access

The website includes a built-in admin panel for content management:

### How to Access:
1. **Navigate to the website** in your browser
2. **Look for the floating edit button** (pencil icon) in the bottom-right corner
3. **Click the edit button** to open the admin panel
4. **Edit content** directly in the interface (currently view-only in this version)

### Admin Panel Features:
- View and manage skills, experience, and other content
- Real-time preview of changes
- Clean, intuitive interface for content management

*Note: The admin panel is currently in view-only mode. Future versions will include full editing capabilities.*

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
   - Use the admin panel (floating edit button) for easy content management.
3. **Set up environment variables**
   - Create a `.env.local` for local dev, or use GitHub Secrets for production:
     - `EMAIL_USER` (Gmail address for contact form)
     - `EMAIL_PASS` (Gmail app password)
     - `CLOUDFLARED_TOKEN` (Cloudflare Tunnel token)
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

## Questions or Want to Connect?

- [LinkedIn](https://www.linkedin.com/in/daniel-koryat)
- [GitHub](https://github.com/danielkoryat)

Feel free to fork, star, or open an issue if you have questions or want to contribute! 