import type { RailProject } from "@/types";

/**
 * Project copy. Every figure traces to the project's own README or results;
 * see the spec's section 9 register. Ported from the Clearing prototype, with
 * the unsupported claims softened (see the task 5 report).
 */

/** Exhibit 1: the slow moment. A binomial tree closing in on Black–Scholes. */
const diffusion = {
  field: "Options pricing · 2026",
  title: "DiffusionWorks",
  question:
    "A pricing engine is easy to write and hard to trust. DiffusionWorks prices equity derivatives several ways, then runs fifteen controlled studies of where the methods agree and where they quietly break down.",
  note: "Try the simplest case: a binomial tree closing in on Black–Scholes. This interactive is an illustration on this page, not one of the fifteen studies.",
  controls: {
    steps: "Steps in the tree, N",
    volatility: "Volatility, σ",
    strike: "Strike, K (spot 100)",
  },
  readouts: {
    binomial: "Binomial price",
    blackScholes: "Black–Scholes",
    difference: "Difference",
  },
  result: {
    big: "10 of 15",
    line: "studies reached a clean result. Five carry a documented caveat, and none failed.",
    caveat:
      "The sharpest caveat: the Broadie–Glasserman–Kou continuity correction for barrier options observed at discrete dates held at 16 of 18 down-barrier test cells, but was resolved as wrong at 23 of 24 up-barrier cells, where it consistently over-predicts.",
    figures: [
      ["15", "studies"],
      ["10", "clean"],
      ["5", "with caveats"],
    ] as [string, string][],
  },
  treeLabel: "The first steps of the binomial tree with the option's value at each node",
  treeCaption:
    "First {shown} of {total} steps. Each node shows the option's value there, worked back from expiry.",
  chartLabel: "Binomial price for 1 to 200 steps against the Black–Scholes price",
  chartCaption:
    "Binomial price for every N from 1 to 200 (dots) against Black–Scholes (dashed). The marker is your N.",
  formulaLabel: "Formulas",
  assumptions: "S = 100, r = 4%, T = 1 year, European call",
  live: "https://diffusionworks.netlify.app",
  code: "https://github.com/VM25/stochastic-lab",
  openLabel: "Open the study",
  sourceLabel: "Source",
};

/** Exhibit 2: the fast moment. A clearly labelled toy market maker. */
const liquidity = {
  field: "Market making · 2026",
  title: "The Liquidity Paradox",
  question:
    "A market maker earns the gap between its buy and sell quotes, and loses every time the trader on the other side knows where the price is going. Can a five-second forecast tip that balance?",
  canvasLabel: "Illustration: a simulated market maker's quotes and fills, speeding up",
  counters: {
    trades: "trades",
    earned: "spread earned",
    lost: "lost to informed flow",
    noise: "random moves on uninformed trades",
    net: "net, in ticks",
  },
  caption:
    "Illustration only: a simulated market maker quoting one tick either side of a price that moves two ticks at a time. In this toy, 55% of trades come from traders who know the next move (amber dots), so each of them costs more than the spread earns. On the other 45%, the next move is as likely to help as to hurt, so that line drifts around zero. Net = spread earned − informed loss + random moves. Not the study's data.",
  replay: "Run it again",
  result: {
    big: "4.2% skill",
    forecast:
      "On twenty sessions of SOL/USDT order-book data, the five-second forecast worked: an out-of-sample R² of 4.2% on the held-out sessions, positive in all five.",
    losses:
      "Simple quoting rules still lost money in the modeled replay: about 1 to 2 bp of notional before fees, and about 11 to 12 bp at the exchange's default fee tier.",
    caveat:
      "Modeled historical replay: the orders never existed; fills are inferred under stated queue, latency and fee assumptions.",
  },
  live: "https://liquidityparadox.netlify.app",
  code: "https://github.com/VM25/liquidity-lab",
  openLabel: "Open the study",
  sourceLabel: "Source",
};

