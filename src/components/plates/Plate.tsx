import type { ReactNode } from "react";

/**
 * A figure, set the way a journal sets one: rule above, number and caption
 * below. Every plate on this site is drawn from its system's own committed
 * output, so the caption always names what the reader is looking at and says
 * plainly when a shape is schematic rather than measured.
 *
 * The reveal class lands on the wrapper; the SVG's own `data-draw` / `data-grow`
 * children key off it, so a plate animates as one figure rather than in pieces.
 */
export function Plate({
  n,
  caption,
  children,
}: {
  n: number;
  caption: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className="plate m-0" data-reveal="fade">
      <div className="plate__frame">{children}</div>
      <figcaption className="plate__caption">
        <b>Plate {n}</b>
        {caption}
      </figcaption>
    </figure>
  );
}
