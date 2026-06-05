"use client";

import { motion, useReducedMotion } from "framer-motion";

const BRASS = "#c6a45c";
const INK = "#efe9dd";
const DIM = "#8c8472";

const TENORS = [
  { t: "3M", x: 40, y: 214 },
  { t: "2Y", x: 74, y: 158 },
  { t: "5Y", x: 108, y: 126 },
  { t: "10Y", x: 142, y: 108 },
  { t: "30Y", x: 172, y: 100 },
];

// 11 Monte-Carlo terminal paths fanning from today's value; the lower tail is
// the 99% VaR the engine estimates (~$264K unhedged, per the case file).
const PATHS = Array.from({ length: 11 }, (_, i) => i - 5).map((k) => {
  const x0 = 212;
  const y0 = 150;
  const xs = [x0, 246, 280, 314, 345];
  const spread = k * 11;
  const ys = xs.map((_, j) => {
    const f = j / (xs.length - 1);
    const wob = Math.sin(k * 1.3 + j) * 3 * f;
    return y0 + spread * Math.sqrt(f) + wob;
  });
  return xs.map((x, j) => `${x},${ys[j].toFixed(1)}`).join(" ");
});

export function RatesEngine({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <svg viewBox="0 0 360 320" className={className} role="img" aria-label="Bootstrapped Treasury curve and Monte-Carlo VaR fan">
      {/* divider */}
      <line x1={190} y1={28} x2={190} y2={300} stroke="rgba(239,233,221,0.08)" strokeWidth="1" />

      {/* ---- yield curve ---- */}
      <text x={8} y={18} fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.13em" fill={DIM}>
        UST CURVE · BOOTSTRAPPED
      </text>
      <line x1={28} y1={250} x2={182} y2={250} stroke="rgba(239,233,221,0.16)" strokeWidth="1" />
      <line x1={28} y1={70} x2={28} y2={250} stroke="rgba(239,233,221,0.16)" strokeWidth="1" />
      <motion.polyline
        points={TENORS.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none" stroke={BRASS} strokeWidth="2"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.25, duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
      />
      {TENORS.map((p, i) => (
        <motion.g
          key={p.t}
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.07, duration: 0.4 }}
        >
          <circle cx={p.x} cy={p.y} r="3" fill={BRASS} />
          <text x={p.x} y={264} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill={DIM}>
            {p.t}
          </text>
        </motion.g>
      ))}
      <text x={8} y={282} fontFamily="var(--font-mono)" fontSize="8" fill={DIM}>DV01 · duration · convexity</text>

      {/* ---- Monte-Carlo VaR fan ---- */}
      <text x={206} y={18} fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.13em" fill={DIM}>
        MC VaR · 20k PATHS
      </text>
      {/* cone */}
      <motion.path
        d="M212 150 L345 95 L345 205 Z"
        fill={BRASS} fillOpacity="0.06" stroke="none"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      />
      {PATHS.map((pts, i) => (
        <motion.polyline
          key={i}
          points={pts}
          fill="none"
          stroke={i === 0 ? "#c5604f" : INK}
          strokeOpacity={i === 0 ? 0.8 : 0.26}
          strokeWidth={i === 0 ? 1.4 : 1}
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.04, duration: 0.7, ease: "easeOut" }}
        />
      ))}
      <circle cx={212} cy={150} r="3" fill={INK} />
      {/* 99% VaR cutoff on the lower tail */}
      <motion.g initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }}>
        <line x1={300} y1={205} x2={348} y2={205} stroke="#c5604f" strokeWidth="1" strokeDasharray="2 3" />
        <text x={344} y={220} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="#c5604f">
          99% VaR
        </text>
      </motion.g>
      <text x={206} y={282} fontFamily="var(--font-mono)" fontSize="8" fill={DIM}>GBM · 30y calibration</text>
    </svg>
  );
}
