"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Send,
  Download,
  FileText,
} from "lucide-react";
import { Button } from "./ui/button";
import { getSiteConfig } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export function Contact() {
  const config = getSiteConfig();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [mounted, setMounted] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mounted) return;

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
      recaptchaToken,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Message sent successfully! I'll get back to you soon.",
        });
        // Use the ref instead of e.currentTarget for safer form reset
        // Add a small delay to ensure the success message is shown before reset
        if (formRef.current) {
          formRef.current.reset();
        }
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      // Check if the error is actually a network error or just a response parsing issue
      console.error("Contact form error:", error);
      setSubmitStatus({
        type: "error",
        message:
          "There was an issue processing your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResumeDownload = async (format: "pdf" | "docx") => {
    if (!mounted) return;
    
    try {
      const response = await fetch(`/api/resume?format=${format}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Daniel_Koryat_Resume.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert(
          `Resume not available in ${format.toUpperCase()} format. Please try PDF.`
        );
      }
    } catch (error) {
      console.error("Resume download error:", error);
      alert("Failed to download resume. Please try again.");
    }
  };

  return (
    <section
      id="contact"
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
            <span className="gradient-text">Get In Touch</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4 sm:px-0">
            I&apos;m always interested in hearing about new opportunities and
            exciting projects
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 sm:space-y-8 order-2 lg:order-1"
          >
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Let&apos;s Connect
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed">
                I&apos;m always open to discussing exciting projects and
                collaboration opportunities. Whether you have a technical
                question, want to explore potential partnerships, or just want
                to connect, I&apos;d love to hear from you!
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                    Email
                  </h4>
                  <a
                    href={`mailto:${config.contact.email}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base break-all"
                  >
                    {config.contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                    Phone
                  </h4>
                  <a
                    href={`tel:${config.contact.phone}`}
                    className="text-green-600 dark:text-green-400 hover:underline text-sm sm:text-base"
                  >
                    {config.contact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                    Location
                  </h4>
                  <p className="text-purple-600 dark:text-purple-400 text-sm sm:text-base">
                    {config.contact.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
                Follow Me
              </h4>
              <div className="flex space-x-3 sm:space-x-4">
                {config.contact.githubUrl && (
                  <a
                    href={config.contact.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-900 dark:bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                    title="GitHub Profile"
                  >
                    <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
                {config.contact.linkedinUrl && (
                  <a
                    href={config.contact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Resume Download */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-3 text-sm sm:text-base">
                Download Resume
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleResumeDownload("pdf")}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => handleResumeDownload("docx")}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download DOCX</span>
                </button>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">
                Current Status
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm">
                Backend Developer at Sidekick Platform
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm mt-1">
                Professional experience building AI backend infrastructure
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white dark:bg-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg order-1 lg:order-2"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Send a Message
            </h3>

            {!mounted && (
              <div className="space-y-4 sm:space-y-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            )}

            {mounted && (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 sm:space-y-6"
                ref={formRef}
              >
              {/* Status Messages */}
              {submitStatus.type && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    submitStatus.type === "success"
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                      : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm sm:text-base"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm sm:text-base"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm sm:text-base"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none text-sm sm:text-base"
                  placeholder="Tell me about your project or opportunity..."
                />
              </div>

              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                onChange={setRecaptchaToken}
                onExpired={() => setRecaptchaToken(null)}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full group"
                disabled={isSubmitting || !mounted || !recaptchaToken}
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-bounce" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
