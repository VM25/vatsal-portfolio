"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { SceneShell } from "@/components/experience/SceneShell";
import { Cue } from "@/components/experience/cues";
import { useChapterProgress } from "@/components/experience/chapter-context";
import { education } from "@/data/education";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

const asu = education.find((e) => e.id === "asu")!;
const stevens = education.find((e) => e.id === "stevens")!;

const STOPS = [
  { id: "asu", node: "Arizona State", sub: "’21–’25" },
  { id: "stevens", node: "Stevens", sub: "’25–’26" },
  { id: "frm", node: "FRM", sub: "Aug ’26" },
  { id: "target", node: "Target", sub: "’26–’27" },
];

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-line px-2 py-0.5 font-mono text-[0.62rem] text-ink-dim">
      {children}
    </span>
  );
}

function Detail({ idx }: { idx: number }) {
  if (idx === 0) {
    return (
      <>
        <div className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
          {asu.period} · Computer Science
        </div>
        <h3 className="font-display mt-2 text-3xl text-ink">B.S. Computer Science</h3>
        <div className="mt-0.5 text-sm text-ink-dim">
          {asu.school} · {asu.location}
        </div>
        <p className="mt-4 max-w-xl leading-relaxed text-ink-dim">
          A computer-science core — algorithms, systems, and software engineering —
          and the habit of building tools that actually run, not just models on
          paper.
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {asu.coursework?.map((c) => <Chip key={c}>{c}</Chip>)}
        </div>
        <div className="mt-4 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-brass">
          {asu.detail}
        </div>
      </>
    );
  }
  if (idx === 1) {
    return (
      <>
        <div className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
          {stevens.period} · Financial Engineering
        </div>
        <h3 className="font-display mt-2 text-3xl text-ink">M.S. Financial Engineering</h3>
        <div className="mt-0.5 text-sm text-ink-dim">
          {stevens.school} · {stevens.location}
        </div>
        <p className="mt-4 max-w-xl leading-relaxed text-ink-dim">
          Where the software turns into markets — pricing, hedging, stochastic
          methods, and computational finance, built on the CS foundation.
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {stevens.coursework?.map((c) => <Chip key={c}>{c}</Chip>)}
        </div>
        <div className="mt-4 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-brass">
          {stevens.detail}
        </div>
      </>
    );
  }
  if (idx === 2) {
    return (
      <>
        <div className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
          Part I · August 2026
        </div>
        <h3 className="font-display mt-2 text-3xl text-ink">FRM — Financial Risk Manager</h3>
        <div className="mt-0.5 text-sm text-ink-dim">
          GARP · Global Association of Risk Professionals
        </div>
        <p className="mt-4 max-w-xl leading-relaxed text-ink-dim">
          Formalizing the risk side of the work — market and credit risk, VaR / ES,
          valuation, and risk models — alongside the FE degree. The CS → FE → risk
          line, made explicit.
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {["Market Risk", "Credit Risk", "VaR / ES", "Valuation & Models"].map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </div>
        <div className="mt-4 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-brass">
          Part I exam — August 2026
        </div>
      </>
    );
  }
  return (
    <>
      <div className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
        Where this points
      </div>
      <h3 className="font-display mt-2 text-3xl text-ink">Target</h3>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <div className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
            Roles
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.targets.map((t) => (
              <span
                key={t}
                className="rounded-full border border-brass/40 bg-brass/[0.06] px-3 py-1 text-sm text-ink"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
            Availability
          </div>
          <div className="mt-2 space-y-1.5 text-sm text-ink-dim">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-up" aria-hidden />
              Fall 2026 — Quant Co-op / Internship
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-up" aria-hidden />
              Full-Time — 2027
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function OriginScene() {
  const progress = useChapterProgress();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // Scroll advances the progression (only fires while pinned / scrubbing).
  useMotionValueEvent(progress, "change", (v) => {
    const i = Math.min(STOPS.length - 1, Math.max(0, Math.floor(v * STOPS.length)));
    setActive((cur) => (cur === i ? cur : i));
  });

  const select = (i: number) => {
    const n = Math.min(STOPS.length - 1, Math.max(0, i));
    setActive(n);
    tabs.current[n]?.focus();
    // Keep scroll and the progression in sync when pinned.
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis;
    const sec = document.getElementById("origin");
    if (lenis && sec && sec.offsetHeight > window.innerHeight * 1.2) {
      const targetP = (n + 0.5) / STOPS.length;
      const y = sec.offsetTop + targetP * (sec.offsetHeight - window.innerHeight);
      lenis.scrollTo(y, { duration: 0.7 });
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      select(active + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      select(active - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      select(0);
    } else if (e.key === "End") {
      e.preventDefault();
      select(STOPS.length - 1);
    }
  };

  return (
    <SceneShell index="01" label="Origin / Academic arc">
      <div className="max-w-3xl">
        <Cue at={0}>
          <h2 className="scene-title text-ink">
            From systems <span className="text-brass">to markets.</span>
          </h2>
        </Cue>
        <Cue at={0.05}>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-ink-dim">
            Computer science into financial engineering, sharpened toward risk.
          </p>
        </Cue>
      </div>

      {/* stepper rail */}
      <Cue at={0.1}>
        <div
          role="tablist"
          aria-label="Academic and professional progression"
          onKeyDown={onKey}
          className="relative mt-8 w-full"
        >
          {/* track + beam */}
          <div className="absolute left-[12.5%] right-[12.5%] top-[7px] h-px bg-line-strong" aria-hidden />
          <div
            className="absolute left-[12.5%] top-[7px] h-px origin-left bg-brass transition-transform duration-500"
            style={{ width: "75%", transform: `scaleX(${active / (STOPS.length - 1)})` }}
            aria-hidden
          />
          <div className="grid grid-cols-4">
            {STOPS.map((s, i) => {
              const on = i === active;
              const done = i < active;
              return (
                <button
                  key={s.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  aria-selected={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(i)}
                  className="group flex flex-col items-center gap-2 outline-none"
                >
                  <span
                    className={cn(
                      "h-[15px] w-[15px] rounded-full border transition-colors",
                      on
                        ? "border-brass bg-brass"
                        : done
                          ? "border-brass bg-base"
                          : "border-line-strong bg-base group-hover:border-ink-faint",
                    )}
                  />
                  <span
                    className={cn(
                      "font-mono text-[0.64rem] uppercase tracking-[0.1em] transition-colors",
                      on ? "text-brass" : "text-ink-faint group-hover:text-ink-dim",
                    )}
                  >
                    {s.node}
                  </span>
                  <span className="font-mono text-[0.56rem] tracking-[0.08em] text-ink-faint/70">
                    {s.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Cue>

      {/* active stop detail */}
      <Cue at={0.14}>
        <div className="panel mt-6 min-h-[200px] rounded-[8px] p-5 lg:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <Detail idx={active} />
            </motion.div>
          </AnimatePresence>
        </div>
      </Cue>
    </SceneShell>
  );
}
