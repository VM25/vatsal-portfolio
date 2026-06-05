"use client";

/**
 * Fixed atmospheric layer behind every chapter. No WebGL, no abstract
 * wireframes — just a quiet filmic surface treatment (a soft brass horizon glow
 * and a faint paper grain) that makes the graphite field read like a machined
 * dossier rather than a flat dark template. Purely material, never a "shape".
 */
const GRAIN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>`,
  );

export function SystemBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {/* Faint grain — premium printed-surface texture. */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{ backgroundImage: `url("${GRAIN}")`, backgroundSize: "160px 160px" }}
      />
      {/* Instrument bezel — a barely-there frame, like a trading screen edge. */}
      <div className="absolute inset-3 rounded-[3px] border border-[rgba(239,233,221,0.04)] sm:inset-5" />
    </div>
  );
}
