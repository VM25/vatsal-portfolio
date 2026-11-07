import { expect, test, type Page } from "@playwright/test";
import { profile } from "../../src/data/profile";

/*
  The page's ending (refinement R6).

  The strip Vatsal saw at the bottom of the screen was the scene's own foreground: below
  the railing the shader painted the pier as one flat colour (plus grain), so every
  chapter ended on a near-black slab. It is now a boardwalk deck with boards, joints,
  per-board tone and grain, lit by the lamp and the dawn. These tests hold the ending:
  - no flat band at the bottom of the screen at the page end;
  - the document ends exactly at the footer, which sits on the deck;
  - the scene layer covers the viewport through iOS-like toolbar resizes;
  - the footer is one line, and the email address never breaks.
*/

async function frozen(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = {
      watchdog: false,
      preserve: true,
      freeze: true,
    };
  });
}

async function settled(page: Page) {
  await page.goto("/");
  await expect(page.locator("html[data-hydrated]")).toHaveCount(1);
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
}

/** Scroll to the very end and wait until the scene has drawn two frames there. */
async function toEnd(page: Page) {
  await page.evaluate(async () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max, behavior: "instant" });
    const h = (window as unknown as { __CLEARING_TEST__: { frames?: number; p?: number } }).__CLEARING_TEST__;
    const start = h.frames ?? 0;
    const t0 = performance.now();
    while (((h.frames ?? 0) < start + 2 || h.p !== 1) && performance.now() - t0 < 3000) {
      await new Promise((r) => requestAnimationFrame(r));
    }
  });
}

/*
  Row texture: each row of the bottom 15% of the screen is cut into 32×4 px blocks (the
  row and the three below it), and the row's texture is the standard deviation of the
  blocks' mean luminance across the width. Blocks average out the shader's per-pixel
  grain, which a flat slab also has. A band is 24 or more consecutive rows with texture
  under FLAT while the 24 rows directly above it have a median texture of FLAT or more.
  Measured: the old flat pier read 0.24 to 0.68 and the water above it 0.91 or more; the
  deck reads well above FLAT through most of its rows.
*/
const FLAT = 0.8;
const BAND = 24;

type Band = { start: number; length: number; above: number };

