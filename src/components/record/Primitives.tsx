import type { ReactNode, ElementType } from "react";

/* Server components. Everything here is markup and class names — the only
   client code on the page is the reveal hook and the running header. */

type RevealKind = "rise" | "fade" | "wipe" | "rule";

/**
 * Wraps children in a revealing element. `i` sets the stagger index, which the
 * CSS turns into a transition delay — cap it at the call site so a long list
 * never trails off into a several-second wait.
 */
export function Reveal({
  as: Tag = "div",
  kind = "rise",
  i = 0,
  className = "",
  children,
}: {
  as?: ElementType;
  kind?: RevealKind;
  i?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      data-reveal={kind}
      style={i ? ({ ["--i"]: i } as React.CSSProperties) : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}

/** A hairline that draws itself left to right. */
export function Rule({
  weight = "hair",
  className = "",
}: {
  weight?: "hair" | "mid" | "strong" | "signal";
  className?: string;
}) {
  const color =
    weight === "signal"
      ? "bg-signal"
      : weight === "strong"
        ? "bg-hair-3"
        : weight === "mid"
          ? "bg-hair-2"
          : "bg-hair";
  return (
    <div
      data-reveal="rule"
      className={`h-px w-full ${color} ${className}`}
      aria-hidden
    />
  );
}

/** Mono eyebrow. Used for field names, column heads, and captions. */
export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`eyebrow ${className}`}>{children}</span>;
}

/**
 * A section, with its numeral hanging in the left margin the way a paper's
 * section number does. The rail is sticky over its own short column only —
 * there is no pinned panel anywhere on this page.
 */
export function Section({
  id,
  numeral,
  kicker,
  title,
  lede,
  children,
}: {
  id: string;
  numeral: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      <div className="section__head">
        <div className="section__rail">
          <Reveal kind="fade" className="flex items-baseline gap-3 lg:block">
            <span className="numeral">§{numeral}</span>
            <span className="mt-2 hidden lg:block">
              <span className="h-px w-8 bg-signal block" />
            </span>
            <Eyebrow className="lg:mt-3 lg:block">{kicker}</Eyebrow>
          </Reveal>
        </div>
        <div className="grid gap-5">
          <Reveal kind="wipe" as="h2">
            <span id={`${id}-title`} className="display display--lg block">
              {title}
            </span>
          </Reveal>
          {lede ? (
            <Reveal kind="rise" i={1}>
              <p className="lede">{lede}</p>
            </Reveal>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

/** An external link with the wiping underline and the corner arrow. */
export function Out({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={`link ${className}`}
    >
      {children}
      <span className="link__arrow" aria-hidden>
        ↗
      </span>
    </a>
  );
}

/** Filled or outlined action. `external` opens in a new tab. */
export function Action({
  href,
  children,
  variant = "solid",
  external = false,
  download = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "ghost";
  external?: boolean;
  download?: boolean;
}) {
  return (
    <a
      href={href}
      className={`action ${variant === "ghost" ? "action--ghost" : ""}`}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      {...(download ? { download: "" } : {})}
    >
      {children}
      <span className="data text-[0.85em]" aria-hidden>
        {external ? "↗" : download ? "↓" : "→"}
      </span>
    </a>
  );
}

/** A figure and its label, stacked. Used in metric rows and the ledger. */
export function Figure({
  value,
  label,
  size = "md",
}: {
  value: string;
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <div>
      <div
        className={`data text-ink ${
          size === "sm"
            ? "text-[1.0625rem] font-medium"
            : "text-[clamp(1.25rem,2.2vw,1.75rem)] font-medium"
        } leading-none`}
      >
        {value}
      </div>
      <div className="mt-2 text-[0.8125rem] leading-snug text-ink-55">{label}</div>
    </div>
  );
}
