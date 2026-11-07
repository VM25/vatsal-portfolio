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

/*
  DiffusionWorks: a Cox–Ross–Rubinstein tree closing in on Black–Scholes. The drawing
  is ported from the prototype; the numbers come from src/lib/pricing.ts. Every number
  the canvases show is also in the DOM (readouts, the u d p line, the captions).

  The intro, result and formula copy are rendered by the server component and passed
  in as slots. Default readouts are computed during render, so the server HTML (and a
  page with no JavaScript) carries the real values and hydration matches.

  The readouts' visible numbers update on every input; the polite live region gets its
  sentence on `change`, or 250 ms after the last input of a drag.
*/

const S0 = 100;
const R0 = 0.04;
const TT = 1;
const SWEEP_MS = 650;
const SAY_IDLE_MS = 250;
const TREE_H = 300;
const CHART_H = 230;

export type DiffusionCopy = {
  controls: { steps: string; volatility: string; strike: string };
  readouts: { binomial: string; blackScholes: string; difference: string };
  treeLabel: string;
  treeCaption: string;
  chartLabel: string;
  chartCaption: string;
  formulaLabel: string;
  assumptions: string;
};

type Inputs = { N: number; sig: number; K: number };

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

function sayText(i: Inputs, copy: DiffusionCopy): string {
  const { tree, ref, gap } = price(i, -1);
  return `N = ${i.N}, σ = ${i.sig}%, K = ${i.K}. ${copy.readouts.binomial} ${fixed(tree.price, 4)}. ${copy.readouts.blackScholes} ${fixed(ref, 4)}. ${copy.readouts.difference} ${diff(gap)}.`;
}

/** Set the single-letter symbols N, σ and K in STIX italic, as the prototype does. */
function symbols(text: string): ReactNode {
  const out: ReactNode[] = [];
  const re = /(^|\s)([NσK])(?=[\s.,)]|$)/g;
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

function treeCaption(N: number, shown: number, template: string): string {
  if (N <= shown) {
    const tail = template.slice(template.indexOf(". ") + 2);
    return `All ${N} step${N > 1 ? "s" : ""}. ${tail}`;
  }
  return template.replace("{shown}", String(shown)).replace("{total}", String(N));
}

function sizeCanvas(c: HTMLCanvasElement, h: number) {
  const w = c.clientWidth || 600;
  const pr = Math.min(2, window.devicePixelRatio || 1);
  const bw = Math.round(w * pr);
  const bh = Math.round(h * pr);
  if (c.width !== bw) c.width = bw;
  if (c.height !== bh) c.height = bh;
  const g = c.getContext("2d")!;
  g.setTransform(pr, 0, 0, pr, 0, 0);
  return { g, w, h };
}

function fontVar(el: Element, name: string, fallback: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
}

function readInputs(n: HTMLInputElement | null, s: HTMLInputElement | null, k: HTMLInputElement | null): Inputs {
  return { N: n?.valueAsNumber ?? 12, sig: s?.valueAsNumber ?? 20, K: k?.valueAsNumber ?? 100 };
}

type Model = { inputs: Inputs; keep: number; rows: number[][]; ref: number };

