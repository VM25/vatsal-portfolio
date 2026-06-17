import { SpatialField } from "@/components/three/SpatialField";
import { BackdropFx } from "@/components/site/BackdropFx";

/**
 * Environmental field behind every section. A deep structured space rather than
 * a grid or waves: layered cosmos depth and a faint instrument ruling that
 * parallax-drift at different rates on scroll (so the page reads as one
 * continuous space you are pulled through), plus a subtle 3D market-depth
 * lattice. Deterministic markup (no computed SVG, no hydration mismatch); the
 * parallax + 3D mount client-only on top. Kept dim so it supports content.
 */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base vertical depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #07090c 0%, #0a0c10 45%, #0e1117 100%)",
        }}
      />
      {/* parallax glows + ruling */}
      <BackdropFx />
      {/* subtle 3D market-depth lattice */}
      <SpatialField className="absolute inset-0 h-full w-full" />
      {/* vignette to seat content - soft, edges only, so the lower page keeps depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(135% 100% at 50% 42%, transparent 60%, rgba(4,6,9,0.5) 100%)",
        }}
      />
    </div>
  );
}
