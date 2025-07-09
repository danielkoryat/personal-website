import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export const metadata: Metadata = {
  title: "Daniel Koryat - Backend Web Developer & AWS Cloud Specialist",
  description:
    "Backend Web Developer specializing in Python/FastAPI, AWS cloud services, and AI/ML systems. Currently developing AI-powered backend platforms with microservices architecture.",
  keywords: [
    "Backend Developer",
    "Python",
    "FastAPI",
    "AWS",
    "AI/ML",
    "Microservices",
    "Toronto",
  ],
  authors: [{ name: "Daniel Koryat" }],
  creator: "Daniel Koryat",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://danielkoryat.com",
    title: "Daniel Koryat - Backend Web Developer & AWS Cloud Specialist",
    description:
      "Backend Web Developer specializing in Python/FastAPI, AWS cloud services, and AI/ML systems.",
    siteName: "Daniel Koryat Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daniel Koryat - Backend Web Developer & AWS Cloud Specialist",
    description:
      "Backend Web Developer specializing in Python/FastAPI, AWS cloud services, and AI/ML systems.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
