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

Contact carries a Web3Forms form. The access key is a public per-form identifier
designed to sit in client-side code — it cannot read anything back.

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

**One field, fixed to the viewport.** Sections used to each paint their own
radial wash, which drew a hard rectangle around every one of them. Replacing that
with a single absolutely-positioned field only moved the problem: an absolutely
positioned element with no positioned ancestor is sized by the *initial
containing block*, so it ended after exactly one screen and left a hard seam
across the document — one that moved as you zoomed, because the viewport height
in CSS pixels moves too.

The field is now `position: fixed`, so it always covers the viewport and can
never band at a boundary. Colour comes from five very large, very soft blooms
inside it. They drift and cross-fade against scroll progress (`--sp`, written to
the root from JS), carrying the page from cool at the top to warm further down.
That drift *is* the transition between sections — one continuous surface changing
under continuous content.

It is deliberately restrained — mixes in the 5–22% range. At that strength colour
registers as depth rather than as decoration, which is the difference between
looking considered and looking like a theme. Saturated glows read as a game.

Accent colour is reserved for things that *mean* something: the selected project,
a card under the pointer, a button, a finding. Garnet appears only as a 26% hint
in one accent.

No background grid, no pattern, no texture overlay.

The portrait is the photograph as taken — no duotone, no screen, no filter.

## Scale

Sized so every section fits a real 1440×900 window at 100% zoom. The earlier
scale had been tuned by eye at a zoomed-out viewport and was roughly 20% too
large everywhere. Measured section heights now run 725–896px.

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
