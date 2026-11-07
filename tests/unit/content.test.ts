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

const FRM = "GARP FRM Part 1 Candidate · November 2026";

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

  it("mentions inflation expectations only inside the breakeven definition", () => {
    for (const { s } of all) {
      if (/inflation expectations/i.test(s)) expect(s).toContain("not pure expected inflation");
    }
  });

  it("states availability and the route", () => {
    expect(profileMod.profile.availability).toContain("December 2026");
    expect(profileMod.profile.status).toContain("January 2027");
    expect(studyMod.route.map((r) => r.place)).toEqual(["Mumbai", "Arizona", "New Jersey"]);
  });

  it("shows the FRM string only in Path data", () => {
    const hits = all.filter(({ s }) => s.includes(FRM)).map(({ name }) => name);
    expect(hits).toEqual(["study"]);
  });

  it("carries no phone number", () => {
    const text = JSON.stringify(profileMod);
    expect(text).not.toMatch(/\+?\d[\d ()-]{8,}\d/);
    expect(text).not.toMatch(/phone/i);
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
