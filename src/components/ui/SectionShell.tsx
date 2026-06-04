import { cn } from "@/lib/utils";

/**
 * Spatial wrapper for a "room" in the experience. Provides the section anchor,
 * consistent rhythm, and an optional background layer slot for depth.
 */
export function SectionShell({
  id,
  children,
  background,
  className,
  contentClassName,
}: {
  id: string;
  children: React.ReactNode;
  /** Decorative / 3D layer rendered behind content. */
  background?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section
      id={id}
      data-section={id}
      className={cn(
        "relative w-full scroll-mt-24 overflow-clip py-24 sm:py-32 md:py-40",
        className,
      )}
    >
      {background ? (
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          {background}
        </div>
      ) : null}
      <div className={cn("shell relative z-10", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
