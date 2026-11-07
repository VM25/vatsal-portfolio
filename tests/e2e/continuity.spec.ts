import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { DAWN_FROM, DAWN_MAX } from "../../src/lib/scene";

/*
  Lighting continuity (refinement R1). The scene changes with scroll and nothing else
  does: no class, no palette switch, no abrupt step in the light.

  The scene runs under the test hook's freeze (time stopped, n = 512, no gust, beat,
  rush or pointer drift), so its picture depends on scroll alone. A slow scroll from
  top to bottom in 0.5% steps reads the canvas's mean luminance (0.2126 R + 0.7152 G +
  0.0722 B, 0 to 255) at each step, and asserts:
  - no step between neighbours moves it by more than 2% of the 0 to 255 range;
  - no 5% stretch of scroll holds more than 25% of the total top-to-bottom change
    (the sum of the step changes, so a darkening and a warming both count).

  With R1_FRAMES set to a folder, the profile is also written there as CSV, with
  screenshots at p = 0, 0.25, 0.5, 0.75, 0.9 and 1.
*/

type Hook = { frames?: number; p?: number; dawn?: number };

async function frozen(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = {
      watchdog: false,
      preserve: true,
      freeze: true,
    };
  });
}

async function hasWebGL(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    try {
      return !!document.createElement("canvas").getContext("webgl");
    } catch {
      return false;
    }
  });
}

async function settled(page: Page) {
  await page.goto("/");
  await expect(page.locator("html[data-hydrated]")).toHaveCount(1);
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
}

const hook = (page: Page) =>
  page.evaluate(() => ({ ...(window as unknown as { __CLEARING_TEST__: Hook }).__CLEARING_TEST__ }));

const progress = (page: Page) =>
  page.evaluate(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  });

/** Scroll to fraction p of the page and wait until the scene has drawn two frames there. */
async function scrollTo(page: Page, p: number) {
  await page.evaluate(async (p) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: Math.round(max * p), behavior: "instant" });
    const h = (window as unknown as { __CLEARING_TEST__: Hook }).__CLEARING_TEST__;
    const now = Math.min(1, Math.max(0, window.scrollY / max));
    const start = h.frames ?? 0;
    const t0 = performance.now();
    while (((h.frames ?? 0) < start + 2 || h.p !== now) && performance.now() - t0 < 3000) {
      await new Promise((r) => requestAnimationFrame(r));
    }
  }, p);
}

/** Mean luminance of the scene canvas, 0 to 255. */
async function meanLuminance(page: Page): Promise<number> {
  return page.evaluate(() => {
    const c = document.getElementById("world") as HTMLCanvasElement;
    const s = document.createElement("canvas");
    s.width = c.width;
    s.height = c.height;
    const g = s.getContext("2d")!;
    g.drawImage(c, 0, 0);
    const d = g.getImageData(0, 0, s.width, s.height).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    return sum / (d.length / 4);
  });
}

/**
 * Computed colours of the page's own text and controls: the top-bar name, résumé and
 * section links (the current link and the others), a Path paragraph, Contact's heading
 * and the copy button, plus the top bar's backdrop.
 */
async function foreground(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() => {
    const out: Record<string, string> = {};
    const put = (name: string, el: Element | null) => {
      if (!el) throw new Error(`missing ${name}`);
      const cs = getComputedStyle(el);
      out[name] = `${cs.color} | ${cs.backgroundColor} | ${cs.backgroundImage} | ${cs.borderTopColor}`;
    };
    put("bar", document.querySelector("header.top"));
    put("name", document.querySelector("header.top .mk"));
    put("résumé", document.querySelector("header.top .res"));
    for (const a of document.querySelectorAll("header.top .links a")) {
      put(`link ${a.getAttribute("aria-current") === "true" ? "current" : "other"} ${a.getAttribute("href")}`, a);
    }
    put("path paragraph", document.querySelector("#path .stop .w"));
    put("contact heading", document.querySelector("#contact h2"));
    put("copy button", document.querySelector("#contact .copy"));
    return out;
  });
}

const STEPS = 200;
const FRAMES = [0, 0.25, 0.5, 0.75, 0.9, 1];

