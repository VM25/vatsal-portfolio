"use client";

import dynamic from "next/dynamic";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { CanvasErrorBoundary } from "@/components/providers/CanvasErrorBoundary";
import { ContourField } from "@/components/visuals/ContourField";

const SceneCanvas = dynamic(
  () => import("@/components/three/SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false },
);
const ForegroundCanvas = dynamic(
  () =>
    import("@/components/three/ForegroundCanvas").then((m) => m.ForegroundCanvas),
  { ssr: false },
);

/**
 * The spatial world: a background canvas behind the content (z-0) and a sparse
 * foreground canvas in front of it (z-30), so content is sandwiched in depth.
 * Both fall back gracefully: a CSS contour layer is always present, the
 * foreground canvas is skipped under reduced-motion, and a WebGL failure in
 * either is contained by an error boundary.
 */
export function World() {
  const webgl = useWebGLSupport();
  const reduced = usePrefersReducedMotion();

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <ContourField className="opacity-25" />
        {webgl ? (
          <CanvasErrorBoundary fallback={null}>
            <SceneCanvas reducedMotion={reduced} />
          </CanvasErrorBoundary>
        ) : null}
      </div>

      {webgl && !reduced ? (
        <div
          className="pointer-events-none fixed inset-0 z-30 mix-blend-screen"
          aria-hidden
        >
          <CanvasErrorBoundary fallback={null}>
            <ForegroundCanvas reducedMotion={reduced} />
          </CanvasErrorBoundary>
        </div>
      ) : null}
    </>
  );
}
