# Clearing — portfolio V2 build specification

Status: **direction approved** (Clearing), **implementation not yet authorized**.
Date: 2026-11-06. Owner: Vatsal Maniar.

Approved visual reference:
- Prototype (private): https://claude.ai/artifact/4veur4dzQu69WgAmfwhPgW (version 3)
- Preview (unlisted): https://v2-previews-c4e19a7b.netlify.app/prototype.html
- Source copy in this repo: `docs/superpowers/specs/clearing-reference/prototype-source.html`
  (shader, chapter shots, exhibits, copy), `prototype-built.html` (with embedded fallback
  frames) and `fallback-frames/*.jpg`.

The prototype is the reference for look, motion, layout and copy. Where this document and the
prototype disagree, this document wins.

---

## 1. Intent

A personal portfolio for quantitative finance recruiting (quant research, trading,
derivatives risk, quant development) that feels like a place, not a page. The visitor stands
on the Jersey City waterfront at 2 a.m., looking across the Hudson at Manhattan in fog. As they
read, the night moves toward morning and the fog clears — uncertainty resolving into an
answer, which is also what the work does. "Clearing" is also how a trade is settled.

The four qualities it must hold together:
- **Convergence**: mathematics as atmosphere (the lamp's reflection is a live sample mean).
- **Across the River**: a real, personal place with depth and light.
- **Tempo**: rare, decisive bursts of speed around results (the market-making sequence, the
  fog snapping clear).
- **The Argument**: research told as claims with their evidence, in a serif voice.

## 2. Goals, non-goals, anti-goals

Goals
- A recruiter understands who Vatsal is within one screen: name, role, graduation date,
  what he's looking for.
- Two exhibits prove range: one mathematically interactive (DiffusionWorks), one
  evidence-led (the research memo), plus one fast, cinematic moment (The Liquidity Paradox).
- Every number and claim on the site is correct and traceable to a source.
- Works fully on phones, with reduced motion, and without WebGL.

Non-goals
- A blog, a CMS, analytics dashboards, or a projects index page.
- Real Manhattan geometry in v1 is a stretch goal (see §12), not a launch requirement.

Anti-goals (would be failure even if it technically works)
- Bloomberg/terminal, SaaS, fintech-template, casino or gamified looks.
- Floating equations, particles, volatility surfaces, decorative charts or tickers.
- Huge uppercase type throughout; cards in cards; numbered section eyebrows.
- Any animation that hides or delays text; any number that doesn't reconcile.
- Any claim stronger than its source.

## 3. Hard constraints

- **The live portfolio stays untouched** until Vatsal explicitly authorizes implementation
  and, separately, deployment. Netlify builds production from this repo
  (`VM25/vatsal-portfolio`), so:
  - all work happens on a new branch (e.g. `v2-clearing`), never on `main`;
  - previews only (Netlify branch deploy / deploy preview, or the separate preview site
    `v2-previews-c4e19a7b`); no merge to `main`, no production deploy, no DNS change without
    written approval.
- **Next.js 16.2.7 with React 19** is already in the repo. Per `AGENTS.md`, this Next.js has
  breaking changes: read `node_modules/next/dist/docs/` before writing any App Router code.
- Keep the existing stack (Next.js, TypeScript, Tailwind v4). GSAP, framer-motion and
  scrollama may be removed if unused; no three.js. WebGL is used for one full-screen shader
  only, through raw WebGL (no library).
- Fonts: Geist (200–500), Geist Mono (400–500), STIX Two Text (400–500, italic). Nothing from
  the user's forbidden list (see memory: Syne, Chivo, Space Mono, Instrument Serif, Archivo,
  IBM Plex, Inter, JetBrains Mono, Fraunces, Sora, DM Mono/Sans, Saira, Public Sans,
  Newsreader, Spline Sans, Source Code Pro).
- Copy rules: no em dashes in site copy; no developer chatter (framework names, "pipeline",
  "deterministic"…); sentence case; findings stated as discoveries, not as "what failed".
