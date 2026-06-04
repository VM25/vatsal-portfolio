import { World } from "@/components/three/World";
import { JourneyController } from "@/components/providers/JourneyController";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Origin } from "@/components/sections/Origin";
import { Skills } from "@/components/sections/Skills";
import { Ticker } from "@/components/sections/Ticker";
import { ProjectObservatory } from "@/components/sections/ProjectObservatory";
import { Experience } from "@/components/sections/Experience";
import { ResearchDirection } from "@/components/sections/ResearchDirection";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      {/* Spatial world: background + foreground canvases sandwiching content. */}
      <World />
      <JourneyController />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Origin />
        <Skills />
        <Ticker />
        <ProjectObservatory />
        <Experience />
        <ResearchDirection />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
