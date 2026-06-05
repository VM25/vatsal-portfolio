import { SystemBackground } from "@/components/experience/SystemBackground";
import { Chapter } from "@/components/experience/Chapter";
import { SceneNav } from "@/components/experience/SceneNav";
import { IdentityScene } from "@/components/scenes/IdentityScene";
import { OriginScene } from "@/components/scenes/OriginScene";
import { CapabilityScene } from "@/components/scenes/CapabilityScene";
import { ProjectsScene } from "@/components/scenes/ProjectsScene";
import { ExperienceScene } from "@/components/scenes/ExperienceScene";
import { ResearchScene } from "@/components/scenes/ResearchScene";
import { ContactScene } from "@/components/scenes/ContactScene";
import { links, profile } from "@/data/profile";

export default function Home() {
  return (
    <>
      <a
        href="#identity"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brass focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#1a1408]"
      >
        Skip to content
      </a>

      <SystemBackground />

      <header className="fixed left-5 top-5 z-30 flex items-center gap-3 sm:left-7 sm:top-6">
        <span className="grid h-8 w-8 place-items-center rounded-[3px] border border-line-strong font-display text-sm font-semibold text-brass">
          VM
        </span>
        <span className="hidden font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink-dim sm:block">
          Vatsal Maniar
        </span>
      </header>

      <a
        href={links.resume}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-5 top-5 z-30 rounded-full border border-line-strong px-4 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-brass/60 hover:text-brass sm:right-7 sm:top-6"
      >
        Résumé
      </a>

      {/* Live status — terminal chrome, top-right under the résumé pill on wide screens. */}
      <div className="fixed right-7 top-16 z-20 hidden items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint lg:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-up bead" aria-hidden />
        Open to roles
      </div>

      <main className="relative z-10">
        <Chapter id="identity" pin={0.25}>
          <IdentityScene />
        </Chapter>
        <Chapter id="origin" pin={2.4}>
          <OriginScene />
        </Chapter>
        <Chapter id="capability" pin={1}>
          <CapabilityScene />
        </Chapter>
        <Chapter id="projects" pin={0.5}>
          <ProjectsScene />
        </Chapter>
        <Chapter id="experience" pin={0.7}>
          <ExperienceScene />
        </Chapter>
        <Chapter id="research" pin={1}>
          <ResearchScene />
        </Chapter>
        <Chapter id="contact" pin={0.4}>
          <ContactScene />
        </Chapter>
      </main>

      <SceneNav />

      <span className="sr-only">{profile.summary}</span>
    </>
  );
}
