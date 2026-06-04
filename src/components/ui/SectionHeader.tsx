import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function SectionHeader({
  index,
  eyebrow,
  title,
  lead,
  className,
}: {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative max-w-4xl", className)}>
      {/* Architectural ghost numeral */}
      <span
        aria-hidden
        className="font-display pointer-events-none absolute -top-8 right-0 select-none text-[7rem] font-semibold leading-none text-ink/5 sm:text-[11rem]"
      >
        {index}
      </span>

      <Reveal>
        <div className="relative flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-ink-faint">
          <span className="text-amber">{index}</span>
          <span className="h-px w-10 bg-line-strong" aria-hidden />
          <span>{eyebrow}</span>
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="font-display relative mt-6 text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.01em] text-ink sm:text-6xl md:text-7xl lg:text-8xl">
          {title}
        </h2>
      </Reveal>
      {lead ? (
        <Reveal delay={0.1}>
          <p className="relative mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-ink-dim sm:text-xl">
            {lead}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
