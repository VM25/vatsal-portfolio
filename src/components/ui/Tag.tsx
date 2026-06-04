import { cn } from "@/lib/utils";

export function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line px-3 py-1",
        "font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-dim",
        "bg-[rgba(237,230,218,0.02)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
