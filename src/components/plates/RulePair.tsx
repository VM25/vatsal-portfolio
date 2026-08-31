/**
 * The negative result, drawn plainly: the regime-aware rule against 60/40 on
 * four measures. Sharpe is the pair that matters and the only one marked in
 * signal orange — 0.48 against 0.66. Nothing here is arranged to flatter it.
 *
 * Bars are normalised within each measure, so heights compare across a pair,
 * never across the plate.
 */

const W = 620;
const H = 300;
const PAD_T = 46;
const PAD_B = 62;
const PLOT_H = H - PAD_T - PAD_B;
const GROUP_W = 128;
const GAP = 26;
const BAR_W = 40;
const START_X = 40;

type Measure = {
  label: string;
  a: number; // regime-aware
  b: number; // 60/40
  fmt: (v: number) => string;
  /** Larger is better? Drives which side gets the ink emphasis. */
  key?: boolean;
};

const measures: Measure[] = [
  { label: "Ann. return", a: 6.0, b: 8.4, fmt: (v) => `${v.toFixed(1)}%` },
  { label: "Volatility", a: 10.5, b: 11.1, fmt: (v) => `${v.toFixed(1)}%` },
  { label: "Sharpe", a: 0.48, b: 0.66, fmt: (v) => v.toFixed(2), key: true },
  { label: "Max drawdown", a: 33.3, b: 31.9, fmt: (v) => `−${v.toFixed(1)}%` },
];

export function RulePair() {
  return (
    <svg
      className="plate__svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Regime-aware rule against 60/40 on four measures. Sharpe is 0.48 against 0.66 — the regime-aware rule does not win."
    >
      <line className="p-axis" x1={20} x2={W - 20} y1={PAD_T + PLOT_H} y2={PAD_T + PLOT_H} pathLength={1} data-draw />

      {/* key */}
      <g data-pop>
        <rect x={20} y={18} width={10} height={10} className="p-fill--soft" />
        <text className="p-label" x={36} y={27}>
          Regime-aware
        </text>
        <rect x={148} y={18} width={10} height={10} className="p-fill" />
        <text className="p-label" x={164} y={27}>
          60/40 (SPY/IEF)
        </text>
      </g>

      {measures.map((m, i) => {
        const max = Math.max(m.a, m.b);
        const hA = (m.a / max) * PLOT_H * 0.82;
        const hB = (m.b / max) * PLOT_H * 0.82;
        const gx = START_X + i * (GROUP_W + GAP);
        const base = PAD_T + PLOT_H;
        return (
          <g key={m.label}>
            <rect
              x={gx}
              y={base - hA}
              width={BAR_W}
              height={hA}
              className={m.key ? "p-fill--signal" : "p-fill--soft"}
              fillOpacity={m.key ? 0.42 : 1}
              data-grow
              style={{ ["--i"]: i } as React.CSSProperties}
            />
            <rect
              x={gx + BAR_W + 8}
              y={base - hB}
              width={BAR_W}
              height={hB}
              className={m.key ? "p-fill--signal" : "p-fill"}
              data-grow
              style={{ ["--i"]: i + 0.5 } as React.CSSProperties}
            />
            <text
              className="p-label"
              x={gx + BAR_W / 2}
              y={base - hA - 7}
              textAnchor="middle"
              data-pop
              style={{ ["--i"]: i + 1 } as React.CSSProperties}
            >
              {m.fmt(m.a)}
            </text>
            <text
              className={`p-label ${m.key ? "p-label--signal" : "p-label--ink"}`}
              x={gx + BAR_W + 8 + BAR_W / 2}
              y={base - hB - 7}
              textAnchor="middle"
              data-pop
              style={{ ["--i"]: i + 1 } as React.CSSProperties}
            >
              {m.fmt(m.b)}
            </text>
            <text
              className={`p-label ${m.key ? "p-label--signal" : ""}`}
              x={gx + BAR_W + 4}
              y={base + 18}
              textAnchor="middle"
              data-pop
              style={{ ["--i"]: i + 1 } as React.CSSProperties}
            >
              {m.label}
            </text>
          </g>
        );
      })}

      <text className="p-label" x={20} y={H - 12} data-pop>
        Full sample 2007–2026 · 13 ETFs · 35% cap · 5 bps per unit turnover
      </text>
    </svg>
  );
}
