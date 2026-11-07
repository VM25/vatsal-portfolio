import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { research } from "../../src/data/research";
import { projects } from "../../src/data/projects";

/*
  Research: the premise, three claims as an accordion of buttons with their evidence,
  the Now line and the links. The premise is the page's third and last beat;
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

/** Pixels between Research's top and its anchor landing (the computed scroll-padding-top). */
const offAnchor = (page: Page) =>
  page.evaluate(() => {
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    return Math.abs(document.getElementById("research")!.getBoundingClientRect().top - pad);
  });

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
    // The limit line was removed in refinement R2; the question ends after the method.
    await expect(sec(page).locator(".lim")).toHaveCount(0);
    expect(research.ask.endsWith("and measures why the hedge failed.")).toBe(true);
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
    // The chart title carries "modeled 2022 replay"; there is no extra note (refinement R2).
    await expect(page.locator("#ev-drawdown .ctitle")).toHaveText(research.evidence.drawdown.chartTitle);
    await expect(drop.locator("text")).toHaveCount(2);
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

  /*
    Refinement R4: each piece of evidence is one <figure> (caption, chart, or formula and
    its explanation) directly under its claim at every width, anchored to it, with
    nothing sticky. Pieces marked data-fade dissolve before the sticky top bar reaches them.
  */
  const figs = [{ id: "#ev-sharpe" }, { id: "#ev-drawdown" }, { id: "#ev-identity" }];

  for (const vp of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
    { width: 375, height: 812 },
  ]) {
    test(`each figure is one unit directly under its claim, at ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await open(page);
      for (let i = 0; i < 3; i++) {
        if (i) await claim(page, i).click();
        const fig = page.locator(`${figs[i].id} figure`);
        await expect(fig).toHaveCount(1);
        // The caption is the figure's own: first child for the charts, last for the identity.
        await expect(fig.locator("> figcaption")).toHaveCount(1);
        const c = (await claim(page, i).boundingBox())!;
        const f = (await fig.boundingBox())!;
        // Anchored: the figure's top within 24px under the open claim's bottom, same left edge.
        expect(f.y - (c.y + c.height)).toBeGreaterThanOrEqual(-1);
        expect(f.y - (c.y + c.height)).toBeLessThanOrEqual(24);
        expect(Math.abs(f.x - c.x)).toBeLessThanOrEqual(1);
        expect(f.x + f.width).toBeLessThanOrEqual(c.x + c.width + 1);
        // And before the next claim (or the Now line).
        const next = i < 2 ? (await claim(page, i + 1).boundingBox())! : (await sec(page).locator(".now").boundingBox())!;
        expect(f.y + f.height).toBeLessThanOrEqual(next.y + 1);
        // Every part of the unit lies inside the figure's box.
        const out = await fig.evaluate((el) => {
          const b = el.getBoundingClientRect();
          return [...el.querySelectorAll("*")]
            .map((n) => ({ n: `${n.tagName}.${n.getAttribute("class") ?? ""}`, r: n.getBoundingClientRect() }))
            .filter(({ r }) => r.width > 0 && (r.top < b.top - 1 || r.bottom > b.bottom + 1 || r.left < b.left - 1 || r.right > b.right + 1))
            .map(({ n }) => n);
        });
        expect(out).toEqual([]);
        // Nothing in Research is sticky or fixed.
        const stuck = await sec(page).evaluate((s) =>
          [...s.querySelectorAll("*")].filter((n) => /sticky|fixed/.test(getComputedStyle(n).position)).length,
        );
        expect(stuck).toBe(0);
      }
      // The Sharpe note sits inside the Sharpe figure, in its caption.
      await claim(page, 0).click();
      await expect(page.locator("#ev-sharpe figure > figcaption .src")).toHaveText(research.evidence.sharpe.source);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width);
    });
  }

  /*
    The scroll sweep. Every 40px through Research with each claim open, each part of the
    open figure (caption, title, note, svg, each bar, each value and label, the axis, each
    tick; the formula and its explanation) is either fully below the top bar or out of
    sight (under the bar, off screen, or dissolved to opacity 0): never seen cut by the bar
    while another part of the figure shows. The parts that show form one unbroken run,
    from the first one shown to the figure's end in view.
  */
  for (const vp of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    test(`scroll sweep: no figure part is cut by the top bar while the rest shows, at ${vp.width}x${vp.height}`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize(vp);
      await open(page);
      await page.evaluate(() => document.fonts.ready);
      for (let i = 0; i < 3; i++) {
        await claim(page, i).evaluate((b) => (b as HTMLButtonElement).click());
        await expect(claim(page, i)).toHaveAttribute("aria-expanded", "true");
        const { from, to } = await sec(page).locator(".claims").evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { from: Math.max(0, r.top + scrollY - innerHeight), to: r.bottom + scrollY };
        });
        let steps = 0;
        for (let y = from; y <= to; y += 40) {
          await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
          await ticks(page, 2);
          const s = await page.evaluate((id) => {
            const bar = document.querySelector("header.top")!.getBoundingClientRect().bottom;
            const fig = document.querySelector(`${id} figure`)!;
            const parts = [
              ...fig.querySelectorAll(
                "figcaption, .ctitle, .src, svg, .bar, svg text, svg line:not(.bar), .ident, .note",
              ),
            ];
            const seen = (el: Element) => {
              let o = 1;
              for (let n: Element | null = el; n && n !== fig.parentElement; n = n.parentElement) {
                o *= parseFloat(getComputedStyle(n).opacity);
              }
              return o;
            };
            return parts.map((el) => {
              const r = el.getBoundingClientRect();
              const onScreen = r.bottom > bar && r.top < innerHeight;
              return {
                name: `${el.tagName}.${el.getAttribute("class") ?? ""} "${(el.textContent ?? "").slice(0, 16)}"`,
                top: r.top,
                cut: r.top < bar && r.bottom > bar,
                shown: onScreen && seen(el) > 0,
              };
            });
          }, figs[i].id);
          const shown = s.filter((p) => p.shown);
          const cutShown = shown.filter((p) => p.cut);
          if (shown.length > 1) {
            expect(cutShown.map((p) => p.name), `claim ${i + 1} at scrollY ${Math.round(y)}`).toEqual([]);
          }
          // One unbroken run: no hidden part on screen below a shown part.
          const firstShown = Math.min(...shown.map((p) => p.top));
          const gaps = s.filter((p) => !p.shown && !p.cut && p.top > firstShown && p.top < vp.height);
          expect(gaps.map((p) => p.name), `claim ${i + 1} at scrollY ${Math.round(y)}`).toEqual([]);
          steps++;
        }
        expect(steps).toBeGreaterThan(20);
      }
    });
  }

  for (const vp of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    test(`opening another claim keeps it where it was on screen, at ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await open(page);
      // Claim 1 open, its figure on screen above claim 2.
      await claim(page, 0).evaluate((b) => {
        window.scrollTo({ top: b.getBoundingClientRect().top + window.scrollY - 120, behavior: "instant" });
      });
      await ticks(page, 3);
      for (const [from, to] of [
        [0, 1],
        [1, 2],
        [2, 0],
        [0, 2],
      ]) {
        await expect(claim(page, from)).toHaveAttribute("aria-expanded", "true");
        // Where a reader can click it (a click scrolls a claim that is cut by the viewport into view first).
        await claim(page, to).scrollIntoViewIfNeeded();
        await ticks(page, 2);
        const before = (await claim(page, to).boundingBox())!.y;
        const scrollBefore = await page.evaluate(() => window.scrollY);
        await claim(page, to).click();
        await expect(claim(page, to)).toHaveAttribute("aria-expanded", "true");
        await ticks(page, 3);
        const after = (await claim(page, to).boundingBox())!.y;
        const fig = (await page.locator(`${figs[to].id} figure`).boundingBox())!;
        const inView = fig.y >= 0 && fig.y + fig.height <= vp.height;
        expect(Math.abs(after - before) <= 4 || inView, `claim ${from + 1} to ${to + 1}: moved ${after - before}px`).toBe(true);
        // A figure that closed above the clicked claim was compensated for by scrolling.
        if (to > from) expect(await page.evaluate(() => window.scrollY)).toBeLessThan(scrollBefore);
      }
    });
  }

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
            r: t.getBoundingClientRect().toJSON() as DOMRect,
            box: box.toJSON() as DOMRect,
          }));
        });
        expect(sizes.length).toBeGreaterThanOrEqual(2);
        for (const s of sizes) {
          expect(s.px, `${s.text}`).toBeGreaterThanOrEqual(s.tick ? 12 : 14);
          // Each label's whole text box inside the chart (refinement R4: the SVG clips at its edge).
          expect(s.r.right, `${s.text} overflows the chart`).toBeLessThanOrEqual(s.box.right + 1);
          expect(s.r.left, `${s.text} overflows the chart`).toBeGreaterThanOrEqual(s.box.left - 1);
          expect(s.r.top, `${s.text} overflows the chart`).toBeGreaterThanOrEqual(s.box.top - 1);
          expect(s.r.bottom, `${s.text} overflows the chart`).toBeLessThanOrEqual(s.box.bottom + 1);
        }
        await expect(ev.locator("svg")).toHaveCSS("overflow", "hidden");
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
    await expect(pros).toHaveAccessibleName(/^FE800 prospectus ?\(PDF\), opens in a new tab$/);
    await expect(ssrn).not.toHaveAccessibleName(/PDF/);
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

  test("Review Focus 4: /#research lands on Research's anchor with the nav and claims matching", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/#research");
    await expect(page.locator("#research .claims[data-ready]")).toHaveCount(1);
    await page.evaluate(() => document.fonts.ready);
    await ticks(page, 4);
    await expect(page.getByRole("heading", { level: 2, name: research.title })).toBeInViewport();
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Research" })).toHaveAttribute("aria-current", "true");
    await expect.poll(() => offAnchor(page)).toBeLessThanOrEqual(2);
    await expect(sec(page).locator(".premise")).toBeInViewport();
    await expect(sec(page).locator(".premise")).toBeVisible();
    for (let i = 0; i < 3; i++) await expect(claim(page, i)).toBeVisible();
    await expect(page.locator("#ev-sharpe")).toBeVisible();
    await expect.poll(() => sharpeBars(page), { timeout: 4000 }).toEqual(["none", "none"]);
    // The landing holds once everything above has settled.
    await page.waitForLoadState("load");
    await ticks(page, 10);
    await expect(page.getByRole("heading", { level: 2, name: research.title })).toBeInViewport();
    expect(await offAnchor(page)).toBeLessThanOrEqual(2);
    await expect(nav.getByRole("link", { name: "Research" })).toHaveAttribute("aria-current", "true");
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

  test("when the bundle never arrives, the page expands after five seconds", async ({ page }) => {
    await page.route(/\/_next\/static\/chunks\/.*\.js/, (r) => r.abort());
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/\bjs\b/);
    // The head script gives the bundle five seconds, then drops .js.
    await expect(page.locator("html")).not.toHaveClass(/\bjs\b/, { timeout: 7000 });
    await expect(page.locator("html")).not.toHaveAttribute("data-hydrated", /.*/);
    for (const id of ["#ev-sharpe", "#ev-drawdown", "#ev-identity"]) await expect(page.locator(id)).toBeVisible();
    // The bars grow out from zero (their usual transition) to full length.
    await expect.poll(() => sharpeBars(page), { timeout: 4000 }).toEqual(["none", "none"]);
    await expect
      .poll(() => page.locator("#ev-drawdown .bar").evaluate((e) => getComputedStyle(e).transform), { timeout: 4000 })
      .toBe("none");
    const more = page.locator("#more");
    for (const p of projects.rail) {
      await expect(more.getByRole("heading", { level: 4, name: p.title })).toBeVisible();
      await expect(more.getByText(p.question, { exact: true }).filter({ visible: true })).toHaveCount(1);
      await expect(more.locator(`a[href="${p.live}"]`).filter({ visible: true })).toHaveCount(1);
    }
  });

  test("claims are buttons inside level-3 headings (the accordion pattern)", async ({ page }) => {
    await open(page);
    for (let i = 0; i < 3; i++) {
      const parent = await claim(page, i).evaluate((b) => b.parentElement!.tagName);
      expect(parent).toBe("H3");
    }
    await expect(sec(page).getByRole("heading", { level: 3 })).toHaveCount(3);
    // The heading adds no styling: the claim keeps its prototype type.
    await expect(claim(page, 0)).toHaveCSS("font-weight", "400");
    await expect(claim(page, 0)).toHaveCSS("font-size", "18.4px");
  });

  for (const vp of [
    { width: 1280, height: 800 },
    { width: 375, height: 812 },
  ]) {
    test(`axe: no serious or critical violations in Research at ${vp.width}, claim 1 then claim 3 open`, async ({ page }) => {
      await page.setViewportSize(vp);
      await open(page);
      await sec(page).locator(".premise").scrollIntoViewIfNeeded();
      const serious = async () => {
        const r = await new AxeBuilder({ page }).include("#research").analyze();
        return r.violations
          .filter((v) => v.impact === "serious" || v.impact === "critical")
          .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
      };
      await expect(claim(page, 0)).toHaveAttribute("aria-expanded", "true");
      expect(await serious()).toEqual([]);
      await claim(page, 2).click();
      await expect(claim(page, 2)).toHaveAttribute("aria-expanded", "true");
      expect(await serious()).toEqual([]);
    });
  }
});

