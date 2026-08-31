/**
 * Figure 1 of the memo: the 90-day rolling SPY–TLT correlation across the
 * sample, with the +0.20 stress threshold and the three crisis windows.
 *
 * The path is an indicative rendering of the measured series, not a replotted
 * export. The three values it is anchored on are the computed ones: a mean of
 * roughly −0.43 through the 2010s, the +0.20 threshold that flags weakening
 * diversification, and the +0.41 peak in 2022–23. The caption says as much.
 */

const W = 640;
const H = 290;
const PAD_L = 44;
const PAD_R = 58;
const PAD_T = 26;
const PAD_B = 46;

const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const T0 = 2007;
const T1 = 2026;
const C_MIN = -0.75;
const C_MAX = 0.6;

const x = (yr: number) => PAD_L + ((yr - T0) / (T1 - T0)) * PLOT_W;
const y = (c: number) => PAD_T + ((C_MAX - c) / (C_MAX - C_MIN)) * PLOT_H;

/** Anchors on the measured path, interpolated smoothly between. */
const anchors: Array<[number, number]> = [
  [2007, -0.1],
  [2008.6, -0.52],
  [2010, -0.38],
  [2012, -0.55],
  [2014, -0.4],
  [2016, -0.47],
  [2018, -0.36],
  [2020.2, -0.58],
  [2021, -0.3],
  [2022.4, 0.28],
  [2022.9, 0.41],
  [2023.6, 0.3],
  [2024.6, 0.1],
  [2026, 0.02],
];

// Catmull-Rom through the anchors, emitted as a cubic path.
function smooth(pts: Array<[number, number]>) {
  const p = pts.map(([yr, c]) => [x(yr), y(c)] as const);
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

const crises: Array<[number, number, string]> = [
  [2008, 2009.2, "2008"],
  [2020, 2020.6, "2020"],
  [2022, 2022.9, "2022"],
];

export function CorrelationBreak() {
  return (
    <svg
      className="plate__svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Ninety-day rolling SPY to TLT correlation from 2007 to 2026. Strongly negative through the 2010s at about minus 0.43, crossing the plus 0.20 stress threshold and peaking at plus 0.41 in 2022 to 2023."
    >
      {crises.map(([a, b, label], i) => (
        <g key={label} data-pop style={{ ["--i"]: i } as React.CSSProperties}>
          <rect
            x={x(a)}
            y={PAD_T}
            width={x(b) - x(a)}
            height={PLOT_H}
            fill="var(--rule)"
            opacity={0.07}
          />
          <text className="p-label" x={(x(a) + x(b)) / 2} y={PAD_T - 8} textAnchor="middle">
            {label}
          </text>
        </g>
      ))}

      {[-0.5, 0, 0.5].map((c) => (
        <g key={c}>
          <line className="p-grid" x1={PAD_L} x2={PAD_L + PLOT_W} y1={y(c)} y2={y(c)} strokeDasharray={c === 0 ? "0" : "2 4"} />
          <text className="p-label" x={6} y={y(c) + 3} data-pop>
            {c > 0 ? `+${c.toFixed(1)}` : c.toFixed(1)}
          </text>
        </g>
      ))}

      {/* the stress threshold — the rule that flags weakening diversification */}
      <line
        className="p-line--signal"
        stroke="var(--signal)"
        strokeWidth={1}
        strokeDasharray="5 4"
        x1={PAD_L}
        x2={PAD_L + PLOT_W}
        y1={y(0.2)}
        y2={y(0.2)}
        pathLength={1}
        data-draw
        style={{ ["--i"]: 1 } as React.CSSProperties}
      />
      <text className="p-label p-label--signal" x={PAD_L + PLOT_W + 8} y={y(0.2) + 3} data-pop style={{ ["--i"]: 4 } as React.CSSProperties}>
        +0.20 stress
      </text>

      <path className="p-line" d={smooth(anchors)} pathLength={1} data-draw style={{ ["--i"]: 2 } as React.CSSProperties} />

      {/* the two measured levels the figure is anchored on */}
      <circle cx={x(2022.9)} cy={y(0.41)} r={4} className="p-fill--signal" data-pop style={{ ["--i"]: 5 } as React.CSSProperties} />
      <text className="p-label p-label--signal" x={x(2022.9) - 8} y={y(0.41) - 9} textAnchor="end" data-pop style={{ ["--i"]: 5 } as React.CSSProperties}>
        +0.41
      </text>
      <text className="p-label" x={x(2014)} y={y(-0.43) + 18} textAnchor="middle" data-pop style={{ ["--i"]: 5 } as React.CSSProperties}>
        ≈ −0.43 through the 2010s
      </text>

      <line className="p-axis" x1={PAD_L} x2={PAD_L + PLOT_W} y1={PAD_T + PLOT_H} y2={PAD_T + PLOT_H} pathLength={1} data-draw />
      {[2008, 2012, 2016, 2020, 2024].map((yr) => (
        <text key={yr} className="p-label" x={x(yr)} y={H - 28} textAnchor="middle" data-pop>
          {yr}
        </text>
      ))}
      <text className="p-label" x={PAD_L} y={H - 10} data-pop>
        90-day rolling correlation, SPY against TLT
      </text>
    </svg>
  );
}