export function Diffusion({
  copy,
  intro,
  formulas,
  result,
}: {
  copy: DiffusionCopy;
  intro: ReactNode;
  formulas: ReactNode;
  result: ReactNode;
}) {
  const { requestBeat } = useSceneActions();
  const [N, setN] = useState(12);
  const [sig, setSig] = useState(20);
  const [K, setK] = useState(100);
  const [maxShow, setMaxShow] = useState(6);
  const [said, setSaid] = useState<Inputs>({ N: 12, sig: 20, K: 100 });

  const inputs: Inputs = { N, sig, K };
  const keep = Math.min(N, maxShow);
  const { tree, ref, gap } = price(inputs, keep);
  const { u, d, p } = tree.params;

  const nIn = useRef<HTMLInputElement>(null);
  const sIn = useRef<HTMLInputElement>(null);
  const kIn = useRef<HTMLInputElement>(null);
  const tc = useRef<HTMLCanvasElement>(null);
  const cc = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const model = useRef<Model | null>(null);
  const curve = useRef<{ key: string; v: number[] }>({ key: "", v: [] });
  const sweep = useRef({ t: 1, raf: 0, start: 0, frames: 0, sweeps: 0, live: 0, liveMax: 0 });
  const draws = useRef(0);
  const sayTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const beaten = useRef(false);

  const drawTree = useCallback(() => {
    const c = tc.current;
    const L = model.current;
    if (!c || !L) return;
    const { g, w: W, h: H } = sizeCanvas(c, TREE_H);
    const k = L.keep;
    const rows = L.rows;
    const sweepT = sweep.current.t;
    const mono = fontVar(c, "--font-num", "monospace");
    const sans = fontVar(c, "--font-world", "sans-serif");
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
    const fs = W < 420 ? 12 : 13;
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
          g.font = `${i === 0 ? fs + 2 : fs}px ${mono}`;
          g.textAlign = "center";
          g.fillText(rows[i][j].toFixed(2), X(i), Y(i, j) - 9);
        }
      }
    if (L.inputs.N > k) {
      g.fillStyle = "#9AA39E";
      g.font = `13px ${sans}`;
      g.textAlign = "right";
      g.fillText(`… ${L.inputs.N - k} more steps to expiry`, W - 4, H - 6);
    }
    draws.current += 1;
    c.dataset.draws = String(draws.current);
  }, []);

  const drawChart = useCallback(() => {
    const c = cc.current;
    const L = model.current;
    if (!c || !L) return;
    const { sig: sg, K: k, N: n0 } = L.inputs;
    const key = `${sg}|${k}`;
    if (curve.current.key !== key) {
      const v: number[] = [];
      for (let n = 1; n <= 200; n++) v.push(crrTree({ S: S0, K: k, r: R0, sigma: sg / 100, T: TT, N: n, keep: -1 }).price);
      curve.current = { key, v };
    }
    const cv = curve.current.v;
    const { g, w: W, h: H } = sizeCanvas(c, CHART_H);
    const mono = fontVar(c, "--font-num", "monospace");
    g.clearRect(0, 0, W, H);
    const tail = cv.slice(2);
    let lo = Math.min(Math.min(...tail), L.ref);
    let hi = Math.max(Math.max(...tail), L.ref);
    const pad = (hi - lo) * 0.25 + 0.02;
    lo -= pad;
    hi += pad;
    const Lx = 56;
    const Rx = W - 10;
    const T = 14;
    const B = H - 30;
    const X = (n: number) => Lx + ((n - 1) / 199) * (Rx - Lx);
    const Y = (v: number) => B - ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (B - T);
    g.lineWidth = 1;
    g.strokeStyle = "rgba(195,203,198,0.25)";
    g.beginPath();
    g.moveTo(Lx, T);
    g.lineTo(Lx, B);
    g.lineTo(Rx, B);
    g.stroke();
    g.fillStyle = "#9AA39E";
    g.font = `12px ${mono}`;
    g.textAlign = "right";
    for (const v of [lo + pad, L.ref, hi - pad]) g.fillText(v.toFixed(2), Lx - 6, Y(v) + 4);
    g.textAlign = "center";
    for (const n of [1, 50, 100, 150, 200]) g.fillText(String(n), X(n), B + 17);
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
    const mx = X(n0);
    const my = Y(cv[n0 - 1]);
    g.strokeStyle = "rgba(255,166,43,0.5)";
    g.beginPath();
    g.moveTo(mx, T);
    g.lineTo(mx, B);
    g.stroke();
    g.fillStyle = "#FFA62B";
    g.shadowColor = "#FFA62B";
    g.shadowBlur = 10;
    g.beginPath();
    g.arc(mx, my, 5, 0, 6.283);
    g.fill();
    g.shadowBlur = 0;
  }, []);

  const markSweep = useCallback(() => {
    const c = tc.current;
    if (!c) return;
    const s = sweep.current;
    c.dataset.sweepFrames = String(s.frames);
    c.dataset.sweeping = String(s.live > 0);
    c.dataset.sweeps = String(s.sweeps);
    c.dataset.sweepsLiveMax = String(s.liveMax);
  }, []);

  const stopSweep = useCallback(() => {
    const s = sweep.current;
    if (s.raf) cancelAnimationFrame(s.raf);
    s.raf = 0;
    if (s.live > 0) s.live -= 1;
    s.t = 1;
  }, []);

  // Keep the drawing model in step with what was rendered, then draw.
  useLayoutEffect(() => {
    model.current = { inputs: { N, sig, K }, keep, rows: tree.rows, ref };
  });

  useEffect(() => {
    drawChart();
    drawTree();
    // Only the values that change the picture.
  }, [N, sig, K, maxShow, drawChart, drawTree]);

  // Native `change` (release, or a keyboard step): announce now, and sweep.
  useEffect(() => {
    const els = [nIn.current, sIn.current, kIn.current].filter(Boolean) as HTMLInputElement[];
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      clearTimeout(sayTimer.current);
      setSaid(readInputs(nIn.current, sIn.current, kIn.current));
      if (rm.matches) return; // no sweep; the input already drew the tree once
      stopSweep();
      const s = sweep.current;
      s.t = 0;
      s.start = performance.now();
      s.sweeps += 1;
      s.live += 1;
      s.liveMax = Math.max(s.liveMax, s.live);
      markSweep();
      const frame = (now: number) => {
        // A frame's timestamp can precede the event that started the sweep.
        s.t = Math.min(1, Math.max(0, now - s.start) / SWEEP_MS);
        s.frames += 1;
        drawTree();
        if (s.t >= 1) {
          s.raf = 0;
          s.live -= 1;
        } else {
          s.raf = requestAnimationFrame(frame);
        }
        markSweep();
      };
      s.raf = requestAnimationFrame(frame);
    };
    els.forEach((e) => e.addEventListener("change", onChange));
    return () => {
      els.forEach((e) => e.removeEventListener("change", onChange));
      clearTimeout(sayTimer.current);
      stopSweep();
    };
  }, [drawTree, markSweep, stopSweep]);

  // Size from CSS width; redraw on resize; 5 tree steps on canvases under 420px.
  useEffect(() => {
    const c = tc.current;
    const ch = cc.current;
    if (!c || !ch) return;
    markSweep();
    c.dataset.draws = String(draws.current);
    // A slider moved before hydration (or restored by the browser) wins over the defaults.
    const pre = readInputs(nIn.current, sIn.current, kIn.current);
    if (pre.N !== 12 || pre.sig !== 20 || pre.K !== 100) {
      setN(pre.N);
      setSig(pre.sig);
      setK(pre.K);
      setSaid(pre);
    }
    let live = true;
    const fit = () => {
      setMaxShow((c.clientWidth || 600) < 420 ? 5 : 6);
      drawTree();
      drawChart();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    ro.observe(ch);
    document.fonts?.ready.then(() => {
      if (live) {
        drawTree();
        drawChart();
      }
    });
    return () => {
      live = false;
      ro.disconnect();
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

  const say = said.N === N && said.sig === sig && said.K === K ? sayText(inputs, copy) : sayText(said, copy);

  return (
    <article className="ex ex-math" id="diffusion" aria-labelledby="dw-h">
      <div className="intro">{intro}</div>
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
            aria-valuetext={`${sig} percent`}
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
      <div className="viz">
        <canvas ref={tc} id="dwTree" height={TREE_H} role="img" aria-label={copy.treeLabel} />
        <p className="cap" id="dwTreeCap">
          {treeCaption(N, maxShow, copy.treeCaption)}
        </p>
        <canvas ref={cc} id="dwChart" height={CHART_H} role="img" aria-label={copy.chartLabel} />
        <p className="cap">{symbols(copy.chartCaption)}</p>
      </div>
      <div className="read" aria-live="polite">
        <div aria-hidden="true">
          <b id="dwBin">{fixed(tree.price, 4)}</b>
          <span>{copy.readouts.binomial}</span>
        </div>
        <div aria-hidden="true">
          <b id="dwBS" className="s">
            {fixed(ref, 4)}
          </b>
          <span>{copy.readouts.blackScholes}</span>
        </div>
        <div aria-hidden="true">
          <b id="dwGap">{diff(gap)}</b>
          <span>{copy.readouts.difference}</span>
        </div>
        <p className="sr-only" data-say>
          {say}
        </p>
      </div>
      <div className="formula" role="group" aria-label={copy.formulaLabel}>
        {formulas}
        <span className="lp" id="dwLive">
          N = {N} · u = {u.toFixed(5)} · d = {d.toFixed(5)} · p = {p.toFixed(5)}
        </span>
        <span className="lp">{copy.assumptions}</span>
      </div>
      <div className="result" ref={resultRef}>
        {result}
      </div>
    </article>
  );
}
