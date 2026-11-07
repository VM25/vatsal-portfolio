import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { measurePacing } from "./helpers";
import { research } from "../../src/data/research";
import { projects } from "../../src/data/projects";
import { profile } from "../../src/data/profile";

/*
  Acceptance pass (spec §8; plan Task 13, items a to g). Each block names the §8 bullet
  it checks. The sign-off doc (docs/superpowers/plans/2026-11-06-clearing-signoff.md)
  maps every §8 bullet to these tests.
*/

async function noWatchdog(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __CLEARING_TEST__: unknown }).__CLEARING_TEST__ = { watchdog: false };
  });
}

/** Load and settle: hydrated, loaded, fonts in. */
async function settled(page: Page) {
  await page.goto("/");
  await expect(page.locator("html[data-hydrated]")).toHaveCount(1);
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
}

async function frames(page: Page, n: number) {
  await page.evaluate(async (n) => {
    for (let i = 0; i < n; i++) await new Promise((r) => requestAnimationFrame(() => r(null)));
  }, n);
}

/*
  Scene states to check: night (the top), the research fog, late (90% down, Path's
  experience list over the warming scene) and the end (the warm finish at its cap,
  behind Contact). The page keeps its night colours at all of them; there is no
  morning state (refinement R1).
*/
const POSITIONS = ["night", "research", "late", "end"] as const;
type Position = (typeof POSITIONS)[number];

async function scrollToPosition(page: Page, at: Position) {
  await page.evaluate((at) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    let top = 0;
    if (at === "end") top = max;
    if (at === "late") top = Math.round(max * 0.9);
    if (at === "research") {
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      top = document.getElementById("research")!.getBoundingClientRect().top + window.scrollY - pad;
    }
    window.scrollTo({ top, behavior: "instant" });
  }, at);
  await expect(page.locator("html")).not.toHaveClass(/\bmorning\b/);
}

