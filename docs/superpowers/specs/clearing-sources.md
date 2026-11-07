# Clearing: per-claim sources

These are the claim checks from Task 5 (2026-11-06). Each one maps a claim on the site to its source and records the decision taken. They used to live only in the SDD workspace (`.superpowers/`, which is gitignored); this file keeps them in git. The locked research claims are in the claims register, spec §9.

The repository paths are Vatsal's project repos (README and docs files). "Kept" means the claim is shown as written. "Changed" means the copy was corrected to match the source. "Removed" means the source does not support the claim.

## YieldShock (inflation-lab/README.md)

| Claim | Source | Decision |
|---|---|---|
| 10 shock scenarios | README line 40 ("10 shock scenarios"), line 42 | Kept |
| 4 hedge overlays | README line 44 ("4 rule-based overlays") | Kept |
| 5 attribution channels | README lines 6–7 (duration, convexity, curve-shape, real-rate, breakeven) | Kept |
| "Reprices every cash flow … measures what a rule-based hedge overlay recovers" | README lines 6–8 | Kept |
| "It is the rates engine behind the research memo" | Not in the README. Prospectus `.tex` lines 128–129 say "the Treasury curve-risk and P&L-attribution side". | Changed to "It is the Treasury curve-risk and attribution side of the FE800 research." |

## Signal Survival (research-lab/README.md)

