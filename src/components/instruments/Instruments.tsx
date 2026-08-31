"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/*
  One instrument per project, drawn from that project's own result. They are not
  decoration and they are not stock chart furniture: each says the specific thing
  its project found, and the number that matters is called out in the accent.

  Colours come from the CSS classes in globals, so every panel automatically
  takes on the identity colour of whichever project is on stage.
*/

const EASE = [0.16, 1, 0.3, 1] as const;
const W = 380;
const H = 260;

/*
  Animation mechanics, written for Safari as well as Chrome.

  Three things here are deliberate, and all three were causing the panels to
  fail silently in Safari — the elements rendered, then stayed at their initial
  state, which for a bar at scale 0 means invisible:

  1. No `transform-box: fill-box`. Safari's support for it on SVG is late and
     unreliable; when it misbehaves the shape scales about the wrong origin and
     collapses. Every origin here is given in user-space viewBox coordinates
     against `view-box`, which is the SVG default and broadly supported.

  2. No `whileInView`. These panels mount already inside the viewport — you
     clicked a project to get here — and Safari can decline to fire an
     IntersectionObserver for an element that mounts already-intersecting inside
     a parent that is itself animating. The section decides when to play and
     passes it down instead.

  3. No framer `pathLength`. The stroke reveal is written out explicitly as
     dasharray plus dashoffset against a static `pathLength={1}`, so there is no
     library-specific path measurement involved.
*/
function useAnim(play: boolean) {
  const reduce = useReducedMotion();
  const still = reduce || !play;

  const at = (delay: number, duration: number) => ({
    duration,
    delay,
    ease: EASE,
  });

  return {
    /** Stroke reveal. `pathLength={1}` must be set on the path itself. */
    draw: (delay: number) =>
      still
        ? { style: { strokeDasharray: 1, strokeDashoffset: 0 } }
        : {
            style: { strokeDasharray: 1 },
            initial: { strokeDashoffset: 1, opacity: 0 },
            animate: { strokeDashoffset: 0, opacity: 1 },
            transition: at(delay, 0.9),
          },

    /** Grows vertically about a given viewBox y. */
    grow: (delay: number, originY: number, originX = 0) =>
      still
        ? {}
        : {
            style: {
              transformBox: "view-box" as const,
              transformOrigin: `${originX}px ${originY}px`,
            },
            initial: { scaleY: 0 },
            animate: { scaleY: 1 },
            transition: at(delay, 0.6),
          },

    /** Grows horizontally about a given viewBox x. */
    wide: (delay: number, originX: number, originY = 0) =>
      still
        ? {}
        : {
            style: {
              transformBox: "view-box" as const,
              transformOrigin: `${originX}px ${originY}px`,
            },
            initial: { scaleX: 0 },
            animate: { scaleX: 1 },
            transition: at(delay, 0.6),
          },

    pop: (delay: number) =>
      still
        ? {}
        : {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: at(delay, 0.4),
          },
  };
}

/** The section tells each panel when to play, so nothing depends on an
    observer firing inside an already-visible, already-animating parent. */
export interface PanelProps {
  play: boolean;
}

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg className="panel__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {children}
    </svg>
  );
}

