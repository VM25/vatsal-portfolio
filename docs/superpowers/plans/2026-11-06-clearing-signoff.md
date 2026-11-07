# Clearing (Portfolio V2): sign-off

**Status: RELEASED. Clearing V2 is the final released version, live at https://maniar-portfolio.netlify.app since 2026-11-07 20:20:44 UTC (merge commit `803c826` on `main`, Netlify deploy `6aef87f4a19b0e91b27144cd`).** Vatsal approved production in writing on 2026-11-07 after completing the real-device checks. The release record is in section 8. Sections below are kept as written during the build.

- Spec: `docs/superpowers/specs/2026-11-06-clearing-design.md` (§8 is mapped below)
- Plan: `docs/superpowers/plans/2026-11-06-clearing.md`
- Acceptance tests: `tests/e2e/acceptance.spec.ts`. Lighthouse and the page JS size were measured by hand (section 2).

## 1. Status at sign-off (Task 13)

| Check | Result |
|---|---|
| vitest | 42/42 |
| `tsc --noEmit`, eslint | clean |
| `next build` (clean `.next`) | passes. See "Build flakiness" in section 5. |
| e2e, Chromium + WebKit (full suite) | 286 passed, 0 failed, 4 skipped (the two Chromium-only clipboard tests on WebKit, the Chromium-only `--disable-webgl` launch on WebKit, and the Chromium-only layout-shift (CLS) deep-link test on WebKit). Firefox not run. |
| `acceptance.spec.ts --repeat-each=2`, Chromium + WebKit | 72/72 passed (at 9370bee; the acceptance spec has passed in every full run since) |
| Firefox | **Pending.** Firefox can't launch in this sandbox. Run `npx playwright test --project=firefox` on a normal machine, or cover it in the device pass. |
| Unused dependencies | `npm ls gsap framer-motion scrollama`: none present (removed in Task 6). The remaining dependencies are all in use: `next`, `react`, `react-dom`; dev: tailwind, eslint, typescript, vitest, playwright, `@axe-core/playwright`. |

## 2. Spec §8 criteria and their evidence

Test names are given as `file › test`. "Unit" means `tests/unit/*.test.ts` (vitest); "e2e" means `tests/e2e/*.spec.ts` (Playwright, Chromium and WebKit).

### 8.1 Numerical correctness

