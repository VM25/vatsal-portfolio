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