test.describe("deep links", () => {
  test.beforeEach(async ({ page }) => {
    await noWatchdog(page);
  });

  for (const hash of ["#%", "#%E0%A4%A"]) {
    test(`a malformed hash (${hash}) loads without page errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`/${hash}`);
      await expect(page.locator("#research .claims[data-ready]")).toHaveCount(1);
      await page.waitForLoadState("load");
      await page.evaluate(() => document.fonts.ready);
      await ticks(page, 4);
      expect(errors).toEqual([]);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(sec(page).locator(".premise")).toBeVisible();
    });
  }

  test("a reload keeps the reader's scroll position instead of jumping back to the hash", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/#research");
    await expect(page.locator("#research .claims[data-ready]")).toHaveCount(1);
    await page.waitForLoadState("load");
    await page.evaluate(() => document.fonts.ready);
    await ticks(page, 4);
    // Well past the hash's landing (a fixed 3000 sat too close once Projects got shorter, refinement R3).
    await page.evaluate(() => {
      const top = document.getElementById("research")!.getBoundingClientRect().top + window.scrollY + 1000;
      window.scrollTo({ top, behavior: "instant" });
    });
    await ticks(page, 10);
    // Where the reader is now (scroll anchoring may have nudged it while content above settled).
    const y = await page.evaluate(() => window.scrollY);
    const anchor = await sec(page).evaluate((s) => s.getBoundingClientRect().top + window.scrollY - 76);
    expect(Math.abs(y - anchor)).toBeGreaterThan(200);
    // WebKit saves the scroll position into the history entry a moment after scrolling.
    await ticks(page, 30);
    await page.reload();
    await expect(page.locator("#research .claims[data-ready]")).toHaveCount(1);
    await page.waitForLoadState("load");
    await page.evaluate(() => document.fonts.ready);
    await ticks(page, 10);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(y - 60);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(y + 60);
  });

  test("a phone /#research load shifts the layout by at most 0.05 (CLS)", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "layout-shift entries are a Chromium API");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      const w = window as unknown as { __cls: number; __shifts: string[] };
      w.__cls = 0;
      w.__shifts = [];
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as unknown as {
          value: number;
          hadRecentInput: boolean;
          sources?: { node?: Node }[];
        }[]) {
          if (e.hadRecentInput) continue;
          w.__cls += e.value;
          const el = e.sources?.[0]?.node as Element | undefined;
          w.__shifts.push(`${e.value.toFixed(4)} ${el?.nodeName ?? "?"}#${el?.id ?? ""}.${el?.className ?? ""}`);
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/#research");
    await expect(page.locator("#research .claims[data-ready]")).toHaveCount(1);
    await page.waitForLoadState("load");
    await page.evaluate(() => document.fonts.ready);
    await ticks(page, 30);
    const r = await page.evaluate(() => {
      const w = window as unknown as { __cls: number; __shifts: string[] };
      return { cls: w.__cls, shifts: w.__shifts };
    });
    console.log(`CLS on a 390x844 /#research load: ${r.cls.toFixed(4)} ${JSON.stringify(r.shifts)}`);
    expect(r.cls).toBeLessThanOrEqual(0.05);
  });
});
