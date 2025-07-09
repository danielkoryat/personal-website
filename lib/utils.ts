import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import siteConfig from "@/data/site-config.json";
import type { SiteConfig } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSiteConfig(): SiteConfig {
  return siteConfig as SiteConfig;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

export function getSkillCategoryColor(category: string): string {
  const colors = {
    backend: "bg-blue-500",
    cloud: "bg-green-500",
    frontend: "bg-purple-500",
    "ai-ml": "bg-orange-500",
    tools: "bg-gray-500",
  };
  return colors[category as keyof typeof colors] || "bg-gray-500";
}

export function getSkillCategoryLabel(category: string): string {
  const labels = {
    backend: "Backend Development",
    cloud: "Cloud & DevOps",
    frontend: "Frontend Development",
    "ai-ml": "AI/ML Systems",
    tools: "Tools & Methodology",
  };
  return labels[category as keyof typeof labels] || category;
}
