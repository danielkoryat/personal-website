import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";
import { Experience } from "@/components/experience";
import { Contact } from "@/components/contact";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/error-boundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <Header />
      <main id="main" className="min-h-screen gradient-bg">
        <Hero />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </ErrorBoundary>
  );
}
