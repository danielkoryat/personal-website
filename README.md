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

## Use This as Your Own Self-Hosted Template

You can fork this repo and use it as a starting point for your own self-hosted portfolio or personal site. All configuration is handled via environment variables and simple JSON files.

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/danielkoryat/personal-website.git
   cd personal-website
   ```
2. **Edit your content**
   - Update `data/site-config.json` with your info, experience, and projects.
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

- The included GitHub Actions workflow (`.github/workflows/deploy.yml`) automates:
  - Building the site
  - Deploying to a new Docker container (blue/green)
  - Switching Nginx upstreams with zero downtime
  - Stopping the old container

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