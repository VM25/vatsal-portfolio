"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { SceneShell } from "@/components/experience/SceneShell";
import { Cue } from "@/components/experience/cues";
import { skillGroups } from "@/data/skills";
import { projects } from "@/data/projects";
import { cn } from "@/lib/utils";

// Which capability powers which project engine (indices into `projects`).
const EDGES: Record<string, number[]> = {
  pricing: [1, 3],
  risk: [2, 3],
  systems: [0, 1],
  software: [0, 1, 2, 3],
};

type Pt = { x: number; y: number };

export function CapabilityScene() {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const projRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [caps, setCaps] = useState<Pt[]>([]);
  const [projs, setProjs] = useState<Pt[]>([]);
  const [hot, setHot] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // The network draws on its own short timeline the moment it enters view — so a
  // fast scroll can't skip it, and a slow scroll doesn't turn it into a checkpoint.
  const inView = useInView(wrap, { once: true, margin: "-12% 0px -12% 0px" });

  // Highlighting only unlocks once the lines have finished drawing.
  useEffect(() => {
    if (reduce) {
      setMapReady(true);
      return;
    }
    if (inView) {
      const t = window.setTimeout(() => setMapReady(true), 1150);
      return () => window.clearTimeout(t);
    }
  }, [inView, reduce]);

  useEffect(() => {
    const measure = () => {
      const c = wrap.current;
      if (!c) return;
      const cr = c.getBoundingClientRect();
      setBox({ w: cr.width, h: cr.height });
      setCaps(
        capRefs.current.map((el) => {
          const r = el!.getBoundingClientRect();
          return { x: r.right - cr.left, y: r.top - cr.top + r.height / 2 };
        }),
      );
      setProjs(
        projRefs.current.map((el) => {
          const r = el!.getBoundingClientRect();
          return { x: r.left - cr.left, y: r.top - cr.top + r.height / 2 };
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    window.addEventListener("resize", measure);
    const t = window.setTimeout(measure, 350);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, []);

  const edgeList = skillGroups.flatMap((g, ci) =>
    (EDGES[g.id] ?? []).map((pi) => ({ id: `${g.id}-${pi}`, cap: g.id, ci, pi })),
  );

  // Gate every highlight on the map being drawn.
  const shownHot = mapReady ? hot : null;

  return (
    <SceneShell index="02" label="Capability map">
      <div className="max-w-2xl">
        <Cue at={0}>
          <h2 className="scene-title text-ink">
            What I can <span className="text-brass">build</span> — and where it ships.
          </h2>
        </Cue>
        <Cue at={0.05}>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-ink-dim">
            Four capability stacks, wired to the engines that prove them.
          </p>
        </Cue>
      </div>

      <div ref={wrap} className="relative mt-10 grid grid-cols-12 gap-x-6">
        {/* edges */}
        <svg
          className="pointer-events-none absolute inset-0 z-0 overflow-visible"
          width={box.w}
          height={box.h}
          aria-hidden
        >
          {caps.length === skillGroups.length &&
            projs.length === projects.length &&
            edgeList.map((e, ei) => {
              const s = caps[e.ci];
              const t = projs[e.pi];
              if (!s || !t) return null;
              const dx = (t.x - s.x) * 0.45;
              const on = shownHot === e.cap;
              return (
                <motion.path
                  key={e.id}
                  d={`M ${s.x} ${s.y} C ${s.x + dx} ${s.y}, ${t.x - dx} ${t.y}, ${t.x} ${t.y}`}
                  fill="none"
                  stroke="#c6a45c"
                  strokeWidth={on ? 1.8 : 1}
                  strokeOpacity={shownHot ? (on ? 0.9 : 0.08) : 0.32}
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={reduce ? { pathLength: 1 } : { pathLength: inView ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: 0.1 + ei * 0.03, ease: [0.22, 0.61, 0.36, 1] }}
                />
              );
            })}
        </svg>

        {/* capability stacks */}
        <div className="z-10 col-span-12 flex flex-col gap-3 md:col-span-5">
          {skillGroups.map((g, i) => (
            <Cue key={g.id} at={0.12 + i * 0.05} y={0}>
              <div
                ref={(el) => {
                  capRefs.current[i] = el;
                }}
                tabIndex={0}
                onMouseEnter={() => setHot(g.id)}
                onMouseLeave={() => setHot(null)}
                onFocus={() => setHot(g.id)}
                onBlur={() => setHot(null)}
                className={cn(
                  "panel cursor-default rounded-[6px] p-4 outline-none transition-colors",
                  shownHot === g.id ? "ring-1 ring-brass/40" : "ring-0",
                )}
              >
                <div className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-brass">
                  {g.title}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {g.skills.slice(0, 5).map((s) => (
                    <span
                      key={s}
                      className="rounded border border-line px-1.5 py-0.5 font-mono text-[0.6rem] text-ink-dim"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Cue>
          ))}
        </div>

        <div className="hidden md:col-span-2 md:block" aria-hidden />

        {/* project engines */}
        <div className="z-10 col-span-12 mt-3 flex flex-col justify-center gap-3 md:col-span-5 md:mt-0">
          {projects.map((p, i) => {
            const linked = shownHot != null && (EDGES[shownHot] ?? []).includes(i);
            return (
              <Cue key={p.id} at={0.18 + i * 0.05} y={0}>
                <div
                  ref={(el) => {
                    projRefs.current[i] = el;
                  }}
                  className={cn(
                    "rounded-[6px] border bg-base-2/40 px-4 py-3 transition-colors",
                    linked ? "border-brass/50 bg-brass/5" : "border-line",
                  )}
                >
                  <div className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
                    {p.tag}
                  </div>
                  <div className="font-display text-base leading-tight text-ink">
                    {p.title}
                  </div>
                </div>
              </Cue>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
}
