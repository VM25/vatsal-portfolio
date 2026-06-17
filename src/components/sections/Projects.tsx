"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ProjectVisual } from "@/types";
import { projects } from "@/data/projects";
import { Section, SectionHeader } from "@/components/site/Section";
import { cn } from "@/lib/utils";
import { Github, ArrowUpRight } from "@/components/ui/icons";
import { EventLadder } from "@/components/instruments/EventLadder";
import { RatesPanel } from "@/components/instruments/RatesPanel";
import { AllocationPanel } from "@/components/instruments/AllocationPanel";
import { FxStressPanel } from "@/components/instruments/FxStressPanel";

const VISUALS: Record<ProjectVisual, React.ComponentType<{ className?: string }>> = {
  apexgp: EventLadder,
  rates: RatesPanel,
  portfolio: AllocationPanel,
  fx: FxStressPanel,
};
const HUE: Record<ProjectVisual, string> = {
  apexgp: "--p-apexgp",
  rates: "--p-rates",
  portfolio: "--p-portfolio",
  fx: "--p-fx",
};

export function Projects() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);

  // Capability links open the matching project tab.
  useEffect(() => {
    const onSel = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const i = projects.findIndex((pr) => pr.id === id);
      if (i >= 0) setIdx(i);
    };
    window.addEventListener("project:select", onSel as EventListener);
    return () => window.removeEventListener("project:select", onSel as EventListener);
  }, []);

  const p = projects[idx];
  const hue = HUE[p.visual];
  const Visual = VISUALS[p.visual];

  return (
    <Section id="projects">
      <SectionHeader
        index="03"
        kicker="Project systems"
        variant="editorial"
        size="md"
        title="Systems in production"
        lead="Applied quant systems built as live research products, each with source code, deployment, and a clear modeling purpose."
      />

      <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Selector rail */}
        <div
          role="tablist"
          aria-label="Projects"
          className="grid grid-cols-2 gap-2.5 lg:col-span-4 lg:grid-cols-1"
        >
          {projects.map((proj, i) => {
            const on = i === idx;
            const h = HUE[proj.visual];
            return (
              <button
                key={proj.id}
                role="tab"
                aria-selected={on}
                onClick={() => setIdx(i)}
                className={cn(
                  "group relative overflow-hidden rounded-lg border p-3 text-left transition-colors sm:p-4",
                  on ? "border-transparent bg-card" : "border-line bg-transparent hover:bg-card",
                )}
                style={on ? { borderColor: `var(${h})`, boxShadow: `inset 3px 0 0 var(${h})` } : undefined}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[0.62rem] tnum text-ink-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="font-mono text-[0.6rem] uppercase tracking-[0.1em]"
                    style={{ color: `var(${h})` }}
                  >
                    {proj.category}
                  </span>
                </div>
                <div
                  className={cn(
                    "h-card mt-1 text-[0.98rem] leading-tight transition-colors sm:text-base",
                    on ? "text-ink" : "text-ink-2 group-hover:text-ink",
                  )}
                >
                  {proj.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Stage */}
        <div className="lg:col-span-8">
          <div className="panel overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={p.id}
                initial={reduce ? false : { y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 0.61, 0.36, 1] }}
                className="p-5 sm:p-6"
              >
                {/* header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-mono text-[0.66rem] uppercase tracking-[0.12em]" style={{ color: `var(${hue})` }}>
                      {p.category}
                    </span>
                    <h3 className="h-card mt-1 text-[clamp(1.35rem,3vw,1.9rem)]">{p.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.website && (
                      <a
                        href={p.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.05em] text-paper transition-colors hover:bg-accent hover:text-accent-ink"
                      >
                        Live <ArrowUpRight className="text-sm" />
                      </a>
                    )}
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${p.title} source`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line-2 bg-card px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.05em] text-ink transition-colors hover:border-ink"
                      >
                        <Github className="text-sm" /> Code
                      </a>
                    )}
                  </div>
                </div>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">{p.subtitle}</p>

                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* visual */}
                  <div className="inset rounded-xl p-3">
                    <Visual className="h-auto w-full" />
                  </div>

                  {/* evidence */}
                  <div className="flex flex-col">
                    <div className="grid grid-cols-3 gap-2">
                      {p.metrics.map((m) => (
                        <div key={m.label} className="inset rounded-lg px-2.5 py-2.5">
                          <div className="font-mono text-[clamp(0.78rem,1.4vw,1rem)] tnum leading-tight" style={{ color: `var(${hue})` }}>
                            {m.value}
                          </div>
                          <div className="mt-1 text-[0.58rem] uppercase leading-tight tracking-[0.04em] text-ink-3">
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    <ul className="mt-4 space-y-2">
                      {p.record.map((r) => (
                        <li key={r} className="flex gap-2.5 text-[0.82rem] leading-snug text-ink-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: `var(${hue})` }} aria-hidden />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.tags.slice(0, 6).map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  );
}
