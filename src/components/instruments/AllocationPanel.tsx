"use client";

import { motion, useReducedMotion } from "framer-motion";

const INK = "var(--ink)";
const ACCENT = "var(--p-portfolio)";
const DOWN = "var(--down)";
const MUTE = "var(--ink-3)";
const LINE = "var(--line-2)";
const EASE = [0.22, 0.61, 0.36, 1] as const;

const POINTS = [
  { k: "GMV", x: 110, y: 150, accent: false },
  { k: "Max Sharpe", x: 202, y: 77, accent: true },
  { k: "Regime", x: 235, y: 100, accent: false },
  { k: "Equal Wt", x: 256, y: 132, accent: false },
];
const CRISIS = [
  { y: "2008", dd: 0.92 },
  { y: "2020", dd: 0.55 },
  { y: "2022", dd: 0.66 },
];

export function AllocationPanel({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const vp = { once: true, margin: "-8%" } as const;

  return (
    <svg viewBox="0 0 360 318" className={className} role="img" aria-label="Efficient frontier with allocation rules and crisis-window drawdowns">
      <text x={14} y={20} fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.04em" fill={MUTE}>EFFICIENT FRONTIER · ALLOCATION RULES</text>

      <line x1={56} y1={36} x2={56} y2={198} stroke={LINE} strokeWidth="1" />
      <line x1={56} y1={198} x2={336} y2={198} stroke={LINE} strokeWidth="1" />
      <text x={50} y={40} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8.5" fill={MUTE}>ret</text>
      <text x={332} y={212} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8.5" fill={MUTE}>risk σ</text>

      <path d="M110,150 Q 150,186 248,196" fill="none" stroke={LINE} strokeWidth="1.4" strokeDasharray="3 3" />

      <motion.line
        x1={56} y1={166} x2={320} y2={8}
        stroke={ACCENT} strokeWidth="1.2" strokeDasharray="4 3" strokeOpacity="0.7"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.7 }}
        viewport={vp}
        transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
      />
      <motion.path
        d="M110,150 Q 180,60 300,55"
        fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={vp}
        transition={{ duration: 0.9, ease: EASE }}
      />

      {POINTS.map((p, i) => (
        <motion.g
          key={p.k}
          initial={reduce ? false : { opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={vp}
          transition={{ delay: 0.5 + i * 0.08, duration: 0.4, ease: EASE }}
          style={{ transformOrigin: `${p.x}px ${p.y}px` }}
        >
          <circle cx={p.x} cy={p.y} r={p.accent ? 5.5 : 4} fill={p.accent ? ACCENT : "var(--card)"} stroke={p.accent ? ACCENT : INK} strokeWidth="1.6" />
          <text x={p.x + (p.k === "GMV" ? -9 : 9)} y={p.y + (p.accent ? -8 : 3)} textAnchor={p.k === "GMV" ? "end" : "start"} fontFamily="var(--font-mono)" fontSize="9.5" fontWeight={p.accent ? 700 : 400} fill={p.accent ? ACCENT : INK}>
            {p.k}
          </text>
        </motion.g>
      ))}

      <text x={14} y={236} fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.04em" fill={MUTE}>MAX DRAWDOWN · CRISIS WINDOWS</text>
      <line x1={56} y1={250} x2={336} y2={250} stroke={LINE} strokeWidth="1" />
      {CRISIS.map((c, i) => {
        const x = 84 + i * 96;
        const h = c.dd * 46;
        return (
          <g key={c.y}>
            <motion.rect
              x={x} y={250} width={60} height={h} rx="2" fill={DOWN} fillOpacity="0.75"
              style={{ transformBox: "fill-box", transformOrigin: "top" }}
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={vp}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: EASE }}
            />
            <text x={x + 30} y={250 + h + 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={INK}>{c.y}</text>
          </g>
        );
      })}
    </svg>
  );
}
