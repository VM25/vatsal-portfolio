"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "@/data/profile";
import { study, credential } from "@/data/study";
import { R } from "@/components/ui/Bits";

/**
 * The route is the spine: a drawn line with three stops that light up in
 * sequence, and each degree hangs under the stop where it was earned. Mumbai is
 * the narrow origin column. The FRM sits under both degrees as the one
 * credential still in progress — this is the only place it appears.
 */
export function Background() {
  const routeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = routeRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      /*
        The line draws itself as the section passes, and each stop lights as the
        line reaches it. Scrubbed, and scaleX/opacity only — nothing here can
        trigger layout, so it stays smooth on a cheap machine.
      */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 78%",
          end: "bottom 62%",
          scrub: 0.8,
        },
      });
      tl.fromTo(".route-line", { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
      gsap.utils.toArray<HTMLElement>(".route-dot").forEach((dot, i) => {
        tl.fromTo(
          dot,
          { scale: 0.4, opacity: 0.25 },
          { scale: 1, opacity: 1, ease: "none", duration: 0.18 },
          i * 0.4,
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="background"
      className="section"
      style={{ ["--accent"]: "var(--aqua)" } as React.CSSProperties}
    >
      <div className="shell">
        <div className="sec-head">
          <R>
            <p className="tag">03 — Background</p>
          </R>
          <R d={1}>
            <h2 className="h1">Computer science, then markets</h2>
          </R>
        </div>

        <div ref={routeRef} className="relative">
          {/* rail the dots sit on */}
          <div className="pointer-events-none absolute left-0 right-0 top-[5px] hidden h-px bg-nocturnal/40 lg:block" />
          <div
            className="route-line pointer-events-none absolute left-0 right-0 top-[5px] hidden h-px origin-left lg:block"
            style={{
              background: "linear-gradient(to right, var(--aqua), var(--saffron))",
            }}
          />

          <ol className="grid gap-10 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-0">
            {profile.route.map((r, i) => {
              const last = i === profile.route.length - 1;
              const s = "study" in r ? study.find((x) => x.id === r.study) : undefined;
              return (
                <li
                  key={r.place}
                  className={`flex min-w-0 flex-col ${s ? "lg:col-span-5" : "lg:col-span-2"}`}
                >
                  <R d={i}>
                    <span
                      className="route-dot block h-2.5 w-2.5"
                      style={{ background: last ? "var(--saffron)" : "var(--aqua)" }}
                    />
                    <div className="pt-4">
                      <p className="num text-[0.62rem] uppercase tracking-[0.18em] text-aqua">
                        0{i + 1}
                      </p>
                      <h3 className="h2 mt-2 text-[clamp(1.5rem,2.6vw,2.1rem)]">{r.place}</h3>
                      <p className="mt-1.5 text-[0.9rem] text-snow/75">{r.note}</p>
                    </div>
                  </R>

                  {s ? (
                    <R d={i + 1} className="mt-6 flex flex-1 flex-col">
                      <div
                        data-drift
                        className="card card--lit flex flex-1 flex-col p-5"
                        style={{ ["--accent"]: last ? "var(--saffron)" : "var(--aqua)" } as React.CSSProperties}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h4 className="h3 text-[1rem]">{s.school}</h4>
                          <span className="num shrink-0 text-[0.68rem] text-aqua">{s.period}</span>
                        </div>
                        <p className="mt-2 text-[0.9375rem] text-praxeti">{s.degree}</p>
                        <p className="num mt-1 text-[0.75rem] text-aqua">{s.detail}</p>
                        <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
                          {s.courses.map((c) => (
                            <li key={c} className="chip">
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </R>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>

        {/* the credential in progress — aligned to the degree columns, not the origin */}
        <div className="mt-6 grid lg:grid-cols-12 lg:gap-x-6">
          <R d={3} className="min-w-0 lg:col-span-10 lg:col-start-3">
            <div
              data-drift
              className="card card--lit card--ticked !border-l-2 !border-l-saffron px-5 py-5 sm:px-7"
              style={{ ["--accent"]: "var(--saffron)" } as React.CSSProperties}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                <div className="min-w-0">
                  <p className="num text-[0.62rem] uppercase tracking-[0.2em] text-saffron">
                    Certification · in progress
                  </p>
                  <p className="h2 mt-2 text-[clamp(1.35rem,2.4vw,1.9rem)]">
                    <span className="text-saffron">{credential.body}</span> {credential.title}
                  </p>
                  <p className="mt-1.5 text-[0.85rem] text-snow/70">{credential.full}</p>
                </div>
                <div className="shrink-0 border-t border-saffron/40 pt-3 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
                  <p className="num text-[0.62rem] uppercase tracking-[0.18em] text-aqua">Exam</p>
                  <p className="num mt-1.5 text-[1.05rem] font-bold text-creamy">
                    {credential.sitting}
                  </p>
                </div>
              </div>
            </div>
          </R>
        </div>
      </div>
    </section>
  );
}
