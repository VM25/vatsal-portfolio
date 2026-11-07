/**
 * Standard normal CDF, Hart (1968) double-precision algorithm as given by West (2005).
 * Absolute error about 1e-15. The Abramowitz-Stegun erf used by the prototype is only
 * good to ~1.5e-7, which becomes ~1e-5 on a price once multiplied by S = 100.
 */
export function normCdf(x: number): number {
  const ax = Math.abs(x);
  let c: number;
  if (ax > 37) {
    c = 0;
  } else {
    const e = Math.exp((-ax * ax) / 2);
    if (ax < 7.07106781186547) {
      let b = 3.52624965998911e-2 * ax + 0.700383064443688;
      b = b * ax + 6.37396220353165;
      b = b * ax + 33.912866078383;
      b = b * ax + 112.079291497871;
      b = b * ax + 221.213596169931;
      b = b * ax + 220.206867912376;
      c = e * b;
      b = 8.83883476483184e-2 * ax + 1.75566716318264;
      b = b * ax + 16.064177579207;
      b = b * ax + 86.7807322029461;
      b = b * ax + 296.564248779674;
      b = b * ax + 637.333633378831;
      b = b * ax + 793.826512519948;
      b = b * ax + 440.413735824752;
      c = c / b;
    } else {
      let b = ax + 0.65;
      b = ax + 4 / b;
      b = ax + 3 / b;
      b = ax + 2 / b;
      b = ax + 1 / b;
      c = e / b / 2.506628274631;
    }
  }
  return x > 0 ? 1 - c : c;
}

export function blackScholesCall(
  S: number,
  K: number,
  r: number,
  sigma: number,
  T: number,
): number {
  const sd = sigma * Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / sd;
  const d2 = d1 - sd;
  return S * normCdf(d1) - K * Math.exp(-r * T) * normCdf(d2);
}

export function crrParams(N: number, sigma: number, r: number, T: number) {
  const dt = T / N;
  const u = Math.exp(sigma * Math.sqrt(dt));
  const d = 1 / u;
  const p = (Math.exp(r * dt) - d) / (u - d);
  return { dt, u, d, p, disc: Math.exp(-r * dt) };
}

export function crrTree(opts: {
  S: number;
  K: number;
  r: number;
  sigma: number;
  T: number;
  N: number;
  keep: number;
}): { price: number; rows: number[][]; params: ReturnType<typeof crrParams> } {
  const { S, K, r, sigma, T, N, keep } = opts;
  const params = crrParams(N, sigma, r, T);
  const { u, d, p, disc } = params;
  const V = new Float64Array(N + 1);
  const rows: number[][] = [];
  for (let j = 0; j <= N; j++) {
    V[j] = Math.max(S * Math.pow(u, j) * Math.pow(d, N - j) - K, 0);
  }
  if (N <= keep) rows[N] = Array.from(V);
  for (let i = N - 1; i >= 0; i--) {
    for (let j = 0; j <= i; j++) V[j] = disc * (p * V[j + 1] + (1 - p) * V[j]);
    if (i <= keep) rows[i] = Array.from(V.subarray(0, i + 1));
  }
  return { price: V[0], rows, params };
}
