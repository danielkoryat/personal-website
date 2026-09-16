import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import siteConfig from "@/data/site-config.json";
import type { Experience, SiteConfig } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSiteConfig(): SiteConfig {
  return siteConfig as SiteConfig;
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  getSiteConfig().siteUrl ??
  "https://danielkoryat.com";

/**
 * Formats a `YYYY-MM` string as e.g. "February 2024". Parsed as UTC so the
 * month does not shift backwards for users west of Greenwich.
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(`${dateString}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/** Whole years from the earliest role's start date to today. */
export function getYearsOfExperience(experience: Experience[]): number {
  const starts = experience
    .map((job) => new Date(`${job.startDate}-01T00:00:00Z`).getTime())
    .filter((time) => !Number.isNaN(time));

  if (starts.length === 0) return 0;

  const elapsedMs = Date.now() - Math.min(...starts);
  return Math.max(0, Math.floor(elapsedMs / (365.25 * 24 * 60 * 60 * 1000)));
}

const CATEGORY_META: Record<string, { color: string; label: string }> = {
  backend: { color: "bg-blue-500", label: "Backend Development" },
  cloud: { color: "bg-green-500", label: "Cloud & DevOps" },
  frontend: { color: "bg-purple-500", label: "Frontend Development" },
  "ai-ml": { color: "bg-orange-500", label: "AI/ML Systems" },
  tools: { color: "bg-gray-500", label: "Tools & Methodology" },
  languages: { color: "bg-indigo-500", label: "Languages" },
};

export function getSkillCategoryColor(category: string): string {
  return CATEGORY_META[category]?.color ?? "bg-gray-500";
}

export function getSkillCategoryLabel(category: string): string {
  return CATEGORY_META[category]?.label ?? category;
}