- **Profile photo (decided 2026-11-06): included in the Path chapter**, beside the Mumbai →
  Arizona → New Jersey route, using `public/images/vatsal-maniar.jpg` exactly as taken (no
  filters, duotone, grain or overlays). Sized so the route stays the focus; responsive image
  with real alt text ("Vatsal Maniar"); never in the hero.
- **No contact form (decided 2026-11-06).** Contact is email (mailto link + copy button),
  LinkedIn, GitHub and résumé. Remove the Web3Forms form and its key from the V2 branch.

## 4. Information architecture and content

One page, five chapters, in this order. Each chapter has an anchor and a scene clock time
(computed from scroll position, see §5.3).

| Chapter | Anchor | Content |
|---|---|---|
| Home | `#top` | Name, one-line role, availability, two actions |
| Projects | `#projects` | DiffusionWorks exhibit, The Liquidity Paradox exhibit, "More projects" rail of six |
| Research | `#research` | "The hedge that stopped working": premise, question, three claims with evidence, FE800 "Now", links |
| Path | `#path` | Mumbai → Arizona → New Jersey, degrees, FRM Part 1 (shown only here), experience list |
| Contact | `#contact` | "Let's talk", availability, email (link + copy), LinkedIn, GitHub, résumé |

Content source of truth: `src/data/*.ts`, updated to match the prototype copy. Copy in the
prototype is final unless this document changes it. Facts that must stay exact:
- Graduating **December 2026**; full-time quantitative roles from **January 2027**.
- FRM: "GARP FRM Part 1 Candidate · November 2026", in Path only.
- Route ends at New Jersey (no New York).
- Education and roles exactly as in `src/data/study.ts` and `src/data/posts.ts`.

## 5. Visual system

### 5.1 Palette (three principal colours, with shades)
| Role | Token | Hex |
|---|---|---|
| Foundation: harbor night | `--night` | `#0B1214` (shades `#111A1D`, `#1A2528`, `#060A0B`) |
| Complement: pearl fog | `--fog` | `#C3CBC6` (text `#E6EBE7`, secondary `#9AA39E`, hairline `#5B6661`) |
| Accent: sodium | `--sodium` | `#FFA62B` (glow `#FFC873`, deep `#C77A10`) |
| Morning ink (Contact at dawn) | `--ink` | `#13201F` (secondary `#3E4B48`) |

Sodium is reserved for: the lamp, findings/figures, the primary action, focus rings, active
state. Never decorative fills.

### 5.2 Typography
- Geist 200 for display (name, chapter titles, result figures), 300 for lede, 400 for UI.
- STIX Two Text for research prose and all mathematics (italic variables, proper operators).
- Geist Mono only for numbers the page computes or counts.
- Scale (fluid, container-relative): name `clamp(3.1rem, 13cqi, 6rem)`; chapter titles
  `clamp(2.4rem, 7cqi, 4rem)`; exhibit titles `clamp(2rem, 5.6cqi, 3rem)`; body 17px;
  secondary text **never below 14px**.

### 5.3 The world (scene) and its progression
A fixed, full-viewport layer behind the page renders the Hudson from the Jersey City side. It
is driven by scroll progress `p ∈ [0, 1]` (top to bottom of the page).

- Clock: `2:04 a.m. → 6:12 a.m.` linearly in `p`; shown in the top bar and on chapter labels.
- Fog density: `0.92 − 0.58·smoothstep(0.04, 0.92, p)` (morning keeps river mist).
- Dawn: `smoothstep(0.80, 0.98, p)`; windows go dark, sodium lamp switches off, Contact turns
  dark-on-light ("morning" state) when dawn > 0.55.
- **Chapter shots** (interpolated with smoothstep between chapter key positions measured from
  the real layout):