test.describe("acceptance", () => {
  test.beforeEach(async ({ page }) => {
    await noWatchdog(page);
  });

  /* (a) §8.5 Pacing. Every 60px of scroll; text plus canvases and SVG images count (ruling A). */
  for (const vp of [
    { width: 1440, height: 900 },
    { width: 375, height: 812 },
  ]) {
    test(`(a) pacing: no band over 40% of the viewport without content, every 60px, at ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await settled(page);
      const t = await measurePacing(page, "top", "contact", 20, false, 60);
      console.log(`(a) ${vp.width}x${vp.height} text only: ${t.largestGap}px of ${t.viewport}px (${((100 * t.largestGap) / t.viewport).toFixed(1)}%) at scrollY ${t.gapAt}`);
      const r = await measurePacing(page, "top", "contact", 20, true, 60);
      console.log(`(a) ${vp.width}x${vp.height} with graphics: ${r.largestGap}px of ${r.viewport}px (${((100 * r.largestGap) / r.viewport).toFixed(1)}%) at scrollY ${r.gapAt}`);
      expect(r.textFree, "scroll positions with nothing in view").toEqual([]);
      expect(r.largestGap, `largest empty band at scrollY ${r.gapAt}`).toBeLessThanOrEqual(r.viewport * 0.4);
    });
  }

  /* (b) §8.3 / §8.4 No horizontal scroll at every listed width, portrait and landscape. */
  test("(b) no horizontal scroll at 320 to 1920 wide, portrait and landscape", async ({ page }) => {
    const over: string[] = [];
    for (const width of [320, 375, 414, 768, 1024, 1280, 1440, 1920]) {
      for (const [name, height] of [
        ["portrait", Math.round(width * 16 / 9)],
        ["landscape", Math.max(240, Math.round(width * 9 / 16))],
      ] as const) {
        await page.setViewportSize({ width, height });
        await settled(page);
        const res = await page.evaluate(() => {
          const d = document.documentElement;
          const wide = [...document.querySelectorAll<HTMLElement>("body *")]
            .filter((e) => {
              const r = e.getBoundingClientRect();
              return r.width > 0 && r.right > d.clientWidth + 1 && !e.closest(".sr-only, [hidden], .bg");
            })
            .slice(0, 3)
            .map((e) => `${e.tagName.toLowerCase()}.${e.className}`);
          return { extra: d.scrollWidth - d.clientWidth, wide };
        });
        if (res.extra > 0) over.push(`${width}x${height} (${name}): ${res.extra}px wider, ${res.wide.join(", ")}`);
      }
    }
    expect(over).toEqual([]);
  });

  /* (c) §8.3 Secondary text at 14px or more; SVG and canvas axis tick labels at 12px or more. */
  test("(c) text: every visible text at 14px or more; SVG and canvas axis ticks at 12px or more", async ({ browser }) => {
    // Five widths, each waiting for a full market-making run (about 4 s, longer on a loaded machine).
    test.setTimeout(120_000);
    const small: string[] = [];
    for (const width of [320, 375, 768, 1280, 1440]) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await ctx.newPage();
      await noWatchdog(page);
      // Canvas text in CSS pixels: the font size times the context's scale over the backing store's.
      await page.addInitScript(() => {
        const seen: { id: string; px: number; text: string }[] = [];
        (window as unknown as { __canvasText: typeof seen }).__canvasText = seen;
        const orig = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function (...args: Parameters<typeof orig>) {
          const c = this.canvas;
          const k = this.getTransform().a * (c.clientWidth / c.width);
          seen.push({ id: c.id, px: parseFloat(this.font) * k, text: String(args[0]) });
          return orig.apply(this, args);
        };
      });
      await settled(page);
      // Scroll the whole page so every exhibit draws (the market-making run starts on sight).
      await page.evaluate(async () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        for (let y = 0; y <= max + 400; y += 400) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise((r) => setTimeout(r, 30));
        }
      });
      await page.locator("#liquidity").scrollIntoViewIfNeeded();
      await expect(page.locator("#liquidity")).toHaveAttribute("data-runs-done", "1", { timeout: 15_000 });
      const found = await page.evaluate(() => {
        const out: string[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const el = n.parentElement;
          const text = n.textContent?.trim();
          if (!el || !text) continue;
          if (el.closest("script, style, noscript, .sr-only, sup, sub, [hidden], .skip:not(:focus)")) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility !== "visible" || !el.checkVisibility?.({ opacityProperty: true })) continue;
          const range = document.createRange();
          range.selectNodeContents(n);
          if (range.getBoundingClientRect().height === 0) continue;
          const svg = el.closest("svg");
          let px = parseFloat(cs.fontSize);
          let min = 14;
          if (svg) {
            const vb = (svg as SVGSVGElement).viewBox.baseVal;
            if (vb && vb.width) px *= svg.getBoundingClientRect().width / vb.width;
            if (el.closest(".ticks")) min = 12;
          }
          if (px < min - 0.05) out.push(`${px.toFixed(1)}px < ${min}: "${text.slice(0, 40)}" (${el.tagName.toLowerCase()}.${el.getAttribute("class") ?? ""})`);
        }
        const drawn = (window as unknown as { __canvasText: { id: string; px: number; text: string }[] }).__canvasText;
        const ids = new Set(drawn.map((d) => d.id));
        for (const d of drawn) {
          // The convergence chart draws only its axis tick labels; the other canvases draw labels.
          const min = d.id === "dwChart" ? 12 : 14;
          if (d.px < min - 0.05) out.push(`canvas #${d.id} ${d.px.toFixed(1)}px < ${min}: "${d.text}"`);
        }
        if (!ids.has("dwTree") || !ids.has("dwChart") || !ids.has("mmCanvas")) out.push(`canvas text missing: ${[...ids].join(",")}`);
        return out;
      });
      small.push(...[...new Set(found)].map((f) => `${width}: ${f}`));
      await ctx.close();
    }
    expect(small).toEqual([]);
  });

  /* (d) §8.3 Touch targets at 44×44px or more. Inline links in running text are exempt (WCAG 2.5.8). */
  test("(d) every interactive element is at least 44x44px", async ({ page }) => {
    const small: string[] = [];
    const exempt: string[] = [];
    const check = async (where: string) => {
      const r = await page.evaluate(() => {
        const sel =
          'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="tab"], [role="button"], [tabindex]:not([tabindex="-1"])';
        const small: string[] = [];
        const exempt: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>(sel)) {
          if (el.closest("[hidden], .sr-only, noscript") || el.matches(".skip:not(:focus)")) continue;
          if (!el.checkVisibility?.({ opacityProperty: true, visibilityProperty: true })) continue;
          if ((el as HTMLElement & { inert: boolean }).inert || el.closest("[inert]")) continue;
          const b = el.getBoundingClientRect();
          if (b.width === 0 && b.height === 0) continue;
          const name = `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || el.id).trim().replace(/\s+/g, " ").slice(0, 40)}"`;
          if (b.width >= 43.5 && b.height >= 43.5) continue;
          const inline = el.tagName === "A" && getComputedStyle(el).display === "inline" && !!el.closest("p, li, dd");
          (inline ? exempt : small).push(`${name} ${b.width.toFixed(1)}x${b.height.toFixed(1)}`);
        }
        return { small, exempt };
      });
      small.push(...r.small.map((s) => `${where}: ${s}`));
      exempt.push(...r.exempt.map((s) => `${where}: ${s}`));
    };
    for (const vp of [
      { width: 1280, height: 800 },
      { width: 1440, height: 900 },
      { width: 375, height: 812 },
      { width: 320, height: 640 },
    ]) {
      await page.setViewportSize(vp);
      await settled(page);
      await check(`${vp.width}`);
      if (vp.width < 760) {
        await page.getByRole("button", { name: "Menu" }).click();
        await expect(page.getByRole("dialog", { name: "Sections" })).toBeVisible();
        await check(`${vp.width} menu`);
        await page.keyboard.press("Escape");
      }
      // The skip link, when focused.
      await page.locator(".top .skip").focus();
      const skip = (await page.locator(".top .skip").boundingBox())!;
      if (skip.width < 43.5 || skip.height < 43.5) small.push(`${vp.width}: skip link ${skip.width}x${skip.height}`);
    }
    console.log(`(d) exempt inline links (WCAG 2.5.8): ${exempt.length ? [...new Set(exempt)].join("; ") : "none"}`);
    expect([...new Set(small)]).toEqual([]);
  });

  /* (e) §8.3 axe-core over the whole page at the night, research, late and end positions. */
  for (const vp of [
    { width: 1280, height: 800 },
    { width: 375, height: 812 },
  ]) {
    test(`(e) axe: no serious or critical violations at night, research, late and end, at ${vp.width}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await settled(page);
      const found: string[] = [];
      const run = async (where: string) => {
        const r = await new AxeBuilder({ page }).analyze();
        for (const v of r.violations) {
          if (v.impact !== "serious" && v.impact !== "critical") continue;
          found.push(`${where}: ${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
        }
      };
      for (const at of POSITIONS) {
        await scrollToPosition(page, at);
        await frames(page, 4);
        await run(at);
      }
      if (vp.width < 760) {
        await scrollToPosition(page, "research");
        await page.getByRole("button", { name: "Menu" }).click();
        await expect(page.getByRole("dialog", { name: "Sections" })).toBeVisible();
        await run("menu open");
      }
      expect(found).toEqual([]);
    });
  }

  /* (f) §8.3 Contrast of the text against a screenshot of what is behind it. */
  for (const vp of [
    { width: 1440, height: 900 },
    { width: 1280, height: 800 },
    { width: 768, height: 1024 },
    { width: 414, height: 896 },
    { width: 390, height: 844 },
    { width: 375, height: 812 },
    { width: 360, height: 780 },
    { width: 320, height: 568 },
  ]) {
    test(`(f) contrast: text against the scene behind it at night, research, late and end, at ${vp.width}`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.setViewportSize(vp);
      await settled(page);
      const fails: string[] = [];
      for (const at of POSITIONS) {
        await scrollToPosition(page, at);
        // Let the scene and any beat settle.
        await page.waitForTimeout(at === "night" ? 500 : 3200);
        const r = await contrastHere(page);
        console.log(
          `(f) ${vp.width} ${at}: ${r.checked} text runs, lowest ${r.lowest.ratio.toFixed(2)}:1 at 95% (worst pixel ${r.lowest.min.toFixed(2)}) "${r.lowest.text}"` +
            (r.belowAtWorstPixel.length ? `; below the ratio at the worst pixel only: ${r.belowAtWorstPixel.join("; ")}` : ""),
        );
        fails.push(...r.fails.map((f) => `${at}: ${f}`));
      }
      expect(fails).toEqual([]);
    });
  }

  /* §8.3 Visible focus on every interactive element, in a logical (document) order. */
  for (const vp of [
    { width: 1280, height: 800 },
    { width: 375, height: 812 },
  ]) {
    test(`focus: Tab walks every control in document order, each with a visible ring, at ${vp.width}`, async ({ page, browserName }) => {
      await page.setViewportSize(vp);
      await settled(page);
      // Safari's plain Tab skips links; Option+Tab is its full keyboard walk.
      const key = browserName === "webkit" ? "Alt+Tab" : "Tab";
      const seen: { id: number; name: string; ring: string; after: boolean }[] = [];
      await page.evaluate(() => {
        let i = 0;
        document.querySelectorAll("*").forEach((e) => ((e as HTMLElement).dataset.order = String(i++)));
      });
      for (let i = 0; i < 120; i++) {
        await page.keyboard.press(key);
        const f = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const cs = getComputedStyle(el);
          return {
            id: Number(el.dataset.order),
            name: `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || el.id).trim().replace(/\s+/g, " ").slice(0, 30)}"`,
            ring: `${cs.outlineStyle} ${cs.outlineWidth}`,
            visible: el.matches(":focus-visible"),
            width: parseFloat(cs.outlineWidth),
            solid: cs.outlineStyle === "solid",
          };
        });
        if (!f) break;
        if (seen.length && f.id <= seen[0].id && seen.length > 1) break; // wrapped round
        const prev = seen[seen.length - 1];
        seen.push({ id: f.id, name: f.name, ring: f.ring, after: !prev || f.id > prev.id });
        expect(f.visible && f.solid && f.width >= 2, `${f.name} shows a 2px focus ring (${f.ring})`).toBe(true);
      }
      console.log(`focus ${vp.width} ${browserName}: ${seen.length} stops`);
      expect(seen.length).toBeGreaterThan(vp.width < 760 ? 15 : 20);
      // The walk reaches the end of the page.
      expect(seen.map((s) => s.name).join("|")).toContain('button "Copy"');
      expect(seen.filter((s) => !s.after).map((s) => s.name), "stops out of document order").toEqual([]);
    });
  }

  /* (g) §8.6 No JavaScript: all content readable in document order on a dark background. */
  test("(g) no JavaScript: every chapter's text, the claims and evidence, all six projects and every link are visible on a dark background", async ({
    browser,
  }) => {
    test.setTimeout(120_000);
    for (const vp of [
      { width: 1280, height: 800 },
      { width: 375, height: 812 },
    ]) {
      const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: vp });
      const page = await ctx.newPage();
      await page.goto("/");
      const main = page.locator("main");
      // The five chapters, in order.
      expect(await page.locator("main [data-sec]").evaluateAll((s) => s.map((e) => e.id))).toEqual([
        "top",
        "projects",
        "research",
        "path",
        "contact",
      ]);
      // Every text block in every chapter is visible, except what the no-JS page replaces:
      // the interactive rail (its six projects are listed in full in .rail-all) and the
      // spoken live-region sentences.
      const hidden = await page.evaluate(() => {
        const out: string[] = [];
        const walker = document.createTreeWalker(document.querySelector("main")!, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const el = n.parentElement;
          const text = n.textContent?.trim();
          if (!el || !text || el.closest("script, style, noscript, .sr-only, .more > .rail, #more-stage")) continue;
          if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) out.push(`"${text.slice(0, 50)}" (${el.tagName.toLowerCase()}.${el.getAttribute("class") ?? ""})`);
        }
        return out;
      });
      expect(hidden, "text hidden without JavaScript").toEqual([]);
      // No clock and no time of day in the served page either (refinement R1).
      const served = (await main.textContent()) ?? "";
      expect(served).not.toMatch(/\b\d{1,2}:\d{2}\s?(a\.m\.|p\.m\.)/i);
      expect(served).not.toContain("June 2026");
      await expect(main.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(main.getByText(profile.name).first()).toBeVisible();
      // Research: premise, the three claims and all three evidence blocks.
      await expect(main.getByText(research.premise, { exact: false }).first()).toBeVisible();
      for (const c of research.claims) await expect(main.getByText(c.text, { exact: false }).first()).toBeVisible();
      for (const id of ["#ev-sharpe", "#ev-drawdown", "#ev-identity"]) await expect(page.locator(id)).toBeVisible();
      // All six rail projects with both links.
      const more = page.locator("#more");
      for (const p of projects.rail) {
        await expect(more.getByRole("heading", { level: 4, name: p.title })).toBeVisible();
        await expect(more.locator(`a[href="${p.live}"]`).filter({ visible: true })).toHaveCount(1);
        await expect(more.locator(`a[href="${p.code}"]`).filter({ visible: true })).toHaveCount(1);
      }
      // Every link in the page is visible, outside the replaced rail and the menu dialog.
      // Below 760px the top bar is the name plus Menu by design; without JavaScript the
      // menu cannot open, so its button is hidden too, and every section follows in
      // document order. Those top-bar links are listed, and the résumé must still be
      // reachable from Contact.
      const { invisible, phoneBar } = await page.evaluate(() => {
        const invisible: string[] = [];
        const phoneBar: string[] = [];
        for (const a of document.querySelectorAll<HTMLAnchorElement>("a[href]:not(.skip)")) {
          if (a.closest(".more > .rail, #more-stage, #menu, .sr-only")) continue;
          if (a.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
          const href = a.getAttribute("href") ?? "";
          if (window.innerWidth < 760 && a.closest("header.top")) phoneBar.push(href);
          else invisible.push(href);
        }
        return { invisible, phoneBar };
      });
      expect(invisible, "links hidden without JavaScript").toEqual([]);
      if (vp.width < 760) {
        expect(phoneBar.sort()).toEqual(["#contact", "#path", "#projects", "#research", "/resume/Maniar_Vatsal.pdf"]);
        await expect(page.locator(".menu-btn"), "a menu that cannot open is not shown").toBeHidden();
        await expect(page.locator('#contact a[href="/resume/Maniar_Vatsal.pdf"]')).toBeVisible();
      } else {
        expect(phoneBar).toEqual([]);
      }
      // Dark background, and the text reads against it, at the top, the middle and the bottom.
      for (const frac of [0, 0.5, 1]) {
        await page.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), frac);
        await page.waitForTimeout(300);
        const r = await contrastHere(page);
        expect(r.background, `background luminance at ${frac}`).toBeLessThan(0.1);
        expect(r.fails, `contrast at ${frac}`).toEqual([]);
      }
      await ctx.close();
    }
  });
});

