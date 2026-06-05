"use client";

import { motion, useReducedMotion } from "framer-motion";

const BRASS = "#c6a45c";
const INK = "#efe9dd";
const DIM = "#8c8472";

const DOTS = [
  [96, 236], [120, 210], [110, 248], [140, 226], [150, 196], [168, 214],
  [176, 186], [190, 230], [205, 176], [214, 206], [232, 170], [240, 198],
  [258, 164], [270, 188], [286, 152], [156, 244], [206, 250], [250, 228],
];

export function EfficientFrontier({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const ox = 52;
  const oy = 268;

  return (
    <svg viewBox="0 0 360 320" className={className} role="img" aria-label="Efficient frontier across an ETF universe with the max-Sharpe portfolio">
      <text x={8} y={18} fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.14em" fill={DIM}>
        EFFICIENT FRONTIER · 20+ ETFs
      </text>

      {/* axes */}
      <line x1={ox} y1={44} x2={ox} y2={oy} stroke="rgba(239,233,221,0.16)" strokeWidth="1" />
      <line x1={ox} y1={oy} x2={332} y2={oy} stroke="rgba(239,233,221,0.16)" strokeWidth="1" />
      <text x={ox - 8} y={50} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill={DIM}>E[r]</text>
      <text x={330} y={oy + 16} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill={DIM}>σ</text>

      {/* capital market line (risk-free → tangency) */}
      <motion.line
        x1={ox} y1={232} x2={300} y2={96}
        stroke={DIM} strokeWidth="1" strokeDasharray="3 4" strokeOpacity="0.7"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.8 }}
      />
      <circle cx={ox} cy={232} r="2.5" fill={DIM} />
      <text x={ox + 6} y={228} fontFamily="var(--font-mono)" fontSize="8" fill={DIM}>rƒ</text>

      {/* feasible assets */}
      {DOTS.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x} cy={y} r="3"
          fill={INK} fillOpacity="0.32"
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 + i * 0.03, duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
        />
      ))}

      {/* frontier */}
      <motion.path
        d="M82 250 C 118 152 176 116 300 88"
        fill="none" stroke={BRASS} strokeWidth="2"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.35, duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
      />

      {/* max-Sharpe tangency */}
      <motion.g
        initial={reduce ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.05, duration: 0.45, ease: [0.34, 1.4, 0.5, 1] }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <circle cx={300} cy={88} r="5" fill={BRASS} />
        <circle cx={300} cy={88} r="9" fill="none" stroke={BRASS} strokeOpacity="0.5" strokeWidth="1" />
        <text x={296} y={78} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill={BRASS}>MAX SHARPE</text>
      </motion.g>

      {/* factor betas */}
      <g transform="translate(60 286)">
        <text x={0} y={9} fontFamily="var(--font-mono)" fontSize="8" fill={DIM}>FACTOR β</text>
        {[["MKT", 0.92], ["SMB", 0.41], ["HML", 0.28], ["MOM", 0.16]].map(([f, v], i) => (
          <g key={f as string} transform={`translate(${70 + i * 62} 0)`}>
            <rect x={0} y={2} width={40} height={7} rx="1.5" fill="rgba(239,233,221,0.06)" />
            <motion.rect
              x={0} y={2} height={7} width={40 * (v as number)} rx="1.5"
              fill={BRASS} fillOpacity="0.7"
              style={{ transformBox: "fill-box", transformOrigin: "left" }}
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1 + i * 0.08, duration: 0.5 }}
            />
            <text x={0} y={-2} fontFamily="var(--font-mono)" fontSize="7" fill={DIM}>{f}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