for (const vp of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test.describe(`lighting continuity at ${vp.width}x${vp.height}`, () => {
    test.use({ viewport: vp });

    test("a slow scroll changes the scene's light gradually and never the page's colours", async ({ page, browserName }) => {
      test.setTimeout(240_000);
      await frozen(page);
      await settled(page);
      test.skip(!(await hasWebGL(page)), "no WebGL in this browser build");
      await expect(page.locator(".bg")).toHaveAttribute("data-mode", "gl");
      const out = process.env.R1_FRAMES;
      if (out) mkdirSync(out, { recursive: true });

      const lum: number[] = [];
      const colours: Record<string, Record<string, string>> = {};
      for (let i = 0; i <= STEPS; i++) {
        const p = i / STEPS;
        await scrollTo(page, p);
        lum.push(await meanLuminance(page));
        if ([0, 0.5, 0.9, 1].includes(p)) colours[p] = await foreground(page);
        if (out && FRAMES.includes(p)) {
          await page.screenshot({ path: path.join(out, `${browserName}-${vp.width}x${vp.height}-p${String(p).replace(".", "_")}.png`) });
        }
      }
      // At the end the scene is fully warmed, and only that far.
      const h = await hook(page);
      expect(h.p).toBe(1);
      expect(h.dawn).toBeCloseTo(DAWN_MAX, 6);

      const steps = lum.slice(1).map((v, i) => Math.abs(v - lum[i]));
      const total = steps.reduce((a, b) => a + b, 0);
      const largest = Math.max(...steps);
      const W = STEPS / 20; // 5% of the scroll
      let windowMax = 0;
      let windowAt = 0;
      for (let i = 0; i + W <= steps.length; i++) {
        const s = steps.slice(i, i + W).reduce((a, b) => a + b, 0);
        if (s > windowMax) {
          windowMax = s;
          windowAt = i / STEPS;
        }
      }
      const share = windowMax / total;
      const summary =
        `continuity ${browserName} ${vp.width}x${vp.height}: luminance ${lum[0].toFixed(2)} at the top, ` +
        `${Math.min(...lum).toFixed(2)} lowest, ${lum[STEPS].toFixed(2)} at the end; ` +
        `largest step ${largest.toFixed(3)} (${((100 * largest) / 255).toFixed(2)}% of 255) at p=${(steps.indexOf(largest) + 1) / STEPS}; ` +
        `total change ${total.toFixed(2)}; largest 5% window ${windowMax.toFixed(2)} (${(100 * share).toFixed(1)}% of the total) from p=${windowAt}; ` +
        `dawn ${DAWN_MAX} from p=${DAWN_FROM}`;
      console.log(summary);
      if (out) {
        const rows = lum.map((v, i) => `${(i / STEPS).toFixed(3)},${v.toFixed(4)}`);
        writeFileSync(
          path.join(out, `luminance-${browserName}-${vp.width}x${vp.height}.csv`),
          ["p,mean_luminance_0_255", ...rows].join("\n") + "\n",
        );
        writeFileSync(path.join(out, `summary-${browserName}-${vp.width}x${vp.height}.txt`), summary + "\n");
      }

      expect(largest, "largest change between neighbouring 0.5% steps").toBeLessThanOrEqual(0.02 * 255);
      expect(share, "share of the total change inside any 5% of the scroll").toBeLessThanOrEqual(0.25);

      // The page's own colours are the same at the top, the middle, late and at the end.
      for (const p of [0.5, 0.9, 1]) {
        for (const name of ["bar", "name", "résumé", "path paragraph", "contact heading", "copy button"]) {
          expect(colours[p][name], `${name} at p=${p}`).toBe(colours[0][name]);
        }
      }
      // A section link is one of two colours, current or not, wherever the page is.
      const linkColours = (kind: string) =>
        new Set(Object.values(colours).flatMap((c) => Object.entries(c).filter(([n]) => n.startsWith(`link ${kind}`)).map(([, v]) => v)));
      expect(linkColours("other").size).toBe(1);
      expect(linkColours("current").size).toBeLessThanOrEqual(1);
    });
  });
}

