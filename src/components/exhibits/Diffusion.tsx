"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { blackScholesCall, crrTree } from "@/lib/pricing";
import { fixed } from "@/lib/format";
import { useSceneActions } from "@/components/world/ScrollState";
import { fill, readFonts, sizeCanvas } from "@/components/exhibits/canvas";

/*
  DiffusionWorks: a Cox–Ross–Rubinstein tree closing in on Black–Scholes. The drawing
  is ported from the prototype; the numbers come from src/lib/pricing.ts.

  The default view carries the finding (refinement R3): the tree at N = 12 with its
  node values, and the convergence chart with its key values set as annotations on
  the chart itself: "Black–Scholes 9.9251" on the dashed line, "N = 12 · 9.7612" and
  the difference beside the marker, whose stroke to the dashed line is that
  difference. The model inputs come after the visuals and the result, as a quiet
  group. The per-node values drawn on the tree are repeated in a visually hidden
  table, one row per step, rendered from the same rows, so it changes with the
  canvas; only the chart's axis tick labels are canvas-only.

  The annotations are DOM text placed over the canvas. Their heights come from the
  same scale the canvas uses (scale(), from the cached curve's range and the
  Black–Scholes price), so label and line agree; their horizontal place is a CSS calc
  of the chart's width. The default curve is computed during render, so the server
  HTML (and a page with no JavaScript) carries the real values and positions, and
  hydration matches.

  The visible numbers update on every input. The polite live region gets its
  sentence 250 ms after the last input of a drag, or 120 ms after the last `change`
  (keyboard repeats fire one `change` per step), which also starts the sweep.
*/

const S0 = 100;
const R0 = 0.04;
const TT = 1;
const SWEEP_MS = 650;
const SAY_IDLE_MS = 250;
const CHANGE_IDLE_MS = 120;
const TREE_H = 300;
const CHART_H = 230;
/** Canvas text: node values and notes at 14px (secondary text minimum); axis ticks at 12px. */
const TREE_FS = 14;
const AXIS_FS = 12;
/** The convergence chart's plot box, in CSS px: left and right insets, top, and the band under the axis. */
const PLOT = { l: 56, r: 10, t: 14, b: 30 };
/** Annotation sizes for placing them (CSS px): the marker label's width and height, and the gap from what it labels. */
const MK_W = 150;
const MK_H = 44;
const AN_GAP = 10;

type Inputs = { N: number; sig: number; K: number };

/** Slider defaults: N steps, σ in percent, strike K. */
const DEFAULTS: Readonly<Inputs> = { N: 12, sig: 20, K: 100 };

type Plural = { one: string; other: string };

export type DiffusionCopy = {
  controls: { steps: string; volatility: string; strike: string };
  /** The group label over the sliders. */
  inputsLabel: string;
  /** Words in the chart's annotations: the dashed line's label and the difference beside the marker. */
  annotations: { blackScholes: string; difference: string };
  /** The contract, on the chart caption: "{sig}" percent; `other` also takes "{K}". */
  terms: { atMoney: string; other: string };
  treeLabel: string;
  /** "{shown}" of "{total}" steps. */
  treeCaption: string;
  /** "{total}" steps, when the whole tree fits. */
  treeCaptionAll: Plural;
  /** The node values as a visually hidden table; `step` takes "{i}". */
  treeTable: { caption: string; step: string };
  /** "{n}" steps beyond the canvas. */
  treeMore: Plural;
  chartLabel: string;
  chartCaption: string;
  /** "{v}" percent. */
  percentText: string;
  /** "{N}", "{sig}", "{K}", "{bin}", "{bs}", "{gap}". */
  say: string;
};

function plural(p: Plural, n: number, vars: Record<string, string | number>): string {
  return fill(n === 1 ? p.one : p.other, vars);
}

/** Difference to 4 dp with a sign: "+" for zero and up, true minus below. */
function diff(v: number): string {
  const s = fixed(Math.abs(v), 4);
  return (v < 0 && Number(s) !== 0 ? "−" : "+") + s;
}

function price({ N, sig, K }: Inputs, keep: number) {
  const tree = crrTree({ S: S0, K, r: R0, sigma: sig / 100, T: TT, N, keep });
  const ref = blackScholesCall(S0, K, R0, sig / 100, TT);
  return { tree, ref, gap: tree.price - ref };
}

