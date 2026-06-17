import type { SkillGroup } from "@/types";

// A capability map grouped by what the tools let me do - each group names the
// projects it shows up in, so skills and evidence stay wired together.
export const skillGroups: SkillGroup[] = [
  {
    id: "pricing",
    title: "Pricing & Derivatives",
    blurb:
      "Valuing and risk-managing derivatives - the engine room of the FX options and event-market work.",
    skills: [
      "Garman-Kohlhagen",
      "Black-Scholes",
      "FX options",
      "Options Greeks",
      "Binary / event pricing",
      "Monte Carlo simulation",
    ],
    appearsIn: ["fx", "apexgp"],
  },
  {
    id: "rates",
    title: "Rates & Fixed Income",
    blurb:
      "Building and shocking the Treasury curve - the foundation of the rates-risk attribution engine.",
    skills: [
      "Yield-curve construction",
      "DV01 / key-rate DV01",
      "Duration & convexity",
      "Cash-flow repricing",
      "Vasicek / CIR",
      "Hedge overlays",
    ],
    appearsIn: ["rates"],
  },
  {
    id: "risk",
    title: "Risk & Portfolio",
    blurb:
      "Sizing exposure, decomposing P&L, and stressing books - across the rates, FX, and allocation systems.",
    skills: [
      "VaR / CVaR / Expected Shortfall",
      "P&L attribution",
      "Stress testing",
      "Drawdown & turnover",
      "Factor exposure",
      "Allocation rules",
    ],
    appearsIn: ["rates", "fx", "portfolio"],
  },
  {
    id: "software",
    title: "Software & Data",
    blurb:
      "Making the models actually run - the Computer Science foundation under every project here.",
    skills: [
      "Python · NumPy · SciPy · pandas",
      "C++ · R · MATLAB",
      "TypeScript · React · Next.js",
      "Bloomberg · LSEG · FRED",
      "Numerical optimization",
      "Git / GitHub",
    ],
    appearsIn: ["apexgp", "rates", "portfolio", "fx"],
  },
];
