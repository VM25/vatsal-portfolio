import { describe, expect, it } from "vitest";
import { createToy } from "@/lib/mmToy";

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
