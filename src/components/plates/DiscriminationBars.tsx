/**
 * Model discrimination against the no-skill line, with the validation verdict
 * beside each bar. All three ROC-AUCs are computed results.
 *
 * The underwriting scorecard is the point of the figure: 0.695 earns a Monitor
 * verdict, and it is drawn in signal orange rather than quietly omitted.
 */

const W = 620;
const H = 300;
const PAD_L = 128;
const PAD_R = 108;
const PAD_T = 44;

const PLOT_W = W - PAD_L - PAD_R;
const ROW_H = 54;

const X_MIN = 0.5; // no skill
const X_MAX = 1.0;
const x = (v: number) => PAD_L + ((v - X_MIN) / (X_MAX - X_MIN)) * PLOT_W;

const models = [
  { name: "Fraud", auc: 0.97, verdict: "Pass", flagged: false },
  { name: "Stablecoin AML", auc: 0.87, verdict: "Pass", flagged: false },
  { name: "Underwriting", auc: 0.695, verdict: "Monitor", flagged: true },
];

export function DiscriminationBars() {
  return (
    <svg
      className="plate__svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Discrimination by model against the no-skill baseline: fraud 0.97 pass, stablecoin 0.87 pass, underwriting 0.695 monitor."
    >
      {[0.5, 0.7, 0.9, 1.0].map((v) => (
        <g key={v}>
          <line className="p-grid" x1={x(v)} x2={x(v)} y1={PAD_T - 10} y2={PAD_T + 3 * ROW_H} strokeDasharray="2 4" />
          <text className="p-label" x={x(v)} y={PAD_T - 18} textAnchor="middle" data-pop>
            {v.toFixed(2)}
          </text>
        </g>
      ))}

      <line className="p-axis" x1={x(0.5)} x2={x(0.5)} y1={PAD_T - 10} y2={PAD_T + 3 * ROW_H} pathLength={1} data-draw />
      <text className="p-label" x={x(0.5)} y={PAD_T + 3 * ROW_H + 18} textAnchor="middle" data-pop>
        no skill
      </text>

      {models.map((m, i) => {
        const cy = PAD_T + i * ROW_H + 14;
        return (
          <g key={m.name} data-pop style={{ ["--i"]: i } as React.CSSProperties}>
            <text className="p-label p-label--ink" x={PAD_L - 14} y={cy + 4} textAnchor="end">
              {m.name}
            </text>
            <rect
              x={x(0.5)}
              y={cy - 7}
              width={Math.max(2, x(m.auc) - x(0.5))}
              height={14}
              className={m.flagged ? "p-fill--signal" : "p-fill"}
              style={{ transformOrigin: "left" }}
            />
            <text
              className={`p-label ${m.flagged ? "p-label--signal" : "p-label--ink"}`}
              x={x(m.auc) + 10}
              y={cy + 4}
            >
              {m.auc.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")} · {m.verdict}
            </text>
          </g>
        );
      })}

      <text className="p-label" x={PAD_L - 14} y={H - 12} textAnchor="end" data-pop>
        ROC-AUC
      </text>
      <text className="p-label" x={PAD_L} y={H - 12} data-pop>
        94,999 applicants · 80,000 transactions · 180 policy scenarios
      </text>
    </svg>
  );
}
