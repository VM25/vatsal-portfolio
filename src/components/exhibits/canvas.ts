/** Canvas helpers shared by the exhibits. */

/** Fill "{name}" slots in a copy template. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/**
 * Size a canvas's backing store to its CSS width at the device pixel ratio, capped at 2,
 * and return a context drawing in CSS pixels.
 */
export function sizeCanvas(c: HTMLCanvasElement, h: number) {
  const w = c.clientWidth || 600;
  const pr = Math.min(2, window.devicePixelRatio || 1);
  const bw = Math.round(w * pr);
  const bh = Math.round(h * pr);
  if (c.width !== bw) c.width = bw;
  if (c.height !== bh) c.height = bh;
  const g = c.getContext("2d")!;
  g.setTransform(pr, 0, 0, pr, 0, 0);
  return { g, w, h };
}

/** The page's font stacks (next/font sets hashed family names behind the CSS variables). */
export function readFonts(el: Element) {
  const cs = getComputedStyle(el);
  return {
    mono: cs.getPropertyValue("--font-num").trim() || "monospace",
    sans: cs.getPropertyValue("--font-world").trim() || "sans-serif",
  };
}
