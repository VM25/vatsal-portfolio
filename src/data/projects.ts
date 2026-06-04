import type { Project } from "@/types";
import { links } from "@/data/profile";

// Evidence-first case files. Metrics and evidence bullets are lifted from the
// résumé / LinkedIn. Forward-looking quant extensions live in `roadmap`, kept
// explicitly separate from shipped work so nothing is overclaimed.

export const projects: Project[] = [
  {
    id: "apexgp",
    tag: "Flagship",
    title: "ApexGP Markets",
    framing: "A real-time probabilistic pricing and risk engine for Formula 1 event markets.",
    period: "2026",
    stackLabel: "Python · FastF1 · Recharts",
    problem:
      "Treat a live sporting season as a tradable event market: turn each race into a book of binary contracts whose prices update as new information arrives, then manage the book like a capital allocation problem rather than a betting slip.",
    methods: [
      "Dynamic probability repricing as race state evolves",
      "Mark-to-market valuation of open positions",
      "Position-level exposure limits and risk caps",
      "Sharpe and drawdown analytics on the book",
      "Full transaction audit across every settled event",
    ],
    concepts: [
      "Event-market microstructure",
      "Binary contract pricing",
      "Portfolio risk limits",
      "Mark-to-market & settlement",
      "Drawdown / risk-adjusted return",
    ],
    stack: ["Python", "FastF1", "Recharts", "Probability modeling"],
    evidence: [
      "Transformed 24 Formula 1 races into 500+ tradable binary contracts with dynamic probability repricing, race settlement, and season-long championship futures markets.",
      "Built portfolio risk infrastructure: mark-to-market valuation, exposure limits (30% portfolio, 15% single-market), Sharpe analytics, drawdown monitoring, and full transaction audit across 24 events.",
    ],
    takeaway:
      "I can design a pricing-and-risk system end to end — instrument definition, live repricing, position limits, and P&L attribution — and reason about a market in the language of contracts, exposure, and drawdown.",
    roadmap: [
      "Monte Carlo race-path simulation for distributional pricing",
      "Bayesian live probability updating from lap telemetry",
      "Model-implied vs market-implied edge and EV signals",
      "Fractional-Kelly position sizing under risk caps",
      "Scenario stress testing (safety car, DNF) and a GARCH-based VaR/ES layer",
    ],
    mapping: [
      { domain: "Race event", market: "Market shock" },
      { domain: "Safety car", market: "Macro shock" },
      { domain: "DNF", market: "Credit event" },
      { domain: "Pit stop", market: "Earnings surprise" },
      { domain: "Lap update", market: "Tick data" },
      { domain: "Odds", market: "Price" },
      { domain: "Bet", market: "Contract" },
      { domain: "Bankroll", market: "Capital book" },
    ],
    metrics: [
      { value: "500+", label: "tradable binary contracts" },
      { value: "24", label: "races modeled & settled" },
      { value: "30% / 15%", label: "portfolio / single-market caps" },
    ],
    links: [
      { label: "Live platform", href: links.apexgpLive, kind: "live" },
      { label: "Source", href: links.apexgpRepo, kind: "repo" },
    ],
    accent: "amber",
  },
  {
    id: "market-making",
    tag: "FE635",
    title: "Live FX Derivatives Market-Making System",
    framing:
      "An options market-making and hedging desk in software — quoting, booking, and risk-managing an FX book in live Bloomberg sessions.",
    period: "Jan 2026 – May 2026",
    stackLabel: "Excel VBA · Bloomberg",
    problem:
      "Stand up a working market-making loop for FX options: stream two-sided quotes, book trades, keep the Greeks inside risk limits, and explain the day's P&L — under live market data, not a static spreadsheet.",
    methods: [
      "Automated real-time bid/ask quoting",
      "Greeks-aware delta / gamma hedging",
      "Position booking across multi-leg strategies",
      "Intraday P&L attribution (P&L explain)",
      "Black–Scholes theoretical vs live implied-vol benchmarking",
    ],
    concepts: [
      "FX options market-making",
      "Delta / gamma / vega / rho",
      "Hedging & risk limits",
      "Bid/offer & spread capture",
      "P&L explain",
      "Rolling market dates",
    ],
    stack: ["Excel", "VBA", "Bloomberg Terminal"],
    evidence: [
      "Engineered a VBA options market-making engine: automated real-time bid–ask quoting, Greeks-aware delta/gamma hedging, position booking, and intraday P&L attribution across multi-leg derivatives strategies in live Bloomberg sessions.",
      "Quoted GBP/MXN forwards and options; benchmarked Black–Scholes theoretical prices against live Bloomberg implied-vol quotes and bid–ask spreads, managing net delta, gamma, and vega within defined risk limits each session.",
    ],
    takeaway:
      "This is the project that proves desk literacy: I understand how a quote becomes a position, how the Greeks move against you, and how to explain a day's P&L — practical derivatives risk management, not just modeling.",
    metrics: [
      { value: "GBP/MXN", label: "forwards & options book" },
      { value: "Δ · Γ · V", label: "live Greek limits managed" },
      { value: "BS ↔ IV", label: "theory benchmarked to market" },
    ],
    links: [],
    accent: "copper",
  },
  {
    id: "portfolio",
    tag: "FE630",
    title: "Portfolio Optimization & Factor Risk",
    framing:
      "Mean-variance portfolio construction with factor analytics and regime-aware risk — built to grow into a reusable analytics system.",
    period: "2025 – 2026",
    stackLabel: "Python · NumPy · SciPy",
    problem:
      "Construct and evaluate portfolios the way a desk would: optimize across a real asset universe, decompose risk into factors, and test how risk estimates hold up as volatility regimes shift.",
    methods: [
      "Mean-variance optimization / efficient frontier",
      "CAPM alpha & beta estimation",
      "Tracking error & information ratio",
      "Historical vs parametric VaR comparison",
      "Regime-aware risk evaluation",
    ],
    concepts: [
      "Portfolio construction",
      "Factor modeling",
      "Risk-adjusted performance",
      "VaR under changing volatility",
      "Constraints & backtesting",
    ],
    stack: ["Python", "NumPy", "SciPy", "pandas"],
    evidence: [
      "Built a mean-variance efficient-frontier model across 20+ ETFs; tested CAPM alpha/beta and computed tracking error and information ratios.",
      "Compared historical vs parametric VaR under changing volatility regimes to gauge how diversification assumptions hold up.",
    ],
    takeaway:
      "I can take portfolio theory off the page — optimization, factor exposure, and risk attribution — and I treat coursework as the first version of a system worth hardening, not a finished assignment.",
    roadmap: [
      "Constraint sets (sector / turnover / leverage) and transaction costs",
      "Walk-forward backtesting with drawdown and turnover reporting",
      "Factor-tilt overlays and risk-parity comparison",
    ],
    metrics: [
      { value: "20+", label: "ETFs in the universe" },
      { value: "α / β", label: "CAPM tested" },
      { value: "Hist. vs param.", label: "VaR across regimes" },
    ],
    links: [],
    accent: "gold",
  },
  {
    id: "rates-fx",
    tag: "Pricing",
    title: "Rates, FX & Options Pricing Engine",
    framing:
      "A multi-asset pricing and risk toolkit spanning FX Monte Carlo VaR and a bootstrapped Treasury curve.",
    period: "Oct 2025 – Dec 2025",
    stackLabel: "Python · Excel · Bloomberg · FRED",
    problem:
      "Price and risk two different books with the same rigor: simulate FX exposure to a 99% VaR, and build a clean Treasury curve with the full set of rate sensitivities — each validated against market data.",
    methods: [
      "GBM FX calibration on 30+ years of history",
      "20,000+ path Monte Carlo VaR",
      "European option pricing vs Black–Scholes",
      "Yield-curve bootstrapping",
      "DV01 / duration / convexity sensitivities",
      "Delta-hedge ratio validation",
    ],
    concepts: [
      "Monte Carlo VaR",
      "Black–Scholes benchmarking",
      "Yield-curve construction",
      "Fixed-income risk (DV01 / duration / convexity)",
      "Hedge-ratio validation",
    ],
    stack: ["Python", "Excel", "Bloomberg Terminal", "FRED"],
    evidence: [
      "Calibrated a GBM FX model on 30+ years of history and ran 20,000+ Monte Carlo simulations to estimate 99% VaR (~$264K unhedged exposure); priced European options benchmarked to Black–Scholes.",
      "Priced 24 Treasury bonds across 4 maturity buckets, bootstrapped yield curves, computed DV01/duration/convexity, and validated delta-hedging ratios against Bloomberg and FRED data.",
    ],
    takeaway:
      "Across FX and rates, I calibrate to real data, quantify tail risk, and check my models against the market — the core loop of a risk or pricing seat.",
    metrics: [
      { value: "~$264K", label: "99% VaR, unhedged FX" },
      { value: "20,000+", label: "Monte Carlo paths" },
      { value: "24", label: "Treasuries priced & bootstrapped" },
    ],
    links: [],
    accent: "ember",
  },
];

export const flagship = projects[0];
