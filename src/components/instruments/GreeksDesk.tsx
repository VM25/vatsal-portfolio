"use client";

import { motion, useReducedMotion } from "framer-motion";

const UP = "#6aa87f";
const DOWN = "#c5604f";
const BRASS = "#c6a45c";
const INK = "#efe9dd";
const DIM = "#8c8472";

// Options market-making desk: a two-sided quote and net Greek exposures held
// inside risk limits, plus the vol smile being quoted against. Schematic.
const GREEKS = [
  { g: "Δ", v: 0.34, label: "+0.34" },
  { g: "Γ", v: 0.14, label: "+0.14" },
  { g: "V", v: 0.27, label: "+0.27" },
  { g: "Θ", v: -0.19, label: "−0.19" },
] as const;

export function GreeksDesk({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const cx = 196;
  const half = 104;
  const limit = 0.5; // bars are fractions of the managed limit

  return (
    <svg viewBox="0 0 360 320" className={className} role="img" aria-label="FX options market-making desk: quote, Greeks, and vol smile">
      <text x={8} y={18} fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.16em" fill={DIM}>
        FX OPTIONS DESK
      </text>
      <text x={8} y={44} fontFamily="var(--font-display)" fontSize="20" fill={BRASS}>
        GBP/MXN
      </text>

      {/* two-sided quote */}
      <motion.g initial={reduce ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <text x={150} y={20} fontFamily="var(--font-mono)" fontSize="9" fill={DIM}>BID</text>
        <text x={150} y={44} fontFamily="var(--font-mono)" fontSize="20" fill={UP}>24.18</text>
        <text x={250} y={20} fontFamily="var(--font-mono)" fontSize="9" fill={DIM}>ASK</text>
        <text x={250} y={44} fontFamily="var(--font-mono)" fontSize="20" fill={DOWN}>24.21</text>
        <text x={150} y={62} fontFamily="var(--font-mono)" fontSize="9" fill={DIM}>SPREAD 0.03 · 1M ATM</text>
      </motion.g>

      <line x1={8} y1={76} x2={352} y2={76} stroke="rgba(239,233,221,0.1)" strokeWidth="1" />

      {/* Greek exposures within limits */}
      <text x={8} y={96} fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.14em" fill={DIM}>
        NET GREEKS · WITHIN LIMITS
      </text>
      {GREEKS.map((row, i) => {
        const y = 116 + i * 30;
        const w = (Math.abs(row.v) / limit) * half;
        const neg = row.v < 0;
        return (
          <g key={row.g}>
            <text x={36} y={y + 9} textAnchor="end" fontFamily="var(--font-display)" fontSize="15" fill={INK}>
              {row.g}
            </text>
            {/* track + zero + limit ticks */}
            <rect x={cx - half} y={y} width={half * 2} height={12} rx="2" fill="rgba(239,233,221,0.05)" />
            <line x1={cx} y1={y - 3} x2={cx} y2={y + 15} stroke="rgba(239,233,221,0.25)" strokeWidth="1" />
            <line x1={cx - half} y1={y - 2} x2={cx - half} y2={y + 14} stroke={DIM} strokeWidth="1" />
            <line x1={cx + half} y1={y - 2} x2={cx + half} y2={y + 14} stroke={DIM} strokeWidth="1" />
            <motion.rect
              x={neg ? cx - w : cx}
              y={y + 2}
              width={w}
              height={8}
              rx="1.5"
              fill={BRASS}
              fillOpacity="0.8"
              style={{ transformBox: "fill-box", transformOrigin: neg ? "right" : "left" }}
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
            />
            <text x={cx + half + 10} y={y + 10} fontFamily="var(--font-mono)" fontSize="11" fill={INK}>
              {row.label}
            </text>
          </g>
        );
      })}

      {/* vol smile */}
      <text x={8} y={250} fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.14em" fill={DIM}>
        IV SMILE
      </text>
      <g transform="translate(0 6)">
        <line x1={70} y1={300} x2={300} y2={300} stroke="rgba(239,233,221,0.12)" strokeWidth="1" />
        <motion.path
          d="M70 270 Q 110 300 150 298 Q 185 296 200 290 Q 250 270 300 256"
          fill="none"
          stroke={BRASS}
          strokeWidth="1.8"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        />
        <text x={64} y={304} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8" fill={DIM}>25Δ P</text>
        <text x={306} y={258} fontFamily="var(--font-mono)" fontSize="8" fill={DIM}>25Δ C</text>
      </g>
    </svg>
  );
}
