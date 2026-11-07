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
