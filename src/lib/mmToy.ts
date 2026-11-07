import { num, signed } from "@/lib/format";

export type MMState = {
  trades: number;
  earned: number;
  lost: number;
  random: number;
  mid: number;
  path: number[];
  fills: { i: number; side: 1 | -1; informed: boolean }[];
};

const ALPHA = 0.55;
const HALF = 1;
const MOVE = 2;
const PATH_CAP = 160;

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Seeded market-making toy. Each trade the maker earns the half-spread; an informed
 * trader always trades with the next move, so the maker loses that move; a noise
 * trader trades at random, so the move nets out on average. All components are integers.
 */
export function createToy(seed = 20261106) {
  const r = lcg(seed);
  const state: MMState = {
    trades: 0,
    earned: 0,
    lost: 0,
    random: 0,
    mid: 0,
    path: [0],
    fills: [],
  };

  function step() {
    const informed = r() < ALPHA;
    const move = r() < 0.5 ? MOVE : -MOVE;
    const side: 1 | -1 = informed ? (move > 0 ? 1 : -1) : r() < 0.5 ? 1 : -1;
    const markout = -side * move;
    state.trades++;
    state.earned += HALF;
    if (informed) state.lost += -markout;
    else state.random += markout;
    state.fills.push({ i: state.path.length - 1, side, informed });
    state.mid += move;
    state.path.push(state.mid);
    if (state.path.length > PATH_CAP) {
      state.path.shift();
      state.fills = state.fills
        .map((f) => ({ ...f, i: f.i - 1 }))
        .filter((f) => f.i >= 0);
    }
  }

  const net = () => state.earned - state.lost + state.random;

  function equation() {
    const { earned, lost, random } = state;
    return (
      `${signed(earned)} ${lost >= 0 ? "−" : "+"} ${num(Math.abs(lost))} ` +
      `${random >= 0 ? "+" : "−"} ${num(Math.abs(random))} = ${signed(net())}`
    );
  }

  return { state, step, net, equation };
}

export type RunSchedule = {
  /** Trades to add at each tick; they sum to the run's total. */
  batches: number[];
  /** Milliseconds from tick k to tick k + 1 (one fewer than the ticks). */
  delays: number[];
  /** Run progress at each tick, 0 at the first and 1 at the last. */
  f: number[];
  /** When each tick falls, in ms from the start: 0, then the running sum of `delays`. */
  at: number[];
};

/**
 * The accelerating run, with the prototype's pacing on a fixed clock: a tick every
 * max(16, 200·(1 − f)^2.2) ms until f = t / dur reaches 1, each adding
 * max(1, round(f^2.4 · 14 · s)) trades. The prototype used s = 1 against wall time,
 * so its run ended on a different count each time (about 950 on an idle machine).
 * Here s is the largest scale whose run fits `total` (about 0.43 for 420), and any
 * trades left over go to the last tick, so every run ends on exactly `total` trades,
 * the default state, whatever the timers do. A player that falls behind (a busy
 * device) catches up by applying every tick whose time `at` has passed in one update.
 */
export function runSchedule(total = 420, dur = 4200): RunSchedule {
  const f: number[] = [];
  const delays: number[] = [];
  const at: number[] = [];
  for (let t = 0; ; ) {
    const fk = Math.min(1, t / dur);
    f.push(fk);
    at.push(t);
    if (fk >= 1) break;
    const d = Math.max(16, 200 * Math.pow(1 - fk, 2.2));
    delays.push(d);
    t += d;
  }
  if (total < f.length) throw new RangeError(`a run needs at least ${f.length} trades`);
  const batch = (s: number) => f.map((fk) => Math.max(1, Math.round(Math.pow(fk, 2.4) * 14 * s)));
  const sum = (b: number[]) => b.reduce((a, v) => a + v, 0);
  let lo = 0;
  let hi = 1;
  while (sum(batch(hi)) <= total) hi *= 2;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (sum(batch(mid)) <= total) lo = mid;
    else hi = mid;
  }
  const batches = batch(lo);
  batches[batches.length - 1] += total - sum(batches);
  return { batches, delays, f, at };
}
