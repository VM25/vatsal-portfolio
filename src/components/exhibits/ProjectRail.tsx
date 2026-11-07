"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import type { RailProject } from "@/types";

/*
  More projects: six projects as WAI-ARIA tabs (vertical: Up/Down move and select,
  Home/End, roving tabindex) with one stage, ported from the prototype.

  - Wide (the .more grid has two columns): the stage sits beside the rail.
  - Narrow (one column): the stage is rendered directly after the selected tab and,
    when the reader picks a tab, scrolled into view with block "nearest" (instantly
    under reduced motion). Focus always stays on the tab.
  - The server renders the first tab selected with the stage beside the rail, so the
    collapsed tabs show from the first paint under html.js. Without JavaScript the
    chapter's <noscript> list shows all six instead (see Projects.tsx and globals.css).

  Test hooks on the tablist: data-ready once hydrated, data-narrow once measured.
*/

export type RailCopy = {
  label: string;
  open: string;
  source: string;
};

const tabId = (i: number) => `more-tab-${i}`;
const STAGE_ID = "more-stage";

function NewTab({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noopener">
      <span>
        {children} <span aria-hidden="true">↗</span>
      </span>
      <span className="sr-only">, opens in a new tab</span>
    </a>
  );
}

/** One project's stage content. Also used for the no-JavaScript list. */
export function StageBody({ p, copy, heading = true }: { p: RailProject; copy: RailCopy; heading?: boolean }) {
  return (
    <>
      <p className="fld">
        {p.field} · {p.year}
      </p>
      {heading ? <h4>{p.title}</h4> : null}
      <p className="q">{p.question}</p>
      <p className="r">{p.result}</p>
      <div className="figs">
        {p.figures.map(([n, label]) => (
          <span key={label}>
            <b>{n}</b>
            {label}
          </span>
        ))}
      </div>
      <div className="ex-links">
        <NewTab href={p.live}>{copy.open}</NewTab>
        <NewTab href={p.code}>{copy.source}</NewTab>
      </div>
    </>
  );
}

/** Two grid columns on .more means the wide layout (the container query in globals.css decides). */
function isNarrow(more: HTMLElement) {
  return getComputedStyle(more).gridTemplateColumns.trim().split(/\s+/).length < 2;
}

export function ProjectRail({ items, copy }: { items: RailProject[]; copy: RailCopy }) {
  const [sel, setSel] = useState(0);
  const [narrow, setNarrow] = useState<boolean | null>(null);
  /** Bumped on every pick by the reader: replays the swap and asks for the scroll. */
  const [picks, setPicks] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollWanted = useRef(false);

  useEffect(() => {
    const list = listRef.current;
    const more = list?.parentElement;
    if (!list || !more) return;
    list.dataset.ready = "";
    const measure = () => setNarrow(isNarrow(more));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(more);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (narrow !== null && listRef.current) listRef.current.dataset.narrow = String(narrow);
  }, [narrow]);

  // After a pick on a narrow screen, bring the stage (now under the tab) into view.
  useLayoutEffect(() => {
    if (!scrollWanted.current) return;
    scrollWanted.current = false;
    const s = stageRef.current;
    if (!s || !narrow) return;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    s.scrollIntoView({ block: "nearest", behavior: rm ? "instant" : "smooth" });
  }, [picks, narrow]);

  const pick = (i: number) => {
    scrollWanted.current = true;
    setSel(i);
    setPicks((n) => n + 1);
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = items.length;
    let next: number;
    if (e.key === "ArrowDown") next = (sel + 1) % n;
    else if (e.key === "ArrowUp") next = (sel + n - 1) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else return;
    e.preventDefault();
    pick(next);
    tabRefs.current[next]?.focus();
  };

  const p = items[sel];
  const stage = (
    <div className="stage" role="tabpanel" id={STAGE_ID} aria-labelledby={tabId(sel)} ref={stageRef}>
      <div className={picks ? "sw swap" : "sw"} key={`${sel}-${picks}`}>
        <StageBody p={p} copy={copy} />
      </div>
    </div>
  );

  return (
    <>
      <div className="rail" role="tablist" aria-label={copy.label} aria-orientation="vertical" ref={listRef}>
        {items.map((it, i) => (
          <Fragment key={it.title}>
            <button
              type="button"
              role="tab"
              id={tabId(i)}
              aria-selected={i === sel}
              aria-controls={STAGE_ID}
              tabIndex={i === sel ? 0 : -1}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              onClick={() => pick(i)}
              onKeyDown={onKey}
            >
              <b>
                <i className="dot" aria-hidden="true"></i>
                {it.title}
              </b>
              <span>{it.field}</span>
            </button>
            {narrow && i === sel ? stage : null}
          </Fragment>
        ))}
      </div>
      {narrow ? null : stage}
    </>
  );
}
