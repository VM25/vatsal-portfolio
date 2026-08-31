---
name: Vatsal Maniar — portfolio
description: Dark, dense, engineered. No 3D. The work section is a rail and an instrument stage.
---

# Design notes

## Shape

Flat markup and CSS. No canvas, no 3D. What carries it is type scale, a
per-project identity colour, and motion that reacts to pointer and scroll.

Section order follows importance, not chronology: the projects and the paper
carry the site, so they come first.

hero → **projects** → **research** → background → experience → contact

## The projects section

The centre of the site, and built on the structure that worked before: a rail of
seven on the left, one stage on the right.

Choosing a project repaints the whole stage from a single `--accent`, so the
instrument, the figures, the buttons and the rail marker all change together —
switching reads as changing instrument rather than swapping text.

Each project draws its own **instrument**: a small SVG built from that project's
actual result, not stock chart furniture. The 2022 attribution waterfall, the
signal-survival ranking, the fifteen experiment cells, the delta profile before
and after hedging, model discrimination against no-skill, the reactive-rule
comparison, the implied-probability book. The number that matters is called out
in the accent.

The stage is keyed on the project with **no exit animation**. `mode="wait"`
holds the old panel until its exit finishes, and if that ever stalls the stage
silently stops updating.

## Colour

All eighteen brand colours are in use. Seven of them become per-project identity
colours, mixed from the palette so nothing new enters it. Every text tier was
measured against its own background: no text on the page is below 4.5:1.

## Type

Big Shoulders for every heading — condensed, uppercase, architectural. Set at
600, not 800: at heavy weights the counters close up and it reads as a slab.
Leading stays at or above 0.95 — Big Shoulders has unusually tall caps and
anything tighter makes stacked lines collide.

B612 and B612 Mono for reading and figures, drawn for cockpit displays.

## Motion

- Reveal on scroll: one shared observer, opacity and transform only.
- Cards light their own surface where the pointer is (`--mx` / `--my` written
  from JS, the gradient is CSS).
- Figures count up when they first come into view, with a timer that guarantees
  they land on the real number even if the tab is backgrounded mid-count.
- GSAP drifts each `.sec-head` block slightly slower than the page. The block
  moves as one unit — drifting the heading alone slid it up under its own
  eyebrow label.
- The route line draws itself on scrub as the background section passes, and
  each stop lights as the line reaches it. Transform and opacity only.
- Scrollama drives the nav's current-section state.
- A running band of disciplines under the hero — the only ambient motion, and it
  pauses when you point at it.
- `prefers-reduced-motion` removes all of it.

## Colour

The page is dark but not black. Every section carries its own accent, and the
header of each sits in a soft radial wash of it; the hero has two colour fields
of its own. In the projects section the wash follows whichever project is
selected. Garnet is muddy at full strength and appears only as a 26% hint in one
accent.

The portrait is the photograph as taken — no duotone, no screen, no filter.

## Traps worth remembering

**Element resets must live inside `@layer base`.** Unlayered CSS beats anything
in `@layer utilities` regardless of specificity, so a bare `button { padding: 0 }`
outside a layer silently cancels every Tailwind padding utility on every button
in the app.

**`last:` matches per parent, not per list.** `last:mb-0` on an element that is
the only child of its own wrapper always matches, so the margin is always zero.
Space the wrappers instead.

**A grid stretches its rows** to the height set by the tallest sibling column.
For a short stack of paragraphs next to a tall column, use flex.
