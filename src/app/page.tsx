import { Bar } from "@/components/site/Bar";
import { Foot } from "@/components/site/Foot";
import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { About } from "@/components/sections/About";
import { Paper } from "@/components/sections/Paper";
import { Experience } from "@/components/sections/Experience";
import { Contact } from "@/components/sections/Contact";

export default function Page() {
  return (
    <>
      <Bar />
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-accent focus:px-4 focus:py-2 focus:text-bg"
      >
        Skip to the work
      </a>
      <main className="shell">
        <Hero />
        <Work />
        <About />
        <Paper />
        <Experience />
        <Contact />
        <Foot />
      </main>
    </>
  );
}