/* ------------------------------------------------------- 01 YIELDSHOCK --- */
/* The 2022 loss, split into the channels that caused it. */
export function YieldShockPanel({ play }: PanelProps) {
  const a = useAnim(play);
  const steps = [
    { k: "Real", v: -278 },
    { k: "Convex", v: 64 },
    { k: "Curve", v: 37 },
    { k: "B/E", v: 11 },
    { k: "Resid", v: -26 },
  ];
  const MIN = -300, MAX = 60;
  const top = 26, plot = 170, left = 44, cw = (W - left - 20) / (steps.length + 1);
  const y = (v: number) => top + ((MAX - v) / (MAX - MIN)) * plot;
  let run = 0;
  const bars = steps.map((s, i) => {
    const from = run; run += s.v;
    const hi = y(Math.max(from, run)), lo = y(Math.min(from, run));
    return { ...s, i, x: left + i * cw + cw * 0.18, w: cw * 0.6, top: hi, h: Math.max(2, lo - hi), loss: s.v < 0 };
  });
  const netTop = y(Math.max(0, run));
  return (
    <Frame label="2022 loss by channel: real rate dominates, breakevens barely move">
      {[0, -100, -200, -300].map((v) => (
        <g key={v}>
          <line className="gr" x1={left} x2={W - 16} y1={y(v)} y2={y(v)} strokeDasharray={v ? "2 4" : "0"} />
          <text className="tx" x={6} y={y(v) + 3}>{v ? `${v}k` : "0"}</text>
        </g>
      ))}
      {bars.map((b) => (
        <g key={b.k}>
          <motion.rect className={b.loss ? "fl" : "fl-mute"} x={b.x} y={b.top} width={b.w} height={b.h}
            {...a.grow(b.i * 0.09, b.loss ? b.top : b.top + b.h)} />
          <motion.text className="tx" x={b.x + b.w / 2} y={H - 34} textAnchor="middle" {...a.pop(0.5 + b.i * 0.06)}>{b.k}</motion.text>
        </g>
      ))}
      <motion.rect className="fl" x={left + steps.length * cw + cw * 0.18} y={netTop}
        width={cw * 0.6} height={Math.max(2, y(Math.min(0, run)) - netTop)} {...a.grow(0.5, netTop)} />
      <motion.text className="tx tx-hi" x={left + steps.length * cw + cw * 0.48} y={H - 34} textAnchor="middle" {...a.pop(0.8)}>NET</motion.text>
      <motion.text className="tx tx-hi" x={left} y={H - 12} {...a.pop(0.9)}>−$192K on a $1M book · real rate carries it</motion.text>
    </Frame>
  );
}

/* ---------------------------------------------------- 02 SIGNAL SURVIVAL - */
/* Five strategies, and what survived the costs. */
export function SignalPanel({ play }: PanelProps) {
  const a = useAnim(play);
  const rows = [
    { k: "Cross-sec momentum", s: 0.62, v: "SURVIVED", ok: true },
    { k: "Ensemble", s: 0.59, v: "SURVIVED", ok: true },
    { k: "Time-series momentum", s: 0.57, v: "SURVIVED", ok: true },
    { k: "Vol-scaled", s: 0.57, v: "CONDITIONAL", ok: true },
    { k: "Short-term reversal", s: 0.44, v: "REJECTED", ok: false },
  ];
  const left = 130, right = 96, plot = W - left - right, top = 34, rh = 38;
  const x = (s: number) => (s / 0.7) * plot;
  return (
    <Frame label="Net Sharpe by signal; short-term reversal rejected">
      <motion.text className="tx" x={16} y={18} {...a.pop(0)}>NET SHARPE, AFTER COSTS</motion.text>
      {rows.map((r, i) => {
        const cy = top + i * rh;
        return (
          <g key={r.k}>
            <text className="tx" x={left - 10} y={cy + 12} textAnchor="end">{r.k}</text>
            <motion.rect className={r.ok ? "fl" : "fl-mute"} x={left} y={cy + 2} width={x(r.s)} height={13}
              opacity={r.v === "CONDITIONAL" ? 0.55 : 1} {...a.wide(i * 0.09, left)} />
            <motion.text className={r.ok ? "tx" : "tx-hi"} x={left + x(r.s) + 8} y={cy + 12} {...a.pop(0.4 + i * 0.07)}>
              {r.s.toFixed(2)}
            </motion.text>
            <motion.text className={r.ok ? "tx" : "tx-hi"} x={W - 14} y={cy + 12} textAnchor="end" {...a.pop(0.5 + i * 0.07)}>
              {r.v}
            </motion.text>
          </g>
        );
      })}
      <line className="ax" x1={left} x2={left} y1={top - 4} y2={top + rows.length * rh - 8} />
      <motion.text className="tx tx-hi" x={16} y={H - 12} {...a.pop(0.9)}>Reversal trades 12.8×/yr — costs eat it</motion.text>
    </Frame>
  );
}

