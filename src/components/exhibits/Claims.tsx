"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { fixed } from "@/lib/format";
import { useSceneActions } from "@/components/world/ScrollState";
import type { Claim } from "@/data/research";

/*
  The research findings and their evidence.

  - Refinement R7: no accordion. Each finding is one row in normal flow: its context
    line and the claim (a plain level-3 heading) and, beside it on wide screens or
    directly under it on phones, its evidence as one <figure> with a <figcaption>.
    All three show at once, with or without JavaScript, so the research reads without
    operating anything. Nothing here is sticky or fixed.
  - The Sharpe bars animate with transform: scaleX about origins given in viewBox
    units. The 2022 loss is a numerical callout, not a bar (final pass), with transform-box: view-box (never fill-box: it
    fails silently in Safari).
  - The premise is the page's third and last beat. ResearchBeat owns the only
    observer and passes `play` down: until then, with motion and JavaScript, the bars
    wait at zero; on the beat they draw. Reduced motion and no JavaScript show them
    full from the start. If the observer never fires, a geometry check on scroll and
    on short timers does its job, and bars that are on screen for a moment without the
    premise being in view are drawn anyway, so a bar never stays at zero.
  - Scrolling (refinement R4, kept in R7): the pieces of a figure marked data-fade (a
    chart's caption, the chart as a whole, the formula) dissolve as they rise toward
    the sticky top bar and are fully transparent before the bar reaches them, so no
    piece is ever seen cut by the bar while the rest of its figure shows. The figure
    leaves top-down as one unbroken run, its chart last, straight before the next
    finding. Only plain text that ends a figure (the identity's sentence) passes under
    the bar as all other text does.
  - Each chart's figcaption comes first: the title, then (Sharpe) the benchmark note, so
    no part of the figure is left on its own under a dissolved chart.

  Test hooks: .claims has data-ready once hydrated and data-play; each figure (.ev)
  has data-drawn; ResearchBeat marks the premise data-beat-done once it has fired.
*/

const REDUCED = "(prefers-reduced-motion: reduce)";
/** Viewbox width of the bar scale (the chart is 520 wide; labels sit past the bar). */
const SCALE_W = 500;
/** A bar on screen this long without its beat is drawn anyway. */
const BAR_FALLBACK_MS = 900;
/** Scroll distance over which a figure piece dissolves as it rises toward the top bar. */
const FADE_PX = 64;
/** A piece is fully transparent this far below the bar, so a frame of lag never shows it cut. */
const FADE_GAP = 8;

type Evidence = {
  sharpe: {
    label: string;
    chartTitle: string;
    scaleMax: number;
    bars: { label: string; value: number }[];
    source: string;
  };
  drawdown: { chartTitle: string; value: string };
  identity: { body: string };
};

export type ClaimsCopy = { claims: Claim[]; evidence: Evidence };

/** The figures in a claim are set in sodium, as in the prototype. */
function highlight(text: string) {
  return text.split(/(\d+\.\d+|\d+%|real yields)/).map((part, i) => (i % 2 === 1 ? <b key={i}>{part}</b> : part));
}

/** The variable b set in italic, as in the identity above it. */
function italicB(text: string) {
  return text.split(" b ").flatMap((part, i) => (i ? [" ", <i key={i}>b</i>, " ", part] : [part]));
}

/**
 * Opacity of each figure piece from its distance to the sticky top bar: full until its
 * top is FADE_GAP + FADE_PX below the bar's bottom edge, zero from FADE_GAP below it,
 * so a piece is gone before the bar covers any part of it.
 */
function fadeAtBar(root: HTMLElement | null) {
  if (!root) return;
  const pieces = root.querySelectorAll<HTMLElement | SVGElement>("[data-fade]");
  if (!pieces.length) return;
  const bar = document.querySelector("header.top")?.getBoundingClientRect().bottom ?? 0;
  for (const f of pieces) {
    const d = f.getBoundingClientRect().top - bar - FADE_GAP;
    const o = Math.min(1, Math.max(0, d / FADE_PX));
    f.style.opacity = o >= 1 ? "" : o.toFixed(3);
  }
}

/*
  The chart titles are HTML captions above the SVG, not SVG text: at 320px a title on one
  line inside the scaled viewBox cannot render at 14px. Refinement R7 made both charts
  shorter so a figure is about as tall as its finding: the Sharpe rows sit 54 units apart
  (were 70) in a 520 x 156 box (was 194); the drop is 60 units long (was 152) in a
  520 x 116 box (was 208). Every label's text box stays inside the viewBox at every width
  (the SVG clips at its edge), and every transform origin is in viewBox units.
*/
function Sharpe({ e, drawn }: { e: Evidence["sharpe"]; drawn: boolean }) {
  const x = (v: number) => (v / e.scaleMax) * SCALE_W;
  const ticks: number[] = [];
  for (let t = 0; t <= e.scaleMax + 1e-9; t += 0.2) ticks.push(Math.round(t * 10) / 10);
  const colors = ["#FFA62B", "#C3CBC6"];
  return (
    <figure className="ev chart" id="ev-sharpe" data-drawn={String(drawn)}>
      <figcaption data-fade="">
        <span className="ctitle">{e.chartTitle}</span>
        <span className="src">{e.source}</span>
      </figcaption>
      <svg viewBox="0 0 520 156" role="img" aria-label={e.label} data-fade="">
        {e.bars.map((b, k) => {
          const y = 46 + k * 54;
          const end = x(b.value);
          const c = colors[k % colors.length];
          return (
            <g key={b.label}>
              <text className="tl" x="0" y={y - 18} fill="#E6EBE7" fontSize="15">
                {b.label}
              </text>
              <line
                className="bar"
                data-ax="x"
                x1="0"
                y1={y}
                x2={end}
                y2={y}
                stroke={c}
                strokeWidth="5"
                strokeLinecap="round"
                style={{ transformOrigin: `0px ${y}px` }}
              />
              <text className="tv" x={end + 12} y={y + 6} fill={c} fontSize="20">
                {fixed(b.value, 2)}
              </text>
            </g>
          );
        })}
        <line x1="0" y1="122" x2={SCALE_W} y2="122" stroke="#5B6661" />
        <g className="ticks" fill="#9AA39E" fontSize="13">
          {ticks.map((t, i) => (
            <text
              key={t}
              x={x(t)}
              y="144"
              textAnchor={i === 0 ? undefined : i === ticks.length - 1 ? "end" : "middle"}
            >
              {t === 0 ? "0" : fixed(t, 1)}
            </text>
          ))}
        </g>
      </svg>
    </figure>
  );
}

