"use client";

import { profile, links } from "@/data/profile";
import { work } from "@/data/work";
import { posts, honour } from "@/data/posts";
import { study } from "@/data/study";
import { paper } from "@/data/research";
import { In, Kinetic } from "@/components/ui/Motion";
import { Open } from "@/components/ui/Open";

/* Each chapter is one world. The camera is already there by the time you read. */

function Figures({
  items,
}: {
  items: readonly { value: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {items.map((f) => (
        <div key={f.label} className="border-t border-nocturnal/70 pt-3">
          <div className="figure-num text-[1.3rem] leading-none">{f.value}</div>
          <div className="mt-2 text-[0.8125rem] leading-snug text-aqua">
            {f.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================ 01 APPROACH == */

export function Approach() {
  return (
    <section data-chapter id="approach" className="chapter">
      <div className="wrap">
        <In>
          <p className="readout">{profile.location}</p>
        </In>

        <h1 className="mega mt-6 max-w-[13ch] lg:max-w-[62%]">
          <Kinetic text="VATSAL" />
          <br />
          <Kinetic text="MANIAR" />
        </h1>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <In delay={0.5} className="lg:col-span-6">
            <p className="lede">{profile.standfirst}</p>
          </In>
          <In delay={0.65} className="lg:col-span-5 lg:col-start-8">
            <div className="flex flex-wrap items-center gap-3">
              <a href="#work" className="go">
                Begin
              </a>
              <a
                href={links.resume}
                target="_blank"
                rel="noreferrer noopener"
                className="go go--ghost"
              >
                Résumé
              </a>
            </div>
            <p className="readout mt-6 !text-creamy">{profile.availability}</p>
          </In>
        </div>
      </div>
    </section>
  );
}

/* ============================================================== 02 ORIGIN == */

export function Origin() {
  return (
    <section data-chapter id="origin" className="chapter">
      <div className="wrap">
        <In>
          <p className="readout">Chapter 02 — Origin</p>
        </In>
        <h2 className="chapter-title mt-5">
          <Kinetic text="THE ROUTE" />
        </h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <In delay={0.25} className="lg:col-span-5">
            <div className="panel--deep panel">
              <ol className="grid gap-0">
                {profile.route.map((r, i) => (
                  <li
                    key={r.place}
                    className="flex items-baseline gap-4 border-b border-blue/50 py-3 last:border-0"
                  >
                    <span className="readout !text-arctic">
                      0{i + 1}
                    </span>
                    <span className="sub-title !text-arctic !text-[1.5rem]">
                      {r.place}
                    </span>
                    <span className="ml-auto text-[0.8125rem] text-aqua">
                      {r.note}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </In>

          <In delay={0.4} className="lg:col-span-6 lg:col-start-7">
            <p className="prose">{profile.about[0]}</p>
            <p className="prose mt-5">{profile.about[1]}</p>
          </In>
        </div>
      </div>
    </section>
  );
}

/* ========================================================== 03 FOUNDATION == */

export function Foundation() {
  return (
    <section data-chapter id="foundation" className="chapter">
      <div className="wrap">
        <In>
          <p className="readout">Chapter 03 — Foundation</p>
        </In>
        <h2 className="chapter-title mt-5">
          <Kinetic text="THE FRAME" />
        </h2>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          {study.map((s, i) => (
            <In key={s.id} delay={0.25 + i * 0.12} className="lg:col-span-6">
              <div className="panel--slate panel h-full">
                <p className="readout">{s.period}</p>
                <h3 className="sub-title mt-3">{s.school}</h3>
                <p className="mt-2 text-[0.9375rem] text-snow">{s.degree}</p>
                <p className="mt-1 font-mono text-[0.8125rem] text-aqua">
                  {s.detail}
                </p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {s.courses.map((c) => (
                    <li key={c} className="chip">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </In>
          ))}
        </div>

        <In delay={0.5}>
          <p className="readout mt-8 !text-creamy">{profile.certification}</p>
        </In>
      </div>
    </section>
  );
}

/* ================================================================ 04 WORK == */

export function Work() {
  return (
    <section data-chapter id="work" className="chapter !items-start">
      <div className="wrap">
        <In>
          <p className="readout">Chapter 04 — The Work</p>
        </In>
        <h2 className="chapter-title mt-5">
          <Kinetic text="SEVEN" />
        </h2>
        <In delay={0.3}>
          <p className="lede mt-5">
            Open one to see what it does and what it found.
          </p>
        </In>

        <In delay={0.4}>
          <div className="panel--warm panel mt-10 !py-2">
            {work.map((w, i) => (
              <Open
                key={w.id}
                index={String(i + 1).padStart(2, "0")}
                title={w.title}
                meta={`${w.field} · ${w.year}`}
              >
                <div className="grid gap-8 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <p className="prose">{w.detail}</p>
                    <div className="mt-6 border-l-2 border-saffron pl-5">
                      <p className="text-[1rem] leading-relaxed text-creamy">
                        {w.result}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-x-7">
                      {w.live ? (
                        <a
                          href={w.live}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="tie"
                        >
                          Open it ↗
                        </a>
                      ) : null}
                      {w.code ? (
                        <a
                          href={w.code}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="tie"
                        >
                          Source ↗
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div className="lg:col-span-4 lg:col-start-9">
                    <Figures items={w.figures} />
                  </div>
                </div>
              </Open>
            ))}
          </div>
        </In>
      </div>
    </section>
  );
}

/* ============================================================ 05 QUESTION == */

export function Question() {
  return (
    <section data-chapter id="question" className="chapter">
      <div className="wrap">
        <In>
          <p className="readout">Chapter 05 — The Question</p>
        </In>
        <h2 className="chapter-title mt-5">
          <Kinetic text="WHAT BROKE" />
        </h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <In delay={0.25} className="lg:col-span-7">
            <p className="lede">{paper.premise}</p>
            <div className="panel mt-8">
              <h3 className="sub-title">{paper.title}</h3>
              <p className="readout mt-2">{paper.period}</p>
              <p className="prose mt-5">{paper.detail}</p>
              <div className="mt-6 border-l-2 border-toxic pl-5">
                <p className="text-[1rem] leading-relaxed text-creamy">
                  {paper.finding}
                </p>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={links.memo}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="go"
                >
                  Read it
                </a>
                <a
                  href={links.prospectus}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="go go--ghost"
                >
                  Prospectus
                </a>
              </div>
            </div>
          </In>

          <In delay={0.4} className="lg:col-span-4 lg:col-start-9">
            <Figures items={paper.figures} />
            <p className="mt-7 border-t border-garnet/70 pt-4 text-[0.8125rem] leading-relaxed text-aqua">
              {paper.limit}
            </p>
          </In>
        </div>
      </div>
    </section>
  );
}

/* ============================================================= 06 ARRIVAL == */

export function Arrival() {
  return (
    <section data-chapter id="arrival" className="chapter !items-start">
      <div className="wrap">
        <In>
          <p className="readout">Chapter 06 — Arrival</p>
        </In>
        <h2 className="chapter-title mt-5">
          <Kinetic text="WHERE I'VE BEEN" />
        </h2>

        <In delay={0.3}>
          <div className="panel--dark panel mt-9 !py-2">
            {posts.map((p, i) => (
              <Open
                key={p.id}
                index={String(i + 1).padStart(2, "0")}
                title={p.role}
                meta={`${p.org} · ${p.period}`}
              >
                <div className="grid gap-8 lg:grid-cols-12">
                  <div className="lg:col-span-8">
                    <p className="prose">{p.detail}</p>
                    <ul className="mt-5 grid gap-2.5">
                      {p.points.map((b) => (
                        <li
                          key={b}
                          className="relative max-w-[62ch] pl-5 text-[0.9375rem] leading-relaxed text-snow before:absolute before:left-0 before:top-[0.72em] before:h-px before:w-2.5 before:bg-saffron"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="lg:col-span-3 lg:col-start-10">
                    <div className="border-t border-nocturnal/70 pt-3">
                      <div className="figure-num text-[1.3rem] leading-none">
                        {p.figure.value}
                      </div>
                      <div className="mt-2 text-[0.8125rem] text-aqua">
                        {p.figure.label}
                      </div>
                    </div>
                  </div>
                </div>
              </Open>
            ))}
          </div>
        </In>

        <In delay={0.45}>
          <p className="readout mt-6 !text-creamy">{honour}</p>
        </In>

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <In delay={0.2} className="lg:col-span-7">
            <h3 className="chapter-title !text-[clamp(2.5rem,7vw,5rem)]">
              Let&rsquo;s talk.
            </h3>
            <p className="lede mt-5">{profile.status}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={links.email} className="go">
                Email me
              </a>
              <a
                href={links.resume}
                target="_blank"
                rel="noreferrer noopener"
                className="go go--ghost"
              >
                Résumé
              </a>
            </div>
          </In>

          <In delay={0.35} className="lg:col-span-4 lg:col-start-9">
            <ul className="panel--ink panel">
              {[
                { k: "Email", v: profile.email, href: links.email, out: false },
                { k: "LinkedIn", v: "vatsal-maniar", href: links.linkedin, out: true },
                { k: "GitHub", v: "VM25", href: links.github, out: true },
                {
                  k: "Phone",
                  v: profile.phone,
                  href: `tel:${profile.phone.replace(/[^\d+]/g, "")}`,
                  out: false,
                },
              ].map((c) => (
                <li
                  key={c.k}
                  className="flex flex-wrap items-center gap-x-5 border-b border-blue/50 last:border-0"
                >
                  <span className="readout w-20 shrink-0">{c.k}</span>
                  <a
                    href={c.href}
                    className="tie"
                    {...(c.out
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                  >
                    {c.v}
                    {c.out ? " ↗" : ""}
                  </a>
                </li>
              ))}
            </ul>
            <p className="readout mt-6">© 2026 — {profile.location}</p>
          </In>
        </div>
      </div>
    </section>
  );
}
