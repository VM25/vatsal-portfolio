import { expect, test, type Page } from "@playwright/test";
import { research } from "../../src/data/research";

/*
  Research: the premise, three claims as an accordion of buttons with their evidence,
  the Now line, the limit and the links. The premise is the page's third and last beat;
  the Sharpe bars draw on it.

  Test hooks: .claims carries data-ready once hydrated and data-play ("true" once the
  bars have been released); each .ev carries data-drawn.
*/

async function noWatchdog(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdog: false };
  });
}

async function open(page: Page, url = "/") {
  await page.goto(url);
  await expect(page.locator("#research .claims[data-ready]")).toHaveCount(1);
}

async function ticks(page: Page, n: number) {
  await page.evaluate(async (n) => {
    for (let i = 0; i < n; i++) await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, n);
}

const sec = (page: Page) => page.locator("#research");
const claim = (page: Page, i: number) => sec(page).locator("button.claim").nth(i);
const beats = (page: Page) => page.evaluate(() => Number(document.documentElement.getAttribute("data-beats")));
/** Computed transforms of the Sharpe bars. */
const sharpeBars = (page: Page) =>
  sec(page).locator("#ev-sharpe .bar").evaluateAll((els) => els.map((e) => getComputedStyle(e).transform));

/** Minutes past midnight from "4:45 a.m.". */
function minutes(s: string): number {
  const m = /(\d+):(\d\d)/.exec(s)!;
  return Number(m[1]) * 60 + Number(m[2]);
}

test.describe("Research chapter", () => {
  test.beforeEach(async ({ page }) => {
    await noWatchdog(page);
  });

  test("premise, question and three claims come from the data", async ({ page }) => {
    await open(page);
    await expect(sec(page).locator(".premise")).toHaveText(research.premise);
    await expect(sec(page).locator(".premise")).toHaveAttribute("data-beat-fog", "");
    await expect(sec(page).locator(".ask")).toContainText(research.paperTitle);
    await expect(sec(page).locator(".ask")).toContainText(research.ask);
    await expect(sec(page).locator("button.claim")).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const c = research.claims[i];
      const b = claim(page, i);
      await expect(b).toContainText(c.context);
      await expect(b.locator(".ct")).toHaveText(c.text);
      const ctrl = await b.getAttribute("aria-controls");
      const region = page.locator(`#${ctrl}`);
      await expect(region).toHaveAttribute("role", "region");
      await expect(region).toHaveAttribute("aria-labelledby", (await b.getAttribute("id"))!);
      await expect(b).toHaveAttribute("aria-expanded", i === 0 ? "true" : "false");
      const box = (await b.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await expect(sec(page).locator(".now")).toContainText(research.now.label);
    await expect(sec(page).locator(".now")).toContainText(research.now.body);
    await expect(sec(page).locator(".lim")).toHaveText(research.limit);
    const all = (await sec(page).textContent()) ?? "";
    expect(all).not.toContain("—");
  });

  test("clicking claim 3 shows the identity and hides claim 1's evidence", async ({ page }) => {
    await open(page);
    await expect(page.locator("#ev-sharpe")).toBeVisible();
    await expect(page.locator("#ev-identity")).toBeHidden();
    await claim(page, 2).click();
    await expect(claim(page, 2)).toHaveAttribute("aria-expanded", "true");
    await expect(claim(page, 0)).toHaveAttribute("aria-expanded", "false");
    await expect(claim(page, 1)).toHaveAttribute("aria-expanded", "false");
    const ident = page.locator("#ev-identity");
    await expect(ident).toBeVisible();
    await expect(ident).toContainText("Δy");
    await expect(ident).toContainText("not a pure measure of expected inflation");
    await expect(ident).toContainText(research.evidence.identity.body);
    await expect(ident.locator(".def")).toHaveText(research.evidence.identity.definition);
    await expect(ident.locator(".ident")).toHaveCSS("font-family", /STIX/);
    await expect(page.locator("#ev-sharpe")).toBeHidden();
    // One open at a time.
    await claim(page, 1).click();
    await expect(page.locator("#ev-drawdown")).toBeVisible();
    await expect(ident).toBeHidden();
    await expect(page.locator("#ev-sharpe")).toBeHidden();
  });

  test("the evidence graphics carry their labels and the scale is 0 to 0.8", async ({ page }) => {
    await open(page);
    const sharpe = page.locator("#ev-sharpe svg");
    await expect(sharpe).toHaveAttribute("role", "img");
    await expect(sharpe).toHaveAttribute(
      "aria-label",
      "Full-sample Sharpe ratio, 2007 to 2026: static 60/40 0.66, regime-aware rule 0.48",
    );
    const lens = await sharpe.locator(".bar").evaluateAll((els) =>
      els.map((e) => Number(e.getAttribute("x2")) - Number(e.getAttribute("x1"))),
    );
    expect(lens[0]).toBeCloseTo((0.66 / 0.8) * 500, 0);
    expect(lens[1]).toBeCloseTo((0.48 / 0.8) * 500, 0);
    await expect(sharpe).toContainText("0.66");
    await expect(sharpe).toContainText("0.48");
    await expect(sharpe).toContainText("Static 60/40");
    await expect(page.locator("#ev-sharpe .ctitle")).toHaveText(research.evidence.sharpe.chartTitle);
    await expect(page.locator("#ev-drawdown .ctitle")).toHaveText(research.evidence.drawdown.chartTitle);
    await expect(sharpe).toContainText("Regime-aware rule");
    await expect(page.locator("#ev-sharpe .src")).toHaveText(research.evidence.sharpe.source);
    for (const b of await sharpe.locator(".bar").all()) {
      await expect(b).toHaveCSS("transform-box", "view-box");
    }

    await claim(page, 1).click();
    const drop = page.locator("#ev-drawdown svg");
    await expect(drop).toHaveAttribute("role", "img");
    await expect(drop).toHaveAttribute(
      "aria-label",
      "Long-duration Treasury hedge book, modeled 2022 replay: a loss of roughly 19 percent",
    );
    await expect(drop).toContainText("≈ −19%");
    await expect(drop).toContainText(research.evidence.drawdown.note);
    await expect(drop.locator(".bar")).toHaveCSS("transform-box", "view-box");
    await expect(drop.locator(".bar")).toHaveAttribute("data-ax", "y");
  });

  test("each claim's text is at most three lines at 1440", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page);
    const lines = await sec(page).locator("button.claim .ct").evaluateAll((els) =>
      els.map((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        const tops = new Set<number>();
        for (const b of r.getClientRects()) if (b.width > 0) tops.add(Math.round(b.top));
        const lh = parseFloat(getComputedStyle(el).lineHeight);
        return { tops: tops.size, byHeight: Math.round(el.getBoundingClientRect().height / lh) };
      }),
    );
    for (const l of lines) {
      expect(l.byHeight).toBeLessThanOrEqual(3);
      expect(l.tops).toBeLessThanOrEqual(3);
    }
  });

  test("evidence sits beside the claims at 1440 and under each claim at 375", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page);
    let c = (await claim(page, 0).boundingBox())!;
    let e = (await page.locator("#ev-sharpe").boundingBox())!;
    expect(e.x).toBeGreaterThan(c.x + c.width);

    await page.setViewportSize({ width: 375, height: 812 });
    await ticks(page, 3);
    c = (await claim(page, 0).boundingBox())!;
    e = (await page.locator("#ev-sharpe").boundingBox())!;
    const c2 = (await claim(page, 1).boundingBox())!;
    expect(e.y).toBeGreaterThanOrEqual(c.y + c.height - 1);
    expect(e.y + e.height).toBeLessThanOrEqual(c2.y + 1);
    await claim(page, 2).click();
    const c3 = (await claim(page, 2).boundingBox())!;
    const e3 = (await page.locator("#ev-identity").boundingBox())!;
    expect(e3.y).toBeGreaterThanOrEqual(c3.y + c3.height - 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });

  for (const width of [320, 375, 414, 768, 1024, 1280, 1440]) {
    test(`chart text renders at 14px or more, tick labels at 12px or more, inside the chart, at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page);
      for (const i of [0, 1]) {
        await claim(page, i).click();
        const ev = sec(page).locator(".ev.on");
        await expect(ev.locator(".ctitle")).toHaveCSS("font-size", "14px");
        const sizes = await ev.locator("svg").evaluate((svg) => {
          const box = svg.getBoundingClientRect();
          const k = box.width / (svg as SVGSVGElement).viewBox.baseVal.width;
          return [...svg.querySelectorAll("text")].map((t) => ({
            text: t.textContent,
            tick: !!t.closest(".ticks"),
            px: parseFloat(getComputedStyle(t).fontSize) * k,
            right: t.getBoundingClientRect().right,
            limit: box.right,
          }));
        });
        expect(sizes.length).toBeGreaterThan(2);
        for (const s of sizes) {
          expect(s.px, `${s.text}`).toBeGreaterThanOrEqual(s.tick ? 12 : 14);
          expect(s.right, `${s.text} overflows the chart`).toBeLessThanOrEqual(s.limit + 1);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }

  test("links: SSRN and the prospectus, each announced as opening a new tab", async ({ page, request }) => {
    await open(page);
    const links = sec(page).locator(".ex-links a");
    await expect(links).toHaveCount(2);
    const ssrn = sec(page).getByRole("link", { name: /Read on SSRN/ });
    const pros = sec(page).getByRole("link", { name: /FE800 prospectus/ });
    await expect(ssrn).toHaveAttribute("href", research.links.ssrn.href);
    await expect(pros).toHaveAttribute("href", "/research/Maniar-Research-Prospectus.pdf");
    for (const a of [ssrn, pros]) {
      await expect(a).toHaveAccessibleName(/, opens in a new tab$/);
      await expect(a).toHaveAttribute("target", "_blank");
    }
    expect((await request.get("/research/Maniar-Research-Prospectus.pdf")).status()).toBe(200);
  });

  test("the premise is the third beat: bars wait at zero, then draw on it, once", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page);
    expect(await beats(page)).toBe(0);
    await expect(sec(page).locator(".claims")).toHaveAttribute("data-play", "false");
    // With motion and JavaScript, the bars start at zero length.
    for (const t of await sharpeBars(page)) expect(t).toMatch(/^matrix\(0, 0, 0, 1, 0, 0\)$/);
    await sec(page).locator(".premise").evaluate((p) => {
      const y = p.getBoundingClientRect().top + window.scrollY - 200;
      window.scrollTo({ top: y, behavior: "instant" });
    });
    await expect.poll(() => beats(page)).toBe(1);
    await expect(sec(page).locator(".claims")).toHaveAttribute("data-play", "true");
    await expect(sec(page).locator(".premise")).toHaveClass(/landed/);
    await expect.poll(() => sharpeBars(page), { timeout: 4000 }).toEqual(["none", "none"]);
    // Leaving and coming back does not beat again.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await ticks(page, 6);
    await sec(page).locator(".premise").scrollIntoViewIfNeeded();
    await ticks(page, 12);
    expect(await beats(page)).toBe(1);
  });

  test("opening a claim before the beat still draws its bar", async ({ page }) => {
    await open(page);
    await claim(page, 1).evaluate((b) => (b as HTMLButtonElement).click());
    await expect
      .poll(() => page.locator("#ev-drawdown .bar").evaluate((e) => getComputedStyle(e).transform), { timeout: 4000 })
      .toBe("none");
  });

  test("under reduced motion the bars are full from the start", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await noWatchdog(page);
    await open(page);
    expect(await sharpeBars(page)).toEqual(["none", "none"]);
    await sec(page).locator(".premise").scrollIntoViewIfNeeded();
    await expect.poll(() => beats(page)).toBeGreaterThanOrEqual(1);
    await expect(sec(page).locator(".premise")).not.toHaveClass(/landed/);
    expect(await sharpeBars(page)).toEqual(["none", "none"]);
    await ctx.close();
  });

  test("if the observer never fires, the beat and the bars still happen", async ({ page }) => {
    await page.addInitScript(() => {
      class DeadObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      }
      (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = DeadObserver;
    });
    await open(page);
    await sec(page).locator(".premise").evaluate((p) => {
      const y = p.getBoundingClientRect().top + window.scrollY - 200;
      window.scrollTo({ top: y, behavior: "instant" });
    });
    await expect.poll(() => beats(page)).toBe(1);
    await expect.poll(() => sharpeBars(page), { timeout: 4000 }).toEqual(["none", "none"]);
  });

  test("bars in view never stay at zero, even when the premise is not", async ({ page }) => {
    // Short enough that the evidence can be in view with the premise above the fold.
    await page.setViewportSize({ width: 375, height: 480 });
    await open(page);
    // Come up from below: the evidence is in view, the premise is above the viewport.
    await page.locator("#ev-sharpe").evaluate((e) => {
      const y = e.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + 10;
      window.scrollTo({ top: y, behavior: "instant" });
    });
    const premiseVisible = await sec(page).locator(".premise").evaluate((p) => {
      const r = p.getBoundingClientRect();
      return Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / r.height;
    });
    expect(premiseVisible).toBeLessThan(0.5);
    await expect.poll(() => sharpeBars(page), { timeout: 4000 }).toEqual(["none", "none"]);
  });

  test("exactly three beats over a full scroll", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page);
    expect(await beats(page)).toBe(0);
    const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    for (let y = 0; y <= total + 400; y += 320) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      await ticks(page, 3);
    }
    // The market-making run takes about 4.2 s before its cut beats.
    await expect.poll(() => beats(page), { timeout: 15_000 }).toBe(3);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    for (let y = 0; y <= total + 400; y += 320) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      await ticks(page, 2);
    }
    await ticks(page, 20);
    expect(await beats(page)).toBe(3);
    await expect(page.locator("html")).toHaveAttribute("data-beats", "3");
  });

  test("Review Focus 4: /#research lands on Research with the nav, clock and claims matching", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/#research");
    await expect(page.locator("#research .claims[data-ready]")).toHaveCount(1);
    await page.evaluate(() => document.fonts.ready);
    await ticks(page, 4);
    await expect(page.getByRole("heading", { level: 2, name: research.title })).toBeInViewport();
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Research" })).toHaveAttribute("aria-current", "true");
    const key = (await sec(page).locator("[data-time] [data-clocktime]").textContent())!;
    await expect
      .poll(async () => Math.abs(minutes((await page.locator(".top .clock").textContent())!) - minutes(key)))
      .toBeLessThanOrEqual(1);
    await expect(sec(page).locator(".premise")).toBeInViewport();
    await expect(sec(page).locator(".premise")).toBeVisible();
    for (let i = 0; i < 3; i++) await expect(claim(page, i)).toBeVisible();
    await expect(page.locator("#ev-sharpe")).toBeVisible();
    await expect.poll(() => sharpeBars(page), { timeout: 4000 }).toEqual(["none", "none"]);
    // The landing holds once everything above has settled.
    await page.waitForLoadState("load");
    await ticks(page, 10);
    await expect(page.getByRole("heading", { level: 2, name: research.title })).toBeInViewport();
  });

  test("without JavaScript every claim shows its evidence and every link is visible", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(sec(page).locator(".premise")).toBeVisible();
    for (let i = 0; i < 3; i++) await expect(claim(page, i)).toBeVisible();
    for (const id of ["#ev-sharpe", "#ev-drawdown", "#ev-identity"]) await expect(page.locator(id)).toBeVisible();
    await expect(page.locator("#ev-identity")).toContainText("not a pure measure of expected inflation");
    expect(await sharpeBars(page)).toEqual(["none", "none"]);
    for (const a of await sec(page).locator("a").all()) await expect(a).toBeVisible();
    await ctx.close();
  });

  test("before hydration, only the first claim's evidence shows", async ({ page }) => {
    await page.route(/\/_next\/static\/chunks\/.*\.js/, (r) => r.abort());
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/\bjs\b/);
    await expect(page.locator("#ev-sharpe")).toBeVisible();
    await expect(page.locator("#ev-drawdown")).toBeHidden();
    await expect(page.locator("#ev-identity")).toBeHidden();
  });
});
