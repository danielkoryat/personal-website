"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  inView: boolean;
}

/**
 * Shared heading for every top-level section, so the rhythm and type scale
 * stay identical across Skills, Experience, Projects and Contact.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  icon: Icon,
  inView,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="mb-12 text-center sm:mb-16"
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-600/20"
        >
          <Icon className="h-7 w-7 text-white" />
        </motion.div>
      )}

      {eyebrow && (
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
          {eyebrow}
        </p>
      )}

      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        <span className="gradient-text">{title}</span>
      </h2>

      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
          {description}
        </p>
      )}
    </motion.div>
  );
}
