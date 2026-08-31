"use client";

import { profile } from "@/data/profile";
import { study } from "@/data/study";
import { R } from "@/components/ui/Bits";

/**
 * The route, as a drawn line with four stops that light up in sequence, and the
 * two degrees beside it. The line is the only ornament in the section and it
 * carries actual information.
 */
export function Origin() {
  return (
    <section id="origin" className="section">
      <div className="shell">
        <R>
          <p className="tag">01 — Route</p>
        </R>
        <R d={1}>
          <h2 className="h1 mt-4">How I got here</h2>
        </R>

        {/* the route */}
        <R d={2} className="mt-12">
          <ol className="grid gap-0 sm:grid-cols-4">
            {profile.route.map((r, i) => (
              <li key={r.place} className="relative">
                <div className="flex items-center gap-3">
                  <span
                    className="block h-2.5 w-2.5 shrink-0"
                    style={{ background: i === 3 ? "var(--saffron)" : "var(--aqua)" }}
                  />
                  <span
                    className="hidden h-px flex-1 sm:block"
                    style={{
                      background:
                        i === 3
                          ? "transparent"
                          : "linear-gradient(to right, var(--nocturnal), color-mix(in srgb, var(--nocturnal) 20%, transparent))",
                    }}
                  />
                </div>
                <div className="pb-6 pt-4 pr-6">
                  <p className="num text-[0.62rem] uppercase tracking-[0.18em] text-aqua">
                    0{i + 1}
                  </p>
                  <h3 className="h2 mt-1.5 text-[clamp(1.4rem,2.4vw,2rem)]">{r.place}</h3>
                  <p className="mt-1 text-[0.875rem] text-snow/70">{r.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </R>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-6">
            {profile.about.map((para, i) => (
              <R key={i} d={i}>
                <p className="prose mb-5 last:mb-0">{para}</p>
              </R>
            ))}
          </div>

          <div className="min-w-0 lg:col-span-5 lg:col-start-8">
            {study.map((s, i) => (
              <R key={s.id} d={i + 1}>
                <div className="card card--lit mb-4 p-5 last:mb-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="h3 text-[1rem]">{s.school}</h3>
                    <span className="num shrink-0 text-[0.68rem] text-aqua">{s.period}</span>
                  </div>
                  <p className="mt-2 text-[0.9375rem] text-praxeti">{s.degree}</p>
                  <p className="num mt-1 text-[0.75rem] text-aqua">{s.detail}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {s.courses.map((c) => (
                      <li key={c} className="chip">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </R>
            ))}
            <R d={3}>
              <p className="num mt-4 text-[0.72rem] uppercase tracking-[0.14em] text-creamy">
                {profile.certification}
              </p>
            </R>
          </div>
        </div>
      </div>
    </section>
  );
}
