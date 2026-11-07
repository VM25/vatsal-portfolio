import type { Page } from "@playwright/test";
import { CHAPTERS, keysFromLayout } from "../../src/lib/scene";

/**
 * The chapter keys as ScrollState measures them: the live layout's section tops,
 * computed scroll-padding-top and scrollable height, through the same keysFromLayout.
 */
export async function measuredKeys(page: Page): Promise<number[]> {
  const { tops, pad, max } = await page.evaluate((order) => {
    const tops = order.map(
      (id) => (document.querySelector(`[data-sec="${id}"]`) as HTMLElement).getBoundingClientRect().top + window.scrollY,
    );
    return {
      tops,
      pad: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0,
      max: document.documentElement.scrollHeight - window.innerHeight,
    };
  }, CHAPTERS as string[]);
  const ks = keysFromLayout(tops, pad, max);
  if (!ks) throw new Error("the page cannot scroll, so it has no measured keys");
  return ks;
}

export type PacingResult = {
  /** Tallest vertical band, in px, with no qualifying text, over all scroll steps. */
  largestGap: number;
  viewport: number;
  /** Scroll position where the largest gap was seen. */
  gapAt: number;
  /** Scroll positions at which no qualifying text was in view. */
  textFree: number[];
};

/**
 * Pacing helper. Scrolls from the top of `fromId` to the end of `toId` in steps of 10% of the
 * viewport. Qualifying text is any visible text node (outside the top bar and the menu dialog; aria-hidden text still counts, because pacing is visual) with non-empty text, in a block at least `minHeight` px tall (default 20: a one-line 14 to 15px paragraph measures 21 to 22px, so 24 would wrongly discard captions),
 * inside the viewport, with computed opacity above 0, visibility visible, and not inside
 * the excluded containers. At each step it measures the largest vertical band of the viewport that
 * holds no qualifying text. Assert `largestGap <= 0.4 * viewport` (the spec's pacing rule).
 * Task 12 can call it with ("top", "contact") for the whole page.
 *
 * With `graphics` true, visible canvases and SVG images (role="img") also count as content,
 * as in Task 13(a)'s pacing definition: a drawn tree or chart is not an empty band.
 */
export async function measurePacing(
  page: Page,
  fromId: string,
  toId: string,
  minHeight = 20,
  graphics = false,
): Promise<PacingResult> {
  return page.evaluate(
    async ({ fromId, toId, minHeight, graphics }) => {
      const vh = window.innerHeight;
      const start = document.getElementById(fromId)!.getBoundingClientRect().top + window.scrollY;
      const last = document.getElementById(toId)!;
      const end = Math.min(
        last.getBoundingClientRect().bottom + window.scrollY - vh,
        document.documentElement.scrollHeight - vh,
      );
      let largestGap = 0;
      let gapAt = 0;
      const textFree: number[] = [];
      for (let y = start; y <= Math.max(start, end) + 1; y += vh * 0.1) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        const bands: [number, number][] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const el = n.parentElement;
          if (!el || !n.textContent?.trim() || el.closest('header.top, [role="dialog"], script, style, noscript')) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility !== "visible" || parseFloat(cs.opacity) <= 0) continue;
          const range = document.createRange();
          range.selectNodeContents(n);
          const r = range.getBoundingClientRect();
          const box = (el.closest("p, li, h1, h2, h3, a, button, div") ?? el).getBoundingClientRect();
          if (Math.max(r.height, box.height) < minHeight || r.height === 0 || r.bottom <= 0 || r.top >= vh) continue;
          bands.push([Math.max(0, r.top), Math.min(vh, r.bottom)]);
        }
        if (graphics) {
          for (const g of document.querySelectorAll('canvas, svg[role="img"]')) {
            if (g.closest('header.top, [role="dialog"], .bg')) continue;
            const cs = getComputedStyle(g);
            if (cs.display === "none" || cs.visibility !== "visible" || parseFloat(cs.opacity) <= 0) continue;
            const r = g.getBoundingClientRect();
            if (r.height === 0 || r.bottom <= 0 || r.top >= vh) continue;
            bands.push([Math.max(0, r.top), Math.min(vh, r.bottom)]);
          }
        }
        if (!bands.length) textFree.push(Math.round(y));
        bands.sort((a, b) => a[0] - b[0]);
        let cursor = 0;
        for (const [t, b] of bands) {
          if (t - cursor > largestGap) { largestGap = t - cursor; gapAt = y; }
          cursor = Math.max(cursor, b);
        }
        if (vh - cursor > largestGap) { largestGap = vh - cursor; gapAt = y; }
      }
      return { largestGap: Math.round(largestGap), viewport: vh, gapAt: Math.round(gapAt), textFree };
    },
    { fromId, toId, minHeight, graphics },
  );
}
