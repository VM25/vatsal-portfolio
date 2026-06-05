"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SceneShell } from "@/components/experience/SceneShell";
import { useChapterProgress } from "@/components/experience/chapter-context";
import { Cue } from "@/components/experience/cues";
import { Button } from "@/components/ui/Button";
import { projects } from "@/data/projects";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { Github, ExternalLink } from "@/components/ui/icons";
import { EventLadder } from "@/components/instruments/EventLadder";
import { GreeksDesk } from "@/components/instruments/GreeksDesk";
import { EfficientFrontier } from "@/components/instruments/EfficientFrontier";
import { RatesEngine } from "@/components/instruments/RatesEngine";

const INSTRUMENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  apexgp: EventLadder,
  "market-making": GreeksDesk,
  portfolio: EfficientFrontier,
  "rates-fx": RatesEngine,
};

export function ProjectsScene() {
  const progress = useChapterProgress();
  const reduce = useReducedMotion();
  const setActiveProject = useStore((s) => s.setActiveProject);
  const [idx, setIdx] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const project = projects[idx];
  const Instrument = INSTRUMENTS[project.id];

  const select = (i: number) => {
    const n = (i + projects.length) % projects.length;
    setIdx(n);
    setActiveProject(projects[n].id);
    tabs.current[n]?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      select(idx + 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      select(idx - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      select(0);
    } else if (e.key === "End") {
      e.preventDefault();
      select(projects.length - 1);
    }
  };

  return (
    <SceneShell index="03" label="Project engines">
      <Cue progress={progress} at={0} span={0.16}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="scene-title text-ink">
            Four working <span className="text-brass">systems.</span>
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-ink-dim">
            Built, calibrated, and checked against market data — working systems,
            not slides.
          </p>
        </div>
      </Cue>

      <Cue progress={progress} at={0.1} span={0.2}>
        <div className="mt-7 grid grid-cols-12 gap-4">
          {/* engine rail (the system view) */}
          <div
            role="tablist"
            aria-label="Project engines"
            aria-orientation="vertical"
            onKeyDown={onKey}
            className="col-span-12 flex gap-2 overflow-x-auto pb-1 md:col-span-3 md:flex-col md:overflow-visible md:pb-0"
          >
            {projects.map((p, i) => {
              const on = i === idx;
              return (
                <button
                  key={p.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  aria-selected={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(i)}
                  className={cn(
                    "shrink-0 rounded-[6px] border px-4 py-3 text-left transition-all md:w-full",
                    on
                      ? "border-brass/50 bg-brass/[0.07]"
                      : "border-line opacity-60 hover:opacity-100 hover:border-line-strong",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors",
                        on ? "bg-brass" : "bg-ink-faint/50",
                      )}
                    />
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ink-faint">
                      {p.tag}
                    </span>
                  </div>
                  <div className="font-display mt-1 text-[0.95rem] leading-tight text-ink">
                    {p.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* focused engine stage */}
          <div
            role="tabpanel"
            className="panel col-span-12 rounded-[8px] p-5 md:col-span-9 lg:p-6"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={project.id}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-brass">
                    {project.tag} · {project.period}
                  </span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-faint">
                    {project.stackLabel}
                  </span>
                </div>
                <p className="font-display mt-2 max-w-2xl text-pretty text-lg leading-snug text-ink">
                  {project.framing}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
                  {/* the engine's own instrument */}
                  <div className="lg:col-span-6">
                    <div className="rounded-[6px] border border-line bg-base-2/50 p-2">
                      {Instrument ? <Instrument className="h-auto w-full" /> : null}
                    </div>
                  </div>

                  {/* evidence */}
                  <div className="lg:col-span-6">
                    <div className="grid grid-cols-3 gap-2">
                      {project.metrics?.map((m) => (
                        <div key={m.label} className="rounded-[5px] border border-line px-2.5 py-2">
                          <div className="font-mono text-sm tnum text-brass">{m.value}</div>
                          <div className="mt-0.5 text-[0.6rem] uppercase leading-tight tracking-[0.08em] text-ink-faint">
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                      On the record
                    </div>
                    <ul className="mt-2 space-y-2">
                      {project.evidence.map((e) => (
                        <li key={e} className="flex gap-2.5 text-[0.82rem] leading-snug text-ink-dim">
                          <span className="mt-1.5 h-px w-2.5 shrink-0 bg-brass" aria-hidden />
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {project.concepts.slice(0, 4).map((c) => (
                        <span
                          key={c}
                          className="rounded border border-line px-2 py-0.5 font-mono text-[0.58rem] text-ink-faint"
                        >
                          {c}
                        </span>
                      ))}
                      {project.links.map((l) => (
                        <Button
                          key={l.href}
                          href={l.href}
                          external
                          variant={l.kind === "live" ? "solid" : "outline"}
                          className="!px-3 !py-1.5 !text-xs"
                          icon={l.kind === "repo" ? <Github /> : <ExternalLink />}
                        >
                          {l.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Cue>
    </SceneShell>
  );
}
