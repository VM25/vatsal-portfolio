import { expect, test, type Page } from "@playwright/test";
import { DAWN_MAX } from "../../src/lib/scene";
import { measuredKeys } from "./helpers";

type Hook = { frames?: number; p?: number; keys?: number[]; dawn?: number };
const hook = (page: Page) =>
  page.evaluate(() => (window as unknown as { __CLEARING_TEST__: Hook }).__CLEARING_TEST__);

/*
  Headless browsers render WebGL in software, so the frame-time watchdog would
  trip on a perfectly healthy page. Tests switch off only the watchdog; one test
  below switches it back on with a zero threshold to prove it fires. They also set
  preserve, so the scene canvas can be read back with toDataURL.
*/
async function noWatchdog(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdog: false, preserve: true };
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

/** Where a chapter sits against its anchor landing: its top minus the computed scroll-padding-top. */
async function offAnchor(page: Page, id: string): Promise<number> {
  return page.evaluate((id) => {
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    return Math.abs(document.getElementById(id)!.getBoundingClientRect().top - pad);
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

  test("scrolling to the bottom warms the scene and changes nothing on the page", async ({ page }) => {
    await page.goto("/");
    test.skip(!(await hasWebGL(page)), "no WebGL in this browser build");
    expect(await sceneMode(page)).toBe("gl");
    await expect.poll(async () => (await hook(page)).dawn).toBe(0);
    const before = await page.evaluate(() => document.documentElement.className);
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
    await expect.poll(async () => (await hook(page)).p).toBe(1);
    expect((await hook(page)).dawn).toBeCloseTo(DAWN_MAX, 6);
    expect(await page.evaluate(() => document.documentElement.className)).toBe(before);
    await expect(page.locator("html")).not.toHaveClass(/\bmorning\b/);
    await expect(page.locator("[data-clock], [data-time], [data-clocktime], [data-tsec], .top .clock")).toHaveCount(0);
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

  test("Review Focus 2: resizing mid-scroll re-measures the keys and the orientation", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    test.skip(!(await hasWebGL(page)), "no WebGL in this browser build");
    expect(await sceneMode(page)).toBe("gl");
    await expect(page.locator(".bg")).toHaveAttribute("data-orientation", "land");
    const near = (a: number[] | undefined, b: number[]) =>
      !!a && a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1e-6);

    await scrollToSection(page, "research");
    const wide = await measuredKeys(page);
    // The scene draws with the keys measured from this layout.
    await expect.poll(async () => near((await hook(page)).keys, wide)).toBe(true);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(".bg")).toHaveAttribute("data-orientation", "port");
    // Wait for the reflow to settle into different keys, then the scene must use them.
    // (Any key: since refinement R7 Research's own key moves by under 0.005 between these
    // two layouts, while Projects' moves by about 0.05.)
    await expect
      .poll(async () => Math.max(...(await measuredKeys(page)).map((k, i) => Math.abs(k - wide[i]))))
      .toBeGreaterThan(0.005);
    await expect.poll(async () => near((await hook(page)).keys, await measuredKeys(page))).toBe(true);
    // The scene follows the scroll position after the reflow.
    await expect.poll(async () => Math.abs(((await hook(page)).p ?? -1) - (await progress(page)))).toBeLessThan(1e-6);

    // A jump to Research after the reflow lands on its anchor, on Research's key.
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("dialog", { name: "Sections" }).getByRole("link", { name: "Research" }).click();
    await expect.poll(() => offAnchor(page, "research")).toBeLessThanOrEqual(2);
    const key = (await measuredKeys(page))[2];
    await expect.poll(async () => Math.abs(((await hook(page)).p ?? -1) - key)).toBeLessThan(0.002);
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

  test("without WebGL the stills stand in and still follow the scroll", async ({ page }) => {
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
    await expect(page.locator('.bg .stills img[src$="4.jpg"]')).toHaveCSS("opacity", "1");
    await expect(page.locator("html")).not.toHaveClass(/\bmorning\b/);
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

  test("the GPU watchdog drops to the stills when draws are too slow", async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    // -1 ms: any measured draw time is "too slow", so the watchdog must trip.
    await page.addInitScript(() => {
      (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdogMs: -1, preserve: true };
    });
    await page.goto("/");
    if (!(await hasWebGL(page))) {
      expect(await sceneMode(page)).toBe("stills");
      await ctx.close();
      return;
    }
    await expect(page.locator(".bg")).toHaveAttribute("data-fallback", "slow", { timeout: 10_000 });
    await expect(page.locator(".bg .stills")).toBeVisible();
    await expect(page.locator("canvas#world")).toBeHidden();
    await ctx.close();
  });

  test("no JavaScript: every heading readable over the stills", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator("main h1")).toBeVisible();
    const h2 = page.locator("main h2");
    await expect(h2).toHaveCount(4);
    for (let i = 0; i < 4; i++) await expect(h2.nth(i)).toBeVisible();
    await expect(page.locator(".bg .stills")).toBeVisible();
    await expect(page.locator("canvas#world")).toBeHidden();
    const still = page.locator('.bg .stills img[src="/scene/land0.jpg"]');
    await expect(still).toBeVisible();
    await expect(still).toHaveAttribute("alt", "");
    await expect(still).toHaveCSS("opacity", "1");
    await expect.poll(() => still.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBe(1440);
    await ctx.close();
  });

  test("a hidden tab stops the scene drawing; a visible one starts it again", async ({ page }) => {
    await page.goto("/");
    expect(await sceneMode(page)).toBe("gl");
    const frames = () =>
      page.evaluate(() => (window as unknown as { __CLEARING_TEST__: { frames?: number } }).__CLEARING_TEST__.frames ?? 0);
    const setHidden = (hidden: boolean) =>
      page.evaluate((hidden) => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
        Object.defineProperty(document, "visibilityState", { configurable: true, get: () => (hidden ? "hidden" : "visible") });
        document.dispatchEvent(new Event("visibilitychange"));
      }, hidden);
    await expect.poll(frames).toBeGreaterThan(5);
    await setHidden(true);
    const atHide = await frames();
    await page.waitForTimeout(600);
    expect(await frames(), "no frames drawn while hidden").toBe(atHide);
    await setHidden(false);
    await expect.poll(frames).toBeGreaterThan(atHide + 3);
  });

  test("the scene canvas is capped at one device pixel per CSS pixel", async ({ browser }) => {
    const ctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 800, height: 600 } });
    const page = await ctx.newPage();
    await noWatchdog(page);
    await page.goto("/");
    await sceneMode(page);
    const dims = await page.evaluate(() => {
      const c = document.getElementById("world") as HTMLCanvasElement;
      const b = document.querySelector(".bg")!.getBoundingClientRect();
      return { dpr: window.devicePixelRatio, cw: c.width, ch: c.height, w: b.width, h: b.height };
    });
    expect(dims.dpr).toBe(2);
    expect(dims.cw).toBe(Math.round(dims.w));
    expect(dims.ch).toBe(Math.round(dims.h));
    await ctx.close();
  });

  test("beats start at zero on the root element", async ({ page }) => {
    await page.goto("/");
    await sceneMode(page);
    await expect(page.locator("html")).toHaveAttribute("data-beats", "0");
  });
});

