import { describe, expect, it } from "vitest";
import { fixed, num, signed } from "@/lib/format";

describe("format", () => {
  it("signed adds a sign, true minus for negatives, grouped thousands", () => {
    expect(signed(420)).toBe("+420");
    expect(signed(-1032)).toBe("−1,032");
    expect(signed(0)).toBe("+0");
  });
  it("num groups thousands", () => {
    expect(num(10000)).toBe("10,000");
  });
  it("fixed uses true minus and no plus", () => {
    expect(fixed(-0.163898, 4)).toBe("−0.1639");
    expect(fixed(9.925054, 4)).toBe("9.9251");
    expect(fixed(9.925, 4)).toBe("9.9250");
  });
});