/** Binomial prices for N = 1 to 200 at this σ (percent) and K: the convergence chart's dots. */
function convergence(sig: number, K: number): number[] {
  const v: number[] = [];
  for (let n = 1; n <= 200; n++) v.push(crrTree({ S: S0, K, r: R0, sigma: sig / 100, T: TT, N: n, keep: -1 }).price);
  return v;
}

type Tail = { lo: number; hi: number };

/** The curve's range from N = 3 on (N = 1 and 2 swing too far to scale by). */
function tailRange(v: number[]): Tail {
  const tail = v.slice(2);
  return { lo: Math.min(...tail), hi: Math.max(...tail) };
}

/**
 * The chart's vertical scale: the curve's range and the Black–Scholes price, padded by a
 * quarter. The canvas and the DOM annotations both place values with it.
 */
function scale(tail: Tail, ref: number) {
  const lo0 = Math.min(tail.lo, ref);
  const hi0 = Math.max(tail.hi, ref);
  const pad = (hi0 - lo0) * 0.25 + 0.02;
  const lo = lo0 - pad;
  const hi = hi0 + pad;
  const B = CHART_H - PLOT.b;
  const Y = (v: number) => B - ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (B - PLOT.t);
  return { lo0, hi0, Y };
}

/** Where the annotations sit, from the scale, the selected N and the chart's width (0 before it is measured). */
function placeLabels(Y: (v: number) => number, ref: number, bin: number, N: number, width: number) {
  const W = width || 600;
  const f = (N - 1) / 199;
  const x = `calc(${PLOT.l}px + (100% - ${PLOT.l + PLOT.r}px) * ${f.toFixed(5)})`;
  const yRef = Y(ref);
  const yBin = Y(bin);
  const above = yBin <= yRef;
  // The marker label sits on the marker's side of the line, away from it; beside the
  // marker when that side has no room. Black–Scholes is labelled on the other side.
  let v: "up" | "down" | "mid" = above ? "up" : "down";
  if (above && yBin - AN_GAP - MK_H < 0) v = "mid";
  if (!above && yBin + AN_GAP + MK_H > CHART_H) v = "mid";
  const mx = PLOT.l + f * (W - PLOT.l - PLOT.r);
  const toRight = mx + AN_GAP + MK_W <= W - 4;
  const tx = toRight ? `${AN_GAP}px` : `calc(-100% - ${AN_GAP}px)`;
  const ty = v === "up" ? `calc(-100% - ${AN_GAP}px)` : v === "down" ? `${AN_GAP}px` : "-50%";
  const top = v === "mid" ? Math.max(MK_H / 2, Math.min(CHART_H - MK_H / 2, yBin)) : yBin;
  return {
    marker: { left: x, top: `${top.toFixed(1)}px`, transform: `translate(${tx}, ${ty})` },
    ref: {
      right: `${PLOT.r}px`,
      top: `${yRef.toFixed(1)}px`,
      transform: above ? "translateY(6px)" : "translateY(calc(-100% - 6px))",
    },
  };
}

function sayText(i: Inputs, copy: DiffusionCopy): string {
  const { tree, ref, gap } = price(i, -1);
  return fill(copy.say, { N: i.N, sig: i.sig, K: i.K, bin: fixed(tree.price, 4), bs: fixed(ref, 4), gap: diff(gap) });
}

/** Set the single-letter symbols (N, σ, K, S, r, T) in STIX italic, as the prototype does. */
function symbols(text: string): ReactNode {
  const out: ReactNode[] = [];
  const re = /(^|\s)([NσKSrT])(?=[\s.,;)]|$)/g;
  let at = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const start = m.index + m[1].length;
    out.push(<Fragment key={at}>{text.slice(at, start)}</Fragment>);
    out.push(
      <span key={`s${start}`} className="stix">
        <i>{m[2]}</i>
      </span>,
    );
    at = start + 1;
  }
  out.push(<Fragment key={at}>{text.slice(at)}</Fragment>);
  return out;
}

function treeCaption(N: number, shown: number, copy: DiffusionCopy): string {
  return N <= shown
    ? plural(copy.treeCaptionAll, N, { total: N })
    : fill(copy.treeCaption, { shown, total: N });
}

