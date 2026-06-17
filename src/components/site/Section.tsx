import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/site/motion";

/** Contained section with generous vertical rhythm. */
export function Section({
  id,
  children,
  className,
  containerClassName,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <section id={id} className={cn("relative py-16 sm:py-24", className)}>
      <div
        className={cn(
          "mx-auto w-full max-w-[1240px] px-4 sm:px-7",
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * Section header. A big numeric index + an engineered kicker over an oversized
 * uppercase block title (architectural, not a polite webpage heading).
 */
const SIZE: Record<string, string> = {
  sm: "text-[clamp(1.45rem,3.4vw,2.4rem)]",
  md: "text-[clamp(1.6rem,4vw,3.1rem)]",
  lg: "text-[clamp(1.85rem,5.2vw,4.25rem)]",
};

/**
 * Section header. `variant` controls the typographic register so the page is
 * not every-section-the-same all-caps block: "block" = loud architectural
 * uppercase (the peaks), "editorial" = quieter mixed-case (supporting / reflective
 * sections). `size` tunes the scale.
 */
export function SectionHeader({
  index,
  kicker,
  title,
  lead,
  variant = "block",
  size = "lg",
  accentVar = "--accent",
  className,
  titleClassName,
}: {
  index?: string;
  kicker?: string;
  title: ReactNode;
  lead?: ReactNode;
  variant?: "block" | "editorial";
  size?: "sm" | "md" | "lg";
  /** CSS var name to tint the index marker, e.g. "--p-fx". */
  accentVar?: string;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <Reveal>
        {(index || kicker) && (
          <div className="flex items-center gap-3">
            {index && (
              <span
                className="font-mono text-[0.95rem] font-bold tnum"
                style={{ color: `var(${accentVar})` }}
              >
                {index}
              </span>
            )}
            {index && kicker && <span className="h-4 w-px bg-line-2" aria-hidden />}
            {kicker && <span className="kicker">{kicker}</span>}
          </div>
        )}
        <h2
          className={cn(
            variant === "editorial" ? "h-title" : "h-sec",
            "mt-3.5",
            SIZE[size],
            titleClassName,
          )}
        >
          {title}
        </h2>
        {lead && (
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-ink-2 sm:text-base">
            {lead}
          </p>
        )}
      </Reveal>
    </div>
  );
}
