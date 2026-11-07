import { describe, expect, it } from "vitest";
import { CHAPTERS, KEYS, SHOTS, clockAt, isMorning, sceneState } from "@/lib/scene";

const K = KEYS;

describe("scene", () => {
  it("chapters are in order", () => {
    expect(CHAPTERS).toEqual(["home", "projects", "research", "path", "contact"]);
  });

  it("clockAt maps 124 + p*248 minutes", () => {
    expect(clockAt(0)).toBe("2:04 a.m.");
    expect(clockAt(0.5)).toBe("4:08 a.m.");
    expect(clockAt(1)).toBe("6:12 a.m.");
  });

  it("fog runs 0.92 to 0.34", () => {
    expect(sceneState(0, 1.6, 0, K).uFog).toBeCloseTo(0.92, 10);
    expect(sceneState(1, 1.6, 0, K).uFog).toBeCloseTo(0.34, 10);
  });

  it("dawn is 0 at p=0.79 and 1 at p=0.98", () => {
    expect(sceneState(0.79, 1.6, 0, K).uDawn).toBe(0);
    expect(sceneState(0.98, 1.6, 0, K).uDawn).toBe(1);
  });

  it("at a key the shot equals that chapter's shot exactly", () => {
    const s = sceneState(K[2], 1.6, 0, K);
    const r = SHOTS.research;
    expect(s.uHz).toBe(r.hz);
    expect(s.uPar).toBe(r.par);
    expect(s.uAmp).toBe(r.amp);
    expect(s.uFerry).toBe(r.ferry);
    expect(s.uPlane).toBe(r.plane);
    expect(s.uMist).toBe(r.mist);
    expect(s.uLamp).toBe(r.lamp);
    expect(s.uLampX).toBe(1.6 * r.lampx);
  });

  it("landscape and portrait constants", () => {
    const l = sceneState(0, 1.6, 2, K);
    expect(l).toMatchObject({ uTime: 2, uN: 512, uFlash: 0, uRush: 0, uPier: 0.06 });
    expect(l.uMidX).toBeCloseTo(1.6 * 0.6, 10);
    expect(l.uDownX).toBeCloseTo(1.6 * 0.95, 10);
    const a = 0.5;
    const p = sceneState(0, a, 0, K);
    expect(p.uHz).toBeCloseTo(SHOTS.home.hz + 0.06, 10);
    expect(p.uPier).toBe(0.05);
    expect(p.uMidX).toBeCloseTo(a * 0.3, 10);
    expect(p.uDownX).toBeCloseTo(a * 0.88, 10);
    expect(p.uLampX).toBeCloseTo(a * SHOTS.home.lampx * 0.94, 10);
  });

  it("returns every shader uniform", () => {
    expect(Object.keys(sceneState(0.4, 1, 0, K)).sort()).toEqual(
      "uTime uFog uDawn uN uFlash uHz uPier uLampX uMidX uDownX uPar uAmp uFerry uPlane uMist uRush uLamp"
        .split(" ")
        .sort(),
    );
  });

  it("isMorning flips with dawn", () => {
    expect(isMorning(0.85)).toBe(false);
    expect(isMorning(0.95)).toBe(true);
  });
});
