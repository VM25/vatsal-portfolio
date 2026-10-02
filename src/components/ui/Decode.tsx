"use client";

import { useEffect, useRef } from "react";

/** Glyphs the name resolves out of — notation, not noise. */
const GLYPHS = "∂Σ∫σμΔ∇√π∞≈±λθ0123456789";

/*
  Timing, in ms. The whole name settles in about 0.6s: every letter starts
  scrambled, glyphs tick every TICK, and letters land left to right STEP apart.
*/
const TICK = 45;
const LEAD = 140;
const STEP = 42;

/**
 * Runs once on load: each letter cycles through mathematical glyphs and lands
 * on the real character. The real letters are in the layout from the first
 * paint (transparent until they land), so nothing shifts while it runs.
 */
export function Decode({ lines, className = "" }: { lines: string[]; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cells = Array.from(root.querySelectorAll<HTMLElement>(".dc"));
    const land = (el: HTMLElement) => el.classList.add("on");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cells.forEach(land);
      return;
    }

    let raf = 0;
    let start = 0;
    let lastTick = -TICK;
    const frame = (now: number) => {
      if (!start) start = now;
      const t = now - start;
      const tick = t - lastTick >= TICK;
      if (tick) lastTick = t;

      let pending = 0;
      cells.forEach((el, i) => {
        if (el.classList.contains("on")) return;
        if (t >= LEAD + i * STEP) {
          land(el);
          return;
        }
        pending++;
        if (tick) el.dataset.g = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      });
      if (pending) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  let n = 0;
  return (
    <span className={className}>
      <span className="sr-only">{lines.join(" ")}</span>
      <span ref={ref} aria-hidden className="decode">
        {lines.map((line, li) => (
          <span key={li}>
            {li > 0 ? <br /> : null}
            {Array.from(line).map((ch, ci) => {
              // Deterministic first glyph, so server and client render the same.
              const g = GLYPHS[(n++ * 7) % GLYPHS.length];
              return (
                <span key={ci} className="dc" data-g={g}>
                  {ch}
                </span>
              );
            })}
          </span>
        ))}
      </span>
      <noscript
        dangerouslySetInnerHTML={{
          __html: "<style>.decode .dc{color:inherit}.decode .dc::after{content:none}</style>",
        }}
      />
    </span>
  );
}
