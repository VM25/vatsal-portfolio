"use client";

import { useEffect, useState } from "react";
import scrollama from "scrollama";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { education } from "@/data/education";
import { profile } from "@/data/profile";
import { SectionHeader } from "@/components/site/Section";
import { cn } from "@/lib/utils";

const asu = education.find((e) => e.id === "asu")!;
const stevens = education.find((e) => e.id === "stevens")!;

type Stop = {
  node: string;
  span: string;
  kind: string;
  title: string;
  org: string;
  body: string;
  detail: string;
  chips: string[];
  present?: boolean;
};

const STOPS: Stop[] = [
  {
    node: "Arizona State",
    span: "’21 — ’25",
    kind: "The origin",
    title: "B.S. Computer Science",
    org: `${asu.school} · ${asu.location}`,
    body: "Where it started: a systems and algorithms foundation, and the habit of building tools that actually run instead of models that only live on paper.",
    detail: asu.detail,
    chips: asu.coursework ?? [],
  },
  {
    node: "Stevens",
    span: "’25 — ’26",
    kind: "Present — center of gravity",
    title: "M.S. Financial Engineering",
    org: `${stevens.school} · ${stevens.location}`,
    body: "Where the software turns into markets. Pricing, hedging, stochastic methods, and computational finance — built directly on the CS foundation. This is the work happening now.",
    detail: stevens.detail,
    chips: stevens.coursework ?? [],
    present: true,
  },
  {
    node: "FRM",
    span: "Aug ’26",
    kind: "Formalizing risk",
    title: "Financial Risk Manager — Part I",
    org: "GARP · Global Association of Risk Professionals",
    body: "Formalizing the risk side of the work — market and credit risk, VaR / ES, valuation, and risk models — alongside the FE degree.",
    detail: "Part I exam — August 2026",
    chips: ["Market Risk", "Credit Risk", "VaR / ES", "Valuation & Models"],
  },
  {
    node: "Target",
    span: "’26 — ’27",
    kind: "Where it points",
    title: "Quant Trading · Research · Derivatives · Risk",
    org: "Fall 2026 co-op / internship → Full-Time 2027",
    body: "The CS → FE → risk line made explicit: building and risk-managing the systems behind a trading or research desk.",
    detail: profile.availability,
    chips: profile.targets as unknown as string[],
  },
];

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Origin() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const scroller = scrollama();
    scroller
      .setup({ step: ".origin-step", offset: 0.4 })
      .onStepEnter((res: { index: number }) => setActive(res.index));
    const onResize = () => scroller.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      scroller.destroy();
    };
  }, []);

  const stage = STOPS[active];

  return (
    <section id="origin" className="relative py-14 sm:py-20">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-7">
        <SectionHeader
          index="01"
          kicker="Academic arc"
          variant="editorial"
          size="md"
          title="From systems to markets"
          lead="Computer science foundations, financial engineering training, and a focused path toward quant research, trading, derivatives, and risk."
        />

        <div className="mt-9 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Sticky stage panel - the journey "now showing" */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-[calc(var(--nav-h)+4.5rem)]">
              <div className="panel relative overflow-hidden rounded-2xl p-6">
                <div className="rule-label">{profile.trajectory}</div>

                {/* big active-stage display */}
                <div className="relative mt-5 min-h-[118px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={reduce ? false : { y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-mono text-[0.62rem] uppercase tracking-[0.14em]",
                            stage.present ? "text-accent" : "text-ink-3",
                          )}
                        >
                          {stage.kind}
                        </span>
                        {stage.present && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                          </span>
                        )}
                      </div>
                      <div className="display mt-2.5 text-[2.2rem] uppercase leading-[0.9]">
                        {stage.node}
                      </div>
                      <div className="mt-2 font-mono text-[0.82rem] text-ink-2">
                        {stage.span} · {stage.title}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* trajectory rail */}
                <div className="relative mt-6 border-t border-line pt-5">
                  <div className="flex items-stretch justify-between gap-2">
                    {STOPS.map((s, i) => {
                      const on = i === active;
                      const done = i < active;
                      return (
                        <div key={s.node} className="flex flex-1 flex-col items-center gap-2">
                          <span
                            className={cn(
                              "grid h-3.5 w-3.5 place-items-center rounded-full border transition-colors",
                              on || done
                                ? "border-accent bg-accent"
                                : "border-line-2 bg-card",
                              s.present && "ring-2 ring-accent/40 ring-offset-2 ring-offset-card",
                            )}
                          >
                            {on && <span className="h-1 w-1 rounded-full bg-accent-ink" />}
                          </span>
                          <span
                            className={cn(
                              "text-center font-mono text-[0.56rem] uppercase leading-tight tracking-[0.08em] transition-colors",
                              on ? "text-ink" : "text-ink-3",
                            )}
                          >
                            {s.node}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 h-px w-full bg-line">
                    <motion.div
                      className="h-px bg-accent"
                      animate={{ width: `${(active / (STOPS.length - 1)) * 100}%` }}
                      transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrolling steps - editorial, readable on every viewport */}
          <div className="lg:col-span-7">
            {STOPS.map((s, i) => (
              <div
                key={s.node}
                className="origin-step border-t border-line py-8 first:border-t-0 first:pt-0 lg:flex lg:min-h-[50vh] lg:flex-col lg:justify-start lg:pt-[10vh]"
              >
                <div
                  className={cn(
                    "transition-opacity duration-300",
                    active === i ? "opacity-100" : "lg:opacity-30",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "font-display text-[1.9rem] font-extrabold leading-none",
                        s.present ? "text-accent" : "text-ink-3",
                      )}
                    >
                      0{i + 1}
                    </span>
                    <div>
                      <div
                        className={cn(
                          "font-mono text-[0.66rem] uppercase tracking-[0.12em]",
                          s.present ? "text-accent" : "text-ink-3",
                        )}
                      >
                        {s.span} · {s.kind}
                      </div>
                      <div className="text-sm text-ink-3">{s.org}</div>
                    </div>
                  </div>

                  <h3 className="h-card mt-4 text-[clamp(1.5rem,3.4vw,2.2rem)]">
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-xl leading-relaxed text-ink-2">{s.body}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {s.chips.map((c) => (
                      <span key={c} className="chip">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div
                    className={cn(
                      "mt-4 font-mono text-[0.72rem]",
                      s.present ? "text-accent" : "text-ink-3",
                    )}
                  >
                    {s.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