/* ------------------------------------------------------ 03 DIFFUSIONWORKS */
/* Fifteen experiments; the five that found something are the point. */
export function DiffusionPanel({ play }: PanelProps) {
  const a = useAnim(play);
  const flagged = ["Convergence order", "Barrier bias", "Heston variance", "Surface calibration", "Interval coverage"];
  const cell = 30, gap = 7, cols = 5, gx = 18, gy = 40;
  return (
    <Frame label="Fifteen experiments: ten clean, five flagged">
      <motion.text className="tx" x={gx} y={22} {...a.pop(0)}>15 EXPERIMENTS · 10 CLEAN · 5 FLAGGED</motion.text>
      {Array.from({ length: 15 }, (_, i) => {
        const clean = i < 10;
        const cx = gx + (i % cols) * (cell + gap);
        const cy = gy + Math.floor(i / cols) * (cell + gap);
        return (
          <motion.g key={i} {...a.pop(i * 0.035)}>
            <rect x={cx} y={cy} width={cell} height={cell}
              className={clean ? "fl-mute" : ""} fill={clean ? undefined : "none"}
              stroke={clean ? "none" : "var(--accent)"} strokeWidth={1.5} strokeDasharray={clean ? undefined : "3 2"} />
            {clean ? null : <text className="tx tx-hi" x={cx + cell / 2} y={cy + cell / 2 + 4} textAnchor="middle">!</text>}
          </motion.g>
        );
      })}
      <line className="gr" x1={gx + cols * (cell + gap) + 6} x2={gx + cols * (cell + gap) + 6} y1={gy} y2={gy + 3 * cell + 2 * gap} />
      {flagged.map((f, i) => (
        <motion.text key={f} className="tx" x={gx + cols * (cell + gap) + 18} y={gy + 12 + i * 17} {...a.pop(0.5 + i * 0.07)}>
          <tspan className="tx-hi">!</tspan>
          <tspan dx={6}>{f}</tspan>
        </motion.text>
      ))}
      <motion.text className="tx tx-hi" x={gx} y={H - 12} {...a.pop(0.95)}>The five caveats are the finding</motion.text>
    </Frame>
  );
}

/* ----------------------------------------------------- 04 CURRENCY OPTIONS */
/* What a hedge removes, and what it deliberately leaves. */
export function FxPanel({ play }: PanelProps) {
  const a = useAnim(play);
  const left = 44, right = 20, top = 30, plot = 160;
  const px = (t: number) => left + t * (W - left - right);
  const py = (d: number) => top + (1 - d) * plot;
  const logistic = (t: number) => 1 / (1 + Math.exp(-11 * (t - 0.5)));
  const path = (f: (t: number) => number) =>
    Array.from({ length: 41 }, (_, i) => {
      const t = i / 40;
      return `${i ? "L" : "M"}${px(t).toFixed(1)},${py(f(t)).toFixed(1)}`;
    }).join(" ");
  return (
    <Frame label="Portfolio delta against spot, before and after hedging">
      <line className="gr" x1={left} x2={W - right} y1={py(0.5)} y2={py(0.5)} strokeDasharray="2 4" />
      <text className="tx" x={8} y={py(0.5) + 3}>0Δ</text>
      <line className="gr" x1={px(0.5)} x2={px(0.5)} y1={top} y2={top + plot} strokeDasharray="2 4" />
      <text className="tx" x={px(0.5)} y={H - 46} textAnchor="middle">SPOT</text>
      <motion.path className="ln-mute" pathLength={1} d={path((t) => 0.56 + logistic(t) * 0.38)} {...a.draw(0.05)} />
      <motion.path className="ln" pathLength={1} d={path((t) => 0.5 + (logistic(t) - 0.5) * 0.38)} {...a.draw(0.2)} />
      <motion.circle cx={px(0.5)} cy={py(0.5)} r={4} className="fl" {...a.pop(0.9)} />
      <motion.text className="tx" x={W - right} y={py(0.96)} textAnchor="end" {...a.pop(0.8)}>UNHEDGED</motion.text>
      <motion.text className="tx tx-hi" x={W - right} y={py(0.24)} textAnchor="end" {...a.pop(0.9)}>HEDGED — FLAT AT SPOT</motion.text>
      <motion.text className="tx tx-hi" x={left} y={H - 12} {...a.pop(1)}>All direction removed · curvature kept on purpose</motion.text>
    </Frame>
  );
}

