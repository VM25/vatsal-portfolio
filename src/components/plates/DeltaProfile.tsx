/**
 * What the hedge does to the book, drawn as a delta profile against spot.
 *
 * The curve shape here is schematic — it illustrates the mechanism rather than
 * plotting a measured series. The two figures annotated on it are computed:
 * the hedge removes 100% of directional exposure at spot, and the 95% Monte
 * Carlo VaR is MXN 159.1K on USD 4.65M gross notional. The caption says so.
 */

const W = 620;
const H = 300;
const PAD_L = 46;
const PAD_R = 20;
const PAD_T = 24;
const PAD_B = 48;

const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const x = (t: number) => PAD_L + t * PLOT_W; // t in 0..1
const y = (d: number) => PAD_T + (1 - d) * PLOT_H; // d in 0..1, 0.5 = flat

// A logistic delta profile: the classic S through the strike.
const logistic = (t: number) => 1 / (1 + Math.exp(-11 * (t - 0.5)));

const N = 60;
const SWING = 0.4; // how far delta travels across the plotted spot range

const path = (at: (t: number) => number) =>
  Array.from({ length: N + 1 }, (_, i) => {
    const t = i / N;
    return `${i === 0 ? "M" : "L"}${x(t).toFixed(1)},${y(at(t)).toFixed(1)}`;
  }).join(" ");

// Unhedged: the book is net long delta everywhere, so the whole curve sits
// above the zero line.
const unhedged = path((t) => 0.55 + logistic(t) * SWING);

// Hedged: the same curve less the delta sold at spot, so it crosses zero at
// spot and straddles the line. The shape is unchanged — that is the point.
const hedged = path((t) => 0.5 + (logistic(t) - 0.5) * SWING);

export function DeltaProfile() {
  return (
    <svg
      className="plate__svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Two delta profiles against spot. The unhedged book carries directional exposure across the range; the hedged book crosses zero at spot while keeping its curvature."
    >
      {/* flat line — zero net delta */}
      <line className="p-grid" x1={PAD_L} x2={PAD_L + PLOT_W} y1={y(0.5)} y2={y(0.5)} strokeDasharray="2 4" />
      <text className="p-label" x={6} y={y(0.5) + 3} data-pop>
        0Δ
      </text>

      {/* spot marker */}
      <line
        className="p-grid"
        x1={x(0.5)}
        x2={x(0.5)}
        y1={PAD_T}
        y2={PAD_T + PLOT_H}
        strokeDasharray="2 4"
      />
      <text className="p-label" x={x(0.5)} y={H - 28} textAnchor="middle" data-pop>
        spot
      </text>

      <line className="p-axis" x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={PAD_T + PLOT_H} pathLength={1} data-draw />

      <path className="p-line" d={unhedged} pathLength={1} data-draw />
      <path
        className="p-line p-line--signal"
        d={hedged}
        pathLength={1}
        data-draw
        style={{ ["--i"]: 1 } as React.CSSProperties}
      />

      <circle cx={x(0.5)} cy={y(0.5)} r={4} className="p-fill--signal" data-pop style={{ ["--i"]: 3 } as React.CSSProperties} />

      <text className="p-label" x={x(0.84)} y={y(0.95) - 6} textAnchor="end" data-pop style={{ ["--i"]: 2 } as React.CSSProperties}>
        unhedged — net long delta across the range
      </text>
      <text
        className="p-label p-label--signal"
        x={x(0.84)}
        y={y(0.7) + 14}
        textAnchor="end"
        data-pop
        style={{ ["--i"]: 3 } as React.CSSProperties}
      >
        delta-hedged · 100% of directional exposure removed
      </text>

      <text className="p-label" x={PAD_L} y={H - 10} data-pop style={{ ["--i"]: 4 } as React.CSSProperties}>
        USD 4.65M gross notional · 95% Monte Carlo VaR MXN 159.1K · curvature deliberately retained
      </text>
    </svg>
  );
}
