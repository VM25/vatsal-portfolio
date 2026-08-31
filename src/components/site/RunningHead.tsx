"use client";

import { useEffect, useState } from "react";
import { navItems, contents } from "@/data/nav";
import { useReveal } from "@/hooks/useReveal";

/**
 * The running head a printed record carries: who, and which section you are in.
 *
 * Scrollspy runs on the same primitive as everything else — an
 * IntersectionObserver, not a scroll listener — so it costs nothing per frame
 * and behaves the same in Safari as in Chrome. It also owns the page's single
 * reveal observer, since it is the one client component that always mounts.
 */
export function RunningHead() {
  useReveal();
  const [active, setActive] = useState<string>("masthead");

  useEffect(() => {
    const sections = navItems
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        }
        // Whichever tracked section occupies the most of the viewport wins.
        let best: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of visible) {
          if (ratio >= bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const current = contents.find((c) => c.id === active);

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-hair-2 bg-paper/85 backdrop-blur-[6px]">
        <div className="shell flex h-[var(--head-h)] items-center justify-between gap-6">
          <a
            href="#masthead"
            className="data text-[0.8125rem] font-medium tracking-[0.02em] text-ink"
          >
            Vatsal Maniar
          </a>

          {/* section links — desktop */}
          <nav aria-label="Sections" className="hidden items-center gap-6 md:flex">
            {contents.map((c) => {
              const on = c.id === active;
              return (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  aria-current={on ? "true" : undefined}
                  className={`data text-[0.75rem] tracking-[0.06em] transition-colors duration-300 ${
                    on ? "text-signal-ink" : "text-ink-38 hover:text-ink"
                  }`}
                >
                  {c.label}
                </a>
              );
            })}
          </nav>

          {/* current section — mobile */}
          <span className="data text-[0.75rem] text-ink-38 md:hidden">
            {current ? `§${current.numeral} ${current.label}` : "Masthead"}
          </span>
        </div>
      </div>
    </div>
  );
}