/*
  The 2022 loss is a single number with no scale to read it against, so it is set as a
  numerical callout rather than a bar: a bar's length would imply a scale that does not
  exist (final pass).
*/
function Drawdown({ e }: { e: Evidence["drawdown"] }) {
  return (
    <figure className="ev callout" id="ev-drawdown">
      <figcaption data-fade="">
        <span className="ctitle">{e.chartTitle}</span>
      </figcaption>
      <p className="callout-v" data-fade="">
        {e.value}
      </p>
    </figure>
  );
}

export function Claims({ copy, play, identity }: { copy: ClaimsCopy; play: boolean; identity: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (root.current) root.current.dataset.ready = "";
  }, []);

  // Each figure dissolves top-down on its way under the top bar (see the header note).
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          fadeAtBar(root.current);
        });
    };
    fadeAtBar(root.current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const ev = copy.evidence;
  const figure = (kind: Claim["evidenceKind"]) => {
    if (kind === "sharpe") return <Sharpe e={ev.sharpe} drawn={play} />;
    if (kind === "drawdown") return <Drawdown e={ev.drawdown} />;
    return (
      <figure className="ev" id="ev-identity">
        <p className="ident" data-fade="">
          {identity}
        </p>
        <figcaption className="note">{italicB(ev.identity.body)}</figcaption>
      </figure>
    );
  };

  return (
    <div className="claims" ref={root} data-play={String(play)}>
      {copy.claims.map((c) => (
        <div className="finding" key={c.id} id={`finding-${c.id}`}>
          <div className="ftext">
            <p className="ctx">{c.context}</p>
            <h3 className="claim">{highlight(c.text)}</h3>
          </div>
          {figure(c.evidenceKind)}
        </div>
      ))}
    </div>
  );
}

/** Share of an element's height inside the viewport. */
function shown(el: Element): number {
  const r = el.getBoundingClientRect();
  if (r.height <= 0) return 0;
  const vis = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
  return Math.max(0, vis) / r.height;
}

/**
 * The premise beside the paper, then the findings. Owns the premise's beat:
 * requestBeat() once, the first time the premise is at least half in view, and `play`
 * for the bars.
 */
export function ResearchBeat({
  premise,
  paper,
  copy,
  identity,
}: {
  premise: string;
  paper: ReactNode;
  copy: ClaimsCopy;
  identity: ReactNode;
}) {
  const { requestBeat } = useSceneActions();
  const [play, setPlay] = useState(false);
  const premiseRef = useRef<HTMLParagraphElement>(null);
  // Survives StrictMode's effect re-run, so the beat is never repeated.
  const fired = useRef(false);

  useEffect(() => {
    const el = premiseRef.current;
    if (!el || fired.current) return;
    /** Any bar on screen (a bar at zero length still has its place). */
    const barsOnScreen = () =>
      [...(el.closest(".paper")?.querySelectorAll<SVGElement>(".claims .bar") ?? [])].some((b) => {
        const r = b.getBoundingClientRect();
        return r.bottom >= 0 && r.top <= window.innerHeight;
      });
    let barTimer: number | undefined;
    const timers: number[] = [];
    let io: IntersectionObserver | undefined;

    const stop = () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      io?.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(barTimer);
    };

    function fire() {
      if (fired.current || !el) return;
      fired.current = true;
      stop();
      requestBeat();
      setPlay(true);
      el.dataset.beatDone = "";
      if (!window.matchMedia(REDUCED).matches) {
        el.classList.remove("landed");
        void el.offsetWidth;
        el.classList.add("landed");
      }
    }

    function check() {
      if (fired.current || !el) return;
      if (shown(el) >= 0.5) {
        fire();
        return;
      }
      // Bars on screen with the premise out of view (coming up from below): draw them
      // after a moment rather than leave them at zero. The beat still waits for the premise.
      const onScreen = barsOnScreen();
      if (onScreen && barTimer === undefined) {
        barTimer = window.setTimeout(() => setPlay(true), BAR_FALLBACK_MS);
      } else if (!onScreen && barTimer !== undefined) {
        window.clearTimeout(barTimer);
        barTimer = undefined;
      }
    }

    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.5)) fire();
          else check();
        },
        { threshold: [0, 0.5, 1] },
      );
      io.observe(el);
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
    // An observer that never reports an element mounted already in view (Safari):
    // look again once layout has settled.
    for (const ms of [250, 1000]) timers.push(window.setTimeout(check, ms));
    return stop;
  }, [requestBeat]);

  return (
    <>
      <div className="lead">
        <p className="premise" data-beat-fog="" ref={premiseRef}>
          {premise}
        </p>
        {paper}
      </div>
      <Claims copy={copy} play={play} identity={identity} />
    </>
  );
}
