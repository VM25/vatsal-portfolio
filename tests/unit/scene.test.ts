import { describe, expect, it } from "vitest";
import * as scene from "@/lib/scene";
import { CHAPTERS, DAWN_FROM, DAWN_MAX, KEYS, KEY_GAP, SHOTS, keysFromLayout, sceneState, stillWeights } from "@/lib/scene";

const K = KEYS;

describe("keysFromLayout", () => {
  const strictlyIncreasing = (ks: number[]) => ks.every((v, i) => i === 0 || v > ks[i - 1]);

  it("puts each key where the chapter's anchor lands", () => {
    // tops of home, projects, research, path, contact; 76px padding; 5000px to scroll.
    const ks = keysFromLayout([0, 1076, 2576, 3576, 4876], 76, 5000)!;
    expect(ks[0]).toBe(0);
    expect(ks[1]).toBeCloseTo(0.2, 10);
    expect(ks[2]).toBeCloseTo(0.5, 10);
    expect(ks[3]).toBeCloseTo(0.7, 10);
    // Contact below 1: its anchor can be reached before the page end.
    expect(ks[4]).toBeCloseTo(0.96, 10);
  });

  it("clamps to [0, 1]: Contact past the page end reads 1, Home is always 0", () => {
    const ks = keysFromLayout([500, 1076, 2576, 3576, 9000], 76, 5000)!;
    expect(ks[0]).toBe(0);
    expect(ks[4]).toBe(1);
    expect(ks.every((v) => v >= 0 && v <= 1)).toBe(true);
  });

  it("breaks ties so keys are strictly increasing", () => {
    // Projects and research both above the padding clamp to 0; path ties with research.
    const ks = keysFromLayout([0, 10, 20, 20, 4000], 76, 5000)!;
    expect(strictlyIncreasing(ks)).toBe(true);
    expect(ks[1]).toBeCloseTo(KEY_GAP, 10);
    expect(ks[2]).toBeCloseTo(2 * KEY_GAP, 10);
    expect(ks[3]).toBeCloseTo(3 * KEY_GAP, 10);
  });

  it("on a short page every later key clamps to the end, still increasing and never above 1", () => {
    const ks = keysFromLayout([0, 700, 800, 900, 1000], 76, 120)!;
    expect(ks[4]).toBe(1);
    expect(strictlyIncreasing(ks)).toBe(true);
    expect(ks.every((v) => v >= 0 && v <= 1)).toBe(true);
    expect(ks[3]).toBeCloseTo(1 - KEY_GAP, 10);
  });

  it("returns null when the page cannot scroll", () => {
    expect(keysFromLayout([0, 10, 20, 30, 40], 76, 0)).toBeNull();
    expect(keysFromLayout([0, 10, 20, 30, 40], 76, -5)).toBeNull();
  });
});

describe("scene", () => {
  it("chapters are in order", () => {
    expect(CHAPTERS).toEqual(["home", "projects", "research", "path", "contact"]);
  });

  it("fog runs 0.92 to 0.34", () => {
    expect(sceneState(0, 1.6, 0, K).uFog).toBeCloseTo(0.92, 10);
    expect(sceneState(1, 1.6, 0, K).uFog).toBeCloseTo(0.34, 10);
  });

  it("the warm finish is capped and starts around Research", () => {
    expect(DAWN_FROM).toBeGreaterThanOrEqual(0.35);
    expect(DAWN_FROM).toBeLessThanOrEqual(0.5);
    expect(DAWN_MAX).toBeGreaterThan(0);
    expect(DAWN_MAX).toBeLessThan(1);
    expect(sceneState(0, 1.6, 0, K).uDawn).toBe(0);
    expect(sceneState(DAWN_FROM, 1.6, 0, K).uDawn).toBe(0);
    expect(sceneState(1, 1.6, 0, K).uDawn).toBeCloseTo(DAWN_MAX, 12);
  });

  it("dawn rises continuously: no step bigger than a smoothstep's steepest slope allows", () => {
    // smoothstep's slope peaks at 1.5 / width, so 0.1% of scroll moves dawn by at most this.
    const dp = 0.001;
    const bound = (1.5 * DAWN_MAX * dp) / (1 - DAWN_FROM) + 1e-12;
    let prev = sceneState(0, 1.6, 0, K).uDawn;
    for (let i = 1; i <= 1000; i++) {
      const d = sceneState(i * dp, 1.6, 0, K).uDawn;
      expect(d).toBeGreaterThanOrEqual(prev);
      expect(d - prev).toBeLessThanOrEqual(bound);
      prev = d;
    }
  });

  it("has no clock and no morning switch", () => {
    expect(Object.keys(scene)).not.toContain("clockAt");
    expect(Object.keys(scene)).not.toContain("isMorning");
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

  it("stillWeights puts a still fully on its key and cross-fades the adjacent pair", () => {
    KEYS.forEach((k, i) => {
      const w = stillWeights(k, KEYS);
      w.forEach((v, j) => expect(v).toBe(j === i ? 1 : 0));
    });
    const w = stillWeights((KEYS[1] + KEYS[2]) / 2, KEYS);
    expect(w[1]).toBeCloseTo(0.5, 10);
    expect(w[2]).toBeCloseTo(0.5, 10);
    expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    expect(w[0] + w[3] + w[4]).toBe(0);
  });
});
