import { Section, SectionHeader } from "@/components/site/Section";
import { Reveal } from "@/components/site/motion";
import { Button } from "@/components/ui/Button";
import { links } from "@/data/profile";
import { ArrowUpRight, ArrowRight } from "@/components/ui/icons";

const THREADS = [
  { id: "R1", label: "Probabilistic pricing", aim: "distributional, not point, valuation" },
  { id: "R2", label: "Derivatives & vol risk", aim: "Greeks, skew, and live hedging" },
  { id: "R3", label: "Regime-aware portfolios", aim: "risk that adapts as correlations break" },
  { id: "R4", label: "Rates & inflation risk", aim: "curve shocks, attribution, hedge overlays" },
  { id: "R5", label: "Financial risk engineering", aim: "VaR / ES, stress, and tail control" },
];

export function Research() {
  return (
    <Section id="research">
      <SectionHeader
        index="05"
        kicker="Research direction"
        variant="editorial"
        size="lg"
        title="Where the work is going"
        lead="From shipped systems to the open questions worth pushing on next."
      />

      {/* throughline statement - forward momentum */}
      <Reveal>
        <p className="mt-7 max-w-4xl text-[clamp(1.15rem,2.4vw,1.65rem)] font-medium leading-snug text-ink">
          Turn uncertainty into risk you can{" "}
          <span className="text-accent">price, hedge, and explain</span> — pushed
          toward live, regime-aware systems that hold up when correlations break.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* active directions as forward vectors */}
        <div className="lg:col-span-7">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="kicker">Five active directions</span>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ink-3">
              forward →
            </span>
          </div>
          <div className="border-y border-line">
            {THREADS.map((t, i) => (
              <Reveal key={t.id} delay={Math.min(i, 5) * 0.04}>
                <div
                  className={`group flex items-center gap-4 py-4 ${i > 0 ? "border-t border-line" : ""}`}
                >
                  <span className="font-mono text-[0.72rem] font-bold tracking-tight text-accent">
                    {t.id}
                  </span>
                  <span className="h-card text-base text-ink sm:text-lg">{t.label}</span>
                  <span className="ml-auto hidden text-right text-sm text-ink-3 md:block">
                    {t.aim}
                  </span>
                  <ArrowRight className="shrink-0 text-base text-ink-3 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* featured working paper - stronger presence */}
        <div className="lg:col-span-5">
          <Reveal delay={0.08}>
            <div className="panel relative overflow-hidden rounded-2xl p-6 sm:p-7">
              <span
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: "linear-gradient(to right, var(--accent), transparent)" }}
                aria-hidden
              />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-accent">
                  Working paper · in progress
                </span>
                <ArrowUpRight className="text-ink-3" />
              </div>
              <h3 className="h-title mt-4 text-2xl leading-tight sm:text-[1.7rem]">
                Rethinking Portfolio Hedges in an Inflation-Locked Market
              </h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">
                A dynamic correlation-adaptive hedge - reallocating defensive
                exposure from real-time correlation and inflation signals across
                SPY, TLT, TIPS, gold, and the VIX.
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {["Correlation regimes", "Inflation signals", "Tail hedging"].map((c) => (
                  <span key={c} className="chip">
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-6">
                <Button href={links.writingSample} variant="outline" external icon={<ArrowUpRight />}>
                  Read the sample
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
