---
name: Vatsal Maniar — Portfolio
description: A scroll-driven, pinned-cinematic quant-dossier portfolio.
colors:
  base: "#0e0d0b"
  base-2: "#090807"
  surface: "#161410"
  surface-2: "#1e1b15"
  ink: "#efe9dd"
  ink-dim: "#c2b9a6"
  ink-faint: "#8c8472"
  line: "#efe9dd17"
  line-strong: "#efe9dd2b"
  brass: "#c6a45c"
  brass-bright: "#dcc081"
  brass-deep: "#9a7d3f"
  up: "#6aa87f"
  down: "#c5604f"
typography:
  display:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "clamp(3.2rem, 9vw, 7.5rem)"
    fontWeight: 600
    lineHeight: 0.86
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "clamp(2.2rem, 5vw, 3.6rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.1
  body:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.66rem"
    fontWeight: 500
    letterSpacing: "0.18em"
rounded:
  sm: "3px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-solid:
    backgroundColor: "{colors.brass}"
    textColor: "#1a1408"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-solid-hover:
    backgroundColor: "{colors.brass-bright}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-dim}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  role-tab-selected:
    backgroundColor: "#c6a45c12"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Design System: Vatsal Maniar — Portfolio

## 1. Overview

**Creative North Star: "Institutional Quant Dossier + Trading-System Interface"**

The portfolio reads like moving through a desk's own infrastructure — a quant
research dossier that behaves like a trading terminal. **Normal vertical wheel /
trackpad scrolling** drives a sequence of **pinned, full-screen cinematic
chapters** (entry → academic origin → capability → project engines → execution
record → research direction → signal). While a chapter is pinned, scroll
progress scrubs its internal timeline: panels assemble, instruments draw on,
text reveals, the composition recomposes **in place**. It is emphatically **not**
a horizontal corridor, a sideways carousel, or a deck of slides.

The surface is a warm graphite ink field with a faint filmic grain and a single
muted **brass** signal that earns its rare appearances. Density is controlled.
Type does the heavy lifting across three voices — an institutional **serif** for
dossier titles, a clean **grotesque** for body, and a technical **mono** for
data and labels. Color is mostly absent so the brass accent and the market
green/red read as meaningful. Every finance object is a crisp DOM/SVG instrument
(event book, Greeks desk, efficient frontier, rates curve + Monte-Carlo VaR)
tied to a specific project; if an object can't be explained in one sentence, it
is cut.

This system explicitly rejects: a horizontal scroll-corridor / carousel /
slideshow; astronomy / particle-field visuals; cyberpunk and neon; crypto
landing-page aesthetics; generic SaaS marketing, dark-mode templates, and gaming
UIs; the normal vertical-scroll card portfolio; the retired warm amber + serif
editorial look; and fake Bloomberg-style dashboards or fabricated metrics.

**Key Characteristics:**
- Vertical scroll → pinned full-screen chapters with internal cinematic timelines.
- Warm graphite ("ink") control surface; filmic grain, no dominant grid.
- One restrained Brass accent; market green/red for data + risk only.
- Three voices: Spectral (serif display) · Schibsted Grotesk (body) · JetBrains Mono (data).
- Crisp DOM/SVG finance instruments, one per project engine — never decorative.
- Machined, hairline-on-glass panels; motion mostly on scroll + state.

## 2. Colors

A near-monochrome warm graphite field where a single brass signal and market
green/red carry the meaning.

### Primary
- **Brass** (`#c6a45c`): the lone identity accent. Interactive/active states
  (selected tab, scene-nav active, drawn timeline/edges), the emphasized word in
  a heading (solid brass, never a gradient), instrument key marks, and the brass
  solid button. Brass-bright (`#dcc081`) on hover; brass-deep (`#9a7d3f`) for
  pressed/low states. Used on a small fraction of any view on purpose.

### Secondary — market-data + risk semantics only
- **Up Green** (`#6aa87f`): bids / positive / "open" status.
- **Down Red** (`#c5604f`): asks / negative / risk emphasis.

### Neutral
- **Base** (`#0e0d0b`) / **Base-2** (`#090807`): the body field; warm near-black.
- **Surface** (`#161410`) / **Surface-2** (`#1e1b15`): raised machined panels.
- **Ink** (`#efe9dd`): primary text; warm paper-white, not pure white.
- **Ink-dim** (`#c2b9a6`): secondary text and lead copy (clears 4.5:1 on base).
- **Ink-faint** (`#8c8472`): labels, metadata, captions only (never body).
- **Line** / **Line-strong**: warm white at low alpha for hairlines and dividers.

### Named Rules
**The One Signal Rule.** Brass covers ≤10% of any view. Its rarity is what makes
a selected tab or an emphasized heading word read as meaningful.

**The Data-Only Rule.** Green and red appear *only* where they encode market data
or risk (book side, P&L direction, VaR tail, status). Never as decorative accents.

## 3. Typography

**Display Font:** Spectral (institutional serif — the "dossier voice")
**Body / UI Font:** Schibsted Grotesk (clean grotesque — the "institutional voice")
**Data / Label Font:** JetBrains Mono (technical mono — the "terminal voice")

**Character:** A three-voice system on three contrast axes — serif / sans / mono.
The serif gives editorial, research-paper gravitas to scene titles; the grotesque
keeps body and UI clean and modern; the mono handles tickers, readouts, indices,
and metadata like a trading terminal.

### Hierarchy
- **Display** (Spectral 600, `clamp(3.2rem, 9vw, 7.5rem)`, lh 0.86, -0.02em):
  scene names ("Vatsal / Maniar") and large scene headings; brass emphasis word.
