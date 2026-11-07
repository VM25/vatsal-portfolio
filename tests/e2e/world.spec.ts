import { expect, test, type Page } from "@playwright/test";
import { CHAPTERS, clockAt } from "../../src/lib/scene";

/*
  Headless browsers render WebGL in software, so the frame-time watchdog would
  trip on a perfectly healthy page. Tests switch off only the watchdog; one test
  below switches it back on with a zero threshold to prove it fires.
*/
async function noWatchdog(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdog: false };
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

/** Wait until the scene has settled into one of its two modes. */
async function sceneMode(page: Page): Promise<string> {
  const bg = page.locator(".bg");
  await expect(bg).toHaveAttribute("data-mode", /^(gl|stills)$/);
  return (await bg.getAttribute("data-mode")) as string;
}

/** Distinct colours in a 32×32 downsample of the scene canvas, read through toDataURL. */
async function canvasColours(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const c = document.getElementById("world") as HTMLCanvasElement;
    const img = new Image();
    img.src = c.toDataURL("image/png");
    await img.decode();
    const s = document.createElement("canvas");
    s.width = 32;
    s.height = 32;
    const g = s.getContext("2d")!;
    g.drawImage(img, 0, 0, 32, 32);
    const d = g.getImageData(0, 0, 32, 32).data;
    const seen = new Set<number>();
    for (let i = 0; i < d.length; i += 4) seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
    return seen.size;
  });
}

async function canvasSnapshot(page: Page): Promise<string> {
  return page.evaluate(() => (document.getElementById("world") as HTMLCanvasElement).toDataURL("image/png"));
}

/** The key positions as the page should measure them from the live layout. */
async function measuredKeys(page: Page): Promise<number[]> {
  return page.evaluate((order) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ks = order.map((id, i) => {
      if (i === 0) return 0;
      if (i === order.length - 1) return 1;
      const s = document.querySelector(`[data-sec="${id}"]`) as HTMLElement;
      const top = s.getBoundingClientRect().top + window.scrollY;
      return Math.min(0.97, Math.max(0.03, (top - window.innerHeight * 0.25) / max));
    });
    for (let i = 1; i < ks.length; i++) if (ks[i] <= ks[i - 1]) ks[i] = ks[i - 1] + 0.01;
    return ks;
  }, CHAPTERS as string[]);
}

async function progress(page: Page): Promise<number> {
  return page.evaluate(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  });
}

async function scrollToSection(page: Page, id: string) {
  await page.evaluate((sel) => {
    const el = document.getElementById(sel)!;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
  }, id);
}

