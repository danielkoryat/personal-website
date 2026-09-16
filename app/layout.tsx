import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getSiteConfig, SITE_URL } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const config = getSiteConfig();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom stays enabled: locking it fails WCAG 1.4.4 and hurts anyone
  // who needs to magnify text.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
};

const pageTitle = `${config.name} — ${config.title}`;

export const metadata: Metadata = {
  // Required so relative OG/Twitter image paths resolve to absolute URLs.
  metadataBase: new URL(SITE_URL),
  title: {
    default: pageTitle,
    template: `%s | ${config.name}`,
  },
  description: config.description,
  keywords: [
    "Backend Developer",
    "Python",
    "FastAPI",
    "AWS",
    "AI/ML",
    "Microservices",
    "Terraform",
    "Toronto",
    config.name,
  ],
  authors: [{ name: config.name, url: SITE_URL }],
  creator: config.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    locale: "en_US",
    url: SITE_URL,
    title: pageTitle,
    description: config.description,
    siteName: `${config.name} — Portfolio`,
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: config.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {
    google: "google6dbd0d502889106e",
  },
};

/**
 * schema.org Person markup, so search engines and AI crawlers can read the
 * role, employer and profile links rather than inferring them from prose.
 */
function personJsonLd() {
  const currentRole = config.experience.find((job) => job.current);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: config.name,
    url: SITE_URL,
    jobTitle: currentRole?.title ?? config.title,
    description: config.description,
    email: `mailto:${config.contact.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: config.contact.location,
    },
    ...(currentRole
      ? {
          worksFor: { "@type": "Organization", name: currentRole.company },
        }
      : {}),
    knowsAbout: config.skills
      .filter((skill) => skill.category !== "languages")
      .map((skill) => skill.name),
    alumniOf: config.education.map((edu) => ({
      "@type": "EducationalOrganization",
      name: edu.institution,
    })),
    sameAs: [config.contact.githubUrl, config.contact.linkedinUrl].filter(
      Boolean
    ),
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
