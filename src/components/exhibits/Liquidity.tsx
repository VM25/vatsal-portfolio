"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { createToy, runSchedule } from "@/lib/mmToy";
import { num, signed } from "@/lib/format";
import { useSceneActions } from "@/components/world/ScrollState";
import { fill, readFonts, sizeCanvas } from "@/components/exhibits/canvas";

/*
  The Liquidity Paradox: the fast moment. A seeded toy market maker (src/lib/mmToy.ts)
  runs for about 4.2 s, accelerating, then cuts: the drawing dims, the scene gets its
  beat and "4.2% skill" stamps. The drawing is ported from the prototype.

  - The server HTML (and a page without JavaScript) shows the final 420-trade state,
    computed during render, and the client starts from the same state, so hydration
    matches. The run starts once, when the stage is 45% in view, from zero.
  - Every run follows the same fixed schedule (runSchedule), so it always ends on the
    default state; a late timer applies every tick that is due, so a busy device keeps
    to about 4.2 s. One run at a time: a new one cancels the pending timer first.
  - The five counters and the equation line are written together, from one snapshot of
    the toy, in one synchronous pass. React renders them once with the final state and
    never re-renders their text; the run rewrites the text nodes in place.
  - While the tab is hidden the timer is cancelled and the run's clock stands still;
    it resumes where it was when the tab is visible again.
  - Reduced motion: "Run it again" and the first view compute all 420 trades at once.
    No run, no rush, no stamp; the single beat still counts (the scene drops its flash).
  - The counters are aria-hidden while running; one polite sentence says how it ended.

  Test hooks on the article: data-run-id, data-running, data-steps, data-runs-done,
  data-beat-count, data-rush, data-timers-pending, data-timers-pending-max.
*/

const TOTAL = 420;
const PLAN = runSchedule(TOTAL, 4200);
const CANVAS_H = 250;
/** Canvas text at 14px, the secondary text minimum. */
const TEXT_FS = 14;
/** Quotes sit one tick either side of the mid (the toy's half-spread). */
const HALF = 1;
/** The toy keeps the last 160 mids; the drawing spans them. */
const SPAN = 159;
/** Only part of the stage needs to be in view for the run to start. */
const START_AT = 0.45;

type Toy = ReturnType<typeof createToy>;

type Snapshot = {
  trades: string;
  earned: string;
  lost: string;
  random: string;
  net: string;
  /** The equation before " = ", and the net after it. */
  lhs: string;
  rhs: string;
};

/** Everything the counters and the equation line show, read from the toy at one instant. */
function snapshot(t: Toy): Snapshot {
  const s = t.state;
  const eq = t.equation();
  const at = eq.lastIndexOf(" = ");
  return {
    trades: num(s.trades),
    earned: signed(s.earned),
    lost: signed(-s.lost),
    random: signed(s.random),
    net: signed(t.net()),
    lhs: eq.slice(0, at),
    rhs: eq.slice(at + 3),
  };
}

function finalToy(): Toy {
  const t = createToy();
  for (let i = 0; i < TOTAL; i++) t.step();
  return t;
}

const FINAL = snapshot(finalToy());

/** Rewrite an element's single text node in place (React rendered it; it never changes it again). */
function setText(el: HTMLElement | null, v: string) {
  if (!el) return;
  const n = el.firstChild;
  if (n && n.nodeType === Node.TEXT_NODE && !n.nextSibling) {
    if (n.nodeValue !== v) n.nodeValue = v;
  } else if (el.textContent !== v) el.textContent = v;
}

export type LiquidityCopy = {
  canvasLabel: string;
  counters: { trades: string; earned: string; lost: string; noise: string; net: string };
  caption: string;
  replay: string;
  rails: { ask: string; bid: string };
  unit: string;
  /** "{net}", "{trades}". */
  finished: string;
};

type Life = {
  id: number;
  done: number;
  beats: number;
  started: boolean;
  beaten: boolean;
  pending: number;
  pendingMax: number;
  rush: number;
  running: boolean;
};

