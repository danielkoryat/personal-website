# Hey, I'm Daniel 👋

Welcome to my personal website! I'm a backend developer with professional experience building AI-powered systems and scalable microservices. Currently, I work at Sidekick Platform, focusing on modern cloud and AI infrastructure.

---

## About This Project

This website is more than just a portfolio—it's a full-stack, production-grade template for anyone who wants to self-host their own personal website on their own server. The architecture is designed for reliability, scalability, and easy DevOps automation.

### Tech Stack & Architecture

- **Frontend & Backend:** Next.js 14 (App Router, TypeScript)
- **Styling:** TailwindCSS with HSL design tokens, Framer Motion for animations
- **Images:** `next/image` with sharp, serving AVIF/WebP
- **Email:** Nodemailer (contact form, no third-party SaaS required)
- **Spam & abuse:** reCAPTCHA v2 + Upstash sliding-window rate limiting
- **Data:** JSON-based CMS (easy to edit, no database needed)
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (reverse proxy, blue/green deployment)
- **Deployment:** `scripts/deploy-blue-green.sh`, run on the server (no CI
  workflow is currently wired up — pushing to `main` does not deploy on its own)
- **Cloudflare Tunnel:** For secure public access (no open ports required)

---

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in the values you need
npm run dev
```

The site runs without any environment variables — the contact form disables
its reCAPTCHA widget and rate limiting logs a warning and steps aside. See
[`.env.example`](.env.example) for what each variable does.

Useful scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build (`output: standalone`) |
| `npm run test` | Type-check + lint |

---

## Content Management

All copy lives in [`data/site-config.json`](data/site-config.json) and is typed
by [`types/index.ts`](types/index.ts). Edit the JSON, push, and the CI/CD
pipeline deploys it — no component changes needed.

### What you can edit

| Key | Purpose |
| --- | --- |
| `name`, `title`, `intro` | Hero copy |
| `avatar` | Path to your portrait under `public/`. Falls back to a monogram if the file is missing. |
| `availability` | Optional green status pill in the hero. Omit the key to hide it. |
| `siteUrl` | Canonical origin for metadata, sitemap and JSON-LD |
| `skills` | Grouped by `category`, drives the filterable skills grid |
| `experience` | Timeline entries; `current: true` adds the "Current" badge |
| `education` | Degrees and certifications (dates optional) |

### Adding your photo

Drop a square portrait at `public/daniel.jpg` (roughly 800×800 is plenty) and
it appears in the hero automatically. To use a different filename, point
`avatar` in `site-config.json` at it. If the file is absent the site renders a
gradient monogram instead, so nothing breaks either way.

---

## SEO

Handled by Next.js file conventions — no manual asset management:

- `app/icon.tsx` — generated favicon
- `app/opengraph-image.tsx` — generated 1200×630 link-preview card
- `app/sitemap.ts` / `app/robots.ts` — generated `sitemap.xml` and `robots.txt`
- `app/layout.tsx` — schema.org `Person` JSON-LD, built from `site-config.json`

---

## Questions or Want to Connect?

- [LinkedIn](https://www.linkedin.com/in/daniel-koryat)
- [GitHub](https://github.com/danielkoryat)

Feel free to fork, star, or open an issue if you have questions or want to contribute!
