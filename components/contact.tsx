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
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { SectionHeading } from "./section-heading";
import { getSiteConfig } from "@/lib/utils";
import { useResumeDownload } from "@/lib/use-resume-download";
import { useState, useRef, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

export function Contact() {
  const config = getSiteConfig();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [mounted, setMounted] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const { download, pending, error: resumeError } = useResumeDownload();

  useEffect(() => setMounted(true), []);

  // Without a configured site key the widget can never produce a token, so
  // gating submission on it would make the form permanently unusable.
  const recaptchaEnabled = RECAPTCHA_SITE_KEY.length > 0;
  const canSubmit =
    mounted && !isSubmitting && (!recaptchaEnabled || Boolean(recaptchaToken));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      recaptchaToken: recaptchaToken ?? "",
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Message sent — I'll get back to you shortly.",
        });
        formRef.current?.reset();
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to send message. Please try again.",
        });
      }
    } catch (cause) {
      console.error("Contact form error:", cause);
      setStatus({
        type: "error",
        message: "Couldn't reach the server. Please try again.",
      });
    } finally {
      // The token is single-use — reset it whatever the outcome, so a retry
      // doesn't fail reCAPTCHA verification with a stale value.
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: config.contact.email,
      href: `mailto:${config.contact.email}`,
      tone: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: Phone,
      label: "Phone",
      value: config.contact.phone,
      href: `tel:${config.contact.phone.replace(/[^\d+]/g, "")}`,
      tone: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      icon: MapPin,
      label: "Location",
      value: config.contact.location,
      href: undefined,
      tone: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white";

  return (
    <section id="contact" className="bg-gray-50 py-20 dark:bg-gray-900 sm:py-24">
      <div className="container-width section-padding" ref={ref}>
        <SectionHeading
          eyebrow="Contact"
          title="Get In Touch"
          description="Open to backend and platform roles, and always happy to talk shop."
          icon={MessageSquare}
          inView={inView}
        />

        <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="order-2 space-y-6 lg:order-1 lg:col-span-2"
          >
            <div className="space-y-3">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                const content = (
                  <>
                    <div
                      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${method.bg}`}
                    >
                      <Icon className={`h-5 w-5 ${method.tone}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {method.label}
                      </p>
                      <p
                        className={`truncate text-sm font-medium sm:text-base ${method.tone}`}
                      >
                        {method.value}
                      </p>
                    </div>
                  </>
                );

                return method.href ? (
                  <a
                    key={method.label}
                    href={method.href}
                    className="surface flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={method.label}
                    className="surface flex items-center gap-4 p-4"
                  >
                    {content}
                  </div>
                );
              })}
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {config.contact.githubUrl && (
                <a
                  href={config.contact.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target rounded-xl bg-gray-900 text-white transition-colors hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                  aria-label="GitHub profile"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {config.contact.linkedinUrl && (
                <a
                  href={config.contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700"
                  aria-label="LinkedIn profile"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>

            {/* Resume */}
            <div className="surface p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Resume
              </h3>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => download("pdf")}
                  disabled={pending !== null}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {pending === "pdf" ? "Preparing…" : "PDF"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => download("docx")}
                  disabled={pending !== null}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {pending === "docx" ? "Preparing…" : "DOCX"}
                </Button>
              </div>
              {resumeError && (
                <p
                  role="status"
                  className="mt-3 text-sm text-red-600 dark:text-red-400"
                >
                  {resumeError}
                </p>
              )}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="surface order-1 p-6 shadow-lg lg:order-2 lg:col-span-3 sm:p-8"
          >
            <h3 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Send a Message
            </h3>

            {!mounted ? (
              <div className="space-y-4" aria-hidden="true">
                <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" ref={formRef}>
                {status.type && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`flex items-start gap-2.5 rounded-lg border p-3.5 text-sm ${
                      status.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                        : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
                    }`}
                  >
                    {status.type === "success" ? (
                      <CheckCircle2 className="mt-px h-4 w-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="mt-px h-4 w-4 flex-shrink-0" />
                    )}
                    <span>{status.message}</span>
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      className={inputClass}
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      maxLength={150}
                      autoComplete="email"
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    maxLength={200}
                    className={inputClass}
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    minLength={10}
                    maxLength={5000}
                    className={`${inputClass} resize-none`}
                    placeholder="Tell me about the role or project…"
                  />
                </div>

                {recaptchaEnabled && (
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={setRecaptchaToken}
                    onExpired={() => setRecaptchaToken(null)}
                  />
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="group w-full"
                  disabled={!canSubmit}
                >
                  <Send className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  {isSubmitting ? "Sending…" : "Send Message"}
                </Button>

                {recaptchaEnabled && !recaptchaToken && (
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                    Complete the reCAPTCHA above to enable sending.
                  </p>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
