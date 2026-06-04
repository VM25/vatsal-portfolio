import { cn } from "@/lib/utils";

export function Stat({
  value,
  label,
  accentClass = "text-amber",
  className,
}: {
  value: string;
  label: string;
  accentClass?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-[rgba(237,230,218,0.015)] px-4 py-3",
        className,
      )}
    >
      <div className={cn("font-mono text-xl tnum sm:text-2xl", accentClass)}>
        {value}
      </div>
      <div className="mt-1 text-[0.72rem] uppercase leading-tight tracking-[0.12em] text-ink-faint">
        {label}
      </div>
    </div>
  );
}
