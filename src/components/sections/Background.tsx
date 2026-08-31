"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "@/data/profile";
import { study } from "@/data/study";
import { R } from "@/components/ui/Bits";

/**
 * The route, as a drawn line with four stops that light up in sequence, and the
 * two degrees beside it. The line is the only ornament in the section and it
 * carries actual information.
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

        {/* the route */}
        <R d={2}>
          <div ref={routeRef} className="relative">
            {/* rail the dots sit on */}
            <div className="pointer-events-none absolute left-0 right-0 top-[5px] hidden h-px bg-nocturnal/40 sm:block" />
            <div
              className="route-line pointer-events-none absolute left-0 right-0 top-[5px] hidden h-px origin-left sm:block"
              style={{
                background:
                  "linear-gradient(to right, var(--aqua), var(--saffron))",
              }}
            />
            <ol className="grid gap-6 sm:grid-cols-3 sm:gap-0">
              {profile.route.map((r, i) => (
                <li key={r.place} className="relative sm:pr-8">
                  <span
                    className="route-dot block h-2.5 w-2.5"
                    style={{
                      background:
                        i === profile.route.length - 1
                          ? "var(--saffron)"
                          : "var(--aqua)",
                    }}
                  />
                  <div className="pt-4">
                    <p className="num text-[0.62rem] uppercase tracking-[0.18em] text-aqua">
                      0{i + 1}
                    </p>
                    <h3 className="h2 mt-2 text-[clamp(1.5rem,2.6vw,2.1rem)]">
                      {r.place}
                    </h3>
                    <p className="mt-1.5 text-[0.9rem] text-snow/75">{r.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </R>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-6">
            {profile.about.map((para, i) => (
              <R key={i} d={i}>
                <p className="prose">{para}</p>
              </R>
            ))}
          </div>

          <div className="flex min-w-0 flex-col gap-4 lg:col-span-5 lg:col-start-8">
            {study.map((s, i) => (
              <R key={s.id} d={i + 1}>
                <div className="card card--lit p-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="h3 text-[1rem]">{s.school}</h3>
                    <span className="num shrink-0 text-[0.68rem] text-aqua">{s.period}</span>
                  </div>
                  <p className="mt-2 text-[0.9375rem] text-praxeti">{s.degree}</p>
                  <p className="num mt-1 text-[0.75rem] text-aqua">{s.detail}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {s.courses.map((c) => (
                      <li key={c} className="chip">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </R>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
