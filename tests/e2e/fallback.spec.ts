import { expect, test, type Page } from "@playwright/test";

/*
  The no-WebGL fallback: pre-rendered stills cross-faded against scroll. The
  stills are only requested once the page has decided it cannot run the shader.
*/

/** Force the no-WebGL path in any browser: a context request returns null. */
async function stubNoWebGL(page: Page) {
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type === "webgl" || type === "experimental-webgl" || type === "webgl2") return null;
      return (orig as (...a: unknown[]) => unknown).call(this, type, ...rest);
    } as typeof orig;
  });
}

async function stillsMode(page: Page) {
  await expect(page.locator(".bg")).toHaveAttribute("data-mode", "stills");
}

async function opacities(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const out: Record<string, number> = {};
    document.querySelectorAll<HTMLImageElement>(".bg .stills img").forEach((img) => {
      const name = (img.getAttribute("src") ?? "").split("/").pop()!.replace(".jpg", "");
      out[name] = Number(getComputedStyle(img).opacity);
    });
    return out;
  });
}

async function scrollToP(page: Page, p: number) {
  await page.evaluate((v) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * v, behavior: "instant" });
  }, p);
}

test.describe("stills fallback", () => {
  test.beforeEach(async ({ page }) => {
    await stubNoWebGL(page);
  });

  test("the stills layer shows, the canvas hides, and the first still is fully opaque at the top", async ({ page }) => {
    await page.goto("/");
    await stillsMode(page);
    await expect(page.locator(".bg .stills")).toBeVisible();
    await expect(page.locator("canvas#world")).toBeHidden();
    await expect(page.locator(".bg")).toHaveAttribute("data-orientation", "land");
    await expect(page.locator(".bg .stills img")).toHaveCount(5);
    await expect.poll(async () => (await opacities(page)).land0).toBe(1);
    const o = await opacities(page);
    for (const k of ["land1", "land2", "land3", "land4"]) expect(o[k]).toBe(0);
  });

  test("the last still is fully opaque at the bottom", async ({ page }) => {
    await page.goto("/");
    await stillsMode(page);
    await scrollToP(page, 1);
    await expect.poll(async () => (await opacities(page)).land4).toBe(1);
    expect((await opacities(page)).land0).toBe(0);
  });

  test("between two measured keys the adjacent pair cross-fades and sums to one", async ({ page }) => {
    await page.goto("/");
    await stillsMode(page);
    const keys = await page.evaluate(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const top = (id: string) =>
        (document.querySelector(`[data-sec="${id}"]`) as HTMLElement).getBoundingClientRect().top + window.scrollY;
      return ["projects", "research"].map((id) => Math.min(0.97, Math.max(0.03, (top(id) - window.innerHeight * 0.25) / max)));
    });
    // Exactly on the projects key: land1 alone.
    await scrollToP(page, keys[0]);
    await expect.poll(async () => (await opacities(page)).land1).toBeGreaterThan(0.99);
    // Halfway to research: smoothstep(0.5) = 0.5 each.
    await scrollToP(page, (keys[0] + keys[1]) / 2);
    await expect
      .poll(async () => {
        const o = await opacities(page);
        return Math.abs(o.land1 - 0.5) < 0.05 && Math.abs(o.land2 - 0.5) < 0.05 && o.land0 === 0 && o.land3 === 0;
      })
      .toBe(true);
  });

  test("portrait viewports use the portrait set, and rotating swaps the set", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await stillsMode(page);
    await expect(page.locator(".bg")).toHaveAttribute("data-orientation", "port");
    await expect.poll(async () => Object.keys(await opacities(page)).sort()).toEqual(["port0", "port1", "port2", "port3", "port4"]);
    await expect.poll(async () => (await opacities(page)).port0).toBe(1);
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(page.locator(".bg")).toHaveAttribute("data-orientation", "land");
    await expect.poll(async () => Object.keys(await opacities(page)).sort()).toEqual(["land0", "land1", "land2", "land3", "land4"]);
    await expect.poll(async () => (await opacities(page)).land0).toBe(1);
  });

  test("the stills are decorative and never animate their opacity", async ({ browser }) => {
    for (const reducedMotion of ["reduce", "no-preference"] as const) {
      const ctx = await browser.newContext({ reducedMotion });
      const page = await ctx.newPage();
      await stubNoWebGL(page);
      await page.goto("/");
      await stillsMode(page);
      await expect(page.locator(".bg")).toHaveAttribute("aria-hidden", "true");
      await expect(page.locator(".bg .stills img").first()).toBeAttached();
      const info = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLImageElement>(".bg .stills img")].map((i) => ({
          alt: i.getAttribute("alt"),
          dur: getComputedStyle(i).transitionDuration,
        })),
      );
      expect(info.length).toBe(5);
      for (const i of info) {
        expect(i.alt).toBe("");
        expect(i.dur.split(",").every((d) => parseFloat(d) === 0)).toBe(true);
      }
      await ctx.close();
    }
  });
});

test("real no-WebGL browser: Chromium launched with WebGL disabled", async ({ browserName }) => {
  test.skip(browserName !== "chromium", "--disable-webgl is a Chromium flag; WebKit uses the stub above");
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch({ args: ["--disable-webgl", "--disable-3d-apis"] });
  const page = await browser.newPage({ baseURL: "http://localhost:3100" });
  await page.goto("/");
  await stillsMode(page);
  await expect(page.locator(".bg .stills")).toBeVisible();
  await expect(page.locator("canvas#world")).toBeHidden();
  await expect.poll(async () => (await opacities(page)).land0).toBe(1);
  await scrollToP(page, 1);
  await expect.poll(async () => (await opacities(page)).land4).toBe(1);
  await browser.close();
});

test("a normal launch with WebGL makes no request for the stills", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdog: false };
  });
  const requested: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/scene/")) requested.push(r.url());
  });
  await page.goto("/");
  const gl = await page.evaluate(() => {
    try {
      return !!document.createElement("canvas").getContext("webgl");
    } catch {
      return false;
    }
  });
  test.skip(!gl, "no WebGL in this browser build");
  await expect(page.locator(".bg")).toHaveAttribute("data-mode", "gl");
  await scrollToP(page, 0.5);
  await page.waitForTimeout(500);
  await scrollToP(page, 1);
  await page.waitForTimeout(500);
  expect(requested).toEqual([]);
  await expect(page.locator(".bg .stills img")).toHaveCount(0);
});
