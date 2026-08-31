import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/sections/Hero";
import { Origin } from "@/components/sections/Origin";
import { Work } from "@/components/sections/Work";
import { Experience } from "@/components/sections/Experience";
import { Research } from "@/components/sections/Research";
import { Contact } from "@/components/sections/Contact";

export default function Page() {
  return (
    <>
      <Nav />
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-saffron focus:px-4 focus:py-2 focus:text-onyx"
      >
        Skip to the work
      </a>
      <main>
        <Hero />
        <Origin />
        <Work />
        <Experience />
        <Research />
        <Contact />
      </main>
    </>
  );
}