| Chapter | Horizon | Pan | Lamp (strength, x) | Living detail |
|---|---|---|---|---|
| Home | 0.30 | 0.00 | 1.0, 0.72 | Lamp reflection converging |
| Projects | 0.50 (down at the waterline) | 0.22 | 1.0, 0.56 | Ferry crossing; speeds up during the market-making run |
| Research | 0.17 (big sky) | 0.42 | 0.45, 0.30 | Fog bank (mist band) that snaps clear on the beat |
| Path | 0.33 | 0.72 | 0.0 (out of frame) | Aircraft crossing, blinking |
| Contact | 0.30 | 0.95 | 0.0 | Morning; ferry at 0.7 |

Phone (portrait) adds +0.06 to the horizon and uses the portrait composition constants from
the prototype.

- The lamp reflection is the mean of *n* ripples, *n* doubling from 1 to 512 on load; its
  wobble scales with `1/√n`. (The hero caption that stated this was removed in refinement R2.)
- Section transitions: a short fog "gust" (≈600 ms) when the active chapter changes.
- Readability: every chapter's text sits on a soft veil (gradient, no boxes) so contrast holds
  over any scene state.

## 6. Exhibits

### 6.1 DiffusionWorks (interactive mathematics)
- Controls: steps `N` 1–200, volatility `σ` 5–80%, strike `K` 60–140; fixed `S = 100`,
  `r = 4%`, `T = 1`, European call.
- Cox–Ross–Rubinstein: `u = e^{σ√Δt}`, `d = 1/u`, `p = (e^{rΔt} − d)/(u − d)`,
  `V = e^{−rΔt}[p·V_up + (1 − p)·V_down]`; Black–Scholes closed form for the reference.
- Displays: binomial price, Black–Scholes price, difference (4 dp); live `u`, `d`, `p` (5 dp);
  a tree of the first 6 steps (5 on narrow screens) labelled with option values; a convergence
  chart of all `N` 1–200 with a marker at the chosen `N`.
- Motion: on slider release, a backward-induction sweep runs from expiry to the root (650 ms).
- No disclaimer note: refinement R2 removed "an illustration on this page, not one of the fifteen studies". The findings below carry the study results.
- Project findings (from `stochastic-lab/README.md` and
  `docs/BARRIER-MONITORING-METHODOLOGY.md`): 15 studies, 10 clean, 5 with documented caveats,
  none failed; Broadie–Glasserman–Kou continuity correction within two standard errors at
  16 of 18 down-barrier cells, resolved as off (over-predicting) at 23 of 24 up-barrier cells.

### 6.2 The Liquidity Paradox (the fast moment)
- On first view, a seeded toy simulation runs for about 4.2 s, accelerating; the river and ferry
  speed up with it; then a hard cut: the simulation dims, the fog snaps clear, "4.2% skill"
  stamps. "Replay" replays.
- Toy model (a mechanism illustration, captioned "How adverse selection works: …"): market maker quotes ±1 tick around a price that
  moves ±2 ticks per trade; 55% of trades are informed (trade in the direction of the next
  move); 45% are uninformed (random side). Seeded LCG (`seed = 20261106`) so the default state
  is reproducible.
- **Accounting identity, shown on screen:**
  `net = spread earned − informed loss + random moves on uninformed trades`.
  Five counters (trades, spread earned, lost to informed flow, random moves, net) plus a live
  equation line, e.g. `+420 − 476 − 40 = −96 ticks`. All components are integers.
- Study findings (from `liquidity-lab/results/closeout/CLOSEOUT_report.md` and
  `results/e002/E002_report.md`): 20 sessions of SOL/USDT order-book data; held-out
  out-of-sample R² 4.2% at 5 s, positive in all 5 test sessions; baseline quoting rules lost
  about 1–2 bp of notional before fees (mostly adverse selection) and about 11–12 bp at the
  exchange's default fee tier, under every modeled fill, latency and fee assumption. Shown with
  the note "Historical order-book replay with modeled executions under stated queue, latency and fee assumptions."

### 6.3 The hedge that stopped working (evidence-led research)
Claims are buttons; each opens its evidence (beside it on wide screens, under it on phones).
Copy is locked to the claims register (§9).

