// The camera journey. A single normalized `journey` value (0→1), driven by
// scroll, maps to a camera position + look target. Both the background and
// foreground canvases read this so their parallax stays locked together.
//
// World layout: the camera flies forward along -Z through a series of scene
// "stations" (object clusters), with a lateral pan at the Arsenal and a
// pull-back at the Observatory.

export type Vec3 = [number, number, number];

/** World positions where each scene's 3D objects live. */
export const STATIONS = {
  arrival: [0, 0, 0] as Vec3,
  origin: [2.4, -0.2, -22] as Vec3,
  arsenalL: [-3.6, 0.2, -40] as Vec3,
  arsenalR: [3.4, -0.4, -44] as Vec3,
  work: [0, 0.4, -64] as Vec3,
  experience: [-2.6, 0, -86] as Vec3,
  research: [2.8, 0.5, -106] as Vec3,
  contact: [0, 0, -126] as Vec3,
};

interface Waypoint {
  at: number;
  pos: Vec3;
  look: Vec3;
}

// Camera keyframes. Includes a lateral pan across the Arsenal (0.28→0.34) and
// a raised pull-back at the Observatory (0.48) so movement reads as spatial,
// not a straight dolly.
const WAYPOINTS: Waypoint[] = [
  { at: 0.0, pos: [0, 0.6, 8.5], look: [0, 0, 0] },
  { at: 0.14, pos: [0.4, 0.4, -10], look: [2.4, -0.2, -22] },
  { at: 0.28, pos: [-3.8, 0.5, -30], look: [-3.6, 0.2, -40] },
  { at: 0.34, pos: [3.6, 0.4, -34], look: [3.4, -0.4, -44] },
  { at: 0.5, pos: [0, 2.2, -50], look: [0, 0.2, -64] },
  { at: 0.68, pos: [-2.8, 0.4, -76], look: [-2.6, 0, -86] },
  { at: 0.84, pos: [3, 0.7, -96], look: [2.8, 0.5, -106] },
  { at: 1.0, pos: [0, 0.1, -116], look: [0, 0, -126] },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpVec = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
const smooth = (t: number) => t * t * (3 - 2 * t);

export function cameraForJourney(journey: number): { pos: Vec3; look: Vec3 } {
  const c = clamp01(journey);
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const a = WAYPOINTS[i];
    const b = WAYPOINTS[i + 1];
    if (c >= a.at && c <= b.at) {
      const span = b.at - a.at || 1;
      const t = smooth((c - a.at) / span);
      return { pos: lerpVec(a.pos, b.pos, t), look: lerpVec(a.look, b.look, t) };
    }
  }
  const last = WAYPOINTS[WAYPOINTS.length - 1];
  return { pos: last.pos, look: last.look };
}

/** Ordered scenes with the journey range each occupies (for object emphasis). */
export const SCENES = [
  { id: "hero", start: 0.0, end: 0.1 },
  { id: "origin", start: 0.1, end: 0.24 },
  { id: "arsenal", start: 0.24, end: 0.4 },
  { id: "work", start: 0.4, end: 0.6 },
  { id: "experience", start: 0.6, end: 0.76 },
  { id: "research", start: 0.76, end: 0.9 },
  { id: "contact", start: 0.9, end: 1.0 },
] as const;