export function Liquidity({ copy, intro, cut }: { copy: LiquidityCopy; intro: ReactNode; cut: ReactNode }) {
  const { requestBeat, setRush } = useSceneActions();
  const [said, setSaid] = useState("");

  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const count = useRef<HTMLDivElement>(null);
  const eq = useRef<HTMLParagraphElement>(null);
  const cutRef = useRef<HTMLDivElement>(null);
  const tEl = useRef<HTMLElement>(null);
  const eEl = useRef<HTMLElement>(null);
  const lEl = useRef<HTMLElement>(null);
  const uEl = useRef<HTMLElement>(null);
  const nEl = useRef<HTMLElement>(null);
  const lhsEl = useRef<HTMLSpanElement>(null);
  const rhsEl = useRef<HTMLElement>(null);

  // Survives StrictMode's effect re-run (cleanup, then the effect again on the same
  // instance), so a run, a beat or a count is never repeated. A real unmount starts over.
  const life = useRef<Life>({
    id: 0,
    done: 0,
    beats: 0,
    started: false,
    beaten: false,
    pending: 0,
    pendingMax: 0,
    rush: 0,
    running: false,
  });
  const startRef = useRef<(() => void) | null>(null);
  const copyRef = useRef(copy);

  useEffect(() => {
    copyRef.current = copy;
  });

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    const st = stage.current;
    if (!el || !cv || !st) return;
    const L = life.current;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let fonts = readFonts(cv);
    let toy = finalToy();
    let dim = false;
    /** The next tick of the schedule to apply. */
    let k = 0;
    /** When the run started, moved on by any time the tab spent hidden. */
    let t0 = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    /** When the tab went hidden with a tick still to come. */
    let parkedAt: number | null = null;
    /** The frame that sets the finish sentence after an instant run. */
    let sayFrame = 0;
    let live = true;

    const mark = () => {
      const d = el.dataset;
      d.runId = String(L.id);
      d.running = String(L.running);
      d.steps = String(toy.state.trades);
      d.runsDone = String(L.done);
      d.beatCount = String(L.beats);
      d.rush = String(L.rush);
      d.timersPending = String(L.pending);
      d.timersPendingMax = String(L.pendingMax);
    };

    const draw = () => {
      const { g, w: W, h: H } = sizeCanvas(cv, CANVAS_H);
      const P = toy.state.path;
      const n = P.length;
      g.clearRect(0, 0, W, H);
      let lo = Infinity;
      let hi = -Infinity;
      for (const v of P) {
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
      lo -= 4;
      hi += 4;
      const X = (i: number) => 40 + (i / SPAN) * (W - 48);
      const Y = (v: number) => H - 14 - ((v - lo) / (hi - lo)) * (H - 28);
      g.globalAlpha = dim ? 0.4 : 1;
      g.lineWidth = 1;
      g.strokeStyle = "rgba(195,203,198,0.35)";
      for (const o of [HALF, -HALF]) {
        g.beginPath();
        for (let i = 0; i < n; i++) {
          if (i === 0) g.moveTo(X(i), Y(P[i] + o));
          else g.lineTo(X(i), Y(P[i] + o));
        }
        g.stroke();
      }
      g.strokeStyle = "rgba(230,235,231,0.75)";
      g.lineWidth = 1.4;
      g.beginPath();
      for (let i = 0; i < n; i++) {
        if (i === 0) g.moveTo(X(i), Y(P[i]));
        else g.lineTo(X(i), Y(P[i]));
      }
      g.stroke();
      for (const f of toy.state.fills) {
        g.fillStyle = f.informed ? "#FFA62B" : "rgba(230,235,231,0.85)";
        g.beginPath();
        g.arc(X(f.i), Y(P[f.i] + f.side * HALF), f.informed ? 3.2 : 2.4, 0, 6.283);
        g.fill();
      }
      g.globalAlpha = 1;
      // Labels for the two quote rails: "ask" above its rail, "bid" below, so they never overlap.
      g.fillStyle = "#9AA39E";
      g.font = `${TEXT_FS}px ${fonts.sans}`;
      g.textAlign = "left";
      g.fillText(copyRef.current.rails.ask, 4, Y(P[0] + HALF) - 3);
      g.fillText(copyRef.current.rails.bid, 4, Y(P[0] - HALF) + TEXT_FS - 1);
    };

    /** The five counters and the equation line, from one snapshot, in one pass. */
    const paint = () => {
      const s = snapshot(toy);
      setText(tEl.current, s.trades);
      setText(eEl.current, s.earned);
      setText(lEl.current, s.lost);
      setText(uEl.current, s.random);
      setText(nEl.current, s.net);
      setText(lhsEl.current, `${s.lhs} = `);
      setText(rhsEl.current, s.rhs);
      draw();
      mark();
      return s;
    };

    const quiet = (on: boolean) => {
      for (const e of [count.current, eq.current]) {
        if (!e) continue;
        if (on) e.setAttribute("aria-hidden", "true");
        else e.removeAttribute("aria-hidden");
      }
    };

    const rushTo = (v: number) => {
      L.rush = v;
      setRush(v);
    };

    const cancel = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
        L.pending -= 1;
      }
      parkedAt = null;
      if (sayFrame) cancelAnimationFrame(sayFrame);
      sayFrame = 0;
    };

    const finish = (instant: boolean) => {
      L.running = false;
      L.done += 1;
      quiet(false);
      dim = !instant;
      rushTo(0);
      // The exhibit's one beat: on the first finished run only.
      if (!L.beaten) {
        L.beaten = true;
        L.beats += 1;
        requestBeat();
        const big = cutRef.current?.querySelector<HTMLElement>("[data-beat]");
        if (big && !instant) {
          big.classList.remove("landed");
          void big.offsetWidth;
          big.classList.add("landed");
        }
      }
      const s = paint();
      const text = fill(copyRef.current.finished, { net: s.net, trades: s.trades });
      if (!instant) {
        setSaid(text);
        return;
      }
      // An instant run cleared the sentence in this same task; set it again a frame later,
      // so the live region changes twice and a replay is announced again.
      sayFrame = requestAnimationFrame(() => {
        sayFrame = 0;
        setSaid(text);
      });
    };

    /** Time the next tick (k) against the run's clock; park it while the tab is hidden. */
    const wait = () => {
      if (document.hidden) {
        parkedAt = performance.now();
        mark();
        return;
      }
      const d = Math.max(0, PLAN.at[k] - (performance.now() - t0));
      L.pending += 1;
      L.pendingMax = Math.max(L.pendingMax, L.pending);
      timer = setTimeout(() => {
        timer = undefined;
        L.pending -= 1;
        tick();
      }, d);
      mark();
    };

    /**
     * Apply tick k and, if the timer fired late (a busy device), every later tick whose
     * time has passed, so the run keeps to about 4.2 s. Then one write of the result.
     */
    const tick = () => {
      const last = PLAN.batches.length - 1;
      const now = performance.now() - t0;
      let j = k;
      while (j < last && PLAN.at[j + 1] <= now) j += 1;
      for (; k <= j; k++) for (let i = 0; i < PLAN.batches[k]; i++) toy.step();
      rushTo(Math.min(1, PLAN.f[j] * 1.15));
      paint();
      if (k > last) finish(false);
      else wait();
    };

    const start = () => {
      cancel();
      rushTo(0);
      L.id += 1;
      L.started = true;
      toy = createToy();
      k = 0;
      dim = false;
      if (rm.matches) {
        // Commit the cleared sentence now; finish() sets it again on the next frame.
        flushSync(() => setSaid(""));
        for (let i = 0; i < TOTAL; i++) toy.step();
        L.running = false;
        finish(true);
        return;
      }
      setSaid("");
      L.running = true;
      quiet(true);
      mark();
      t0 = performance.now();
      tick();
    };
    startRef.current = start;

    const onVisibility = () => {
      if (document.hidden) {
        if (timer === undefined) return;
        cancel();
        parkedAt = performance.now();
        mark();
      } else if (parkedAt !== null) {
        // The run's clock stood still while hidden.
        t0 += performance.now() - parkedAt;
        parkedAt = null;
        wait();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(
      (entries) => {
        if (L.started) {
          io.disconnect();
          return;
        }
        if (!entries.some((e) => e.isIntersecting && e.intersectionRatio >= START_AT - 0.01)) return;
        io.disconnect();
        start();
      },
      { threshold: START_AT },
    );
    io.observe(st);

    const ro = new ResizeObserver(() => draw());
    ro.observe(cv);
    document.fonts?.ready.then(() => {
      if (!live) return;
      fonts = readFonts(cv);
      draw();
    });

    paint();

    return () => {
      live = false;
      startRef.current = null;
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      cancel();
      if (L.running) {
        L.running = false;
        quiet(false);
      }
      rushTo(0);
    };
  }, [requestBeat, setRush]);

  const c = copy.counters;
  return (
    <article className="ex ex-mm" id="liquidity" aria-labelledby="lp-h" ref={root}>
      <div className="intro">{intro}</div>
      <div className="mm-stage" ref={stage}>
        <canvas ref={canvas} id="mmCanvas" height={CANVAS_H} role="img" aria-label={copy.canvasLabel} />
        <div className="mm-count" ref={count}>
          <div>
            <b id="mmT" ref={tEl}>
              {FINAL.trades}
            </b>
            <span>{c.trades}</span>
          </div>
          <div>
            <b id="mmE" ref={eEl}>
              {FINAL.earned}
            </b>
            <span>{c.earned}</span>
          </div>
          <div>
            <b id="mmL" className="s" ref={lEl}>
              {FINAL.lost}
            </b>
            <span>{c.lost}</span>
          </div>
          <div>
            <b id="mmU" ref={uEl}>
              {FINAL.random}
            </b>
            <span>{c.noise}</span>
          </div>
          <div className="net">
            <b id="mmN" ref={nEl}>
              {FINAL.net}
            </b>
            <span>{c.net}</span>
          </div>
        </div>
        <p className="mm-eq" id="mmEq" aria-live="off" ref={eq}>
          <span ref={lhsEl}>{`${FINAL.lhs} = `}</span>
          <b ref={rhsEl}>{FINAL.rhs}</b>
          {` ${copy.unit}`}
        </p>
        <p className="cap">{copy.caption}</p>
        <p className="sr-only" data-say aria-live="polite" aria-atomic="true">
          {said}
        </p>
        <button className="mm-replay" type="button" id="mmReplay" onClick={() => startRef.current?.()}>
          {copy.replay}
        </button>
      </div>
      <div className="cut" id="mmCut" ref={cutRef}>
        {cut}
      </div>
    </article>
  );
}
