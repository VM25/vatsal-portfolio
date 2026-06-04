"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionShell } from "@/components/ui/SectionShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectCaseFile } from "@/components/ui/ProjectCaseFile";
import { ArrowUpRight, Close } from "@/components/ui/icons";
import { projects } from "@/data/projects";
import { useStore } from "@/store/useStore";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

const accentText: Record<Project["accent"], string> = {
  amber: "text-amber",
  copper: "text-copper",
  gold: "text-gold",
  ember: "text-ember",
};
const accentDot: Record<Project["accent"], string> = {
  amber: "bg-amber",
  copper: "bg-copper",
  gold: "bg-gold",
  ember: "bg-ember",
};

function CardFace({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="panel group flex h-full w-full flex-col rounded-2xl p-7 text-left transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={cn("h-2 w-2 rounded-full", accentDot[project.accent])} />
          <span
            className={cn(
              "font-mono text-xs uppercase tracking-[0.18em]",
              accentText[project.accent],
            )}
          >
            {project.tag}
          </span>
        </div>
        <span className="font-mono text-xs text-ink-faint">{project.period}</span>
      </div>
      <h3 className="font-display mt-5 text-3xl leading-tight text-ink sm:text-4xl">
        {project.title}
      </h3>
      <p className="font-display mt-3 text-pretty text-lg italic leading-snug text-ink-dim">
        {project.framing}
      </p>
      {project.metrics?.length ? (
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-ink-faint">
          {project.metrics.slice(0, 3).map((m) => (
            <span key={m.label}>
              <span className={accentText[project.accent]}>{m.value}</span> {m.label}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-auto flex items-center gap-2 pt-7 font-mono text-xs uppercase tracking-[0.16em] text-ink-dim transition-colors group-hover:text-amber">
        Inspect
        <ArrowUpRight className="text-base transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

function ExpandedCard({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onClose}
        aria-label="Close project"
        className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-line-strong bg-[rgba(12,10,9,0.6)] px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-dim backdrop-blur transition-colors hover:border-amber/60 hover:text-amber"
      >
        Close <Close className="text-sm" />
      </button>
      <ProjectCaseFile project={project} />
    </div>
  );
}

export function ProjectObservatory() {
  const [selected, setSelected] = useState<string | null>(null);
  const setActiveProject = useStore((s) => s.setActiveProject);
  const reduce = useReducedMotion();

  const open = (id: string) => {
    setSelected(id);
    setActiveProject(id); // drives the 3D camera dolly to the Observatory
  };
  const close = () => {
    setSelected(null);
    setActiveProject(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = selected ? projects.filter((p) => p.id === selected) : projects;

  return (
    <SectionShell id="work">
      <SectionHeader
        index="03"
        eyebrow="Selected Work"
        title={
          <>
            Applied <span className="text-gradient-amber">systems.</span>
          </>
        }
        lead="Pricing, risk, and portfolio tools — built end to end, calibrated, and checked against market data. Select any project to expand it."
      />

      <motion.div layout className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.div
              key={p.id}
              layout
              className={selected === p.id ? "md:col-span-2" : ""}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
              transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {selected === p.id ? (
                <ExpandedCard project={p} onClose={close} />
              ) : (
                <CardFace project={p} onOpen={() => open(p.id)} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </SectionShell>
  );
}
