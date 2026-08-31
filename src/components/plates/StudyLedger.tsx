/**
 * Fifteen controlled studies: ten reach a clean result, five carry a documented
 * caveat, none failed. The flagged five are named rather than numbered — the
 * repository assigns the EXP indices, and this figure does not guess at them.
 */

const W = 620;
const H = 300;

const CLEAN = 10;
const FLAGGED = 5;
const COLS = 5;
const CELL = 46;
const GAP = 10;
const GRID_X = 26;
const GRID_Y = 56;

const flaggedStudies = [
  "Strong SDE convergence",
  "Barrier monitoring bias",
  "Heston variance discretization",
  "Market-surface calibration",
  "Confidence coverage",
];

const cells = Array.from({ length: CLEAN + FLAGGED }, (_, i) => ({
  i,
  clean: i < CLEAN,
  cx: GRID_X + (i % COLS) * (CELL + GAP),
  cy: GRID_Y + Math.floor(i / COLS) * (CELL + GAP),
}));

export function StudyLedger() {
  return (
    <svg
      className="plate__svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Fifteen study cells: ten filled, marking clean results, and five outlined, marking documented caveats. The five flagged studies are named alongside."
    >
      <text className="p-label p-label--ink" x={GRID_X} y={30} data-pop>
        15 STUDIES
      </text>
      <text className="p-label" x={GRID_X + 78} y={30} data-pop style={{ ["--i"]: 1 } as React.CSSProperties}>
        10 clean · 5 flagged · none failed
      </text>

      {cells.map((c) => (
        <g key={c.i} data-pop style={{ ["--i"]: c.i } as React.CSSProperties}>
          <rect
            x={c.cx}
            y={c.cy}
            width={CELL}
            height={CELL}
            className={c.clean ? "p-fill" : ""}
            fill={c.clean ? undefined : "none"}
            stroke={c.clean ? "none" : "var(--signal)"}
            strokeWidth={1.5}
            strokeDasharray={c.clean ? undefined : "4 3"}
          />
          {c.clean ? null : (
            <text
              className="p-label--signal p-label"
              x={c.cx + CELL / 2}
              y={c.cy + CELL / 2 + 4}
              textAnchor="middle"
            >
              !
            </text>
          )}
        </g>
      ))}

      {/* the caveats, named */}
      <line
        className="p-grid"
        x1={GRID_X + COLS * (CELL + GAP) + 14}
        x2={GRID_X + COLS * (CELL + GAP) + 14}
        y1={GRID_Y}
        y2={GRID_Y + 3 * CELL + 2 * GAP}
        pathLength={1}
        data-draw
      />
      {flaggedStudies.map((s, i) => (
        <text
          key={s}
          className="p-label"
          x={GRID_X + COLS * (CELL + GAP) + 26}
          y={GRID_Y + 12 + i * 20}
          data-pop
          style={{ ["--i"]: i + 6 } as React.CSSProperties}
        >
          <tspan className="p-label--signal">!</tspan>
          <tspan dx={7}>{s}</tspan>
        </text>
      ))}

      <text className="p-label" x={GRID_X} y={H - 12} data-pop>
        793 deterministic tests · 14-job CI matrix · every figure regenerated from a committed record
      </text>
    </svg>
  );
}
