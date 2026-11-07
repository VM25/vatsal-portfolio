import { expect, test, type Page } from "@playwright/test";
import { measurePacing } from "./helpers";
import { projects } from "../../src/data/projects";

const EMAIL = "vatsalmaniar2003@gmail.com";

async function noWatchdog(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdog: false };
  });
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

  test("the hero is the name, the lede, availability and two actions, with no reflection caption", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#top .lede")).toHaveText("Financial engineer. I build models for markets, risk, and portfolios.");
    await expect(page.locator("#top .refl")).toHaveCount(0);
    await expect(page.locator("[data-n]")).toHaveCount(0);
    expect(await page.locator("#top").innerText()).not.toMatch(/ripples|σ\/√/);
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
    expect(flat(await page.locator(".frm").innerText())).toContain("November 2026");
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
    // Chart tick labels ("0 0.2 0.4 0.6 0.8") and the tree's node-value table are not prose:
    // read every text node outside svg, canvas and tables.
    const text = await page.evaluate(() => {
      const out: string[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (n.parentElement?.closest("svg, canvas, table, script, style, noscript")) continue;
        out.push(n.textContent ?? "");
      }
      return out.join("\n");
    });
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

  test("Contact keeps the night colours at the end of the page", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await expect(page.locator("html")).not.toHaveClass(/\bmorning\b/);
    // --fog-hi, the body text colour, as everywhere else on the page.
    await expect(page.locator("#contact h2")).toHaveCSS("color", "rgb(230, 235, 231)");
  });

  test("no clock, no time of day and no publication month anywhere on the page; rail items show no year", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#more .rail[data-ready]")).toHaveCount(1);
    const text = await page.evaluate(() => document.body.textContent ?? "");
    expect(text).not.toMatch(/\b\d{1,2}:\d{2}\s?(a\.m\.|p\.m\.)/i);
    expect(text).not.toContain("June 2026");
    await expect(page.locator("[data-clock], [data-time], [data-clocktime], [data-tsec], .clock, .place")).toHaveCount(0);
    // The research memo keeps its SSRN link.
    await expect(page.locator("#research").getByRole("link", { name: /Read on SSRN/ })).toHaveCount(1);
    // Every rail item, in the rail, its stage and the no-JavaScript list, carries its field alone.
    for (const p of projects.rail) {
      await expect(page.locator(".rail button").filter({ hasText: p.title }).locator("> span")).toHaveText(p.field);
      await expect(page.locator(".rail-all .stage").filter({ hasText: p.title }).locator(".fld")).toHaveText(p.field);
    }
    await expect(page.locator("#projects .ex .fld")).toHaveText(["Options pricing", "Market making"]);
  });

  for (const vp of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    test(`pacing: no text-free band over 40% of the viewport, top to contact, at ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/");
      // Text only, for the record: at 390 the tallest band without DOM text is the
      // DiffusionWorks tree canvas (300px, its node labels drawn on the canvas) under the
      // exhibit's question.
      const t = await measurePacing(page, "top", "contact");
      console.log(`pacing ${vp.width}x${vp.height} text only: largest gap ${t.largestGap}px of ${t.viewport}px at scrollY ${t.gapAt}`);
      // The rule, with content as Task 13(a) defines it: text plus canvases and SVG images.
      const r = await measurePacing(page, "top", "contact", 20, true);
      console.log(`pacing ${vp.width}x${vp.height} with graphics: largest gap ${r.largestGap}px of ${r.viewport}px at scrollY ${r.gapAt}`);
      expect(r.textFree, "scroll positions with no text in view").toEqual([]);
      expect(r.largestGap, `largest text-free band at scrollY ${r.gapAt}`).toBeLessThanOrEqual(r.viewport * 0.4);
    });
  }
});
