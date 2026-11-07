import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as profileMod from "@/data/profile";
import * as studyMod from "@/data/study";
import * as postsMod from "@/data/posts";
import * as researchMod from "@/data/research";
import * as projectsMod from "@/data/projects";

const modules: Record<string, Record<string, unknown>> = {
  profile: profileMod,
  study: studyMod,
  posts: postsMod,
  research: researchMod,
  projects: projectsMod,
};

function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => strings(x, out));
  return out;
}

const all = Object.entries(modules).flatMap(([name, m]) =>
  strings(m).map((s) => ({ name, s })),
);


describe("content", () => {
  it("has data to check", () => {
    expect(all.length).toBeGreaterThan(100);
  });

  it("uses no em dash and no double hyphen", () => {
    for (const { s } of all) {
      expect(s, s).not.toContain("—");
      expect(s, s).not.toContain("--");
    }
  });

  it("uses no framework or process words", () => {
    const banned = /\b(pipeline|deterministic|Next\.js|React|WebGL|Tailwind)\b/i;
    for (const { s } of all) expect(s, s).not.toMatch(banned);
  });

  it("states the premise exactly", () => {
    expect(researchMod.research.premise).toBe(
      "For most of the period from the late 1990s through 2020, U.S. stocks and Treasuries did not fall together. In 2022 they did.",
    );
  });

  it("keeps the three claims at the locked register wording", () => {
    const { claims } = researchMod.research;
    expect(claims).toHaveLength(3);
    expect(claims.map((c) => c.text)).toEqual([
      "Regime-aware allocation did not beat a static 60/40 on a risk-adjusted basis: Sharpe 0.48 vs 0.66",
      "A long-duration Treasury hedge book lost roughly 19% in the modeled 2022 replay",
      "That loss came primarily from rising real yields, not breakevens",
    ]);
    expect(claims.map((c) => c.evidenceKind)).toEqual(["sharpe", "drawdown", "identity"]);
    const spec = readFileSync("docs/superpowers/specs/2026-11-06-clearing-design.md", "utf8");
    for (const c of claims) expect(spec).toContain(c.text);
  });

  it("calls breakevens not a pure measure of expected inflation", () => {
    expect(researchMod.research.evidence.identity.body).toContain("not a pure measure of expected inflation");
    // Nowhere else are breakevens or inflation expectations described.
    for (const { s } of all) {
      if (/inflation expectations?/i.test(s)) expect(s).toContain("not a pure measure of expected inflation");
    }
  });

  it("states availability and the route", () => {
    expect(profileMod.profile.availability).toContain("December 2026");
    expect(profileMod.profile.status).toContain("January 2027");
    expect(studyMod.route.map((r) => r.place)).toEqual(["Mumbai", "Arizona", "New Jersey"]);
  });

  it("keeps the FRM in Path data only, as the pieces Path renders", () => {
    const { frm } = studyMod;
    expect(`${frm.body} ${frm.title}`).toBe("GARP FRM Part 1 Candidate");
    expect(frm.sitting).toBe("sitting November 2026");
    const hits = all.filter(({ s }) => /\bFRM\b|GARP/.test(s)).map(({ name }) => name);
    expect(new Set(hits)).toEqual(new Set(["study"]));
  });

  it("carries no phone number", () => {
    const text = JSON.stringify(modules);
    expect(text).not.toMatch(/\+?\d[\d ()-]{8,}\d/);
    expect(text).not.toMatch(/phone/i);
  });

  it("names no fictional time, no publication month and no project year", () => {
    for (const { s } of all) {
      expect(s, s).not.toMatch(/\b\d{1,2}:\d{2}\s?(a\.m\.|p\.m\.)/i);
      expect(s, s).not.toContain("June 2026");
    }
    const { diffusion, liquidity, rail } = projectsMod.projects;
    expect(diffusion.field).toBe("Options pricing");
    expect(liquidity.field).toBe("Market making");
    for (const p of rail) {
      expect(p).not.toHaveProperty("year");
      expect(p.field, p.field).not.toMatch(/\b(19|20)\d\d\b/);
    }
    expect(researchMod.research).not.toHaveProperty("kicker");
  });

  it("has no visitor prompts or defensive qualifiers, in the data, the metadata or the OG image", () => {
    const banned =
      /\b(try|play with|see what happens|move the slider|choose one|pick an?|your N|illustration only|only a simulation|not the study|never existed|not a trading book|not prediction|causal identification|not a fund)\b/i;
    for (const { s } of all) expect(s, s).not.toMatch(banned);
    for (const file of ["src/app/layout.tsx", "src/app/opengraph-image.tsx"]) {
      // The copy only: comments and the inline boot script (its try/catch) are code.
      const copy = readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "")
        .replace(/const BOOT = `[^`]*`;/, "");
      expect(copy, file).not.toMatch(banned);
    }
  });

  it("carries the review's exact lines (refinement R2)", () => {
    const { diffusion, liquidity, rail } = projectsMod.projects;
    expect(profileMod.profile.lede).toBe("Financial engineer. I build models for markets, risk, and portfolios.");
    expect(projectsMod.projects).not.toHaveProperty("intro");
    expect(diffusion).not.toHaveProperty("note");
    expect(diffusion.chartCaption).not.toMatch(/\byour\b/i);
    expect(diffusion.result.line).toContain("none failed");
    expect(diffusion.result.caveat).toContain("off at 23 of 24 up-barrier cells, where it consistently over-predicts");
    expect(liquidity.replay).toBe("Replay");
    expect(liquidity.canvasLabel).not.toMatch(/illustration/i);
    expect(liquidity.result.caveat).toBe(
      "Historical order-book replay with modeled executions under stated queue, latency and fee assumptions.",
    );
    expect(liquidity.caption.split(/[.!?](\s|$)/).filter((x) => x && x.trim()).length).toBe(1);
    const byTitle = Object.fromEntries(rail.map((p) => [p.title, p]));
    expect(byTitle["Allocation Study"].question).toBe(
      "Can a portfolio adapt when stocks and Treasuries fall together, and does adapting actually help?",
    );
    expect(byTitle["Allocation Study"].question).not.toMatch(/memo|below/i);
    expect(byTitle["YieldShock"].question).toBe(
      "When an inflation-regime shock hits a Treasury book, where does the loss actually come from?",
    );
    expect(byTitle["Lending Decisions"].figures).toContainEqual(["1 of 3", "models flagged for monitoring"]);
    // "simulated book" once on ApexGP's stage: in the figure, not the result.
    const apex = byTitle["ApexGP"];
    expect(apex.result).not.toContain("simulated book");
    expect(apex.figures).toContainEqual(["$100,000", "simulated book"]);
    // "illustrative" once on the Currency Options Desk's stage.
    expect(byTitle["Currency Options Desk"].result.match(/illustrative/gi)).toHaveLength(1);
    const { research } = researchMod;
    expect(research).not.toHaveProperty("limit");
    expect(research.evidence.drawdown).not.toHaveProperty("note");
    expect(research.ask).toMatch(/and measures why the hedge failed\.$/);
  });

  it("keeps the adverse-selection wording non-absolute and connects the Allocation result (refinement R6)", () => {
    const { liquidity, rail } = projectsMod.projects;
    expect(liquidity.question).toContain("and tends to lose when the trader on the other side knows where the price is going.");
    expect(liquidity.question).not.toMatch(/every time/i);
    expect(liquidity.caption).toBe(
      "A stylized view of adverse selection: a market maker quotes one tick either side of a price that moves two ticks per trade; 55% of trades come from informed flow (amber).",
    );
    const alloc = rail.find((p) => p.title === "Allocation Study")!;
    expect(alloc.result).toContain(
      "Over 2007–2026, with costs and limits, the regime-aware rule did not beat a static 60/40 on a risk-adjusted basis: Sharpe 0.48 against 0.66, as reported in the research memo.",
    );
    // The same figures as the Research claim, which the spec's register sources.
    const claim = researchMod.research.claims[0].text;
    expect(claim).toContain("Sharpe 0.48 vs 0.66");
    const sources = readFileSync("docs/superpowers/specs/clearing-sources.md", "utf8");
    expect(sources).toContain("Sharpe 0.48 against 0.66");
  });

  it("keeps Research to the paper, its findings and the SSRN link (refinement R7)", () => {
    const { research } = researchMod;
    expect(research).not.toHaveProperty("now");
    expect(Object.keys(research.links)).toEqual(["ssrn"]);
    for (const { s } of all) {
      expect(s, s).not.toMatch(/prospectus/i);
      expect(s, s).not.toContain("Now ·");
    }
    expect(research.ask).toContain("lagged, observable signals, realistic costs and position limits");
    const body = research.evidence.identity.body;
    expect(research.evidence.identity).not.toHaveProperty("definition");
    expect(body).toContain("not a pure measure of expected inflation");
    expect(body).toContain("inflation risk premium");
    expect(body).toContain("TIPS liquidity effects");
    expect(body.split(/[.!?](\s|$)/).filter((x) => x && x.trim())).toHaveLength(1);
    // The figures the charts draw.
    expect(research.evidence.sharpe.bars.map((b) => b.value)).toEqual([0.66, 0.48]);
    expect(research.evidence.sharpe.scaleMax).toBe(0.8);
    expect(research.evidence.drawdown.value).toBe("≈ −19%");
    const sources = readFileSync("docs/superpowers/specs/clearing-sources.md", "utf8");
    expect(sources).toContain(body);
  });

  it("has a footer of the name only: no location in the profile (refinement R6)", () => {
    expect(profileMod.profile).not.toHaveProperty("location");
    for (const { s } of all) expect(s, s).not.toContain("across from Manhattan");
  });

  it("has six rail projects with three figures each", () => {
    const { rail } = projectsMod.projects;
    expect(rail).toHaveLength(6);
    for (const p of rail) {
      expect(p.figures).toHaveLength(3);
      expect(p.live).toMatch(/^https:\/\//);
      expect(p.code).toMatch(/^https:\/\/github\.com\/VM25\//);
    }
  });
});