- **Headline** (Spectral 600, `clamp(2.2rem, 5vw, 3.6rem)`, 1.02): per-scene H2s.
- **Title** (Spectral 500, 1.5rem): panel titles, project/role names.
- **Body** (Schibsted Grotesk 400, 1rem, 1.6): lead and supporting copy; ~65ch.
- **Label** (JetBrains Mono 500, 0.66rem, 0.18em, UPPERCASE): indices, eyebrows,
  metadata, instrument readouts, button micro-labels. Mono only.

### Named Rules
**The Mono-for-Data Rule.** JetBrains Mono is for short labels, indices, and
instrument numbers — never sentences or body copy. Caps used selectively, not
on every micro-string.

**The Three-Voice Rule.** Spectral / Schibsted Grotesk / JetBrains Mono, one role
each. No fourth family. Emphasis is solid brass, never gradient text.

## 4. Elevation

Flat by default with tonal, machined layering. Depth comes from the warm filmic
field, translucent surfaces, and hairline borders — not stacked drop shadows.
Panels read like machined instrument faces: a faint top-light gradient over a
translucent surface, a 1px line border, and one soft far drop shadow.

### Shadow Vocabulary
- **Panel lift** (`inset 0 1px 0 rgba(239,233,221,0.05), 0 30px 64px -36px rgba(0,0,0,0.95)`):
  the only shadow; a soft inset top highlight plus a deep, diffuse drop.

### Named Rules
**The Tonal-First Rule.** Convey depth with tonal layering and hairline-on-glass,
not heavy shadows. One soft shadow per panel.

## 5. Components

Refined and restrained: machined surfaces, hairline borders, mono micro-labels,
motion on scroll + state. Nothing shouts.

### Buttons
- **Shape:** full pill (`9999px`).
- **Solid (primary):** Brass fill (`#c6a45c`) with near-black ink (`#1a1408`);
  hover lightens to brass-bright and lifts 2px.
- **Outline:** transparent, `line-strong` border, Ink text; hover → brass border + text.
- **Ghost:** transparent, Ink-dim text, no border; hover → Ink.

### Panels
- **Corner Style:** 6–8px (sharper than SaaS rounding; instrument-like).
- **Background:** machined glass over Surface (`#161410`).
- **Border:** 1px `line`; emphasized panels add a faint brass ring.
- **Internal Padding:** 24px, tightening to 16px on dense instrument panels.

### Navigation
- **Chapter index:** a fixed, bottom-center pill of mono labels (Entry, Origin,
  Capability, Engines, Record, Research, Signal). The active chapter (the one
  crossing viewport center) shows a brass dot + label; clicking jumps to it.
  Orientation only — the experience is scroll-driven, not click-through.
- Top-left "VM · Vatsal Maniar" wordmark; top-right Résumé pill; a small
  "Open · 2026" status. Hidden / simplified on narrow viewports.

### Role Tabs (Experience selector)
- A correct ARIA `tablist`: roving `tabindex`, Arrow/Home/End keys, visible brass
  selected state, reliable detail-panel update, horizontal scroll rail on mobile.
  Every role is selectable and keyboard-operable.

### Finance Instruments (one per project engine)
- **EventLadder** (ApexGP): event-market depth book — implied-probability bids/asks
  around a brass mark, with portfolio/single-name risk caps.
- **GreeksDesk** (FX market-making): two-sided quote + net Δ/Γ/V/Θ within limits + vol smile.
- **EfficientFrontier** (Portfolio): risk/return scatter, frontier, max-Sharpe point, factor β.
- **RatesEngine** (Pricing): bootstrapped UST curve + Monte-Carlo VaR fan with a 99% tail mark.
- Crisp SVG, draw-on with scroll/selection, market green/red only on data.

### Signature: Pinned Cinematic Chapters + Engine Inspector
- **Chapter pin:** each chapter is a tall `<section>` with a `position: sticky`
  stage; its internal `scrollYProgress` (Framer Motion `useScroll`) scrubs the
  scene — panels assemble, instruments draw, text reveals, depth drifts. CSS
  sticky, not horizontal translation. Narrow / reduced-motion degrade to an
  accessible, fully-readable stacked layout.
- **Engine inspector (Projects):** a left rail of four engines and a stage that
  reconfigures around the selected one — its distinct instrument activates and its
  case file loads in place; the others recede. No separate modal; the rail is the
  system view, the stage is the focused engine.

## 6. Do's and Don'ts

### Do:
- **Do** drive everything from vertical scroll into pinned chapters; recompose in place.
- **Do** keep the field warm graphite (`#0e0d0b`); carry identity through type + brass.
- **Do** hold body text at Ink-dim (`#c2b9a6`) or brighter (≥4.5:1); Ink-faint for labels only.
- **Do** spend Brass sparingly (≤10%) and reserve green/red for real data/risk.
- **Do** give each project engine its own justifiable instrument; cut anything unexplained.
- **Do** ship reduced-motion + mobile fallbacks; the stacked layout must read on its own.

### Don't:
- **Don't** build a horizontal corridor, sideways carousel, or slide deck.
- **Don't** leave a scene as "centered heading + a grid of identical cards".
- **Don't** reintroduce cyan/teal, neon, crypto, SaaS-dashboard, or gaming aesthetics.
- **Don't** reintroduce the retired warm amber + serif editorial look.
- **Don't** gradient text; emphasis is solid brass, one word per heading.
- **Don't** add decorative shapes, particles, or abstract wireframes with no finance meaning.
- **Don't** fabricate metrics or build fake Bloomberg dashboards.
