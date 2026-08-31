/**
 * How a binary event-market resolves: contracts start near an even price and
 * are repriced as race information arrives, converging on 1 or 0 by settlement.
 *
 * The paths are schematic — they illustrate the repricing mechanism rather than
 * replaying a specific race. The exposure limits drawn across the plate are the
 * engine's real caps.
 */

const W = 620;
const H = 300;
const PAD_L = 40;
const PAD_R = 78;
const PAD_T = 22;
const PAD_B = 46;

const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const x = (t: number) => PAD_L + t * PLOT_W;
const y = (p: number) => PAD_T + (1 - p) * PLOT_H;

/** Deterministic wobble so the figure is identical on every render and server. */
const wobble = (seed: number, t: number) =>
  Math.sin(seed * 12.9898 + t * 19.7) * 0.055 * (1 - t);

const paths = [
  { seed: 1, end: 1, lead: true },
  { seed: 2, end: 0 },
  { seed: 3, end: 0 },
  { seed: 4, end: 1 },
  { seed: 5, end: 0 },
  { seed: 6, end: 0 },
];

const N = 44;

function build(seed: number, end: number) {
  return Array.from({ length: N + 1 }, (_, i) => {
    const t = i / N;
    // Ease from an even price toward the settled outcome.
    const eased = t * t * (3 - 2 * t);
    const p = 0.5 + (end - 0.5) * eased + wobble(seed, t);
    return `${i === 0 ? "M" : "L"}${x(t).toFixed(1)},${y(Math.min(1, Math.max(0, p))).toFixed(1)}`;
  }).join(" ");
}

export function ContractLadder() {
  return (
    <svg
      className="plate__svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Binary contract prices starting near even and converging on one or zero as race information arrives, with portfolio and single-market exposure caps marked."
    >
      {[0, 0.5, 1].map((p) => (
        <g key={p}>
          <line className="p-grid" x1={PAD_L} x2={PAD_L + PLOT_W} y1={y(p)} y2={y(p)} strokeDasharray={p === 0.5 ? "2 4" : "0"} />
          <text className="p-label" x={8} y={y(p) + 3} data-pop>
            {p.toFixed(2)}
          </text>
        </g>
      ))}

      {paths.map((p, i) => (
        <path
          key={p.seed}
          className={`p-line ${p.lead ? "p-line--signal" : ""}`}
          style={{ ["--i"]: i, opacity: p.lead ? 1 : 0.34 } as React.CSSProperties}
          strokeWidth={p.lead ? 2 : 1.25}
          d={build(p.seed, p.end)}
          pathLength={1}
          data-draw
        />
      ))}

      <line className="p-axis" x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={PAD_T + PLOT_H} pathLength={1} data-draw />

      {/* the real risk limits */}
      <g data-pop style={{ ["--i"]: 5 } as React.CSSProperties}>
        <text className="p-label p-label--signal" x={PAD_L + PLOT_W + 10} y={y(0.94)}>
          settles at 1
        </text>
        <text className="p-label" x={PAD_L + PLOT_W + 10} y={y(0.06)}>
          settles at 0
        </text>
      </g>

      <text className="p-label" x={PAD_L} y={H - 26} data-pop style={{ ["--i"]: 6 } as React.CSSProperties}>
        race information arrives →
      </text>
      <text className="p-label" x={PAD_L} y={H - 10} data-pop style={{ ["--i"]: 6 } as React.CSSProperties}>
        500+ contracts · 24 races settled · 30% portfolio / 15% single-market exposure caps
      </text>
    </svg>
  );
}
