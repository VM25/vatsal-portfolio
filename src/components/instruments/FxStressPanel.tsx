"use client";

import { motion, useReducedMotion } from "framer-motion";

const INK = "var(--ink)";
const UP = "var(--up)";
const DOWN = "var(--down)";
const MUTE = "var(--ink-3)";
const LINE = "var(--line-2)";
const EASE = [0.22, 0.61, 0.36, 1] as const;

const VOL = ["+20", "+10", "0", "-10", "-20"];
const SPOT = ["-10", "-5", "0", "+5", "+10"];
const GRID = [
  [210, 160, 120, 175, 230],
  [120, 70, 45, 85, 135],
  [30, -10, 0, -5, 40],
  [-40, -110, -130, -120, -55],
  [-120, -240, -300, -250, -140],
];
const MAXABS = 300;

function cellFill(v: number) {
  if (Math.abs(v) < 8) return { fill: "var(--line)", op: 1 };
  const op = (Math.abs(v) / MAXABS) * 0.72 + 0.14;
  return { fill: v > 0 ? UP : DOWN, op };
}

export function FxStressPanel({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const x0 = 70;
  const y0 = 34;
  const cw = 46;
  const ch = 29;

  let wr = 0, wc = 0, wv = 0;
  GRID.forEach((row, r) => row.forEach((v, c) => { if (v < wv) { wv = v; wr = r; wc = c; } }));

  return (
    <svg viewBox="0 0 360 318" className={className} role="img" aria-label="Spot vs volatility stress heatmap of book P&L, with delta hedge before and after">
      <text x={14} y={20} fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.04em" fill={MUTE}>SPOT × VOL STRESS · BOOK P&L</text>

      <text x={20} y={y0 + 75} fontFamily="var(--font-mono)" fontSize="9" fill={MUTE} transform={`rotate(-90 20 ${y0 + 75})`} textAnchor="middle">VOL SHOCK %</text>
      <text x={x0 + cw * 2.5} y={y0 + 5 * ch + 30} fontFamily="var(--font-mono)" fontSize="9" fill={MUTE} textAnchor="middle">SPOT SHOCK %</text>

      {GRID.map((row, r) =>
        row.map((v, c) => {
          const { fill, op } = cellFill(v);
          const worst = r === wr && c === wc;
          return (
            <motion.rect
              key={`${r}-${c}`}
              x={x0 + c * cw + 1.5}
              y={y0 + r * ch + 1.5}
              width={cw - 3}
              height={ch - 3}
              rx="2.5"
              fill={fill}
              fillOpacity={op}
              stroke={worst ? INK : "none"}
              strokeWidth={worst ? 1.6 : 0}
              initial={reduce ? false : { opacity: 0, scale: 0.55 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-6%" }}
              transition={{ delay: 0.05 + (r + c) * 0.035, duration: 0.35, ease: EASE }}
              style={{ transformOrigin: `${x0 + c * cw + cw / 2}px ${y0 + r * ch + ch / 2}px` }}
            />
          );
        }),
      )}

      {VOL.map((v, r) => (
        <text key={v} x={x0 - 8} y={y0 + r * ch + ch / 2 + 3.5} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" fill={INK}>{v}</text>
      ))}
      {SPOT.map((s, c) => (
        <text key={s} x={x0 + c * cw + cw / 2} y={y0 + 5 * ch + 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill={INK}>{s}</text>
      ))}

      <text x={x0 + wc * cw + cw / 2} y={y0 + wr * ch + ch / 2 + 3.5} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fontWeight="700" fill="#fff">WORST</text>

      <g transform="translate(248 14)">
        <rect x={0} y={-9} width={11} height={11} rx="2" fill={DOWN} fillOpacity="0.7" />
        <text x={15} y={0} fontFamily="var(--font-mono)" fontSize="9" fill={MUTE}>loss</text>
        <rect x={48} y={-9} width={11} height={11} rx="2" fill={UP} fillOpacity="0.7" />
        <text x={63} y={0} fontFamily="var(--font-mono)" fontSize="9" fill={MUTE}>gain</text>
      </g>

      <text x={14} y={236} fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.04em" fill={MUTE}>NET DELTA · BEFORE → AFTER HEDGE</text>
      {[
        { k: "Before", w: 0.86, color: DOWN, label: "+0.86" },
        { k: "After", w: 0.015, color: UP, label: "≈ 0.00" },
      ].map((b, i) => {
        const y = 250 + i * 24;
        return (
          <g key={b.k}>
            <text x={14} y={y + 11} fontFamily="var(--font-sans)" fontSize="10.5" fill={INK}>{b.k}</text>
            <line x1={70} y1={y} x2={70} y2={y + 16} stroke={LINE} strokeWidth="1" />
            <motion.rect
              x={70} y={y + 2} width={b.w * 240} height={12} rx="2" fill={b.color} fillOpacity="0.8"
              style={{ transformBox: "fill-box", transformOrigin: "left" }}
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-6%" }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.5, ease: EASE }}
            />
            <text x={70 + b.w * 240 + 6} y={y + 12} fontFamily="var(--font-mono)" fontSize="9.5" fill={b.color}>{b.label}</text>
          </g>
        );
      })}
      <text x={326} y={300} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" fill={INK}>−100% delta</text>
    </svg>
  );
}
