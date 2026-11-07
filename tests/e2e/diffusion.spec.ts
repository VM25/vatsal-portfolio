import { expect, test, type Page } from "@playwright/test";
import { projects } from "../../src/data/projects";
import { crrTree } from "../../src/lib/pricing";

/*
  DiffusionWorks: a binomial tree closing in on Black–Scholes. Reference values come
  from src/lib/pricing.ts (S = 100, r = 4%, T = 1, European call), checked offline.
*/

async function noWatchdog(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdog: false };
  });
}

/**
 * Set a range input the way a drag does: the native value setter (so React's value
 * tracker sees it), then `input`, then `change` unless told otherwise.
 */
async function setRange(page: Page, id: string, value: number, change = true) {
  await page.evaluate(
    ({ id, value, change }) => {
      const el = document.getElementById(id) as HTMLInputElement;
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      set.call(el, String(value));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      if (change) el.dispatchEvent(new Event("change", { bubbles: true }));
    },
    { id, value, change },
  );
}

/** Load the page and wait until the exhibit has hydrated (its first draw marks the tree canvas). */
async function open(page: Page) {
  await page.goto("/");
  await expect(page.locator("#dwTree[data-draws]")).toHaveCount(1);
}

/** Wait for n animation frames. */
async function ticks(page: Page, n: number) {
  await page.evaluate(async (n) => {
    for (let i = 0; i < n; i++) await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, n);
}

const ex = (page: Page) => page.locator("#diffusion");
const say = (page: Page) => page.locator("#dwSay");

test.describe("DiffusionWorks exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await noWatchdog(page);
  });

  test("by default the chart's annotations carry the binomial and Black–Scholes prices, the difference and the contract", async ({ page }) => {
    await open(page);
    await expect(page.locator("#dwBin")).toHaveText("9.7612");
    await expect(page.locator("#dwBS")).toHaveText("9.9251");
    await expect(page.locator("#dwGap")).toHaveText("−0.1639");
    // On the chart: the dashed line's label, and the marker's.
    await expect(page.locator("#diffusion .dw-chart #dwBSLabel")).toHaveText("Black–Scholes 9.9251");
    await expect(page.locator("#diffusion .dw-chart #dwMarker")).toContainText("N = 12 · 9.7612");
    await expect(page.locator("#diffusion .dw-chart #dwMarker")).toContainText("difference −0.1639");
    // One quiet line for the contract, at the head of the chart caption.
    await expect(page.locator("#dwChartCap #dwTerms")).toHaveText("European call · S = K = 100, σ = 20%, r = 4%, T = 1.");
    await expect(page.locator("#dwNo")).toHaveText("12");
    await expect(page.locator("#dwSo")).toHaveText("20%");
    await expect(page.locator("#dwKo")).toHaveText("100");
  });

  test("the default readouts are in the page without JavaScript", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator("#dwBin")).toHaveText("9.7612");
    await expect(page.locator("#dwBS")).toHaveText("9.9251");
    await expect(page.locator("#dwGap")).toHaveText("−0.1639");
    await expect(page.locator("#dwBSLabel")).toHaveText("Black–Scholes 9.9251");
    await expect(page.locator("#dwMarker")).toContainText("N = 12 · 9.7612");
    await expect(page.locator("#dwTerms")).toHaveText("European call · S = K = 100, σ = 20%, r = 4%, T = 1.");
    await expect(page.locator("#diffusion")).not.toContainText("—");
    await ctx.close();
  });

  test("Review Focus 5: ArrowRight on the focused N slider updates the annotations and the live region", async ({ page }) => {
    await open(page);
    await expect(say(page)).toHaveAttribute("aria-live", "polite");
    await expect(say(page)).toHaveAttribute("aria-atomic", "true");
    await expect(say(page)).toContainText("9.7612");
    await page.locator("#dwN").focus();
    await expect(page.locator("#dwN")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#dwNo")).toHaveText("13");
    await expect(page.locator("#dwBin")).toHaveText("10.0665");
    await expect(page.locator("#dwGap")).toHaveText("+0.1414");
    await expect(page.locator("#dwMarker")).toContainText("N = 13 · 10.0665");
    await expect(say(page)).toContainText("10.0665");
    await expect(say(page)).toContainText("+0.1414");
  });

  test("dragging updates the numbers at once but announces only after the drag settles", async ({ page }) => {
    await open(page);
    await expect(say(page)).toContainText("9.7612");
    // A drag: a burst of input events and no change event, read back before 250 ms pass.
    const mid = await page.evaluate(async () => {
      const el = document.getElementById("dwN") as HTMLInputElement;
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      for (const n of [20, 40, 60, 80]) {
        set.call(el, String(n));
        el.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise((r) => setTimeout(r, 10));
      }
      await new Promise((r) => setTimeout(r, 20));
      return {
        n: document.getElementById("dwNo")!.textContent,
        say: document.getElementById("dwSay")!.textContent,
      };
    });
    expect(mid.n).toBe("80");
    expect(mid.say).toContain("9.7612");
    // 250 ms after the last input, the live region catches up.
    await expect(say(page)).toContainText(`N = 80`, { timeout: 2000 });
    expect(await say(page).textContent()).toContain(await page.locator("#dwBin").textContent());
  });

  test("N = 200 converges to 9.9151", async ({ page }) => {
    await open(page);
    await setRange(page, "dwN", 200);
    await expect(page.locator("#dwNo")).toHaveText("200");
    await expect(page.locator("#dwBin")).toHaveText("9.9151");
    await expect(page.locator("#dwMarker")).toContainText("N = 200 · 9.9151");
    await expect(say(page)).toContainText("9.9151");
  });

  test("K = 80, σ = 40%, N = 200", async ({ page }) => {
    await open(page);
    await setRange(page, "dwK", 80);
    await setRange(page, "dwS", 40);
    await setRange(page, "dwN", 200);
    await expect(page.locator("#dwKo")).toHaveText("80");
    await expect(page.locator("#dwSo")).toHaveText("40%");
    await expect(page.locator("#dwBin")).toHaveText("28.4465");
    await expect(page.locator("#dwBS")).toHaveText("28.4556");
    await expect(page.locator("#dwGap")).toHaveText("−0.0091");
    await expect(page.locator("#dwTerms")).toHaveText("European call · S = 100, K = 80, σ = 40%, r = 4%, T = 1.");
  });

  test("sliders are labelled native ranges with outputs and 44px targets", async ({ page }) => {
    await open(page);
    const specs = [
      { id: "dwN", min: "1", max: "200", value: "12" },
      { id: "dwS", min: "5", max: "80", value: "20" },
      { id: "dwK", min: "60", max: "140", value: "100" },
    ];
    for (const s of specs) {
      const input = page.locator(`#${s.id}`);
      await expect(input).toHaveAttribute("type", "range");
      await expect(input).toHaveAttribute("min", s.min);
      await expect(input).toHaveAttribute("max", s.max);
      await expect(input).toHaveValue(s.value);
      await expect(page.locator(`label[for="${s.id}"]`)).toHaveCount(1);
      await expect(page.locator(`output[for="${s.id}"]`)).toHaveCount(1);
      const box = await input.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.getByRole("slider", { name: /Volatility/ })).toHaveAttribute("aria-valuetext", "20 percent");
    await setRange(page, "dwS", 35);
    await expect(page.locator("#dwS")).toHaveAttribute("aria-valuetext", "35 percent");
    await expect(page.getByRole("slider", { name: /Steps in the tree/ })).toHaveCount(1);
    await expect(page.getByRole("slider", { name: /Strike/ })).toHaveCount(1);
  });

  test("canvases are labelled images sized by CSS width with a backing store at DPR capped at 2", async ({ browser }) => {
    const ctx = await browser.newContext({ deviceScaleFactor: 3, viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await noWatchdog(page);
    await open(page);
    for (const id of ["dwTree", "dwChart"]) {
      const c = page.locator(`#${id}`);
      await expect(c).toHaveAttribute("role", "img");
      expect((await c.getAttribute("aria-label"))!.length).toBeGreaterThan(20);
      await c.scrollIntoViewIfNeeded();
      await expect
        .poll(() => c.evaluate((e) => (e as HTMLCanvasElement).width - Math.round(e.clientWidth * 2)))
        .toBe(0);
      // Something was drawn.
      const inked = await c.evaluate((e) => {
        const cv = e as HTMLCanvasElement;
        const d = cv.getContext("2d")!.getImageData(0, 0, cv.width, cv.height).data;
        let n = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
        return n;
      });
      expect(inked).toBeGreaterThan(500);
    }
    await ctx.close();
  });

  test("the tree caption follows N and the tree shows 6 steps on wide canvases", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page);
    const cap = page.locator("#dwTreeCap");
    await expect(cap).toBeVisible();
    await expect(cap).toContainText("First 6 of 12 steps.");
    await setRange(page, "dwN", 40);
    await expect(cap).toContainText("First 6 of 40 steps.");
    await setRange(page, "dwN", 3);
    await expect(cap).toContainText("All 3 steps.");
    await setRange(page, "dwN", 1);
    await expect(cap).toContainText("All 1 step.");
  });

  test("the tree's node values are in a visually hidden table that follows the canvas", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page);
    const table = ex(page).getByRole("table", { name: projects.diffusion.treeTable.caption });
    await expect(table).toHaveCount(1);
    // Hidden from sight, not from assistive technology.
    expect(await table.evaluate((t) => t.parentElement!.className)).toBe("sr-only");
    expect(await table.evaluate((t) => { const r = t.parentElement!.getBoundingClientRect(); return r.width * r.height; })).toBeLessThanOrEqual(1);
    const cells = () =>
      table.locator("tr").evaluateAll((rows) => rows.map((r) => [...r.querySelectorAll("th, td")].map((c) => c.textContent)));
    const expected = (N: number, keep: number) =>
      crrTree({ S: 100, K: 100, r: 0.04, sigma: 0.2, T: 1, N, keep }).rows.map((row, i) => [
        `Step ${i}`,
        ...row.map((v) => v.toFixed(2)).reverse(),
      ]);
    // Default N = 12: the canvas shows the first 6 steps, so 7 rows (step 0 is today).
    await expect.poll(cells).toEqual(expected(12, 6));
    expect((await cells())[0][1]).toBe("9.76");
    await setRange(page, "dwN", 3);
    await expect.poll(cells).toEqual(expected(3, 3));
  });

  test("the tree shows 5 steps when its canvas is under 420px wide", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await open(page);
    const w = await page.locator("#dwTree").evaluate((e) => e.clientWidth);
    expect(w).toBeLessThan(420);
    await expect(page.locator("#dwTreeCap")).toContainText("First 5 of 12 steps.");
  });

  test("at 375px the blocks run intro, visual (tree, then chart), result, model inputs", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await open(page);
    const order = ["intro", "viz", "result", "inputs"];
    const blocks = await ex(page).evaluate((el) =>
      Array.from(el.children)
        .filter((c) => getComputedStyle(c).display !== "none" && c.getBoundingClientRect().height > 0)
        .map((c) => ({ cls: c.className, top: c.getBoundingClientRect().top })),
    );
    expect(blocks.map((b) => b.cls.split(" ")[0])).toEqual(order);
    for (let i = 1; i < blocks.length; i++) expect(blocks[i].top).toBeGreaterThan(blocks[i - 1].top);
    const tree = (await page.locator("#dwTree").boundingBox())!;
    const chart = (await page.locator("#dwChart").boundingBox())!;
    expect(chart.y).toBeGreaterThan(tree.y + tree.height);
    // No horizontal scroll from the exhibit.
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });

  test("on wide screens intro and result sit left of the visual, with the model inputs under the visual", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page);
    const box = async (s: string) => (await page.locator(`#diffusion ${s}`).boundingBox())!;
    const [intro, result, viz, inputs] = [await box(".intro"), await box(".result"), await box(".viz"), await box(".inputs")];
    expect(viz.x).toBeGreaterThan(intro.x + intro.width);
    expect(result.x + result.width).toBeLessThan(viz.x);
    expect(result.y).toBeGreaterThan(intro.y + intro.height);
    expect(Math.abs(inputs.x - viz.x)).toBeLessThanOrEqual(1);
    expect(inputs.y).toBeGreaterThanOrEqual(viz.y + viz.height);
    // Straight under the visual: no more than the row gap between them.
    expect(inputs.y - (viz.y + viz.height)).toBeLessThanOrEqual(40);
  });

  test("the model inputs are a quiet, labelled group after the visuals and the result", async ({ page }) => {
    await open(page);
    const group = ex(page).getByRole("group", { name: projects.diffusion.inputsLabel });
    await expect(group).toHaveCount(1);
    await expect(group.getByRole("slider")).toHaveCount(3);
    // After the visual and the result in reading order.
    const after = await page.evaluate(() => {
      const g = document.querySelector("#diffusion .inputs")!;
      const follows = (s: string) => !!(document.querySelector(s)!.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING);
      return follows("#diffusion .viz") && follows("#diffusion .result");
    });
    expect(after).toBe(true);
    // Small type: labels, values and the group label at 14px, not larger.
    const sizes = await group.locator("label, output, .lbl").evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
    expect(sizes.length).toBe(7);
    for (const s of sizes) expect(s).toBe(14);
    // No instructions in or around the group: its text is the label, three input labels and their values.
    const text = ((await group.textContent()) ?? "").replace((await say(page).textContent()) ?? "", "");
    expect(text).not.toMatch(/\b(drag|move|try|slide|adjust|change)\b/i);
  });

  test("no formula block, no parameter readouts and no u, d or p in the exhibit", async ({ page }) => {
    await open(page);
    await expect(ex(page).locator(".formula, .lp, .read, #dwLive")).toHaveCount(0);
    const all = (await ex(page).textContent()) ?? "";
    for (const v of ["u =", "d =", "p ="]) expect(all).not.toContain(v);
    expect(all).not.toMatch(/\b[udp]\s*=/);
    // Nor once the inputs change.
    await setRange(page, "dwN", 40);
    await expect(page.locator("#dwNo")).toHaveText("40");
    expect((await ex(page).textContent()) ?? "").not.toMatch(/\b[udp]\s*=/);
  });

  test("notation is STIX in the annotations and the caption, with true minus and no em dash", async ({ page }) => {
    await open(page);
    // N on the marker and the contract's symbols are STIX italic.
    const stix = page.locator("#dwMarker .stix i, #dwTerms .stix i");
    expect(await stix.allTextContents()).toEqual(["N", "S", "K", "σ", "r", "T"]);
    for (const ff of await stix.evaluateAll((els) => els.map((e) => getComputedStyle(e).fontFamily.toLowerCase())))
      expect(ff).toContain("stix");
    // The prices are in the numeric face.
    for (const id of ["#dwBin", "#dwBS", "#dwGap"]) {
      const ff = await page.locator(id).evaluate((e) => getComputedStyle(e).fontFamily.toLowerCase());
      expect(ff).toContain("mono");
    }
    // A true minus in the difference, never a hyphen.
    expect(await page.locator("#dwGap").textContent()).toBe("−0.1639");
    const notes = (await page.locator("#diffusion .dw-chart").textContent()) ?? "";
    expect(notes).not.toMatch(/-/);
    const all = (await ex(page).textContent()) ?? "";
    expect(all).not.toContain("—");
    expect(all).not.toContain("--");
    expect(all).toContain("Black–Scholes");
  });

  for (const width of [1440, 375, 320]) {
    test(`the annotations stay on the chart and clear of each other at ${width}px, for every N`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page);
      await page.locator("#dwChart").scrollIntoViewIfNeeded();
      const bad: string[] = [];
      for (const n of [1, 2, 3, 4, 5, 8, 12, 13, 25, 50, 80, 100, 120, 150, 180, 199, 200]) {
        await setRange(page, "dwN", n, false);
        await expect(page.locator("#dwNo")).toHaveText(String(n));
        const r = await page.evaluate(() => {
          const box = (id: string) => document.getElementById(id)!.getBoundingClientRect();
          const c = box("dwChart");
          const m = box("dwMarker");
          const b = box("dwBSLabel");
          const inside = (x: DOMRect) => x.left >= c.left - 1 && x.right <= c.right + 1 && x.top >= c.top - 1 && x.bottom <= c.bottom + 1;
          const overlap = !(m.right <= b.left || b.right <= m.left || m.bottom <= b.top || b.bottom <= m.top);
          return { m: inside(m), b: inside(b), overlap };
        });
        if (!r.m) bad.push(`N = ${n}: marker label leaves the chart`);
        if (!r.b) bad.push(`N = ${n}: Black–Scholes label leaves the chart`);
        if (r.overlap) bad.push(`N = ${n}: labels overlap`);
      }
      expect(bad).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }

  test("a release runs one backward sweep of about 650 ms", async ({ page }) => {
    await open(page);
    const tree = page.locator("#dwTree");
    await tree.scrollIntoViewIfNeeded();
    await expect(tree).toHaveAttribute("data-sweep-frames", "0");
    await setRange(page, "dwN", 30);
    await expect.poll(async () => Number(await tree.getAttribute("data-sweep-frames"))).toBeGreaterThan(3);
    await expect(tree).toHaveAttribute("data-sweeping", "false", { timeout: 3000 });
    expect(await tree.getAttribute("data-sweeps")).toBe("1");
    // One sweep is one frame per animation frame for 650 ms, and not a runaway loop.
    expect(Number(await tree.getAttribute("data-sweep-frames"))).toBeLessThan(650 / 16 + 8);
  });

  test("a new release cancels the sweep in flight; at most one frame is ever pending", async ({ page }) => {
    await open(page);
    const tree = page.locator("#dwTree");
    await tree.scrollIntoViewIfNeeded();
    // Releases 200 ms apart: each lands while the previous 650 ms sweep is still running.
    for (const n of [30, 31, 32]) {
      await setRange(page, "dwN", n);
      await expect.poll(async () => Number(await tree.getAttribute("data-sweeps"))).toBe(n - 29);
      await expect(tree).toHaveAttribute("data-sweeping", "true");
      await ticks(page, 6);
    }
    await expect(tree).toHaveAttribute("data-sweeping", "false", { timeout: 3000 });
    expect(Number(await tree.getAttribute("data-raf-pending-max"))).toBe(1);
    // Three sweeps, two of them cut short: fewer frames than three whole sweeps.
    expect(Number(await tree.getAttribute("data-sweep-frames"))).toBeLessThan(3 * (650 / 16));
  });

  test("keyboard repeats announce and sweep once the steps settle", async ({ page }) => {
    await open(page);
    const tree = page.locator("#dwTree");
    await tree.scrollIntoViewIfNeeded();
    await page.locator("#dwN").focus();
    // Five quick steps, as a held arrow key gives.
    await page.evaluate(() => {
      const el = document.getElementById("dwN") as HTMLInputElement;
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      for (let n = 13; n <= 17; n++) {
        set.call(el, String(n));
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await expect(say(page)).toContainText("N = 17");
    await expect(tree).toHaveAttribute("data-sweeping", "false", { timeout: 3000 });
    expect(await tree.getAttribute("data-sweeps")).toBe("1");
  });

  test("under reduced motion there is no sweep and the tree is drawn at most once per change", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await noWatchdog(page);
    await open(page);
    await page.evaluate(() => document.fonts.ready);
    const tree = page.locator("#dwTree");
    await tree.scrollIntoViewIfNeeded();
    await ticks(page, 4);
    const before = Number(await tree.getAttribute("data-draws"));
    await page.locator("#dwN").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#dwBin")).toHaveText("10.0665");
    // The change has been handled once the announcement says so.
    await expect(say(page)).toContainText("N = 13");
    await ticks(page, 10);
    expect(await tree.getAttribute("data-sweep-frames")).toBe("0");
    expect(Number(await tree.getAttribute("data-draws")) - before).toBeLessThanOrEqual(1);
    await ctx.close();
  });

  test("the convergence marker follows N and the curve follows σ and K", async ({ page }) => {
    await open(page);
    const chart = page.locator("#dwChart");
    await expect(chart).toHaveAttribute("data-marker-n", "12");
    await expect(chart).toHaveAttribute("data-curve", "20|100");
    await setRange(page, "dwN", 77);
    await expect(chart).toHaveAttribute("data-marker-n", "77");
    await setRange(page, "dwK", 90);
    await expect(chart).toHaveAttribute("data-curve", "20|90");
  });

  test("a σ drag draws against the cached curve and recomputes it once per frame", async ({ page }) => {
    await open(page);
    const chart = page.locator("#dwChart");
    await expect(chart).toHaveAttribute("data-curve", "20|100");
    const before = Number(await chart.getAttribute("data-curves"));
    // Five drag inputs inside one frame: each draws at once against the cached curve.
    const atOnce = await page.evaluate(() => {
      const el = document.getElementById("dwS") as HTMLInputElement;
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      for (const v of [21, 22, 23, 24, 25]) {
        set.call(el, String(v));
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
      return (document.getElementById("dwChart") as HTMLCanvasElement).dataset.curve;
    });
    expect(atOnce).toBe("20|100");
    await expect(page.locator("#dwS")).toHaveValue("25");
    await expect(chart).toHaveAttribute("data-curve", "25|100");
    expect(Number(await chart.getAttribute("data-curves"))).toBe(before + 1);
  });

  test("tree text is drawn at 14px or larger", async ({ browser }) => {
    for (const width of [375, 1280]) {
      const ctx = await browser.newContext({ viewport: { width, height: 812 } });
      const page = await ctx.newPage();
      await noWatchdog(page);
      await page.addInitScript(() => {
        const sizes: number[] = [];
        (window as unknown as { __treeFonts: number[] }).__treeFonts = sizes;
        const orig = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function (...args: Parameters<typeof orig>) {
          if (this.canvas.id === "dwTree") sizes.push(parseFloat(this.font));
          return orig.apply(this, args);
        };
      });
      await open(page);
      // Wide values (K = 60, σ = 80%) and the "more steps" note.
      await setRange(page, "dwK", 60);
      await setRange(page, "dwS", 80);
      await setRange(page, "dwN", 40);
      await expect(page.locator("#dwBin")).not.toHaveText("9.7612");
      await ticks(page, 2);
      const sizes = await page.evaluate(() => (window as unknown as { __treeFonts: number[] }).__treeFonts);
      expect(sizes.length).toBeGreaterThan(10);
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(14);
      await ctx.close();
    }
  });

  test("a slider moved before hydration keeps its value", async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    // Hold the client scripts (not the styles) until the slider has been moved.
    await page.route("**/_next/static/chunks/**", async (route) => {
      if (new URL(route.request().url()).pathname.endsWith(".js")) await gate;
      await route.continue();
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      const el = document.getElementById("dwN") as HTMLInputElement;
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      set.call(el, "40");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    release();
    await expect(page.locator("#dwTree[data-draws]")).toHaveCount(1, { timeout: 15_000 });
    await expect(page.locator("#dwNo")).toHaveText("40");
    await expect(page.locator("#dwBin")).toHaveText("9.8755");
  });

  test("the 10 of 15 stamp beats once, the first time it is seen", async ({ page }) => {
    await open(page);
    const beats = () => page.evaluate(() => Number(document.documentElement.getAttribute("data-beats")));
    await expect.poll(beats).toBe(0);
    const big = page.locator("#diffusion [data-beat]");
    await expect(big).toContainText("10");
    await expect(big).toContainText("of 15");
    await big.scrollIntoViewIfNeeded();
    await expect.poll(beats).toBe(1);
    await expect(big).toHaveClass(/landed/);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await ticks(page, 6);
    await big.scrollIntoViewIfNeeded();
    await ticks(page, 12);
    expect(await beats()).toBe(1);
  });

  test("links and result copy are in place", async ({ page }) => {
    await open(page);
    await expect(ex(page).getByRole("heading", { level: 3, name: "DiffusionWorks" })).toHaveCount(1);
    // No disclaimer note under the question (refinement R2).
    await expect(ex(page).locator(".intro .note")).toHaveCount(0);
    await expect(ex(page).locator(".result")).toContainText("off at 23 of 24 up-barrier cells, where it consistently over-predicts");
    await expect(ex(page).locator(".result")).toContainText("none failed");
    await expect(ex(page).getByRole("link", { name: /Open the study/ })).toHaveAttribute("href", "https://diffusionworks.netlify.app");
    await expect(ex(page).getByRole("link", { name: /Source/ })).toHaveAttribute("href", "https://github.com/VM25/stochastic-lab");
    await expect(ex(page).locator(".result")).toContainText("16 of 18");
    await expect(ex(page).locator(".result")).toContainText("23 of 24");
  });
});
