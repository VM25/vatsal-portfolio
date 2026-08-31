import { paper } from "@/data/research";

/**
 * The 2022 Treasury channel attribution, in thousands of dollars.
 *
 * Every bar is a measured channel from the rates engine; the bars are laid out
 * as a running total so the eye lands where the loss actually came from — the
 * real-rate channel, not breakevens. Signal orange marks the losing channels
 * and the net, petrol the offsets.
 */

const W = 620;
const H = 300;
const PAD_L = 42;
const PAD_R = 16;
const PAD_T = 26;
const PAD_B = 52;

const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

// Running total across the channels, then the net bar.
const steps = paper.attribution;
const NET = steps.reduce((a, s) => a + s.value, 0); // −192 (thousands)

// Scale: the axis has to hold the deepest excursion and zero.
const MIN = -300;
const MAX = 40;
const y = (v: number) => PAD_T + ((MAX - v) / (MAX - MIN)) * PLOT_H;

const COL_W = PLOT_W / (steps.length + 1);
const BAR_W = Math.min(52, COL_W * 0.56);

type Bar = {
  key: string;
  x: number;
  top: number;
  height: number;
  loss: boolean;
  label: string;
  value: number;
  connectorY: number;
};

const bars: Bar[] = [];
let running = 0;

steps.forEach((s, idx) => {
  const from = running;
  running += s.value;
  const top = y(Math.max(from, running));
  const bottom = y(Math.min(from, running));
  bars.push({
    key: s.channel,
    x: PAD_L + idx * COL_W + (COL_W - BAR_W) / 2,
    top,
    height: Math.max(2, bottom - top),
    loss: s.kind === "loss",
    label: s.channel,
    value: s.value,
    connectorY: y(running),
  });
});

const netX = PAD_L + steps.length * COL_W + (COL_W - BAR_W) / 2;
const netTop = y(Math.max(0, NET));
const netHeight = Math.max(2, y(Math.min(0, NET)) - netTop);

const fmt = (v: number) => `${v > 0 ? "+" : "−"}$${Math.abs(v)}k`;

export function AttributionWaterfall() {
  return (
    <svg
      className="plate__svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Waterfall of the 2022 Treasury loss by channel: real rate minus 278 thousand dollars, convexity plus 64, curve shape plus 37, breakeven plus 11, residual minus 26, netting to a loss of 192 thousand."
    >
      {/* horizontal grid at 100k intervals */}
      {[0, -100, -200, -300].map((v, i) => (
        <g key={v}>
          <line
            className="p-grid"
            x1={PAD_L}
            x2={W - PAD_R}
            y1={y(v)}
            y2={y(v)}
            strokeDasharray={v === 0 ? "0" : "2 4"}
          />
          <text className="p-label" x={4} y={y(v) + 3} data-pop style={{ ["--i"]: i } as React.CSSProperties}>
            {v === 0 ? "0" : `${v}k`}
          </text>
        </g>
      ))}

      {/* zero line, drawn */}
      <line
        className="p-axis"
        x1={PAD_L}
        x2={W - PAD_R}
        y1={y(0)}
        y2={y(0)}
        pathLength={1}
        data-draw
      />

      {bars.map((b, i) => (
        <g key={b.key}>
          {/* connector to the next bar's starting level */}
          {i < bars.length - 1 ? (
            <line
              className="p-grid"
              x1={b.x + BAR_W}
              x2={b.x + COL_W}
              y1={b.connectorY}
              y2={b.connectorY}
              strokeDasharray="2 3"
              data-pop
              style={{ ["--i"]: i + 2 } as React.CSSProperties}
            />
          ) : null}
          <rect
            className={b.loss ? "p-fill--signal" : "p-fill"}
            x={b.x}
            y={b.top}
            width={BAR_W}
            height={b.height}
            data-grow
            style={
              {
                ["--i"]: i,
                ["--origin"]: b.value < 0 ? "top" : "bottom",
              } as React.CSSProperties
            }
          />
          <text
            className={`p-label ${b.loss ? "p-label--signal" : ""}`}
            x={b.x + BAR_W / 2}
            y={b.value < 0 ? b.top + b.height + 13 : b.top - 6}
            textAnchor="middle"
            data-pop
            style={{ ["--i"]: i + 1 } as React.CSSProperties}
          >
            {fmt(b.value)}
          </text>
          <text
            className="p-label"
            x={b.x + BAR_W / 2}
            y={H - 30}
            textAnchor="middle"
            data-pop
            style={{ ["--i"]: i + 1 } as React.CSSProperties}
          >
            {b.label}
          </text>
        </g>
      ))}

      {/* the net */}
      <rect
        className="p-fill--signal"
        x={netX}
        y={netTop}
        width={BAR_W}
        height={netHeight}
        data-grow
        style={{ ["--i"]: steps.length, ["--origin"]: "top" } as React.CSSProperties}
      />
      <text
        className="p-label--ink p-label"
        x={netX + BAR_W / 2}
        y={netTop + netHeight + 13}
        textAnchor="middle"
        data-pop
        style={{ ["--i"]: steps.length + 1 } as React.CSSProperties}
      >
        −$192k
      </text>
      <text
        className="p-label p-label--ink"
        x={netX + BAR_W / 2}
        y={H - 30}
        textAnchor="middle"
        data-pop
        style={{ ["--i"]: steps.length + 1 } as React.CSSProperties}
      >
        Net
      </text>

      <text className="p-label" x={PAD_L} y={H - 10} data-pop>
        2022 replay · synthetic $1m long-duration book · DV01 {paper.totals.dv01}
      </text>
    </svg>
  );
}
