"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  getSiteConfig,
  getSkillCategoryColor,
  getSkillCategoryLabel,
} from "@/lib/utils";
import {
  Code,
  Cloud,
  Brain,
  Monitor,
  Wrench,
  Globe,
  Star,
  Shield,
  Database,
  Server,
} from "lucide-react";

const categoryIcons = {
  backend: Server,
  cloud: Cloud,
  "ai-ml": Brain,
  frontend: Monitor,
  tools: Wrench,
  languages: Globe,
};



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
    <section
      id="skills"
      className="py-20 sm:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6"
          >
            <Code className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Technical Expertise
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Mastery across full-stack development, cloud infrastructure, and
            cutting-edge AI/ML technologies
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="space-y-12">
          {categories.map((category, categoryIndex) => {
            const IconComponent =
              categoryIcons[category as keyof typeof categoryIcons] || Code;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: categoryIndex * 0.15 }}
                className="group"
              >
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                  {/* Category Header */}
                  <div className="flex items-center mb-8">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {getSkillCategoryLabel(category)}
                      </h3>
                      <div className="flex items-center mt-1">
                        <div
                          className={`w-3 h-3 rounded-full ${getSkillCategoryColor(
                            category
                          )} mr-2`}
                        ></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {skillsByCategory[category].length} skills
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skillsByCategory[category].map((skill, skillIndex) => (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{
                          duration: 0.6,
                          delay: categoryIndex * 0.15 + skillIndex * 0.1,
                        }}
                        className="group/skill relative"
                      >
                        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                          {/* Skill Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 group-hover/skill:text-blue-600 dark:group-hover/skill:text-blue-400 transition-colors">
                                {skill.name}
                              </h4>
                            </div>
                            <div className="flex items-center space-x-1">
                              {skill.certifications &&
                                skill.certifications.length > 0 && (
                                  <div className="flex items-center text-yellow-500">
                                    <Star className="w-4 h-4" />
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Skill Description */}
                          {skill.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                              {skill.description}
                            </p>
                          )}

                          {/* Certifications */}
                          {skill.certifications &&
                            skill.certifications.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Certifications
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {skill.certifications.map((cert) => (
                                    <span
                                      key={cert}
                                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-200 border border-blue-200/50 dark:border-blue-700/50"
                                    >
                                      {cert}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Skills Summary */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-20"
        >
          <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-indigo-600/20 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-700/50">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              Skills Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                {
                  category: "backend",
                  label: "Backend",
                  icon: Server,
                  color: "text-blue-600 dark:text-blue-400",
                },
                {
                  category: "cloud",
                  label: "Cloud & DevOps",
                  icon: Cloud,
                  color: "text-green-600 dark:text-green-400",
                },
                {
                  category: "ai-ml",
                  label: "AI/ML",
                  icon: Brain,
                  color: "text-purple-600 dark:text-purple-400",
                },
                {
                  category: "frontend",
                  label: "Frontend",
                  icon: Monitor,
                  color: "text-orange-600 dark:text-orange-400",
                },
                {
                  category: "tools",
                  label: "Tools",
                  icon: Wrench,
                  color: "text-gray-600 dark:text-gray-400",
                },
                {
                  category: "languages",
                  label: "Languages",
                  icon: Globe,
                  color: "text-indigo-600 dark:text-indigo-400",
                },
              ].map((item, index) => {
                const IconComponent = item.icon;
                const count = config.skills.filter(
                  (s) => s.category === item.category
                ).length;

                return (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                    className="text-center group"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                      <div
                        className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <div className={`text-2xl font-bold ${item.color} mb-1`}>
                        {count}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {item.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Professional Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-emerald-200/50 dark:border-emerald-700/50">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              Professional Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "AI/ML Systems",
                  subtitle: "RAG & LangChain",
                  icon: Brain,
                  color: "from-purple-500 to-pink-500",
                  bgColor:
                    "from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30",
                },
                {
                  title: "Cloud Infrastructure",
                  subtitle: "AWS & Microservices",
                  icon: Cloud,
                  color: "from-blue-500 to-cyan-500",
                  bgColor:
                    "from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30",
                },
                {
                  title: "Backend Development",
                  subtitle: "Python & FastAPI",
                  icon: Server,
                  color: "from-green-500 to-emerald-500",
                  bgColor:
                    "from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30",
                },
                {
                  title: "DevOps & CI/CD",
                  subtitle: "Infrastructure as Code",
                  icon: Database,
                  color: "from-orange-500 to-red-500",
                  bgColor:
                    "from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30",
                },
              ].map((highlight, index) => {
                const IconComponent = highlight.icon;

                return (
                  <motion.div
                    key={highlight.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
                    className="group"
                  >
                    <div
                      className={`bg-gradient-to-br ${highlight.bgColor} rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300 hover:scale-105`}
                    >
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${highlight.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {highlight.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {highlight.subtitle}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