type ContrastResult = {
  checked: number;
  /** Runs whose 95th-percentile background gives less than 4.5:1 (3:1 at 24px and up). */
  fails: string[];
  /** Runs that pass at the 95th percentile but not against their single worst pixel (logged only). */
  belowAtWorstPixel: string[];
  /** The lowest 95th-percentile ratio seen, with that run's worst-pixel ratio. */
  lowest: { ratio: number; min: number; text: string };
  /** Median relative luminance of the sampled backgrounds. */
  background: number;
};

/**
 * Contrast of every visible text run in the viewport (top bar and main) against what is
 * actually behind its glyphs, halos included:
 *
 * 1. Read each run's colour, size, effective opacity and line boxes.
 * 2. With animation frames held, so the scene stands still, screenshot the page as it
 *    is (A), then make every glyph and text decoration
 *    transparent, keeping text shadows (a transparent glyph still casts its shadow, in
 *    Chromium and WebKit alike), and screenshot again (B). B is the backdrop each glyph
 *    sits on, with any halo composited into it.
 * 3. The glyph mask is where A and B differ inside the run's line boxes. The sample is
 *    that mask grown by a ring of radius 2px: the pixels under and immediately around the strokes,
 *    read from B. (A run whose mask is nearly empty, such as text too close to its
 *    backdrop to show, falls back to its whole line boxes.)
 * 4. Compare the text colour, blended over each sampled pixel at its opacity, with that
 *    pixel. A run passes when 95% of its samples reach 4.5:1 (3:1 at 24px and up); the
 *    single worst pixel is usually a lit window or a one-pixel reflection highlight in the
 *    moving scene, and is logged alongside.
 *
 * Text under the sticky top bar is skipped (the bar covers it). Works without page JS.
 */
