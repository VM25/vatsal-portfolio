// The working paper. Title, framing, and every figure below are taken from the
// frozen memo and its one-page prospectus — including the negative result, which
// is the paper's actual contribution.

export const paper = {
  title: "Stock–Bond Diversification in an Inflation-Driven Rates Regime",
  subtitle:
    "Regime-Aware Allocation and Treasury Curve Loss Attribution, 2007–2026",
  status: "Research memo · frozen v1.1",

  question:
    "How does established regime dependence manifest in an implementable portfolio when decisions use only observable, lagged information under realistic costs and constraints — and performance is judged through realized drawdowns and portfolio-level Treasury hedge-book P&L?",

  /** The headline, stated the way the paper states it. */
  claim:
    "The regime-aware rule does not beat 60/40 on risk-adjusted return. The contribution is measurement and attribution — making the hedge's behaviour explicit — not a new theory of stock–bond comovement, and not a prediction.",

  standfirst:
    "For four decades one assumption did the heavy lifting in balanced portfolios: when equities fell, Treasuries would rise. 2022 broke it. This memo asks what that looks like once lagged signals, trading constraints, transaction costs, and realized drawdown paths are imposed.",

  modules: [
    {
      id: "allocation",
      label: "Allocation",
      question: "When does the hedge weaken?",
      detail:
        "A 2007–2026 backtest running a rule-based regime-aware allocation against Equal Weight, GMV, Max Sharpe, SPY, and 60/40 across thirteen liquid ETFs. VIX, one-month-lagged CPI, and rolling SPY–TLT correlation enter only as stress signals — never as holdings.",
    },
    {
      id: "rates",
      label: "Attribution",
      question: "Why did the bond leg lose money?",
      detail:
        "A Treasury curve engine repricing a synthetic $1m long-duration hedge book under the measured 2022 curve move, splitting the loss into duration, convexity, curve-shape, real-rate, and breakeven channels that reconcile to the exact repriced total.",
    },
  ],

  /** Full-sample results. The row that matters is that 60/40 wins on Sharpe. */
  results: [
    { strategy: "Regime-Aware", ret: "6.0%", vol: "10.5%", sharpe: "0.48", dd: "−33.3%" },
    { strategy: "60/40 (SPY/IEF)", ret: "8.4%", vol: "11.1%", sharpe: "0.66", dd: "−31.9%" },
  ],

  /**
   * The 2022 channel attribution, in the order the waterfall draws them.
   * Reconciles to the exact repriced loss of −$191,634 on a book with modified
   * duration ≈ 9.9 and DV01 ≈ $987/bp.
   */
  attribution: [
    { channel: "Real rate", value: -278, kind: "loss" as const },
    { channel: "Convexity", value: 64, kind: "gain" as const },
    { channel: "Curve shape", value: 37, kind: "gain" as const },
    { channel: "Breakeven", value: 11, kind: "gain" as const },
    { channel: "Residual", value: -26, kind: "loss" as const },
  ],

  totals: {
    loss: "−$191,634",
    lossPct: "−19.2%",
    dv01: "$987 / bp",
    duration: "≈ 9.9",
  },

  /** The 2022 overlay test — what actually defended the drawdown. */
  overlays: [
    { asset: "DBC", note: "Commodities", effect: "−3.5 pp", helped: true },
    { asset: "SHV", note: "Short Treasuries", effect: "−2.0 pp", helped: true },
    { asset: "TLT", note: "Long duration", effect: "+1.0 pp", helped: false },
  ],

  /** Signal definitions — judgment-based and transparent, not estimated optima. */
  signals: [
    { rule: "90-day SPY–TLT correlation", trigger: "> +0.20", reads: "Diversification weakening" },
    { rule: "CPI YoY, lagged one month", trigger: "> 3%", reads: "Elevated inflation" },
    { rule: "VIX", trigger: "> 25", reads: "Market stress" },
  ],

  regimeShares: [
    { regime: "Normal", share: 61 },
    { regime: "Watch", share: 25 },
    { regime: "Defensive", share: 14 },
  ],

  limits:
    "This is portfolio P&L attribution for one historical episode — not causal identification, and no part of it implies the regime is forecastable.",
} as const;

/** Open questions the memo points at, in the order it raises them. */
export const directions = [
  {
    id: "D1",
    label: "Cross-episode attribution",
    aim: "Does the real-rate dominance hold outside 2022?",
  },
  {
    id: "D2",
    label: "Out-of-sample regime rules",
    aim: "Signals that were not chosen with the answer in hand",
  },
  {
    id: "D3",
    label: "Overlay construction",
    aim: "Why commodities and cash defended where duration did not",
  },
  {
    id: "D4",
    label: "Execution realism",
    aim: "Spread and impact, beyond a flat turnover drag",
  },
] as const;