test.describe("page shell and world", () => {
  test.beforeEach(async ({ page }) => {
    await noWatchdog(page);
  });

  test("five chapters in order, each with its anchor", async ({ page }) => {
    await page.goto("/");
    const secs = page.locator("[data-sec]");
    await expect(secs).toHaveCount(5);
    expect(await secs.evaluateAll((els) => els.map((e) => [e.getAttribute("data-sec"), e.id]))).toEqual([
      ["home", "top"],
      ["projects", "projects"],
      ["research", "research"],
      ["path", "path"],
      ["contact", "contact"],
    ]);
  });

  test("the scene canvas draws a non-blank picture", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("canvas#world")).toBeAttached();
    if (!(await hasWebGL(page))) {
      // No WebGL in this browser build: the stills must stand in.
      expect(await sceneMode(page)).toBe("stills");
      await expect(page.locator(".bg .stills")).toBeVisible();
      await expect(page.locator("canvas#world")).toBeHidden();
      return;
    }
    expect(await sceneMode(page)).toBe("gl");
    await expect(page.locator("canvas#world")).toBeVisible();
    await expect(page.locator(".bg .stills")).toBeHidden();
    expect(await canvasColours(page)).toBeGreaterThan(8);
  });

  test("scrolling to the bottom reaches 6:12 a.m. and morning", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".top .clock")).toHaveText("2:04 a.m.");
    await expect(page.locator("html")).not.toHaveClass(/\bmorning\b/);
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
    await expect(page.locator(".top .clock")).toHaveText("6:12 a.m.");
    await expect(page.locator("html")).toHaveClass(/\bmorning\b/);
  });

  test("Review Focus 1: losing the WebGL context swaps to the stills within 500 ms", async ({ page }) => {
    await page.goto("/");
    test.skip(!(await hasWebGL(page)), "no WebGL in this browser build; the no-WebGL path is covered below");
    expect(await sceneMode(page)).toBe("gl");
    await page.evaluate(() => {
      const c = document.getElementById("world") as HTMLCanvasElement;
      c.getContext("webgl")!.getExtension("WEBGL_lose_context")!.loseContext();
    });
    await expect(page.locator(".bg .stills")).toBeVisible({ timeout: 500 });
    await expect(page.locator("canvas#world")).toBeHidden({ timeout: 500 });
    await expect(page.locator(".bg")).toHaveAttribute("data-fallback", "context-lost");
  });

  test("Review Focus 2: resizing mid-scroll re-measures keys, labels and orientation", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await sceneMode(page);
    await expect(page.locator(".bg")).toHaveAttribute("data-orientation", "land");

    const label = page.locator('[data-sec="research"] [data-time]');
    await scrollToSection(page, "research");
    const wideKey = (await measuredKeys(page))[2];
    await expect(label).toHaveText(new RegExp(`^${clockAt(wideKey)} · `));
    const wideLabel = await label.textContent();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(".bg")).toHaveAttribute("data-orientation", "port");
    const narrowKey = (await measuredKeys(page))[2];
    expect(clockAt(narrowKey)).not.toBe(clockAt(wideKey));
    await expect(label).toHaveText(new RegExp(`^${clockAt(narrowKey)} · `));
    expect(await label.textContent()).not.toBe(wideLabel);

    // The clock still agrees with the scroll position after the reflow.
    await expect(page.locator(".top .clock")).toHaveText(clockAt(await progress(page)));
  });

  test("no horizontal scroll at 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/");
    await sceneMode(page);
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(over).toBeLessThanOrEqual(0);
  });

  test("without WebGL the stills stand in and the clock still runs", async ({ page }) => {
    await page.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (type === "webgl" || type === "experimental-webgl" || type === "webgl2") return null;
        return (orig as (...a: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof orig;
    });
    await page.goto("/");
    expect(await sceneMode(page)).toBe("stills");
    await expect(page.locator(".bg")).toHaveAttribute("data-fallback", "no-webgl");
    await expect(page.locator(".bg .stills")).toBeVisible();
    await expect(page.locator("canvas#world")).toBeHidden();
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
    await expect(page.locator(".top .clock")).toHaveText("6:12 a.m.");
  });

  test("reduced motion freezes time but the scene still follows scroll", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await noWatchdog(page);
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/\brm\b/);
    if (!(await hasWebGL(page))) {
      expect(await sceneMode(page)).toBe("stills");
      await ctx.close();
      return;
    }
    expect(await sceneMode(page)).toBe("gl");
    const a = await canvasSnapshot(page);
    await page.waitForTimeout(600);
    expect(await canvasSnapshot(page)).toBe(a);
    await scrollToSection(page, "research");
    await expect.poll(() => canvasSnapshot(page)).not.toBe(a);
    await ctx.close();
  });

  test("the frame-time watchdog drops to the stills when frames are too slow", async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdogMs: 0 };
    });
    await page.goto("/");
    if (!(await hasWebGL(page))) {
      expect(await sceneMode(page)).toBe("stills");
      await ctx.close();
      return;
    }
    await expect(page.locator(".bg")).toHaveAttribute("data-fallback", "slow", { timeout: 8000 });
    await expect(page.locator(".bg .stills")).toBeVisible();
    await expect(page.locator("canvas#world")).toBeHidden();
    await ctx.close();
  });

  test("beats start at zero on the root element", async ({ page }) => {
    await page.goto("/");
    await sceneMode(page);
    await expect(page.locator("html")).toHaveAttribute("data-beats", "0");
  });
});
