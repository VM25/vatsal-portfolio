import type { Project } from "@/types";
import { Reveal } from "@/components/ui/Reveal";
import { Tag } from "@/components/ui/Tag";
import { Stat } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, Github, ExternalLink } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const accentText: Record<Project["accent"], string> = {
  amber: "text-amber",
  copper: "text-copper",
  gold: "text-gold",
  ember: "text-ember",
};

const accentDot: Record<Project["accent"], string> = {
  amber: "bg-amber",
  copper: "bg-copper",
  gold: "bg-gold",
  ember: "bg-ember",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-faint">
      {children}
    </div>
  );
}

export function ProjectCaseFile({ project }: { project: Project }) {
  const accent = accentText[project.accent];

  return (
    <article className="panel relative overflow-hidden rounded-2xl p-6 sm:p-9 md:p-12">
      {/* tab + meta */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cn("h-2 w-2 rounded-full", accentDot[project.accent])} aria-hidden />
          <span className={cn("font-mono text-xs uppercase tracking-[0.18em]", accent)}>
            {project.tag}
          </span>
        </div>
        <div className="font-mono text-xs tracking-tight text-ink-faint">
          {project.period} · {project.stackLabel}
        </div>
      </div>

      <Reveal>
        <h3 className="font-display mt-5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
          {project.title}
        </h3>
        <p className="font-display mt-3 max-w-3xl text-pretty text-lg italic leading-snug text-ink-dim sm:text-xl">
          {project.framing}
        </p>
      </Reveal>

      {project.metrics && project.metrics.length > 0 ? (
        <Reveal delay={0.05}>
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {project.metrics.map((m) => (
              <Stat key={m.label} value={m.value} label={m.label} accentClass={accent} />
            ))}
          </div>
        </Reveal>
      ) : null}

      <div className="mt-9 grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* left: problem + methods */}
        <div className="md:col-span-7">
          <FieldLabel>The problem</FieldLabel>
          <p className="mt-2 text-pretty leading-relaxed text-ink-dim">
            {project.problem}
          </p>

          <div className="mt-6">
            <FieldLabel>Methods</FieldLabel>
            <ul className="mt-3 space-y-2">
              {project.methods.map((m) => (
                <li key={m} className="flex gap-3 text-sm leading-relaxed text-ink">
                  <span className={cn("mt-2 h-px w-3 shrink-0", accentDot[project.accent])} aria-hidden />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {project.mapping ? (
            <div className="mt-6">
              <FieldLabel>Reading the market under the race</FieldLabel>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-lg border border-line p-4 font-mono text-xs">
                {project.mapping.map((m) => (
                  <div key={m.domain} className="contents">
                    <span className="text-ink-faint">{m.domain}</span>
                    <span className={cn("text-right sm:text-left", accent)}>→ {m.market}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* right: evidence + concepts + stack */}
        <div className="md:col-span-5">
          <FieldLabel>Highlights</FieldLabel>
          <ul className="mt-3 space-y-3">
            {project.evidence.map((e) => (
              <li
                key={e}
                className="rounded-lg border border-line bg-[rgba(237,230,218,0.015)] p-3 text-sm leading-relaxed text-ink-dim"
              >
                {e}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <FieldLabel>Concepts</FieldLabel>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.concepts.map((c) => (
                <Tag key={c}>{c}</Tag>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <FieldLabel>Stack</FieldLabel>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <Tag key={s} className="text-ink-dim">
                  {s}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </div>

      {project.roadmap && project.roadmap.length > 0 ? (
        <div className="mt-8 rounded-xl border border-line p-5">
          <FieldLabel>In progress</FieldLabel>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-dim">
            {project.roadmap.map((r) => (
              <span key={r} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-ink-faint" aria-hidden />
                {r}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <FieldLabel>What it shows</FieldLabel>
          <p className="mt-2 text-pretty leading-relaxed text-ink">
            {project.takeaway}
          </p>
        </div>
        {project.links.length > 0 ? (
          <div className="flex flex-wrap gap-3 md:col-span-4 md:justify-end">
            {project.links.map((l) => (
              <Button
                key={l.href}
                href={l.href}
                external
                variant={l.kind === "live" ? "solid" : "outline"}
                icon={
                  l.kind === "repo" ? (
                    <Github />
                  ) : l.kind === "live" ? (
                    <ExternalLink />
                  ) : (
                    <ArrowUpRight />
                  )
                }
              >
                {l.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
