# Daniel Koryat - Personal Portfolio

A modern, responsive personal website built with Next.js, TypeScript, and TailwindCSS. Features a clean design, smooth animations, and easy content management through JSON-based CMS.

## 🚀 Features

- **Modern Design**: Clean, professional design with dark/light mode support
- **Responsive**: Fully responsive across all devices
- **Animations**: Smooth scroll-triggered animations using Framer Motion
- **Content Management**: Easy-to-update JSON-based CMS
- **SEO Optimized**: Meta tags, Open Graph, and structured data
- **Performance**: Optimized for speed with Next.js Image optimization
- **Accessibility**: ARIA labels and keyboard navigation support

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Theme**: Next-themes for dark/light mode
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── header.tsx        # Navigation header
│   ├── hero.tsx          # Hero section
│   ├── skills.tsx        # Skills showcase
│   ├── experience.tsx    # Experience timeline
│   ├── projects.tsx      # Projects gallery
│   └── contact.tsx       # Contact form
├── data/                 # Content management
│   └── site-config.json  # Main content file
├── lib/                  # Utility functions
│   └── utils.ts          # Helper functions
├── types/                # TypeScript definitions
│   └── index.ts          # Type interfaces
└── public/               # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd personal-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Content Management

### Updating Personal Information

Edit `data/site-config.json` to update:

- **Personal Details**: Name, title, subtitle, intro
- **Contact Information**: Email, phone, location, social links
- **Skills**: Add/remove skills with proficiency levels
- **Experience**: Update job history and achievements
- **Projects**: Add new projects with descriptions and links
- **Education**: Update education and certifications

### Example: Adding a New Skill

```json
{
  "name": "New Technology",
  "category": "backend",
  "proficiency": 85,
  "yearsOfExperience": 2,
  "description": "Description of the skill",
  "certifications": ["Certification Name"]
}
```

### Example: Adding a New Project

```json
{
  "id": "unique-project-id",
  "title": "Project Title",
  "description": "Short description",
  "longDescription": "Detailed project description",
  "imageUrl": "https://images.unsplash.com/...",
  "technologies": ["Tech1", "Tech2"],
  "githubUrl": "https://github.com/...",
  "liveUrl": "https://project-url.com",
  "featured": false,
  "category": "backend"
}
```

## 🎨 Customization

### Colors and Theme

Update `tailwind.config.js` to customize:

- **Color Palette**: Primary, secondary, and accent colors
- **Fonts**: Custom font families
- **Animations**: Custom keyframes and animations

### Styling

- **Global Styles**: Edit `app/globals.css`
- **Component Styles**: Use TailwindCSS classes in components
- **Custom CSS**: Add custom CSS in the appropriate component files

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect Next.js and deploy
   - Your site will be available at `https://your-project.vercel.app`

### Environment Variables

Create `.env.local` for local development:

```env
# Add any environment variables here
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Custom Domain

1. **Add custom domain in Vercel dashboard**
2. **Update metadata in `app/layout.tsx`**
3. **Update Open Graph URLs**

## 📱 Performance Optimization

### Images

- Use Next.js `Image` component for optimized images
- Place images in `public/` directory
- Use appropriate image formats (WebP, AVIF)

### Code Splitting

- Components are automatically code-split by Next.js
- Use dynamic imports for heavy components

### SEO

- Update meta tags in `app/layout.tsx`
- Add structured data for better search results
- Optimize images with alt text

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Prettier**: Code formatting (recommended)

### Git Workflow

1. Create feature branch
2. Make changes
3. Test locally
4. Commit with descriptive message
5. Push and create pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or support:

- **Email**: dan.koryat@gmail.com
- **Phone**: 647-947-8332
- **Location**: Toronto, ON

---

Built with ❤️ by Daniel Koryat 