import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { projects } from "../../src/data/projects";

/*
  More projects: a rail of six with one stage.
  - Wide (two-column .more grid): WAI-ARIA tabs (vertical, Up/Down, Home/End, roving
    tabindex); the stage is a tabpanel beside the rail, outside the tablist.
  - Narrow (one column): disclosures. Each row is a button with aria-expanded and
    aria-controls; the open one's panel (role="region") sits right after it and is
    scrolled into view. At most one is open; Tab, Enter and Space work.
  - The selection carries across the breakpoint.
  - Without JavaScript the six projects are a plain list, each with its stage content
    under its title.

  Test hooks on .rail: data-ready once hydrated, data-narrow ("true"/"false") once measured.
*/

const RAIL = projects.rail;
const WIDE = { width: 1280, height: 800 };
const NARROW = { width: 375, height: 812 };

async function noWatchdog(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdog: false };
  });
}

async function open(page: Page, narrow: boolean) {
  await page.goto("/");
  await expect(page.locator("#more .rail[data-ready]")).toHaveCount(1);
  await expect(page.locator("#more .rail")).toHaveAttribute("data-narrow", String(narrow));
}

async function ticks(page: Page, n: number) {
  await page.evaluate(async (n) => {
    for (let i = 0; i < n; i++) await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, n);
}

/** Scroll so the rail's first row sits just under the top bar. */
async function railToTop(page: Page) {
  await page.locator("#more-tab-0").evaluate((t) => {
    const y = t.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: "instant" });
  });
}

const tablist = (page: Page) => page.getByRole("tablist", { name: projects.moreLabel });
const tabs = (page: Page) => tablist(page).getByRole("tab");
const stage = (page: Page) => page.locator("#more-stage");
const rows = (page: Page) => page.locator("#more .rail > button");
const panel = (page: Page) => page.locator("#more .rail > [role='region']");

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

/** Narrow: row i is the one open (or none, with -1), and its panel follows it. */
async function expectOpen(page: Page, i: number) {
  for (let k = 0; k < RAIL.length; k++) {
    await expect(rows(page).nth(k)).toHaveAttribute("aria-expanded", k === i ? "true" : "false");
  }
  if (i < 0) {
    await expect(panel(page)).toHaveCount(0);
    return;
  }
  const row = rows(page).nth(i);
  await expect(panel(page)).toHaveCount(1);
  await expect(panel(page)).toHaveAttribute("id", (await row.getAttribute("aria-controls"))!);
  await expect(panel(page)).toHaveAttribute("aria-labelledby", (await row.getAttribute("id"))!);
  await expect(panel(page)).toContainText(RAIL[i].question);
  await expect(panel(page)).toContainText(RAIL[i].result);
  expect(
    await panel(page).evaluate((s) => s.previousElementSibling?.getAttribute("aria-expanded") === "true"),
  ).toBe(true);
}

