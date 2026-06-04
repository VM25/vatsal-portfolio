import { SectionShell } from "@/components/ui/SectionShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { ArrowUpRight } from "@/components/ui/icons";

const threads = [
  {
    title: "Probabilistic pricing & event markets",
    body: "Turning streams of information into live, tradable probabilities — the direction ApexGP is built to explore.",
  },
  {
    title: "Derivatives risk & market-making",
    body: "Quoting, hedging, and P&L attribution as a system: keeping Greeks inside limits while a book stays live.",
  },
  {
    title: "Regime-aware portfolio construction",
    body: "Optimization and factor risk that adapt when correlations break — not static covariance assumptions.",
  },
  {
    title: "Financial risk engineering",
    body: "VaR/ES, stress testing, and the discipline behind the FRM — risk as a first-class design constraint.",
  },
];

export function ResearchDirection() {
  return (
    <SectionShell id="research">
      <SectionHeader
        index="05"
        eyebrow="Research Direction"
        title="Where the work is heading."
        lead="Ambitious but honest: I'm early, and pointed at quant research, derivatives, and risk engineering — with the writing and projects to show the direction is real."
      />

      <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Featured working paper */}
        <div className="lg:col-span-5">
          <Reveal>
            <div className="panel h-full rounded-2xl p-7">
              <div className="flex items-center gap-2">
                <Tag className="text-amber">Writing sample</Tag>
              </div>
              <h3 className="font-display mt-4 text-2xl leading-tight text-ink">
                Rethinking Portfolio Hedges in an Inflation-Locked Market
              </h3>
              <p className="mt-2 font-display text-base italic text-ink-dim">
                A Dynamic Correlation-Adaptive Hedge (DCAH) framework.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ink-dim">
                When the stock–bond correlation flipped positive in 2022, the
                60/40 lost its hedge. DCAH reallocates defensive exposure from
                real-time correlation and inflation signals — evaluated across
                SPY, TLT, TIPS, gold, and the VIX on drawdowns, Sharpe, and VaR.
              </p>
              <div className="mt-6">
                <Button
                  href="/research/Maniar-Writing-Sample.pdf"
                  variant="outline"
                  external
                  icon={<ArrowUpRight />}
                >
                  Read the sample
                </Button>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Threads */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {threads.map((t, i) => (
              <Reveal key={t.title} delay={i * 0.06}>
                <div className="panel h-full rounded-2xl p-6">
                  <div className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-amber">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h4 className="font-display mt-2 text-lg leading-snug text-ink">
                    {t.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-ink-faint">
                    {t.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <p className="mt-6 text-pretty text-sm leading-relaxed text-ink-faint">
              Longer-horizon interests: market design, algorithmic market-making,
              and tokenized securities — research-oriented thinking I&rsquo;m
              building toward, not claiming to have mastered.
            </p>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}
