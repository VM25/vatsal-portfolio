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
  paperTitle: "Stock–Bond Diversification in an Inflation-Driven Rates Regime",

  premise:
    "For most of the period from the late 1990s through 2020, U.S. stocks and Treasuries did not fall together. In 2022 they did.",

  ask: "asks whether acting on that helps in practice, using lagged, observable signals, realistic costs and position limits, and measures why the hedge failed.",

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
      label: "Full-sample Sharpe ratio, 2007 to 2026: static 60/40 0.66, regime-aware rule 0.48",
      chartTitle: "Full-sample Sharpe ratio, 2007–2026",
      /** The axis runs from 0 to this, with a tick every 0.2. */
      scaleMax: 0.8,
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
    },
    identity: {
      /** One sentence under the identity (refinement R7): what b is, and what else it carries. */
      body: "The breakeven b is inflation compensation, not a pure measure of expected inflation: it also carries an inflation risk premium and, in stressed markets, TIPS liquidity effects.",
    },
  },

  /** The paper's one public link. Refinement R7 removed the prospectus link and the dated "Now" line. */
  links: {
    ssrn: { label: "Read on SSRN", href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7469079" },
  },
};
