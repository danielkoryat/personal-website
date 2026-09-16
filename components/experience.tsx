"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Calendar,
  MapPin,
  Building,
  Award,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { getSiteConfig, formatDate } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

/** "February 2024 — Present", or an empty string when undated. */
function dateRange(start?: string, end?: string, current?: boolean) {
  const from = formatDate(start);
  if (!from) return "";
  const to = current ? "Present" : formatDate(end);
  return to ? `${from} — ${to}` : from;
}

export function Experience() {
  const config = getSiteConfig();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section
      id="experience"
      className="bg-gray-50 py-20 dark:bg-gray-900 sm:py-24"
    >
      <div className="container-width section-padding" ref={ref}>
        <SectionHeading
          eyebrow="Career"
          title="Professional Experience"
          description="Where I've worked, what I built there, and what it runs on."
          icon={Briefcase}
          inView={inView}
        />

        {/* Timeline. The rail sits at the left on mobile and centres from md up;
            cards alternate sides on wide screens. */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[7px] top-2 w-px bg-gradient-to-b from-blue-500 via-purple-500 to-transparent md:left-1/2 md:-translate-x-1/2"
          />

          <div className="space-y-10 sm:space-y-12">
            {config.experience.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative md:flex md:items-start"
              >
                {/* Node */}
                <div className="absolute left-0 top-2 h-4 w-4 rounded-full border-4 border-gray-50 bg-blue-500 shadow dark:border-gray-900 md:left-1/2 md:-translate-x-1/2" />

                <div
                  className={`ml-8 md:ml-0 md:w-1/2 ${
                    index % 2 === 0
                      ? "md:pr-10"
                      : "md:ml-auto md:pl-10"
                  }`}
                >
                  <div className="surface p-5 shadow-lg transition-shadow hover:shadow-xl sm:p-7">
                    <div className="mb-5">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                          {job.title}
                        </h3>
                        {job.current && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Current
                          </span>
                        )}
                      </div>

                      <dl className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <dt className="sr-only">Company</dt>
                          <Building className="mr-2 h-4 w-4 flex-shrink-0" />
                          <dd className="font-medium">{job.company}</dd>
                        </div>
                        <div className="flex items-center">
                          <dt className="sr-only">Location</dt>
                          <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                          <dd>{job.location}</dd>
                        </div>
                        <div className="flex items-center">
                          <dt className="sr-only">Dates</dt>
                          <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                          <dd>
                            {dateRange(job.startDate, job.endDate, job.current)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <p className="mb-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300 sm:text-base">
                      {job.description}
                    </p>

                    <div className="mb-5">
                      <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Technologies
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {job.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-md bg-blue-50 px-2.5 py-1 font-mono text-xs text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2.5 flex items-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        <Award className="mr-1.5 h-4 w-4 flex-shrink-0" />
                        Key Achievements
                      </h4>
                      <ul className="space-y-2">
                        {job.achievements.map((achievement) => (
                          <li
                            key={achievement}
                            className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                          >
                            <span className="mr-2.5 mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                            <span className="leading-relaxed">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Education & certifications */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20"
        >
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-600/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
              <span className="gradient-text">Education & Training</span>
            </h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {config.education.map((edu, index) => {
              const range = dateRange(edu.startDate, edu.endDate);

              return (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="surface flex flex-col p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <h4 className="text-base font-semibold leading-snug text-gray-900 dark:text-white">
                    {edu.degree}
                  </h4>
                  <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                    {edu.institution}
                  </p>
                  {/* Self-paced certifications carry no dates — omit the line
                      entirely rather than rendering an empty range. */}
                  {range && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {range}
                    </p>
                  )}

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {edu.description}
                  </p>

                  {edu.certifications && edu.certifications.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {edu.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
