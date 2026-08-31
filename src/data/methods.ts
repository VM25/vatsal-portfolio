import type { MethodGroup } from "@/types";

// Capability wired to evidence: each group names the systems it actually shows
// up in, so nothing here is a claim without a link behind it.
export const methodGroups: MethodGroup[] = [
  {
    id: "pricing",
    title: "Pricing & derivatives",
    blurb:
      "Valuing and risk-managing derivatives — the engine room of the FX, numerics, and event-market work.",
    skills: [
      "Black–Scholes–Merton",
      "Heston stochastic vol",
      "Garman–Kohlhagen",
      "Options Greeks",
      "Binary / event pricing",
      "Monte Carlo & variance reduction",
      "Finite differences",
      "Calibration",
    ],
    appearsIn: ["fxlab", "diffusion", "apexgp"],
  },
  {
    id: "rates",
    title: "Rates & fixed income",
    blurb:
      "Building and shocking the Treasury curve — the foundation under the attribution engine and the paper.",
    skills: [
      "Yield-curve construction",
      "DV01 / key-rate DV01",
      "Duration & convexity",
      "Cash-flow repricing",
      "Vasicek / CIR",
      "Hedge overlays",
    ],
    appearsIn: ["yieldshock"],
  },
  {
    id: "risk",
    title: "Risk & portfolio",
    blurb:
      "Sizing exposure, decomposing P&L, and stressing books across rates, FX, credit, and allocation.",
    skills: [
      "VaR / CVaR / Expected Shortfall",
      "P&L attribution",
      "Stress testing",
      "Drawdown & turnover",
      "Factor exposure",
      "Expected loss (PD · LGD · EAD)",
      "Exposure limits",
    ],
    appearsIn: ["yieldshock", "fxlab", "pra", "credits", "apexgp"],
  },
  {
    id: "research",
    title: "Research & validation",
    blurb:
      "The part that decides whether a result is real — and the part most portfolios skip.",
    skills: [
      "Walk-forward validation",
      "Train / test discipline",
      "No-look-ahead enforcement",
      "Cost sensitivity",
      "Calibration & drift",
      "Predeclared thresholds",
      "Reproducible pipelines",
    ],
    appearsIn: ["alpha", "credits", "diffusion", "pra"],
  },
  {
    id: "software",
    title: "Software & data",
    blurb:
      "Making the models actually run — the Computer Science foundation under every system here.",
    skills: [
      "Python · NumPy · SciPy · pandas",
      "C++20 · CMake",
      "R · MATLAB",
      "TypeScript · React · Next.js",
      "scikit-learn · statsmodels",
      "Bloomberg · LSEG · FRED",
      "Git · CI · sanitizers",
    ],
    appearsIn: ["yieldshock", "alpha", "diffusion", "fxlab", "credits", "pra", "apexgp"],
  },
];