| Criterion | Evidence |
|---|---|
| BS (S = K = 100, σ = 20%, r = 4%, T = 1) = 9.925054 ± 1e-5 | Unit: `pricing.test › Black-Scholes reference values`. The page shows 9.9251 (ruling, Tasks 1–4: 9.925054 rounded to 4 dp; the prototype's 9.9250 came from its erf approximation). e2e: `diffusion › defaults show the binomial and Black–Scholes prices…` |
| CRR at N = 1, 2, 12, 100, 200; u and p at N = 12 | Unit: `pricing.test › CRR reference values`, `› crrParams u and p at N=12`. e2e: `diffusion › N = 200 converges to 9.9151` |
| 0 < p < 1 for every slider combination | Unit: `pricing.test › p is strictly inside (0,1) for every slider combination` |
| K = 80, σ = 40%: BS 28.455625, CRR(200) 28.446513 | Unit: `pricing.test › Black-Scholes reference values` and `› CRR reference values`. e2e: `diffusion › K = 80, σ = 40%, N = 200` |
| Market-making toy: reconciles at every update; default 420 trades reads `+420 − 476 − 40 = −96` | Unit: `mmToy.test › invariants hold for 2,000 steps`, `› 420 steps from the default seed reproduce the prototype`; `runSchedule` tests. e2e: `liquidity › seen once, it runs from zero, reconciling at every update…`, `› Review Focus 3…`. Ruling (Task 11): the batch size is scaled so every run lands on exactly 420. |
| Normal CDF error < 1e-6 on [−6, 6] | Unit: `pricing.test › normCdf is within 1e-6 of the reference on [-6, 6]`. Ruling: Hart/West double precision replaces A&S 7.1.26. |
| True minus and thousands separators | Unit: `format.test` (3 tests). e2e: `diffusion › notation is STIX in the annotations and the caption, with true minus…`, `liquidity › …with true minus and no em dash` |

### 8.2 Research accuracy

| Criterion | Evidence |
|---|---|
| Every claim is in the claims register with a source | Research claims: unit `content.test › keeps the three claims at the locked register wording` and `› states the premise exactly` (these cover the research claims only). Project, exhibit and profile claims: the per-claim source tables in `docs/superpowers/specs/clearing-sources.md` (moved into git from the Task 5 report). Open confirmations for Vatsal: section 6. |
| Signal Survival, Currency Options Desk, Lending Decisions and ApexGP checked against their READMEs | `docs/superpowers/specs/clearing-sources.md`: unsupported lines were corrected or removed (for example, "100% directional risk hedged" became "~99% worst-case loss cut"; "500+ positions" was removed). All 16 project URLs return HTTP 200, but four live URLs come only from the old site's data (section 6). |
| Breakevens are never called pure inflation expectations | e2e: `research › without JavaScript every claim shows its evidence and every link is visible` asserts the rendered evidence contains "not a pure measure of expected inflation". Unit: `content.test › calls breakevens not a pure measure of expected inflation` asserts the same sentence in the breakeven body (the earlier unit test was vacuous). |

### 8.3 Accessibility (WCAG 2.2 AA)

| Criterion | Evidence |
|---|---|
| Text contrast ≥ 4.5:1 (≥ 3:1 at 24px and up) against the scene at night, research fog and morning | e2e: `acceptance › (f) contrast: …` at 1440, 1280, 768, 414, 390, 375, 360 and 320, and `(g)` without JavaScript. **This is the project's own measure, not a WCAG-defined pixel rule:** a 95th-percentile, halo-aware check (section 5, "Contrast method"). With the scene held still, each glyph's colour is compared with the pixels under and within 2px of its strokes, taken from a screenshot in which the glyphs are transparent but their text shadows are kept. A run passes when 95% of those pixels meet the ratio. **All pass.** Lowest values at 95% (two runs on each browser): night 5.06 (360) to 6.78; research 6.11 to 7.19; morning 5.01 to 5.69. **Worst single pixel, for the record:** below 4.5:1 only at night, where a lit window, the lamp's core or a one-pixel reflection highlight sits next to a stroke. Examples: "Read the research" 1.2:1 at 360 (the lamp's core); the opening line "Financial engineer…" 2.1–2.6:1 at 320–414 (lit windows; 95% figure 8+); the availability line 3.7:1 at 768; the reflection caption 4.1:1 at 1440. Elsewhere the worst pixel is 4.9–7.1 (research) and 4.9–5.6 (morning). On phones the opening screen meets the measure through the night halo (controller ruling, section 5). axe also passes at the same positions (see below). |
| Visible focus on every control (sodium outline); logical tab order; skip link | e2e: `acceptance › focus: Tab walks every control in document order, each with a visible ring` (1280 and 375); `nav › the first Tab press shows a Skip to content link…`; `nav › the skip link stays at the top of the viewport…` |
| Mobile menu is a modal dialog: focus in, trapped, back to Menu; Escape; scroll locked | e2e: `nav › the dialog fills the viewport after scrolling, traps focus and closes with Escape`, `› tapping Path closes the menu and lands on Path`. iOS touch-scroll lock: device pass. |
| Rail uses the tabs pattern; claims use `aria-expanded`/`aria-controls` | e2e: `rail › wide: tabs ›` (4 tests) and `research › claims are buttons inside level-3 headings`. **Deviation (ruling, Task 12):** below the rail's breakpoint the rail is a set of disclosures (`aria-expanded` buttons with their panels), not tabs. A tabpanel inside a tablist is invalid ARIA (axe `aria-required-children`, critical). Tests: `rail › narrow: disclosures ›` (5 tests); axe is clean at both widths. |
| Canvases and charts have text equivalents | The DiffusionWorks tree's node values are in a visually hidden table (`<caption>` plus one row per step), rendered from the same rows as the canvas so they change together. e2e: `diffusion › the tree's node values are in a visually hidden table that follows the canvas`. The convergence chart's key values (the binomial price at the selected N, Black–Scholes and their difference) are DOM annotations set on the chart (refinement R3) and the live-region sentence; only its axis tick labels are canvas-only. The market-making canvas's counters and equation are DOM text (`liquidity` tests). The research charts are SVGs with `role=img` labels and HTML captions. |
| Touch targets ≥ 44×44px | e2e: `acceptance › (d) every interactive element is at least 44x44px` at 1440, 1280, 375 and 320, with the menu open on phones and the skip link focused. No inline-link exemptions were needed (the log lists none). Fix in this task: "Path" in the top bar was 31×44. Its hit area now spans the gap (`padding-inline: 8px; margin-inline: -8px`), and no label moves. |
| Secondary text ≥ 14px | e2e: `acceptance › (c) text: …` at 320, 375, 768, 1280 and 1440. Every visible DOM text (excluding `sup`/`sub`), rendered SVG text (scaled by the viewBox) and canvas text (font size times the context scale) is ≥ 14px, except the axis tick labels, which are ≥ 12px. **Known deviation:** axis ticks (SVG `.ticks` and the convergence chart's canvas ticks) are allowed at 12px, by the Task 10 ruling (canvas node text 14px, axis ticks 12px); see section 5. Also `research › chart text renders at 14px or more…` (7 widths) and the diffusion and liquidity canvas tests. |
| No horizontal scroll at 320px | e2e: `acceptance › (b) …` (8 widths, portrait and landscape); `world › no horizontal scroll at 320 px` |
| Reduced motion honoured from the OS setting | See 8.6. |
| axe-core | e2e: `acceptance › (e) axe: no serious or critical violations at night, research and morning` at 1280 and 375. The whole page is scanned at each position, plus with the menu open at 375. Zero serious or critical issues. |

### 8.4 Responsive behaviour

| Criterion | Evidence |
|---|---|
| Verified at 320 to 1920, portrait and landscape | e2e: `acceptance › (b)` (16 sizes). Text sizes and targets: (c) and (d). Contrast: (f) at 7 widths. |
| Container-query layout; phone layout by default | `globals.css` `@container site (…)` rules. The tests at 375 and 1280 cover both sides of each switch. |
| Below 760px: Menu replaces the section links; the résumé moves into the menu | e2e: `nav › phone › Menu is shown, the section links are not`; `nav › desktop › links are shown, Menu is not…` |
| Below 980px: exhibits stack in reading order (DiffusionWorks: intro, visual, result, model inputs; ruling R3, section 5) | e2e: `diffusion › at 375px the blocks run intro, visual (tree, then chart), result, model inputs`; `liquidity › at 375px the exhibit runs intro, stage, cut…`; `research › evidence sits beside the claims at 1440 and under each claim at 375` |
| Portrait composition when the aspect ratio is < 1 | e2e: `world › Review Focus 2: resizing mid-scroll re-measures keys, labels and orientation`; `fallback › portrait viewports use the portrait set, and rotating swaps the set` |

### 8.5 Pacing

| Criterion | Evidence |
|---|---|
| Sampling every 60px at 1440×900 and 375×812, the largest band without content is ≤ 40% | e2e: `acceptance › (a) pacing: …` (step 60px). 1440×900: **303px (33.7%)** after R3 (274px, 30.4%, before). 375×812: **303px (37.3%)**. Also `chapters › pacing…` at 1280×800 and 390×844. **Ruling A (Task 12):** canvases and SVG images count as content. Text alone at 375×812 is 342px (42.1%) after R3 (390px, 48.0%, before), the DiffusionWorks tree canvas under the exhibit's question; the tree's numbers are drawn on that canvas. Visually hidden text never counts. |

### 8.6 Reduced motion and fallbacks

| Criterion | Evidence |
|---|---|
| Reduced motion: a still scene that follows scroll; no stamps, gusts, sweeps or count-ups; market-making final state at once; no smooth scroll | e2e: `world › reduced motion freezes time but the scene still follows scroll`; `chapters › the reflection count shows 512 at once under reduced motion`; `diffusion › under reduced motion there is no sweep…`; `liquidity › under reduced motion the run is instant…`; `research › under reduced motion the bars are full from the start`; `nav › under reduced motion the jump is instant`; `rail › under reduced motion the panel is scrolled into view at once` |
| No WebGL or a shader failure: five stills per orientation, ≤ 1.2 MB, loaded only when needed | e2e: `fallback ›` (7 tests, including `a normal launch with WebGL makes no request for the stills` and a real `--disable-webgl` Chromium); `world › Review Focus 1: losing the WebGL context…`; `world › the GPU watchdog drops to the stills…`. Weight: 747 KB for all ten (Task 7). |
| No JavaScript: all content readable, in document order, on a dark background | e2e: `acceptance › (g) no JavaScript: …` at 1280 and 375. It checks the five chapters in order; every text in every chapter is visible; the premise, the three claims and all three evidence blocks; all six rail projects with both links; every link; and dark background (median luminance < 0.1) with text contrast passing at the top, middle and bottom. Also `world › no JavaScript: every heading readable over the stills`, `rail › without JavaScript all six projects…`, `research › without JavaScript every claim shows its evidence…`, `liquidity › without JavaScript the page shows the final 420-trade state`, `diffusion › the default readouts are in the page without JavaScript` (now the chart annotations). Fix in this task: without JavaScript the phone Menu button could never open, so it is now hidden (`html:not(.js) .menu-btn`). Below 760px the top bar is then the name only, the sections follow in order, and the résumé is in Contact. |

### 8.7 Performance

Lighthouse 12.8.2 run against `next start -p 3100` (production build), mobile form factor with Moto G Power emulation, using Playwright's Chromium (`CHROME_PATH`, headless).

| Run | Throttling | Performance | LCP | CLS | TBT |
|---|---|---|---|---|---|
| `--preset=perf` (the plan's command), run 1 | devtools (applied) | 99 | 1.68 s | 0 | 10 ms |
| `--preset=perf`, run 2 | devtools | 99 | 1.54 s | 0 | 10 ms |
| `--preset=perf`, run 3 | devtools | 98 | 1.59 s | 0 | 69 ms |
| **Median, plan command** | | **99** | **1.59 s** | **0** | **10 ms** |
| default config, run 1 (for the record) | simulated (Lantern) | 78 | 3.63 s | 0 | 459 ms |
| default config, run 2 (for the record) | simulated | 94 | 3.07 s | 0 | 7 ms |

- **Plan command:** every target is met (≥ 90, LCP ≤ 2.5 s, CLS ≤ 0.05, TBT ≤ 200 ms).
- **Default simulated config:** LCP misses (3.1–3.6 s), and the score swings between runs (78/94). Controller ruling: recorded only, since the plan's command passes; both tables are kept.
  - The observed LCP equals FCP (0.95 s unthrottled). The LCP element is the opening line, `p.lede`.
  - The simulator lengthens it because it treats the six web-font files (about 141 KB, four preloaded) and the hydration task as LCP dependencies on simulated slow 4G.
  - Its TBT of 459 ms in run 1 is a 4× projection of a single ~130 ms load task (React hydration of the whole page plus the first scene frame). Measured with real 4× CPU throttling in Chromium, the load produces two long tasks (59 and 118 ms), about 77 ms of TBT.
  - The fonts are fixed by the spec (Geist, Geist Mono, STIX Two Text), so this is recorded rather than changed.
- INP (spec) is not a lab metric. TBT is its lab proxy here; field INP comes after the preview.

| Criterion | Evidence |
|---|---|
| Page JS ≤ 120 KB gzipped (excluding fonts) | **Target not achievable on Next 16 + React 19. Site code is 23.1 KB. Flagged to Vatsal.** (Controller ruling: accepted as a spec miss; no framework surgery.) Measured 164.9 KB. Method: fetch the page HTML, take every `/_next/static/chunks/*.js` it references, and gzip each file from `.next` at level 9. The `noModule` polyfill chunk (38.5 KB) is excluded because modern browsers don't load it. Lighthouse's transfer total for scripts agrees: 168.2 KB. The site's own code is one 23.1 KB chunk (ScrollState, World, both exhibits, rail, claims, menu). The other ~142 KB is the Next 16 and React 19 client runtime (react-dom 69 KB, the Next router and RSC client 48 KB, the rest about 25 KB). Next 16's build output no longer prints per-route sizes. |
| Fonts subset and preloaded | `next/font/google`, latin subset; 4 of 6 files preloaded (`*.p.*.woff2`). |
| One fragment shader; DPR caps 1 (scene) and 2 (UI canvases); paused when hidden; ≤ 30 fps | DPR caps: e2e `world › the scene canvas is capped at one device pixel per CSS pixel`; `diffusion › canvases are labelled images sized by CSS width with a backing store at DPR capped at 2`; `liquidity › the canvas is sized by CSS width at DPR capped at 2…`. Hidden tab: e2e `world › a hidden tab stops the scene drawing; a visible one starts it again` (sets `document.hidden`, as the liquidity test does, and reads the scene's frame counter on the test hook); `liquidity › a hidden tab pauses the run…`. **30 fps cap: code-backed only, no test** (`World.tsx`, `FRAME_MS`, in both modes). |
| Steady ≥ 30 fps on a 2020 MacBook Air and an iPhone 12; drops to stills if not | Watchdog: `world › the GPU watchdog drops to the stills…`, `› throttled requestAnimationFrame keeps the live scene`, `› one long main-thread stall keeps the live scene`. Frame rate on those devices: **device pass**. |
| Market-making and convergence ≤ 8 ms per update on mid-tier mobile | **At risk.** Task 10's offline review measured about 5–12 ms per σ or K input on desktop. The cost is the 200-tree convergence curve, recomputed on every input. **Mitigation (pre-preview):** a σ or K input now draws the chart at once against the cached curve (marker, Black–Scholes line and axes move straight away). The new curve is computed in the next animation frame, at most once per frame however many inputs arrive (e2e: `diffusion › a σ drag draws against the cached curve and recomputes it once per frame`). **Measured** in Chromium with 4× CPU throttling (CDP `Emulation.setCPUThrottlingRate`), one input per frame, 40 inputs per slider, two runs. "Input" means dispatching the input event through React's render, commit and effects; "frame" means the deferred recompute in the next frame. **Before:** σ input median 5.4 ms (max 9.9–11.9); K input 4.6–5.2 ms (max 5.7–5.8); no frame work. **After:** σ input 1.4–1.6 ms (max 4.6–5.2), plus one curve recompute of 3.9 ms (max 5.8–7.6) per frame; K input 1.2–1.6 ms (max 1.6–2.4), plus 3.7–3.8 ms (max 4.1–4.4) per frame. One input per frame costs the same in total (about 5 ms), but the input itself is 3–4× cheaper, and a fast drag (several inputs per frame) pays the curve once per frame instead of once per input. 4× throttling on this machine is not a mid-tier phone. **Device pass** (Android DevTools) still needed. |

### 8.8 Cross-browser

| Criterion | Evidence |
|---|---|
| Chrome | All e2e on Chromium (Playwright 1.65, Chromium 1254). |
| Safari (macOS and iOS) | All e2e on WebKit (Playwright WebKit 2388). Real Safari on macOS and iOS: **device pass**. |
| Firefox | **Pending.** It can't launch in this sandbox (a known environment limit since Task 6). |

## 3. Preview

- Preview URL: https://v2-clearing--v2-previews-c4e19a7b.netlify.app (a branch-alias draft on the separate preview project `v2-previews-c4e19a7b`, not the production project; never `--prod`)
- Deployed from commit: `6198800` (final pass, after Vatsal approved the visual direction on 2026-11-07).
  - YieldShock wording.
  - The share image and metadata read "Financial Engineering · Quantitative Research".
  - The 2022 loss is a numerical callout; the bar had no scale.
  - The prospectus PDF moved from `public/` to `docs/research/`: it returns 404 on the preview and is unchanged on production.
  - Full e2e: 348 passed, 4 skipped, 0 failed. Vitest: 49/49.
- Earlier: `61d5882` (refinement round 2).
- Second review (2026-11-07) fixes:
  - R6: the strip at the page end came from a flat pier slab, now a textured deck. The footer sits on the deck and reads "© 2026 Vatsal Maniar". The email no longer wraps on mobile. The Liquidity wording is no longer absolute, and the Allocation Study result is linked.
  - R7: Research is compact, with two-column finding and figure rows, no accordion, and no prospectus or "Now" note.
- Full e2e: 348 passed, 4 skipped, 0 failed.
- Earlier rounds: `3de405a` (refinement round 1). The first preview, `094b9af`, was not approved. Vatsal's review of 2026-11-07 led to four changes:
  - R1: removed every clock, time label and project date, and replaced the morning switch with a continuous warm night finish.
  - R2: copy audit.
  - R3: DiffusionWorks presentation.
  - R4: Research evidence layout.
- Command: `CLEARING_NOINDEX=1 npx netlify deploy --alias v2-clearing --site 369b1275-7215-4b09-a8e5-a3a5b8476370 --functions .netlify/functions-internal`, run after `rm -rf .next .netlify/{functions,functions-internal,edge-functions,static,deploy}`.
  - **Why `--functions`:** the Next server handler is not uploaded without it. The first two deploys returned 404 on every page route.
  - **Why the cleanup:** a stale `.next` triggers the intermittent `next/font/google` build error.
- Search engines: the preview serves `<meta name="robots" content="noindex, nofollow">` and a robots.txt that disallows everything, via the opt-in `CLEARING_NOINDEX=1` build switch. Production never sets it.
- Checked after deploy:
  - The home page, opengraph image, stills, résumé and prospectus all return 200.
  - The scene runs live (gl). DiffusionWorks reads 9.7612 against 9.9251. No console errors.
  - maniar-portfolio.netlify.app still serves V1, and the preview project's root still serves its earlier concept pages.
- Known cosmetic issue: `metadataBase` is production, so a shared preview link shows production's share image.

## 4. Real-device checklist (Vatsal)

Mark each step pass or fail, with notes. The steps are the same on every device unless a device row says otherwise.

| # | Step | iPhone Safari | Android Chrome | macOS Safari | macOS Chrome |
|---|---|---|---|---|---|
| 1 | Load the preview from cold. The night scene appears (not a flat gradient); the opening text is readable at once. | | | | |
| 2 | Scroll the whole page slowly. The scene moves from night to morning, the clock in the bar follows, and there is no jump or blank flash. | | | | |
| 3 | Rotate the phone, or resize the window, mid-page. The scene recomposes and the clock stays consistent. | | | | n/a |
| 4 | Phones: open Menu. It fills the screen, the page behind does not scroll when you drag, and Close/Escape return to the same place. Choose Research: it lands on Research. | | | n/a | n/a |
| 5 | Straight after a hard reload (before fonts settle): desktop, click each top-bar link; any device, tap "Read the research" on the opening screen. Each lands on its chapter's heading. | | | | |
| 6 | DiffusionWorks: drag each slider. The numbers and tree update and the sweep runs once after release. The "10 of 15" stamp lands once. | | | | |
| 7 | Liquidity: the run plays once on first sight and lands on −96. Press "Run it again" several times quickly: one clean run, again −96. | | | | |
| 8 | More projects: phones, tap rows (each opens under itself, one at a time); desktop, arrow keys move between tabs. | | | | |
| 9 | Research: the bars draw once as the premise comes into view; open claims 2 and 3. | | | | |
| 10 | Contact: Copy puts the email on the clipboard (or selects it). Links open in new tabs. | | | | |
| 11 | Turn on OS Reduce Motion and reload. The scene is still and changes only with scroll; no stamps or sweeps; Liquidity shows −96 at once; jumps are instant. | | | | |
| 12 | Low Power Mode (iPhone) or a backgrounded tab: the scene keeps running or falls back to the stills, never blank. | | | n/a | n/a |
| 13 | Phones, opening screen at night: review the night halo (controller ruling, section 5). The place line, availability line, "Read the research" and the reflection caption read clearly against the lamp's glow, and the halo itself does not look like a smudge. The reflection count has a slightly firmer edge. | | | n/a | n/a |
| 14 | Frame rate: the scene feels steady (≥ 30 fps). Android: DevTools performance check of a slider drag, ≤ 8 ms per update. | | | | |

## 5. Known deviations, rulings and open items

**Controller rulings for Vatsal to review on the preview**

1. **Night halo on the opening screen at phone widths (§8.3; WCAG AA is a hard requirement).**
   - **The problem.** At phone widths the night scene's lamp and its reflection sit behind the opening screen's smaller text. Measured with the halo-aware method and no halo, two items were below 4.5:1 at the 95th percentile:
     - the reflection count, at 3.3–3.7:1 (320 and 360);
     - "Read the research", at 4.25–4.4:1 (360).
     The earlier whole-box method also flagged "Read the research" at 375 (3.7–4.0:1) and the availability line at 320.
   - **The fix.** A soft night-deep (`#060A0B`) text shadow, only below 760px of site width and only while the page is not in its morning state (`html:not(.morning)`). The lamp, the scene, the layout and every text colour are unchanged.
     - **Place line, availability line, "Read the research", reflection caption:** `0 0 3px rgba(6,10,11,0.9), 0 0 8px rgba(6,10,11,0.75), 0 0 16px rgba(6,10,11,0.6)`.
     - **Reflection count** (a thin sodium digit sitting right on the reflection, where a blur alone fades within a pixel of the stroke): eight 1px offset shadows with a 1px blur, which give a 1px night-deep edge, plus `0 0 3px` ×2, `0 0 6px` and `0 0 12px rgba(6,10,11,0.8)`.
   - **Tuning.** This is the lightest of the candidates tried that passed at 320, 360, 375, 390 and 414 on both browsers over two runs:
     - The suggested `0 0 14px …0.85, 0 0 3px …0.6` left "Read the research" at 4.25–4.4:1 (360) and the count at 3.4–3.7:1.
     - The three-layer blur alone left the count at 3.8–4.3:1.
   - **Result at 95%, night, after the halo** (two runs each on Chromium and WebKit):

     | Width | Lowest | Run |
     |---|---|---|
     | 320 | 5.59:1 | count |
     | 360 | 5.06:1 | count; "Read the research" 5.05–5.7:1 |
     | 375 | 6.63:1 | "Read the research" |
     | 390 | 6.78:1 | — |
     | 414 | 6.77:1 | — |

     Desktop already passed and has no halo (1440: 5.08; 1280: 6.77).
   - **For Vatsal.** Please check this on the preview (device checklist, row 13).

2. **Page JS above 120 KB:** accepted as a spec miss; see 8.7.
3. **Default-config Lighthouse LCP:** recorded only; see 8.7.

**Recorded rulings and deviations**

- **Axis tick labels at 12px** (Task 10 ruling). Secondary text is ≥ 14px everywhere, including the canvas node values. Axis tick labels (the research charts' SVG `.ticks` and the convergence chart's canvas ticks) are allowed at 12px.
- **`useScrollState` removed** (pre-preview, M1). The plan's `useScrollState()` re-rendered the provider on every scroll and had no consumers. Progress and keys now live only in the scene bus. Consumers use `useChapter`, `useSceneActions` and `useSceneBus`.

- **DiffusionWorks presentation** (refinement R3, controller ruling after Vatsal's review of the first preview). This supersedes spec §8.4's "intro, controls, visual, readouts, formulas, result" for this exhibit.
  - **Removed:** the formula block (the CRR and Black–Scholes equations), the `N = … · u = … · d = … · p = …` line, the readout row and the standalone assumptions line.
  - **Default view carries the finding:** the tree at N = 12 with node values, then the convergence chart with its values as annotations on the chart: "Black–Scholes 9.9251" on the dashed line, "N = 12 · 9.7612" and "difference −0.1639" beside the marker, whose stroke to the dashed line draws that difference. The contract is one quiet line at the head of the chart caption ("European call · S = K = 100, σ = 20%, r = 4%, T = 1.", following σ and K).
  - **Order:** phone: intro, visual (tree, then chart), result, model inputs. Desktop: intro and result on the left; the visual on the right with the model inputs under it.
  - **Model inputs:** the same three native ranges, labels, outputs and debounced live region, in a group labelled "Model inputs" after the visuals and the result: 14px labels and values, a 2px track and 12px thumb inside a 44px-tall input. No instructions.
  - Tests: `diffusion › no formula block, no parameter readouts and no u, d or p…`, `› the model inputs are a quiet, labelled group…`, `› the annotations stay on the chart and clear of each other at 1440, 375 and 320px, for every N`.
- **Pacing counts graphics** (ruling A, Task 12). Text-only pacing at 375×812 is 42% (48% before R3): the DiffusionWorks tree canvas carries its numbers.
- **Rail on narrow screens is disclosures, not tabs** (Task 12 fix-up). The spec says "tabs pattern"; a tabpanel inside the tablist is invalid ARIA. Wide screens keep the tabs.
- **Chapter keys at the anchor landing** (Task 12 fix-up 2). Keys are measured where each anchor lands (section top minus the computed `scroll-padding-top`), so every nav or menu jump reads its chapter's own label time within 1 minute.
- **Market-making batch scaling** (Task 11). Batches are scaled so every run lands on exactly 420 trades. The prototype's wall-clock batches drifted to between 554 and 950.
- **Morning contrast fixes** (all in morning state only):
  - Task 9: the Contact time label is ink; the footer is at opacity 1 over a pale gradient; Copy has a pale fill and an ink border; link underlines are at 0.75.
  - Task 13: the Contact row labels (Email, LinkedIn, GitHub, Résumé) go from 0.8 to 0.9 opacity (they measured 4.4:1); Path role details go from fog-mid to fog (they measured 3.2–4.4:1 under the morning sky on viewports tall enough to show Path at the bottom, from 390 wide up).
- **Black–Scholes readout 9.9251, not 9.9250** (Tasks 1–4); normCdf uses Hart/West.
- **Hero height 88svh**, as in the prototype (Task 9 ruling).
- **Contrast method** (`contrastHere` in `acceptance.spec.ts`).
  1. Hold animation frames, so the scene stands still (the canvas keeps its last frame).
  2. Screenshot the page as it is (A).
  3. Make every glyph and text decoration transparent while keeping text shadows, and screenshot again (B). A transparent glyph still casts its shadow in both Chromium and WebKit (checked), so B is each glyph's backdrop with any halo composited into it.
  4. The glyph mask is where A and B differ inside each run's line boxes. The sample is that mask grown by a 2px-radius ring, read from B.
  5. A run passes when 95% of the sampled pixels reach 4.5:1 (3:1 at 24px and up) against the text colour blended at its opacity. The worst pixel is logged.

  This replaces Task 13's first method (95% of every pixel in the line box, with shadows removed), which could not see a halo.

**Fixed in Task 13**

- **Early nav clicks landing off.**
  - The problem: a top-bar or menu click made before the web fonts arrived landed 50–80px off. The smooth jump was aimed at the fallback-font layout, and the page reflowed under it. Projects is not affected, because the fixed-height opening screen sits above it; Research and Path are.
  - The fix: `src/components/site/jump.ts`. It focuses the section, calls `scrollIntoView` (instant under reduced motion) and updates the hash (push for the bar, replace for the menu). Once `document.fonts.ready` resolves, it re-aims once if the section moved and the reader hasn't scrolled, pressed a key, touched or clicked since.
  - The test: `nav › a top-bar click on {Projects, Research, Path} before the fonts arrive still lands on the chapter`. Fonts are held with `page.route` until the jump is under way. It asserts the landing is within 2px and the clock within 1 minute. It failed for Research and Path before the fix.
  - The opening screen's "See the work" and "Read the research" go through the same jump via `src/components/site/JumpLink.tsx`. This is a small client wrapper; the server-rendered anchor stays as the fallback before hydration and without JavaScript. The held-fonts test also covers "Read the research" (`nav › an opening-screen click on Read the research before the fonts arrive…`). It failed by 76px before the wrapper.
- **Tree node values as text** (§8.3): see 8.3.
- **Touch target** for "Path" in the top bar: see 8.3.
- **No-JS Menu button** hidden: see 8.6.
- **Morning contrast** for Contact labels and Path role details: see above.
- **Night halo** on the opening screen at phone widths: see the controller rulings above.
- `measurePacing` gained a `step` option (60px here) and ignores `.sr-only` text. The phone-number check in `chapters.spec.ts` now skips tables, so it doesn't read the node-value table as a phone number.

**Known minors (deferred, no action before preview)**

- **M4, stills rAF polling.** In stills mode a requestAnimationFrame loop polls the scene bus for scroll and key changes; it does nothing when nothing changed. It could listen for scroll instead.
- **M5, stills decode flash.** When the page falls back to stills, the five images decode asynchronously, so the gradient behind them can show for a moment before the first still appears.

**Fixed before preview (final whole-branch review)**

- **I1:** the convergence curve is coalesced to one recompute per frame (see 8.7).
- **M1:** no per-scroll React render (see above).
- **M3:** `preserveDrawingBuffer` is on only when the test hook sets `__CLEARING_TEST__.preserve` (world.spec does).
- **M6:** unreferenced `public/images/vatsal-maniar-2.png` deleted.
- **M7:** dead data removed: `profile.links.prospectus` and `profile.links.ssrn` (Research uses its own links), `study.school`, `study.degree` and `frm.text`. The FRM unit test now checks the pieces Path renders.
- **M8:** the breakeven unit test asserts the sentence (see 8.2).
- **M11:** without JavaScript the reflection caption reads n = 512, the converged count, matching the still behind it (`html:not(.js)` swaps in a server-rendered 512). Tests: `chapters › without JavaScript the reflection caption shows the converged count, 512` and `› with JavaScript the caption shows only the live count`.
- **M12:** `.netlify` added to `.gitignore`.
- **Hidden-tab test** for the scene (see 8.7).

**Environment notes**

- **Build flakiness.** In this worktree, `next build` (Turbopack) sometimes fails inside `next/font/google`:
  - the errors are "module-not-found" on the font CSS, or "next/font/google queries have exactly one entry";
  - the same build passes on retry with no code change;
  - it is most likely iCloud Documents sync churning `.next` (iCloud also leaves `* 2.*` duplicate files there).
  - Always `rm -rf .next` before building. Font loading was not changed.
- Firefox can't launch in this sandbox (see 8.8).
- Lighthouse runs on the developer machine against `localhost`, so network timing is simulated or throttled rather than real.

## 6. Content for Vatsal to confirm

Each item is either published as below, or changed after your answer. The sources are in `docs/superpowers/specs/clearing-sources.md`.

| # | Item | What the site does now | Confirm |
|---|---|---|---|
| a | Old experience details: "$1.5B book", "98%", "60 people", "10,000+ records" | Dropped. There was no source to check, and the prototype doesn't show them. | Keep dropped, or give a source (for example, the résumé) to bring any back |
| b | Live URLs found only in the old site's data, not in a README: Signal Survival (alpha-research.netlify.app), Currency Options Desk (fxrisklab.netlify.app), Allocation Study (pra-analytics.netlify.app), ApexGP (apexgp-markets.netlify.app, repo `VM25/apexgp-markets`) | Linked. All return HTTP 200. | That each URL is the right one. ApexGP's README says it is deployed on **Vercel**, so confirm the Netlify URL and the repo name. |
| c | ApexGP "24 races replayed" | Shown. The 24 comes from counting the 24 round files in `public/data/official`, not from a README line. | That 24 is right |
| d | DiffusionWorks: "resolved as wrong at 23 of 24 up-barrier cells" | "Wrong", the source's word (BARRIER-MONITORING-METHODOLOGY.md line 397). Spec §6.1 says "off (over-predicting)". | Wording: "wrong" or "off" |
| e | Lending Decisions: "models marked Monitor" | "Marked Monitor", the README's verdict label. The prototype said "marked for monitoring". | Wording |
| f | Spec §13 author calls | No phone number shown; metadata, Open Graph image and description rewritten to the copy rules; old sections, instruments and data deleted on this branch; fallback stills checked into `public/scene/`; the prototype's controls panel is not part of the site. | Each call |

## 7. Production release (authorized in writing by Vatsal, 2026-11-07)

**Pre-merge verification on `v2-clearing`:**
- `tsc` clean, `eslint` clean.
- vitest 49/49.
- `next build` passes; every route is static.
- Playwright on Chromium and WebKit: 348 passed, 4 skipped (Chromium-only checks), 0 failed.
- Firefox is pending; it cannot launch in the build sandbox. Vatsal completed the real-device checks.

**Release-only change.** A canonical link and `og:url` now point to https://maniar-portfolio.netlify.app. V1 had neither. There is no visible change.

**Production configuration:**
- The `maniar-portfolio` project (site `29f2bbb5-b290-41a6-9dd3-e848321f757c`) builds from GitHub `main` through Netlify CI with `npm run build` and the Next.js runtime.
- It has no environment variables, so `CLEARING_NOINDEX` is unset and production renders `index, follow`.
- robots.txt allows crawling and points to the production sitemap.

**V1 preserved:**
- Git tag `v1-final` at `c99b13a`, pushed to GitHub.
- Netlify production deploy `6aee4adcdba4fc908b4d3ee0`, published 2026-11-06 21:47:49 UTC, stays in the deploy history as a rollback point.

## 8. Release record

**Release:**
- Merge commit `803c826c785232397bea42890b672e187a916713` on `main`. Its parents are V1 `c99b13a` and the approved branch tip `f27649e`. The merged tree is identical to the approved branch.
- `main` and `v2-clearing` were pushed to GitHub (`VM25/vatsal-portfolio`) with no force push.
- V1 is preserved as tag `v1-final` at `c99b13a`.

**Production deploy:**
- Project `maniar-portfolio` (site `29f2bbb5-b290-41a6-9dd3-e848321f757c`), built by Netlify CI from `main`.
- Deploy `6aef87f4a19b0e91b27144cd`: state ready, published 2026-11-07T20:20:44.496Z.
- The Next.js server handler is deployed with its `/*` route.
- The first CI build of `803c826` (deploy `6aef870cac43d707a68955ba`) failed. Netlify restored the V1 `.next` cache, and Turbopack's `next/font/google` failed on it with "queries have exactly one entry".
  - The production site stayed on V1 throughout.
  - Fix: the same commit was rebuilt with the build cache cleared (`createSiteBuild` with `clear_cache: true`). No code changed.

**V1 rollback point:**
- Netlify deploy `6aee4adcdba4fc908b4d3ee0` (commit `c99b13a`, published 2026-11-06 21:47:49 UTC) remains in the deploy history and can be republished from the Netlify UI.
- Git tag `v1-final` holds its code.

**Production verification, 2026-11-07, on the live URL:**
- **HTTP:** `/` returns 200 with V2. `meta robots` is `index, follow`. Canonical and `og:url` are https://maniar-portfolio.netlify.app. `og:image` and `twitter:image` serve `/opengraph-image` (200, image/png) from production.
- **robots.txt and sitemap:** robots.txt allows crawling and points to the production sitemap, and the sitemap lists the production URL.
- **Assets:** the stills, résumé, photo and favicon return 200. The prospectus returns 404, unpublished as instructed. Unknown paths return 404.
- **Browser checks:** Playwright ran Chromium and WebKit at 1440×900 and 390×844, 105 of 110 checks. They covered:
  - all five sections
  - the V2 copy
  - Research figures 0.66, 0.48, ≈ −19% and the breakeven definition
  - DiffusionWorks ArrowRight to N = 13, giving 10.0665
  - the Liquidity run ending at `+420 − 476 − 40 = −96`
  - the mailto link and Copy writing the email (Chromium)
  - the footer reading "© 2026 Vatsal Maniar"
  - no failed same-origin requests
  - every project, GitHub and résumé link returning 200; LinkedIn returns its 999 bot wall
  - screenshots matching the approved preview, with the deck and footer continuous at the page end
- **Exceptions:**
  1. **React hydration error #418 on every production load.** Netlify injects an HTML comment into `<head>` on published production deploys ("This site is hosted on Netlify … utm_source=ai-legible"), on every site in the account. React finds a node it did not render, logs #418 and re-renders the page on the client. The preview alias and local builds don't get the comment and show no error. The page renders and every functional check passes. There is no code cause, and Netlify documents no setting to disable it. Raising it with Netlify support is the clean fix.
  2. **SSRN link:** SSRN answers automated browsers with 403 "Content Blocked", so this link can't be verified automatically. It is the same URL V1 used.
  3. **Firefox** was not run in the build sandbox. Vatsal's real-device checks cover the rest.

## 9. Post-release: self-hosted fonts (2026-11-07)

At Vatsal's request, Geist, Geist Mono and STIX Two Text are bundled in `src/app/fonts` and loaded with `next/font/local`, so builds no longer download from Google Fonts.

**The fonts:**
- Each family's variable font, limited to the weights the site already used (Geist 200–500; Geist Mono and STIX 400–500).
- Subset to Latin, Latin Extended, Greek, punctuation and math. Geist omits arrows, so ↗ uses the system font as before.
- Total 288 KB. Licences: SIL OFL 1.1, included.

**Release:** commits `846158e` and `41f0621`, fast-forwarded to `main`. Netlify production deploy `6aef9ed495e27733af382205` was published 2026-11-07T21:58:11Z. The first build succeeded with the cache restored.

**Verified on the live site:**
- Chromium and WebKit load fonts only from maniar-portfolio.netlify.app, with no Google requests.
- All 413 text elements at 1440 and 390 lay out identically to the approved preview, within 0.5px.
- `index, follow` is unchanged.
- Builds pass clean and over an existing `.next`.
- Unit tests: 49/49. Browser suite: 348 passed, 0 failed.
