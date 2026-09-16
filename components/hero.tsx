"use client";

import { motion } from "framer-motion";
import { Download, Mail, ChevronDown, Github, Linkedin, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar } from "./avatar";
import { getSiteConfig, getYearsOfExperience } from "@/lib/utils";
import { useResumeDownload } from "@/lib/use-resume-download";

const FLOATING_BADGES = [
  { label: "Py", position: "-right-3 top-4", color: "bg-blue-500", delay: 0 },
  {
    label: "AWS",
    position: "-left-4 bottom-6",
    color: "bg-orange-500",
    delay: 0.6,
  },
  {
    label: "AI",
    position: "-right-6 top-1/2",
    color: "bg-emerald-500",
    delay: 1.2,
  },
];

export function Hero() {
  const config = getSiteConfig();
  const { download, pending, error } = useResumeDownload();

  const years = getYearsOfExperience(config.experience);
  const stats = [
    { value: `${years}+`, label: "Years shipping backends" },
    {
      value: `${config.skills.filter((s) => s.category === "cloud").length}`,
      label: "AWS services in production",
    },
    { value: `${config.projects?.length ?? 0}`, label: "Featured projects" },
  ].filter((stat) => stat.value !== "0");

  const scrollToSection = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-24 pb-16 sm:pt-28">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute left-4 top-20 h-56 w-56 rounded-full bg-blue-400 opacity-20 mix-blend-multiply blur-3xl animate-blob sm:h-72 sm:w-72 sm:left-10 dark:opacity-25 dark:mix-blend-normal" />
        <div className="absolute right-4 top-40 h-56 w-56 rounded-full bg-purple-400 opacity-20 mix-blend-multiply blur-3xl animate-blob [animation-delay:6s] sm:h-72 sm:w-72 sm:right-10 dark:opacity-25 dark:mix-blend-normal" />
        <div className="absolute -bottom-8 left-1/3 h-56 w-56 rounded-full bg-pink-400 opacity-20 mix-blend-multiply blur-3xl animate-blob [animation-delay:12s] sm:h-72 sm:w-72 dark:opacity-20 dark:mix-blend-normal" />
        {/* Subtle grid to read as "engineering" rather than "gradient soup" */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.gray.900/0.04)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.gray.900/0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] dark:bg-[linear-gradient(to_right,theme(colors.gray.100/0.05)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.gray.100/0.05)_1px,transparent_1px)]" />
      </div>

      <div className="container-width section-padding">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* Text column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="order-2 text-center lg:order-1 lg:text-left"
          >
            {/* Availability pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {config.availability ?? "Open to backend & platform roles"}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
            >
              <span className="gradient-text">{config.name}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="mt-3 text-lg font-medium text-gray-700 dark:text-gray-300 sm:text-xl md:text-2xl"
            >
              {config.title}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-400 lg:mx-0 sm:text-lg"
            >
              {config.intro}
            </motion.p>

            {/* Location + socials */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 lg:justify-start"
            >
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {config.contact.location}
              </span>
              {config.contact.githubUrl && (
                <a
                  href={config.contact.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-900 dark:hover:text-white"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              )}
              {config.contact.linkedinUrl && (
                <a
                  href={config.contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Button
                onClick={() => scrollToSection("#contact")}
                size="lg"
                className="group w-full sm:w-auto"
              >
                <Mail className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                Get in Touch
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="group w-full sm:w-auto"
                onClick={() => download("pdf")}
                disabled={pending !== null}
              >
                <Download className="mr-2 h-5 w-5 transition-transform group-hover:translate-y-0.5" />
                {pending === "pdf" ? "Preparing…" : "Download Resume"}
              </Button>
            </motion.div>

            {error && (
              <p
                role="status"
                className="mt-3 text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </p>
            )}

            {/* Derived stats — all computed from site-config, never hard-coded */}
            {stats.length > 0 && (
              <motion.dl
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.7 }}
                className="mt-10 grid grid-cols-3 gap-4 border-t border-gray-200 pt-6 dark:border-gray-800"
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <span className="block font-mono text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                        {stat.value}
                      </span>
                      <span className="mt-1 block text-xs leading-tight text-gray-500 dark:text-gray-400">
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </motion.dl>
            )}
          </motion.div>

          {/* Portrait column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="relative mx-auto h-64 w-64 sm:h-80 sm:w-80">
              {/* Conic ring behind the portrait */}
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-full bg-[conic-gradient(from_180deg,theme(colors.blue.500),theme(colors.purple.500),theme(colors.pink.500),theme(colors.blue.500))] opacity-70 blur-[2px]"
              />
              <div className="absolute inset-0 overflow-hidden rounded-full bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-900">
                <Avatar
                  src={config.avatar}
                  name={config.name}
                  size={320}
                  priority
                />
              </div>

              {FLOATING_BADGES.map((badge) => (
                <motion.div
                  key={badge.label}
                  animate={{ y: [0, -9, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: badge.delay,
                    ease: "easeInOut",
                  }}
                  className={`absolute ${badge.position} rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-bold text-white ${badge.color}`}
                  >
                    {badge.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-14 flex justify-center lg:mt-10"
        >
          <motion.button
            onClick={() => scrollToSection("#skills")}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="touch-target rounded-full text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Scroll to skills section"
          >
            <ChevronDown size={24} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
