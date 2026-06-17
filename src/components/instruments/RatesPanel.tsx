"use client";

import { motion, useReducedMotion } from "framer-motion";

const INK = "var(--ink)";
const BASE = "var(--p-rates)";
const DOWN = "var(--down)";
const UP = "var(--up)";
const MUTE = "var(--ink-3)";
const LINE = "var(--line-2)";
const EASE = [0.22, 0.61, 0.36, 1] as const;

const TENORS = [
  { t: "2Y", base: 4.2, shock: 5.0 },
  { t: "5Y", base: 4.0, shock: 4.7 },
  { t: "10Y", base: 4.1, shock: 4.6 },
  { t: "30Y", base: 4.3, shock: 4.6 },
];
const ATTR = [
  { k: "Duration", v: -40 },
  { k: "Convexity", v: 7 },
  { k: "Curve shape", v: -10 },
  { k: "Real rate", v: -14 },
  { k: "Breakeven", v: 6 },
  { k: "Residual", v: -3 },
];
const NET = ATTR.reduce((s, a) => s + a.v, 0);

function yToPx(y: number) {
  return 120 - ((y - 3.8) / (5.2 - 3.8)) * (120 - 38);
}

export function RatesPanel({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const xs = TENORS.map((_, i) => 50 + (i / (TENORS.length - 1)) * 270);
  const base = TENORS.map((d, i) => `${xs[i]},${yToPx(d.base)}`).join(" ");
  const shock = TENORS.map((d, i) => `${xs[i]},${yToPx(d.shock)}`).join(" ");

  const cx = 196;
  const scale = 1.45;
  const rowH = 15;
  const top = 188;
  const drawLine = (delay: number) => ({
    initial: reduce ? false : ({ pathLength: 0, opacity: 0 } as const),
    whileInView: { pathLength: 1, opacity: 1 } as const,
    viewport: { once: true, margin: "-8%" } as const,
    transition: { duration: 0.8, delay, ease: EASE } as const,
  });
  const growBar = (delay: number, origin: "left" | "right") => ({
    initial: reduce ? false : ({ scaleX: 0 } as const),
    whileInView: { scaleX: 1 } as const,
    viewport: { once: true, margin: "-8%" } as const,
    transition: { duration: 0.5, delay, ease: EASE } as const,
    style: { transformBox: "fill-box" as const, transformOrigin: origin },
  });

  return (
    <svg viewBox="0 0 360 318" className={className} role="img" aria-label="Treasury yield curve shift under an inflation shock, with P&L attribution">
      <text x={14} y={20} fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.04em" fill={MUTE}>TREASURY CURVE · +INFLATION SHOCK</text>
      <line x1={40} y1={120} x2={334} y2={120} stroke={LINE} strokeWidth="1" />
      {TENORS.map((d, i) => (
        <text key={d.t} x={xs[i]} y={134} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill={MUTE}>{d.t}</text>
      ))}

      <motion.polyline points={base} fill="none" stroke={BASE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...drawLine(0)} />
      <motion.polyline points={shock} fill="none" stroke={DOWN} strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" {...drawLine(0.25)} />
      {TENORS.map((d, i) => (
        <g key={d.t}>
          <circle cx={xs[i]} cy={yToPx(d.base)} r="2.6" fill={BASE} />
          <circle cx={xs[i]} cy={yToPx(d.shock)} r="2.6" fill={DOWN} />
        </g>
      ))}
      <g fontFamily="var(--font-mono)" fontSize="9">
        <circle cx={232} cy={16} r="3" fill={BASE} />
        <text x={240} y={19} fill={MUTE}>base</text>
        <circle cx={278} cy={16} r="3" fill={DOWN} />
        <text x={286} y={19} fill={MUTE}>shock</text>
      </g>

      <text x={14} y={172} fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.04em" fill={MUTE}>SCENARIO P&L ATTRIBUTION · bp</text>
      <line x1={cx} y1={top - 4} x2={cx} y2={top + ATTR.length * rowH + 6} stroke={LINE} strokeWidth="1" />

      {ATTR.map((a, i) => {
        const y = top + i * rowH;
        const w = Math.abs(a.v) * scale;
        const x = a.v < 0 ? cx - w : cx;
        const color = a.v < 0 ? DOWN : UP;
        return (
          <g key={a.k}>
            <text x={14} y={y + 9} fontFamily="var(--font-sans)" fontSize="10" fill={INK}>{a.k}</text>
            <motion.rect x={x} y={y + 2} width={w} height={9} rx="1.5" fill={color} fillOpacity="0.8" {...growBar(0.3 + i * 0.05, a.v < 0 ? "right" : "left")} />
            <text x={a.v < 0 ? x - 5 : x + w + 5} y={y + 10} textAnchor={a.v < 0 ? "end" : "start"} fontFamily="var(--font-mono)" fontSize="9.5" fill={color}>
              {a.v > 0 ? "+" : ""}{a.v}
            </text>
          </g>
        );
      })}

      <line x1={40} y1={top + ATTR.length * rowH + 4} x2={334} y2={top + ATTR.length * rowH + 4} stroke={LINE} strokeWidth="1" />
      <text x={14} y={top + ATTR.length * rowH + 22} fontFamily="var(--font-sans)" fontSize="11" fontWeight="600" fill={INK}>Net</text>
      <motion.rect x={cx - Math.abs(NET) * scale} y={top + ATTR.length * rowH + 13} width={Math.abs(NET) * scale} height={11} rx="2" fill={DOWN} {...growBar(0.7, "right")} />
      <text x={cx - Math.abs(NET) * scale - 5} y={top + ATTR.length * rowH + 22} textAnchor="end" fontFamily="var(--font-mono)" fontSize="10.5" fill={DOWN}>{NET} bp</text>
    </svg>
  );
}
