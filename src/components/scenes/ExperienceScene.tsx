"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SceneShell } from "@/components/experience/SceneShell";
import { Cue } from "@/components/experience/cues";
import { experience } from "@/data/experience";
import { cn } from "@/lib/utils";

/**
 * Execution record — a scannable career ladder. Every role's impact metric is
 * visible at a glance (no click required to get the value); a brass spine shows
 * the progression; a row expands for the detail when a visitor wants it.
 * Work experience only — answers: where has he executed?
 */
export function ExperienceScene() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string>("");

  return (
    <SceneShell index="04" label="Execution record">
      <div className="max-w-2xl">
        <Cue at={0}>
          <h2 className="scene-title text-ink">
            Where I&rsquo;ve <span className="text-brass">executed.</span>
          </h2>
        </Cue>
        <Cue at={0.05}>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-ink-dim">
            Operating, analytical, and technical roles since October 2021 — owned
            end to end, under audit and at volume.
          </p>
        </Cue>
      </div>

      <Cue at={0.1}>
        <ol className="relative mt-7 lg:max-w-5xl">
          <span
            className="absolute bottom-3 left-[6px] top-3 w-px bg-line-strong"
            aria-hidden
          />
          {experience.map((r) => {
            const isOpen = open === r.id;
            return (
              <li key={r.id} className="relative pl-8">
                <span
                  className={cn(
                    "absolute left-[1px] top-[20px] h-[11px] w-[11px] rounded-full border transition-colors",
                    isOpen ? "border-brass bg-brass" : "border-line-strong bg-base",
                  )}
                  aria-hidden
                />
                <button
                  onClick={() => setOpen(isOpen ? "" : r.id)}
                  aria-expanded={isOpen}
                  className={cn(
                    "group w-full rounded-[6px] border px-4 py-3 text-left transition-colors",
                    isOpen
                      ? "border-brass/40 bg-brass/[0.05]"
                      : "border-transparent hover:border-line hover:bg-[rgba(239,233,221,0.02)]",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-ink-faint">
                        {r.period}
                      </div>
                      <div className="font-display text-lg leading-tight text-ink">
                        {r.role}
                      </div>
                      <div className="text-xs text-ink-faint">{r.org}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-lg tnum leading-none text-brass">
                        {r.metric.value}
                      </div>
                      <div className="mt-1 max-w-[9rem] font-mono text-[0.56rem] uppercase leading-tight tracking-[0.08em] text-ink-faint">
                        {r.metric.label}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 0.61, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 text-sm italic leading-snug text-ink-faint">
                          {r.frame}
                        </p>
                        <ul className="mt-2 space-y-2">
                          {r.bullets.map((b) => (
                            <li
                              key={b}
                              className="flex gap-2.5 text-sm leading-relaxed text-ink-dim"
                            >
                              <span className="mt-2 h-px w-2.5 shrink-0 bg-brass" aria-hidden />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </li>
            );
          })}
        </ol>
      </Cue>
    </SceneShell>
  );
}
