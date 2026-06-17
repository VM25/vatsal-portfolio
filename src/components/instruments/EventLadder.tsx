"use client";

import { motion, useReducedMotion } from "framer-motion";

const INK = "var(--ink)";
const ACCENT = "var(--p-apexgp)";
const UP = "var(--up)";
const DOWN = "var(--down)";
const MUTE = "var(--ink-3)";
const LINE = "var(--line-2)";
const EASE = [0.22, 0.61, 0.36, 1] as const;

const ROWS = [
  { p: "0.67", side: "ask", size: 0.4 },
  { p: "0.65", side: "ask", size: 0.55 },
  { p: "0.63", side: "ask", size: 0.72 },
  { p: "0.61", side: "ask", size: 0.9 },
  { p: "0.59", side: "bid", size: 0.95 },
  { p: "0.57", side: "bid", size: 0.7 },
  { p: "0.55", side: "bid", size: 0.5 },
  { p: "0.53", side: "bid", size: 0.34 },
] as const;

export function EventLadder({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const spine = 58;
  const maxW = 196;
  const rowH = 22;
  const top = 40;
  const grow = (delay: number) => ({
    initial: reduce ? false : ({ scaleX: 0, opacity: 0 } as const),
    whileInView: { scaleX: 1, opacity: 1 } as const,
    viewport: { once: true, margin: "-8%" } as const,
    transition: { delay, duration: 0.5, ease: EASE } as const,
  });

  return (
    <svg viewBox="0 0 360 312" className={className} role="img" aria-label="Implied-probability book with bid/ask depth and portfolio risk caps">
      <text x={spine - 44} y={20} fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.04em" fill={MUTE}>
        IMPLIED PROBABILITY BOOK
      </text>
      <line x1={spine} y1={top - 6} x2={spine} y2={top + ROWS.length * rowH + 2} stroke={LINE} strokeWidth="1" />

      {ROWS.map((r, i) => {
        const y = top + i * rowH;
        const color = r.side === "ask" ? DOWN : UP;
        return (
          <g key={r.p}>
            <text x={spine - 10} y={y + 12} textAnchor="end" fontFamily="var(--font-mono)" fontSize="10.5" fill={MUTE}>
              {r.p}
            </text>
            <motion.rect
              x={spine + 2}
              y={y + 3}
              height={rowH - 8}
              width={r.size * maxW}
              rx="2"
              fill={color}
              fillOpacity="0.18"
              stroke={color}
              strokeOpacity="0.6"
              strokeWidth="1"
              style={{ transformBox: "fill-box", transformOrigin: "left" }}
              {...grow(0.1 + i * 0.045)}
            />
          </g>
        );
      })}

      <motion.g
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <line x1={spine - 30} y1={top + 4 * rowH} x2={spine + maxW + 6} y2={top + 4 * rowH} stroke={ACCENT} strokeWidth="1.4" strokeDasharray="3 3" />
        <text x={spine + maxW + 10} y={top + 4 * rowH + 4} fontFamily="var(--font-mono)" fontSize="10" fill={ACCENT}>0.60</text>
      </motion.g>

      <g transform="translate(0 252)">
        <text x={spine - 44} y={6} fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.06em" fill={MUTE}>ALLOCATION CAPS</text>
        {[
          { label: "PORTFOLIO", cap: 0.3 },
          { label: "SINGLE-MKT", cap: 0.15 },
        ].map((g, i) => (
          <g key={g.label} transform={`translate(${spine - 44} ${20 + i * 22})`}>
            <text x={0} y={9} fontFamily="var(--font-mono)" fontSize="9.5" fill={INK}>{g.label}</text>
            <rect x={74} y={1} width={170} height={9} rx="2.5" fill="var(--line)" />
            <motion.rect
              x={74}
              y={1}
              height={9}
              width={170 * g.cap}
              rx="2.5"
              fill={ACCENT}
              fillOpacity="0.85"
              style={{ transformBox: "fill-box", transformOrigin: "left" }}
              {...grow(0.6 + i * 0.1)}
            />
            <text x={252} y={9} fontFamily="var(--font-mono)" fontSize="9.5" fill={INK}>{Math.round(g.cap * 100)}%</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
