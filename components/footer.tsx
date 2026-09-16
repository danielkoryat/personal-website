"use client";

import { Github, Linkedin, Mail, ArrowUp } from "lucide-react";
import { getSiteConfig } from "@/lib/utils";

export function Footer() {
  const config = getSiteConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white py-10 dark:border-gray-800 dark:bg-gray-950">
      <div className="container-width section-padding">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-base font-bold gradient-text">{config.name}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {config.title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`mailto:${config.contact.email}`}
              className="touch-target rounded-lg text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              aria-label="Email Daniel"
            >
              <Mail className="h-5 w-5" />
            </a>
            {config.contact.githubUrl && (
              <a
                href={config.contact.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-target rounded-lg text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                aria-label="GitHub profile"
              >
                <Github className="h-5 w-5" />
              </a>
            )}
            {config.contact.linkedinUrl && (
              <a
                href={config.contact.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-target rounded-lg text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                aria-label="LinkedIn profile"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="touch-target rounded-lg text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              aria-label="Back to top"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {year} {config.name}. Built with Next.js and Tailwind, self-hosted
            with Docker.
          </p>
        </div>
      </div>
    </footer>
  );
}
