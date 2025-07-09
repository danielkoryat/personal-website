"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  getSiteConfig,
  getSkillCategoryColor,
  getSkillCategoryLabel,
} from "@/lib/utils";

export function Skills() {
  const config = getSiteConfig();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Group skills by category
  const skillsByCategory = config.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof config.skills>);

  const categories = Object.keys(skillsByCategory);

  return (
    <section id="skills" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Skills & Expertise</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            My technical expertise spans backend development, cloud
            infrastructure, and AI/ML systems
          </p>
        </motion.div>

        <div className="space-y-12">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div
                  className={`w-4 h-4 rounded-full ${getSkillCategoryColor(
                    category
                  )} mr-3`}
                ></div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {getSkillCategoryLabel(category)}
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {skillsByCategory[category].map((skill, skillIndex) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: 0.6,
                      delay: categoryIndex * 0.2 + skillIndex * 0.1,
                    }}
                    className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {skill.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {skill.yearsOfExperience}{" "}
                          {skill.yearsOfExperience === 1 ? "year" : "years"}
                        </span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {skill.proficiency}%
                        </span>
                      </div>
                    </div>

                    <div className="skill-bar">
                      <motion.div
                        className="skill-progress"
                        initial={{ width: 0 }}
                        animate={
                          inView ? { width: `${skill.proficiency}%` } : {}
                        }
                        transition={{
                          duration: 1.5,
                          delay: categoryIndex * 0.2 + skillIndex * 0.1 + 0.3,
                        }}
                      />
                    </div>

                    {skill.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {skill.description}
                      </p>
                    )}

                    {skill.certifications &&
                      skill.certifications.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {skill.certifications.map((cert) => (
                              <span
                                key={cert}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              >
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Skills summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Core Competencies
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {config.skills.filter((s) => s.category === "backend").length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Backend</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {config.skills.filter((s) => s.category === "cloud").length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Cloud & DevOps
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {config.skills.filter((s) => s.category === "ai-ml").length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">AI/ML</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {
                    config.skills.filter((s) => s.category === "frontend")
                      .length
                  }
                </div>
                <div className="text-gray-600 dark:text-gray-400">Frontend</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
