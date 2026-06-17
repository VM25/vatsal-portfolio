import type { Project } from "@/types";
import { links } from "@/data/profile";

// Evidence-first case files. Metrics and "On The Record" bullets are lifted from
// each project's repo / live site - never fabricated. Exactly four systems.

export const projects: Project[] = [
  {
    id: "apexgp",
    category: "Probabilistic Event Markets",
    title: "ApexGP Markets",
    subtitle:
      "A real-time probabilistic pricing and risk engine that treats a live Formula 1 season as a book of tradable binary event-markets, repriced as race information arrives and managed like a capital allocation problem.",
    metrics: [
      { value: "500+", label: "tradable binary contracts" },
      { value: "24", label: "races modeled & settled" },
      { value: "30% / 15%", label: "portfolio / single-market caps" },
    ],
    record: [
      "Transformed 24 Formula 1 races into 500+ tradable binary contracts with dynamic probability repricing, race settlement, and season-long championship futures markets.",
      "Built portfolio risk infrastructure - mark-to-market valuation, exposure limits (30% portfolio, 15% single-market), Sharpe analytics, drawdown monitoring, and a full transaction audit across every settled event.",
    ],
    tags: [
      "Event-market microstructure",
      "Binary contract pricing",
      "Mark-to-market & settlement",
      "Portfolio risk limits",
      "Drawdown / Sharpe",
      "Transaction audit",
    ],
    website: links.apexgpLive,
    github: links.apexgpRepo,
    visual: "apexgp",
  },
  {
    id: "rates",
    category: "Treasury Rates Risk",
    title: "Inflation Regime Rates Risk Engine",
    subtitle:
      "A U.S. Treasury rates-risk attribution engine for repricing curve shocks, decomposing inflation-regime losses, and measuring hedge-overlay recovery across synthetic Treasury books.",
    metrics: [
      { value: "10", label: "curve-shock scenarios" },
      { value: "200", label: "shock / book / overlay states" },
      { value: "10,000", label: "simulated rate paths" },
    ],
    record: [
      "Built a Treasury curve-risk engine that reprices synthetic bond books under inflation-regime shocks and decomposes scenario P&L across duration, convexity, curve-shape, real-rate, breakeven, and residual channels.",
      "Implemented DV01, key-rate DV01, cash-flow repricing, hedge overlays, attribution waterfalls, and Vasicek / CIR VaR/ES simulations to analyze rates-driven losses and residual hedge risk.",
    ],
    tags: [
      "Treasury curve risk",
      "Inflation regimes",
      "DV01",
      "Key-rate DV01",
      "Cash-flow repricing",
      "P&L attribution",
      "Hedge overlays",
      "Vasicek / CIR",
      "VaR / Expected Shortfall",
      "Rates risk simulation",
    ],
    website: "https://yieldshock.netlify.app",
    github: "https://github.com/VM25/inflation-lab",
    visual: "rates",
  },
  {
    id: "portfolio",
    category: "Multi-Asset Allocation",
    title: "Portfolio Risk & Allocation Analytics",
    subtitle:
      "A multi-asset allocation research system comparing portfolio construction rules across rolling lookbacks, transaction costs, crisis windows, and factor exposures.",
    metrics: [
      { value: "13", label: "ETF proxies" },
      { value: "4", label: "allocation rules" },
      { value: "2008 / 2020 / 2022", label: "crisis windows" },
    ],
    record: [
      "Built a portfolio analytics engine comparing Equal Weight, Global Minimum Variance, Max Sharpe, and regime-aware allocation under common constraints, costs, and benchmark assumptions.",
      "Evaluated strategy behavior through drawdowns, VaR/CVaR, turnover, concentration, cumulative cost drag, crisis-window returns, and Fama-French factor exposure diagnostics.",
    ],
    tags: [
      "Portfolio construction",
      "Asset allocation",
      "Drawdown analysis",
      "Transaction costs",
      "Factor exposure",
      "Crisis-window testing",
    ],
    website: "https://pra-analytics.netlify.app",
    github: "https://github.com/VM25/portfolio-lab",
    visual: "portfolio",
  },
  {
    id: "fx",
    category: "FX Derivatives Risk",
    title: "FX Options Risk Lab",
    subtitle:
      "A derivatives risk analytics platform for pricing, stress testing, hedging, and risk attribution of a USD/MXN FX options portfolio.",
    metrics: [
      { value: "USD 4.65M", label: "gross notional" },
      { value: "MXN 159.1K", label: "95% Monte Carlo VaR" },
      { value: "100%", label: "delta cut after hedge" },
    ],
    record: [
      "Built a Garman-Kohlhagen pricing and risk framework with portfolio-level Greeks aggregation, hedge analysis, Monte Carlo VaR/ES, and full-repricing stress scenarios.",
      "Decomposed portfolio P&L into delta, gamma, vega, theta, and residual effects to explain how market shocks propagate through an FX derivatives book.",
    ],
    tags: [
      "FX options risk",
      "Garman-Kohlhagen",
      "Monte Carlo VaR",
      "Expected shortfall",
      "Greeks attribution",
      "Stress testing",
      "Portfolio hedging",
      "QuantLib validation",
    ],
    website: "https://fxrisklab.netlify.app",
    github: "https://github.com/VM25/fx-options-risk-lab",
    visual: "fx",
  },
];
