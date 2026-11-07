import { expect, test, type Page } from "@playwright/test";

/*
  Copy guard (refinement R2): no visitor prompts and no defensive "this is not real"
  lines anywhere a reader or a screen reader meets them. It reads every text node in the
  document (visible, visually hidden and hidden alike: the menu, the no-JavaScript project
  list, the live regions), the document title, the description metas, and every
  aria-label, alt and title attribute.
*/
const BANNED =
  /\b(try|play with|see what happens|move the slider|choose one|pick an?|your N|illustration only|only a simulation|not the study|never existed|not a trading book|not prediction|causal identification|not a fund)\b/i;

async function collect(page: Page) {
  return page.evaluate(() => {
    const out: { where: string; text: string }[] = [];
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      const text = n.textContent?.trim();
      if (!el || !text || el.closest("script, style")) continue;
      out.push({ where: el.tagName.toLowerCase() + (el.className ? `.${el.className}` : ""), text });
    }
    for (const el of document.querySelectorAll("[aria-label], [alt], [title]")) {
      for (const a of ["aria-label", "alt", "title"]) {
        const v = el.getAttribute(a);
        if (v) out.push({ where: `${el.tagName.toLowerCase()}[${a}]`, text: v });
      }
    }
    for (const m of document.querySelectorAll('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"]')) {
      const v = m.getAttribute("content");
      if (v) out.push({ where: `meta ${m.getAttribute("name") ?? m.getAttribute("property")}`, text: v });
    }
    out.push({ where: "document.title", text: document.title });
    return out;
  });
}

test.describe("copy guard", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdog: false };
    });
  });

  for (const vp of [
    { width: 1280, height: 800 },
    { width: 375, height: 812 },
  ]) {
    test(`no visitor prompts or defensive qualifiers in text or labels at ${vp.width}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-hydrated", /.*/);
      // Visit each chapter so anything written on view (the market-making run, the evidence) is in place.
      for (const id of ["projects", "liquidity", "more", "research", "path", "contact"]) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
      }
      const all = await collect(page);
      expect(all.length).toBeGreaterThan(150);
      const hits = all.filter((s) => BANNED.test(s.text)).map((s) => `${s.where}: "${s.text.slice(0, 90)}"`);
      expect(hits, "banned copy").toEqual([]);
    });
  }

  test("the guard catches the old lines it replaced", () => {
    for (const old of [
      "Try the simplest case: a binomial tree closing in on Black–Scholes.",
      "The marker is your N.",
      "Illustration only: a simulated market maker",
      "Not the study's data.",
      "Modeled historical replay: the orders never existed",
      "Illustrative data and limits, not a trading book.",
      "Measurement and attribution, not prediction or causal identification.",
      "a modeled book, not a fund's return",
      "Pick an inflation-regime shock and a Treasury book",
    ])
      expect(old).toMatch(BANNED);
  });
});
