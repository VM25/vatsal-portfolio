"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import type { RailProject } from "@/types";
import { NewTab } from "@/components/site/NewTab";

/*
  More projects: a rail of six with one stage, ported from the prototype. Two
  patterns, chosen by the same measurement as the layout (the .more grid's column
  count, which the container query in globals.css sets):

  - Wide (two columns): WAI-ARIA tabs. Vertical tablist, Up/Down move and select,
    Home/End, roving tabindex; the stage is a tabpanel beside the rail, outside the
    tablist.
  - Narrow (one column): disclosures. Every row is a button with aria-expanded and
    aria-controls; each has its panel (role="region", aria-labelledby) right after it,
    hidden while closed. At most one is open; pressing the open one closes it. When the
    reader opens one, it is scrolled into view (block "nearest", instantly under reduced
    motion). Tab reaches every row; Enter and Space toggle. Focus stays on the button.

  Both patterns are one tree (a fragment per row holding its button), so the buttons
  keep their DOM nodes, and focus, across the breakpoint; the selection carries too.

  Before the layout is measured (the server render, and before hydration) the wide
  pattern is rendered, plus a copy of the first project's panel inside the rail after
  its row. CSS shows that copy and hides the side stage on narrow screens, so a phone
  shows exactly what the hydrated disclosure shows: hydration does not shift the page.
  Without JavaScript the chapter's .rail-all list shows all six instead.

  Test hooks on .rail: data-ready once hydrated, data-narrow once measured.
*/

export type RailCopy = {
  label: string;
  open: string;
  source: string;
};

const rowId = (i: number) => `more-tab-${i}`;
const STAGE_ID = "more-stage";
const panelId = (i: number) => `more-panel-${i}`;

/** One project's stage content. Also used for the no-JavaScript list. */
export function StageBody({ p, copy, heading = true }: { p: RailProject; copy: RailCopy; heading?: boolean }) {
  return (
    <>
      <p className="fld">{p.field}</p>
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
  /** Narrow only: whether the selected project's panel is open. Wide always shows it. */
  const [open, setOpen] = useState(true);
  /** null until measured (server render and first client render). */
  const [narrow, setNarrow] = useState<boolean | null>(null);
  /** Bumped on every choice by the reader: replays the swap and asks for the scroll. */
  const [picks, setPicks] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
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

  // After a choice on a narrow screen, bring the open panel (right under its button) into view.
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
    setOpen(true);
    setPicks((n) => n + 1);
  };

  const onRow = (i: number) => {
    if (narrow && i === sel && open) {
      setOpen(false);
      return;
    }
    pick(i);
  };

  // Tabs only: arrow keys move and select.
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (narrow) return;
    const n = items.length;
    let next: number;
    if (e.key === "ArrowDown") next = (sel + 1) % n;
    else if (e.key === "ArrowUp") next = (sel + n - 1) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else return;
    e.preventDefault();
    pick(next);
    rowRefs.current[next]?.focus();
  };

  const body = (
    <div className={picks ? "sw swap" : "sw"} key={`${sel}-${picks}`}>
      <StageBody p={items[sel]} copy={copy} />
    </div>
  );
  const tabs = narrow !== true;

  return (
    <>
      <div
        className="rail"
        role={tabs ? "tablist" : undefined}
        aria-label={tabs ? copy.label : undefined}
        aria-orientation={tabs ? "vertical" : undefined}
        ref={listRef}
      >
        {items.map((it, i) => {
          const expanded = !!narrow && open && i === sel;
          return (
            <Fragment key={it.title}>
              <button
                type="button"
                id={rowId(i)}
                role={tabs ? "tab" : undefined}
                aria-selected={tabs ? i === sel : undefined}
                aria-expanded={tabs ? undefined : expanded}
                aria-controls={tabs ? STAGE_ID : panelId(i)}
                tabIndex={tabs ? (i === sel ? 0 : -1) : undefined}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                onClick={() => onRow(i)}
                onKeyDown={onKey}
              >
                <b>
                  <i className="dot" aria-hidden="true"></i>
                  {it.title}
                </b>
                <span>{it.field}</span>
              </button>
              {narrow ? (
                <div
                  className="stage"
                  role="region"
                  id={panelId(i)}
                  aria-labelledby={rowId(i)}
                  hidden={!expanded}
                  ref={expanded ? stageRef : undefined}
                >
                  {expanded ? (
                    body
                  ) : (
                    <div className="sw">
                      <StageBody p={it} copy={copy} />
                    </div>
                  )}
                </div>
              ) : narrow === null && i === sel ? (
                // Before measuring: the narrow panel's place, shown only by CSS on narrow screens.
                <div className="stage pre">
                  {body}
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
      {narrow ? null : (
        <div className="stage side" role="tabpanel" id={STAGE_ID} aria-labelledby={rowId(sel)} ref={stageRef}>
          {body}
        </div>
      )}
    </>
  );
}
