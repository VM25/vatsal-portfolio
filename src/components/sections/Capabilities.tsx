"use client";

import { skillGroups } from "@/data/skills";
import { projects } from "@/data/projects";
import type { ProjectVisual } from "@/types";
import { Section, SectionHeader } from "@/components/site/Section";
import { ArrowUpRight } from "@/components/ui/icons";

const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));
const HUE: Record<ProjectVisual, string> = {
  apexgp: "--p-apexgp",
  rates: "--p-rates",
  portfolio: "--p-portfolio",
  fx: "--p-fx",
};

// Application at the top of the stack -> Software at the base. Numbered L04..L01.
const ORDER = ["pricing", "risk", "rates", "software"] as const;
const layers = ORDER.map((id) => skillGroups.find((g) => g.id === id)!);

function openProject(id: string) {
  window.dispatchEvent(new CustomEvent("project:select", { detail: id }));
  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
}

export function Capabilities() {
  return (
    <Section id="capabilities" className="pb-28 sm:pb-36">
      <SectionHeader
        index="02"
        kicker="Capability stack"
        variant="editorial"
        size="md"
        title="Built in layers"
        lead="Core technical and quantitative capabilities across software, pricing, rates, portfolio analytics, and risk systems."
      />

      {/* Sticky stack: each layer pins and piles into a single assembled rack.
          The pin (.stack-card) only engages on wide + tall viewports; on smaller
          or shorter screens it degrades to a plain stacked list, so it never
          overlaps the next section. */}
      <div className="mt-9">
        {layers.map((g, i) => {
          const layerNo = layers.length - i; // L04 (top) -> L01 (base)
          const last = i === layers.length - 1;
          return (
            <article
              key={g.id}
              className={`stack-card panel relative flex flex-col rounded-xl p-5 sm:p-6 ${
                last ? "mb-0" : "mb-4 stack-gap"
              }`}
              style={{
                ["--i" as string]: i,
                zIndex: i + 1,
                boxShadow: "0 -14px 40px -22px rgba(0,0,0,0.9)",
              }}
            >
              {/* peek row - always visible when stacked */}
              <div className="flex items-center justify-between gap-4 pl-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[0.66rem] font-bold tracking-[0.06em] text-ink-3">
                    L{String(layerNo).padStart(2, "0")}
                  </span>
                  <h3 className="h-card text-lg leading-none sm:text-xl">{g.title}</h3>
                </div>
                <span className="hidden font-mono text-[0.56rem] uppercase tracking-[0.16em] text-ink-3 sm:block">
                  {g.id}
                </span>
              </div>

              <p className="mt-2.5 max-w-2xl pl-2 text-[0.82rem] leading-snug text-ink-2">
                {g.blurb}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-1.5 pl-2">
                {g.skills.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4 pl-2">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-ink-3">
                  Powers
                </span>
                {g.appearsIn.map((pid) => {
                  const pr = projectById[pid];
                  const h = HUE[pr.visual as ProjectVisual];
                  return (
                    <button
                      key={pid}
                      onClick={() => openProject(pid)}
                      aria-label={`Open ${pr.title}`}
                      className="group inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[0.68rem] transition-colors"
                      style={{ borderColor: `var(${h})`, color: `var(${h})` }}
                    >
                      {pr.category}
                      <ArrowUpRight className="text-[0.66rem] opacity-50 transition-opacity group-hover:opacity-100" />
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
