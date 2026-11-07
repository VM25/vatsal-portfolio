export type Chapter = "home" | "projects" | "research" | "path" | "contact";

export const CHAPTERS: Chapter[] = ["home", "projects", "research", "path", "contact"];

/** Scroll progress at which each chapter's shot is fully in place. */
export const KEYS: number[] = [0, 0.3, 0.55, 0.78, 1];

/** Keeps neighbouring keys apart, so the smoothstep between them never divides by zero. */
export const KEY_GAP = 0.001;

/**
 * Chapter keys from the live layout: the scroll progress at which each chapter's anchor
 * lands, (top − pad) / max, where `tops` are the sections' document tops in CHAPTERS
 * order, `pad` the computed scroll-padding-top and `max` the scrollable height. Home is
 * 0; the rest clamp to [0, 1] (Contact usually clamps to 1 at the page end) and are made
 * strictly increasing, KEY_GAP apart, never above 1. Returns null when the page cannot
 * scroll (max ≤ 0), so the caller keeps its previous keys.
 */
export function keysFromLayout(tops: number[], pad: number, max: number): number[] | null {
  if (!(max > 0)) return null;
  const ks = tops.map((top, i) => (i === 0 ? 0 : Math.min(1, Math.max(0, (top - pad) / max))));
  for (let i = 1; i < ks.length; i++) ks[i] = Math.max(ks[i], ks[i - 1] + KEY_GAP);
  ks[ks.length - 1] = Math.min(1, ks[ks.length - 1]);
  for (let i = ks.length - 2; i > 0; i--) ks[i] = Math.min(ks[i], ks[i + 1] - KEY_GAP);
  return ks;
}

type Shot = {
  hz: number;
  par: number;
  amp: number;
  ferry: number;
  plane: number;
  mist: number;
  lamp: number;
  lampx: number;
};

export const SHOTS: Record<Chapter, Shot> = {
  home: { hz: 0.3, par: 0, amp: 1, ferry: 0, plane: 0, mist: 0, lamp: 1, lampx: 0.72 },
  projects: { hz: 0.5, par: 0.22, amp: 0.92, ferry: 1, plane: 0, mist: 0, lamp: 1, lampx: 0.56 },
  research: { hz: 0.17, par: 0.42, amp: 1.05, ferry: 0, plane: 0, mist: 0.9, lamp: 0.45, lampx: 0.3 },
  path: { hz: 0.33, par: 0.72, amp: 1, ferry: 0, plane: 1, mist: 0, lamp: 0, lampx: -0.2 },
  contact: { hz: 0.3, par: 0.95, amp: 1, ferry: 0.7, plane: 0, mist: 0, lamp: 0, lampx: -0.3 },
};

/*
  The warm finish. Dawn never arrives: from DAWN_FROM (about where Research begins)
  to the page end the scene warms by a smoothstep up to DAWN_MAX, a faint lift at the
  horizon over the same night. DAWN_MAX is the largest value (in steps of 0.05) at
  which Contact's night-coloured text still reads 4.5:1 or more against the scene
  behind it at every tested width, in Chromium and WebKit, measured the way the
  acceptance contrast test measures it; at 0.55 Contact's links drop to about 4.4:1
  at 320px. The page's own colours never change.
*/
export const DAWN_FROM = 0.4;
export const DAWN_MAX = 0.5;

export type Uniforms = {
  uTime: number;
  uFog: number;
  uDawn: number;
  uN: number;
  uFlash: number;
  uHz: number;
  uPier: number;
  uLampX: number;
  uMidX: number;
  uDownX: number;
  uPar: number;
  uAmp: number;
  uFerry: number;
  uPlane: number;
  uMist: number;
  uRush: number;
  uLamp: number;
};

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// a*(1-t) + b*t returns b exactly at t = 1, so a key lands on its shot with no rounding drift.
function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

function shotAt(p: number, keys: number[]): Shot {
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1]) i++;
  const t = smoothstep(keys[i], keys[i + 1], p);
  const a = SHOTS[CHAPTERS[i]];
  const b = SHOTS[CHAPTERS[i + 1]];
  const o = {} as Shot;
  (Object.keys(a) as (keyof Shot)[]).forEach((k) => {
    o[k] = lerp(a[k], b[k], t);
  });
  return o;
}

/**
 * How opaque each pre-rendered still is at progress p: the adjacent pair around
 * p cross-fades with the same smoothstep the shot interpolation uses, so a
 * still is fully opaque exactly on its key. Weights sum to one.
 */
export function stillWeights(p: number, keys: number[]): number[] {
  const w = keys.map(() => 0);
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1]) i++;
  const t = smoothstep(keys[i], keys[i + 1], p);
  w[i] = 1 - t;
  w[i + 1] = t;
  return w;
}

export function sceneState(p: number, aspect: number, t: number, keys: number[]): Uniforms {
  const land = aspect >= 1;
  const sh = shotAt(p, keys);
  return {
    uTime: t,
    uFog: 0.92 - 0.58 * smoothstep(0.04, 0.92, p),
    uDawn: DAWN_MAX * smoothstep(DAWN_FROM, 1, p),
    uN: 512,
    uFlash: 0,
    uHz: sh.hz + (land ? 0 : 0.06),
    uPier: land ? 0.06 : 0.05,
    uLampX: aspect * (land ? sh.lampx : sh.lampx * 0.94),
    uLamp: sh.lamp,
    uMidX: aspect * (land ? 0.6 : 0.3),
    uDownX: aspect * (land ? 0.95 : 0.88),
    uPar: sh.par,
    uAmp: sh.amp,
    uFerry: sh.ferry,
    uPlane: sh.plane,
    uMist: sh.mist,
    uRush: 0,
  };
}