async function seriousAxe(page: Page) {
  const r = await new AxeBuilder({ page }).include("#more").analyze();
  return r.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

test.describe("More projects rail", () => {
  test.beforeEach(async ({ page }) => {
    await noWatchdog(page);
  });

  test.describe("wide: tabs", () => {
    test.use({ viewport: WIDE });

    test("six tabs in a labelled vertical tablist, the first selected", async ({ page }) => {
      await open(page, false);
      await expect(tablist(page)).toHaveAttribute("aria-orientation", "vertical");
      await expect(tabs(page)).toHaveCount(6);
      for (let i = 0; i < RAIL.length; i++) {
        await expect(tabs(page).nth(i)).toContainText(RAIL[i].title);
        await expect(tabs(page).nth(i)).toHaveAttribute("aria-controls", "more-stage");
        await expect(tabs(page).nth(i)).not.toHaveAttribute("aria-expanded", /.*/);
        const box = (await tabs(page).nth(i).boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      await expect(stage(page)).toHaveAttribute("role", "tabpanel");
      await expectSelected(page, 0);
    });

    test("the stage shows the project's field, figures and both links", async ({ page }) => {
      await open(page, false);
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
      await open(page, false);
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

    test("clicking a tab selects it; the stage sits beside the rail, outside the tablist", async ({ page }) => {
      await open(page, false);
      await tabs(page).nth(2).click();
      await expectSelected(page, 2);
      await expect(stage(page)).toContainText(RAIL[2].figures[0][0]);
      expect(await stage(page).evaluate((s) => !!s.closest("[role='tablist']"))).toBe(false);
      const r = (await tablist(page).boundingBox())!;
      const s = (await stage(page).boundingBox())!;
      expect(s.x).toBeGreaterThan(r.x + r.width);
      expect(Math.abs(s.y - r.y)).toBeLessThan(40);
    });

    test("axe: no serious or critical violations in the rail", async ({ page }) => {
      await open(page, false);
      await railToTop(page);
      expect(await seriousAxe(page)).toEqual([]);
      await tabs(page).nth(3).click();
      expect(await seriousAxe(page)).toEqual([]);
    });
  });

  test.describe("narrow: disclosures", () => {
    test.use({ viewport: NARROW });

    test("six disclosure buttons, no tab roles, the first open with its region right after it", async ({ page }) => {
      await open(page, true);
      await expect(page.locator("#more [role='tablist'], #more [role='tab'], #more [role='tabpanel']")).toHaveCount(0);
      await expect(rows(page)).toHaveCount(6);
      for (let i = 0; i < RAIL.length; i++) {
        const b = rows(page).nth(i);
        await expect(b).toContainText(RAIL[i].title);
        await expect(b).not.toHaveAttribute("aria-selected", /.*/);
        await expect(b).not.toHaveAttribute("tabindex", /.*/);
        const box = (await b.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      await expectOpen(page, 0);
      // The title is the button just above; the panel does not repeat it.
      await expect(panel(page).locator("h4")).toBeHidden();
    });

    test("opening a lower row moves the panel under it and scrolls it into view; focus stays", async ({ page }) => {
      await open(page, true);
      await railToTop(page);
      // Keyboard activation, so focus is meaningful (Safari does not focus buttons on click).
      await rows(page).nth(5).focus();
      await page.keyboard.press("Enter");
      await expectOpen(page, 5);
      await expect(rows(page).nth(5)).toBeFocused();
      await expect
        .poll(() => panel(page).evaluate((s) => {
          const r = s.getBoundingClientRect();
          return r.top >= 0 && r.top < window.innerHeight;
        }))
        .toBe(true);
      await expect(rows(page).nth(5)).toBeFocused();
    });

    test("Tab reaches every row; Enter and Space open and close; one open at a time", async ({ page, browserName }) => {
      const next = browserName === "webkit" ? "Alt+Tab" : "Tab";
      await open(page, true);
      await railToTop(page);
      await rows(page).nth(0).focus();
      // Row 0 is open: Tab goes through its panel's two links, then to row 1.
      await page.keyboard.press(next);
      await page.keyboard.press(next);
      await page.keyboard.press(next);
      await expect(rows(page).nth(1)).toBeFocused();
      await page.keyboard.press("Enter");
      await expectOpen(page, 1);
      await expect(rows(page).nth(1)).toBeFocused();
      await page.keyboard.press("Space");
      await expectOpen(page, -1);
      await page.keyboard.press(next);
      await expect(rows(page).nth(2)).toBeFocused();
      await page.keyboard.press("Space");
      await expectOpen(page, 2);
    });

    test("under reduced motion the panel is scrolled into view at once", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: NARROW });
      const page = await ctx.newPage();
      await noWatchdog(page);
      await open(page, true);
      await railToTop(page);
      await rows(page).nth(5).dispatchEvent("click");
      await expectOpen(page, 5);
      await ticks(page, 2);
      const top = await panel(page).evaluate((s) => s.getBoundingClientRect().top);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(top).toBeLessThan(NARROW.height);
      await ctx.close();
    });

    test("axe: no serious or critical violations in the rail", async ({ page }) => {
      await open(page, true);
      await railToTop(page);
      expect(await seriousAxe(page)).toEqual([]);
      await rows(page).nth(3).click();
      await expectOpen(page, 3);
      expect(await seriousAxe(page)).toEqual([]);
      await rows(page).nth(3).click();
      await expectOpen(page, -1);
      expect(await seriousAxe(page)).toEqual([]);
    });
  });

  test("the selection carries across the breakpoint both ways", async ({ page }) => {
    await page.setViewportSize(WIDE);
    await open(page, false);
    await tabs(page).nth(3).click();
    await expectSelected(page, 3);

    await page.setViewportSize(NARROW);
    await expect(page.locator("#more .rail")).toHaveAttribute("data-narrow", "true");
    await expectOpen(page, 3);

    await rows(page).nth(4).click();
    await expectOpen(page, 4);
    await page.setViewportSize(WIDE);
    await expect(page.locator("#more .rail")).toHaveAttribute("data-narrow", "false");
    await expectSelected(page, 4);
  });

  test("without JavaScript all six projects are a readable list with their links", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    const more = page.locator("#more");
    await expect(more.locator(".rail")).toBeHidden();
    for (const p of RAIL) {
      await expect(more.getByRole("heading", { level: 4, name: p.title })).toBeVisible();
      // The server-rendered stage is in the page too, hidden; the list is what shows.
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

  test("before hydration, the collapsed rail shows at once with one stage", async ({ page }) => {
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
