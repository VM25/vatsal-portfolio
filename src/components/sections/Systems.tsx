import type { ReactNode } from "react";
import type { PlateKey, System } from "@/types";
import { systems } from "@/data/systems";
import { Section, Reveal, Eyebrow, Out, Figure } from "@/components/record/Primitives";
import { Plate } from "@/components/plates/Plate";
import { AttributionWaterfall } from "@/components/plates/AttributionWaterfall";
import { SignalScatter } from "@/components/plates/SignalScatter";
import { StudyLedger } from "@/components/plates/StudyLedger";
import { DeltaProfile } from "@/components/plates/DeltaProfile";
import { DiscriminationBars } from "@/components/plates/DiscriminationBars";
import { RulePair } from "@/components/plates/RulePair";
import { ContractLadder } from "@/components/plates/ContractLadder";

/**
 * Each system publishes one figure drawn from its own output. The caption is
 * part of the evidence: where a figure illustrates a mechanism rather than
 * plotting a measured series, it says so.
 */
const figures: Record<PlateKey, { node: ReactNode; caption: ReactNode }> = {
  yieldshock: {
    node: <AttributionWaterfall />,
    caption:
      "2022 channel attribution for a synthetic $1m long-duration book. The bars are measured channels and reconcile to the exact repriced loss. Real-rate repricing carries the loss; breakevens contribute almost nothing.",
  },
  alpha: {
    node: <SignalScatter />,
    caption:
      "Net Sharpe against annual turnover, one point per signal, after a 5 bps cost drag. Short-term reversal is circled: it is the only signal that is both the most expensive to run and the weakest, which is what earned it a rejection.",
  },
  diffusion: {
    node: <StudyLedger />,
    caption:
      "The study ledger. Ten filled cells reached a clean result; five outlined cells carry a documented caveat and are named beside them. Cell position is not a study index — the repository assigns those.",
  },
  fxlab: {
    node: <DeltaProfile />,
    caption:
      "Portfolio delta against spot, before and after the hedge. The curve shape is schematic and illustrates the mechanism; the annotated figures are computed — the hedge removes all directional exposure at spot and deliberately leaves the curvature in place.",
  },
  credits: {
    node: <DiscriminationBars />,
    caption:
      "Discrimination by model, measured from the no-skill baseline. The fraud and AML models pass validation; the underwriting scorecard is drawn in signal orange because 0.695 earns a Monitor verdict rather than a pass.",
  },
  pra: {
    node: <RulePair />,
    caption:
      "The regime-aware rule against 60/40 across four measures, full sample. Sharpe is marked because it is the measure that decides the question, and 60/40 wins it. Bars are normalised within each pair, not across the plate.",
  },
  apexgp: {
    node: <ContractLadder />,
    caption:
      "Binary contracts repricing from an even opening toward settlement as race information arrives. The paths are schematic; the contract count, race count, and exposure caps beneath them are the engine's real parameters.",
  },
};

function IndexTable() {
  return (
    <Reveal kind="fade">
      <div className="border-t border-hair-3">
        <div className="hidden items-baseline gap-x-5 border-b border-hair pb-2 md:grid md:grid-cols-[3.5rem_minmax(0,1.1fr)_minmax(0,1.5fr)_9.5rem_1.5rem]">
          <Eyebrow>Ref</Eyebrow>
          <Eyebrow>System</Eyebrow>
          <Eyebrow>Subject</Eyebrow>
          <Eyebrow>Stack</Eyebrow>
          <span />
        </div>
        {systems.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="index-row group">
            <span className="numeral">{s.ref}</span>
            <span className="subhead text-[1rem]">{s.title}</span>
            <span className="text-[0.9375rem] leading-snug text-ink-55">{s.short}</span>
            <span className="data text-[0.75rem] text-ink-38">
              {s.stack.join(" · ")}
            </span>
            <span
              className="data hidden text-[0.8rem] text-ink-38 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-signal-ink md:inline"
              aria-hidden
            >
              →
            </span>
          </a>
        ))}
      </div>
    </Reveal>
  );
}

function Entry({ s }: { s: System }) {
  const fig = figures[s.id];
  return (
    <article
      id={s.id}
      className="scroll-mt-28 border-t border-hair-3 pt-8"
      aria-labelledby={`${s.id}-title`}
    >
      {/* header */}
      <Reveal kind="fade">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="numeral">{s.ref}</span>
          <Eyebrow>{s.field}</Eyebrow>
          <span className="data ml-auto text-[0.6875rem] uppercase tracking-[0.14em] text-ink-38">
            Plate {s.plate}
          </span>
        </div>
      </Reveal>

      <Reveal kind="wipe" as="h3" className="mt-3">
        <span id={`${s.id}-title`} className="display display--md block">
          {s.title}
        </span>
      </Reveal>

      <div className="mt-7 grid gap-9 lg:grid-cols-12 lg:gap-x-10">
        <div className="min-w-0 lg:col-span-5">
          <Reveal kind="rise">
            <p className="prose text-[1rem]">{s.abstract}</p>
          </Reveal>

          <Reveal kind="rise" i={1}>
            <div className="mt-6">
              <Eyebrow className="mb-2 block">Finding</Eyebrow>
              <p className="finding">{s.finding}</p>
            </div>
          </Reveal>

          <Reveal kind="fade" i={2}>
            <div className="mt-7 grid grid-cols-3 gap-4 border-t border-hair pt-5">
              {s.metrics.map((m) => (
                <Figure key={m.label} value={m.value} label={m.label} size="sm" />
              ))}
            </div>
          </Reveal>
        </div>

        <div className="min-w-0 lg:col-span-7">
          <Plate n={s.plate} caption={fig.caption}>
            {fig.node}
          </Plate>
        </div>
      </div>

      {/* what was built */}
      <Reveal kind="fade" i={1}>
        <div className="mt-9 grid gap-x-10 gap-y-4 border-t border-hair pt-6 md:grid-cols-3">
          {s.record.map((r) => (
            <p key={r} className="text-[0.9375rem] leading-relaxed text-ink-70">
              {r}
            </p>
          ))}
        </div>
      </Reveal>

      <Reveal kind="fade" i={2}>
        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 pb-12">
          {s.website ? <Out href={s.website}>Live system</Out> : null}
          {s.github ? <Out href={s.github}>Source</Out> : null}
          <span className="data ml-auto text-[0.75rem] text-ink-38">
            {s.stack.join(" · ")}
          </span>
        </div>
      </Reveal>
    </article>
  );
}

/** §03. The catalogue: an index to scan, then the full entries. */
export function Systems() {
  return (
    <Section
      id="systems"
      numeral="03"
      kicker="Systems"
      title={
        <>
          Seven systems,
          <br />
          and <em>what each one settled</em>
        </>
      }
      lede="Rates, systematic research, derivatives numerics, FX, credit, allocation, and event markets. Two of them returned a negative result, and those entries say so first."
    >
      <IndexTable />
      <div className="mt-16 grid gap-16">
        {systems.map((s) => (
          <Entry key={s.id} s={s} />
        ))}
      </div>
    </Section>
  );
}
