export type Chapter = "home" | "projects" | "research" | "path" | "contact";

export const CHAPTERS: Chapter[] = ["home", "projects", "research", "path", "contact"];

/** Scroll progress at which each chapter's shot is fully in place. */
export const KEYS: number[] = [0, 0.3, 0.55, 0.78, 1];

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

export function sceneState(p: number, aspect: number, t: number, keys: number[]): Uniforms {
  const land = aspect >= 1;
  const sh = shotAt(p, keys);
  return {
    uTime: t,
    uFog: 0.92 - 0.58 * smoothstep(0.04, 0.92, p),
    uDawn: smoothstep(0.8, 0.98, p),
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

/** 124 + p * 248 minutes after midnight, as "h:mm a.m.". */
export function clockAt(p: number): string {
  const m = Math.round(124 + p * 248);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}:${mm < 10 ? "0" : ""}${mm} a.m.`;
}

export function isMorning(p: number): boolean {
  return smoothstep(0.8, 0.98, p) > 0.55;
}