function readInputs(n: HTMLInputElement | null, s: HTMLInputElement | null, k: HTMLInputElement | null): Inputs {
  return {
    N: n?.valueAsNumber ?? DEFAULTS.N,
    sig: s?.valueAsNumber ?? DEFAULTS.sig,
    K: k?.valueAsNumber ?? DEFAULTS.K,
  };
}

type Model = { inputs: Inputs; keep: number; rows: number[][]; ref: number; more: string };

export function Diffusion({
  copy,
  intro,
  result,
}: {
  copy: DiffusionCopy;
  intro: ReactNode;
  result: ReactNode;
}) {
  const { requestBeat } = useSceneActions();
  const [N, setN] = useState(DEFAULTS.N);
  const [sig, setSig] = useState(DEFAULTS.sig);
  const [K, setK] = useState(DEFAULTS.K);
  const [maxShow, setMaxShow] = useState(6);
  const [chartW, setChartW] = useState(0);
  const [said, setSaid] = useState<Inputs>(DEFAULTS);
  // The default curve, computed once during render so the server places the annotations.
  const [first] = useState(() => ({ key: `${DEFAULTS.sig}|${DEFAULTS.K}`, v: convergence(DEFAULTS.sig, DEFAULTS.K) }));
  // The range of the curve the canvas is drawing (it follows the cached curve, not the inputs).
  const [tail, setTail] = useState<Tail>(() => tailRange(first.v));

  const inputs: Inputs = { N, sig, K };
  const keep = Math.min(N, maxShow);
  const { tree, ref, gap } = price(inputs, keep);
  const more = N > keep ? plural(copy.treeMore, N - keep, { n: N - keep }) : "";
  const at = placeLabels(scale(tail, ref).Y, ref, tree.price, N, chartW);
  const terms = K === S0 ? fill(copy.terms.atMoney, { sig }) : fill(copy.terms.other, { sig, K });

  const nIn = useRef<HTMLInputElement>(null);
  const sIn = useRef<HTMLInputElement>(null);
  const kIn = useRef<HTMLInputElement>(null);
  const tc = useRef<HTMLCanvasElement>(null);
  const cc = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const model = useRef<Model | null>(null);
  const fonts = useRef({ mono: "monospace", sans: "sans-serif" });
  const curve = useRef<{ key: string; v: number[] }>(first);
  // The pending curve recompute: at most one per animation frame (0 when none).
  const curveRaf = useRef(0);
  // How many times the curve has been computed (data-curves, for tests); the default once.
  const curves = useRef(1);
  // pending counts rAF callbacks requested and not yet run or cancelled.
  const sweep = useRef({ t: 1, raf: 0, start: 0, frames: 0, sweeps: 0, pending: 0, pendingMax: 0 });
  const draws = useRef(0);
  const sayTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const changeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const beaten = useRef(false);

  const drawTree = useCallback(() => {
    const c = tc.current;
    const L = model.current;
    if (!c || !L) return;
    const { g, w: W, h: H } = sizeCanvas(c, TREE_H);
    const k = L.keep;
    const rows = L.rows;
    const sweepT = sweep.current.t;
    const { mono, sans } = fonts.current;
    g.clearRect(0, 0, W, H);
    const padX = 36;
    const padY = 26;
    const front = k * (1 - sweepT);
    const X = (i: number) => padX + (k === 0 ? 0 : (i * (W - 2 * padX - 40)) / k);
    const Y = (i: number, j: number) => H / 2 - ((2 * j - i) * (H / 2 - padY)) / Math.max(1, k);
    g.lineWidth = 1;
    for (let i = 0; i < k; i++)
      for (let j = 0; j <= i; j++) {
        for (const [bi, bj] of [
          [i + 1, j],
          [i + 1, j + 1],
        ]) {
          const hot = sweepT < 1 && i >= front - 1 && i <= front;
          g.strokeStyle = hot ? "rgba(255,166,43,0.9)" : "rgba(195,203,198,0.3)";
          g.beginPath();
          g.moveTo(X(i), Y(i, j));
          g.lineTo(X(bi), Y(bi, bj));
          g.stroke();
        }
      }
    for (let i = 0; i <= k; i++)
      for (let j = 0; j <= i; j++) {
        const shown = i >= front - 0.001;
        const hot = sweepT < 1 && Math.abs(i - front) < 0.6;
        g.fillStyle = hot || i === 0 ? "#FFA62B" : "#C3CBC6";
        if (hot) {
          g.shadowColor = "#FFA62B";
          g.shadowBlur = 12;
        }
        g.beginPath();
        g.arc(X(i), Y(i, j), i === 0 ? 5 : 3, 0, 6.283);
        g.fill();
        g.shadowBlur = 0;
        if (shown && rows[i]) {
          g.fillStyle = i === 0 ? "#FFC873" : "rgba(230,235,231,0.85)";
          g.font = `${i === 0 ? TREE_FS + 2 : TREE_FS}px ${mono}`;
          g.textAlign = "center";
          g.fillText(rows[i][j].toFixed(2), X(i), Y(i, j) - 9);
        }
      }
    if (L.more) {
      g.fillStyle = "#9AA39E";
      g.font = `${TREE_FS}px ${sans}`;
      g.textAlign = "right";
      g.fillText(L.more, W - 4, H - 6);
    }
    draws.current += 1;
    c.dataset.draws = String(draws.current);
  }, []);

  /*
    The convergence curve is 200 binomial trees, the costliest thing on the exhibit. The
    default curve is computed during the first render. After that, a σ or K input draws
    straight away against the cached curve (the marker, the Black–Scholes line, the axes
    and the annotations move at once) and asks for the new curve in the next animation
    frame; however many inputs land before that frame, the curve is recomputed once, for
    the latest σ and K, the chart redrawn and the annotations re-placed on its range.
  */
  const drawChart = useCallback(function draw() {
    const c = cc.current;
    const L = model.current;
    if (!c || !L) return;
    const { sig: sg, K: k, N: n0 } = L.inputs;
    if (curve.current.key !== `${sg}|${k}` && !curveRaf.current) {
      curveRaf.current = requestAnimationFrame(() => {
        curveRaf.current = 0;
        const M = model.current;
        if (!M) return;
        const next = `${M.inputs.sig}|${M.inputs.K}`;
        if (curve.current.key !== next) {
          curve.current = { key: next, v: convergence(M.inputs.sig, M.inputs.K) };
          curves.current += 1;
          setTail(tailRange(curve.current.v));
        }
        draw();
      });
    }
    const drawnKey = curve.current.key;
    const cv = curve.current.v;
    const { g, w: W, h: H } = sizeCanvas(c, CHART_H);
    const { mono } = fonts.current;
    g.clearRect(0, 0, W, H);
    const { lo0, hi0, Y } = scale(tailRange(cv), L.ref);
    const Lx = PLOT.l;
    const Rx = W - PLOT.r;
    const T = PLOT.t;
    const B = H - PLOT.b;
    const X = (n: number) => Lx + ((n - 1) / 199) * (Rx - Lx);
    g.lineWidth = 1;
    g.strokeStyle = "rgba(195,203,198,0.25)";
    g.beginPath();
    g.moveTo(Lx, T);
    g.lineTo(Lx, B);
    g.lineTo(Rx, B);
    g.stroke();
    g.fillStyle = "#9AA39E";
    g.font = `${AXIS_FS}px ${mono}`;
    g.textAlign = "right";
    // The curve's extremes; Black–Scholes is labelled on its line, in the DOM.
    for (const v of [lo0, hi0]) g.fillText(v.toFixed(2), Lx - 6, Y(v) + 4);
    g.textAlign = "center";
    for (const n of [1, 50, 100, 150]) g.fillText(String(n), X(n), B + 17);
    // The last tick ends at the canvas edge rather than running past it.
    g.textAlign = "right";
    g.fillText("200", W - 1, B + 17);
    g.setLineDash([5, 5]);
    g.strokeStyle = "#FFA62B";
    g.beginPath();
    g.moveTo(Lx, Y(L.ref));
    g.lineTo(Rx, Y(L.ref));
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = "rgba(230,235,231,0.75)";
    for (let n = 1; n <= 200; n++) {
      g.beginPath();
      g.arc(X(n), Y(cv[n - 1]), 1.5, 0, 6.283);
      g.fill();
    }
    // The marker, and its stroke to the Black–Scholes line: the difference, drawn.
    const mx = X(n0);
    const my = Y(cv[n0 - 1]);
    g.strokeStyle = "rgba(255,166,43,0.85)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(mx, my);
    g.lineTo(mx, Y(L.ref));
    g.stroke();
    g.lineWidth = 1;
    g.fillStyle = "#FFA62B";
    g.shadowColor = "#FFA62B";
    g.shadowBlur = 10;
    g.beginPath();
    g.arc(mx, my, 5, 0, 6.283);
    g.fill();
    g.shadowBlur = 0;
    // What the chart shows, for tests: the marker's N and the curve's σ|K.
    c.dataset.markerN = String(n0);
    c.dataset.curve = drawnKey;
    c.dataset.curves = String(curves.current);
  }, []);

  const markSweep = useCallback(() => {
    const c = tc.current;
    if (!c) return;
    const s = sweep.current;
    c.dataset.sweepFrames = String(s.frames);
    c.dataset.sweeping = String(s.raf !== 0);
    c.dataset.sweeps = String(s.sweeps);
    c.dataset.rafPendingMax = String(s.pendingMax);
  }, []);

  const stopSweep = useCallback(() => {
    const s = sweep.current;
    if (s.raf) {
      cancelAnimationFrame(s.raf);
      s.pending -= 1;
    }
    s.raf = 0;
    s.t = 1;
  }, []);

  // Keep the drawing model in step with what was rendered.
  useLayoutEffect(() => {
    model.current = { inputs: { N, sig, K }, keep, rows: tree.rows, ref, more };
  });

  useEffect(() => {
    drawChart();
    drawTree();
  }, [N, sig, K, maxShow, drawChart, drawTree]);

  // Native `change` (release, or a keyboard step): once the steps settle, announce and sweep.
  useEffect(() => {
    const els = [nIn.current, sIn.current, kIn.current].filter(Boolean) as HTMLInputElement[];
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const request = (cb: FrameRequestCallback) => {
      const s = sweep.current;
      s.pending += 1;
      s.pendingMax = Math.max(s.pendingMax, s.pending);
      return requestAnimationFrame((now) => {
        s.pending -= 1;
        cb(now);
      });
    };
    const settle = () => {
      clearTimeout(sayTimer.current);
      setSaid(readInputs(nIn.current, sIn.current, kIn.current));
      if (rm.matches) return; // no sweep; the input already drew the tree once
      stopSweep();
      const s = sweep.current;
      s.t = 0;
      s.start = performance.now();
      s.sweeps += 1;
      const frame = (now: number) => {
        // A frame's timestamp can precede the call that started the sweep.
        s.t = Math.min(1, Math.max(0, now - s.start) / SWEEP_MS);
        s.frames += 1;
        drawTree();
        s.raf = s.t >= 1 ? 0 : request(frame);
        markSweep();
      };
      s.raf = request(frame);
      markSweep();
    };
    const onChange = () => {
      clearTimeout(changeTimer.current);
      changeTimer.current = setTimeout(settle, CHANGE_IDLE_MS);
    };
    els.forEach((e) => e.addEventListener("change", onChange));
    return () => {
      els.forEach((e) => e.removeEventListener("change", onChange));
      clearTimeout(sayTimer.current);
      clearTimeout(changeTimer.current);
      stopSweep();
    };
  }, [drawTree, markSweep, stopSweep]);

  // Size from CSS width; redraw on resize; 5 tree steps on canvases under 420px.
  useEffect(() => {
    const c = tc.current;
    const ch = cc.current;
    if (!c || !ch) return;
    fonts.current = readFonts(c);
    markSweep();
    c.dataset.draws = String(draws.current);
    // A slider moved before hydration (or restored by the browser) wins over the defaults.
    const pre = readInputs(nIn.current, sIn.current, kIn.current);
    if (pre.N !== DEFAULTS.N || pre.sig !== DEFAULTS.sig || pre.K !== DEFAULTS.K) {
      setN(pre.N);
      setSig(pre.sig);
      setK(pre.K);
      setSaid(pre);
    }
    let live = true;
    const fit = () => {
      setMaxShow((c.clientWidth || 600) < 420 ? 5 : 6);
      setChartW(ch.clientWidth);
      drawTree();
      drawChart();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    ro.observe(ch);
    document.fonts?.ready.then(() => {
      if (!live) return;
      fonts.current = readFonts(c);
      drawTree();
      drawChart();
    });
    return () => {
      live = false;
      ro.disconnect();
      cancelAnimationFrame(curveRaf.current);
      curveRaf.current = 0;
    };
  }, [drawChart, drawTree, markSweep]);

  // The "10 of 15" stamp: one beat, the first time it is seen.
  useEffect(() => {
    const el = resultRef.current?.querySelector<HTMLElement>("[data-beat]");
    if (!el || beaten.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (beaten.current || !entries.some((e) => e.isIntersecting)) return;
        beaten.current = true;
        io.disconnect();
        requestBeat();
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          el.classList.remove("landed");
          void el.offsetWidth;
          el.classList.add("landed");
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [requestBeat]);

  // During a drag: numbers now, the announcement once the input settles.
  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, valueAsNumber: v } = e.currentTarget;
    if (id === "dwN") setN(v);
    else if (id === "dwS") setSig(v);
    else setK(v);
    clearTimeout(sayTimer.current);
    sayTimer.current = setTimeout(() => setSaid(readInputs(nIn.current, sIn.current, kIn.current)), SAY_IDLE_MS);
  };

  return (
    <article className="ex ex-math" id="diffusion" aria-labelledby="dw-h">
      <div className="intro">{intro}</div>
      <div className="viz">
        <canvas ref={tc} id="dwTree" height={TREE_H} role="img" aria-label={copy.treeLabel} />
        <div className="sr-only">
          <table>
            <caption>{copy.treeTable.caption}</caption>
            <tbody>
              {tree.rows.slice(0, keep + 1).map((row, i) => (
                <tr key={i}>
                  <th scope="row">{fill(copy.treeTable.step, { i })}</th>
                  {row
                    .slice(0, i + 1)
                    .map((v, j) => <td key={j}>{fixed(v, 2)}</td>)
                    .reverse()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="cap" id="dwTreeCap">
          {treeCaption(N, maxShow, copy)}
        </p>
        <div className="dw-chart">
          <canvas ref={cc} id="dwChart" height={CHART_H} role="img" aria-label={copy.chartLabel} />
          {/* The chart's key values, set on the chart: the dashed line's label, then the marker's. */}
          <p className="an an-bs" id="dwBSLabel" style={at.ref}>
            {copy.annotations.blackScholes} <b id="dwBS">{fixed(ref, 4)}</b>
          </p>
          <p className="an an-mk" id="dwMarker" style={at.marker}>
            <span className="an-v">
              <span className="stix">
                <i>N</i>
              </span>{" "}
              = <b>{N}</b> · <b id="dwBin">{fixed(tree.price, 4)}</b>
            </span>
            <span className="an-d">
              {copy.annotations.difference} <b id="dwGap">{diff(gap)}</b>
            </span>
          </p>
        </div>
        <p className="cap" id="dwChartCap">
          <span className="terms" id="dwTerms">
            {symbols(terms)}
          </span>{" "}
          {symbols(copy.chartCaption)}
        </p>
      </div>
      <div className="result" ref={resultRef}>
        {result}
      </div>
      <div className="inputs" role="group" aria-labelledby="dwInputs">
        <p className="lbl" id="dwInputs">
          {copy.inputsLabel}
        </p>
        <div className="ctrls">
          <div className="ctrl">
            <label htmlFor="dwN">{symbols(copy.controls.steps)}</label>
            <output id="dwNo" htmlFor="dwN" className="num" aria-live="off">
              {N}
            </output>
            <input ref={nIn} id="dwN" type="range" min={1} max={200} step={1} value={N} onChange={onInput} />
          </div>
          <div className="ctrl">
            <label htmlFor="dwS">{symbols(copy.controls.volatility)}</label>
            <output id="dwSo" htmlFor="dwS" className="num" aria-live="off">
              {sig}%
            </output>
            <input
              ref={sIn}
              id="dwS"
              type="range"
              min={5}
              max={80}
              step={1}
              value={sig}
              aria-valuetext={fill(copy.percentText, { v: sig })}
              onChange={onInput}
            />
          </div>
          <div className="ctrl">
            <label htmlFor="dwK">{symbols(copy.controls.strike)}</label>
            <output id="dwKo" htmlFor="dwK" className="num" aria-live="off">
              {K}
            </output>
            <input ref={kIn} id="dwK" type="range" min={60} max={140} step={1} value={K} onChange={onInput} />
          </div>
        </div>
        <p className="sr-only" id="dwSay" data-say aria-live="polite" aria-atomic="true">
          {sayText(said, copy)}
        </p>
      </div>
    </article>
  );
}
