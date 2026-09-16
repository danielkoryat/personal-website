"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Code,
  Cloud,
  Brain,
  Monitor,
  Wrench,
  Globe,
  Shield,
  Server,
  type LucideIcon,
} from "lucide-react";
import { getSiteConfig, getSkillCategoryLabel } from "@/lib/utils";
import { SectionHeading } from "./section-heading";
import type { SkillCategory } from "@/types";

const CATEGORY_ICONS: Record<SkillCategory, LucideIcon> = {
  backend: Server,
  cloud: Cloud,
  "ai-ml": Brain,
  frontend: Monitor,
  tools: Wrench,
  languages: Globe,
};

/** Fixed display order, so the filter row doesn't reshuffle with the data. */
const CATEGORY_ORDER: SkillCategory[] = [
  "backend",
  "cloud",
  "ai-ml",
  "frontend",
  "tools",
  "languages",
];

export function Skills() {
  const config = getSiteConfig();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [active, setActive] = useState<SkillCategory | "all">("all");

  const categories = useMemo(
    () =>
      CATEGORY_ORDER.filter((category) =>
        config.skills.some((skill) => skill.category === category)
      ),
    [config.skills]
  );

  const visible = useMemo(
    () =>
      active === "all"
        ? config.skills
        : config.skills.filter((skill) => skill.category === active),
    [config.skills, active]
  );

  return (
    <section
      id="skills"
      className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 py-20 dark:from-gray-950 dark:to-gray-900 sm:py-24"
    >
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-400/15 to-blue-400/15 blur-3xl" />
      </div>

      <div className="container-width section-padding relative z-10" ref={ref}>
        <SectionHeading
          eyebrow="Toolkit"
          title="Technical Expertise"
          description="The stack I reach for across backend services, cloud infrastructure and AI systems."
          icon={Code}
          inView={inView}
        />

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Filter skills by category"
        >
          {(["all", ...categories] as const).map((category) => {
            const isActive = active === category;
            const count =
              category === "all"
                ? config.skills.length
                : config.skills.filter((s) => s.category === category).length;

            return (
              <button
                key={category}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/25"
                    : "bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:text-white"
                }`}
              >
                {category === "all" ? "All" : getSkillCategoryLabel(category)}
                <span
                  className={`ml-2 font-mono text-xs ${
                    isActive ? "text-white/70" : "text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Skill grid */}
        <motion.div
          layout
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((skill, index) => {
              const Icon = CATEGORY_ICONS[skill.category] ?? Code;

              return (
                <motion.div
                  key={skill.name}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index * 0.03, 0.3),
                  }}
                  className="group surface flex flex-col p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:hover:border-blue-600"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-[18px] w-[18px] text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {skill.name}
                    </h3>
                  </div>

                  {skill.description && (
                    <p className="flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {skill.description}
                    </p>
                  )}

                  {skill.certifications && skill.certifications.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-gray-200 pt-3 dark:border-gray-700/60">
                      <Shield className="h-3.5 w-3.5 text-amber-500" />
                      {skill.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="text-xs font-medium text-amber-700 dark:text-amber-400"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