/* ------------------------------------------------------ 05 LENDING ------- */
/* One of the three models does not clear the bar, and says so. */
export function CreditPanel({ play }: PanelProps) {
  const a = useAnim(play);
  const rows = [
    { k: "Fraud", v: 0.97, verdict: "PASS", flag: false },
    { k: "AML", v: 0.87, verdict: "PASS", flag: false },
    { k: "Underwriting", v: 0.695, verdict: "MONITOR", flag: true },
  ];
  const left = 108, right = 92, plot = W - left - right, top = 52, rh = 46;
  const x = (v: number) => ((v - 0.5) / 0.5) * plot;
  return (
    <Frame label="Model discrimination against the no-skill baseline">
      <motion.text className="tx" x={16} y={22} {...a.pop(0)}>SEPARATING GOOD FROM BAD</motion.text>
      {[0.5, 0.75, 1].map((v) => (
        <g key={v}>
          <line className="gr" x1={left + x(v)} x2={left + x(v)} y1={top - 12} y2={top + rows.length * rh - 14} strokeDasharray="2 4" />
          <text className="tx" x={left + x(v)} y={top - 18} textAnchor="middle">{v.toFixed(2)}</text>
        </g>
      ))}
      <line className="ax" x1={left} x2={left} y1={top - 12} y2={top + rows.length * rh - 14} />
      <text className="tx" x={left} y={top + rows.length * rh + 2} textAnchor="middle">NO SKILL</text>
      {rows.map((r, i) => {
        const cy = top + i * rh;
        return (
          <g key={r.k}>
            <text className="tx" x={left - 12} y={cy + 12} textAnchor="end">{r.k}</text>
            <motion.rect className={r.flag ? "fl" : "fl-mute"} x={left} y={cy + 1} width={Math.max(2, x(r.v))} height={14} {...a.wide(i * 0.12, left)} />
            <motion.text className={r.flag ? "tx tx-hi" : "tx"} x={left + x(r.v) + 9} y={cy + 12} {...a.pop(0.5 + i * 0.1)}>
              {r.verdict}
            </motion.text>
          </g>
        );
      })}
      <motion.text className="tx tx-hi" x={16} y={H - 12} {...a.pop(0.9)}>The weak one is flagged, not buried</motion.text>
    </Frame>
  );
}

