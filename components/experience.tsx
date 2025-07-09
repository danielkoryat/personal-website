"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Calendar, MapPin, Building, Award } from "lucide-react";
import { getSiteConfig, formatDate } from "@/lib/utils";

export function Experience() {
  const config = getSiteConfig();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      id="experience"
      className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Professional Experience</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4 sm:px-0">
            My journey from bootcamp graduate to backend developer working with
            cutting-edge AI technologies
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600 md:left-1/2 md:transform md:-translate-x-0.5"></div>

          <div className="space-y-8 sm:space-y-12">
            {config.experience.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 sm:left-8 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full border-2 sm:border-4 border-white dark:border-gray-800 shadow-lg md:left-1/2 md:transform md:-translate-x-2"></div>

                {/* Content card */}
                <div
                  className={`ml-12 sm:ml-16 md:ml-0 md:w-5/12 ${
                    index % 2 === 0
                      ? "md:mr-auto md:pr-8"
                      : "md:ml-auto md:pl-8"
                  }`}
                >
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow">
                    {/* Job header */}
                    <div className="mb-4 sm:mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                          {job.title}
                        </h3>
                        {job.current && (
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 w-fit">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">
                        <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="font-medium">{job.company}</span>
                      </div>

                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{job.location}</span>
                      </div>

                      <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {formatDate(job.startDate)} -{" "}
                          {job.current ? "Present" : formatDate(job.endDate!)}
                        </span>
                      </div>
                    </div>

                    {/* Job description */}
                    <p className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                      {job.description}
                    </p>

                    {/* Technologies */}
                    <div className="mb-4 sm:mb-6">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 uppercase tracking-wide">
                        Technologies
                      </h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {job.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Achievements */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 uppercase tracking-wide flex items-center">
                        <Award className="w-4 h-4 mr-2 flex-shrink-0" />
                        Key Achievements
                      </h4>
                      <ul className="space-y-2">
                        {job.achievements.map(
                          (achievement, achievementIndex) => (
                            <motion.li
                              key={achievementIndex}
                              initial={{ opacity: 0, x: -20 }}
                              animate={inView ? { opacity: 1, x: 0 } : {}}
                              transition={{
                                duration: 0.6,
                                delay:
                                  index * 0.2 + achievementIndex * 0.1 + 0.3,
                              }}
                              className="flex items-start text-gray-700 dark:text-gray-300 text-sm sm:text-base"
                            >
                              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                              <span className="leading-relaxed">
                                {achievement}
                              </span>
                            </motion.li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Education section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 sm:mt-20"
        >
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
              <span className="gradient-text">Education & Training</span>
            </h3>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 px-4 sm:px-0">
              Continuous learning and professional development
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {config.education.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {edu.degree}
                  </h4>
                  <p className="text-blue-600 dark:text-blue-400 font-medium text-sm sm:text-base">
                    {edu.institution}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </p>
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">
                  {edu.description}
                </p>

                {edu.certifications && edu.certifications.length > 0 && (
                  <div>
                    <h5 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Certifications
                    </h5>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {edu.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
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
      </div>
    </section>
  );
}
