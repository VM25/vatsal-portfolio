import { expect, test, type Page } from "@playwright/test";

const EMAIL = "vatsalmaniar2003@gmail.com";

async function noWatchdog(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdog: false };
  });
}

/**
 * Pacing helper. Scrolls from the top of `fromId` to the end of `toId` in steps of 10% of the
 * viewport and returns the scroll positions where no text element intersected the viewport.
 * Task 12 can call it with ("top", "contact") to cover the whole page.
 */
async function textFreeSteps(page: Page, fromId: string, toId: string) {
  return page.evaluate(
    async ({ fromId, toId }) => {
      const vh = window.innerHeight;
      const start = document.getElementById(fromId)!.getBoundingClientRect().top + window.scrollY;
      const to = document.getElementById(toId)!;
      const end = Math.min(
        to.getBoundingClientRect().bottom + window.scrollY - vh,
        document.documentElement.scrollHeight - vh,
      );
      const sel = "h1, h2, h3, p, li";
      const gaps: number[] = [];
      for (let y = start; y <= Math.max(start, end) + 1; y += vh * 0.1) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        const seen = Array.from(document.querySelectorAll<HTMLElement>(sel)).some((el) => {
          if (!el.textContent?.trim()) return false;
          const r = el.getBoundingClientRect();
          return r.height > 0 && r.bottom > 0 && r.top < vh;
        });
        if (!seen) gaps.push(Math.round(y));
      }
      return gaps;
    },
    { fromId, toId },
  );
}

test.describe("Home, Path and Contact", () => {
  test.beforeEach(async ({ page }) => {
    await noWatchdog(page);
  });

  test("first screen names Vatsal and the graduation date", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Vatsal Maniar" })).toBeInViewport();
    await expect(page.getByText("Graduating December 2026", { exact: false }).first()).toBeInViewport();
    await expect(page.getByRole("link", { name: "See the work" })).toHaveAttribute("href", "#projects");
    await expect(page.getByRole("link", { name: "Read the research" })).toHaveAttribute("href", "#research");
  });

  test("the reflection count reaches 512", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-n]")).toHaveText("512", { timeout: 12_000 });
  });

  test("the reflection count shows 512 at once under reduced motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await noWatchdog(page);
    await page.goto("/");
    await expect(page.locator("[data-n]")).toHaveText("512", { timeout: 2000 });
    await ctx.close();
  });

  test("Path has the unfiltered photo", async ({ page }) => {
    await page.goto("/");
    const img = page.locator("#path img");
    await expect(img).toHaveCount(1);
    await expect(img).toHaveAttribute("alt", "Vatsal Maniar");
    const src = decodeURIComponent((await img.getAttribute("src")) ?? "");
    expect(src).toContain("vatsal-maniar.jpg");
    expect(src).not.toContain("vatsal-maniar-2");
    expect(await img.evaluate((e) => getComputedStyle(e).filter)).toBe("none");
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((e) => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  });

  test("the FRM line appears exactly once, in Path", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#path .frm")).toHaveCount(1);
    await expect(page.locator(".frm")).toHaveCount(1);
    const flat = (s: string) => s.replace(/\s+/g, " ");
    expect(flat(await page.locator(".frm").innerText())).toContain("GARP FRM Part 1 Candidate");
    expect(await page.evaluate(() => (document.body.innerText.match(/FRM/g) ?? []).length)).toBe(1);
    expect(await page.evaluate(() => {
          const root = document.documentElement.cloneNode(true) as HTMLElement;
          root.querySelectorAll("script").forEach((n) => n.remove());
          return root.innerHTML.match(/FRM/g)?.length ?? 0;
        })).toBe(1);
    expect(await page.locator("head").innerHTML()).not.toContain("FRM");
  });

  test("Contact email link, no form, no phone number", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#contact a[href^='mailto:']")).toHaveAttribute("href", `mailto:${EMAIL}`);
    await expect(page.locator("form")).toHaveCount(0);
    const text = await page.evaluate(() => document.body.innerText);
    expect(text).not.toMatch(/\+?\d[\d\s().-]{8,}\d/);
    await expect(page.locator("a[href^='tel:']")).toHaveCount(0);
    await expect(page.locator("#contact").getByRole("button", { name: "Copy" })).toHaveCount(1);
  });

  /** Records every text the button and live region show, so a slow frame cannot hide a state. */
  async function record(page: Page) {
    await page.evaluate(() => {
      const w = window as unknown as { __seen: string[] };
      w.__seen = [];
      const row = document.querySelector("#contact .chan")!;
      const note = () => {
        const b = row.querySelector("button")!.textContent ?? "";
        const s = row.querySelector("[aria-live='polite']")!.textContent ?? "";
        w.__seen.push(`${b}|${s}`);
      };
      new MutationObserver(note).observe(row, { subtree: true, childList: true, characterData: true });
    });
  }
  const seen = (page: Page) => page.evaluate(() => (window as unknown as { __seen: string[] }).__seen);

  test("Copy puts the email on the clipboard", async ({ page, browserName, context }) => {
    test.skip(browserName !== "chromium", "Clipboard assertion runs on Chromium only (ledger T9)");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    const btn = page.locator("#contact").getByRole("button", { name: "Copy" });
    await btn.scrollIntoViewIfNeeded();
    const box = (await btn.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
    await record(page);
    await btn.click();
    await expect.poll(() => seen(page)).toContain("Copied|Email address copied");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);
    await expect(btn).toHaveText("Copy", { timeout: 6000 });
  });

  test("Copy falls back to selecting the address when the clipboard rejects", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Clipboard rejection is simulated on Chromium only");
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error("denied")) },
      });
    });
    await page.goto("/");
    const btn = page.locator("#contact").getByRole("button", { name: "Copy" });
    await btn.scrollIntoViewIfNeeded();
    await record(page);
    await btn.click();
    await expect.poll(async () => (await seen(page)).some((t) => /^Press (⌘|Ctrl\+)C\|/.test(t))).toBe(true);
    expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(EMAIL);
  });

  test("Contact text uses the dark ink on the morning backdrop", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await expect(page.locator("html")).toHaveClass(/morning/);
    await expect
      .poll(() => page.locator("#contact h2").evaluate((e) => getComputedStyle(e).color))
      .toBe("rgb(19, 32, 31)");
  });

  for (const vp of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    test(`pacing: no text-free step through Home, Path and Contact at ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/");
      // Projects and Research arrive in later tasks; scope to the chapters built here.
      for (const [from, to] of [
        ["top", "top"],
        ["path", "contact"],
      ]) {
        expect(await textFreeSteps(page, from, to), `${from}..${to}`).toEqual([]);
      }
    });
  }
});
