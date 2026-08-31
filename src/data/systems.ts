import type { System } from "@/types";

/**
 * The catalogue. Seven systems, ordered so the strongest evidence leads and the
 * two negative results sit where they carry the most weight rather than being
 * buried at the end.
 *
 * `finding` is the load-bearing field: it states what the system actually
 * established, including where the answer was "no". Every metric traces to a
 * committed output in the linked repository.
 */
export const systems: System[] = [
  {
    id: "yieldshock",
    ref: "S-01",
    plate: 1,
    field: "Treasury rates risk",
    title: "Inflation Regime Rates Risk Engine",
    short: "Reprices Treasury books under curve shocks and splits the loss into channels",
    abstract:
      "A U.S. Treasury rates-risk attribution engine. It reprices synthetic bond books under inflation-regime curve shocks, decomposes the resulting P&L across duration, convexity, curve-shape, real-rate, breakeven, and residual channels, and measures how much a hedge overlay actually recovers.",
    finding:
      "Under the measured 2022 replay, the long-duration book's loss is dominated by real-rate repricing — not by inflation breakevens, which contributed almost nothing. Rule-based overlays recover under a third of it.",
    metrics: [
      { value: "10", label: "Curve-shock scenarios" },
      { value: "200", label: "Shock / book / overlay states" },
      { value: "10,000", label: "Simulated rate paths" },
    ],
    record: [
      "Built a curve-risk engine that reprices synthetic Treasury books under inflation-regime shocks and decomposes scenario P&L into six additive channels that reconcile to the cent.",
      "Implemented DV01, key-rate DV01, cash-flow repricing, hedge overlays, attribution waterfalls, and Vasicek / CIR VaR and Expected Shortfall simulation.",
      "Gated every run behind a 40-check consistency suite — price-yield monotonicity, analytic versus finite-difference agreement, and a reconciliation audit.",
    ],
    stack: ["Python", "TypeScript", "FRED"],
    website: "https://yieldshock.netlify.app",
    github: "https://github.com/VM25/inflation-lab",
  },
  {
    id: "alpha",
    ref: "S-02",
    plate: 2,
    field: "Systematic research",
    title: "Systematic Alpha Research Lab",
    short: "Tests whether five signals survive costs, out-of-sample data, and stress",
    abstract:
      "A signal-survival lab over twenty years of real ETF data. Each signal is walked through one process — hypothesis, signal rule, portfolio rule, cost-aware backtest, benchmark comparison, out-of-sample test, robustness — and receives a verdict computed from the evidence against predeclared thresholds, never hand-assigned.",
    finding:
      "Three of five signals survived, one is conditional, and short-term reversal was rejected: its 12.8×/yr turnover trails every passive benchmark and degrades sharply as costs rise. The momentum complex holds; volatility scaling is a risk overlay, not alpha.",
    metrics: [
      { value: "5", label: "Signals tested to verdict" },
      { value: "15", label: "ETFs, 2006–2026" },
      { value: "3 / 1 / 1", label: "Survived / conditional / rejected" },
    ],
    record: [
      "Built an end-to-end research pipeline — ingestion, signal construction, constrained portfolio rules, cost-aware backtest, validation, and generated reporting — over ~5,186 trading days of real prices.",
      "Enforced no look-ahead structurally: features through t, signal formed at t, position at t+1, return earned at t+1, with macro inputs lagged to publication timing.",
      "Validated through a 2006–2016 / 2017+ split, expanding-window walk-forward, cost sensitivity from 1 to 25 bps, parameter and rebalance robustness, six regime breakdowns, and five crisis windows.",
    ],
    stack: ["Python", "Next.js", "Yahoo · FRED"],
    website: "https://alpha-research.netlify.app",
    github: "https://github.com/VM25/research-lab",
  },
  {
    id: "diffusion",
    ref: "S-03",
    plate: 3,
    field: "Derivatives numerics",
    title: "DiffusionWorks",
    short: "C++20 stochastic derivatives engine, audited by fifteen controlled studies",
    abstract:
      "A pricing engine is easy to write and hard to trust. DiffusionWorks implements Black–Scholes–Merton and Heston in native C++20 — Monte Carlo with variance reduction, finite differences, four Greek estimators, characteristic-function integration, and Levenberg–Marquardt calibration — then runs fifteen controlled studies that measure where those numerics hold and where they quietly break.",
    finding:
      "Ten studies reach a clean result and five carry a documented caveat. The caveats are the useful part: a textbook continuity correction is measurably wrong for up-barriers, and every fit to a real S&P 500 surface matches prices well while the long-run parameters vary wildly — a good fit is not a determined model.",
    metrics: [
      { value: "793", label: "Deterministic tests" },
      { value: "15", label: "Controlled studies" },
      { value: "10 / 5", label: "Clean / flagged, none failed" },
    ],
    record: [
      "Implemented Black–Scholes–Merton and Heston with European, Asian, and barrier instruments under continuous, discrete, and Brownian-bridge monitoring.",
      "Ranked variance-reduction schemes by work-normalised efficiency rather than wall-clock, and made every engine return a Result<T> that refuses rather than emitting an untrustworthy number.",
      "Keyed randomness to a counter-based Philox stream by path index, so a threaded run reproduces a serial one bit for bit under ThreadSanitizer across a 14-job CI matrix.",
    ],
    stack: ["C++20", "CMake", "QuantLib"],
    website: "https://diffusionworks.netlify.app",
    github: "https://github.com/VM25/stochastic-lab",
  },
  {
    id: "fxlab",
    ref: "S-04",
    plate: 4,
    field: "FX derivatives risk",
    title: "FX Options Risk Lab",
    short: "Prices, stresses, and hedges a USD/MXN options book end to end",
    abstract:
      "A derivatives risk platform for a USD/MXN options portfolio. Garman–Kohlhagen pricing feeds portfolio-level Greeks aggregation, full-repricing stress scenarios, joint spot-vol Monte Carlo VaR and Expected Shortfall, and a delta-hedge analysis — with QuantLib used only as an independent validation reference.",
    finding:
      "Decomposing scenario P&L into delta, gamma, vega, theta, and residual shows how a shock actually propagates through the book. The hedge removes directional exposure completely and leaves the convexity and vol risk untouched — which is the point.",
    metrics: [
      { value: "USD 4.65M", label: "Gross notional" },
      { value: "MXN 159.1K", label: "95% Monte Carlo VaR" },
      { value: "100%", label: "Delta cut after hedge" },
    ],
    record: [
      "Built a Garman–Kohlhagen pricing and risk framework with portfolio Greeks aggregation, hedge construction, and Monte Carlo VaR / Expected Shortfall.",
      "Ran full-repricing stress scenarios rather than Greek approximations, so large shocks stay honest where a delta-gamma expansion would drift.",
      "Attributed portfolio P&L across delta, gamma, vega, theta, and residual effects, and cross-validated pricing against QuantLib.",
    ],
    stack: ["Python", "TypeScript", "QuantLib"],
    website: "https://fxrisklab.netlify.app",
    github: "https://github.com/VM25/fx-options-risk-lab",
  },
  {
    id: "credits",
    ref: "S-05",
    plate: 5,
    field: "Credit & payments risk",
    title: "Credit & Payments Risk Decision Engine",
    short: "Turns borrower and transaction data into governed underwriting decisions",
    abstract:
      "A decision engine, not a prediction notebook. Model scores are translated into governed actions — approve, review, decline, step-up, block — under loss, fraud, calibration, drift, and review-capacity constraints, with a policy simulator trading growth against loss across precomputed scenarios.",
    finding:
      "The fraud model passes validation cleanly at 0.97 ROC-AUC with 81% capture at the review-and-block boundary. The underwriting scorecard does not: 0.695 ROC-AUC earns a Monitor verdict — usable, modest discrimination, and disclosed rather than dressed up.",
    metrics: [
      { value: "94,999", label: "Credit applicants scored" },
      { value: "180", label: "Policy scenarios simulated" },
      { value: "0.97 / 0.695", label: "Fraud / underwriting ROC-AUC" },
    ],
    record: [
      "Built a fourteen-phase deterministic pipeline — ingestion, feature engineering, training, calibration, decisioning, expected loss, validation, reporting — across 30 source modules and 40 tests.",
      "Guarded leakage structurally: only application-time fields are read, outcome fields are excluded from fraud features, and a data-quality gate must pass before any output is written.",
      "Computed expected loss as PD × LGD × EAD by segment under base and stressed macro conditions, with every assumption labelled as an assumption.",
    ],
    stack: ["Python", "scikit-learn", "React"],
    website: "https://credits-engine.netlify.app",
    github: "https://github.com/VM25/credits-lab",
  },
  {
    id: "pra",
    ref: "S-06",
    plate: 6,
    field: "Multi-asset allocation",
    title: "Portfolio Risk & Allocation Analytics",
    short: "Compares allocation rules across regimes, costs, and crisis windows",
    abstract:
      "A multi-asset allocation research system comparing Equal Weight, Global Minimum Variance, Max Sharpe, and a regime-aware rule under common constraints, transaction costs, and benchmark assumptions across rolling lookbacks and three crisis windows.",
    finding:
      "No rule dominates. The regime-aware rule is transparent and conditional but does not beat 60/40 on risk-adjusted return — detecting that diversification is deteriorating does not automatically create decision value. Reported as a negative result, not reframed.",
    metrics: [
      { value: "13", label: "ETF proxies" },
      { value: "4", label: "Allocation rules compared" },
      { value: "2008 · 2020 · 2022", label: "Crisis windows" },
    ],
    record: [
      "Built a monthly rebalanced backtest with a 35% per-asset cap and a 5 bps turnover cost, using only pre-rebalance information.",
      "Evaluated behaviour through drawdowns, VaR / CVaR, turnover, concentration, cumulative cost drag, crisis-window returns, and Fama–French five-factor exposure.",
      "Ran a threshold sweep across regime-stress levels to show the conclusion is not an artifact of one parameter choice.",
    ],
    stack: ["Python", "TypeScript", "statsmodels"],
    website: "https://pra-analytics.netlify.app",
    github: "https://github.com/VM25/portfolio-lab",
  },
  {
    id: "apexgp",
    ref: "S-07",
    plate: 7,
    field: "Probabilistic event markets",
    title: "ApexGP Markets",
    short: "Treats a live Formula 1 season as a book of tradable binary contracts",
    abstract:
      "A real-time probabilistic pricing and risk engine that treats a Formula 1 season as a book of binary event-markets — repriced as race information arrives, settled at the flag, and managed as a capital allocation problem rather than a set of bets.",
    finding:
      "Event markets behave like any other book once you impose limits on them: exposure caps at 30% portfolio and 15% single-market, mark-to-market valuation, and a full transaction audit across every settled event turn a season into a risk-managed position.",
    metrics: [
      { value: "500+", label: "Tradable binary contracts" },
      { value: "24", label: "Races modelled and settled" },
      { value: "30% / 15%", label: "Portfolio / single-market caps" },
    ],
    record: [
      "Transformed 24 races into 500+ binary contracts with dynamic probability repricing, settlement at the flag, and season-long championship futures.",
      "Built the portfolio risk layer — mark-to-market valuation, exposure limits, Sharpe analytics, and drawdown monitoring.",
      "Kept a full transaction audit across every settled event so any position can be reconstructed from the record.",
    ],
    stack: ["TypeScript", "React", "Vite"],
    website: "https://apexgp-markets.netlify.app",
    github: "https://github.com/VM25/apexgp-markets",
  },
];

export const systemCount = systems.length;
