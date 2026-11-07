import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { research } from "../../src/data/research";
import { projects } from "../../src/data/projects";

/*
  Research: the premise beside the paper (its title, question and SSRN link), then the
  three findings. Refinement R7: no accordion. Each finding is one row in normal flow,
  its text (context line and claim heading) on the left and its figure on the right from
  a 900px page, the figure directly under the text on phones. All three figures show at
  once, with or without JavaScript. The premise is the page's third and last beat; the
  bars draw on it.

  Test hooks: .claims carries data-ready once hydrated and data-play ("true" once the
  bars have been released); each chart figure (.ev) carries data-drawn.
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
const finding = (page: Page, i: number) => sec(page).locator(".finding").nth(i);
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

/** Research's height: its top to the next chapter's top. */
const sectionHeight = (page: Page) =>
  page.evaluate(() => {
    const s = document.getElementById("research")!;
    return Math.round(s.nextElementSibling!.getBoundingClientRect().top - s.getBoundingClientRect().top);
  });

/** The figures, in finding order. */
const figs = ["#ev-sharpe", "#ev-drawdown", "#ev-identity"];

/** Any part of a figure drawn outside its box (empty when the figure is one closed unit). */
const outside = (page: Page, id: string) =>
  page.locator(id).evaluate((el) => {
    const b = el.getBoundingClientRect();
    return [...el.querySelectorAll("*")]
      .map((n) => ({ n: `${n.tagName}.${n.getAttribute("class") ?? ""}`, r: n.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && (r.top < b.top - 1 || r.bottom > b.bottom + 1 || r.left < b.left - 1 || r.right > b.right + 1))
      .map(({ n }) => n);
  });

/** Nothing in Research is sticky or fixed. */
const stuck = (page: Page) =>
  sec(page).evaluate((s) => [...s.querySelectorAll("*")].filter((n) => /sticky|fixed/.test(getComputedStyle(n).position)).length);

/*
  Research's height at commit 13a192b (R6, before this refinement), measured from its top
  to Path's top with the first claim open: 1363px at 1440x900 and 1280x800 (and 1024x768),
  1566px at 390x844 and 1561px at 375x812.
*/
const BEFORE: Record<string, number> = { "1440x900": 1363, "1280x800": 1363 };

test.describe("Research chapter", () => {
  test.beforeEach(async ({ page }) => {
    await noWatchdog(page);
  });

  test("premise, paper and three findings come from the data; no accordion, no dated note, one link", async ({ page }) => {
    await open(page);
    await expect(sec(page).locator(".premise")).toHaveText(research.premise);
    await expect(sec(page).locator(".premise")).toHaveAttribute("data-beat-fog", "");
    await expect(sec(page).locator(".ask")).toContainText(research.paperTitle);
    await expect(sec(page).locator(".ask")).toContainText(research.ask);
    // The method stays in the question (refinement R7 shortened the rest).
    expect(research.ask).toContain("lagged, observable signals, realistic costs and position limits");
    expect(research.ask.endsWith("and measures why the hedge failed.")).toBe(true);
    await expect(sec(page).locator(".finding")).toHaveCount(3);
    await expect(sec(page).getByRole("heading", { level: 3 })).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const c = research.claims[i];
      await expect(finding(page, i).locator(".ctx")).toHaveText(c.context);
      await expect(finding(page, i).getByRole("heading", { level: 3 })).toHaveText(c.text);
      await expect(finding(page, i).locator(figs[i])).toBeVisible();
    }
    // Plain headings and text: nothing to operate.
    await expect(sec(page).locator("button, [aria-expanded], [aria-controls], [role=region]")).toHaveCount(0);
    // The claim keeps the prototype's type.
    await expect(sec(page).locator("h3.claim").first()).toHaveCSS("font-weight", "400");
    await expect(sec(page).locator("h3.claim").first()).toHaveCSS("font-size", "18.4px");
    // No "Now" block and no FE800 label, prospectus or PDF link (refinement R7).
    await expect(sec(page).locator(".now, .lim")).toHaveCount(0);
    const all = (await sec(page).textContent()) ?? "";
    expect(all).not.toContain("FE800");
    expect(all).not.toContain("Now ·");
    expect(all).not.toMatch(/prospectus/i);
    expect(all).not.toContain("—");
    expect(research).not.toHaveProperty("now");
    expect(research.links).not.toHaveProperty("prospectus");
  });

  test("the evidence: Sharpe 0.66 and 0.48 on a 0 to 0.8 scale, the 2022 drop, and the identity", async ({ page }) => {
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
    await expect(sharpe).toContainText("Regime-aware rule");
    // The axis and its five ticks.
    await expect(sharpe.locator(".ticks text")).toHaveText(["0", "0.2", "0.4", "0.6", "0.8"]);
    // Sodium for the static 60/40, grey for the regime-aware rule.
    expect(await sharpe.locator(".bar").evaluateAll((els) => els.map((e) => e.getAttribute("stroke")))).toEqual([
      "#FFA62B",
      "#C3CBC6",
    ]);
    // Title and note in the figure's own caption.
    await expect(page.locator("#ev-sharpe > figcaption .ctitle")).toHaveText(research.evidence.sharpe.chartTitle);
    await expect(page.locator("#ev-sharpe > figcaption .src")).toHaveText(research.evidence.sharpe.source);
    for (const b of await sharpe.locator(".bar").all()) {
      await expect(b).toHaveCSS("transform-box", "view-box");
    }

    // The 2022 loss is a numerical callout with no implied scale: no SVG, no bar, no axis (final pass).
    const drop = page.locator("#ev-drawdown");
    await expect(drop.locator(".callout-v")).toHaveText("≈ −19%");
    await expect(drop.locator("svg, .bar, line")).toHaveCount(0);
    // The title carries "modeled 2022 replay"; there is no extra note (refinement R2).
    await expect(page.locator("#ev-drawdown > figcaption .ctitle")).toHaveText(research.evidence.drawdown.chartTitle);

    // The identity in STIX and one sentence naming what else a breakeven carries.
    const ident = page.locator("#ev-identity");
    await expect(ident).toContainText("Δy");
    await expect(ident).toContainText("where b = y");
    await expect(ident.locator(".ident")).toHaveCSS("font-family", /STIX/);
    await expect(ident.locator("> figcaption")).toHaveText(research.evidence.identity.body);
    const body = research.evidence.identity.body;
    expect(body).toContain("not a pure measure of expected inflation");
    expect(body).toContain("inflation risk premium");
    expect(body).toContain("TIPS liquidity effects");
    expect(body.split(/[.!?](\s|$)/).filter((x) => x && x.trim())).toHaveLength(1);
  });

  test("each figure is a <figure> with a <figcaption>, and nothing in Research uses fill-box", async ({ page }) => {
    await open(page);
    for (const id of figs) {
      await expect(page.locator(id)).toHaveJSProperty("tagName", "FIGURE");
      await expect(page.locator(`${id} > figcaption`)).toHaveCount(1);
    }
    const fillBox = await sec(page).evaluate((s) =>
      [...s.querySelectorAll("*")].filter((n) => getComputedStyle(n).transformBox === "fill-box").length,
    );
    expect(fillBox).toBe(0);
  });

  test("each claim's text is at most three lines at 1440", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page);
    const lines = await sec(page).locator("h3.claim").evaluateAll((els) =>
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
    Two columns from a 900px page: for each finding the figure is to the right of the text
    and clear of it, and its top is within 8px of the finding's top. Every part of each
    figure lies inside its box, and nothing is sticky.
  */
  for (const vp of [
    { width: 1440, height: 900 },
    { width: 1280, height: 800 },
    { width: 1024, height: 768 },
  ]) {
    test(`two columns: each figure beside its finding, top-aligned, at ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await open(page);
      await page.evaluate(() => document.fonts.ready);
      for (let i = 0; i < 3; i++) {
        const t = (await finding(page, i).locator(".ftext").boundingBox())!;
        const h = (await finding(page, i).locator("h3").boundingBox())!;
        const f = (await page.locator(figs[i]).boundingBox())!;
        expect(f.x, `figure ${i + 1} right of its text`).toBeGreaterThanOrEqual(t.x + t.width);
        expect(f.x).toBeGreaterThanOrEqual(h.x + h.width);
        expect(Math.abs(f.y - t.y), `figure ${i + 1} top-aligned`).toBeLessThanOrEqual(8);
        // Inside its own row.
        const row = (await finding(page, i).boundingBox())!;
        expect(f.y + f.height).toBeLessThanOrEqual(row.y + row.height + 1);
        expect(await outside(page, figs[i])).toEqual([]);
      }
      expect(await stuck(page)).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width);
    });
  }

  for (const vp of [
    { width: 390, height: 844 },
    { width: 375, height: 812 },
  ]) {
    test(`stacked: each figure directly under its finding, at ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await open(page);
      await page.evaluate(() => document.fonts.ready);
      for (let i = 0; i < 3; i++) {
        const t = (await finding(page, i).locator(".ftext").boundingBox())!;
        const f = (await page.locator(figs[i]).boundingBox())!;
        const gap = f.y - (t.y + t.height);
        expect(gap, `figure ${i + 1} under its finding`).toBeGreaterThanOrEqual(0);
        expect(gap).toBeLessThanOrEqual(24);
        expect(Math.abs(f.x - t.x)).toBeLessThanOrEqual(1);
        // Before the next finding.
        if (i < 2) expect(f.y + f.height).toBeLessThanOrEqual((await finding(page, i + 1).boundingBox())!.y + 1);
        expect(await outside(page, figs[i])).toEqual([]);
      }
      expect(await stuck(page)).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width);
    });
  }

  test("Research is at least 25% shorter on desktop than before refinement R7", async ({ page }) => {
    for (const [key, before] of Object.entries(BEFORE)) {
      const [width, height] = key.split("x").map(Number);
      await page.setViewportSize({ width, height });
      await open(page);
      await page.evaluate(() => document.fonts.ready);
      await ticks(page, 2);
      const h = await sectionHeight(page);
      console.log(`Research at ${key}: ${h}px (before ${before}px, ${Math.round((1 - h / before) * 100)}% shorter)`);
      expect(h).toBeLessThan(before * 0.75);
    }
  });

  test("without JavaScript the chapter is laid out exactly as with it", async ({ browser }) => {
    for (const vp of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const js = await browser.newContext({ viewport: vp });
      const jsPage = await js.newPage();
      await noWatchdog(jsPage);
      await open(jsPage);
      await jsPage.evaluate(() => document.fonts.ready);
      const no = await browser.newContext({ viewport: vp, javaScriptEnabled: false });
      const noPage = await no.newPage();
      await noPage.goto("/");
      await noPage.evaluate(() => document.fonts.ready).catch(() => undefined);
      expect(await sectionHeight(noPage)).toBe(await sectionHeight(jsPage));
      expect((await sec(noPage).innerText()).trim()).toBe((await sec(jsPage).innerText()).trim());
      await js.close();
      await no.close();
    }
  });

  /*
    The scroll sweep. Every 40px through the findings, each part of each figure (caption,
    title, note, svg, each bar, each value and label, the axis, each tick; the formula and
    its explanation) is either fully below the top bar or out of sight (under the bar, off
    screen, or dissolved to opacity 0): never seen cut by the bar while another part of the
    same figure shows. The parts that show form one unbroken run, from the first one shown
    to the figure's end in view.
  */
  for (const vp of [
    { width: 1440, height: 900 },
    { width: 1280, height: 800 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
    { width: 375, height: 812 },
  ]) {
    test(`scroll sweep: no figure part is cut by the top bar while the rest shows, at ${vp.width}x${vp.height}`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize(vp);
      await open(page);
      await page.evaluate(() => document.fonts.ready);
      const { from, to } = await sec(page).locator(".claims").evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { from: Math.max(0, r.top + scrollY - innerHeight), to: r.bottom + scrollY };
      });
      let steps = 0;
      for (let y = from; y <= to; y += 40) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
        await ticks(page, 2);
        const all = await page.evaluate((ids) => {
          const bar = document.querySelector("header.top")!.getBoundingClientRect().bottom;
          return ids.map((id) => {
            const fig = document.querySelector(id)!;
            const parts = [
              ...fig.querySelectorAll("figcaption, .ctitle, .src, svg, .bar, svg text, svg line:not(.bar), .ident, .note"),
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
                name: `${id} ${el.tagName}.${el.getAttribute("class") ?? ""} "${(el.textContent ?? "").slice(0, 16)}"`,
                top: r.top,
                cut: r.top < bar && r.bottom > bar,
                shown: onScreen && seen(el) > 0,
              };
            });
          });
        }, figs);
        for (const s of all) {
          const shown = s.filter((p) => p.shown);
          if (shown.length > 1) {
            expect(shown.filter((p) => p.cut).map((p) => p.name), `scrollY ${Math.round(y)}`).toEqual([]);
          }
          // One unbroken run: no hidden part on screen below a shown part.
          const firstShown = Math.min(...shown.map((p) => p.top));
          const gaps = s.filter((p) => !p.shown && !p.cut && p.top > firstShown && p.top < vp.height);
          expect(gaps.map((p) => p.name), `scrollY ${Math.round(y)}`).toEqual([]);
        }
        steps++;
      }
      expect(steps).toBeGreaterThan(20);
    });
  }

  for (const width of [320, 375, 414, 768, 1024, 1280, 1440]) {
    test(`chart text renders at 14px or more, tick labels at 12px or more, inside the chart, at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page);
      for (const id of ["#ev-sharpe"]) {
        const ev = page.locator(id);
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
          // Each label's whole text box inside the chart (the SVG clips at its edge).
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

  test("links: SSRN only, announced as opening a new tab; no prospectus link anywhere", async ({ page }) => {
    await open(page);
    const links = sec(page).locator("a");
    await expect(links).toHaveCount(1);
    const ssrn = sec(page).getByRole("link", { name: /Read on SSRN/ });
    await expect(ssrn).toHaveAttribute("href", research.links.ssrn.href);
    await expect(ssrn).toHaveAccessibleName(/, opens in a new tab$/);
    await expect(ssrn).toHaveAttribute("target", "_blank");
    await expect(ssrn).not.toHaveAccessibleName(/PDF/);
    // The link closes the paper's description.
    await expect(sec(page).locator(".ask a")).toHaveCount(1);
    await expect(page.locator('a[href*="Prospectus"]')).toHaveCount(0);
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
    await expect(page.locator("#ev-sharpe")).toHaveAttribute("data-drawn", "true");
    // Leaving and coming back does not beat again.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await ticks(page, 6);
    await sec(page).locator(".premise").scrollIntoViewIfNeeded();
    await ticks(page, 12);
    expect(await beats(page)).toBe(1);
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
    // Short enough that a chart can be in view with the premise above the fold.
    await page.setViewportSize({ width: 375, height: 480 });
    await open(page);
    // Come up from below: the Sharpe chart's bottom is in view, the premise is above the viewport.
    await page.locator("#ev-sharpe svg").evaluate((e) => {
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

  test("Review Focus 4: /#research lands on Research's anchor with the nav and findings matching", async ({ page }) => {
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
    for (let i = 0; i < 3; i++) await expect(finding(page, i)).toBeVisible();
    await expect(page.locator("#ev-sharpe")).toBeInViewport();
    await expect.poll(() => sharpeBars(page), { timeout: 4000 }).toEqual(["none", "none"]);
    // The landing holds once everything above has settled.
    await page.waitForLoadState("load");
    await ticks(page, 10);
    await expect(page.getByRole("heading", { level: 2, name: research.title })).toBeInViewport();
    expect(await offAnchor(page)).toBeLessThanOrEqual(2);
    await expect(nav.getByRole("link", { name: "Research" })).toHaveAttribute("aria-current", "true");
  });

  test("without JavaScript every finding shows its evidence and the link is visible", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(sec(page).locator(".premise")).toBeVisible();
    for (let i = 0; i < 3; i++) await expect(finding(page, i).getByRole("heading", { level: 3 })).toBeVisible();
    for (const id of figs) await expect(page.locator(id)).toBeVisible();
    await expect(page.locator("#ev-identity")).toContainText("not a pure measure of expected inflation");
    expect(await sharpeBars(page)).toEqual(["none", "none"]);
    for (const a of await sec(page).locator("a").all()) await expect(a).toBeVisible();
    await ctx.close();
  });

  test("before hydration every finding's evidence already shows", async ({ page }) => {
    await page.route(/\/_next\/static\/chunks\/.*\.js/, (r) => r.abort());
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/\bjs\b/);
    for (const id of figs) await expect(page.locator(id)).toBeVisible();
  });

  test("when the bundle never arrives, the page expands after five seconds", async ({ page }) => {
    await page.route(/\/_next\/static\/chunks\/.*\.js/, (r) => r.abort());
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/\bjs\b/);
    // The head script gives the bundle five seconds, then drops .js.
    await expect(page.locator("html")).not.toHaveClass(/\bjs\b/, { timeout: 7000 });
    await expect(page.locator("html")).not.toHaveAttribute("data-hydrated", /.*/);
    for (const id of figs) await expect(page.locator(id)).toBeVisible();
    // The bars grow out from zero (their usual transition) to full length.
    await expect.poll(() => sharpeBars(page), { timeout: 4000 }).toEqual(["none", "none"]);
    const more = page.locator("#more");
    for (const p of projects.rail) {
      await expect(more.getByRole("heading", { level: 4, name: p.title })).toBeVisible();
      await expect(more.getByText(p.question, { exact: true }).filter({ visible: true })).toHaveCount(1);
      await expect(more.locator(`a[href="${p.live}"]`).filter({ visible: true })).toHaveCount(1);
    }
  });

  for (const vp of [
    { width: 1280, height: 800 },
    { width: 375, height: 812 },
  ]) {
    test(`axe: no serious or critical violations in Research at ${vp.width}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await open(page);
      await sec(page).locator(".premise").scrollIntoViewIfNeeded();
      const r = await new AxeBuilder({ page }).include("#research").analyze();
      const serious = r.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
      expect(serious).toEqual([]);
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