const rail: RailProject[] = [
  {
    title: "YieldShock",
    field: "Interest rates",
    year: "2026",
    question:
      "Pick an inflation-regime shock and a Treasury book: where does the loss actually come from?",
    result:
      "The engine reprices every cash flow under the shocked curve, attributes the P&L across duration, convexity, curve-shape, real-rate and breakeven channels, and measures what a rule-based hedge overlay recovers. It is the Treasury curve-risk and attribution side of the FE800 research.",
    figures: [
      ["10", "shock scenarios"],
      ["4", "hedge overlays"],
      ["5", "attribution channels"],
    ],
    live: "https://yieldshock.netlify.app",
    code: "https://github.com/VM25/inflation-lab",
  },
  {
    title: "Signal Survival",
    field: "Trading strategy",
    year: "2026",
    question:
      "Which simple trading signals survive costs, unseen years and changed settings?",
    result:
      "Over twenty years of real ETF data, three of five signals survived. One works only as a risk-control overlay, and one was rejected: it trades so often that it trails every passive benchmark and degrades sharply as costs rise.",
    figures: [
      ["5", "signals"],
      ["20", "years of ETF data"],
      ["3 of 5", "survived"],
    ],
    live: "https://alpha-research.netlify.app",
    code: "https://github.com/VM25/research-lab",
  },
  {
    title: "Currency Options Desk",
    field: "Foreign exchange",
    year: "2026",
    question:
      "What does a sharp move cost a dollar–peso options book, and what does a hedge fix?",
    result:
      "Before hedging, the book breaches its illustrative delta, vega and stress-loss limits. A static delta hedge brings net delta to about zero and cuts the worst-case stress loss by about 99%. Illustrative data and limits, not a trading book.",
    figures: [
      ["$4.65M", "gross notional"],
      ["10,000", "simulated paths for VaR"],
      ["~99%", "worst-case loss cut by the hedge"],
    ],
    live: "https://fxrisklab.netlify.app",
    code: "https://github.com/VM25/fx-options-risk-lab",
  },
  {
    title: "Lending Decisions",
    field: "Credit risk",
    year: "2026",
    question:
      "Can borrower and payment signals become decisions that hold up: approve, review, decline, block?",
    result:
      "The fraud side works well. The lending model separates borrowers only modestly, so it is marked Monitor rather than presented as solved. Built on public and clearly labeled synthetic data.",
    figures: [
      ["94,999", "credit applicants"],
      ["180", "policy scenarios"],
      ["1 of 3", "models marked Monitor"],
    ],
    live: "https://credits-engine.netlify.app",
    code: "https://github.com/VM25/credits-lab",
  },
  {
    title: "Allocation Study",
    field: "Portfolios",
    year: "2026",
    question: "The allocation side of the research memo below.",
    result:
      "A regime-aware allocation across 13 assets, tested against equal weight, minimum variance, maximum Sharpe, SPY and a static 60/40, with transaction costs, position limits and crisis analysis for 2008, 2020 and 2022.",
    figures: [
      ["13", "assets"],
      ["2007–2026", "sample"],
      ["3", "crisis windows"],
    ],
    live: "https://pra-analytics.netlify.app",
    code: "https://github.com/VM25/portfolio-lab",
  },
  {
    title: "ApexGP",
    field: "Prediction markets",
    year: "2025",
    question: "Can a full Formula 1 season be run as a market?",
    result:
      "The 2025 season replays lap by lap as event contracts on a simulated book, with trading halts on safety cars and retirements, an audit ledger and exposure limits.",
    figures: [
      ["$100,000", "simulated book"],
      ["24", "races replayed"],
      ["30% / 15%", "total and single-contract exposure limits"],
    ],
    live: "https://apexgp-markets.netlify.app",
    code: "https://github.com/VM25/apexgp-markets",
  },
];

export const projects = {
  intro:
    "Eight pieces of work across options, market making, rates, currencies, credit and portfolios. Two are open below; the rest are a tap away.",
  moreLabel: "More projects",
  diffusion,
  liquidity,
  rail,
};
