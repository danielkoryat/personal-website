"use client";

import { motion } from "framer-motion";
import { Download, Mail, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { getSiteConfig } from "@/lib/utils";

export function Hero() {
  const config = getSiteConfig();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-4 sm:right-10 w-48 h-48 sm:w-72 sm:h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-4 sm:left-20 w-48 h-48 sm:w-72 sm:h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 lg:space-y-8 order-2 lg:order-1"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              >
                <span className="gradient-text">{config.name}</span>
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium"
              >
                {config.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
              >
                {config.intro}
              </motion.p>

              {/* Professional highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="flex flex-wrap justify-center gap-2 mt-4"
              >
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                  🏢 Enterprise Backend
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                  🤖 AI/ML Systems
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                  ☁️ AWS Cloud
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200">
                  🚀 Microservices
                </span>
              </motion.div>
            </div>

            {/* Current role highlight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mx-4 sm:mx-0"
            >
              <p className="text-blue-800 dark:text-blue-200 font-medium text-sm sm:text-base">
                Backend Developer at Sidekick Platform
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm mt-1">
                Professional experience building AI backend infrastructure
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0"
            >
              <Button
                onClick={() => scrollToSection("#contact")}
                size="lg"
                className="group w-full sm:w-auto"
              >
                <Mail className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                Get in Touch
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="group w-full sm:w-auto"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/resume?format=pdf");
                    if (response.ok) {
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "Daniel_Koryat_Resume.pdf";
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    } else {
                      alert(
                        "Resume not available. Please check the contact section for download options."
                      );
                    }
                  } catch (error) {
                    alert("Failed to download resume. Please try again.");
                  }
                }}
              >
                <Download className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                Download Resume
              </Button>
            </motion.div>
          </motion.div>

          {/* Right side - Professional photo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative order-1 lg:order-2 mb-8 lg:mb-0"
          >
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto">
              {/* Placeholder for professional photo */}
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl sm:text-6xl font-bold shadow-2xl">
                DK
              </div>

              {/* Floating tech badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-white dark:bg-gray-800 rounded-full p-2 sm:p-3 shadow-lg"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                  Py
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 bg-white dark:bg-gray-800 rounded-full p-2 sm:p-3 shadow-lg"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                  AWS
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="absolute top-1/2 -right-6 sm:-right-8 bg-white dark:bg-gray-800 rounded-full p-2 sm:p-3 shadow-lg"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                  AI
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.button
            onClick={() => scrollToSection("#skills")}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2"
            aria-label="Scroll to skills section"
          >
            <ChevronDown size={24} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
