import { Backdrop } from "@/components/site/Backdrop";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/site/Footer";
import { Connector } from "@/components/site/Connector";
import { Hero } from "@/components/sections/Hero";
import { Origin } from "@/components/sections/Origin";
import { Capabilities } from "@/components/sections/Capabilities";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { Research } from "@/components/sections/Research";
import { Contact } from "@/components/sections/Contact";
import { profile } from "@/data/profile";

export default function Home() {
  return (
    <>
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      <Backdrop />
      <SiteHeader />

      <main className="relative z-10">
        <Hero />
        <Origin />
        <Connector label="From foundation to capability" />
        <Capabilities />
        <Connector label="Capabilities compile into live systems" />
        <Projects />
        <Connector label="Operating history" />
        <Experience />
        <Connector label="From execution to what's next" />
        <Research />
        <Contact />
      </main>

      <Footer />

      <span className="sr-only">{profile.summary}</span>
    </>
  );
}
