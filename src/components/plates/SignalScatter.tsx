/**
 * Signal survival: net Sharpe against annual turnover, one point per signal.
 *
 * The whole finding is geometric — short-term reversal sits alone at the far
 * right on turnover and at the bottom on Sharpe, which is exactly why it was
 * rejected. All five coordinates are computed results from the lab.
 */

const W = 620;
const H = 300;
const PAD_L = 46;
const PAD_R = 96;
const PAD_T = 22;
const PAD_B = 48;

const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const X_MAX = 14;
const Y_MIN = 0.38;
const Y_MAX = 0.68;

const x = (t: number) => PAD_L + (t / X_MAX) * PLOT_W;
const y = (s: number) => PAD_T + ((Y_MAX - s) / (Y_MAX - Y_MIN)) * PLOT_H;

/*
  Four of the five signals cluster between 3× and 6× turnover, so the labels
  carry an explicit side and vertical offset. They are tuned to clear one
  another rather than left to chance: vol-scaled and time-series sit on top of
  each other (3.1 against 3.2 turnover at an identical 0.57 Sharpe), so their
  labels split left and right, and the two above them are lifted clear.
*/
const signals = [
  { name: "Vol-scaled momentum", turnover: 3.1, sharpe: 0.57, verdict: "conditional", side: "left", dy: 3 },
  { name: "Time-series momentum", turnover: 3.2, sharpe: 0.57, verdict: "survived", side: "right", dy: 3 },
  { name: "Cross-sectional momentum", turnover: 4.2, sharpe: 0.62, verdict: "survived", side: "right", dy: -10 },
  { name: "Equal-weight ensemble", turnover: 6.0, sharpe: 0.59, verdict: "survived", side: "right", dy: -10 },
  { name: "Short-term reversal", turnover: 12.8, sharpe: 0.44, verdict: "rejected", side: "left", dy: 3 },
] as const;

export function SignalScatter() {
  return (
    <svg
      className="plate__svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Scatter of net Sharpe against annual turnover for five signals. Short-term reversal is an outlier at 12.8 times turnover and 0.44 Sharpe, and was rejected."
    >
      {[0.4, 0.5, 0.6].map((v, i) => (
        <g key={v}>
          <line className="p-grid" x1={PAD_L} x2={PAD_L + PLOT_W} y1={y(v)} y2={y(v)} strokeDasharray="2 4" />
          <text className="p-label" x={6} y={y(v) + 3} data-pop style={{ ["--i"]: i } as React.CSSProperties}>
            {v.toFixed(1)}
          </text>
        </g>
      ))}
      {[0, 4, 8, 12].map((t) => (
        <text key={t} className="p-label" x={x(t)} y={H - 28} textAnchor="middle" data-pop>
          {t}×
        </text>
      ))}

      <line className="p-axis" x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={PAD_T + PLOT_H} pathLength={1} data-draw />
      <line
        className="p-axis"
        x1={PAD_L}
        x2={PAD_L + PLOT_W}
        y1={PAD_T + PLOT_H}
        y2={PAD_T + PLOT_H}
        pathLength={1}
        data-draw
        style={{ ["--i"]: 1 } as React.CSSProperties}
      />

      {signals.map((s, i) => {
        const flagged = s.verdict !== "survived";
        const rejected = s.verdict === "rejected";
        return (
          <g key={s.name} data-pop style={{ ["--i"]: i } as React.CSSProperties}>
            {rejected ? (
              <circle
                cx={x(s.turnover)}
                cy={y(s.sharpe)}
                r={13}
                fill="none"
                stroke="var(--signal)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            ) : null}
            <circle
              cx={x(s.turnover)}
              cy={y(s.sharpe)}
              r={5}
              className={flagged ? "p-fill--signal" : "p-fill"}
              fillOpacity={s.verdict === "conditional" ? 0.45 : 1}
            />
            {/*
              Vol-scaled and time-series momentum land almost on top of each
              other — 3.1 against 3.2 turnover at an identical 0.57 Sharpe.
              That collision is real data, so the labels split left and right
              around the pair rather than stacking on one side.
            */}
            <text
              className={`p-label ${rejected ? "p-label--signal" : ""}`}
              x={x(s.turnover) + (s.side === "left" ? -11 : 11)}
              y={y(s.sharpe) + s.dy}
              textAnchor={s.side === "left" ? "end" : "start"}
            >
              {s.name}
            </text>
          </g>
        );
      })}

      <text className="p-label" x={PAD_L} y={H - 10} data-pop>
        Net Sharpe (vertical) · turnover per year (horizontal) · net of 5 bps
      </text>
    </svg>
  );
}
