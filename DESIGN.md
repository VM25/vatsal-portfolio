---
name: Vatsal Maniar — The Record
description: A published research record. Off-white stock, navy ink, petrol structure, one rationed orange.
colors:
  paper: "#F9F9F9"
  ink: "#092363"
  rule: "#004E72"
  signal: "#FF6342"
---

# The Record

The site is set as a **published research record**, not a landing page. Numbered
sections, hanging marginalia, hairline rules, and figures with plate numbers and
captions. The content earned that form: these are labs with findings, two of
which honestly report negative results, and the design exists to put those
findings first.

## Palette

Four colours, strictly. Every other tone is a `color-mix()` of these four with
the stock, so the palette cannot drift.

| Token | Value | Job |
|---|---|---|
| `--paper` | `#F9F9F9` | the stock |
| `--ink` | `#092363` | navy — display type and body text. Navy *is* the black here (13.9:1). |
| `--rule` | `#004E72` | petrol — rules, keylines, chart strokes, metadata |
| `--signal` | `#FF6342` | orange — **rationed**, and split by job (below) |

### Contrast is solved, not guessed

Every text tier was measured against the stock and lands at or above 4.5:1.
Hierarchy is carried by size, case, and hue — never by fading text until it
stops being readable.

| Token | Ratio | Use |
|---|---|---|
| `--ink-90` | 10.6:1 | headings, emphasis |
| `--ink-70` | 5.99:1 | body prose |
| `--ink-55` | 4.97:1 | secondary text, captions, labels |
| `--ink-38` | 4.58:1 | metadata — petrol-tinted, so it reads as a different *role* rather than a fainter one |
| `--rule-70` | 4.93:1 | links, secondary structure |

**Orange is split by job.** Pure `#FF6342` on this stock is only 2.8:1, so it is
a *graphic* colour — it fills bars, dots, ticks, and rules, where it is a shape
rather than something to be read. Signal-coloured **text** uses two derivations,
both mixed toward the navy so the palette gains no fifth hue:

- `--signal-display` — 3.42:1, accent set at display sizes (AA-large)
- `--signal-ink` — 4.73:1, every other piece of signal-coloured text

Ration test: if orange is everywhere it is worthless. It should appear roughly
eight times per screen.

## Type

| Role | Face | Notes |
|---|---|---|
| Display | **Instrument Serif** | 400 + true italic. The italic is its only emphasis. |
| Text / UI | **Archivo** | Variable, so 550 and 650 subhead weights are real instances. |
| Data | **IBM Plex Mono** | 400 + 600. Every figure, ticker, DV01, plate number. |

## Motion

One vocabulary, and the reason Safari and Chrome match:

1. **`transform`, `opacity`, and `clip-path` only.** Never a layout property.
2. **One IntersectionObserver for the whole page**, in `useReveal`, unobserving
   each element after it fires. No scroll listener, no rAF loop.
3. **No sticky pinning anywhere.** This is the single biggest cross-browser win —
   pinned/stacked panels were the previous build's main divergence.
4. Vocabulary: `rise`, `fade`, `wipe`, `rule` (hairlines drawing themselves),
   plus `data-draw` / `data-grow` / `data-pop` inside plates. Stagger comes from
   a `--i` custom property.
5. `prefers-reduced-motion` collapses everything to instant opacity.
6. A `<noscript>` block reveals everything, so the record is readable with
   scripting off.

**No animation library and no WebGL.** Dependencies are `next`, `react`, and
`react-dom` — nothing else.

## Plates

The signature element. Each system publishes one figure drawn from its own
committed output, set like a journal figure: rule above, number and caption
below, petrol strokes, orange marking the finding.

The caption is part of the evidence. Where a figure illustrates a *mechanism*
rather than plotting a measured series — the delta profile, the contract ladder,
the correlation path — the caption says so and names which numbers on it are
computed. Nothing is presented as measured that is not.

## Budget

- First-load JS: ~187 KB gzipped — the React 19 + Next 16 floor. Application
  code is negligible.
- CSS: ~8 KB gzipped. Fonts: 5 files, ~84 KB.
- Every route prerenders as static content.
