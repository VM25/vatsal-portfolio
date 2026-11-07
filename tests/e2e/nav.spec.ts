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

/**
 * Pixels between where a chapter is and where its anchor lands: its top against the
 * computed scroll-padding-top. Home ("top") lands at scroll 0. A chapter that cannot
 * reach its anchor because the page ends first (Contact, on most layouts) has landed
 * when the page is scrolled to the end with the chapter at or below the anchor.
 */
async function offAnchor(page: Page, id: string): Promise<number> {
  return page.evaluate((id) => {
    if (id === "top") return Math.abs(window.scrollY);
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const top = document.getElementById(id)!.getBoundingClientRect().top;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= max - 1 && top >= pad - 2) return 0;
    return Math.abs(top - pad);
  }, id);
}

/** The link marked aria-current in the given container, by href ("" when none is). */
async function currentHref(page: Page, container: string): Promise<string> {
  return page.evaluate(
    (sel) => document.querySelector(`${sel} a[aria-current="true"]`)?.getAttribute("href") ?? "",
    container,
  );
}

/**
 * Load the page and let it settle (hydrated, fonts in, loaded), so a smooth-scrolled
 * jump is not aimed at a layout that then changes under it.
 */
async function settled(page: Page) {
  await page.goto("/");
  await expect(page.locator("html[data-hydrated]")).toHaveCount(1);
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
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
      const held = await page.evaluate(() => window.scrollY);
      expect(held).toBe(3000);
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
      // The rows are the section names alone: no times.
      await expect(dialog.getByRole("link", { name: /^Projects/ })).toHaveText("Projects");
      await expect(dialog).not.toContainText(/\d:\d\d/);
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

      // Focus wraps at both ends: back from the first item lands on the last, and on again.
      const label = () => page.evaluate(() => document.activeElement?.textContent ?? "");
      for (let i = 0; i < 12 && !(await label()).startsWith("Close"); i++) await page.keyboard.press(keys.prev);
      expect(await label()).toMatch(/^Close/);
      await page.keyboard.press(keys.prev);
      expect(await label()).toMatch(/^Résumé \(PDF\)/);
      await page.keyboard.press(keys.next);
      expect(await label()).toMatch(/^Close/);

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
      expect(await page.evaluate(() => document.activeElement?.id)).toBe("path");
    });

    test("tabbing to Menu after scrolling does not move the page", async ({ page, browserName }) => {
      await page.goto("/");
      await jumpTo(page, 1500);
      const before = await page.evaluate(() => window.scrollY);
      expect(before).toBeGreaterThan(1000);
      const menu = page.getByRole("button", { name: "Menu" });
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press(tabKeys(browserName).next);
        if (await menu.evaluate((el) => el === document.activeElement)) break;
      }
      await expect(menu).toBeFocused();
      expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThan(2);
    });

    test("the skip link stays at the top of the viewport when the page is scrolled", async ({ page }) => {
      await page.goto("/");
      await jumpTo(page, 1500);
      const skip = page.getByRole("link", { name: "Skip to content" });
      // Tabbing from the scrolled position starts after the last focus, so focus the link directly
      // the way a keyboard user landing on it would.
      await skip.focus();
      await expect(skip).toBeFocused();
      const box = (await skip.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeLessThanOrEqual(60);
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

  test.describe("jumps land on the chapter", () => {
    test("each top-bar link at 1280×800 lands the chapter on its anchor and marks it current", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await settled(page);
      const bar = page.locator("header.top");
      for (const [id, name] of [
        ["projects", "Projects"],
        ["research", "Research"],
        ["path", "Path"],
        ["contact", "Contact"],
        ["projects", "Projects"],
        ["top", "Vatsal Maniar"],
      ]) {
        await bar.getByRole("link", { name, exact: true }).click();
        await expect.poll(() => offAnchor(page, id), { message: `${name} lands on its anchor` }).toBeLessThanOrEqual(2);
        await expect
          .poll(() => currentHref(page, "header.top nav"), { message: `${name} is current` })
          .toBe(id === "top" ? "" : `#${id}`);
      }
    });

    /*
      A reader who clicks before the web fonts arrive: the smooth jump is aimed at the
      layout set in the fallback faces, and the page reflows under it when the real
      faces swap in. Projects sits under the fixed-height opening screen, so it never
      moves; Research and Path sit under the text-heavy chapters and move by 50 to 80px.
      The fonts are held until the jump is under way, then released. The opening
      screen's "Read the research" link goes through the same jump.
    */
    for (const [id, name, from] of [
      ["projects", "Projects", "header.top"],
      ["research", "Research", "header.top"],
      ["path", "Path", "header.top"],
      ["research", "Read the research", "#top"],
    ]) {
      const where = from === "#top" ? "an opening-screen" : "a top-bar";
      test(`${where} click on ${name} before the fonts arrive still lands on the chapter`, async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        let release!: () => void;
        const held = new Promise<void>((r) => (release = r));
        await page.route(/\/_next\/static\/media\/.*\.woff2$/, async (route) => {
          await held;
          await route.continue();
        });
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await expect(page.locator("html[data-hydrated]")).toHaveCount(1);
        expect(await page.evaluate(() => document.fonts.status), "fonts must still be loading at the click").toBe("loading");
        await page.locator(from).getByRole("link", { name, exact: true }).click();
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
        release();
        await page.evaluate(() => document.fonts.ready);
        await expect
          .poll(
            () =>
              page.evaluate((id) => {
                const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
                return Math.abs(document.getElementById(id)!.getBoundingClientRect().top - pad);
              }, id),
            { message: `${name} lands at the top of the viewport` },
          )
          .toBeLessThanOrEqual(2);
        await expect.poll(() => currentHref(page, "header.top nav"), { message: `${name} is current` }).toBe(`#${id}`);
        expect(await page.evaluate(() => location.hash)).toBe(`#${id}`);
        expect(await page.evaluate(() => document.activeElement?.id)).toBe(id);
      });
    }

    test("each menu item at 390×844 lands the chapter on its anchor and marks it current", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await settled(page);
      for (const [id, name] of [
        ["projects", "Projects"],
        ["research", "Research"],
        ["path", "Path"],
        ["contact", "Contact"],
        ["research", "Research"],
        ["top", "Home"],
      ]) {
        await tap(page, page.getByRole("button", { name: "Menu" }));
        const dialog = page.getByRole("dialog", { name: "Sections" });
        const link = dialog.getByRole("link", { name: new RegExp(`^${name}`) });
        await link.click();
        await expect(dialog).toBeHidden();
        await expect.poll(() => offAnchor(page, id), { message: `${name} lands on its anchor` }).toBeLessThanOrEqual(2);
        await expect.poll(() => currentHref(page, "#menu"), { message: `${name} is current` }).toBe(`#${id}`);
      }
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
      await expect(page.getByRole("link", { name: /^Résumé \(PDF\)/ })).toHaveAttribute(
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
