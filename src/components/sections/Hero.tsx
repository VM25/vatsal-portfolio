"use client";

import Image from "next/image";
import { profile, links } from "@/data/profile";
import { R } from "@/components/ui/Bits";

const TICKER = [
  "Rates risk",
  "Derivatives pricing",
  "Monte Carlo",
  "Portfolio construction",
  "Credit decisioning",
  "Stochastic calculus",
  "C++",
  "Python",
  "Signal validation",
  "Curve attribution",
  "Expected shortfall",
  "Market microstructure",
];

/**
 * The name at full width, the portrait as a printed plate beside it, and a
 * running band of what the work is made of — the band is the one piece of
 * ambient motion on the page and it stops when you point at it.
 */
export function Hero() {
  return (
    <header
      id="top"
      className="relative overflow-hidden pt-[calc(var(--bar)+clamp(3rem,8vw,6rem))]"
    >
      {/*
        Two soft fields of colour behind the masthead — saffron low and left,
        a cool one high and right. They are what keep the opening from reading
        as a flat black rectangle.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(48rem 32rem at 6% 86%, color-mix(in srgb, var(--saffron) 22%, transparent), transparent 66%), radial-gradient(42rem 30rem at 88% 4%, color-mix(in srgb, var(--nocturnal) 78%, transparent), transparent 68%), radial-gradient(30rem 24rem at 62% 60%, color-mix(in srgb, var(--midnight) 85%, transparent), transparent 72%)",
        }}
      />
      <div className="shell">
        <R>
          <p className="tag">{profile.location}</p>
        </R>

        <div className="mt-7 grid items-end gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <R d={1}>
              <h1 className="mega">
                Vatsal
                <br />
                Maniar
              </h1>
            </R>
            <R d={3}>
              <p className="lede mt-8">{profile.standfirst}</p>
            </R>
            <R d={4}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#projects" className="btn">
                  See the projects
                </a>
                <a href={links.resume} target="_blank" rel="noreferrer noopener" className="btn btn--ghost">
                  Résumé
                </a>
                <span className="num ml-1 text-[0.72rem] uppercase tracking-[0.16em] text-aqua">
                  {profile.availability}
                </span>
              </div>
            </R>
          </div>

          <R d={2} className="min-w-0 lg:col-span-4">
            <div className="card card--lit card--ticked relative overflow-hidden">
              {/* The photograph, as taken. No duotone, no screen, no filter. */}
              <Image
                src="/images/vatsal-maniar.jpg"
                alt={profile.name}
                width={1200}
                height={1601}
                priority
                sizes="(min-width: 1024px) 28vw, 80vw"
                className="block w-full"
              />
              <div className="flex items-baseline justify-between gap-3 border-t border-nocturnal/50 px-3 py-2.5">
                <span className="num text-[0.62rem] uppercase tracking-[0.16em] text-aqua">
                  M.S. Financial Engineering
                </span>
                <span className="num text-[0.62rem] text-saffron">Stevens</span>
              </div>
            </div>
          </R>
        </div>
      </div>

      <R d={5} className="mt-14">
        <div className="ticker">
          <div className="ticker__track">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex" aria-hidden={copy === 1}>
                {TICKER.map((t) => (
                  <span key={t} className="ticker__item">
                    <i /> {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </R>
    </header>
  );
}
