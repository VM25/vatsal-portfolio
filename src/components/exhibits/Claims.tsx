"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { fixed } from "@/lib/format";
import { useSceneActions } from "@/components/world/ScrollState";
import type { Claim } from "@/data/research";

/*
  The research claims and their evidence, ported from the prototype.

  - Claims are buttons (aria-expanded, aria-controls); each evidence block is a
    region labelled by its claim. One is open at a time; claim 1 is open by default.
    The server renders that state, and under html.js the closed ones are hidden from
    the first paint. Without JavaScript every claim shows its evidence (globals.css).
  - The Sharpe bars and the 2022 drop animate with transform: scaleX / scaleY about
    origins given in viewBox units, with transform-box: view-box (never fill-box: it
    fails silently in Safari).
  - The premise is the page's third and last beat. ResearchBeat owns the only
    observer and passes `play` down: until then, with motion and JavaScript, the bars
    wait at zero; on the beat they draw. Reduced motion and no JavaScript show them
    full from the start. If the observer never fires, a geometry check on scroll and
    on short timers does its job, and bars that are on screen for a moment without the
    premise being in view are drawn anyway, so a bar never stays at zero.

  - Layout (refinement R4): at every width the open claim's evidence is one <figure>
    directly under its claim, nothing in another column or scroll layer, and nothing
    sticky. Each figure reads top to bottom as caption (title, and the Sharpe note),
    then the chart; the identity is the formula, then its explanation. The pieces
    marked data-fade (the caption, the chart as a whole, the formula) dissolve as they
    rise toward the sticky top bar and are fully transparent before the bar reaches
    them, so no piece is ever seen cut by the bar while the rest of its figure shows,
    and the chart always leaves last, straight before the next claim. Only plain text
    that ends a figure (the identity's explanation) passes under the bar as text does.
    Opening another claim keeps the clicked claim where it was on screen, however much
    the figure above it shrinks.

  Test hooks: .claims has data-ready once hydrated and data-play; each .ev has
  data-drawn; ResearchBeat marks the premise data-beat-done once it has fired.
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
  drawdown: { label: string; zero: string; chartTitle: string; value: string };
  identity: { definition: string; body: string };
};

export type ClaimsCopy = { claims: Claim[]; evidence: Evidence };

/** The figures in a claim are set in sodium, as in the prototype. */
function highlight(text: string) {
  return text.split(/(\d+\.\d+|\d+%|real yields)/).map((part, i) => (i % 2 === 1 ? <b key={i}>{part}</b> : part));
}

/** Replay the bars of one evidence block from zero (the prototype's drawBars). */
function redraw(ev: HTMLElement | null) {
  if (!ev || window.matchMedia(REDUCED).matches) return;
  const bars = [...ev.querySelectorAll<SVGElement>(".bar")];
  if (!bars.length) return;
  for (const b of bars) {
    b.style.transition = "none";
    b.style.transform = b.dataset.ax === "y" ? "scaleY(0)" : "scaleX(0)";
  }
  void ev.getBoundingClientRect();
  window.setTimeout(() => {
    for (const b of bars) {
      b.style.transition = "";
      b.style.transform = "";
    }
  }, 60);
}

/**
 * Opacity of each piece of the open figure from its distance to the sticky top bar:
 * full until its top is FADE_GAP + FADE_PX below the bar's bottom edge, zero from
 * FADE_GAP below it, so a piece is gone before the bar covers any part of it. Pieces
 * of closed figures are reset, so a reopened one starts from its own position.
 */
function fadeAtBar(root: HTMLElement | null) {
  if (!root) return;
  for (const f of root.querySelectorAll<HTMLElement | SVGElement>(".ev:not(.on) [data-fade][style]")) {
    f.style.opacity = "";
  }
  const pieces = root.querySelectorAll<HTMLElement | SVGElement>(".ev.on [data-fade]");
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
  line inside the scaled viewBox cannot render at 14px. Everything below the title keeps
  the prototype's geometry, moved up by the title's band (30 units for the bars, 24 for the
  drop), with every transform origin given in those same viewBox units. Refinement R4 set
  the caption (title, then the Sharpe note) as the figure's figcaption over the chart, and
  sized each viewBox so every label's text box stays inside it at every width (the SVG
  clips at its edge): the bars' viewBox ends at 194, below the ticks; the drop sits
  8 units lower in a 208-unit box, its length unchanged.
