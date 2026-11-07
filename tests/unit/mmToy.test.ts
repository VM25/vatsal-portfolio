import { describe, expect, it } from "vitest";
import * as mm from "@/lib/mmToy";

const { createToy } = mm;

/** The run schedule, read through the module so a missing export fails the test, not the file. */
function runSchedule(): { batches: number[]; delays: number[]; f: number[]; at: number[] } {
  const fn = (mm as Record<string, unknown>).runSchedule as (() => ReturnType<typeof runSchedule>) | undefined;
  if (!fn) throw new Error("runSchedule is not exported");
  return fn();
}

describe("runSchedule", () => {
  it("lands a run on exactly 420 trades over about 4.2 s, accelerating", () => {
    const s = runSchedule();
    expect(s.batches.reduce((a, b) => a + b, 0)).toBe(420);
    expect(s.batches.length).toBe(s.f.length);
    expect(s.delays.length).toBe(s.batches.length - 1);
    expect(s.f[0]).toBe(0);
    expect(s.f[s.f.length - 1]).toBe(1);
    expect(s.batches[0]).toBe(1);
    for (const b of s.batches) expect(b).toBeGreaterThanOrEqual(1);
    for (let k = 1; k < s.batches.length; k++) expect(s.batches[k]).toBeGreaterThanOrEqual(s.batches[k - 1]);
    expect(s.batches[s.batches.length - 1]).toBeGreaterThanOrEqual(5);
    // The prototype's delays: max(16, 200·(1 − f)^2.2) ms.
    for (let k = 0; k < s.delays.length; k++) {
      expect(s.delays[k]).toBeCloseTo(Math.max(16, 200 * Math.pow(1 - s.f[k], 2.2)), 9);
    }
    const total = s.delays.reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(4150);
    expect(total).toBeLessThan(4300);
    // Tick times: 0, then the running sum of the delays.
    expect(s.at.length).toBe(s.batches.length);
    expect(s.at[0]).toBe(0);
    for (let k = 1; k < s.at.length; k++) expect(s.at[k]).toBeCloseTo(s.at[k - 1] + s.delays[k - 1], 9);
  });

  it("a run's batches applied to a fresh toy end on the default state", () => {
    const t = createToy();
    for (const b of runSchedule().batches) for (let i = 0; i < b; i++) t.step();
    expect(t.equation()).toBe("+420 − 476 − 40 = −96");
  });
});

describe("mmToy", () => {
  it("420 steps from the default seed reproduce the prototype", () => {
    const t = createToy();
    for (let k = 0; k < 420; k++) t.step();
    expect(t.state).toMatchObject({ trades: 420, earned: 420, lost: 476, random: -40 });
    expect(t.net()).toBe(-96);
    expect(t.equation()).toBe("+420 − 476 − 40 = −96");
  });

  it("first step", () => {
    const a = createToy();
    a.step();
    expect([a.state.earned, a.state.lost, a.state.random, a.net()]).toEqual([1, 2, 0, -1]);
  });

  it("ten steps", () => {
    const b = createToy();
    for (let k = 0; k < 10; k++) b.step();
    expect([b.state.lost, b.state.random, b.net()]).toEqual([10, 6, 6]);
  });

  it("invariants hold for 2,000 steps", () => {
    const t = createToy();
    for (let k = 1; k <= 2000; k++) {
      t.step();
      const s = t.state;
      expect(t.net()).toBe(s.earned - s.lost + s.random);
      expect(s.earned).toBe(s.trades);
      expect(s.lost % 2).toBe(0);
      expect(s.path.length).toBeLessThanOrEqual(160);
    }
  });
});
