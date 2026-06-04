import { SectionShell } from "@/components/ui/SectionShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { OriginFlow } from "@/components/sections/OriginFlow";

const PARAS = [
  "I started in computer science at Arizona State, graduating Magna Cum Laude with a foundation in systems, data, and software engineering.",
  "Then I pivoted — deliberately — into financial engineering at Stevens. I wanted to be on the side of the market that makes decisions, not only the side that builds the infrastructure.",
  "My work now sits across derivatives, risk, and portfolio construction: pricing engines and Greeks, Monte Carlo VaR, factor models, and market-making logic. The goal is front-office-adjacent quant — trading, research, risk, and structuring.",
];

export function Origin() {
  return (
    <SectionShell id="origin">
      <SectionHeader
        index="01"
        eyebrow="Origin"
        title={
          <>
            From building systems to{" "}
            <span className="text-gradient-amber">pricing risk.</span>
          </>
        }
        lead="A computer scientist who chose financial engineering on purpose — to work where uncertainty gets priced, hedged, and traded."
      />

      <div className="mt-14 grid grid-cols-1 gap-12 md:grid-cols-12">
        <div className="space-y-5 md:col-span-6 lg:col-span-7">
          {PARAS.map((p, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <p className="text-pretty text-lg leading-relaxed text-ink-dim">{p}</p>
            </Reveal>
          ))}
        </div>
        <div className="md:col-span-6 lg:col-span-5">
          <Reveal delay={0.1}>
            <OriginFlow />
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}
