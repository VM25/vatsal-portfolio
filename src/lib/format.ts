const MINUS = "−";

/** Integer with thousands separators (en-US). */
export function num(v: number): string {
  return v.toLocaleString("en-US");
}

/** Signed integer: "+" for zero and positives, true minus (U+2212) for negatives. */
export function signed(v: number): string {
  return (v < 0 ? MINUS : "+") + Math.abs(v).toLocaleString("en-US");
}

/** Fixed decimals; true minus for negatives, no "+" for positives. */
export function fixed(v: number, dp: number): string {
  const s = Math.abs(v).toFixed(dp);
  return v < 0 && Number(s) !== 0 ? MINUS + s : s;
}
