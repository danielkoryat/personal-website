"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest(".mobile-menu-container")) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: "Skills", href: "#skills" },
    { name: "Experience", href: "#experience" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg dark:bg-gray-900/95"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 z-50"
            >
              <a
                href="#"
                className="text-xl font-bold gradient-text block py-2"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Daniel Koryat
              </a>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 font-medium py-2 px-1"
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Right side - Theme toggle and CTA */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button
                onClick={() => scrollToSection("#contact")}
                className="hidden sm:inline-flex"
              >
                Get in Touch
              </Button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 z-50"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="mobile-menu-container absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Mobile menu items */}
                <nav className="flex-1 px-6 py-8">
                  <div className="space-y-2">
                    {navItems.map((item, index) => (
                      <motion.button
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => scrollToSection(item.href)}
                        className="w-full text-left py-4 px-4 text-lg text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {item.name}
                      </motion.button>
                    ))}
                  </div>
                </nav>

                {/* Mobile menu footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={() => scrollToSection("#contact")}
                    className="w-full"
                    size="lg"
                  >
                    Get in Touch
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