test.describe("fast movement", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("jumping between chapters with the nav links changes no class or colour, and the scene keeps up within two frames", async ({ page }) => {
    await frozen(page);
    await settled(page);
    test.skip(!(await hasWebGL(page)), "no WebGL in this browser build");
    await expect(page.locator(".bg")).toHaveAttribute("data-mode", "gl");
    const before = await foreground(page);
    const className = await page.evaluate(() => document.documentElement.className);
    // Every class change on <html> or <body> from here on is recorded.
    await page.evaluate(() => {
      const w = window as unknown as { __classChanges: string[] };
      w.__classChanges = [];
      new MutationObserver((ms) => ms.forEach((m) => w.__classChanges.push(`${(m.target as Element).tagName} ${(m.target as Element).className}`))).observe(
        document.documentElement,
        { attributes: true, attributeFilter: ["class"] },
      );
      new MutationObserver((ms) => ms.forEach((m) => w.__classChanges.push(`${(m.target as Element).tagName} ${(m.target as Element).className}`))).observe(
        document.body,
        { attributes: true, attributeFilter: ["class"] },
      );
    });
    const bar = page.locator("header.top");
    const settle = () =>
      page.evaluate(async () => {
        // Wait until the scroll position has held for five animation frames.
        let last = -1;
        let same = 0;
        const t0 = performance.now();
        while (same < 5 && performance.now() - t0 < 5000) {
          await new Promise((r) => requestAnimationFrame(r));
          if (window.scrollY === last) same++;
          else {
            same = 0;
            last = window.scrollY;
          }
        }
      });
    // Two drawn frames after the scroll has come to rest, the scene is at the new position.
    const sceneKeepsUp = async (label: string) => {
      await settle();
      const f0 = (await hook(page)).frames ?? 0;
      await expect.poll(async () => (await hook(page)).frames ?? 0).toBeGreaterThanOrEqual(f0 + 2);
      const [h, p] = [await hook(page), await progress(page)];
      expect(Math.abs((h.p ?? -1) - p), `${label}: the scene's progress`).toBeLessThan(1e-6);
      const want = DAWN_MAX * (p <= DAWN_FROM ? 0 : p >= 1 ? 1 : ((t) => t * t * (3 - 2 * t))((p - DAWN_FROM) / (1 - DAWN_FROM)));
      expect(h.dawn ?? -1, `${label}: the scene's dawn`).toBeCloseTo(want, 6);
    };

    // Quick succession: each click lands while the previous smooth scroll is still running.
    for (const name of ["Contact", "Projects", "Path", "Research", "Contact"]) {
      await bar.getByRole("link", { name, exact: true }).click();
      await page.waitForTimeout(120);
    }
    await sceneKeepsUp("after a burst of jumps");
    // Then one at a time, from the end to the top and back down.
    for (const name of ["Projects", "Contact", "Research", "Vatsal Maniar", "Path"]) {
      await bar.getByRole("link", { name, exact: true }).click();
      await sceneKeepsUp(name);
      expect(await foreground(page).then((f) => f.name)).toBe(before.name);
    }
    expect(await page.evaluate(() => (window as unknown as { __classChanges: string[] }).__classChanges)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.className)).toBe(className);
    const after = await foreground(page);
    for (const k of ["bar", "name", "résumé", "path paragraph", "contact heading", "copy button"]) expect(after[k], k).toBe(before[k]);
  });
});

/*
  Veil edges (refinement R1 fix-up). Each chapter's veil feathers into the scene, so no
  veil boundary reads as a line. The scene's own edges (the skyline, the pier) would
  swamp a row measure, so behind the page the scene is swapped for a flat backdrop
  lighter than any part of it (the strictest case for a veil edge), and everything but
  the veils is hidden: text, borders, fills, images, canvases and the top bar. The page is screenshotted with its veils and
  without them; the difference is the veils' own contribution. Its mean luminance per
  pixel row must never step by more than 3 levels (of 255) from one row to the next.
  A control run with the feather switched off shows the measure does catch a hard edge.
*/
const ROW_STEP_MAX = 3;
const HIDE_TEXT =
  "main * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-decoration-color: transparent !important; caret-color: transparent !important; border-color: transparent !important; text-shadow: none !important; transition: none !important; animation: none !important; } main *:not(.veil) { background: transparent !important; box-shadow: none !important; } main img, main canvas, main svg { visibility: hidden !important; } header.top { visibility: hidden !important; } .bg canvas, .bg .stills { visibility: hidden !important; } .bg { background: #6B7275 !important; }";

