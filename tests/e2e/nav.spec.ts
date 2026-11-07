import { expect, test, type Locator, type Page } from "@playwright/test";

async function noWatchdog(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdog: false };
  });
}

async function jumpTo(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
}

/** Scroll so the active-chapter band (just above mid-screen) sits a little inside the section. */
async function jumpIntoSection(page: Page, id: string) {
  await page.evaluate((sel) => {
    const el = document.getElementById(sel)!;
    const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.47 + 24;
    window.scrollTo({ top, behavior: "instant" });
  }, id);
}

/*
  Safari skips links and buttons on a plain Tab (Option+Tab reaches them), and
  Playwright's WebKit follows that, so WebKit uses the Option variants.
*/
function tabKeys(browserName: string) {
  const alt = browserName === "webkit" ? "Alt+" : "";
  return { next: `${alt}Tab`, prev: `${alt}Shift+Tab` };
}

/*
  A real pointer tap. locator.click() runs Playwright's actionability scroll,
  which in WebKit counts the sticky bar's own controls as hidden under it and
  moves the page; a user's tap does not.
*/
async function tap(page: Page, locator: Locator) {
  const box = (await locator.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

/** True when the focused element lives inside the dialog. */
async function focusInDialog(page: Page): Promise<boolean> {
  return page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
}

test.describe("top bar and menu", () => {
  test.beforeEach(async ({ page }) => {
    await noWatchdog(page);
  });

  test("the first Tab press shows a Skip to content link that moves focus to main", async ({ page, browserName }) => {
    await page.goto("/");
    await page.keyboard.press(tabKeys(browserName).next);
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    const box = await skip.boundingBox();
    const vp = page.viewportSize()!;
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width);
    expect(box!.height).toBeGreaterThanOrEqual(24);
    await page.keyboard.press("Enter");
    await expect(page.locator("main#content")).toBeFocused();
  });

  test.describe("phone", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("Menu is shown, the section links are not", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
      await expect(page.locator(".top .links")).toBeHidden();
      await expect(page.locator(".top .res")).toBeHidden();
      await expect(page.getByRole("dialog", { name: "Sections" })).toBeHidden();
    });

    test("the dialog fills the viewport after scrolling, traps focus and closes with Escape", async ({ page, browserName }) => {
      const keys = tabKeys(browserName);
      await page.goto("/");
      await jumpTo(page, 3000);
      // The page may be shorter than 3000px while chapters are still short; hold whatever it reached.
      const held = await page.evaluate(() => window.scrollY);
      expect(held).toBeGreaterThan(1000);
      const menu = page.getByRole("button", { name: "Menu" });
      await tap(page, menu);
      await expect(menu).toHaveAttribute("aria-expanded", "true");

      const dialog = page.getByRole("dialog", { name: "Sections" });
      await expect(dialog).toBeVisible();
      const box = await dialog.boundingBox();
      const vp = page.viewportSize()!;
      expect(box!.y).toBe(0);
      expect(box!.x).toBe(0);
      expect(box!.width).toBe(vp.width);
      expect(box!.height).toBe(vp.height);
      await expect(dialog).toHaveAttribute("aria-modal", "true");

      await expect(dialog.getByRole("link", { name: /^Home/ })).toBeFocused();
      await expect(dialog.getByRole("link", { name: /^Projects/ })).toContainText(/\d:\d\d/);
      await expect(dialog.getByRole("link", { name: /^Résumé \(PDF\)/ })).toHaveAttribute(
        "href",
        "/resume/Maniar_Vatsal.pdf",
      );

      // The page behind is inert and the scroll position is held.
      await expect(page.locator("main")).toHaveAttribute("inert", "");
      await expect(page.locator("header.top")).toHaveAttribute("inert", "");
      expect(Math.abs((await page.evaluate(() => window.scrollY)) - held)).toBeLessThan(2);

      for (let i = 0; i < 12; i++) {
        await page.keyboard.press(keys.next);
        expect(await focusInDialog(page)).toBe(true);
      }
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press(keys.prev);
        expect(await focusInDialog(page)).toBe(true);
      }

      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(menu).toBeFocused();
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("main")).not.toHaveAttribute("inert", /.*/);
      expect(Math.abs((await page.evaluate(() => window.scrollY)) - held)).toBeLessThan(2);
    });

    test("tapping Path closes the menu and lands on Path", async ({ page }) => {
      await page.goto("/");
      await jumpTo(page, 1200);
      await tap(page, page.getByRole("button", { name: "Menu" }));
      const dialog = page.getByRole("dialog", { name: "Sections" });
      await dialog.getByRole("link", { name: /^Path/ }).click();
      await expect(dialog).toBeHidden();
      await expect
        .poll(async () => Math.abs(await page.evaluate(() => document.getElementById("path")!.getBoundingClientRect().top)))
        .toBeLessThan(100);
      expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("visible");
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("visible");
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    });

    test("under reduced motion the jump is instant", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await tap(page, page.getByRole("button", { name: "Menu" }));
      await page.getByRole("dialog", { name: "Sections" }).getByRole("link", { name: /^Research/ }).click();
      await expect
        .poll(async () => Math.abs(await page.evaluate(() => document.getElementById("research")!.getBoundingClientRect().top)), {
          timeout: 600,
        })
        .toBeLessThan(100);
    });
  });

  test.describe("desktop", () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("links are shown, Menu is not, and aria-current follows the chapter", async ({ page }) => {
      await page.goto("/");
      const nav = page.getByRole("navigation", { name: "Main" });
      await expect(nav.getByRole("link", { name: "Projects" })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Research" })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Path" })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Contact" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
      await expect(page.getByRole("link", { name: "Résumé", exact: true })).toHaveAttribute(
        "href",
        "/resume/Maniar_Vatsal.pdf",
      );

      await jumpIntoSection(page, "path");
      await expect(nav.getByRole("link", { name: "Path" })).toHaveAttribute("aria-current", "true");
      await expect(nav.getByRole("link", { name: "Research" })).not.toHaveAttribute("aria-current", "true");

      await jumpIntoSection(page, "research");
      await expect(nav.getByRole("link", { name: "Research" })).toHaveAttribute("aria-current", "true");
      await expect(nav.getByRole("link", { name: "Path" })).not.toHaveAttribute("aria-current", "true");
    });
  });
});
