"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * A row that keeps its detail closed until asked.
 *
 * Opening is a deliberate, occasional action, so it earns real motion: the
 * panel opens over 420ms and the content inside fades, lifts and comes into
 * focus behind it. Closing is faster — once you have decided to close
 * something, waiting for it is friction.
 *
 * The panel height animates through `grid-template-rows`, the only way to reveal
 * content of unknown height; everything the eye actually tracks is on transform
 * and filter.
 */
export function Disclosure({
  index,
  title,
  meta,
  aside,
  children,
}: {
  index: string;
  title: string;
  meta: string;
  aside?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="row">
      <button
        type="button"
        className="row__head"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="num text-[0.75rem] text-accent">{index}</span>

        <span className="h3 row__title">{title}</span>

        <span className="label !normal-case !tracking-normal text-[0.875rem] font-sans text-fg-3">
          {meta}
          {aside ? (
            <span className="num ml-3 text-fg-4 text-[0.8125rem]">{aside}</span>
          ) : null}
        </span>

        <span className="sign" aria-hidden />
      </button>

      <div className="row__panel" data-open={open} id={panelId}>
        <div>
          <div className="row__inner">{children}</div>
        </div>
      </div>
    </div>
  );
}
