"use client";

import { motion, useReducedMotion } from "framer-motion";

const UP = "#6aa87f";
const DOWN = "#c5604f";
const BRASS = "#c6a45c";
const INK = "#efe9dd";
const DIM = "#8c8472";

// Schematic event-market depth book: binary contracts priced as implied
// probability, asks above the implied mark, bids below, with the portfolio and
// single-name risk caps that govern allocation. Numbers are illustrative scale
// labels, not performance.
const ROWS = [
  { p: "0.67", side: "ask", size: 0.42 },
  { p: "0.65", side: "ask", size: 0.56 },
  { p: "0.63", side: "ask", size: 0.74 },
  { p: "0.61", side: "ask", size: 0.9 },
  { p: "0.59", side: "bid", size: 0.95 },
  { p: "0.57", side: "bid", size: 0.71 },
  { p: "0.55", side: "bid", size: 0.5 },
  { p: "0.53", side: "bid", size: 0.34 },
] as const;

export function EventLadder({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const spine = 70;
  const maxW = 188;
  const rowH = 24;
  const top = 44;

  return (
    <svg viewBox="0 0 360 320" className={className} role="img" aria-label="Event-market depth book with portfolio risk caps">
      {/* spine */}
      <line x1={spine} y1={top - 8} x2={spine} y2={top + ROWS.length * rowH + 2} stroke="rgba(239,233,221,0.14)" strokeWidth="1" />

      {ROWS.map((r, i) => {
        const y = top + i * rowH;
        const color = r.side === "ask" ? DOWN : UP;
        return (
          <g key={r.p}>
            <text x={spine - 12} y={y + 13} textAnchor="end" fontFamily="var(--font-mono)" fontSize="11" fill={DIM}>
              {r.p}
            </text>
            <motion.rect
              x={spine + 2}
              y={y + 4}
              height={rowH - 10}
              width={r.size * maxW}
              rx="1.5"
              fill={color}
              fillOpacity="0.5"
              style={{ transformBox: "fill-box", transformOrigin: "left" }}
              initial={reduce ? false : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.05, duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
            />
            <rect x={spine + 2} y={y + 4} height={rowH - 10} width={r.size * maxW} rx="1.5" fill="none" stroke={color} strokeOpacity="0.55" strokeWidth="1" />
          </g>
        );
      })}

      {/* implied mark — the brass mid between asks and bids */}
      <motion.g initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
        <line x1={spine - 26} y1={top + 4 * rowH} x2={spine + maxW + 8} y2={top + 4 * rowH} stroke={BRASS} strokeWidth="1.4" strokeDasharray="2 3" />
        <text x={spine + maxW + 12} y={top + 4 * rowH + 4} fontFamily="var(--font-mono)" fontSize="10" fill={BRASS}>
          IMPLIED 0.60
        </text>
      </motion.g>

      {/* risk caps — ApexGP's real allocation limits */}
      <g transform="translate(0 268)">
        <text x={spine - 12} y={4} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.1em" fill={DIM}>
          RISK
        </text>
        {[
          { label: "PORT CAP", cap: 0.3 },
          { label: "NAME CAP", cap: 0.15 },
        ].map((g, i) => (
          <g key={g.label} transform={`translate(${spine + 2} ${i * 22 - 4})`}>
            <text x={0} y={9} fontFamily="var(--font-mono)" fontSize="9" fill={DIM}>
              {g.label}
            </text>
            <rect x={70} y={1} width={150} height={8} rx="2" fill="rgba(239,233,221,0.06)" />
            <motion.rect
              x={70}
              y={1}
              height={8}
              width={150 * g.cap}
              rx="2"
              fill={BRASS}
              fillOpacity="0.7"
              style={{ transformBox: "fill-box", transformOrigin: "left" }}
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7 + i * 0.1, duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
            />
            <text x={228} y={9} fontFamily="var(--font-mono)" fontSize="9" fill={INK}>
              {Math.round(g.cap * 100)}%
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
