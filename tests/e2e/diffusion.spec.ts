import { expect, test, type Page } from "@playwright/test";

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
const say = (page: Page) => page.locator("#diffusion .read [data-say]");

test.describe("DiffusionWorks exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await noWatchdog(page);
  });

  test("defaults show the binomial and Black–Scholes prices, the difference and p", async ({ page }) => {
    await open(page);
    await expect(page.locator("#dwBin")).toHaveText("9.7612");
    await expect(page.locator("#dwBS")).toHaveText("9.9251");
    await expect(page.locator("#dwGap")).toHaveText("−0.1639");
    await expect(page.locator("#dwLive")).toContainText("p = 0.51447");
    await expect(page.locator("#dwLive")).toContainText("u = 1.05943");
    await expect(page.locator("#dwLive")).toContainText("d = 0.94390");
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
    await expect(page.locator("#dwLive")).toContainText("p = 0.51447");
    await expect(page.locator("#diffusion")).not.toContainText("—");
    await ctx.close();
  });

  test("Review Focus 5: ArrowRight on the focused N slider updates the readouts and the live region", async ({ page }) => {
    await open(page);
    const read = page.locator("#diffusion .read");
    await expect(read).toHaveAttribute("aria-live", "polite");
    await expect(say(page)).toHaveAttribute("aria-atomic", "true");
    await expect(say(page)).toContainText("9.7612");
    await page.locator("#dwN").focus();
    await expect(page.locator("#dwN")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#dwNo")).toHaveText("13");
    await expect(page.locator("#dwBin")).toHaveText("10.0665");
    await expect(page.locator("#dwGap")).toHaveText("+0.1414");
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
        say: document.querySelector("#diffusion .read [data-say]")!.textContent,
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

  test("the tree shows 5 steps when its canvas is under 420px wide", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await open(page);
    const w = await page.locator("#dwTree").evaluate((e) => e.clientWidth);
    expect(w).toBeLessThan(420);
    await expect(page.locator("#dwTreeCap")).toContainText("First 5 of 12 steps.");
  });

  test("at 375px the blocks run intro, controls, visual, readouts, formulas, result", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await open(page);
    const order = ["intro", "ctrls", "viz", "read", "formula", "result"];
    const blocks = await ex(page).evaluate((el) =>
      Array.from(el.children)
        .filter((c) => getComputedStyle(c).display !== "none" && c.getBoundingClientRect().height > 0)
        .map((c) => ({ cls: c.className, top: c.getBoundingClientRect().top })),
    );
    expect(blocks.map((b) => b.cls.split(" ")[0])).toEqual(order);
    for (let i = 1; i < blocks.length; i++) expect(blocks[i].top).toBeGreaterThan(blocks[i - 1].top);
    // No horizontal scroll from the exhibit.
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });

  test("on wide screens the visual sits beside the controls", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page);
    const ctrls = await page.locator("#diffusion .ctrls").boundingBox();
    const viz = await page.locator("#diffusion .viz").boundingBox();
    const result = await page.locator("#diffusion .result").boundingBox();
    expect(viz!.x).toBeGreaterThan(ctrls!.x + ctrls!.width);
    expect(result!.x).toBeLessThan(viz!.x);
  });

  test("formulas are STIX, one per line, with true minus and no em dash", async ({ page }) => {
    await open(page);
    const lines = page.locator("#diffusion .formula .fl");
    await expect(lines).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      const box = await lines.nth(i).evaluate((e) => ({ ff: getComputedStyle(e).fontFamily, d: getComputedStyle(e).display }));
      expect(box.ff.toLowerCase()).toContain("stix");
      expect(box.d).toBe("block");
    }
    const formula = (await page.locator("#diffusion .formula").textContent()) ?? "";
    expect(formula).toContain("−");
    expect(formula).not.toMatch(/-/);
    const all = (await ex(page).textContent()) ?? "";
    expect(all).not.toContain("—");
    expect(all).not.toContain("--");
    expect(all).toContain("Black–Scholes");
  });

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

  test("formulas fit a 320px screen without scrolling sideways", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await open(page);
    const f = page.locator("#diffusion .formula");
    const m = await f.evaluate((e) => ({ sw: e.scrollWidth, cw: e.clientWidth }));
    expect(m.sw).toBeLessThanOrEqual(m.cw);
    const lines = await page.locator("#diffusion .formula .fl").evaluateAll((els) =>
      els.map((e) => ({ sw: e.scrollWidth, cw: e.clientWidth })),
    );
    for (const l of lines) expect(l.sw).toBeLessThanOrEqual(l.cw);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
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
    await expect(ex(page)).toContainText("an illustration on this page, not one of the fifteen studies");
    await expect(ex(page).getByRole("link", { name: /Open the study/ })).toHaveAttribute("href", "https://diffusionworks.netlify.app");
    await expect(ex(page).getByRole("link", { name: /Source/ })).toHaveAttribute("href", "https://github.com/VM25/stochastic-lab");
    await expect(ex(page).locator(".result")).toContainText("16 of 18");
    await expect(ex(page).locator(".result")).toContainText("23 of 24");
  });
});