/*
  The watchdog runs at its production threshold here. It must judge the GPU,
  not the frame spacing: throttled requestAnimationFrame and one long stall are
  not a slow GPU.
*/
test.describe("watchdog at the production threshold", () => {
  // Headless Chromium draws with SwiftShader on the CPU. Measured median
  // draw + sync: ≈19 ms at 1280×720 alone, but above 50 ms when two workers
  // share the CPU, which is a genuinely slow "GPU". At 400×300 it is ≈3 ms,
  // so these tests isolate the frame-spacing behaviour they are about.
  test.use({ viewport: { width: 400, height: 300 } });

  test("throttled requestAnimationFrame keeps the live scene", async ({ page }) => {
    await page.addInitScript(() => {
      const timers = new Map<number, ReturnType<typeof setTimeout>>();
      let id = 0;
      window.requestAnimationFrame = (cb: FrameRequestCallback) => {
        const n = ++id;
        timers.set(
          n,
          setTimeout(() => {
            timers.delete(n);
            cb(performance.now());
          }, 400),
        );
        return n;
      };
      window.cancelAnimationFrame = (n: number) => {
        clearTimeout(timers.get(n));
        timers.delete(n);
      };
    });
    await page.goto("/");
    if (!(await hasWebGL(page))) {
      expect(await sceneMode(page)).toBe("stills");
      return;
    }
    await expect(page.locator(".bg")).toHaveAttribute("data-mode", "gl");
    await page.waitForTimeout(4000);
    await expect(page.locator(".bg")).toHaveAttribute("data-mode", "gl");
    await expect(page.locator(".bg")).not.toHaveAttribute("data-fallback", /.*/);
  });

  test("one long main-thread stall keeps the live scene", async ({ page }) => {
    await page.goto("/");
    if (!(await hasWebGL(page))) {
      expect(await sceneMode(page)).toBe("stills");
      return;
    }
    await expect(page.locator(".bg")).toHaveAttribute("data-mode", "gl");
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      const end = performance.now() + 1500;
      while (performance.now() < end) {
        /* block the main thread once */
      }
    });
    await page.waitForTimeout(4000);
    await expect(page.locator(".bg")).toHaveAttribute("data-mode", "gl");
    await expect(page.locator(".bg")).not.toHaveAttribute("data-fallback", /.*/);
  });
});
