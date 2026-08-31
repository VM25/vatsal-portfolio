---
name: Vatsal Maniar — portfolio
description: Dark, type-led personal site. Near-black ground, one saffron accent, detail behind a click.
---

# Design notes

Derived from the `ui-ux-pro-max` design-system search and the
`design-motion-principles` create workflow, not from taste alone.

- **Pattern** — Portfolio Grid / storytelling order: hero, work, about, writing,
  experience, contact.
- **Style** — Dark Mode (OLED) crossed with Exaggerated Minimalism. Type is the
  hero; everything else defers to it.
- **Motion weighting** — Creative portfolio → Jakub Krehel primary, Jhey
  Tompkins secondary. Production polish over spectacle.

The skill's Dark Mode entry also suggests neon accents and its Cyberpunk variant
suggests a terminal look. Both are explicitly out of scope for this project and
were not used.

## Colour

Fixed brand palette, mapped to roles. Nothing outside this list appears anywhere.

| Role | Colour | Hex |
|---|---|---|
| Ground | Onyx | `#020202` |
| Raised surface | Noir Black | `#1B1716` |
| Primary text | Praxeti White | `#F6F7ED` |
| Secondary text | Morning Snow, mixed | `#ECECDC` |
| Cool text | Aqua Mist, mixed | `#A0C9CB` |
| Accent | Deep Saffron | `#FF9932` |
| Accent, pressed | Toxic Orange | `#FF6037` |
| Edges | Nocturnal, mixed | `#114C5A` |

One accent, used sparingly — the style rule calls for a single accent and
nothing else competing with it.

**Contrast is solved, not guessed.** Every tier was measured against the ground:
primary text 19.2:1, secondary 8.0:1, cool 6.2:1, dimmest tier 4.7:1, accent
9.7:1. No text on the page falls below 4.5:1.

Two brand values could not be used as given and are worth fixing at source:
`#F5R9CE` (Yoghurt) is not a valid colour — `R` is not a hex digit — and
`#0923634` (Navy Blue) has seven digits, so it was read as `#092363`. Neither is
currently load-bearing.

## Type

| Role | Face | Notes |
|---|---|---|
| Everything structural | **Inter** | Variable. 800 for the name, 650–700 for headings. |
| Labels, figures, dates | **JetBrains Mono** | 400 and 500. |
| Pull quote | **Fraunces Italic** | Appears exactly twice on the page, by design. |

Scale: 12 label · 16 body · 22 sub · 32 section · 40 h2 · 56 h1 · 72+ hero.
The name holds at roughly 5× body size at every width.

## Motion

- Enter is opacity + a 10px lift + a 4px blur — the element materialises rather
  than fades. One shared observer flips it on; nothing runs per frame.
- Opening a row takes 420ms; closing takes 260ms. Once you have decided to close
  something, waiting for it is friction.
- Only `transform`, `opacity` and `filter` animate. The one exception is the
  disclosure panel's `grid-template-rows`, which is the only way to reveal
  content of unknown height.
- Hover transitions are 180ms. Nothing loops, nothing pulses, nothing parallaxes.
- `prefers-reduced-motion` removes all of it, and a `noscript` block reveals the
  page for anyone without scripting.

## Structure

Detail is hidden until asked for. Work and experience rows show a name and a
field; the description, numbers and links only exist once the row is opened. No
project or role is described twice anywhere on the page.

## Budget

First-load JS ~182 KB gzipped (the framework floor — application code is
negligible), CSS ~7 KB, three font files ~100 KB. Dependencies: `next`, `react`,
`react-dom`. No animation library, no WebGL, no charting library.
