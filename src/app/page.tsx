import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Research } from "@/components/sections/Research";
import { Background } from "@/components/sections/Background";
import { Experience } from "@/components/sections/Experience";
import { Contact } from "@/components/sections/Contact";

/*
  Order follows what matters: the projects and the paper carry the site, so they
  come first. Background and previous roles are context and sit behind them.
*/
export default function Page() {
  return (
    <>
      <div className="field" aria-hidden>
        <span className="bloom bloom--e" />
        <span className="bloom bloom--a" />
        <span className="bloom bloom--b" />
        <span className="bloom bloom--c" />
        <span className="bloom bloom--d" />
      </div>
      <Nav />
      <a
        href="#projects"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-saffron focus:px-4 focus:py-2 focus:text-onyx"
      >
        Skip to the projects
      </a>
      <main>
        <Hero />
        <Projects />
        <Research />
        <Background />
        <Experience />
        <Contact />
      </main>
    </>
  );
}