### 6.4 More projects
Rail of six (YieldShock, Signal Survival, Currency Options Desk, Lending Decisions, Allocation
Study, ApexGP) with a stage. Wide screens: rail left, stage right. Narrow: the stage opens
directly under the selected item and scrolls into view. Arrow keys move between items.

## 7. Interaction and motion rules
- Beats (stamp + fog snap) happen exactly three times: DiffusionWorks "10 of 15", the
  Liquidity cut, the Research premise. No other stamps.
- No animation gates visibility: all text is readable at its final state from first paint.
- Easing: `cubic-bezier(0.23, 1, 0.32, 1)` for UI; durations ≤ 300 ms for controls, 600–900 ms
  for scene changes; the market-making run is the only long sequence (≈4.2 s) and is
  user-replayable, not looping.
- Hover effects only under `(hover: hover) and (pointer: fine)`; buttons scale to 0.97 on press.

## 8. Acceptance criteria

### 8.1 Numerical correctness (automated tests required)
- Black–Scholes (`S = K = 100, σ = 20%, r = 4%, T = 1`) = **9.925054** (±1e-5).
- CRR prices for the same inputs: N=1 **11.731926**, N=2 **9.019599**, N=12 **9.761156**,
  N=100 **9.905183**, N=200 **9.915112** (±1e-6); at N=12, `u = 1.059434`, `p = 0.514470`.
- `0 < p < 1` for every slider combination (verified offline: 0 violations over N 1–200,
  σ 5–80%).
- K=80, σ=40%: BS **28.455625**, CRR(200) **28.446513**.
- Market-making toy: at every displayed update, `earned − lost + random = net`, `earned =
  trades`, `lost` is even, and the equation line matches the counters; the default state
  (420 trades) reads `+420 − 476 − 40 = −96`.
- Normal CDF error < 1e-6 across [−6, 6] (if using an erf approximation, prove it in a test).
- All figures display with consistent units and signs (true minus "−", thousands separators).

### 8.2 Research accuracy
- Every claim on the site appears in the claims register (§9) with its source; nothing ships
  without a source line.
- Before launch, the four project descriptions not yet re-verified (Signal Survival, Currency
  Options Desk, Lending Decisions, ApexGP) are checked against their repos/README and corrected
  or softened.
- Breakevens are never described as pure inflation expectations.

### 8.3 Accessibility (WCAG 2.2 AA)
- Text contrast ≥ 4.5:1 (≥ 3:1 for ≥ 24px) against the worst-case scene state behind it,
  checked at night, research fog and morning states.
- Visible focus on every interactive element (sodium outline); logical tab order; skip link to
  main content.
- Mobile menu is a modal dialog: focus moves in on open, is trapped while open, returns to the
  Menu button on close; Escape closes; body scroll locked.
- Rail uses the tabs pattern (roles, `aria-selected`, arrow keys); claims use
  `aria-expanded`/`aria-controls`.
- Canvases and charts have text equivalents: the numbers they show are also in the DOM.
- Touch targets ≥ 44×44px; secondary text ≥ 14px; no horizontal scroll at 320px.
- Reduced motion (see 8.6) honoured automatically from the OS setting.

### 8.4 Responsive behaviour
- Verified at 320, 375, 414, 768, 1024, 1280, 1440 and 1920 px wide, portrait and landscape.
- Layout switches are container-query based; the phone layout is the default.
- Below 760px: Menu button replaces section links; résumé moves into the menu.
- Below 980px: exhibits stack in this order: intro, controls, visual, readouts, formulas,
  result.
- The scene uses the portrait composition when its aspect ratio < 1.

### 8.5 Pacing (scroll test)
- Sampling every 60px of scroll at 1440×900 and 375×812, the largest text-free band never
  exceeds **40%** of the viewport (prototype: 30% desktop).

### 8.6 Reduced motion and fallbacks
- `prefers-reduced-motion: reduce`: scene renders as a still that changes only with scroll
  (no drifting fog, no ripples, reflection fully converged); no stamps, gusts, sweeps or
  count-ups; the market-making exhibit shows its final state immediately; smooth scrolling off.