async function contrastHere(page: Page): Promise<ContrastResult> {
  const runs = await page.evaluate(() => {
    const out: { block: Element; key: string; where: string; text: string; color: string; alpha: number; large: boolean; rects: number[][] }[] = [];
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const bar = document.querySelector("header.top")!.getBoundingClientRect().bottom;
    const ctx = document.createElement("canvas").getContext("2d")!;
    const norm = (c: string) => {
      ctx.fillStyle = "#000";
      ctx.fillStyle = c;
      return ctx.fillStyle;
    };
    for (const root of [document.querySelector("header.top"), document.querySelector("main")]) {
      const walker = document.createTreeWalker(root!, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const el = n.parentElement;
        const text = n.textContent?.trim();
        if (!el || !text || el.closest("script, style, noscript, .sr-only, [hidden], .skip, canvas")) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility !== "visible") continue;
        let alpha = 1;
        for (let a: Element | null = el; a; a = a.parentElement) alpha *= parseFloat(getComputedStyle(a).opacity);
        if (alpha < 0.05) continue;
        const inSvg = !!el.closest("svg");
        const color = norm(inSvg ? cs.fill : cs.color);
        const m = /rgba?\(([^)]+)\)/.exec(color);
        if (m) alpha *= parseFloat(m[1].split(",")[3] ?? "1");
        let px = parseFloat(cs.fontSize);
        const svg = el.closest("svg") as SVGSVGElement | null;
        if (svg?.viewBox.baseVal?.width) px *= svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
        const range = document.createRange();
        range.selectNodeContents(n);
        const inBar = !!el.closest("header.top");
        const rects = [...range.getClientRects()]
          .filter((r) => r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw)
          .filter((r) => inBar || r.top >= bar)
          .map((r) => [r.left, r.top, r.right, r.bottom]);
        if (!rects.length) continue;
        // One run per block and colour, so a lone "." or "n" is judged with the text around it.
        const block = el.closest("p, li, h1, h2, h3, h4, a, button, label, output, dt, dd, td, th, figcaption, text") ?? el;
        const key = `${color}|${alpha.toFixed(3)}|${px >= 24}`;
        const same = out.find((o) => o.block === block && o.key === key);
        if (same) same.rects.push(...rects);
        else {
          const sec = block.closest("[data-sec]")?.id ?? "bar";
          const cls = (block.getAttribute("class") ?? "").split(/\s+/)[0];
          const where = `#${sec} ${block.tagName.toLowerCase()}${cls ? "." + cls : ""}`;
          out.push({ block, key, where, text: text.slice(0, 40), color, alpha, large: px >= 24, rects });
        }
      }
    }
    return out.map(({ where, text, color, alpha, large, rects }) => ({ where, text, color, alpha, large, rects }));
  });
  // Hold the scene still between the two screenshots, so only the glyphs differ: animation
  // frames are queued (the canvas keeps its last frame) and released afterwards.
  await page.evaluate(() => {
    const w = window as unknown as { __rafHold?: { orig: typeof requestAnimationFrame; q: FrameRequestCallback[] } };
    const hold = { orig: window.requestAnimationFrame, q: [] as FrameRequestCallback[] };
    w.__rafHold = hold;
    window.requestAnimationFrame = (cb) => {
      hold.q.push(cb);
      return 0;
    };
  });
  await page.waitForTimeout(100);
  const shown = await page.screenshot({ scale: "css", caret: "hide" });
  // Hide the glyphs (and their decorations) without moving anything, then screenshot what is behind
  // them. Text shadows stay: a transparent glyph still casts its shadow, so a halo is in the backdrop.
  await page.evaluate(() => {
    const s = document.createElement("style");
    s.id = "__hide-text";
    s.textContent =
      "header.top *, main * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-decoration-color: transparent !important; transition: none !important; caret-color: transparent !important; } svg text, svg tspan { fill: transparent !important; stroke: transparent !important; }";
    document.head.append(s);
  });
  await page.waitForTimeout(50);
  const shot = await page.screenshot({ scale: "css", caret: "hide" });
  await page.evaluate(() => document.getElementById("__hide-text")?.remove());
  await page.evaluate(() => {
    const w = window as unknown as { __rafHold?: { orig: typeof requestAnimationFrame; q: FrameRequestCallback[] } };
    const hold = w.__rafHold;
    if (!hold) return;
    window.requestAnimationFrame = hold.orig;
    delete w.__rafHold;
    hold.q.forEach((cb) => hold.orig.call(window, cb));
  });
  // Colours transition back in (up to 800ms); let them land before anything reads them again.
  await page.waitForTimeout(900);
  return page.evaluate(
    async ({ runs, src, srcShown }) => {
      const pixels = async (url: string) => {
        const img = new Image();
        img.src = url;
        await img.decode();
        const cv = document.createElement("canvas");
        cv.width = img.naturalWidth;
        cv.height = img.naturalHeight;
        const g = cv.getContext("2d")!;
        g.drawImage(img, 0, 0);
        return { w: cv.width, h: cv.height, data: g.getImageData(0, 0, cv.width, cv.height).data };
      };
      const back = await pixels(src);
      const front = await pixels(srcShown);
      const c = { width: back.w, height: back.h };
      const data = back.data;
      const RING = 2;
      /** Pixel indices to sample for one line box: the glyph mask grown by RING px. */
      const samples = (l: number, t: number, r: number, b: number): number[] => {
        const x0 = Math.max(0, Math.floor(l));
        const y0 = Math.max(0, Math.floor(t));
        const x1 = Math.min(c.width - 1, Math.ceil(r));
        const y1 = Math.min(c.height - 1, Math.ceil(b));
        const glyph: number[] = [];
        for (let y = y0; y <= y1; y++)
          for (let x = x0; x <= x1; x++) {
            const i = (y * c.width + x) * 4;
            const d = Math.abs(front.data[i] - data[i]) + Math.abs(front.data[i + 1] - data[i + 1]) + Math.abs(front.data[i + 2] - data[i + 2]);
            if (d > 30) glyph.push(y * c.width + x);
          }
        if (glyph.length < 6) {
          const all: number[] = [];
          for (let y = y0 + 1; y < y1 - 1; y += 2) for (let x = x0 + 1; x < x1 - 1; x += 2) all.push(y * c.width + x);
          return all;
        }
        const set = new Set<number>();
        for (const k of glyph) {
          const gx = k % c.width;
          const gy = (k - gx) / c.width;
          for (let dy = -RING; dy <= RING; dy++)
            for (let dx = -RING; dx <= RING; dx++) {
              if (dx * dx + dy * dy > RING * RING) continue;
              const x = gx + dx;
              const y = gy + dy;
              if (x >= 0 && y >= 0 && x < c.width && y < c.height) set.add(y * c.width + x);
            }
        }
        return [...set];
      };
      const lin = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      const lum = (r: number, gg: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(gg) + 0.0722 * lin(b);
      const parse = (s: string) => {
        if (s.startsWith("#")) return [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
        return /rgba?\(([^)]+)\)/.exec(s)![1].split(",").slice(0, 3).map(Number);
      };
      const fails: string[] = [];
      const belowAtWorstPixel: string[] = [];
      const bgs: number[] = [];
      let lowest = { ratio: Infinity, min: Infinity, text: "" };
      for (const run of runs) {
        const [tr, tg, tb] = parse(run.color);
        let worst = Infinity;
        const all: number[] = [];
        for (const [l, t, r, b] of run.rects) {
          for (const k of samples(l, t, r, b)) {
            const i = k * 4;
            const [br, bg, bb] = [data[i], data[i + 1], data[i + 2]];
            const a = run.alpha;
            const L1 = lum(tr * a + br * (1 - a), tg * a + bg * (1 - a), tb * a + bb * (1 - a));
            const L2 = lum(br, bg, bb);
            bgs.push(L2);
            const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
            all.push(ratio);
            if (ratio < worst) worst = ratio;
          }
        }
        if (!all.length) continue;
        all.sort((a, b) => a - b);
        // The ratio that 95% of the pixels behind the run meet (see the doc comment).
        const p5 = all[Math.floor(0.05 * (all.length - 1))];
        if (p5 < lowest.ratio) lowest = { ratio: p5, min: worst, text: run.text };
        const need = run.large ? 3 : 4.5;
        if (worst < need) belowAtWorstPixel.push(`${worst.toFixed(2)}:1 (95% ${p5.toFixed(2)}) "${run.text}"`);
        if (p5 < need)
          fails.push(`${p5.toFixed(2)}:1 < ${need} "${run.text}" ${run.where} (${run.color} at ${run.alpha.toFixed(2)}; worst pixel ${worst.toFixed(2)}, n ${all.length})`);
      }
      bgs.sort((a, b) => a - b);
      return { checked: runs.length, fails, belowAtWorstPixel, lowest, background: bgs.length ? bgs[bgs.length >> 1] : 0 };
    },
    {
      runs,
      src: `data:image/png;base64,${shot.toString("base64")}`,
      srcShown: `data:image/png;base64,${shown.toString("base64")}`,
    },
  );
}
