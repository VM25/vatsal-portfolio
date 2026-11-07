const MINUS = "−";

/** Integer with thousands separators (en-US); true minus for negatives. */
export function num(v: number): string {
  const s = Math.abs(v).toLocaleString("en-US");
  return v < 0 && s !== "0" ? MINUS + s : s;
}

/** Signed number (up to 3 decimals, en-US grouping): "+" for zero and positives, true minus (U+2212) for negatives. */
export function signed(v: number): string {
  return (v < 0 ? MINUS : "+") + Math.abs(v).toLocaleString("en-US");
}

/** Fixed decimals; true minus for negatives, no "+" for positives. */
export function fixed(v: number, dp: number): string {
  const s = Math.abs(v).toFixed(dp);
  return v < 0 && Number(s) !== 0 ? MINUS + s : s;
}
