import { cn } from "@/lib/utils";

/**
 * The interior frame shared by every chapter: a centered max-width column with
 * a mono index/label kicker pinned near the top and the scene body centered in
 * the remaining height. Full-screen inside the pinned stage; flows naturally in
 * the stacked fallback. No w-screen, no corridor — this is a vertical scene.
 */
export function SceneShell({
  index,
  label,
  right,
  children,
  className,
  bodyClassName,
}: {
  index: string;
  label: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto flex h-full min-h-screen w-full max-w-6xl flex-col px-6 lg:min-h-0 lg:px-10",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 pt-16 lg:pt-16">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tracking-[0.16em] text-brass">
            {index}
          </span>
          <span className="h-px w-10 bg-line-strong" aria-hidden />
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-ink-faint">
            {label}
          </span>
        </div>
        {right ? <div className="hidden sm:block">{right}</div> : null}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col justify-center py-8",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