async function flatBands(page: Page): Promise<{ bands: Band[]; tex: number[]; y0: number }> {
  // CSS pixels, so a band is 24 CSS px at any device pixel ratio.
  const png = (await page.screenshot({ scale: "css" })).toString("base64");
  return page.evaluate(
    async ({ png, FLAT, BAND }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${png}`;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const g = c.getContext("2d")!;
      g.drawImage(img, 0, 0);
      const W = img.width;
      const H = img.height;
      // Rows from 15% above the bottom, plus BAND rows above that for the "textured above" check.
      const y0 = Math.floor(H * 0.85);
      const from = y0 - BAND;
      const d = g.getImageData(0, from, W, H - from).data;
      const lum = (i: number) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      const tex: number[] = [];
      for (let y = 0; y < H - from; y++) {
        const rows = Math.min(4, H - from - y);
        const blocks: number[] = [];
        for (let bx = 0; bx + 32 <= W; bx += 32) {
          let s = 0;
          for (let yy = y; yy < y + rows; yy++) for (let x = bx; x < bx + 32; x++) s += lum((yy * W + x) * 4);
          blocks.push(s / (32 * rows));
        }
        const m = blocks.reduce((a, b) => a + b, 0) / blocks.length;
        tex.push(Math.sqrt(blocks.reduce((a, b) => a + (b - m) ** 2, 0) / blocks.length));
      }
      const median = (xs: number[]) => {
        const s = [...xs].sort((a, b) => a - b);
        return s[s.length >> 1];
      };
      const bands: { start: number; length: number; above: number }[] = [];
      let y = BAND;
      while (y < tex.length) {
        if (tex[y] >= FLAT) {
          y++;
          continue;
        }
        let e = y;
        while (e < tex.length && tex[e] < FLAT) e++;
        const above = median(tex.slice(y - BAND, y));
        if (e - y >= BAND && above >= FLAT) bands.push({ start: from + y, length: e - y, above });
        y = e;
      }
      return { bands, tex: tex.slice(BAND), y0 };
    },
    { png, FLAT, BAND },
  );
}

// Only the page's backgrounds, veils and the scene: text and rules are made transparent
// so a line of text crossing a flat band cannot hide it.
const NO_TEXT =
  ".site *, .site *::before, .site *::after { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; border-color: transparent !important; caret-color: transparent !important; }";

const ENDINGS = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
  { width: 375, height: 667 },
];

for (const vp of ENDINGS) {
  test.describe(`page end at ${vp.width}x${vp.height}`, () => {
    test.use({ viewport: vp });

    test("the scene ends on the deck with no flat band, and the document ends at the footer", async ({ page }) => {
      await frozen(page);
      await settled(page);
      await expect(page.locator(".bg")).toHaveAttribute("data-mode", "gl");
      await toEnd(page);

      // The document is exactly as tall as the footer's bottom: nothing after it.
      const m = await page.evaluate(() => {
        const f = document.querySelector("#contact footer")!.getBoundingClientRect();
        const bg = document.querySelector(".bg")!.getBoundingClientRect();
        return {
          scrollHeight: document.scrollingElement!.scrollHeight,
          footBottom: f.bottom + window.scrollY,
          footView: f.bottom,
          vh: window.innerHeight,
          bg: [bg.top, bg.bottom],
        };
      });
      expect(Math.abs(m.scrollHeight - m.footBottom)).toBeLessThanOrEqual(1);
      expect(Math.abs(m.footView - m.vh)).toBeLessThanOrEqual(1);
      expect(m.bg[0]).toBeLessThanOrEqual(0);
      expect(m.bg[1]).toBeGreaterThanOrEqual(m.vh);

      await page.addStyleTag({ content: NO_TEXT });
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const r = await flatBands(page);
      const low = r.tex.filter((t) => t < FLAT).length;
      console.log(`ending ${vp.width}x${vp.height}: ${low} of ${r.tex.length} bottom rows under ${FLAT}; bands ${JSON.stringify(r.bands)}`);
      expect(r.bands, "a flat band at the bottom of the screen").toEqual([]);

      // Control: a flat 40px slab in the old pier's colour at the bottom is caught.
      await page.addStyleTag({
        content: "body::after { content: ''; position: fixed; left: 0; right: 0; bottom: 0; height: 40px; background: #030404; z-index: 100; }",
      });
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const ctl = await flatBands(page);
      expect(ctl.bands.length, "the control slab").toBeGreaterThan(0);
    });
  });
}

test.describe("the scene layer through toolbar resizes", () => {
  test("at 390 wide, 664 to 844 and back, the scene covers the viewport on every frame", async ({ browser, browserName }) => {
    test.skip(browserName === "firefox", "isMobile is not supported in Firefox");
    const ctx = await browser.newContext({ viewport: { width: 390, height: 664 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await frozen(page);
    await settled(page);
    await expect(page.locator(".bg")).toHaveAttribute("data-mode", "gl");
    await toEnd(page);

    // Record every frame as presented (a task queued from each animation frame runs after
    // that frame's paint): the viewport, the layer's box, and whether the canvas's bottom
    // row holds a drawn picture (alpha 255 and not black). And record, on every change of
    // the layer's size, the canvas's backing size as it stands before that frame paints.
    await page.evaluate(() => {
      const w = window as unknown as { __frames: unknown[]; __sizes: unknown[]; __rec: boolean };
      w.__frames = [];
      w.__rec = true;
      const bg = document.querySelector(".bg") as HTMLElement;
      const c = document.getElementById("world") as HTMLCanvasElement;
      const s = document.createElement("canvas");
      const sample = () => {
        if (!w.__rec) return;
        const r = bg.getBoundingClientRect();
        s.width = c.width;
        s.height = 1;
        const g = s.getContext("2d")!;
        g.clearRect(0, 0, s.width, 1);
        g.drawImage(c, 0, c.height - 1, c.width, 1, 0, 0, c.width, 1);
        const d = g.getImageData(0, 0, s.width, 1).data;
        let drawn = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255 && d[i] + d[i + 1] + d[i + 2] > 0) drawn++;
        w.__frames.push({
          vh: window.innerHeight,
          vw: window.innerWidth,
          top: r.top,
          bottom: r.bottom,
          cw: c.width,
          ch: c.height,
          bw: Math.round(r.width),
          bh: Math.round(r.height),
          drawn: drawn / s.width,
        });
      };
      const tick = () => {
        if (!w.__rec) return;
        setTimeout(sample, 0);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      // The backing store against the layer, at the moment before paint: this observer is
      // created after World's, so its callback runs after World's has resized the canvas.
      const ro = new ResizeObserver((entries) => {
        const box = entries[0].contentRect;
        w.__sizes.push({ bw: Math.round(box.width), bh: Math.round(box.height), cw: c.width, ch: c.height });
      });
      w.__sizes = [];
      ro.observe(bg);
    });

    for (const height of [844, 664, 844]) {
      await page.setViewportSize({ width: 390, height });
      await page.waitForFunction((h) => window.innerHeight === h, height);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
      const after = await page.evaluate(() => {
        const r = document.querySelector(".bg")!.getBoundingClientRect();
        const c = document.getElementById("world") as HTMLCanvasElement;
        return { top: r.top, bottom: r.bottom, vh: window.innerHeight, bh: Math.round(r.height), ch: c.height };
      });
      expect(after.top).toBeLessThanOrEqual(0);
      expect(after.bottom).toBeGreaterThanOrEqual(after.vh);
      expect(after.ch).toBe(after.bh);
    }
    const rec = await page.evaluate(() => {
      const w = window as unknown as {
        __frames: { vh: number; top: number; bottom: number; drawn: number }[];
        __sizes: { bw: number; bh: number; cw: number; ch: number }[];
        __rec: boolean;
      };
      w.__rec = false;
      return { frames: w.__frames, sizes: w.__sizes };
    });
    const { frames, sizes } = rec;
    expect(frames.length).toBeGreaterThan(6);
    expect(new Set(frames.map((f) => f.vh)).size, "the recording saw both heights").toBeGreaterThanOrEqual(2);
    for (const f of frames) {
      // The layer covers the viewport, and the canvas is never left cleared.
      expect(f.top, JSON.stringify(f)).toBeLessThanOrEqual(0);
      expect(f.bottom, JSON.stringify(f)).toBeGreaterThanOrEqual(f.vh);
      expect(f.drawn, JSON.stringify(f)).toBeGreaterThan(0.9);
    }
    // The backing store follows the layer on the frame its size changes, before paint.
    // Three changes; the observer's initial report can coalesce with the first of them.
    expect(sizes.length, "the layer changed size three times").toBeGreaterThanOrEqual(3);
    expect(new Set(sizes.map((s) => s.bh))).toEqual(new Set([664, 844]));
    for (const s of sizes) {
      expect(s.cw, JSON.stringify(s)).toBe(s.bw);
      expect(s.ch, JSON.stringify(s)).toBe(s.bh);
    }
    await ctx.close();
  });
});

test.describe("footer", () => {
  test("reads exactly © 2026 Vatsal Maniar, on one line", async ({ page }) => {
    await page.goto("/");
    const foot = page.locator("#contact footer");
    await expect(foot).toHaveCount(1);
    expect(((await foot.textContent()) ?? "").replace(/\s+/g, " ").trim()).toBe(`© 2026 ${profile.name}`);
    await expect(page.locator("body")).not.toContainText("across from Manhattan");
    const lines = await foot.locator("p").evaluate((p) => {
      const range = document.createRange();
      range.selectNodeContents(p);
      return new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size;
    });
    expect(lines).toBe(1);
  });
});

test.describe("contact email", () => {
  for (const width of [320, 360, 375, 390, 414]) {
    test(`at ${width} the address stays on one line beside or above Copy`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      await expect(page.locator("html[data-hydrated]")).toHaveCount(1);
      await page.evaluate(() => document.fonts.ready);
      const mail = page.locator("#mail");
      await mail.scrollIntoViewIfNeeded();
      const m = await page.evaluate(() => {
        const a = document.getElementById("mail")!;
        const b = document.querySelector("#contact .copy")!;
        const range = document.createRange();
        range.selectNodeContents(a);
        const rects = [...range.getClientRects()].filter((r) => r.width > 0);
        const text = range.getBoundingClientRect();
        const lh = parseFloat(getComputedStyle(a).lineHeight) || parseFloat(getComputedStyle(a).fontSize) * 1.6;
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        const d = document.documentElement;
        return {
          tops: new Set(rects.map((r) => Math.round(r.top))).size,
          textH: text.height,
          lh,
          a: { l: ar.left, r: ar.right, t: ar.top, b: ar.bottom },
          b: { l: br.left, r: br.right, t: br.top, b: br.bottom, w: br.width, h: br.height },
          vw: d.clientWidth,
          scroll: d.scrollWidth - d.clientWidth,
        };
      });
      // One line box: every fragment of the address on the same line, one line tall.
      expect(m.tops).toBe(1);
      expect(m.textH).toBeLessThanOrEqual(m.lh + 1);
      // Inside the page, no horizontal scroll.
      expect(m.scroll).toBeLessThanOrEqual(0);
      expect(m.a.l).toBeGreaterThanOrEqual(0);
      expect(m.a.r).toBeLessThanOrEqual(m.vw);
      expect(m.b.r).toBeLessThanOrEqual(m.vw);
      // Copy beside (to the right) or under the address, never overlapping it.
      const overlap = m.a.l < m.b.r && m.b.l < m.a.r && m.a.t < m.b.b && m.b.t < m.a.b;
      expect(overlap).toBe(false);
      expect(m.b.l >= m.a.r - 1 || m.b.t >= m.a.b - 1).toBe(true);
      // Tap targets.
      expect(m.b.w).toBeGreaterThanOrEqual(44);
      expect(m.b.h).toBeGreaterThanOrEqual(44);
      expect(m.a.b - m.a.t).toBeGreaterThanOrEqual(44);
    });
  }
});