/* ------------------------------------------------------ 06 ALLOCATION ---- */
/* The negative result, drawn plainly. */
export function AllocationPanel({ play }: PanelProps) {
  const a = useAnim(play);
  const rows = [
    { k: "Return", a: 6.0, b: 8.4, fa: "6.0%", fb: "8.4%" },
    { k: "Volatility", a: 10.5, b: 11.1, fa: "10.5%", fb: "11.1%" },
    { k: "Sharpe", a: 0.48, b: 0.66, fa: "0.48", fb: "0.66", key: true },
    { k: "Drawdown", a: 33.3, b: 31.9, fa: "−33.3%", fb: "−31.9%" },
  ];
  const left = 92, right = 74, plot = W - left - right, top = 48, rh = 44;
  return (
    <Frame label="Regime-aware rule against 60/40; 60/40 wins on Sharpe">
      <motion.text className="tx" x={16} y={20} {...a.pop(0)}>REACTIVE RULE vs PLAIN 60/40</motion.text>
      {rows.map((r, i) => {
        const cy = top + i * rh;
        const max = Math.max(r.a, r.b);
        return (
          <g key={r.k}>
            <text className={r.key ? "tx tx-hi" : "tx"} x={left - 10} y={cy + 14} textAnchor="end">{r.k}</text>
            <motion.rect className="fl-mute" x={left} y={cy} width={(r.a / max) * plot} height={9} {...a.wide(i * 0.1, left)} />
            <motion.rect className={r.key ? "fl" : "fl-mute"} x={left} y={cy + 13} width={(r.b / max) * plot} height={9}
              opacity={r.key ? 1 : 0.75} {...a.wide(0.05 + i * 0.1, left)} />
            <motion.text className="tx" x={W - right + 8} y={cy + 8} {...a.pop(0.5 + i * 0.08)}>{r.fa}</motion.text>
            <motion.text className={r.key ? "tx tx-hi" : "tx"} x={W - right + 8} y={cy + 21} {...a.pop(0.55 + i * 0.08)}>{r.fb}</motion.text>
          </g>
        );
      })}
      <motion.text className="tx tx-hi" x={16} y={H - 12} {...a.pop(0.9)}>Reacting to the signal did not pay</motion.text>
    </Frame>
  );
}

/* ------------------------------------------------------ 07 APEXGP -------- */
/* An implied-probability book, resolving toward settlement. */
export function ApexPanel({ play }: PanelProps) {
  const a = useAnim(play);
  const rows = [
    { p: "0.71", side: "ask", w: 0.42 },
    { p: "0.68", side: "ask", w: 0.6 },
    { p: "0.66", side: "ask", w: 0.82 },
    { p: "0.64", side: "ask", w: 0.95 },
    { p: "0.61", side: "bid", w: 1.0 },
    { p: "0.58", side: "bid", w: 0.74 },
    { p: "0.55", side: "bid", w: 0.52 },
    { p: "0.52", side: "bid", w: 0.36 },
  ];
  const spine = 74, maxW = 210, top = 40, rh = 22;
  return (
    <Frame label="Implied probability book with bid and ask depth">
      <motion.text className="tx" x={16} y={22} {...a.pop(0)}>IMPLIED PROBABILITY BOOK</motion.text>
      {rows.map((r, i) => {
        const y = top + i * rh;
        const ask = r.side === "ask";
        return (
          <g key={r.p}>
            <text className="tx" x={spine - 10} y={y + 11} textAnchor="end">{r.p}</text>
            <motion.rect className={ask ? "fl-mute" : "fl"} x={spine} y={y + 2} width={r.w * maxW} height={13}
              opacity={ask ? 0.45 : 0.9} {...a.wide(i * 0.05, spine)} />
          </g>
        );
      })}
      <line className="ax" x1={spine} x2={spine} y1={top - 4} y2={top + rows.length * rh} />
      <motion.line className="ln" pathLength={1} x1={spine - 6} x2={spine + maxW} y1={top + 4 * rh} y2={top + 4 * rh} {...a.draw(0.6)} />
      <motion.text className="tx tx-hi" x={16} y={H - 12} {...a.pop(0.9)}>500+ contracts · capped at 30% book, 15% market</motion.text>
    </Frame>
  );
}

export const PANELS: Record<string, (p: PanelProps) => ReactNode> = {
  yieldshock: YieldShockPanel,
  alpha: SignalPanel,
  diffusion: DiffusionPanel,
  fxlab: FxPanel,
  credits: CreditPanel,
  pra: AllocationPanel,
  apexgp: ApexPanel,
};