| Claim | Source | Decision |
|---|---|---|
| 5 strategies | "Signals tested" table, 5 rows | Kept, labelled "signals" (the README's word) |
| 20 years of real data | "20 years of real ETF data"; sample 2006-01 to 2026-08 | Kept as "real ETF data" |
| 3 of 5 survived | "Final verdicts": TS momentum, CS momentum and the ensemble survived | Kept |
| "One works only as a brake" | Vol-Scaled Momentum is "Conditional"; headline "a risk-control overlay" | Changed "brake" to "risk-control overlay" |
| "One was dropped because costs ate everything it earned" | Not supported: Reversal nets 5.1% CAGR at 5 bps. The README says "12.8x/yr turnover trails every passive benchmark and degrades sharply as costs rise" | Changed to "it trades so often that it trails every passive benchmark and degrades sharply as costs rise"; "dropped" became "rejected" (the README's verdict word) |
| "Well-known strategies" | README: "simple, explainable trading signals" | Changed to "simple trading signals" |
| "Survive trading costs, unseen years and changed settings" | Methodology: costs, train/test plus walk-forward, parameter robustness | Kept |

## Currency Options Desk (fx-options-risk-lab/README.md)

| Claim | Source | Decision |
|---|---|---|
| "$4.65M position" | "Gross notional USD 4.65M" | Kept as "$4.65M gross notional" |
| "95% loss-estimate confidence" | 95% VaR is a confidence level, not a result | Removed; replaced by "10,000 simulated paths for VaR" (Methodology: "10,000 paths") |
| "100% directional risk hedged" | Not supported. README: "net delta reduced to ~0; worst-case loss reduced ~99%" | Replaced by "~99% worst-case loss cut by the hedge" |
| "The hedge removes the directional risk entirely … what remains is the risk of the market moving sharply" | "Entirely" overstates it, and no README line says the residual is gamma or vol | Rewritten to the README facts: before the hedge it breaches the illustrative delta, vega and stress-loss limits; the hedge brings net delta to about zero and cuts worst-case stress loss by about 99%. "Illustrative data and limits, not a trading book" added (Limitations), then removed in R2 at the controller's ruling: "illustrative" stays once, on the limits |
| Dollar-peso, a sharp move, a hedge | USD/MXN, an 11×7 stress grid, a delta hedge | Kept |

## Lending Decisions (credits-lab/README.md)

| Claim | Source | Decision |
|---|---|---|
| 95,000 applicants | "94,999 credit applicants" | Changed to the exact 94,999 |
| 180 policy scenarios | "180 policy scenarios" | Kept |
| 1 of 3 models flagged | Key results: underwriting Monitor, fraud Pass, stablecoin Pass | Kept. Label was "models marked Monitor"; R2 made it "models flagged for monitoring" (Vatsal's review) |
| "The fraud side works well" | PR-AUC 0.66, ROC-AUC 0.97, verdict Pass | Kept |
| "Separates borrowers only modestly" | "ROC-AUC about 0.695 … modest discrimination, disclosed" | Kept. R2 wording: "separates borrowers only modestly, so it is flagged for monitoring" (the README's Monitor verdict, in plain words) |
| Decisions: approve, review, decline, block | "What it answers" table | Kept |
| — | README banner | Added "Built on public and clearly labeled synthetic data"; R2 shortened it to "Built on public and synthetic data" |

## Allocation Study (portfolio-lab-4/README.md)

| Claim | Source | Decision |
|---|---|---|
| 13 assets; equal weight, minimum variance, maximum Sharpe, SPY, 60/40; 5 bps costs; 35% per-asset cap; crisis windows 2008–09, 2020, 2022 | README, "What this is" | Kept |
| 2007–2026 sample | The data starts April 2007; the end follows the §9 register | Kept |
| "3 crises analysed" | "Three dedicated crisis windows" | Label changed to "crisis windows" |

## ApexGP (ApexGP/README.md and docs/v2/README.md)

| Claim | Source | Decision |
|---|---|---|
| "500+ positions" | No source in the README or docs | Removed; replaced by "$100,000 simulated book" (the README's sandbox balance) |
| "24 races settled" | README: "complete 2025 … season, lap by lap". The 24 comes from counting the 24 round files in `public/data/official`, not from a README line | Kept as "24 races replayed" ("settled" became "replayed"). Vatsal to confirm (sign-off) |
| "30% / 15% exposure limits" | docs/v2/README.md lines 29 and 97–98 (30% total, 15% single contract); also `usePortfolio.ts`. Not in the main README | Kept, label made exact |
| "Priced, limited and audited from the first lap to the last" | README: dynamic repricing, risk limits, trade audit ledger | Rewritten as a plain description of those features (adds circuit-breaker halts on safety cars and retirements) |

## Exhibits

| Claim | Source | Decision |
|---|---|---|
| DiffusionWorks: 15 studies, 10 clean, 5 with caveats, none failed | stochastic-lab/README.md lines 19 and 53 | Kept |
| BGK correction "matched within two standard errors at 16 of 18 down" | "Two standard errors" not found. BARRIER-MONITORING-METHODOLOGY.md line 397: "resolved as wrong at 23 of 24 up-barrier cells against 2 of 18 down-barrier ones"; line 255: "over-predicts" | Changed to "held at 16 of 18 down-barrier test cells, but was resolved as wrong at 23 of 24 up-barrier cells, where it consistently over-predicts". R2 made it "but was off at 23 of 24 up-barrier cells, where it consistently over-predicts", following spec §6.1 ("resolved as off (over-predicting)"); the source's word is "wrong" |
| Liquidity: 20 sessions of SOL/USDT | liquidity-lab/README.md line 7 | Kept |
| Liquidity: 4.2% R², 5 of 5, 1–2 bp, 11–12 bp | Spec §9 register (not re-derived from the closeout CSVs) | Kept |
| Liquidity method line: "Historical order-book replay with modeled executions under stated queue, latency and fee assumptions" | `results/e002/E002_report.md` line 3 ("modeled historical replay … Fills are inferred under the stated queue, latency and fee assumptions"); README layout ("L2 replay") | R2: replaces "Modeled historical replay: the orders never existed; fills are inferred under …" |
| Liquidity animation caption: "a market maker quotes one tick either side of a price that moves two ticks per trade, and 55% of trades come from informed flow" | The toy's own parameters, `src/lib/mmToy.ts` (HALF = 1, MOVE = 2, ALPHA = 0.55); spec §6.2 | R2: one line describing the mechanism, replacing the "Illustration only … Not the study's data" caption. The study's own figures sit in the results block |
| "Lost money in every modeled scenario … mostly to better-informed flow" | "Every" and "mostly to informed flow" are not in the README or the E002 report | Changed to "lost money in the modeled replay"; "mostly to better-informed flow" dropped |

## Profile and Path

| Item | Decision |
|---|---|
| Phone number | Not shown (spec §13; tested in `content.test` and `chapters.spec`) |
| FRM | Path only: "GARP FRM Part 1 Candidate", "Financial Risk Manager · sitting November 2026" (tested) |
| Availability, route, "from January 2027" | As the brief states |
| Old experience details ("$1.5B book", "98%", "60 people", "10,000+ records") | Dropped: there was no source to check, and the prototype doesn't show them. Vatsal to confirm (sign-off) |

## Live URLs

All 16 project URLs returned HTTP 200 (checked by the controller in Task 5).

| Project | Live URL | Where it comes from |
|---|---|---|
| YieldShock | yieldshock.netlify.app | Confirmed (prospectus line 128) |
| Lending Decisions | credits-engine.netlify.app | Confirmed (README) |
| Signal Survival | alpha-research.netlify.app | Old site data only, not a README |
| Currency Options Desk | fxrisklab.netlify.app | Old site data only |
| Allocation Study | pra-analytics.netlify.app | Old site data only |
| ApexGP | apexgp-markets.netlify.app, repo `VM25/apexgp-markets` | Old site data only. The README says it is deployed on Vercel, so the URL and the repo name need confirming |

## Refinement R2 (2026-11-07): copy changes that touch a sourced line

The facts are unchanged. Only the wording moved, and each line still traces to the row above it.

| Where | Old | New | Source |
|---|---|---|---|
| ApexGP result | "replays lap by lap as event contracts on a simulated book, with …" | "replays lap by lap as event contracts, with …" ("simulated book" stays once, in the figure "$100,000 simulated book") | ApexGP rows above |
| YieldShock question | "Pick an inflation-regime shock and a Treasury book: where does the loss actually come from?" | "When an inflation-regime shock hits a Treasury book, where does the loss actually come from?" | No figure; README lines 6–8 |
| Allocation Study question | "The allocation side of the research memo below." | "Can a portfolio adapt when stocks and Treasuries fall together, and does adapting actually help?" (Vatsal's line, em dash replaced by a comma) | No figure; README "What this is" |
| Research, drawdown chart | note "a modeled book, not a fund's return" | removed; the chart title already says "modeled 2022 replay" | Spec §9 |
| Research, limit line | "Measurement and attribution, not prediction or causal identification." | removed at Vatsal's request; the register row is marked removed | Spec §9 |
| Research, question | "… and then measures why the hedge failed. Three findings, each with its evidence:" | "… and measures why the hedge failed." | Writing sample abstract |
| Hero | the reflection caption ("averages n = … ripples; wobble shrinks like σ/√n") | removed; the shader still averages 512 ripples | Spec §5.3 |
