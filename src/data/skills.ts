import type { SkillGroup } from "@/types";

// Grouped by finance relevance, populated from the résumé's skill inventory.
// Treated as instruments in a lab, not a pill cloud.
export const skillGroups: SkillGroup[] = [
  {
    id: "quant",
    title: "Quant Finance & Financial Engineering",
    blurb: "The methods I reach for when a problem has to be priced, hedged, or sized.",
    skills: [
      "Derivatives pricing",
      "FX options",
      "Options Greeks",
      "Delta / gamma hedging",
      "P&L explain",
      "Market risk",
      "VaR / CVaR",
      "Stochastic calculus",
      "Monte Carlo simulation",
      "Volatility modeling",
      "Factor models (Fama–French)",
      "Portfolio optimization",
      "Fixed-income & yield-curve risk",
      "Market microstructure",
    ],
  },
  {
    id: "systems",
    title: "Programming & Systems",
    blurb: "How the models get built, calibrated, and turned into something that runs.",
    skills: [
      "Python (NumPy, Pandas, SciPy)",
      "QuantLib",
      "Matplotlib",
      "C++",
      "Java",
      "R",
      "MATLAB",
      "Excel / VBA",
      "TypeScript",
      "React / Next.js",
      "Numerical optimization",
      "Data pipelines",
      "Git / GitHub",
    ],
  },
  {
    id: "platforms",
    title: "Tools & Platforms",
    blurb: "The market-data and analytics surfaces the work is wired into.",
    skills: [
      "Bloomberg Terminal",
      "LSEG Workspace",
      "Capital IQ",
      "FRED",
      "Excel (advanced modeling)",
      "Power BI",
      "FastF1",
      "Recharts",
    ],
  },
];
