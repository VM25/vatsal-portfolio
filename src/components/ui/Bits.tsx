import type { ReactNode, ElementType } from "react";
import type { Figure } from "@/types";

/** Wraps children so they materialise once when scrolled to. */
export function R({
  as: Tag = "div",
  d = 0,
  className = "",
  children,
}: {
  as?: ElementType;
  d?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      data-r=""
      style={d ? ({ ["--d"]: d } as React.CSSProperties) : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <span className="label">{children}</span>;
}

export function Out({
  href,
  children,
  tap = true,
}: {
  href: string;
  children: ReactNode;
  /** Standalone links get a 44px hit area; set false when inline in prose. */
  tap?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={`link ${tap ? "link--tap" : ""}`}
    >
      {children}
      <span aria-hidden className="text-accent">
        ↗
      </span>
    </a>
  );
}

export function Action({
  href,
  children,
  quiet = false,
  external = false,
}: {
  href: string;
  children: ReactNode;
  quiet?: boolean;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className={`action ${quiet ? "action--quiet" : ""}`}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      {children}
    </a>
  );
}

/** A row of numbers. Stacks in a narrow column, spreads in a wide one. */
export function Figures({
  items,
  stack = false,
}: {
  items: readonly Figure[];
  stack?: boolean;
}) {
  return (
    <div className={`grid gap-6 ${stack ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}>
      {items.map((f) => (
        <div key={f.label} className="stat">
          <div className="num text-[1.375rem] leading-none text-fg">{f.value}</div>
          <div className="mt-2 text-[0.8125rem] leading-snug text-fg-3">
            {f.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Section heading. Number, title, and an optional line under it. */
export function Head({
  n,
  title,
  lead,
}: {
  n: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="mb-[clamp(2.5rem,5vw,4rem)]">
      <R>
        <Label>{n}</Label>
      </R>
      <R d={1}>
        <h2 className="h1 mt-4">{title}</h2>
      </R>
      {lead ? (
        <R d={2}>
          <p className="sub mt-5">{lead}</p>
        </R>
      ) : null}
    </div>
  );
}
