/**
 * The paper. Every claim below is in the spec's section 9 register with its
 * source. Change a claim only after re-checking that source.
 */
export interface Claim {
  id: string;
  /** Small label above the claim. */
  context: string;
  /** The claim at its register wording. */
  text: string;
  evidenceKind: "sharpe" | "drawdown" | "identity";
}

export const research = {
  title: "The hedge that stopped working",
  kicker: "Research memo, June 2026 · on SSRN",
  paperTitle: "Stock–Bond Diversification in an Inflation-Driven Rates Regime",

  premise:
    "For most of the period from the late 1990s through 2020, U.S. stocks and Treasuries did not fall together. In 2022 they did.",

  ask: "asks whether acting on that helps in practice, using only lagged, observable signals with realistic trading costs and position limits, and then measures why the hedge failed. Three findings, each with its evidence:",

  claims: [
    {
      id: "sharpe",
      context: "13 assets, 2007–2026, costs and limits",
      text: "Regime-aware allocation did not beat a static 60/40 on a risk-adjusted basis: Sharpe 0.48 vs 0.66",
      evidenceKind: "sharpe",
    },
    {
      id: "loss",
      context: "Replaying 2022 on a Treasury curve model",
      text: "A long-duration Treasury hedge book lost roughly 19% in the modeled 2022 replay",
      evidenceKind: "drawdown",
    },
    {
      id: "real-yields",
      context: "Under the memo's attribution framework, for this one episode",
      text: "That loss came primarily from rising real yields, not breakevens",
      evidenceKind: "identity",
    },
  ] satisfies Claim[],

  /** Evidence panels. */
  evidence: {
    sharpe: {
      chartTitle: "Full-sample Sharpe ratio, 2007–2026",
      bars: [
        { label: "Static 60/40", value: 0.66 },
        { label: "Regime-aware rule", value: 0.48 },
      ],
      source:
        "Also benchmarked against equal weight, minimum variance, maximum Sharpe and SPY.",
    },
    drawdown: {
      chartTitle: "Long-duration hedge book, modeled 2022 replay",
      value: "≈ −19%",
      note: "a modeled book, not a fund's return",
    },
    identity: {
      definition: "b ≈ expected inflation + inflation risk premium + TIPS liquidity effects",
      body: "A breakeven is inflation compensation read off nominal minus TIPS yields. It is not a pure measure of expected inflation: it also carries an inflation risk premium and, in stressed markets, TIPS liquidity effects.",
    },
  },

  now: {
    label: "Now · FE800, Fall 2026",
    body: "Testing whether real-rate dominance is a general feature of Treasury hedge failures or specific to 2022, by applying one standardized hedge book across other market-stress episodes.",
  },

  limit: "Measurement and attribution, not prediction or causal identification.",

  links: {
    ssrn: { label: "Read on SSRN", href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7469079" },
    prospectus: { label: "FE800 prospectus", href: "/research/Maniar-Research-Prospectus.pdf" },
  },
};
