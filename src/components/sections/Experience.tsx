"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { experience } from "@/data/experience";
import { Section, SectionHeader } from "@/components/site/Section";
import { cn } from "@/lib/utils";

/**
 * Execution record - a compact timeline wall. Every role's impact metric is
 * scannable down the spine at a glance; selecting a node swaps a single detail
 * panel (no accordion stack, no huge cards).
 */
export function Experience() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const role = experience[active];

  return (
    <Section id="experience">
      <SectionHeader
        index="04"
        kicker="Execution record"
        variant="editorial"
        size="md"
        title="Where I've executed"
        lead="Operating, analytical, and technical roles since 2021 — owned end to end, under audit and at volume."
      />

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        {/* Timeline spine */}
        <ol className="relative lg:col-span-7">
          <span className="absolute bottom-2 left-[9px] top-3 w-px bg-line-2" aria-hidden />
          {experience.map((r, i) => {
            const on = i === active;
            return (
              <li key={r.id} className="relative">
                <button
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className="flex w-full items-center gap-3 py-2.5 pl-8 pr-1 text-left sm:gap-4"
                >
                  <span
                    className={cn(
                      "absolute left-[3px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 rounded-full border-2 transition-colors",
                      on ? "border-accent bg-accent" : "border-line-2 bg-paper",
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink-3">
                      {r.period}
                    </span>
                    <span
                      className={cn(
                        "block h-card text-[0.98rem] leading-tight transition-colors sm:text-[1.05rem]",
                        on ? "text-ink" : "text-ink-2",
                      )}
                    >
                      {r.role}
                    </span>
                    <span className="block truncate text-xs text-ink-3">{r.org}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 whitespace-nowrap rounded border px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] transition-colors",
                      on ? "border-accent text-accent" : "border-line-2 text-ink-3",
                    )}
                  >
                    {r.tag}
                  </span>
                </button>
                {i < experience.length - 1 && <span className="ml-8 block border-b border-line" />}
              </li>
            );
          })}
        </ol>

        {/* Detail panel */}
        <div className="lg:col-span-5">
          <div className="panel rounded-2xl p-6 lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={role.id}
                initial={reduce ? false : { y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-3">
                      {role.period}
                    </div>
                    <h3 className="h-card mt-1 text-lg">{role.role}</h3>
                    <div className="text-sm text-ink-3">{role.org}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-xl tnum leading-none text-accent">{role.metric.value}</div>
                    <div className="mt-1 max-w-[7rem] font-mono text-[0.52rem] uppercase leading-tight tracking-[0.06em] text-ink-3">
                      {role.metric.label}
                    </div>
                  </div>
                </div>
                <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-ink-2">
                  {role.frame}
                </p>
                <ul className="mt-3 space-y-2.5">
                  {role.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 text-sm leading-relaxed text-ink-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  );
}
