import { Marquee } from "@/components/ui/Marquee";

// A market-data tape built on the Magic UI Marquee — instruments and concepts
// (no fabricated prices). Decorative, so it's aria-hidden.
const TERMS = [
  "Volatility Surface",
  "FX Options",
  "Monte Carlo VaR",
  "Delta · Gamma · Vega",
  "Efficient Frontier",
  "Yield Curve",
  "Factor Models",
  "Order-Book Depth",
  "Black–Scholes",
  "Stochastic Calculus",
  "Market Making",
  "Probabilistic Pricing",
  "CVaR / ES",
  "Drawdown",
  "Sharpe",
  "Event Markets",
  "P&L Explain",
  "Hedging",
];

export function Ticker() {
  return (
    <div
      aria-hidden
      className="relative z-10 border-y border-line bg-[rgba(12,10,9,0.55)] py-3.5 backdrop-blur-sm"
    >
      <Marquee pauseOnHover className="[--duration:60s]">
        {TERMS.map((t) => (
          <span key={t} className="flex items-center gap-6">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-ink-dim">
              {t}
            </span>
            <span className="h-1 w-1 rotate-45 bg-amber/70" />
          </span>
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-base to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-base to-transparent" />
    </div>
  );
}
