"use client";

import { SceneShell } from "@/components/experience/SceneShell";
import { useChapterProgress } from "@/components/experience/chapter-context";
import { Cue } from "@/components/experience/cues";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/icons";

const THREADS = [
  { id: "R1", label: "Probabilistic pricing", aim: "distributional, not point, valuation" },
  { id: "R2", label: "Derivatives & vol risk", aim: "Greeks, skew, and live hedging" },
  { id: "R3", label: "Regime-aware portfolios", aim: "risk that adapts as correlations break" },
  { id: "R4", label: "Market microstructure", aim: "books, quotes, and execution" },
  { id: "R5", label: "Financial risk engineering", aim: "VaR/ES, stress, and tail control" },
];

export function ResearchScene() {
  const progress = useChapterProgress();
  return (
    <SceneShell index="05" label="Research direction">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Cue progress={progress} at={0} span={0.18}>
            <h2 className="scene-title text-ink">
              Where the work is <span className="text-brass">going.</span>
            </h2>
          </Cue>
          <Cue progress={progress} at={0.08} span={0.18}>
            <p className="mt-4 max-w-xl text-pretty leading-relaxed text-ink-dim">
              One throughline: turning uncertainty into risk you can price, hedge,
              and explain — pushed toward live, regime-aware systems. Five active
              directions.
            </p>
          </Cue>

          <div className="mt-7 divide-y divide-line border-y border-line">
            {THREADS.map((t, i) => (
              <Cue key={t.id} progress={progress} at={0.16 + i * 0.05} span={0.18}>
                <div className="flex items-baseline gap-4 py-3">
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-brass">
                    {t.id}
                  </span>
                  <span className="font-display text-base text-ink">{t.label}</span>
                  <span className="ml-auto hidden text-right text-xs text-ink-faint sm:block">
                    {t.aim}
                  </span>
                </div>
              </Cue>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <Cue progress={progress} at={0.2} span={0.26} y={32}>
            <div className="panel-2 relative rounded-[8px] p-6">
              <div className="absolute -top-3 left-6 rounded-full border border-brass/40 bg-base px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-brass">
                Working paper
              </div>
              <h3 className="font-display mt-3 text-xl leading-snug text-ink">
                Rethinking Portfolio Hedges in an Inflation-Locked Market
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-dim">
                A Dynamic Correlation-Adaptive Hedge — reallocating defensive
                exposure from real-time correlation and inflation signals across
                SPY, TLT, TIPS, gold, and the VIX.
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {["Correlation regimes", "Inflation signals", "Tail hedging"].map((c) => (
                  <span
                    key={c}
                    className="rounded border border-line px-2 py-0.5 font-mono text-[0.6rem] text-ink-faint"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-5">
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
          </Cue>
        </div>
      </div>
    </SceneShell>
  );
}
