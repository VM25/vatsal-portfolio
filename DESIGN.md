---
name: Vatsal Maniar — portfolio
description: A scroll-driven journey through six 3D worlds. Big Shoulders + B612, full brand palette, dark.
---

# Design notes

## Shape

Not a page with sections — a route. One camera on a fixed spline through six
environments, driven by scroll. The path deliberately changes character at every
stage: a straight push in, a lateral drift, a diagonal fall, a long travelling
shot, a climb, then a push into open space. Movement never settles into one
direction.

| # | World | What it is |
|---|---|---|
| 01 | Approach | Dust, and the portrait hanging in it |
| 02 | Origin | Four markers strung along the route actually taken |
| 03 | Foundation | Nested wireframe shells and a floor grid — structure |
| 04 | The Work | Seven monoliths, viewed as a skyline |
| 05 | The Question | One form, alone, lit hot |
| 06 | Arrival | A ring, then space |

Each world declares a focal point. The camera aims at a blend of "further along
the path" and "the subject of this chapter", so travel reads as travel while the
subject stays framed. Aiming purely down the path leaves the hero object
drifting past in the periphery.

## Colour

All eighteen brand colours are in use, in the 3D scene *and* in the interface —
as fog, grounds, lights, materials, surfaces and type. Each world owns a slice
of the palette (ground / fog / key / fill / accent), and `--here` follows the
camera so the interface accent changes as you travel.

Two source values were corrected on request: Yoghurt is now `#FFECC3`, Navy is
`#092634`.

## Type

- **Big Shoulders** — chapter titles and the name. Extremely condensed and very
  tall; at full-screen sizes it reads as architecture rather than text.
- **B612** — reading text. Drawn by Airbus for cockpit displays, so it was made
  to stay legible on a lit surface that is moving, which is this whole page.
- **B612 Mono** — readouts, coordinates, figures.

## Motion

- three.js for the worlds, GSAP ScrollTrigger for per-chapter parallax,
  scrollama for chapter arrival, framer-motion for content entrance and the
  disclosure panels.
- Camera progress is read straight off scroll offset, throttled to a frame, and
  damped — damping is what turns a scrollbar into a camera.
- Chapter titles arrive letter by letter.
- `prefers-reduced-motion` removes the damping, the pointer parallax and the
  idle drift, leaving the route navigable without movement.

## Structure

Detail stays behind a click. Work and experience rows show a name and a field;
descriptions, figures and links only exist once opened.

## Known

Safari/Chrome parity has not been addressed — deferred by agreement. The scene
is not yet tuned for low-power GPUs.
