import { expect, test, type Page } from "@playwright/test";

/*
  The Liquidity Paradox: a seeded toy market maker. The default state (420 trades from
  seed 20261106) is +420 − 476 − 40 = −96 ticks; see tests/unit/mmToy.test.ts.

  Test hooks on #liquidity: data-run-id (runs started), data-running, data-steps (trades
  so far), data-runs-done, data-beat-count (beats this exhibit asked for), data-rush (the
  last rush it set), data-timers-pending / data-timers-pending-max (setTimeout callbacks
  requested and not yet run or cancelled).
*/

const FINAL = { trades: "420", earned: "+420", lost: "−476", random: "−40", net: "−96" };
const FINAL_EQ = "+420 − 476 − 40 = −96 ticks";

async function noWatchdog(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdog: false };
  });
}

/** Load the page at the top and wait until the exhibit has hydrated (it marks data-run-id). */
async function open(page: Page) {
  await page.goto("/");
  await expect(page.locator("#liquidity[data-run-id]")).toHaveCount(1);
}

/** Wait for n animation frames. */
async function ticks(page: Page, n: number) {
  await page.evaluate(async (n) => {
    for (let i = 0; i < n; i++) await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, n);
}

const ex = (page: Page) => page.locator("#liquidity");

async function counters(page: Page) {
  return page.evaluate(() => {
    const t = (id: string) => document.getElementById(id)!.textContent;
    return { trades: t("mmT"), earned: t("mmE"), lost: t("mmL"), random: t("mmU"), net: t("mmN") };
  });
}

/**
 * Watch every DOM update of the counters and the equation line. At each observer
 * callback, read all five counters, the equation and the run id once, and check the
 * accounting. Results land on window.__mm.
 */
async function watch(page: Page) {
  await page.evaluate(() => {
    const root = document.getElementById("liquidity")!;
    const parse = (s: string) => Number(s.replace("−", "-").replace(/,/g, ""));
    const abs = (v: number) => Math.abs(v).toLocaleString("en-US");
    const sgn = (v: number) => (v < 0 ? "−" : "+") + abs(v);
    const log = {
      updates: 0,
      failures: [] as string[],
      runs: [] as string[],
      backwards: 0,
      lastByRun: {} as Record<string, number>,
      sawRunning: false,
    };
    (window as unknown as { __mm: typeof log }).__mm = log;
    const check = () => {
      const txt = (id: string) => document.getElementById(id)!.textContent ?? "";
      const T = parse(txt("mmT"));
      const E = parse(txt("mmE"));
      const L = parse(txt("mmL"));
      const U = parse(txt("mmU"));
      const N = parse(txt("mmN"));
      const eq = txt("mmEq");
      const run = root.dataset.runId ?? "?";
      if (root.dataset.running === "true") log.sawRunning = true;
      log.updates += 1;
      const lost = -L;
      const want = `${sgn(E)} ${lost >= 0 ? "−" : "+"} ${abs(lost)} ${U >= 0 ? "+" : "−"} ${abs(U)} = ${sgn(N)} ticks`;
      const bad: string[] = [];
      if (E + L + U !== N) bad.push(`identity ${E}+${L}+${U}!=${N}`);
      if (E !== T) bad.push(`earned ${E} != trades ${T}`);
      if (L % 2 !== 0) bad.push(`lost ${L} odd`);
      if (eq !== want) bad.push(`eq "${eq}" != "${want}"`);
      if (bad.length) log.failures.push(`run ${run}, trades ${T}: ${bad.join("; ")}`);
      if (!log.runs.includes(run)) log.runs.push(run);
      const prev = log.lastByRun[run];
      if (prev !== undefined && T < prev) log.backwards += 1;
      log.lastByRun[run] = T;
    };
    const mo = new MutationObserver(check);
    for (const id of ["mmT", "mmE", "mmL", "mmU", "mmN", "mmEq"]) {
      mo.observe(document.getElementById(id)!, { characterData: true, childList: true, subtree: true });
    }
  });
}

type Log = { updates: number; failures: string[]; runs: string[]; backwards: number; sawRunning: boolean };
const readLog = (page: Page) => page.evaluate(() => (window as unknown as { __mm: Log }).__mm);

async function expectFinal(page: Page) {
  expect(await counters(page)).toEqual(FINAL);
  await expect(page.locator("#mmEq")).toHaveText(FINAL_EQ);
}

async function bringIntoView(page: Page) {
  await page.locator("#liquidity .mm-stage").scrollIntoViewIfNeeded();
}

test.describe("Liquidity Paradox exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await noWatchdog(page);
  });

  test("without JavaScript the page shows the final 420-trade state", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expectFinal(page);
    await expect(ex(page).getByRole("heading", { level: 3, name: "The Liquidity Paradox" })).toHaveCount(1);
    await expect(ex(page).locator(".cut")).toBeVisible();
    await expect(ex(page).locator(".cut .big")).toContainText("4.2%");
    await ctx.close();
  });

  test("before it is seen, the hydrated exhibit still reads the final state", async ({ page }) => {
    await open(page);
    await expect(ex(page)).toHaveAttribute("data-run-id", "0");
    await expect(ex(page)).toHaveAttribute("data-running", "false");
    await expectFinal(page);
    await expect(page.locator("#mmT + span")).toHaveText("trades");
    await expect(page.locator("#mmN + span")).toHaveText("net, in ticks");
  });

  test("the caption, canvas label and copy follow the data, with true minus and no em dash", async ({ page }) => {
    await open(page);
    const cap = ex(page).locator(".mm-stage .cap");
    await expect(cap).toContainText("Illustration only");
    await expect(cap).toContainText("Not the study's data");
    await expect(cap).toContainText("−");
    const c = page.locator("#mmCanvas");
    await expect(c).toHaveAttribute("role", "img");
    await expect(c).toHaveAttribute("aria-label", "Illustration: a simulated market maker's quotes and fills, speeding up");
    const all = (await ex(page).textContent()) ?? "";
    expect(all).not.toContain("—");
    expect(all).not.toContain("--");
    await expect(ex(page).locator(".cut")).toContainText("4.2%");
    await expect(ex(page).locator(".cut")).toContainText("11 to 12 bp");
    await expect(ex(page).locator(".cut")).toContainText("Modeled historical replay");
    await expect(ex(page).getByRole("link", { name: /Open the study/ })).toHaveAttribute("href", "https://liquidityparadox.netlify.app");
    await expect(ex(page).getByRole("link", { name: /Source/ })).toHaveAttribute("href", "https://github.com/VM25/liquidity-lab");
  });

  test("seen once, it runs from zero, reconciling at every update, and lands on the default state", async ({ page }) => {
    await open(page);
    await watch(page);
    await bringIntoView(page);
    await expect(ex(page)).toHaveAttribute("data-run-id", "1");
    await expect(ex(page)).toHaveAttribute("data-running", "true");
    // Counters are quiet for screen readers while running.
    await expect(page.locator("#liquidity .mm-count")).toHaveAttribute("aria-hidden", "true");
    await expect.poll(async () => Number(await ex(page).getAttribute("data-rush"))).toBeGreaterThan(0);
    await expect(ex(page)).toHaveAttribute("data-running", "false", { timeout: 15_000 });
    const log = await readLog(page);
    expect(log.failures).toEqual([]);
    expect(log.sawRunning).toBe(true);
    // The schedule has 135 ticks; a loaded machine merges late ones, but a run is still many updates.
    expect(log.updates).toBeGreaterThan(20);
    expect(log.backwards).toBe(0);
    expect(log.runs).toEqual(["1"]);
    await expectFinal(page);
    await expect(ex(page)).toHaveAttribute("data-steps", "420");
    await expect(ex(page)).toHaveAttribute("data-rush", "0");
    expect(Number(await ex(page).getAttribute("data-timers-pending-max"))).toBe(1);
    await expect(ex(page)).toHaveAttribute("data-timers-pending", "0");
    // The cut: one beat, the stamp, and the counters readable again.
    await expect(ex(page)).toHaveAttribute("data-beat-count", "1");
    await expect(page.locator("#liquidity .cut .big")).toHaveClass(/landed/);
    await expect(page.locator("#liquidity .mm-count")).not.toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#liquidity .mm-eq")).not.toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#liquidity [data-say]")).toHaveText("Run finished: net −96 ticks over 420 trades.");
    await expect(page.locator("#liquidity [data-say]")).toHaveAttribute("aria-live", "polite");
    // Scrolling away and back does not start another run.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await ticks(page, 4);
    await bringIntoView(page);
    await ticks(page, 8);
    await expect(ex(page)).toHaveAttribute("data-run-id", "1");
  });

  test("Review Focus 3: five clicks on Run it again within 300 ms leave one run that ends on a clean state", async ({ page }) => {
    await open(page);
    await watch(page);
    await bringIntoView(page);
    await expect(ex(page)).toHaveAttribute("data-running", "true");
    await expect.poll(async () => Number(await ex(page).getAttribute("data-steps"))).toBeGreaterThan(5);
    const button = ex(page).getByRole("button", { name: "Run it again" });
    const { took, after } = await button.evaluate(async (b) => {
      const t0 = performance.now();
      const after: [string, string][] = [];
      const root = document.getElementById("liquidity")!;
      // Five clicks, one animation frame apart (each its own task, with a render between):
      // each lands while the run before it is in flight. Frames, not timers: a loaded
      // test machine can hold a 40 ms timer back for 100 ms or more.
      for (let i = 0; i < 5; i++) {
        if (i > 0) await new Promise((r) => requestAnimationFrame(() => r(null)));
        (b as HTMLButtonElement).click();
        after.push([root.dataset.runId ?? "", document.getElementById("mmT")!.textContent ?? ""]);
      }
      return { took: performance.now() - t0, after };
    });
    expect(took).toBeLessThan(300);
    // Each click restarts from zero at once: a new run id and the first trade.
    expect(after).toEqual([
      ["2", "1"],
      ["3", "1"],
      ["4", "1"],
      ["5", "1"],
      ["6", "1"],
    ]);
    await expect(ex(page)).toHaveAttribute("data-run-id", "6");
    await expect(ex(page)).toHaveAttribute("data-running", "true");
    // Only one run's timer is ever pending.
    expect(Number(await ex(page).getAttribute("data-timers-pending"))).toBeLessThanOrEqual(1);
    await expect(ex(page)).toHaveAttribute("data-running", "false", { timeout: 15_000 });
    const log = await readLog(page);
    expect(log.failures).toEqual([]);
    expect(log.backwards).toBe(0);
    // Restarts 3 to 5 rewrite the same first trade, so the observer may not see them
    // as changes; the runs it saw are in order and end on the last one.
    expect(log.runs[0]).toBe("1");
    expect(log.runs.at(-1)).toBe("6");
    expect(log.runs.map(Number)).toEqual([...log.runs.map(Number)].sort((a, b) => a - b));
    expect(Number(await ex(page).getAttribute("data-timers-pending-max"))).toBe(1);
    await expect(ex(page)).toHaveAttribute("data-timers-pending", "0");
    await expectFinal(page);
    await expect(ex(page)).toHaveAttribute("data-steps", "420");
    await expect(ex(page)).toHaveAttribute("data-runs-done", "1");
    // Replays do not beat: the first completed run gave the exhibit's one beat.
    await expect(ex(page)).toHaveAttribute("data-beat-count", "1");
    await expect(ex(page)).toHaveAttribute("data-rush", "0");
  });

  test("Run it again after a finished run replays from zero without another beat", async ({ page }) => {
    await open(page);
    await bringIntoView(page);
    await expect(ex(page)).toHaveAttribute("data-runs-done", "1", { timeout: 15_000 });
    await watch(page);
    const button = ex(page).getByRole("button", { name: "Run it again" });
    await expect(button).toBeEnabled();
    const box = await button.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await button.click();
    await expect(ex(page)).toHaveAttribute("data-run-id", "2");
    await expect(page.locator("#liquidity [data-say]")).toHaveText("");
    await expect(button).toBeEnabled();
    await expect(ex(page)).toHaveAttribute("data-runs-done", "2", { timeout: 15_000 });
    const log = await readLog(page);
    expect(log.failures).toEqual([]);
    expect(log.backwards).toBe(0);
    await expectFinal(page);
    await expect(ex(page)).toHaveAttribute("data-beat-count", "1");
    await expect(page.locator("#liquidity [data-say]")).toHaveText("Run finished: net −96 ticks over 420 trades.");
  });

  test("a hidden tab pauses the run and a visible one resumes it", async ({ page }) => {
    await open(page);
    await bringIntoView(page);
    await expect(ex(page)).toHaveAttribute("data-running", "true");
    await expect.poll(async () => Number(await ex(page).getAttribute("data-steps"))).toBeGreaterThan(3);
    const setHidden = (hidden: boolean) =>
      page.evaluate((hidden) => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
        Object.defineProperty(document, "visibilityState", { configurable: true, get: () => (hidden ? "hidden" : "visible") });
        document.dispatchEvent(new Event("visibilitychange"));
      }, hidden);
    await setHidden(true);
    await expect(ex(page)).toHaveAttribute("data-timers-pending", "0");
    const parked = await ex(page).getAttribute("data-steps");
    await ticks(page, 40);
    expect(await ex(page).getAttribute("data-steps")).toBe(parked);
    await expect(ex(page)).toHaveAttribute("data-running", "true");
    await setHidden(false);
    await expect(ex(page)).toHaveAttribute("data-running", "false", { timeout: 15_000 });
    await expectFinal(page);
  });

  test("under reduced motion the run is instant: the final state, no rush, no stamp", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await noWatchdog(page);
    await open(page);
    await watch(page);
    await bringIntoView(page);
    await expect(ex(page)).toHaveAttribute("data-runs-done", "1");
    await expect(ex(page)).toHaveAttribute("data-run-id", "1");
    await expectFinal(page);
    let log = await readLog(page);
    expect(log.failures).toEqual([]);
    expect(log.sawRunning).toBe(false);
    await expect(ex(page)).toHaveAttribute("data-rush", "0");
    await expect(ex(page)).toHaveAttribute("data-timers-pending-max", "0");
    await expect(ex(page)).toHaveAttribute("data-beat-count", "1");
    await expect(page.locator("#liquidity .cut .big")).not.toHaveClass(/landed/);
    await expect(page.locator("#liquidity [data-say]")).toHaveText("Run finished: net −96 ticks over 420 trades.");
    // Run it again recomputes at once.
    await ex(page).getByRole("button", { name: "Run it again" }).click();
    await expect(ex(page)).toHaveAttribute("data-runs-done", "2");
    await expectFinal(page);
    log = await readLog(page);
    expect(log.failures).toEqual([]);
    expect(log.sawRunning).toBe(false);
    await expect(ex(page)).toHaveAttribute("data-beat-count", "1");
    await expect(ex(page)).toHaveAttribute("data-timers-pending-max", "0");
    await ctx.close();
  });

  test("the canvas is sized by CSS width at DPR capped at 2, drawn, with text at 14px or larger", async ({ browser }) => {
    const ctx = await browser.newContext({ deviceScaleFactor: 3, viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await noWatchdog(page);
    await page.addInitScript(() => {
      const sizes: number[] = [];
      const fills: string[] = [];
      (window as unknown as { __mmFonts: number[]; __mmFills: string[] }).__mmFonts = sizes;
      (window as unknown as { __mmFills: string[] }).__mmFills = fills;
      const text = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function (...args: Parameters<typeof text>) {
        if (this.canvas.id === "mmCanvas") sizes.push(parseFloat(this.font));
        return text.apply(this, args);
      };
      const fill = CanvasRenderingContext2D.prototype.fill;
      CanvasRenderingContext2D.prototype.fill = function (this: CanvasRenderingContext2D, ...args: unknown[]) {
        if (this.canvas.id === "mmCanvas") fills.push(String(this.fillStyle).toLowerCase());
        return (fill as (...a: unknown[]) => void).apply(this, args);
      };
    });
    await open(page);
    const c = page.locator("#mmCanvas");
    await bringIntoView(page);
    await expect(ex(page)).toHaveAttribute("data-runs-done", "1", { timeout: 15_000 });
    expect(await c.evaluate((e) => (e as HTMLCanvasElement).width - Math.round(e.clientWidth * 2))).toBe(0);
    expect(await c.evaluate((e) => e.clientHeight)).toBe(250);
    const inked = await c.evaluate((e) => {
      const cv = e as HTMLCanvasElement;
      const d = cv.getContext("2d")!.getImageData(0, 0, cv.width, cv.height).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
      return n;
    });
    expect(inked).toBeGreaterThan(500);
    const { sizes, fills } = await page.evaluate(() => ({
      sizes: (window as unknown as { __mmFonts: number[] }).__mmFonts,
      fills: (window as unknown as { __mmFills: string[] }).__mmFills,
    }));
    expect(sizes.length).toBeGreaterThan(0);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(14);
    // Informed fills are sodium.
    expect(fills).toContain("#ffa62b");
    await ctx.close();
  });

  test("at 375px the exhibit runs intro, stage, cut without scrolling sideways", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await open(page);
    const blocks = await ex(page).evaluate((el) =>
      Array.from(el.children)
        .filter((c) => getComputedStyle(c).display !== "none" && c.getBoundingClientRect().height > 0)
        .map((c) => ({ cls: c.className.split(" ")[0], top: c.getBoundingClientRect().top })),
    );
    expect(blocks.map((b) => b.cls)).toEqual(["intro", "mm-stage", "cut"]);
    for (let i = 1; i < blocks.length; i++) expect(blocks[i].top).toBeGreaterThan(blocks[i - 1].top);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });
});