*/
function Sharpe({ e }: { e: Evidence["sharpe"] }) {
  const x = (v: number) => (v / e.scaleMax) * SCALE_W;
  const ticks: number[] = [];
  for (let t = 0; t <= e.scaleMax + 1e-9; t += 0.2) ticks.push(Math.round(t * 10) / 10);
  const colors = ["#FFA62B", "#C3CBC6"];
  return (
    <figure className="fig chart">
      <figcaption data-fade="">
        <span className="ctitle">{e.chartTitle}</span>
        <span className="src">{e.source}</span>
      </figcaption>
      <svg viewBox="0 0 520 194" role="img" aria-label={e.label} data-fade="">
        {e.bars.map((b, k) => {
          const y = 46 + k * 70;
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
        <line x1="0" y1="160" x2={SCALE_W} y2="160" stroke="#5B6661" />
        <g className="ticks" fill="#9AA39E" fontSize="13">
          {ticks.map((t, i) => (
            <text
              key={t}
              x={x(t)}
              y="182"
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

function Drawdown({ e }: { e: Evidence["drawdown"] }) {
  return (
    <figure className="fig chart">
      <figcaption data-fade="">
        <span className="ctitle">{e.chartTitle}</span>
      </figcaption>
      <svg viewBox="0 0 520 208" role="img" aria-label={e.label} data-fade="">
        <line x1="0" y1="34" x2="520" y2="34" stroke="#5B6661" />
        <g className="ticks" fill="#9AA39E" fontSize="13">
          <text x="0" y="24">
            {e.zero}
          </text>
        </g>
        <line
          className="bar"
          data-ax="y"
          x1="60"
          y1="34"
          x2="60"
          y2="186"
          stroke="#FFA62B"
          strokeWidth="5"
          strokeLinecap="round"
          style={{ transformOrigin: "60px 34px" }}
        />
        <circle cx="60" cy="186" r="7" fill="#FFA62B" />
        <text className="tb" x="76" y="194" fill="#FFA62B" fontSize="30">
          {e.value}
        </text>
      </svg>
    </figure>
  );
}

export function Claims({ copy, play, identity }: { copy: ClaimsCopy; play: boolean; identity: ReactNode }) {
  const [open, setOpen] = useState(0);
  const [opened, setOpened] = useState<boolean[]>(() => copy.claims.map(() => false));
  /** Bumped by every click, so a reopened claim replays its bars too. */
  const [clicks, setClicks] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  /** The clicked claim and its viewport top before the click, held until the layout settles. */
  const pinned = useRef<{ i: number; top: number } | null>(null);

  useEffect(() => {
    if (root.current) root.current.dataset.ready = "";
  }, []);

  // The open figure dissolves as one unit on its way under the top bar (see the header note).
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => {
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

  useLayoutEffect(() => {
    if (!clicks) return;
    const el = root.current;
    // Hold the clicked claim where it was: the figure that closed above it may have been taller.
    const keep = () => {
      const p = pinned.current;
      const b = p && el?.querySelectorAll<HTMLElement>("button.claim")[p.i];
      if (!p || !b) return;
      const d = b.getBoundingClientRect().top - p.top;
      if (Math.abs(d) > 0.5) window.scrollTo({ top: window.scrollY + d, behavior: "instant" });
    };
    keep();
    redraw(el?.querySelector<HTMLElement>(".ev.on") ?? null);
    fadeAtBar(el);
    // Once more on the next frame, in case the browser's own scroll anchoring moved the page too.
    const raf = requestAnimationFrame(() => {
      keep();
      pinned.current = null;
      fadeAtBar(el);
    });
    return () => cancelAnimationFrame(raf);
  }, [clicks]);

  const choose = (i: number, btn: HTMLElement) => {
    pinned.current = { i, top: btn.getBoundingClientRect().top };
    setOpen(i);
    setOpened((o) => (o[i] ? o : o.map((v, k) => v || k === i)));
    setClicks((n) => n + 1);
  };

  const ev = copy.evidence;
  const body = (kind: Claim["evidenceKind"]) => {
    if (kind === "sharpe") return <Sharpe e={ev.sharpe} />;
    if (kind === "drawdown") return <Drawdown e={ev.drawdown} />;
    const def = ev.identity.definition;
    return (
      <figure className="fig">
        <p className="ident" data-fade="">
          {identity}
          <span className="def">
            {def.startsWith("b ") ? (
              <>
                <i>b</i>
                {def.slice(1)}
              </>
            ) : (
              def
            )}
          </span>
        </p>
        <figcaption className="note">{ev.identity.body}</figcaption>
      </figure>
    );
  };

  return (
    <div className="claims" ref={root} data-play={String(play)}>
      {copy.claims.map((c, i) => (
        <ClaimRow
          key={c.id}
          c={c}
          on={open === i}
          drawn={play || opened[i]}
          onChoose={(btn) => choose(i, btn)}
        >
          {body(c.evidenceKind)}
        </ClaimRow>
      ))}
    </div>
  );
}

function ClaimRow({
  c,
  on,
  drawn,
  onChoose,
  children,
}: {
  c: Claim;
  on: boolean;
  drawn: boolean;
  onChoose: (btn: HTMLElement) => void;
  children: ReactNode;
}) {
  const btn = `cl-${c.id}`;
  const region = `ev-${c.evidenceKind}`;
  return (
    <>
      <h3 className="claim-h">
        <button type="button" className="claim" id={btn} aria-expanded={on} aria-controls={region} onClick={(e) => onChoose(e.currentTarget)}>
          <small>{c.context}</small>
          <span className="ct">{highlight(c.text)}</span>
        </button>
      </h3>
      <div className={on ? "ev on" : "ev"} id={region} role="region" aria-labelledby={btn} data-drawn={String(drawn)}>
        {children}
      </div>
    </>
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
 * The premise, the question and the claims. Owns the premise's beat: requestBeat()
 * once, the first time the premise is at least half in view, and `play` for the bars.
 */
export function ResearchBeat({
  premise,
  ask,
  copy,
  identity,
}: {
  premise: string;
  ask: ReactNode;
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
    /** Any bar of the open evidence on screen (a bar at zero length still has its place). */
    const barsOnScreen = () =>
      [...(el.parentElement?.querySelectorAll<SVGElement>(".claims .ev.on .bar") ?? [])].some((b) => {
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
      <p className="premise" data-beat-fog="" ref={premiseRef}>
        {premise}
      </p>
      {ask}
      <Claims copy={copy} play={play} identity={identity} />
    </>
  );
}
