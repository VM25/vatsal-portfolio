import { expect, test, type Page } from "@playwright/test";
import { projects } from "../../src/data/projects";

/*
  More projects: a rail of six as WAI-ARIA tabs (vertical, Up/Down, Home/End, roving
  tabindex) with one stage. Wide screens put the stage beside the rail; narrow screens
  move it directly after the selected tab and scroll it into view. Without JavaScript
  the six projects are a plain list, each with its stage content under its title.

  Test hook: the tablist carries data-ready once the rail has hydrated, and data-narrow
  ("true"/"false") once it has measured its layout.
*/

const RAIL = projects.rail;

async function noWatchdog(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdog: false };
  });
}

async function open(page: Page) {
  await page.goto("/");
  await expect(page.locator("#more [role='tablist'][data-ready]")).toHaveCount(1);
}

async function ticks(page: Page, n: number) {
  await page.evaluate(async (n) => {
    for (let i = 0; i < n; i++) await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, n);
}

const tablist = (page: Page) => page.getByRole("tablist", { name: projects.moreLabel });
const tabs = (page: Page) => tablist(page).getByRole("tab");
const stage = (page: Page) => page.locator("#more-stage");

async function expectSelected(page: Page, i: number) {
  for (let k = 0; k < RAIL.length; k++) {
    const t = tabs(page).nth(k);
    await expect(t).toHaveAttribute("aria-selected", k === i ? "true" : "false");
    await expect(t).toHaveAttribute("tabindex", k === i ? "0" : "-1");
  }
  const id = await tabs(page).nth(i).getAttribute("id");
  await expect(stage(page)).toHaveAttribute("aria-labelledby", id!);
  await expect(stage(page)).toContainText(RAIL[i].question);
  await expect(stage(page)).toContainText(RAIL[i].result);
}

test.describe("More projects rail", () => {
  test.beforeEach(async ({ page }) => {
    await noWatchdog(page);
  });

  test("six tabs in a labelled vertical tablist, the first selected", async ({ page }) => {
    await open(page);
    await expect(tablist(page)).toHaveAttribute("aria-orientation", "vertical");
    await expect(tabs(page)).toHaveCount(6);
    for (let i = 0; i < RAIL.length; i++) {
      await expect(tabs(page).nth(i)).toContainText(RAIL[i].title);
      await expect(tabs(page).nth(i)).toHaveAttribute("aria-controls", "more-stage");
      const box = (await tabs(page).nth(i).boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await expect(stage(page)).toHaveAttribute("role", "tabpanel");
    await expectSelected(page, 0);
  });

  test("the stage shows the project's field, figures and both links", async ({ page }) => {
    await open(page);
    const p = RAIL[0];
    await expect(stage(page)).toContainText(`${p.field} · ${p.year}`);
    for (const [n, label] of p.figures) {
      await expect(stage(page).locator(".figs")).toContainText(n);
      await expect(stage(page).locator(".figs")).toContainText(label);
    }
    const live = stage(page).getByRole("link", { name: /Open the project/ });
    const code = stage(page).getByRole("link", { name: /Source/ });
    await expect(live).toHaveAttribute("href", p.live);
    await expect(code).toHaveAttribute("href", p.code);
    for (const a of [live, code]) {
      await expect(a).toHaveAttribute("target", "_blank");
      await expect(a).toHaveAccessibleName(/, opens in a new tab$/);
      await expect(a.locator("[aria-hidden='true']")).toHaveText("↗");
      const box = (await a.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("ArrowDown from YieldShock selects Signal Survival; Up, Home and End move and select", async ({ page }) => {
    await open(page);
    await tabs(page).nth(0).focus();
    await page.keyboard.press("ArrowDown");
    await expect(tabs(page).nth(1)).toBeFocused();
    await expectSelected(page, 1);
    await expect(stage(page)).toContainText("Signal Survival");

    await page.keyboard.press("ArrowUp");
    await expect(tabs(page).nth(0)).toBeFocused();
    await expectSelected(page, 0);

    await page.keyboard.press("ArrowUp");
    await expect(tabs(page).nth(5)).toBeFocused();
    await expectSelected(page, 5);

    await page.keyboard.press("Home");
    await expect(tabs(page).nth(0)).toBeFocused();
    await expectSelected(page, 0);

    await page.keyboard.press("End");
    await expect(tabs(page).nth(5)).toBeFocused();
    await expectSelected(page, 5);

    await page.keyboard.press("ArrowDown");
    await expect(tabs(page).nth(0)).toBeFocused();
    await expectSelected(page, 0);
  });

  test("clicking a tab selects it", async ({ page }) => {
    await open(page);
    await tabs(page).nth(3).click();
    await expectSelected(page, 3);
    await expect(stage(page)).toContainText(RAIL[3].figures[0][0]);
  });

  test.describe("wide", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("the stage sits beside the rail, outside the tablist", async ({ page }) => {
      await open(page);
      await expect(tablist(page)).toHaveAttribute("data-narrow", "false");
      await tabs(page).nth(2).click();
      await expectSelected(page, 2);
      expect(await stage(page).evaluate((s) => !!s.closest("[role='tablist']"))).toBe(false);
      const r = (await tablist(page).boundingBox())!;
      const s = (await stage(page).boundingBox())!;
      expect(s.x).toBeGreaterThan(r.x + r.width);
      expect(Math.abs(s.y - r.y)).toBeLessThan(40);
    });
  });

  test.describe("narrow", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("the stage follows the selected tab and is scrolled into view; focus stays on the tab", async ({ page }) => {
      await open(page);
      await expect(tablist(page)).toHaveAttribute("data-narrow", "true");
      const prevIsSelected = () =>
        stage(page).evaluate((s) => {
          const p = s.previousElementSibling;
          return !!p && p.getAttribute("role") === "tab" && p.getAttribute("aria-selected") === "true";
        });
      expect(await prevIsSelected()).toBe(true);

      // Put the rail's first row near the top so the stage for a lower tab starts below the fold.
      await tabs(page).nth(0).evaluate((t) => {
        const y = t.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: y, behavior: "instant" });
      });
      await tabs(page).nth(0).focus();
      for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowDown");
      await expect(tabs(page).nth(5)).toBeFocused();
      await expectSelected(page, 5);
      expect(await prevIsSelected()).toBe(true);
      await expect
        .poll(() => stage(page).evaluate((s) => {
          const r = s.getBoundingClientRect();
          return r.top >= 0 && r.top < window.innerHeight;
        }))
        .toBe(true);
      await expect(tabs(page).nth(5)).toBeFocused();
      // The title is the tab just above; the stage does not repeat it.
      await expect(stage(page).locator("h4")).toBeHidden();
    });

    test("under reduced motion the stage is scrolled into view at once", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 375, height: 812 } });
      const page = await ctx.newPage();
      await noWatchdog(page);
      await open(page);
      await expect(tablist(page)).toHaveAttribute("data-narrow", "true");
      await tabs(page).nth(0).evaluate((t) => {
        const y = t.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: y, behavior: "instant" });
      });
      await tabs(page).nth(5).dispatchEvent("click");
      await expectSelected(page, 5);
      await ticks(page, 2);
      const top = await stage(page).evaluate((s) => s.getBoundingClientRect().top);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(top).toBeLessThan(812);
      await ctx.close();
    });
  });

  test("without JavaScript all six projects are a readable list with their links", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    const more = page.locator("#more");
    await expect(more.locator("[role='tablist']")).toBeHidden();
    for (const p of RAIL) {
      await expect(more.getByRole("heading", { level: 4, name: p.title })).toBeVisible();
      // The tabs' own stage is in the page too, hidden; the list is what shows.
      for (const loc of [
        more.getByText(p.question, { exact: true }),
        more.getByText(p.result, { exact: true }),
        more.locator(`a[href="${p.live}"]`),
        more.locator(`a[href="${p.code}"]`),
      ]) {
        await expect(loc.filter({ visible: true })).toHaveCount(1);
      }
    }
    await ctx.close();
  });

  test("before hydration, the collapsed tabs show at once with one stage", async ({ page }) => {
    // The inline head script runs; the app bundle never does.
    await page.route(/\/_next\/static\/chunks\/.*\.js/, (r) => r.abort());
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/\bjs\b/);
    await expect(tablist(page)).toBeVisible();
    await expect(tabs(page).nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(stage(page)).toBeVisible();
    await expect(stage(page)).toContainText(RAIL[0].question);
    await expect(page.locator("#more").getByText(RAIL[1].question, { exact: true })).toHaveCount(0);
  });
});
