"use client";

import { paper } from "@/data/research";
import { links } from "@/data/profile";
import { R, Count } from "@/components/ui/Bits";

/**
 * The paper, led by its result rather than its title — the interesting thing
 * about it is that the clever rule lost.
 */
export function Research() {
  return (
    <section
      id="research"
      className="section"
      style={{ ["--accent"]: "var(--toxic)" } as React.CSSProperties}
    >
      <div className="shell">
        <div className="sec-head">
          <R>
            <p className="tag">02 — Research</p>
          </R>
          <R d={1}>
            <h2 className="h1">The hedge that stopped working</h2>
          </R>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <R d={2} className="min-w-0 lg:col-span-7">
            <div data-drift className="card card--lit card--ticked h-full p-6 sm:p-8">
              <p className="lede !max-w-[34ch] !text-creamy">{paper.premise}</p>
              <h3 className="h2 mt-8 text-[clamp(1.3rem,2.2vw,1.8rem)]">{paper.title}</h3>
              <p className="num mt-2 text-[0.7rem] uppercase tracking-[0.16em] text-aqua">
                {paper.period}
              </p>
              <p className="prose mt-5 text-[0.95rem]">{paper.detail}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={links.memo} target="_blank" rel="noreferrer noopener" className="btn">
                  Read it ↗
                </a>
                <a href={links.prospectus} target="_blank" rel="noreferrer noopener" className="btn btn--ghost">
                  Prospectus
                </a>
              </div>
            </div>
          </R>

          <R d={3} className="min-w-0 lg:col-span-5">
            <div className="border-l-2 border-toxic pl-5">
              <p className="num text-[0.62rem] uppercase tracking-[0.2em] text-toxic">
                What it found
              </p>
              <p className="mt-2 text-[1rem] leading-relaxed text-praxeti">{paper.finding}</p>
            </div>

            <div className="mt-8 grid gap-5">
              {paper.figures.map((f) => (
                <div key={f.label} className="stat">
                  <div className="stat__v">
                    <Count value={f.value} />
                  </div>
                  <div className="stat__k">{f.label}</div>
                </div>
              ))}
            </div>

            <p className="mt-7 border-t border-nocturnal/50 pt-4 text-[0.8125rem] leading-relaxed text-aqua">
              {paper.limit}
            </p>
          </R>
        </div>
      </div>
    </section>
  );
}
