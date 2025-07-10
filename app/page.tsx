import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";
import { Experience } from "@/components/experience";
import { Projects } from "@/components/projects";
import { Contact } from "@/components/contact";
import { Header } from "@/components/header";
import { ErrorBoundary } from "@/components/error-boundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen gradient-bg">
        <Header />
        <Hero />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>
    </ErrorBoundary>
  );
}
