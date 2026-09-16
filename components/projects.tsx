"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowUpRight, Github, Rocket, Check } from "lucide-react";
import { getSiteConfig } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

export function Projects() {
  const config = getSiteConfig();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const projects = config.projects ?? [];

  // Nothing to show until projects are added to site-config.json.
  if (projects.length === 0) return null;

  return (
    <section
      id="projects"
      className="relative overflow-hidden bg-white py-20 dark:bg-gray-950 sm:py-24"
    >
      <div className="container-width section-padding" ref={ref}>
        <SectionHeading
          eyebrow="Selected work"
          title="Projects"
          description="Systems I've designed, built and run in production — not tutorials."
          icon={Rocket}
          inView={inView}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {projects.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`group surface flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8 ${
                project.featured ? "lg:col-span-2" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                    {project.tagline}
                  </p>
                </div>

                <div className="flex flex-shrink-0 gap-1">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="touch-target rounded-lg text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      aria-label={`${project.name} source code on GitHub`}
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="touch-target rounded-lg text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      aria-label={`Visit ${project.name}`}
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
                {project.description}
              </p>

              {project.highlights && project.highlights.length > 0 && (
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {project.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      <span className="leading-snug">{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-200 pt-5 dark:border-gray-700/60">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