/** The largest row-to-row step in the veils' contribution to the screen, and where it is. */
async function veilRowStep(page: Page): Promise<{ step: number; row: number }> {
  await page.evaluate((css) => {
    const s = document.createElement("style");
    s.id = "__veil-hide-text";
    s.textContent = css;
    document.head.append(s);
    // Hold animation frames, so the scene's canvas keeps one picture for both screenshots.
    const w = window as unknown as { __hold?: { orig: typeof requestAnimationFrame; q: FrameRequestCallback[] } };
    const hold = { orig: window.requestAnimationFrame, q: [] as FrameRequestCallback[] };
    w.__hold = hold;
    window.requestAnimationFrame = (cb) => {
      hold.q.push(cb);
      return 0;
    };
  }, HIDE_TEXT);
  await page.waitForTimeout(100);
  const withVeils = await page.screenshot({ scale: "css", caret: "hide" });
  await page.evaluate(() => {
    const s = document.createElement("style");
    s.id = "__veil-off";
    s.textContent = ".veil { visibility: hidden !important; }";
    document.head.append(s);
  });
  await page.waitForTimeout(50);
  const without = await page.screenshot({ scale: "css", caret: "hide" });
  await page.evaluate(() => {
    document.getElementById("__veil-off")?.remove();
    document.getElementById("__veil-hide-text")?.remove();
    const w = window as unknown as { __hold?: { orig: typeof requestAnimationFrame; q: FrameRequestCallback[] } };
    const hold = w.__hold!;
    window.requestAnimationFrame = hold.orig;
    delete w.__hold;
    hold.q.forEach((cb) => hold.orig.call(window, cb));
  });
  return page.evaluate(
    async ({ a, b }) => {
      const read = async (url: string) => {
        const img = new Image();
        img.src = url;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const g = c.getContext("2d")!;
        g.drawImage(img, 0, 0);
        return { w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data };
      };
      const A = await read(a);
      const B = await read(b);
      const rows: number[] = [];
      for (let y = 0; y < A.h; y++) {
        let sum = 0;
        for (let x = 0; x < A.w; x++) {
          const i = (y * A.w + x) * 4;
          const la = 0.2126 * A.d[i] + 0.7152 * A.d[i + 1] + 0.0722 * A.d[i + 2];
          const lb = 0.2126 * B.d[i] + 0.7152 * B.d[i + 1] + 0.0722 * B.d[i + 2];
          sum += la - lb;
        }
        rows.push(sum / A.w);
      }
      let step = 0;
      let row = 0;
      for (let y = 1; y < rows.length; y++) {
        const d = Math.abs(rows[y] - rows[y - 1]);
        if (d > step) {
          step = d;
          row = y;
        }
      }
      return { step, row };
    },
    {
      a: `data:image/png;base64,${withVeils.toString("base64")}`,
      b: `data:image/png;base64,${without.toString("base64")}`,
    },
  );
}

/** Scroll so the boundary between two chapters sits mid-screen (as near as the page allows). */
async function centreBoundary(page: Page, id: string) {
  await page.evaluate(async (id) => {
    const y = document.getElementById(id)!.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.round(y - window.innerHeight / 2), behavior: "instant" });
    for (let i = 0; i < 4; i++) await new Promise((r) => requestAnimationFrame(r));
  }, id);
}

for (const vp of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test.describe(`veil edges at ${vp.width}x${vp.height}`, () => {
    test.use({ viewport: vp });

    test("every veil boundary feathers into the scene: no row-to-row step over 3 levels", async ({ page }) => {
      test.setTimeout(90_000);
      await frozen(page);
      await settled(page);
      test.skip(!(await hasWebGL(page)), "no WebGL in this browser build");
      await expect(page.locator(".bg")).toHaveAttribute("data-mode", "gl");
      const found: string[] = [];
      // Each boundary between neighbouring chapters (the next chapter's top), then the page end.
      for (const id of ["projects", "research", "path", "contact"]) {
        await centreBoundary(page, id);
        const r = await veilRowStep(page);
        console.log(`veil edge ${vp.width} above #${id}: largest row step ${r.step.toFixed(2)} at row ${r.row}`);
        if (r.step > ROW_STEP_MAX) found.push(`above #${id}: ${r.step.toFixed(2)} at row ${r.row}`);
      }
      await scrollTo(page, 1);
      const end = await veilRowStep(page);
      console.log(`veil edge ${vp.width} at the end: largest row step ${end.step.toFixed(2)} at row ${end.row}`);
      if (end.step > ROW_STEP_MAX) found.push(`at the end: ${end.step.toFixed(2)} at row ${end.row}`);
      expect(found).toEqual([]);

      // Control: with the feather switched off, the same measure sees the veil's edge.
      await page.addStyleTag({ content: ".veil { -webkit-mask-image: none !important; mask-image: none !important; }" });
      await centreBoundary(page, "path");
      const hard = await veilRowStep(page);
      console.log(`veil edge ${vp.width} above #path without the feather: ${hard.step.toFixed(2)}`);
      expect(hard.step).toBeGreaterThan(ROW_STEP_MAX);
    });
  });
}
