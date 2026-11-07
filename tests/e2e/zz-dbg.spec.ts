import { test } from "@playwright/test";
test("dbg", async ({ page }) => {
  page.on("pageerror", (e) => console.log("E:", e.message));
  await page.goto("/");
  const btn = page.locator("#contact").getByRole("button", { name: "Copy" });
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const c = document.querySelector("#contact .chan")!;
    new MutationObserver((ms) => ms.forEach((m) => console.log("MUT", Math.round(performance.now()), m.type, m.target.textContent, m.addedNodes.length, m.removedNodes.length))).observe(c, { subtree: true, childList: true, characterData: true });
  });
  page.on("console", (m) => { if (m.text().startsWith("MUT")) console.log(m.text()); });
  await btn.click();
  await page.waitForTimeout(800);
  console.log("after", await btn.textContent());
});