- No WebGL (or shader compile failure): five pre-rendered stills per orientation (from the
  same shader, one per chapter) cross-fade with scroll. Total fallback weight ≤ 1.2 MB, loaded
  lazily and only when needed.
- No JavaScript: all content readable in document order on a dark background.

### 8.7 Performance
- Lighthouse mobile (Moto G Power profile): Performance ≥ 90, LCP ≤ 2.5 s, CLS ≤ 0.05,
  INP ≤ 200 ms.
- Scene: one full-screen fragment shader, device-pixel-ratio capped at 1 (scene) and 2 (UI
  canvases); paused when the tab is hidden; ≤ 30 fps; steady ≥ 30 fps on a 2020 MacBook Air and
  an iPhone 12. If a device can't hold it, drop to the still fallback automatically.
- JS shipped for the page ≤ 120 KB gzipped (excluding fonts); fonts subset and preloaded.
- Market-making and convergence computations ≤ 8 ms per update on mid-tier mobile.

### 8.8 Cross-browser
- Latest Chrome, Safari (macOS and iOS) and Firefox. Safari is the strict target (see memory:
  `transform-box`, IntersectionObserver on mount, `color-mix()` fallbacks).

## 9. Claims register (locked copy and sources)

| Claim on site | Source |
|---|---|
| "For most of the period from the late 1990s through 2020, U.S. stocks and Treasuries did not fall together. In 2022 they did." | `FE800/Writing Sample/Writing_Sample_Final/writing_sample.tex`, introduction (lines 79–86) |
| Regime-aware allocation did not beat a static 60/40 on a risk-adjusted basis: Sharpe 0.48 vs 0.66 (13 assets, 2007–2026, costs and limits) | same file, abstract (lines 58–61); prospectus "Completed prior work" |
| Also benchmarked against equal weight, minimum variance, maximum Sharpe and SPY | prospectus, "13-asset regime-aware allocation study…" |
| A long-duration Treasury hedge book lost roughly 19% in the modeled 2022 replay | abstract (line 62); prospectus |
| That loss came primarily from rising real yields, not breakevens, under the memo's attribution framework, for this one episode | abstract (lines 62–63); prospectus ("under a stated portfolio-level attribution framework and for that single episode") |
| Breakeven = nominal − TIPS yield; inflation compensation including an inflation risk premium and TIPS liquidity effects, not pure expected inflation | `FE800/10:13/FE800_Week3_Research_Memo.tex` line 226; `Research_Progress_Summary_10-13.md` |
| FE800 (Fall 2026) tests whether real-rate dominance generalizes across stress episodes | prospectus, "Core FE800 question" |
| (Removed from the site in refinement R2, at Vatsal's request.) Measurement and attribution, not prediction or causal identification | prospectus, "Expected contribution" |
| DiffusionWorks: 15 studies, 10 clean, 5 caveats, none failed; BGK 16/18 down, 23/24 up | `stochastic-lab/README.md`; `docs/BARRIER-MONITORING-METHODOLOGY.md` §6–6.2 |
| Liquidity Paradox: 20 sessions SOL/USDT; held-out R² 4.2% at 5 s, 5 of 5 positive; −1 to −2 bp before fees; −11 to −12 bp at default fee tier; modeled replay | `liquidity-lab/README.md`; `results/closeout/CLOSEOUT_report.md` (H1-F); `results/e002/E002_report.md` |
| YieldShock: 10 shock scenarios, 4 hedge overlays, 5 attribution channels; the Treasury curve-risk and attribution side of the FE800 research | `inflation-lab/README.md` (header; stages 1, 5, 6); `FE800/Writing Sample/Vatsal_Maniar_FE800_Research_Prospectus.tex` lines 128–129 |
| Signal Survival: 5 signals, 20 years of ETF data (2006–2026), 3 survived, 1 conditional (risk-control overlay), 1 rejected (12.8x/yr turnover trails every passive benchmark and degrades sharply as costs rise) | `research-lab/README.md`, "Final verdicts", "Data" |
| Currency Options Desk: USD 4.65M gross notional; 10,000-path Monte Carlo VaR/ES; delta hedge takes net delta to ~0 and reduces worst-case loss ~99%; book breaches illustrative limits before hedging (the site says "illustrative" once, on the limits; the separate "illustrative data" line was removed in R2) | `fx-options-risk-lab/README.md`, "Headline figures", "Quant methodology", "Limitations" |
| Lending Decisions: 94,999 credit applicants, 180 policy scenarios; underwriting model ROC-AUC about 0.695 = Monitor, fraud model = Pass, stablecoin scorer = Pass (shown as "1 of 3 models flagged for monitoring"); public and synthetic data | `credits-lab/README.md`, "What it answers", "Key results", "Data sources" |
| ApexGP: 2025 season replayed lap by lap, $100,000 simulated book, circuit-breaker halts, audit ledger; 30% total and 15% single-contract exposure limits; 24 races | `ApexGP/README.md` ("Race Replay Engine", "Portfolio Management", sandbox balance); `ApexGP/docs/v2/README.md` lines 29, 97–98 (limits); `ApexGP/public/data/official/` (24 round files) |
| Allocation Study: 13 assets, benchmarks, 35% per-asset cap, 5 bps costs, three crisis windows (2008, 2020, 2022) | `portfolio-lab-4/README.md`, "What this is"; sample start April 2007 per its data notes |

Any copy change to these claims requires re-checking the source and updating this table.

## 10. Architecture (guidance)
- `src/app/page.tsx` renders the five chapters as server components with static content.
- Client components only where needed: `World` (shader + fallback + scroll state), `Clock`,
  `MobileMenu`, `DiffusionExhibit`, `LiquidityExhibit`, `ProjectRail`, `Claims`.
- Pure, tested modules: `lib/pricing.ts` (CRR, BS, normal CDF), `lib/mmToy.ts` (seeded toy +
  accounting), `lib/scene.ts` (chapter shots, `stateAt(p)`, clock).
- Fallback stills are generated by a script that runs the same shader headlessly and writes
  `public/scene/{land,port}{0..4}.jpg`; they are checked in.

## 11. Testing and verification plan
- Unit tests for §8.1 (Vitest or Node test runner; builder's choice).
- Browser tests (Playwright) for: scroll-gap test (§8.5), mobile menu focus and Escape, rail
  keyboard, claims toggle, market-making reconciliation on every update, reduced-motion
  behaviour, no-WebGL fallback, no horizontal scroll at 320px.
- Manual pass on real devices: iPhone (Safari), Android (Chrome), MacBook (Safari, Chrome).
- Contrast audit at the three scene states.
- Sign-off checklist delivered with the preview link before any request to deploy.

## 12. Left to the builder
- Component boundaries, file names, test runner, CSS organisation (Tailwind utilities vs. CSS
  modules), exact debounce and observer thresholds.
- Whether to replace the procedural skyline with real Manhattan building outlines (stretch
  goal; must not change the composition or palette, and must keep shader cost within §8.7).
- Final fallback image dimensions/quality within the §8.6 budget.

## 13. Calls made by the spec author (check these)
- Phone number is not shown (the current site shows it; the prototype does not).
- Site metadata, Open Graph image and description are rewritten to the Clearing copy rules
  (the current description contains an em dash and old framing).
- The current sections, instruments and data that V2 no longer uses are deleted on the V2
  branch rather than kept alongside.
- Fallback stills are checked into `public/scene/` rather than generated at build time.
- The prototype's "Prototype controls" panel is not part of the site; equivalent toggles exist
  only in tests.

## 14. Decisions already made (do not reopen)
- Direction: Clearing. No further concept exploration.
- No three.js; one raw WebGL shader; everything else DOM/SVG/2D canvas.
- Section names: Projects, Research, Path, Contact; research title "The hedge that stopped
  working"; contact title "Let's talk".
- Findings presented confidently as discoveries; no "here's what failed" framing on the home
  screen.
