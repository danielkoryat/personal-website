"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

const navItems = [
  { name: "Skills", href: "#skills" },
  { name: "Experience", href: "#experience" },
  { name: "Contact", href: "#contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Shrink/frost the bar once the page has scrolled past the hero top.
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll spy: highlight whichever section currently owns the viewport.
  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActiveSection(`#${visible.target.id}`);
      },
      // Bias the band toward the upper half so a section registers as active
      // roughly when it fills the screen.
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.1, 0.5, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Close the drawer on Escape or an outside click, and lock body scroll while
  // it is open. The toggle button is excluded from the outside-click check so
  // that tapping it closes the menu instead of closing-then-reopening it.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (toggleRef.current?.contains(target)) return;
      setIsMobileMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    // Preserve the scroll position: `position: fixed` on body would reset it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = useCallback((href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Move keyboard focus with the viewport so tab order follows the jump.
      (element as HTMLElement).setAttribute("tabindex", "-1");
      (element as HTMLElement).focus({ preventScroll: true });
    }
  }, []);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "border-b border-gray-200/70 bg-white/80 shadow-sm backdrop-blur-md dark:border-gray-800/70 dark:bg-gray-950/80"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-width section-padding">
          <div className="flex h-16 items-center justify-between">
            <motion.div whileHover={{ scale: 1.03 }} className="flex-shrink-0">
              <a
                href="#"
                className="block py-2 text-xl font-bold gradient-text"
                onClick={handleLogoClick}
                aria-label="Go to top of page"
              >
                Daniel Koryat
              </a>
            </motion.div>

            <nav
              className="hidden items-center gap-1 md:flex"
              aria-label="Main navigation"
            >
              {navItems.map((item) => {
                const isActive = activeSection === item.href;
                return (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                onClick={() => scrollToSection("#contact")}
                size="sm"
                className="hidden sm:inline-flex"
              >
                Get in Touch
              </Button>

              <button
                ref={toggleRef}
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="touch-target rounded-lg text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 md:hidden"
                aria-label={
                  isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
                }
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Drawer sits above the header (z-50 vs z-40) so the scrim covers it. */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          >
            <motion.div
              ref={panelRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl dark:bg-gray-950"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="flex h-16 items-center justify-end px-4">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="touch-target rounded-lg text-gray-600 dark:text-gray-400"
                  aria-label="Close navigation menu"
                >
                  <X size={22} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-2" aria-label="Mobile navigation">
                <div className="space-y-1">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => scrollToSection(item.href)}
                      className={`w-full rounded-lg px-4 py-3.5 text-left text-lg font-medium transition-colors ${
                        activeSection === item.href
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
                      }`}
                    >
                      {item.name}
                    </motion.button>
                  ))}
                </div>
              </nav>

              <div className="border-t border-gray-200 p-6 dark:border-gray-800">
                <Button
                  onClick={() => scrollToSection("#contact")}
                  className="w-full"
                  size="lg"
                >
                  Get in Touch
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
