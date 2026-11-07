import { describe, expect, it } from "vitest";
import { blackScholesCall, crrParams, crrTree, normCdf } from "@/lib/pricing";

// Phi(x) for x = -6, -5.5, ..., 6 (Python math.erfc, double precision)
const PHI = [
  9.86587645038e-10, 1.89895624659e-08, 2.86651571879e-07, 3.39767312473e-06,
  3.16712418331e-05, 0.000232629079036, 0.00134989803163, 0.00620966532578,
  0.0227501319482, 0.0668072012689, 0.158655253931, 0.308537538726, 0.5,
  0.691462461274, 0.841344746069, 0.933192798731, 0.977249868052,
  0.993790334674, 0.998650101968, 0.999767370921, 0.999968328758,
  0.999996602327, 0.999999713348, 0.99999998101, 0.999999999013,
];

describe("pricing", () => {
  it("normCdf is within 1e-6 of the reference on [-6, 6]", () => {
    expect(PHI).toHaveLength(25);
    PHI.forEach((ref, k) => {
      expect(Math.abs(normCdf(-6 + 0.5 * k) - ref)).toBeLessThan(1e-6);
    });
  });

  it("Black-Scholes reference values", () => {
    expect(blackScholesCall(100, 100, 0.04, 0.2, 1)).toBeCloseTo(9.925054, 5);
    expect(blackScholesCall(100, 80, 0.04, 0.4, 1)).toBeCloseTo(28.455625, 5);
  });

  it("CRR reference values", () => {
    const price = (N: number) =>
      crrTree({ S: 100, K: 100, r: 0.04, sigma: 0.2, T: 1, N, keep: 0 }).price;
    expect(price(1)).toBeCloseTo(11.731926, 6);
    expect(price(2)).toBeCloseTo(9.019599, 6);
    expect(price(12)).toBeCloseTo(9.761156, 6);
    expect(price(13)).toBeCloseTo(10.066458, 6);
    expect(price(100)).toBeCloseTo(9.905183, 6);
    expect(price(200)).toBeCloseTo(9.915112, 6);
    expect(
      crrTree({ S: 100, K: 80, r: 0.04, sigma: 0.4, T: 1, N: 200, keep: 0 }).price,
    ).toBeCloseTo(28.446513, 5);
  });

  it("crrParams u and p at N=12", () => {
    const q = crrParams(12, 0.2, 0.04, 1);
    expect(q.u).toBeCloseTo(1.059434, 6);
    expect(q.p).toBeCloseTo(0.51447, 6);
  });

  it("p is strictly inside (0,1) for every slider combination", () => {
    for (let N = 1; N <= 200; N++) {
      for (let s = 5; s <= 80; s++) {
        const { p } = crrParams(N, s / 100, 0.04, 1);
        expect(p > 0 && p < 1).toBe(true);
      }
    }
  });

  it("keeps rows 0..keep", () => {
    const t = crrTree({ S: 100, K: 100, r: 0.04, sigma: 0.2, T: 1, N: 12, keep: 6 });
    expect(t.rows[0][0]).toBe(t.price);
    expect(t.rows.length).toBe(7);
    expect(t.rows[6].length).toBe(7);
  });
});
