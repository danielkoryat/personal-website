export interface Skill {
  name: string;
  category: "backend" | "cloud" | "frontend" | "ai-ml" | "tools" | "languages";
  certifications?: string[];
  description?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  technologies: string[];
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  certifications?: string[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface SiteConfig {
  name: string;
  title: string;
  subtitle: string;
  description: string;
  intro: string;
  contact: ContactInfo;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
}
