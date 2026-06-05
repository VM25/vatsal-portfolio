import type { SkillGroup } from "@/types";

// A capability map — grouped by what the tools let me do, not a flat résumé list.
// Each group names the projects it shows up in, so skills and evidence connect.
export const skillGroups: SkillGroup[] = [
  {
    id: "pricing",
    title: "Pricing & Hedging",
    blurb: "Valuing and risk-managing derivatives — seen in the FX market-making and pricing-engine work.",
    skills: [
      "Black–Scholes",
      "FX options",
      "Options Greeks",
      "Delta / gamma hedging",
      "Monte Carlo simulation",
      "Stochastic calculus",
    ],
  },
  {
    id: "risk",
    title: "Risk & Portfolio",
    blurb: "Sizing exposure and constructing portfolios — behind the optimization and rates/FX projects.",
    skills: [
      "VaR / CVaR",
      "Volatility modeling",
      "Factor models",
      "Portfolio optimization",
      "Sharpe / drawdown",
      "Yield-curve & fixed-income risk",
    ],
  },
  {
    id: "systems",
    title: "Market Systems & Data",
    blurb: "Turning live markets into something tradable and explainable — the ApexGP and desk work.",
    skills: [
      "Market microstructure",
      "Order-book depth",
      "Market-making logic",
      "P&L explain",
      "Bloomberg · LSEG · Capital IQ",
      "FRED · FastF1",
    ],
  },
  {
    id: "software",
    title: "Software & Implementation",
    blurb: "Building the models so they actually run — the Computer Science foundation under all of it.",
    skills: [
      "Python (NumPy · SciPy · pandas)",
      "C++ · R · MATLAB",
      "Excel / VBA",
      "TypeScript · React · Next.js",
      "Numerical optimization",
      "Git / GitHub",
    ],
  },
];
