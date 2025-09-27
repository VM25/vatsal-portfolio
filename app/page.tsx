// app/page.tsx
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { Experience } from "@/components/Experience";
import { Education } from "@/components/Education";
import { ContactSection } from "@/components/ContactSection";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <AboutSection />
      <Education />
      <Experience />
      <ProjectsSection />
      <ContactSection />
    </main>
  );
}