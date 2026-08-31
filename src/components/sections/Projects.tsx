"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { work } from "@/data/work";
import { ACCENT } from "@/lib/accents";
import { PANELS } from "@/components/instruments/Instruments";
import { R, Count } from "@/components/ui/Bits";

/**
 * The centre of the site.
 *
 * A rail of seven on the left, one stage on the right. Choosing a project
 * repaints the whole stage in that project's identity colour — the instrument,
 * the figures, the buttons and the rail marker all read from a single --accent,
 * so switching feels like changing instrument rather than swapping text.
 */
export function Projects() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const p = work[i];
  const Panel = PANELS[p.id];
  const accent = ACCENT[p.id];

  return (
    <section
      id="projects"
      className="section"
      style={{ ["--accent"]: accent } as React.CSSProperties}
    >
      <div className="shell">
        <div className="sec-head">
          <R>
            <p className="tag">01 — Projects</p>
          </R>
          <R d={1}>
            <h2 className="h1">The evidence</h2>
          </R>
          <R d={2}>
            <p className="lede">
              Each one answers a question, and two of them answer it with a no.
              Pick one.
            </p>
          </R>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* the rail */}
          <R d={1} className="lg:col-span-4">
            <div role="tablist" aria-label="Systems" className="border-t border-nocturnal/50">
              {work.map((w, n) => {
                const on = n === i;
                return (
                  <button
                    key={w.id}
                    role="tab"
                    aria-selected={on}
                    onClick={() => setI(n)}
                    className="rail-item group"
                    style={{ ["--accent"]: ACCENT[w.id] } as React.CSSProperties}
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="num text-[0.7rem] text-aqua">
                        {String(n + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="num text-[0.62rem] uppercase tracking-[0.16em]"
                        style={{ color: on ? "var(--accent)" : undefined }}
                      >
                        {w.field}
                      </span>
                    </span>
                    <span
                      className={`h3 mt-1.5 block text-[1.05rem] transition-colors duration-300 ${
                        on ? "" : "text-snow/70 group-hover:text-praxeti"
                      }`}
                    >
                      {w.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </R>

          {/* the stage */}
          <div
            className="min-w-0 lg:col-span-8"
            style={{ ["--accent"]: accent } as React.CSSProperties}
          >
            <div className="card card--lit card--ticked min-h-[30rem] p-4 sm:p-6">
              {/*
                Keyed on the project, with no exit animation. `mode="wait"` would
                hold the old panel until its exit finished — and if that stall
                ever happens the stage silently stops updating. Swapping straight
                away and animating only the arrival is both safer and snappier
                for something you click through.
              */}
              <motion.div
                key={p.id}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
              >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="num text-[0.66rem] uppercase tracking-[0.18em] text-accent">
                        {p.field} · {p.year}
                      </p>
                      <h3 className="h2 mt-1.5">{p.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {p.live ? (
                        <a href={p.live} target="_blank" rel="noreferrer noopener" className="btn">
                          Open ↗
                        </a>
                      ) : null}
                      {p.code ? (
                        <a href={p.code} target="_blank" rel="noreferrer noopener" className="btn btn--ghost">
                          Source
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-6 lg:grid-cols-2">
                    <div className="panel min-w-0 p-3">
                      <Panel />
                    </div>

                    <div className="min-w-0">
                      <p className="prose text-[0.95rem]">{p.detail}</p>

                      <div className="mt-5 grid grid-cols-3 gap-4">
                        {p.figures.map((f) => (
                          <div key={f.label} className="stat">
                            <div className="stat__v">
                              <Count value={f.value} />
                            </div>
                            <div className="stat__k">{f.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-5 border-l-2 pl-5"
                    style={{ borderColor: "var(--accent)" }}
                  >
                    <p className="num text-[0.62rem] uppercase tracking-[0.2em] text-accent">
                      What it found
                    </p>
                    <p className="mt-2 max-w-[70ch] text-[1rem] leading-relaxed text-praxeti">
                      {p.result}
                    </p>
                  </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
